# Cinematic brand film — faithful realization of the approved storyboard, with one timing drift from spec

The branch adds a second, additive Remotion composition (`BrandFilm`, 2700f/90s @30fps, 1920×1080) that tells the approved three-act struggle→turn→transformation story over real Mixkit stock footage, a 16-line edge-tts voice-over, and a two-track score that cross-fades at the discovery moment (f1140). It reuses the existing brand system (graphite ground, single amber accent, the three vendored fonts, `LogoReveal`/`BrandMark`/`AnimatedText`) and resolves into the brand lockup with the four sign-off lines. The implementation closely follows revision 4 of `CINEMATIC-FILM.md`, and the rendered evidence (duration 90.005s, h264+aac, the six key stills) holds up: the struggle frame reads cold and isolated, the turn frame is visibly warmer, the capability titles are readable, and the final lockup is clean. The one place the build diverges from the approved spec is the lockup timing: measured VO durations came in longer than the rev-4 estimates, so one sign-off line ("Small enough to care.") now holds 40 frames (1.33s) rather than the design-locked ≥48f/1.6s.

**Watch for:** one sign-off line holds below the design's ≥48f/1.6s floor (confirmed); the "near-silent before the turn" beat is louder than the brief implies because VO ducking reduces Track A to ~0.3 but it is re-asserted to 0.3 right as `vo05` ends, not driven lower (possible); the GLIBC render shim is a legitimate, isolated infra workaround (confirmed).

**Verdict**: APPROVED

## High-level view

The composition structure is sound and faithful. `BrandFilm` mirrors `LaunchFilm`'s shape — a `FormatContext` provider, the vendored-font `delayRender` gate, nine scenes on a `<Series>`, and the global grade/narration/music/grain layers mounted *outside* the Series so they read absolute film frames while scenes read scene-local frames. The nine scene ranges are a single source of truth in `filmTimeline.ts`, validated at module load to be contiguous from 0 and sum to 2700. The additive isolation is exactly as promised: the only edits to pre-existing files are two imports plus one `<Composition>` in `Root.tsx` and one `render:film` script in `package.json`; the three `LaunchFilm-*` entries are untouched.

The turn at f1140 is carried by three simultaneous, deliberate moves — the music A→B equal-power cross-fade (1140→1200), the grade cool→warm warm-up (1140→1500), and `vo06` naming the partner at 1152 — with the wipe-mask correctly removed so the exact cut frame lands on warm footage rather than black. The stills confirm the warmth delta between f200 and f1140 is real and felt.

The sign-off lockup is where spec and implementation part ways. Rev 4 locked a ≥48f/1.6s full-opacity hold for each of the four sign-off lines. The real measured VO (notably the vision line at 120f vs the ~62f estimate) made it arithmetically impossible to give all four lines a 48f hold while keeping each VO non-overlapping and clearing its beat end by ≥6f inside film09's fixed 288f. The build chose to protect the vision line (104f hold) and the two signature lines (52f each) and absorb the shortfall on "Small enough to care." (40f/1.33s). The ≥6f VO/beat invariant still holds for all 16 lines and is asserted by test; the thing that slipped is the design's own 1.6s hold floor, on one line.

Brand fidelity is intact: graphite ink ground, a single restrained amber accent (the lockup mark bar, atmospheric amber veil capped at 0.5× a low base alpha), Space Grotesk / Manrope / JetBrains Mono, no neon/holograms/glass/particles. Footage is real licensed stock of real people and places. On-screen copy is verbatim-by-reference from `copy.ts` (capability sub-labels are computed joins of the real arrays, SCADA included), with the single approved new line living only in `filmCopy.ts`.

<details>
<summary>Issues (3)</summary>

1. **Lockup hold below spec floor** — "Small enough to care." holds 40f/1.33s, under the design-locked ≥48f/1.6s. Either accept the drift explicitly (it is one of two short signature lines and still clears its VO by ≥6f) or borrow ~8f from the 104f vision-line beat (b2) to lift b3 back to 48f, keeping film09 at 288f.
2. **Near-silent pre-turn beat may not sit as low as the brief implies** — across 1080→1140 Track A holds a plain 0.3 floor; `vo05` ends at 1071, so from ~1083 onward there is no duck multiplying it down further. Confirm by ear that the "held near-silence" before the turn reads as intended rather than a steady mid-low bed; if it needs to be quieter, lower the 1080→1140 floor below 0.3.
3. **Render requires the GLIBC-2.35 shim on this host** — `render:film` only works through `setup-render-binaries.sh`; a plain `remotion render` aborts on glibc 2.34. Isolated and non-invasive (no committed binaries, no app/Remotion code changed), but document it as a hard build prerequisite so a fresh checkout on a 2.34 host doesn't fail opaquely.

</details>

<details>
<summary>Details</summary>

### Lockup timing: measured VO forced one line under the 1.6s floor

Rev 4 of the storyboard made the finale room its headline fix — `film07`/`film08` were trimmed and `film09` grown to 288f precisely so each of the four sign-off lines could hold ≥48f/1.6s at full opacity. The build ran `generate-vo.sh`, measured real durations, and found the vision line at 120f and "Technical enough to build." at 61f — longer than the §6 estimates. `LOCKUP_BEATS` in `filmTimeline.ts` was re-balanced honestly within the fixed 288f: b1 "Built with intention." 60f→52f hold, b2 vision line 120f→104f hold, b3 "Small enough to care." 48f→**40f hold (1.33s)**, b4 "Technical enough to build." 60f→52f hold.

The code comment is candid that the sum of per-line minimums (each VO non-overlapping, each clearing its beat end by ≥6f) exceeds 288f, so all four cannot reach 48f simultaneously. The test gate asserts the ≥6f VO/beat invariant for all 16 lines — and that holds — but it does **not** assert the design's ≥48f hold floor, which is why the b3 drift passed silently. This is a real deviation from the approved spec, though a minor one: b3 is the shorter of the two "small enough / technical enough" signature lines, it is `COLOR.muted` and lower in the frame, and 1.33s is still legible. If strict spec conformance matters, shifting ~8f from b2 (which has a generous 104f hold) to b3 restores the 48f floor without touching film09's total or the ≥6f invariant.

### The turn is a felt shift, not a service-list cut

The money moment is handled the way a film editor would. `Film03_Turn` is one unbroken 480f scene; the three global moves that sell the turn all live at the film level (`MusicBed` cross-fade, `GradeLayer` warm-up) so the scene itself just breathes forward with a gentle 1.04→1.10 push on the meeting shot. The earlier wipe-mask on shot 3.1 — which rendered the exact f1140 cut frame black — was removed, so the shift now lands on warm footage. The f200 vs f1140 stills confirm the delta: f200 is a cold, desaturated top-light laptop shot; f1140 is a warm, window-raked top-view meeting. The warmth is atmospheric (soft-light veils, capped opacity), not a recolor of the source.

```
f1140 shift = three simultaneous moves keyed to one frame
  MusicBed  : A fades 0.3→0  |  B fades 0→0.85   (1140→1200, equal-power)
  GradeLayer: steel veil out |  amber veil in     (1140→1500, eased, then held)
  Narration : vo06 "…a partner who started with the problem" lands 1152
```

### Music bed and the pre-turn near-silence

`MusicBed` plays both tracks full-length with per-frame volume automation and a per-VO duck envelope (`DUCK = 0.45`, ~−7 dB, ramped over `[start−6, start, end, end+12]`, composed by min across overlaps). Track A's authoritative keyframe list holds a 0.3 floor across 1080→1140 — the "held near-silent beat before the turn." Worth an ear check: `vo05` ("There has to be a better way.") ends at frame 1071, so for roughly 1083→1140 nothing ducks Track A below its base, and the base there is a flat 0.3. The design calls this "near-silent," but 0.3 of a 0.9-peak bed is audible-but-low rather than near-silent. The still evidence can't judge this; it needs a listen. If the beat should sit quieter to make the turn land harder, drop the 1080→1140 floor below 0.3 in `TRACK_A.volumes`.

### Footage discipline and brand fidelity

Two details worth confirming beyond the high-level view: `FootageClip` uses `trimBefore` (not the deprecated `trimAfter`/`startFrom`) consistent with Remotion 4.0.533, and sets `muted` on every clip so stock audio never leaks into the `<Audio>` mux. Ken-Burns is parameterized to each shot's own window rather than a fixed 120f, so the push spans the full shot instead of finishing early and holding. The capability captions render the exact `COPY.s04.*.items` arrays joined with ` · ` (SCADA present in control), so on-screen copy cannot drift from the brand source.

### Additive isolation verified

`git diff main` on the two pre-existing files is exactly: two added imports plus one appended `<Composition id="BrandFilm">` in `Root.tsx`, and one added `render:film` script in `package.json`. The existing scripts and the three `LaunchFilm-*` compositions are byte-for-byte unchanged, so the 27s film is untouched. Timeline, music, and narration configs each run a `validate*()` at module load that throws on any contiguity/range/overlap/length violation — the same discipline as the existing `timeline.ts`.

</details>

<details>
<summary>File map</summary>

- `src/BrandFilm.tsx` — the `<Series>` composition; scenes inside, global grade/narration/music/grain outside.
- `src/scenes/film/Film0{1,2,2b,3,5,6,7,8,9}*.tsx` — the nine scenes, 1:1 with the timeline ranges.
- `src/components/film/{FootageClip,Caption,GradeLayer,MusicBed,Narration}.tsx` — footage wrapper, captions, grade veil cross-fade, two-track score + ducking, VO cue mounting.
- `src/config/{filmTimeline,narration,filmCopy,footage,filmGrade,filmMusic}.ts` — scene ranges + lockup beats + load-time validation; measured VO; verbatim-by-reference copy; footage map; grade presets; music plan.
- `src/Root.tsx` — +2 imports, +1 `<Composition id="BrandFilm">` (additive).
- `package.json` — +1 `render:film` script (uses the GLIBC shim via `--binaries-directory`).
- `scripts/setup-render-binaries.sh` — assembles the compositor under a fetched glibc-2.35 loader; no binaries committed.
- `out/VERIFICATION-BRANDFILM.md`, `out/film-stills/*.png`, `out/film-stills/ffprobe.txt`, `out/lumen-labs-brand-film.mp4` — rendered evidence.

Full diff: `git diff main` from `/projects/sandbox/Lumen-Labs/.worktrees/cinematic-film`.

</details>
