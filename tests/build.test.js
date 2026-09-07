import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// `npm test` runs `build.js` first (see the "pretest" script), so the bundle
// the browser actually loads is rebuilt and checked on every test run.
test("content bundle is built and self-contained", async () => {
  const code = await readFile(new URL("../dist/content.js", import.meta.url), "utf8");

  assert.ok(code.length > 0, "dist/content.js should not be empty");
  assert.doesNotMatch(code, /^\s*import\s/m, "bundle must not contain ESM imports");
  assert.doesNotMatch(code, /^\s*export\s/m, "bundle must not contain ESM exports");
});

test("content bundle inlines the shared template + trigger logic", async () => {
  const code = await readFile(new URL("../dist/content.js", import.meta.url), "utf8");

  assert.match(code, /parseTemplate/, "shared template parser should be bundled in");
  assert.match(code, /endsWith/, "shared trigger matcher should be bundled in");
});
