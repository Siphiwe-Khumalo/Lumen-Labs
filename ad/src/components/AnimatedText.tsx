// AnimatedText — per-line clip-mask reveal + optional tracking-in (DESIGN §9).
// Each line lives in its own clip-mask container so geometry is never scaled.

import React from 'react'
import { useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { FONT, type FontRole } from '../config/typography'
import { clip, tracking } from '../lib/interpolate'
import { EASE } from '../lib/easing'

export type RevealMode = 'clipRise' | 'trackIn' | 'both'

interface AnimatedTextProps {
  /** Pre-wrapped text with explicit `\n` line breaks (copy owns line breaks). */
  text: string
  font?: FontRole
  size: number
  reveal?: RevealMode
  startFrame: number
  /** Frames between consecutive line reveals. */
  stagger?: number
  /** Frames each line takes to reveal. */
  durationPerLine?: number
  color?: string
  weight?: number
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  /** Tracking endpoints in em when reveal includes trackIn. */
  trackFrom?: number
  trackTo?: number
  uppercase?: boolean
  style?: React.CSSProperties
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  font = 'display',
  size,
  reveal = 'both',
  startFrame,
  stagger = 12,
  durationPerLine = 26,
  color = COLOR.text,
  weight = 500,
  align = 'left',
  lineHeight = 1.02,
  trackFrom = 0.14,
  trackTo = -0.045,
  uppercase = false,
  style,
}) => {
  const frame = useCurrentFrame()
  const lines = text.split('\n')
  const doClip = reveal === 'clipRise' || reveal === 'both'
  const doTrack = reveal === 'trackIn' || reveal === 'both'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const begin = startFrame + i * stagger
        const end = begin + durationPerLine
        const rise = doClip ? clip(frame, [begin, end], [1, 0], { easing: EASE.out }) : 0
        // clip-path reveals the line from a rising baseline (0% = fully hidden bottom)
        const revealPct = doClip ? clip(frame, [begin, end], [100, 0], { easing: EASE.out }) : 0
        const ls = doTrack
          ? tracking(frame, [begin, end], trackFrom, trackTo, EASE.out)
          : trackTo
        const opacity = clip(frame, [begin, begin + 6], [0, 1])
        return (
          <div
            key={i}
            style={{
              overflow: 'hidden',
              // reserve line height so clip-mask reveals within its own box
              paddingBottom: size * (lineHeight - 1),
            }}
          >
            <div
              style={{
                fontFamily: `'${FONT[font]}'`,
                fontSize: size,
                fontWeight: weight,
                lineHeight,
                color,
                letterSpacing: `${ls}em`,
                textTransform: uppercase ? 'uppercase' : 'none',
                whiteSpace: 'pre',
                opacity,
                transform: `translateY(${rise * size * 0.9}px)`,
                clipPath: doClip ? `inset(0 0 ${revealPct}% 0)` : undefined,
                textAlign: align,
              }}
            >
              {line}
            </div>
          </div>
        )
      })}
    </div>
  )
}
