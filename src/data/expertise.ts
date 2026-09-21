import type { ExpertiseCluster } from '../types/content'
import software from '../assets/media/service-applications.jpg'
import infrastructure from '../assets/media/datacenter-monitor.jpg'
import control from '../assets/media/control-panel.jpg'

/**
 * Twelve disciplines grouped into three clusters. Grouping keeps the range
 * legible — a flat list of twelve cards reads as padding rather than capability.
 */
export const expertiseClusters: ExpertiseCluster[] = [
  {
    id: 'software',
    number: '01',
    title: 'Software & interfaces',
    summary:
      'Where the work is written: applications, integrations, and the screens people actually use.',
    image: software,
    imageAlt: 'Application markup and styles open in a dark code editor',
    domains: [
      {
        name: 'Software development',
        description:
          'Custom applications shaped around a real workflow instead of a generic template.',
      },
      {
        name: 'Web applications & PWAs',
        description:
          'Installable, offline-tolerant web apps that behave like software rather than a brochure.',
      },
      {
        name: 'System integration',
        description:
          'Getting separate systems to exchange data so nobody re-types the same information twice.',
      },
      {
        name: 'IoT & smart systems',
        description:
          'Connecting sensors and devices, then giving the readings somewhere useful to go.',
      },
    ],
  },
  {
    id: 'infrastructure',
    number: '02',
    title: 'Infrastructure & operations',
    summary:
      'The layer underneath: networks, machines, tenancy, and the support that keeps them running.',
    image: infrastructure,
    imageAlt: 'Server racks and structured cabling behind a monitor in a data centre',
    domains: [
      {
        name: 'IT & technical support',
        description:
          'Day-to-day support that looks for the cause rather than clearing the symptom again.',
      },
      {
        name: 'Networking & infrastructure',
        description:
          'Wired and wireless networks that stay predictable as more devices arrive.',
      },
      {
        name: 'Cloud & Microsoft 365',
        description:
          'Tenant setup, mailbox and file migration, and the permissions nobody wants to inherit.',
      },
      {
        name: 'Hardware & business technology',
        description:
          'Specifying, deploying, and maintaining the equipment a business depends on daily.',
      },
    ],
  },
  {
    id: 'control',
    number: '03',
    title: 'Control, security & comms',
    summary:
      'Plant, premises, and people: control logic, hardening, surveillance, and voice.',
    image: control,
    imageAlt:
      'Technician working inside a control cabinet of wired terminal blocks and I/O modules',
    domains: [
      {
        name: 'Automation & industrial automation',
        description:
          'Control logic and operator interfaces for plant, process, and facility environments.',
      },
      {
        name: 'Cybersecurity',
        description:
          'Practical hardening: access control, patching, backups, and knowing what is exposed.',
      },
      {
        name: 'CCTV & security systems',
        description:
          'Camera coverage and recording that is genuinely reviewable after something happens.',
      },
      {
        name: 'VoIP & communications',
        description:
          'Voice and messaging that works the same from the office, a home desk, or a phone.',
      },
    ],
  },
]
