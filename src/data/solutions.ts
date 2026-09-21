import type { Solution } from '../types/content'
import customerFacing from '../assets/media/service-websites.jpg'

/**
 * The bento composition mixes three tile kinds so the section reads as a
 * designed layout rather than eight identical cards.
 */
export const solutions: Solution[] = [
  {
    number: '01',
    title: 'Business management systems',
    description:
      'Quotes, jobs, stock, and clients in one place, so the operational spine of the business stops living in spreadsheets.',
    variant: 'text',
  },
  {
    number: '02',
    title: 'Customer-facing applications',
    description:
      'Portals, booking, and self-service that answer the questions your phone line keeps answering.',
    variant: 'photo',
    image: customerFacing,
    imageAlt:
      'Desk workspace with a laptop and monitor showing website layouts in progress',
  },
  {
    number: '03',
    title: 'Dashboards',
    description:
      'One screen that answers the question a manager actually asks, instead of five reports that nearly do.',
    variant: 'text',
  },
  {
    number: '04',
    title: 'System integration',
    description:
      'A gateway between the systems you already run, so data moves once and stays consistent.',
    variant: 'diagram',
  },
  {
    number: '05',
    title: 'Automation systems',
    description:
      'Scheduled, triggered, and rule-driven work that no longer needs someone to remember it.',
    variant: 'text',
  },
  {
    number: '06',
    title: 'Monitoring interfaces',
    description: 'Live state, history, and alarms for equipment and infrastructure.',
    variant: 'text',
  },
  {
    number: '07',
    title: 'Internal company platforms',
    description:
      'The tool a team opens first: shared records, roles, and process in one considered interface.',
    variant: 'text',
  },
  {
    number: '08',
    title: 'Digital tools & utilities',
    description:
      'Small, sharp internal tools that remove a recurring manual task for good.',
    variant: 'text',
  },
]
