import { describe, it, expect } from 'vitest'
import { COPY } from '../config/copy'

// Guards against invented copy / stats / clients / drift (DESIGN §11).
describe('copy', () => {
  it('matches the exact approved storyboard strings', () => {
    expect(COPY.s01).toBe('Every business has\nproblems worth solving.')
    expect(COPY.s02).toBe('We build the technology\nto solve them.')
    expect(COPY.s03Wordmark).toBe('LUMEN LABS')
    expect(COPY.s03Sub).toBe('A South African technology studio.')
    expect(COPY.s05a).toBe('Small enough to care.')
    expect(COPY.s05b).toBe('Technical enough to build.')
    expect(COPY.s06Tagline).toBe('Built with intention.')
    expect(COPY.s06Meta).toEqual(['LUMEN LABS', 'SOUTH AFRICAN TECHNOLOGY STUDIO'])
  })

  it('has the exact S04 categories and lists', () => {
    expect(COPY.s04.software.title).toBe('SOFTWARE')
    expect(COPY.s04.software.items).toEqual([
      'Custom software',
      'Web applications',
      'Integrations',
      'IoT',
    ])
    expect(COPY.s04.infrastructure.title).toBe('INFRASTRUCTURE')
    expect(COPY.s04.infrastructure.items).toEqual(['IT', 'Networking', 'Cloud', 'Microsoft 365'])
    expect(COPY.s04.control.title).toBe('CONTROL + SECURITY')
    expect(COPY.s04.control.items).toEqual([
      'Automation',
      'SCADA',
      'Cybersecurity',
      'CCTV',
      'VoIP',
    ])
  })
})
