import { ArrowUpRight } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { caseStudies } from '../data/caseStudies'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'
import type { CaseStudy } from '../types/content'

function CaseStudyEntry({ study, index }: { study: CaseStudy; index: number }) {
  const glow = usePointerGlow<HTMLDivElement>()
  const position = String(index + 1).padStart(2, '0')
  const total = String(caseStudies.length).padStart(2, '0')

  return (
    <article className="case" data-reveal>
      <div className="case-media">
        <div className="media media-hoverable spotlight" {...glow}>
          <img
            src={study.image}
            alt={study.imageAlt}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <p className="project-index">
          <span>{position}</span>
          <span aria-hidden="true">/</span>
          <span>{total}</span>
        </p>
        {study.imageNote && <p className="image-note">{study.imageNote}</p>}
      </div>

      <div className="case-body">
        <header className="case-head">
          <p className="project-category">{study.category}</p>
          <h3 className="project-title">{study.title}</h3>
          <p className="case-context mono">{study.context}</p>
        </header>

        <dl className="case-fields">
          <div className="case-field">
            <dt className="mono">Problem</dt>
            <dd>{study.problem}</dd>
          </div>
          <div className="case-field">
            <dt className="mono">Approach</dt>
            <dd>{study.approach}</dd>
          </div>
          <div className="case-field">
            <dt className="mono">Solution</dt>
            <dd>{study.solution}</dd>
          </div>
          <div className="case-field case-field-outcome">
            <dt className="mono">Outcome</dt>
            <dd>{study.outcome}</dd>
          </div>
        </dl>

        <div className="case-tech">
          <p className="mono case-tech-label">Technology</p>
          <ul>
            {study.technology.map((item, techIndex) => (
              <li key={item} className="mono" data-reveal style={stagger(techIndex)}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          className="link-quiet case-source"
          href={study.imageSourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Image source: {study.imageSourceName}
          <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
        </a>
      </div>
    </article>
  )
}

export function CaseStudies() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>Case studies / 03</SectionLabel>
              <h2 className="section-title" id="work-title">
                Problems, and what was actually done about them.
              </h2>
            </div>
            <p className="lead">
              Five projects, written the way an engineer would describe them: the problem,
              the approach, the technology, and what changed.
            </p>
          </header>

          {/* Stated plainly so the write-ups are never mistaken for signed-off,
              measured results. */}
          <p className="case-disclosure glass" data-reveal>
            <span className="mono">Note</span>
            Write-ups are drafted from project scope and are pending client sign-off. No
            performance figures, revenue claims, or testimonials are presented. Imagery is
            credited editorial photography until approved project captures are supplied.
          </p>

          <div className="case-list">
            {caseStudies.map((study, index) => (
              <CaseStudyEntry key={study.id} study={study} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
