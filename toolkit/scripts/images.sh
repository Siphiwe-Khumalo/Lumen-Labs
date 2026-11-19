#!/usr/bin/env bash
# Batch image automation. Needs ImageMagick 7 (magick) + cwebp.
#   images.sh web   <in-dir> <out-dir> [max-width=1920]   -> resized WebP + AVIF + JPG
#   images.sh social <image> <out-dir>                    -> 1080x1080, 1080x1350, 1080x1920, 1200x630, 1500x500
#   images.sh favicon <square-image-or-svg> <out-dir>     -> favicon.ico, PNG sizes, apple-touch-icon
#   images.sh strip <in-dir>                              -> remove EXIF/GPS metadata in place
set -euo pipefail
IM=magick; command -v magick >/dev/null || IM=convert
cmd="${1:-}"; shift || true

case "$cmd" in
  web)
    in="$1"; out="$2"; w="${3:-1920}"; mkdir -p "$out"
    find "$in" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.tif*' -o -iname '*.heic' \) | while read -r f; do
      n="$(basename "${f%.*}")"
      $IM "$f" -auto-orient -strip -resize "${w}x>" -quality 82 "$out/$n.jpg"
      $IM "$out/$n.jpg" -quality 78 "$out/$n.webp"
      $IM "$out/$n.jpg" -quality 55 "$out/$n.avif" 2>/dev/null || true
      echo "  $n"
    done ;;
  social)
    src="$1"; out="$2"; mkdir -p "$out"; n="$(basename "${src%.*}")"
    for s in 1080x1080:square 1080x1350:portrait 1080x1920:story 1200x630:og 1500x500:banner; do
      $IM "$src" -auto-orient -resize "${s%%:*}^" -gravity center -extent "${s%%:*}" -quality 88 "$out/$n-${s##*:}.jpg"
      echo "  $n-${s##*:}.jpg (${s%%:*})"
    done ;;
  favicon)
    src="$1"; out="$2"; mkdir -p "$out"
    for s in 16 32 48 192 512; do $IM -background none "$src" -resize ${s}x${s} "$out/icon-$s.png"; done
    $IM -background none "$src" -resize 180x180 "$out/apple-touch-icon.png"
    $IM "$out/icon-16.png" "$out/icon-32.png" "$out/icon-48.png" "$out/favicon.ico"
    echo "  favicon set written to $out" ;;
  strip)
    find "$1" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -exec $IM mogrify -strip {} \; 2>/dev/null \
      || find "$1" -type f \( -iname '*.jpg' -o -iname '*.png' \) -exec mogrify -strip {} \;
    echo "  metadata stripped" ;;
  *) sed -n '2,7p' "$0"; exit 1 ;;
esac
