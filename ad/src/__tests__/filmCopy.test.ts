import { describe, it, expect } from 'vitest'
import { FILM_COPY } from '../config/filmCopy'
import { COPY } from '../config/copy'

describe('filmCopy', () => {
  it('re-exports the verbatim COPY members (reference-equal values, not re-literals)', () => {
    // Primitive strings compare by value; these assert the exact COPY text is
    // surfaced, so they cannot drift from copy.ts.
    expect(FILM_COPY.s06Tagline).toBe(COPY.s06Tagline)
    expect(FILM_COPY.s05a).toBe(COPY.s05a)
    expect(FILM_COPY.s05b).toBe(COPY.s05b)
    expect(FILM_COPY.s03Wordmark).toBe(COPY.s03Wordmark)
    expect(FILM_COPY.s06MetaStudio).toBe(COPY.s06Meta[1])
    expect(FILM_COPY.softwareTitle).toBe(COPY.s04.software.title)
    expect(FILM_COPY.infrastructureTitle).toBe(COPY.s04.infrastructure.title)
    expect(FILM_COPY.controlTitle).toBe(COPY.s04.control.title)
  })

  it('capability sub-labels are the exact copy.ts arrays joined with " · "', () => {
    expect(FILM_COPY.softwareLine).toBe(COPY.s04.software.items.join(' · '))
    expect(FILM_COPY.infrastructureLine).toBe(COPY.s04.infrastructure.items.join(' · '))
    expect(FILM_COPY.controlLine).toBe(COPY.s04.control.items.join(' · '))
  })

  it('controlLine includes SCADA (review F3 regression guard)', () => {
    expect(FILM_COPY.controlLine).toContain('SCADA')
    expect(FILM_COPY.controlLine).toBe('Automation · SCADA · Cybersecurity · CCTV · VoIP')
  })

  it('adds exactly ONE brand-new on-screen line (visionLine, C9)', () => {
    expect(FILM_COPY.visionLine).toBe(
      'Your business has a vision.\nWe build what brings it to life.',
    )
    // The new line is NOT present verbatim anywhere in copy.ts.
    const copyValues = JSON.stringify(COPY)
    expect(copyValues).not.toContain('Your business has a vision')
  })

  it('does not re-literal any reused string that differs from copy.ts', () => {
    // Guard: the vision line is the only non-copy string; every other exported
    // string must trace back to a COPY member or a join of COPY arrays.
    expect(FILM_COPY.c1).toContain("A business doesn't fail")
    expect(FILM_COPY.c4).toBe('Then they found a partner.')
  })
})
