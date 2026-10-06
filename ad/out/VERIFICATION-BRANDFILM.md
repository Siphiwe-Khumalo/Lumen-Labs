# Verification — Lumen Labs Cinematic Brand Film (`BrandFilm`)

Evidence for the reviewer. All commands were run from
`/projects/sandbox/Lumen-Labs/.worktrees/cinematic-film/ad` with npm invoked via
its full CLI path (npm is not on PATH):
`node /opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js`.

> This file is named `VERIFICATION-BRANDFILM.md` so it does not overwrite the
> pre-existing `out/VERIFICATION.md`, which is the committed verification doc for
> the earlier `LaunchFilm` composition (left untouched).

## 0. Render environment note (GLIBC compatibility shim)

Remotion 4.0.533 ships a prebuilt Linux x64 "gnu" compositor that requires
`GLIBC_2.35`. This build host (Amazon Linux 2023) has **glibc 2.34**, so the
stock compositor aborts with
`libm.so.6: version 'GLIBC_2.35' not found` the moment it extracts a video
frame (pure-graphics frames like the lockup render fine; any `OffthreadVideo`
frame does not). The bundled "musl" compositor is not a drop-in either (its
`libav*.so` expect a musl userland and segfault without one).

Fix (no application/Remotion code changed): `scripts/setup-render-binaries.sh`
assembles a binaries directory containing the **unmodified** gnu compositor,
gnu `ffmpeg`, and gnu `ffprobe`, but replaces the `remotion` compositor with a
one-line wrapper that execs it under a locally-fetched **glibc-2.35** dynamic
loader (from Ubuntu 22.04's `libc6`) via `--library-path`. The `render:film`
script passes that directory to Remotion with `--binaries-directory`. On a host
that already has glibc >= 2.35 the shim is unnecessary and a plain
`remotion render BrandFilm …` works. The fetched loader lives under
`node_modules/` (gitignored); nothing binary is committed.

## 1. Typecheck (strict, zero errors)

```
node "$NPM" run typecheck     # tsc --noEmit -> exit 0, no output
```

Result: **PASS** — zero TypeScript errors.

## 2. Test suite (neutral vitest config; existing copy snapshot unchanged)

```
node "$NPM" run test          # vitest run (ad/vitest.config.ts isolates the suite)
```

Result: **PASS** — 10 files / 55 tests green. Includes:
- `narration.test.ts`: `beatEnd - (startFrame + durationInFrames) >= 6` asserted
  for **all 16 VO lines**; measured VO durations; `vo13/vo15/vo16` === their
  `COPY` members; `vo14` === the spoken form of `FILM_COPY.visionLine`.
- `filmCopy.test.ts`: re-exports (not re-literals) the `COPY` members; adds
  exactly `visionLine`; `controlLine === COPY.s04.control.items.join(' · ')`
  (SCADA present).
- `filmTimeline.test.ts`: nine ranges contiguous from 0, sum to 2700; lockup
  beats tile `film09`; every shot window + inPoint <= its clip duration.
- The pre-existing `copy.test.ts` (2 tests) is unchanged and green.

## 3. Full render

Exact command:

```
node "$NPM" run render:film
# = remotion render BrandFilm out/lumen-labs-brand-film.mp4 \
#     --binaries-directory="$(bash scripts/setup-render-binaries.sh)"
```

Result: **PASS** — rendered 2700/2700 frames and encoded 2700/2700, output
`out/lumen-labs-brand-film.mp4` (~86 MB). Remotion's bundled ffmpeg muxed the
`<Audio>` VO + music tracks into the MP4 (no system ffmpeg).

## 4. ffprobe evidence (bundled ffprobe)

```
node_modules/@remotion/compositor-linux-x64-gnu/ffprobe -v error \
  -show_entries format=duration,size:stream=index,codec_type,codec_name,width,height,sample_rate,channels \
  -of default=nk=0 out/lumen-labs-brand-film.mp4
```

Raw output (also saved to `out/film-stills/ffprobe.txt`):

```
[STREAM]
index=0
codec_name=h264
codec_type=video
width=1920
height=1080
[/STREAM]
[STREAM]
index=1
codec_name=aac
codec_type=audio
sample_rate=48000
channels=2
[/STREAM]
[FORMAT]
duration=90.005000
size=86059774
[/FORMAT]
```

- **Resolution: 1920x1080** (exact) ✓
- **Duration: 90.005s** — inside the 75–90s target (2700f @30fps) ✓
- **Video stream present (h264)** AND **audio stream present (aac, 48 kHz,
  stereo)** — proves `<Audio>` (VO + music) muxing ✓

## 5. Key-beat stills (visual sanity, committed under `out/film-stills/`)

Rendered with `remotion still BrandFilm … --frame=<n> --binaries-directory=<shim>`.

| Still | Frame | Beat | Visual sanity note |
|---|---|---|---|
| `f200.png` | 200 | film01 Struggle | Real stock (hands on a laptop), cool desaturated grade; caption "A business doesn't fail / in one big moment." reads cleanly with air. Cold/isolated, on-brand. |
| `f1140.png` | 1140 | film03 **The Turn** | Lands on footage (not black): a top-view meeting with warm window light raking the table, people collaborating. The world has visibly warmed vs f200 — the shift is felt. |
| `f1620.png` | 1620 | film05 Software (start) | Act-3 warm grade; developer/code footage settling in. |
| `f1700.png` | 1700 | film05 capability | Real code on screen, warm grade; "SOFTWARE" title + mono sub "CUSTOM SOFTWARE · WEB APPLICATIONS · INTEGRATIONS · IoT". Readable, premium. |
| `f2460.png` | 2460 | film09 lockup (9.1) | "Built with intention." centered on near-black — the sign-off opens, unrushed. |
| `f2699.png` | 2699 | film09 **final frame** | Clean settled lockup: BrandMark (amber bar accent) + "LUMEN LABS" wordmark + mono "SOUTH AFRICAN TECHNOLOGY STUDIO". Nothing lingering — a film's last frame. |

Two issues caught and fixed during the still pass, re-rendered before the full
render:
1. The turn (f1140) originally used a left-to-right wipe on shot 3.1, so the
   exact shift frame was black. Removed the wipe so f1140 lands on the warm
   meeting footage; the "light enters" is carried by the grade warm-up + music
   cross-fade + push-in instead.
2. The final sign-off caption ("Technical enough to build.") lingered faintly on
   the last frame. Its fade-out now completes ~6f before 2700 so the final frame
   is the lockup alone. (The full-opacity hold is unchanged.)

## 6. Existing composition untouched

```
node "$NPM" exec -- remotion still LaunchFilm-Vertical out/legacy/f0.png   --frame=0   --binaries-directory=<shim>
node "$NPM" exec -- remotion still LaunchFilm-Vertical out/legacy/f440.png --frame=440 --binaries-directory=<shim>
```

Result: **PASS** — both frames render. `Root.tsx` still registers all three
`LaunchFilm-*` ids; `git diff` to existing files is limited to:
- `src/Root.tsx`: two added imports + ONE appended `<Composition id="BrandFilm">`.
- `package.json`: ONE added `render:film` script (existing scripts unchanged).

Nothing else in the existing LaunchFilm scenes/components/config/DESIGN.md was
modified.

## Addendum — lockup re-time (film-review follow-up)

The film-review (APPROVED) flagged one sign-off line, "Small enough to care.",
holding 40f/1.33s — under the design's >= 48f/1.6s floor. Re-balanced
`LOCKUP_BEATS` + the vo13..vo16 startFrames so every sign-off line now holds
>= 1.5s at full opacity, with the >= 6f VO/beat invariant preserved for all 16
lines (gated by narration.test.ts) and film09 unchanged at 288f:

| beat | line | full-opacity hold |
|---|---|---|
| b1 | Built with intention. | 51f / 1.70s |
| b2 | Your business has a vision… | 110f / 3.67s |
| b3 | Small enough to care. | 45f / 1.50s |
| b4 | Technical enough to build. | 52f / 1.73s |

(With the measured vision line at 120f and the total pinned at 90.0s — the top of
the 75–90s window — 45f is the practical maximum for b3; reaching a strict 48f
would require exceeding 90s.) Re-rendered: `out/lumen-labs-brand-film.mp4`,
ffprobe re-confirmed **90.005s, 1920x1080, h264 + aac 48kHz stereo**. typecheck
clean; 55/55 tests green.
