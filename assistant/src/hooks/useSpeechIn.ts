import { useCallback, useEffect, useRef, useState } from 'react'

const MESSAGES: Record<string, string> = {
  'no-speech': "Didn't catch that. Tap and try again.",
  'audio-capture': 'No microphone found.',
  'not-allowed': 'Microphone is blocked. Allow it in the browser’s site settings.',
  'service-not-allowed':
    'Microphone is blocked. Allow it in the browser’s site settings.',
  network: 'Voice recognition needs an internet connection.',
}

/** Speech-to-text via the browser's Web Speech API (Chrome, Edge, Android Chrome). */
export function useSpeechIn(onFinal: (text: string) => void) {
  const Recognition =
    typeof window === 'undefined'
      ? undefined
      : (window.SpeechRecognition ?? window.webkitSpeechRecognition)
  const supported = Boolean(Recognition)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  /** True while listening for a follow-up rather than an explicit tap. */
  const [passive, setPassive] = useState(false)
  const recRef = useRef<LumenSpeechRecognition | null>(null)
  const textRef = useRef('')
  const cancelledRef = useRef(false)
  /** performance.now() of the last recognised speech, used to animate the orb. */
  const activityRef = useRef(0)
  const onFinalRef = useRef(onFinal)

  useEffect(() => {
    onFinalRef.current = onFinal
  })

  /**
   * Open the mic. `quiet` is for listening the user didn't explicitly ask for (follow-ups,
   * after a photo): silence and errors pass without a message, and `onSilence` runs instead.
   */
  const start = useCallback(
    (opts: { quiet?: boolean; onSilence?: () => void } = {}) => {
      if (!Recognition) {
        if (!opts.quiet) setError('Voice input needs Chrome or Edge. Use TEXT instead.')
        return
      }
      const previous = recRef.current
      recRef.current = null
      previous?.abort()

      const rec = new Recognition()
      rec.lang = navigator.language || 'en-ZA'
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1
      textRef.current = ''
      cancelledRef.current = false

      rec.onresult = (event) => {
        let text = ''
        for (let i = 0; i < event.results.length; i++)
          text += event.results[i][0].transcript
        textRef.current = text.trim()
        setInterim(textRef.current)
        activityRef.current = performance.now()
      }
      rec.onspeechstart = () => {
        activityRef.current = performance.now()
      }
      rec.onerror = (event) => {
        if (event.error === 'aborted' || opts.quiet) return
        setError(MESSAGES[event.error] ?? 'Voice input stopped unexpectedly.')
      }
      rec.onend = () => {
        // A newer recognition has already taken over; leave the state to it.
        if (recRef.current !== rec) return
        recRef.current = null
        setListening(false)
        setPassive(false)
        setInterim('')
        if (cancelledRef.current) return
        const text = textRef.current
        if (text) onFinalRef.current(text)
        else opts.onSilence?.()
      }

      recRef.current = rec
      setError(null)
      setPassive(Boolean(opts.quiet))
      setListening(true)
      try {
        rec.start()
      } catch {
        recRef.current = null
        setListening(false)
        setPassive(false)
        if (!opts.quiet) setError('Voice input is busy. Try again.')
      }
    },
    [Recognition],
  )

  /** Stop listening and submit what was heard. */
  const stop = useCallback(() => recRef.current?.stop(), [])

  /** Stop listening and discard. */
  const cancel = useCallback(() => {
    cancelledRef.current = true
    recRef.current?.abort()
  }, [])

  useEffect(() => () => recRef.current?.abort(), [])

  return {
    supported,
    listening,
    passive,
    interim,
    error,
    setError,
    start,
    stop,
    cancel,
    activityRef,
  }
}
