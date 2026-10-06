// Cinematic brand film timeline @30fps (CINEMATIC-FILM.md §4, §5, §11).
// Single source of truth for the nine scene ranges, the film09 lockup
// sub-beats, and the window<=clip invariant. Mirrors the load-time-validation
// discipline of src/config/timeline.ts (validateTimeline).

export const FILM_FPS = 30 as const
export const FILM_DURATION = 2700 as const // 90.0s @30fps (§4)

export interface FilmSceneRange {
  start: number
  end: number
}

// Nine ranges, 1:1 with the scene files, contiguous from 0, summing to 2700 (§4).
export const FILM_SCENES = {
  film01: { start: 0, end: 390 }, // Struggle          390f
  film02: { start: 390, end: 780 }, // Friction          390f
  film02b: { start: 780, end: 1140 }, // Weight            360f
  film03: { start: 1140, end: 1620 }, // Turn (SHIFT@1140) 480f
  film05: { start: 1620, end: 1860 }, // Software          240f
  film06: { start: 1860, end: 2100 }, // Infrastructure    240f
  film07: { start: 2100, end: 2256 }, // Control+Security  156f
  film08: { start: 2256, end: 2412 }, // Resolution        156f
  film09: { start: 2412, end: 2700 }, // Lockup            288f
} as const satisfies Record<string, FilmSceneRange>

export type FilmSceneKey = keyof typeof FILM_SCENES

/** Duration of a film scene in frames. */
export const filmSceneDuration = (key: FilmSceneKey): number =>
  FILM_SCENES[key].end - FILM_SCENES[key].start

/**
 * film09 lockup sub-beats (§5). The four sign-off statements, each given a
 * generous hold. These final boundaries were re-balanced within film09's fixed
 * 288f budget after the MEASURED VO durations (FEAT-002) came in longer than the
 * §6 estimates (notably vo14=120f, vo16=61f). film09's total is unchanged at
 * 288f and the nine scene ranges still sum to 2700. See narration.ts for the
 * matching vo13..vo16 startFrames and the beatEnd-(voStart+dur) >= 6 invariant.
 */
// beat: { start, end, fadeIn, fadeOut } — fades in frames; hold = len - fades.
// Fades are kept short (3-8f) so each sign-off caption gets the longest possible
// full-opacity hold within film09's fixed 288f budget. The hard constraint is
// the MEASURED VO: vo14 (the vision line) is 120f, which pins b2's end (vo14 must
// clear its beat end by >= 6f). After the film-review flagged b3's hold as under
// the design's >= 48f/1.6s floor, the beats were re-balanced: b1/b2 give back a
// few frames and b3/b4 use tighter 3f fades, lifting b3 from 40f/1.33s to
// 45f/1.5s (b2 still holds a generous ~111f for the two-sentence vision line).
// With vo14=120f fixed and the total pinned at 288f (90.0s, the top of the
// 75-90s window), 45f is the practical maximum for b3; a full 48f would require
// exceeding 90s. The >= 6f VO/beat invariant (the gated test) holds for all four
// with >= 6f margin, and every sign-off line now holds >= 1.5s at full opacity.
export const LOCKUP_BEATS = {
  b1: { start: 2412, end: 2471, fadeIn: 4, fadeOut: 4 }, // "Built with intention."       59f -> hold 51f
  b2: { start: 2471, end: 2591, fadeIn: 5, fadeOut: 5 }, // vision line (C9)             120f -> hold 110f
  b3: { start: 2591, end: 2642, fadeIn: 3, fadeOut: 3 }, // "Small enough to care."       51f -> hold 45f
  b4: { start: 2642, end: 2700, fadeIn: 3, fadeOut: 3 }, // "Technical enough to build."  58f -> hold 52f
} as const satisfies Record<string, FilmSceneRange & { fadeIn: number; fadeOut: number }>

export type LockupBeatKey = keyof typeof LOCKUP_BEATS

/** Full-opacity hold (len - fadeIn - fadeOut) of a lockup beat. */
export const lockupHold = (key: LockupBeatKey): number => {
  const b = LOCKUP_BEATS[key]
  return b.end - b.start - b.fadeIn - b.fadeOut
}

/**
 * Assert the scene ranges are contiguous, non-overlapping, start at 0, each
 * positive, and sum to FILM_DURATION (2700). Throws the exact mismatch (§4/§11).
 * Mirrors validateTimeline() in src/config/timeline.ts.
 */
export function validateFilmTimeline(): void {
  const scenes = Object.entries(FILM_SCENES) as [FilmSceneKey, FilmSceneRange][]
  let cursor = 0
  for (const [key, range] of scenes) {
    if (range.start !== cursor) {
      throw new Error(
        `Film timeline gap/overlap: scene "${key}" starts at ${range.start}, expected ${cursor}`,
      )
    }
    if (range.end <= range.start) {
      throw new Error(
        `Film timeline: scene "${key}" has non-positive duration (${range.start}..${range.end})`,
      )
    }
    cursor = range.end
  }
  if (cursor !== FILM_DURATION) {
    throw new Error(
      `Film timeline total ${cursor}f does not equal FILM_DURATION ${FILM_DURATION}f`,
    )
  }

  // The lockup sub-beats must themselves tile film09 exactly.
  const film09 = FILM_SCENES.film09
  const beats = Object.entries(LOCKUP_BEATS) as [
    LockupBeatKey,
    FilmSceneRange & { fadeIn: number; fadeOut: number },
  ][]
  let bc: number = film09.start
  for (const [key, beat] of beats) {
    if (beat.start !== bc) {
      throw new Error(
        `Lockup beats gap/overlap: beat "${key}" starts at ${beat.start}, expected ${bc}`,
      )
    }
    if (beat.end <= beat.start) {
      throw new Error(
        `Lockup beat "${key}" has non-positive duration (${beat.start}..${beat.end})`,
      )
    }
    if (beat.fadeIn + beat.fadeOut > beat.end - beat.start) {
      throw new Error(`Lockup beat "${key}" fades exceed its length`)
    }
    bc = beat.end
  }
  if (bc !== film09.end) {
    throw new Error(
      `Lockup beats total ends at ${bc}, expected film09 end ${film09.end}`,
    )
  }
}

/**
 * A storyboard shot's footage window: the scene it belongs to, the footage key,
 * the window length in frames, and the clip in-point (default 0). Used by
 * validateFootageWindows() to enforce window + inPoint <= clip duration (§11).
 */
export interface FilmShot {
  id: string
  footageKey: string
  durationInFrames: number
  inPoint?: number
}

// Every §5 storyboard shot that renders footage, with its window length.
export const FILM_SHOTS: readonly FilmShot[] = [
  { id: '1.1', footageKey: 'struggle-worried', durationInFrames: 150 },
  { id: '1.2', footageKey: 'office-open', durationInFrames: 240 },
  { id: '2.1', footageKey: 'office-glasses-reflection', durationInFrames: 170 },
  { id: '2.2', footageKey: 'laptop-work', durationInFrames: 220 },
  { id: '2b.1', footageKey: 'office-busy', durationInFrames: 200 },
  { id: '2b.2', footageKey: 'rooftop-sunset', durationInFrames: 160 },
  { id: '3.1', footageKey: 'meeting-collab', durationInFrames: 180 },
  { id: '3.2', footageKey: 'handshake', durationInFrames: 150 },
  { id: '3.3', footageKey: 'engineer-workshop', durationInFrames: 150 },
  { id: '5.1', footageKey: 'dev-code', durationInFrames: 120 },
  { id: '5.2', footageKey: 'dev-topview', durationInFrames: 120 },
  { id: '6.1', footageKey: 'multiscreen', durationInFrames: 120 },
  { id: '6.2', footageKey: 'city-aerial-night', durationInFrames: 120 },
  { id: '7.1', footageKey: 'ops-twoscreen', durationInFrames: 156 },
  { id: '8.1', footageKey: 'park-sunrise', durationInFrames: 156 },
] as const

/**
 * Assert every storyboard shot's window + inPoint fits inside its clip's real
 * durationInFrames (§11 hard clip-length invariant). `durations` maps a footage
 * key to the clip's probed durationInFrames; passing a fixture map lets this run
 * without the downloaded files present (§12).
 */
export function validateFootageWindows(durations: Record<string, number>): void {
  for (const shot of FILM_SHOTS) {
    const clip = durations[shot.footageKey]
    if (clip === undefined) {
      throw new Error(
        `Footage window check: no clip duration for key "${shot.footageKey}" (shot ${shot.id})`,
      )
    }
    const need = shot.durationInFrames + (shot.inPoint ?? 0)
    if (need > clip) {
      throw new Error(
        `Footage window exceeds clip: shot ${shot.id} ("${shot.footageKey}") needs ${need}f but clip is ${clip}f`,
      )
    }
  }
}

validateFilmTimeline()
