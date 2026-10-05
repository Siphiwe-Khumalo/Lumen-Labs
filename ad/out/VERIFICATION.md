# Verification — Lumen Labs Launch Film

Evidence for the reviewer. All commands were run from
`/projects/sandbox/Lumen-Labs/.worktrees/launch-film/ad` with npm invoked via its
full cli path (npm is not on PATH):
`node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js`.

## 1. Typecheck (zero TS errors, strict mode)

```
npm run typecheck   # tsc --noEmit → exit 0, no output
```

Result: **PASS** — zero TypeScript errors.

## 2. Unit tests (Vitest)

```
npm test            # vitest run
```

Result: **PASS** — 5 files, 16 tests. Covers:
- `timeline` contiguous / non-overlapping / sums to 810f;
- `copy` exact storyboard strings (incl. `s06Meta` and uppercase `LUMEN LABS`);
- `layout` safeBox/anchor/col per format;
- `interpolate` clamp behaviour + Ken-Burns max-scale cap;
- `assets` every key maps to a file, focal points in [0,1].

## 3. Compositions registered

```
npx remotion compositions
```

```
LaunchFilm-Vertical    30   1080x1920   810 (27.00 sec)
LaunchFilm-Wide        30   1920x1080   810 (27.00 sec)
LaunchFilm-Square      30   1080x1080   810 (27.00 sec)
```

Result: **PASS** — all three formats registered; only the vertical is rendered
(16:9 / 1:1 are architected for a later pass per DESIGN §12).

## 4. Representative stills (one per scene; all three S04 beats)

```
npx remotion still LaunchFilm-Vertical out/frames/<name>.png --frame=<n>
```

| File | Global frame | Scene / content |
|---|---|---|
| `out/frames/s01-f95.png`  | 95  | S01 opener — headline revealed, drafting rules, dark cinematic photo |
| `out/frames/s02-f175.png` | 175 | S02 — "We build the technology / to solve them.", amber underline under "build" |
| `out/frames/s03-f354.png` | 354 | S03 — LUMEN LABS lockup + mark (amber bar) + "A South African technology studio." |
| `out/frames/s04a-f420.png`| 420 | S04 beat A — 01 / SOFTWARE, list, amber tick on IoT |
| `out/frames/s04b-f510.png`| 510 | S04 beat B — 02 / INFRASTRUCTURE, server rack + inset |
| `out/frames/s04c-f600.png`| 600 | S04 beat C — 03 / CONTROL + SECURITY, 5-item list, amber tick on VoIP |
| `out/frames/s05-f730.png` | 730 | S05 — both philosophy lines + amber seam over the hard-hat hero |
| `out/frames/s06-f805.png` | 805 | S06 — final lockup + "Built with intention." + mono title-block, single amber node |

Result: **PASS** — fonts load locally (no network), all assets resolve, every
scene composes with correct type.

## 5. Full MP4 render (delivered 9:16)

```
npm run render   # remotion render LaunchFilm-Vertical out/lumen-labs-launch-9x16.mp4
```

Output: `out/lumen-labs-launch-9x16.mp4` (~8.6 MB).

ffprobe (bundled with @remotion/compositor):

```
codec_name=h264
width=1080
height=1920
r_frame_rate=30/1
nb_frames=810
duration=27.000000
```

Result: **PASS** — H.264, 1080×1920, 30fps, 810 frames, 27.000s exactly.

## 6. Visual inspection notes (iterated on rendered output)

Each PNG was opened and judged, not just compiled. Fixes made after inspecting
the first render pass:
- Reduced the hero/display type scale so the longest pre-wrapped lines
  ("We build the technology", "LUMEN LABS") fit inside the vertical safe box
  without clipping the frame edge.
- Reworked `SceneTransition` so the amber carry-line is active only during the
  identity moments (S02→S03 ignition, S06 lockup) and never shares a frame with a
  scene's own amber element — preserving the "≤ one amber element per frame"
  discipline (earlier it doubled up with the S02 underline / S04 tick).
- Shifted the S04 image plate right and trimmed the SectionTitle size so the
  longest title ("CONTROL + SECURITY") no longer collides with the photo plate.

Verified against the brief: type is sharp with real negative space; amber is
restrained (a single hairline / tick / node at a time); each scene reads in its
time budget; photos are undistorted (uniform scale + translate + mask only, under
the site grade); no neon / glow / glassmorphism / cyberpunk / particles / HUD /
AI-look. The result reads as designed, not template-y.
