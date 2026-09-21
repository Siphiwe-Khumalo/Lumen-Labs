import { ArrowUpRight } from 'lucide-react'
import studioNight from '../assets/media/studio-night.jpg'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { principles } from '../data/site'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'

export function WhyLumen() {
  const revealRef = useReveal<HTMLDivElement>()
  const glow = usePointerGlow<HTMLDivElement>()

  return (
    <section className="section" id="about" aria-labelledby="why-title">
      <Container>
        <div ref={revealRef}>
          <div className="why-layout">
            <div data-reveal>
              <SectionLabel>Why Lumen / 07</SectionLabel>
              <h2 className="section-title mt-6" id="why-title">
                Small enough to care. Technical enough to build.
              </h2>
              <div className="why-copy">
                <p className="why-statement">
                  Lumen sits between the limits of a template and the overhead of a{' '}
                  <em>large agency</em>.
                </p>
                <p>
                  You work directly with a developer who cares about the details: how an
                  interface feels, how a system holds together, and how the finished thing
                  behaves once real people are using it.
                </p>
                <p>
                  That means fewer handovers, clearer decisions, and work that stays
                  maintainable after launch.
                </p>
                <a className="inline-link mt-2 justify-self-start" href="#contact">
                  Start a conversation
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="why-visual" data-reveal style={stagger(1)}>
              <div className="media media-hoverable spotlight" {...glow}>
                <img
                  src={studioNight}
                  alt="A developer reviewing code on a monitor in a darkened room"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1067}
                />
              </div>
              <p className="glass why-caption">Late-stage review — the part that shows</p>
            </div>
          </div>

          <div className="principles">
            {principles.map((principle, index) => (
              <article
                className="panel principle"
                key={principle.number}
                data-reveal
                style={stagger(index)}
              >
                <p className="principle-index mono">
                  {principle.number}
                  <ArrowUpRight aria-hidden="true" />
                </p>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
