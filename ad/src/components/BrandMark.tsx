// BrandMark — vector-exact reproduction of src/components/brand/Logo.tsx.
// viewBox 0 0 28 28; rounded rect stroke @0.2; the L path; the amber bar.
// Geometry is sacred — never distorted. Reveal is driven by the clip/dash props.

import React from 'react'
import { COLOR } from '../config/brand'

interface BrandMarkProps {
  size: number
  /** 0..1 stroke-draw progress of the rounded rect border. */
  rectDraw?: number
  /** 0..1 reveal of the L path (clip wipe bottom→top). */
  lReveal?: number
  /** 0..1 reveal of the amber bar (clip wipe left→right). */
  barReveal?: number
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size,
  rectDraw = 1,
  lReveal = 1,
  barReveal = 1,
}) => {
  // Rounded-rect perimeter length for the stroke-draw (approx; exact enough for dash).
  const perimeter = 2 * (27 + 27) - 8 * (6 - 6 * 0.5522) // ~ with corner radius
  const dashLen = perimeter > 0 ? perimeter : 108
  const offset = dashLen * (1 - rectDraw)

  // L clip-wipe bottom→top: reveal from bottom. inset bottom shrinks as lReveal→1.
  const lHidden = (1 - lReveal) * 100
  // Amber bar clip-wipe left→right.
  const barHidden = (1 - barReveal) * 100

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="27"
        height="27"
        rx="6"
        stroke={COLOR.text}
        strokeOpacity="0.2"
        strokeDasharray={dashLen}
        strokeDashoffset={offset}
      />
      <path
        d="M8 7h3.1v10.9H20V21H8V7Z"
        fill={COLOR.text}
        style={{ clipPath: `inset(${lHidden}% 0 0 0)` }}
      />
      <path
        d="M14.4 7H20v3.1h-5.6V7Z"
        fill={COLOR.accent}
        style={{ clipPath: `inset(0 ${barHidden}% 0 0)` }}
      />
    </svg>
  )
}
