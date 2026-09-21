import { ArrowDown, Radio } from 'lucide-react'
import serverRoom from '../assets/media/infrastructure-servers.jpg'
import { Container } from '../components/layout/Container'
import { LinkButton } from '../components/ui/Button'
import { heroMeta } from '../data/site'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

export function Hero() {
  const revealRef = useReveal<HTMLDivElement>()
  const glow = usePointerGlow<HTMLDivElement>()

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true">
        <div className="grid-wash" />
        <div className="liquid">
          <span />
          <span />
        </div>
      </div>

      <Container>
        <div className="hero-grid-layout" ref={revealRef}>
          <div className="hero-copy">
            <p className="hero-eyebrow mono" data-reveal style={stagger(0)}>
              <span className="pulse-dot" aria-hidden="true" />
              Digital development studio
            </p>

            <h1 className="hero-title" id="hero-title" data-reveal style={stagger(1)}>
              <span>Websites.</span>
              <span className="title-accent">Applications.</span>
              <span>Interfaces.</span>
              <span className="title-muted">Built with intention.</span>
            </h1>

            <p className="lead hero-lead" data-reveal style={stagger(2)}>
              Lumen Labs is a small studio building clear, capable digital work — from
              business websites to the technical interfaces behind them.
            </p>

            <div className="hero-actions" data-reveal style={stagger(3)}>
              <LinkButton href="#contact" showArrow>
                Start a project
              </LinkButton>
              <LinkButton href="#work" variant="text" showArrow>
                View our work
              </LinkButton>
            </div>

            <dl className="hero-meta" data-reveal style={stagger(4)}>
              {heroMeta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero-visual" data-reveal style={stagger(2)}>
            <div className="media media-hoverable spotlight" {...glow}>
              <img
                src={serverRoom}
                alt="Racked servers and patch cabling inside a working data centre"
                width={1800}
                height={1200}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="hero-scan" aria-hidden="true" />

            <p className="glass hero-badge">
              <Radio aria-hidden="true" />
              <span className="mono">Systems &amp; interfaces</span>
            </p>

            <figure className="glass hero-readout">
              <div className="hero-readout-head">
                <span className="mono">Studio focus</span>
                <span className="mono">03</span>
              </div>
              <ul>
                <li>
                  <span>Frontend craft</span>
                  <span>Design + build</span>
                </li>
                <li>
                  <span>Technical interfaces</span>
                  <span>Dashboards, SCADA</span>
                </li>
                <li>
                  <span>Engagement</span>
                  <span>Direct, small team</span>
                </li>
              </ul>
            </figure>
          </div>
        </div>

        <a className="link-quiet hero-scroll" href="#work">
          <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          Scroll to selected work
        </a>
      </Container>
    </section>
  )
}
