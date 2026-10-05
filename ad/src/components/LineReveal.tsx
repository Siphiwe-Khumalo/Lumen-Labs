// LineReveal — a single hairline that draws on. Default colour is the faint
// hairline; amber/steel only when explicitly passed (amber-discipline, §10).

import React from 'react'
import { useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'

export type LineDirection = 'LR' | 'RL' | 'TB' | 'BT'

interface LineRevealProps {
  /** Absolute px position of the line's origin (top-left of its box). */
  x: number
  y: number
  /** Length of the line in px (width for horizontal, height for vertical). */
  length: number
  direction?: LineDirection
  thickness?: number
  color?: string
  startFrame: number
  durationInFrames: number
  opacity?: number
}

export const LineReveal: React.FC<LineRevealProps> = ({
  x,
  y,
  length,
  direction = 'LR',
  thickness = 1,
  color = COLOR.hairline,
  startFrame,
  durationInFrames,
  opacity = 1,
}) => {
  const frame = useCurrentFrame()
  const grow = clip(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    easing: EASE.out,
  })

  const horizontal = direction === 'LR' || direction === 'RL'
  const w = horizontal ? length * grow : thickness
  const h = horizontal ? thickness : length * grow

  // Anchor the growth so RL grows from the right, BT grows from the bottom.
  const left = direction === 'RL' ? x + length - w : x
  const top = direction === 'BT' ? y + length - h : y

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        background: color,
        opacity,
      }}
    />
  )
}
