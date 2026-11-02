import { useEffect, useRef } from 'react'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

type RGB = readonly [number, number, number]
const AMBER: RGB = [233, 185, 120]
const HOT: RGB = [255, 224, 182]
const STEEL: RGB = [169, 200, 216]
const rgba = (c: RGB, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`
const TAU = Math.PI * 2

type Frame = {
  t: number
  boot: number
  level: number
  think: number
  speak: number
  listen: number
  label: boolean
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, f: Frame) {
  const { t, boot, level, think, speak, listen } = f
  const cx = w / 2
  const cy = h / 2
  const R = Math.min(w, h) * 0.3
  ctx.clearRect(0, 0, w, h)

  // Ambient light field
  const glow = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 2.1)
  glow.addColorStop(0, rgba(AMBER, (0.1 + level * 0.18) * boot))
  glow.addColorStop(0.45, rgba(AMBER, 0.04 * boot))
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.lineCap = 'round'

  // Targeting brackets
  const B = R * 1.6
  const L = R * 0.13
  ctx.strokeStyle = rgba(STEEL, 0.45 * boot)
  ctx.lineWidth = 1.25
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const) {
    const x = cx + sx * B
    const y = cy + sy * B
    ctx.beginPath()
    ctx.moveTo(x, y - sy * L)
    ctx.lineTo(x, y)
    ctx.lineTo(x - sx * L, y)
    ctx.stroke()
  }

  // Tick ring
  const N = 120
  const spin = t * 0.05
  for (let i = 0; i < N; i++) {
    if (i / N > boot) break
    const a = (i / N) * TAU + spin
    const major = i % 10 === 0
    const wobble = 0.5 + 0.5 * Math.sin(i * 1.7 + t * 9)
    const len = (major ? R * 0.09 : R * 0.04) + level * listen * R * 0.14 * wobble
    const r0 = R * 1.3
    ctx.strokeStyle = rgba(major ? AMBER : STEEL, major ? 0.75 : 0.28 + level * 0.3)
    ctx.lineWidth = major ? 1.6 : 1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
    ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len))
    ctx.stroke()
  }

  // Orbiting steel arcs
  ctx.lineWidth = 2
  ctx.strokeStyle = rgba(STEEL, 0.7 * boot)
  const arcSpeed = 1 + think * 2.5
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.15, t * 0.6 * arcSpeed, t * 0.6 * arcSpeed + 0.75)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(
    cx,
    cy,
    R * 1.15,
    -t * 0.4 * arcSpeed + Math.PI,
    -t * 0.4 * arcSpeed + Math.PI + 0.45,
  )
  ctx.stroke()

  // Segmented inner ring
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-t * 0.25)
  ctx.setLineDash([R * 0.05, R * 0.035])
  ctx.strokeStyle = rgba(STEEL, 0.32 * boot)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 0, R * 0.8, 0, TAU * boot)
  ctx.stroke()
  ctx.restore()

  // Thinking: gyroscope rings tilting through 3D, plus a scanning slash
  if (think > 0.01) {
    for (let k = 0; k < 3; k++) {
      const tilt = Math.abs(Math.cos(t * 1.3 + k * 1.05))
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(k * (Math.PI / 3) + t * 0.7)
      ctx.strokeStyle = rgba(k === 1 ? STEEL : HOT, 0.55 * think)
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.ellipse(
        0,
        0,
        R * (1.02 + k * 0.1),
        R * (1.02 + k * 0.1) * (0.12 + tilt * 0.88),
        0,
        0,
        TAU,
      )
      ctx.stroke()
      ctx.restore()
    }
    const ang = -0.62 + Math.sin(t * 0.8) * 0.15
    const dx = Math.cos(ang) * R * 1.75
    const dy = Math.sin(ang) * R * 1.75
    const slash = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
    slash.addColorStop(0, rgba(AMBER, 0))
    slash.addColorStop(0.5, rgba(HOT, 0.75 * think))
    slash.addColorStop(1, rgba(AMBER, 0))
    ctx.strokeStyle = slash
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(cx - dx, cy - dy)
    ctx.lineTo(cx + dx, cy + dy)
    ctx.stroke()
  }

  // Speaking ripples
  if (speak > 0.01) {
    for (let i = 0; i < 3; i++) {
      const phase = (t * 0.7 + i / 3) % 1
      ctx.strokeStyle = rgba(AMBER, (1 - phase) * 0.35 * speak)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, R * (1.04 + phase * 0.55), 0, TAU)
      ctx.stroke()
    }
  }

  // Main lumen ring
  const ringR = R * (1 + level * 0.07 + Math.sin(t * 1.4) * 0.008)
  const dim = 1 - think * 0.45
  ctx.save()
  ctx.shadowColor = rgba(AMBER, 0.9)
  ctx.shadowBlur = R * (0.35 + level * 0.5)
  ctx.strokeStyle = rgba(AMBER, 0.95 * dim)
  ctx.lineWidth = R * 0.075
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + TAU * boot)
  ctx.stroke()
  ctx.shadowBlur = R * 0.12
  ctx.strokeStyle = rgba(HOT, 0.9 * dim)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, ringR - R * 0.065, 0, TAU * boot)
  ctx.stroke()
  ctx.restore()

  // Voice waveform inside the ring
  const wave = Math.max(listen, speak) * level
  if (wave > 0.01) {
    ctx.strokeStyle = rgba(HOT, 0.65)
    ctx.lineWidth = 1.3
    ctx.beginPath()
    const steps = 160
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * TAU
      const n =
        Math.sin(a * 6 + t * 7) * 0.5 +
        Math.sin(a * 11 - t * 11) * 0.3 +
        Math.sin(a * 17 + t * 5) * 0.2
      const r = R * 0.86 + n * R * 0.09 * wave
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Wordmark
  if (f.label) {
    ctx.save()
    ctx.globalAlpha = boot
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = rgba(HOT, 0.95)
    ctx.shadowColor = rgba(AMBER, 0.8)
    ctx.shadowBlur = R * 0.15
    ctx.font = `600 ${Math.round(R * 0.2)}px "Space Grotesk Variable", "Space Grotesk", sans-serif`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(R * 0.05)}px`
    ctx.fillText('LUMEN', cx + R * 0.025, cy)
    ctx.shadowBlur = 0
    ctx.font = `500 ${Math.max(8, Math.round(R * 0.07))}px "JetBrains Mono Variable", monospace`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(R * 0.02)}px`
    ctx.fillStyle = rgba(STEEL, 0.75)
    const caption =
      think > 0.5
        ? 'PROCESSING'
        : listen > 0.5
          ? 'LISTENING'
          : speak > 0.5
            ? 'RESPONDING'
            : 'AI // ONLINE'
    ctx.fillText(caption, cx, cy + R * 0.24)
    ctx.restore()
  }
}

type Props = {
  state: OrbState
  /** Current loudness 0..1; read every frame. */
  getLevel: () => number
  label?: boolean
  className?: string
}

export function Orb({ state, getLevel, label = true, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const live = useRef({ state, getLevel, label })

  useEffect(() => {
    live.current = { state, getLevel, label }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const speed = reduce ? 0.25 : 1
    let size = { w: 0, h: 0 }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = { w: rect.width, h: rect.height }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const start = performance.now()
    const mix = { level: 0, think: 0, speak: 0, listen: 0 }
    let raf = 0
    const tick = (now: number) => {
      const t = ((now - start) / 1000) * speed
      const { state: s, getLevel: level, label: showLabel } = live.current
      const ease = (from: number, to: number, k: number) => from + (to - from) * k
      const target =
        s === 'idle' ? 0.06 + Math.sin(t * 1.2) * 0.03 : s === 'thinking' ? 0.12 : level()
      mix.level = ease(mix.level, target, 0.18)
      mix.think = ease(mix.think, s === 'thinking' ? 1 : 0, 0.06)
      mix.speak = ease(mix.speak, s === 'speaking' ? 1 : 0, 0.08)
      mix.listen = ease(mix.listen, s === 'listening' ? 1 : 0, 0.1)
      const boot = Math.min(1, (now - start) / 1400)
      const bootEased = 1 - Math.pow(1 - boot, 3)
      if (size.w > 0)
        draw(ctx, size.w, size.h, { t, boot: bootEased, label: showLabel, ...mix })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
