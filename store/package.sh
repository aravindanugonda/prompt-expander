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

zip -r "$out_zip" \
  manifest.json \
  public \
  src \
  -x "*.DS_Store"

echo "Created $out_zip"
