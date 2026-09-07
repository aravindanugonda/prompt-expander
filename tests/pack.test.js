import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { mergeSnippets, readPackSnippets } from "../src/shared/storage.js";
import { normalizeSnippet, validateSnippet } from "../src/shared/schema.js";

const existing = [
  normalizeSnippet({ id: "1", title: "Debug", trigger: ">_debug", body: "old body" })
];

function pack(...triggers) {
  return triggers.map((trigger) =>
    normalizeSnippet({ title: trigger, trigger, body: `body for ${trigger}` })
  );
}

test("readPackSnippets accepts a bare array, a store object, and rejects junk", () => {
  assert.equal(readPackSnippets([{ trigger: ">_a", body: "x" }]).length, 1);
  assert.equal(readPackSnippets({ snippets: [{ trigger: ">_a", body: "x" }] }).length, 1);
  assert.equal(readPackSnippets([{ trigger: "", body: "x" }]).length, 0);
  assert.throws(() => readPackSnippets({ nope: true }));
});

test("mergeSnippets adds non-colliding snippets", () => {
  const { snippets, summary } = mergeSnippets(existing, pack(">_new", ">_other"));
  assert.equal(snippets.length, 3);
  assert.deepEqual(
    { added: summary.added, skipped: summary.skipped },
    { added: 2, skipped: 0 }
  );
});

test("mergeSnippets skips duplicate triggers by default", () => {
  const { snippets, summary } = mergeSnippets(existing, pack(">_debug", ">_new"));
  assert.equal(snippets.length, 2);
  assert.equal(summary.skipped, 1);
  assert.equal(summary.added, 1);
  assert.equal(snippets[0].body, "old body", "existing snippet is untouched");
});

test("mergeSnippets replace overwrites the body but keeps id + createdAt", () => {
  const { snippets, summary } = mergeSnippets(existing, pack(">_debug"), "replace");
  assert.equal(snippets.length, 1);
  assert.equal(summary.replaced, 1);
  assert.equal(snippets[0].id, "1");
  assert.equal(snippets[0].body, "body for >_debug");
  assert.equal(snippets[0].createdAt, existing[0].createdAt);
});

test("mergeSnippets rename keeps both under a suffixed trigger", () => {
  const { snippets, summary } = mergeSnippets(existing, pack(">_debug"), "rename");
  assert.equal(snippets.length, 2);
  assert.equal(summary.renamed, 1);
  assert.equal(snippets[1].trigger, ">_debug-2");
});

test("the sample code-review pack does not collide with the starter snippets", async () => {
  const { DEFAULT_SNIPPETS } = await import("../src/shared/defaultSnippets.js");
  const starterTriggers = new Set(
    DEFAULT_SNIPPETS.map((snippet) => snippet.trigger.toLowerCase())
  );
  const raw = JSON.parse(
    await readFile(new URL("../packs/code-review.json", import.meta.url), "utf8")
  );

  const overlap = readPackSnippets(raw)
    .map((snippet) => snippet.trigger)
    .filter((trigger) => starterTriggers.has(trigger.toLowerCase()));

  assert.deepEqual(overlap, [], "sample pack should install cleanly on a fresh set");
});

for (const file of ["code-review.json", "prompt-library.json"]) {
  test(`bundled pack ${file} is valid and installs cleanly`, async () => {
    const raw = JSON.parse(
      await readFile(new URL(`../packs/${file}`, import.meta.url), "utf8")
    );
    const snippets = readPackSnippets(raw);

    assert.ok(snippets.length >= 3);
    for (const snippet of snippets) {
      assert.deepEqual(
        validateSnippet(snippet, snippets),
        [],
        `${snippet.trigger} in ${file} should be valid`
      );
      assert.doesNotMatch(
        snippet.body,
        /\[INSERT|\[PASTE HERE\]/i,
        `${snippet.trigger} in ${file} must not use a bracketed fill-in marker`
      );
    }

    const { summary } = mergeSnippets([], snippets);
    assert.equal(summary.added, snippets.length);
  });
}
