import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from './config.ts'

const COOKIE = 'lumen_session'
const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days
const MAX_FAILURES = 5
const LOCKOUT_MS = 15 * 60 * 1000

// Changing the passcode (or the optional secret) invalidates every existing session.
const key = crypto
  .createHash('sha256')
  .update(`lumen-session:${config.sessionSecret ?? ''}:${config.passcode}`)
  .digest()

const sign = (payload: string) =>
  crypto.createHmac('sha256', key).update(payload).digest('base64url')

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export const authRequired = () => Boolean(config.passcode)

export function isAuthed(req: Request): boolean {
  if (!authRequired()) return true
  const token = readCookie(req, COOKIE)
  if (!token) return false
  const [expiry, mac] = token.split('.')
  if (!expiry || !mac || !safeEqual(mac, sign(expiry))) return false
  return Number(expiry) > Date.now()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (isAuthed(req)) return next()
  res.status(401).json({ error: 'locked' })
}

const failures = new Map<string, { count: number; until: number }>()

export function login(req: Request, res: Response) {
  if (!authRequired()) return res.json({ ok: true })
  const ip = req.ip ?? 'unknown'
  const entry = failures.get(ip)
  if (entry && entry.count >= MAX_FAILURES && entry.until > Date.now()) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : ''
  if (!safeEqual(passcode, config.passcode)) {
    const next = entry && entry.until > Date.now() ? entry.count + 1 : 1
    failures.set(ip, { count: next, until: Date.now() + LOCKOUT_MS })
    return res.status(401).json({ error: 'Wrong passcode.' })
  }

  failures.delete(ip)
  const expiry = String(Date.now() + MAX_AGE_S * 1000)
  const secure = config.prod ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${expiry}.${sign(expiry)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_S}; SameSite=Strict${secure}`,
  )
  return res.json({ ok: true })
}

export function logout(_req: Request, res: Response) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
  res.json({ ok: true })
}
