// Film05 — Build: Software (1620-1860 / 54:00-62:00), ACT 3, gradeWarm (§5).
// Software & web apps being built — calm, working, connected. Frames are LOCAL
// to the scene (it starts at absolute f1620). Two shots:
//   5.1 (0-120)   dev-code — 1.05->1.10 push to the screen; code close up (vo09).
//   5.2 (120-240) dev-topview — static, faint drift; momentum, craft (vo09 cont).
// Caption C5 (titled) "SOFTWARE" + mono sub = FILM_COPY.softwareLine. §5 abs
// fade in 1632->1660, hold ~120f; scene-local in 12->40, out 170->198.

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film05_BuildSoftware: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 5.1 — developer writing real code, screen close; push to the screen. */}
      <Sequence from={0} durationInFrames={120} name="5.1 dev-code">
        <FootageClip
          footageKey="dev-code"
          startFrame={0}
          durationInFrames={120}
          fromScale={1.05}
          toScale={1.1}
          gradeKey="warm"
        />
      </Sequence>

      {/* 5.2 — hands typing, top view; near-static, a faint drift. */}
      <Sequence from={120} durationInFrames={120} name="5.2 dev-topview">
        <FootageClip
          footageKey="dev-topview"
          startFrame={0}
          durationInFrames={120}
          fromScale={1.03}
          toScale={1.05}
          panY={[0, 0.012]}
          gradeKey="warm"
        />
      </Sequence>

      {/* C5 — capability caption: title + " · "-joined service sub-line. */}
      <Caption
        variant="titled"
        title={FILM_COPY.softwareTitle}
        sub={FILM_COPY.softwareLine}
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
