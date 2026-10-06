// Film02b — Weight (780-1140 / 26:00-38:00), Act 1, gradeCool (CINEMATIC-FILM.md §5).
// The low point: tension peaks, then a held near-silent beat before the turn.
// Frames are LOCAL to the scene (it starts at absolute f780). Two shots:
//   2b.1 (0-200)   office-busy — slow lateral drift; motion without progress (vo04).
//   2b.2 (200-360) rooftop-sunset — STATIC silhouette; the last 60f (abs 1080-1140)
//                  sit near-silent as Track A dips to its held 0.3 floor (vo05).
// Caption C3 "There has to be / a better way." — §5 abs windows in 992->1018,
// out 1092->1118; scene-local that is in 212->238, out 312->338.

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film02b_Weight: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 2b.1 — busy, slightly chaotic floor; a slow lateral drift. */}
      <Sequence from={0} durationInFrames={200} name="2b.1 office-busy">
        <FootageClip
          footageKey="office-busy"
          startFrame={0}
          durationInFrames={200}
          fromScale={1.05}
          toScale={1.07}
          panX={[0, 0.02]}
          gradeKey="cool"
        />
      </Sequence>

      {/* 2b.2 — a single, almost-still frame at dusk; the low point. Barely a
          breath of a push so it reads as held, not frozen. */}
      <Sequence from={200} durationInFrames={160} name="2b.2 rooftop-sunset">
        <FootageClip
          footageKey="rooftop-sunset"
          startFrame={0}
          durationInFrames={160}
          fromScale={1.0}
          toScale={1.03}
          gradeKey="cool"
        />
      </Sequence>

      {/* C3 — the question that opens the door to Act 2. */}
      <Caption
        text={FILM_COPY.c3}
        in0={212}
        in1={238}
        out0={312}
        out1={338}
        anchorY={0.64}
      />
    </AbsoluteFill>
  )
}
