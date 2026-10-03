// Lumen Labs — desktop wallpaper generator
// Pure-vector composition. Text is traced to paths from the real brand fonts
// (static instances cut at the exact weights the site uses) so it renders
// identically regardless of installed system fonts.
//
// Palette & type system taken verbatim from src/styles/index.css and the mark
// geometry from src/components/brand/Logo.tsx (the live site).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONTS = path.join(__dirname, 'fonts')
const OUT = path.join(__dirname, 'out')
fs.mkdirSync(OUT, { recursive: true })

// ---- Brand tokens (verbatim from src/styles/index.css) ----------------------
const C = {
  ink: '#06080a',
  graphite: '#0a0d11',
  surface: '#10141a',
  text: '#f3f2ee',
  muted: '#98a1ac',
  faint: '#6c747f',
  accent: '#e9b978',
  accentDeep: '#c8964c',
  steel: '#a9c8d8',
}

const W = 3840
const H = 2160

// ---- Font loading (static instances => correct metrics) ---------------------
function load(file) {
  const b = fs.readFileSync(path.join(FONTS, file))
  const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
  const f = opentype.parse(ab)
  if (!f || !f.unitsPerEm) throw new Error('Failed to load font: ' + file)
  return f
}
const fonts = {
  heroDisplay: load('SpaceGrotesk-SemiBold.ttf'), // headline, weight 600 (site display)
  wordmark: load('SpaceGrotesk-Medium500.ttf'), // lockup wordmark
  body: load('Manrope-Medium.ttf'), // supporting line (weight 500)
  mono: load('JetBrainsMono-Regular.ttf'),
  monoMed: load('JetBrainsMono-Medium.ttf'),
}
console.log('Fonts loaded OK')

function measure(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm
  let w = 0
  const glyphs = font.stringToGlyphs(text)
  for (let i = 0; i < glyphs.length; i++) {
    w += glyphs[i].advanceWidth * scale
    if (i < glyphs.length - 1) w += tracking
  }
  return w
}

function textPath(font, text, { x = 0, y = 0, size, tracking = 0, align = 'left' } = {}) {
  const scale = size / font.unitsPerEm
  const total = measure(font, text, size, tracking)
  let penX = x
  if (align === 'center') penX = x - total / 2
  if (align === 'right') penX = x - total
  const glyphs = font.stringToGlyphs(text)
  let d = ''
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i]
    d += g.getPath(penX, y, size).toPathData(3) + ' '
    penX += g.advanceWidth * scale + tracking
  }
  return { d, width: total }
}

const parts = []
const P = (s) => parts.push(s)

P(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`)

// ---- defs ----
P(`<defs>`)
P(`<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#0b0f14"/>
     <stop offset="0.44" stop-color="${C.graphite}"/>
     <stop offset="1" stop-color="${C.ink}"/>
   </linearGradient>`)
// Soft depth lift behind the headline, left of centre.
P(`<radialGradient id="lift" cx="0.3" cy="0.52" r="0.6">
     <stop offset="0" stop-color="#141b24" stop-opacity="0.85"/>
     <stop offset="0.55" stop-color="#0d1218" stop-opacity="0.42"/>
     <stop offset="1" stop-color="#0d1218" stop-opacity="0"/>
   </radialGradient>`)
// Barely-there amber warmth, upper-right only.
P(`<radialGradient id="warm" cx="0.78" cy="0.14" r="0.5">
     <stop offset="0" stop-color="${C.accent}" stop-opacity="0.045"/>
     <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
   </radialGradient>`)
P(`<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
     <stop offset="1" stop-color="#000000" stop-opacity="0.4"/>
   </linearGradient>`)
P(`<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
     <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/>
   </filter>`)
P(`<radialGradient id="isoFade" cx="0.92" cy="0.06" r="0.72">
     <stop offset="0" stop-color="#fff" stop-opacity="1"/>
     <stop offset="0.55" stop-color="#fff" stop-opacity="0.45"/>
     <stop offset="1" stop-color="#fff" stop-opacity="0"/>
   </radialGradient>
   <mask id="isoMask"><rect width="${W}" height="${H}" fill="url(#isoFade)"/></mask>`)
P(`</defs>`)

// ---- background stack ----
P(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#lift)"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#warm)"/>`)

// ---- isometric drafting field, upper-right only ----
const line = 'rgba(243,242,238,0.05)'
const line2 = 'rgba(243,242,238,0.095)'
const amberLine = 'rgba(233,185,120,0.20)'
{
  const iso = []
  const ox = 2680, oy = -160
  const step = 104
  const tan30 = Math.tan((30 * Math.PI) / 180)
  const len = 1500
  for (let i = -6; i < 32; i++) {
    const sx = ox + i * step
    iso.push(`<line x1="${sx}" y1="${oy}" x2="${(sx + len).toFixed(1)}" y2="${(oy + len * tan30).toFixed(1)}"/>`)
  }
  for (let i = -2; i < 28; i++) {
    const sx = ox + i * step
    iso.push(`<line x1="${sx}" y1="${oy}" x2="${(sx + len).toFixed(1)}" y2="${(oy - len * tan30).toFixed(1)}"/>`)
  }
  P(`<g stroke="${line}" stroke-width="1.6" fill="none" mask="url(#isoMask)">${iso.join('')}</g>`)
  // one module picked out in a single faint amber hairline
  const a1 = ox + 11 * step
  const a2 = ox + 15 * step
  P(`<g stroke="${amberLine}" stroke-width="1.8" fill="none" mask="url(#isoMask)">
       <line x1="${a1}" y1="${oy}" x2="${(a1 + 820).toFixed(1)}" y2="${(oy + 820 * tan30).toFixed(1)}"/>
       <line x1="${a2}" y1="${oy}" x2="${(a2 + 820).toFixed(1)}" y2="${(oy + 820 * tan30).toFixed(1)}"/>
     </g>`)
}

// ---- content column geometry ----
const LEFT = 320

// ---- title block: mark + wordmark + mono tag ----
const markSize = 104
const markX = LEFT
const markY = 300
const sc = markSize / 28
const m = (v) => +(v * sc).toFixed(2)
P(`<g transform="translate(${markX} ${markY})">
     <rect x="${m(0.5)}" y="${m(0.5)}" width="${m(27)}" height="${m(27)}" rx="${m(6)}"
           fill="none" stroke="${C.text}" stroke-opacity="0.2" stroke-width="${m(1.1)}"/>
     <path d="M${m(8)} ${m(7)}h${m(3.1)}v${m(10.9)}H${m(20)}V${m(21)}H${m(8)}V${m(7)}Z" fill="${C.text}"/>
     <path d="M${m(14.4)} ${m(7)}H${m(20)}v${m(3.1)}h${m(-5.6)}V${m(7)}Z" fill="${C.accent}"/>
   </g>`)
{
  const size = 66
  const bx = markX + markSize + 40
  const by = markY + markSize * 0.5 + size * 0.35
  const { d } = textPath(fonts.wordmark, 'Lumen Labs', { x: bx, y: by, size, tracking: -size * 0.03 })
  P(`<path d="${d}" fill-rule="nonzero" fill="${C.text}"/>`)
}
{
  const size = 22
  const { d } = textPath(fonts.mono, 'STUDIO · EST. 2026', { x: markX + 4, y: markY + markSize + 50, size, tracking: 7 })
  P(`<path d="${d}" fill-rule="nonzero" fill="${C.muted}" fill-opacity="0.7"/>`)
}

// ---- signal-path hairline, upper band (well above the icon zone) ----
{
  const sigY = 580
  P(`<line x1="${LEFT}" y1="${sigY}" x2="2320" y2="${sigY}" stroke="${line2}" stroke-width="1.6"/>`)
  P(`<line x1="${LEFT}" y1="${sigY}" x2="${LEFT + 640}" y2="${sigY}" stroke="${amberLine}" stroke-width="1.6"/>`)
  P(`<circle cx="${LEFT + 640}" cy="${sigY}" r="5.5" fill="${C.accent}" fill-opacity="0.85"/>`)
  P(`<circle cx="${LEFT + 640}" cy="${sigY}" r="13" fill="none" stroke="${C.accent}" stroke-opacity="0.26" stroke-width="1.4"/>`)
}

// ---- hero headline: LUMEN LABS ----
const heroBaseline = 1180
{
  const size = 380
  const tracking = -size * 0.03
  const { d, width } = textPath(fonts.heroDisplay, 'LUMEN LABS', { x: LEFT - 4, y: heroBaseline, size, tracking })
  P(`<path d="${d}" fill-rule="nonzero" fill="${C.text}"/>`)
  globalThis.__heroW = width
}

// ---- supporting line with amber index tick ----
const supY = heroBaseline + 150
P(`<rect x="${LEFT}" y="${supY - 50}" width="4" height="66" rx="1" fill="${C.accent}" fill-opacity="0.9"/>`)
{
  const size = 74
  const { d } = textPath(fonts.body, 'Building Ideas Into Technology', { x: LEFT + 42, y: supY, size, tracking: size * 0.004 })
  P(`<path d="${d}" fill-rule="nonzero" fill="${C.muted}"/>`)
}

// ---- secondary mono line (very faint) ----
{
  const size = 28
  const { d } = textPath(fonts.monoMed, 'SOFTWARE   ·   INFRASTRUCTURE   ·   TECHNOLOGY', { x: LEFT + 44, y: supY + 106, size, tracking: 9 })
  P(`<path d="${d}" fill-rule="nonzero" fill="${C.faint}" fill-opacity="0.85"/>`)
}

// ---- engineering title-block footer, far bottom-right ----
{
  const size = 21
  const rx = W - 300
  const topY = H - 230
  const w = 520
  // divider + short amber tab
  P(`<line x1="${rx - w}" y1="${topY}" x2="${rx}" y2="${topY}" stroke="${line2}" stroke-width="1.4"/>`)
  P(`<rect x="${rx - w}" y="${topY - 1.5}" width="64" height="3" fill="${C.accent}" fill-opacity="0.8"/>`)
  const rows = ['LUMEN LABS (PTY) LTD', 'BUILD · DEPLOY · SUPPORT', 'GRAPHITE / AMBER — 01']
  rows.forEach((t, i) => {
    const { d } = textPath(fonts.mono, t, { x: rx, y: topY + 44 + i * 38, size, tracking: 5, align: 'right' })
    P(`<path d="${d}" fill-rule="nonzero" fill="${i === 0 ? C.muted : C.faint}" fill-opacity="${i === 0 ? 0.82 : 0.65}"/>`)
  })
}

// ---- grain + floor vignette ----
P(`<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.026"/>`)
P(`<rect width="${W}" height="${H}" fill="url(#floor)"/>`)

P(`</svg>`)

const svg = parts.join('\n')
fs.writeFileSync(path.join(OUT, 'lumen-labs-wallpaper.svg'), svg)
console.log('hero width px:', Math.round(globalThis.__heroW), '/ canvas', W)
console.log('SVG written', (svg.length / 1024).toFixed(1), 'KB')

async function raster(w, h, name) {
  await sharp(Buffer.from(svg)).resize(w, h).png({ compressionLevel: 9 }).toFile(path.join(OUT, name))
  console.log('wrote', name)
}
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'lumen-labs-wallpaper-3840x2160.png'))
console.log('wrote 4K')
await raster(2560, 1440, 'lumen-labs-wallpaper-2560x1440.png')
await raster(1920, 1080, 'lumen-labs-wallpaper-1920x1080.png')
await raster(1600, 900, 'preview.png')
console.log('DONE')
