# Chrome Web Store Listing Copy — Prompt Expander (>_)

Paste these directly into the Chrome Web Store Developer Dashboard fields.

## Extension name
Prompt Expander (>_)

## Short description (max 132 characters)
Type a short trigger like >_debug and it expands into a full reusable prompt in any text field. Ships with 70+ ready-made prompts.

(126 characters)

## Detailed description

Prompt Expander turns short triggers into full blocks of text. Type
something like `>_summarize-thread` into any text field and press Space or
Tab — it expands in place into the complete prompt. Stop retyping the same
instructions into ChatGPT, Claude, Gemini, email, or code review.

The `>_` prefix is deliberate: it never fires by accident on punctuation you
actually meant to type.

**Comes with a library, ready to use**
Install and you immediately have 70+ curated prompts covering everyday
writing, decision-making, analysis, coding, debugging, architecture, cloud,
and more — for example `>_action-plan`, `>_debug-rigorously`,
`>_executive-brief`, `>_explain-simply`, `>_review`. Edit any of them or add
your own.

**How it works**
1. Type a trigger such as `>_debug` into a chat box, form, or editor.
2. Press Space (keeps the space) or Tab (inserts no tab character) to
   expand. Both are safe in chat apps where Enter sends the message.
3. Manage everything from the options page — create, edit, delete, import,
   export.

**Features**
- 70+ built-in prompts, fully editable
- Works in `input`, `textarea`, and common `contenteditable` fields
- Autocomplete dropdown as you type a trigger
- Dynamic tokens inside snippets:
  - `${date}` — insert today's date
  - `${clipboard}` — insert your current clipboard contents
  - `${input:name}` — prompt for a value when expanding
  - `${cursor}` — set where your cursor lands after expansion
- Popup search for quickly finding and copying a snippet
- Import and export your whole snippet set as JSON
- Keyboard shortcut to open settings (Alt+Shift+P / Option+Shift+P on Mac)

**Privacy**
Prompt Expander has no backend and sends nothing anywhere. Every snippet is
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
