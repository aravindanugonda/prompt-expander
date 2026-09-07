# Chrome Web Store Listing Copy — Prompt Expander (>_)

Paste these directly into the Chrome Web Store Developer Dashboard fields.

## Extension name
Prompt Expander (>_)

## Short description (max 132 characters)
Type a short trigger like >_debug and it expands into a full reusable prompt in any text field. Typed inputs, page context, and packs.

(129 characters)

## Detailed description

Prompt Expander turns short triggers into full blocks of text. Type
something like `>_summarize` into any text field and press Space or
Tab — it expands in place into the complete prompt. Stop retyping the same
instructions into ChatGPT, Claude, Gemini, email, or code review.

The `>_` prefix is deliberate: it never fires by accident on punctuation you
actually meant to type.

**Starter snippets, then more when you want them**
First install seeds about a dozen ready-to-use examples — `>_ask`,
`>_review-code`, `>_summarize`, `>_rewrite-for`, `>_explain-pr`, `>_debug`,
`>_plan`, `>_compare`, `>_email` and more — each one showing off a token so
you can see how they are built. The Help tab has a one-click download of the
full 70+ prompt library as an installable pack, plus a sample pack to copy.

**How it works**
1. Type a trigger such as `>_debug` into a chat box, form, or editor.
2. Press Space (keeps the space) or Tab (inserts no tab character) to
   expand. Both are safe in chat apps where Enter sends the message.
3. Manage everything from the tabbed options page — Snippets (list +
   editor), Page access (allowed sites), Help (token reference + packs).

**Features**
- A dozen starter snippets, fully editable, plus a downloadable 70+ library
- Works in `input`, `textarea`, and common `contenteditable` fields
- Autocomplete dropdown as you type a trigger
- Dynamic tokens inside snippets:
  - `${date}` — insert today's date
  - `${clipboard}` — insert your current clipboard contents
  - `${input:name}` — typed values collected in one form (text, multi-line,
    or dropdown, configured per snippet)
  - `${cursor}` — set where your cursor lands after expansion
  - `${page:url}`, `${page:title}`, `${page:domain}`, `${page:selection}` —
    pull in the current page; asks for permission per site, and allowed
    sites are listed and revocable in settings
- Snippet packs: merge a JSON file of prompts into your set, choosing how
  duplicate triggers are handled
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

The single purpose of Prompt Expander is to detect user-defined text
triggers typed into web page text fields and expand them into pre-saved
snippets of text.

## Permission justifications
(Required per-permission in the "Privacy practices" tab)

- **storage** — Used to save the user's snippets (triggers and their
  expansion text) locally so they persist across browser sessions.
- **clipboardRead** — Used only to support the optional `${clipboard}`
  token in a snippet, which inserts the current clipboard contents at
  expansion time. Not used for any other purpose.
- **Broad content-script match (`http://*/*`, `https://*/*`)** — Text
  expansion is a passive, always-on feature: the content script must watch
  for typed triggers in text fields on whatever site the user is typing on
  (chat apps, forms, editors), with no way to know those sites in advance.
  `activeTab` is not usable because it only grants access after an explicit
  click and does not cover passive typing. The script reads the text the
  user is actively typing in the focused field, and — only for a snippet
  that uses a `${page:...}` token, and only after the user consents for that
  specific site — the page URL, title, hostname, or highlighted text at the
  moment of expansion. Nothing is transmitted anywhere. No `host_permissions`
  are requested — the extension makes no cross-origin requests and does not
  use tabs, cookies, or webRequest.

## Data usage disclosure (Privacy practices tab checkboxes)
- Does this extension collect or use user data? → No personal or sensitive
  user data is collected, transmitted, or sold.
- Certify compliance with the Developer Program Policies → Yes, once you've
  reviewed the privacy policy below matches actual behavior.

## Privacy policy URL
Host `store/PRIVACY_POLICY.md` from this repo (see PACKAGING.md for the
easiest way — GitHub Pages or a gist) and paste that URL here.
