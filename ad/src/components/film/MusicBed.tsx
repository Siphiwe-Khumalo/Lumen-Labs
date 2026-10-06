// MusicBed — the two-track score with the mid-film emotional shift
// (CINEMATIC-FILM.md §7). Track A (tension) and Track B (hope) both play from
// f0 as full-length <Audio> with per-frame volume automation; the automation
// itself performs the equal-power A->B cross-fade at the SHIFT (1140-1200) and
// the near-silent held floor (0.3) across 1080-1140 before it. On top of the
// base curve, each VO window ducks the active track by DUCK (~ -7 dB) so the
// narration always sits above the music.
//
// Ducking (§7): for each NARRATION entry, a factor ramps 1 -> DUCK -> 1 across
// [start-6, start, end, end+12] (end = start + durationInFrames). Overlapping
// windows compose by taking the MIN factor (the deepest duck wins). Outside all
// windows the factor is 1.0. The final volume = base clipN curve * duck factor,
// clamped to [0,1].

import React, { useCallback } from 'react'
import { Audio, staticFile } from 'remotion'
import { NARRATION } from '../../config/narration'
import {
  DUCK,
  TRACK_A,
  TRACK_B,
  trackAVolume,
  trackBVolume,
} from '../../config/filmMusic'
import { clipN } from '../../lib/interpolate'

/** Pre-/post-roll of the duck envelope around each VO window (frames). */
const DUCK_PRE = 6
const DUCK_POST = 12

/** The composed duck multiplier at a frame: min over all VO windows (1 = none). */
function duckFactor(frame: number): number {
  let factor = 1
  for (const cue of NARRATION) {
    const start = cue.startFrame
    const end = cue.startFrame + cue.durationInFrames
    // Only evaluate windows that could affect this frame.
    if (frame < start - DUCK_PRE || frame > end + DUCK_POST) continue
    const f = clipN(
      frame,
      [start - DUCK_PRE, start, end, end + DUCK_POST],
      [1, DUCK, DUCK, 1],
    )
    if (f < factor) factor = f
  }
  return factor
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

export const MusicBed: React.FC = () => {
  const volA = useCallback(
    (f: number) => clamp01(trackAVolume(f) * duckFactor(f)),
    [],
  )
  const volB = useCallback(
    (f: number) => clamp01(trackBVolume(f) * duckFactor(f)),
    [],
  )

  return (
    <>
      <Audio src={staticFile(TRACK_A.file)} volume={volA} />
      <Audio src={staticFile(TRACK_B.file)} volume={volB} />
    </>
  )
}
