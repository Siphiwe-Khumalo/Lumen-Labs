import { useEffect, useRef, useState } from 'react'
import { isAndroid } from '../lib/format.ts'

export type Meter = { lvl: number; pk: number } | null

const FLOOR_DB = -60

/**
 * Live microphone level for the HUD (LVL / PK in dBFS) and the orb. Skipped on Android,
 * where opening a second microphone stream can stop speech recognition from hearing you.
 */
export function useMicMeter(active: boolean) {
  const levelRef = useRef(0)
  const [meter, setMeter] = useState<Meter>(null)
  const enabled = active && !isAndroid()

  useEffect(() => {
    if (!enabled || !navigator.mediaDevices?.getUserMedia) return
    let stream: MediaStream | undefined
    let audio: AudioContext | undefined
    let raf = 0
    let cancelled = false
    let peak = FLOOR_DB
    let lastPush = 0

    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        audio = new AudioContext()
        const analyser = audio.createAnalyser()
        analyser.fftSize = 1024
        audio.createMediaStreamSource(s).connect(analyser)
        const data = new Float32Array(analyser.fftSize)
        const loop = (now: number) => {
          analyser.getFloatTimeDomainData(data)
          let sum = 0
          let max = 0
          for (const v of data) {
            sum += v * v
            max = Math.max(max, Math.abs(v))
          }
          const rms = Math.sqrt(sum / data.length)
          const lvl = Math.max(FLOOR_DB, 20 * Math.log10(rms || 1e-6))
          const pkNow = Math.max(FLOOR_DB, 20 * Math.log10(max || 1e-6))
          peak = Math.max(pkNow, peak - 0.4)
          levelRef.current = Math.min(1, Math.max(0, (lvl - FLOOR_DB) / 45))
          if (now - lastPush > 100) {
            lastPush = now
            setMeter({ lvl, pk: peak })
          }
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      })
      .catch(() => {
        // Permission denied or no device: speech recognition reports the error itself.
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      void audio?.close()
      levelRef.current = 0
      setMeter(null)
    }
  }, [enabled])

  return { levelRef, meter }
}
