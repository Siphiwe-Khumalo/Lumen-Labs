import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { Card, Source } from '../../shared/protocol.ts'
import { clock, domainOf, hexTag, usd } from '../lib/format.ts'
import type { Exchange } from '../lib/types.ts'
import type { Timer } from '../hooks/useTimers.ts'

type FrameProps = {
  index: number
  kind: string
  title: string
  tag: string
  footer?: ReactNode
  className?: string
  children: ReactNode
}

/** Shared HUD panel: corner brackets, index + kind header, technical footer, staggered reveal. */
export function Frame({
  index,
  kind,
  title,
  tag,
  footer,
  className = '',
  children,
}: FrameProps) {
  return (
    <article
      className={`panel panel--${kind} ${className}`}
      style={{ '--i': index % 14 } as CSSProperties}
    >
      <span className="panel__corner panel__corner--tl" aria-hidden="true" />
      <span className="panel__corner panel__corner--br" aria-hidden="true" />
      <header className="panel__head">
        <span className="panel__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="panel__kind">{kind}</span>
        <span className="panel__tag">{tag}</span>
      </header>
      <h3 className="panel__title">{title}</h3>
      <div className="panel__body">{children}</div>
      {footer ? <footer className="panel__foot">{footer}</footer> : null}
    </article>
  )
}

function Chart({
  bars,
  unit,
}: {
  bars: { label: string; value: number }[]
  unit?: string
}) {
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1)
  const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
  return (
    <figure
      className="chart"
      role="img"
      aria-label={bars
        .map((b) => `${b.label}: ${b.value}${unit ? ` ${unit}` : ''}`)
        .join(', ')}
    >
      <div className="chart__plot">
        {bars.map((b, i) => (
          <div className="chart__col" key={`${b.label}-${i}`}>
            <span className="chart__value">{fmt.format(b.value)}</span>
            <span
              className="chart__bar"
              style={
                {
                  '--h': `${Math.max(2, (Math.abs(b.value) / max) * 100)}%`,
                  '--j': i,
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>
      <div className="chart__labels">
        {bars.map((b, i) => (
          <span key={`${b.label}-${i}`} title={b.label}>
            {b.label}
          </span>
        ))}
      </div>
      {unit ? <figcaption className="chart__unit">UNIT // {unit}</figcaption> : null}
    </figure>
  )
}

function ImageCard({
  card,
  index,
}: {
  card: Extract<Card, { kind: 'image' }>
  index: number
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  if (state === 'failed') return null
  return (
    <Frame
      index={index}
      kind="image"
      title={card.title}
      tag={hexTag(card.id)}
      className={`panel--media ${state === 'ready' ? 'is-ready' : ''}`}
      footer={
        <a href={card.pageUrl} target="_blank" rel="noopener noreferrer">
          SRC // {domainOf(card.pageUrl)} ↗
        </a>
      }
    >
      <a className="media" href={card.pageUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={card.imageUrl}
          alt={card.caption ?? card.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
        />
        <span className="media__scan" aria-hidden="true" />
      </a>
      {card.caption ? <p className="panel__caption">{card.caption}</p> : null}
    </Frame>
  )
}

export function CardView({ card, index }: { card: Card; index: number }) {
  const tag = hexTag(card.id)
  switch (card.kind) {
    case 'stat':
      return (
        <Frame index={index} kind="stat" title={card.title} tag={tag}>
          <p className="stat">
            <span className="stat__value">{card.value}</span>
            {card.unit ? <span className="stat__unit">{card.unit}</span> : null}
          </p>
          {card.caption ? <p className="panel__caption">{card.caption}</p> : null}
        </Frame>
      )
    case 'chart':
      return (
        <Frame
          index={index}
          kind="chart"
          title={card.title}
          tag={tag}
          className="panel--wide"
        >
          <Chart bars={card.bars} unit={card.unit} />
          {card.caption ? <p className="panel__caption">{card.caption}</p> : null}
        </Frame>
      )
    case 'list':
      return (
        <Frame index={index} kind="list" title={card.title} tag={tag}>
          <ol className="list">
            {card.items.map((item, i) => (
              <li key={i}>
                <span className="list__n">{String(i + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          {card.caption ? <p className="panel__caption">{card.caption}</p> : null}
        </Frame>
      )
    case 'text':
      return (
        <Frame index={index} kind="text" title={card.title} tag={tag}>
          <p className="prose">{card.body}</p>
        </Frame>
      )
    case 'image':
      return <ImageCard card={card} index={index} />
  }
}

const PHASE_LABEL = {
  thinking: 'ANALYSING',
  searching: 'SEARCHING THE WEB',
  composing: 'BUILDING BRIEF',
} as const

export function ResearchCard({ exchange }: { exchange: Exchange }) {
  const running = exchange.status === 'running'
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])
  const elapsed = (exchange.endedAt ?? now) - exchange.startedAt
  const lastQuery = exchange.searches.at(-1)
  const status = running
    ? exchange.phase === 'searching' && lastQuery
      ? `SEARCHING // ${lastQuery}`
      : PHASE_LABEL[exchange.phase ?? 'thinking']
    : exchange.status === 'error'
      ? 'INTERRUPTED'
      : 'BRIEF COMPLETE'

  return (
    <article
      className={`research ${running ? 'is-running' : 'is-done'}`}
      aria-live="polite"
    >
      <span className="panel__corner panel__corner--tl" aria-hidden="true" />
      <span className="panel__corner panel__corner--br" aria-hidden="true" />
      <header className="research__head">
        <span>
          RESEARCH //{' '}
          <b>
            {running ? 'ACTIVE' : exchange.status === 'error' ? 'HALTED' : 'COMPLETE'}
          </b>
        </span>
        <span className="research__clock">{clock(elapsed)}</span>
      </header>
      <h2 className="research__title">{exchange.query}</h2>
      <p className="research__status">{status}</p>
      <div className="research__bar" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} style={{ '--k': i } as CSSProperties} />
        ))}
      </div>
      <footer className="research__meta">
        <span>{exchange.cards.length} BLOCKS</span>
        <span>{exchange.searches.length} QUERIES</span>
        <span>{exchange.sources.length} SOURCES</span>
        <span>{exchange.mode === 'deep' ? 'DEEP' : 'QUICK'}</span>
        <span>≈ {usd(exchange.costUsd)}</span>
      </footer>
    </article>
  )
}

export function PhotoCard({ exchange }: { exchange: Exchange }) {
  return (
    <Frame
      index={0}
      kind="input"
      title="Your photo"
      tag={hexTag(`${exchange.id}-img`)}
      className="panel--photo"
      footer={<span>QUERY // {exchange.query}</span>}
    >
      {exchange.image ? (
        <div className="media media--photo">
          <img src={exchange.image} alt="The photo you shared" />
          <span className="media__scan" aria-hidden="true" />
          <span className="media__reticle" aria-hidden="true" />
        </div>
      ) : (
        <p className="prose prose--muted">Photos are not kept in history.</p>
      )}
    </Frame>
  )
}

export function AnswerCard({ exchange }: { exchange: Exchange }) {
  const running = exchange.status === 'running'
  return (
    <Frame
      index={0}
      kind="brief"
      title="Lumen // Response"
      tag={hexTag(exchange.id)}
      className="panel--answer"
    >
      {exchange.answer ? (
        <p className="prose prose--lead">
          {exchange.answer}
          {running ? <span className="caret" aria-hidden="true" /> : null}
        </p>
      ) : exchange.error ? (
        <p className="prose prose--error">{exchange.error}</p>
      ) : (
        <p className="prose prose--muted">
          Compiling response
          <span className="caret" aria-hidden="true" />
        </p>
      )}
    </Frame>
  )
}

export function SourcesCard({ sources, index }: { sources: Source[]; index: number }) {
  return (
    <Frame
      index={index}
      kind="sources"
      title={`Sources // ${sources.length}`}
      tag="REF"
      className="panel--sources"
    >
      <ol className="sources">
        {sources.slice(0, 12).map((s, i) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              <span className="sources__n">[{i + 1}]</span>
              <span className="sources__title">{s.title}</span>
              <span className="sources__domain">{domainOf(s.url)} ↗</span>
            </a>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

export function TimerCard({
  timer,
  now,
  onDismiss,
}: {
  timer: Timer
  now: number
  onDismiss: () => void
}) {
  const left = Math.max(0, timer.endsAt - now)
  const progress = timer.done ? 1 : 1 - left / timer.total
  return (
    <article
      className={`timer ${timer.done ? 'is-done' : ''}`}
      style={{ '--p': progress } as CSSProperties}
      aria-live={timer.done ? 'assertive' : 'off'}
    >
      <span className="timer__label">
        {/^timer$/i.test(timer.label) ? 'TIMER' : `TIMER // ${timer.label}`}
      </span>
      <span className="timer__time">{timer.done ? 'DONE' : clock(left)}</span>
      <span className="timer__track" aria-hidden="true" />
      <button type="button" className="chip" onClick={onDismiss}>
        {timer.done ? 'DISMISS' : 'CANCEL'}
      </button>
    </article>
  )
}
