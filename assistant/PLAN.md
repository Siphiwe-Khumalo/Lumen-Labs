# Lumen assistant — build plan (paused, resume Monday)

Status: **scaffold only**. `package.json` / lockfile and `shared/protocol.ts` exist; nothing runs yet.

## What we agreed

- **Name:** Lumen. Voice-first personal assistant ("like Google, but not Google"), techy and premium,
  in the Lumen Labs brand (graphite, amber `#e9b978` accent, steel `#a9c8d8`, Space Grotesk /
  Manrope / JetBrains Mono, sharp corners, hairlines).
- **Inspiration:** a HUD assistant video: glowing ring orb that reacts to voice, top toolbar,
  bottom mic bar, "RESEARCH // ACTIVE" card, and a wall of cards (findings, bar charts, big stats,
  photos) building up live while the orb docks to the corner.
- **Devices:** Windows laptop (Chrome/Edge) + Android phone (Chrome).
- **Installable:** PWA (no .exe, which avoids Windows Application Control blocking an unsigned installer).
- **Hosting:** Render web service (free plan to start, $7 Starter to avoid cold starts), protected by a
  passcode; the Anthropic API key stays server-side only.
- **Modes:** Quick (default, ≤3 searches, ≤3 cards, low effort) and Deep (≤10 searches, 6–12-card
  research wall). Session cost counter in the HUD.

## Architecture

- `server/` — Express (tsx). Dev: Vite middleware. Prod (`--prod`): serves `dist/`.
  - `POST /api/turn` → Server-Sent Events (see `shared/protocol.ts`).
  - Claude loop: `client.beta.messages.stream`, model `claude-opus-5-5` (override with `LUMEN_MODEL`),
    adaptive thinking, `output_config.effort` low/high by mode, `fallbacks: "default"` with beta
    `server-side-fallback-2026-07-01`, top-level `cache_control`, `pause_turn` handling, max ~8 iterations.
  - Tools: `web_search_20260209` (`max_uses` by mode, `user_location` from `LUMEN_HOME_*`),
    `show_card` (kinds stat/chart/list/text/image, zod-validated, `eager_input_streaming`),
    `set_timer`. Cards emitted on each `contentBlock` event so the wall builds live.
  - Sources card built automatically from `web_search_tool_result` blocks.
  - Image cards: model gives a page URL from search results; server resolves `og:image` with an SSRF
    guard (http/https only, DNS check for private ranges, manual redirects, timeout, size cap).
  - Cost estimate per turn from `usage` (Opus 5.5: $4 in / $20 out / $5 cache write / $0.20 cache read
    per MTok; web search $10 per 1,000).
  - Auth: `LUMEN_PASSCODE` (required in prod) → HMAC-signed HttpOnly cookie, login rate limit,
    optional `LUMEN_DAILY_BUDGET_USD`.
  - `--demo` flag: scripted responses so the UI can be previewed without an API key.
- `src/` — React HUD: canvas orb (idle / listening / thinking with tilted 3D rings / speaking),
  top bar (History, Text, Clear View, Quick/Deep, Voice, cost), bottom bar (LVL/PK meter, Mute,
  live transcript), research card, card grid, history drawer, timer cards, passcode screen.
  - Voice in: Web Speech API (`webkitSpeechRecognition`). On Android, skip the getUserMedia meter
    during recognition (mic contention) and animate from recognition events instead.
  - Voice out: `speechSynthesis`, sentence-by-sentence as text streams in; prefer "Natural"/Google voices.
  - Space / tap orb to talk, Esc to cancel; big talk button on mobile.
- `public/` — `manifest.webmanifest`, ring icons (192/512/maskable), minimal service worker
  (app shell only, never `/api`).
- Deploy: add a second service to the root `render.yaml` with `rootDir: assistant`,
  build `npm ci && npm run build`, start `npm start`, env vars `ANTHROPIC_API_KEY`, `LUMEN_PASSCODE`.

## Before Monday

- Create an API key at https://platform.claude.com → Settings → API Keys, and add prepaid credit
  (start with $5–10, auto-reload off). Never paste the key into chat or commit it.
