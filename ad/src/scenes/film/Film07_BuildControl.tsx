// Film07 — Build: Control + Security (2100-2256 / 70:00-75:12, 156f), ACT 3,
// gradeWarm (§5). Automation, SCADA, cybersecurity, CCTV, VoIP — calm and in
// control. Frames are LOCAL to the scene (it starts at absolute f2100). One
// shot:
//   7.1 (0-156)   ops-twoscreen — 1.05->1.10 push; expert at a two-screen ops
//                 desk (vo11 "Secured. Connected. Under control.").
// Caption C7 (titled) "CONTROL + SECURITY" + mono sub = FILM_COPY.controlLine,
// which is COPY.s04.control.items.join(' · ') — the EXACT 5-item array INCLUDING
// SCADA (§5 F3 fix). §5 abs fade in 2112->2140, hold ~100f; scene-local in
// 12->40, out 130->154 (kept inside the 156f scene).

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film07_BuildControl: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 7.1 — a two-screen security/ops desk; a steady push, in control. */}
      <Sequence from={0} durationInFrames={156} name="7.1 ops-twoscreen">
        <FootageClip
          footageKey="ops-twoscreen"
          startFrame={0}
          durationInFrames={156}
          fromScale={1.05}
          toScale={1.1}
          gradeKey="warm"
        />
      </Sequence>

      {/* C7 — capability caption; sub-label includes SCADA (verbatim array). */}
      <Caption
        variant="titled"
        title={FILM_COPY.controlTitle}
        sub={FILM_COPY.controlLine}
        in0={12}
        in1={40}
        out0={130}
        out1={154}
        anchorY={0.72}
        align="left"
      />
    </AbsoluteFill>
  )
}
