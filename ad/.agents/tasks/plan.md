# Implementation Plan — Lumen Labs Launch Film (Remotion)

Builds the 9:16 1080×1920 @30fps, 810-frame brand film specified in
`/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/DESIGN.md`. The design is
approved and LOCKED: do not re-decide stack, layout, timing, colour, copy, or
easing — sequence and implement it faithfully.

## Ground rules (read before starting)

- **All paths below are absolute.** The isolated subproject root is
  `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad` (referred to as `AD/`
  only inside command snippets via a shell variable; every path in prose is
  written out in full).
- **npm is NOT on PATH.** Invoke it as:
  `node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js <args>`
  (verified: `node -v` = v22.23.3; `npm view remotion version` = 4.0.533 over this path).
  For brevity each verify step writes this as `NPM` — expand it to the full path.
- **Never touch the website root** `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/package.json`,
  its `package-lock.json`, `node_modules/`, or Vite build. The film is fully
  self-contained under `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad`.
- **Decision — font sourcing (grounds a design assumption).** DESIGN §5.5 says to
  copy vendored WOFF2 from the site's `node_modules/@fontsource-variable/*`. That
  directory does NOT exist in this worktree (there is no root `node_modules`).
  Resolution, chosen to keep `ad/` self-contained and preserve the metric parity
  §5.5 requires: add `@fontsource-variable/space-grotesk`, `-/manrope`, and
  `-/jetbrains-mono` as `ad/`'s OWN dependencies, then copy the WOFF2 out of
  `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/node_modules/@fontsource-variable/*/files/`.
  Verified the exact file names present in those packages:
  `space-grotesk-latin-wght-normal.woff2`, `manrope-latin-wght-normal.woff2`,
  `jetbrains-mono-latin-wght-normal.woff2` (latin subset — sufficient for the
  all-Latin copy). These are the same variable WOFF2 the site ships, so metrics match.
- **Copy is frozen.** Every on-screen string comes from DESIGN §7 verbatim. Do NOT
  invent copy, stats, clients, dates, or locations. `config/copy.ts` is the only
  source of strings and is guarded by a snapshot test (item 11).
- Each item must leave `ad/` in a typechecking state. Order is by dependency.
- Do NOT create or embed any audio file (DESIGN §8, §12).

---

- [ ] 1. Scaffold the isolated Remotion subproject skeleton (dirs, tsconfig, remotion.config, gitignore, entry files) WITHOUT installing yet.
      Create the directory tree from DESIGN §3 and the TypeScript/Remotion config.
      `tsconfig.json` mirrors `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/tsconfig.app.json`
      (target ES2022, lib ES2022+DOM, strict, jsx react-jsx, moduleResolution Bundler,
      noEmit) but `include: ["src"]` and WITHOUT `noUnusedLocals`/`noUnusedParameters`
      relaxed only if Remotion templates need it — keep strict on. `remotion.config.ts`
      sets H.264 codec, image format jpeg, and overwrite true. `.gitignore` lists
      `node_modules/` and `out/`. Create `src/index.ts` (`registerRoot(RemotionRoot)`)
      and a minimal placeholder `src/Root.tsx` exporting `RemotionRoot` with no
      compositions yet (filled in item 10).
      Files to create:
        - `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/tsconfig.json`
        - `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/remotion.config.ts`
        - `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/.gitignore`
        - `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/src/index.ts`
        - `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/src/Root.tsx` (placeholder)
        - empty dirs: `ad/public/media`, `ad/public/projects`, `ad/public/fonts`, `ad/out`,
          `ad/src/config`, `ad/src/lib`, `ad/src/components`, `ad/src/scenes`
      Verify: `ls -R /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/src` shows the
      directory tree; the root website `package.json` is unchanged
      (`cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film && git status --short package.json`
      prints nothing).

- [ ] 2. Create `ad/package.json` and install dependencies (Remotion + React + Fontsource + TS tooling) into the isolated subproject.
      Author `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/package.json`
      (name `lumen-labs-launch-film`, private, type module) with dependencies
      `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer`,
      `react`, `react-dom`, `@fontsource-variable/space-grotesk`,
      `@fontsource-variable/manrope`, `@fontsource-variable/jetbrains-mono`; devDeps
      `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `vitest`.
      Pin all four `remotion`/`@remotion/*` to the SAME version (latest stable
      4.0.533 — they must match). Scripts:
        - `"studio": "remotion studio"` (preview),
        - `"still": "remotion still"`,
        - `"render": "remotion render LaunchFilm-Vertical out/lumen-labs-launch-9x16.mp4"`,
        - `"typecheck": "tsc --noEmit"`,
        - `"test": "vitest run"`,
        - `"fonts": "bash scripts/copy-fonts.sh"` (script authored in item 3).
      Then install, running from inside `ad/`:
      `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM install`.
      Files: `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/package.json`
      (+ generated `ad/package-lock.json`, `ad/node_modules/`).
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM ls remotion react @fontsource-variable/space-grotesk`
      resolves all without "missing"; and the website root lockfile is untouched
      (`cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film && git status --short package.json package-lock.json` prints nothing).

- [ ] 3. Vendor the fonts: write the copy-fonts script and run it to populate `ad/public/fonts/`.
      Create `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/scripts/copy-fonts.sh`
      that copies the three latin variable WOFF2 from
      `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/node_modules/@fontsource-variable/<family>/files/<family>-latin-wght-normal.woff2`
      into `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/public/fonts/`
      (families: `space-grotesk`, `manrope`, `jetbrains-mono`). Use `set -euo pipefail`
      and `cd "$(dirname "$0")/.."` so it resolves relative to `ad/`. Then run it:
      `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && bash scripts/copy-fonts.sh`.
      Files: `ad/scripts/copy-fonts.sh` (+ three copied WOFF2 in `ad/public/fonts/`).
      Verify: `ls /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/public/fonts/`
      lists `space-grotesk-latin-wght-normal.woff2`, `manrope-latin-wght-normal.woff2`,
      `jetbrains-mono-latin-wght-normal.woff2`.

- [ ] 4. Copy the real supplied photographs into the subproject's `public/`.
      Copy from `/projects/sandbox/Lumen-Labs/src/assets/media/` into
      `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/public/media/` the files
      used by the asset map (DESIGN §6.2): `studio-night.jpg`, `service-applications.jpg`,
      `service-websites.jpg`, `infrastructure-servers.jpg`, `engineer-network.jpg`,
      `datacenter-monitor.jpg`, `control-panel.jpg`, `it-support.jpg`, `circuit-macro.jpg`,
      `texture-network.jpg`, `mobile-blank.jpg`. Also copy the three reserve project
      images from `/projects/sandbox/Lumen-Labs/src/assets/projects/`
      (`arc-glasshouse-reference.jpg`, `ingcebo-reference.jpg`, `spartcon-reference.jpg`)
      into `.../ad/public/projects/`. Copy, do not symlink. Do NOT modify, recolour,
      or regenerate any image.
      Files: the copied `.jpg` files under `ad/public/media/` and `ad/public/projects/`.
      Verify: `ls /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/public/media | wc -l`
      prints `11` and `ls .../ad/public/projects | wc -l` prints `3`; spot-check that
      `studio-night.jpg` and `control-panel.jpg` are present and non-zero size.

- [ ] 5. Create the central config modules: formats, brand (colours + GRADE), typography, timeline, assets, copy.
      Implement DESIGN §4.1, §5.1, §5.2, §6.2, §7 as pure data/TS:
        - `config/formats.ts` — `FormatId` union, `Format` interface, `FORMATS` record
          (vertical/wide/square exactly as §4.1), `PRIMARY='vertical'`; validate at module
          load that dims are integers > 0, fps === 30, and no `safe` fraction ≥ 0.5
          (throw `RangeError` otherwise — DESIGN §10).
        - `config/brand.ts` — `COLOR` object VERBATIM from §5.1 (ink #06080a … hairline2),
          plus the named `GRADE` tokens (`filter`, `scrim`, `duotoneAmber`, `duotoneSteel`)
          from §5.1/§6.3. All `as const`.
        - `config/typography.ts` — family name constants (Space Grotesk / Manrope /
          JetBrains Mono) and `typeScale(S)` returning hero/display/title/body/list/mono
          exactly as §5.2.
        - `config/timeline.ts` — `FPS=30`, `TIMELINE` (s01..s06 ranges from §7),
          `DURATION_IN_FRAMES=810`, and `validateTimeline()` asserting the ranges are
          contiguous, non-overlapping, and sum to 810 (throw with the mismatch — §10);
          call it once at module load.
        - `config/assets.ts` — an `AssetKey` union + `ASSETS` map (key → { file path under
          `public/`, focusX, focusY }) exactly per §6.2; a loader/getter that throws
          `Error("Unknown asset key: X")` on a bad key and clamps/throws if focal ∉ [0,1].
        - `config/copy.ts` — EVERY on-screen string, verbatim from §7, with explicit `\n`
          line breaks: `s01`, `s02`, `s03Wordmark='LUMEN LABS'`,
          `s03Sub='A South African technology studio.'`, `s04.software/.infrastructure/.control`
          (titles + list arrays), `s05a='Small enough to care.'`,
          `s05b='Technical enough to build.'`, `s06Tagline='Built with intention.'`,
          `s06Meta=['LUMEN LABS','SOUTH AFRICAN TECHNOLOGY STUDIO']`. No other strings.
      Files: `ad/src/config/{formats,brand,typography,timeline,assets,copy}.ts`.
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0 (no TS errors).

- [ ] 6. Create `config/fonts.ts` and the shared libs: easing, interpolate helpers, layout, useScene.
      - `config/fonts.ts` — export the three family names and build the `@font-face`
        CSS string(s) whose `src` is `staticFile('fonts/<file>.woff2')`, `font-display: block`,
        `font-weight: 100 900` (variable). Export a helper to inject them (used by Root in
        item 10 together with `delayRender`/`continueRender` gated on `document.fonts.ready`).
      - `lib/easing.ts` — `EASE` (base/out/inOut/outExpo with the exact beziers from §8,
        `outExpo = Easing.bezier(0.19,1,0.22,1)`) and `SPRING` (settle/mark from §8).
      - `lib/interpolate.ts` — `clip()` (interpolate wrapper that always clamps both ends),
        `ranged()`, `tracking()`, `kenBurns()` (stays within max scale delta 0.06–0.08 — §8).
      - `lib/layout.ts` — `safeBox(format)`, `anchor(format,{ax,ay})`, `col(format,n,of)`
        from §4.2; `safeBox` throws `RangeError` on inverted box.
      - `lib/useScene.ts` — hook returning local 0..1 progress + local frame within a Sequence.
      Files: `ad/src/config/fonts.ts`, `ad/src/lib/{easing,interpolate,layout,useScene}.ts`.
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0.

- [ ] 7. Build the reusable primitive components: AnimatedText, LineReveal, GridOverlay, ImageReveal, ImageParallax, Grain.
      Implement per the contracts in DESIGN §9, reading colours/type from config and
      `Format` from a `FormatContext` (define that context here or in `lib/layout.ts`):
        - `AnimatedText` (clipRise / trackIn / both; per-line clip-mask containers; stagger).
        - `LineReveal` (single hairline draw-on; default `COLOR.hairline`, amber only when
          explicitly passed — enforces the amber-discipline ownership rule from §10).
        - `GridOverlay` (N faint vertical drafting rules via LineReveal at safe-box columns).
        - `ImageReveal` (the ONLY component that transforms an `<img>`: uniform scale-to-cover
          using the asset focal point + translate + mask wipeLR/RL/TB/bandCenter; applies
          `GRADE.filter` + two-layer scrim; NO skew/stretch API — enforces no-distortion §10).
        - `ImageParallax` (wraps ImageReveal, adds `rate` drift).
        - `Grain` (subtle static-noise overlay ~4–6% opacity, `mix-blend-mode: overlay`,
          deterministic — cheap procedural SVG `feTurbulence` or a tiny tiled PNG in `public/`).
      Files: `ad/src/components/{AnimatedText,LineReveal,GridOverlay,ImageReveal,ImageParallax,Grain}.tsx`.
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0.

- [ ] 8. Build the brand + composition components: BrandMark, LogoReveal, SectionTitle, CapabilityCard, SceneTransition.
      - `BrandMark` — vector-exact reproduction of `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/src/components/brand/Logo.tsx`
        (viewBox 0 0 28 28, rounded rect stroke @0.2 opacity, the L path
        `M8 7h3.1v10.9H20V21H8V7Z` filled `COLOR.text`, the amber bar
        `M14.4 7H20v3.1h-5.6V7Z` filled `COLOR.accent`). Exact paths/radii — no distortion.
      - `LogoReveal` — DESIGN §5.3 reveal (rect stroke-draw via dash offset, L clip-mask
        bottom→top, amber bar clip-wipe left→right LAST); `speed:'born'|'fast'`,
        optional `withWordmark` rendering `LUMEN LABS` uppercase, Space Grotesk weight 500,
        track-in `0.2em`→`-0.03em` (born) / settled `-0.03em` (fast), gap-2.5 spacing.
      - `SectionTitle` — mono index ("01") + Space Grotesk title + optional one-tick accent.
      - `CapabilityCard` — mono tick + Manrope label; `active` drives the single amber/steel
        tick; clip-rise entrance.
      - `SceneTransition` — the single always-on amber carry-line layer driven by the GLOBAL
        frame with keyframes pinned to boundary frames 120/240/360/630/750 (DESIGN §7.7).
      Files: `ad/src/components/{BrandMark,LogoReveal,SectionTitle,CapabilityCard,SceneTransition}.tsx`.
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0.

- [ ] 9. Build the six scene components (Scene01..Scene06) per the storyboard timing.
      Implement each scene exactly as DESIGN §7.1–§7.6, composing only the reusable
      components fed by config; no giant inline component, no hard-coded pixels (positions
      via `lib/layout.ts`), no hard-coded copy (from `config/copy.ts`). Key specifics:
        - `Scene01_Opening` — ink→`studioNight` bandCenter reveal + Ken-Burns push-in,
          two-line clipRise+trackIn headline, foreshadow amber tick at f100.
        - `Scene02_Idea` — `appsCode` then parallax `websites`, two-line headline, single
          amber underline under "build".
        - `Scene03_Lumen` — graphite field, `LogoReveal speed='born' withWordmark`, Manrope sub-line.
        - `Scene04_Build` — ONE 270f component with `useScene` sub-ranges beatA[0,90)/beatB[90,180)/
          beatC[180,270) (NOT a nested Series), persistent baseline hairline, hard cuts; SOFTWARE /
          INFRASTRUCTURE (steel tick allowed on datacenter) / CONTROL+SECURITY (5 items, 7f stagger).
        - `Scene05_Philosophy` — `controlPanel` hero clip-mask reveal + slow Ken-Burns, two
          philosophy lines with the amber seam-line between them, per-format layout `switch(format.id)`.
        - `Scene06_Launch` — graphite, `LogoReveal speed='fast'`, tagline, mono title-block
          from `copy.s06Meta`, single amber node, settled 12f hold, no fade to black.
      Files: `ad/src/scenes/Scene0{1..6}_*.tsx`.
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0.

- [ ] 10. Compose the film (`LaunchFilm.tsx`) and register compositions in `Root.tsx`.
      - `LaunchFilm.tsx` — a Remotion `<Series>` with six contiguous `Series.Sequence`
        members (durations from `TIMELINE`: 120/120/120/270/120/60 = 810), plus the
        always-on `SceneTransition` carry-line layer mounted above the scenes and `Grain`
        on top. Takes the active `Format` via `FormatContext`.
      - `Root.tsx` — inject the `@font-face` CSS from `config/fonts.ts`, gate first paint on
        `document.fonts.ready` with `delayRender()`/`continueRender()`, and register THREE
        `<Composition>` entries all rendering `<LaunchFilm/>`: `LaunchFilm-Vertical`
        (1080×1920), `LaunchFilm-Wide` (1920×1080), `LaunchFilm-Square` (1080×1080), each
        fps 30, `durationInFrames` 810, differing only in the injected `Format`
        (dimensions read from `useVideoConfig()`; no hard-coded pixels). Vertical is the
        delivered render; the other two are registered but not rendered (DESIGN §4.2, §12).
      Files: `ad/src/LaunchFilm.tsx`, `ad/src/Root.tsx` (replaces the item-1 placeholder).
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0; and
      `node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js exec -- remotion compositions`
      (run from `ad/`) lists `LaunchFilm-Vertical`, `LaunchFilm-Wide`, `LaunchFilm-Square`.

- [ ] 11. Add the unit tests for the pure config/lib invariants (Vitest).
      Per DESIGN §11: `validateTimeline()` (contiguous, non-overlapping, sums to 810);
      `copy.ts` snapshot asserting the exact storyboard strings INCLUDING
      `s06Meta=['LUMEN LABS','SOUTH AFRICAN TECHNOLOGY STUDIO']` and `s03Wordmark='LUMEN LABS'`
      (guards against invented copy/stats/clients); `lib/layout.ts` (safeBox/anchor/col return
      expected px per format); `lib/interpolate.ts` (`clip()` clamps; `kenBurns()` within max
      scale); `config/assets.ts` (every `AssetKey` maps to a file; focal points in [0,1]).
      Files: `ad/src/__tests__/*.test.ts` (or colocated `*.test.ts`).
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM test`
      — all tests pass.

- [ ] 12. Full typecheck/build gate on the whole subproject.
      Confirm the entire `src` tree typechecks with zero errors in strict mode after all
      components and scenes exist.
      Files: none (verification only).
      Verify: `cd /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad && NPM run typecheck`
      exits 0 with no output; `NPM test` still green.

- [ ] 13. Render representative stills for EVERY scene into `ad/out/frames/`.
      Using `remotion still` on `LaunchFilm-Vertical`, render one frame per scene at a
      representative timestamp (frames chosen inside each scene's range from §7):
      S01 f44, S02 f180, S03 f300, S04 beats f405/f495/f585, S05 f690, S06 f805 (final
      thumbnail). Run each from `ad/`, e.g.
      `node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js exec -- remotion still LaunchFilm-Vertical out/frames/s01-f44.png --frame=44`
      (repeat for each listed frame/scene). These validate fonts load (no network),
      assets resolve, and each scene composes.
      Files: PNGs under `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/out/frames/`.
      Verify: `ls /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/out/frames/`
      lists a non-zero PNG for every scene (at least 8 files incl. all three S04 beats and
      the f805 thumbnail); open the thumbnail and confirm mark + wordmark + tagline render
      with the correct fonts and a single amber node (no missing-glyph boxes).

- [ ] 14. Render the delivered 9:16 MP4.
      Render the full vertical composition to the delivery path. Depends on items 10 and 13
      (compositions registered; stills prove the timeline composes). Run from `ad/`:
      `node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js run render`
      (which runs `remotion render LaunchFilm-Vertical out/lumen-labs-launch-9x16.mp4`).
      If Remotion needs its Chromium headless shell, allow it to download/install on first
      run (system render libs libnss3/libgbm/libatk/libasound are present — verified). If the
      MP4 render cannot complete in this environment, record the exact command and error in
      `ad/README.md` and treat the per-scene stills (item 13) as the rendered-proof fallback;
      the stills already demonstrate the full composition renders frame-accurately.
      Files: `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/out/lumen-labs-launch-9x16.mp4`.
      Verify: the MP4 exists and is non-zero
      (`ls -la /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/out/lumen-labs-launch-9x16.mp4`);
      if feasible, `node ... remotion versions` / ffprobe (if available) reports ~27s / 810
      frames / 1080×1920. On documented failure, the README fallback note is present instead.

- [ ] 15. Write `ad/README.md`.
      Document, with the full npm-cli path (npm not on PATH): one-time install
      (`NPM install`), font vendoring (`NPM run fonts`), asset copy note, studio preview
      (`NPM run studio`), still render, and MP4 render (`NPM run render`). List config
      locations (`src/config/*` — what each owns), the asset map (keys → files → scenes),
      and HOW to produce 16:9 and 1:1 later (render `LaunchFilm-Wide` / `LaunchFilm-Square`
      — already registered; one `Format` preset drives dimensions/safe-area, no rebuild —
      DESIGN §4.2). Note that no audio file is created (timing only allows later sync) and
      that the website root project is never modified.
      Files: `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/README.md`.
      Verify: `cat /projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/README.md` shows
      the install/preview/render commands (with the full node npm-cli path), config
      locations, asset map, and the 16:9 / 1:1 instructions.

---

## Notes & assumptions

- **Font source divergence (item 3):** the design's cited source
  (`site node_modules/@fontsource-variable`) is absent in this worktree; sourcing the
  identical WOFF2 from `ad/`'s own installed `@fontsource-variable` packages satisfies
  §5.5's metric-parity and no-network requirements and keeps `ad/` self-contained.
- **Remotion version:** pin all `remotion` + `@remotion/*` packages to the same latest
  stable (4.0.533 at planning time); mismatched Remotion package versions fail at runtime.
- **MP4 render environment risk (item 14):** Chromium render libs are present, but if a
  headless-shell download or render is blocked in the execution environment, the per-scene
  stills (item 13) stand as the rendered proof and the exact failing command is recorded in
  the README — a documented, honest fallback, not silent omission.
- **No workflow restructuring:** this build is one tightly-coupled Remotion project (single
  config system, shared component library, one `<Series>`); every scene depends on the same
  config and components, so it does not decompose into independent features. The existing
  implement-and-review loop runs this plan; its stop contract (reviewer writes
  `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/.agents/tasks/review.json` with
  `verdict: APPROVED`) is preserved.
