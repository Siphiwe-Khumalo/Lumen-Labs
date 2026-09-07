import { ArrowUpRight } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'

export function WhyLumen() {
  return (
    <section className="section why-section" id="about" aria-labelledby="why-title">
      <Container>
        <div className="why-layout">
          <div>
            <SectionLabel>Why Lumen / 04</SectionLabel>
            <h2 id="why-title">Small enough to care. Technical enough to build.</h2>
          </div>
          <div className="why-copy">
            <p className="why-lead">
              Lumen sits between the limits of a template and the overhead of a large
              agency.
            </p>
            <p>
              You work directly with a developer who cares about the details: how an
              interface feels, how a system holds together, and how the final thing works
              in the real world.
            </p>
            <a className="inline-link" href="#contact">
              Start a conversation
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="principles-grid" aria-label="Lumen Labs principles">
          <div className="principle-card">
            <span>01</span>
            <h3>Craft matters</h3>
            <p>
              Strong structure and considered details make digital work easier to trust.
            </p>
          </div>
          <div className="principle-card">
            <span>02</span>
            <h3>Technical clarity</h3>
            <p>
              Build what is useful, keep it understandable, and avoid complexity for its
              own sake.
            </p>
          </div>
          <div className="principle-card">
            <span>03</span>
            <h3>Direct collaboration</h3>
            <p>
              A focused working relationship keeps decisions clear and momentum practical.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
