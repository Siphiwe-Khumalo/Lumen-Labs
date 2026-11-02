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
}
