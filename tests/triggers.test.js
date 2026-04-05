import test from "node:test";
import assert from "node:assert/strict";

import { findMatchingSnippet } from "../src/shared/triggers.js";

test("findMatchingSnippet prefers the longest matching trigger", () => {
  const snippets = [
    { trigger: "?use" },
    { trigger: "?use-analyzer-prompt" },
    { trigger: "?follow-up" }
  ];

  const match = findMatchingSnippet("hello ?use-analyzer-prompt", snippets);
  assert.equal(match?.trigger, "?use-analyzer-prompt");
});
