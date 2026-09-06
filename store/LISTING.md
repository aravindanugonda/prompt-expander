# Chrome Web Store Listing Copy — Prompt Expander (>_)

Paste these directly into the Chrome Web Store Developer Dashboard fields.

## Extension name
Prompt Expander (>_)

## Short description (max 132 characters)
Type a short trigger like >_use-analyzer-prompt and instantly expand it into a full reusable prompt, in any text field.

(117 characters)

## Detailed description

Prompt Expander lets you save reusable snippets of text — prompts, replies,
templates, anything you type often — and insert them anywhere on the web by
typing a short trigger.

**How it works**
1. Create a snippet with a trigger, e.g. `>_use-analyzer-prompt`, and the text
   you want it to expand into.
2. Type that trigger into any text field — a chat box, a form, a
   contenteditable editor.
3. Press Space or Tab to expand it in place.

Tab expands without inserting a tab character, and Space expands while
keeping the space — both are safe to use in chat apps where Enter usually
sends the message.

**Features**
- Local snippet storage — nothing leaves your device
- Create, edit, delete, import, and export snippets
- Works in `input`, `textarea`, and common `contenteditable` fields
- Dynamic tokens inside snippets:
  - `${date}` — insert today's date
  - `${clipboard}` — insert your current clipboard contents
  - `${input:name}` — prompt for a value when expanding
  - `${cursor}` — set where your cursor lands after expansion
- Popup search for quickly finding and copying a snippet
- Keyboard shortcut to open snippet settings (Alt+Shift+P / Option+Shift+P
  on Mac)

**Privacy**
Prompt Expander has no backend and sends no data anywhere. All snippets are
stored locally in your browser. See the privacy policy for details.

## Category
Productivity

## Language
English

## Single purpose description
(Required field — CWS asks you to describe the extension's single purpose)

Prompt Expander's single purpose is to detect user-defined text triggers
typed into web page text fields and expand them into pre-saved snippets of
text.

## Permission justifications
(Required per-permission in the "Privacy practices" tab)

- **storage** — Used to save the user's snippets (triggers and their
  expansion text) locally so they persist across browser sessions.
- **clipboardRead** — Used only to support the optional `${clipboard}`
  token in a snippet, which inserts the current clipboard contents at
  expansion time. Not used for any other purpose.
- **Host permission `<all_urls>`** — The extension must be able to detect
  typed triggers and expand them in text fields on any site the user
  chooses to use it on (chat apps, forms, editors, etc.). It does not read,
  store, or transmit page content beyond what is needed to perform the
  expansion in the field being typed into.

## Data usage disclosure (Privacy practices tab checkboxes)
- Does this extension collect or use user data? → No personal or sensitive
  user data is collected, transmitted, or sold.
- Certify compliance with the Developer Program Policies → Yes, once you've
  reviewed the privacy policy below matches actual behavior.

## Privacy policy URL
Host `store/PRIVACY_POLICY.md` from this repo (see PACKAGING.md for the
easiest way — GitHub Pages or a gist) and paste that URL here.
