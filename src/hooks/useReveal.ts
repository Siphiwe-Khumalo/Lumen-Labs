import { useEffect, useRef } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'

/**
 * Reveals elements once as they scroll into view. A single observer is shared by
 * every `[data-reveal]` descendant so a section with many staggered children
 * does not create many observers. Elements are unobserved after revealing, and
 * everything is revealed immediately when the user prefers reduced motion.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const targets = [
      ...(root.matches(REVEAL_SELECTOR) ? [root] : []),
      ...root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    ]

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return containerRef
}
