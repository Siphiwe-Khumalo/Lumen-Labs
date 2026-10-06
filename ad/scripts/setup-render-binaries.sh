#!/usr/bin/env bash
# setup-render-binaries.sh — provision a Remotion compositor that runs on hosts
# with glibc < 2.35.
#
# WHY: Remotion 4.0.533 ships a prebuilt Linux x64 "gnu" compositor binary that
# requires GLIBC_2.35 (it pulls symbols from libm.so.6 @ GLIBC_2.35). Some build
# hosts (e.g. Amazon Linux 2023) ship glibc 2.34, so the stock compositor aborts
# with: `libm.so.6: version 'GLIBC_2.35' not found`. The bundled "musl"
# compositor is not a drop-in either (its libav*.so expect a musl userland).
#
# FIX: run the UNMODIFIED gnu compositor under a locally-fetched glibc-2.35
# dynamic loader (from Ubuntu 22.04's libc6), while keeping the native gnu
# ffmpeg/ffprobe (which run fine on 2.34). We assemble a single
# "binaries directory" that Remotion is pointed at via `--binaries-directory`:
#   - ffmpeg, ffprobe, libav*.so, etc.: copied verbatim from the gnu compositor
#   - remotion: a tiny wrapper that execs the real gnu compositor through the
#     glibc-2.35 loader with an explicit --library-path.
#
# This changes NO application code and NO Remotion internals; it only chooses a
# newer libc at launch time. On a host that already has glibc >= 2.35 the plain
# `remotion render` works without this and this script is unnecessary.
#
# Idempotent: safe to re-run. Output dir is under node_modules (gitignored).
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"           # ad/
REMOTION_DIR="$HERE/node_modules/@remotion"
GNU="$REMOTION_DIR/compositor-linux-x64-gnu"
MERGE="$REMOTION_DIR/.remotion-bin"                 # the assembled binaries dir
GLIBC_DIR="$HERE/node_modules/.glibc-2.35"          # fetched loader + libs

GLIBC_DEB_URL="http://archive.ubuntu.com/ubuntu/pool/main/g/glibc/libc6_2.35-0ubuntu3_amd64.deb"

if [ ! -d "$GNU" ]; then
  echo "FATAL: $GNU not found — run 'npm install' first." >&2
  exit 1
fi

# If the host glibc already satisfies the compositor, nothing to do.
if "$GNU/remotion" >/dev/null 2>&1 || [ "$("$GNU/remotion" 2>&1 | head -c 1)" = "{" ]; then
  echo "Host compositor runs natively; no glibc shim needed." >&2
fi

# 1) Fetch and extract the glibc-2.35 runtime (loader + libc/libm) once.
LOADER="$GLIBC_DIR/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"
if [ ! -x "$LOADER" ]; then
  echo "Fetching glibc 2.35 runtime for the compositor shim..." >&2
  rm -rf "$GLIBC_DIR"
  mkdir -p "$GLIBC_DIR"
  tmp_deb="$GLIBC_DIR/libc6.deb"
  curl -fL --retry 3 -o "$tmp_deb" "$GLIBC_DEB_URL"
  ( cd "$GLIBC_DIR" && ar x "$tmp_deb" )
  command -v zstd >/dev/null 2>&1 || { echo "FATAL: zstd required to unpack the .deb" >&2; exit 1; }
  zstd -d -c "$GLIBC_DIR/data.tar.zst" | tar -x -C "$GLIBC_DIR"
  [ -x "$LOADER" ] || { echo "FATAL: glibc loader not found after extract" >&2; exit 1; }
fi
GLIBC_LIB="$GLIBC_DIR/lib/x86_64-linux-gnu"

# 2) Assemble the merged binaries dir: everything from gnu, with the compositor
#    replaced by a loader-shim wrapper.
rm -rf "$MERGE"
cp -a "$GNU" "$MERGE"
rm -f "$MERGE/remotion"
cat > "$MERGE/remotion" <<EOF
#!/bin/sh
# Run the stock gnu compositor under the fetched glibc-2.35 loader.
exec "$GLIBC_LIB/ld-linux-x86-64.so.2" \\
  --library-path "$GLIBC_LIB:$GNU:/lib64:/usr/lib64" \\
  "$GNU/remotion" "\$@"
EOF
chmod +x "$MERGE/remotion"

# 3) Smoke-test all three binaries launch.
"$MERGE/remotion" >/dev/null 2>&1 || [ "$("$MERGE/remotion" 2>&1 | head -c 1)" = "{" ] \
  || { echo "FATAL: shimmed compositor failed to launch" >&2; exit 1; }
"$MERGE/ffmpeg" -version >/dev/null 2>&1  || { echo "FATAL: ffmpeg failed" >&2; exit 1; }
"$MERGE/ffprobe" -version >/dev/null 2>&1 || { echo "FATAL: ffprobe failed" >&2; exit 1; }

echo "$MERGE"
