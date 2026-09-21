import engineerNetwork from '../assets/media/engineer-network.jpg'
import { Container } from '../components/layout/Container'
import { LinkButton } from '../components/ui/Button'
import { SectionLabel } from '../components/ui/SectionLabel'
import { capabilities } from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

/**
 * Full-bleed photographic band. This is where the site says, plainly, that the
 * studio is comfortable in technical environments as well as marketing ones.
 */
export function Capability() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="capability" id="capability" aria-labelledby="capability-title">
      <div className="capability-media" aria-hidden="true">
        <img
          src={engineerNetwork}
          alt=""
          loading="lazy"
          decoding="async"
          width={1600}
          height={1067}
        />
      </div>

      <Container>
        <div className="capability-inner" ref={revealRef}>
          <div className="capability-copy" data-reveal>
            <SectionLabel>Approach / 03</SectionLabel>
            <h2 className="section-title" id="capability-title">
              Comfortable where the technical work happens.
            </h2>
            <p className="lead">
              Plenty of studios can style a page. Fewer are willing to sit with a control
              system, a data model, or an operator&apos;s workflow until the interface
              actually makes sense.
            </p>
            <div className="mt-8">
              <LinkButton href="#contact" variant="secondary" showArrow>
                Discuss a technical build
              </LinkButton>
            </div>
          </div>

          <div className="glass capability-panel" data-reveal style={stagger(1)}>
            <h3>Where we tend to be useful</h3>
            <ul>
              {capabilities.map((capability) => (
                <li key={capability.number}>
                  <span className="mono">{capability.number}</span>
                  <span>
                    <strong>{capability.title}</strong>
                    {capability.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
