import type { Card, Mode, Source } from '../../shared/protocol.ts'

export type Phase = 'thinking' | 'searching' | 'composing'

export type Exchange = {
  id: string
  query: string
  mode: Mode
  startedAt: number
  endedAt?: number
  answer: string
  cards: Card[]
  sources: Source[]
  searches: string[]
  costUsd: number
  status: 'running' | 'done' | 'error'
  phase?: Phase
  error?: string
  /** Asked by voice (so Lumen may listen for a follow-up afterwards). */
  voice?: boolean
  /** Daily briefing rather than a normal question. */
  briefing?: boolean
  /** A photo was attached. */
  hasImage?: boolean
  /** Preview of the attached photo; kept in memory only, never saved to history. */
  image?: string
}
