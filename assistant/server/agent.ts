import crypto from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { Card, Source, TurnEvent, TurnRequest } from '../shared/protocol.ts'
import { config } from './config.ts'
import { findPageImage } from './images.ts'
import { estimateCost } from './pricing.ts'
import { ReplySplitter } from './reply.ts'

type Emit = (event: TurnEvent) => void

const MAX_ITERATIONS = 8

// Stable across requests so it stays in the prompt cache. Per-turn details (mode, time)
// travel in the user message instead.
const SYSTEM = `You are Lumen, a voice-first personal assistant made by Lumen Labs, a digital studio in South Africa. You run inside a futuristic heads-up display: your words are spoken aloud by text-to-speech, and you can place visual cards on the screen.

How to answer:
- Start with your spoken reply. It is read aloud the moment you write it, so lead with the answer itself. Write natural spoken prose: no markdown, no bullet points, no headings, no URLs, no emoji. Say numbers the way a person would say them.
- Be warm, sharp and brief. Quick mode: one to three sentences. Deep mode: a spoken briefing of four to seven sentences that covers what the cards show.
- For small talk or simple questions you can answer reliably, just reply. No search, no cards.
- Use web_search for anything current, local, or factual that you are not certain of, or whenever the user asks you to look something up. Never guess at news, prices, scores, weather or schedules. In Quick mode, one or two well-chosen searches is usually enough; answer stable general knowledge without searching.

Cards:
After your spoken reply you may add cards for the screen. Write a line containing only [[cards]], then a JSON array of card objects. Everything before [[cards]] is spoken; nothing after it is. Use plain JSON, no code fences, and leave the section out entirely when no cards are needed. Example:
The Moon is about three hundred and eighty four thousand kilometres away.
[[cards]]
[{"kind":"stat","title":"Earth to Moon","value":"384,400","unit":"km","caption":"Average distance, NASA"}]

Card kinds and fields:
- stat: title, value (the headline figure as text), unit, caption
- chart: title, bars (two to eight objects with label and a numeric value), unit, caption
- list: title, items (two to six short strings), caption
- text: title, body (at most three sentences)
- image: title, page_url, caption. page_url must be copied exactly from your web_search results; the screen shows that page's main photo. Prefer article, product and encyclopedia pages over home pages.
- timer: seconds, label. Starts a countdown that rings on screen. Use it for timers and reminders in the next few hours.

Card guidance:
- Use cards when they add something the voice cannot: a headline figure, a comparison or trend, steps or options, a short explainer, or a real photo.
- Whenever you searched the web about something visual (a place, product, person, event, device, animal, food, building), include image cards. Quick mode: one image card. Deep mode: two to four image cards from different pages.
- Quick mode: at most three cards. Deep mode: a research wall of six to twelve cards that mixes stats, at least one chart when real numbers exist, lists or text, and images.
- Charts and stats must use real figures from your sources; never invent data. Name the source and year in caption.
- Keep titles to two to six words. Do not make a sources card; the screen lists your sources automatically.

Photos: when the user shares a photo, look closely. Say what it is in your first sentence, then explain what matters. Read any visible text exactly. Search the web when identifying a product, plant, landmark, part or error message needs confirming, or when they ask about prices or where to buy. Do not identify real people from their faces; describe them instead. If the photo is unclear, say what you can see and what would help.

Briefings: when asked for a briefing, sound like a calm, upbeat morning radio host. Greet the user in a way that fits the time of day, keep it to five to seven spoken sentences, and let the cards carry the detail.

The user is usually in South Africa: use metric units and rand (R) for prices unless asked otherwise.`

const text = (max: number) => z.string().trim().min(1).max(max)
const CardInput = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('stat'),
    title: text(80),
    value: z.coerce.string().trim().min(1).max(40),
    unit: z.string().trim().max(40).optional(),
    caption: z.string().trim().max(200).optional(),
  }),
  z.object({
    kind: z.literal('chart'),
    title: text(80),
    unit: z.string().trim().max(40).optional(),
    caption: z.string().trim().max(200).optional(),
    bars: z
      .array(z.object({ label: text(40), value: z.coerce.number().finite() }))
      .min(2)
      .max(8),
  }),
  z.object({
    kind: z.literal('list'),
    title: text(80),
    items: z.array(text(200)).min(1).max(8),
    caption: z.string().trim().max(200).optional(),
  }),
  z.object({ kind: z.literal('text'), title: text(80), body: text(700) }),
  z.object({
    kind: z.literal('image'),
    title: text(80),
    page_url: z.url(),
    caption: z.string().trim().max(200).optional(),
  }),
  z.object({
    kind: z.literal('timer'),
    seconds: z.coerce.number().int().min(1).max(86_400),
    label: z.string().trim().max(60).optional(),
  }),
])

let client: Anthropic | undefined
const getClient = () => (client ??= new Anthropic())

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    return u.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}

type Profile = {
  model: string
  maxSearches: number
  effort: 'low' | 'medium' | 'high'
  label: string
}

function profileFor(req: TurnRequest): Profile {
  if (req.briefing) {
    return {
      model: config.model,
      maxSearches: 6,
      effort: 'medium',
      label: 'BRIEFING: run the daily briefing and build a briefing wall of cards.',
    }
  }
  return req.mode === 'deep'
    ? {
        model: config.model,
        maxSearches: 10,
        effort: 'high',
        label: 'DEEP: research thoroughly and build a full research wall of cards.',
      }
    : {
        model: config.quickModel,
        maxSearches: 3,
        effort: 'low',
        label: 'QUICK: be fast and brief; at most three cards.',
      }
}

// Haiku models use the basic web search tool; the newer variant needs Sonnet or Opus.
const isHaiku = (model: string) => model.startsWith('claude-haiku')

function buildTools(profile: Profile): Anthropic.Beta.BetaToolUnion[] {
  const { city, region, country, timezone } = config.home
  const location =
    city || region || country || timezone
      ? { type: 'approximate' as const, city, region, country, timezone }
      : undefined
  const common = {
    name: 'web_search' as const,
    max_uses: profile.maxSearches,
    ...(location ? { user_location: location } : {}),
  }
  return [
    isHaiku(profile.model)
      ? { type: 'web_search_20250305', ...common }
      : { type: 'web_search_20260209', ...common },
  ]
}

function briefingRequest(): string {
  const where =
    [config.home.city, config.home.region, config.home.country]
      .filter(Boolean)
      .join(', ') || 'my area in South Africa'
  return `Give me my daily briefing. Cover, in this order:
1. Weather today in ${where}: a stat card with the current temperature or today's high, and a list card with the high and low, chance of rain and wind.
2. Top South African news: a list card with three to five headlines, one short line each.
3. The biggest world headline, in one sentence.
4. Markets: a stat card with the current US dollar to rand rate, and its direction today if you can find it.
5. Any announced load-shedding, severe weather or major traffic warnings for my area. Skip this silently if there are none.
Add one or two image cards from the top news stories.`
}

function contextBlock(req: TurnRequest, profile: Profile): string {
  return `<context>\nMode: ${profile.label}\nUser's local time: ${req.context.localTime} (${req.context.timezone})\n</context>`
}

function userContent(
  req: TurnRequest,
  profile: Profile,
): Anthropic.Beta.BetaMessageContentParam {
  const ask = req.briefing ? briefingRequest() : req.text
  const text = `${contextBlock(req, profile)}\n\n${ask}`
  if (!req.image) return text
  return [
    {
      type: 'image',
      source: { type: 'base64', media_type: req.image.mediaType, data: req.image.data },
    },
    { type: 'text', text },
  ]
}

export class SpendCapError extends Error {}

const spend = { day: '', usd: 0 }
function addSpend(usd: number) {
  const today = new Date().toISOString().slice(0, 10)
  if (spend.day !== today) Object.assign(spend, { day: today, usd: 0 })
  spend.usd += usd
}
function overBudget(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return (
    config.dailyBudgetUsd > 0 && spend.day === today && spend.usd >= config.dailyBudgetUsd
  )
}

export async function runTurn(
  req: TurnRequest,
  emit: Emit,
  signal: AbortSignal,
): Promise<void> {
  if (overBudget()) {
    throw new SpendCapError(
      `Today's spending cap of $${config.dailyBudgetUsd.toFixed(2)} has been reached. It resets at midnight UTC.`,
    )
  }

  const messages: Anthropic.Beta.BetaMessageParam[] = []
  for (const turn of req.history) {
    if (!turn.user.trim() || !turn.assistant.trim()) continue
    messages.push(
      { role: 'user', content: turn.user },
      { role: 'assistant', content: turn.assistant },
    )
  }
  const profile = profileFor(req)
  messages.push({ role: 'user', content: userContent(req, profile) })

  const tools = buildTools(profile)
  const sources = new Map<string, Source>()
  const pending: Promise<void>[] = []
  let costUsd = 0
  let searches = 0
  let composing = false

  // Each card is validated and shown the moment its JSON closes. Photos are looked up in
  // the background so they never hold up the spoken answer.
  const handleCard = (json: string) => {
    let raw: unknown
    try {
      raw = JSON.parse(json)
    } catch {
      return
    }
    const parsed = CardInput.safeParse(raw)
    if (!parsed.success) return
    const input = parsed.data
    const id = crypto.randomUUID()
    if (input.kind === 'timer') {
      emit({ type: 'timer', id, seconds: input.seconds, label: input.label || 'Timer' })
      return
    }
    if (!composing) {
      composing = true
      emit({ type: 'status', phase: 'composing' })
    }
    if (input.kind !== 'image') {
      const { kind, ...rest } = input
      emit({ type: 'card', card: { id, kind, ...rest } as Card })
      return
    }
    const known = sources.get(normalizeUrl(input.page_url))
    if (!known) return
    pending.push(
      findPageImage(known.url).then((imageUrl) => {
        if (!imageUrl || signal.aborted) return
        emit({
          type: 'card',
          card: {
            id,
            kind: 'image',
            title: input.title,
            caption: input.caption,
            imageUrl,
            pageUrl: known.url,
          },
        })
      }),
    )
  }
  const splitter = new ReplySplitter((text) => emit({ type: 'delta', text }), handleCard)

  // Server-side fallback on a policy decline (not offered for Haiku models).
  const fallback = isHaiku(profile.model)
    ? {}
    : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }

  emit({ type: 'status', phase: 'thinking' })

  // One streamed request per question. The loop only repeats if the server pauses a long
  // web-search run (pause_turn) and needs it resumed.
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const stream = getClient().beta.messages.stream(
      {
        model: profile.model,
        max_tokens: 32000,
        system: SYSTEM,
        tools,
        messages,
        thinking: { type: 'adaptive' },
        output_config: { effort: profile.effort },
        cache_control: { type: 'ephemeral' },
        ...fallback,
      },
      { signal },
    )

    stream.on('text', (delta) => splitter.push(delta))

    stream.on('contentBlock', (block) => {
      if (block.type === 'server_tool_use' && block.name === 'web_search') {
        const query = (block.input as { query?: unknown })?.query
        if (typeof query === 'string') emit({ type: 'search', query })
        emit({ type: 'status', phase: 'searching' })
        return
      }
      if (block.type === 'web_search_tool_result') {
        if (Array.isArray(block.content)) {
          for (const r of block.content) {
            const key = normalizeUrl(r.url)
            if (!sources.has(key))
              sources.set(key, { title: r.title || r.url, url: r.url })
          }
          emit({ type: 'sources', items: [...sources.values()] })
        }
        emit({ type: 'status', phase: 'thinking' })
      }
    })

    const message = await stream.finalMessage()

    const cost = estimateCost(message.model || profile.model, message.usage)
    costUsd += cost
    addSpend(cost)
    searches += message.usage.server_tool_use?.web_search_requests ?? 0
    emit({ type: 'usage', costUsd, searches })

    if (message.stop_reason === 'refusal') {
      emit({ type: 'error', message: "I can't help with that one." })
      return
    }
    if (message.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: message.content })
      continue
    }
    break
  }

  splitter.end()
  await Promise.all(pending)
  emit({ type: 'done' })
}

export function describeError(err: unknown): string {
  if (err instanceof SpendCapError) return err.message
  if (err instanceof Anthropic.AuthenticationError) {
    return 'The Anthropic API key is missing or invalid. Check ANTHROPIC_API_KEY.'
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'This API key is not allowed to use that model or feature.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Too many requests right now. Give it a few seconds and try again.'
  }
  if (err instanceof Anthropic.BadRequestError) {
    // Includes "credit balance is too low", which the user needs to see verbatim.
    return `Request rejected: ${err.message}`
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "I can't reach Claude right now. Check the internet connection."
  }
  if (err instanceof Anthropic.APIError) {
    return err.status && err.status >= 500
      ? 'Claude is busy or having a problem. Try again in a moment.'
      : `Something went wrong (${err.status}).`
  }
  if (err instanceof Error && err.message.includes('Could not resolve authentication')) {
    return 'No Anthropic API key found. Add ANTHROPIC_API_KEY to your .env file.'
  }
  return 'Something went wrong. Try again.'
}
