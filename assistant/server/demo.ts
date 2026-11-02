import crypto from 'node:crypto'
import type { Card, Source, TurnEvent, TurnRequest } from '../shared/protocol.ts'

// Scripted answers for `npm run demo`: shows every part of the HUD without an API key
// or any spend. Content is illustrative, not live.

type Emit = (event: TurnEvent) => void

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new Error('aborted'))
    })
  })

async function speak(text: string, emit: Emit, signal: AbortSignal) {
  for (const word of text.split(/(?<=\s)/)) {
    emit({ type: 'delta', text: word })
    await wait(45, signal)
  }
}

const id = () => crypto.randomUUID()

const RESEARCH_SOURCES: Source[] = [
  { title: 'Data centre - Wikipedia', url: 'https://en.wikipedia.org/wiki/Data_center' },
  {
    title: 'Teraco: Africa’s largest vendor-neutral data centre platform',
    url: 'https://www.teraco.co.za/',
  },
  {
    title: 'Microsoft opens cloud regions in South Africa',
    url: 'https://news.microsoft.com/',
  },
  {
    title: 'AWS Africa (Cape Town) Region',
    url: 'https://aws.amazon.com/about-aws/global-infrastructure/',
  },
  {
    title: 'Load-shedding and data centre power resilience',
    url: 'https://mybroadband.co.za/',
  },
  {
    title: 'Hyperscale data centre market outlook',
    url: 'https://www.datacenterdynamics.com/',
  },
]

const RESEARCH_CARDS: Card[] = [
  {
    id: '',
    kind: 'stat',
    title: 'Installed capacity',
    value: '≈400',
    unit: 'MW',
    caption: 'Illustrative demo figure for South African colocation, 2026',
  },
  {
    id: '',
    kind: 'image',
    title: 'Inside a hyperscale hall',
    imageUrl: '/demo/infrastructure-servers.jpg',
    pageUrl: 'https://en.wikipedia.org/wiki/Data_center',
    caption: 'Cold-aisle containment and high-density racks',
  },
  {
    id: '',
    kind: 'chart',
    title: 'Capacity by city',
    unit: 'MW',
    caption: 'Demo data, not live',
    bars: [
      { label: 'Johannesburg', value: 210 },
      { label: 'Cape Town', value: 120 },
      { label: 'Durban', value: 40 },
      { label: 'Other', value: 30 },
    ],
  },
  {
    id: '',
    kind: 'text',
    title: 'Why it is booming',
    body: 'Hyperscale cloud regions, AI workloads and banks moving off their own server rooms are driving demand. Power resilience is the main constraint.',
  },
  {
    id: '',
    kind: 'image',
    title: 'Network operations',
    imageUrl: '/demo/datacenter-monitor.jpg',
    pageUrl: 'https://www.teraco.co.za/',
    caption: 'Monitoring floor at a colocation facility',
  },
  {
    id: '',
    kind: 'list',
    title: 'Key players',
    items: [
      'Teraco (Digital Realty)',
      'Africa Data Centres',
      'NTT DATA',
      'Open Access Data Centres',
    ],
  },
  {
    id: '',
    kind: 'chart',
    title: 'New builds per year',
    unit: 'facilities',
    caption: 'Demo data, not live',
    bars: [
      { label: '2022', value: 4 },
      { label: '2023', value: 6 },
      { label: '2024', value: 9 },
      { label: '2025', value: 11 },
      { label: '2026', value: 14 },
    ],
  },
  {
    id: '',
    kind: 'image',
    title: 'The hardware layer',
    imageUrl: '/demo/circuit-macro.jpg',
    pageUrl: 'https://www.datacenterdynamics.com/',
    caption: 'Server boards at macro scale',
  },
  {
    id: '',
    kind: 'stat',
    title: 'Backup power',
    value: '48',
    unit: 'hours',
    caption: 'Typical on-site diesel autonomy (demo figure)',
  },
]

async function research(req: TurnRequest, emit: Emit, signal: AbortSignal) {
  emit({ type: 'status', phase: 'thinking' })
  await wait(700, signal)
  const queries = [
    'South Africa data centre market 2026',
    'Teraco capacity Johannesburg Cape Town',
    'data centre load-shedding resilience',
  ]
  for (const [i, query] of queries.entries()) {
    emit({ type: 'status', phase: 'searching' })
    emit({ type: 'search', query })
    await wait(900, signal)
    emit({ type: 'sources', items: RESEARCH_SOURCES.slice(0, (i + 1) * 2) })
    emit({ type: 'usage', costUsd: 0, searches: i + 1 })
  }
  emit({ type: 'status', phase: 'composing' })
  for (const card of RESEARCH_CARDS) {
    await wait(req.mode === 'deep' ? 420 : 300, signal)
    emit({ type: 'card', card: { ...card, id: id() } })
  }
  await speak(
    "Here's the picture. South Africa is the biggest data centre market in Africa, with most capacity in Johannesburg and Cape Town. Growth is being driven by cloud regions and AI workloads, and power resilience is the main thing everyone is building around. This is demo content, so the figures are illustrative rather than live.",
    emit,
    signal,
  )
}

async function quick(emit: Emit, signal: AbortSignal) {
  emit({ type: 'status', phase: 'thinking' })
  await wait(600, signal)
  emit({ type: 'search', query: 'distance earth to moon' })
  emit({ type: 'status', phase: 'searching' })
  await wait(800, signal)
  emit({
    type: 'sources',
    items: [
      { title: 'Moon - Wikipedia', url: 'https://en.wikipedia.org/wiki/Moon' },
      {
        title: 'Moon Fact Sheet - NASA',
        url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
      },
    ],
  })
  emit({
    type: 'card',
    card: {
      id: id(),
      kind: 'stat',
      title: 'Earth to Moon',
      value: '384,400',
      unit: 'km',
      caption: 'Average distance, NASA',
    },
  })
  emit({ type: 'usage', costUsd: 0, searches: 1 })
  await speak(
    'The Moon is about three hundred and eighty four thousand kilometres away on average. Light covers that in just over a second.',
    emit,
    signal,
  )
}

export async function runDemoTurn(req: TurnRequest, emit: Emit, signal: AbortSignal) {
  const t = req.text.toLowerCase()
  const timer = t.match(/(\d+)\s*(second|sec|minute|min)/)
  if (t.includes('timer') && timer) {
    const seconds = Number(timer[1]) * (timer[2].startsWith('min') ? 60 : 1)
    emit({ type: 'status', phase: 'thinking' })
    await wait(500, signal)
    emit({ type: 'timer', id: id(), seconds, label: 'Timer' })
    await speak(
      `Done. ${timer[1]} ${timer[2].startsWith('min') ? 'minute' : 'second'} timer is running.`,
      emit,
      signal,
    )
  } else if (req.mode === 'deep' || /research|data cent|market|look up|search/.test(t)) {
    await research(req, emit, signal)
  } else if (/moon|far|distance/.test(t)) {
    await quick(emit, signal)
  } else {
    emit({ type: 'status', phase: 'thinking' })
    await wait(500, signal)
    await speak(
      'Lumen online and running in demo mode. Try asking me how far the Moon is, to set a ten second timer, or switch to Deep and ask me to research data centres in South Africa.',
      emit,
      signal,
    )
  }
  emit({ type: 'done' })
}
