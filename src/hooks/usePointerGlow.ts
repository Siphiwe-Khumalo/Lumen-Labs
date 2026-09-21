import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/**
 * Tracks the pointer inside an element and writes its position to CSS custom
 * properties (`--px`, `--py`) so the visual response lives entirely in CSS.
 * Updates are written on the next animation frame to avoid layout thrash, and
 * are skipped for coarse pointers and reduced-motion users.
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>() {
  const frame = useRef(0)

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    if (event.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--px', `${x.toFixed(2)}%`)
      element.style.setProperty('--py', `${y.toFixed(2)}%`)
    })
  }, [])

  const onPointerLeave = useCallback((event: ReactPointerEvent<T>) => {
    cancelAnimationFrame(frame.current)
    const element = event.currentTarget
    element.style.removeProperty('--px')
    element.style.removeProperty('--py')
  }, [])

  return { onPointerMove, onPointerLeave }
}
