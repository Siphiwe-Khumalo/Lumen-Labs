import crypto from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { Card, Source, TurnEvent, TurnRequest } from '../shared/protocol.ts'
import { config } from './config.ts'
import { findPageImage } from './images.ts'
import { estimateCost } from './pricing.ts'

type Emit = (event: TurnEvent) => void

const MAX_ITERATIONS = 8

// Stable across requests so it stays in the prompt cache. Per-turn details (mode, time)
// travel in the user message instead.
const SYSTEM = `You are Lumen, a voice-first personal assistant made by Lumen Labs, a digital studio in South Africa. You run inside a futuristic heads-up display: your words are spoken aloud by text-to-speech, and you can place visual cards on the screen.

How to answer:
- Your final reply is read aloud. Write natural spoken prose: no markdown, no bullet points, no headings, no URLs, no emoji. Say numbers the way a person would say them.
- Be warm, sharp and brief. Lead with the answer. Quick mode: one to three sentences. Deep mode: a spoken briefing of four to seven sentences that covers what the cards show.
- For small talk or simple questions you can answer reliably, just reply. No search, no cards.
- Use web_search for anything current, local, factual that you are not certain of, or whenever the user asks you to look something up. Never guess at news, prices, scores, weather or schedules.

Cards (show_card):
- Use cards when they add something the voice cannot: a headline figure (stat), a comparison or trend (chart), steps or options (list), a short explainer (text), or a real photo (image).
- Whenever you searched the web about something visual (a place, product, person, event, device, animal, food, building), include image cards so the user sees real pictures. Quick mode: one image card. Deep mode: two to four image cards from different pages.
- An image card's page_url must be copied exactly from your web_search results; the screen shows that page's main photo. Prefer articles, product pages and encyclopedia pages over home pages.
- Quick mode: at most three cards. Deep mode: build a research wall of six to twelve cards that mixes stats, at least one chart when real numbers exist, lists or text, and images.
- Charts and stats must use real figures from your sources; never invent data. Put the unit in unit, and name the source and year in caption.
- Keep titles short (two to six words). Keep text cards to three sentences at most.
- Do not make a sources card. The screen lists your sources automatically.
- Put every show_card call in a single message, then give your spoken reply after the results come back.

Timers: use set_timer when the user asks for a timer or a reminder in the next few hours.

The user is usually in South Africa: use metric units and rand (R) for prices unless asked otherwise.`

const cardTool: Anthropic.Beta.BetaTool = {
  name: 'show_card',
  description:
    "Place one visual card on the user's screen. kind decides which fields are used: stat (value, unit, caption), chart (bars, unit, caption), list (items, caption), text (body), image (page_url, caption).",
  eager_input_streaming: true,
  input_schema: {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['stat', 'chart', 'list', 'text', 'image'] },
      title: { type: 'string', description: 'Short label, two to six words.' },
      value: {
        type: 'string',
        description: 'stat: the headline figure, e.g. "384,400" or "R18.42".',
      },
      unit: {
        type: 'string',
        description: 'stat/chart: unit, e.g. "km", "%", "million units".',
      },
      caption: {
        type: 'string',
        description:
          'One line of context. For stats and charts, name the source and year.',
      },
      body: { type: 'string', description: 'text: one to three sentences.' },
      items: {
        type: 'array',
        items: { type: 'string' },
        description: 'list: two to six short items.',
      },
      bars: {
        type: 'array',
        description: 'chart: two to eight bars with real values.',
        items: {
          type: 'object',
          properties: { label: { type: 'string' }, value: { type: 'number' } },
          required: ['label', 'value'],
        },
      },
      page_url: {
        type: 'string',
        description: 'image: a page URL copied exactly from your web_search results.',
      },
    },
    required: ['kind', 'title'],
  },
}

const timerTool: Anthropic.Beta.BetaTool = {
  name: 'set_timer',
  description: "Start a countdown timer on the user's screen. It rings when finished.",
  eager_input_streaming: true,
  input_schema: {
    type: 'object',
    properties: {
      seconds: { type: 'integer', description: 'Duration in seconds, 1 to 86400.' },
      label: { type: 'string', description: 'What the timer is for, e.g. "Pasta".' },
    },
    required: ['seconds', 'label'],
  },
}

const text = (max: number) => z.string().trim().min(1).max(max)
const CardInput = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('stat'),
    title: text(80),
    value: text(40),
    unit: z.string().trim().max(40).optional(),
    caption: z.string().trim().max(200).optional(),
  }),
  z.object({
    kind: z.literal('chart'),
    title: text(80),
    unit: z.string().trim().max(40).optional(),
    caption: z.string().trim().max(200).optional(),
    bars: z
      .array(z.object({ label: text(40), value: z.number().finite() }))
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
])
const TimerInput = z.object({
  seconds: z.number().int().min(1).max(86_400),
  label: z.string().trim().max(60).default('Timer'),
})

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

function buildTools(mode: TurnRequest['mode']): Anthropic.Beta.BetaToolUnion[] {
  const { city, region, country, timezone } = config.home
  const location =
    city || region || country || timezone
      ? { type: 'approximate' as const, city, region, country, timezone }
      : undefined
  return [
    {
      type: 'web_search_20260209',
      name: 'web_search',
      max_uses: mode === 'deep' ? 10 : 3,
      ...(location ? { user_location: location } : {}),
    },
    cardTool,
    timerTool,
  ]
}

function contextBlock(req: TurnRequest): string {
  const mode =
    req.mode === 'deep'
      ? 'DEEP: research thoroughly and build a full research wall of cards.'
      : 'QUICK: be fast and brief; at most three cards.'
  return `<context>\nMode: ${mode}\nUser's local time: ${req.context.localTime} (${req.context.timezone})\n</context>`
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
  messages.push({ role: 'user', content: `${contextBlock(req)}\n\n${req.text}` })

  const tools = buildTools(req.mode)
  const sources = new Map<string, Source>()
  let costUsd = 0
  let searches = 0
  let parseRetries = 0

  emit({ type: 'status', phase: 'thinking' })

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const pending: Promise<void>[] = []
    const results = new Map<string, Anthropic.Beta.BetaToolResultBlockParam>()
    const reply = (id: string, content: string, isError = false) =>
      results.set(id, {
        type: 'tool_result',
        tool_use_id: id,
        content,
        is_error: isError,
      })

    const stream = getClient().beta.messages.stream(
      {
        model: config.model,
        max_tokens: 32000,
        system: SYSTEM,
        tools,
        messages,
        thinking: { type: 'adaptive' },
        output_config: { effort: req.mode === 'deep' ? 'high' : 'low' },
        cache_control: { type: 'ephemeral' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      },
      { signal },
    )

    stream.on('text', (delta) => emit({ type: 'delta', text: delta }))

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
        return
      }
      if (block.type !== 'tool_use') return

      if (block.name === 'set_timer') {
        const parsed = TimerInput.safeParse(block.input)
        if (!parsed.success)
          return void reply(block.id, z.prettifyError(parsed.error), true)
        const id = crypto.randomUUID()
        emit({
          type: 'timer',
          id,
          seconds: parsed.data.seconds,
          label: parsed.data.label || 'Timer',
        })
        return void reply(block.id, 'Timer started on screen.')
      }

      if (block.name !== 'show_card') return void reply(block.id, 'Unknown tool.', true)
      const parsed = CardInput.safeParse(block.input)
      if (!parsed.success)
        return void reply(block.id, z.prettifyError(parsed.error), true)
      const input = parsed.data
      const id = crypto.randomUUID()
      emit({ type: 'status', phase: 'composing' })

      if (input.kind !== 'image') {
        const { kind, ...rest } = input
        emit({ type: 'card', card: { id, kind, ...rest } as Card })
        return void reply(block.id, 'Shown.')
      }

      const known = sources.get(normalizeUrl(input.page_url))
      if (!known) {
        return void reply(
          block.id,
          'page_url must be copied exactly from your web_search results.',
          true,
        )
      }
      pending.push(
        findPageImage(known.url).then((imageUrl) => {
          if (!imageUrl)
            return void reply(
              block.id,
              'That page has no usable photo, so nothing was shown.',
            )
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
          reply(block.id, 'Shown.')
        }),
      )
    })

    let message: Anthropic.Beta.BetaMessage
    try {
      message = await stream.finalMessage()
      parseRetries = 0
    } catch (err) {
      // With eager input streaming, unparseable tool JSON rejects here; re-issue the turn.
      if (err instanceof Anthropic.APIError || signal.aborted || parseRetries++ >= 2)
        throw err
      continue
    }
    await Promise.all(pending)

    const cost = estimateCost(message.model || config.model, message.usage)
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

    const toolUses = message.content.filter(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use',
    )
    if (toolUses.length === 0) break
    if (message.stop_reason === 'max_tokens') {
      emit({
        type: 'error',
        message: 'That answer ran too long. Try a narrower question.',
      })
      return
    }

    messages.push({ role: 'assistant', content: message.content })
    messages.push({
      role: 'user',
      content: toolUses.map(
        (t) =>
          results.get(t.id) ?? {
            type: 'tool_result' as const,
            tool_use_id: t.id,
            content: 'Shown.',
          },
      ),
    })
    if (overBudget()) {
      emit({ type: 'error', message: "Today's spending cap was reached mid-answer." })
      return
    }
  }

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
