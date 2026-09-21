export type NavItem = {
  label: string
  href: string
}

export type MetaItem = {
  label: string
  value: string
}

/** One discipline inside an expertise cluster. */
export type ExpertiseDomain = {
  name: string
  description: string
}

export type ExpertiseCluster = {
  id: string
  number: string
  title: string
  summary: string
  image: string
  imageAlt: string
  domains: ExpertiseDomain[]
}

export type Solution = {
  number: string
  title: string
  description: string
  /** Layout hint for the bento composition. */
  variant?: 'text' | 'photo' | 'diagram'
  image?: string
  imageAlt?: string
}

export type CaseStudy = {
  id: string
  title: string
  category: string
  context: string
  problem: string
  approach: string
  technology: string[]
  solution: string
  outcome: string
  image: string
  imageAlt: string
  /** Set while the image is an editorial stand-in rather than real project work. */
  imageNote: string
  imageSourceName: string
  imageSourceUrl: string
}

export type StackGroup = {
  number: string
  title: string
  items: string[]
}

export type ProtocolRow = {
  label: string
  value: string
}

export type ProcessStep = {
  number: string
  title: string
  summary: string
  detail: string
}

export type MindsetPrinciple = {
  title: string
  description: string
}

export type Principle = {
  number: string
  title: string
  description: string
}

export type EngagementOption = {
  title: string
  description: string
  action: string
  href: string
}
