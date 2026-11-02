import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { z } from 'zod'
import type { SessionInfo, TurnEvent } from '../shared/protocol.ts'
import { describeError, runTurn } from './agent.ts'
import { authRequired, isAuthed, login, logout, requireAuth } from './auth.ts'
import { config } from './config.ts'
import { runDemoTurn } from './demo.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  // no-referrer also lets photos from other sites load without hotlink blocking.
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=()')
  next()
})
// Turns can carry a photo (base64 JPEG, ~0.3–1.5 MB); everything else stays small.
app.use('/api/turn', express.json({ limit: '8mb' }))
app.use('/api', express.json({ limit: '256kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/session', (req, res) => {
  const info: SessionInfo = {
    authRequired: authRequired(),
    authed: isAuthed(req),
    demo: config.demo,
  }
  res.json(info)
})
app.post('/api/login', login)
app.post('/api/logout', logout)

const TurnRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  mode: z.enum(['quick', 'deep']),
  history: z
    .array(z.object({ user: z.string().max(4000), assistant: z.string().max(6000) }))
    .max(12),
  context: z.object({ timezone: z.string().max(80), localTime: z.string().max(120) }),
  image: z
    .object({
      mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
      data: z
        .string()
        .max(7_000_000)
        .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    })
    .optional(),
  briefing: z.boolean().optional(),
})

app.post('/api/turn', requireAuth, async (req, res) => {
  const parsed = TurnRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Bad request' })
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()

  const controller = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) controller.abort()
  })
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000)
  const emit = (event: TurnEvent) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    if (config.demo) await runDemoTurn(parsed.data, emit, controller.signal)
    else await runTurn(parsed.data, emit, controller.signal)
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error('[lumen] turn failed:', err)
      emit({ type: 'error', message: describeError(err) })
    }
  } finally {
    clearInterval(heartbeat)
    res.end()
  }
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

if (config.prod) {
  const dist = path.join(root, 'dist')
  app.use(
    express.static(dist, {
      index: false,
      setHeaders(res, file) {
        if (file.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        } else {
          res.setHeader('Cache-Control', 'no-cache')
        }
      },
    }),
  )
  app.get('/{*splat}', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(dist, 'index.html'))
  })
} else {
  const { createServer } = await import('vite')
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use(vite.middlewares)
}

app.listen(config.port, config.host, () => {
  const where = `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`
  console.log(`\n  LUMEN // online at ${where}`)
  if (config.demo)
    console.log('  Demo mode: scripted answers, no API key needed, no spend.')
  else if (!config.hasApiKey) {
    console.warn('  No ANTHROPIC_API_KEY found. Add it to .env, or run `npm run demo`.')
  }
  if (!authRequired())
    console.log(
      '  No LUMEN_PASSCODE set: lock screen disabled (fine on your own laptop).',
    )
  console.log('')
})
