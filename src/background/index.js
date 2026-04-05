import { ensureStore } from "../shared/storage.js";

chrome.runtime.onInstalled.addListener(() => {
  void ensureStore();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-options") {
    void chrome.runtime.openOptionsPage();
  }
});
