# Privacy Policy for Prompt Expander (>_)

Last updated: 2026-09-04

Prompt Expander is a browser extension that expands short text triggers
(e.g. `>_use-analyzer-prompt`) into longer, reusable snippets of text inside
web page text fields.

## What data we collect

We do not collect, transmit, or sell any personal data. Prompt Expander does
not have a backend server and does not send any data over the network.

## What data is stored, and where

- **Snippets you create** (trigger text and expansion content) are stored
  locally on your device using the browser's built-in `chrome.storage.local`
  API.
- This data never leaves your device. It is not synced to any external
  server operated by us, and we have no access to it.
- Uninstalling the extension removes this stored data.

## Why the extension requests broad permissions

- **`storage`** — used to save your snippets locally so they persist
  between browser sessions.
- **`clipboardRead`** — used only to support the optional `${clipboard}`
  token, which lets a snippet insert your current clipboard contents when
  you trigger an expansion. Clipboard contents are read on-demand at the
  moment of expansion and are inserted directly into the page; they are not
  stored or transmitted anywhere.
- **Access to web pages (`http://*/*`, `https://*/*`)** — the extension's
  core feature is detecting typed triggers and expanding them in text fields
  on any website you choose to use it on (chat interfaces, forms, editors,
  etc.), so its content script runs on all pages. This access is used only
  to watch for and expand triggers in the text field you are typing in; it
  is not used to read, log, or transmit page content elsewhere. The
  extension requests no `host_permissions` and makes no network requests.

## Third parties

Prompt Expander does not use analytics, advertising, or any third-party
tracking or data-sharing services.

## Changes to this policy

If this policy changes, the updated version will be posted at the same
location and the "Last updated" date above will be revised.

## Contact

Questions about this policy can be sent to: aravindkanugonda@gmail.com
