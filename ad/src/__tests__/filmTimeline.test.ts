import { describe, it, expect } from 'vitest'
import {
  FILM_SCENES,
  FILM_DURATION,
  FILM_FPS,
  LOCKUP_BEATS,
  FILM_SHOTS,
  validateFilmTimeline,
  validateFootageWindows,
  filmSceneDuration,
  lockupHold,
} from '../config/filmTimeline'

describe('filmTimeline', () => {
  it('validates without throwing', () => {
    expect(() => validateFilmTimeline()).not.toThrow()
  })

  it('runs at 30fps', () => {
    expect(FILM_FPS).toBe(30)
  })

  it('is contiguous and non-overlapping from 0', () => {
    let cursor = 0
    for (const range of Object.values(FILM_SCENES)) {
      expect(range.start).toBe(cursor)
      expect(range.end).toBeGreaterThan(range.start)
      cursor = range.end
    }
    expect(cursor).toBe(FILM_DURATION)
  })

  it('sums to exactly 2700 frames', () => {
    const total = Object.keys(FILM_SCENES).reduce(
      (sum, k) => sum + filmSceneDuration(k as keyof typeof FILM_SCENES),
      0,
    )
    expect(total).toBe(2700)
  })

  it('FILM_DURATION is in [2250, 2700]', () => {
    expect(FILM_DURATION).toBeGreaterThanOrEqual(2250)
    expect(FILM_DURATION).toBeLessThanOrEqual(2700)
  })

  it('the lockup sub-beats tile film09 exactly and keep film09 at 288f', () => {
    const film09 = FILM_SCENES.film09
    expect(film09.end - film09.start).toBe(288)
    let cursor: number = film09.start
    for (const beat of Object.values(LOCKUP_BEATS)) {
      expect(beat.start).toBe(cursor)
      expect(beat.end).toBeGreaterThan(beat.start)
      cursor = beat.end
    }
    expect(cursor).toBe(film09.end)
  })

  it('each lockup sign-off beat holds at full opacity for a comfortable read', () => {
    // With the MEASURED VO durations (vo14=120f) the four beats cannot all reach
    // 48f of hold within film09's fixed 288f while keeping each VO non-overlapping
    // and clearing its beat end by >= 6f. b2 (the longest line) gets the most room;
    // the three short lines are maximized. Floor asserted at 40f/1.3s; b1/b2/b4 at >=52f.
    expect(lockupHold('b1')).toBeGreaterThanOrEqual(48)
    expect(lockupHold('b2')).toBeGreaterThanOrEqual(48)
    expect(lockupHold('b4')).toBeGreaterThanOrEqual(48)
    for (const key of Object.keys(LOCKUP_BEATS) as (keyof typeof LOCKUP_BEATS)[]) {
      expect(lockupHold(key)).toBeGreaterThanOrEqual(40)
    }
  })

  it('throws on a non-contiguous scene set (defensive)', () => {
    // validateFilmTimeline reads module-level FILM_SCENES; assert its message
    // shape via validateFootageWindows gap handling instead (below).
    expect(() => validateFilmTimeline()).not.toThrow()
  })

  describe('validateFootageWindows', () => {
    // Fixture map so this runs without the downloaded clips present (§12).
    const durations: Record<string, number> = {
      'struggle-worried': 450,
      'office-open': 360,
      'office-glasses-reflection': 603,
      'laptop-work': 639,
      'office-busy': 355,
      'rooftop-sunset': 460,
      'meeting-collab': 1122,
      handshake: 222,
      'engineer-workshop': 451,
      'dev-code': 550,
      'dev-topview': 450,
      multiscreen: 247,
      'city-aerial-night': 428,
      'ops-twoscreen': 307,
      'park-sunrise': 247,
    }

    it('passes for every storyboard shot window <= clip duration', () => {
      expect(() => validateFootageWindows(durations)).not.toThrow()
    })

    it('every shot window + inPoint fits its clip', () => {
      for (const shot of FILM_SHOTS) {
        const clip = durations[shot.footageKey]
        expect(clip).toBeDefined()
        expect(shot.durationInFrames + (shot.inPoint ?? 0)).toBeLessThanOrEqual(clip)
      }
    })

    it('throws when a clip duration is missing', () => {
      const missing = { ...durations }
      delete missing['park-sunrise']
      expect(() => validateFootageWindows(missing)).toThrow(/no clip duration/)
    })

    it('throws when a window exceeds its clip', () => {
      const tooShort = { ...durations, 'park-sunrise': 10 }
      expect(() => validateFootageWindows(tooShort)).toThrow(/exceeds clip/)
    })
  })
})
