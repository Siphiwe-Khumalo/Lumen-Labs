// Film09 — Lockup (2412-2700 / 80:12-90:00, 288f), ACT 3 — the brand film
// ending (CINEMATIC-FILM.md §5, §9). NO footage: a pure brand surface over
// COLOR.ink. Four sign-off statements, each given a generous full-opacity hold,
// then the BrandMark + wordmark assembling under 9.3-9.4 and held FULLY
// assembled on the final frame (2700).
//
// Frames here are LOCAL to the scene (it starts at absolute f2412). The four
// beats come from LOCKUP_BEATS in filmTimeline.ts (the single source of truth,
// re-balanced for the measured VO durations); we convert each absolute beat to a
// scene-local window by subtracting film09's start. Caption OWNS fade-in -> hold
// -> fade-out over [in0,in1,out0,out1]; here out0 = beatEnd - fadeOut, out1 =
// beatEnd, in0 = beatStart, in1 = beatStart + fadeIn — so the holds equal the
// §5/LOCKUP_BEATS holds exactly (b1 52f, b2 104f, b3 40f, b4 52f).
//
// The nine sign-off beats breathe: each caption clears before the next begins,
// and the logo settles like a film's last frame — nothing rushed.

import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion'
import { COLOR } from '../../config/brand'
import { FONT } from '../../config/typography'
import { FILM_COPY } from '../../config/filmCopy'
import { FILM_SCENES, LOCKUP_BEATS } from '../../config/filmTimeline'
import { useFormat, safeBox, shortSide } from '../../lib/layout'
import { clip, clipN } from '../../lib/interpolate'
import { EASE } from '../../lib/easing'
import { Caption } from '../../components/film/Caption'
import { LogoReveal } from '../../components/LogoReveal'

const FILM09_START = FILM_SCENES.film09.start // 2412

/** Convert an absolute lockup beat to scene-local caption fade windows. */
function beatWindow(key: keyof typeof LOCKUP_BEATS): {
  in0: number
  in1: number
  out0: number
  out1: number
} {
  const b = LOCKUP_BEATS[key]
  const start = b.start - FILM09_START
  const end = b.end - FILM09_START
  return {
    in0: start,
    in1: start + b.fadeIn,
    out0: end - b.fadeOut,
    out1: end,
  }
}

export const Film09_Lockup: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)

  const b1 = beatWindow('b1') // Built with intention.
  const b2 = beatWindow('b2') // vision line (two lines)
  const b3 = beatWindow('b3') // Small enough to care.
  const b4 = beatWindow('b4') // Technical enough to build.

  // The logo lockup assembles under 9.3-9.4. b3 begins at scene-local 180; start
  // the reveal a touch before so the mark is settling as the last two lines land,
  // then holds FULLY assembled through the final frame (local 288 / abs 2700).
  const LOGO_START = 174
  // The lockup block (mark + wordmark + studio sub) fades up as it assembles.
  const lockupOpacity = clip(frame, [LOGO_START, LOGO_START + 24], [0, 1], {
    easing: EASE.out,
  })
  // The studio sub-label fades in after the wordmark has tracked in.
  const subOpacity = clipN(frame, [LOGO_START + 34, LOGO_START + 54], [0, 1], {
    easing: EASE.out,
  })

  const markSize = S * 0.12
  const wordmarkSize = S * 0.072

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      {/* Sign-off statements — upper-center, each fully clearing before the next. */}
      <Caption
        text={FILM_COPY.s06Tagline}
        in0={b1.in0}
        in1={b1.in1}
        out0={b1.out0}
        out1={b1.out1}
        anchorY={0.42}
        sizeScale={0.058}
      />
      <Caption
        text={FILM_COPY.visionLine}
        in0={b2.in0}
        in1={b2.in1}
        out0={b2.out0}
        out1={b2.out1}
        anchorY={0.42}
        sizeScale={0.05}
      />
      <Caption
        text={FILM_COPY.s05a}
        in0={b3.in0}
        in1={b3.in1}
        out0={b3.out0}
        out1={b3.out1}
        anchorY={0.3}
        sizeScale={0.044}
        color={COLOR.muted}
      />
      {/* b4 is the last line before the film ends; fade it fully out a few
          frames before 2700 so the final frame is the lockup alone (nothing
          lingering). The full-opacity hold is unchanged — only the fade-out
          finishes a touch earlier than the raw beat end. */}
      <Caption
        text={FILM_COPY.s05b}
        in0={b4.in0}
        in1={b4.in1}
        out0={b4.out1 - 16}
        out1={b4.out1 - 6}
        anchorY={0.3}
        sizeScale={0.044}
        color={COLOR.muted}
      />

      {/* The logo lockup — assembles under 9.3-9.4 and holds on the final frame. */}
      <Sequence from={LOGO_START} name="9.5 logo lockup">
        <AbsoluteFill
          style={{
            opacity: lockupOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y + 0.56 * box.height,
              width: box.width,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: S * 0.03,
            }}
          >
            <LogoReveal
              markSize={markSize}
              wordmarkSize={wordmarkSize}
              speed="fast"
              withWordmark
              startFrame={0}
              align="center"
            />
            <div
              style={{
                fontFamily: `'${FONT.mono}'`,
                fontSize: S * 0.016,
                fontWeight: 400,
                letterSpacing: '0.22em',
                color: COLOR.muted,
                textTransform: 'uppercase',
                textAlign: 'center',
                opacity: subOpacity,
              }}
            >
              {FILM_COPY.s06MetaStudio}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
