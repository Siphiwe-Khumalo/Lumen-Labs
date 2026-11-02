import { useCallback, useEffect, useRef, useState } from 'react'

export type Timer = {
  id: string
  label: string
  total: number
  endsAt: number
  done: boolean
}

function chime() {
  try {
    const ctx = new AudioContext()
    const notes = [880, 1174.66, 880, 1174.66]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const at = ctx.currentTime + i * 0.22
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + 0.21)
    })
    setTimeout(() => void ctx.close(), 1500)
  } catch {
    // Audio unavailable.
  }
}

export function useTimers(onRing: (timer: Timer) => void) {
  const [timers, setTimers] = useState<Timer[]>([])
  const [now, setNow] = useState(() => Date.now())
  const onRingRef = useRef(onRing)

  useEffect(() => {
    onRingRef.current = onRing
  })

  const timersRef = useRef(timers)
  useEffect(() => {
    timersRef.current = timers
  })

  const running = timers.some((t) => !t.done)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const current = Date.now()
      setNow(current)
      const rung = timersRef.current.filter((t) => !t.done && t.endsAt <= current)
      if (rung.length === 0) return
      const ids = new Set(rung.map((t) => t.id))
      timersRef.current = timersRef.current.map((t) =>
        ids.has(t.id) ? { ...t, done: true } : t,
      )
      setTimers((list) => list.map((t) => (ids.has(t.id) ? { ...t, done: true } : t)))
      for (const t of rung) {
        chime()
        navigator.vibrate?.([300, 150, 300, 150, 300])
        onRingRef.current(t)
      }
    }, 250)
    return () => clearInterval(id)
  }, [running])

  const add = useCallback((id: string, seconds: number, label: string) => {
    const start = Date.now()
    setNow(start)
    setTimers((list) => [
      ...list.filter((t) => t.id !== id),
      { id, label, total: seconds * 1000, endsAt: start + seconds * 1000, done: false },
    ])
  }, [])

  const dismiss = useCallback((id: string) => {
    setTimers((list) => list.filter((t) => t.id !== id))
  }, [])

  return { timers, now, add, dismiss }
}
