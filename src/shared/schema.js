import { DEFAULT_SETTINGS, STORE_VERSION } from "./constants.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeSnippet(rawSnippet) {
  const timestamp = new Date().toISOString();

  return {
    id: isNonEmptyString(rawSnippet?.id)
      ? rawSnippet.id.trim()
      : crypto.randomUUID(),
    title: isNonEmptyString(rawSnippet?.title) ? rawSnippet.title.trim() : "",
    trigger: isNonEmptyString(rawSnippet?.trigger)
      ? rawSnippet.trigger.trim()
      : "",
    body: typeof rawSnippet?.body === "string" ? rawSnippet.body : "",
    description:
      typeof rawSnippet?.description === "string"
        ? rawSnippet.description.trim()
        : "",
    createdAt: isNonEmptyString(rawSnippet?.createdAt)
      ? rawSnippet.createdAt
      : timestamp,
    updatedAt: isNonEmptyString(rawSnippet?.updatedAt)
      ? rawSnippet.updatedAt
      : timestamp
  };
}

export function validateSnippet(snippet, snippets = []) {
  const errors = [];

  if (!isNonEmptyString(snippet.title)) {
    errors.push("Title is required.");
  }

  if (!isNonEmptyString(snippet.trigger)) {
    errors.push("Trigger is required.");
  }

  if (!isNonEmptyString(snippet.body)) {
    errors.push("Body is required.");
  }

  const duplicate = snippets.find(
    (entry) =>
      entry.id !== snippet.id &&
      entry.trigger.trim().toLowerCase() === snippet.trigger.trim().toLowerCase()
  );

  if (duplicate) {
    errors.push(`Trigger "${snippet.trigger}" is already in use.`);
  }

  return errors;
}

export function normalizeStore(rawStore) {
  const snippets = Array.isArray(rawStore?.snippets)
    ? rawStore.snippets.map(normalizeSnippet)
    : [];

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(rawStore?.settings ?? {})
  };

  return {
    version: STORE_VERSION,
    snippets,
    settings
  };
}

export function validateImportedStore(rawStore) {
  if (!rawStore || typeof rawStore !== "object") {
    return { valid: false, error: "Import file must contain an object." };
  }

  if (!Array.isArray(rawStore.snippets)) {
    return { valid: false, error: "Import file must contain a snippets array." };
  }

  const normalized = normalizeStore(rawStore);

  for (const snippet of normalized.snippets) {
    const errors = validateSnippet(snippet, normalized.snippets);
    if (errors.length > 0) {
      return { valid: false, error: errors[0] };
    }
  }

  return { valid: true, store: normalized };
}

export function createEmptySnippet() {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "",
    trigger: "?new-prompt",
    description: "",
    body: "",
    createdAt: now,
    updatedAt: now
  };
}
