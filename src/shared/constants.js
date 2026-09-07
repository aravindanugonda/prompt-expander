export const STORE_KEY = "prompt-expander-store";
export const STORE_VERSION = 2;
export const EXPANSION_DELIMITERS = {
  SPACE: " ",
  TAB: ""
};

export const DEFAULT_SETTINGS = {
  expandOnSpace: true,
  expandOnTab: true,
  maxContextLength: 240,
  // Origins (e.g. "https://github.com") the user has allowed snippets to read
  // page-context tokens on: ${page:url}, ${page:title}, ${page:domain},
  // ${page:selection}. Empty by default; the content script asks per site.
  pageContextOrigins: [],
  // How to resolve a duplicate trigger when installing a snippet pack:
  // "skip" | "replace" | "rename".
  packDuplicateStrategy: "skip"
};
