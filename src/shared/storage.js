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

export function createDraftSnippet() {
  return createEmptySnippet();
}
