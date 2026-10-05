// SCENE 02 — THE IDEA · 4–8s (DESIGN §7.2).
// appsCode wipes in, then websites enters on a parallax layer at a different rate;
// two-line headline on a slower foreground layer; a single amber underline under
// "build" draws left→right.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale } from '../config/typography'
import { anchor, safeBox, shortSide, useFormat } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { ImageReveal } from '../components/ImageReveal'
import { ImageParallax } from '../components/ImageParallax'
import { AnimatedText } from '../components/AnimatedText'
import { LineReveal } from '../components/LineReveal'

export const Scene02_Idea: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)

  const typePoint = anchor(format, { ax: 0, ay: format.typeAnchor })

  // Headline nudges up ~2% of height as websites enters, to "make room".
  const nudge = clip(frame, [58, 78], [0, -box.height * 0.02])

  // Amber underline under "build": positioned just under line 1 of the headline.
  const underlineY = typePoint.y + t.hero * 1.18
  const underlineLen = t.hero * 2.1

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      {/* Foreground photo: appsCode wipes in L→R, slow lateral pan. */}
      <ImageReveal
        assetKey="appsCode"
        mask="wipeLR"
        startFrame={0}
        durationInFrames={24}
        fromScale={1.08}
        toScale={1.12}
        panX={[-S * 0.02, S * 0.02]}
      />

      {/* websites slides in on a slower parallax layer from the right at f60. */}
      <ImageParallax
        assetKey="websites"
        mask="wipeRL"
        startFrame={60}
        durationInFrames={30}
        rate={1.0}
        driftX={-S * 0.03}
        driftWindow={[60, 120]}
        fromScale={1.06}
        toScale={1.1}
        style={{ opacity: 0.9 }}
      />

      {/* Headline on the slower (0.6×) layer — true parallax vs. photos. */}
      <div
        style={{
          position: 'absolute',
          left: typePoint.x,
          top: typePoint.y,
          right: box.x,
          transform: `translateY(${nudge}px)`,
        }}
      >
        <AnimatedText
          text={COPY.s02}
          font="display"
          size={t.hero}
          reveal="both"
          startFrame={18}
          stagger={12}
          color={COLOR.text}
          align="left"
        />
      </div>

      {/* Single amber underline under "build" (first deliberate amber). */}
      <LineReveal
        x={typePoint.x}
        y={underlineY + nudge}
        length={underlineLen}
        direction="LR"
        thickness={3}
        color={COLOR.accent}
        startFrame={30}
        durationInFrames={18}
      />
    </AbsoluteFill>
  )
}
