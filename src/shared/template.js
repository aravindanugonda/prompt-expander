// Browser-context fields a snippet may pull in via `${page:...}`. Anything not
// listed here is left as literal text, matching how unknown tokens behave.
export const PAGE_FIELDS = new Set(["url", "title", "domain", "selection"]);

function parseToken(tokenValue) {
  if (tokenValue === "date") {
    return { type: "date" };
  }

  if (tokenValue === "clipboard") {
    return { type: "clipboard" };
  }

  if (tokenValue === "cursor") {
    return { type: "cursor" };
  }

  if (tokenValue.startsWith("input:")) {
    const label = tokenValue.slice("input:".length).trim() || "value";
    return { type: "input", label };
  }

  if (tokenValue.startsWith("page:")) {
    const field = tokenValue.slice("page:".length).trim().toLowerCase();
    if (PAGE_FIELDS.has(field)) {
      return { type: "page", field };
    }
  }

  return null;
}

export function parseTemplate(template) {
  const nodes = [];
  const pattern = /\$\{([^}]+)\}/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(template)) !== null) {
    if (match.index > cursor) {
      nodes.push({
        type: "text",
        value: template.slice(cursor, match.index)
      });
    }

    const token = parseToken(match[1].trim());

    if (token) {
      nodes.push(token);
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

export function formatLocalDate(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Distinct `${input:...}` labels referenced by a template, in first-seen order.
// Callers use this to collect every value up front (one form) before resolving.
export function collectInputLabels(template) {
  const nodes = Array.isArray(template) ? template : parseTemplate(template);
  const labels = [];
  for (const node of nodes) {
    if (node.type === "input" && !labels.includes(node.label)) {
      labels.push(node.label);
    }
  }
  return labels;
}

export function hasPageToken(template) {
  const nodes = Array.isArray(template) ? template : parseTemplate(template);
  return nodes.some((node) => node.type === "page");
}

export async function resolveTemplate(template, providers = {}) {
  const nodes = Array.isArray(template) ? template : parseTemplate(template);
  const inputValues = providers.inputValues ?? null;
  let text = "";
  let cursorOffset = null;

  for (const node of nodes) {
    if (node.type === "text") {
      text += node.value;
      continue;
    }

    if (node.type === "date") {
      text += providers.formatDate?.() ?? formatLocalDate();
      continue;
    }

    if (node.type === "clipboard") {
      let clipboardText = "";
      try {
        clipboardText = (await providers.readClipboard?.()) ?? "";
      } catch (_error) {
        clipboardText = "";
      }
      text += clipboardText;
      continue;
    }

    if (node.type === "page") {
      let pageText = "";
      try {
        pageText = (await providers.page?.(node.field)) ?? "";
      } catch (_error) {
        pageText = "";
      }
      text += pageText;
      continue;
    }

    if (node.type === "input") {
      let response;
      if (inputValues && Object.prototype.hasOwnProperty.call(inputValues, node.label)) {
        response = inputValues[node.label];
      } else {
        response = await providers.prompt?.(node.label);
      }
      text += response ?? "";
      continue;
    }

    if (node.type === "cursor" && cursorOffset === null) {
      cursorOffset = text.length;
    }
  }

  return {
    text,
    cursorOffset
  };
}
