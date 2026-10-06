// Footage map for the cinematic brand film (CINEMATIC-FILM.md §8, §10, §11).
// key -> local file (under public/) + focal point + grade key + probed
// durationInFrames (from FEAT-002 @30fps) + optional in-point. Mirrors the
// getAsset() discipline in src/config/assets.ts: getFootage() throws on an
// unknown key, an out-of-range focal point, or a missing durationInFrames.

export type FilmGradeKey = 'cool' | 'warm'

export interface FootageMeta {
  /** Path relative to public/ (served via staticFile). */
  file: string
  /** Focal point in [0,1]; keeps the cover-crop on the subject. */
  focusX: number
  focusY: number
  /** Which grade preset this clip uses (Act 1 = cool, Act 2-3 = warm). */
  gradeKey: FilmGradeKey
  /** Real clip length in frames @30fps, probed at fetch time (FEAT-002). */
  durationInFrames: number
  /** Optional trim-in point (frames); defaults to 0. */
  inPoint?: number
}

// Durations are the probed values recorded in public/footage/SOURCES.md.
// NOTE: 'office-open' maps to quiet-desk-dawn.mp4 — id 914 was swapped out in
// FEAT-002 (busy office, wrong for the "empty office before anyone arrives"
// beat) for id 1781, kept under the same storyboard key.
export const FOOTAGE = {
  'struggle-worried': {
    file: 'footage/struggle-worried.mp4',
    focusX: 0.5,
    focusY: 0.4,
    gradeKey: 'cool',
    durationInFrames: 450,
  },
  'office-open': {
    file: 'footage/quiet-desk-dawn.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'cool',
    durationInFrames: 360,
  },
  'office-glasses-reflection': {
    file: 'footage/office-glasses-reflection.mp4',
    focusX: 0.5,
    focusY: 0.45,
    gradeKey: 'cool',
    durationInFrames: 603,
  },
  'laptop-work': {
    file: 'footage/laptop-work.mp4',
    focusX: 0.5,
    focusY: 0.6,
    gradeKey: 'cool',
    durationInFrames: 639,
  },
  'office-busy': {
    file: 'footage/office-busy.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'cool',
    durationInFrames: 355,
  },
  'rooftop-sunset': {
    file: 'footage/rooftop-sunset.mp4',
    focusX: 0.5,
    focusY: 0.45,
    gradeKey: 'cool',
    durationInFrames: 460,
  },
  'meeting-collab': {
    file: 'footage/meeting-collab.mp4',
    focusX: 0.5,
    focusY: 0.45,
    gradeKey: 'warm',
    durationInFrames: 1122,
  },
  handshake: {
    file: 'footage/handshake.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 222,
  },
  'engineer-workshop': {
    file: 'footage/engineer-workshop.mp4',
    focusX: 0.5,
    focusY: 0.45,
    gradeKey: 'warm',
    durationInFrames: 451,
  },
  'dev-code': {
    file: 'footage/dev-code.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 550,
  },
  'dev-topview': {
    file: 'footage/dev-topview.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 450,
  },
  multiscreen: {
    file: 'footage/multiscreen.mp4',
    focusX: 0.5,
    focusY: 0.45,
    gradeKey: 'warm',
    durationInFrames: 247,
  },
  'city-aerial-night': {
    file: 'footage/city-aerial-night.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 428,
  },
  'ops-twoscreen': {
    file: 'footage/ops-twoscreen.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 307,
  },
  'park-sunrise': {
    file: 'footage/park-sunrise.mp4',
    focusX: 0.5,
    focusY: 0.5,
    gradeKey: 'warm',
    durationInFrames: 247,
  },
} as const satisfies Record<string, FootageMeta>

export type FootageKey = keyof typeof FOOTAGE

/**
 * Validate a footage meta against a key, throwing on an out-of-range focal point
 * or a missing/invalid durationInFrames. Exposed (with the map parameterized) so
 * tests can exercise the throw paths with injected bad entries.
 */
export function resolveFootage(
  key: string,
  map: Record<string, FootageMeta | undefined>,
): FootageMeta {
  const meta = map[key]
  if (!meta) {
    throw new Error(`Unknown footage key: ${String(key)}`)
  }
  if (meta.focusX < 0 || meta.focusX > 1 || meta.focusY < 0 || meta.focusY > 1) {
    throw new RangeError(
      `Footage "${key}": focal point out of range (${meta.focusX}, ${meta.focusY})`,
    )
  }
  if (
    typeof meta.durationInFrames !== 'number' ||
    !Number.isFinite(meta.durationInFrames) ||
    meta.durationInFrames <= 0
  ) {
    throw new RangeError(
      `Footage "${key}": missing or invalid durationInFrames (${meta.durationInFrames})`,
    )
  }
  return meta
}

/**
 * Resolve a footage clip, throwing on an unknown key, an out-of-range focal
 * point (focusX/Y in [0,1]), or a missing/invalid durationInFrames (§11).
 */
export function getFootage(key: FootageKey): FootageMeta {
  return resolveFootage(key, FOOTAGE as Record<string, FootageMeta>)
}

/** The probed durations as a plain map (for validateFootageWindows fixtures). */
export const FOOTAGE_DURATIONS: Record<string, number> = Object.fromEntries(
  Object.entries(FOOTAGE).map(([k, v]) => [k, v.durationInFrames]),
)
