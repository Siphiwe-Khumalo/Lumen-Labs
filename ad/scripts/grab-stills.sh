#!/usr/bin/env bash
# Content-verification contact sheet (CINEMATIC-FILM.md §8, build step 3).
# Grab one representative still per downloaded clip into public/footage/_contact/
# so a human can eyeball that each clip's CONTENT matches its storyboard role
# (a 206/200 only proves the file exists, not that it fits the beat).
#
# Uses the bundled ffmpeg (no system ffmpeg required). A still is pulled ~1.0s in
# to avoid any black leader frame. The four copy-bearing hero clips (8739, 914,
# 4840, 4831) must be looked at explicitly.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="public/footage"
OUT="${SRC}/_contact"
FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
mkdir -p "$OUT"

[ -x "$FFMPEG" ] || { echo "FATAL: bundled ffmpeg not found at $FFMPEG" >&2; exit 1; }

shopt -s nullglob
count=0
for mp4 in "$SRC"/*.mp4; do
  base="$(basename "$mp4" .mp4)"
  png="${OUT}/${base}.jpg"
  # Seek ~1s in, grab one frame, scale to a contact-sheet-friendly width.
  "$FFMPEG" -y -loglevel error -ss 1.0 -i "$mp4" -frames:v 1 \
    -vf "scale=640:-2" "$png" 2>/dev/null || {
      # Retry at t=0 for very short clips.
      "$FFMPEG" -y -loglevel error -i "$mp4" -frames:v 1 \
        -vf "scale=640:-2" "$png"; }
  echo "still: ${png}"
  count=$((count + 1))
done

echo
echo "Grabbed ${count} stills into ${OUT}/."
echo "Eyeball the four HERO clips explicitly: struggle-worried, office-open, rooftop-sunset, park-sunrise."
