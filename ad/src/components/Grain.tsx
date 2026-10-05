// Grain — a subtle static-noise overlay (~5% opacity, overlay blend). Procedural
// SVG feTurbulence, deterministic (DESIGN §8). Subtle texture, not a film effect.

import React from 'react'
import { AbsoluteFill } from 'remotion'

interface GrainProps {
  opacity?: number
}

export const Grain: React.FC<GrainProps> = ({ opacity = 0.05 }) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  return (
    <AbsoluteFill
      style={{
        backgroundImage: url,
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}
