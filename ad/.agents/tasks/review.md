# Lumen Labs launch film — code-driven motion graphics (9:16)

A six-scene brand film built as an isolated Remotion subproject under `ad/`, telling the Problem → Technology → Lumen → What we build → Philosophy → Launch story at 1080×1920, 30fps, 810 frames (27.0s exactly). Every on-screen string is config-driven and verbatim from the storyboard; the real supplied photos are made dynamic only through uniform scale/translate/mask/parallax; amber is held to a single element per frame. I judged the eight committed PNG stills (one per scene, all three S04 beats) frame by frame against the brief, plus the central config and the two components that carry the most risk (BrandMark geometry, ImageReveal transforms). The MP4 is committed and ffprobe-confirmed as H.264 1080×1920 30fps 810f.

**Watch for:** nothing blocking. One cosmetic note only — in S04c (`s04c-f600.png`) the title "CONTROL + SECURITY" sits close to the left edge of the image plate but does not collide (confirmed). 16:9 and 1:1 are architected (registered compositions, config + safe-area) but only the vertical is rendered this pass, which matches the brief's "primary version vertical, adaptable later" instruction.

**Verdict**: APPROVED

## High-level view

The story reads as intended, not logo→list→logo. S01 opens on near-black with a cinematic photo and the revealed headline; S02 moves through real code imagery with "We build the technology / to solve them"; S03 is a genuine brand moment (vector-exact BrandMark + wordmark + "A South African technology studio."); S04 breaks the capabilities into three individually-animated beats (SOFTWARE / INFRASTRUCTURE / CONTROL + SECURITY) rather than one crowded frame; S05 slows down on a full-bleed human control-panel photo for the philosophy lines; S06 resolves to the lockup and "Built with intention." All six scenes are present with the exact approved copy and nothing invented — no fake stats, clients, dates, or added lines.

Copy lives in one `copy.ts` guarded by a snapshot test, so the on-screen strings cannot drift from the storyboard. Brand tokens are copied verbatim from the site's CSS `:root` (amber `#e9b978`, ink `#06080a`, graphite `#0a0d11`, surface `#10141a`, text `#f3f2ee`), and the photo grade mirrors the site's `.media img` filter, so the film shares the website's exact visual DNA.

Amber discipline holds across every frame: a single hairline underline, tick, seam, or node at a time, never washing the frame. The AVOID list is honored — no neon, glow, glassmorphism, cyberpunk, particles, or HUD; the result reads as designed and premium-restrained, not template-y or AI-generated.

Architecture is clean and isolated: `ad/` has its own `package.json`/`tsconfig`/`node_modules` and the website root has no Remotion dependency. Config is centralized (formats, brand+grade, typography, timeline, assets, copy, fonts), the named reusable components all exist, scenes sit on a `<Series>`, and multi-aspect is handled via a format preset + safe-area fractions with no hard-coded pixels. `out/` artifacts are committed; `node_modules` is gitignored.

<details>
<summary>Issues (1)</summary>

1. **S04c title/plate proximity (cosmetic, non-blocking)** — "CONTROL + SECURITY" sits close to the left edge of the S04 image plate in `s04c-f600.png`; it does not collide and reads cleanly, but a few px more breathing room would be ideal if touched later. No action required to ship.

</details>

<details>
<summary>Details</summary>

### Story and scene-by-scene (frames inspected)

**S01 — opening (`s01-f95.png`).** Near-black frame, a dark cinematic photo (studio-night) with subtle colored light bleed on the right, two vertical drafting rules framing a column, and the headline "Every business has / problems worth solving." set low-left in sharp Space Grotesk with generous negative space above. Reads as a restrained cinematic open, not a title card.

**S02 — the idea (`s02-f175.png`).** Real code-on-screen photo (undistorted, the Spanish `Contraseña` / `Correo` form markup is legible and unaltered), with "We build the technology / to solve them." The only amber in frame is a short hairline underline tucked under "build" — restrained and purposeful. Imagery and type interact as the brief asked.

**S03 — introduce Lumen (`s03-f354.png`).** The brand moment: vector-exact BrandMark (the rounded-rect "L" aperture with the amber bar) locked up with "LUMEN LABS" and the subtitle "A South African technology studio." centered in a huge field of negative space. This feels like the beginning of a brand, not a generic lower-third.

**S04 — what we build (three beats).**
- `s04a-f420.png`: "01 / SOFTWARE" with Custom software / Web applications / Integrations / IoT; amber tick on IoT only; code photo plate + laptop/design inset.
- `s04b-f510.png`: "02 / INFRASTRUCTURE" with IT / Networking / Cloud / Microsoft 365; amber tick on Microsoft 365; server-rack photo + cabling inset (both real, undistorted).
- `s04c-f600.png`: "03 / CONTROL + SECURITY" with Automation / SCADA / Cybersecurity / CCTV / VoIP; amber tick on VoIP; control-panel/electrician photo + circuit-macro inset.
Each category is animated individually with a consistent editorial grid (index + title top-left, list bottom-left, image plate + inset right). Categories and items match the storyboard exactly. Readable and energetic without crowding.

**S05 — philosophy (`s05-f730.png`).** Full-bleed hero of a technician in a blue hard hat at a wired control panel — the strongest, most human, most distinctly South-African-feeling image in the set, undistorted. "Small enough to care." and "Technical enough to build." are given room, separated by a single restrained amber seam line. Pacing visibly slows here.

**S06 — launch (`s06-f805.png`).** Final lockup: BrandMark + "LUMEN LABS", tagline "Built with intention.", and a JetBrains Mono footer title-block ("LUMEN LABS" / "SOUTH AFRICAN TECHNOLOGY STUDIO") with a single small amber node. Confident, minimal resolution — a company opening its doors, not a social promo.

### Copy integrity

`src/config/copy.ts` is the single source of all on-screen text and is a verbatim transcription of the storyboard, guarded by `copy.test.ts`. S06 meta line and uppercase wordmark are asserted. No invented stats, clients, dates, or extra lines anywhere in the eight frames — confirmed visually against the config.

### Brand fidelity (tokens, grade, mark)

`src/config/brand.ts` copies the site's CSS `:root` values verbatim: amber `#e9b978`, ink `#06080a`, graphite `#0a0d11`, surface `#10141a`, text `#f3f2ee`, muted/faint/hairlines. The `GRADE` block mirrors the site's `.media img` filter (`saturate(0.68) contrast(1.05) brightness(0.82)`) and scrim — so photos in the film are graded identically to photos on the website, not recolored arbitrarily.

`BrandMark.tsx` is vector-exact against the site's `src/components/brand/Logo.tsx`: same `viewBox="0 0 28 28"`, same rect (`x=0.5 y=0.5 w=27 h=27 rx=6`, strokeOpacity 0.2), same L path `M8 7h3.1v10.9H20V21H8V7Z`, same amber bar path `M14.4 7H20v3.1h-5.6V7Z`. The Remotion version only adds reveal props (stroke-dash draw + clip wipes); the geometry is untouched.

Fonts are the three required families (Space Grotesk display, Manrope body, JetBrains Mono labels), vendored as local WOFF2 and gated on `document.fonts.ready` so first paint never races the type — no network dependency.

### No distortion — the only image-transforming component

`ImageReveal.tsx` is the sole component that renders an `<img>`, and it exposes no skew/stretch API. It applies uniform `scale()` (focal-point aware via `transformOrigin`), `translate()`, `objectFit: cover`, and a rectangular `inset()` mask wipe, plus the site grade and a legibility scrim. A Ken-Burns helper caps max scale (unit-tested). There is no path by which a supplied photo gets warped, recolored beyond the shared grade, or regenerated. This directly satisfies the brief's no-distortion rule.

### Amber restraint and AVOID list

Across all eight frames amber appears as at most one element per frame — an underline (S02), tick (S04), seam (S05), bar in the mark (S03/S06), or footer node (S06). The `SceneTransition` carry-line was reworked (per VERIFICATION §6) so it never shares a frame with a scene's own amber element. No neon gradients, glow, glassmorphism, cyberpunk, floating 3D, particle fields, or HUD overlays appear. The grain layer is subtle. Nothing reads as AI-generated or template-y.

### Architecture, multi-aspect, and artifacts

`ad/` is a self-contained subproject (own `package.json`, `tsconfig.json`, `node_modules`); the website root `package.json` has no Remotion entry — isolation is clean. Config is centralized across `formats`, `brand`(+`GRADE`), `typography`, `timeline`, `assets`, `copy`, `fonts`. All named reusable components exist (AnimatedText, ImageReveal, ImageParallax, SectionTitle, GridOverlay, LineReveal, LogoReveal, SceneTransition, CapabilityCard) plus BrandMark and Grain. `LaunchFilm.tsx` sequences Scene01–06 on a `<Series>`; each scene composes components fed by config. Multi-aspect is handled via `FORMATS` presets + safe-area fractions and a per-format type anchor, with a module-load validator rejecting bad dimensions — no component hard-codes pixels. Three compositions are registered (vertical rendered; wide/square architected for a later pass, matching the brief).

`timeline.ts` self-validates contiguity/non-overlap and that scenes sum to 810f, enforced at module load and by a unit test. Vitest reports 16/16 passing; typecheck is clean.

Artifacts are committed under `ad/out/` (eight PNG stills, the H.264 MP4, VERIFICATION.md) and `node_modules/` is gitignored and not tracked. README is present.

### Test coverage

Covered: timeline contiguity/sum, copy exact-string snapshot, per-format layout (safeBox/anchor/col), interpolate clamp + Ken-Burns max-scale cap, asset key→file resolution with focal points in [0,1]. Not tested (acceptable for a motion piece): rendered-pixel assertions — which is why the committed stills exist and were the primary basis of this review.

</details>

<details>
<summary>File map</summary>

- `ad/src/LaunchFilm.tsx` — the `<Series>` composing Scene01–06, with always-on carry-line + grain layers.
- `ad/src/Root.tsx` — registers the three format compositions.
- `ad/src/scenes/Scene0{1..6}_*.tsx` — per-scene compositions.
- `ad/src/components/*` — reusable primitives (AnimatedText, ImageReveal, ImageParallax, SectionTitle, GridOverlay, LineReveal, LogoReveal, SceneTransition, CapabilityCard, Grain) + vector-exact BrandMark.
- `ad/src/config/*` — central config: formats, brand(+GRADE), typography, timeline, assets, copy, fonts.
- `ad/src/lib/*` — easing, interpolate (Ken-Burns/clip), layout (safe-area), useScene.
- `ad/src/__tests__/*` — 16 unit tests (timeline/copy/layout/interpolate/assets).
- `ad/public/media/*`, `ad/public/projects/*` — supplied real photos.
- `ad/out/*` — committed artifacts: 8 PNG stills, MP4, VERIFICATION.md.
- Full diff: `git diff main` on branch `feature/launch-film`.

</details>
