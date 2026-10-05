# Lumen Labs — Launch Brand Film (Remotion)

A code-driven motion-graphics launch film for Lumen Labs. ~29.5s, 9:16 vertical
(1080×1920 @30fps), built with [Remotion](https://remotion.dev). This is an
**isolated subproject** — it has its own `package.json`, `node_modules`, and
`tsconfig` and never touches the website at the repo root.

Story (six beats + sign-off): **Problem → Technology → Lumen → What we build →
Philosophy → Launch → Founder sign-off.** Design spec: `DESIGN.md`.
Implementation plan: `.agents/tasks/plan.md`.

---

## Prerequisites

`npm` is not on PATH in this environment. Invoke it via its full cli path:

```sh
NPM="/opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js"
node "$NPM" <args>
```

(Resolve the real path on your machine with
`echo "$(dirname "$(command -v node)")/../lib/node_modules/npm/bin/npm-cli.js"`
if it differs. Node 18+ required; built here on v22.)

All commands below are run from this `ad/` directory.

## One-time setup

```sh
# 1. Install the isolated dependencies (Remotion, React, Fontsource, TS tooling)
node "$NPM" install

# 2. Vendor the site's own variable fonts locally (zero-network, metric parity)
node "$NPM" run fonts         # bash scripts/copy-fonts.sh
```

### Assets

The real supplied photographs live in `public/media/` and `public/projects/`,
copied verbatim from the website's `src/assets/media/` and `src/assets/projects/`.
They are used only via crop / pan / zoom / mask / parallax / reveal — never
distorted, warped, recoloured destructively, or regenerated. To refresh them:

```sh
cp ../src/assets/media/*.jpg    public/media/
cp ../src/assets/projects/*.jpg public/projects/
```

## Preview (interactive studio)

```sh
node "$NPM" run studio          # opens Remotion Studio in the browser
```

## Render

```sh
# Delivered 9:16 MP4 → out/lumen-labs-launch-9x16.mp4
node "$NPM" run render

# A single still at any frame (0..884)
node "$NPM" exec -- remotion still LaunchFilm-Vertical out/frames/example.png --frame=354
```

## Checks

```sh
node "$NPM" run typecheck       # tsc --noEmit, strict, zero errors
node "$NPM" test                # vitest — timeline/copy/layout/interpolate/assets
```

Rendered evidence and the exact commands used are recorded in
`out/VERIFICATION.md`.

---

## Project layout

```
ad/
  src/
    Root.tsx            # registers the three <Composition> format entries
    LaunchFilm.tsx      # the <Series> composing Scene01..07 + carry-line + grain
    config/             # ALL data: see below
    lib/                # easing, interpolate helpers, layout, useScene
    components/         # reusable primitives + brand components
    scenes/             # Scene01_Opening .. Scene07_Founder
    __tests__/          # vitest specs for the pure config/lib invariants
  public/               # media/, projects/, fonts/ (served via staticFile)
  out/                  # rendered MP4 + frames + VERIFICATION.md
  scripts/copy-fonts.sh # vendors the WOFF2 from node_modules into public/fonts
```

### Central configuration (`src/config/`)

| File | Owns |
|---|---|
| `formats.ts`    | `FORMATS` presets (vertical/wide/square): dimensions, fps, safe-area fractions, type anchor. `PRIMARY='vertical'`. Validated at load. |
| `brand.ts`      | `COLOR` tokens (verbatim from the site `:root`) + `GRADE` photo-grade tokens. |
| `typography.ts` | Font family names + `typeScale(S)` (sizes relative to the short side). |
| `timeline.ts`   | `FPS`, `TIMELINE` scene frame ranges, `DURATION_IN_FRAMES=885`, `validateTimeline()`. |
| `assets.ts`     | `ASSETS` map (key → file + focal point) + `getAsset()`. |
| `copy.ts`       | EVERY on-screen string, verbatim from the storyboard. Guarded by a snapshot test. |
| `fonts.ts`      | `@font-face` CSS over the vendored WOFF2 via `staticFile()`. |

Timeline (30fps, 885 frames / 29.5s): S01 0–120 · S02 120–240 · S03 240–360 ·
S04 360–630 · S05 630–750 · S06 750–810 · S07 810–885.

### Asset map (key → file → scene)

| key | file | used in |
|---|---|---|
| `studioNight`  | media/studio-night.jpg          | S01 opener |
| `appsCode`     | media/service-applications.jpg  | S02, S04 SOFTWARE |
| `websites`     | media/service-websites.jpg      | S02, S03 outgoing, S04 SOFTWARE inset |
| `servers`      | media/infrastructure-servers.jpg| S04 INFRASTRUCTURE |
| `network`      | media/engineer-network.jpg      | S04 INFRASTRUCTURE inset |
| `datacenter`   | media/datacenter-monitor.jpg    | S04 INFRASTRUCTURE (reserve) |
| `controlPanel` | media/control-panel.jpg         | S05 hero, S04 CONTROL |
| `circuit`      | media/circuit-macro.jpg         | S04 CONTROL inset |
| `itSupport`, `textureNetwork`, `mobileBlank`, `arc`, `ingcebo`, `spartcon` | — | reserve (not in the locked cut) |

---

## Producing 16:9 and 1:1 later (no rebuild)

The composition is config-driven in every dimension, so the other two formats
are already registered and need no code surgery — just render them:

```sh
node "$NPM" exec -- remotion render LaunchFilm-Wide   out/lumen-labs-launch-16x9.mp4
node "$NPM" exec -- remotion render LaunchFilm-Square out/lumen-labs-launch-1x1.mp4
```

How it works (DESIGN §4.2): each composition injects a different `Format` object
(dimensions + safe-area fractions + type anchor). No component hard-codes pixels
— positions come from `lib/layout.ts` (`safeBox`/`anchor`/`col`), type sizes are
a function of the short side, and each image carries a fractional focal point so
crops stay on the subject. Scenes that are composition-sensitive (S05 hero, the
centred lockups) switch layout on `format.id`; motion and timing are shared.

## Notes

- **No audio file** is created or embedded. The timing lands on clean 30fps beat
  points (cuts at 0/120/240/360/630/750/810/885) so an ambient/electronic track can be
  synced later, but none is generated here (DESIGN §8, §12).
- The website root project, its build, and its dependencies are never modified.
- Fonts are the site's own vendored `@fontsource-variable` WOFF2, loaded locally
  with zero network for deterministic, offline renders with metric parity.
