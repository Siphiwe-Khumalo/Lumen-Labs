// Layout helpers — all positions are fractions of the safe box, never literal
// pixels (DESIGN §4.2, §10). This is what makes the three-format retarget work.

import { createContext, useContext } from 'react'
import { FORMATS, PRIMARY, type Format } from '../config/formats'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** The safe content box in px, derived from the format's safe fractions. */
export function safeBox(format: Format): Box {
  const { width, height, safe } = format
  const left = safe.left * width
  const right = safe.right * width
  const top = safe.top * height
  const bottom = safe.bottom * height
  const boxW = width - left - right
  const boxH = height - top - bottom
  if (boxW <= 0 || boxH <= 0) {
    throw new RangeError(
      `safeBox inverted for format ${format.id}: computed ${boxW}x${boxH}`,
    )
  }
  return { x: left, y: top, width: boxW, height: boxH }
}

/** An absolute point inside the safe box from fractional anchors (0..1). */
export function anchor(format: Format, a: { ax: number; ay: number }): { x: number; y: number } {
  const box = safeBox(format)
  return { x: box.x + a.ax * box.width, y: box.y + a.ay * box.height }
}

/** x of the n-th gridline (0-based) of an `of`-column grid inside the safe box. */
export function col(format: Format, n: number, of: number): number {
  const box = safeBox(format)
  return box.x + (box.width * n) / of
}

/** Short side of the canvas — basis for the type scale. */
export const shortSide = (format: Format): number => Math.min(format.width, format.height)

// ---- Format context (set at each composition root) ----

export const FormatContext = createContext<Format>(FORMATS[PRIMARY])

export function useFormat(): Format {
  return useContext(FormatContext)
}
