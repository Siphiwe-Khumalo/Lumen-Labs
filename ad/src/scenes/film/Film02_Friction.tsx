// Film02 — Friction (390-780 / 13:00-26:00), Act 1, gradeCool (CINEMATIC-FILM.md §5).
// Disconnected systems, time lost to admin, missed opportunity. Two shots
// (frames LOCAL to the scene; the scene starts at absolute f390):
//   2.1 (0-170)   office-glasses-reflection — static hold, faint drift (vo02).
//   2.2 (170-390) laptop-work — 1.05->1.11 push toward the hands (vo03).
// Caption C2 "Systems that don't talk. / Hours that don't add up." — absolute
// §5 fade windows are 572->600 (in) and 740->770 (out); scene-local that is
// 182->210 (in) and 350->380 (out).

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film02_Friction: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 2.1 — a screen reflected in glasses; the day already spent reacting. */}
      <Sequence from={0} durationInFrames={170} name="2.1 office-glasses-reflection">
        <FootageClip
          footageKey="office-glasses-reflection"
          startFrame={0}
          durationInFrames={170}
          fromScale={1.03}
          toScale={1.05}
          panX={[0, 0.012]}
          gradeKey="cool"
        />
      </Sequence>

      {/* 2.2 — hands typing into one more disconnected tool; push toward them. */}
      <Sequence from={170} durationInFrames={220} name="2.2 laptop-work">
        <FootageClip
          footageKey="laptop-work"
          startFrame={0}
          durationInFrames={220}
          fromScale={1.05}
          toScale={1.11}
          gradeKey="cool"
        />
      </Sequence>

      {/* C2 — lands over the second shot, generous hold. */}
      <Caption
        text={FILM_COPY.c2}
        in0={182}
        in1={210}
        out0={350}
        out1={380}
        anchorY={0.66}
      />
    </AbsoluteFill>
  )
}
