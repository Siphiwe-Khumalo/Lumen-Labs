// SectionTitle — mono index ("01") + Space Grotesk title + optional one-tick
// accent (DESIGN §9). Used by S04 beats.

import React from 'react'
import { useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { FONT } from '../config/typography'
import { clip, tracking } from '../lib/interpolate'
import { EASE } from '../lib/easing'

interface SectionTitleProps {
  index: string
  title: string
  titleSize: number
  monoSize: number
  startFrame: number
  /** Accent tick colour — pass COLOR.accent/steel only from scenes (§10). */
  tickColor?: string
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  index,
  title,
  titleSize,
  monoSize,
  startFrame,
  tickColor,
}) => {
  const frame = useCurrentFrame()
  const f = frame - startFrame
  const ls = tracking(f, [0, 18], 0.14, -0.045, EASE.out)
  const reveal = clip(f, [0, 20], [0, 1], { easing: EASE.out })
  const clipPct = (1 - reveal) * 100
  const monoReveal = clip(f, [0, 14], [0, 1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: titleSize * 0.18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: monoSize * 0.9,
          opacity: monoReveal,
        }}
      >
        {tickColor && (
          <span
            style={{ width: monoSize * 0.5, height: monoSize * 0.5, background: tickColor }}
          />
        )}
        <span
          style={{
            fontFamily: `'${FONT.mono}'`,
            fontSize: monoSize,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: COLOR.faint,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {index}
        </span>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <span
          style={{
            fontFamily: `'${FONT.display}'`,
            fontSize: titleSize,
            fontWeight: 500,
            letterSpacing: `${ls}em`,
            color: COLOR.text,
            lineHeight: 1,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            clipPath: `inset(0 0 ${clipPct}% 0)`,
          }}
        >
          {title}
        </span>
      </div>
    </div>
  )
}
