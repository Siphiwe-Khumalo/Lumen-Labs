# Content replacement checklist

These are the known v1 placeholders. They are intentionally explicit rather than invented.

- **Project imagery:** replace the three files in `src/assets/projects/` with approved screenshots or captures. Keep the same data references or update only `src/data/projects.ts`.
- **Project facts:** confirm context, problem, scope, contribution, URLs, and any client-approved wording in `src/data/projects.ts`.
- **Branding:** replace the temporary mark in `src/components/brand/Logo.tsx`, then update `public/favicon.svg` and `public/og-image.svg`.
- **Domain and SEO:** replace `lumenlabs.example` in `index.html`, `public/robots.txt`, and `public/sitemap.xml`.
- **Form delivery:** connect `StartProject.tsx` to Netlify Forms or the selected provider. The current success state is local-only and intentionally does not claim delivery.
