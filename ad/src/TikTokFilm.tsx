// TikTokFilm — a clean 30.0s (900f @30fps) vertical cut for TikTok, reusing the
// EXACT same scene sequence as LaunchFilm. The only difference: Scene07 (the
// founder sign-off) gets 15 extra frames of hold — just more time on the settled
// final thumbnail. No redesign, same storyboard, same motion, same copy.
//
// Silent (no audio), 1080×1920, TikTok-ready.

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
import { Scene07_Founder } from './scenes/Scene07_Founder'
import { SceneTransition } from './components/SceneTransition'
import { Grain } from './components/Grain'

/** 30.0s = 900 frames @30fps. */
export const TIKTOK_DURATION = 900 as const
export const TIKTOK_FPS = 30 as const

/** Extra frames added to the final scene to reach 30.0s. The settled founder
 *  sign-off simply holds a beat longer — the motion is already finished by that
 *  point so the extra 15f (0.5s) of hold reads as confident, not frozen. */
const S07_PAD = TIKTOK_DURATION - (sceneDuration('s01') + sceneDuration('s02') +
  sceneDuration('s03') + sceneDuration('s04') + sceneDuration('s05') +
  sceneDuration('s06') + sceneDuration('s07'))

export const TikTokFilm: React.FC<{ format: Format }> = ({ format }) => {
  // Gate first paint on the vendored fonts (same as LaunchFilm).
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
          <Series.Sequence durationInFrames={sceneDuration('s07') + S07_PAD}>
            <Scene07_Founder />
          </Series.Sequence>
        </Series>

        {/* Global carry-line (above scenes, below grain) and subtle grain. */}
        <SceneTransition />
        <Grain />
      </AbsoluteFill>
    </FormatContext.Provider>
  )
}
