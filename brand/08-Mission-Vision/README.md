# Lumen Labs — Mission & Vision Graphic

A single-page **Mission & Vision** brand asset for **Lumen Labs (Pty) Ltd**,
exported as a high-resolution PNG for digital sharing, proposals, the company
profile, website, and print.

## Output

- `Lumen-Labs-Mission-Vision.png` — **4000 × 2828 px** (A4-landscape ratio,
  rendered at 2.5× device scale). Suitable for on-screen use and future print.

## Design brief it satisfies

- Credible, mature, technical, understated — a technology company that
  understands business, **not** a creative/marketing/design agency or a
  generic AI startup.
- Dark graphite/charcoal surfaces with the Lumen Labs amber accent.
- Hierarchy built from typography, spacing, hairline rules, and the accent —
  **no** neon gradients, glows, glassmorphism, 3D objects, robots,
  circuit-board clichés, stock photography, or buzzword graphics.
- Full, verbatim Mission and Vision statements, kept readable (not shrunk to
  force-fit), presented as two visually distinct blocks within one system.

## Brand sources (nothing reinvented)

Everything is pulled 1:1 from the live site / repo brand system:

| Element | Source |
|---|---|
| Colours | `src/styles/index.css` `:root` — ink `#06080a`, graphite `#0a0d11`, surface `#10141a`, text `#f3f2ee`, muted `#98a1ac`, faint `#6c747f`, accent `#e9b978`, accent-deep `#c8964c`, steel `#a9c8d8`, hairlines `rgba(243,242,238,0.09–0.16)` |
| Fonts | Space Grotesk (display), Manrope (body), JetBrains Mono (labels) — the site's three-typeface system |
| Logo | `brand/00-Logo-Assets/lumen-labs-mark-on-dark.svg` (the live `BrandMark`), used exactly — not recreated, recoloured, or distorted |
| Tagline | "Built with intention." (`Hero.tsx`) |

## How it was built / regenerate

The PNG is rendered from a self-contained HTML file via headless Chromium
(Playwright), with the brand fonts embedded so the render is deterministic.

```bash
cd build
npm install @fontsource/space-grotesk @fontsource/manrope @fontsource/jetbrains-mono playwright
npx playwright install chromium
# regenerate the embedded-font stylesheet (fonts.css), then:
node render.js
```

`build/node_modules`, `build/package-lock.json`, and the generated
`build/fonts.css` are git-ignored; `build/mission-vision.html` and
`build/render.js` are the committed source.
