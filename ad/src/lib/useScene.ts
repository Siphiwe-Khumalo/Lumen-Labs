// Hook: local frame + 0..1 progress within the current Sequence (DESIGN §3).

import { useCurrentFrame, useVideoConfig } from 'remotion'
import { ranged } from './interpolate'

export interface SceneState {
  /** Local frame within the current Sequence (0-based). */
  frame: number
  /** Duration of the current Sequence in frames. */
  durationInFrames: number
  /** Local progress 0..1 across the whole Sequence. */
  progress: number
}

export function useScene(): SceneState {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return {
    frame,
    durationInFrames,
    progress: ranged(frame, 0, durationInFrames),
  }
}
