# Content replacement checklist

The homepage is ready to ship with honest, clearly identified editorial imagery. These are the remaining inputs that should be replaced when the business has approved them.

- **Project imagery:** replace the three real editorial reference photos in `src/assets/projects/` with approved screenshots or captures from the named projects. Keep the source/credit fields in `src/data/projects.ts` accurate and remove the editorial label only when the replacement is genuine project work.
- **Project facts:** confirm context, problem, scope, contribution, URLs, and any client-approved wording in `src/data/projects.ts`.
- **Branding:** replace the temporary mark in `src/components/brand/Logo.tsx`, then update `public/favicon.svg` and `public/og-image.svg`.
- **Domain and SEO:** the current canonical URL is `https://siphiwe-khumalo.github.io/Lumen-Labs/`. Update `index.html`, `public/robots.txt`, and `public/sitemap.xml` if a custom domain is configured.
- **Form delivery:** GitHub Pages is static. Set `VITE_FORM_ENDPOINT` to a real HTTPS form endpoint before relying on the enquiry form in production.

No unsupported business results, client quotes, user numbers, or testimonials are included.
