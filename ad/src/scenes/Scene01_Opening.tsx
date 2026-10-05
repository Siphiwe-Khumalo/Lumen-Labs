// SCENE 01 — THE OPENING · 0–4s (DESIGN §7.1).
// Ink → studioNight bandCenter reveal + slow Ken-Burns push-in; two-line headline
// (clipRise + trackIn); faint drafting rules; a single foreshadow amber tick.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale } from '../config/typography'
import { anchor, safeBox, shortSide, useFormat } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { ImageReveal } from '../components/ImageReveal'
import { GridOverlay } from '../components/GridOverlay'
import { AnimatedText } from '../components/AnimatedText'

export const Scene01_Opening: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)

  const typePoint = anchor(format, { ax: 0, ay: format.typeAnchor })

  // Foreshadow amber tick at the end of the right drafting rule (f100+), ONE node.
  const tickOpacity = clip(frame, [100, 112], [0, 1])
  const tickSize = S * 0.012
  const rightRuleX = box.x + (box.width * 5) / 6

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      {/* Masked band-centre reveal + Ken-Burns push-in (hero → outExpo). */}
      <ImageReveal
        assetKey="studioNight"
        mask="bandCenter"
        startFrame={8}
        durationInFrames={32}
        fromScale={1.08}
        toScale={1.14}
        panY={[-S * 0.015, S * 0.015]}
        revealEasing={EASE.outExpo}
      />

      {/* Faint drafting rules — pure structure, no amber yet. */}
      <GridOverlay columns={6} which={[1, 5]} startFrame={20} durationInFrames={35} />

      {/* Foreshadow amber tick at the end of the right rule. */}
      <div
        style={{
          position: 'absolute',
          left: rightRuleX - tickSize / 2,
          top: box.y + box.height * 0.5,
          width: tickSize,
          height: tickSize,
          background: COLOR.accent,
          opacity: tickOpacity,
        }}
      />

      {/* Headline — per-line clip rise + tracking-in. */}
      <div style={{ position: 'absolute', left: typePoint.x, top: typePoint.y, right: box.x }}>
        <AnimatedText
          text={COPY.s01}
          font="display"
          size={t.hero}
          reveal="both"
          startFrame={44}
          stagger={14}
          color={COLOR.text}
          align="left"
        />
      </div>
    </AbsoluteFill>
  )
}
