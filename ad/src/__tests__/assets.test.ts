import { describe, it, expect } from 'vitest'
import { ASSETS, getAsset, type AssetKey } from '../config/assets'

describe('assets', () => {
  it('every asset has a file and in-range focal point', () => {
    for (const key of Object.keys(ASSETS) as AssetKey[]) {
      const meta = getAsset(key)
      expect(meta.file).toMatch(/\.(jpg|jpeg|png)$/)
      expect(meta.focusX).toBeGreaterThanOrEqual(0)
      expect(meta.focusX).toBeLessThanOrEqual(1)
      expect(meta.focusY).toBeGreaterThanOrEqual(0)
      expect(meta.focusY).toBeLessThanOrEqual(1)
    }
  })

  it('throws on an unknown key', () => {
    expect(() => getAsset('nope' as AssetKey)).toThrow(/Unknown asset key/)
  })
})
