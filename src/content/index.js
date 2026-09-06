(function () {
  const STORE_KEY = "prompt-expander-store";
  const MAX_CONTEXT_LENGTH = 240;

  const MAX_SUGGESTIONS = 8;

  let snippets = [];
  let settings = {
    expandOnSpace: true,
    expandOnTab: true
  };

  let suggestionState = null; // { target, items, selectedIndex, tokenLength }
  let suggestionHost = null;

  function normalizeStore(rawStore) {
    return {
      snippets: Array.isArray(rawStore?.snippets) ? rawStore.snippets : [],
      settings: {
        expandOnSpace: true,
        expandOnTab: true,
        ...(rawStore?.settings ?? {})
      }
    };
  }

  function loadStore() {
    chrome.storage.local.get(STORE_KEY, (result) => {
      const store = normalizeStore(result[STORE_KEY]);
      snippets = store.snippets;
      settings = store.settings;
    });
  }

  function resolveEditableTarget(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    if (target instanceof HTMLInputElement) {
      return (
        !target.disabled &&
        !target.readOnly &&
        target.type !== "password" &&
        target.type !== "checkbox" &&
        target.type !== "radio"
        ? target
        : null
      );
    }

    if (target instanceof HTMLTextAreaElement) {
      return !target.disabled && !target.readOnly ? target : null;
    }

    const editableParent = target.closest("[contenteditable]:not([contenteditable='false'])");
    return editableParent instanceof HTMLElement ? editableParent : null;
  }

  function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    if (target instanceof HTMLInputElement) {
      return (
        !target.disabled &&
        !target.readOnly &&
        target.type !== "password" &&
        target.type !== "checkbox" &&
        target.type !== "radio"
      );
    }

    if (target instanceof HTMLTextAreaElement) {
      return !target.disabled && !target.readOnly;
    }

    return Boolean(target.isContentEditable);
  }

  function findMatchingSnippet(textBeforeCaret) {
    if (!textBeforeCaret) {
      return null;
    }

    const sortedSnippets = [...snippets].sort(
      (left, right) => right.trigger.length - left.trigger.length
    );

    return sortedSnippets.find((snippet) => textBeforeCaret.endsWith(snippet.trigger)) ?? null;
  }

  function parseTemplate(template) {
    const nodes = [];
    const pattern = /\$\{([^}]+)\}/g;
    let cursor = 0;
    let match;

    while ((match = pattern.exec(template)) !== null) {
      if (match.index > cursor) {
        nodes.push({ type: "text", value: template.slice(cursor, match.index) });
      }

      const tokenValue = match[1].trim();

      if (tokenValue === "date") {
        nodes.push({ type: "date" });
      } else if (tokenValue === "clipboard") {
        nodes.push({ type: "clipboard" });
      } else if (tokenValue === "cursor") {
        nodes.push({ type: "cursor" });
      } else if (tokenValue.startsWith("input:")) {
        nodes.push({
          type: "input",
          label: tokenValue.slice("input:".length).trim() || "value"
        });
      } else {
        nodes.push({ type: "text", value: match[0] });
      }

      cursor = match.index + match[0].length;
    }

    if (cursor < template.length) {
      nodes.push({ type: "text", value: template.slice(cursor) });
    }

    return nodes;
  }

  function formatDate() {
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function resolveTemplate(template) {
    const nodes = parseTemplate(template);
    let text = "";
    let cursorOffset = null;

    for (const node of nodes) {
      if (node.type === "text") {
        text += node.value;
      } else if (node.type === "date") {
        text += formatDate();
      } else if (node.type === "clipboard") {
        try {
          text += await navigator.clipboard.readText();
        } catch (_error) {
          text += "";
        }
      } else if (node.type === "input") {
        const response = window.prompt(`Value for ${node.label}`, "");
        text += response ?? "";
      } else if (node.type === "cursor" && cursorOffset === null) {
        cursorOffset = text.length;
      }
    }

    return { text, cursorOffset };
  }

  function dispatchInputEvent(target, data) {
    const event = new InputEvent("input", {
      bubbles: true,
      cancelable: false,
      inputType: "insertText",
      data
    });

    target.dispatchEvent(event);
  }

  function getInputContext(target) {
    const caret = target.selectionStart ?? 0;
    const textBeforeCaret = target.value.slice(
      Math.max(0, caret - MAX_CONTEXT_LENGTH),
      caret
    );

    return {
      caret,
      textBeforeCaret
    };
  }

  function expandInInput(target, matchLength, resolved, delimiter) {
    const caret = target.selectionStart ?? 0;
    const start = Math.max(0, caret - matchLength);
    const before = target.value.slice(0, start);
    const after = target.value.slice(target.selectionEnd ?? caret);
    const insertion = resolved.text + delimiter;
    const nextValue = before + insertion + after;

    target.value = nextValue;
    const selectionPosition =
      resolved.cursorOffset === null
        ? before.length + resolved.text.length + delimiter.length
        : before.length + resolved.cursorOffset;
    target.setSelectionRange(selectionPosition, selectionPosition);
    dispatchInputEvent(target, insertion);
  }

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const records = [];
    let cursor = 0;
    let node;

    while ((node = walker.nextNode())) {
      const value = node.textContent ?? "";
      if (!value) {
        continue;
      }

      records.push({
        node,
        start: cursor,
        end: cursor + value.length
      });
      cursor += value.length;
    }

    return records;
  }

  function locatePosition(records, offset) {
    if (records.length === 0) {
      return null;
    }

    for (const record of records) {
      if (offset <= record.end) {
        return {
          node: record.node,
          offset: Math.max(0, Math.min(record.node.textContent.length, offset - record.start))
        };
      }
    }

    const last = records.at(-1);
    return {
      node: last.node,
      offset: last.node.textContent.length
    };
  }

  function getContentEditableContext(target) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!target.contains(range.endContainer)) {
      return null;
    }

    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(target);
    beforeRange.setEnd(range.endContainer, range.endOffset);

    return {
      textBeforeCaret: beforeRange.toString().slice(-MAX_CONTEXT_LENGTH),
      caretOffset: beforeRange.toString().length,
      range
    };
  }

  function placeCaretInsideNode(node, offset) {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function expandInContentEditable(target, matchLength, resolved, delimiter) {
    const context = getContentEditableContext(target);
    if (!context) {
      return false;
    }

    const records = getTextNodes(target);
    if (records.length === 0) {
      const insertedNode = document.createTextNode(resolved.text + delimiter);
      target.replaceChildren(insertedNode);
      const selectionOffset =
        resolved.cursorOffset === null
          ? resolved.text.length + delimiter.length
          : resolved.cursorOffset;
      placeCaretInsideNode(insertedNode, selectionOffset);
      dispatchInputEvent(target, insertedNode.textContent ?? "");
      return true;
    }

    const startOffset = Math.max(0, context.caretOffset - matchLength);
    const endOffset = context.caretOffset;
    const start = locatePosition(records, startOffset);
    const end = locatePosition(records, endOffset);

    if (!start || !end) {
      return false;
    }

    const replacementRange = document.createRange();
    replacementRange.setStart(start.node, start.offset);
    replacementRange.setEnd(end.node, end.offset);
    replacementRange.deleteContents();

    const insertedNode = document.createTextNode(resolved.text + delimiter);
    replacementRange.insertNode(insertedNode);

    const nextOffset =
      resolved.cursorOffset === null
        ? resolved.text.length + delimiter.length
        : resolved.cursorOffset;
    placeCaretInsideNode(insertedNode, nextOffset);
    dispatchInputEvent(target, insertedNode.textContent ?? "");
    return true;
  }

  function getExpansionCandidate(target) {
    const context =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
        ? getInputContext(target)
        : getContentEditableContext(target);

    if (!context) {
      return null;
    }

    const snippet = findMatchingSnippet(context.textBeforeCaret);
    if (!snippet) {
      return null;
    }

    return { snippet };
  }

  async function tryExpand(target, snippet, delimiter) {
    const resolved = await resolveTemplate(snippet.body);

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      expandInInput(target, snippet.trigger.length, resolved, delimiter);
      return true;
    }

    return expandInContentEditable(target, snippet.trigger.length, resolved, delimiter);
  }

  // --- Live suggestion dropdown -------------------------------------------
  // As the user types, offer snippets whose trigger starts with what's typed
  // so far, so they don't have to remember every saved trigger by heart.

  const MIRROR_STYLE_PROPS = [
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "textTransform",
    "wordSpacing",
    "textIndent",
    "whiteSpace",
    "wordBreak",
    "overflowWrap",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderTopStyle",
    "borderRightStyle",
    "borderBottomStyle",
    "borderLeftStyle"
  ];

  function getInputCaretRect(target) {
    const isInput = target instanceof HTMLInputElement;
    const style = window.getComputedStyle(target);
    const div = document.createElement("div");

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.left = "-9999px";
    div.style.top = "0px";
    div.style.overflow = "hidden";
    div.style.whiteSpace = isInput ? "pre" : "pre-wrap";
    div.style.width = `${target.clientWidth}px`;

    for (const prop of MIRROR_STYLE_PROPS) {
      div.style[prop] = style[prop];
    }

    document.body.appendChild(div);

    const caret = target.selectionStart ?? target.value.length;
    div.textContent = target.value.slice(0, caret);

    const span = document.createElement("span");
    span.textContent = target.value.slice(caret) || ".";
    div.appendChild(span);

    const targetRect = target.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    const rect = {
      left: targetRect.left + (spanRect.left - divRect.left) - target.scrollLeft,
      top: targetRect.top + (spanRect.top - divRect.top) - target.scrollTop,
      height: spanRect.height
    };
    rect.bottom = rect.top + rect.height;

    document.body.removeChild(div);
    return rect;
  }

  function getCaretClientRect(target) {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return getInputCaretRect(target);
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rects = range.getClientRects();
    if (rects.length > 0) {
      return rects[0];
    }

    const marker = document.createElement("span");
    marker.textContent = "​";
    range.insertNode(marker);
    const rect = marker.getBoundingClientRect();
    marker.remove();
    return rect;
  }

  function setHostVisible(host, visible) {
    host.style.setProperty("display", visible ? "block" : "none", "important");
  }

  function ensureSuggestionHost() {
    if (suggestionHost) {
      return suggestionHost;
    }

    suggestionHost = document.createElement("div");
    // Every visual property is forced with !important because page stylesheets
    // frequently target bare `div` selectors (CSS resets, Angular/Material global
    // sheets) and would otherwise override our host - including `display`, which
    // is how we hide the popup.
    const hostStyles = {
      position: "absolute",
      "z-index": "2147483647",
      top: "0px",
      left: "0px",
      margin: "0",
      padding: "0",
      border: "0",
      background: "transparent",
      "max-width": "none",
      "max-height": "none",
      "min-width": "0",
      "min-height": "0",
      float: "none",
      transform: "none",
      visibility: "visible",
      opacity: "1",
      "pointer-events": "auto"
    };
    for (const [prop, value] of Object.entries(hostStyles)) {
      suggestionHost.style.setProperty(prop, value, "important");
    }
    setHostVisible(suggestionHost, false);

    const shadow = suggestionHost.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .list {
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #1f2430;
        color: #f5f5f5;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        padding: 4px;
        min-width: 220px;
        max-width: 360px;
        max-height: 240px;
        overflow-y: auto;
      }
      .item {
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .item.active {
        background: #2f6fed;
      }
      .trigger {
        font-weight: 600;
      }
      .title {
        opacity: 0.75;
        font-size: 11px;
      }
    `;

    const list = document.createElement("div");
    list.className = "list";
    list.setAttribute("role", "listbox");

    shadow.appendChild(style);
    shadow.appendChild(list);
    suggestionHost.__list = list;

    document.documentElement.appendChild(suggestionHost);
    return suggestionHost;
  }

  function renderSuggestions() {
    if (!suggestionState) {
      return;
    }

    const host = ensureSuggestionHost();
    const list = host.__list;
    list.innerHTML = "";

    suggestionState.items.forEach((snippet, index) => {
      const item = document.createElement("div");
      item.className = index === suggestionState.selectedIndex ? "item active" : "item";
      item.setAttribute("role", "option");

      const triggerEl = document.createElement("div");
      triggerEl.className = "trigger";
      triggerEl.textContent = snippet.trigger;
      item.appendChild(triggerEl);

      const label = snippet.title || snippet.description;
      if (label) {
        const titleEl = document.createElement("div");
        titleEl.className = "title";
        titleEl.textContent = label;
        item.appendChild(titleEl);
      }

      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        void acceptSuggestion(index);
      });

      list.appendChild(item);
    });

    setHostVisible(host, true);
    positionSuggestions();
  }

  function positionSuggestions() {
    if (!suggestionState || !suggestionHost) {
      return;
    }

    const rect = getCaretClientRect(suggestionState.target);
    if (!rect) {
      return;
    }

    const GAP = 4;
    const MIN_SPACE = 120;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;

    // Flip above the caret when the field sits near the bottom of the viewport
    // (common for chat composers) and there's more room up top.
    const placeAbove = spaceBelow < MIN_SPACE && spaceAbove > spaceBelow;
    const available = Math.max(MIN_SPACE, placeAbove ? spaceAbove : spaceBelow);

    const list = suggestionHost.__list;
    if (list) {
      list.style.maxHeight = `${Math.min(240, Math.floor(available))}px`;
    }

    const hostHeight = suggestionHost.getBoundingClientRect().height || 0;
    const topViewport = placeAbove
      ? Math.max(GAP, rect.top - GAP - hostHeight)
      : rect.bottom + GAP;

    // Keep the popup from spilling off the right edge.
    const hostWidth = suggestionHost.getBoundingClientRect().width || 0;
    const leftViewport = Math.max(
      GAP,
      Math.min(rect.left, window.innerWidth - hostWidth - GAP)
    );

    suggestionHost.style.setProperty(
      "left",
      `${window.scrollX + leftViewport}px`,
      "important"
    );
    suggestionHost.style.setProperty(
      "top",
      `${window.scrollY + topViewport}px`,
      "important"
    );
  }

  function closeSuggestions() {
    suggestionState = null;
    if (suggestionHost) {
      setHostVisible(suggestionHost, false);
    }
  }

  function computeSuggestionItems(token) {
    const lower = token.toLowerCase();
    return [...snippets]
      .filter((snippet) => snippet.trigger.toLowerCase().startsWith(lower))
      .sort(
        (left, right) =>
          left.trigger.length - right.trigger.length || left.trigger.localeCompare(right.trigger)
      )
      .slice(0, MAX_SUGGESTIONS);
  }

  function updateSuggestions(target) {
    if (!isEditableTarget(target)) {
      closeSuggestions();
      return;
    }

    const context =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
        ? getInputContext(target)
        : getContentEditableContext(target);

    if (!context) {
      closeSuggestions();
      return;
    }

    const tokenMatch = context.textBeforeCaret.match(/(\S+)$/);
    const token = tokenMatch ? tokenMatch[1] : "";

    if (!token) {
      closeSuggestions();
      return;
    }

    const items = computeSuggestionItems(token);
    if (items.length === 0) {
      closeSuggestions();
      return;
    }

    const selectedIndex =
      suggestionState && suggestionState.target === target
        ? Math.min(suggestionState.selectedIndex, items.length - 1)
        : 0;

    suggestionState = { target, items, selectedIndex, tokenLength: token.length };
    renderSuggestions();
  }

  async function acceptSuggestion(index) {
    if (!suggestionState) {
      return;
    }

    const snippet = suggestionState.items[index];
    const target = suggestionState.target;
    const matchLength = suggestionState.tokenLength;
    closeSuggestions();

    if (!snippet) {
      return;
    }

    target.focus();
    const resolved = await resolveTemplate(snippet.body);

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      expandInInput(target, matchLength, resolved, "");
    } else {
      expandInContentEditable(target, matchLength, resolved, "");
    }
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.isComposing) {
        return;
      }

      // Escape always dismisses our own popup, even if the page already called
      // preventDefault() on the event or focus has drifted to another element.
      if (suggestionState && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeSuggestions();
        return;
      }

      if (event.defaultPrevented) {
        return;
      }

      if (
        suggestionState &&
        resolveEditableTarget(event.target) === suggestionState.target
      ) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          suggestionState.selectedIndex =
            (suggestionState.selectedIndex + 1) % suggestionState.items.length;
          renderSuggestions();
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          suggestionState.selectedIndex =
            (suggestionState.selectedIndex - 1 + suggestionState.items.length) %
            suggestionState.items.length;
          renderSuggestions();
          return;
        }

        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          void acceptSuggestion(suggestionState.selectedIndex);
          return;
        }
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = resolveEditableTarget(event.target);
      if (!isEditableTarget(target)) {
        return;
      }

      const shouldExpandOnSpace = event.key === " " && settings.expandOnSpace;
      const shouldExpandOnTab = event.key === "Tab" && settings.expandOnTab;

      if (!shouldExpandOnSpace && !shouldExpandOnTab) {
        return;
      }

      const candidate = getExpansionCandidate(target);
      if (!candidate) {
        return;
      }

      event.preventDefault();
      const delimiter = event.key === " " ? " " : "";
      void tryExpand(target, candidate.snippet, delimiter);
    },
    true
  );

  document.addEventListener(
    "input",
    (event) => {
      const target = resolveEditableTarget(event.target);
      if (!target) {
        closeSuggestions();
        return;
      }

      updateSuggestions(target);
    },
    true
  );

  document.addEventListener(
    "blur",
    (event) => {
      if (suggestionState && event.target === suggestionState.target) {
        closeSuggestions();
      }
    },
    true
  );

  // Extra safety nets so the popup can never get "stuck" open: any click outside
  // it, any scroll (the popup is anchored to document coords and goes stale),
  // focus leaving the field, or a viewport resize all dismiss it.
  document.addEventListener(
    "mousedown",
    (event) => {
      if (suggestionState && event.target !== suggestionHost) {
        closeSuggestions();
      }
    },
    true
  );

  document.addEventListener(
    "scroll",
    (event) => {
      if (!suggestionState) {
        return;
      }
      const target = suggestionState.target;
      if (!target.isConnected) {
        closeSuggestions();
        return;
      }
      // Keep the popup pinned to the caret when a scroll container moves it,
      // but bail if the field itself scrolled out of view.
      const scroller = event.target;
      if (scroller instanceof Node && scroller.contains(target) && scroller !== target) {
        closeSuggestions();
        return;
      }
      positionSuggestions();
    },
    true
  );

  document.addEventListener(
    "focusout",
    (event) => {
      if (suggestionState && event.target === suggestionState.target) {
        closeSuggestions();
      }
    },
    true
  );

  window.addEventListener("resize", () => {
    if (suggestionState) {
      closeSuggestions();
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORE_KEY]) {
      return;
    }

    closeSuggestions();

    const store = normalizeStore(changes[STORE_KEY].newValue);
    snippets = store.snippets;
    settings = store.settings;
  });

  loadStore();
})();
