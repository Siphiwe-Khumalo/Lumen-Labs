// SCENE 05 — THE PHILOSOPHY · 21–25s (DESIGN §7.5).
// Pace drops. controlPanel hero (full portrait, per-format placement) reveals via
// a slow top→bottom clip-mask + very slow Ken-Burns. Two philosophy lines with an
// amber seam-line between them. Deliberately emptier than S04.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale } from '../config/typography'
import { safeBox, shortSide, useFormat, type Box } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { ImageReveal } from '../components/ImageReveal'
import { AnimatedText } from '../components/AnimatedText'
import { LineReveal } from '../components/LineReveal'
import type { FormatId } from '../config/formats'

interface HeroLayout {
  imageStyle: React.CSSProperties
  typeLeftFrac: number
  typeTopFrac: number
}

function heroLayout(id: FormatId, box: Box): HeroLayout {
  switch (id) {
    case 'wide':
      return {
        imageStyle: { left: box.x + box.width * 0.45, top: 0, width: box.width * 0.55 + box.x, height: '100%' },
        typeLeftFrac: 0,
        typeTopFrac: 0.42,
      }
    case 'square':
      return {
        imageStyle: { left: box.x + box.width * 0.4, top: 0, width: box.width * 0.6 + box.x, height: '100%' },
        typeLeftFrac: 0,
        typeTopFrac: 0.5,
      }
    case 'vertical':
    default:
      return {
        imageStyle: { left: 0, top: 0, width: '100%', height: '100%' },
        typeLeftFrac: 0,
        typeTopFrac: 0.58,
      }
  }
}

export const Scene05_Philosophy: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)
  const layout = heroLayout(format.id, box)

  // Beat 1 holds; beat 2 arrives f74–94; beat 1 eases up −3% y to make room.
  const line1Nudge = clip(frame, [74, 94], [0, -box.height * 0.03], { easing: EASE.out })

  const typeX = box.x + box.width * layout.typeLeftFrac
  const typeY = box.y + box.height * layout.typeTopFrac
  const seamY = typeY + t.hero * 1.5 + line1Nudge
  const seamLen = t.hero * 2.4

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      {/* Hero image — slow top→bottom clip reveal + very slow push-in. */}
      <div style={{ position: 'absolute', overflow: 'hidden', ...layout.imageStyle }}>
        <ImageReveal
          assetKey="controlPanel"
          mask="wipeTB"
          startFrame={0}
          durationInFrames={44}
          fromScale={1.06}
          toScale={1.1}
          panY={[-S * 0.01, S * 0.01]}
          revealEasing={EASE.outExpo}
        />
      </div>

      {/* Beat 1 */}
      <div
        style={{
          position: 'absolute',
          left: typeX,
          top: typeY,
          right: box.x,
          transform: `translateY(${line1Nudge}px)`,
        }}
      >
        <AnimatedText
          text={COPY.s05a}
          font="display"
          size={t.hero}
          reveal="both"
          startFrame={24}
          color={COLOR.text}
          align="left"
        />
      </div>

      {/* Amber seam-line between the two lines. */}
      <LineReveal
        x={typeX}
        y={seamY}
        length={seamLen}
        direction="LR"
        thickness={2}
        color={COLOR.accent}
        startFrame={70}
        durationInFrames={20}
      />

      {/* Beat 2 */}
      <div
        style={{
          position: 'absolute',
          left: typeX,
          top: typeY + t.hero * 1.9,
          right: box.x,
        }}
      >
        <AnimatedText
          text={COPY.s05b}
          font="display"
          size={t.hero}
          reveal="both"
          startFrame={74}
          color={COLOR.text}
          align="left"
        />
      </div>
    </AbsoluteFill>
  )
}
