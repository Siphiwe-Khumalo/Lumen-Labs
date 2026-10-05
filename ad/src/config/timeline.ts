// Scene timeline @30fps (DESIGN §7). Single source of truth for durations.

export const FPS = 30 as const

export interface SceneRange {
  start: number
  end: number
}

export const TIMELINE = {
  s01: { start: 0, end: 120 }, // 0.0 – 4.0s   (120f)
  s02: { start: 120, end: 240 }, // 4.0 – 8.0s   (120f)
  s03: { start: 240, end: 360 }, // 8.0 – 12.0s  (120f)
  s04: { start: 360, end: 630 }, // 12.0 – 21.0s (270f)
  s05: { start: 630, end: 750 }, // 21.0 – 25.0s (120f)
  s06: { start: 750, end: 810 }, // 25.0 – 27.0s (60f)
  s07: { start: 810, end: 885 }, // 27.0 – 29.5s (75f)
} as const satisfies Record<string, SceneRange>

export const DURATION_IN_FRAMES = 885 as const

export type SceneKey = keyof typeof TIMELINE

/** Duration of a scene in frames. */
export const sceneDuration = (key: SceneKey): number =>
  TIMELINE[key].end - TIMELINE[key].start

/**
 * Assert the scene ranges are contiguous, non-overlapping, start at 0, and sum
 * to DURATION_IN_FRAMES. Throws with the exact mismatch (DESIGN §10).
 */
export function validateTimeline(): void {
  const scenes = Object.entries(TIMELINE) as [SceneKey, SceneRange][]
  let cursor = 0
  for (const [key, range] of scenes) {
    if (range.start !== cursor) {
      throw new Error(
        `Timeline gap/overlap: scene "${key}" starts at ${range.start}, expected ${cursor}`,
      )
    }
    if (range.end <= range.start) {
      throw new Error(`Timeline: scene "${key}" has non-positive duration (${range.start}..${range.end})`)
    }
    cursor = range.end
  }
  if (cursor !== DURATION_IN_FRAMES) {
    throw new Error(
      `Timeline total ${cursor}f does not equal DURATION_IN_FRAMES ${DURATION_IN_FRAMES}f`,
    )
  }
}

validateTimeline()
