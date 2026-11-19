#!/usr/bin/env bash
# Prints which toolkit tools are installed and their versions.
tools=(git gh node pnpm python3 jq rg vite tsc prettier eslint vercel netlify wrangler
       magick rsvg-convert cwebp svgo potrace exiftool ffmpeg yt-dlp inkscape gimp blender claude code)
ok=0; miss=0
for t in "${tools[@]}"; do
  if command -v "$t" >/dev/null 2>&1; then
    v="$("$t" --version 2>/dev/null | head -n1 | cut -c1-60)"
    printf '  \033[32m✓\033[0m %-14s %s\n' "$t" "$v"; ok=$((ok+1))
  else
    printf '  \033[31m✗\033[0m %-14s missing\n' "$t"; miss=$((miss+1))
  fi
done
echo; echo "$ok installed, $miss missing"
