import type { SessionInfo, TurnEvent, TurnRequest } from '../../shared/protocol.ts'

export async function getSession(): Promise<SessionInfo> {
  const res = await fetch('/api/session', { credentials: 'same-origin' })
  if (!res.ok) throw new Error('Lumen server is not reachable.')
  return res.json()
}

export async function login(passcode: string): Promise<string | null> {
  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ passcode }),
  })
  if (res.ok) return null
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  return body.error ?? 'Could not unlock.'
}

export async function logout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
}

export class LockedError extends Error {}

/** POSTs a turn and yields each server-sent event as it arrives. */
export async function* streamTurn(
  request: TurnRequest,
  signal: AbortSignal,
): AsyncGenerator<TurnEvent> {
  const res = await fetch('/api/turn', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
  if (res.status === 401) throw new LockedError('Locked')
  if (!res.ok || !res.body) throw new Error(`Lumen server error (${res.status}).`)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += value
    let split: number
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, split)
      buffer = buffer.slice(split + 2)
      const data = frame
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n')
      if (data) yield JSON.parse(data) as TurnEvent
    }
  }
}
