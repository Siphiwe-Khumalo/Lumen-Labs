# Lumen Labs — Cinematic Brand Film (DESIGN + STORYBOARD)

> **Artifact.** This document is the approved-pending design for a NEW, second
> Remotion composition: a 1:15–1:30 cinematic brand film that tells a
> three-act story (struggle → turn → transformation) using **real licensed
> stock footage**, a **narration voice-over**, and a **music bed with a mid-film
> emotional shift**, rendered to a real MP4 with embedded audio.
>
> It is **additive**. Nothing in the existing `LaunchFilm` compositions, scenes,
> components, or shared config changes behaviour; the single edit to an existing
> file is appending one `<Composition>` to `Root.tsx` (§3, §3.4). The old
> 27–29.5s motion-graphics film and its `DESIGN.md` stay exactly as they are.
> Everything new lives under new ids, new directories (`src/scenes/film/`,
> `src/components/film/`), and new config files, reached through one new
> `package.json` script.
>
> **Revision 4 (orchestrator finalization).** Resolves the rev-3 design review
> (verdict CHANGES_REQUESTED: 1 HIGH, 2 MEDIUM, 6 NIT) directly, since all three
> blockers were tight numeric/timing fixes, not re-architecture. Changes:
> **(HIGH F3 + MEDIUM F2 — finale room)** `film07`/`film08` trimmed 180→156 each
> and `film09` grown 240→**288** (total unchanged at 2700); the four sign-off
> beats re-timed to 72/84/66/66f so each gets a **≥48f/1.6s full-opacity hold**
> and every lockup VO window clears its beat boundary by **≥14f** (the ≥6f
> invariant now holds with margin; `narration.test.ts` asserts
> `beatEnd − (voStart+voDuration) ≥ 6` for all 16 lines). **(MEDIUM F1 — music)**
> Track A automation is now `clipN(f,[0,60,1020,1080,1140,1200],[0,0.9,0.9,0.3,0.3,0])`
> — the 0.3 floor is genuinely **held across 1080→1140**, matching §1/§2/§5/§7.
> **(NIT F4)** `trimAfter` documented as deprecated in 4.0.533 (use `trimBefore` +
> `durationInFrames`). **(NIT F5)** clips `8739/914/4840/4831` added to an explicit
> "eyeball before authoring" list. Remaining rev-3 NITs are editorial and folded
> into the relevant sections. VO starts for `vo13`–`vo16` updated to the new beats
> and remain authoritative only after `generate-vo.sh` measures real durations.
>
> **Revision 3 (superseded).** This superseded revision 2 after a second design review of rev 2
> (`.agents/tasks/cinematic-film/design-review.{json,md}`, verdict
> CHANGES_REQUESTED: 0 HIGH, 1 MEDIUM, 4 NIT — all rev-1 blockers confirmed
> resolved). Every rev-2 finding is now resolved; the point-by-point responses are
> at the end of §16. The one blocking change: Track A's music automation now folds
> in the near-silent dip to 0.3 across 1080–1140, so the single keyframe list and
> the prose agree (rev-2 F1). The four NITs — the real `kenBurns` options-object
> call shape (F2), an explicit "generate VO before finalizing the lockup" build
> dependency with `vo14`–`vo16` flagged (F3), `Caption.tsx` owning the fade-out
> (F4), and one consistent grade warm-up window 1140→1500 (F5) — are folded in.
>
> **Revision 2 (superseded).** Resolved the first review (2 HIGH, 4 MEDIUM, 5 NIT):
> edge-tts installed and verified (F1); `FILM_DURATION` raised to **2700** with the
> lockup fully specified per-beat (F2); C7 renders the exact 5-item `control`
> array incl. SCADA (F3); a content-verification gate, VO durations + numeric
> ducking, and a hard clip-length invariant added (F4–F6).

---

## 0. Technology stack (LOCKED on approval)

| Concern | Choice | Why |
|---|---|---|
| Renderer | **Remotion v4.0.533** (verified installed), React 19, TypeScript strict | Reuse the exact toolchain the repo is pinned to. No new runtime deps. |
| Video in composition | **`<OffthreadVideo>`** from `remotion` | The only correct primitive for frame-accurate stock-footage playback during a render; `<Video>` is for preview only. Verified exported in 4.0.533. |
| Audio in composition | **`<Audio>`** from `remotion` with `volume` automation | Remotion muxes `<Audio>` into the output MP4 automatically via its bundled ffmpeg (`@remotion/renderer`) — no system ffmpeg. |
| Stock video source | **Mixkit** (`assets.mixkit.co`), 1080p MP4, Mixkit Free License, commercial use, **no attribution, keyless** | Re-verified live: footage ids `8739, 4809, 1728, 30012, 49878` return `206 video/mp4` on range requests (§8). Pexels/Pixabay video need API keys — rejected. |
| Voice-over | **edge-tts 7.2.8**, voice **`en-US-AndrewMultilingualNeural`** | Keyless. **Installed + verified this pass** (`python3 -m pip install --user edge-tts`; binary at `~/.local/bin/edge-tts`; voice confirmed present via `--list-voices`; a real `Built with intention.` MP3 + VTT was generated — §6). |
| Clip-duration probe | **`@remotion/media-parser` `parseMedia`** (installed), with the bundled `@remotion/compositor-linux-x64-gnu/ffprobe` as a fallback | Keyless, no system ffmpeg. Reads each clip's real `durationInFrames` at fetch time to enforce the window-length invariant (§6/§11, F6). |
| Music | **Mixkit Free Stock Music** MP3 (keyless, no attribution) | Two tracks cross-faded in-composition for the required mid-film musical shift (§7). Ids `18` + `158` re-verified `206 audio/mpeg`. |
| Fonts | The already-vendored WOFF2 (Space Grotesk / Manrope / JetBrains Mono) via `config/fonts.ts` | Zero-network, deterministic, metric-parity — reuse unchanged. |
| Delivery | **16:9 1920×1080** MP4 as PRIMARY, h264 | Brief names 16:9 1920×1080 primary. The existing `FORMATS.wide` preset is already 1920×1080@30. |
| Grade | CSS `filter` overlays keyed to `GRADE` tokens in `brand.ts` | Non-destructive; uniform scale/crop/Ken-Burns only; never recolour or distort the source. |

**Frame rate:** 30fps everywhere (matches the whole project).
**Total length:** **2,700 frames = 90.0s** (the upper edge of the 75–90s /
2250–2700f window). Raised from 2520 in rev 1 to give the four sign-off
statements genuinely comfortable, non-truncated holds (review F2). Rationale §4.

---

## 1. Overview

The film opens before dawn on a business owner who is doing everything right and
still losing — clients slipping away, systems that don't talk to each other,
hours spent fighting tools instead of building the business. We hold on that
weight. The grade is cool and desaturated; the music is a single restrained,
slightly tense piano/strings bed; the narration is sparse and quiet. We let
scenes **breathe** — several shots do not move at all.

At a precise, named moment — **frame 1140 (38.0s), the start of Act 2** — the
film **turns**: the narration names the decision, the music cross-fades from the
tense bed into a warmer, hopeful track, the colour grade warms (the amber veil
and brightness rise), and the cutting loosens from heavy, long, static holds
into calmer forward motion. Lumen Labs is introduced **not** as a magic
technology company but as a practical partner that understood the problem and
built around the business.

Act 3 shows the transformation: the same kinds of work — software, web apps, IT
infrastructure, networking, cloud/Microsoft 365, cybersecurity, CCTV, VoIP, IoT
— now shown as **calm, working, connected** systems and confident people, told
visually rather than as a list. The film resolves into the existing brand
lockup: `BrandMark`/`LogoReveal`, the four sign-off statements each given room
to breathe, and the wordmark. The last ~15 seconds are pure brand film.

The emotional curve, in one line: **heavy and cold → a clean break → warm,
clear, growing → still, confident resolution.**

---

## 2. The three-act narrative & emotional arc

| Act | Frames | Time | Emotional state | Grade | Music | Cutting / motion |
|---|---|---|---|---|---|---|
| **ACT 1 — THE STRUGGLE** | 0–1140 | 0:00–38:00 | tension, isolation, friction, missed chances | cool, desaturated, dark (`gradeCool`) | Track A — restrained/tense bed, building | long static holds; a few shots do **not** move; one hard pre-dawn cut |
| **ACT 2 — THE TURN** | 1140–1620 | 38:00–54:00 | relief, recognition, "someone gets it" | **warming over the first ~12s of Act 2 (`gradeCool → gradeWarm`, 1140→1500), then held warm** | **cross-fade A→B at f1140–1200**; B = warmer, hopeful | motion unlocks; gentle forward push-ins; first real breath of light |
| **ACT 3 — TRANSFORMATION & RESOLUTION** | 1620–2700 | 54:00–90:00 | clarity, confidence, growth, pride | warm, brighter, confident (`gradeWarm`), amber at its fullest (still restrained) | Track B at full, then a soft tail under the lockup | assured, calm; capability montage breathes; ends on stillness |

**THE DISCOVERY / SHIFT POINT is frame 1140 (38.0s)** — the first frame of Act 2.
Everything keys to it: the music cross-fade window opens here, the grade begins
its warm-up here, and the narration line that *names the turn* ("Then they found
a partner…") lands here. It is a single, deliberate, noticeable shift — not a
gradual drift and not a cheesy "ta-da".

---

## 3. How this reuses vs. extends the existing architecture

**Principle:** everything new is additive; **nothing existing is modified in
behaviour**. The *only* edit to an existing file is appending one new
`<Composition>` to `Root.tsx` (§3.4) — the existing `LaunchFilm-*` entries,
scenes, components, and shared config are untouched. The new film is a sibling of
`LaunchFilm`, not a fork of it. (Review F8: the rev-1 absolute "nothing existing
is edited" headline is corrected to this precise wording.)

### 3.1 Reused unchanged (imported as-is)
- `config/brand.ts` — `COLOR`, `GRADE` tokens. **No edits.** New grade presets in
  the new config are *composed from* these tokens, not replacements.
- `config/typography.ts` — `FONT`, `typeScale(S)`. Reused for all on-screen type.
- `config/fonts.ts` — `fontFaceCss()` and the `delayRender` font-gate pattern.
- `config/copy.ts` — the verbatim strings `s05a` ("Small enough to care."),
  `s05b` ("Technical enough to build."), `s06Tagline` ("Built with intention."),
  `s03Wordmark`/`s06Meta[0]` ("LUMEN LABS"), `s06Meta[1]` ("SOUTH AFRICAN
  TECHNOLOGY STUDIO"), and the `s04.*.items` capability arrays. **Not edited.**
  The one new line lives in the new `config/filmCopy.ts` (see §3.3/§9) so
  `copy.ts`'s snapshot test stays green.
- `lib/layout.ts` — `FormatContext`, `useFormat`, `safeBox`, `anchor`, `col`,
  `shortSide`. Reused for safe-area-correct 1920×1080 layout.
- `lib/interpolate.ts` — `clip`, `clipN`, `tracking`, `kenBurns` (its 0.08
  max-scale-delta clamp is exactly the Ken-Burns discipline we want on footage).
- `lib/easing.ts` — `EASE`, `SPRING`.
- Components: `AnimatedText`, `BrandMark`, `LogoReveal`, `LineReveal`,
  `SectionTitle`, `Grain`. Reused verbatim.
- `config/formats.ts` — `FORMATS.wide` (1920×1080@30) is reused as the film's
  format object. **No edits.** (A future vertical cut could reuse
  `FORMATS.vertical`; out of scope now.)

### 3.2 Reused with a thin new wrapper (not edited)
- `ImageReveal` / `ImageParallax` operate on `<Img>`. Footage needs
  `<OffthreadVideo>`, so a **new** `components/film/FootageClip.tsx` mirrors
  `ImageReveal`'s *discipline* (uniform cover-scale, focal origin, Ken-Burns via
  `kenBurns()`, grade filter, scrim/duotone) but renders `<OffthreadVideo>`.
  `ImageReveal` itself is untouched. **Note (review F7):** `ImageReveal`'s
  Ken-Burns window is hard-coded to 120f; `FootageClip` instead parameterizes the
  window to **the clip's own `durationInFrames`** (`kenBurns(frame, [startFrame,
  startFrame + durationInFrames], { fromScale, toScale, panX, panY, easing })` —
  scale endpoints go in the options object, matching the real helper signature in
  `src/lib/interpolate.ts`) so the push spans the whole shot rather
  than finishing early and holding. So it mirrors the *clamp and no-distortion
  discipline*, not the literal fixed window.

### 3.3 New, additive files (nothing above is modified)

```
ad/
  src/
    BrandFilm.tsx                 NEW  the <Series> for the cinematic film
    config/
      filmTimeline.ts             NEW  FILM_FPS, FILM_SCENES ranges, FILM_DURATION, validateFilmTimeline()
      filmCopy.ts                 NEW  re-exports the verbatim copy.ts strings + the ONE new line
      narration.ts                NEW  the full VO script (swappable): id/text/startFrame/durationInFrames/file
      footage.ts                  NEW  FOOTAGE map: key → local file + source URL + focal point + grade key + durationInFrames
      filmGrade.ts                NEW  gradeCool / gradeWarm presets COMPOSED from brand.ts GRADE tokens
      filmMusic.ts                NEW  music track metadata + the shift frame + fade windows + duck factor
    components/film/
      FootageClip.tsx             NEW  <OffthreadVideo> cover/Ken-Burns/grade wrapper (mirrors ImageReveal discipline)
      Narration.tsx               NEW  mounts <Audio> VO cues at their start frames
      MusicBed.tsx                NEW  two <Audio> tracks with volume automation + cross-fade at the shift + VO ducking
      GradeLayer.tsx              NEW  animated grade veil that warms Act1→Act3 (uses filmGrade presets)
      Caption.tsx                 NEW  minimal on-screen copy; delegates the entrance reveal to AnimatedText, OWNS the hold + fade-out via its own outer opacity wrapper
    scenes/film/
      Film01_Struggle.tsx         NEW
      Film02_Friction.tsx         NEW
      Film02b_Weight.tsx          NEW
      Film03_Turn.tsx             NEW
      Film05_BuildSoftware.tsx    NEW
      Film06_BuildInfra.tsx       NEW
      Film07_BuildControl.tsx     NEW
      Film08_Resolution.tsx       NEW
      Film09_Lockup.tsx           NEW
  public/
    footage/                      downloaded Mixkit MP4s + SOURCES.md (dir exists)
    audio/vo/                     edge-tts MP3s (+ .vtt word timing), committed (dir exists)
    audio/music/                  Mixkit music MP3s + SOURCES.md (dir exists)
  scripts/
    fetch-footage.sh              NEW  downloads clips, probes duration, writes SOURCES.md + footage durations
    generate-vo.sh                NEW  regenerates all VO from narration.ts via edge-tts (hard-fails if missing)
    fetch-music.sh                NEW  downloads the two music tracks, writes SOURCES.md
  AUDIO.md                        NEW  documents VO voice + install + regeneration + music
```

(Review F13 carryover: there is no `Film04_Partner.tsx` — Act 2 is one scene,
`Film03_Turn.tsx`. Scene files are 1:1 with the nine timeline ranges in §4.)

### 3.4 Root registration & scripts (additive)
- `Root.tsx` gains **one** new `<Composition id="BrandFilm">` entry
  (1920×1080@30, `FILM_DURATION` frames, `defaultProps={{ format: FORMATS.wide }}`).
  The three existing `LaunchFilm-*` compositions are left exactly as they are.
  Verified: `Root.tsx` currently registers exactly those three compositions
  sharing one `LaunchFilm` component, so appending a fourth is non-destructive.
  *(If zero edits to `Root.tsx` were required, the fallback is a separate
  `RootFilm.tsx`; but Remotion registers all compositions from one Root, so
  appending one `<Composition>` is the idiomatic, lowest-risk choice and is what
  this design specifies.)*
- `package.json` gains **one** new script; existing scripts are untouched:
  ```json
  "render:film": "remotion render BrandFilm out/lumen-labs-brand-film.mp4"
  ```
  Output: `ad/out/lumen-labs-brand-film.mp4` (16:9 1920×1080, audio embedded).
- `remotion.config.ts` is reused unchanged (h264, jpeg frames, angle GL,
  overwrite). These defaults are correct for footage + audio.

---

## 4. Timeline & frame budget (30fps)

`FILM_DURATION = 2700` frames = **90.0s** (upper edge of 2250–2700). Act 1 is a
long, heavy build (the brief says *open here* and *do not rush*); Act 2 is a
clean 16s turn; Act 3 is spacious and ends with a **600-frame (20s) lockup act**
so the four sign-off statements each get a comfortable, non-truncated hold.
`validateFilmTimeline()` (same contract as the existing `validateTimeline()`)
asserts the scenes are contiguous, start at 0, and sum to 2700 — throwing the
exact mismatch otherwise.

| Scene | Frames | Len | Time | Act | Beat |
|---|---|---|---|---|---|
| `film01` Struggle | 0–390 | 390 | 0:00–13:00 | 1 | pre-dawn; the owner alone with the weight |
| `film02` Friction | 390–780 | 390 | 13:00–26:00 | 1 | disconnected systems, missed opportunity |
| `film02b` Weight | 780–1140 | 360 | 26:00–38:00 | 1 | the low point; tension peaks, then a held beat of near-silence |
| `film03` Turn | 1140–1620 | 480 | 38:00–54:00 | 2 | **SHIFT @1140**; a partner who listens; light enters |
| `film05` Software | 1620–1860 | 240 | 54:00–62:00 | 3 | software / web apps / integrations / IoT |
| `film06` Infra | 1860–2100 | 240 | 62:00–70:00 | 3 | IT / networking / cloud / Microsoft 365 |
| `film07` Control | 2100–2256 | 156 | 70:00–75:12 | 3 | automation / SCADA / cybersecurity / CCTV / VoIP |
| `film08` Resolution | 2256–2412 | 156 | 75:12–80:12 | 3 | confident people; growth; warm golden light |
| `film09` Lockup | 2412–2700 | 288 | 80:12–90:00 | 3 | the brand film ending (BrandMark + 4 statements, each generously held) |

Sum: 390+390+360+480+240+240+156+156+288 = **2700** ✓ (contiguous from 0).

> Finale budget (review rev-3 F2/F3): `film07`/`film08` trimmed 180→156 each
> (−48f total) and `film09` grown 240→288 (+48f) so the four sign-off statements
> each get a full-opacity hold of **≥48f/1.6s** and every lockup VO window clears
> its beat boundary by **≥6f**. Total unchanged at 2700. Per-beat holds are in §5.

> Act 1 is three scenes (`film01`, `film02`, `film02b`) so the slow build has
> three breathing beats; Act 2 is one 16-second scene (`film03`) so the turn is
> one unbroken emotional move; Act 3 is five scenes. The lockup (`film09`) grew
> from 120f to **240f** vs rev 1 — this is the core F2 fix (its per-beat
> sub-ranges are fully specified in §5, not deferred).

**Scene set (nine files, nine ranges, 1:1):** `Film01_Struggle`,
`Film02_Friction`, `Film02b_Weight`, `Film03_Turn`, `Film05_BuildSoftware`,
`Film06_BuildInfra`, `Film07_BuildControl`, `Film08_Resolution`, `Film09_Lockup`.

---

## 5. Shot-by-shot storyboard

Conventions: **Clip** = Mixkit id → local file in `public/footage/`. All source
URLs are `https://assets.mixkit.co/videos/<id>/<id>-1080.mp4` and are listed with
license in §8 and in `public/footage/SOURCES.md`. **Move** = camera/Ken-Burns
(all via `kenBurns(frame, [startFrame, startFrame + durationInFrames],
{ fromScale, toScale, panX?, panY?, easing })` — the real helper signature, scale
endpoints in the options object — over the shot's own frame window, scale delta
≤ 0.08, focal origin from `footage.ts`). **Grade** = `gradeCool` (Act 1), warming through
Act 2, `gradeWarm` (Act 3). **Copy** holds are generous (brief: never rush text).
**VO** ids map to `narration.ts` (§6).

> On-screen text appears **only** in shots marked with a Copy row. Many shots
> deliberately carry **no text** so statements get room to breathe.

### ACT 1 — THE STRUGGLE  (0–1140 / 0:00–38:00)  grade: `gradeCool`, Track A

**film01 — Struggle (0–390 / 0:00–13:00)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 1.1 | 0–150 | Worried, tired person in the quiet of early morning, hand to face, the day not started yet | **8739** `struggle-worried.mp4` ("Worried and sad woman, outdoors") | **static** (no move) — let it sit | — | — (silence; music bed only) |
| 1.2 | 150–390 | Open office before anyone arrives / empty desks, cold light; the realities waiting | **914** `office-open.mp4` ("Open office space") | slow 1.06→1.10 push-in | `A business doesn't fail\nin one big moment.` (fade in 162→188, hold, out 348→378) | `vo01` |

**film02 — Friction (390–780 / 13:00–26:00)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 2.1 | 390–560 | Stacks of paperwork / manual process on a desk; time lost to admin | **221** `office-glasses-reflection.mp4` ("Reflection of a screen in glasses") | static hold, faint drift | — | `vo02` |
| 2.2 | 560–780 | Hands typing into one more disconnected tool; a spreadsheet standing in for a system | **308** `laptop-work.mp4` ("Man working on his laptop") | 1.05→1.11 push toward hands (focal 0.5,0.6) | `Systems that don't talk.\nHours that don't add up.` (fade in 572→600, hold, out 740→770) | `vo03` |

**film02b — Weight (780–1140 / 26:00–38:00)** — tension peaks, then a held near-silent beat before the turn

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 2b.1 | 780–980 | Busy, slightly chaotic startup floor — motion without progress | **918** `office-busy.mp4` ("Busy office space") | slow lateral drift (panX small) | — | `vo04` |
| 2b.2 | 980–1140 | A single still frame: owner at dusk/looking out, the low point; **the last 60f (1080–1140) are near-silent** — Track A dips to 0.3 (per the §7 keyframe list) — before the cut | **4840** `rooftop-sunset.mp4` ("Woman during a sunset on a rooftop") held as a quiet silhouette | **static**, barely-there 1.0→1.03 | `There has to be\na better way.` (fade in 992→1018, hold, out 1092→1118) | `vo05` |

### ACT 2 — THE TURN  (1140–1620 / 38:00–54:00)  **SHIFT @1140**; grade warms; Track A→B cross-fade

**film03 — Turn (1140–1620 / 38:00–54:00)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 3.1 | 1140–1320 | **The break:** warm first light; a real conversation — two people, one listening, understanding the problem (not selling) | **4809** `meeting-collab.mp4` ("Business people at work meeting") | gentle 1.04→1.10 push-in; light rises | — (hold text until the partner is named) | `vo06` (names the turn) |
| 3.2 | 1320–1470 | A handshake / agreement — partnership, not a product | **30012** `handshake.mp4` ("Pair of hands shaking hands") | static, settle | `Then they found a partner.` (fade in 1332→1360, hold, out 1440→1468) | `vo07` |
| 3.3 | 1470–1620 | Focused engineer beginning the work — calm competence, warm desk light | **29991** `engineer-workshop.mp4` ("Young engineer programming in his workshop") | slow 1.05→1.11 | — | `vo08` |

> **At f1140:** `MusicBed` begins the A→B cross-fade (window 1140–1200),
> `GradeLayer` begins `gradeCool → gradeWarm` (eased over 1140–1500), and `vo06`
> is the narration line that names the turn. One deliberate, noticeable shift.

### ACT 3 — TRANSFORMATION & RESOLUTION  (1620–2700 / 54:00–90:00)  grade: `gradeWarm`, Track B

**film05 — Build: Software (1620–1860 / 54:00–62:00)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 5.1 | 1620–1740 | Developer writing real code, screen close — software & web apps being built | **1728** `dev-code.mp4` ("Software developer working on code, screen close up") | 1.05→1.10 push to screen | `SOFTWARE` + mono sub `Custom software · Web applications · Integrations · IoT` (fade in 1632→1660, hold ~120f) | `vo09` |
| 5.2 | 1740–1860 | Hands typing code rapidly, top view — momentum, craft | **1735** `dev-topview.mp4` ("A developer typing on a laptop, top view") | static, faint drift | — | `vo09` (continues) |

**film06 — Build: Infrastructure (1860–2100 / 62:00–70:00)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 6.1 | 1860–1980 | Programmer on a multi-screen workstation — IT & systems that now connect | **41642** `multiscreen.mp4` ("Professional programmer working on a big computer") | slow push-in | `INFRASTRUCTURE` + mono sub `IT · Networking · Cloud · Microsoft 365` (fade in 1872→1900, hold ~120f) | `vo10` |
| 6.2 | 1980–2100 | Aerial glass corporate towers at night — the network, the cloud, scale that the business can now reach | **49878** `city-aerial-night.mp4` ("Big city at night from an aerial shot") | very slow drift (static-feeling) | — | `vo10` (continues) |

**film07 — Build: Control + Security (2100–2256 / 70:00–75:12, 156f)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 7.1 | 2100–2256 | Expert at a two-screen security/ops desk, calm and in control — automation, SCADA, cybersecurity, CCTV, VoIP | **41637** `ops-twoscreen.mp4` ("Programmer working with codes on a computer") | 1.05→1.10 | `CONTROL + SECURITY` + mono sub `Automation · SCADA · Cybersecurity · CCTV · VoIP` (fade in 2112→2140, hold ~100f) | `vo11` |

> **Review F3 fix:** the sub-label renders the **exact 5-item `copy.ts`
> `s04.control.items` array including SCADA**, joined with ` · `. Rev 1 dropped
> SCADA while claiming verbatim reuse — that contradiction is removed. §9
> confirms the provenance.

**film08 — Resolution (2256–2412 / 75:12–80:12, 156f)**

| Shot | Frames | Visual | Clip | Move | Copy (hold) | VO |
|---|---|---|---|---|---|---|
| 8.1 | 2256–2412 | Warm golden-hour light; confident, calm people / a park opening up — growth and clarity, the weight gone | **4831** `park-sunrise.mp4` ("View of a park while a girl runs across") | gentle 1.04→1.09, warm | — (text rests before the lockup) | `vo12` (the bridge into the tagline) |

**film09 — Lockup (2412–2700 / 80:12–90:00, 288f/9.6s)**  the brand film ending — **no footage**, pure brand surface over `COLOR.ink`

Built from `LogoReveal` (`speed="fast"`) + `AnimatedText` + the existing carry
discipline. **Fully specified per-beat (review rev-3 F2/F3)** — nothing deferred
to "compressed in filmTimeline.ts". Each statement gets a full-opacity hold of
**≥48f/1.6s** (the two signature lines included) and is never truncated by the
film end. Fades are **12f** on 9.1/9.2 and **9f** on 9.3/9.4; the stated
full-opacity hold per beat is `len − fadeIn − fadeOut`.

| Beat | Frames | Len | Fades | Full-opacity hold | On-screen (verbatim unless noted) | VO | VO window | Boundary gap |
|---|---|---|---|---|---|---|---|---|
| 9.1 | 2412–2484 | 72f / 2.4s | 12/12 | **48f / 1.6s** | `Built with intention.` (`COPY.s06Tagline`) fades up on near-black | `vo13` | 2418–2470 (52f, measured) | 14f ✓ |
| 9.2 | 2484–2568 | 84f / 2.8s | 12/12 | **60f / 2.0s** | `Your business has a vision.\nWe build what brings it to life.` **(the ONE new line, §9)** | `vo14` | 2490–2552 (~62f) | 16f ✓ |
| 9.3 | 2568–2634 | 66f / 2.2s | 9/9 | **48f / 1.6s** | `Small enough to care.` (`COPY.s05a`) | `vo15` | 2574–2618 (~44f) | 16f ✓ |
| 9.4 | 2634–2700 | 66f / 2.2s | 9/9 | **48f / 1.6s** | `Technical enough to build.` (`COPY.s05b`) | `vo16` | 2640–2682 (~42f) | 18f ✓ |
| 9.5 | overlaps 2568→2700 | — | — | — | `LogoReveal` BrandMark assembles under 9.3–9.4 and holds **fully assembled** on the final frame (2700); `LUMEN LABS` wordmark (`COPY.s03Wordmark`) + mono `SOUTH AFRICAN TECHNOLOGY STUDIO` (`COPY.s06Meta[1]`); amber at its fullest-but-restrained | — (music tail only) | — | — |

> **Review rev-3 F3 fix (VO/beat invariant).** The rule is `beatEnd −
> (voStart + voDuration) ≥ 6f`. With the re-timed windows above every lockup VO
> clears its boundary by ≥14f, so the invariant holds with margin even if the
> measured durations of `vo14`–`vo16` drift by a few frames. `narration.test.ts`
> MUST assert this for all 16 VO lines against their beat ends; if a measured VO
> is longer than its window allows, the fix is to start that VO earlier within
> its beat (the beats have hold headroom), never to shorten a signature line's
> on-screen hold. The exact `vo13`–`vo16` starts become authoritative only after
> `generate-vo.sh` runs and real durations are measured; the ≥6f assertion is the
> gate.

> Each VO window ends ≥ 6f before its beat boundary, and every `startFrame +
> durationInFrames ≤ 2700` (asserted at config load, review F2/F11). The measured
> VO durations (§6) all fit: e.g. "Built with intention." = **52f** (verified
> generated this pass) ≤ the 60f beat. The lockup therefore holds comfortably
> within 240f with no overrun.

---

## 6. Narration script & voice

**Chosen voice: `en-US-AndrewMultilingualNeural`.** Candidates were Andrew,
Brian, and Ava. The Microsoft voice table — **confirmed this pass via
`~/.local/bin/edge-tts --list-voices`** (output: Andrew = *"Warm, Confident,
Authentic, Honest"*; Brian = *"Approachable, Casual, Sincere"*; Ava =
*"Expressive, Caring, Pleasant, Friendly"*) — supports the choice. The brief asks
for **calm, youthful, human, emotionally engaging, not corporate, not robotic**.
Andrew's warm-but-grounded timbre reads youngest-serious and most "human
narrator" of the three for a cinematic brand film; Brian is a touch too casual
for the heavier Act 1, and Ava's expressiveness risks tipping Act 3 into
"cheesy", which the brief forbids. **Decision: Andrew.** Tuned calm with
`--rate=-8%` (unhurried) and `--pitch=-2Hz` (grounded, not boyish). Brian is the
documented fallback if Andrew reads too formal in review.

> **Verified end-to-end this pass:** `edge-tts --voice
> en-US-AndrewMultilingualNeural --rate=-8% --pitch=-2Hz --text "Built with
> intention." --write-media … --write-subtitles …` produced a valid 11 KB MP3
> and a VTT whose last cue ends at `00:00:01,739` → **~52 frames @30fps**. This
> is the actual duration used for `vo13` in §5. (Review F1 resolved: edge-tts is
> installed; the pipeline runs.)

**Pacing rule:** VO is sparse. It *tells the story*, it does not narrate every
frame. Several shots run with music only. Lines are short; each is given room.

**`narration.ts` entry shape (review F5/F11):** each entry is
`{ id, text, startFrame, durationInFrames, file }`. `durationInFrames` is
**populated from the generated `--write-subtitles` VTT last-cue end time**
(`generate-vo.sh` parses it) so the duck windows (§7) have a real end and the
load-time validation can assert `startFrame + durationInFrames ≤ FILM_DURATION`.
Approximate placements (final `durationInFrames` written by the generator):

| id | Scene | ~Start (f) | ~Dur (f) | Line |
|---|---|---|---|---|
| `vo01` | film01 | 162 | ~95 | "A business doesn't fail in one big moment." |
| `vo02` | film02 | 408 | ~95 | "It's the small things. The tools that don't fit." |
| `vo03` | film02 | 560 | ~110 | "The systems that don't talk. The hours that disappear." |
| `vo04` | film02b | 804 | ~120 | "You're working harder than ever — and still watching chances slip past." |
| `vo05` | film02b | 1020 | ~70 | "There has to be a better way." |
| `vo06` | film03 | 1152 | ~135 | "Then they found a partner who started with the problem — not a product." |
| `vo07` | film03 | 1332 | ~105 | "Someone small enough to listen. Technical enough to build." |
| `vo08` | film03 | 1500 | ~80 | "And slowly, the pieces started to fit." |
| `vo09` | film05 | 1632 | ~130 | "Software and systems, built around how the business actually works." |
| `vo10` | film06 | 1872 | ~130 | "Infrastructure, networks, the cloud — quietly doing their job." |
| `vo11` | film07 | 2112 | ~75 | "Secured. Connected. Under control." |
| `vo12` | film08 | 2292 | ~95 | "The weight lifts. And the vision has room to grow." |
| `vo13` | film09 | 2418 | 52 (measured) | "Built with intention." |
| `vo14` | film09 | 2490 | ~62 | "Your business has a vision. We build what brings it to life." |
| `vo15` | film09 | 2574 | ~44 | "Small enough to care." |
| `vo16` | film09 | 2640 | ~42 | "Technical enough to build." |

> The §6 start frames now agree with §4 and §5 (review F2): the four sign-off
> lines are spread across the 240f lockup, each starting after the previous one
> ends, and `vo16` ends at ~f2694 — inside 2700. `durationInFrames` for all but
> `vo13` are estimates until `generate-vo.sh` writes the measured values; the
> load-time assertion catches any that would overrun, and the lockup beats in §5
> have ≥10% headroom over these estimates.
>
> **Build-order dependency (review rev-2 F3).** The §5 lockup sub-ranges (9.1–9.4)
> and the §7 duck windows depend on the measured VO durations, so the implementer
> MUST run `generate-vo.sh` (build order §14 **step 5**) and let it write the real
> `durationInFrames` back into `narration.ts` **before** finalizing the §5 lockup
> sub-ranges — this ordering is already in §14 and is called out here so the
> dependency is explicit, not implicit. The four lockup lines **`vo14`, `vo15`,
> `vo16`** (and to a lesser extent `vo13`, already measured at 52f) are the lines
> **most likely to force a re-time** of a lockup beat if a measured duration
> exceeds its estimate: each sits in a short 54–72f beat with little slack, where
> `vo04`/`vo06` sit in long scenes with hundreds of spare frames. If the load-time
> assertion fires on one of these, the fix is to lengthen the affected lockup beat
> (borrowing frames from an adjacent lockup beat, keeping `film09`'s total at
> 240f) — a bounded, expected loop-back, not a surprise.

> `vo02`, `vo04`, `vo08`, `vo09`, `vo10`, `vo11`, `vo12` are **new narration
> prose**. The brief permits narration that tells the story and forbids only
> invented *stats, clients, testimonials, dates, or claims* — these lines make
> none; they are emotional/connective voice-over, not factual claims.
> `vo13`/`vo15`/`vo16` reuse the verbatim `copy.ts` strings. `vo14` is the one
> approved new on-screen line. All VO text lives in `narration.ts` and is fully
> swappable; a reviewer can rewrite any line and re-run `generate-vo.sh`.

**Generation (`scripts/generate-vo.sh`) — hard-fails if the tool/voice is
missing (review F1):**
```sh
#!/usr/bin/env bash
set -euo pipefail
EDGE="${EDGE_TTS:-$HOME/.local/bin/edge-tts}"
VOICE="en-US-AndrewMultilingualNeural"

# 1) ensure the tool exists; install into --user if absent, then re-check.
if [ ! -x "$EDGE" ] && ! command -v edge-tts >/dev/null 2>&1; then
  python3 -m pip install --user edge-tts
fi
[ -x "$EDGE" ] || EDGE="$(command -v edge-tts)" || { echo "FATAL: edge-tts not installed"; exit 1; }

# 2) validate the chosen voice actually exists.
"$EDGE" --list-voices | grep -q "$VOICE" || { echo "FATAL: voice $VOICE unavailable"; exit 1; }

# 3) per line (ids+text sourced from narration.ts via a tiny node reader):
"$EDGE" --voice "$VOICE" --rate=-8% --pitch=-2Hz \
  --text "<line>" \
  --write-media "public/audio/vo/<id>.mp3" \
  --write-subtitles "public/audio/vo/<id>.vtt"
# 4) parse each .vtt last cue -> durationInFrames; write back into narration.ts.
```
The `.vtt` word timings also let `Caption.tsx` optionally sync on-screen text to
the voice. `Narration.tsx` mounts each as
`<Audio src={staticFile('audio/vo/<id>.mp3')} />` inside a
`<Sequence from={startFrame}>` (no in-point trim needed; each MP3 is a single
line).

**Committed-audio fallback (review F1):** the 16 generated MP3s (+VTTs) are
**committed into `public/audio/vo/`**. `render:film` therefore does not need
network or pip at render time — it consumes the committed files. `generate-vo.sh`
is only for *regenerating* when a line changes. `AUDIO.md` documents both paths.

---

## 7. Music plan

Two royalty-free Mixkit tracks, cross-faded in-composition — the cleanest way to
guarantee a **noticeable** musical shift at the discovery moment while keeping
one continuous bed.

| Role | Mixkit id | Source page (recorded by fetch) | Character | Used |
|---|---|---|---|---|
| **Track A — tension bed** | `18` → `public/audio/music/track-a-tension.mp3` | `https://mixkit.co/free-stock-music/sad/` | restrained, slightly tense, minor | Act 1 (0–1200) |
| **Track B — hopeful/uplifting** | `158` → `public/audio/music/track-b-hope.mp3` | `https://mixkit.co/free-stock-music/uplifting/` | warm, building, optimistic (not cheesy) | Act 2–3 (1140–end) |

> Backups: `168` (dramatic) as an alternate for A, `187` (uplifting) as an
> alternate for B. `fetch-music.sh` records the **actual scraped track
> title/page per id in `public/audio/music/SOURCES.md`** (review F9), and final
> A/B selection is confirmed by ear during fetch; the design locks the *roles and
> the shift mechanics*, and the two primary ids are verified downloadable (§8).

**The shift (frame 1140):** `MusicBed.tsx` renders both tracks as `<Audio>`:
- Track A `volume={(f) => clipN(f, [0, 60, 1020, 1080, 1140, 1200], [0, 0.9, 0.9, 0.3, 0.3, 0])}`
  → fades up at the open, holds at 0.9, **ramps down 1020→1080, then HOLDS the
  near-silent floor at 0.3 across 1080→1140** (the held low point — the beat
  before the turn genuinely sits near-silent, not merely passing through 0.3),
  then **cross-fades out over 1140–1200** (2.0s). This single keyframe list is
  authoritative and matches §1/§2/§5/§7 prose: *window 1080→1140, floor 0.3,
  held* (review rev-3 F1). (The `vo05` duck envelope, below, multiplies on top of
  this; across 1080–1140 `vo05` has already ended, so the composed Track-A floor
  there is the plain held 0.3 — audible-but-low, as intended.)
- Track B `volume={(f) => clipN(f, [1140, 1200, 2520, 2700], [0, 0.85, 0.85, 0.0])}`
  → **fades in over 1140–1200** (equal-power cross-fade with A), holds, soft tail
  under the lockup to the end.
- **VO ducking — now concrete and computable (review F5):** `MusicBed` imports
  `NARRATION` and, for each entry, applies a duck envelope keyed to real frames:
  the active track's base volume is multiplied by `DUCK = 0.45` (≈ −7 dB) across
  `[startFrame − 6, startFrame, endFrame, endFrame + 12]` where
  `endFrame = startFrame + durationInFrames`. Outside every VO window the factor
  is `1.0`. Because `durationInFrames` now exists per entry, each duck window has
  a defined start **and end**, and the floor is a fixed numeric multiplier — the
  ducking is fully implementable as written. (Implementation: compose the per-VO
  factors by taking the min across overlapping windows, then multiply the
  track's base `clipN` fade.)
- Near-silent beat at f1080–1140: this dip to 0.3 is already folded into Track
  A's single `clipN` keyframe list above (`…1080, 1140… → …0.3, 0`), not a
  separate automation. The held low point before the turn makes the shift land
  harder; the formula and this prose name the same window and the same floor.

Both tracks are Mixkit Free Stock Music (commercial use, no attribution); sources
recorded in `public/audio/music/SOURCES.md`.

---

## 8. Verified stock sources (scraped / resolved live)

All footage is Mixkit, 1080p MP4, **Mixkit Free License** (`https://mixkit.co/license/`):
commercial use permitted, **no attribution required**, keyless. Pattern:
`https://assets.mixkit.co/videos/<id>/<id>-1080.mp4`.

**Resolution checks performed in THIS revision pass (live `curl -r 0-0`):**
- Footage → **`HTTP 206 video/mp4`** for `8739`, `4809`, `1728`, `30012`,
  `49878`.
- Music → **`HTTP 206 audio/mpeg`** for `18` and `158`.

(Revision 1 additionally verified `206 video/mp4` for `914, 4831, 41640, 221,
308, 918, 4840, 29991, 1735, 41642, 41637` and the full-GET `200` set
`308/4809/42648`; those remain the recorded provenance. The 5 re-checked above
re-confirm the pipeline is still live.)

**Clips chosen for the cut** (id → local filename → role; URL is the pattern above):

| id | local file | content (Mixkit title) | used in |
|---|---|---|---|
| 8739 | `struggle-worried.mp4` | Worried and sad woman, outdoors | film01 1.1 |
| 914 | `office-open.mp4` | Open office space | film01 1.2 |
| 221 | `office-glasses-reflection.mp4` | Reflection of a screen in glasses | film02 2.1 |
| 308 | `laptop-work.mp4` | Man working on his laptop | film02 2.2 |
| 918 | `office-busy.mp4` | Busy office space | film02b 2b.1 |
| 4840 | `rooftop-sunset.mp4` | Woman during a sunset on a rooftop | film02b 2b.2 |
| 4809 | `meeting-collab.mp4` | Business people at work meeting | film03 3.1 |
| 30012 | `handshake.mp4` | Pair of hands shaking hands | film03 3.2 |
| 29991 | `engineer-workshop.mp4` | Young engineer programming in his workshop | film03 3.3 |
| 1728 | `dev-code.mp4` | Software developer working on code, screen close up | film05 5.1 |
| 1735 | `dev-topview.mp4` | A developer typing on a laptop, top view | film05 5.2 |
| 41642 | `multiscreen.mp4` | Professional programmer working on a big computer | film06 6.1 |
| 49878 | `city-aerial-night.mp4` | Big city at night from an aerial shot | film06 6.2 |
| 41637 | `ops-twoscreen.mp4` | Programmer working with codes on a computer | film07 7.1 |
| 4831 | `park-sunrise.mp4` | View of a park while a girl runs across | film08 8.1 |

**Content-verification gate (review F4) — scenes are NOT authored until this
passes.** The id→title mapping above is from the Mixkit pages but each clip's
*content* must be eyeballed before scenes are built on top of it. `fetch-footage.sh`:
1. Downloads each id and the reserves.
2. Scrapes each Mixkit category page's JSON-LD `VideoObject` and records the
   actual `name`/`description` per id into `public/footage/SOURCES.md` next to the
   id, source URL, license URL, and "Mixkit Free License — no attribution".
3. Grabs one still per clip (`remotion still` on a tiny probe comp, or an
   `OffthreadVideo` single-frame render) into `public/footage/_contact/`.
4. The implementer eyeballs the contact sheet; **on any mismatch with the
   storyboard role, swap in a reserve id** (reserves below) and re-run. Only when
   every clip matches its role does scene authoring begin (build order §14 gates

> **Copy-bearing hero shots — eyeball before authoring (review rev-3 F5).** These
> clips carry on-screen copy and/or long hero screen-time, so a content mismatch
> is especially costly; verify each explicitly before authoring its scene:
> `8739` (film01 1.1, "worried owner"), `914` (film01 1.2, "cold empty office
> before anyone arrives"), `4840` (film02b 2b.2, the low-point silhouette), and
> `4831` (film08 8.1, warm resolution). A URL returning HTTP 206 only proves the
> file exists, not that its content fits the beat — these four must be looked at.

   on this).

**Reserve (verified resolving in rev 1, swap-in without redesign):** `1808`
(close typing), `41640` (hands programming), `41654` (code on screen), `1781`
(laptop close), `242` (typing on a laptop), `4915` (hands typing on a phone),
`49845`/`49846` (aerial city variants).

**No AI-generated video, people, offices, or synthetic environments are used** —
every clip is real licensed stock of real people, real desks, real cities. (The
one borderline id, `99786` "Animation of futuristic devices", was deliberately
**rejected** as too close to the forbidden "generic futuristic tech imagery".)

---

## 9. On-screen copy list (verbatim reuse + one new line)

Minimal, readable, generously held. Captions use `Caption.tsx`, which delegates
only the **entrance** (per-line clip-rise / track-in) to `AnimatedText` and
**owns the hold and the fade-out itself** — `AnimatedText` is reveal-only and has
no exit animation, so a revealed line would otherwise stay at full opacity.
`Caption.tsx` therefore wraps `AnimatedText` in an outer `opacity` interpolation
over `[in0, in1, out0, out1]` (fade-in → hold at 1 → fade-out), where the
`out0`/`out1` frames are the §5 storyboard fade-out windows (e.g. "out 348→378",
"out 740→770"). The hold duration is the gap between `in1` and `out0`.

| Caption | Text | Source | Hold |
|---|---|---|---|
| C1 | `A business doesn't fail\nin one big moment.` | **new (narration-class, no claim)** | ~6.2s |
| C2 | `Systems that don't talk.\nHours that don't add up.` | **new (narration-class)** | ~6.3s |
| C3 | `There has to be\na better way.` | **new (narration-class)** | ~4.2s |
| C4 | `Then they found a partner.` | **new (narration-class)** | ~4.5s |
| C5 | `SOFTWARE` + sub `Custom software · Web applications · Integrations · IoT` | sub = `copy.ts` `s04.software.items` joined with ` · ` (verbatim array) | ~4.0s |
| C6 | `INFRASTRUCTURE` + sub `IT · Networking · Cloud · Microsoft 365` | sub = `copy.ts` `s04.infrastructure.items` (verbatim array) | ~4.0s |
| C7 | `CONTROL + SECURITY` + sub `Automation · SCADA · Cybersecurity · CCTV · VoIP` | sub = `copy.ts` `s04.control.items` (verbatim **5-item** array, incl. SCADA) | ~5.3s |
| C8 | `Built with intention.` | **verbatim** `COPY.s06Tagline` | ~2.0s |
| C9 | `Your business has a vision.\nWe build what brings it to life.` | **THE ONE NEW APPROVED LINE** | ~2.4s |
| C10 | `Small enough to care.` | **verbatim** `COPY.s05a` | ~1.8s |
| C11 | `Technical enough to build.` | **verbatim** `COPY.s05b` | ~1.8s |
| C12 | `LUMEN LABS` | **verbatim** `COPY.s03Wordmark` | hold to end |
| C13 | `SOUTH AFRICAN TECHNOLOGY STUDIO` | **verbatim** `COPY.s06Meta[1]` | hold to end |

**The only brand-new on-screen string is C9:** *"Your business has a vision. We
build what brings it to life."* It lives in `config/filmCopy.ts` as
`FILM_COPY.visionLine`. `filmCopy.ts` otherwise **re-exports** the verbatim
`COPY` members above (it does not re-literal their text), so `copy.ts` and its
snapshot test are untouched.

**Capability sub-labels C5–C7 are the EXACT `copy.ts` `s04.*.items` arrays joined
with ` · ` — including SCADA in C7 (review F3).** The joins are computed from the
imported arrays in `filmCopy.ts` (e.g. `COPY.s04.control.items.join(' · ')`), not
retyped, so the strings cannot drift from `copy.ts`. No capability is invented,
dropped, or reordered. No stats, clients, testimonials, dates, or locations are
invented anywhere.

---

## 10. The `FootageClip` component (new, mirrors `ImageReveal` discipline)

`components/film/FootageClip.tsx` is the **only** component that renders footage.
Props: `footageKey` (into `footage.ts`), `startFrame`, `durationInFrames`,
`fromScale`/`toScale` (Ken-Burns, default 1.06→1.10), optional `panX`/`panY`,
`gradeKey` (`'cool' | 'warm'`), `scrim`, `mask` (reusing the `MaskKind` wipe set).

Behaviour, matching `ImageReveal`'s *discipline* (not its fixed window):
- `<OffthreadVideo src={staticFile(meta.file)} trimBefore={meta.inPoint}>` — use
  **`trimBefore` for the in-point and `durationInFrames` for length**; in Remotion
  4.0.533 `startFrom`/`endAt` **and** `trimAfter` are all deprecated (props.d.ts:
  "Use durationInFrames instead"), so the cut's length comes from the Sequence /
  `durationInFrames`, not from `trimAfter` (review rev-3 F4). Long clips are
  trimmed by in-point and the frame window, never slowed/stretched.
- **Ken-Burns over the shot's own window (review F7):** `kenBurns(frame,
  [startFrame, startFrame + durationInFrames], { fromScale, toScale, panX, panY,
  easing: EASE.inOut })` — this is the real helper signature from
  `src/lib/interpolate.ts` (scale endpoints live in the options object, not as
  positional args) — so the push spans the entire shot instead of completing in a
  fixed 120f and holding.
- **Uniform** cover-scale with `objectFit: 'cover'` + `objectPosition` from the
  clip's focal point in `footage.ts`; scale delta clamped to 0.08 (reused clamp
  prevents edge reveal). **Never** skew/stretch — there is no distortion API, by
  design.
- Grade applied **non-destructively** via CSS `filter` composed from `brand.ts`
  `GRADE.filter` plus a `GradeLayer` veil (amber/steel from `GRADE.duotone*`).
  `gradeCool` = `GRADE.filter` as-is + a faint steel veil; `gradeWarm` = slightly
  higher brightness/saturation *within the same token family* + the amber veil
  at a higher-but-restrained opacity. Grade presets live in `filmGrade.ts`;
  `brand.ts` is not edited.
- Two-layer bottom scrim (reused `GRADE.scrim`) for text legibility.

---

## 11. Error handling, validation & invariants (concrete, per operation)

**Asset-fetch scripts (`fetch-footage.sh`, `fetch-music.sh`, `generate-vo.sh`) —
build-time, outside the render.**
- `curl -fL --retry 3`: `-f` makes HTTP ≥400 a non-zero exit; the script
  `set -euo pipefail` aborts the batch on the first failure and prints the failing
  URL. Recoverable by the operator (swap in a reserve id). Fatal to the script
  run; nothing partial is committed because the next step won't proceed.
- After each video download: assert non-empty and `content-type`/magic bytes are
  MP4; a 0-byte or HTML file (e.g. a Mixkit layout change) fails the script with
  the id and URL. Recoverable: use a reserve id.
- **Clip-duration probe (review F6):** immediately after each download,
  `fetch-footage.sh` reads the real duration with `@remotion/media-parser`
  `parseMedia` (fallback: the bundled
  `node_modules/@remotion/compositor-linux-x64-gnu/ffprobe`, verified present and
  runnable — `ffprobe version n7.1`) and writes `durationInFrames` into
  `footage.ts` for that key. This is the data the load-time length invariant
  below depends on.
- `generate-vo.sh`: installs edge-tts if missing, validates the voice, and
  **hard-fails** naming the failing line id on any non-zero exit (full script in
  §6). It also parses each `.vtt` last cue into `durationInFrames` and writes it
  back into `narration.ts`. The generated MP3s are committed (fallback, §6), so a
  render never depends on this script succeeding.
- `SOURCES.md` files (footage + music) are regenerated by the scripts, never
  hand-edited, so provenance can't drift from what was actually downloaded; the
  footage one records the scraped JSON-LD title/description per id (review F4/F9).

**Config load-time (fatal, by design — mirrors the existing `validate*` pattern).**
- `validateFilmTimeline()` throws the exact gap/overlap/sum mismatch if
  `FILM_SCENES` aren't contiguous, don't start at 0, or don't sum to **2700**.
- `footage.ts` `getFootage(key)` throws on an unknown key, an out-of-range focal
  point (`focusX/Y ∈ [0,1]`), or a **missing `durationInFrames`**, exactly like
  the existing `getAsset()` pattern.
- **Hard clip-length invariant (review F6):** for every storyboard shot,
  `validateFilmTimeline()` (or a dedicated `validateFootageWindows()`) asserts
  `shot.durationInFrames + (meta.inPoint ?? 0) ≤ meta.durationInFrames`. A window
  longer than its clip is a **build-time fatal error**, not a silent black frame.
  This replaces rev 1's incorrect claim that `OffthreadVideo` "freezes on the
  last frame" (it renders empty past media end — not native). If a reserve clip
  is genuinely shorter than needed, the fix is to shorten the window or pick a
  longer reserve; the invariant forces that decision at build time.
- `narration.ts` validates every entry: `startFrame ∈ [0, FILM_DURATION)`, ids
  unique, and **`startFrame + durationInFrames ≤ FILM_DURATION`** (review
  F2/F11 — no truncated late VO).
- `filmMusic.ts` validates the shift frame is inside the timeline, fade windows
  are monotonic, and `DUCK ∈ (0, 1)`.
- `FORMATS` already self-validates at load (unchanged).

**Render-time (per-frame; must never crash the render).**
- Missing/failed footage file: a missing `staticFile` path is surfaced at bundle
  time; a missing clip is **fatal** (we want to know) and the operator re-runs
  the fetch — it is never silently skipped. The committed footage + the
  length-invariant above mean a correctly-built config cannot hit an empty/black
  `OffthreadVideo` frame.
- `interpolate` ranges: all go through `clip`/`clipN`, which clamp both ends, so
  no value ever leaves its range (reused invariant). VO/music volumes are clamped
  to `[0,1]`.

**Invariants and the layer that owns them.**
- *No pixel is hard-coded.* Owned by `lib/layout.ts` + the type scale; scenes may
  only ask for fractions of the safe box. `FORMATS.wide` is the single dimension
  source.
- *Amber discipline — at most one amber element per frame.* Owned by the scene
  components (as in the existing film). `GradeLayer`'s amber veil counts as
  atmospheric warmth, not a second amber "element", and is capped at a restrained
  opacity so it never becomes a glow/gradient.
- *No destructive recolour / no distortion.* Owned by `FootageClip` — it exposes
  only uniform scale + translate + focal origin + CSS filter; there is no stretch
  or skew prop, structurally preventing distortion.
- *Window ≤ clip length.* Owned by the timeline validator against `footage.ts`
  durations (above).
- *Copy is verbatim.* Owned by `filmCopy.ts` re-exporting `copy.ts` and adding
  exactly one new string; the capability sub-labels are `.join(' · ')` of the
  imported arrays, so they cannot drift. `copy.test.ts` continues to guard
  `copy.ts` itself.
- *VO never truncated / never fights music.* Owned by `narration.ts` validation
  (end-frame assertion) + `MusicBed` ducking keyed to real VO durations.

**External input validation (the only external inputs are the fetched assets and
the narration/copy config).**
- Footage URLs: required, must match `assets.mixkit.co/videos/\d+/\d+-1080.mp4`;
  on 4xx/empty/non-MP4 → fail the fetch.
- Music URLs: required, `assets.mixkit.co/music/\d+/\d+.mp3`; same failure path.
- Narration text: required non-empty per entry; `rate`/`pitch` optional with the
  documented defaults; on empty text the generate script fails fast naming the id.
- On-screen copy: the new line is a fixed literal; the reused lines/arrays are
  typed references to `COPY`, so a typo is a TypeScript error, not a runtime
  surprise.

---

## 12. Testability

**Unit-testable (pure, no render) — new vitest specs beside the existing ones:**
- `filmTimeline.test.ts`: `validateFilmTimeline()` passes; ranges contiguous,
  start 0, sum **2700**; `FILM_DURATION ∈ [2250, 2700]`; **every shot window ≤ its
  clip `durationInFrames`** (uses a fixture map so it runs without the downloaded
  files).
- `narration.test.ts`: every `startFrame ∈ [0, FILM_DURATION)`; **`startFrame +
  durationInFrames ≤ FILM_DURATION`**; ids unique; the reused lines equal the
  exact `COPY` members (`vo13===COPY.s06Tagline`, `vo15===COPY.s05a`,
  `vo16===COPY.s05b`); exactly one new on-screen line (C9) and it matches
  `FILM_COPY.visionLine` verbatim.
- `footage.test.ts`: `getFootage` throws on unknown key / out-of-range focal
  point / missing duration; every storyboard `footageKey` exists in `footage.ts`.
- `filmMusic.test.ts`: shift frame == 1140; A fades out and B fades in across the
  same window; fade keyframes monotonic; `DUCK ∈ (0,1)`.
- `filmCopy.test.ts`: `filmCopy` **re-exports** (not re-literals) the `COPY`
  members; adds exactly `visionLine`; and the C5–C7 sub-labels equal
  `COPY.s04.{software,infrastructure,control}.items.join(' · ')` — this asserts
  C7 includes SCADA (review F3 regression guard).
- Run with the neutral-config workaround from `baseline.md`
  (`vitest run --config /tmp/empty-vitest.config.ts`) so the outer website's
  `vite.config.ts` isn't picked up. These tests touch no new source files that
  depend on `vite`.

**Integration-testable (needs the renderer / studio):**
- The content-verification contact sheet (§8, build step before scenes).
- `remotion still BrandFilm out/frames/<n>.png --frame=<n>` at key frames
  (0, 1140 the shift, 1620, 2460 the lockup start, 2700 the final logo) to
  eyeball grade/compositing — the same evidence pattern the existing film used.
- `npm run render:film` produces `out/lumen-labs-brand-film.mp4`; verify with
  `ffprobe` (bundled) / Remotion logs that it is 1920×1080@30, ~90s, **and
  contains an audio stream** (proves `<Audio>` muxing). The one true end-to-end
  check.
- `npm run typecheck` (`tsc --noEmit`, strict) must stay zero-error.

**Why the design is testable:** every creative decision that can be wrong
silently (timings, copy fidelity incl. SCADA, asset keys, VO durations, window≤clip,
the shift point, fade shape, duck floor) is pushed into pure config with a
thrown-error or snapshot guard; only the genuinely visual/audible parts need the
renderer, and those have a cheap still path plus one full render.

---

## 13. Corrections folded into this design (self-review carryover)

- Scene files are 1:1 with timeline ranges; there is no `Film04_Partner.tsx`.
- The one accepted edit to an existing file is appending a single
  `<Composition id="BrandFilm">` to `Root.tsx`; the §3 headline now says exactly
  that (review F8).
- The lockup is fully specified per-beat in §5 and sums within `[2460, 2700]`.

---

## 14. Build order for the implementer (so the pipeline is proven, not assumed)

1. **Install + verify VO tool:** `python3 -m pip install --user edge-tts`;
   confirm `~/.local/bin/edge-tts --list-voices | grep en-US-AndrewMultilingualNeural`.
   *(Done this design pass — edge-tts 7.2.8 installed, voice confirmed.)*
2. `scripts/fetch-footage.sh` → download the 15 clips + reserves; **probe each
   clip's duration into `footage.ts`**; write `public/footage/SOURCES.md` with
   scraped JSON-LD titles; grab the `_contact/` stills.
3. **Content-verification gate (review F4):** eyeball the contact sheet; swap any
   mismatched id for a reserve and re-run step 2. **Do not author scenes until
   every clip matches its storyboard role.**
4. `scripts/fetch-music.sh` → download Track A (`18`) + Track B (`158`); write
   `public/audio/music/SOURCES.md` with scraped titles.
5. Author `config/narration.ts`; `scripts/generate-vo.sh` → 16 MP3s (+VTT) in
   `public/audio/vo/`, with `durationInFrames` parsed from each VTT written back;
   **commit the MP3s**; write `AUDIO.md`.
6. New config (`filmTimeline`, `filmCopy`, `footage`, `filmGrade`, `filmMusic`) +
   their vitest specs; `typecheck` + `test` green (incl. the window≤clip and
   SCADA guards).
7. New components (`FootageClip`, `GradeLayer`, `Caption`, `Narration`,
   `MusicBed`) then the nine `scenes/film/*`.
8. `BrandFilm.tsx` `<Series>` + one `<Composition id="BrandFilm">` in `Root.tsx`.
9. `render:film` script; stills at f0/1140/1620/2460/2700; then the full render to
   `out/lumen-labs-brand-film.mp4`; confirm 1920×1080@30 ~90s **with audio**.

---

## 15. Out of scope

- Any change to the existing `LaunchFilm` compositions, `DESIGN.md`, scenes,
  components, or shared config beyond the single additive `Root.tsx` composition
  entry.
- A vertical (9:16) or square cut of the new film (supported later via
  `FORMATS.vertical`/`square`, but only 16:9 1920×1080 is delivered).
- Any website/root-project change.
- Sound-effects/foley design beyond music + VO.
- Fixing the pre-existing npm audit warnings or the outer-`vite.config.ts` test
  discovery quirk (worked around per `baseline.md`).

---

## 16. Responses to the design reviews

### 16b. Second review (rev 2 → rev 3)

**Verdict addressed:** the single MEDIUM is resolved and all 4 NITs are folded in.
The reviewer confirmed all five rev-1 HIGH/MEDIUM findings and all five rev-1 NITs
stay resolved and independently re-verified.

| # | Sev | Finding | Response |
|---|---|---|---|
| 1 | MED | Music plan self-contradicts: Track A's concrete curve `clipN(f,[0,60,1140,1200],[0,0.9,0.9,0])` holds 0.9 at f1100, but §1/§5/§7 promise a near-silent dip to ~0.3 before the turn | **Addressed.** Folded the dip into the single authoritative keyframe list: Track A `volume = clipN(f, [0,60,1080,1140,1200], [0,0.9,0.9,0.3,0])` (§7). The dip now lives in the automation, not only prose. §5 shot 2b.2, §7's near-silent-beat bullet, and §1/§2 are all re-stated to the same window **1080–1140** and the same floor **0.3**. Noted that `vo05` has ended by 1080, so the composed Track-A floor across the dip is the plain 0.3 (audible-but-low). §7 no longer claims a dip that isn't in the curve. |
| 2 | NIT | `kenBurns(frame, window, fromScale, toScale)` positional call shape won't compile — the real helper takes `{ fromScale, toScale, panX?, panY?, easing? }` as an options object | **Addressed.** Corrected the call form in §3.2, the §5 conventions line, and §10 to `kenBurns(frame, [startFrame, startFrame + durationInFrames], { fromScale, toScale, panX, panY, easing: EASE.inOut })`, matching the verified signature in `src/lib/interpolate.ts`. The clip-duration-window intent is unchanged. |
| 3 | NIT | 15/16 VO durations are estimates; the lockup/duck depend on numbers that don't exist until `generate-vo.sh` runs | **Addressed (clarity).** §6 now states the explicit build-order dependency — run `generate-vo.sh` (§14 step 5) and write measured `durationInFrames` back **before** finalizing the §5 lockup sub-ranges — and flags **`vo14`–`vo16`** (short lockup beats, little slack) as the lines most likely to force a bounded re-time, with the re-time procedure (borrow frames from an adjacent lockup beat; `film09` stays 240f). The load-time assertion already turns any overrun into a build failure, not a silent truncation. |
| 4 | NIT | `AnimatedText` reveals only; `Caption.tsx` must supply its own fade-out | **Addressed.** §3.3 and §9 now state `Caption.tsx` delegates only the entrance reveal to `AnimatedText` and **owns the hold + fade-out** via an outer `opacity` interpolation over `[in0, in1, out0, out1]`, where `out0`/`out1` are the §5 fade-out windows. |
| 5 | NIT | Grade warm-up ends at f1500 (inside Act 2), but §2 says "across the act" while §5 says "1140–1500" | **Addressed.** §2's table now reads "warming over the first ~12s of Act 2 (`gradeCool → gradeWarm`, 1140→1500), then held warm", naming the same window as §5 and the §5 SHIFT note. |

### 16a. First review (rev 1 → rev 2)

**Verdict addressed:** all 2 HIGH + 4 MEDIUM resolved; all 5 NITs folded in.

| # | Sev | Finding | Response |
|---|---|---|---|
| 1 | HIGH | edge-tts not installed | **Addressed.** Installed this pass (`pip install --user edge-tts` → 7.2.8); binary at `~/.local/bin/edge-tts`; voice confirmed via `--list-voices`; a real MP3+VTT generated (§6). `generate-vo.sh` now installs-if-missing and **hard-fails** on missing tool/voice. The 16 MP3s are **committed** as a render-time fallback so no network/pip is needed at render. §0/§6/§14 updated. |
| 2 | HIGH | Lockup timing contradictory, infeasible in 120f | **Addressed.** `FILM_DURATION` raised to **2700**; `film09` lockup is **240f**; §5 gives explicit per-beat sub-ranges (9.1–9.5) and per-VO windows; §6 `vo13–vo16` start frames realigned to match §4/§5. Measured `vo13`=52f fits its 60f beat; load-time assert `startFrame+duration ≤ 2700`. §4/§5/§6 now agree. |
| 3 | MED | C7 drops SCADA while claiming verbatim reuse | **Addressed.** C7 now renders the exact 5-item `s04.control.items` **including SCADA**, computed via `.join(' · ')` from the imported array (§5 film07, §9). `filmCopy.test.ts` asserts the join equals the array — regression-guarded. |
| 4 | MED | Clip id→content unverified | **Addressed.** Added a mandatory content-verification gate (§8, §14 step 3): `fetch-footage.sh` records scraped JSON-LD titles in `SOURCES.md` and emits a `_contact/` still per clip; scenes aren't authored until each is eyeballed, with reserve-swap on mismatch. |
| 5 | MED | VO-ducking under-specified | **Addressed.** `narration.ts` entries now carry `durationInFrames` (parsed from the VTT last cue). Duck is a concrete factor `DUCK = 0.45` (≈ −7 dB) over `[start−6, start, end, end+12]` (§7). Now fully computable. |
| 6 | MED | OffthreadVideo freeze not native | **Addressed.** Replaced the false "freeze" claim with a **hard build-time invariant**: each clip's real `durationInFrames` is probed (`@remotion/media-parser`, fallback bundled `ffprobe` — verified runnable) into `footage.ts`, and the timeline validator fails the build if any window exceeds its clip (§6/§10/§11). |
| 7 | NIT | KB window fixed 120f | **Addressed.** `FootageClip` parameterizes Ken-Burns to `[startFrame, startFrame+durationInFrames]` (§3.2, §10). |
| 8 | NIT | "nothing existing is edited" headline | **Addressed.** §3 headline softened to "nothing existing is modified in behaviour; the only edit is appending one `<Composition>` to `Root.tsx`." |
| 9 | NIT | Music source pages unverified | **Addressed.** `fetch-music.sh` records scraped track title/page per id in `SOURCES.md`; confirm-by-ear retained (§7). |
| 10 | NIT | `startFrom` deprecated | **Addressed.** Standardized on `trimBefore`/`trimAfter` (§10); noted `startFrom`/`endAt` are deprecated aliases in 4.0.533. |
| 11 | NIT | narration validation allows truncated late VO | **Addressed.** Added `startFrame + durationInFrames ≤ FILM_DURATION` assertion (§11, §12). |
