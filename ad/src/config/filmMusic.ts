// Music plan for the cinematic brand film (CINEMATIC-FILM.md §7).
// Two Mixkit tracks cross-faded in-composition at the discovery SHIFT (f1140).
// Track A (tension) fades up, holds, dips to a held near-silent floor across
// 1080->1140, then cross-fades out over 1140->1200. Track B (hope) fades in over
// 1140->1200 and tails out under the lockup. VO ducking multiplies the active
// track by DUCK=0.45 inside each narration window (applied in MusicBed, FEAT-004).
// Validated at load: SHIFT_FRAME inside the timeline, fade keyframes monotonic
// in time, DUCK in (0,1).

import { clipN } from '../lib/interpolate'
import { FILM_DURATION } from './filmTimeline'

export const SHIFT_FRAME = 1140 as const // the discovery moment / A->B cross-fade

/** Duck multiplier applied to the active track across each VO window (~ -7 dB). */
export const DUCK = 0.45 as const

export interface MusicTrack {
  id: string
  /** Path relative to public/ (served via staticFile). */
  file: string
  /** clipN keyframe times (frames) — monotonic increasing. */
  times: readonly number[]
  /** clipN output volumes in [0,1] aligned to `times`. */
  volumes: readonly number[]
}

// Track A — tension bed (Act 1). Fades up, holds 0.9, ramps down 1020->1080,
// HOLDS the near-silent floor 0.3 across 1080->1140, then cross-fades out
// 1140->1200. This single keyframe list is authoritative (§7).
export const TRACK_A: MusicTrack = {
  id: 'A',
  file: 'audio/music/track-a-tension.mp3',
  times: [0, 60, 1020, 1080, 1140, 1200],
  volumes: [0, 0.9, 0.9, 0.3, 0.3, 0],
}

// Track B — hopeful/uplifting (Act 2-3). Fades in over the shift 1140->1200,
// holds 0.85, soft tail 2520->2700 under the lockup (§7).
export const TRACK_B: MusicTrack = {
  id: 'B',
  file: 'audio/music/track-b-hope.mp3',
  times: [1140, 1200, 2520, 2700],
  volumes: [0, 0.85, 0.85, 0.0],
}

/** The cross-fade window at the shift (equal-power A->B). */
export const CROSSFADE: readonly [number, number] = [1140, 1200]

/** Base (pre-duck) volume of a track at a frame — clamped both ends by clipN. */
export const trackVolume = (track: MusicTrack, frame: number): number =>
  clipN(frame, track.times, track.volumes)

export const trackAVolume = (frame: number): number => trackVolume(TRACK_A, frame)
export const trackBVolume = (frame: number): number => trackVolume(TRACK_B, frame)

/**
 * Validate the music config at load (§7/§11):
 *  - SHIFT_FRAME strictly inside the timeline
 *  - DUCK in (0,1)
 *  - each track's keyframe times are strictly monotonic increasing and its
 *    volume outputs are in [0,1] and aligned 1:1 with the times
 *  - Track A fades out and Track B fades in across the cross-fade window
 * Throws the exact mismatch.
 */
export function validateFilmMusic(): void {
  if (SHIFT_FRAME <= 0 || SHIFT_FRAME >= FILM_DURATION) {
    throw new RangeError(
      `Music: SHIFT_FRAME ${SHIFT_FRAME} not inside (0, ${FILM_DURATION})`,
    )
  }
  if (!(DUCK > 0 && DUCK < 1)) {
    throw new RangeError(`Music: DUCK ${DUCK} must be in (0, 1)`)
  }
  for (const track of [TRACK_A, TRACK_B]) {
    if (track.times.length !== track.volumes.length) {
      throw new Error(`Music track ${track.id}: times/volumes length mismatch`)
    }
    if (track.times.length < 2) {
      throw new Error(`Music track ${track.id}: needs at least two keyframes`)
    }
    for (let i = 1; i < track.times.length; i++) {
      if (track.times[i] <= track.times[i - 1]) {
        throw new Error(
          `Music track ${track.id}: keyframe times not monotonic at index ${i} (${track.times[i - 1]} -> ${track.times[i]})`,
        )
      }
    }
    for (const v of track.volumes) {
      if (v < 0 || v > 1) {
        throw new RangeError(`Music track ${track.id}: volume ${v} out of [0,1]`)
      }
    }
  }
  // A must fall and B must rise across the cross-fade window.
  const [cf0, cf1] = CROSSFADE
  if (!(trackAVolume(cf1) < trackAVolume(cf0))) {
    throw new Error('Music: Track A must fade out across the cross-fade window')
  }
  if (!(trackBVolume(cf1) > trackBVolume(cf0))) {
    throw new Error('Music: Track B must fade in across the cross-fade window')
  }
}

validateFilmMusic()
