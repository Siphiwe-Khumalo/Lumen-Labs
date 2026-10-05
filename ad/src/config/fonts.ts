// Vendored WOFF2 @font-face definitions, loaded locally with zero network
// (DESIGN §5.5). The three family names match config/typography.ts FONT.

import { staticFile } from 'remotion'
import { FONT } from './typography'

interface FontFace {
  family: string
  file: string
}

const FACES: FontFace[] = [
  { family: FONT.display, file: 'fonts/space-grotesk-latin-wght-normal.woff2' },
  { family: FONT.body, file: 'fonts/manrope-latin-wght-normal.woff2' },
  { family: FONT.mono, file: 'fonts/jetbrains-mono-latin-wght-normal.woff2' },
]

/** CSS string with one @font-face per vendored variable font. */
export function fontFaceCss(): string {
  return FACES.map(
    (f) => `@font-face {
  font-family: '${f.family}';
  src: url('${staticFile(f.file)}') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}`,
  ).join('\n')
}
