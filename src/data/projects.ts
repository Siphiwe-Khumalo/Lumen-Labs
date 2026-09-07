import type { Project } from '../types/content'
import arcGlasshouse from '../assets/projects/arc-glasshouse-reference.jpg'
import ingcebo from '../assets/projects/ingcebo-reference.jpg'
import spartcon from '../assets/projects/spartcon-reference.jpg'

export const projects: Project[] = [
  {
    title: 'ARC Glasshouse',
    category: 'Industrial / SCADA interface',
    summary:
      'A technical interface project for an industrial environment, represented with an editorial control-room photograph until an approved project capture is available.',
    contribution:
      'Interface design and frontend development. Project details and approved capture to be added.',
    image: arcGlasshouse,
    imageAlt: 'Real photograph of a control room with multiple monitoring screens',
    imageNote: 'Editorial reference image',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/group-of-men-with-face-masks-using-computers-10003920/',
  },
  {
    title: 'Ingcebo Enhle Tax and Business Solutions',
    category: 'Business website',
    summary:
      'A professional web presence for a business services organisation, represented with a real workspace photograph until the final project capture is supplied.',
    contribution:
      'Website design and frontend development. Project details to be confirmed.',
    image: ingcebo,
    imageAlt:
      'Real photograph of a laptop and monitor displaying website interfaces on a desk',
    imageNote: 'Editorial reference image',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/a-desk-with-a-laptop-and-monitor-displaying-websites-15555858/',
  },
  {
    title: 'Spartcon Technologies',
    category: 'Digital presence',
    summary:
      'A digital presence for a technology-focused business, represented with a real architectural photograph until approved project imagery is available.',
    contribution:
      'Digital presence and frontend development. Project details to be confirmed.',
    image: spartcon,
    imageAlt:
      'Real photograph of a striking industrial brutalist building and antenna structure',
    imageNote: 'Editorial reference image',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/industrial-brutalist-architecture-19923926/',
  },
]
