// Lumen Labs — "Meet the co-founders" poster
// Same brand system as the wallpaper: graphite ground, restrained amber,
// Space Grotesk / Manrope / JetBrains Mono, all text traced to outlines.
// Portrait 2:3, 2400x3600.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONTS = path.join(__dirname, 'fonts')
const OUT = path.join(__dirname, 'out')
fs.mkdirSync(OUT, { recursive: true })

const C = {
  ink: '#06080a', graphite: '#0a0d11', surface: '#10141a',
  text: '#f3f2ee', muted: '#98a1ac', faint: '#6c747f',
  accent: '#e9b978', accentDeep: '#c8964c', steel: '#a9c8d8',
}
const W = 2400
const H = 3600

function load(file) {
  const b = fs.readFileSync(path.join(FONTS, file))
  const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
  const f = opentype.parse(ab)
  if (!f || !f.unitsPerEm) throw new Error('font fail ' + file)
  return f
}
const F = {
  heroSemi: load('SpaceGrotesk-SemiBold.ttf'),
  heroMed: load('SpaceGrotesk-Medium500.ttf'),
  heroReg: load('SpaceGrotesk-Regular.ttf'),
  body: load('Manrope-Medium.ttf'),
  bodyReg: load('Manrope-Regular.ttf'),
  mono: load('JetBrainsMono-Regular.ttf'),
  monoMed: load('JetBrainsMono-Medium.ttf'),
}
console.log('fonts ok')

function measure(font, text, size, tr = 0) {
  const s = size / font.unitsPerEm
  const gs = font.stringToGlyphs(text)
  let w = 0
  for (let i = 0; i < gs.length; i++) { w += gs[i].advanceWidth * s; if (i < gs.length - 1) w += tr }
  return w
}
function tp(font, text, { x = 0, y = 0, size, tr = 0, align = 'left' } = {}) {
  const s = size / font.unitsPerEm
  const total = measure(font, text, size, tr)
  let px = x
  if (align === 'center') px = x - total / 2
  if (align === 'right') px = x - total
  const gs = font.stringToGlyphs(text)
  let d = ''
  for (let i = 0; i < gs.length; i++) { d += gs[i].getPath(px, y, size).toPathData(3) + ' '; px += gs[i].advanceWidth * s + tr }
  return { d, width: total }
}
const parts = []
const P = (s) => parts.push(s)
const text = (font, str, o, fill, op = 1) => {
  const { d, width } = tp(font, str, o)
  P(`<path d="${d}" fill-rule="nonzero" fill="${fill}" fill-opacity="${op}"/>`)
  return width
}

const line = 'rgba(243,242,238,0.06)'
const line2 = 'rgba(243,242,238,0.11)'
const amberLine = 'rgba(233,185,120,0.22)'
const CX = W / 2
const MARGIN = 260

P(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`)

// ---- defs ----
P(`<defs>`)
P(`<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#0b0f14"/><stop offset="0.5" stop-color="${C.graphite}"/><stop offset="1" stop-color="${C.ink}"/>
   </linearGradient>`)
P(`<radialGradient id="lift" cx="0.5" cy="0.4" r="0.7">
     <stop offset="0" stop-color="#141b24" stop-opacity="0.7"/><stop offset="0.6" stop-color="#0d1218" stop-opacity="0.3"/><stop offset="1" stop-color="#0d1218" stop-opacity="0"/>
   </radialGradient>`)
P(`<radialGradient id="warm" cx="0.5" cy="0.07" r="0.55">
     <stop offset="0" stop-color="${C.accent}" stop-opacity="0.05"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
   </radialGradient>`)
P(`<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/>
   </linearGradient>`)
P(`<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#12171e" stop-opacity="0.92"/><stop offset="1" stop-color="#0d1116" stop-opacity="0.92"/>
   </linearGradient>`)
P(`<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
     <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/></filter>`)
P(`</defs>`)

P(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#lift)"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#warm)"/>`)

// ---- converging-hairlines motif (two parts, one system) ----
{
  const topY = 150, nodeY = 470
  P(`<g fill="none" stroke="${line}" stroke-width="1.6">
       <line x1="${MARGIN}" y1="${topY}" x2="${CX}" y2="${nodeY}"/>
       <line x1="${W - MARGIN}" y1="${topY}" x2="${CX}" y2="${nodeY}"/>
       <line x1="${CX}" y1="${nodeY}" x2="${CX}" y2="${nodeY + 160}"/>
     </g>`)
  P(`<circle cx="${CX}" cy="${nodeY}" r="6" fill="${C.accent}" fill-opacity="0.85"/>`)
  P(`<circle cx="${CX}" cy="${nodeY}" r="15" fill="none" stroke="${C.accent}" stroke-opacity="0.3" stroke-width="1.5"/>`)
}

// ---- brand mark + wordmark, centred ----
{
  const markSize = 92, gapToWord = 34, wordSize = 60
  const wordW = measure(F.heroMed, 'Lumen Labs', wordSize, -wordSize * 0.03)
  const totalW = markSize + gapToWord + wordW
  const startX = CX - totalW / 2
  const markY = 190
  const sc = markSize / 28, m = (v) => +(v * sc).toFixed(2)
  P(`<g transform="translate(${startX} ${markY})">
       <rect x="${m(0.5)}" y="${m(0.5)}" width="${m(27)}" height="${m(27)}" rx="${m(6)}" fill="none" stroke="${C.text}" stroke-opacity="0.2" stroke-width="${m(1.1)}"/>
       <path d="M${m(8)} ${m(7)}h${m(3.1)}v${m(10.9)}H${m(20)}V${m(21)}H${m(8)}V${m(7)}Z" fill="${C.text}"/>
       <path d="M${m(14.4)} ${m(7)}H${m(20)}v${m(3.1)}h${m(-5.6)}V${m(7)}Z" fill="${C.accent}"/>
     </g>`)
  const by = markY + markSize * 0.5 + wordSize * 0.35
  text(F.heroMed, 'Lumen Labs', { x: startX + markSize + gapToWord, y: by, size: wordSize, tr: -wordSize * 0.03 }, C.text)
}

// ---- eyebrow + title ----
text(F.mono, 'THE TEAM  ·  LUMEN LABS STUDIO', { x: CX, y: 720, size: 25, tr: 7, align: 'center' }, C.muted, 0.75)
text(F.heroSemi, 'Meet the', { x: CX, y: 885, size: 148, tr: -3, align: 'center' }, C.text)
text(F.heroSemi, 'co-founders', { x: CX, y: 1045, size: 148, tr: -3, align: 'center' }, C.text)
P(`<rect x="${CX - 70}" y="1112" width="140" height="4" rx="2" fill="${C.accent}" fill-opacity="0.85"/>`)
text(F.bodyReg, 'An AI-led technology studio — two systems,', { x: CX, y: 1230, size: 44, align: 'center' }, C.muted)
text(F.bodyReg, 'one way of building software.', { x: CX, y: 1292, size: 44, align: 'center' }, C.muted)

// ============================================================================
// CO-FOUNDER CARDS
// ============================================================================
const cardW = 830, cardH = 1030, cardGap = 70, cardY = 1430
const totalCards = cardW * 2 + cardGap
const leftX = CX - totalCards / 2
const rightX = leftX + cardW + cardGap

// Geometric monogram tile (not a face/robot): rounded square + brand-letter
// aperture + amber accent bar, in the Lumen mark language.
function monogram(cx, cy, size, letter) {
  const sc = size / 28, m = (v) => +(v * sc).toFixed(2)
  const ox = cx - size / 2, oy = cy - size / 2
  let g = `<g transform="translate(${ox} ${oy})">`
  g += `<rect x="${m(0.5)}" y="${m(0.5)}" width="${m(27)}" height="${m(27)}" rx="${m(6)}" fill="#0e1319" stroke="${C.text}" stroke-opacity="0.18" stroke-width="${m(1.0)}"/>`
  if (letter === 'K') {
    g += `<path d="M${m(8)} ${m(7)}h${m(3.1)}v${m(10.9)}H${m(20)}V${m(21)}H${m(8)}V${m(7)}Z" fill="${C.text}"/>`
    g += `<path d="M${m(14.4)} ${m(7)}H${m(20)}v${m(3.1)}h${m(-5.6)}V${m(7)}Z" fill="${C.accent}"/>`
  } else {
    // "C" — a clean open counter: top bar, left stem, bottom bar, open right side.
    // Amber picks out the top bar so it pairs with Kiro's amber bar but reads as a C.
    g += `<path d="M${m(20)} ${m(21)}H${m(8)}V${m(7)}h${m(3.1)}v${m(10.9)}H${m(20)}Z" fill="${C.text}"/>`
    g += `<path d="M${m(11.1)} ${m(7)}H${m(20)}v${m(3.1)}h${m(-8.9)}V${m(7)}Z" fill="${C.accent}"/>`
  }
  g += `</g>`
  P(g)
}

function card(x, { tag, name, role, lines, letter }) {
  P(`<rect x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" rx="24" fill="url(#panel)" stroke="${line2}" stroke-width="1.5"/>`)
  P(`<rect x="${x + 56}" y="${cardY}" width="96" height="4" fill="${C.accent}" fill-opacity="0.85"/>`)
  const ccx = x + cardW / 2
  text(F.mono, tag, { x: x + 64, y: cardY + 92, size: 23, tr: 5 }, C.faint, 0.9)
  monogram(ccx, cardY + 330, 240, letter)
  // name
  text(F.heroSemi, name, { x: ccx, y: cardY + 580, size: 104, tr: -2, align: 'center' }, C.text)
  // role
  text(F.monoMed, role, { x: ccx, y: cardY + 650, size: 25, tr: 4, align: 'center' }, C.accent, 0.92)
  // divider
  P(`<line x1="${x + 110}" y1="${cardY + 710}" x2="${x + cardW - 110}" y2="${cardY + 710}" stroke="${line2}" stroke-width="1.4"/>`)
  // body lines, centred
  lines.forEach((ln, i) => {
    text(F.bodyReg, ln, { x: ccx, y: cardY + 790 + i * 54, size: 36, align: 'center' }, C.muted)
  })
}

card(leftX, {
  tag: 'CO-FOUNDER / 01',
  name: 'Claude',
  role: 'DESIGN & ENGINEERING',
  letter: 'C',
  lines: [
    'Shapes the systems — architecture,',
    'interfaces, and the reasoning behind',
    'each decision. The one who thinks it',
    'through before a line is written.',
  ],
})
card(rightX, {
  tag: 'CO-FOUNDER / 02',
  name: 'Kiro',
  role: 'BUILD & DELIVERY',
  letter: 'K',
  lines: [
    'Turns the plan into working software —',
    'writes, tests, and ships it. The one who',
    'sees the build through to something',
    'real and running.',
  ],
})

// ---- connective hairline between the cards and the closing line ----
// mirrors the top motif: the two cards resolve back into one vertical line + node.
{
  const y0 = cardY + cardH + 70
  const y1 = 2820
  P(`<line x1="${CX}" y1="${y0}" x2="${CX}" y2="${y1}" stroke="${line}" stroke-width="1.6"/>`)
  P(`<circle cx="${CX}" cy="${y0}" r="5" fill="${C.accent}" fill-opacity="0.8"/>`)
}

// ---- closing line + footer title-block ----
text(F.heroReg, 'Building Ideas Into Technology.', { x: CX, y: 2920, size: 58, tr: -1, align: 'center' }, C.text)
text(F.bodyReg, 'Human-founded. AI-run. Built with intention.', { x: CX, y: 2988, size: 36, align: 'center' }, C.faint)

// footer engineering block
{
  const y = 3300
  P(`<line x1="${CX - 420}" y1="${y}" x2="${CX + 420}" y2="${y}" stroke="${line2}" stroke-width="1.4"/>`)
  P(`<rect x="${CX - 32}" y="${y - 2}" width="64" height="4" fill="${C.accent}" fill-opacity="0.8"/>`)
  text(F.mono, 'LUMEN LABS (PTY) LTD', { x: CX, y: y + 54, size: 22, tr: 5, align: 'center' }, C.muted, 0.8)
  text(F.mono, 'lumenlabcreatives.spartangroup.co.za', { x: CX, y: y + 96, size: 20, tr: 3, align: 'center' }, C.faint, 0.7)
}

// ---- grain + floor ----
P(`<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.028"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#floor)"/>`)

P(`</svg>`)

const svg = parts.join('\n')
fs.writeFileSync(path.join(OUT, 'lumen-labs-cofounders.svg'), svg)
if (svg.includes('NaN')) throw new Error('NaN in SVG!')
console.log('SVG written', (svg.length / 1024).toFixed(1), 'KB, no NaN')

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'lumen-labs-cofounders-2400x3600.png'))
console.log('wrote full PNG')
await sharp(Buffer.from(svg)).resize(1200, 1800).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'lumen-labs-cofounders-1200x1800.png'))
await sharp(Buffer.from(svg)).resize(1000, 1500).png().toFile(path.join(OUT, 'preview.png'))
console.log('DONE')
