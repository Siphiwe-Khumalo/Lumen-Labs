// GridOverlay — N faint vertical drafting rules at safe-box columns (DESIGN §9).

import React from 'react'
import { COLOR } from '../config/brand'
import { col, safeBox, useFormat } from '../lib/layout'
import { LineReveal } from './LineReveal'

interface GridOverlayProps {
  columns: number
  /** Which column indices (0..columns) draw a rule. */
  which: number[]
  startFrame: number
  durationInFrames: number
  color?: string
  opacity?: number
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  columns,
  which,
  startFrame,
  durationInFrames,
  color = COLOR.hairline,
  opacity = 1,
}) => {
  const format = useFormat()
  const box = safeBox(format)
  return (
    <>
      {which.map((n, i) => (
        <LineReveal
          key={n}
          x={col(format, n, columns)}
          y={box.y}
          length={box.height}
          direction="TB"
          thickness={1}
          color={color}
          startFrame={startFrame + i * 6}
          durationInFrames={durationInFrames}
          opacity={opacity}
        />
      ))}
    </>
  )
}
