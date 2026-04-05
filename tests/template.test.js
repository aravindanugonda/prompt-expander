import test from "node:test";
import assert from "node:assert/strict";

import { parseTemplate, resolveTemplate } from "../src/shared/template.js";

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
