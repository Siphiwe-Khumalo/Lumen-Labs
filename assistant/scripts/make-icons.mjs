// Renders public/icons/icon.svg to the PNG sizes the web app manifest needs.
// Usage: node scripts/make-icons.mjs   (needs Playwright + Chromium available)
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const { chromium } = createRequire(import.meta.url)('playwright')

const svg = await readFile(new URL('../public/icons/icon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage()

async function render(size, file, padding = 0) {
  await page.setViewportSize({ width: size, height: size })
  const inner = size - padding * 2
  await page.setContent(
    `<html><body style="margin:0;background:#05070a;display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`,
  )
  await writeFile(
    new URL(`../public/icons/${file}`, import.meta.url),
    await page.screenshot(),
  )
}

await render(192, 'icon-192.png')
await render(512, 'icon-512.png')
// Maskable: keep the ring inside Android's safe zone (inner 80%).
await render(512, 'maskable-512.png', 52)
await browser.close()
console.log('icons written')
