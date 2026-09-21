import { useEffect, useState } from 'react'

type ScrollState = {
  /** True once the page has scrolled past the header height. */
  isScrolled: boolean
  /** Reading progress from 0 to 1. */
  progress: number
}

/** Drives the header's glass treatment and the reading-progress line. */
export function useScrollState(threshold = 24): ScrollState {
  const [state, setState] = useState<ScrollState>({ isScrolled: false, progress: 0 })

  useEffect(() => {
    let frame = 0

    const measure = () => {
      const scrolled = window.scrollY
      const scrollable = document.documentElement.scrollHeight - window.innerHeight

      setState({
        isScrolled: scrolled > threshold,
        progress: scrollable > 0 ? Math.min(scrolled / scrollable, 1) : 0,
      })
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [threshold])

  return state
}
