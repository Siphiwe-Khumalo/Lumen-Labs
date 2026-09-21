import { ArrowUpRight } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'
import { projects } from '../data/projects'
import { usePointerGlow } from '../hooks/usePointerGlow'
import { useReveal } from '../hooks/useReveal'
import { stagger } from '../lib/reveal'
import type { Project } from '../types/content'

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const glow = usePointerGlow<HTMLDivElement>()

  return (
    <article className="project" data-reveal style={stagger(index)}>
      <div className="project-media">
        <div className="media media-hoverable spotlight" {...glow}>
          <img
            src={project.image}
            alt={project.imageAlt}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <p className="project-index">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span aria-hidden="true">/</span>
          <span>{String(projects.length).padStart(2, '0')}</span>
        </p>
        {project.imageNote && <p className="image-note">{project.imageNote}</p>}
      </div>

      <div className="project-body">
        <p className="project-category">{project.category}</p>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <div className="project-footnotes">
          <p className="project-contribution">{project.contribution}</p>
          <a
            className="link-quiet project-source"
            href={project.imageSourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Image source: {project.imageSourceName}
            <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  )
}

export function SelectedWork() {
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <Container>
        <div ref={revealRef}>
          <header className="section-head" data-reveal>
            <div>
              <SectionLabel>Selected work / 01</SectionLabel>
              <h2 className="section-title" id="work-title">
                A closer look at what we build.
              </h2>
            </div>
            <p className="lead">
              Business-facing and technical interface work. The visuals below are real
              editorial photographs, credited and labelled, until approved project
              captures are available.
            </p>
          </header>

          <div className="work-list">
            {projects.map((project, index) => (
              <ProjectRow key={project.title} project={project} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
