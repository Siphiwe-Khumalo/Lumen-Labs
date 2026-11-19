#!/usr/bin/env bash
# Video automation with ffmpeg.
#   video.sh web     <in.mp4> <out-dir>        -> hero-ready MP4 (H.264) + WebM, muted, 1080p, poster frame
#   video.sh vertical <in.mp4> <out.mp4>       -> 1080x1920 centre crop for TikTok / Reels / Shorts
#   video.sh gif     <in.mp4> <out.gif> [w=640] -> high-quality palette GIF
#   video.sh frames  <in.mp4> <out-dir> [fps=1] -> PNG frames for storyboards
set -euo pipefail
cmd="${1:-}"; shift || true
case "$cmd" in
  web)
    in="$1"; out="$2"; mkdir -p "$out"; n="$(basename "${in%.*}")"
    ffmpeg -y -i "$in" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart "$out/$n.mp4"
    ffmpeg -y -i "$in" -an -vf "scale='min(1920,iw)':-2" -c:v libvpx-vp9 -crf 34 -b:v 0 "$out/$n.webm"
    ffmpeg -y -i "$in" -vf "select=eq(n\,0)" -frames:v 1 -q:v 3 "$out/$n-poster.jpg" ;;
  vertical)
    ffmpeg -y -i "$1" -vf "crop='min(iw,ih*9/16)':ih,scale=1080:1920" -c:v libx264 -crf 20 -c:a aac -movflags +faststart "$2" ;;
  gif)
    w="${3:-640}"
    ffmpeg -y -i "$1" -vf "fps=15,scale=$w:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" "$2" ;;
  frames)
    mkdir -p "$2"; ffmpeg -y -i "$1" -vf "fps=${3:-1}" "$2/frame-%04d.png" ;;
  *) sed -n '2,6p' "$0"; exit 1 ;;
esac
