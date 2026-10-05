// LaunchFilm — the <Series> that composes Scene01..06 (DESIGN §7, §10). It only
// sequences scenes; each scene composes reusable components fed by config. The
// amber carry-line (SceneTransition) and Grain are always-on layers above.

import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Series, continueRender, delayRender } from 'remotion'
import { COLOR } from './config/brand'
import { sceneDuration } from './config/timeline'
import { fontFaceCss } from './config/fonts'
import { FormatContext } from './lib/layout'
import type { Format } from './config/formats'
import { Scene01_Opening } from './scenes/Scene01_Opening'
import { Scene02_Idea } from './scenes/Scene02_Idea'
import { Scene03_Lumen } from './scenes/Scene03_Lumen'
import { Scene04_Build } from './scenes/Scene04_Build'
import { Scene05_Philosophy } from './scenes/Scene05_Philosophy'
import { Scene06_Launch } from './scenes/Scene06_Launch'
import { SceneTransition } from './components/SceneTransition'
import { Grain } from './components/Grain'

export const LaunchFilm: React.FC<{ format: Format }> = ({ format }) => {
  // Gate first paint on the vendored fonts parsing (zero network, DESIGN §5.5).
  const [handle] = useState(() => delayRender('Loading vendored fonts'))
  useEffect(() => {
    let cancelled = false
    const done = () => {
      if (!cancelled) continueRender(handle)
    }
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(done).catch(done)
    } else {
      done()
    }
    return () => {
      cancelled = true
    }
  }, [handle])

  return (
    <FormatContext.Provider value={format}>
      <style>{fontFaceCss()}</style>
      <AbsoluteFill style={{ background: COLOR.ink }}>
        <Series>
          <Series.Sequence durationInFrames={sceneDuration('s01')}>
            <Scene01_Opening />
          </Series.Sequence>
          <Series.Sequence durationInFrames={sceneDuration('s02')}>
            <Scene02_Idea />
          </Series.Sequence>
          <Series.Sequence durationInFrames={sceneDuration('s03')}>
            <Scene03_Lumen />
          </Series.Sequence>
          <Series.Sequence durationInFrames={sceneDuration('s04')}>
            <Scene04_Build />
          </Series.Sequence>
          <Series.Sequence durationInFrames={sceneDuration('s05')}>
            <Scene05_Philosophy />
          </Series.Sequence>
          <Series.Sequence durationInFrames={sceneDuration('s06')}>
            <Scene06_Launch />
          </Series.Sequence>
        </Series>

        {/* Global carry-line (above scenes, below grain) and subtle grain. */}
        <SceneTransition />
        <Grain />
      </AbsoluteFill>
    </FormatContext.Provider>
  )
}
