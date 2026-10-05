import { describe, it, expect } from 'vitest'
import { TIMELINE, DURATION_IN_FRAMES, validateTimeline, sceneDuration } from '../config/timeline'

describe('timeline', () => {
  it('validates without throwing', () => {
    expect(() => validateTimeline()).not.toThrow()
  })

  it('is contiguous and non-overlapping from 0', () => {
    let cursor = 0
    for (const range of Object.values(TIMELINE)) {
      expect(range.start).toBe(cursor)
      expect(range.end).toBeGreaterThan(range.start)
      cursor = range.end
    }
    expect(cursor).toBe(DURATION_IN_FRAMES)
  })

  it('sums to 885 frames (29.5s @30fps)', () => {
    const total = Object.keys(TIMELINE).reduce(
      (sum, k) => sum + sceneDuration(k as keyof typeof TIMELINE),
      0,
    )
    expect(total).toBe(885)
  })
})
