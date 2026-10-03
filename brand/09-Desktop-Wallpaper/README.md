# Lumen Labs — Desktop Wallpaper

A premium 16:9 desktop wallpaper for a developer / IT workstation, built from
the **exact Lumen Labs brand system already live on the site** — the same
graphite palette, amber accent, three-typeface system, and brand mark used
everywhere else in this repo. Nothing here is a new or reinvented identity.

## Files

```
exports/
  lumen-labs-wallpaper-3840x2160.png   4K UHD   (recommended)
  lumen-labs-wallpaper-2560x1440.png   QHD
  lumen-labs-wallpaper-1920x1080.png   Full HD
  lumen-labs-wallpaper.svg             vector source (resolution-independent)
build/
  build.mjs                            the generator
  fetch-fonts.sh                       downloads + cuts the brand fonts
  package.json                         build-only deps (isolated from the site)
```

Set it on Windows: right-click the PNG → **Set as desktop background**, fit
set to **Fill**. Pick the export that matches your display's resolution.

## How it's built

The wallpaper is **pure vector**. Every element — background, linework, the
brand mark, and all text — is generated as SVG and rasterised to PNG, so it is
sharp at any resolution and contains no photographic or AI-generated imagery.

All text is **traced to outlines** from the real brand fonts rather than set as
`<text>`, so it renders identically everywhere, independent of installed system
fonts.

### Brand sources (why it looks the way it does)

| Element | Source in this repo |
|---|---|
| Colours | `src/styles/index.css` `:root` — ink `#06080a`, graphite `#0a0d11`, surface `#10141a`, text `#f3f2ee`, muted `#98a1ac`, faint `#6c747f`, accent `#e9b978`, deep gold `#c8964c`, steel `#a9c8d8` |
| Fonts | Space Grotesk (display), Manrope (body), JetBrains Mono (labels/metadata) — the same three-typeface system as the site |
| Mark | `src/components/brand/Logo.tsx` (`BrandMark`) — the L-aperture glyph with the amber bar, drawn vector-exact from the component's own geometry |

### Composition

- Cool graphite vertical gradient with a soft off-centre depth lift and a very
  faint amber warmth confined to the upper-right. Fine procedural grain keeps
  the gradient from banding.
- A restrained isometric drafting field top-right (engineering-drawing feel,
  **not** a circuit board), masked so it fades before it reaches the centre.
  One module is picked out in a single faint amber hairline.
- A single thin "signal-path" rule with one amber node in the upper band.
- Top-left title block: brand mark + `Lumen Labs` wordmark + a JetBrains Mono
  reference tag.
- Headline `LUMEN LABS` (Space Grotesk 600), the supporting line
  `Building Ideas Into Technology` (Manrope, with a small amber index tick),
  and a faint `SOFTWARE · INFRASTRUCTURE · TECHNOLOGY` mono line.
- A small engineering title-block in the far bottom-right corner.

The **centre and lower-middle are deliberately left clear** so desktop icons
stay readable, with generous negative space throughout.

## Regenerating

Requires Node.js, `curl`, and Python 3 with `fonttools` (`pip install fonttools`).

```bash
cd build
npm install        # opentype.js + sharp (build-only; not website deps)
npm run fonts      # fetch Space Grotesk / Manrope / JetBrains Mono and cut static weights
npm run build      # writes PNGs + SVG into build/out/
```

Then copy the outputs from `build/out/` into `exports/`. The downloaded fonts,
`node_modules/`, and `out/` are git-ignored; the committed `exports/` are the
canonical artefacts.

To tweak the design, edit the tokens and layout constants at the top of
`build/build.mjs` (canvas size, margins, type sizes, accent opacity).

## Notes on the brand mark

As documented across this brand pack, `BrandMark` is described in its own
source as a **temporary** mark. This wallpaper reproduces it faithfully because
it is the mark currently live on the site. If a final logo is designed later,
update the mark geometry near the top of `build.mjs` and regenerate — the
palette, type system, and layout stay the same.
