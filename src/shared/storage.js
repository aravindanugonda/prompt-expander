import { DEFAULT_SNIPPETS } from "./defaultSnippets.js";
import { STORE_KEY, STORE_VERSION } from "./constants.js";
import {
  createEmptySnippet,
  normalizeSnippet,
  normalizeStore,
  validateImportedStore,
  validateSnippet
} from "./schema.js";

function storageGet(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(result[key]);
    });
  });
}

function storageSet(value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(value, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

export async function getStore() {
  const raw = await storageGet(STORE_KEY);
  return normalizeStore(raw);
}

export async function ensureStore() {
  const raw = await storageGet(STORE_KEY);

  if (raw) {
    return normalizeStore(raw);
  }

  const initialStore = {
    version: STORE_VERSION,
    snippets: DEFAULT_SNIPPETS.map((snippet) => ({ ...snippet })),
    settings: undefined
  };

  const normalized = normalizeStore(initialStore);
  await storageSet({ [STORE_KEY]: normalized });
  return normalized;
}

export async function saveStore(store) {
  const normalized = normalizeStore(store);
  await storageSet({ [STORE_KEY]: normalized });
  return normalized;
}

export async function saveSnippet(snippetDraft) {
  const store = await ensureStore();
  const normalizedSnippet = normalizeSnippet(snippetDraft);
  const updatedSnippet = {
    ...normalizedSnippet,
    updatedAt: new Date().toISOString()
  };
  const errors = validateSnippet(updatedSnippet, store.snippets);

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  const nextSnippets = store.snippets.some((snippet) => snippet.id === updatedSnippet.id)
    ? store.snippets.map((snippet) =>
        snippet.id === updatedSnippet.id
          ? { ...updatedSnippet, createdAt: snippet.createdAt }
          : snippet
      )
    : [...store.snippets, updatedSnippet];

  const nextStore = await saveStore({ ...store, snippets: nextSnippets });
  return nextStore;
}

// Replace the snippet set with the current starter snippets, keeping settings.
// This is the only path for an existing install to pick up a new default set,
// since ensureStore only seeds on an empty store.
export async function resetSnippetsToDefaults() {
  const store = await ensureStore();
  return saveStore({
    ...store,
    snippets: DEFAULT_SNIPPETS.map((snippet) => ({ ...snippet }))
  });
}

export async function updateSettings(patch) {
  const store = await ensureStore();
  return saveStore({
    ...store,
    settings: { ...store.settings, ...patch }
  });
}

export async function allowPageContextOrigin(origin) {
  if (typeof origin !== "string" || !origin) {
    return ensureStore();
  }

  const store = await ensureStore();
  const origins = new Set(store.settings.pageContextOrigins ?? []);
  origins.add(origin);
  return saveStore({
    ...store,
    settings: { ...store.settings, pageContextOrigins: [...origins] }
  });
}

export async function deleteSnippet(snippetId) {
  const store = await ensureStore();
  const nextSnippets = store.snippets.filter((snippet) => snippet.id !== snippetId);
  return saveStore({ ...store, snippets: nextSnippets });
}

export async function exportStore() {
  return ensureStore();
}

export async function importStore(rawStore) {
  const result = validateImportedStore(rawStore);

  if (!result.valid) {
    throw new Error(result.error);
  }

  return saveStore(result.store);
}

const PACK_STRATEGIES = ["skip", "replace", "rename"];

// A pack is a bare snippets array, a `{ snippets: [...] }` object, or a full
// exported store. Unlike importStore, this never replaces the user's set.
export function readPackSnippets(rawPack) {
  const list = Array.isArray(rawPack)
    ? rawPack
    : Array.isArray(rawPack?.snippets)
      ? rawPack.snippets
      : null;

  if (!list) {
    throw new Error(
      "Pack file must be a snippets array or an object with a snippets array."
    );
  }

  return list
    .map(normalizeSnippet)
    .filter((snippet) => snippet.trigger && snippet.body);
}

// Pure merge: no storage, no validation side effects. `existing` and `incoming`
// are already-normalized snippet arrays.
export function mergeSnippets(existing, incoming, strategy = "skip") {
  const mode = PACK_STRATEGIES.includes(strategy) ? strategy : "skip";
  const byTrigger = new Map(
    existing.map((snippet) => [snippet.trigger.toLowerCase(), snippet])
  );
  const next = [...existing];
  const summary = { added: 0, replaced: 0, renamed: 0, skipped: 0, strategy: mode };

  for (const snippet of incoming) {
    const key = snippet.trigger.toLowerCase();
    const match = byTrigger.get(key);

    if (!match) {
      const fresh = { ...snippet, id: crypto.randomUUID() };
      next.push(fresh);
      byTrigger.set(key, fresh);
      summary.added += 1;
      continue;
    }

    if (mode === "skip") {
      summary.skipped += 1;
      continue;
    }

    if (mode === "replace") {
      const index = next.findIndex((entry) => entry.id === match.id);
      next[index] = { ...snippet, id: match.id, createdAt: match.createdAt };
      byTrigger.set(key, next[index]);
      summary.replaced += 1;
      continue;
    }

    let suffix = 2;
    let candidate = `${snippet.trigger}-${suffix}`;
    while (byTrigger.has(candidate.toLowerCase())) {
      suffix += 1;
      candidate = `${snippet.trigger}-${suffix}`;
    }
    const fresh = { ...snippet, id: crypto.randomUUID(), trigger: candidate };
    next.push(fresh);
    byTrigger.set(candidate.toLowerCase(), fresh);
    summary.renamed += 1;
  }

  return { snippets: next, summary };
}

export async function installPack(rawPack, { strategy } = {}) {
  const store = await ensureStore();
  const parsed = readPackSnippets(rawPack);

  // The snippet editor validates on save; hold pack imports to the same bar so
  // a broken pack can't slip in an empty dropdown or a name collision.
  const incoming = [];
  let rejected = 0;
  for (const snippet of parsed) {
    if (validateSnippet(snippet, parsed).length === 0) {
      incoming.push(snippet);
    } else {
      rejected += 1;
    }
  }

  const mode = PACK_STRATEGIES.includes(strategy)
    ? strategy
    : store.settings.packDuplicateStrategy;

  const { snippets, summary } = mergeSnippets(store.snippets, incoming, mode);
  summary.rejected = rejected;
  const saved = await saveStore({ ...store, snippets });
  return { store: saved, summary };
}

export function createDraftSnippet() {
  return createEmptySnippet();
}
