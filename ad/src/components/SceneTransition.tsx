// SceneTransition — the single always-on amber carry-line that threads the whole
// film (DESIGN §7.7). Driven by the GLOBAL frame (0..809), mounted once in
// LaunchFilm above the scenes. Scenes only leave negative space for it.
//
// Journey (global frames):
//   S02 underline under "build"  →  travels to centre for S03 mark ignition
//   →  becomes S04 baseline rule  →  rises to S05 philosophy seam
//   →  carries up into S06 final lockup node.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { safeBox, useFormat } from '../lib/layout'
import { clipN } from '../lib/interpolate'
import { EASE } from '../lib/easing'

export const SceneTransition: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)

  // The carry-line threads the IDENTITY moments only. Scenes that own their own
  // amber (S02 underline, S04 active tick, S05 seam) do NOT get a second amber
  // from this layer — amber discipline (one element per frame). So the carry is
  // visible across the S02→S03 ignition and the S03→S04 handoff, then rests until
  // it rises into S06's lockup. It never shares a frame with a scene's own amber.
  //
  // Active windows (global frames):
  //   [220, 266] — detaches from S02, glides to centre for S03 mark ignition
  //   [740, 772] — rises into S06's final lockup node
  const inIgnition = frame >= 220 && frame < 266
  const inLaunch = frame >= 740 && frame < 772
  const visible = inIgnition || inLaunch

  // Vertical position: arrives at S03 centre band, then at S06 lockup node row.
  const yFrac = clipN(frame, [220, 266, 740, 772], [0.6, 0.42, 0.5, 0.9], {
    easing: EASE.inOut,
  })

  // Horizontal extent: a short travelling underline that contracts to a node.
  const widthFrac = clipN(frame, [220, 266, 740, 772], [0.26, 0.14, 0.1, 0.04], {
    easing: EASE.inOut,
  })

  // Opacity: a restrained glide in/out, never a hard flash.
  const opacity = clipN(
    frame,
    [220, 232, 258, 266, 740, 752, 766, 772],
    [0, 0.85, 0.85, 0, 0, 0.85, 0.85, 0],
  )

  if (!visible) return null

  const w = box.width * widthFrac
  const left = box.x + (box.width - w) / 2
  const top = box.y + box.height * yFrac

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: w,
          height: 2,
          background: COLOR.accent,
          opacity,
        }}
      />
    </AbsoluteFill>
  )
}
