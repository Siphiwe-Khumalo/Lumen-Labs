// Wire protocol shared by the Lumen server and the HUD client.

export type Mode = 'quick' | 'deep'

export type Card =
  | { id: string; kind: 'stat'; title: string; value: string; unit?: string; caption?: string }
  | {
      id: string
      kind: 'chart'
      title: string
      unit?: string
      caption?: string
      bars: { label: string; value: number }[]
    }
  | { id: string; kind: 'list'; title: string; items: string[]; caption?: string }
  | { id: string; kind: 'text'; title: string; body: string }
  | {
      id: string
      kind: 'image'
      title: string
      imageUrl: string
      pageUrl: string
      caption?: string
    }

export type Source = { title: string; url: string }

/** One finished question/answer pair, sent back as context for follow-ups. */
export type HistoryTurn = { user: string; assistant: string }

export type TurnRequest = {
  text: string
  mode: Mode
  history: HistoryTurn[]
  context: { timezone: string; localTime: string }
}

/** Server-sent events streamed from POST /api/turn. */
export type TurnEvent =
  | { type: 'status'; phase: 'thinking' | 'searching' | 'composing' }
  | { type: 'search'; query: string }
  | { type: 'sources'; items: Source[] }
  | { type: 'card'; card: Card }
  | { type: 'timer'; id: string; seconds: number; label: string }
  | { type: 'delta'; text: string }
  | { type: 'usage'; costUsd: number; searches: number }
  | { type: 'done' }
  | { type: 'error'; message: string }

export type SessionInfo = {
  authRequired: boolean
  authed: boolean
  demo: boolean
}
