// Minimal Web Speech API recognition types (Chrome/Edge ship it prefixed; not in lib.dom).

interface LumenSpeechRecognitionAlternative {
  readonly transcript: string
}
interface LumenSpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: LumenSpeechRecognitionAlternative
}
interface LumenSpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: {
    readonly length: number
    [index: number]: LumenSpeechRecognitionResult
  }
}
interface LumenSpeechRecognitionErrorEvent extends Event {
  readonly error: string
}
interface LumenSpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: LumenSpeechRecognitionEvent) => void) | null
  onerror: ((event: LumenSpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onspeechstart: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface Window {
  SpeechRecognition?: new () => LumenSpeechRecognition
  webkitSpeechRecognition?: new () => LumenSpeechRecognition
}
