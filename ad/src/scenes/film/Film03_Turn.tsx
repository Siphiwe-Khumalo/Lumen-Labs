// Film03 — The Turn (1140-1620 / 38:00-54:00), ACT 2, SHIFT @1140 (CINEMATIC-FILM.md §5).
// THE money moment: one unbroken 16s emotional move where light enters and the
// partner is named by vo06. The global shift (music A->B cross-fade, grade
// cool->warm over abs 1140->1500) is owned by MusicBed/GradeLayer at the film
// level; this scene lets the three shots breathe forward into the warmth.
// Frames are LOCAL to the scene (it starts at absolute f1140). Three shots:
//   3.1 (0-180)   meeting-collab — gentle 1.04->1.10 push-in from the first warm
//                 frame (no wipe: the turn's light is carried by the grade warm-up
//                 + music cross-fade, so f1140 lands on footage, not black). A
//                 real conversation, one person listening (vo06 names the turn).
//   3.2 (180-330) handshake — static settle; partnership, not a product (vo07).
//                 Caption C4 "Then they found a partner." lands here.
//   3.3 (330-480) engineer-workshop — slow 1.05->1.11; the work begins (vo08).
// Caption C4 §5 abs windows in 1332->1360, out 1440->1468; scene-local that is
// in 192->220, out 300->328.

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'
import { Caption } from '../../components/film/Caption'
import { FILM_COPY } from '../../config/filmCopy'

export const Film03_Turn: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 3.1 — the break: warm first light, a conversation that starts with the
          problem. A patient forward push as the room opens up. */}
      <Sequence from={0} durationInFrames={180} name="3.1 meeting-collab">
        <FootageClip
          footageKey="meeting-collab"
          startFrame={0}
          durationInFrames={180}
          fromScale={1.04}
          toScale={1.1}
          gradeKey="warm"
        />
      </Sequence>

      {/* 3.2 — the agreement; let it settle, static. */}
      <Sequence from={180} durationInFrames={150} name="3.2 handshake">
        <FootageClip
          footageKey="handshake"
          startFrame={0}
          durationInFrames={150}
          fromScale={1.05}
          toScale={1.05}
          gradeKey="warm"
        />
      </Sequence>

      {/* 3.3 — the engineer begins the work; calm competence, warm desk light. */}
      <Sequence from={330} durationInFrames={150} name="3.3 engineer-workshop">
        <FootageClip
          footageKey="engineer-workshop"
          startFrame={0}
          durationInFrames={150}
          fromScale={1.05}
          toScale={1.11}
          gradeKey="warm"
        />
      </Sequence>

      {/* C4 — the partner is named; held across the handshake. */}
      <Caption
        text={FILM_COPY.c4}
        in0={192}
        in1={220}
        out0={300}
        out1={328}
        anchorY={0.66}
      />
    </AbsoluteFill>
  )
}
