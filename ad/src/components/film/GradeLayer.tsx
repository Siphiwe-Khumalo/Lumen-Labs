// GradeLayer — a GLOBAL atmospheric grade veil that warms the whole frame from
// cool to warm across the turn (CINEMATIC-FILM.md §2, §10). It sits above the
// scenes and below the captions/grain, cross-fading a faint steel veil out and a
// restrained amber veil in over the §2 warm-up window 1140 -> 1500, then holding
// warm. Composed only from filmGrade presets (brand.ts GRADE tokens).
//
// Amber discipline (§11): the amber veil is ATMOSPHERIC warmth, capped at a
// restrained opacity — never a glow, gradient-sweep, or a second amber "element".
// The two veils cross-fade so there is only ever one dominant tint on screen.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { gradeAt } from '../../config/filmGrade'

// Restrained ceilings. The veil colours already carry low alpha (steel 0.14,
// amber 0.16); these multipliers keep the composed warmth atmospheric.
const STEEL_MAX = 0.55
const AMBER_MAX = 0.5

export const GradeLayer: React.FC = () => {
  const frame = useCurrentFrame()
  const g = gradeAt(frame)

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Cool steel veil — full in Act 1, fading out across the turn. */}
      <AbsoluteFill
        style={{
          background: g.steel,
          opacity: g.steelOpacity * STEEL_MAX,
          mixBlendMode: 'soft-light',
        }}
      />
      {/* Warm amber veil — fading in across the turn, held in Act 3. */}
      <AbsoluteFill
        style={{
          background: g.amber,
          opacity: g.amberOpacity * AMBER_MAX,
          mixBlendMode: 'soft-light',
        }}
      />
    </AbsoluteFill>
  )
}
