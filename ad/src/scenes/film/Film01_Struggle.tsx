// Film01 — Struggle (0-390 / 0:00-13:00), Act 1, gradeCool (CINEMATIC-FILM.md §5).
// Pre-dawn; the owner alone with the weight. Two shots:
//   1.1 (0-150)   struggle-worried — STATIC, no move; let it sit (music only).
//   1.2 (150-390) office-open — slow 1.06->1.10 push into the cold empty office.
// Caption C1 "A business doesn't fail / in one big moment." (fade in 162->188,
// hold, out 348->378). Scene-local frames == absolute (film01 starts at f0).

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film01_Struggle: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 1.1 — STATIC worried owner in the quiet before the day starts. */}
      <Sequence from={0} durationInFrames={150} name="1.1 struggle-worried">
        <FootageClip
          footageKey="struggle-worried"
          startFrame={0}
          durationInFrames={150}
          fromScale={1.04}
          toScale={1.04}
          gradeKey="cool"
        />
      </Sequence>

      {/* 1.2 — slow push into the cold open office before anyone arrives. */}
      <Sequence from={150} durationInFrames={240} name="1.2 office-open">
        <FootageClip
          footageKey="office-open"
          startFrame={0}
          durationInFrames={240}
          fromScale={1.06}
          toScale={1.1}
          gradeKey="cool"
        />
      </Sequence>

      {/* C1 — the first words, given room to breathe. */}
      <Caption
        text={FILM_COPY.c1}
        in0={162}
        in1={188}
        out0={348}
        out1={378}
        anchorY={0.68}
      />
    </AbsoluteFill>
  )
}
