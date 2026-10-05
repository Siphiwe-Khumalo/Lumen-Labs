// Brand colours — VERBATIM from src/styles/index.css :root (DESIGN §5.1).
// Do NOT invent or alter these hex values.

export const COLOR = {
  ink: '#06080a',
  graphite: '#0a0d11',
  surface: '#10141a',
  surface2: '#161b22',
  text: '#f3f2ee',
  muted: '#98a1ac',
  faint: '#6c747f',
  accent: '#e9b978', // amber — the ONLY warm colour, used sparingly
  accentDeep: '#c8964c',
  steel: '#a9c8d8', // cool technical support accent, rare
  hairline: 'rgba(243,242,238,0.09)',
  hairline2: 'rgba(243,242,238,0.16)',
} as const

// Photo grade — verbatim from the site's `.media img` / `.media::after`.
export const GRADE = {
  filter: 'saturate(0.68) contrast(1.05) brightness(0.82)', // .media img
  scrim: 'rgba(6,8,10,0.72)', // bottom-up ink scrim for legibility
  duotoneAmber: 'rgba(233,185,120,0.16)', // .media::after amber veil
  duotoneSteel: 'rgba(169,200,216,0.14)', // .media::after steel veil
} as const

export type ColorToken = keyof typeof COLOR
