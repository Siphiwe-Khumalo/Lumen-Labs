// EVERY on-screen string, VERBATIM from the storyboard (DESIGN §7). This is the
// only source of copy. Do NOT invent copy, stats, clients, dates, or locations.
// Guarded by a snapshot test (src/__tests__/copy.test.ts).

export const COPY = {
  s01: 'Every business has\nproblems worth solving.',
  s02: 'We build the technology\nto solve them.',
  s03Wordmark: 'LUMEN LABS',
  s03Sub: 'A South African technology studio.',
  s04: {
    software: {
      index: '01',
      title: 'SOFTWARE',
      items: ['Custom software', 'Web applications', 'Integrations', 'IoT'],
    },
    infrastructure: {
      index: '02',
      title: 'INFRASTRUCTURE',
      items: ['IT', 'Networking', 'Cloud', 'Microsoft 365'],
    },
    control: {
      index: '03',
      title: 'CONTROL + SECURITY',
      items: ['Automation', 'SCADA', 'Cybersecurity', 'CCTV', 'VoIP'],
    },
  },
  s05a: 'Small enough to care.',
  s05b: 'Technical enough to build.',
  s06Tagline: 'Built with intention.',
  s06Meta: ['LUMEN LABS', 'SOUTH AFRICAN TECHNOLOGY STUDIO'],
} as const

export type Copy = typeof COPY
