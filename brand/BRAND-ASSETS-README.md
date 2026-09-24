# Lumen Labs — Business Stationery Pack

A complete, print-ready and digital-ready set of Lumen Labs business
stationery, built from the **exact brand system already live on the Lumen
Labs website** (colours, fonts, mark, tagline, and voice) — nothing here is a
new or reinvented identity.

## What's inside

```
00-Logo-Assets/          The brand mark and lockup, traced 1:1 from the live site
01-Letterhead/           Lumen-Labs-Letterhead.docx
02-Invoice-Template/     Lumen-Labs-Invoice-Template.docx
03-Quotation-Template/   Lumen-Labs-Quotation-Template.docx
04-Business-Card/        Print-ready PDFs, front + back, with a bleed/guide version
05-Email-Signature/      A single flat PNG signature, ready to insert
```

## Brand source (why everything looks the way it does)

Every colour, font, and piece of copy below was pulled directly from the
Lumen Labs repository rather than approximated:

| Element | Source in the website repo |
|---|---|
| Colours | `src/styles/index.css` `:root` — ink `#06080a`, surface `#10141a`, text `#f3f2ee`, muted `#98a1ac`, accent gold `#e9b978`, deep gold `#c8964c`, steel `#a9c8d8` |
| Fonts | Space Grotesk (display/headings), Manrope (body), JetBrains Mono (labels/metadata) — same three-typeface system as the site |
| Mark | `src/components/brand/Logo.tsx` (`BrandMark`) — the mark that actually renders in the site's live header and footer today |
| Tagline | "Built with intention." (`Hero.tsx`) |
| Strapline | "Websites. Applications. Interfaces." (`Hero.tsx`) |

### About the mark — please read

The `BrandMark` component's own code comment describes it as a **"Temporary
mark ... kept isolated so the final Lumen Labs logo can replace this file
without touching any layout."** It is reproduced here faithfully and exactly
because it is the only mark that exists on the live site today. If a final
logo is designed later, every file in `00-Logo-Assets/` and every document in
this pack can be updated by swapping that one mark — the layouts, colours,
and type system stay the same.

Note also: the repo's `public/favicon.svg` draws a *different*, unused glyph
that does not match `BrandMark`. This pack uses `BrandMark`'s geometry
throughout, since that's the one visitors actually see on the site.

## Business details used throughout

Supplied directly by the client for this pack (2026-09-21):

| Field | Value |
|---|---|
| Founder | Siphiwe Khumalo |
| Title | Founder |
| Email | Lumenlabs.creatives@gmail.com |
| Phone | +27 63 877 6984 |
| Based | South Africa · Remote |
| Website | lumenlabcreatives.spartangroup.co.za *(the site's current canonical domain — update everywhere again if this changes)* |
| Bank | ABSA Bank |
| Account name | Lumen Labs |
| Account number | 9409342038 |

Two banking fields were **not** supplied and were filled from ABSA's own
published, public information rather than invented — replace them if the
actual branch/account setup differs:

- **Branch code `632005`** — ABSA's universal branch code, published by ABSA and multiple banking references.
- **SWIFT/BIC `ABSAZAJJXXX`** — ABSA Bank South Africa's main published SWIFT code (only relevant for international payments).

**VAT / company registration number was not supplied and is not printed
anywhere.** If Lumen Labs is a registered entity, add the registration and/or
VAT number to the invoice and quotation "Payment details" panel before use.

**Payment terms** as supplied: *"Payment due within 7 days of invoice
date."* — printed on the invoice template.

## Using each asset

### Letterhead, Invoice, Quotation (`.docx`)
Fully editable in Word, Google Docs, or LibreOffice. Each has:
- A graphite masthead with the real brand mark + wordmark
- A mono contact strip (email / phone / web / location)
- A thin gold rule, matching the site's hairline-rule language
- Space Grotesk headings, Manrope body copy, JetBrains Mono labels/metadata

Placeholder fields are wrapped in `[brackets]` — search for `[` to find every
field that needs filling in per document (client name, dates, line items,
amounts, etc.).

The invoice and quotation both include: client/recipient details, a document
number, issue/due (or validity) dates, an itemised table with qty/unit
price/amount, a subtotal + total block, a payment-details or
validity-and-acceptance panel, and a terms & notes panel.

### Business card (PDF)
Standard 89×51mm card, 2mm bleed. Two versions of each side:
- `*-front.pdf` / `*-back.pdf` — clean, ready to send to a printer as final art
- `*-front-PRINT.pdf` / `*-back-PRINT.pdf` — same art with trim and safe-margin guide lines visible, for checking layout before removing guides at print time

### Email signature (PNG)
`lumen-labs-email-signature.png` is a single flat image containing the whole
signature — mark, name, title, and contact rows — rendered at high
resolution (3x) so it stays crisp at normal signature display size
(~380–480px wide on screen).

A flat image avoids the two real weaknesses of an HTML signature: email
clients (Outlook especially) strip `<style>` blocks and custom webfonts, and
many block or strip embedded/hosted logo images outright. Because this PNG
is rendered once from the site's actual brand fonts (Space Grotesk, Manrope,
JetBrains Mono) rather than relying on the recipient's client to render
anything, it looks identical everywhere it's inserted, with no separate logo
file or hosted URL to manage.

To install: insert the image directly into your email client's signature
editor (Gmail Settings → Signature → image icon; Outlook → Signatures →
insert picture), then add a `mailto:`/`tel:` hyperlink over it if your
client supports linking an image, since a flat image has no clickable text
underneath.

## Still to confirm before business use

- [ ] Final logo, if the placeholder mark is ever replaced
- [ ] VAT / company registration number, if applicable, added to invoice & quote
- [ ] Bank branch code / SWIFT confirmed directly with ABSA if different from the universal codes used here
- [ ] Domain re-checked against the live site if it changes again (currently `lumenlabcreatives.spartangroup.co.za`)
