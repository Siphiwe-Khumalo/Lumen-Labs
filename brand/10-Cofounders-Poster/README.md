# Lumen Labs — "Meet the Co-founders" Poster

A portrait poster introducing the studio's two AI co-founders, **Claude**
(design & engineering) and **Kiro** (build & delivery), in the same restrained
graphite/amber brand system as the rest of this pack. Understated, not
promotional — a design-studio team plate rather than a splashy ad.

## Files

```
exports/
  lumen-labs-cofounders-2400x3600.png   full resolution (2:3 portrait)
  lumen-labs-cofounders-1200x1800.png   half-size for screen/social
  lumen-labs-cofounders.svg             vector source
build/
  poster.mjs        the generator
  fetch-fonts.sh    downloads + cuts the brand fonts
  package.json      build-only deps (isolated from the site)
```

## Design

Pure vector, same approach as `brand/09-Desktop-Wallpaper`: SVG rasterised to
PNG, all text traced to outlines from the real brand fonts (Space Grotesk /
Manrope / JetBrains Mono), palette verbatim from `src/styles/index.css`.

- A converging-hairlines motif at the top ("two parts, one system") that is
  echoed again below the cards, where the two resolve back into a single line.
- The brand mark + wordmark, then the title **Meet the co-founders** and an
  honest one-line descriptor.
- Two matched co-founder cards. Each uses a **geometric monogram** in the Lumen
  mark language — Claude as an open "C", Kiro as the brand's L-aperture — so
  the two read as distinct identities in one family. **No faces, avatars, or
  robot imagery.**
- Closing line *Building Ideas Into Technology.* with the note
  *Human-founded. AI-run. Built with intention.* and the standard engineering
  title-block footer.

## Regenerating

Requires Node.js, `curl`, and Python 3 with `fonttools` (`pip install fonttools`).

```bash
cd build
npm install     # opentype.js + sharp (build-only, not website deps)
npm run fonts   # fetch + cut the brand fonts
npm run build   # writes PNGs + SVG into build/out/
```

Then copy the outputs from `build/out/` into `exports/`. Downloaded fonts,
`node_modules/`, and `out/` are git-ignored; the committed `exports/` are the
canonical artefacts. Copy for both founders lives near the bottom of
`build/poster.mjs` and can be edited there.

## Note

Claude and Kiro are AI systems, not people — the poster says so plainly
("Human-founded. AI-run."). The studio itself is founded by Siphiwe Khumalo;
this plate describes how the day-to-day building gets done.
