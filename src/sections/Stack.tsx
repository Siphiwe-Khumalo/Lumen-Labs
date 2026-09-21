import circuitTexture from '../assets/media/circuit-macro.jpg'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { protocolChain, stackGroups } from '../data/stack'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

/**
 * Deliberately not a logo wall. The groups are typographic, and the readout
 * panel shows how a reading actually travels from equipment to interface.
 */
export function Stack() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="section stack-section" id="stack" aria-labelledby="stack-title">
      <div className="stack-texture" aria-hidden="true">
        <img src={circuitTexture} alt="" loading="lazy" decoding="async" />
      </div>

      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>Technical capabilities / 04</SectionLabel>
              <h2 className="section-title" id="stack-title">
                The tools, and where they sit.
              </h2>
            </div>
            <p className="lead">
              Technology is a means, not a badge. This is what Lumen Labs works with and
              how the layers connect in practice.
            </p>
          </header>

          <div className="stack-layout">
            <div className="stack-groups">
              {stackGroups.map((group, index) => (
                <div
                  className="stack-group"
                  key={group.number}
                  data-reveal
                  style={stagger(index)}
                >
                  <div className="stack-group-head">
                    <span className="mono stack-group-number">{group.number}</span>
                    <h3>{group.title}</h3>
                  </div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item} className="mono">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <figure className="glass readout" data-reveal style={stagger(1)}>
              <figcaption className="readout-head">
                <span className="mono">Signal path</span>
                <span className="mono readout-tag">Reference architecture</span>
              </figcaption>

              <ol className="readout-chain">
                {protocolChain.map((row, index) => (
                  <li key={row.label}>
                    <span className="readout-node" aria-hidden="true">
                      <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="readout-body">
                      <span className="mono readout-label">{row.label}</span>
                      <span className="readout-value">{row.value}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="readout-foot mono">
                Illustrative architecture, not live telemetry
              </p>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  )
}
