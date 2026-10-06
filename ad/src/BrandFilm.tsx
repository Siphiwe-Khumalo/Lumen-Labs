// BrandFilm — the <Series> that composes the nine cinematic-film scenes at their
// FILM_SCENES ranges (CINEMATIC-FILM.md §3.3, §4, §5, §14). It mirrors
// LaunchFilm.tsx: a FormatContext.Provider + the vendored-font delayRender gate,
// scenes sequenced on a <Series>, and the global atmospheric/audio layers above
// the scenes.
//
// Global layers live OUTSIDE the <Series> so their useCurrentFrame() reads
// ABSOLUTE film frames (the scenes read scene-local frames inside the Series):
//   - GradeLayer : the cool->warm veil cross-fade across the turn (abs 1140->1500)
//   - Narration  : the 16 VO cues at their absolute start frames
//   - MusicBed   : the two-track score + the A->B cross-fade at the shift + ducking
//   - Grain      : the subtle always-on texture
//
// The turn at f1140 is one deliberate shift: MusicBed cross-fades A->B over
// 1140-1200, GradeLayer warms 1140->1500, and vo06 (which names the partner)
// lands at 1152 — all keyed to the single SHIFT frame.

import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Series, continueRender, delayRender } from 'remotion'
import { COLOR } from './config/brand'
import { fontFaceCss } from './config/fonts'
import { FormatContext } from './lib/layout'
import type { Format } from './config/formats'
import { filmSceneDuration } from './config/filmTimeline'
import { Film01_Struggle } from './scenes/film/Film01_Struggle'
import { Film02_Friction } from './scenes/film/Film02_Friction'
import { Film02b_Weight } from './scenes/film/Film02b_Weight'
import { Film03_Turn } from './scenes/film/Film03_Turn'
import { Film05_BuildSoftware } from './scenes/film/Film05_BuildSoftware'
import { Film06_BuildInfra } from './scenes/film/Film06_BuildInfra'
import { Film07_BuildControl } from './scenes/film/Film07_BuildControl'
import { Film08_Resolution } from './scenes/film/Film08_Resolution'
import { Film09_Lockup } from './scenes/film/Film09_Lockup'
import { GradeLayer } from './components/film/GradeLayer'
import { Narration } from './components/film/Narration'
import { MusicBed } from './components/film/MusicBed'
import { Grain } from './components/Grain'

export const BrandFilm: React.FC<{ format: Format }> = ({ format }) => {
  // Gate first paint on the vendored fonts parsing (zero network) — same pattern
  // as LaunchFilm.tsx, which is reused unchanged.
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
        {/* The nine scenes, 1:1 with FILM_SCENES, contiguous and summing to 2700. */}
        <Series>
          <Series.Sequence durationInFrames={filmSceneDuration('film01')}>
            <Film01_Struggle />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film02')}>
            <Film02_Friction />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film02b')}>
            <Film02b_Weight />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film03')}>
            <Film03_Turn />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film05')}>
            <Film05_BuildSoftware />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film06')}>
            <Film06_BuildInfra />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film07')}>
            <Film07_BuildControl />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film08')}>
            <Film08_Resolution />
          </Series.Sequence>
          <Series.Sequence durationInFrames={filmSceneDuration('film09')}>
            <Film09_Lockup />
          </Series.Sequence>
        </Series>

        {/* Global atmosphere (above the footage scenes, below the grain). The
            lockup (film09) draws its own ink surface, so the warm veil over it is
            harmless; keeping GradeLayer global keeps the turn one single shift. */}
        <GradeLayer />

        {/* Subtle film texture over everything visual. */}
        <Grain />

        {/* Audio: VO cues + the two-track score. These render nothing visually;
            Remotion muxes them into the output MP4 via its bundled ffmpeg. */}
        <Narration />
        <MusicBed />
      </AbsoluteFill>
    </FormatContext.Provider>
  )
}
