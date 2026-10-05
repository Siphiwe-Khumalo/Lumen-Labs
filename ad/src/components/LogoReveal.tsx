// LogoReveal — the BrandMark reveal (DESIGN §5.3) with optional wordmark.
// 'born' = S03 from-scratch; 'fast' = S06 reuse of the known mark.
// Wordmark: LUMEN LABS uppercase, Space Grotesk weight 500, track-in → -0.03em.

import React from 'react'
import { useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { FONT } from '../config/typography'
import { COPY } from '../config/copy'
import { clip, tracking } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { BrandMark } from './BrandMark'

interface LogoRevealProps {
  markSize: number
  wordmarkSize?: number
  speed?: 'born' | 'fast'
  withWordmark?: boolean
  startFrame?: number
  align?: 'left' | 'center'
}

export const LogoReveal: React.FC<LogoRevealProps> = ({
  markSize,
  wordmarkSize,
  speed = 'born',
  withWordmark = true,
  startFrame = 0,
  align = 'center',
}) => {
  const frame = useCurrentFrame()
  const f = frame - startFrame

  // Timing windows (frames local to startFrame).
  const windows =
    speed === 'born'
      ? {
          rect: [16, 40] as const,
          l: [34, 58] as const,
          bar: [58, 70] as const,
          word: [66, 92] as const,
        }
      : {
          rect: [0, 12] as const,
          l: [6, 16] as const,
          bar: [8, 20] as const,
          word: [16, 34] as const,
        }

  const rectDraw = clip(f, windows.rect, [0, 1], { easing: EASE.out })
  const lReveal = clip(f, windows.l, [0, 1], { easing: EASE.out })
  const barReveal = clip(f, windows.bar, [0, 1], { easing: EASE.out })

  const wmSize = wordmarkSize ?? markSize * 1.05
  const wmTrack =
    speed === 'born'
      ? tracking(f, windows.word, 0.2, -0.03, EASE.out)
      : -0.03
  const wmReveal = clip(f, windows.word, [0, 1], { easing: EASE.out })
  const wmClip = (1 - wmReveal) * 100

  // gap-2.5 (0.625rem at 16px base) scaled to mark size for parity with Logo.tsx.
  const gap = markSize * 0.36

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap,
      }}
    >
      <BrandMark size={markSize} rectDraw={rectDraw} lReveal={lReveal} barReveal={barReveal} />
      {withWordmark && (
        <div style={{ overflow: 'hidden' }}>
          <span
            style={{
              fontFamily: `'${FONT.display}'`,
              fontSize: wmSize,
              fontWeight: 500,
              letterSpacing: `${wmTrack}em`,
              color: COLOR.text,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              display: 'inline-block',
              clipPath: `inset(0 ${wmClip}% 0 0)`,
            }}
          >
            {COPY.s03Wordmark}
          </span>
        </div>
      )}
    </div>
  )
}
