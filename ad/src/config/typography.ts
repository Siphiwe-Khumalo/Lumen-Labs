// Typography — three families, format-independent scale (DESIGN §5.2).

export const FONT = {
  display: 'Space Grotesk Variable', // headlines + wordmark
  body: 'Manrope Variable', // supporting lines, capability list
  mono: 'JetBrains Mono Variable', // small technical labels
} as const

export type FontRole = keyof typeof FONT

/**
 * Type scale as a function of the short side `S = min(width,height)` so sizes
 * stay optically consistent across all three formats.
 */
// NOTE: hero/display tuned down from the design's first-pass values so the
// longest pre-wrapped lines ("We build the technology", "LUMEN LABS") fit inside
// the vertical safe box (918px wide) without clipping. Still format-relative.
export const typeScale = (S: number) => ({
  hero: S * 0.066, // S01/S02/S05 headline
  display: S * 0.058, // S03/S06 LUMEN LABS wordmark + mark size
  title: S * 0.044, // S04 SectionTitle (longest: "CONTROL + SECURITY")
  body: S * 0.025, // Manrope supporting lines
  list: S * 0.022, // capability list items
  mono: S * 0.014, // JetBrains Mono labels
})

export type TypeScale = ReturnType<typeof typeScale>
