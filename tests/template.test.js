import test from "node:test";
import assert from "node:assert/strict";

import {
  parseTemplate,
  resolveTemplate,
  collectInputLabels,
  hasPageToken
} from "../src/shared/template.js";

test("parseTemplate keeps text and known tokens in order", () => {
  const nodes = parseTemplate("Hello ${input:name} ${date}${cursor}");

  assert.deepEqual(nodes, [
    { type: "text", value: "Hello " },
    { type: "input", label: "name" },
    { type: "text", value: " " },
    { type: "date" },
    { type: "cursor" }
  ]);
});

test("resolveTemplate returns resolved text and cursor offset", async () => {
  const result = await resolveTemplate("A${input:name}B${cursor}C${date}", {
    prompt: async () => "daffy",
    formatDate: () => "2026-04-05"
  });

  assert.equal(result.text, "AdaffyBC2026-04-05");
  assert.equal(result.cursorOffset, 7);
});

test("parseTemplate recognizes known page-context fields", () => {
  const nodes = parseTemplate("${page:url} ${page:title} ${page:domain} ${page:selection}");

  assert.deepEqual(
    nodes.filter((node) => node.type === "page"),
    [
      { type: "page", field: "url" },
      { type: "page", field: "title" },
      { type: "page", field: "domain" },
      { type: "page", field: "selection" }
    ]
  );
});

test("parseTemplate leaves unknown page fields as literal text", () => {
  const nodes = parseTemplate("before ${page:cookies} after");

  assert.deepEqual(nodes, [
    { type: "text", value: "before " },
    { type: "text", value: "${page:cookies}" },
    { type: "text", value: " after" }
  ]);
});

test("resolveTemplate pulls page-context values from the page provider", async () => {
  const result = await resolveTemplate("On ${page:domain}: ${page:selection}", {
    page: (field) =>
      ({ domain: "example.com", selection: "highlighted words" }[field] ?? "")
  });

  assert.equal(result.text, "On example.com: highlighted words");
});

test("resolveTemplate swallows a failing page provider", async () => {
  const result = await resolveTemplate("x${page:selection}y", {
    page: () => {
      throw new Error("blocked");
    }
  });

  assert.equal(result.text, "xy");
});

test("resolveTemplate prefers a pre-collected input values map over prompting", async () => {
  let prompted = false;
  const result = await resolveTemplate("Hi ${input:name}, ${input:name}!", {
    inputValues: { name: "Ada" },
    prompt: async () => {
      prompted = true;
      return "SHOULD NOT BE USED";
    }
  });

  assert.equal(result.text, "Hi Ada, Ada!");
  assert.equal(prompted, false);
});

test("collectInputLabels returns distinct labels in first-seen order", () => {
  assert.deepEqual(
    collectInputLabels("${input:language} then ${input:focus} then ${input:language}"),
    ["language", "focus"]
  );
});

test("hasPageToken detects page-context usage", () => {
  assert.equal(hasPageToken("just ${input:x} and ${date}"), false);
  assert.equal(hasPageToken("uses ${page:url}"), true);
});
