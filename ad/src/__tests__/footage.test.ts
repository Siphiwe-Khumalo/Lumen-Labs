import { describe, it, expect } from 'vitest'
import {
  FOOTAGE,
  getFootage,
  resolveFootage,
  type FootageKey,
  type FootageMeta,
} from '../config/footage'
import { FILM_SHOTS } from '../config/filmTimeline'

describe('footage', () => {
  it('resolves every known key with an in-range focal point and a duration', () => {
    for (const key of Object.keys(FOOTAGE) as FootageKey[]) {
      const meta = getFootage(key)
      expect(meta.focusX).toBeGreaterThanOrEqual(0)
      expect(meta.focusX).toBeLessThanOrEqual(1)
      expect(meta.focusY).toBeGreaterThanOrEqual(0)
      expect(meta.focusY).toBeLessThanOrEqual(1)
      expect(meta.durationInFrames).toBeGreaterThan(0)
      expect(meta.file.startsWith('footage/')).toBe(true)
    }
  })

  it('throws on an unknown key', () => {
    expect(() => getFootage('does-not-exist' as FootageKey)).toThrow(/Unknown footage key/)
    expect(() => resolveFootage('nope', {})).toThrow(/Unknown footage key/)
  })

  it('throws on an out-of-range focal point', () => {
    const bad: FootageMeta = {
      file: 'footage/x.mp4',
      focusX: 1.4,
      focusY: 0.5,
      gradeKey: 'cool',
      durationInFrames: 100,
    }
    expect(() => resolveFootage('broken', { broken: bad })).toThrow(/out of range/)
  })

  it('throws on missing/invalid durationInFrames', () => {
    const bad: FootageMeta = {
      file: 'footage/x.mp4',
      focusX: 0.5,
      focusY: 0.5,
      gradeKey: 'cool',
      durationInFrames: 0,
    }
    expect(() => resolveFootage('broken', { broken: bad })).toThrow(/durationInFrames/)
  })

  it('every storyboard shot footageKey exists in FOOTAGE', () => {
    const keys = new Set(Object.keys(FOOTAGE))
    for (const shot of FILM_SHOTS) {
      expect(keys.has(shot.footageKey), `${shot.id} -> ${shot.footageKey}`).toBe(true)
    }
  })

  it('office-open maps to the swapped-in quiet-desk-dawn clip (FEAT-002)', () => {
    expect(getFootage('office-open').file).toBe('footage/quiet-desk-dawn.mp4')
  })
})
