import { describe, it, expect } from 'vitest'
import { FORMATS } from '../config/formats'
import { safeBox, anchor, col } from '../lib/layout'

describe('layout', () => {
  it('safeBox returns expected px for vertical', () => {
    const box = safeBox(FORMATS.vertical)
    // left 0.075*1080 = 81, top 0.11*1920 = 211.2
    expect(box.x).toBeCloseTo(81)
    expect(box.y).toBeCloseTo(211.2)
    expect(box.width).toBeCloseTo(1080 - 81 - 81)
    expect(box.height).toBeCloseTo(1920 - 211.2 - 230.4)
  })

  it('safeBox returns a positive box for all formats', () => {
    for (const fmt of Object.values(FORMATS)) {
      const box = safeBox(fmt)
      expect(box.width).toBeGreaterThan(0)
      expect(box.height).toBeGreaterThan(0)
    }
  })

  it('anchor maps fractional anchors into the safe box', () => {
    const box = safeBox(FORMATS.square)
    const p = anchor(FORMATS.square, { ax: 0.5, ay: 0 })
    expect(p.x).toBeCloseTo(box.x + box.width * 0.5)
    expect(p.y).toBeCloseTo(box.y)
  })

  it('col returns gridline x inside the safe box', () => {
    const box = safeBox(FORMATS.vertical)
    expect(col(FORMATS.vertical, 0, 6)).toBeCloseTo(box.x)
    expect(col(FORMATS.vertical, 6, 6)).toBeCloseTo(box.x + box.width)
    expect(col(FORMATS.vertical, 3, 6)).toBeCloseTo(box.x + box.width / 2)
  })
})
