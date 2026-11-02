import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import type { Mode } from '../../shared/protocol.ts'
import { usd } from '../lib/format.ts'
import type { Exchange } from '../lib/types.ts'
import type { Meter } from '../hooks/useMicMeter.ts'

function Mark() {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".35"
        strokeDasharray="2 3"
      />
    </svg>
  )
}

type TopBarProps = {
  mode: Mode
  onMode: (mode: Mode) => void
  voiceOn: boolean
  onVoice: () => void
  textMode: boolean
  onText: () => void
  onHistory: () => void
  onClear: () => void
  sessionCost: number
  demo: boolean
  canLock: boolean
  onLock: () => void
}

export function TopBar(p: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <Mark />
        <span className="brand__name">LUMEN</span>
        <span className="brand__meta">
          <i className="dot" aria-hidden="true" /> {p.demo ? 'DEMO MODE' : 'AI // ONLINE'}
        </span>
      </div>
      <nav className="toolbar" aria-label="Lumen controls">
        <button type="button" className="chip" onClick={p.onHistory}>
          History
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={p.textMode}
          onClick={p.onText}
        >
          Text
        </button>
        <button type="button" className="chip" onClick={p.onClear}>
          Clear view
        </button>
        <div className="segmented" role="radiogroup" aria-label="Answer depth">
          {(['quick', 'deep'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={p.mode === m}
              className="segmented__opt"
              onClick={() => p.onMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="chip"
          aria-pressed={p.voiceOn}
          onClick={p.onVoice}
        >
          Voice {p.voiceOn ? 'on' : 'off'}
        </button>
        {p.canLock ? (
          <button type="button" className="chip" onClick={p.onLock}>
            Lock
          </button>
        ) : null}
      </nav>
      <div className="cost" title="Estimated API spend this session">
        <span className="cost__label">SESSION</span>
        <span className="cost__value">≈ {usd(p.sessionCost)}</span>
      </div>
    </header>
  )
}

function MeterBar({ meter }: { meter: Meter }) {
  const segments = 18
  const lit = meter ? Math.round(((meter.lvl + 60) / 50) * segments) : 0
  return (
    <div className="meter" aria-hidden="true">
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={i < lit ? (i > segments * 0.8 ? 'hot' : 'on') : ''} />
      ))}
    </div>
  )
}

type BottomBarProps = {
  listening: boolean
  busy: boolean
  micMuted: boolean
  onMute: () => void
  meter: Meter
  status: string
  textMode: boolean
  onSubmit: (text: string) => void
  onTalk: () => void
}

export function BottomBar(p: BottomBarProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (p.textMode) inputRef.current?.focus()
  }, [p.textMode])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    p.onSubmit(text)
    setDraft('')
  }

  return (
    <footer className="bottombar">
      <div className="bottombar__levels">
        <MeterBar meter={p.meter} />
        <span className="readout">
          LVL {p.meter ? p.meter.lvl.toFixed(1) : '--.-'} dB
        </span>
        <span className="readout">PK {p.meter ? p.meter.pk.toFixed(1) : '--.-'} dB</span>
        <button
          type="button"
          className="chip chip--small"
          aria-pressed={p.micMuted}
          onClick={p.onMute}
        >
          {p.micMuted ? 'Mic off' : 'Mute'}
        </button>
      </div>

      {p.textMode ? (
        <form className="composer" onSubmit={submit}>
          <span className="composer__prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Lumen anything…"
            aria-label="Message Lumen"
            enterKeyHint="send"
            autoComplete="off"
          />
          <button type="submit" className="chip chip--accent" disabled={!draft.trim()}>
            Send
          </button>
        </form>
      ) : (
        <p className={`transcript ${p.listening ? 'is-live' : ''}`} aria-live="polite">
          {p.status}
        </p>
      )}

      <button
        type="button"
        className={`talk ${p.listening ? 'is-listening' : ''} ${p.busy ? 'is-busy' : ''}`}
        onClick={p.onTalk}
        disabled={p.micMuted}
        aria-label={p.listening ? 'Stop listening' : 'Talk to Lumen'}
      >
        <span className="talk__ring" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {p.listening ? (
            <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />
          ) : (
            <path
              fill="currentColor"
              d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Zm6-3.5a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.09A6 6 0 0 0 18 11Z"
            />
          )}
        </svg>
      </button>
    </footer>
  )
}

type HistoryProps = {
  open: boolean
  exchanges: Exchange[]
  currentId: string | null
  onPick: (id: string) => void
  onClose: () => void
  onClearAll: () => void
}

export function HistoryDrawer({
  open,
  exchanges,
  currentId,
  onPick,
  onClose,
  onClearAll,
}: HistoryProps) {
  const items = [...exchanges].reverse()
  return (
    <>
      <div
        className={`scrim ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${open ? 'is-open' : ''}`}
        aria-label="History"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="drawer__head">
          <span>HISTORY // {exchanges.length}</span>
          <button type="button" className="chip chip--small" onClick={onClose}>
            Close
          </button>
        </header>
        {items.length === 0 ? (
          <p className="drawer__empty">Nothing yet. Ask Lumen something.</p>
        ) : (
          <ol className="drawer__list">
            {items.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  className={x.id === currentId ? 'is-current' : ''}
                  onClick={() => onPick(x.id)}
                >
                  <span className="drawer__q">{x.query}</span>
                  <span className="drawer__meta">
                    {new Date(x.startedAt).toLocaleString(undefined, {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {x.mode.toUpperCase()} · {x.cards.length} BLOCKS · ≈{' '}
                    {usd(x.costUsd)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
        {items.length > 0 ? (
          <button type="button" className="chip drawer__clear" onClick={onClearAll}>
            Clear history
          </button>
        ) : null}
      </aside>
    </>
  )
}

export function LockScreen({
  onUnlock,
}: {
  onUnlock: (passcode: string) => Promise<string | null>
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code || busy) return
    setBusy(true)
    const err = await onUnlock(code)
    setBusy(false)
    if (err) {
      setError(err)
      setCode('')
    }
  }

  return (
    <form className="lock" onSubmit={submit}>
      <span className="lock__tag">LUMEN // SECURE ACCESS</span>
      <h1 className="lock__title">Identify</h1>
      <input
        type="password"
        inputMode="text"
        autoComplete="current-password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Passcode"
        aria-label="Passcode"
        autoFocus
      />
      <button type="submit" className="chip chip--accent" disabled={busy || !code}>
        {busy ? 'Verifying…' : 'Unlock'}
      </button>
      <p
        className="lock__error"
        role="alert"
        style={{ '--show': error ? 1 : 0 } as CSSProperties}
      >
        {error ?? ''}
      </p>
    </form>
  )
}
