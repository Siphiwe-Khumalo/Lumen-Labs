#!/usr/bin/env bash
# Fetch and cut the exact brand fonts the wallpaper is traced from.
# Space Grotesk + Manrope are variable fonts; we instance them to the static
# weights the live site uses so advance-width metrics are correct. Requires
# curl and Python 3 with fonttools (pip install fonttools).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p fonts
cd fonts

dl() { curl -fsSL "$1" -o "$2" && echo "OK  $2"; }

echo "Downloading source fonts..."
dl "https://raw.githubusercontent.com/floriankarsten/space-grotesk/master/fonts/ttf/SpaceGrotesk%5Bwght%5D.ttf" SpaceGrotesk-VF.ttf
dl "https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf" Manrope-VF.ttf
dl "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Regular.ttf" JetBrainsMono-Regular.ttf
dl "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Medium.ttf" JetBrainsMono-Medium.ttf

echo "Instancing variable fonts to static weights (needs fonttools)..."
inst() { python3 -m fontTools.varLib.instancer "$1" "wght=$2" -o "$3" >/dev/null && echo "OK  $3 (wght $2)"; }
inst SpaceGrotesk-VF.ttf 600 SpaceGrotesk-SemiBold.ttf
inst SpaceGrotesk-VF.ttf 500 SpaceGrotesk-Medium500.ttf
inst Manrope-VF.ttf 500 Manrope-Medium.ttf

echo "Fonts ready."
