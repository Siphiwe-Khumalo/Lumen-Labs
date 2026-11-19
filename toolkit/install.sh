#!/usr/bin/env bash
# Lumen Labs creative + dev toolkit installer.
# Run on YOUR machine (macOS or Debian/Ubuntu Linux, incl. WSL):
#   bash toolkit/install.sh            # everything
#   bash toolkit/install.sh web        # only one group
# Groups: core web design media ai editor
# Safe to re-run: anything already installed is skipped.
set -euo pipefail

if [[ $# -gt 0 ]]; then SEL=("$@"); else SEL=(core web design media ai editor); fi
HERE="$(cd "$(dirname "$0")" && pwd)"

say() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
has() { command -v "$1" >/dev/null 2>&1; }
want() { [[ " ${SEL[*]} " == *" $1 "* ]]; }

OS="$(uname -s)"
if [[ "$OS" == "Darwin" ]]; then
  PM=brew
  has brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
elif has apt-get; then
  PM=apt
  SUDO=""; [[ $EUID -ne 0 ]] && SUDO=sudo
  $SUDO apt-get update -y
else
  echo "Unsupported OS: use macOS (Homebrew) or Debian/Ubuntu (apt)." >&2; exit 1
fi

pkg() { # pkg <brew-name> <apt-name>
  if [[ $PM == brew ]]; then brew list "$1" >/dev/null 2>&1 || brew install "$1" || echo "  (skipped $1)"
  elif [[ -n "${2:-}" ]]; then $SUDO apt-get install -y "$2" || echo "  (skipped $2)"; fi
}
cask() { if [[ $PM == brew ]]; then brew list --cask "$1" >/dev/null 2>&1 || brew install --cask "$1" || echo "  (skipped $1)"; fi; }
npmg() { for p in "$@"; do npm ls -g --depth=0 "$p" >/dev/null 2>&1 || npm install -g "$p"; done; }
pipx_i() { for p in "$@"; do pipx list 2>/dev/null | grep -q "package $p " || pipx install "$p"; done; }

if want core; then
  say "Core: git, node, python, CLI essentials"
  pkg git git; pkg gh gh; pkg jq jq; pkg ripgrep ripgrep; pkg fzf fzf; pkg wget wget
  pkg python@3.12 python3; pkg pipx pipx
  if ! has fnm; then
    if [[ $PM == brew ]]; then brew install fnm; else curl -fsSL https://fnm.vercel.app/install | bash; fi
    export PATH="$HOME/.local/share/fnm:$PATH"; eval "$(fnm env)"
  fi
  has node || { fnm install --lts && fnm default lts-latest; }
  corepack enable || true
  npmg pnpm
fi

if want web; then
  say "Web dev: frameworks, deploy CLIs, quality tools"
  npmg typescript vite create-vite prettier eslint serve npm-check-updates \
       vercel netlify-cli wrangler @playwright/test lighthouse
  npx --yes playwright install chromium || true
  pkg docker docker.io
fi

if want design; then
  say "Design: vector, raster, fonts, SVG + image tooling"
  pkg imagemagick imagemagick; pkg librsvg librsvg2-bin; pkg webp webp
  pkg potrace potrace; pkg exiftool libimage-exiftool-perl; pkg oxipng ""
  cask figma; cask inkscape; cask gimp; cask blender; cask krita
  [[ $PM == apt ]] && $SUDO apt-get install -y inkscape gimp krita blender || true
  npmg svgo sharp-cli @squoosh/cli
  pipx_i fonttools
fi

if want media; then
  say "Media: video, audio, motion"
  pkg ffmpeg ffmpeg; pkg yt-dlp yt-dlp
  cask obs; cask handbrake; cask davinci-resolve
  [[ $PM == apt ]] && $SUDO apt-get install -y obs-studio handbrake-cli || true
  npmg @remotion/cli
fi

if want ai; then
  say "AI: Claude Code + SDKs"
  npmg @anthropic-ai/claude-code @anthropic-ai/sdk
  pipx_i anthropic || true
fi

if want editor; then
  say "Editor: VS Code / Cursor extensions"
  cask visual-studio-code
  for code in code cursor; do
    has "$code" || continue
    grep -vE '^\s*(#|$)' "$HERE/editor/extensions.txt" | while read -r ext; do
      "$code" --install-extension "$ext" --force >/dev/null && echo "  $code: $ext"
    done
  done
  has code || echo "VS Code CLI 'code' not on PATH. In VS Code: Cmd/Ctrl+Shift+P > 'Shell Command: Install code command', then re-run: bash toolkit/install.sh editor"
fi

say "Done. Run: bash toolkit/scripts/doctor.sh to verify."
