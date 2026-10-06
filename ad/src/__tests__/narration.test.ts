import { describe, it, expect } from 'vitest'
import { NARRATION, validateNarration } from '../config/narration'
import { COPY } from '../config/copy'
import { FILM_COPY } from '../config/filmCopy'
import { FILM_SCENES, FILM_DURATION, LOCKUP_BEATS } from '../config/filmTimeline'

// The beat end each VO line must clear by >= 6f. Non-lockup lines clear their
// scene's end; the four lockup lines clear their LOCKUP_BEATS sub-beat end (§5).
const BEAT_END: Record<string, number> = {
  vo01: FILM_SCENES.film01.end,
  vo02: FILM_SCENES.film02.end,
  vo03: FILM_SCENES.film02.end,
  vo04: FILM_SCENES.film02b.end,
  vo05: FILM_SCENES.film02b.end,
  vo06: FILM_SCENES.film03.end,
  vo07: FILM_SCENES.film03.end,
  vo08: FILM_SCENES.film03.end,
  vo09: FILM_SCENES.film05.end,
  vo10: FILM_SCENES.film06.end,
  vo11: FILM_SCENES.film07.end,
  vo12: FILM_SCENES.film08.end,
  vo13: LOCKUP_BEATS.b1.end,
  vo14: LOCKUP_BEATS.b2.end,
  vo15: LOCKUP_BEATS.b3.end,
  vo16: LOCKUP_BEATS.b4.end,
}

describe('narration', () => {
  it('validates without throwing', () => {
    expect(() => validateNarration()).not.toThrow()
  })

  it('has 16 cues with unique ids vo01..vo16', () => {
    expect(NARRATION).toHaveLength(16)
    const ids = NARRATION.map((c) => c.id)
    expect(new Set(ids).size).toBe(16)
    expect(ids).toEqual(
      Array.from({ length: 16 }, (_, i) => `vo${String(i + 1).padStart(2, '0')}`),
    )
  })

  it('every startFrame is in [0, FILM_DURATION)', () => {
    for (const cue of NARRATION) {
      expect(cue.startFrame).toBeGreaterThanOrEqual(0)
      expect(cue.startFrame).toBeLessThan(FILM_DURATION)
    }
  })

  it('every startFrame + durationInFrames <= FILM_DURATION', () => {
    for (const cue of NARRATION) {
      expect(cue.startFrame + cue.durationInFrames).toBeLessThanOrEqual(FILM_DURATION)
    }
  })

  it('beatEnd - (startFrame + durationInFrames) >= 6 for ALL 16 lines', () => {
    for (const cue of NARRATION) {
      const beatEnd = BEAT_END[cue.id]
      expect(beatEnd, `beat end for ${cue.id}`).toBeDefined()
      const gap = beatEnd - (cue.startFrame + cue.durationInFrames)
      expect(gap, `${cue.id} gap to beat end ${beatEnd}`).toBeGreaterThanOrEqual(6)
    }
  })

  it('uses the MEASURED VO durations from FEAT-002', () => {
    const measured: Record<string, number> = {
      vo01: 97, vo02: 97, vo03: 115, vo04: 140, vo05: 51, vo06: 120,
      vo07: 121, vo08: 96, vo09: 154, vo10: 141, vo11: 93, vo12: 108,
      vo13: 53, vo14: 120, vo15: 47, vo16: 61,
    }
    for (const cue of NARRATION) {
      expect(cue.durationInFrames, cue.id).toBe(measured[cue.id])
    }
  })

  it('reused sign-off lines equal the exact COPY members', () => {
    const byId = (id: string) => NARRATION.find((c) => c.id === id)!
    expect(byId('vo13').text).toBe(COPY.s06Tagline)
    expect(byId('vo15').text).toBe(COPY.s05a)
    expect(byId('vo16').text).toBe(COPY.s05b)
  })

  it('vo14 spoken text matches the single-line form of FILM_COPY.visionLine', () => {
    const byId = (id: string) => NARRATION.find((c) => c.id === id)!
    expect(byId('vo14').text).toBe(FILM_COPY.visionLine.replace(/\n/g, ' '))
  })

  it('each cue points at its own mp3 under audio/vo/', () => {
    for (const cue of NARRATION) {
      expect(cue.file).toBe(`audio/vo/${cue.id}.mp3`)
    }
  })
})
