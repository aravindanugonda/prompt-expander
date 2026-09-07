# Prompt Expander (>_)

Prompt Expander is a Chrome extension that expands custom triggers like
`>_ask` into reusable prompt text across browser text fields.
Triggers use a `>_` prefix (the extension's mark) so they don't fire on a
stray `?` you actually meant to type.

## What works today

- Local snippet storage with `chrome.storage.local`
- Snippet create, edit, delete, import, and export
- Trigger expansion in `input`, `textarea`, and basic `contenteditable`
- Dynamic tokens:
  - `${date}` — today as `YYYY-MM-DD`
  - `${clipboard}` — current clipboard text
  - `${input:name}` — a typed value; every `${input:...}` in a snippet is
    collected in one small form (text / multi-line / dropdown, configured
    per snippet on the options page)
  - `${cursor}` — where the caret lands after expansion
  - `${page:url}`, `${page:title}`, `${page:domain}`, `${page:selection}` —
    the current page's address, tab title, hostname, or highlighted text.
    The first use on a site asks for consent (allow once / allow this site /
    cancel); allowed sites are listed and revocable on the options page.
- Starter snippets: first install seeds ~13 curated examples in
  [`src/shared/defaultSnippets.js`](src/shared/defaultSnippets.js), one per
  token feature plus a few combinations, each with the fill-in as
  `${input:...}` and the caret ending at `${cursor}`.
- Snippet packs: the **Help** tab has **Install pack from file** (merges a
  JSON file into your set; duplicate triggers skipped by default) and
  **Download sample pack** / **Download full prompt library** buttons. Packs
  ship in [`packs/`](packs/) — `code-review.json` and `prompt-library.json`
  (the original 70+ prompts, fill-ins converted to `${input:task}`).
- Options page is tabbed: **Snippets** (list + editor), **Page access**
  (allowed sites), **Help** (token reference + packs).
- Popup search and quick copy
- Keyboard shortcut to open the options page: `Alt+Shift+P`

## Trigger behavior

- Type a trigger such as `>_ask`
- Press `Space` to expand and keep the space
- Press `Tab` to expand without inserting a tab character

This choice is intentional for chat interfaces, where `Enter` often submits the
message and can be risky as an expansion key.

## Build

The content script is bundled from `src/content/index.js` plus its
`src/shared/*` imports into `dist/content.js` (the file `manifest.json`
points at). Run this once before loading the extension, and again after
changing anything under `src/content` or `src/shared`:

```bash
npm install
npm run build
```

## Install in Chrome

1. Run `npm run build`
2. Open `chrome://extensions`
3. Turn on Developer Mode
4. Click Load unpacked
5. Select this repository folder

## Run tests

```bash
npm test
```

`npm test` rebuilds `dist/content.js` first, so the bundle the browser loads
is always covered by the test run.

## Notes

- Rich text editors vary a lot. This first version aims at common chat inputs and
  simpler editable fields instead of full editor parity.
- Clipboard reads depend on page and browser permission behavior. If clipboard
  access fails, `${clipboard}` currently resolves to an empty string.
