#!/usr/bin/env bash
# Convert raw screenshots into Chrome Web Store format:
#   1280x800, 24-bit PNG, no alpha, letterboxed on the app background colour.
#
# Usage:
#   ./store/screenshots/resize.sh raw-popup.png raw-options.png
#
# Output files are written next to this script as 01-*.png, 02-*.png, ...
# Keep the raw captures under store/screenshots/source/ for future re-crops.
set -euo pipefail

# App background (see src/styles/global.css --bg). Update if the palette changes.
BG="#eef3fb"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -eq 0 ]; then
  echo "Pass one or more raw screenshot files." >&2
  exit 1
fi

i=1
for src in "$@"; do
  base=$(basename "${src%.*}")
  out=$(printf '%s/%02d-%s.png' "$script_dir" "$i" "$base")
  convert "$src" \
    -resize 1280x800 \
    -background "$BG" -gravity center -extent 1280x800 \
    -alpha remove -alpha off -strip \
    "PNG24:$out"
  identify -format "%f  %wx%h  %[bit-depth]-bit/chan  alpha=%A\n" "$out"
  i=$((i + 1))
done
