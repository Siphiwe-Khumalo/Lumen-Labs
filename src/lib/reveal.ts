import type { CSSProperties } from 'react'

/**
 * Stagger helper for reveal animations. The index is passed to CSS as `--d`,
 * which the `[data-reveal]` rule turns into a transition delay.
 */
export function stagger(index: number): CSSProperties {
  return { '--d': index } as CSSProperties
}
