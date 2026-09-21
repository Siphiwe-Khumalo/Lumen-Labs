import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { processSteps } from '../data/process'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

/**
 * Six steps on a rail. The rail fill is a single CSS transition triggered when
 * the track reveals, which reads as scroll-linked without attaching a scroll
 * listener to a decorative element.
 */
export function Process() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section
      className="section process-section"
      id="process"
      aria-labelledby="process-title"
    >
      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>How we work / 05</SectionLabel>
              <h2 className="section-title" id="process-title">
                From an idea, a system, or a problem.
              </h2>
            </div>
            <p className="lead">
              Lumen Labs can start from a blank page, an existing system that needs
              extending, or infrastructure that is quietly costing you time. The route
              through is the same.
            </p>
          </header>

          <div className="process-track" data-reveal>
            <div className="process-rail" aria-hidden="true">
              <span className="process-rail-fill" />
            </div>

            <ol className="process-steps">
              {processSteps.map((step, index) => (
                <li
                  className="process-step"
                  key={step.number}
                  data-reveal
                  style={stagger(index)}
                >
                  <span className="process-node" aria-hidden="true" />
                  <span className="mono process-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p className="process-summary">{step.summary}</p>
                  <p className="process-detail">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  )
}
