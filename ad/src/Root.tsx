// Root — registers the three format compositions (DESIGN §4.2, §12). All three
// render the SAME <LaunchFilm/>, differing only in the injected Format. Font
// loading + gating happens inside LaunchFilm (so it applies to every render).

import React from 'react'
import { Composition } from 'remotion'
import { FORMATS } from './config/formats'
import { DURATION_IN_FRAMES, FPS } from './config/timeline'
import { LaunchFilm } from './LaunchFilm'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchFilm-Vertical"
        component={LaunchFilm as React.FC<Record<string, unknown>>}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={FORMATS.vertical.width}
        height={FORMATS.vertical.height}
        defaultProps={{ format: FORMATS.vertical }}
      />
      <Composition
        id="LaunchFilm-Wide"
        component={LaunchFilm as React.FC<Record<string, unknown>>}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={FORMATS.wide.width}
        height={FORMATS.wide.height}
        defaultProps={{ format: FORMATS.wide }}
      />
      <Composition
        id="LaunchFilm-Square"
        component={LaunchFilm as React.FC<Record<string, unknown>>}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={FORMATS.square.width}
        height={FORMATS.square.height}
        defaultProps={{ format: FORMATS.square }}
      />
    </>
  )
}
