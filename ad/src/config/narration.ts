// Narration script for the cinematic brand film (CINEMATIC-FILM.md §6).
// Ordered vo01..vo16. durationInFrames are the MEASURED values from the
// generated VTTs (FEAT-002, public/audio/vo/measured-durations.json), NOT the
// §6 estimates. The reused sign-off lines (vo13/vo15/vo16) reference the COPY
// members so a typo is a type error; vo14 is the spoken (single-line) form of
// FILM_COPY.visionLine. All VO text is swappable: edit here and re-run
// scripts/generate-vo.sh.
//
// LOCKUP RE-TIME (§5/§6 build-order dependency): the measured vo14 (120f) and
// vo16 (61f) came in longer than the §6 estimates. The four lockup VO starts
// below were re-timed so that for every one of the 16 lines
//   beatEnd - (startFrame + durationInFrames) >= 6   AND
//   startFrame + durationInFrames <= FILM_DURATION.
// film09's total stays 288f and the nine scene ranges still sum to 2700. The
// matching lockup sub-beats live in filmTimeline.ts (LOCKUP_BEATS). narration
// .test.ts asserts the >= 6 invariant for all 16 lines against their beat ends.

import { COPY } from './copy'
import { FILM_COPY } from './filmCopy'
import { FILM_DURATION } from './filmTimeline'

export interface NarrationCue {
  id: string
  text: string
  startFrame: number
  durationInFrames: number
  /** Path relative to public/ (served via staticFile). */
  file: string
}

export const NARRATION: readonly NarrationCue[] = [
  { id: 'vo01', text: "A business doesn't fail in one big moment.", startFrame: 162, durationInFrames: 97, file: 'audio/vo/vo01.mp3' },
  { id: 'vo02', text: "It's the small things. The tools that don't fit.", startFrame: 408, durationInFrames: 97, file: 'audio/vo/vo02.mp3' },
  { id: 'vo03', text: "The systems that don't talk. The hours that disappear.", startFrame: 560, durationInFrames: 115, file: 'audio/vo/vo03.mp3' },
  { id: 'vo04', text: "You're working harder than ever — and still watching chances slip past.", startFrame: 804, durationInFrames: 140, file: 'audio/vo/vo04.mp3' },
  { id: 'vo05', text: 'There has to be a better way.', startFrame: 1020, durationInFrames: 51, file: 'audio/vo/vo05.mp3' },
  { id: 'vo06', text: 'Then they found a partner who started with the problem — not a product.', startFrame: 1152, durationInFrames: 120, file: 'audio/vo/vo06.mp3' },
  { id: 'vo07', text: 'Someone small enough to listen. Technical enough to build.', startFrame: 1332, durationInFrames: 121, file: 'audio/vo/vo07.mp3' },
  { id: 'vo08', text: 'And slowly, the pieces started to fit.', startFrame: 1500, durationInFrames: 96, file: 'audio/vo/vo08.mp3' },
  { id: 'vo09', text: 'Software and systems, built around how the business actually works.', startFrame: 1632, durationInFrames: 154, file: 'audio/vo/vo09.mp3' },
  { id: 'vo10', text: 'Infrastructure, networks, the cloud — quietly doing their job.', startFrame: 1872, durationInFrames: 141, file: 'audio/vo/vo10.mp3' },
  { id: 'vo11', text: 'Secured. Connected. Under control.', startFrame: 2112, durationInFrames: 93, file: 'audio/vo/vo11.mp3' },
  { id: 'vo12', text: 'The weight lifts. And the vision has room to grow.', startFrame: 2292, durationInFrames: 108, file: 'audio/vo/vo12.mp3' },
  // --- film09 lockup (re-timed; see header + filmTimeline LOCKUP_BEATS) ---
  { id: 'vo13', text: COPY.s06Tagline, startFrame: 2412, durationInFrames: 53, file: 'audio/vo/vo13.mp3' },
  { id: 'vo14', text: 'Your business has a vision. We build what brings it to life.', startFrame: 2465, durationInFrames: 120, file: 'audio/vo/vo14.mp3' },
  { id: 'vo15', text: COPY.s05a, startFrame: 2589, durationInFrames: 47, file: 'audio/vo/vo15.mp3' },
  { id: 'vo16', text: COPY.s05b, startFrame: 2633, durationInFrames: 61, file: 'audio/vo/vo16.mp3' },
] as const

// vo14's spoken text is the single-line form of the on-screen C9 line (the
// newline in FILM_COPY.visionLine is a line break for the caption only).
const VISION_SPOKEN = FILM_COPY.visionLine.replace(/\n/g, ' ')

/**
 * Validate every narration cue at module load (§11):
 *  - ids unique
 *  - startFrame in [0, FILM_DURATION)
 *  - startFrame + durationInFrames <= FILM_DURATION  (no truncated late VO)
 *  - the reused sign-off lines equal their COPY members
 *  - vo14 equals the spoken form of FILM_COPY.visionLine
 * Throws the exact mismatch, mirroring the existing validate* pattern.
 */
export function validateNarration(): void {
  const seen = new Set<string>()
  for (const cue of NARRATION) {
    if (seen.has(cue.id)) {
      throw new Error(`Narration: duplicate cue id "${cue.id}"`)
    }
    seen.add(cue.id)
    if (!cue.text || cue.text.trim().length === 0) {
      throw new Error(`Narration cue "${cue.id}" has empty text`)
    }
    if (cue.startFrame < 0 || cue.startFrame >= FILM_DURATION) {
      throw new RangeError(
        `Narration cue "${cue.id}": startFrame ${cue.startFrame} out of [0, ${FILM_DURATION})`,
      )
    }
    if (cue.durationInFrames <= 0) {
      throw new RangeError(
        `Narration cue "${cue.id}": non-positive durationInFrames (${cue.durationInFrames})`,
      )
    }
    if (cue.startFrame + cue.durationInFrames > FILM_DURATION) {
      throw new RangeError(
        `Narration cue "${cue.id}": ends at ${cue.startFrame + cue.durationInFrames}f, past FILM_DURATION ${FILM_DURATION}f`,
      )
    }
  }

  const byId = (id: string): NarrationCue => {
    const cue = NARRATION.find((c) => c.id === id)
    if (!cue) {
      throw new Error(`Narration: expected cue "${id}" is missing`)
    }
    return cue
  }
  if (byId('vo13').text !== COPY.s06Tagline) {
    throw new Error('Narration: vo13 must equal COPY.s06Tagline')
  }
  if (byId('vo15').text !== COPY.s05a) {
    throw new Error('Narration: vo15 must equal COPY.s05a')
  }
  if (byId('vo16').text !== COPY.s05b) {
    throw new Error('Narration: vo16 must equal COPY.s05b')
  }
  if (byId('vo14').text !== VISION_SPOKEN) {
    throw new Error('Narration: vo14 must equal the spoken form of FILM_COPY.visionLine')
  }
}

validateNarration()
