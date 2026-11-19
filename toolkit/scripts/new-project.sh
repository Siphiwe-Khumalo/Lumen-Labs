#!/usr/bin/env bash
# Scaffold a new project with the same stack as Lumen Labs.
#   new-project.sh <name> [react|vanilla|astro|next]
set -euo pipefail
name="${1:?usage: new-project.sh <name> [react|vanilla|astro|next]}"; kind="${2:-react}"
case "$kind" in
  react)   npm create vite@latest "$name" -- --template react-ts
           cd "$name" && npm install && npm install -D tailwindcss @tailwindcss/vite prettier ;;
  vanilla) npm create vite@latest "$name" -- --template vanilla-ts && cd "$name" && npm install ;;
  astro)   npm create astro@latest "$name" -- --template minimal --install --no-git --yes && cd "$name" ;;
  next)    npx create-next-app@latest "$name" --ts --tailwind --eslint --app --use-npm --yes && cd "$name" ;;
  *) echo "unknown kind: $kind"; exit 1 ;;
esac
git init -q 2>/dev/null || true
echo "Ready: cd $name && npm run dev"
