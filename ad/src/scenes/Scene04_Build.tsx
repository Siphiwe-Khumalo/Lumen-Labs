// SCENE 04 — WHAT WE BUILD · 12–21s · 270f (DESIGN §7.4).
// ONE 270f component (one Series member), NOT a nested Series. Three beats driven
// by local-frame sub-ranges beatA[0,90)/beatB[90,180)/beatC[180,270). Hard cuts:
// beat-out plays local f70–88, next beat-in local f0–10 — they never share a
// frame. Only the baseline hairline persists for all 270f.

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLOR } from '../config/brand'
import { COPY } from '../config/copy'
import { typeScale } from '../config/typography'
import { safeBox, shortSide, useFormat, type Box } from '../lib/layout'
import { clip } from '../lib/interpolate'
import { ImageReveal, type MaskKind } from '../components/ImageReveal'
import { ImageParallax } from '../components/ImageParallax'
import { SectionTitle } from '../components/SectionTitle'
import { CapabilityCard } from '../components/CapabilityCard'
import type { AssetKey } from '../config/assets'

interface BeatSpec {
  index: string
  title: string
  items: readonly string[]
  main: AssetKey
  inset: AssetKey
  enter: MaskKind
  exit: MaskKind
  stagger: number
  tickColor: string
}

const BEATS: BeatSpec[] = [
  {
    index: COPY.s04.software.index,
    title: COPY.s04.software.title,
    items: COPY.s04.software.items,
    main: 'appsCode',
    inset: 'websites',
    enter: 'wipeLR',
    exit: 'wipeRL',
    stagger: 8,
    tickColor: COLOR.accent,
  },
  {
    index: COPY.s04.infrastructure.index,
    title: COPY.s04.infrastructure.title,
    items: COPY.s04.infrastructure.items,
    main: 'servers',
    inset: 'network',
    enter: 'wipeTB',
    exit: 'wipeBT',
    stagger: 8,
    tickColor: COLOR.steel, // blue-lit beat — one cool tick (still one tick, §7.4)
  },
  {
    index: COPY.s04.control.index,
    title: COPY.s04.control.title,
    items: COPY.s04.control.items,
    main: 'controlPanel',
    inset: 'circuit',
    enter: 'wipeRL',
    exit: 'wipeLR',
    stagger: 7, // 5 items — tighter stagger to fit the 90f beat
    tickColor: COLOR.accent,
  },
]

const BEAT_LEN = 90

const Beat: React.FC<{ spec: BeatSpec; localFrame: number; box: Box; S: number }> = ({
  spec,
  localFrame,
  box,
  S,
}) => {
  const t = typeScale(S)
  const f = localFrame

  // Beat-out wipe (local f70–88): image + cards clip off in exit direction.
  const out = clip(f, [70, 88], [0, 1])
  const exitHidden = out * 100
  const exitClip =
    spec.exit === 'wipeRL'
      ? `inset(0 0 0 ${exitHidden}%)`
      : spec.exit === 'wipeLR'
        ? `inset(0 ${exitHidden}% 0 0)`
        : spec.exit === 'wipeBT'
          ? `inset(${exitHidden}% 0 0 0)`
          : `inset(0 0 ${exitHidden}% 0)`

  // The active amber/steel tick moves down the list, ONE row at a time.
  const titleStart = 6
  const listStart = 18
  const activeRow = Math.min(
    spec.items.length - 1,
    Math.max(0, Math.floor((f - listStart) / spec.stagger)),
  )

  // Image plate occupies the right ~48% of the frame; title + list on the left.
  // Plate starts past the longest title ("INFRASTRUCTURE") so they never collide.
  const plateX = box.x + box.width * 0.54
  const plateW = box.x + box.width - plateX
  const plateY = box.y + box.height * 0.08
  const plateH = box.height * 0.5

  return (
    <AbsoluteFill style={{ clipPath: f >= 70 ? exitClip : undefined }}>
      {/* Main image plate */}
      <div
        style={{
          position: 'absolute',
          left: plateX,
          top: plateY,
          width: plateW,
          height: plateH,
          overflow: 'hidden',
        }}
      >
        <ImageReveal
          assetKey={spec.main}
          mask={spec.enter}
          startFrame={0}
          durationInFrames={10}
          fromScale={1.06}
          toScale={1.11}
          panX={[-S * 0.012, S * 0.012]}
        />
      </div>

      {/* Small parallax inset bottom-right */}
      <div
        style={{
          position: 'absolute',
          left: plateX + plateW * 0.3,
          top: plateY + plateH * 0.72,
          width: plateW * 0.62,
          height: plateH * 0.42,
          overflow: 'hidden',
          border: `1px solid ${COLOR.hairline2}`,
        }}
      >
        <ImageParallax
          assetKey={spec.inset}
          mask="wipeLR"
          startFrame={10}
          durationInFrames={14}
          rate={0.6}
          driftX={-S * 0.02}
          driftWindow={[10, 70]}
          fromScale={1.04}
          toScale={1.08}
          scrim={false}
        />
      </div>

      {/* Title */}
      <div style={{ position: 'absolute', left: box.x, top: box.y + box.height * 0.1 }}>
        <SectionTitle
          index={spec.index}
          title={spec.title}
          titleSize={t.title}
          monoSize={t.mono}
          startFrame={titleStart}
          tickColor={spec.tickColor}
        />
      </div>

      {/* Capability list — sits just below the baseline rule, inside safe box */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y + box.height * 0.6,
          display: 'flex',
          flexDirection: 'column',
          gap: t.list * 0.95,
        }}
      >
        {spec.items.map((item, i) => (
          <CapabilityCard
            key={item}
            label={item}
            size={t.list}
            startFrame={listStart + i * spec.stagger}
            active={i === activeRow}
            activeColor={spec.tickColor}
          />
        ))}
      </div>
    </AbsoluteFill>
  )
}

export const Scene04_Build: React.FC = () => {
  const frame = useCurrentFrame()
  const format = useFormat()
  const box = safeBox(format)
  const S = shortSide(format)

  const beatIndex = Math.min(2, Math.floor(frame / BEAT_LEN))
  const localFrame = frame - beatIndex * BEAT_LEN
  const spec = BEATS[beatIndex]

  // Persistent baseline hairline — drawn once at scene start, held all 270f.
  const baseGrow = clip(frame, [0, 24], [0, 1])
  const baselineY = box.y + box.height * 0.56

  return (
    <AbsoluteFill style={{ background: COLOR.ink }}>
      <Beat spec={spec} localFrame={localFrame} box={box} S={S} />

      {/* Persistent baseline rule — the continuous anchor through hard cuts. */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: baselineY,
          width: box.width * baseGrow,
          height: 1,
          background: COLOR.hairline,
        }}
      />
    </AbsoluteFill>
  )
}
