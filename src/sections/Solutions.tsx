import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { solutions } from '../data/solutions'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { cn } from '../lib/cn'
import { stagger } from '../lib/reveal'
import type { Solution } from '../types/content'

/** Small schematic for the integration tile — drawn rather than photographed. */
function IntegrationDiagram() {
  return (
    <svg
      className="integration-diagram"
      viewBox="0 0 320 150"
      role="img"
      aria-label="Diagram showing three separate systems connecting through a gateway into one interface"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 z" fill="var(--steel)" />
        </marker>
      </defs>

      {[26, 75, 124].map((y, index) => (
        <g key={y}>
          <rect
            x="4"
            y={y - 13}
            width="74"
            height="26"
            rx="3"
            fill="rgba(169,200,216,0.07)"
            stroke="var(--line-2)"
          />
          <text x="41" y={y + 4} textAnchor="middle" className="diagram-text">
            {['Plant', 'Office', 'Cloud'][index]}
          </text>
          <path
            d={`M78 ${y} H118 Q130 ${y} 130 ${y > 75 ? y - 12 : y < 75 ? y + 12 : y} V75`}
            fill="none"
            stroke="var(--line-2)"
          />
        </g>
      ))}

      <path d="M130 75 H166" fill="none" stroke="var(--steel)" markerEnd="url(#arrow)" />
      <rect
        x="168"
        y="58"
        width="66"
        height="34"
        rx="3"
        fill="rgba(233,185,120,0.1)"
        stroke="rgba(233,185,120,0.5)"
      />
      <text
        x="201"
        y="79"
        textAnchor="middle"
        className="diagram-text diagram-text-accent"
      >
        Gateway
      </text>
      <path d="M234 75 H272" fill="none" stroke="var(--steel)" markerEnd="url(#arrow)" />
      <rect
        x="274"
        y="55"
        width="42"
        height="40"
        rx="3"
        fill="rgba(169,200,216,0.07)"
        stroke="var(--line-2)"
      />
      <text x="295" y="79" textAnchor="middle" className="diagram-text">
        UI
      </text>
    </svg>
  )
}

function SolutionTile({ solution, index }: { solution: Solution; index: number }) {
  const glow = usePointerGlow<HTMLElement>()
  const variant = solution.variant ?? 'text'

  return (
    <article
      className={cn('solution-tile', `is-${variant}`, variant === 'text' && 'spotlight')}
      data-reveal
      style={stagger(index % 4)}
      {...(variant === 'text' ? glow : {})}
    >
      {variant === 'photo' && solution.image && (
        <div className="solution-media">
          <div className="media media-hoverable">
            <img
              src={solution.image}
              alt={solution.imageAlt ?? ''}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}

      {variant === 'diagram' && (
        <div className="solution-diagram">
          <IntegrationDiagram />
        </div>
      )}

      <div className="solution-body">
        <p className="mono solution-number">{solution.number}</p>
        <h3>{solution.title}</h3>
        <p className="solution-description">{solution.description}</p>
      </div>
    </article>
  )
}

export function Solutions() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section
      className="section solutions-section"
      id="solutions"
      aria-labelledby="solutions-title"
    >
      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>What we build / 02</SectionLabel>
              <h2 className="section-title" id="solutions-title">
                Systems that do a specific job.
              </h2>
            </div>
            <p className="lead">
              Not products looking for a customer. These are the shapes the work usually
              takes once the actual problem is understood.
            </p>
          </header>

          <div className="solutions-grid">
            {solutions.map((solution, index) => (
              <SolutionTile key={solution.number} solution={solution} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
