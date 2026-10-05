// SCENE 03 — INTRODUCE LUMEN · 8–12s (DESIGN §7.3).
// Photography dissolves to graphite; the BrandMark is BORN (stroke-draw → L wipe
// → amber bar), the wordmark tracks in, the sub-line rises. Generous negative space.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale, FONT } from '../config/typography'
import { safeBox, shortSide, useFormat } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { ImageReveal } from '../components/ImageReveal'
import { LogoReveal } from '../components/LogoReveal'

export const Scene03_Lumen: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)

  // Last photo wipes down behind a rising graphite panel (f0–f20).
  const panel = clip(frame, [0, 20], [0, 100], { easing: EASE.out })

  // Sub-line clip-mask rise f96–f114.
  const subReveal = clip(frame, [96, 114], [0, 1], { easing: EASE.out })
  const subRise = clip(frame, [96, 114], [t.body * 0.8, 0], { easing: EASE.out })
  const subClip = (1 - subReveal) * 100

  const markSize = t.display
  const centerY = box.y + box.height * 0.42

  return (
    <AbsoluteFill style={{ background: COLOR.graphite }}>
      {/* Outgoing photo wiping down behind the graphite panel. */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 ${panel}% 0)` }}>
        <ImageReveal
          assetKey="websites"
          mask="none"
          startFrame={0}
          durationInFrames={1}
          fromScale={1.1}
          toScale={1.12}
        />
      </AbsoluteFill>

      {/* Lockup — mark born + wordmark track-in, centred with negative space. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: centerY,
          width: box.width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: t.body * 1.4,
        }}
      >
        <LogoReveal
          markSize={markSize}
          wordmarkSize={t.display}
          speed="born"
          withWordmark
          startFrame={16}
          align="center"
        />

        <div style={{ overflow: 'hidden' }}>
          <span
            style={{
              fontFamily: `'${FONT.body}'`,
              fontSize: t.body,
              fontWeight: 400,
              color: COLOR.muted,
              letterSpacing: '0.01em',
              lineHeight: 1,
              display: 'inline-block',
              transform: `translateY(${subRise}px)`,
              clipPath: `inset(0 0 ${subClip}% 0)`,
            }}
          >
            {COPY.s03Sub}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
