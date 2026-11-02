export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function clock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function usd(value: number): string {
  if (value === 0) return '$0.00'
  return value < 0.01 ? '<$0.01' : `$${value.toFixed(2)}`
}

/** A short hex tag derived from an id, for the HUD's technical metadata. */
export function hexTag(id: string): string {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return `0x${(h & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export const isAndroid = () => /Android/i.test(navigator.userAgent)
