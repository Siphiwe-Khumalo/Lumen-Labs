// ImageReveal — the ONLY component that transforms an <img>. It applies uniform
// scale-to-cover (focal-point aware) + translate + a rectangular mask wipe, plus
// the site grade and a two-layer scrim. NO skew/stretch API (no-distortion, §10).

import React from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import { GRADE } from '../config/brand'
import { getAsset, type AssetKey } from '../config/assets'
import { clip, kenBurns } from '../lib/interpolate'
import { EASE } from '../lib/easing'

export type MaskKind = 'wipeLR' | 'wipeRL' | 'wipeTB' | 'wipeBT' | 'bandCenter' | 'none'

interface ImageRevealProps {
  assetKey: AssetKey
  mask?: MaskKind
  startFrame: number
  durationInFrames: number
  /** Ken-Burns scale endpoints (default a gentle push-in). */
  fromScale?: number
  toScale?: number
  /** Pan endpoints in px (optional lateral/vertical drift). */
  panX?: readonly [number, number]
  panY?: readonly [number, number]
  /** Easing for the mask reveal — hero scenes use EASE.outExpo. */
  revealEasing?: typeof EASE.out
  scrim?: boolean
  /** 0..1 extra uniform scale applied on top (for parallax layering). */
  baseScale?: number
  grade?: boolean
  /** Duotone veil token (very faint; off by default). */
  duotone?: 'amber' | 'steel' | 'none'
  style?: React.CSSProperties
}

function maskClip(mask: MaskKind, p: number): string | undefined {
  // p = 0 fully hidden, 1 fully revealed
  const hidden = (1 - p) * 100
  switch (mask) {
    case 'wipeLR':
      return `inset(0 ${hidden}% 0 0)`
    case 'wipeRL':
      return `inset(0 0 0 ${hidden}%)`
    case 'wipeTB':
      return `inset(0 0 ${hidden}% 0)`
    case 'wipeBT':
      return `inset(${hidden}% 0 0 0)`
    case 'bandCenter': {
      const half = hidden / 2
      return `inset(${half}% 0 ${half}% 0)`
    }
    case 'none':
    default:
      return undefined
  }
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  assetKey,
  mask = 'none',
  startFrame,
  durationInFrames,
  fromScale = 1.08,
  toScale = 1.14,
  panX,
  panY,
  revealEasing = EASE.out,
  scrim = true,
  baseScale = 1,
  grade = true,
  duotone = 'none',
  style,
}) => {
  const frame = useCurrentFrame()
  const meta = getAsset(assetKey)

  const reveal = clip(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    easing: revealEasing,
  })

  // Ken-Burns spans the whole life of the image (startFrame → generous tail).
  const kb = kenBurns(frame, [startFrame, startFrame + 120], {
    fromScale,
    toScale,
    panX,
    panY,
    easing: EASE.inOut,
  })

  const clipPath = maskClip(mask, reveal)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', clipPath, ...style }}>
      <AbsoluteFill
        style={{
          transform: `scale(${kb.scale * baseScale}) translate(${kb.translateX}px, ${kb.translateY}px)`,
          transformOrigin: `${meta.focusX * 100}% ${meta.focusY * 100}%`,
        }}
      >
        <Img
          src={staticFile(meta.file)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${meta.focusX * 100}% ${meta.focusY * 100}%`,
            filter: grade ? GRADE.filter : undefined,
          }}
        />
      </AbsoluteFill>

      {duotone !== 'none' && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(152deg, ${
              duotone === 'amber' ? GRADE.duotoneAmber : GRADE.duotoneSteel
            }, transparent 70%)`,
          }}
        />
      )}

      {scrim && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to top, ${GRADE.scrim} 0%, transparent 52%)`,
          }}
        />
      )}
    </AbsoluteFill>
  )
}
