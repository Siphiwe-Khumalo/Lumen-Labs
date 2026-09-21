# Lumen Labs

A single-page React + TypeScript site for Lumen Labs — a small digital development studio building websites, web applications, and technical interfaces.

## Run locally

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run format:check
npm run build
```

## Design system

The visual language is meant to read as an engineering studio rather than a SaaS template: a cool graphite foundation, one warm signature accent, sharp corners, hairline rules, and photography graded into the palette.

- **Tokens** live at the top of `src/styles/index.css`. Surfaces are cool graphite (`--ink` → `--surface-3`), with one warm "lumen" accent (`--accent`) for actions and focus, and one cool technical accent (`--steel`) for metadata. Both are used sparingly; no second competing colour.
- **Three materials, used deliberately.** `.panel` is solid and bordered, `.glass` is a blurred surface with a specular top edge, and `.liquid` is a pair of very low-contrast light lobes that drift slowly behind the hero. Glass and liquid appear in a handful of places, not everywhere.
- **Typography** is three families with distinct jobs: Space Grotesk for display, Manrope for body, and JetBrains Mono for metadata, labels, and buttons. The mono is what gives the interface its technical voice; all three are self-hosted through Fontsource with `font-display: swap`.
- **Corners stay sharp** (2–10px) apart from glass panels, and there are no decorative gradients, glowing cards, or floating 3D objects.

### Motion

Movement is handled by three small hooks rather than an animation library:

- `useReveal` — one shared `IntersectionObserver` per section reveals `[data-reveal]` elements once. `stagger(i)` in `src/lib/reveal.ts` sets `--d` for sequencing.
- `usePointerGlow` — writes pointer position to `--px`/`--py` on an animation frame so the highlight is pure CSS. Skipped for coarse pointers.
- `useScrollState` — drives the header's glass treatment and the reading-progress line.

Everything meaningful is disabled under `prefers-reduced-motion`, and the layout is designed to hold up if the luminous effects are removed entirely. Glass surfaces have `@supports` fallbacks because some GPUs silently drop `backdrop-filter`.

## Architecture

```text
src/
├── assets/media/      Editorial photography
├── assets/projects/   Project reference imagery
├── components/        brand/ (replaceable logo), layout/, ui/
├── data/              projects, services, site content
├── hooks/             reveal, pointer glow, scroll state
├── lib/               cn, reveal helpers
├── sections/          Hero, Marquee, SelectedWork, Services, Capability, WhyLumen, StartProject
├── styles/            index.css (tokens, materials, sections)
└── types/             content types
```

- One route with anchor navigation. React Router is intentionally absent until there are real pages.
- Copy and imagery live in `src/data/`; sections handle presentation only.
- `Logo` and `BrandMark` are isolated in `src/components/brand/` so the final logo can replace them without touching layout.
- Vite is pinned to the Vite 7 Rollup/esbuild toolchain rather than the Vite 8 Rolldown toolchain, which avoids the `@rolldown/binding-win32-x64-msvc` native binary that Windows Application Control blocks.

## Deploy

**Render** (primary): `render.yaml` defines a static site that runs `npm ci && npm run build` and publishes `dist/`. Connect the repo in the Render dashboard and it deploys on every push to `main`.

**GitHub Pages** (secondary): GitHub Actions builds and publishes on every push to `main` (`.github/workflows/deploy-pages.yml`), served from:

```text
https://siphiwe-khumalo.github.io/Lumen-Labs/
```

`vite.config.ts` only applies the `/Lumen-Labs/` base inside GitHub Actions; Render and local development both serve from `/`.

## Honesty and remaining inputs

Nothing on the site claims a result that cannot be defended. There are no invented metrics, testimonials, client quotes, or awards.

- **Imagery is real photography from Pexels, not AI-generated.** Sources and licensing are documented in `docs/IMAGE-SOURCES.md`. The project cards are labelled **Editorial reference** and link to their source, so no visitor can mistake them for captures of the named projects.
- **The enquiry form** needs `VITE_FORM_ENDPOINT` (see `.env.example`). GitHub Pages is static, so without an endpoint the form reports a configuration error instead of implying a message was delivered.
- Still to supply: approved project captures and details, the final logo, production contact details, and a custom domain if one is planned. `docs/CONTENT-REPLACEMENTS.md` tracks these.
