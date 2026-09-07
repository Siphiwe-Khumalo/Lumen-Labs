import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects'
import { Container } from '../components/layout/Container'
import { SectionLabel } from '../components/ui/SectionLabel'

export function SelectedWork() {
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <Container>
        <div className="section-heading-row">
          <div>
            <SectionLabel>Selected work / 02</SectionLabel>
            <h2 id="work-title">A closer look at what we build.</h2>
          </div>
          <p className="section-intro">
            A selection of business-facing and technical interface work. The images are
            real editorial references, clearly credited until approved project captures
            are available.
          </p>
        </div>
        <div className="work-grid">
          {projects.map((project, index) => (
            <article
              className={
                index === 0 ? 'project-card project-card-featured' : 'project-card'
              }
              key={project.title}
            >
              <div className="project-image-wrap">
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {project.imageNote && (
                  <span className="image-note-badge">{project.imageNote}</span>
                )}
              </div>
              <div className="project-card-body">
                <div>
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                </div>
                <ArrowUpRight aria-hidden="true" className="project-arrow" />
                <p className="project-summary">{project.summary}</p>
                <p className="project-contribution">{project.contribution}</p>
                <a
                  className="project-source"
                  href={project.imageSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Image source: {project.imageSourceName}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
