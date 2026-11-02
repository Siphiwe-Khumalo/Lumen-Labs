// Lumen gets its whole answer in ONE streamed reply from Claude: the spoken answer first,
// then a `[[cards]]` marker, then a JSON array of cards. This splits that stream as it
// arrives, so speech can start on the first sentence and each card appears the moment its
// JSON object is complete, with no extra round trips to the API.

export const CARDS_MARKER = '[[cards]]'

export class ReplySplitter {
  private pending = ''
  private inCards = false
  private depth = 0
  private inString = false
  private escaped = false
  private buffer = ''

  constructor(
    private readonly onSpeech: (text: string) => void,
    private readonly onObject: (json: string) => void,
  ) {}

  push(delta: string) {
    if (this.inCards) return this.scan(delta)
    this.pending += delta
    const at = this.pending.indexOf(CARDS_MARKER)
    if (at !== -1) {
      const before = this.pending.slice(0, at).trimEnd()
      if (before) this.onSpeech(before)
      const after = this.pending.slice(at + CARDS_MARKER.length)
      this.pending = ''
      this.inCards = true
      return this.scan(after)
    }
    // Hold back a tail that might be the start of the marker, emit the rest.
    let keep = 0
    for (let k = Math.min(CARDS_MARKER.length - 1, this.pending.length); k > 0; k--) {
      if (CARDS_MARKER.startsWith(this.pending.slice(-k))) {
        keep = k
        break
      }
    }
    const ready = this.pending.slice(0, this.pending.length - keep)
    if (ready) this.onSpeech(ready)
    this.pending = this.pending.slice(this.pending.length - keep)
  }

  /** Call once the reply is complete. */
  end() {
    if (!this.inCards && this.pending) this.onSpeech(this.pending)
    this.pending = ''
  }

  /** Emits each complete top-level {...} object found after the marker. */
  private scan(chunk: string) {
    for (const ch of chunk) {
      if (this.inString) {
        this.buffer += ch
        if (this.escaped) this.escaped = false
        else if (ch === '\\') this.escaped = true
        else if (ch === '"') this.inString = false
        continue
      }
      if (ch === '{') {
        if (this.depth === 0) this.buffer = ''
        this.depth++
        this.buffer += ch
      } else if (ch === '}') {
        if (this.depth === 0) continue
        this.buffer += ch
        this.depth--
        if (this.depth === 0) this.onObject(this.buffer)
      } else if (this.depth > 0) {
        if (ch === '"') this.inString = true
        this.buffer += ch
      }
    }
  }
}
