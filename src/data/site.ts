import type { Capability, MetaItem, NavItem, Principle } from '../types/content'

export const navigation: NavItem[] = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Approach', href: '#capability' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const heroMeta: MetaItem[] = [
  { label: 'Based in', value: 'South Africa' },
  { label: 'Focus', value: 'Web, apps, interfaces' },
  { label: 'You work with', value: 'The developer directly' },
]

/**
 * Marquee wording is limited to tools this studio genuinely works with and
 * capabilities described in the brief. No claims beyond that.
 */
export const marqueeItems: string[] = [
  'React',
  'TypeScript',
  'Design systems',
  'Dashboards',
  'SCADA interfaces',
  'Accessibility',
  'Performance',
  'Web applications',
  'Digital identity',
]

export const capabilities: Capability[] = [
  {
    number: '01',
    title: 'Industrial interfaces',
    description:
      'Experience with SCADA-related interface work, where an operator needs the right information without hunting for it.',
  },
  {
    number: '02',
    title: 'Dashboards and internal tools',
    description:
      'Data-dense screens built to stay legible as the amount of information grows.',
  },
  {
    number: '03',
    title: 'Business-facing web',
    description:
      'Marketing sites and digital presences that hold up next to much larger companies.',
  },
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
