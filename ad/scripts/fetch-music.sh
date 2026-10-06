#!/usr/bin/env bash
# Download the two licensed Mixkit music tracks for the cinematic brand film and
# (re)generate public/audio/music/SOURCES.md. See CINEMATIC-FILM.md §7.
#
# Mixkit Free Stock Music: commercial use, NO attribution, keyless.
#   music URL pattern: https://assets.mixkit.co/music/<id>/<id>.mp3
#
# Track A (tension bed)  = id 18  -> track-a-tension.mp3  (Act 1)
# Track B (hopeful)      = id 158 -> track-b-hope.mp3     (Act 2-3)
# Backups: 168 (A alt), 187 (B alt) — only fetched if --backups is passed.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="public/audio/music"
mkdir -p "$DEST"

LICENSE_URL="https://mixkit.co/license/"
LICENSE_TEXT="Mixkit Free Stock Music — no attribution"

# "<id>|<local-name>|<role>|<source page>"
TRACKS=(
  "18|track-a-tension|Track A — tension bed (Act 1)|https://mixkit.co/free-stock-music/sad/"
  "158|track-b-hope|Track B — hopeful / uplifting (Act 2-3)|https://mixkit.co/free-stock-music/uplifting/"
)
BACKUPS=(
  "168|backup-168-dramatic|Backup for Track A (dramatic)|https://mixkit.co/free-stock-music/dramatic/"
  "187|backup-187-uplifting|Backup for Track B (uplifting)|https://mixkit.co/free-stock-music/uplifting/"
)

WANT_BACKUPS=0
[ "${1:-}" = "--backups" ] && WANT_BACKUPS=1

download_and_verify() {
  local id="$1" name="$2"
  local url="https://assets.mixkit.co/music/${id}/${id}.mp3"
  local out="${DEST}/${name}.mp3"
  echo ">> fetch music id=${id} -> ${out}"
  curl -fL --retry 3 --connect-timeout 30 -o "$out" "$url" || {
    echo "FATAL: music download failed id=${id} url=${url}" >&2; exit 1; }
  if [ ! -s "$out" ]; then
    echo "FATAL: 0-byte music file id=${id} url=${url}" >&2; exit 1
  fi
  # MP3 magic: ID3 tag ('ID3') or an MPEG audio frame sync (0xFF 0xFB/0xF3/0xF2).
  local b0 b1 head3
  head3="$(dd if="$out" bs=1 count=3 2>/dev/null || true)"
  b0="$(od -An -tx1 -N1 "$out" | tr -d ' ')"
  b1="$(od -An -tx1 -j1 -N1 "$out" | tr -d ' ')"
  if [ "$head3" != "ID3" ] && [ "$b0" != "ff" ]; then
    echo "FATAL: not an MP3 (no ID3 / frame sync) id=${id} url=${url}" >&2
    head -c 120 "$out" >&2; echo >&2
    exit 1
  fi
}

for row in "${TRACKS[@]}"; do
  IFS='|' read -r id name _role _page <<<"$row"
  download_and_verify "$id" "$name"
done
if [ "$WANT_BACKUPS" = "1" ]; then
  for row in "${BACKUPS[@]}"; do
    IFS='|' read -r id name _role _page <<<"$row"
    download_and_verify "$id" "$name"
  done
fi

SRC="${DEST}/SOURCES.md"
{
  echo "# Music sources — Lumen Labs cinematic brand film"
  echo
  echo "Both tracks are **Mixkit Free Stock Music** (${LICENSE_TEXT})."
  echo "License: <${LICENSE_URL}>"
  echo
  echo "URL pattern: \`https://assets.mixkit.co/music/<id>/<id>.mp3\`"
  echo
  echo "Regenerate with \`scripts/fetch-music.sh\` (\`--backups\` to also fetch the alternates)."
  echo
  echo "| id | local file | role | source page |"
  echo "|---|---|---|---|"
  for row in "${TRACKS[@]}"; do
    IFS='|' read -r id name role page <<<"$row"
    echo "| ${id} | \`${name}.mp3\` | ${role} | <${page}> |"
  done
  echo
  echo "## Backups (not committed unless A/B are a poor fit by ear)"
  echo
  echo "| id | local file | role | source page |"
  echo "|---|---|---|---|"
  for row in "${BACKUPS[@]}"; do
    IFS='|' read -r id name role page <<<"$row"
    echo "| ${id} | \`${name}.mp3\` | ${role} | <${page}> |"
  done
  echo
  echo "The A->B cross-fade (shift) happens at frame 1140; see \`src/config/filmMusic.ts\`."
} > "$SRC"

echo
echo "Done. Music in ${DEST}/; provenance in ${SRC}."
