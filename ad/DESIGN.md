# Lumen Labs — Launch Brand Film · DESIGN

Design blueprint for a code-driven motion-graphics launch film. This document is
the locked aesthetic + architectural specification. A coder should be able to
implement it directly without re-deciding stack, layout, timing, colour, copy,
easing, or error behaviour.

Status: **revision pass 1** — revised against `ad/.agents/tasks/design-review.md`
(verdict CHANGES_REQUESTED, 6 MEDIUM + 3 NIT). Every finding is resolved; see
§14 "Review responses" for the point-by-point disposition.

---

## 1. Overview

Lumen Labs is a South African technology studio — "small enough to care,
technical enough to build," built with intention. This film is a ~27-second,
9:16 vertical brand launch that tells a six-beat story: **Problem → Technology →
Lumen → What we build → Philosophy → Launch.** It is NOT a logo→list→logo card
reel.

It is produced as a **Remotion** composition (React, renders a real MP4), living
in a fully isolated subproject at `ad/`. The look is the existing Lumen Labs
identity made cinematic: cool graphite / near-black grounds, generous negative
space, drafting hairlines, light editorial typography in Space Grotesk / Manrope
/ JetBrains Mono, and a **single restrained amber accent** that threads across
the whole film (one hairline / node / tick at a time — the frame is never washed
in amber). Real supplied photographs are the primary visual material; they are
made dynamic only through crop, pan, zoom (Ken-Burns), mask reveals, and
parallax — never distorted, recoloured destructively, or regenerated.

The composition is **config-driven in every dimension** (canvas size, safe
areas, timeline, palette, type scale, asset map, copy) so that 16:9 (1920×1080)
and 1:1 (1080×1080) deliverables can be produced later by swapping one format
object — no rebuild, no per-component pixel surgery.

---

## 2. Technology stack (LOCKED)

| Concern | Decision |
|---|---|
| Engine | **Remotion** latest stable (`remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer`) |
| Language | **TypeScript**, React function components (strict mode, matching repo `tsconfig.app.json`) |
| Fonts | **Vendored `@fontsource-variable/*` WOFF2**, loaded locally via `staticFile()` + injected `@font-face` — the exact same font files the site ships (Space Grotesk, Manrope, JetBrains Mono). No `@remotion/google-fonts`, no network. (See §5.5 for the rationale and §10 for the no-network guarantee.) |
| Output | Real **MP4 (H.264)** rendered via `remotion render` to `ad/out/` |
| Package manager | npm (repo already uses `package-lock.json`) |
| Node | Node 18+ (repo `tsconfig` targets ES2022; Remotion requires 18+) |

**No other animation library.** All motion is Remotion's `interpolate`, `spring`,
and `useCurrentFrame`. No GSAP, no Framer Motion, no Lottie, no WebGL/Three. This
keeps the film deterministic for frame-accurate rendering and matches the "no
floating 3D, no particles" aesthetic rule.

### 2.1 Isolation (hard requirement)

The film lives entirely under `ad/` with its **own** `package.json`,
`node_modules/`, and `tsconfig.json`. It MUST NOT:

- modify, import from, or add dependencies to the website's root
  `/projects/sandbox/Lumen-Labs/package.json`;
- be referenced by the site's Vite build;
- share a lockfile with the root.

This mirrors the isolation pattern already established in the brand deliverables.
Verified on disk, the build-only `package.json` + `node_modules/` for those live
one level **under the `build/` subfolder** — at
`brand/09-Desktop-Wallpaper/build/package.json` and
`brand/10-Cofounders-Poster/build/package.json` (each also carrying its own
`fetch-fonts.sh` + local `fonts/` dir — see §5.5). The film reuses the *concept*
(a self-contained generator beside the site with its own lockfile and modules)
but **deliberately places its package at the `ad/` root, not `ad/build/`.** This
is an intentional divergence from the cited precedent: the film is a larger,
multi-file Remotion project (not a single `*.mjs` build script), so a conventional
Remotion project root — `ad/package.json`, `ad/src/`, `ad/public/`, `ad/out/` — is
clearer than nesting it under `ad/build/`. The isolation guarantee (no shared
lockfile, no root-package coupling) is identical either way.

`ad/.gitignore` excludes `node_modules/` and `out/`. The repo root `.gitignore`
is left untouched.

---

## 3. Project layout

```
ad/
  package.json              # remotion + @remotion/* + typescript only
  tsconfig.json             # extends the shape of the site's tsconfig.app.json
  remotion.config.ts        # render defaults: H.264, image format, overwrite
  .gitignore                # node_modules/, out/
  README.md                 # how to preview + render all three formats
  public/                   # assets copied from the site (see §6)
    media/                  # studio-night.jpg, service-applications.jpg, ...
    projects/               # arc-glasshouse-reference.jpg, ingcebo, spartcon
    fonts/                  # vendored WOFF2 copied from @fontsource-variable (see §5.5)
  out/                      # rendered MP4s (git-ignored)
  src/
    Root.tsx                # registerRoot → <Composition> entries (3 formats)
    index.ts                # registerRoot(Root)
    config/
      formats.ts            # FORMAT presets: vertical | wide | square (§4)
      brand.ts              # colours, verbatim from site :root (§5)
      typography.ts         # font families + type scale (§5)
      timeline.ts           # scene frame ranges @30fps (§7)
      assets.ts             # asset path map + per-image focal/crop metadata (§6)
      copy.ts               # EVERY on-screen string (§7)
      fonts.ts              # @font-face defs over vendored WOFF2 via staticFile() (§5.5)
    lib/
      easing.ts             # cubic-bezier presets + spring configs (§8)
      interpolate.ts        # helpers: clip(), ranged(), tracking(), kenBurns()
      layout.ts             # safe-area + relative-position helpers (§4)
      useScene.ts           # hook: local 0..1 progress within a Sequence
    components/
      AnimatedText.tsx
      ImageReveal.tsx
      ImageParallax.tsx
      SectionTitle.tsx
      GridOverlay.tsx
      LineReveal.tsx
      LogoReveal.tsx        # draws the vector-exact BrandMark (§5.3)
      SceneTransition.tsx
      CapabilityCard.tsx
      Grain.tsx             # subtle film grain overlay (§8)
    scenes/
      Scene01_Opening.tsx
      Scene02_Idea.tsx
      Scene03_Lumen.tsx
      Scene04_Build.tsx
      Scene05_Philosophy.tsx
      Scene06_Launch.tsx
    LaunchFilm.tsx          # the <Series> that composes Scene01..06 (§7)
```

No single giant component: `LaunchFilm.tsx` only sequences scenes; each scene
only composes reusable components fed by config.

---

## 4. Format system — one build, three aspect ratios

### 4.1 FORMAT presets (`config/formats.ts`)

```ts
export type FormatId = 'vertical' | 'wide' | 'square'

export interface Format {
  id: FormatId
  width: number
  height: number
  fps: 30
  // Safe area as fractions of the canvas; content lives inside this box.
  safe: { top: number; right: number; bottom: number; left: number }
  // Per-format vertical anchor for the primary type block (0 = top, 1 = bottom)
  typeAnchor: number
}

export const FORMATS: Record<FormatId, Format> = {
  vertical: { id:'vertical', width:1080, height:1920, fps:30,
    safe:{ top:0.11, right:0.075, bottom:0.12, left:0.075 }, typeAnchor:0.72 },
  wide:     { id:'wide',     width:1920, height:1080, fps:30,
    safe:{ top:0.12, right:0.08,  bottom:0.14, left:0.08  }, typeAnchor:0.70 },
  square:   { id:'square',   width:1080, height:1080, fps:30,
    safe:{ top:0.10, right:0.08,  bottom:0.12, left:0.08  }, typeAnchor:0.70 },
}

export const PRIMARY: FormatId = 'vertical'
```

### 4.2 How re-targeting works WITHOUT a rebuild

- **Dimensions come only from the active `Format`.** No component hard-codes
  1080 or 1920. Width/height are read from `useVideoConfig()` (which Remotion
  populates from the `<Composition>`), and the matching `Format` object is passed
  through a `FormatContext` React context set at the root of each composition.
- **Positioning is relative, via `lib/layout.ts`:**
  - `safeBox(format)` → `{x,y,width,height}` in px, derived from `safe` fractions.
  - `anchor(format, {ax, ay})` → an absolute point inside the safe box from
    fractional anchors (e.g. `ax:0, ay:format.typeAnchor` = left edge of safe box
    at the type baseline band).
  - `col(format, n, of)` → x of the n-th gridline of an `of`-column grid inside
    the safe box (used by `GridOverlay` and left-aligned type).
  All layout values are **fractions of the safe box**, never literal pixels.
- **Type scale is canvas-relative:** sizes in `typography.ts` are expressed as a
  function of `min(width,height)` (the "short side"), so headlines keep the same
  optical weight when the canvas changes shape (see §5.2).
- **Per-scene safe-area variants:** scenes that are composition-sensitive
  (S03/S06 centred lockup; S05 portrait hero) read `format.id` to pick a layout
  variant — e.g. S05 places the portrait photo full-bleed-right in `wide`, but
  full-bleed-top in `vertical`. These variants are declared in the scene file as
  a small `switch(format.id)` returning layout objects; motion/timing is shared.
- **Image focal points are stored per asset** (§6) as fractional `focusX/focusY`
  so a crop stays centred on the subject regardless of output aspect ratio.

Three `<Composition>` entries in `Root.tsx` (`LaunchFilm-Vertical`,
`-Wide`, `-Square`) all render the **same** `<LaunchFilm/>`, differing only in the
`Format` injected. The vertical one is built and delivered now; the other two are
registered but out of scope to render (§11).

---

## 5. Brand system

### 5.1 Colours (`config/brand.ts`) — VERBATIM from `src/styles/index.css :root`

Do NOT invent or alter these hex values.

```ts
export const COLOR = {
  ink:        '#06080a',
  graphite:   '#0a0d11',
  surface:    '#10141a',
  surface2:   '#161b22',
  text:       '#f3f2ee',
  muted:      '#98a1ac',
  faint:      '#6c747f',
  accent:     '#e9b978',   // amber — the ONLY warm colour, used sparingly
  accentDeep: '#c8964c',
  steel:      '#a9c8d8',   // cool technical support accent, rare
  hairline:   'rgba(243,242,238,0.09)',
  hairline2:  'rgba(243,242,238,0.16)',
} as const

// Photo grade — verbatim from the site's `.media img` / `.media::after`.
// These are named tokens (not inline literals) so §6.3's grade is config-owned
// like every other colour (Review Finding 6).
export const GRADE = {
  filter:        'saturate(0.68) contrast(1.05) brightness(0.82)', // .media img
  scrim:         'rgba(6,8,10,0.72)',        // bottom-up ink scrim for legibility
  duotoneAmber:  'rgba(233,185,120,0.16)',   // .media::after amber veil
  duotoneSteel:  'rgba(169,200,216,0.14)',   // .media::after steel veil
} as const
```

**Amber discipline (strict).** Amber appears as at most ONE element per frame: a
single hairline, a single node/dot, a single tick, or a thin underline rule.
Never a fill behind type, never a gradient wash, never a glow/bloom. Steel is
even rarer (optional cool tick in S04 infrastructure only). Everything else is
graphite/ink grounds with text/muted/faint type.

### 5.2 Typography (`config/typography.ts`)

Three families, same roles as the site:

- **Space Grotesk** — display / headlines (S01, S02, S05) and the on-screen
  wordmark (S03, S06). Headlines: weight 500, letter-spacing `-0.045em` for large
  display (matches site `.display`), tightening to `-0.05em` at hero sizes. The
  **wordmark** is weight 500 with a final resting tracking `-0.03em` (see §5.3 for
  how it differs from the site's title-case lockup, and §7.3 for its track-in).
- **Manrope** — body / supporting lines ("A South African technology studio.",
  capability list items). Weight 400–500.
- **JetBrains Mono** — small technical labels only: scene tickers, section
  labels ("01 / SOFTWARE"), the engineering title-block in S06. Weight 500,
  letter-spacing `0.14em`, UPPERCASE, `font-variant-numeric: tabular-nums`
  (matches site `.mono`).

Type scale is a function of the short side `S = min(width,height)` so it is
format-independent:

```ts
export const typeScale = (S: number) => ({
  hero:    S * 0.092,   // S01/S02/S05 headline  (~99px on 1080 short side)
  display: S * 0.072,   // S03 LUMEN LABS wordmark
  title:   S * 0.052,   // S04 SectionTitle
  body:    S * 0.026,   // Manrope supporting lines
  list:    S * 0.021,   // capability list items
  mono:    S * 0.0145,  // JetBrains Mono labels
})
```

Line-height for display 1.02; letter-spacing animated in tracking-in reveals
(§8). `text-wrap: balance` is emulated by pre-wrapping copy into explicit lines
in `copy.ts` (Remotion has no reflow pass — we control line breaks).

### 5.3 BrandMark — VECTOR-EXACT (`components/LogoReveal.tsx`)

Reproduce the mark from `src/components/brand/Logo.tsx` exactly — same viewBox,
same paths, same radii. The only addition is draw-on/reveal animation.

```tsx
// viewBox 0 0 28 28, fill="none"
<rect x="0.5" y="0.5" width="27" height="27" rx="6"
      stroke={COLOR.text} strokeOpacity="0.2" />
<path d="M8 7h3.1v10.9H20V21H8V7Z"  fill={COLOR.text}   />  {/* the L */}
<path d="M14.4 7H20v3.1h-5.6V7Z"    fill={COLOR.accent} />  {/* amber bar */}
```

Reveal technique (no path distortion — the geometry is sacred):

1. The rounded `rect` border draws on via `strokeDasharray`/`strokeDashoffset`
   animated from full length → 0 over its reveal window.
2. The L path reveals via a clip-mask wiping bottom→top (a `<clipPath>` whose
   rect height interpolates), so the stroke/geometry is never scaled or warped.
3. The amber bar is the LAST element to appear — a short clip-mask wipe
   left→right. This is the single amber "ignition" moment of the identity.

**Wordmark (on-screen text differs deliberately from the site lockup).** The
film's wordmark is **`LUMEN LABS` — UPPERCASE**, per the storyboard copy
(`copy.s03Wordmark`). This is intentionally NOT the site's `Logo.tsx combined`
glyph string, which renders **title-case `Lumen Labs`, weight 600 (`font-semibold`),
tracking `-0.03em`** with a non-breaking space. What the film reuses from
`Logo.tsx` is only the **mark + wordmark geometry** — the vector-exact BrandMark
(above) and the `combined` variant's `gap-2.5` mark-to-text spacing and vertical
centring. The on-screen wordmark glyphs/case/weight are:

- text: `LUMEN LABS` (uppercase);
- family: Space Grotesk (display);
- weight: **500** (not the site's 600 — the film sets the whole display system at
  500 for a lighter, more editorial feel on the dark ground);
- **final resting tracking `-0.03em`**; in S03 it animates in from `0.2em` and
  settles at `-0.03em` (see §7.3). S06 reuses the settled `-0.03em` directly.

So: geometry and spacing are reused from `Logo.tsx`; the glyph string, case, and
weight are the film's own, driven by `copy.ts` — nothing claims to be "exactly as
Logo.tsx lays out" the text.

### 5.4 Established tone to match (`brand/09`, `brand/10`)

These existing deliverables define the finished Lumen look and this film must sit
in the same family:

- Generous negative space; content floats in a large dark field.
- Isometric / drafting **hairlines** — thin `COLOR.hairline` rules, converging-
  line motifs ("two parts, one system" in the poster).
- A **single amber node** motif as the one point of warmth.
- Mono **title-blocks** (engineering drawing footer): small JetBrains Mono
  metadata rows. The film's S06 ends on exactly this kind of title-block.
- Pure, un-glowing, un-gradient surfaces. No photographic AI imagery in the brand
  layer; photos appear only in the photographic scenes and are graded, not
  invented.

### 5.5 Font loading — vendored WOFF2, no network (`config/fonts.ts`)

**Decision (locked): load the site's own vendored font files locally; do NOT use
`@remotion/google-fonts`.** The website depends on
`@fontsource-variable/space-grotesk`, `@fontsource-variable/manrope`, and
`@fontsource-variable/jetbrains-mono` (verified in the root `package.json`) — i.e.
*variable* WOFF2 files bundled into `node_modules`, served with no network at
runtime. The brand deliverables reinforce the same principle: `brand/09/build/`
and `brand/10/build/` each ship a `fetch-fonts.sh` that vendors the exact brand
fonts locally and even instances the variable fonts to the static weights the live
site uses, specifically so advance-width metrics match.

Two viable approaches were considered:

1. **`@remotion/google-fonts` `loadFont()`** — convenient, but fetches *different*
   font files (Google CDN static cuts) over the **network** at render time. Risks:
   (a) glyph metrics / kerning may differ from the site's variable fonts, which
   would desync the pre-wrapped line breaks in `copy.ts`; (b) a network/cache miss
   aborts the render (a fatal path the film should not have); (c) it diverges from
   both the site and the established brand-build precedent.
2. **Vendored `@fontsource-variable` WOFF2 via `staticFile()` + `@font-face`** —
   the exact files the site renders, loaded from `ad/public/fonts/`, zero network.

**Chosen: (2).** It is the only option that guarantees metric parity with the live
site and a deterministic, offline render.

Mechanism:

- A build step (documented in `ad/README.md`, run once) copies the needed WOFF2
  from the site's `node_modules/@fontsource-variable/*/files/*-wght-normal.woff2`
  into `ad/public/fonts/` — e.g. `space-grotesk-latin-wght-normal.woff2`,
  `manrope-latin-wght-normal.woff2`, `jetbrains-mono-latin-wght-normal.woff2`
  (latin subset is sufficient for the all-Latin copy). Copying (not symlinking)
  keeps `ad/` self-contained.
- `config/fonts.ts` exports the three family names and injects an `@font-face`
  block (via Remotion's `<style>` in `Root.tsx`) whose `src` is
  `staticFile('fonts/<file>.woff2')`, with `font-display: block` so Remotion waits
  for the face before painting. Because they are variable fonts, `@font-face`
  declares `font-weight: 100 900` and components set the weight they need (500 for
  display/wordmark/mono, 400–500 for body).
- `Root.tsx` calls Remotion's `delayRender()`/`continueRender()` guarded by
  `document.fonts.ready` so no frame renders before the faces are parsed. There is
  no network request, so the only failure mode is a missing local file (handled as
  fatal in §10, same class as a missing image).

---

## 6. Imagery (`config/assets.ts`)

### 6.1 Sourcing

Copy the needed files from the site into `ad/public/` (Remotion serves from
`public/` via `staticFile()`). Copy, don't symlink, so the subproject is
self-contained:

```
cp src/assets/media/*.jpg            ad/public/media/
cp src/assets/projects/*.jpg         ad/public/projects/
```

**Never** distort, warp, stretch (non-uniform scale), destructively recolour, or
AI-regenerate any photo. Allowed treatments only: uniform scale (Ken-Burns),
translate (pan), rectangular/linear **mask reveals**, parallax offset, and a
consistent grade overlay (see §6.3). Aspect is always preserved via
`object-fit: cover` behaviour implemented as scale-to-cover in `ImageReveal`.

### 6.2 Asset map with focal points

Each asset stores a fractional focal point so crops stay on the subject across
formats. (Focal values are the designer's intent; the coder keeps them unless a
render shows the subject clipped.)

| key | file | role | focusX / focusY | notes |
|---|---|---|---|---|
| `studioNight` | media/studio-night.jpg | **S01 opener** | 0.52 / 0.42 | developer silhouette lit by monitor — strongest, darkest, most cinematic |
| `appsCode` | media/service-applications.jpg | S02 / S04 SOFTWARE | 0.50 / 0.45 | CSS/HTML in dark editor |
| `websites` | media/service-websites.jpg | S02 / S04 SOFTWARE | 0.55 / 0.50 | MacBook on desk |
| `servers` | media/infrastructure-servers.jpg | S04 INFRASTRUCTURE | 0.50 / 0.55 | low-angle server rack |
| `network` | media/engineer-network.jpg | S04 INFRASTRUCTURE | 0.55 / 0.52 | hands patching ethernet |
| `datacenter` | media/datacenter-monitor.jpg | S04 INFRASTRUCTURE | 0.50 / 0.48 | monitor among cables, blue-lit (steel accent justified here) |
| `controlPanel` | media/control-panel.jpg | **S05 hero** + S04 CONTROL | 0.50 / 0.38 | technician in BLUE HARD HAT at SCADA panel — portrait, the hero image |
| `itSupport` | media/it-support.jpg | supporting | 0.50 / 0.50 | |
| `circuit` | media/circuit-macro.jpg | texture / S04 CONTROL inset | 0.50 / 0.50 | macro circuitry |
| `textureNetwork` | media/texture-network.jpg | subtle texture layer | 0.50 / 0.50 | low-opacity ground texture |
| `mobileBlank` | media/mobile-blank.jpg | optional S04 SOFTWARE/IoT | 0.50 / 0.50 | blank-screen phone |
| `arc`,`ingcebo`,`spartcon` | projects/*-reference.jpg | reserve (unused in cut) | 0.5/0.5 | available if a build render needs more texture; not in the locked cut |

### 6.3 Grade (match the site's `.media` treatment)

Apply the site's established grade so photos read as one system with the dark UI,
implemented as a CSS filter on the `<img>` inside `ImageReveal`. **All grade
colours are the named `GRADE` tokens from `config/brand.ts` (§5.1)** — no inline
rgba literals in any component:

```
filter: GRADE.filter;   // saturate(0.68) contrast(1.05) brightness(0.82)
```

Plus a two-layer scrim overlay (non-destructive, drawn above the image):
bottom-up ink scrim `GRADE.scrim → transparent @52%` for text legibility, and a
very faint 152° duotone veil using `GRADE.duotoneAmber` / `GRADE.duotoneSteel`.
This is the ONLY place amber/steel appear as an area tint, at the site-identical
low opacity defined by those tokens — not a wash.

---

## 7. Storyboard & timeline (30fps, ~810 frames total)

All ranges in `config/timeline.ts`. The six scenes are composed on a Remotion
**`<Series>`** (contiguous, non-overlapping `Series.Sequence`s) so durations are
declared once and sequence automatically. The one connective element that must
visually *span* a cut — the amber carry-line — is NOT a Series member; it is a
single always-on layer mounted above the scenes in `LaunchFilm.tsx` whose
position is one interpolation across the whole 810-frame timeline (see §7.7). So
"transitions" are not overlapping Series members (which cannot share frames);
they are (a) matched clip-wipes authored at the tail of one scene and the head of
the next, and (b) the global carry-line layer. **Exact copy only — no invented
copy, stats, or clients.** Copy strings live in `config/copy.ts`.

```ts
export const FPS = 30
export const TIMELINE = {
  s01: { start:   0, end: 120 },  // 0.0 – 4.0s   (120f)
  s02: { start: 120, end: 240 },  // 4.0 – 8.0s   (120f)
  s03: { start: 240, end: 360 },  // 8.0 – 12.0s  (120f)
  s04: { start: 360, end: 630 },  // 12.0 – 21.0s (270f)
  s05: { start: 630, end: 750 },  // 21.0 – 25.0s (120f)
  s06: { start: 750, end: 810 },  // 25.0 – 27.0s (60f)
} as const
export const DURATION_IN_FRAMES = 810   // 27.0s
```

Scene-local frames below are 0-based within each `<Series.Sequence>`.

### 7.1 S01 — THE OPENING · frames 0–120 (0–4s)

- **Ground:** `COLOR.ink`, full black for frames 0–8.
- **Image:** `studioNight` via `ImageReveal`. Masked reveal: a single horizontal
  clip band opens from the vertical centre outward (mask height 0→100% over
  f8–f40, `easeOutExpo`). Simultaneously a slow Ken-Burns **push-in**: scale
  1.08→1.14 across f8–120, pan drifting toward `focus(0.52,0.42)` (`easeInOutSine`).
- **Grid:** `GridOverlay` draws two faint vertical drafting rules (`LineReveal`,
  `COLOR.hairline`) at safe-box columns 1 and 5 of a 6-col grid, drawing top→down
  over f20–f55. Pure structure, no amber yet.
- **Type:** `copy.s01 = "Every business has\nproblems worth solving."` Two lines,
  Space Grotesk hero. Reveal = **per-line clip-mask rise** (each line masked by a
  rising rect) with a simultaneous **tracking-in** (letter-spacing `0.14em`→`-0.045em`).
  Line 1 at f44, line 2 at f58 (14f stagger). Anchored at `ay: format.typeAnchor`,
  left-aligned to safe-box left.
- **Amber:** none yet (restraint — the amber is "earned" at S03). Optional single
  amber **tick** (6px square) at the end of the drafting rule appears at f100 as a
  foreshadow — ONE node only.
- **Transition out:** at f108–120 the ink scrim deepens (bottom scrim opacity →1)
  as `SceneTransition` begins the carry into S02.

### 7.2 S02 — THE IDEA · frames 120–240 (4–8s)

- **Images:** `appsCode` then `websites`, interacting with type. `appsCode`
  enters first (clip-mask wipe left→right, f0–f24 local), holds with a slow
  lateral **pan** (translateX via Ken-Burns, `easeInOutSine`). At f60 local,
  `websites` slides in on a parallax layer from the right at a *different rate*
  than the foreground type (background 1.0×, type layer 0.6× — true parallax).
- **Type:** `copy.s02 = "We build the technology\nto solve them."` Space Grotesk
  hero, on `ImageParallax` foreground layer so it drifts slower than the photo
  behind it. Reveal: clip-mask rise, lines staggered 12f, starting f18 local.
  "technology" and "them." keyword lines sit on the brighter part of the frame;
  the ink scrim guarantees contrast.
- **Interaction:** the type's left edge aligns to a drafting rule that is shared
  with S01's grid (continuity). As `websites` enters, the headline nudges up by
  ~2% of height to "make room" — imagery and type reacting to each other.
- **Amber:** a single amber **underline rule** draws beneath the word "build"
  (LineReveal, left→right, f30–f48 local) — one thin tick, then it stays. This is
  the first deliberate amber and it points at the verb "build."
- **Transition out:** f104–120 local — the amber underline **detaches** and slides
  toward the frame centre, becoming the carry-line into S03 (see §7.7).

### 7.3 S03 — INTRODUCE LUMEN · frames 240–360 (8–12s)

The brand is *born*, not title-carded.

- **Ground:** photography dissolves to `COLOR.graphite`. The last photo
  (`websites`) wipes down behind a rising graphite panel (f0–f20 local), leaving
  a clean dark field with generous negative space.
- **Carry-line → mark:** the amber hairline carried from S02 arrives centred,
  then the `LogoReveal` **draws the BrandMark on top of it** — the rect border
  stroke-draws (f16–f40), the L clip-wipes bottom→top (f34–f58), and the amber
  bar wipes in last (f58–f70), reusing the carried amber as the bar's colour
  moment. (§5.3)
- **Wordmark:** "LUMEN LABS" (`copy.s03Wordmark`) tracking-in beside the mark,
  f66–f92 local, Space Grotesk display, tracking `0.2em`→`-0.03em`.
- **Supporting:** `copy.s03Sub = "A South African technology studio."` Manrope
  body, muted, clip-mask rise f96–f114 local, set below the lockup, left-aligned
  to the lockup's optical left.
- **Amber:** the mark's amber bar is the single accent; plus the carry-line's tail
  resolves into one amber node to the right of the wordmark (foreshadowing S06's
  title-block node). No other amber.
- **Transition out:** f110–120 — lockup holds; a thin hairline draws across under
  the sub-line and carries into S04 as the first category's baseline rule.

### 7.4 S04 — WHAT WE BUILD · frames 360–630 (12–21s) · 270f

Three category beats, each exactly **90f (3.0s)**; `3 × 90 = 270` = the full S04
duration. **Never one crowded frame** — exactly one category on screen at a time,
animated individually. Each beat uses `SectionTitle` + a short list of
`CapabilityCard`s + a matched image treatment, with JetBrains Mono numeric labels.

**Beat sequencing mechanism (pinned).** S04 is a **single 270f scene component**
(`Scene04_Build.tsx`), ONE member of the top-level `<Series>`. It is NOT a nested
`<Series>` and does NOT use overlapping `<Sequence>`s. Inside it, the three beats
are driven by `useScene` sub-ranges computed from `Scene04_Build`'s local frame:

```
beatA = [0, 90)     beatB = [90, 180)     beatC = [180, 270)
```

Each beat's internal animation uses `frame - beatStart` (0..89 local to the beat).
Because the beats are **sub-ranges of one scene**, S04 itself renders the
cross-beat continuity, so there is no "overlap" problem: at a beat boundary (f90,
f180) the outgoing beat's clip-wipe-out plays entirely **before** the boundary
(beat-local f70–f88) and the incoming beat's clip-wipe-in plays entirely **after**
it (beat-local f0–f10 of the next beat). **The two never share a frame — the cut
is a hard cut.** The only thing that visibly persists across the boundary is the
**baseline hairline rule**, which S04 draws once at scene start and holds for all
270f (it is not re-animated per beat), giving the eye a continuous anchor through
the hard cuts.

Shared per-beat structure (frames local to each 90f beat, so no beat touches
another beat's frames):
- f0–f10: image enters via clip-mask wipe (direction alternates per beat for
  rhythm: L→R, then T→B, then R→L).
- f6–f22: `SectionTitle` tracking-in (mono index "0X" + Space Grotesk title).
- f18–f54: list items stagger in as `CapabilityCard`s (8f apart; Beat C uses 7f —
  see below), each a clip-mask rise with a leading JetBrains Mono tick.
- f70–f88: beat-out — image and cards clip-wipe off in the direction the NEXT beat
  will enter from; the persistent baseline hairline is untouched. f88–f90 is the
  settled gap before the hard cut.

**Beat A — SOFTWARE** (`copy.s04.software`): title "SOFTWARE", index "01".
List: Custom software / Web applications / Integrations / IoT.
Images: `appsCode` as the main plate (right 55% of frame, slow pan), `websites`
as a small parallax inset. Amber: a single amber tick marks the active list row
as each enters (the tick moves down the list — ONE at a time).

**Beat B — INFRASTRUCTURE** (`copy.s04.infrastructure`): title "INFRASTRUCTURE",
index "02". List: IT / Networking / Cloud / Microsoft 365.
Images: `servers` main plate (low-angle, slow push-in), `network` inset, optional
quick `datacenter` flash on the mid-beat cut. Accent: this is the ONE scene where
a single **steel** tick (cool, `COLOR.steel`) may appear instead of amber, because
the datacenter plate is blue-lit — keeps amber discipline while nodding to the
technical/cool side. Still one tick only.

**Beat C — CONTROL + SECURITY** (`copy.s04.control`): title "CONTROL + SECURITY",
index "03". List: Automation / SCADA / Cybersecurity / CCTV / VoIP (5 items —
tighter 7f stagger so it still fits the 90f beat).
Images: `controlPanel` (cropped wide here, NOT the hero framing — reserve the full
portrait hero for S05), with a `circuit` macro inset. Amber: single amber node.

- **Transition out of S04:** f78–90 of Beat C — everything clears except the
  baseline hairline, which rises to become the top rule of S05's clean field, and
  the pace visibly slows (the next scene's first motion is much slower).

### 7.5 S05 — THE PHILOSOPHY · frames 630–750 (21–25s)

Pace drops; breathing room is the point.

- **Image:** `controlPanel` as the **hero**, full portrait framing (its native
  orientation), placed per-format: `vertical` → full-bleed with a tall ink scrim
  bottom-left for type; `wide` → photo pinned right ~55%, type left; `square` →
  photo right 60%. Enters via a slow single clip-mask reveal (top→bottom, f0–f44
  local, `easeOutExpo`) and a very slow Ken-Burns push-in (scale 1.06→1.10 across
  the whole scene). The hard-hat technician reads clearly — focal 0.50/0.38.
- **Type — two beats, room to breathe:**
  - Beat 1 `copy.s05a = "Small enough to care."` — clip-mask rise + gentle
    tracking settle, f24–f44 local; holds.
  - Beat 2 `copy.s05b = "Technical enough to build."` — appears f74–f94 local as
    beat 1 eases up slightly (−3% y) to make room. Both Space Grotesk hero,
    left-aligned in the safe box, large negative space around them.
- **Amber:** a single amber hairline rule sits between the two lines, drawing
  left→right as beat 2 arrives (LineReveal, f70–f90) — the one accent, literally
  the "between caring and building" seam.
- **Grid:** one faint drafting rule only; this scene is deliberately emptier than
  S04.
- **Transition out:** f108–120 — the photo clip-masks closed upward and the amber
  seam-line carries up to centre for the final lockup.

### 7.6 S06 — THE LAUNCH · frames 750–810 (25–27s)

Identity resolves; a company opening its doors. Must hold a strong final
thumbnail frame.

**Duration decision (60f = 2.0s is deliberate).** S06 reuses the BrandMark and
wordmark the viewer already learned in S03, so the reveal is the fast variant
(`LogoReveal speed='fast'`), not a from-scratch birth. 60f is enough to resolve a
*known* mark, rise a short tagline, draw a one-row title-block, and still hold a
12f settled thumbnail. Keeping the total at **810f/27s** also lands squarely in
the brief's 25–30s window and keeps every scene cut on a clean 30fps beat point.
We explicitly choose NOT to extend the film to give S06 more frames; the
resolution reads as confident and quick, not rushed, because nothing new is being
taught here.

- **Ground:** `COLOR.graphite` clean field, maximum negative space, centred lockup
  per `format` (centred for vertical/square; left-of-centre with title-block right
  for wide).
- **Lockup:** `LogoReveal` BrandMark + "LUMEN LABS" wordmark resolve quickly from
  the carried amber seam (f0–f20) — reusing the S03 reveal but faster, since the
  mark is already "known." The amber bar snaps in on the beat at ~f10.
- **Tagline:** `copy.s06Tagline = "Built with intention."` Manrope, muted→text,
  clip-mask rise f20–f36, set beneath the wordmark with tight, confident spacing.
- **Title-block (match brand/09–10):** a small JetBrains Mono engineering
  title-block row draws on at f36–f48, driven by the exact strings
  `copy.s06Meta = ['LUMEN LABS', 'SOUTH AFRICAN TECHNOLOGY STUDIO']` — both reused
  verbatim from approved copy (the wordmark, and the uppercased form of S03's "A
  South African technology studio."). **No dates, no "EST.", no location, no
  stats — the two strings above are the complete, fixed content** and are asserted
  by the §11 copy snapshot test so they cannot drift. Rendered as a two-cell mono
  row (label left, descriptor right) in `COLOR.faint`. A single amber node sits at
  the title-block's left tick.
- **Hold:** f48–60 fully settled, motion at rest — this is the deliberate
  thumbnail frame (mark + wordmark + tagline + one amber node on graphite).
- **End:** last frame is a clean held composition; no fade to black (feels like
  "doors open," not "promo over").

### 7.7 Cross-scene transitions (`components/SceneTransition.tsx`)

One connective device threads the film: **a single amber hairline that carries
across cuts.** It first appears as S02's underline under "build," detaches and
travels to centre for S03's mark ignition, becomes S04's persistent baseline
rule, rises into S05's seam between the two philosophy lines, then carries up into
S06's final lockup node. Everything else is clean clip-mask wipes and matched
push-ins — no template dissolves, no spins, no flashes.

**Implementation (no overlapping Series members).** Because `<Series>` members
cannot share frames, the carry-line is NOT built as overlapping scene tails/heads.
Instead `SceneTransition` is a **single always-on layer** mounted in
`LaunchFilm.tsx` above the scenes and below `Grain`, driven by the GLOBAL frame
(`useCurrentFrame()` at the composition root, 0..809). Its y-position, x-extent,
and opacity are one piecewise interpolation over the global timeline, with
keyframes pinned to the exact boundary frames (120, 240, 360, 630, 750). The scene
components do not animate the carry-line; they only leave the correct negative
space for it to occupy as it arrives (e.g. S03 reserves the centre band; S05
reserves the seam between the two lines). The matched clip-wipes at each boundary
are authored independently inside the adjacent scenes (tail of the outgoing scene,
head of the incoming scene) and, being in different Series members, never overlap
— they read as a clean hard cut that the carry-line glides through.

---

## 8. Motion, easing, texture (`lib/easing.ts`, `components/Grain.tsx`)

Easing presets ported from the site's `:root` tokens so the film matches the
site's motion feel:

```ts
export const EASE = {
  base:    Easing.bezier(0.22, 0.68, 0.24, 1),   // --ease
  out:     Easing.bezier(0.16, 1,    0.30, 1),    // --ease-out (primary reveals)
  inOut:   Easing.bezier(0.62, 0.05, 0.30, 0.98), // --ease-in-out (Ken-Burns)
  outExpo: Easing.bezier(0.19, 1,    0.22, 1),    // SHARPER exponential-out — hero
                                                   // masked reveals only (S01, S05)
}
export const SPRING = {
  settle: { damping: 200, stiffness: 120, mass: 0.8 }, // type tracking settle
  mark:   { damping: 180, stiffness: 90,  mass: 1.0 }, // logo element arrival
}
```

- **Reveals** (type lines, cards, standard image masks) use `EASE.out`.
- **Hero masked image reveals** — ONLY S01's opener band and S05's philosophy
  hero — use `EASE.outExpo`, a deliberately sharper curve `bezier(0.19,1,0.22,1)`
  (faster initial travel, longer gentle settle) so those two signature reveals
  snap in with more cinematic authority than the standard `EASE.out` reveals. The
  two curves are intentionally distinct; `outExpo` is used nowhere else.
- **Ken-Burns pans/zooms** use `EASE.inOut`, max scale delta 0.06–0.08 (never a
  zoom that reveals edge/letterbox given the cover-fit).
- **Tracking-in** headlines interpolate letter-spacing with `EASE.out` and may use
  `SPRING.settle` on the final 20% for a natural stop.
- **No motion blur** (deterministic, crisp editorial feel). Frames land exactly on
  beat points at scene cuts (0,120,240,360,630,750,810) so an ambient/electronic
  track COULD be synced later. **Do NOT generate or add an audio file.**
- **Grain:** `Grain.tsx` overlays a subtle static noise texture at ~4–6% opacity,
  `mix-blend-mode: overlay`, seeded per frame deterministically (tiny tiled PNG in
  `public/`, or a cheap procedural SVG `feTurbulence` rendered once). Subtle only —
  it's the "subtle texture" rule, not a visible film-grain effect.

---

## 9. Reusable components (contracts)

Each is a pure function of `frame`/props; all read `Format` from context and
colours/type from config. No component hard-codes copy or pixels.

- **`AnimatedText`** — props: `text` (pre-wrapped lines), `font`('display'|'body'|'mono'),
  `size`, `reveal`('clipRise'|'trackIn'|'both'), `startFrame`, `stagger`, `color`,
  `align`. Renders each line in its own clip-mask container; tracking animated when
  `reveal` includes `trackIn`.
- **`ImageReveal`** — props: `assetKey`, `mask`('wipeLR'|'wipeRL'|'wipeTB'|'bandCenter'),
  `startFrame`,`durationInFrames`, grade applied, scrim on by default. Scale-to-cover
  using the asset's focal point.
- **`ImageParallax`** — wraps `ImageReveal`, adds a `rate` (0..1) applied to a shared
  scroll/drift signal so background and foreground move at different rates.
- **`SectionTitle`** — mono index ("01") + Space Grotesk title + optional one-tick
  accent. Used by S04 beats.
- **`GridOverlay`** — draws N faint vertical drafting rules at safe-box columns via
  `LineReveal`; `columns`, `which`(indices), `draw`(direction/frames).
- **`LineReveal`** — a single hairline that draws on (`strokeDashoffset` or width
  interpolation); `direction`, `color`(default hairline, amber only when explicitly
  passed), `startFrame`,`durationInFrames`.
- **`LogoReveal`** — the vector-exact BrandMark (§5.3) with draw-on; `speed`('born'|'fast')
  for S03 vs S06, optional `withWordmark`.
- **`SceneTransition`** — the carry-line boundary device (§7.7).
- **`CapabilityCard`** — a single capability row: JetBrains Mono tick + Manrope label;
  `active` drives the single amber/steel tick; clip-rise entrance.
- **`Grain`** — the texture overlay (§8).

---

## 10. Error handling & input validation

Remotion is a build-time renderer; "inputs" are config files + asset files, and
failures must stop the render loudly rather than ship a broken frame.

| Operation | Failure condition | Recoverable? | What the caller gets | Logged |
|---|---|---|---|---|
| Load asset via `staticFile()` | file missing from `ad/public/` | **Fatal** | render aborts | yes — error |
| Asset key lookup in `assets.ts` | key not in map | **Fatal (dev)** | TypeScript error at build (keys are a union type); at runtime, a thrown `Error("Unknown asset key: X")` | yes — error |
| Font load (vendored WOFF2 via `staticFile()` + `@font-face`) | local file missing from `ad/public/fonts/` | **Fatal** | `document.fonts.ready` never resolves / face fails → `delayRender()` times out → render aborts. **No network path exists** (files are local), so there is no "network/cache miss" failure mode — only a missing-file one, same class as a missing image | yes — error |
| Timeline integrity | scene ranges don't sum to `DURATION_IN_FRAMES`, or overlap/gap | **Fatal (dev)** | a `validateTimeline()` assert in `timeline.ts` throws at module load with the exact mismatch | yes — error |
| Format safe-area | `safe` fractions ≥ 0.5 (would invert box) | **Fatal (dev)** | `safeBox()` throws `RangeError` with the offending fraction | yes — error |
| `interpolate` out-of-range | input outside `[start,end]` | **Recoverable** | all `interpolate` calls MUST pass `{extrapolateLeft:'clamp', extrapolateRight:'clamp'}` via the `clip()` helper in `lib/interpolate.ts`; values never exceed the declared range | no |
| Focal point | `focusX/Y` outside `[0,1]` | **Fatal (dev)** | `assets.ts` loader clamps and throws in dev if out of range | yes — warn |
| Render output dir | `ad/out/` not writable / missing | **Fatal** | Remotion CLI error surfaced to the shell | yes — error |

Validation rules for external inputs:

- **Asset files:** required; must exist in `ad/public/media|projects`; type `.jpg`;
  no size limit enforced but focal metadata required for any image used in a crop.
  On failure → fatal (abort render).
- **Copy strings:** required; sourced ONLY from `config/copy.ts`; must be the
  verbatim storyboard copy (no runtime user input, so no sanitisation needed, but a
  unit test asserts the exact strings — see §11). Line breaks are explicit `\n`.
- **Format dimensions:** required integers > 0, fps === 30; validated in
  `formats.ts` at module load.

Invariant ownership:

- **Amber-discipline invariant** ("≤ one amber element per frame") — owned by the
  **scene components** (they are the only place amber colour is passed into
  `LineReveal`/`CapabilityCard`); enforced by code review + a design-token lint:
  only scenes may pass `COLOR.accent`/`COLOR.steel`; shared components default to
  `hairline`. Rationale: amber usage is a composition decision, not a primitive's.
- **No-distortion invariant** (images never non-uniformly scaled) — owned by
  **`ImageReveal`**, the single component allowed to apply transforms to an
  `<img>`. It only ever applies uniform scale + translate; it exposes no API for
  skew/stretch. Rationale: funnel all image transforms through one audited place.
- **Timeline-sums-to-total invariant** — owned by **`config/timeline.ts`** via
  `validateTimeline()`. Rationale: the single source of truth for durations.
- **Format-independence invariant** (no literal pixel offsets in components) —
  owned by **`lib/layout.ts`**; components must obtain positions only from
  `safeBox`/`anchor`/`col`. Rationale: this is exactly what makes the three-format
  re-target work without a rebuild.

---

## 11. Testability

- **Unit-testable (Vitest in the `ad/` subproject, or plain `tsx` asserts):**
  - `validateTimeline()` — ranges contiguous, non-overlapping, sum to 810.
  - `copy.ts` — snapshot asserts the exact storyboard strings, **including
    `copy.s06Meta = ['LUMEN LABS', 'SOUTH AFRICAN TECHNOLOGY STUDIO']`** and the
    S03/S06 wordmark `LUMEN LABS` (uppercase), guarding against accidental copy
    drift / invented copy (no dates, stats, or clients can slip in).
  - `lib/layout.ts` — `safeBox`/`anchor`/`col` return expected px for each of the
    three formats (pure functions → easy).
  - `lib/interpolate.ts` — `clip()` clamps; `kenBurns()` stays within max scale.
  - `assets.ts` — every referenced `assetKey` exists; focal points in `[0,1]`.
- **Integration-testable:**
  - Remotion `renderStill()` at key beat frames (0, 44, 240, 270-range beats, 630,
    750, 809) → compare against committed reference PNGs (visual regression). The
    809 still doubles as the thumbnail check.
  - A fast `renderMedia()` smoke render at reduced scale to confirm the full
    810-frame timeline composes without throwing.
- The config-driven architecture is what makes this testable: because layout,
  timing, copy, and colour are pure data, most of the film's correctness is
  verifiable without rendering pixels. A scene that needed literal pixel math or
  hidden state would be a signal to refactor it back into config.

---

## 12. Out of scope (this pass)

- Rendering the 16:9 and 1:1 MP4s (architected for, but only the vertical MP4 is
  the delivered render). The compositions are registered so they CAN be rendered.
- Audio: no soundtrack or SFX file is created or embedded; timing only *allows*
  later sync.
- Any change to the website root project, its build, or its dependencies.
- New or redesigned brand identity, logos, or copy — all identity is reproduced
  verbatim; all copy is verbatim from the storyboard.

---

## 13. Summary of locked decisions

- **Stack:** Remotion + TypeScript + React; fonts are the site's own vendored
  `@fontsource-variable` WOFF2 loaded locally via `staticFile()` + `@font-face`
  (no `@remotion/google-fonts`, no network); H.264 MP4 to `ad/out/`; fully
  isolated under `ad/` (own package.json/node_modules/tsconfig at the `ad/` root)
  — same isolation *concept* as `brand/09/build` & `brand/10/build`, deliberately
  rooted at `ad/` rather than `ad/build/`.
- **Format:** primary 9:16 1080×1920 @30fps, 810 frames (27s). One build retargets
  to 16:9 and 1:1 via a `Format` preset + safe-area fractions + short-side type
  scale + per-asset focal points — zero hard-coded pixels in components.
- **Brand:** colours verbatim from `:root`; three-typeface system; vector-exact
  BrandMark (viewBox 0 0 28 28, the two paths + rounded rect) revealed by
  clip-mask/stroke-draw, never distorted; tone matched to the drafting-hairline,
  single-amber-node, mono-title-block look of the existing brand deliverables.
- **Story:** six scenes carrying Problem → Technology → Lumen → What we build →
  Philosophy → Launch, with a single amber hairline literally threading every cut.
- **Discipline:** one amber element per frame max; no glow/gradient/glass/
  cyberpunk/3D/particles/HUD; photos made dynamic only by crop/pan/zoom/mask/
  parallax under the site's grade; subtle grain; purposeful eased motion with beat
  points for later audio sync.
- **Architecture:** central config (formats, brand incl. named `GRADE` tokens,
  typography, timeline, assets, copy, fonts) + nine reusable components + shared
  easing/interpolate/layout utils + six scene components on a `<Series>`; no giant
  component.
- **Safety nets:** fatal-on-missing-asset/font, dev-time asserts for timeline and
  safe-area invariants, clamped interpolation everywhere, and four explicitly-owned
  invariants (amber discipline, no-distortion, timeline-sum, format-independence).
```

---

## 14. Review responses (revision pass 1)

Dispositions for `design-review.md` (verdict CHANGES_REQUESTED). All six MEDIUM
and all three NIT findings are **addressed** — none backlogged or ignored.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | MED | Wordmark case vs. "exactly as Logo.tsx" | **Addressed** — §5.3 rewritten: on-screen text is uppercase `LUMEN LABS`, weight 500, final tracking `-0.03em`; only the mark+gap *geometry* of `Logo.tsx combined` is reused, explicitly NOT its title-case/weight-600 glyphs. §5.2 aligned. |
| 2 | MED | S04 beat sequencing mechanism / Series conflict | **Addressed** — §7.4 pins S04 as a single 270f scene (one Series member) with `useScene` sub-ranges `[0,90)/[90,180)/[180,270)`; beat-out (local f70–88) and next beat-in (local f0–10) share no frames = hard cut; only the baseline hairline persists. §7 intro + §7.7 clarify the carry-line is a global always-on layer, not an overlapping Series member. |
| 3 | MED | `@remotion/google-fonts` divergence / missing rationale | **Addressed** — switched to the site's vendored `@fontsource-variable` WOFF2 via `staticFile()` + `@font-face` (new §5.5), matching site metrics with zero network. Stack table, layout, §10 font row, and §13 updated. Verified the repo vendors these packages and that `brand/09/build` vendors fonts locally too. |
| 4 | MED | Isolation-precedent location wrong | **Addressed** — §2.1 corrected to `brand/09/build/` and `brand/10/build/` (verified on disk) and now states the deliberate choice to root the film's package at `ad/` (not `ad/build/`) with reasoning. §13 updated. |
| 5 | MED | `EASE.outExpo` identical to `EASE.out` | **Addressed** — `outExpo` given a genuinely sharper curve `bezier(0.19,1,0.22,1)`, scoped to S01/S05 hero reveals only; §8 prose explains the distinction. |
| 6 | MED | Grade colours hard-coded inline | **Addressed** — added named `GRADE` tokens (`filter`, `scrim`, `duotoneAmber`, `duotoneSteel`) to `config/brand.ts` (§5.1); §6.3 now references them by name. |
| 7 | NIT | `copy.s06Meta` undefined | **Addressed** — defined as `['LUMEN LABS', 'SOUTH AFRICAN TECHNOLOGY STUDIO']` (both verbatim) in §7.6 and added to the §11 copy snapshot test. |
| 8 | NIT | S06 only 60f | **Addressed** — §7.6 states 60f is a deliberate choice (fast reuse of the known mark; keeps total at 27s inside the brief's range) and we explicitly do not extend. |
| 9 | NIT | S03 tracking stated inconsistently | **Addressed** — §5.2 and §5.3 now state final resting tracking `-0.03em` and point to §7.3's `0.2em → -0.03em` track-in. |