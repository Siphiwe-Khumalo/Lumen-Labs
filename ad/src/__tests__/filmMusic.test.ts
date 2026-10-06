import { describe, it, expect } from 'vitest'
import {
  SHIFT_FRAME,
  DUCK,
  TRACK_A,
  TRACK_B,
  CROSSFADE,
  trackAVolume,
  trackBVolume,
  validateFilmMusic,
} from '../config/filmMusic'

describe('filmMusic', () => {
  it('validates without throwing', () => {
    expect(() => validateFilmMusic()).not.toThrow()
  })

  it('shift frame is 1140', () => {
    expect(SHIFT_FRAME).toBe(1140)
  })

  it('DUCK is in (0,1)', () => {
    expect(DUCK).toBeGreaterThan(0)
    expect(DUCK).toBeLessThan(1)
  })

  it('Track A fades out and Track B fades in across the shift window', () => {
    const [cf0, cf1] = CROSSFADE
    expect(trackAVolume(cf1)).toBeLessThan(trackAVolume(cf0))
    expect(trackBVolume(cf1)).toBeGreaterThan(trackBVolume(cf0))
    // A is silent and B has risen to its configured full bed level at the end
    // of the cross-fade (TRACK_B's hold keyframe — not a hardcoded magic number,
    // so an intentional bed-level change for the mix doesn't break this).
    expect(trackAVolume(cf1)).toBe(0)
    expect(trackBVolume(cf1)).toBeCloseTo(TRACK_B.volumes[1], 5)
    expect(trackBVolume(cf1)).toBeGreaterThan(0.5)
  })

  it('Track A holds the near-silent floor 0.3 across 1080->1140', () => {
    expect(trackAVolume(1080)).toBeCloseTo(0.3, 5)
    expect(trackAVolume(1110)).toBeCloseTo(0.3, 5)
    expect(trackAVolume(1140)).toBeCloseTo(0.3, 5)
  })

  it('both tracks have strictly monotonic keyframe times and volumes in [0,1]', () => {
    for (const track of [TRACK_A, TRACK_B]) {
      expect(track.times.length).toBe(track.volumes.length)
      for (let i = 1; i < track.times.length; i++) {
        expect(track.times[i]).toBeGreaterThan(track.times[i - 1])
      }
      for (const v of track.volumes) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })

  it('tracks point at the two Mixkit mp3s under audio/music/', () => {
    expect(TRACK_A.file).toBe('audio/music/track-a-tension.mp3')
    expect(TRACK_B.file).toBe('audio/music/track-b-hope.mp3')
  })
})
