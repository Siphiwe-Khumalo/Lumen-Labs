import { describe, it, expect } from 'vitest'
import { clip, clipN, ranged, kenBurns } from '../lib/interpolate'

describe('interpolate', () => {
  it('clip clamps both ends', () => {
    expect(clip(-10, [0, 10], [0, 100])).toBe(0)
    expect(clip(20, [0, 10], [0, 100])).toBe(100)
    expect(clip(5, [0, 10], [0, 100])).toBe(50)
  })

  it('clipN clamps a multi-keyframe range', () => {
    expect(clipN(-5, [0, 10, 20], [0, 50, 100])).toBe(0)
    expect(clipN(30, [0, 10, 20], [0, 50, 100])).toBe(100)
    expect(clipN(10, [0, 10, 20], [0, 50, 100])).toBe(50)
  })

  it('ranged maps to clamped 0..1', () => {
    expect(ranged(-1, 0, 10)).toBe(0)
    expect(ranged(5, 0, 10)).toBe(0.5)
    expect(ranged(100, 0, 10)).toBe(1)
  })

  it('kenBurns never exceeds the max scale delta of 0.08', () => {
    const kb = kenBurns(999, [0, 100], { fromScale: 1.0, toScale: 1.5 })
    // delta clamped to 0.08 → max scale 1.08
    expect(kb.scale).toBeLessThanOrEqual(1.08 + 1e-9)
  })

  it('kenBurns respects a within-limit delta', () => {
    const kb = kenBurns(999, [0, 100], { fromScale: 1.08, toScale: 1.14 })
    expect(kb.scale).toBeCloseTo(1.14)
  })
})
