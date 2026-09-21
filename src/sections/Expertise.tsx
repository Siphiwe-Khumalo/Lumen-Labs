import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { expertiseClusters } from '../data/expertise'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { cn } from '../lib/cn'
import { stagger } from '../lib/reveal'

/**
 * Twelve disciplines would read as filler in a flat grid, so they are grouped
 * into three clusters behind a vertical tablist. On narrow screens the same
 * markup restacks: the tabs sit above the panel rather than beside it.
 */
export function Expertise() {
  const revealRef = useReveal<HTMLDivElement>()
  const glow = usePointerGlow<HTMLDivElement>()
  const [activeId, setActiveId] = useState(expertiseClusters[0].id)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const activeIndex = expertiseClusters.findIndex((cluster) => cluster.id === activeId)
  const active = expertiseClusters[activeIndex] ?? expertiseClusters[0]

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight'
    const back = event.key === 'ArrowUp' || event.key === 'ArrowLeft'
    if (!forward && !back) return

    event.preventDefault()
    const total = expertiseClusters.length
    const nextIndex = (activeIndex + (forward ? 1 : -1) + total) % total
    const next = expertiseClusters[nextIndex]
    setActiveId(next.id)
    tabRefs.current[next.id]?.focus()
  }

  return (
    <section
      className="section expertise-section"
      id="expertise"
      aria-labelledby="expertise-title"
    >
      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>Technical expertise / 01</SectionLabel>
              <h2 className="section-title" id="expertise-title">
                Twelve disciplines, one point of contact.
              </h2>
            </div>
            <p className="lead">
              Lumen Labs works across software, infrastructure, and control systems. That
              range is the point: most technical problems do not stay neatly inside one of
              them.
            </p>
          </header>

          <div className="expertise-layout" data-reveal>
            <div
              className="expertise-tabs"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Areas of expertise"
            >
              {expertiseClusters.map((cluster) => {
                const selected = cluster.id === activeId
                return (
                  <button
                    key={cluster.id}
                    ref={(node) => {
                      tabRefs.current[cluster.id] = node
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${cluster.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${cluster.id}`}
                    tabIndex={selected ? 0 : -1}
                    className={cn('expertise-tab', selected && 'is-active')}
                    onClick={() => setActiveId(cluster.id)}
                    onKeyDown={onKeyDown}
                  >
                    <span className="mono expertise-tab-number">{cluster.number}</span>
                    <span className="expertise-tab-title">{cluster.title}</span>
                    <span className="expertise-tab-count mono">
                      {cluster.domains.length}
                    </span>
                  </button>
                )
              })}

              <p className="expertise-hint mono">Use arrow keys to move between areas</p>
            </div>

            <div
              className="expertise-panel"
              role="tabpanel"
              id={`panel-${active.id}`}
              aria-labelledby={`tab-${active.id}`}
              tabIndex={0}
              key={active.id}
            >
              <div className="expertise-media">
                <div className="media media-hoverable spotlight" {...glow}>
                  <img
                    src={active.image}
                    alt={active.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="expertise-media-label mono">
                  <span>{active.number}</span>
                  <span>{active.title}</span>
                </p>
              </div>

              <p className="expertise-summary">{active.summary}</p>

              <ul className="expertise-domains">
                {active.domains.map((domain, index) => (
                  <li key={domain.name} data-reveal style={stagger(index)}>
                    <h3>{domain.name}</h3>
                    <p>{domain.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
