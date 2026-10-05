#!/usr/bin/env bash
# Vendor the site's own variable WOFF2 fonts into public/fonts/ so the render
# is deterministic and offline (metric parity with the live site). See DESIGN §5.5.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="node_modules/@fontsource-variable"
DEST="public/fonts"
mkdir -p "$DEST"

for family in space-grotesk manrope jetbrains-mono; do
  file="${family}-latin-wght-normal.woff2"
  src="${SRC}/${family}/files/${file}"
  if [[ ! -f "$src" ]]; then
    echo "ERROR: missing font file: $src" >&2
    echo "Run the isolated install first (see README)." >&2
    exit 1
  fi
  cp "$src" "${DEST}/${file}"
  echo "copied ${file}"
done

echo "Fonts vendored into ${DEST}/"
