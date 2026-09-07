import { build } from "esbuild";
import { rm } from "node:fs/promises";

// The content script is declared in manifest.json, so it cannot use ESM
// `import` at runtime. We bundle it (and its `src/shared/*` dependencies) into
// a single self-contained IIFE that Chrome can load directly. Everything else
// (popup, options, background) runs as a module page/worker and loads from
// `src/` unchanged.

await rm("dist/content.js", { force: true });
await rm("dist/content.js.map", { force: true });

await build({
  entryPoints: ["src/content/index.js"],
  outfile: "dist/content.js",
  bundle: true,
  format: "iife",
  target: ["chrome100"],
  legalComments: "none",
  logLevel: "info"
});

console.log("Built dist/content.js");
