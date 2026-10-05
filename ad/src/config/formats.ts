// Format presets — one build retargets to three aspect ratios (DESIGN §4.1).
// No component hard-codes pixels; dimensions come only from the active Format.

export type FormatId = 'vertical' | 'wide' | 'square'

export interface Format {
  id: FormatId
  width: number
  height: number
  fps: 30
  /** Safe area as fractions of the canvas; content lives inside this box. */
  safe: { top: number; right: number; bottom: number; left: number }
  /** Per-format vertical anchor for the primary type block (0 = top, 1 = bottom). */
  typeAnchor: number
}

export const FORMATS: Record<FormatId, Format> = {
  vertical: {
    id: 'vertical',
    width: 1080,
    height: 1920,
    fps: 30,
    safe: { top: 0.11, right: 0.075, bottom: 0.12, left: 0.075 },
    typeAnchor: 0.72,
  },
  wide: {
    id: 'wide',
    width: 1920,
    height: 1080,
    fps: 30,
    safe: { top: 0.12, right: 0.08, bottom: 0.14, left: 0.08 },
    typeAnchor: 0.7,
  },
  square: {
    id: 'square',
    width: 1080,
    height: 1080,
    fps: 30,
    safe: { top: 0.1, right: 0.08, bottom: 0.12, left: 0.08 },
    typeAnchor: 0.7,
  },
}

export const PRIMARY: FormatId = 'vertical'

// Validate at module load (DESIGN §10).
for (const fmt of Object.values(FORMATS)) {
  if (!Number.isInteger(fmt.width) || fmt.width <= 0) {
    throw new RangeError(`Format ${fmt.id}: width must be a positive integer (got ${fmt.width})`)
  }
  if (!Number.isInteger(fmt.height) || fmt.height <= 0) {
    throw new RangeError(`Format ${fmt.id}: height must be a positive integer (got ${fmt.height})`)
  }
  if (fmt.fps !== 30) {
    throw new RangeError(`Format ${fmt.id}: fps must be 30 (got ${fmt.fps})`)
  }
  for (const [edge, frac] of Object.entries(fmt.safe)) {
    if (frac < 0 || frac >= 0.5) {
      throw new RangeError(`Format ${fmt.id}: safe.${edge} must be in [0,0.5) (got ${frac})`)
    }
  }
}
