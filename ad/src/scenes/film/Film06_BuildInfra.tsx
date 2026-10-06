// Film06 — Build: Infrastructure (1860-2100 / 62:00-70:00), ACT 3, gradeWarm (§5).
// IT, networking, cloud, Microsoft 365 — systems that now connect, quietly doing
// their job. Frames are LOCAL to the scene (it starts at absolute f1860). Two
// shots:
//   6.1 (0-120)   multiscreen — slow push-in; a connected workstation (vo10).
//   6.2 (120-240) city-aerial-night — very slow drift (static-feeling); the
//                 network, the cloud, the scale the business can reach (vo10 cont).
// Caption C6 (titled) "INFRASTRUCTURE" + mono sub = FILM_COPY.infrastructureLine.
// §5 abs fade in 1872->1900, hold ~120f; scene-local in 12->40, out 170->198.

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film06_BuildInfra: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 6.1 — programmer at a multi-screen workstation; a slow push-in. */}
      <Sequence from={0} durationInFrames={120} name="6.1 multiscreen">
        <FootageClip
          footageKey="multiscreen"
          startFrame={0}
          durationInFrames={120}
          fromScale={1.04}
          toScale={1.09}
          gradeKey="warm"
        />
      </Sequence>

      {/* 6.2 — aerial glass towers at night; a very slow drift, almost still. */}
      <Sequence from={120} durationInFrames={120} name="6.2 city-aerial-night">
        <FootageClip
          footageKey="city-aerial-night"
          startFrame={0}
          durationInFrames={120}
          fromScale={1.03}
          toScale={1.06}
          panX={[0, 0.015]}
          gradeKey="warm"
        />
      </Sequence>

      {/* C6 — capability caption. */}
      <Caption
        variant="titled"
        title={FILM_COPY.infrastructureTitle}
        sub={FILM_COPY.infrastructureLine}
        in0={12}
        in1={40}
        out0={170}
        out1={198}
        anchorY={0.72}
        align="left"
      />
    </AbsoluteFill>
  )
}
