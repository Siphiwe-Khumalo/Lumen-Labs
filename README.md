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
- The enquiry form currently validates locally and shows an honest local success state. It does not claim to send email until a real form provider or endpoint is connected.
- Vite is pinned to the Vite 7 Rollup/esbuild toolchain instead of the Vite 8 Rolldown toolchain. This avoids installing the `@rolldown/binding-win32-x64-msvc` package that was blocked by Windows Application Control. The React plugin is pinned to the compatible 5.x line.
- Tailwind CSS remains on the existing Tailwind 4 Vite integration. Its platform-specific packages are separate from the reported Rolldown failure; if an organisation blocks all native Node tooling, that would require a separate Tailwind 3/PostCSS migration rather than a security-policy bypass.

## Content and launch replacements

The current website was inspected only as a factual reference. Its unsupported enterprise-scale claims and fictional-looking Finora/TaskFlow case studies were not carried forward.

Before production launch, replace or confirm:

- The current canonical URL is set to the existing Netlify deployment URL. Replace it in `index.html`, `public/robots.txt`, and `public/sitemap.xml` when the final production domain is confirmed.
- The social preview image if the final brand assets change.
- The real editorial reference photographs in `src/assets/projects/` with approved client screenshots when available; image licenses and source links are documented in `docs/IMAGE-SOURCES.md`.
- Project descriptions and contribution details in `src/data/projects.ts` with client-approved facts.
- Any contact/form endpoint and production contact details.
- The temporary `Logo`/`BrandMark` implementation and `public/favicon.svg` when the new logo is final.

The current project imagery is real photography from Pexels, clearly labelled as editorial reference imagery. It is not presented as client evidence. The homepage is ready to ship as a polished v1, but approved project captures, final branding, production contact details, and a final domain remain content inputs rather than facts that can be safely invented.
