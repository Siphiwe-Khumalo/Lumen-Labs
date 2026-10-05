// ImageParallax — wraps ImageReveal and adds a drift `rate` so background and
// foreground layers move at different rates (DESIGN §9).

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { ImageReveal } from './ImageReveal'
import type { AssetKey } from '../config/assets'
import type { MaskKind } from './ImageReveal'
import { clip } from '../lib/interpolate'
import { EASE } from '../lib/easing'

interface ImageParallaxProps {
  assetKey: AssetKey
  mask?: MaskKind
  startFrame: number
  durationInFrames: number
  /** Parallax rate 0..1 — lower drifts slower than the shared signal. */
  rate: number
  /** Max drift in px applied over the scene. */
  driftX?: number
  driftY?: number
  driftWindow?: readonly [number, number]
  fromScale?: number
  toScale?: number
  scrim?: boolean
  style?: React.CSSProperties
}

export const ImageParallax: React.FC<ImageParallaxProps> = ({
  assetKey,
  mask = 'none',
  startFrame,
  durationInFrames,
  rate,
  driftX = 0,
  driftY = 0,
  driftWindow = [0, 120],
  fromScale,
  toScale,
  scrim,
  style,
}) => {
  const frame = useCurrentFrame()
  const dx = clip(frame, driftWindow, [0, driftX * rate], { easing: EASE.inOut })
  const dy = clip(frame, driftWindow, [0, driftY * rate], { easing: EASE.inOut })

  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)`, ...style }}>
      <ImageReveal
        assetKey={assetKey}
        mask={mask}
        startFrame={startFrame}
        durationInFrames={durationInFrames}
        fromScale={fromScale}
        toScale={toScale}
        scrim={scrim}
      />
    </AbsoluteFill>
  )
}
