// Interpolation helpers — all clamp both ends so values never leave the range
// (DESIGN §8, §10).

import { interpolate, type EasingFunction } from 'remotion'

interface ClipOpts {
  easing?: EasingFunction
}

/** interpolate() that always clamps both ends. */
export function clip(
  frame: number,
  inputRange: readonly [number, number],
  outputRange: readonly [number, number],
  opts: ClipOpts = {},
): number {
  return interpolate(frame, [...inputRange], [...outputRange], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: opts.easing,
  })
}

/** Multi-keyframe interpolate that always clamps both ends. */
export function clipN(
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  opts: ClipOpts = {},
): number {
  return interpolate(frame, [...inputRange], [...outputRange], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: opts.easing,
  })
}

/** Map a frame to local 0..1 progress across [start,end], clamped. */
export function ranged(frame: number, start: number, end: number): number {
  return clip(frame, [start, end], [0, 1])
}

/**
 * Tracking-in letter-spacing in em. Interpolates from `from` → `to` over the
 * window; used by headline reveals.
 */
export function tracking(
  frame: number,
  window: readonly [number, number],
  from: number,
  to: number,
  easing?: EasingFunction,
): number {
  return clip(frame, window, [from, to], { easing })
}

export interface KenBurns {
  scale: number
  translateX: number
  translateY: number
}

const MAX_SCALE_DELTA = 0.08 // DESIGN §8 — never a zoom that reveals edge

/**
 * Ken-Burns transform over a window. Scale delta is clamped to the max so the
 * cover-fit never exposes a letterbox edge. Pan is expressed as a fraction of
 * the container drifting toward the focal direction.
 */
export function kenBurns(
  frame: number,
  window: readonly [number, number],
  opts: {
    fromScale: number
    toScale: number
    panX?: readonly [number, number]
    panY?: readonly [number, number]
    easing?: EasingFunction
  },
): KenBurns {
  const delta = opts.toScale - opts.fromScale
  const clampedTo =
    Math.abs(delta) > MAX_SCALE_DELTA
      ? opts.fromScale + Math.sign(delta) * MAX_SCALE_DELTA
      : opts.toScale
  const scale = clip(frame, window, [opts.fromScale, clampedTo], { easing: opts.easing })
  const translateX = opts.panX
    ? clip(frame, window, opts.panX, { easing: opts.easing })
    : 0
  const translateY = opts.panY
    ? clip(frame, window, opts.panY, { easing: opts.easing })
    : 0
  return { scale, translateX, translateY }
}
