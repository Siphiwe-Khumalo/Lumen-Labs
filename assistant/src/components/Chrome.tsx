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

export type Settings = { voiceOn: boolean; soundOn: boolean; converse: boolean }

const SETTING_LABELS: Record<keyof Settings, { name: string; hint: string }> = {
  voiceOn: { name: 'Spoken replies', hint: 'Lumen reads answers aloud' },
  converse: { name: 'Keep talking', hint: 'Mic reopens after an answer for a follow-up' },
  soundOn: { name: 'Interface sounds', hint: 'Boot-up, blips and ticks' },
}

function SettingsMenu({
  settings,
  onToggle,
  canLock,
  onLock,
}: {
  settings: Settings
  onToggle: (key: keyof Settings) => void
  canLock: boolean
  onLock: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="settings" ref={rootRef}>
      <button
        type="button"
        className="chip"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        Settings
      </button>
      {open ? (
        <div className="settings__panel" role="group" aria-label="Settings">
          <span className="settings__head">SYSTEM // SETTINGS</span>
          {(Object.keys(SETTING_LABELS) as (keyof Settings)[]).map((key) => (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={settings[key]}
              className="toggle"
              onClick={() => onToggle(key)}
            >
              <span className="toggle__text">
                <span className="toggle__name">{SETTING_LABELS[key].name}</span>
                <span className="toggle__hint">{SETTING_LABELS[key].hint}</span>
              </span>
              <span className="toggle__switch" aria-hidden="true" />
            </button>
          ))}
          {canLock ? (
            <button type="button" className="chip settings__lock" onClick={onLock}>
              Lock Lumen
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type TopBarProps = {
  mode: Mode
  onMode: (mode: Mode) => void
  settings: Settings
  onToggle: (key: keyof Settings) => void
  textMode: boolean
  onText: () => void
  onHistory: () => void
  onClear: () => void
  onBrief: () => void
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
        <button type="button" className="chip chip--accent" onClick={p.onBrief}>
          Brief me
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
        <SettingsMenu
          settings={p.settings}
          onToggle={p.onToggle}
          canLock={p.canLock}
          onLock={p.onLock}
        />
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
  photo: string | null
  onPhoto: (file: File) => void
  onClearPhoto: () => void
}

export function BottomBar(p: BottomBarProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
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
      {p.photo ? (
        <div className="attachment" role="status">
          <img src={p.photo} alt="" />
          <span className="attachment__text">
            <b>PHOTO // LOCKED</b>
            <span>Ask about it, or stay quiet and I’ll describe it</span>
          </span>
          <button
            type="button"
            className="chip chip--small"
            onClick={p.onClearPhoto}
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      ) : null}
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) p.onPhoto(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        className="lens"
        onClick={() => fileRef.current?.click()}
        aria-label="Show Lumen a photo"
        title="Show Lumen a photo (or paste / drop one)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"
          />
          <circle
            cx="12"
            cy="13"
            r="3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
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

const BOOT_LINES = (demo: boolean, voice: boolean) => [
  ['CORE SYSTEMS', 'ONLINE'],
  ['VOICE I/O', voice ? 'READY' : 'TEXT ONLY'],
  ['OPTICS', 'READY'],
  ['NETWORK LINK', 'SECURE'],
  ['CLAUDE UPLINK', demo ? 'DEMO' : 'ESTABLISHED'],
]

/** Startup readout shown once per launch while the HUD powers up. */
export function BootSequence({ demo, voice }: { demo: boolean; voice: boolean }) {
  return (
    <div className="boot" aria-hidden="true">
      <span className="boot__title">LUMEN OS // v0.2</span>
      {BOOT_LINES(demo, voice).map(([label, value], i) => (
        <span key={label} className="boot__line" style={{ '--n': i } as CSSProperties}>
          <span>&gt; {label}</span>
          <span className="boot__dots" />
          <b>{value}</b>
        </span>
      ))}
    </div>
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
                    · {x.briefing ? 'BRIEFING' : x.mode.toUpperCase()}
                    {x.hasImage ? ' · PHOTO' : ''} · {x.cards.length} BLOCKS · ≈{' '}
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
