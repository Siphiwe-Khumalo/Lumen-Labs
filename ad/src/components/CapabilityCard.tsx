// CapabilityCard — a single capability row: mono tick + Manrope label; `active`
// drives the single amber/steel tick; clip-rise entrance (DESIGN §9).

import React from 'react'
import { useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { FONT } from '../config/typography'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'

interface CapabilityCardProps {
  label: string
  size: number
  startFrame: number
  active?: boolean
  /** Accent colour for the active tick — passed only from scenes (§10). */
  activeColor?: string
}

export const CapabilityCard: React.FC<CapabilityCardProps> = ({
  label,
  size,
  startFrame,
  active = false,
  activeColor = COLOR.accent,
}) => {
  const frame = useCurrentFrame()
  const f = frame - startFrame
  const reveal = clip(f, [0, 24], [0, 1], { easing: EASE.out })
  const rise = clip(f, [0, 24], [size * 0.8, 0], { easing: EASE.out })
  const clipPct = (1 - reveal) * 100
  const tickSize = size * 0.34

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.7,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: tickSize,
          height: tickSize,
          flex: 'none',
          background: active ? activeColor : COLOR.hairline2,
          opacity: reveal,
          transform: `translateY(${rise}px)`,
        }}
      />
      <span
        style={{
          fontFamily: `'${FONT.body}'`,
          fontSize: size,
          fontWeight: active ? 500 : 400,
          color: active ? COLOR.text : COLOR.muted,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          transform: `translateY(${rise}px)`,
          clipPath: `inset(0 0 ${clipPct}% 0)`,
        }}
      >
        {label}
      </span>
    </div>
  )
}
