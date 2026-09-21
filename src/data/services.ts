import type { Service } from '../types/content'
import websites from '../assets/media/service-websites.jpg'
import applications from '../assets/media/service-applications.jpg'
import identity from '../assets/media/service-identity.jpg'

export const services: Service[] = [
  {
    number: '01',
    title: 'Websites',
    description:
      'Professional websites for businesses and organisations that need to be taken seriously online.',
    details: [
      'Strategy and structure',
      'Responsive frontend development',
      'A considered digital presence',
    ],
    image: websites,
    imageAlt: 'Workspace with a laptop and monitors showing website layouts in progress',
  },
  {
    number: '02',
    title: 'Web applications',
    description:
      'Custom platforms, dashboards, internal tools, and digital applications built around how a business actually works.',
    details: [
      'Clear interface systems',
      'Practical technical foundations',
      'Room to grow without overbuilding',
    ],
    image: applications,
    imageAlt: 'Close-up of application markup and styles on a dark editor screen',
  },
  {
    number: '03',
    title: 'Digital identity',
    description:
      'A coherent visual and digital foundation for growing businesses ready to show up with more intention.',
    details: [
      'Digital direction',
      'Web-ready brand expression',
      'A consistent online presence',
    ],
    image: identity,
    imageAlt: 'Colour palette sheets and printed swatches laid out on a studio desk',
  },
]
