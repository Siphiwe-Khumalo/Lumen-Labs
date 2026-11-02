import { useCallback, useEffect, useRef, useState } from 'react'
import type { HistoryTurn, Mode, SessionInfo, TurnEvent } from '../shared/protocol.ts'
import {
  AnswerCard,
  CardView,
  PhotoCard,
  ResearchCard,
  SourcesCard,
  TimerCard,
} from './components/Cards.tsx'
import {
  BootSequence,
  BottomBar,
  HistoryDrawer,
  LockScreen,
  TopBar,
  type Settings,
} from './components/Chrome.tsx'
import { Orb, type OrbState } from './components/Orb.tsx'
import { useMicMeter } from './hooks/useMicMeter.ts'
import { useSpeechIn } from './hooks/useSpeechIn.ts'
import { useSpeechOut } from './hooks/useSpeechOut.ts'
import { useTimers } from './hooks/useTimers.ts'
import { getSession, LockedError, login, logout, streamTurn } from './lib/api.ts'
import { greeting } from './lib/format.ts'
import { prepareImage, type Attachment } from './lib/image.ts'
import { primeAudio, setSoundEnabled, sfx } from './lib/sfx.ts'
import { load, save } from './lib/storage.ts'
import type { Exchange } from './lib/types.ts'

const HISTORY_KEY = 'lumen.history.v1'
const PREFS_KEY = 'lumen.prefs.v1'
const MAX_HISTORY = 30
const BOOT_MS = 2600
const PHOTO_QUESTION = "What's this? Tell me what you see."
// Said the moment a web search starts, so there's never a silent wait.
const ACKS = ['One sec.', 'Let me check.', 'Checking now.', 'On it.', 'Looking that up.']
const BRIEFING_PATTERN =
  /^(brief me|(give me )?(my |the )?(morning |daily |evening )?briefing|morning brief)\b/i

type Prefs = Settings & { mode: Mode }
type AskOptions = { voice?: boolean; briefing?: boolean }

const DEFAULT_PREFS: Prefs = {
  mode: 'quick',
  voiceOn: true,
  soundOn: true,
  converse: true,
}

function toHistory(exchanges: Exchange[]): HistoryTurn[] {
  return exchanges
    .filter((x) => x.status === 'done' && x.answer.trim())
    .slice(-6)
    .map((x) => ({
      user: x.briefing
        ? 'Give me my daily briefing.'
        : x.hasImage
          ? `[I shared a photo] ${x.query}`
          : x.query,
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

/** Keeps a ref pointing at the latest value, for callbacks that outlive a render. */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [offline, setOffline] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(() => ({
    ...DEFAULT_PREFS,
    ...load<Partial<Prefs>>(PREFS_KEY, {}),
  }))
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
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [followUpFor, setFollowUpFor] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const costSeen = useRef(new Map<string, number>())
  /** Exchanges that have already spoken (an acknowledgement or the answer). */
  const spokeFor = useRef(new Set<string>())
  /** The power-up sound plays once, on the first interaction shortly after launch. */
  const bootSoundPending = useRef(true)
  const now = useClock()

  const prefsRef = useLatest(prefs)
  const attachmentRef = useLatest(attachment)
  const micMutedRef = useLatest(micMuted)

  useEffect(() => save(PREFS_KEY, prefs), [prefs])
  useEffect(() => setSoundEnabled(prefs.soundOn), [prefs.soundOn])
  useEffect(() => {
    // Photos stay in memory only; history keeps the text.
    const done = exchanges
      .filter((x) => x.status !== 'running')
      .slice(-MAX_HISTORY)
      .map((x) => ({ ...x, image: undefined }))
    save(HISTORY_KEY, done)
  }, [exchanges])

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch((e: Error) => setOffline(e.message))
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setBooting(false), BOOT_MS)
    const late = setTimeout(() => {
      bootSoundPending.current = false
    }, 6000)
    return () => {
      clearTimeout(id)
      clearTimeout(late)
    }
  }, [])

  // Browsers only allow sound after a gesture: unlock audio on the first tap or key,
  // and play the power-up if that happens while the HUD is still booting.
  useEffect(() => {
    const first = () => {
      primeAudio()
      if (bootSoundPending.current) {
        bootSoundPending.current = false
        sfx.boot()
      }
      window.removeEventListener('pointerdown', first)
      window.removeEventListener('keydown', first)
    }
    window.addEventListener('pointerdown', first)
    window.addEventListener('keydown', first)
    return () => {
      window.removeEventListener('pointerdown', first)
      window.removeEventListener('keydown', first)
    }
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
          if (!spokeFor.current.has(id)) {
            spokeFor.current.add(id)
            speech.say(ACKS[Math.floor(Math.random() * ACKS.length)])
          }
          return update(id, (x) => ({ ...x, searches: [...x.searches, e.query] }))
        case 'sources':
          return update(id, (x) => ({ ...x, sources: e.items }))
        case 'card':
          sfx.card()
          return update(id, (x) => ({ ...x, cards: [...x.cards, e.card] }))
        case 'timer':
          return addTimer(e.id, e.seconds, e.label)
        case 'delta':
          spokeFor.current.add(id)
          speech.feed(e.text)
          return update(id, (x) => ({ ...x, answer: x.answer + e.text }))
        case 'usage': {
          const prev = costSeen.current.get(id) ?? 0
          costSeen.current.set(id, e.costUsd)
          setSessionCost((c) => c + (e.costUsd - prev))
          return update(id, (x) => ({ ...x, costUsd: e.costUsd }))
        }
        case 'error':
          sfx.error()
          speech.flush()
          return update(id, (x) => ({
            ...x,
            status: 'error',
            error: e.message,
            endedAt: Date.now(),
          }))
        case 'done':
          sfx.done()
          speech.flush()
          return update(id, (x) =>
            x.status === 'running' ? { ...x, status: 'done', endedAt: Date.now() } : x,
          )
      }
    },
    [update, speech, addTimer],
  )

  const ask = useCallback(
    async (rawText: string, opts: AskOptions = {}) => {
      abortRef.current?.abort()
      speech.cancel()
      setFollowUpFor(null)
      setNotice(null)
      const controller = new AbortController()
      abortRef.current = controller

      const text = rawText.trim()
      const briefing = Boolean(opts.briefing) || BRIEFING_PATTERN.test(text)
      const image = briefing ? null : attachmentRef.current
      setAttachment(null)
      const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      const exchange: Exchange = {
        id: crypto.randomUUID(),
        query: briefing ? `Daily briefing // ${dateLabel}` : text,
        mode: prefs.mode,
        startedAt: Date.now(),
        answer: '',
        cards: [],
        sources: [],
        searches: [],
        costUsd: 0,
        status: 'running',
        phase: 'thinking',
        voice: opts.voice,
        briefing,
        hasImage: Boolean(image),
        image: image?.preview,
      }
      const history = toHistory(exchanges)
      setExchanges((list) => [...list, exchange])
      setCurrentId(exchange.id)
      setCleared(false)

      let failed = false
      try {
        const events = streamTurn(
          {
            text: briefing ? 'Daily briefing' : text,
            mode: prefs.mode,
            history,
            context: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              localTime: new Date().toLocaleString('en-ZA', {
                dateStyle: 'full',
                timeStyle: 'short',
              }),
            },
            image: image ? { mediaType: image.mediaType, data: image.data } : undefined,
            briefing: briefing || undefined,
          },
          controller.signal,
        )
        for await (const event of events) {
          if (event.type === 'error') failed = true
          handleEvent(exchange.id, event)
        }
        update(exchange.id, (x) =>
          x.status === 'running' ? { ...x, status: 'done', endedAt: Date.now() } : x,
        )
        // Spoken conversation: reopen the mic for a follow-up once Lumen stops talking.
        if (!failed && opts.voice && prefsRef.current.converse)
          setFollowUpFor(exchange.id)
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
        sfx.error()
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
    [exchanges, prefs.mode, handleEvent, update, speech, attachmentRef, prefsRef],
  )
  const askRef = useLatest(ask)

  const listen = useSpeechIn((text) => {
    sfx.listenEnd()
    void askRef.current(text, { voice: true })
  })
  const mic = useMicMeter(listen.listening)
  const { isBusy } = speech
  const startListening = listen.start

  const describePhotoIfSilent = useCallback(() => {
    if (attachmentRef.current) void askRef.current(PHOTO_QUESTION, { voice: true })
  }, [attachmentRef, askRef])

  const cancelAll = useCallback(() => {
    setFollowUpFor(null)
    listen.cancel()
    speech.cancel()
    abortRef.current?.abort()
  }, [listen, speech])

  const talk = useCallback(() => {
    if (micMuted) return
    if (listen.listening && !listen.passive) return listen.stop()
    speech.cancel()
    abortRef.current?.abort()
    setFollowUpFor(null)
    setTextMode(false)
    setNotice(null)
    primeAudio()
    sfx.listenStart()
    startListening({ onSilence: describePhotoIfSilent })
  }, [micMuted, listen, speech, startListening, describePhotoIfSilent])

  const takePhoto = useCallback(
    async (file: File) => {
      try {
        const prepared = await prepareImage(file)
        sfx.shutter()
        setAttachment(prepared)
        setNotice(null)
        if (!textMode && listen.supported && !micMutedRef.current) {
          speech.cancel()
          abortRef.current?.abort()
          setFollowUpFor(null)
          sfx.listenStart()
          startListening({ quiet: true, onSilence: describePhotoIfSilent })
        }
      } catch (err) {
        sfx.error()
        setNotice(err instanceof Error ? err.message : 'Could not read that photo.')
      }
    },
    [
      textMode,
      listen.supported,
      micMutedRef,
      speech,
      startListening,
      describePhotoIfSilent,
    ],
  )
  const takePhotoRef = useLatest(takePhoto)

  // Follow-up: once Lumen has finished speaking, listen quietly for a reply.
  useEffect(() => {
    if (!followUpFor) return
    let calm = 0
    const id = setInterval(() => {
      if (isBusy()) {
        calm = 0
        return
      }
      if (++calm < 3) return
      clearInterval(id)
      setFollowUpFor(null)
      if (
        micMutedRef.current ||
        document.visibilityState !== 'visible' ||
        abortRef.current
      ) {
        return
      }
      sfx.listenStart()
      startListening({ quiet: true })
    }, 200)
    return () => clearInterval(id)
  }, [followUpFor, isBusy, startListening, micMutedRef])

  // Paste or drop a photo anywhere on the HUD.
  useEffect(() => {
    const imageFrom = (files?: FileList | null) =>
      [...(files ?? [])].find((f) => f.type.startsWith('image/'))
    const onPaste = (e: ClipboardEvent) => {
      const file = imageFrom(e.clipboardData?.files)
      if (file) {
        e.preventDefault()
        void takePhotoRef.current(file)
      }
    }
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    const onDrop = (e: DragEvent) => {
      const file = imageFrom(e.dataTransfer?.files)
      if (file) {
        e.preventDefault()
        void takePhotoRef.current(file)
      }
    }
    window.addEventListener('paste', onPaste)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('paste', onPaste)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [takePhotoRef])

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
  const docked = Boolean(
    shown &&
    (shown.cards.length > 0 ||
      shown.searches.length > 0 ||
      shown.hasImage ||
      shown.briefing),
  )

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

  const coarse = matchMedia('(pointer: coarse)').matches
  const status = listen.listening
    ? listen.interim ||
      (attachment
        ? 'Photo ready. Ask about it, or stay quiet and I’ll describe it…'
        : listen.passive
          ? 'Listening for a follow-up… just keep talking'
          : 'Listening…')
    : notice
      ? notice
      : listen.error
        ? listen.error
        : running
          ? current?.phase === 'searching'
            ? `Searching: ${current.searches.at(-1) ?? 'the web'}`
            : current?.phase === 'composing'
              ? 'Building your brief…'
              : 'Thinking…'
          : attachment
            ? 'Photo ready. Tap the mic and ask about it, or type'
            : micMuted
              ? 'Microphone muted'
              : speech.speaking
                ? 'Speaking… press Esc to stop'
                : coarse
                  ? 'Tap the mic to talk, or the lens to show me something'
                  : 'Press SPACE to talk · paste or drop a photo to show me something'

  const toggleSetting = (key: keyof Settings) => {
    if (key === 'voiceOn' && prefs.voiceOn) speech.cancel()
    if (key === 'converse' && prefs.converse) setFollowUpFor(null)
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

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
            primeAudio()
            const err = await login(code)
            if (err) {
              sfx.error()
            } else {
              bootSoundPending.current = false
              sfx.boot()
              setSession({ ...session, authed: true })
            }
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
  const hour = now.getHours()
  const briefLabel =
    hour < 12 ? 'Morning briefing' : hour < 17 ? 'Afternoon briefing' : 'Evening briefing'

  return (
    <div
      className={`hud ${docked ? 'is-docked' : ''} ${booting ? 'is-booting' : ''}`}
      data-state={orbState}
    >
      <div className="hud__bg" aria-hidden="true" />
      <TopBar
        mode={prefs.mode}
        onMode={(mode) => setPrefs((p) => ({ ...p, mode }))}
        settings={prefs}
        onToggle={toggleSetting}
        textMode={textMode}
        onText={() => setTextMode((v) => !v)}
        onHistory={() => setHistoryOpen(true)}
        onClear={() => {
          cancelAll()
          setAttachment(null)
          setCleared(true)
        }}
        onBrief={() => void ask('Daily briefing', { briefing: true })}
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
        {booting && !shown ? (
          <BootSequence demo={session.demo} voice={listen.supported} />
        ) : null}

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
                  <button
                    type="button"
                    className="chip caption__brief"
                    onClick={() => void ask('Daily briefing', { briefing: true })}
                  >
                    ▶ {briefLabel}
                  </button>
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
            {shown.searches.length > 0 || shown.briefing || shown.mode === 'deep' ? (
              <ResearchCard exchange={shown} />
            ) : null}
            {shown.hasImage ? <PhotoCard exchange={shown} /> : null}
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
          if (!micMuted) {
            listen.cancel()
            setFollowUpFor(null)
          }
          setMicMuted((m) => !m)
        }}
        meter={mic.meter}
        status={status}
        textMode={textMode}
        onSubmit={(text) => void ask(text)}
        onTalk={talk}
        photo={attachment?.preview ?? null}
        onPhoto={(file) => void takePhoto(file)}
        onClearPhoto={() => {
          setAttachment(null)
          if (listen.passive) listen.cancel()
        }}
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
