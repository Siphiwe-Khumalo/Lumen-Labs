// On-screen copy for the cinematic brand film (CINEMATIC-FILM.md §9).
// This file RE-EXPORTS the verbatim strings from config/copy.ts by reference
// (it never re-literals them) so copy.ts and its snapshot test stay the single
// source of truth. The capability sub-labels are computed joins of the imported
// arrays, so they cannot drift from copy.ts (SCADA included). The ONLY brand-new
// literal here is the one approved new on-screen line, visionLine (C9).

import { COPY } from './copy'

export const FILM_COPY = {
  // --- Verbatim reuse (by reference to COPY, never re-typed) ---
  s06Tagline: COPY.s06Tagline, // "Built with intention."  (C8 / vo13)
  s05a: COPY.s05a, // "Small enough to care."              (C10 / vo15)
  s05b: COPY.s05b, // "Technical enough to build."         (C11 / vo16)
  s03Wordmark: COPY.s03Wordmark, // "LUMEN LABS"           (C12)
  s06MetaStudio: COPY.s06Meta[1], // "SOUTH AFRICAN TECHNOLOGY STUDIO" (C13)

  // --- Computed capability sub-labels (joins of the verbatim arrays) ---
  // These MUST equal COPY.s04.*.items.join(' · ') — including SCADA in control.
  softwareLine: COPY.s04.software.items.join(' · '),
  infrastructureLine: COPY.s04.infrastructure.items.join(' · '),
  controlLine: COPY.s04.control.items.join(' · '),

  // --- Capability titles (verbatim from COPY) ---
  softwareTitle: COPY.s04.software.title, // "SOFTWARE"
  infrastructureTitle: COPY.s04.infrastructure.title, // "INFRASTRUCTURE"
  controlTitle: COPY.s04.control.title, // "CONTROL + SECURITY"

  // --- Act-1 narration-class captions (C1-C4; no claim, story prose) ---
  c1: "A business doesn't fail\nin one big moment.",
  c2: "Systems that don't talk.\nHours that don't add up.",
  c3: 'There has to be\na better way.',
  c4: 'Then they found a partner.',

  // --- THE ONE NEW APPROVED ON-SCREEN LINE (C9) ---
  // Newline between the two sentences for the two-line on-screen caption.
  visionLine: 'Your business has a vision.\nWe build what brings it to life.',
} as const

export type FilmCopy = typeof FILM_COPY
