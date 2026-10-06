# Design Review — Lumen Labs Cinematic Brand Film (CINEMATIC-FILM.md, Revision 3)

**Reviewed artifact:** `/projects/sandbox/Lumen-Labs/.worktrees/cinematic-film/ad/CINEMATIC-FILM.md`
**Reviewed fresh**, against the actual repository source and live asset endpoints. This is a design/storyboard review only — no builds or renders were run.

**Verdict: CHANGES_REQUESTED** (1 HIGH, 2 MEDIUM, 6 NIT).

The design is unusually thorough and most of its load-bearing claims hold up under verification: the `kenBurns` options-object signature, the `copy.ts` strings (including the full 5-item `s04.control.items` array with SCADA), the reused component/lib/config exports, the Remotion `OffthreadVideo`/`trimBefore` primitive, the installed `edge-tts` + `@remotion/media-parser` + bundled `ffprobe`, and every Mixkit footage/music URL used in the cut all check out live. The blocking issues are a residual music-automation vs. prose contradiction (the exact defect rev-2 F1 claimed to fix), under-sized readability holds on two of the four closing sign-off statements, and a self-stated frame-headroom invariant that the lockup numbers violate.

---

## Findings

### 1. [MEDIUM] Track A "near-silent across 1080–1140" still contradicts its own keyframe curve
**Where:** §7 (music), §5 shot 2b.2, §1/§2, and the §16b F1 response.

The single authoritative Track A automation is
`clipN(f, [0, 60, 1080, 1140, 1200], [0, 0.9, 0.9, 0.3, 0])`. By that curve the volume is **0.9 at frame 1080** and only reaches **0.3 at frame 1140** — a linear ramp *down over* 1080→1140. But the prose repeatedly says the beat is **near-silent across the held low point (1080–1140)** and "the last 60f (1080–1140) are near-silent — Track A dips to 0.3." At f1080 the bed is still at near-full 0.9; it is near-silent only at the single instant f1140, which is also where the A→B cross-fade begins. So there is no held near-silent beat — exactly the class of self-contradiction rev-2 F1 was supposed to resolve; the keyframes were edited but the window described in prose does not match what the curve produces.

**Concrete fix:** make the dip actually *held* by moving the drop earlier and holding the floor, e.g.
`clipN(f, [0, 60, 1020, 1080, 1140, 1200], [0, 0.9, 0.9, 0.3, 0.3, 0])` — ramp down 1020→1080, hold 0.3 across 1080→1140, cross-fade out 1140→1200. Then the "near-silent across 1080–1140" prose is literally true. Alternatively, correct the prose to "ramps down from f1080, reaching 0.3 at the f1140 turn" and drop the "held near-silent beat" language from §1/§2/§5. Pick one and make all four sections state the same thing.

### 2. [MEDIUM] Closing sign-off statements 9.3 and 9.4 get too little readable hold for the brief's "never rush text / give important statements enough screen time"
**Where:** §5 lockup beats 9.3 (`Small enough to care.`, 54f/1.8s) and 9.4 (`Technical enough to build.`, 54f/1.8s); §9 C10/C11 (hold "~1.8s").

The brief is explicit and repeated: "Give important statements enough screen time to be read comfortably… Never rush information onto the screen." §5 states each lockup line has "Fade-in ≈ 18f, fade-out ≈ 18f inside each window." For a 54f beat that leaves only ~18f (0.6s) at full opacity — the fade-in and fade-out consume two-thirds of the beat. These are the brand's two signature sign-off lines; 0.6s of full-opacity hold is a rushed read, contradicting the design's own "generously held" claim and the brief. (9.1 at 60f and 9.2 at 72f have the same squeeze but a little more slack.)

**Concrete fix:** either (a) lengthen 9.3/9.4 to ≥72f each and shorten the fades to ~12f (giving ≥48f / 1.6s full hold), re-balancing within `film09`'s 240f — which would require growing `film09` or trimming an Act-3 capability scene; or (b) raise `FILM_DURATION`'s lockup allocation. Since 2700 is already the hard ceiling (2250–2700 window), the realistic fix is to redistribute: e.g. trim `film08` Resolution from 180f to 150f and `film07` from 180f to 150f, add 60f to `film09` (300f total), and give 9.1–9.4 holds of ~72/84/72/72f. State the full-opacity hold (not just the beat length) for each lockup line so the readability requirement is checkable.

### 3. [HIGH] The lockup VO windows violate the design's own "ends ≥ 6f before its beat boundary" invariant
**Where:** §5 lockup note ("Each VO window ends ≥ 6f before its beat boundary"), beats 9.1–9.4, and §6 VO table.

The design asserts a concrete invariant and then breaks it for three of four lockup beats:
- 9.1: beat `2460–2520`, `vo13` ends **2518** → **2f** before the boundary (not ≥6f).
- 9.2: beat `2520–2592`, `vo14` ends **2588** → **4f** before (not ≥6f).
- 9.3: beat `2592–2646`, `vo15` ends **2642** → **4f** before (not ≥6f).
- 9.4: beat `2646–2700`, `vo16` ends **2694** → 6f before (OK).

This is a stated, mechanical rule that the storyboard's own numbers contradict — the kind of invariant an implementer will encode as an assertion and then watch fail, or (worse) silently trust the prose over the numbers. It matters because `vo13` is already a *measured* 52f (not an estimate), so 9.1's 2f gap is real today, not an estimation artifact. Combined with Finding 2, the lockup beats are over-packed.

**Concrete fix:** adopt whichever is true and enforce it in `narration.ts` validation. Either relax the stated invariant to the real minimum ("each VO window ends ≥ 2f before its beat boundary") OR re-time the beats so every window genuinely clears ≥6f (this naturally falls out of the Finding-2 redistribution). Add the assertion `every lockup vo: beatEnd - (startFrame + durationInFrames) >= GAP` to `narration.test.ts` with the chosen `GAP`, so prose and numbers can never drift again.

### 4. [NIT] `trimAfter` is itself deprecated in 4.0.533 — the §10 parenthetical is inaccurate
**Where:** §10 ("the current Remotion 4.0.533 trim prop (`trimBefore`/`trimAfter`; `startFrom`/`endAt` are deprecated aliases, review F10)").

Verified against `node_modules/remotion/dist/cjs/video/props.d.ts`: `trimBefore` is current, but `trimAfter` is explicitly `@deprecated Use durationInFrames instead`, and `startFrom`/`endAt` are the deprecated aliases of `trimBefore`/`trimAfter` respectively. The design only ever *uses* `trimBefore` (functionally correct), but the parenthetical presents `trimAfter` as a current prop.

**Concrete fix:** change to "use `trimBefore` for the in-point and `durationInFrames` for the length; `startFrom`/`endAt`/`trimAfter` are deprecated." The window length already comes from the shot range, so this is just doc accuracy.

### 5. [NIT] `914` (film01 1.2) is used in the cut but was never content-verified, and only its URL was spot-checked
**Where:** §8 (verified sources) and the §8 clip table (`914 office-open.mp4`, film01 1.2).

`914` carries a Copy row (C1 "A business doesn't fail…") and 240f of screen time, yet it is not in the rev-3 re-checked set (`8739, 4809, 1728, 30012, 49878`) and the §8 content-verification gate is deferred to fetch time. (I did independently confirm `914` returns HTTP 206, so the URL is live — the gap is content, not availability.) This is acceptable *only because* the §8/§14-step-3 contact-sheet gate exists; flagging so the implementer does not skip eyeballing `914` on the assumption that "Open office space" matches the "cold empty office before anyone arrives" intent.

**Concrete fix:** none required to the design; add `914` to the explicit "must eyeball before authoring film01" list in §8 so the Copy-bearing hero shot is not overlooked at the gate.

### 6. [NIT] No `VERIFICATION.md` is planned, though the review scope and the project's own evidence pattern call for one
**Where:** §3.3 file tree, §12 Testability, §14 build order.

The design plans `SOURCES.md` (footage + music) and `AUDIO.md`, and §12 lists the still/render/typecheck evidence, but there is no single `VERIFICATION.md` capturing the end-to-end proof (URL resolution log, generated-VO durations, contact-sheet sign-off, final `ffprobe` of resolution/duration/audio-stream). The existing film used a still-evidence pattern; a consolidated verification doc is the natural home for it and was explicitly asked for in the review scope.

**Concrete fix:** add `ad/VERIFICATION.md` to §3.3 and a final §14 step that writes it: the live 206 checks for every id *actually used*, the measured `durationInFrames` per VO line, the contact-sheet pass/fail per clip, and the final-render `ffprobe` output proving 1920×1080@30, ~90s, and ≥1 audio stream.

### 7. [NIT] The mono meta line (`SOUTH AFRICAN TECHNOLOGY STUDIO`, C13) is not wired to a component in the lockup spec
**Where:** §5 beat 9.5 ("`LUMEN LABS` wordmark (`COPY.s03Wordmark`) + mono `SOUTH AFRICAN TECHNOLOGY STUDIO`") and §9 C13.

`LogoReveal` (verified) renders only the `BrandMark` + the `LUMEN LABS` wordmark — it has no slot for a second meta sub-line. §9 lists C13 as a caption but §5 beat 9.5 implies it comes "with" `LogoReveal`. The implementer must add a separate `AnimatedText` with `FONT.mono` (JetBrains Mono) beneath the wordmark; this is not spelled out.

**Concrete fix:** in §5 beat 9.5, state explicitly: "C13 renders as a separate `AnimatedText font='mono'` block placed under the `LogoReveal` output; `LogoReveal` is used with `withWordmark` and `speed='fast'`." Confirm `FONT.mono` resolves to the vendored JetBrains Mono in `typography.ts`.

### 8. [NIT] 15 of 16 VO durations are estimates, so the `film08`→lockup bridge timing is unproven for `vo12`
**Where:** §6 VO table (`vo12` ~95f at start 2292, inside `film08` 2280–2460).

The design correctly flags `vo14`–`vo16` as the risky short-beat lines and documents a bounded re-time loop. `vo12` ("The weight lifts. And the vision has room to grow.") at an estimated ~95f starting 2292 ends ~2387, well inside `film08`'s 2460 end — comfortable. No overrun risk; noted only to confirm the estimate was checked and the bridge line is not a hidden tight spot. The load-time assertion covers any surprise.

**Concrete fix:** none; the estimate is safe. Keep the §6 build-order dependency (generate VO before finalizing lockup) as written.

### 9. [NIT] "Act 1 (0–1200)" vs "Act 1 (0–1140)" labeling drift in the music table
**Where:** §7 music table ("Track A … Used: Act 1 (0–1200)") vs §2/§4 (Act 1 ends at 1140; the cross-fade *tail* runs to 1200).

Track A audibly extends to 1200 (its fade-out tail), but Act 1 as a narrative/timeline unit ends at 1140. The "Act 1 (0–1200)" label blurs the act boundary with the audio tail. Harmless but momentarily confusing against the precise 1140 shift point the whole design keys to.

**Concrete fix:** relabel to "Track A: 0–1200 (Act 1 + cross-fade tail)" / "Track B: 1140–end" so the audio windows are not conflated with the act boundaries.

---

## Verified Assumptions (checked against source / live endpoints)

1. **`kenBurns` signature** — the design's options-object call shape `kenBurns(frame, [start, end], { fromScale, toScale, panX?, panY?, easing? })` **matches** `src/lib/interpolate.ts` exactly, including the 0.08 `MAX_SCALE_DELTA` clamp. (Rev-2 F2 genuinely resolved.)
2. **`copy.ts` strings** — `s05a`, `s05b`, `s06Tagline`, `s03Wordmark`, `s06Meta[1]` all match verbatim. `s04.control.items` is the full **5-item** array `['Automation','SCADA','Cybersecurity','CCTV','VoIP']` incl. SCADA; `s04.software.items` and `s04.infrastructure.items` match C5/C6. (Rev-1 F3 genuinely resolved.)
3. **Reused exports exist** — `EASE` + `SPRING` (`easing.ts`), `clip`/`clipN`/`tracking`/`kenBurns` (`interpolate.ts`), `COLOR`/`GRADE` tokens incl. `duotoneAmber`/`duotoneSteel`/`scrim`/`filter` (`brand.ts`), `FORMATS.wide` = 1920×1080@30 (`formats.ts`), `getAsset` throw-pattern (`assets.ts`), `LogoReveal` with `speed='fast'`/`withWordmark` props (`LogoReveal.tsx`), `AnimatedText` is **reveal-only with no exit animation** (`AnimatedText.tsx`) — confirming the §9 claim that `Caption.tsx` must own its own fade-out. (Rev-2 F4 premise verified true.)
4. **`Root.tsx`** currently registers exactly three `LaunchFilm-*` compositions sharing one `LaunchFilm` component — appending a fourth `<Composition id="BrandFilm">` is non-destructive as claimed.
5. **`validateTimeline()` pattern** exists in `timeline.ts` and runs at module load — the `validateFilmTimeline()` contract mirror is realistic.
6. **Remotion `OffthreadVideo` + `trimBefore`** — `OffthreadVideo` is exported, and `trimBefore`/`durationInFrames` are current props in 4.0.533 (`props.d.ts`). The frame-accurate-playback claim holds.
7. **Tooling installed** — `edge-tts 7.2.8` at `~/.local/bin/edge-tts`; `@remotion/media-parser` present; bundled `@remotion/compositor-linux-x64-gnu/ffprobe` present. (Rev-1 F1 / rev-1 F6 fallback verified installed.)
8. **Mixkit endpoints live** — every footage id used in the cut returns **HTTP 206 video/mp4**: `8739, 914, 221, 308, 918, 4840, 4809, 30012, 29991, 1728, 1735, 41642, 49878, 41637, 4831`, plus reserves `41640, 1808`. Music `18` and `158` return **HTTP 206 audio/mpeg**. The keyless, no-attribution pipeline is real.
9. **Fonts vendored** — the three WOFF2 files are present under `public/fonts/`; zero-network font claim holds.
10. **Three-act emotional arc** — the narrative genuinely moves struggle → turn → transformation (not a service list); the discovery/shift is a single named frame (**1140**) to which music cross-fade, grade warm-up, and the naming VO line all key. This satisfies the brief's core structural requirement.
11. **Forbidden-visual avoidance** — all sources are real licensed stock of real people/desks/cities; the one borderline futuristic clip (`99786`) is explicitly rejected; grade is non-destructive CSS filter with no neon/holograms/particles/glassmorphism. No synthetic environments or AI people.
12. **Additive scope** — the only existing-file edit is one appended `<Composition>` in `Root.tsx` plus one `package.json` script; new line `C9` lives in a new `filmCopy.ts` that re-exports (not re-literals) `COPY`, keeping `copy.test.ts` green. Reuse-not-fork is respected.

## Unverified / Wrong Assumptions

1. **WRONG (minor):** §10 presents `trimAfter` as a current Remotion prop; it is `@deprecated` in 4.0.533 in favor of `durationInFrames` (Finding 4). The design's actual usage (`trimBefore` only) is correct, but the doc text is inaccurate.
2. **WRONG (internal):** §5's "each VO window ends ≥6f before its beat boundary" is false for lockup beats 9.1 (2f), 9.2 (4f), 9.3 (4f) given the §6 start/duration numbers (Finding 3).
3. **WRONG (internal):** §7/§5/§1/§2's "near-silent *across* 1080–1140" does not match the Track A keyframe curve, which is still at 0.9 at 1080 and only reaches 0.3 at 1140 (Finding 1).
4. **UNVERIFIED (deferred by design, acceptable):** actual *content* of every clip vs. its storyboard role — gated behind the §8/§14-step-3 contact-sheet eyeball step. URLs confirmed live; pixels not inspected (correctly out of a design review's scope). Flagged `914` specifically (Finding 5).
5. **UNVERIFIED (deferred by design, acceptable):** 15/16 VO `durationInFrames` are edge-tts estimates until `generate-vo.sh` writes the measured values; only `vo13`=52f is measured. The load-time assertion + documented re-time loop make this a bounded, build-time-caught risk rather than a silent failure.
6. **UNVERIFIED (acceptable):** final A/B music track *character* ("restrained/tense" vs "hopeful") is confirm-by-ear at fetch; only downloadability (206) is proven. The design locks roles + shift mechanics, not the subjective sound — reasonable for this stage.
7. **NOT PLANNED:** a consolidated `VERIFICATION.md` (Finding 6) — the end-to-end proof is scattered across `SOURCES.md`/`AUDIO.md`/§12 evidence commands rather than one checkable artifact.

---

## Verdict rationale (mechanical)

HIGH = 1 (Finding 3), MEDIUM = 2 (Findings 1, 2). HIGH+MEDIUM = 3 > 0 ⇒ **CHANGES_REQUESTED**. The three blockers are all tight-loop fixes (re-time four lockup beats under a stated headroom rule, make the music dip actually held or correct the prose, and give the two closing statements comfortable holds) — none require re-architecting the pipeline, which is otherwise proven and specific.
