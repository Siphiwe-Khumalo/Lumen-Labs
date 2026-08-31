import { useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { LinkButton } from '../components/ui/Button'
import { SectionLabel } from '../components/ui/SectionLabel'

function HeroLight() {
  const [position, setPosition] = useState({ x: 50, y: 50 })

  return (
    <div
      className="hero-visual"
      aria-hidden="true"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        setPosition({
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100,
        })
      }}
    >
      <div className="hero-visual-grid" />
      <div
        className="hero-light"
        style={
          {
            '--light-x': `${position.x}%`,
            '--light-y': `${position.y}%`,
          } as React.CSSProperties
        }
      />
      <div className="hero-visual-core" />
      <div className="hero-visual-caption">
        <span>Focus / 01</span>
        <span>Light finds a way</span>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <Container className="hero-layout">
        <div className="hero-copy">
          <SectionLabel>Digital development studio / South Africa</SectionLabel>
          <h1 id="hero-title">
            Websites. <em>Applications.</em> Interfaces.
            <span>Built with intention.</span>
          </h1>
          <p className="hero-description">
            Lumen Labs builds clear, capable digital experiences for businesses that need
            more than a generic template.
          </p>
          <div className="hero-actions">
            <LinkButton href="#contact" showArrow>
              Start a project
            </LinkButton>
            <LinkButton href="#work" variant="text" showArrow>
              View our work
            </LinkButton>
          </div>
        </div>
        <HeroLight />
        <a className="hero-scroll-hint" href="#work">
          <ArrowDown aria-hidden="true" className="h-4 w-4" />
          <span>Scroll to explore</span>
        </a>
      </Container>
      <div className="hero-rule" />
      <div className="hero-meta container-shell">
        <span>01 / 05</span>
        <span>Websites · Applications · Interfaces</span>
        <a href="#work" aria-label="Jump to selected work">
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
