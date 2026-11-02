// Lumen's interface sounds, synthesised live with Web Audio (no audio files).
// Browsers only allow audio after the user has interacted with the page, so the
// context is created lazily and resumed on the first tap or key press.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
let lastTick = 0

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      ctx = new AudioContext()
      master = ctx.createGain()
      master.gain.value = 0.8
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Call from a user gesture so later sounds are allowed to play. */
export function primeAudio() {
  audio()
}

type ToneOptions = {
  type?: OscillatorType
  gain?: number
  to?: number
  attack?: number
}

function tone(freq: number, at: number, dur: number, opts: ToneOptions = {}) {
  const ac = audio()
  if (!ac || !master) return
  const t = ac.currentTime + at
  const osc = ac.createOscillator()
  const env = ac.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t)
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + dur)
  const peak = opts.gain ?? 0.08
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(peak, t + (opts.attack ?? 0.006))
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(env).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise(at: number, dur: number, gain: number, from: number, to: number) {
  const ac = audio()
  if (!ac || !master) return
  const t = ac.currentTime + at
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const env = ac.createGain()
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(env).connect(master)
  src.start(t)
  src.stop(t + dur + 0.02)
}

export const sfx = {
  /** Power-up: low hum swelling into a bright two-note chime. */
  boot() {
    tone(55, 0, 1.6, { type: 'sawtooth', gain: 0.025, to: 110, attack: 0.5 })
    tone(110, 0.1, 1.4, { gain: 0.05, to: 220, attack: 0.6 })
    noise(0, 1.1, 0.05, 300, 4000)
    tone(880, 1.05, 0.9, { gain: 0.06 })
    tone(1318.5, 1.17, 1.1, { gain: 0.05 })
    tone(1760, 1.29, 1.2, { gain: 0.025 })
  },
  /** Mic opens: quick rising double blip. */
  listenStart() {
    tone(660, 0, 0.09, { type: 'triangle', gain: 0.07 })
    tone(990, 0.08, 0.12, { type: 'triangle', gain: 0.07 })
  },
  /** Heard you: falling double blip. */
  listenEnd() {
    tone(990, 0, 0.08, { type: 'triangle', gain: 0.06 })
    tone(660, 0.07, 0.12, { type: 'triangle', gain: 0.06 })
  },
  /** A card lands on the wall: soft data tick (throttled). */
  card() {
    const now = performance.now()
    if (now - lastTick < 90) return
    lastTick = now
    tone(2200, 0, 0.035, { type: 'square', gain: 0.012 })
    noise(0, 0.05, 0.02, 6000, 9000)
  },
  /** Answer complete: gentle resolved chord. */
  done() {
    tone(523.25, 0, 0.5, { gain: 0.04 })
    tone(783.99, 0.05, 0.6, { gain: 0.035 })
  },
  /** Something failed: short low buzz. */
  error() {
    tone(196, 0, 0.22, { type: 'sawtooth', gain: 0.035, to: 130 })
  },
  /** Camera shutter. */
  shutter() {
    noise(0, 0.07, 0.12, 2500, 1200)
    tone(1500, 0.06, 0.05, { type: 'square', gain: 0.02 })
  },
}
