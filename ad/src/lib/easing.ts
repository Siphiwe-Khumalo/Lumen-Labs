// Easing + spring presets, ported from the site's :root tokens (DESIGN §8).

import { Easing } from 'remotion'

export const EASE = {
  base: Easing.bezier(0.22, 0.68, 0.24, 1), // --ease
  out: Easing.bezier(0.16, 1, 0.3, 1), // --ease-out (primary reveals)
  inOut: Easing.bezier(0.62, 0.05, 0.3, 0.98), // --ease-in-out (Ken-Burns)
  outExpo: Easing.bezier(0.19, 1, 0.22, 1), // sharper — hero masked reveals only
} as const

export const SPRING = {
  settle: { damping: 200, stiffness: 120, mass: 0.8 }, // type tracking settle
  mark: { damping: 180, stiffness: 90, mass: 1.0 }, // logo element arrival
} as const
