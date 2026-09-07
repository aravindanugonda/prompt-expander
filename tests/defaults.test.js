import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_SNIPPETS } from "../src/shared/defaultSnippets.js";
import { normalizeSnippet, validateSnippet } from "../src/shared/schema.js";
import { collectInputLabels } from "../src/shared/template.js";

const normalized = DEFAULT_SNIPPETS.map(normalizeSnippet);

test("the starter set stays small", () => {
  assert.ok(
    DEFAULT_SNIPPETS.length > 0 && DEFAULT_SNIPPETS.length <= 20,
    `expected 1-20 starter snippets, got ${DEFAULT_SNIPPETS.length}`
  );
});

test("every starter snippet is valid", () => {
  for (const snippet of normalized) {
    assert.deepEqual(
      validateSnippet(snippet, normalized),
      [],
      `${snippet.trigger} should be valid`
    );
  }
});

test("every starter body ends the caret in one obvious place and has no buried placeholder", () => {
  for (const snippet of normalized) {
    assert.match(
      snippet.body,
      /\$\{cursor\}/,
      `${snippet.trigger} must include \${cursor}`
    );
    assert.doesNotMatch(
      snippet.body,
      /\[INSERT|\[PASTE HERE\]/i,
      `${snippet.trigger} must not use a bracketed fill-in marker`
    );
  }
});

test("declared inputs correspond to ${input:...} tokens actually used in the body", () => {
  for (const snippet of normalized) {
    const used = new Set(collectInputLabels(snippet.body));
    for (const input of snippet.inputs) {
      assert.ok(
        used.has(input.name),
        `${snippet.trigger} declares input "${input.name}" that its body never uses`
      );
    }
  }
});

test("the starter set demonstrates each dynamic token at least once", () => {
  const allBodies = normalized.map((snippet) => snippet.body).join("\n");
  for (const token of ["${date}", "${clipboard}", "${cursor}", "${input:", "${page:"]) {
    assert.ok(allBodies.includes(token), `no starter snippet demonstrates ${token}`);
  }
});
