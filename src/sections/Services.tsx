import { ArrowUpRight } from 'lucide-react'
import { services } from '../data/services'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'

export function Services() {
  return (
    <section
      className="section services-section"
      id="services"
      aria-labelledby="services-title"
    >
      <Container>
        <div className="section-heading-row services-heading">
          <div>
            <SectionLabel>What we build / 03</SectionLabel>
            <h2 id="services-title">The right amount of technology.</h2>
          </div>
          <p className="section-intro">
            Focused capabilities for businesses that want a sharper digital presence, a
            more useful tool, or both.
          </p>
        </div>
        <div className="services-list">
          {services.map((service) => (
            <article className="service-row" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div className="service-main">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul className="service-details">
                {service.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <ArrowUpRight aria-hidden="true" className="service-arrow" />
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
