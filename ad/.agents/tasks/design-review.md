# Design Review — Lumen Labs Launch Brand Film (`ad/DESIGN.md`)

**Reviewer:** design-review subagent (fresh read, no authoring context)
**Scope:** `/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad/DESIGN.md`
**Pass under review:** revision pass 1 (document self-reports resolving a prior
6×MEDIUM + 3×NIT review).
**Verdict:** **APPROVED** — 0 HIGH, 0 MEDIUM, 3 NIT.

---

## How this review was conducted

Every load-bearing factual claim in the design was checked against the actual
source in the worktree rather than taken on the document's word:

- Brand colours against `src/styles/index.css :root`.
- The BrandMark geometry against `src/components/brand/Logo.tsx`.
- The photo grade against the site's `.media img` / `.media::after` rules.
- The font packages + exact vendored WOFF2 filenames against the installed
  `@fontsource-variable/*` packages.
- The isolation precedent location against `brand/09-.../build` and
  `brand/10-.../build` on disk.
- The supplied imagery against `src/assets/media` and `src/assets/projects`.
- The storyboard copy against the verbatim original brief.
- The timeline arithmetic.

The design is unusually rigorous: it is config-driven in every dimension, names
all required reusable components, pins the Remotion `<Series>` sequencing model
(including the tricky "no overlapping Series members" constraint for the
carry-line), and specifies error/validation behaviour and ownership of
invariants. The prior-pass fixes it claims are all substantiated by source. The
remaining findings are genuinely minor (NIT) and do not block implementation.

---

## Checklist against the review brief

| Required property | Result |
|---|---|
| ONLY the exact brand hex values + real fonts | **PASS** — all 12 tokens verbatim from `:root`; fonts are the three real `@fontsource-variable` families. |
| BrandMark vector-exact (viewBox, rx 6, two paths, amber bar) | **PASS** — matches `Logo.tsx` exactly. |
| 6 scenes with concrete 30fps ranges summing ~810f, image + motion + exact copy each | **PASS** — ranges sum to exactly 810; each scene names image, motion, and verbatim copy. |
| Amber genuinely restrained (one hairline/node/tick, never a wash) | **PASS** — "≤ one amber element per frame" invariant, owned by scenes, lint-enforced. |
| Real photos only via crop/pan/zoom/mask/parallax/reveal | **PASS** — no-distortion invariant funnelled through `ImageReveal`; grade is non-destructive overlay. |
| Concrete architecture (central config, named components, per-scene on Series, shared utils) isolated under `ad/` with own package.json | **PASS** — full layout, config split, and isolation hard-requirement specified. |
| Multi-aspect via config + safe-area, not hard-coded offsets | **PASS** — `Format` presets + fractional safe box + short-side type scale + per-asset focal points; format-independence invariant. |
| Tells Problem→Technology→Lumen→What-we-build→Philosophy→Launch (not logo→list→logo) | **PASS** — six-beat narrative with a single amber carry-line threading the cuts. |

---

## Verified Assumptions

These claims in the design were checked against source and are **correct**:

1. **Brand palette (§5.1)** — every value matches `src/styles/index.css :root`
   exactly: `ink #06080a`, `graphite #0a0d11`, `surface #10141a`,
   `surface-2 #161b22`, `text #f3f2ee`, `muted #98a1ac`, `faint #6c747f`,
   `accent #e9b978`, `accent-deep #c8964c`, `steel #a9c8d8`,
   `hairline rgba(243,242,238,0.09)` (= `--line`),
   `hairline2 rgba(243,242,238,0.16)` (= `--line-2`). No invented colours.
2. **BrandMark (§5.3)** — `viewBox 0 0 28 28`, `rect x0.5 y0.5 w27 h27 rx6
   strokeOpacity 0.2`, L path `M8 7h3.1v10.9H20V21H8V7Z`, amber bar
   `M14.4 7H20v3.1h-5.6V7Z` all match `Logo.tsx` verbatim. The design correctly
   maps the L fill to `COLOR.text` (source uses `base` = `var(--text)` in the
   light theme) and the bar to `COLOR.accent` (`var(--accent)`).
3. **Photo grade (§6.3)** — `GRADE.filter 'saturate(0.68) contrast(1.05)
   brightness(0.82)'` matches `.media img`; the bottom-up ink scrim
   `rgba(6,8,10,0.72) → transparent @52%`, the 152° duotone, and
   `duotoneAmber rgba(233,185,120,0.16)` / `duotoneSteel rgba(169,200,216,0.14)`
   all match `.media::after`.
4. **Easing (§8)** — `EASE.base/out/inOut` match `--ease`, `--ease-out`,
   `--ease-in-out` in `:root`.
5. **Fonts (§2, §5.5)** — root `package.json` depends on
   `@fontsource-variable/space-grotesk | manrope | jetbrains-mono`; the exact
   vendored files cited (`space-grotesk-latin-wght-normal.woff2`,
   `manrope-latin-wght-normal.woff2`, `jetbrains-mono-latin-wght-normal.woff2`)
   exist under each package's `files/`. They are variable fonts, so the
   `@font-face font-weight: 100 900` + per-component weight approach is valid.
6. **Isolation precedent (§2.1)** — `brand/09-Desktop-Wallpaper/build/` and
   `brand/10-Cofounders-Poster/build/` each exist on disk with their own
   `package.json`, `.gitignore`, and `fetch-fonts.sh` (09 also has a
   `package-lock.json`). The design's correction of the location is accurate, and
   its stated deliberate divergence (root the film's package at `ad/`, not
   `ad/build/`) is reasonable and clearly justified.
7. **Imagery (§6.2)** — every referenced asset exists:
   `studio-night, service-applications, service-websites,
   infrastructure-servers, engineer-network, datacenter-monitor, control-panel,
   it-support, circuit-macro, texture-network, mobile-blank` in
   `src/assets/media`; `arc-glasshouse-reference, ingcebo-reference,
   spartcon-reference` in `src/assets/projects`.
8. **Copy** — all on-screen strings are verbatim from the brief
   (S01, S02, S03 wordmark + sub, the three S04 category lists, S05 two lines,
   S06 tagline). `s06Meta` is derived only from already-approved strings. No
   invented stats, clients, dates, or taglines.
9. **Timeline (§7)** — `120+120+120+270+120+60 = 810` (27.0s @ 30fps);
   contiguous, no gaps/overlaps; S04's `3×90 = 270` beat decomposition is
   internally consistent.

## Unverified / Wrong Assumptions

None. Every externally-grounded claim the design makes was verifiable and
correct. (The root `node_modules/` is not installed in the worktree itself, but
the packages and exact file names were confirmed in the sibling checkout's
`node_modules`, and §5.5 documents the one-time copy step as a build task — this
is not a wrong assumption, just a step the coder must run.)

---

## Findings

### NIT 1 — Grain implementation left as "X or Y" (§8)

**Where:** §8, Grain: "a tiny tiled PNG in `public/`, **or** a cheap procedural
SVG `feTurbulence` rendered once."

**Problem:** Two valid implementations are offered without a decision. The brief
explicitly treats "use X or Y" as an ambiguity. It is low-risk here (both satisfy
the ~4–6% overlay-blend intent), but the coder still has to choose.

**Concrete fix:** Pick one. Recommended: a **procedural SVG `feTurbulence`**
rendered once into a tiled background (no binary asset to vendor, deterministic,
and keeps `ad/public/` to fonts + photos). State:
`Grain = fixed feTurbulence (baseFrequency 0.9, numOctaves 2) at 5% opacity,
mix-blend-mode: overlay, static (not reseeded per frame) to avoid flicker.`

### NIT 2 — `copy.s04` object shape not spelled out (§7.4, §11)

**Where:** §7.4 references `copy.s04.software/.infrastructure/.control`; §11's
snapshot test enumerates only the wordmark/meta strings.

**Problem:** The S04 category titles and list items are given verbatim in prose,
but the exact `copy.ts` object shape (e.g. `{ title, index, items: [...] }`) and
whether the snapshot test asserts those list items are not stated. Since "exact
copy only" is a hard rule, the list items should be under the same drift guard as
the other strings.

**Concrete fix:** Define in §7.4/§11, e.g.
`copy.s04 = { software: { index:'01', title:'SOFTWARE', items:['Custom software','Web applications','Integrations','IoT'] }, infrastructure: { index:'02', title:'INFRASTRUCTURE', items:['IT','Networking','Cloud','Microsoft 365'] }, control: { index:'03', title:'CONTROL + SECURITY', items:['Automation','SCADA','Cybersecurity','CCTV','VoIP'] } }`
and extend the §11 copy snapshot test to assert these too.

### NIT 3 — S01 "foreshadow" amber tick vs. "amber earned at S03" (§7.1 vs §7.2/§7.7)

**Where:** §7.1 offers an "optional single amber **tick** at f100" as a
foreshadow, while §7.1 itself ("the amber is 'earned' at S03"), §7.2 ("the first
deliberate amber") and §7.7 ("first appears as S02's underline") describe amber
as beginning at S02/S03.

**Problem:** A minor internal inconsistency about when the very first amber pixel
appears. It never violates the ≤-one-amber-per-frame rule, but "optional" leaves
the first-amber moment ambiguous, which slightly undercuts the deliberate
"amber is earned" narrative beat.

**Concrete fix:** Resolve the option one way. Recommended: **drop the S01 f100
tick** so S02's underline-under-"build" is unambiguously the first amber, keeping
the "earned" arc clean. If kept, change §7.2/§7.7 wording from "first deliberate
amber" to "first amber *rule*" so the two statements don't conflict.

---

## Verdict rationale (mechanical)

HIGH = 0, MEDIUM = 0, NIT = 3. Zero HIGH/MEDIUM blocking findings → **APPROVED**.
The three NITs are concrete and cheap; the coder can resolve them inline during
implementation without a design loop-back. No finding was downgraded to avoid
blocking — these are genuinely minor, and the substantive risks (brand values,
mark geometry, font strategy, isolation, multi-aspect, no-distortion, amber
discipline, story) are all specified and verified.
