#!/usr/bin/env bash
# Generate the 16 narration voice-over lines for the cinematic brand film with
# edge-tts, writing an MP3 + a WebVTT (word/line timing) per line into
# public/audio/vo/. See CINEMATIC-FILM.md §6.
#
# Voice: en-US-AndrewMultilingualNeural (fallback en-US-BrianNeural), tuned
# calm: --rate=-8% --pitch=-2Hz. edge-tts is NOT on the bare PATH — it is called
# by absolute path (/root/.local/bin/edge-tts); override with EDGE_TTS=.
#
# The generated MP3s + VTTs are COMMITTED so the render never needs network/pip.
# This script is only for REGENERATING when a narration line changes.
#
# After generation it parses each VTT's last-cue end time into durationInFrames
# @30fps and writes public/audio/vo/measured-durations.json for FEAT-003's
# narration.ts (the MEASURED, not estimated, durations).
set -euo pipefail
cd "$(dirname "$0")/.."

EDGE="${EDGE_TTS:-/root/.local/bin/edge-tts}"
VOICE="${VO_VOICE:-en-US-AndrewMultilingualNeural}"
RATE="-8%"
PITCH="-2Hz"
FPS=30
OUT="public/audio/vo"
mkdir -p "$OUT"

# 1) ensure the tool exists; install into --user if absent, then re-check.
if [ ! -x "$EDGE" ] && ! command -v edge-tts >/dev/null 2>&1; then
  echo ">> edge-tts not found; attempting pip --user install" >&2
  python3 -m pip install --user edge-tts
fi
if [ ! -x "$EDGE" ]; then
  EDGE="$(command -v edge-tts)" || { echo "FATAL: edge-tts not installed"; exit 1; }
fi

# 2) validate the chosen voice actually exists (hard-fail otherwise).
#    Capture the full list first so a `grep -q` early-exit can't SIGPIPE edge-tts
#    under `set -o pipefail`.
VOICE_LIST="$("$EDGE" --list-voices 2>/dev/null || true)"
if ! printf '%s\n' "$VOICE_LIST" | grep -q "$VOICE"; then
  echo "FATAL: voice $VOICE unavailable (fallback: en-US-BrianNeural)"; exit 1
fi

# 3) the 16 narration lines (ids + text), matching CINEMATIC-FILM.md §6.
#    vo13/vo15/vo16 are the VERBATIM copy.ts strings; vo14 is the one new line.
#    Format: "<id>|<text>"
LINES=(
  "vo01|A business doesn't fail in one big moment."
  "vo02|It's the small things. The tools that don't fit."
  "vo03|The systems that don't talk. The hours that disappear."
  "vo04|You're working harder than ever — and still watching chances slip past."
  "vo05|There has to be a better way."
  "vo06|Then they found a partner who started with the problem — not a product."
  "vo07|Someone small enough to listen. Technical enough to build."
  "vo08|And slowly, the pieces started to fit."
  "vo09|Software and systems, built around how the business actually works."
  "vo10|Infrastructure, networks, the cloud — quietly doing their job."
  "vo11|Secured. Connected. Under control."
  "vo12|The weight lifts. And the vision has room to grow."
  "vo13|Built with intention."
  "vo14|Your business has a vision. We build what brings it to life."
  "vo15|Small enough to care."
  "vo16|Technical enough to build."
)

echo ">> voice=$VOICE rate=$RATE pitch=$PITCH edge=$EDGE"
for row in "${LINES[@]}"; do
  IFS='|' read -r id text <<<"$row"
  if [ -z "$text" ]; then
    echo "FATAL: empty narration text for $id" >&2; exit 1
  fi
  echo ">> $id: $text"
  "$EDGE" --voice "$VOICE" --rate="$RATE" --pitch="$PITCH" \
    --text "$text" \
    --write-media "${OUT}/${id}.mp3" \
    --write-subtitles "${OUT}/${id}.vtt" || {
      echo "FATAL: edge-tts failed on $id" >&2; exit 1; }
  [ -s "${OUT}/${id}.mp3" ] || { echo "FATAL: empty MP3 for $id" >&2; exit 1; }
  [ -s "${OUT}/${id}.vtt" ] || { echo "FATAL: empty VTT for $id" >&2; exit 1; }
done

# 4) parse each VTT last-cue end time -> durationInFrames @FPS; write JSON.
echo ">> measuring durations from VTTs"
node scripts/measure-vo.mjs "$OUT" "$FPS" > "${OUT}/measured-durations.json"
echo ">> wrote ${OUT}/measured-durations.json"
cat "${OUT}/measured-durations.json"

echo
echo "Done. 16 VO MP3s + VTTs in ${OUT}/. Commit them (render needs no network/pip)."
