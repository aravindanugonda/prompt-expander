#!/usr/bin/env bash
# Builds the Chrome Web Store upload zip in dist/ at the repo root.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

version=$(node -pe "require('./manifest.json').version")
out_dir="dist"
out_zip="$out_dir/prompt-expander-$version.zip"

mkdir -p "$out_dir"
rm -f "$out_zip"

# Build the bundled content script that manifest.json points at.
node build.js

zip -r "$out_zip" \
  manifest.json \
  public \
  src \
  packs \
  dist/content.js \
  -x "*.DS_Store" "src/content/index.js"

echo "Created $out_zip"
