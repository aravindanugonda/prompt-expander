(function () {
  const STORE_KEY = "prompt-expander-store";
  const MAX_CONTEXT_LENGTH = 240;

  let snippets = [];
  let settings = {
    expandOnSpace: true,
    expandOnTab: true
  };

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

  function expandInInput(target, snippet, resolved, delimiter) {
    const caret = target.selectionStart ?? 0;
    const start = Math.max(0, caret - snippet.trigger.length);
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

  function expandInContentEditable(target, snippet, resolved, delimiter) {
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

    const startOffset = Math.max(0, context.caretOffset - snippet.trigger.length);
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
      expandInInput(target, snippet, resolved, delimiter);
      return true;
    }

    return expandInContentEditable(target, snippet, resolved, delimiter);
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.defaultPrevented || event.isComposing) {
        return;
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

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORE_KEY]) {
      return;
    }

    const store = normalizeStore(changes[STORE_KEY].newValue);
    snippets = store.snippets;
    settings = store.settings;
  });

  loadStore();
})();
