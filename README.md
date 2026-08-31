# Lumen Labs v1

A focused, single-page React + TypeScript website for Lumen Labs. The implementation is intentionally small: it explains the studio, shows selected work, describes the three core offerings, communicates the studio's technical/craft balance, and provides a low-friction project enquiry experience.

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run format:check
npm run build
```

## Architecture notes

- The homepage is a single route with semantic anchor navigation. React Router is intentionally not included until multiple real pages exist.
- Project and service content lives in `src/data/`; sections only handle presentation.
- `Logo` and `BrandMark` are isolated in `src/components/brand/` so the temporary mark can be replaced without changing layout components.
- The visual system uses a near-black foundation, warm off-white type, muted secondary text, and a single restrained amber accent (`#E7B56A`). The accent is reserved for actions, focus states, and controlled luminous details.
- Display typography uses Space Grotesk Variable and body/UI typography uses Manrope Variable. Both are self-hosted through Fontsource and loaded with `font-display: swap`.
- The hero light is a CSS/DOM interaction rather than a canvas or WebGL effect, keeping the memorable moment lightweight and optional.
- The enquiry form currently validates locally and shows an honest local success state. It does not claim to send email until a real form provider or endpoint is connected.

## Content and launch replacements

The current website was inspected only as a factual reference. Its unsupported enterprise-scale claims and fictional-looking Finora/TaskFlow case studies were not carried forward.

Before production launch, replace or confirm:

- `https://lumenlabs.example/` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with the real domain.
- The social preview image if the final brand assets change.
- The temporary SVGs in `src/assets/projects/` with approved project screenshots when available.
- Project descriptions and contribution details in `src/data/projects.ts` with client-approved facts.
- Any contact/form endpoint and production contact details.
- The temporary `Logo`/`BrandMark` implementation and `public/favicon.svg` when the new logo is final.

The placeholders are deliberately isolated and labelled in the work section so they are difficult to mistake for approved project captures.
