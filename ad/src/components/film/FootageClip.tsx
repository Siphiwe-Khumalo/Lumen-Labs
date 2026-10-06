// FootageClip — the ONLY component that renders stock footage for the brand
// film (CINEMATIC-FILM.md §3.2, §10). It mirrors ImageReveal's *discipline*
// (uniform cover-scale, focal origin, Ken-Burns via kenBurns(), grade filter,
// two-layer scrim, optional duotone veil + mask wipe) but renders
// <OffthreadVideo> instead of <Img>, and parameterizes the Ken-Burns window to
// the shot's OWN frame window (not a fixed 120f) so the push spans the whole
// shot rather than finishing early and holding.
//
// Trim discipline (§10): <OffthreadVideo src={staticFile(meta.file)}
// trimBefore={meta.inPoint}> — trimBefore sets the in-point and the Sequence /
// durationInFrames sets the length. trimAfter/startFrom/endAt are DEPRECATED in
// Remotion 4.0.533 and are NOT used. There is NO skew/stretch API by design.

import React from 'react'
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion'
import { GRADE } from '../../config/brand'
import { getFootage, type FootageKey } from '../../config/footage'
import { gradeCool, gradeWarm } from '../../config/filmGrade'
import { clip, kenBurns } from '../../lib/interpolate'
import { EASE } from '../../lib/easing'

export type MaskKind = 'wipeLR' | 'wipeRL' | 'wipeTB' | 'wipeBT' | 'bandCenter' | 'none'

interface FootageClipProps {
  footageKey: FootageKey
  /** Frame (local to the enclosing Sequence) the shot begins. */
  startFrame: number
  /** Length of the shot in frames — also the Ken-Burns window. */
  durationInFrames: number
  /** Ken-Burns scale endpoints. Default a gentle push-in; set equal for a
   *  deliberately STATIC shot (fromScale === toScale → no move). */
  fromScale?: number
  toScale?: number
  /** Optional pan endpoints as a fraction of the container (lateral/vertical). */
  panX?: readonly [number, number]
  panY?: readonly [number, number]
  /** Grade preset: 'cool' (Act 1) or 'warm' (Act 3). The animated warm-up over
   *  the turn is owned by GradeLayer; this picks the per-clip base family. */
  gradeKey?: 'cool' | 'warm'
  /** Two-layer bottom scrim for legibility under captions. */
  scrim?: boolean
  /** Optional reveal wipe reusing ImageReveal's MaskKind set. */
  mask?: MaskKind
  /** Frames the mask takes to fully reveal (from startFrame). */
  maskDuration?: number
  style?: React.CSSProperties
}

function maskClip(mask: MaskKind, p: number): string | undefined {
  // p = 0 fully hidden, 1 fully revealed (identical semantics to ImageReveal).
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

export const FootageClip: React.FC<FootageClipProps> = ({
  footageKey,
  startFrame,
  durationInFrames,
  fromScale = 1.06,
  toScale = 1.1,
  panX,
  panY,
  gradeKey,
  scrim = true,
  mask = 'none',
  maskDuration = 24,
  style,
}) => {
  const frame = useCurrentFrame()
  const meta = getFootage(footageKey)
  const key = gradeKey ?? meta.gradeKey
  const preset = key === 'warm' ? gradeWarm : gradeCool

  // Ken-Burns over the SHOT'S OWN window (not a fixed 120f) — a static shot
  // sets fromScale === toScale and nothing moves. Scale delta auto-clamped 0.08.
  const kb = kenBurns(frame, [startFrame, startFrame + durationInFrames], {
    fromScale,
    toScale,
    panX,
    panY,
    easing: EASE.inOut,
  })

  const reveal =
    mask === 'none'
      ? 1
      : clip(frame, [startFrame, startFrame + maskDuration], [0, 1], {
          easing: EASE.out,
        })
  const clipPath = maskClip(mask, reveal)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', clipPath, ...style }}>
      <AbsoluteFill
        style={{
          transform: `scale(${kb.scale}) translate(${kb.translateX * 100}%, ${kb.translateY * 100}%)`,
          transformOrigin: `${meta.focusX * 100}% ${meta.focusY * 100}%`,
        }}
      >
        <OffthreadVideo
          src={staticFile(meta.file)}
          trimBefore={meta.inPoint}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${meta.focusX * 100}% ${meta.focusY * 100}%`,
            filter: preset.filter,
          }}
        />
      </AbsoluteFill>

      {/* Restrained duotone veil (atmospheric; the amber one is capped). This is
          the per-clip base veil; GradeLayer adds the global warm-up cross-fade. */}
      <AbsoluteFill
        style={{
          background: preset.veil,
          opacity: preset.veilOpacity,
          mixBlendMode: 'soft-light',
        }}
      />

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
