// Grade presets for the cinematic brand film (CINEMATIC-FILM.md §2, §10).
// COMPOSED from the brand.ts GRADE tokens — brand.ts is NOT edited.
//   gradeCool = GRADE.filter as-is + a faint steel veil (Act 1).
//   gradeWarm = slightly higher brightness/saturation within the same token
//               family + the amber veil at a higher-but-restrained opacity (Act 3).
// A helper interpolates cool -> warm over the §2 warm-up window 1140 -> 1500,
// then holds warm.

import { GRADE } from './brand'
import { clip } from '../lib/interpolate'

export interface GradePreset {
  /** CSS filter string applied non-destructively to the footage. */
  filter: string
  /** Duotone veil colour (rgba) laid over the clip. */
  veil: string
  /** Veil opacity multiplier (0..1), restrained. */
  veilOpacity: number
}

// gradeCool: the site's base photo grade + a faint steel veil (cold, Act 1).
export const gradeCool: GradePreset = {
  filter: GRADE.filter, // 'saturate(0.68) contrast(1.05) brightness(0.82)'
  veil: GRADE.duotoneSteel, // 'rgba(169,200,216,0.14)'
  veilOpacity: 1,
}

// gradeWarm: lifted a touch within the same family + the amber veil (Act 3).
// Brightness 0.82 -> 0.92 and saturation 0.68 -> 0.82; still restrained, never
// a glow. The amber veil replaces the steel one.
export const gradeWarm: GradePreset = {
  filter: 'saturate(0.82) contrast(1.04) brightness(0.92)',
  veil: GRADE.duotoneAmber, // 'rgba(233,185,120,0.16)'
  veilOpacity: 1,
}

/** The §2 grade warm-up window: cool -> warm over 1140 -> 1500, then held. */
export const GRADE_WARMUP: readonly [number, number] = [1140, 1500]

/**
 * Interpolate the three numeric filter channels (saturate, contrast, brightness)
 * and the veil opacity from cool -> warm over GRADE_WARMUP, returning a usable
 * GradePreset for the given frame. The amber/steel veils cross-fade: the steel
 * veil fades out as the amber veil fades in. Before 1140 the result is gradeCool;
 * after 1500 it is gradeWarm; this clamps at both ends (clip()).
 */
const COOL = { saturate: 0.68, contrast: 1.05, brightness: 0.82 }
const WARM = { saturate: 0.82, contrast: 1.04, brightness: 0.92 }

export function gradeAt(frame: number): {
  filter: string
  steel: string
  steelOpacity: number
  amber: string
  amberOpacity: number
} {
  const [from, to] = GRADE_WARMUP
  const saturate = clip(frame, [from, to], [COOL.saturate, WARM.saturate])
  const contrast = clip(frame, [from, to], [COOL.contrast, WARM.contrast])
  const brightness = clip(frame, [from, to], [COOL.brightness, WARM.brightness])
  // Cross-fade the two restrained veils as the world warms.
  const warmth = clip(frame, [from, to], [0, 1])
  return {
    filter: `saturate(${saturate.toFixed(3)}) contrast(${contrast.toFixed(3)}) brightness(${brightness.toFixed(3)})`,
    steel: gradeCool.veil,
    steelOpacity: 1 - warmth,
    amber: gradeWarm.veil,
    amberOpacity: warmth,
  }
}
