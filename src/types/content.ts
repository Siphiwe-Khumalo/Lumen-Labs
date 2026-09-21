export type Project = {
  title: string
  category: string
  summary: string
  contribution: string
  image: string
  imageAlt: string
  /** Set while the image is an editorial stand-in rather than real project work. */
  imageNote: string
  imageSourceName: string
  imageSourceUrl: string
}

export type Service = {
  number: string
  title: string
  description: string
  details: string[]
  image: string
  imageAlt: string
}

export type NavItem = {
  label: string
  href: string
}

export type MetaItem = {
  label: string
  value: string
}

export type Capability = {
  number: string
  title: string
  description: string
}

export type Principle = {
  number: string
  title: string
  description: string
}
