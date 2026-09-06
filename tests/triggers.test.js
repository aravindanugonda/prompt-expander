import test from "node:test";
import assert from "node:assert/strict";

import { findMatchingSnippet } from "../src/shared/triggers.js";

test("findMatchingSnippet prefers the longest matching trigger", () => {
  const snippets = [
    { trigger: ">_use" },
    { trigger: ">_use-analyzer-prompt" },
    { trigger: ">_follow-up" }
  ];

  const match = findMatchingSnippet("hello >_use-analyzer-prompt", snippets);
  assert.equal(match?.trigger, ">_use-analyzer-prompt");
});
