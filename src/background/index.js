import { ensureStore, allowPageContextOrigin } from "../shared/storage.js";

chrome.runtime.onInstalled.addListener(() => {
  void ensureStore();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-options") {
    void chrome.runtime.openOptionsPage();
  }
});

// The content script routes "always allow this site" here so the read-modify-
// write of settings happens in one place instead of racing across frames.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "pe:allow-page-context-origin") {
    allowPageContextOrigin(message.origin)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return undefined;
});
