// Caption — minimal, generously-held on-screen copy for the brand film
// (CINEMATIC-FILM.md §3.3, §9). It DELEGATES the entrance reveal to AnimatedText
// (which is reveal-only, no exit) and OWNS the hold + fade-out itself via an
// outer opacity interpolation over [in0, in1, out0, out1] (fade-in -> hold at 1
// -> fade-out). The out0/out1 frames are the §5 storyboard fade-out windows.
//
// Two layouts:
//   - plain:   a single large statement (C1-C4, C8-C11), centered with air.
//   - titled:  a display title + a mono sub-label (the capability captions
//              C5-C7: SOFTWARE / INFRASTRUCTURE / CONTROL + SECURITY and their
//              " · "-joined service sub-lines, SCADA included).
//
// All positioning is a fraction of the safe box (useFormat/safeBox) — never a
// literal pixel. Frames are absolute (scene-local); the caller passes the §5
// windows directly.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../../config/brand'
import { FONT } from '../../config/typography'
import { useFormat, safeBox, shortSide } from '../../lib/layout'
import { clipN } from '../../lib/interpolate'
import { EASE } from '../../lib/easing'
import { AnimatedText } from '../AnimatedText'

interface CaptionProps {
  /** Fade-in start / end and fade-out start / end (absolute scene-local frames). */
  in0: number
  in1: number
  out0: number
  out1: number
  /** Vertical placement as a fraction of the safe box (0 = top, 1 = bottom). */
  anchorY?: number
  align?: 'left' | 'center' | 'right'
}

interface PlainCaptionProps extends CaptionProps {
  variant?: 'plain'
  /** Pre-wrapped statement (copy owns its \n line breaks). */
  text: string
  /** Type-scale multiplier of the short side (default a large hero statement). */
  sizeScale?: number
  color?: string
}

interface TitledCaptionProps extends CaptionProps {
  variant: 'titled'
  /** Display title (e.g. 'SOFTWARE'). */
  title: string
  /** Mono sub-label (e.g. 'Custom software · Web applications · Integrations · IoT'). */
  sub: string
}

type Props = PlainCaptionProps | TitledCaptionProps

export const Caption: React.FC<Props> = (props) => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)

  const { in0, in1, out0, out1, anchorY = 0.5, align = 'center' } = props

  // Caption OWNS the hold + fade-out (AnimatedText only reveals). Opacity ramps
  // 0 -> 1 over [in0,in1], holds at 1, then 1 -> 0 over [out0,out1].
  const opacity = clipN(frame, [in0, in1, out0, out1], [0, 1, 1, 0], {
    easing: EASE.inOut,
  })

  const top = box.y + anchorY * box.height
  const alignItems =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top,
          width: box.width,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems,
          gap: S * 0.028,
        }}
      >
        {props.variant === 'titled' ? (
          <>
            <AnimatedText
              text={props.title}
              font="display"
              size={S * 0.07}
              weight={600}
              reveal="both"
              startFrame={in0}
              align={align}
              uppercase
              lineHeight={1.0}
            />
            <div
              style={{
                fontFamily: `'${FONT.mono}'`,
                fontSize: S * 0.0185,
                fontWeight: 400,
                letterSpacing: '0.08em',
                color: COLOR.muted,
                textTransform: 'uppercase',
                textAlign: align,
                whiteSpace: 'pre-wrap',
              }}
            >
              {props.sub}
            </div>
          </>
        ) : (
          <AnimatedText
            text={props.text}
            font="display"
            size={S * (props.sizeScale ?? 0.055)}
            weight={500}
            reveal="both"
            startFrame={in0}
            align={align}
            color={props.color ?? COLOR.text}
            lineHeight={1.08}
          />
        )}
      </div>
    </AbsoluteFill>
  )
}
