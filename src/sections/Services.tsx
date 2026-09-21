import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { services } from '../data/services'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'
import type { Service } from '../types/content'

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const glow = usePointerGlow<HTMLElement>()

  return (
    <article
      className="glass service-card spotlight"
      data-reveal
      style={stagger(index)}
      {...glow}
    >
      <div className="service-media">
        <div className="media media-hoverable">
          <img
            src={service.image}
            alt={service.imageAlt}
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="service-number mono">{service.number}</p>
      </div>

      <div className="service-body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <ul className="service-details">
          {service.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function Services() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="rules" aria-hidden="true">
        <span />
        <span />
      </div>

      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>What we build / 02</SectionLabel>
              <h2 className="section-title" id="services-title">
                The right amount of technology.
              </h2>
            </div>
            <p className="lead">
              Three focused offerings. Enough to cover a serious digital presence and the
              tools behind it, without pretending to be everything at once.
            </p>
          </header>

          <div className="services-grid">
            {services.map((service, index) => (
              <ServiceCard key={service.number} service={service} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
