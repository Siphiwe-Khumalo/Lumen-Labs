import { useCallback, useEffect, useRef, useState } from 'react'

const PREFERRED = [
  /Natural/i, // Edge's neural voices, e.g. "Microsoft Ava Online (Natural)"
  /Google UK English Male/i,
  /Google UK English Female/i,
  /Google US English/i,
]

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  for (const pattern of PREFERRED) {
    const match = english.find((v) => pattern.test(v.name))
    if (match) return match
  }
  return (
    english.find((v) => /en[-_]ZA/i.test(v.lang)) ??
    english.find((v) => /en[-_]GB/i.test(v.lang)) ??
    english[0] ??
    null
  )
}

/**
 * Text-to-speech that speaks streamed text sentence by sentence, so Lumen starts talking
 * before the whole answer has arrived (and dodges Chrome's cut-off on long utterances).
 */
export function useSpeechOut(enabled: boolean) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const bufferRef = useRef('')
  const activeRef = useRef(0)
  /** performance.now() of the last spoken word boundary, used to animate the orb. */
  const pulseRef = useRef(0)

  useEffect(() => {
    if (!supported) return
    const update = () => {
      voiceRef.current = pickVoice(speechSynthesis.getVoices())
    }
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [supported])

  const utter = useCallback(
    (text: string) => {
      const clean = text.replace(/[*_#`>]/g, '').trim()
      if (!supported || !clean) return
      const u = new SpeechSynthesisUtterance(clean)
      if (voiceRef.current) u.voice = voiceRef.current
      u.rate = 1.03
      u.pitch = 0.96
      const finish = () => {
        activeRef.current = Math.max(0, activeRef.current - 1)
        if (activeRef.current === 0) setSpeaking(false)
      }
      u.onstart = () => {
        pulseRef.current = performance.now()
        setSpeaking(true)
      }
      u.onboundary = () => {
        pulseRef.current = performance.now()
      }
      u.onend = finish
      u.onerror = finish
      activeRef.current += 1
      speechSynthesis.speak(u)
    },
    [supported],
  )

  const cancel = useCallback(() => {
    bufferRef.current = ''
    activeRef.current = 0
    if (supported) speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  /** Feed streamed text; complete sentences are spoken immediately. */
  const feed = useCallback(
    (delta: string) => {
      if (!enabled) return
      bufferRef.current += delta
      for (;;) {
        const match = bufferRef.current.match(/^([\s\S]*?[.!?…])\s+(?=\S)/)
        if (!match) break
        utter(match[1])
        bufferRef.current = bufferRef.current.slice(match[0].length)
      }
    },
    [enabled, utter],
  )

  /** Speak whatever is left once the answer is complete. */
  const flush = useCallback(() => {
    const rest = bufferRef.current
    bufferRef.current = ''
    if (enabled) utter(rest)
  }, [enabled, utter])

  /** Interrupt and say something right away (e.g. a timer alert). */
  const say = useCallback(
    (text: string) => {
      if (!enabled) return
      cancel()
      utter(text)
    },
    [enabled, cancel, utter],
  )

  return { supported, speaking, feed, flush, say, cancel, pulseRef }
}
