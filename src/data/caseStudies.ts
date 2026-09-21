import type { CaseStudy } from '../types/content'
import arcGlasshouse from '../assets/projects/arc-glasshouse-reference.jpg'
import safetyApp from '../assets/media/mobile-blank.jpg'
import ingcebo from '../assets/projects/ingcebo-reference.jpg'
import spartcon from '../assets/projects/spartcon-reference.jpg'
import serviceDesk from '../assets/media/it-support.jpg'

/**
 * Written as engineering case studies: problem, approach, technology, solution,
 * outcome. Outcomes describe what the build achieves, never invented figures —
 * no percentages, revenue, or user counts appear anywhere in this file.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: 'arc-glasshouse',
    title: 'ARC Glasshouse',
    category: 'Industrial automation / SCADA interface',
    context: 'Controlled-environment horticulture',
    problem:
      'Growing conditions inside a glasshouse are controlled by equipment that reports in its own language. Reading the true state of the house meant checking several places and trusting memory for anything historical.',
    approach:
      'Map what an operator needs to decide, then design backwards from that decision. Group readings by zone rather than by the device that happens to produce them, and make abnormal values obvious without requiring interpretation.',
    technology: [
      'SCADA',
      'Industrial controllers',
      'Modbus',
      'Web interface',
      'Charting',
    ],
    solution:
      'An operator interface presenting live zone conditions, equipment state, and recent history on one screen, with alarm states surfaced rather than buried in a log.',
    outcome:
      'Condition and equipment state can be read at a glance instead of assembled from separate sources, and historical behaviour is available without exporting anything.',
    image: arcGlasshouse,
    imageAlt: 'Operators monitoring an industrial control room with multiple screens',
    imageNote: 'Editorial reference',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/group-of-men-with-face-masks-using-computers-10003920/',
  },
  {
    id: 'safety-application',
    title: "Women's safety application",
    category: 'Mobile-first web application',
    context: 'Personal safety',
    problem:
      'In a situation where someone feels unsafe, the interface is the obstacle. Anything requiring several taps, a login, or a steady hand is useless at the moment it matters.',
    approach:
      'Design for the worst conditions first: one hand, low light, poor signal, no time. Keep the primary action reachable on the first screen, and treat an unreliable network as the normal case rather than an error state.',
    technology: [
      'Progressive web app',
      'Geolocation',
      'Offline-first storage',
      'Push notifications',
      'REST API',
    ],
    solution:
      'A mobile-first application centred on a single immediate action, with trusted contacts, location sharing, and a layout that stays usable under stress.',
    outcome:
      'The critical action stays one tap from open, and the application degrades gracefully instead of failing when connectivity drops.',
    image: safetyApp,
    imageAlt: 'A hand holding a smartphone with a blank screen at a desk',
    imageNote: 'Editorial reference',
    imageSourceName: 'Pexels',
    imageSourceUrl: 'https://www.pexels.com/photo/smartphone-by-keyboard-17018424/',
  },
  {
    id: 'service-desk',
    title: 'Internal IT service desk',
    category: 'Internal platform / ticketing',
    context: 'Business operations',
    problem:
      'Support requests arriving by message, email, and corridor conversation cannot be prioritised, and recurring faults are impossible to spot because nothing is written down in one place.',
    approach:
      'Give every request a single front door and a status that means the same thing to everyone. Keep the logging step fast enough that people use it instead of routing around it.',
    technology: [
      'Web application',
      'Relational database',
      'Role-based access',
      'Email notifications',
      'Reporting',
    ],
    solution:
      'A ticketing platform with intake, assignment, priority, and history, plus a view that shows what is open and what keeps coming back.',
    outcome:
      'Requests are queued and attributable rather than remembered, and recurring faults become visible in the record instead of anecdotal.',
    image: serviceDesk,
    imageAlt: 'Support technician working at a workstation wearing a headset',
    imageNote: 'Editorial reference',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/a-man-working-using-a-computer-5453819/',
  },
  {
    id: 'ingcebo-enhle',
    title: 'Ingcebo Enhle Tax and Business Solutions',
    category: 'Business website',
    context: 'Professional services',
    problem:
      'A credible financial services practice was difficult to verify online, which puts the burden of proof on every first conversation.',
    approach:
      'Lead with what the practice does and who it serves, in the order a prospective client asks. Keep the structure shallow so nothing important sits three clicks deep.',
    technology: [
      'Responsive frontend',
      'Semantic HTML',
      'Performance budget',
      'SEO foundation',
    ],
    solution:
      'A professional business website presenting services, positioning, and a direct route to contact, built to load quickly on a phone.',
    outcome:
      'The practice reads as established and current, and enquiries begin with fewer basic questions about what it offers.',
    image: ingcebo,
    imageAlt: 'A desk with a laptop and monitor displaying website layouts',
    imageNote: 'Editorial reference',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/a-desk-with-a-laptop-and-monitor-displaying-websites-15555858/',
  },
  {
    id: 'spartcon',
    title: 'Spartcon Technologies',
    category: 'Digital presence',
    context: 'Technology business',
    problem:
      'A technically capable business was presenting itself in a way that understated what it could actually deliver.',
    approach:
      'Establish a digital presence that matches the technical standard of the work, using structure and restraint rather than volume of content.',
    technology: ['Responsive frontend', 'Design system', 'Accessibility', 'Metadata'],
    solution:
      'A considered web presence with a clear capability narrative and a consistent visual system across the site.',
    outcome:
      'The presentation now matches the technical level of the business rather than working against it.',
    image: spartcon,
    imageAlt:
      'A striking industrial building with antenna structures against a clear sky',
    imageNote: 'Editorial reference',
    imageSourceName: 'Pexels',
    imageSourceUrl:
      'https://www.pexels.com/photo/industrial-brutalist-architecture-19923926/',
  },
]
