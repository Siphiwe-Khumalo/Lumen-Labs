import { useCallback, useEffect, useRef, useState } from 'react'
import type { HistoryTurn, Mode, SessionInfo, TurnEvent } from '../shared/protocol.ts'
import {
  AnswerCard,
  CardView,
  ResearchCard,
  SourcesCard,
  TimerCard,
} from './components/Cards.tsx'
import { BottomBar, HistoryDrawer, LockScreen, TopBar } from './components/Chrome.tsx'
import { Orb, type OrbState } from './components/Orb.tsx'
import { useMicMeter } from './hooks/useMicMeter.ts'
import { useSpeechIn } from './hooks/useSpeechIn.ts'
import { useSpeechOut } from './hooks/useSpeechOut.ts'
import { useTimers } from './hooks/useTimers.ts'
import { getSession, LockedError, login, logout, streamTurn } from './lib/api.ts'
import { greeting } from './lib/format.ts'
import { load, save } from './lib/storage.ts'
import type { Exchange } from './lib/types.ts'

const HISTORY_KEY = 'lumen.history.v1'
const PREFS_KEY = 'lumen.prefs.v1'
const MAX_HISTORY = 30

type Prefs = { mode: Mode; voiceOn: boolean }

function toHistory(exchanges: Exchange[]): HistoryTurn[] {
  return exchanges
    .filter((x) => x.status === 'done' && x.answer.trim())
    .slice(-6)
    .map((x) => ({
      user: x.query,
      assistant: x.cards.length
        ? `${x.answer}\n[Cards shown: ${x.cards.map((c) => c.title).join('; ')}]`
        : x.answer,
    }))
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [offline, setOffline] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(() =>
    load(PREFS_KEY, { mode: 'quick', voiceOn: true }),
  )
  const [exchanges, setExchanges] = useState<Exchange[]>(() =>
    load<Exchange[]>(HISTORY_KEY, []).filter((x) => x.status !== 'running'),
  )
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [cleared, setCleared] = useState(false)
  // Start in typing mode where the browser has no speech recognition (e.g. Firefox).
  const [textMode, setTextMode] = useState(
    () => !(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [sessionCost, setSessionCost] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const costSeen = useRef(new Map<string, number>())
  const now = useClock()

  useEffect(() => save(PREFS_KEY, prefs), [prefs])
  useEffect(() => {
    const done = exchanges.filter((x) => x.status !== 'running').slice(-MAX_HISTORY)
    save(HISTORY_KEY, done)
  }, [exchanges])

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch((e: Error) => setOffline(e.message))
  }, [])

  const speech = useSpeechOut(prefs.voiceOn)
  const { add: addTimer, ...timerState } = useTimers((t) =>
    speech.say(`${t.label} timer is done.`),
  )

  const update = useCallback((id: string, fn: (x: Exchange) => Exchange) => {
    setExchanges((list) => list.map((x) => (x.id === id ? fn(x) : x)))
  }, [])

  const handleEvent = useCallback(
    (id: string, e: TurnEvent) => {
      switch (e.type) {
        case 'status':
          return update(id, (x) => ({ ...x, phase: e.phase }))
        case 'search':
          return update(id, (x) => ({ ...x, searches: [...x.searches, e.query] }))
        case 'sources':
          return update(id, (x) => ({ ...x, sources: e.items }))
        case 'card':
          return update(id, (x) => ({ ...x, cards: [...x.cards, e.card] }))
        case 'timer':
          return addTimer(e.id, e.seconds, e.label)
        case 'delta':
          speech.feed(e.text)
          return update(id, (x) => ({ ...x, answer: x.answer + e.text }))
        case 'usage': {
          const prev = costSeen.current.get(id) ?? 0
          costSeen.current.set(id, e.costUsd)
          setSessionCost((c) => c + (e.costUsd - prev))
          return update(id, (x) => ({ ...x, costUsd: e.costUsd }))
        }
        case 'error':
          speech.flush()
          return update(id, (x) => ({
            ...x,
            status: 'error',
            error: e.message,
            endedAt: Date.now(),
          }))
        case 'done':
          speech.flush()
          return update(id, (x) =>
            x.status === 'running' ? { ...x, status: 'done', endedAt: Date.now() } : x,
          )
      }
    },
    [update, speech, addTimer],
  )

  const ask = useCallback(
    async (text: string) => {
      abortRef.current?.abort()
      speech.cancel()
      const controller = new AbortController()
      abortRef.current = controller
      const exchange: Exchange = {
        id: crypto.randomUUID(),
        query: text,
        mode: prefs.mode,
        startedAt: Date.now(),
        answer: '',
        cards: [],
        sources: [],
        searches: [],
        costUsd: 0,
        status: 'running',
        phase: 'thinking',
      }
      const history = toHistory(exchanges)
      setExchanges((list) => [...list, exchange])
      setCurrentId(exchange.id)
      setCleared(false)

      try {
        const events = streamTurn(
          {
            text,
            mode: prefs.mode,
            history,
            context: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              localTime: new Date().toLocaleString('en-ZA', {
                dateStyle: 'full',
                timeStyle: 'short',
              }),
            },
          },
          controller.signal,
        )
        for await (const event of events) handleEvent(exchange.id, event)
        update(exchange.id, (x) =>
          x.status === 'running' ? { ...x, status: 'done', endedAt: Date.now() } : x,
        )
      } catch (err) {
        if (controller.signal.aborted) {
          update(exchange.id, (x) => ({
            ...x,
            status: 'error',
            error: 'Cancelled.',
            endedAt: Date.now(),
          }))
          return
        }
        if (err instanceof LockedError) {
          setSession((s) => (s ? { ...s, authed: false } : s))
        }
        const message = err instanceof Error ? err.message : 'Connection lost.'
        update(exchange.id, (x) => ({
          ...x,
          status: 'error',
          error: message,
          endedAt: Date.now(),
        }))
      } finally {
        if (abortRef.current === controller) abortRef.current = null
      }
    },
    [exchanges, prefs.mode, handleEvent, update, speech],
  )

  const listen = useSpeechIn(ask)
  const mic = useMicMeter(listen.listening)

  const cancelAll = useCallback(() => {
    listen.cancel()
    speech.cancel()
    abortRef.current?.abort()
  }, [listen, speech])

  const talk = useCallback(() => {
    if (micMuted) return
    if (listen.listening) return listen.stop()
    speech.cancel()
    abortRef.current?.abort()
    setTextMode(false)
    listen.start()
  }, [micMuted, listen, speech])

  // Space to talk, Escape to cancel (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      if (e.code === 'Space' && !e.repeat && !target.closest('button, a')) {
        e.preventDefault()
        talk()
      } else if (e.key === 'Escape') {
        if (historyOpen) setHistoryOpen(false)
        else cancelAll()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [talk, cancelAll, historyOpen])

  const current = exchanges.find((x) => x.id === currentId) ?? null
  const shown = cleared ? null : current
  const running = current?.status === 'running'
  const docked = Boolean(shown && (shown.cards.length > 0 || shown.searches.length > 0))

  const orbState: OrbState = listen.listening
    ? 'listening'
    : speech.speaking
      ? 'speaking'
      : running
        ? 'thinking'
        : 'idle'

  const getLevel = useCallback(() => {
    const t = performance.now()
    if (listen.listening) {
      if (mic.levelRef.current > 0) return mic.levelRef.current
      // Android: no meter, so pulse from recognition activity instead.
      const since = t - listen.activityRef.current
      return since < 600 ? 0.35 + 0.3 * Math.abs(Math.sin(t / 90)) : 0.12
    }
    if (speech.speaking) {
      const since = t - speech.pulseRef.current
      return (
        0.25 + 0.35 * Math.max(0, 1 - since / 400) + 0.1 * Math.abs(Math.sin(t / 110))
      )
    }
    return 0
  }, [
    listen.listening,
    listen.activityRef,
    mic.levelRef,
    speech.speaking,
    speech.pulseRef,
  ])

  const status = listen.listening
    ? listen.interim || 'Listening…'
    : listen.error
      ? listen.error
      : running
        ? current?.phase === 'searching'
          ? `Searching: ${current.searches.at(-1) ?? 'the web'}`
          : current?.phase === 'composing'
            ? 'Building your brief…'
            : 'Thinking…'
        : micMuted
          ? 'Microphone muted'
          : speech.speaking
            ? 'Speaking… press Esc to stop'
            : matchMedia('(pointer: coarse)').matches
              ? 'Tap the mic to talk'
              : 'Press SPACE or click the mic to talk'

  if (offline) {
    return (
      <div className="hud hud--center">
        <p className="notice">LUMEN // OFFLINE — {offline}</p>
      </div>
    )
  }
  if (!session) return <div className="hud hud--center" />
  if (session.authRequired && !session.authed) {
    return (
      <div className="hud hud--center">
        <div className="hud__bg" aria-hidden="true" />
        <Orb state="idle" getLevel={() => 0} className="orb orb--lock" />
        <LockScreen
          onUnlock={async (code) => {
            const err = await login(code)
            if (!err) setSession({ ...session, authed: true })
            return err
          }}
        />
      </div>
    )
  }

  const timeText = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateText = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className={`hud ${docked ? 'is-docked' : ''}`} data-state={orbState}>
      <div className="hud__bg" aria-hidden="true" />
      <TopBar
        mode={prefs.mode}
        onMode={(mode) => setPrefs((p) => ({ ...p, mode }))}
        voiceOn={prefs.voiceOn}
        onVoice={() => {
          if (prefs.voiceOn) speech.cancel()
          setPrefs((p) => ({ ...p, voiceOn: !p.voiceOn }))
        }}
        textMode={textMode}
        onText={() => setTextMode((v) => !v)}
        onHistory={() => setHistoryOpen(true)}
        onClear={() => {
          cancelAll()
          setCleared(true)
        }}
        sessionCost={sessionCost}
        demo={session.demo}
        canLock={session.authRequired}
        onLock={async () => {
          cancelAll()
          await logout()
          setSession({ ...session, authed: false })
        }}
      />

      <main className="stage">
        <section className="core">
          <button
            type="button"
            className="orb-button"
            onClick={talk}
            aria-label={listen.listening ? 'Stop listening' : 'Talk to Lumen'}
          >
            <Orb state={orbState} getLevel={getLevel} label={!docked} className="orb" />
          </button>

          {!docked ? (
            <div className="caption">
              {shown ? (
                <>
                  <p className="caption__you">
                    <span>YOU //</span> {shown.query}
                  </p>
                  <p
                    className={`caption__answer ${shown.status === 'error' ? 'is-error' : ''}`}
                  >
                    {shown.answer || shown.error || (running ? 'Processing…' : '')}
                  </p>
                </>
              ) : (
                <>
                  <p className="caption__time">{timeText}</p>
                  <p className="caption__greet">
                    {greeting(now)}. <span>{dateText}</span>
                  </p>
                </>
              )}
            </div>
          ) : null}
        </section>

        {timerState.timers.length > 0 ? (
          <section className="timers" aria-label="Timers">
            {timerState.timers.map((t) => (
              <TimerCard
                key={t.id}
                timer={t}
                now={timerState.now}
                onDismiss={() => timerState.dismiss(t.id)}
              />
            ))}
          </section>
        ) : null}

        {docked && shown ? (
          <section className="wall" aria-label="Results">
            <ResearchCard exchange={shown} />
            <AnswerCard exchange={shown} />
            {shown.cards.map((card, i) => (
              <CardView key={card.id} card={card} index={i + 1} />
            ))}
            {shown.sources.length > 0 ? (
              <SourcesCard sources={shown.sources} index={shown.cards.length + 1} />
            ) : null}
          </section>
        ) : null}
      </main>

      <BottomBar
        listening={listen.listening}
        busy={running}
        micMuted={micMuted}
        onMute={() => {
          if (!micMuted) listen.cancel()
          setMicMuted((m) => !m)
        }}
        meter={mic.meter}
        status={status}
        textMode={textMode}
        onSubmit={ask}
        onTalk={talk}
      />

      <HistoryDrawer
        open={historyOpen}
        exchanges={exchanges}
        currentId={currentId}
        onPick={(id) => {
          setCurrentId(id)
          setCleared(false)
          setHistoryOpen(false)
        }}
        onClose={() => setHistoryOpen(false)}
        onClearAll={() => {
          setExchanges((list) => list.filter((x) => x.status === 'running'))
          setCurrentId(null)
        }}
      />
    </div>
  )
}
