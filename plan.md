# Chrome Text Expansion Extension V1 Implementation Plan

## Purpose

This document captures the full implementation plan for building a Chrome extension V1 similar in spirit to Text Blaze, but intentionally narrower in scope and optimized for a single-user or small-scale personal workflow.

The goal is to preserve context before moving development into a new workspace.

This plan is for V1 only. It does not aim for parity with Text Blaze. It aims for a meaningful, usable, installable Chrome extension that supports practical text expansion in browser-based workflows.

## Product Goal

Build a Chrome extension for Chrome that allows the user to:

- define reusable text snippets
- trigger snippet expansion while typing in browser text fields
- manage snippets through an extension UI
- insert dynamic values such as date, clipboard, and prompted inputs
- use the extension locally without requiring a backend

V1 should be installable in Chrome via Developer Mode and usable in ordinary web applications that rely on:

- `input`
- `textarea`
- basic `contenteditable`

## Non-Goals For V1

The following are explicitly out of scope for V1:

- cloud sync
- accounts or authentication
- snippet sharing or team collaboration
- billing
- analytics
- full Text Blaze scripting parity
- full support for Google Docs
- full support for every rich text editor
- AI features
- enterprise policy management
- advanced permissions model

These are intentionally excluded to keep V1 tractable and production-usable.

## Product Definition

### Core User Value

The user wants to type a short trigger like `;sig` or `/addr` in a web form and have it expanded into a longer snippet immediately and reliably.

The user also wants basic dynamic snippet behavior such as:

- current date insertion
- clipboard insertion
- prompted values such as name or account number
- cursor placement after insertion

### V1 Feature Set

V1 includes:

1. Local snippet storage
2. Snippet create, edit, delete
3. Trigger-based expansion while typing
4. Basic snippet search UI
5. Dynamic tokens:
   - `${date}`
   - `${clipboard}`
   - `${input:name}`
   - `${cursor}`
6. Keyboard shortcut to open extension UI or snippet picker
7. Support for:
   - `input`
   - `textarea`
   - simple `contenteditable`
8. Import/export via JSON file

V1 excludes:

- folders with deep hierarchy
- rich collaboration
- conditional logic
- loops
- complex macros
- database-backed persistence

## Success Criteria

V1 is successful if:

- the extension installs cleanly in Chrome
- users can create snippets in the UI
- typing a trigger in common websites expands the snippet reliably
- dynamic variables work correctly
- cursor placement works in standard inputs and textareas
- the extension does not require a backend
- the architecture is clean enough to support future iteration

## Primary Technical Challenges

This project is very buildable, but there are real implementation risks. The difficult parts are not the CRUD UI. The difficult parts are input interception, insertion reliability, and cross-site behavior.

### Hard Problems

1. Detecting typed triggers without interfering with normal input behavior
2. Replacing trigger text reliably in:
   - plain input fields
   - textareas
   - `contenteditable`
3. Preserving caret location after insertion
4. Handling dynamic tokens safely and predictably
5. Working across many sites without breaking site-specific editor behavior
6. Limiting extension permissions while still being useful

### Known V1 Limitations

- Google Docs may not behave like normal editable content
- Gmail compose may require special handling depending on DOM structure
- some JavaScript-heavy editors may block or alter synthetic input events
- `contenteditable` support is often less reliable than `textarea` support

These should be treated as known boundaries, not surprises.

## Recommended Technical Stack

### Extension Platform

- Chrome Extension Manifest V3

### Language

- TypeScript

### UI Framework

- React for popup and options page

### Styling

- Plain CSS or a lightweight utility approach
- avoid overengineering the styling system in V1

### Build Tool

- Vite or a similar fast bundler that supports extension workflows

### Storage

- `chrome.storage.local` for snippet persistence
- optional limited use of `chrome.storage.sync` later if needed, but not required for V1

### Testing

- unit tests for parser/token expansion
- manual browser-based testing for insertion behavior

## High-Level Architecture

The extension should be structured into distinct layers.

### 1. Content Script Layer

Responsible for:

- detecting editable targets on web pages
- monitoring user typing
- recognizing triggers
- invoking snippet lookup
- performing insertion and replacement in page fields

### 2. Background/Service Worker Layer

Responsible for:

- extension lifecycle
- keyboard command handling
- message routing between popup/options/content scripts

### 3. UI Layer

Responsible for:

- snippet management
- settings
- import/export
- search and filtering

Likely surfaces:

- popup page
- options page
- optional in-page snippet picker overlay

### 4. Core Engine Layer

Responsible for:

- snippet data model
- trigger matching
- template parsing
- dynamic token evaluation
- cursor token handling
- validation

### 5. Storage Layer

Responsible for:

- loading and saving snippets
- schema versioning
- import/export format

## Proposed V1 User Experience

### Snippet Creation

The user opens the extension popup or options page and creates a snippet with:

- title
- trigger
- body
- optional description

Example:

- title: Signature
- trigger: `;sig`
- body:
  `Best regards,\nJohn Doe\nSenior Architect\n${cursor}`

### Snippet Expansion Flow

1. User focuses a text field on a website
2. User types `;sig`
3. User types a delimiter or completion key such as space, enter, or tab
4. Extension detects the full trigger
5. Extension replaces the typed trigger with expanded snippet text
6. Dynamic tokens are resolved
7. Caret is placed at `${cursor}` location if present

### Prompted Input Flow

If a snippet includes `${input:name}`, expansion should:

1. pause insertion flow
2. request value from the user
3. replace `${input:name}` with entered value
4. continue expansion

For V1, this can be implemented via a lightweight browser prompt or an extension overlay prompt.

Recommendation for V1:

- start with a simple browser prompt for speed
- only move to a custom overlay if the browser prompt becomes too limiting

## Functional Requirements

### Snippet Management

Must support:

- create snippet
- edit snippet
- delete snippet
- list snippets
- search snippets
- validate unique triggers

### Expansion Behavior

Must support:

- typed trigger recognition
- trigger replacement
- delimiter-aware expansion
- insertion in standard fields
- insertion in basic `contenteditable`

### Dynamic Variables

V1 token set:

- `${date}`
- `${clipboard}`
- `${input:name}`
- `${cursor}`

Expected behavior:

- `${date}` inserts current date in default format
- `${clipboard}` inserts current clipboard text
- `${input:name}` prompts user and inserts response
- `${cursor}` determines final caret position

### Import/Export

Must support:

- export snippets to JSON
- import snippets from JSON
- validate imported schema

## Non-Functional Requirements

### Performance

- typing should remain responsive
- trigger detection should avoid heavy DOM work on every keystroke
- expansion should feel instant in normal sites

### Reliability

- do not expand unexpectedly in non-editable elements
- do not corrupt field contents
- if expansion fails, fail safely and preserve user text where possible

### Security

- minimize permissions
- do not send user text to remote services
- do not persist unnecessary page content
- only access clipboard when needed for explicit token resolution

### Maintainability

- separate editor interaction code from snippet engine code
- isolate site-agnostic logic from DOM-specific logic
- use a versioned snippet schema

## Detailed Build Plan

## Phase 0: Product and Technical Foundation

### Step 0.1 Define Scope Precisely

Write and freeze V1 scope:

- Chrome only
- local-only storage
- plain snippets plus 4 dynamic tokens
- support standard fields plus basic `contenteditable`

This matters because extension scope can sprawl quickly.

### Step 0.2 Define Trigger Semantics

Decide:

- whether triggers always begin with a prefix like `;`
- what counts as a delimiter
- whether expansion happens automatically or on specific keypress

Recommended V1 behavior:

- triggers begin with user-defined string
- expansion occurs when user types:
  - space
  - enter
  - tab
- the delimiter is optionally preserved depending on field behavior

This avoids firing on partial words.

### Step 0.3 Define Snippet Schema

Create a TypeScript data model such as:

```ts
type Snippet = {
  id: string;
  title: string;
  trigger: string;
  body: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};
```

Create an app-level schema wrapper:

```ts
type SnippetStore = {
  version: 1;
  snippets: Snippet[];
};
```

### Step 0.4 Define Token Grammar

V1 token grammar:

- `${date}`
- `${clipboard}`
- `${cursor}`
- `${input:label}`

Do not invent a broader scripting grammar yet.

Keep the parser intentionally narrow.

## Phase 1: Extension Scaffolding

### Step 1.1 Initialize Project

Create new workspace and scaffold project:

- `package.json`
- TypeScript config
- Vite config
- extension folder structure

Suggested structure:

```text
src/
  background/
  content/
  core/
  popup/
  options/
  shared/
public/
manifest.json
```

### Step 1.2 Create Manifest V3 Setup

Manifest should include:

- extension name
- version
- permissions
- host permissions if needed
- background service worker
- content script
- action popup
- options page
- commands

Likely permissions for V1:

- `storage`
- `activeTab`
- `scripting`
- `clipboardRead` only if truly required by implementation path

Be conservative with permissions.

### Step 1.3 Wire Popup and Options Pages

Create:

- popup entry point
- options page entry point

Popup can be lightweight:

- search snippets
- quick access
- maybe recent snippets

Options page should be the main management UI.

## Phase 2: Core Data and Storage

### Step 2.1 Implement Storage Adapter

Create a storage service around `chrome.storage.local`.

Functions:

- `getAllSnippets()`
- `saveSnippet()`
- `deleteSnippet()`
- `replaceAllSnippets()`
- `exportSnippets()`
- `importSnippets()`

### Step 2.2 Add Validation

Validation rules:

- `title` required
- `trigger` required
- `body` required
- trigger uniqueness enforced
- import schema validated

### Step 2.3 Add Migration Hook

Even for V1, add a version migration entry point.

Reason:

- future-proof storage changes
- avoid rewriting storage logic later

## Phase 3: Snippet Engine

### Step 3.1 Implement Trigger Matcher

Create logic that can determine whether current typed content ends with a known trigger.

This should:

- efficiently match against stored triggers
- avoid scanning excessive text where unnecessary

Recommended V1 approach:

- inspect only text close to caret
- compare against known triggers

### Step 3.2 Implement Template Parser

Parser responsibilities:

- tokenize snippet body
- identify plain text segments
- identify supported dynamic tokens
- record cursor marker position

Output could be a list of typed nodes:

```ts
type TokenNode =
  | { type: "text"; value: string }
  | { type: "date" }
  | { type: "clipboard" }
  | { type: "input"; label: string }
  | { type: "cursor" };
```

### Step 3.3 Implement Token Resolver

Resolver responsibilities:

- convert parser output into final text
- gather dynamic values
- return final string plus cursor offset

Return shape:

```ts
type ExpansionResult = {
  text: string;
  cursorOffset: number | null;
};
```

### Step 3.4 Define Date Formatting

V1 should choose a simple default format.

Recommendation:

- ISO-like local date such as `YYYY-MM-DD`

If customization is added later, it should be a separate feature.

## Phase 4: Content Script and Editor Integration

This is the most important implementation area in V1.

### Step 4.1 Detect Eligible Editable Elements

Support:

- `HTMLInputElement`
- `HTMLTextAreaElement`
- `contenteditable="true"`

Ignore:

- password fields
- read-only inputs
- disabled controls
- non-editable DOM nodes

### Step 4.2 Capture Typing Events

Recommended events to evaluate:

- `keydown`
- `input`

Likely V1 strategy:

- use `keydown` to detect delimiter keys
- inspect current content before or at insertion point
- decide whether trigger should expand

Avoid heavy logic on every keystroke.

### Step 4.3 Extract Text Around Caret

For `input` and `textarea`:

- use `selectionStart`
- use `selectionEnd`

For `contenteditable`:

- use `Selection` and `Range`
- build text extraction logic from current editable node context

For V1, limit extraction to a short window before the caret.

### Step 4.4 Replace Trigger with Expanded Text

For `input` and `textarea`:

- replace text directly in `value`
- restore selection/caret
- dispatch appropriate input/change events if necessary

For `contenteditable`:

- use `Range` deletion and insertion
- normalize resulting caret placement

### Step 4.5 Preserve Delimiter Behavior

When expansion is triggered by space or enter, decide:

- whether the delimiter should remain after expansion
- whether enter should insert a newline after snippet

Recommended V1:

- preserve typed delimiter when reasonable
- make behavior consistent and document it

### Step 4.6 Implement Safe Failure Path

If insertion fails:

- do not destroy user input
- bail out cleanly
- optionally log debug info in development mode

## Phase 5: Dynamic Input and Clipboard Support

### Step 5.1 Implement `${input:name}`

V1 recommended path:

- detect token during resolution
- prompt user for value
- insert value into snippet

This can initially use `window.prompt`.

Later this can be replaced with a custom modal overlay if necessary.

### Step 5.2 Implement `${clipboard}`

Clipboard retrieval may require:

- permission handling
- fallback logic

Need to validate how clipboard access behaves from content script versus extension context.

Recommended V1 path:

- centralize clipboard access in a controlled utility
- if clipboard read fails, fail predictably and notify the user

### Step 5.3 Implement `${cursor}`

The parser should mark cursor placement.

After final insertion:

- calculate absolute caret target
- place the caret correctly in `input`, `textarea`, or `contenteditable`

If multiple `${cursor}` tokens exist:

- define V1 behavior now

Recommendation:

- first `${cursor}` wins
- additional ones ignored

## Phase 6: UI for Snippet Management

### Step 6.1 Build Options Page

The options page should be the primary management UI.

Include:

- snippet list
- search field
- create/edit form
- delete action
- import/export controls

### Step 6.2 Snippet Editor UX

Fields:

- title
- trigger
- description
- body

Useful V1 additions:

- token cheat sheet
- live preview of expansion
- validation messages for duplicate triggers

### Step 6.3 Popup UX

The popup should be intentionally minimal.

Suggested popup features:

- quick search
- list snippets
- button to open full options page

Do not overload popup functionality.

### Step 6.4 Optional In-Page Picker

This is optional in V1.

If included:

- keyboard shortcut opens a small overlay
- user can search snippets
- selecting one inserts into current field

This is useful but not mandatory for initial V1 completion.

## Phase 7: Import and Export

### Step 7.1 JSON Export

Allow exporting all snippets as a JSON file.

Include:

- schema version
- snippet list

### Step 7.2 JSON Import

Import flow:

- user selects file
- validate schema
- preview count
- merge or replace behavior

Recommendation for V1:

- support replace-all first
- merge behavior can be deferred if it complicates conflict handling

## Phase 8: Keyboard Shortcuts and Commands

### Step 8.1 Define Commands

Useful command candidates:

- open popup
- open options page
- trigger snippet search overlay

### Step 8.2 Add Shortcut Documentation

The UI should explain:

- available keyboard shortcuts
- how expansion works
- which fields are supported

## Phase 9: Observability and Debugging

### Step 9.1 Add Development Logging

In development builds, add logging for:

- trigger detection
- token parsing
- insertion attempts
- insertion failures

### Step 9.2 Add Debug Toggle

Optional but useful:

- a local debug flag in extension settings

This can help troubleshoot site-specific issues later.

## Phase 10: Testing Plan

## Unit Tests

Test:

- trigger matching
- token parsing
- token resolution
- cursor placement calculation
- import/export validation

## Manual Browser Tests

Create a test matrix covering:

- plain HTML input
- textarea
- basic contenteditable
- Gmail compose if possible
- a few common web apps

Test scenarios:

- simple static snippet
- snippet with `${date}`
- snippet with `${clipboard}`
- snippet with `${input:name}`
- snippet with `${cursor}`
- duplicate trigger validation
- import/export

## Failure Case Tests

Test:

- unsupported editors
- no clipboard permission
- empty prompt response
- malformed imported JSON
- duplicate trigger collision

## Phase 11: Packaging and Installation

### Step 11.1 Production Build

Produce installable extension output for Developer Mode loading.

### Step 11.2 Chrome Installation Instructions

Document:

1. Open Chrome extensions page
2. Enable Developer Mode
3. Click Load Unpacked
4. Select built extension directory

### Step 11.3 Release Checklist

Before considering V1 complete, confirm:

- install works
- popup loads
- options page loads
- snippets persist
- triggers expand
- tokens resolve
- import/export works

## Suggested Repository Structure

```text
chrome-text-expander/
  public/
    manifest.json
  src/
    background/
      index.ts
    content/
      index.ts
      editorAdapters/
        inputAdapter.ts
        textareaAdapter.ts
        contenteditableAdapter.ts
    core/
      snippetTypes.ts
      triggerMatcher.ts
      templateParser.ts
      tokenResolver.ts
      expansionEngine.ts
    storage/
      snippetStorage.ts
      schema.ts
      migrations.ts
    popup/
      main.tsx
      App.tsx
    options/
      main.tsx
      App.tsx
    shared/
      messaging.ts
      constants.ts
      utils.ts
  tests/
  package.json
  tsconfig.json
  vite.config.ts
```

## Recommended Execution Order

Build in this order:

1. Scaffold extension
2. Implement snippet schema and storage
3. Build options page CRUD UI
4. Implement parser and token resolver
5. Implement trigger matching
6. Add input and textarea expansion
7. Add `${cursor}`
8. Add `${input:name}`
9. Add `${clipboard}`
10. Add basic `contenteditable`
11. Add import/export
12. Add popup and keyboard commands
13. Test across sites
14. Package V1

This order reduces risk because it delivers core functionality early and defers the most brittle editor integration until the engine is stable.

## Key Design Decisions To Preserve

These decisions should carry into the new workspace:

### Decision 1: Local-Only First

Reason:

- faster to build
- no backend
- fewer security concerns
- enough for the intended use case

### Decision 2: Narrow Token Grammar

Reason:

- avoids building a scripting engine
- lowers parser complexity
- easier to test and support

### Decision 3: Support Standard Editors First

Reason:

- most value comes quickly from normal inputs
- rich editors are disproportionately expensive
- lets V1 ship sooner

### Decision 4: Options Page As Main Management Surface

Reason:

- popup space is limited
- snippet editing is better in a full page
- simpler UI architecture

### Decision 5: Simple Prompt For `${input:name}` In V1

Reason:

- fastest path to usable functionality
- avoids building modal infrastructure too early

## Risks and Failure Modes

### Technical Risks

1. Rich text editor incompatibility
2. Caret restoration bugs
3. Clipboard permission edge cases
4. Input event ordering differences across sites
5. Unexpected behavior from synthetic event dispatch

### Product Risks

1. V1 may feel unreliable if tested primarily in complex editors
2. users may expect Text Blaze-level macro depth
3. users may expect cloud sync by default

### Mitigations

- set V1 expectations clearly
- test standard fields first
- isolate adapter logic by editor type
- fail safely when expansion cannot be performed

## Definition of Done

V1 is done when:

- snippets can be created and persisted locally
- typing a trigger expands snippets in standard browser text fields
- `${date}`, `${clipboard}`, `${input:name}`, and `${cursor}` work
- import/export works
- extension installs and runs in Chrome
- limitations are documented clearly

## Recommended First Development Prompt For The New Workspace

Use this in the new development workspace to preserve context:

```text
We are building a Chrome Extension Manifest V3 text expansion tool inspired by Text Blaze, but intentionally scoped to V1 only.

V1 scope:
- local-only storage using chrome.storage.local
- snippet CRUD UI
- trigger-based expansion in browser text fields
- support for input, textarea, and basic contenteditable
- dynamic tokens: ${date}, ${clipboard}, ${input:name}, ${cursor}
- import/export via JSON
- installable locally in Chrome Developer Mode

Non-goals:
- no backend
- no cloud sync
- no collaboration
- no advanced macro scripting
- no Google Docs-level editor support requirement

We want a clean architecture with:
- content script for trigger detection and insertion
- background/service worker for extension coordination
- React popup/options UI
- core parser/resolver engine isolated from DOM logic

Build this incrementally in a production-minded way, prioritizing correctness, reliability in standard fields, and maintainability.
```

## Final Recommendation

This product is absolutely feasible as a V1 Chrome extension.

The correct approach is not to chase full Text Blaze parity. The correct approach is to build a narrower but reliable V1 around:

- local snippets
- strong insertion behavior in normal fields
- a small token system
- a clean extension architecture

That is enough to create a useful browser-based tool without overengineering the first version.