// Film08 — Resolution (2256-2412 / 75:12-80:12, 156f), ACT 3, gradeWarm (§5).
// Warm golden-hour light; growth and clarity, the weight gone. Frames are LOCAL
// to the scene (it starts at absolute f2256). One shot, no on-screen text (the
// copy rests before the lockup):
//   8.1 (0-156)   park-sunrise — gentle 1.04->1.09, warm; the vision has room
//                 to grow (vo12 bridges into the lockup tagline).

import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { FootageClip } from '../../components/film/FootageClip'

export const Film08_Resolution: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 8.1 — a park opening up in warm light; a gentle, settled push. */}
      <Sequence from={0} durationInFrames={156} name="8.1 park-sunrise">
        <FootageClip
          footageKey="park-sunrise"
          startFrame={0}
          durationInFrames={156}
          fromScale={1.04}
          toScale={1.09}
          gradeKey="warm"
        />
      </Sequence>
    </AbsoluteFill>
  )
}
