# Orchestrator-verified facts (AUTHORITATIVE) — resolves design-review blockers

The orchestrator re-verified these on this machine. They override contradicting
claims in design-review.md. Use them in the next design pass.

## 1. edge-tts IS installed and working (resolves HIGH #1)

The design-reviewer's "edge-tts is NOT installed" finding is a PATH-DETECTION
miss, not a real blocker. edge-tts is installed via pipx and is on disk at an
explicit path. `edge-tts` is not on the default PATH, so call it by absolute path.

- Binary: `/root/.local/bin/edge-tts`  (also resolvable via `command -v edge-tts`)
- Proof just run on this machine:
  `~/.local/bin/edge-tts --voice en-US-AndrewMultilingualNeural --rate=-8% --pitch=-2Hz \
     --text "..." --write-media out.mp3 --write-subtitles out.vtt`
  → produced a real MP3 (24KB) AND a WebVTT with word/line timing.
- IMPLICATION: use `--write-subtitles` to get exact per-line narration timing, and
  drive on-screen text + beat holds off those real timings rather than guesses.
- The generate-vo script MUST invoke edge-tts via `~/.local/bin/edge-tts` (or
  `"$(command -v edge-tts)"`), never bare `edge-tts`. Document this in AUDIO.md.
- Voice locked: `en-US-AndrewMultilingualNeural` (warm/confident/authentic),
  `--rate=-8% --pitch=-2Hz`; fallback `en-US-BrianNeural`.

## 2. The ending must BREATHE — extend the finale (resolves HIGH #2)

The client's explicit priority (see CREATIVE-DIRECTION.md) is that the sign-off
"lands like a film's final frame," each line given real room. A ~4s (120f) finale
cannot hold 4 VO lines + the four sign-off statements comfortably — the reviewer
is right that it's over-stuffed. Fix by GIVING IT TIME, not by cramming:

- Reallocate the timeline so the closing sequence (from the final BrandMark
  resolve through the last held frame) gets enough frames for each on-screen
  statement to appear, hold long enough to read unhurried, and settle — with the
  narration lines landing in the gaps, not stacked.
- The four verbatim lines sequence with comfortable holds (not simultaneously):
  1) "BUILT WITH INTENTION."
  2) "Your business has a vision. We build what brings it to life."  (the one new line)
  3) "Small enough to care. Technical enough to build."
  4) "LUMEN LABS" (logo lockup, held like a film's last shot)
- Total runtime may sit anywhere in the 75–90s window (2250–2700f @30fps); use the
  upper part of that range if needed so the finale is unrushed. Keep act-shift and
  music-shift beats on clean frames. Trim an Act-1/Act-3 hold if frames are needed
  elsewhere — the finale's room is the priority.

## 3. Other review findings — resolve as noted
- C7 caption dropping SCADA while claiming "exact copy.ts array joined": either use
  the exact array verbatim or stop claiming it's verbatim. Keep copy in config.
- Verify clip CONTENT, not just that URLs return 206: during acquisition, actually
  download the shortlisted Mixkit ids and eyeball a frame so the shot matches the
  story beat (a "struggling owner" clip must actually show that). Swap any mismatch.
- Specify music ducking concretely (duck Track A/B under VO by a fixed dB/gain via
  Remotion <Audio> volume automation; restore in the gaps).
- Replace any non-native OffthreadVideo "freeze" claim with a real Remotion
  technique (e.g. hold on a still/last frame via trimming + a frozen <Img>, or
  playbackRate, documented accurately).

If anything here conflicts with the design doc, these verified facts win.
