# Audio pipeline — Lumen Labs cinematic brand film

This documents the voice-over and music used by the `BrandFilm` composition and
how to regenerate them. **All generated audio is committed**, so a render needs
**no network and no pip** — the scripts below are only for *regenerating* when a
line, voice, or track changes.

> See `CINEMATIC-FILM.md` §6 (narration) and §7 (music) for the design intent.

---

## Voice-over (narration)

- **Tool:** [`edge-tts`](https://github.com/rany2/edge-tts) (keyless Microsoft
  Edge TTS). Installed on this machine at **`/root/.local/bin/edge-tts`**.
- **IMPORTANT:** `edge-tts` is **NOT on the bare `PATH`**. Always invoke it by
  absolute path (or `"$(command -v edge-tts)"`). `scripts/generate-vo.sh` uses
  `EDGE="${EDGE_TTS:-/root/.local/bin/edge-tts}"` and hard-fails if the tool or
  the voice is missing. Override the path with `EDGE_TTS=/path/to/edge-tts`.
- **Voice:** `en-US-AndrewMultilingualNeural` (listed as *Warm, Confident,
  Authentic, Honest*). Documented fallback: `en-US-BrianNeural`. Override with
  `VO_VOICE=...`.
- **Tuning:** `--rate=-8%` (unhurried, calm) and `--pitch=-2Hz` (grounded, not
  boyish). These match the brief's "calm, youthful, human, not corporate" ask.
- **Output per line:** an `.mp3` (the audio Remotion muxes into the MP4) **and**
  a `.vtt` (WebVTT with per-line timing). The VTT last-cue end time is parsed
  into `durationInFrames` @30fps — the **measured** value that
  `src/config/narration.ts` consumes (not an estimate).

### Regenerate the VO

```sh
cd ad
bash scripts/generate-vo.sh      # writes public/audio/vo/vo01..vo16 .mp3 + .vtt
                                 # and public/audio/vo/measured-durations.json
```

The 16 narration lines (ids + text) live inline in `scripts/generate-vo.sh`,
matching `CINEMATIC-FILM.md` §6. `vo13`/`vo15`/`vo16` are the **verbatim**
`src/config/copy.ts` strings (`s06Tagline` / `s05a` / `s05b`); `vo14` is the one
approved new on-screen line. Edit a line in the script and re-run to regenerate.

### Measured VO durations (@30fps, from the VTT last cue)

These are written to `public/audio/vo/measured-durations.json` by the generator
and are the authoritative durations for `narration.ts`:

| id | line | end (s) | frames @30 |
|---|---|---|---|
| vo01 | A business doesn't fail in one big moment. | 3.220 | 97 |
| vo02 | It's the small things. The tools that don't fit. | 3.233 | 97 |
| vo03 | The systems that don't talk. The hours that disappear. | 3.831 | 115 |
| vo04 | You're working harder than ever — and still watching chances slip past. | 4.646 | 140 |
| vo05 | There has to be a better way. | 1.671 | 51 |
| vo06 | Then they found a partner who started with the problem — not a product. | 3.994 | 120 |
| vo07 | Someone small enough to listen. Technical enough to build. | 4.021 | 121 |
| vo08 | And slowly, the pieces started to fit. | 3.192 | 96 |
| vo09 | Software and systems, built around how the business actually works. | 5.108 | 154 |
| vo10 | Infrastructure, networks, the cloud — quietly doing their job. | 4.687 | 141 |
| vo11 | Secured. Connected. Under control. | 3.070 | 93 |
| vo12 | The weight lifts. And the vision has room to grow. | 3.600 | 108 |
| vo13 | Built with intention. | 1.739 | 53 |
| vo14 | Your business has a vision. We build what brings it to life. | 3.994 | 120 |
| vo15 | Small enough to care. | 1.535 | 47 |
| vo16 | Technical enough to build. | 2.010 | 61 |

> **Note for FEAT-003 (lockup re-time).** The measured `vo14` (120f) and `vo16`
> (61f) are **longer** than the §6 estimates (~62f / ~42f). With the §5 lockup
> starts as drafted, `vo14` (start 2490) would overrun its beat-9.2 boundary
> (2568) and `vo16` (start 2640) would overrun the 2700 end by 1f. This is the
> bounded, expected re-time the design flagged (§6 build-order dependency): start
> those lockup lines earlier within their beats and/or rebalance the `film09`
> sub-beats (keeping `film09`'s total). The `narration.test.ts`
> `beatEnd − (voStart + voDuration) ≥ 6` assertion is the gate.

### Regenerating the audio (not committed)

The 16 `.mp3` + `.vtt` files are **git-ignored** (reproducible media is kept out
of the repo — see `.gitignore`). Run `bash scripts/generate-vo.sh` once after a
fresh checkout to write them into `public/audio/vo/`; `render:film` then consumes
them directly, so the render itself never shells out to `edge-tts` or `pip`.
The measured per-line durations are committed in
`public/audio/vo/measured-durations.json` so the timeline is reproducible even
before the audio is regenerated. Regenerate whenever a narration line changes.

---

## Music

Two royalty-free **Mixkit Free Stock Music** tracks (commercial use, no
attribution), cross-faded in-composition to produce the required mid-film
emotional **shift at frame 1140 (38.0s)**.

| Role | id | local file | character |
|---|---|---|---|
| **Track A — tension bed** (Act 1) | 18 | `public/audio/music/track-a-tension.mp3` | restrained, slightly tense, minor |
| **Track B — hopeful** (Act 2–3) | 158 | `public/audio/music/track-b-hope.mp3` | warm, building, optimistic (not cheesy) |

Backups (not committed unless A/B are a poor fit by ear): `168` (A alt),
`187` (B alt). The shift mechanics (fade windows, duck factor) live in
`src/config/filmMusic.ts`. Provenance + source pages are in
`public/audio/music/SOURCES.md`.

### Regenerate the music

```sh
cd ad
bash scripts/fetch-music.sh            # Track A (18) + Track B (158)
bash scripts/fetch-music.sh --backups  # also fetch 168 / 187
```

---

## Footage (for completeness — see `public/footage/SOURCES.md`)

Stock video is fetched by `scripts/fetch-footage.sh` (Mixkit 1080p MP4, Mixkit
Free License). It probes each clip's real `durationInFrames` (via
`@remotion/media-parser`, fallback the bundled
`@remotion/compositor-linux-x64-gnu/ffprobe`) and writes `SOURCES.md`.
`scripts/grab-stills.sh` builds the `_contact/` content-verification sheet.

```sh
cd ad
bash scripts/fetch-footage.sh                 # download + probe + SOURCES.md
bash scripts/fetch-footage.sh --sources-only  # rebuild SOURCES.md only
bash scripts/grab-stills.sh                   # one still per clip -> _contact/
```

---

## Tooling notes

- **No system ffmpeg/ffprobe.** Use the bundled binaries at
  `node_modules/@remotion/compositor-linux-x64-gnu/{ffmpeg,ffprobe}`. Remotion
  itself muxes `<Audio>` into the output MP4 via its bundled ffmpeg at render
  time — no separate mux step is needed.
- **npm is not on `PATH`.** Invoke via
  `node "/opt/toolchains/.nvm/versions/node/v22.23.3/lib/node_modules/npm/bin/npm-cli.js" <args>`
  from the `ad/` directory (see `baseline.md`).
