import type { Project } from '../types/content'
import arcGlasshouse from '../assets/projects/arc-glasshouse-placeholder.svg'
import ingcebo from '../assets/projects/ingcebo-placeholder.svg'
import spartcon from '../assets/projects/spartcon-placeholder.svg'

export const projects: Project[] = [
  {
    title: 'ARC Glasshouse',
    category: 'Industrial / SCADA interface',
    summary:
      'A technical interface project for an industrial environment, presented here with a replaceable visual placeholder.',
    contribution:
      'Interface design and frontend development. Project details and approved capture to be added.',
    image: arcGlasshouse,
    imageAlt: 'Placeholder visual for the ARC Glasshouse industrial interface project',
    placeholder: true,
  },
  {
    title: 'Ingcebo Enhle Tax and Business Solutions',
    category: 'Business website',
    summary:
      'A professional web presence for a business services organisation, with the final project capture still to be supplied.',
    contribution:
      'Website design and frontend development. Project details to be confirmed.',
    image: ingcebo,
    imageAlt: 'Placeholder visual for the Ingcebo Enhle business website project',
    placeholder: true,
  },
  {
    title: 'Spartcon Technologies',
    category: 'Digital presence',
    summary:
      'A digital presence for a technology-focused business, shown with a clearly marked placeholder until approved imagery is available.',
    contribution:
      'Digital presence and frontend development. Project details to be confirmed.',
    image: spartcon,
    imageAlt: 'Placeholder visual for the Spartcon Technologies digital presence project',
    placeholder: true,
  },
]
