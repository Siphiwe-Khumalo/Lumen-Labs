import type { EngagementOption, MetaItem, NavItem, Principle } from '../types/content'

export const navigation: NavItem[] = [
  { label: 'Expertise', href: '#expertise' },
  { label: 'Build', href: '#solutions' },
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const heroMeta: MetaItem[] = [
  { label: 'Based in', value: 'South Africa' },
  { label: 'Disciplines', value: 'Software, infrastructure, control' },
  { label: 'You work with', value: 'The engineer directly' },
]

/**
 * Marquee wording is limited to tools, protocols, and disciplines this studio
 * genuinely works with. No claims beyond that.
 */
export const marqueeItems: string[] = [
  'React',
  'TypeScript',
  'Networking',
  'Microsoft 365',
  'SCADA',
  'Modbus',
  'Cybersecurity',
  'Dashboards',
  'IoT',
  'VoIP',
  'Automation',
  'Cloud',
  'Linux',
  'Accessibility',
]

export const principles: Principle[] = [
  {
    number: '01',
    title: 'Craft matters',
    description:
      'Strong structure and considered details make digital work easier to trust.',
  },
  {
    number: '02',
    title: 'Technical clarity',
    description:
      'Build what is useful, keep it understandable, and avoid complexity for its own sake.',
  },
  {
    number: '03',
    title: 'Direct collaboration',
    description:
      'A focused working relationship keeps decisions clear and momentum practical.',
  },
]

export const engagementOptions: EngagementOption[] = [
  {
    title: 'Start a project',
    description: 'You know roughly what needs building and want it scoped properly.',
    action: 'New build',
    href: '#contact',
  },
  {
    title: 'Discuss a problem',
    description:
      'Something is unreliable, manual, or disconnected and needs diagnosing first.',
    action: 'Diagnosis',
    href: '#contact',
  },
  {
    title: 'Get in touch',
    description: 'A question, a second opinion, or an introduction for later.',
    action: 'General',
    href: '#contact',
  },
]
