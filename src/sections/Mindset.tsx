import { ShieldCheck } from 'lucide-react'
import engineerNetwork from '../assets/media/engineer-network.jpg'
import { Container } from '../components/layout/Container'
import { LinkButton } from '../components/ui/Button'
import { SectionLabel } from '../components/ui/SectionLabel'
import { mindsetPrinciples } from '../data/mindset'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

/**
 * Full-bleed photographic band. This is where the site says plainly that the
 * work is judged on whether it holds up, not on how it looks in a screenshot.
 */
export function Mindset() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="mindset" id="mindset" aria-labelledby="mindset-title">
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
        <div className="mindset-inner" ref={revealRef}>
          <div className="mindset-copy" data-reveal>
            <SectionLabel>Engineering mindset / 06</SectionLabel>
            <h2 className="section-title" id="mindset-title">
              Looking good is the easy half.
            </h2>
            <p className="lead">
              A polished interface over an unreliable system is a liability. The parts
              that decide whether a build survives contact with real use are mostly
              invisible.
            </p>
            <p className="mindset-note">
              <ShieldCheck aria-hidden="true" />
              Every project is treated as something another developer will inherit.
            </p>
            <div className="mindset-action">
              <LinkButton href="#contact" variant="secondary" showArrow>
                Discuss a technical build
              </LinkButton>
            </div>
          </div>

          <div className="glass mindset-panel" data-reveal style={stagger(1)}>
            <ul className="mindset-list">
              {mindsetPrinciples.map((principle, index) => (
                <li key={principle.title} data-reveal style={stagger(index)}>
                  <span className="mono mindset-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{principle.title}</h3>
                    <p>{principle.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
