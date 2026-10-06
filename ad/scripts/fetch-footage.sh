#!/usr/bin/env bash
# Download the licensed Mixkit stock footage for the cinematic brand film,
# verify each file is a real non-empty MP4, probe its real duration (frames
# @30fps), and (re)generate public/footage/SOURCES.md. See CINEMATIC-FILM.md §8.
#
# Mixkit Free License: commercial use, NO attribution, keyless.
#   footage URL pattern: https://assets.mixkit.co/videos/<id>/<id>-1080.mp4
#
# Network: OPEN_INTERNET. Safe to re-run (overwrites). Download-only; it never
# touches the render. On any failure it aborts naming the id + URL so the
# operator can swap in a reserve id.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="public/footage"
FPS=30
mkdir -p "$DEST"

# id -> local filename -> Mixkit title. Clips used in the cut (CINEMATIC-FILM.md §8).
# Format: "<id>|<local-name>|<title>|<used-in>"
# NOTE: id 914 ("Open office space") was CONTENT-SWAPPED out of the film01 1.2
# slot during the FEAT-002 verification gate — its footage is a BUSY, fully
# populated office, which contradicts the storyboard's "open office before anyone
# arrives / empty desks, cold light" beat. It is replaced by id 1781 (a quiet
# lone-desk macro) renamed to quiet-desk-dawn.mp4. See public/footage/SOURCES.md.
CUT=(
  "8739|struggle-worried|Worried and sad woman, outdoors|film01 1.1 (HERO)"
  "1781|quiet-desk-dawn|Working on a laptop (quiet lone desk)|film01 1.2 (HERO, swapped in for 914)"
  "221|office-glasses-reflection|Reflection of a screen in glasses|film02 2.1"
  "308|laptop-work|Man working on his laptop|film02 2.2"
  "918|office-busy|Busy office space|film02b 2b.1"
  "4840|rooftop-sunset|Woman during a sunset on a rooftop|film02b 2b.2 (HERO)"
  "4809|meeting-collab|Business people at work meeting|film03 3.1"
  "30012|handshake|Pair of hands shaking hands|film03 3.2"
  "29991|engineer-workshop|Young engineer programming in his workshop|film03 3.3"
  "1728|dev-code|Software developer working on code, screen close up|film05 5.1"
  "1735|dev-topview|A developer typing on a laptop, top view|film05 5.2"
  "41642|multiscreen|Professional programmer working on a big computer|film06 6.1"
  "49878|city-aerial-night|Big city at night from an aerial shot|film06 6.2"
  "41637|ops-twoscreen|Programmer working with codes on a computer|film07 7.1"
  "4831|park-sunrise|View of a park while a girl runs across|film08 8.1"
)

# Reserves (CINEMATIC-FILM.md §8) — downloaded so a swap needs no re-fetch.
# Format: "<id>|<local-name>|<note>"
RESERVES=(
  "1808|reserve-1808-close-typing|close typing"
  "41640|reserve-41640-hands-programming|hands programming"
  "41654|reserve-41654-code-on-screen|code on screen"
  "1781|reserve-1781-laptop-close|laptop close"
  "242|reserve-242-typing-laptop|typing on a laptop"
  "4915|reserve-4915-hands-phone|hands typing on a phone"
  "49845|reserve-49845-aerial-city|aerial city variant"
  "49846|reserve-49846-aerial-city|aerial city variant"
)

LICENSE_URL="https://mixkit.co/license/"
LICENSE_TEXT="Mixkit Free License — commercial use, no attribution"

download_and_verify() {
  local id="$1" name="$2"
  local url="https://assets.mixkit.co/videos/${id}/${id}-1080.mp4"
  local out="${DEST}/${name}.mp4"
  echo ">> fetch id=${id} -> ${out}"
  curl -fL --retry 3 --connect-timeout 30 -o "$out" "$url" || {
    echo "FATAL: download failed for id=${id} url=${url}" >&2; exit 1; }
  # Non-empty check.
  if [ ! -s "$out" ]; then
    echo "FATAL: 0-byte file for id=${id} url=${url}" >&2; exit 1
  fi
  # MP4 magic-bytes check: bytes 4..7 must be 'ftyp'. Reject HTML error pages.
  local magic
  magic="$(dd if="$out" bs=1 skip=4 count=4 2>/dev/null || true)"
  if [ "$magic" != "ftyp" ]; then
    echo "FATAL: not an MP4 (missing 'ftyp' box) for id=${id} url=${url}" >&2
    head -c 120 "$out" >&2; echo >&2
    exit 1
  fi
}

# Probe real duration in frames @FPS using @remotion/media-parser (fallback: bundled ffprobe).
probe_frames() {
  local file="$1"
  node scripts/probe-duration.mjs "$file" "$FPS" 2>/dev/null || echo "?"
}

# --- download everything (skip with --sources-only to just rebuild SOURCES.md) ---
if [ "${1:-}" != "--sources-only" ]; then
  for row in "${CUT[@]}"; do
    IFS='|' read -r id name _title _used <<<"$row"
    download_and_verify "$id" "$name"
  done
  for row in "${RESERVES[@]}"; do
    IFS='|' read -r id name _note <<<"$row"
    download_and_verify "$id" "$name"
  done
fi

# --- write SOURCES.md (regenerated, never hand-edited) ---
SRC="${DEST}/SOURCES.md"
{
  echo "# Footage sources — Lumen Labs cinematic brand film"
  echo
  echo "All clips are **Mixkit** 1080p MP4 under the **${LICENSE_TEXT}**."
  echo "License: <${LICENSE_URL}>"
  echo
  echo "URL pattern: \`https://assets.mixkit.co/videos/<id>/<id>-1080.mp4\`"
  echo
  echo "Regenerate with \`scripts/fetch-footage.sh\`. Durations are probed at"
  echo "fetch time (frames @${FPS}fps) and consumed by \`src/config/footage.ts\`."
  echo
  echo "## Clips used in the cut"
  echo
  echo "| id | local file | Mixkit title | used in | durationInFrames @${FPS} |"
  echo "|---|---|---|---|---|"
  for row in "${CUT[@]}"; do
    IFS='|' read -r id name title used <<<"$row"
    frames="$(probe_frames "${DEST}/${name}.mp4")"
    echo "| ${id} | \`${name}.mp4\` | ${title} | ${used} | ${frames} |"
  done
  echo
  echo "## Reserves (downloaded for swap-in without re-fetch)"
  echo
  echo "| id | local file | note | durationInFrames @${FPS} |"
  echo "|---|---|---|---|"
  for row in "${RESERVES[@]}"; do
    IFS='|' read -r id name note <<<"$row"
    frames="$(probe_frames "${DEST}/${name}.mp4")"
    echo "| ${id} | \`${name}.mp4\` | ${note} | ${frames} |"
  done
  echo
  echo "## Content-verification swaps (FEAT-002 gate)"
  echo
  echo "- **film01 1.2 — id 914 (\"Open office space\") SWAPPED OUT → id 1781"
  echo "  (\`quiet-desk-dawn.mp4\`).** The 914 footage is a *busy, fully populated*"
  echo "  open-plan office across its whole runtime (eyeballed at t=0.2s/5s/10s/18s),"
  echo "  which contradicts the storyboard's \"open office before anyone arrives /"
  echo "  empty desks, cold light; the realities waiting\" beat. 1781 is a quiet,"
  echo "  lone-desk laptop macro that reads cold/isolated for that hero beat and does"
  echo "  not duplicate the wider 308 \"man working on his laptop\" shot. 914 was"
  echo "  removed from the committed set (not a listed reserve)."
  echo "- The other three hero clips — 8739 (worried owner), 4840 (low-point"
  echo "  silhouette), 4831 (warm resolution) — were eyeballed and KEPT as-is."
  echo
  echo "> No AI-generated / synthetic footage is used. Mixkit id 99786"
  echo "> (\"Animation of futuristic devices\") was deliberately rejected as too"
  echo "> close to the forbidden \"generic futuristic tech imagery\"."
} > "$SRC"

echo
echo "Done. $(ls "${DEST}"/*.mp4 | wc -l) MP4s in ${DEST}/; provenance in ${SRC}."
echo "Next: run scripts/grab-stills.sh (or step 3) to content-verify, then eyeball ${DEST}/_contact/."
