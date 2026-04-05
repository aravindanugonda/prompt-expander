# Prompt Expander

Prompt Expander is a Chrome extension that expands custom triggers like
`?use-analyzer-prompt` into reusable prompt text across browser text fields.

## What works today

- Local snippet storage with `chrome.storage.local`
- Snippet create, edit, delete, import, and export
- Trigger expansion in `input`, `textarea`, and basic `contenteditable`
- Dynamic tokens:
  - `${date}`
  - `${clipboard}`
  - `${input:name}`
  - `${cursor}`
- Popup search and quick copy
- Keyboard shortcut to open the options page: `Alt+Shift+P`

## Trigger behavior

- Type a trigger such as `?use-analyzer-prompt`
- Press `Space` to expand and keep the space
- Press `Tab` to expand without inserting a tab character

This choice is intentional for chat interfaces, where `Enter` often submits the
message and can be risky as an expansion key.

## Install in Chrome

1. Open `chrome://extensions`
2. Turn on Developer Mode
3. Click Load unpacked
4. Select this repository folder

## Run tests

```bash
npm test
```

## Notes

- Rich text editors vary a lot. This first version aims at common chat inputs and
  simpler editable fields instead of full editor parity.
- Clipboard reads depend on page and browser permission behavior. If clipboard
  access fails, `${clipboard}` currently resolves to an empty string.
