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

export async function resolveTemplate(template, providers = {}) {
  const nodes = Array.isArray(template) ? template : parseTemplate(template);
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
      const clipboardText = (await providers.readClipboard?.()) ?? "";
      text += clipboardText;
      continue;
    }

    if (node.type === "input") {
      const response = await providers.prompt?.(node.label);
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
