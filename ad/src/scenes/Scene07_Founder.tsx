// SCENE 07 — THE SIGN-OFF · 27.0–29.5s · 75f (DESIGN §7, same aesthetic).
// A founder signature, not a credits roll. Graphite clean field, maximum
// negative space. The name tracks/clips in, the recurring amber hairline draws
// once beneath it (the motif resolving a final time), the mono FOUNDER label and
// the website footer settle — then a long still hold for a thumbnail-worthy end.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale, FONT } from '../config/typography'
import { safeBox, shortSide, useFormat } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'
import { AnimatedText } from '../components/AnimatedText'
import { LineReveal } from '../components/LineReveal'

export const Scene07_Founder: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)
  const t = typeScale(S)

  // FOUNDER mono label fades in beneath the name after it has resolved.
  const roleReveal = clip(frame, [30, 44], [0, 1], { easing: EASE.out })

  // Website footer — same mono treatment as S06, settling in last.
  const siteReveal = clip(frame, [40, 54], [0, 1], { easing: EASE.out })

  // The signature block sits a touch above centre so the amber hairline + role
  // breathe beneath it with generous negative space.
  const blockTop = box.y + box.height * 0.42
  const nameSize = t.hero

  // The single amber element: one hairline that draws in left→right under the
  // name — the recurring LineReveal / amber motif resolving one last time.
  const lineY = blockTop + nameSize * 1.42
  const lineLen = box.width * 0.3

  return (
    <AbsoluteFill style={{ background: COLOR.graphite }}>
      {/* Primary line — the founder's name, clip-mask rise + tracking-in. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: blockTop,
          width: box.width,
        }}
      >
        <AnimatedText
          text={COPY.s07Name}
          font="display"
          size={nameSize}
          reveal="both"
          startFrame={6}
          durationPerLine={28}
          weight={500}
          align="left"
          trackFrom={0.12}
          trackTo={-0.03}
        />
      </div>

      {/* Single amber hairline — the recurring motif resolving beside the name. */}
      <LineReveal
        x={box.x}
        y={lineY}
        length={lineLen}
        direction="LR"
        thickness={2}
        color={COLOR.accent}
        startFrame={30}
        durationInFrames={18}
      />

      {/* FOUNDER — small mono label beneath the name. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: lineY + t.mono * 1.4,
          width: box.width,
          opacity: roleReveal,
        }}
      >
        <span
          style={{
            fontFamily: `'${FONT.mono}'`,
            fontSize: t.mono,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: COLOR.muted,
            textTransform: 'uppercase',
          }}
        >
          {COPY.s07Role}
        </span>
      </div>

      {/* Website — tiny muted mono footer at the very bottom (S06 treatment). */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y + box.height * 0.9,
          width: box.width,
          opacity: siteReveal,
        }}
      >
        <span
          style={{
            fontFamily: `'${FONT.mono}'`,
            fontSize: t.mono,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: COLOR.faint,
          }}
        >
          {COPY.s07Site}
        </span>
      </div>
    </AbsoluteFill>
  )
}
