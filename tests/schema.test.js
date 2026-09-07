import test from "node:test";
import assert from "node:assert/strict";

import { normalizeSnippet, validateSnippet } from "../src/shared/schema.js";

test("normalizeSnippet keeps a well-formed inputs array", () => {
  const snippet = normalizeSnippet({
    title: "Review",
    trigger: ">_review",
    body: "Review ${input:language}",
    inputs: [
      { name: "language", type: "select", options: ["Java", " Python ", ""] }
    ]
  });

  assert.deepEqual(snippet.inputs, [
    { name: "language", label: "", type: "select", options: ["Java", "Python"], default: "" }
  ]);
});

test("normalizeSnippet drops nameless inputs and defaults an unknown type to text", () => {
  const snippet = normalizeSnippet({
    title: "x",
    trigger: ">_x",
    body: "b",
    inputs: [{ name: "", type: "select" }, { name: "focus", type: "weird" }]
  });

  assert.deepEqual(snippet.inputs, [
    { name: "focus", label: "", type: "text", options: [], default: "" }
  ]);
});

test("normalizeSnippet gives a legacy snippet an empty inputs array", () => {
  const snippet = normalizeSnippet({ title: "x", trigger: ">_x", body: "b" });
  assert.deepEqual(snippet.inputs, []);
});

test("validateSnippet flags duplicate input names and empty dropdowns", () => {
  const errors = validateSnippet({
    id: "a",
    title: "x",
    trigger: ">_x",
    body: "b",
    inputs: [
      { name: "lang", type: "text", options: [] },
      { name: "lang", type: "text", options: [] },
      { name: "mode", type: "select", options: [] }
    ]
  });

  assert.ok(errors.some((message) => message.includes("defined more than once")));
  assert.ok(errors.some((message) => message.includes("no options")));
});
