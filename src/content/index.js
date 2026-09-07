import {
  resolveTemplate,
  formatLocalDate,
  hasPageToken,
  collectInputLabels
} from "../shared/template.js";
import { findMatchingSnippet } from "../shared/triggers.js";

(function () {
  const STORE_KEY = "prompt-expander-store";
  const CONTENT_BUILD = "2026-09-06";
  const MAX_CONTEXT_LENGTH = 240;

  // Marks which build is live on a page (visible on the <html> tag in DevTools).
  // Silent otherwise.
  try {
    document.documentElement.dataset.promptExpanderBuild = CONTENT_BUILD;
  } catch (_error) {
    // document not ready / restricted
  }

  // Off by default. To trace an expansion: run
  //   localStorage.setItem("pe:debug", "1")
  // in the page console, reproduce, then read console.debug lines.
  function debug(...args) {
    try {
      if (localStorage.getItem("pe:debug")) {
        console.debug("[prompt-expander]", ...args);
      }
    } catch (_error) {
      // localStorage blocked; tracing stays off
    }
  }

  // Snippet triggers are conventionally prefixed with ">_" so a bare ">"
  // (blockquotes, comparisons, arrows) never surfaces the suggestion list.
  const TRIGGER_PREFIX = ">_";

  const MAX_SUGGESTIONS = 8;

  let snippets = [];
  let settings = {
    expandOnSpace: true,
    expandOnTab: true
  };

  let suggestionState = null; // { target, items, selectedIndex, tokenLength }
  let suggestionHost = null;

  // Last non-collapsed selection whose anchor sat OUTSIDE any editable field.
  // Captured continuously because focusing a text field collapses the page
  // selection, so it is already gone by the time an expansion fires.
  let lastPageSelection = "";

  let modalHost = null;

  function normalizeStore(rawStore) {
    return {
      snippets: Array.isArray(rawStore?.snippets) ? rawStore.snippets : [],
      settings: {
        expandOnSpace: true,
        expandOnTab: true,
        pageContextOrigins: [],
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

  // Providers supplied to the shared template resolver. The resolver itself is
  // pure; anything that touches the page (clipboard, prompts, date) lives here.
  const templateProviders = {
    readClipboard: () => navigator.clipboard.readText(),
    prompt: (label) => window.prompt(`Value for ${label}`, ""),
    formatDate: () => formatLocalDate()
  };

  function dispatchInputEvent(target, data) {
    const event = new InputEvent("input", {
      bubbles: true,
      cancelable: false,
      inputType: "insertText",
      data
    });

    target.dispatchEvent(event);
  }

  // Replace the current selection via the browser's own editing pipeline. This
  // fires real beforeinput/input events, which React-controlled inputs and
  // rich editors (ProseMirror / Lexical, used by ChatGPT, Claude, etc.) require
  // -- a directly assigned .value or a hand-built Range mutation gets ignored
  // or reverted by them. Returns false if the command is unavailable.
  function execInsertText(text) {
    try {
      return document.execCommand("insertText", false, text);
    } catch (_error) {
      return false;
    }
  }

  function moveCaretBackward(count) {
    const selection = window.getSelection();
    if (!selection || typeof selection.modify !== "function" || count <= 0) {
      return;
    }
    for (let index = 0; index < count; index += 1) {
      selection.modify("move", "backward", "character");
    }
  }

  // Rich editors (ProseMirror in ChatGPT, Lexical, Slate, ...) own their DOM and
  // revert hand-built mutations, but they all implement a `paste` handler. We
  // synthesize one with our text as the clipboard payload. `defaultPrevented`
  // tells us an editor actually consumed it.
  function insertByPaste(target, text) {
    try {
      const data = new DataTransfer();
      data.setData("text/plain", text);
      const event = new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    } catch (_error) {
      return false;
    }
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
    const end = target.selectionEnd ?? caret;
    const insertion = resolved.text + delimiter;

    // Select the trigger, then let the browser replace it.
    target.setSelectionRange(start, end);
    if (!execInsertText(insertion)) {
      const nextValue =
        target.value.slice(0, start) + insertion + target.value.slice(end);
      target.value = nextValue;
      dispatchInputEvent(target, insertion);
    }

    const selectionPosition =
      resolved.cursorOffset === null
        ? start + insertion.length
        : start + resolved.cursorOffset;
    target.setSelectionRange(selectionPosition, selectionPosition);
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

  function expandInContentEditable(
    target,
    matchLength,
    resolved,
    delimiter,
    fallbackCaretOffset = null
  ) {
    const context = getContentEditableContext(target);
    const caretOffset = context ? context.caretOffset : fallbackCaretOffset;
    debug("expandInContentEditable", {
      liveContext: Boolean(context),
      caretOffset,
      matchLength
    });
    if (caretOffset == null) {
      return false;
    }

    const insertion = resolved.text + delimiter;
    const records = getTextNodes(target);

    if (records.length === 0) {
      const insertedNode = document.createTextNode(insertion);
      target.replaceChildren(insertedNode);
      const selectionOffset =
        resolved.cursorOffset === null ? insertion.length : resolved.cursorOffset;
      placeCaretInsideNode(insertedNode, selectionOffset);
      dispatchInputEvent(target, insertion);
      return true;
    }

    const startOffset = Math.max(0, caretOffset - matchLength);
    const start = locatePosition(records, startOffset);
    const end = locatePosition(records, caretOffset);

    if (!start || !end) {
      debug("could not locate trigger range in text nodes", {
        startOffset,
        caretOffset,
        textNodeCount: records.length
      });
      return false;
    }

    // Select the trigger text. Focus first: rich editors re-assert their own
    // selection on focus, so our range has to be set afterwards.
    target.focus();
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    debug("selected trigger, selection text =", JSON.stringify(selection.toString()));

    const backBy =
      resolved.cursorOffset === null ? 0 : insertion.length - resolved.cursorOffset;

    // 1) Synthetic paste — the one path ProseMirror / Lexical / Slate all honor.
    if (insertByPaste(target, insertion)) {
      debug("inserted via synthetic paste");
      if (backBy > 0) {
        moveCaretBackward(backBy);
      }
      return true;
    }

    // 2) The browser's own insertText command (plain contenteditable, textareas).
    const execOk = execInsertText(insertion);
    debug("execCommand insertText returned", execOk);
    if (execOk) {
      if (backBy > 0) {
        moveCaretBackward(backBy);
      }
      return true;
    }

    // 3) Last resort: mutate the DOM directly.
    range.deleteContents();
    const insertedNode = document.createTextNode(insertion);
    range.insertNode(insertedNode);
    const nextOffset =
      resolved.cursorOffset === null ? insertion.length : resolved.cursorOffset;
    placeCaretInsideNode(insertedNode, nextOffset);
    dispatchInputEvent(target, insertion);
    debug("inserted via direct DOM mutation (fallback)");
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

    const snippet = findMatchingSnippet(context.textBeforeCaret, snippets);
    if (!snippet) {
      return null;
    }

    return { snippet };
  }

  // --- Page context + typed inputs -------------------------------------

  function selectionTouchesEditable(selection) {
    return [selection.anchorNode, selection.focusNode].some((node) => {
      const el =
        node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
      if (!el) {
        return false;
      }
      if (suggestionHost && suggestionHost.contains(el)) {
        return true;
      }
      if (modalHost && modalHost.contains(el)) {
        return true;
      }
      return Boolean(
        el.closest(
          "input, textarea, [contenteditable]:not([contenteditable='false'])"
        )
      );
    });
  }

  function readNonEditableSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return "";
    }
    if (!selection.toString().trim()) {
      return "";
    }
    if (selectionTouchesEditable(selection)) {
      return "";
    }
    return selection.toString();
  }

  function pageSelectionText() {
    return readNonEditableSelection() || lastPageSelection;
  }

  function pageValue(field) {
    if (field === "url") {
      return window.location.href;
    }
    if (field === "title") {
      return document.title;
    }
    if (field === "domain") {
      return window.location.hostname;
    }
    if (field === "selection") {
      return pageSelectionText();
    }
    return "";
  }

  function closeModal() {
    if (modalHost) {
      modalHost.remove();
      modalHost = null;
    }
  }

  // A minimal shadow-DOM modal. `config.buttons` are {id,label,primary,role}
  // where role "submit" collects field values and "cancel" dismisses. Resolves
  // to { id, values }.
  function showModal(config) {
    return new Promise((resolve) => {
      closeModal();
      closeSuggestions();

      // Return focus here when the modal closes, so the editor is active again
      // before the expansion runs (mirrors how window.prompt behaved).
      const previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      const host = document.createElement("div");
      const hostStyles = {
        position: "fixed",
        inset: "0px",
        "z-index": "2147483647",
        margin: "0",
        padding: "0",
        border: "0",
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        visibility: "visible",
        opacity: "1",
        "pointer-events": "auto"
      };
      for (const [prop, value] of Object.entries(hostStyles)) {
        host.style.setProperty(prop, value, "important");
      }

      const shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host { all: initial; }
        * { box-sizing: border-box; }
        .card {
          font: 13px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #ffffff;
          color: #16263b;
          width: min(420px, calc(100vw - 32px));
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(2, 12, 27, 0.35);
          padding: 18px;
        }
        h2 { margin: 0 0 8px; font-size: 15px; }
        p.desc { margin: 0 0 14px; color: #5b6b82; }
        label { display: block; margin: 0 0 12px; }
        .flabel { display: block; font-weight: 600; margin-bottom: 4px; }
        input, textarea, select {
          width: 100%;
          font: inherit;
          padding: 7px 9px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          background: #fff;
          color: inherit;
        }
        textarea { min-height: 72px; resize: vertical; }
        .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 6px; }
        button {
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          padding: 7px 13px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #16263b;
        }
        button.primary { background: #2f80ed; border-color: #2f80ed; color: #fff; }
      `;

      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");

      if (config.title) {
        const heading = document.createElement("h2");
        heading.textContent = config.title;
        card.appendChild(heading);
      }

      if (config.description) {
        const desc = document.createElement("p");
        desc.className = "desc";
        desc.textContent = config.description;
        card.appendChild(desc);
      }

      const form = document.createElement("form");
      const controls = new Map();

      for (const field of config.fields ?? []) {
        const label = document.createElement("label");
        const span = document.createElement("span");
        span.className = "flabel";
        span.textContent = field.label;
        label.appendChild(span);

        let control;
        if (field.type === "textarea") {
          control = document.createElement("textarea");
        } else if (field.type === "select" && field.options.length > 0) {
          control = document.createElement("select");
          for (const option of field.options) {
            const optionEl = document.createElement("option");
            optionEl.value = option;
            optionEl.textContent = option;
            control.appendChild(optionEl);
          }
        } else {
          control = document.createElement("input");
          control.type = "text";
        }

        if (field.default) {
          control.value = field.default;
        }

        label.appendChild(control);
        form.appendChild(label);
        controls.set(field.name, control);
      }

      const buttons = config.buttons ?? [{ id: "ok", label: "OK", primary: true }];

      function collectValues() {
        const values = {};
        for (const [name, control] of controls) {
          values[name] = control.value;
        }
        return values;
      }

      function finish(id, values) {
        document.removeEventListener("keydown", onKeydown, true);
        host.remove();
        if (modalHost === host) {
          modalHost = null;
        }
        if (previouslyFocused && previouslyFocused.isConnected) {
          try {
            previouslyFocused.focus({ preventScroll: true });
          } catch (_error) {
            previouslyFocused.focus();
          }
        }
        resolve({ id, values: values ?? {} });
      }

      function onKeydown(event) {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          const cancel = buttons.find((button) => button.role === "cancel");
          finish(cancel ? cancel.id : "cancel", {});
        }
      }

      const row = document.createElement("div");
      row.className = "row";

      for (const button of buttons) {
        const buttonEl = document.createElement("button");
        buttonEl.type = "button";
        buttonEl.textContent = button.label;
        if (button.primary) {
          buttonEl.className = "primary";
        }
        buttonEl.addEventListener("click", () => {
          const values = button.role === "cancel" ? {} : collectValues();
          finish(button.id, values);
        });
        row.appendChild(buttonEl);
      }

      form.appendChild(row);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const submit =
          buttons.find((button) => button.role === "submit") ||
          buttons.find((button) => button.primary);
        if (submit) {
          finish(submit.id, submit.role === "cancel" ? {} : collectValues());
        }
      });
      card.appendChild(form);

      document.addEventListener("keydown", onKeydown, true);

      shadow.appendChild(style);
      shadow.appendChild(card);
      document.documentElement.appendChild(host);
      modalHost = host;

      const first = card.querySelector("input, textarea, select, button.primary, button");
      if (first) {
        first.focus();
      }
    });
  }

  async function ensurePageContextConsent() {
    const origin = window.location.origin;
    if ((settings.pageContextOrigins ?? []).includes(origin)) {
      return true;
    }

    const choice = await showModal({
      title: "Allow page context on this site?",
      description:
        "A snippet you triggered wants to insert this page's URL, title, " +
        `domain, or selected text. Allow it on ${origin}?`,
      buttons: [
        { id: "always", label: "Always allow on this site", primary: true },
        { id: "once", label: "Allow once" },
        { id: "cancel", label: "Cancel", role: "cancel" }
      ]
    });

    if (choice.id === "cancel") {
      return false;
    }

    if (choice.id === "always") {
      settings = {
        ...settings,
        pageContextOrigins: [...(settings.pageContextOrigins ?? []), origin]
      };
      try {
        await chrome.runtime.sendMessage({
          type: "pe:allow-page-context-origin",
          origin
        });
      } catch (_error) {
        // Best effort; storage.onChanged keeps other frames in sync anyway.
      }
    }

    return true;
  }

  async function collectInputValues(snippet, labels) {
    const defs = Array.isArray(snippet.inputs) ? snippet.inputs : [];
    const byName = new Map(defs.map((def) => [def.name, def]));

    const fields = labels.map((label) => {
      const def = byName.get(label) ?? {};
      return {
        name: label,
        label: def.label || label,
        type: ["text", "textarea", "select"].includes(def.type)
          ? def.type
          : "text",
        options: Array.isArray(def.options) ? def.options : [],
        default: typeof def.default === "string" ? def.default : ""
      };
    });

    const result = await showModal({
      title: snippet.title ? `Fill in: ${snippet.title}` : "Fill in values",
      fields,
      buttons: [
        { id: "submit", label: "Insert", primary: true, role: "submit" },
        { id: "cancel", label: "Cancel", role: "cancel" }
      ]
    });

    debug("modal closed with id", result.id);
    return result.id === "submit" ? result.values : null;
  }

  // Builds the provider set for one expansion, running any consent / input
  // prompts first. Returns null if the user cancels, meaning: do not expand.
  async function buildProviders(snippet) {
    const providers = { ...templateProviders };

    if (hasPageToken(snippet.body)) {
      const allowed = await ensurePageContextConsent();
      if (!allowed) {
        return null;
      }
      providers.page = (field) => pageValue(field);
    }

    const labels = collectInputLabels(snippet.body);
    if (labels.length > 0) {
      const values = await collectInputValues(snippet, labels);
      if (values === null) {
        return null;
      }
      providers.inputValues = values;
    }

    return providers;
  }

  // A consent / input modal takes focus, which collapses (and on many rich
  // editors destroys) the page caret. Snapshot it before the modal and put it
  // back before the expand helpers do their `caret - trigger.length` math.
  //
  // For contenteditable we store a plain character offset, not a cloned Range:
  // chat editors (Lexical / ProseMirror) swap out text nodes on blur, which
  // leaves a cloned Range pointing at detached nodes. The offset survives
  // because the modal blocks page input, so the text length can't change.
  function captureCaret(target) {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return {
        kind: "input",
        start: target.selectionStart,
        end: target.selectionEnd,
        valueLength: target.value.length
      };
    }

    const context = getContentEditableContext(target);
    if (context) {
      return { kind: "offset", offset: context.caretOffset };
    }

    return null;
  }

  function restoreCaret(target, snapshot) {
    target.focus();

    if (!snapshot) {
      return;
    }

    if (snapshot.kind === "input") {
      if (
        typeof snapshot.start === "number" &&
        target.value.length === snapshot.valueLength
      ) {
        try {
          target.setSelectionRange(snapshot.start, snapshot.end);
        } catch (_error) {
          // A few input types reject setSelectionRange; nothing to do.
        }
      }
      return;
    }

    // contenteditable: rebuild a collapsed selection at the saved offset.
    const records = getTextNodes(target);
    const position = locatePosition(records, snapshot.offset);
    if (position) {
      placeCaretInsideNode(position.node, position.offset);
    }
  }

  async function tryExpand(target, snippet, delimiter) {
    const caret = captureCaret(target);
    debug("tryExpand start", { trigger: snippet.trigger, caret });
    const providers = await buildProviders(snippet);
    if (!providers) {
      debug("tryExpand aborted: user cancelled a modal");
      return false;
    }

    const resolved = await resolveTemplate(snippet.body, providers);
    debug("resolved text length", resolved.text.length, "cursorOffset", resolved.cursorOffset);

    restoreCaret(target, caret);
    const fallbackOffset = caret?.kind === "offset" ? caret.offset : null;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      expandInInput(target, snippet.trigger.length, resolved, delimiter);
      return true;
    }

    const ok = expandInContentEditable(
      target,
      snippet.trigger.length,
      resolved,
      delimiter,
      fallbackOffset
    );
    debug("expandInContentEditable returned", ok);
    return ok;
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
        acceptSuggestion(index).catch((error) =>
          debug("accept threw", error)
        );
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

    if (!token || !token.startsWith(TRIGGER_PREFIX)) {
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
    const caret = captureCaret(target);
    closeSuggestions();

    if (!snippet) {
      return;
    }

    debug("accept", snippet.trigger, "tokenLen", matchLength, "caret", caret);

    const providers = await buildProviders(snippet);
    if (!providers) {
      debug("aborted: modal cancelled");
      return;
    }

    const resolved = await resolveTemplate(snippet.body, providers);
    debug("resolved", resolved.text.length, "chars");

    // Put the caret back after any consent / input modal before the expand
    // helpers read the caret position.
    restoreCaret(target, caret);
    const fallbackOffset = caret?.kind === "offset" ? caret.offset : null;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      debug("target", target.tagName.toLowerCase());
      expandInInput(target, matchLength, resolved, "");
    } else {
      debug("target contenteditable", target.tagName.toLowerCase());
      expandInContentEditable(target, matchLength, resolved, "", fallbackOffset);
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
          acceptSuggestion(suggestionState.selectedIndex).catch((error) =>
            debug("accept threw", error)
          );
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
      tryExpand(target, candidate.snippet, delimiter).catch((error) =>
        debug("expand threw", error)
      );
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

  // Continuously remember the last real page highlight so `${page:selection}`
  // still has it after the user clicks into a text field (which collapses the
  // document selection).
  document.addEventListener(
    "selectionchange",
    () => {
      const text = readNonEditableSelection();
      if (text) {
        lastPageSelection = text;
      }
    },
    true
  );

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
