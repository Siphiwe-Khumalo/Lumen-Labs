// SCENE 06 — THE LAUNCH · 25–27s · 60f (DESIGN §7.6).
// Graphite clean field, maximum negative space. The known mark resolves FAST,
// tagline rises, a one-row mono title-block draws on with a single amber node.
// Settled 12f thumbnail hold. No fade to black (doors open, not promo over).

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale, FONT } from '../config/typography'
import { safeBox, shortSide, useFormat } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { LogoReveal } from '../components/LogoReveal'

export const Scene06_Launch: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)

  // Tagline clip-mask rise f20–f36.
  const tagReveal = clip(frame, [20, 36], [0, 1], { easing: EASE.out })
  const tagRise = clip(frame, [20, 36], [t.body * 0.8, 0], { easing: EASE.out })
  const tagClip = (1 - tagReveal) * 100

  // Mono title-block draws on f36–f48.
  const metaReveal = clip(frame, [36, 48], [0, 1], { easing: EASE.out })
  const [metaLeft, metaRight] = COPY.s06Meta

  const markSize = t.display
  const centerY = box.y + box.height * 0.4

  return (
    <AbsoluteFill style={{ background: COLOR.graphite }}>
      {/* Lockup — fast resolve of the known mark. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: centerY,
          width: box.width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: t.body * 1.3,
        }}
      >
        <LogoReveal
          markSize={markSize}
          wordmarkSize={t.display}
          speed="fast"
          withWordmark
          startFrame={0}
          align="center"
        />

        <div style={{ overflow: 'hidden' }}>
          <span
            style={{
              fontFamily: `'${FONT.body}'`,
              fontSize: t.body,
              fontWeight: 500,
              color: COLOR.text,
              letterSpacing: '0.01em',
              lineHeight: 1,
              display: 'inline-block',
              transform: `translateY(${tagRise}px)`,
              clipPath: `inset(0 0 ${tagClip}% 0)`,
            }}
          >
            {COPY.s06Tagline}
          </span>
        </div>
      </div>

      {/* Mono engineering title-block — one row, label left / descriptor right,
          with a single amber node at the left tick. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y + box.height * 0.9,
          width: box.width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: metaReveal,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: t.mono * 0.9 }}>
          <span style={{ width: t.mono * 0.5, height: t.mono * 0.5, background: COLOR.accent }} />
          <span
            style={{
              fontFamily: `'${FONT.mono}'`,
              fontSize: t.mono,
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: COLOR.faint,
            }}
          >
            {metaLeft}
          </span>
        </div>
        <span
          style={{
            fontFamily: `'${FONT.mono}'`,
            fontSize: t.mono,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: COLOR.faint,
          }}
        >
          {metaRight}
        </span>
      </div>
    </AbsoluteFill>
  )
}
