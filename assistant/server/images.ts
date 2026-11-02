import dns from 'node:dns/promises'
import net from 'node:net'

// Finds the main photo of a public web page (og:image / twitter:image) so image cards can
// show real pictures from the pages Claude found. Only public http(s) hosts are fetched.

const TIMEOUT_MS = 6000
const MAX_BYTES = 1_500_000
const MAX_REDIRECTS = 3
const cache = new Map<string, string | null>()

function isPrivateV4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip)
  const v6 = ip.toLowerCase()
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateV4(mapped[1])
  return (
    v6 === '::' ||
    v6 === '::1' ||
    v6.startsWith('fc') ||
    v6.startsWith('fd') ||
    v6.startsWith('fe8') ||
    v6.startsWith('fe9') ||
    v6.startsWith('fea') ||
    v6.startsWith('feb')
  )
}

async function assertPublic(url: URL): Promise<void> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new Error('bad protocol')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('private host')
  }
  const addresses = net.isIP(host)
    ? [host]
    : (await dns.lookup(host, { all: true })).map((r) => r.address)
  if (addresses.length === 0 || addresses.some(isPrivateIp))
    throw new Error('private host')
}

async function fetchHtml(start: URL): Promise<{ html: string; url: URL }> {
  let url = start
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url)
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; LumenAssistant/0.1; +https://lumenlabcreatives.spartangroup.co.za)',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      await res.body?.cancel()
      if (!location) break
      url = new URL(location, url)
      continue
    }
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) {
      await res.body?.cancel()
      throw new Error(`not html (${res.status})`)
    }
    const reader = res.body?.getReader()
    if (!reader) throw new Error('empty body')
    const chunks: Uint8Array[] = []
    let size = 0
    // Only the <head> matters; stop early once it is likely read.
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      size += value.byteLength
    }
    await reader.cancel().catch(() => {})
    return { html: Buffer.concat(chunks).toString('utf8'), url }
  }
  throw new Error('too many redirects')
}

const decodeEntities = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/gi, '/')

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of tag.matchAll(/([a-zA-Z_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? '')
  }
  return out
}

const PREFERRED = [
  'og:image:secure_url',
  'og:image',
  'og:image:url',
  'twitter:image',
  'twitter:image:src',
]

export function extractImage(html: string): string | undefined {
  const found = new Map<string, string>()
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(m[0])
    const name = (a.property ?? a.name ?? '').toLowerCase()
    if (PREFERRED.includes(name) && a.content && !found.has(name))
      found.set(name, a.content)
  }
  for (const name of PREFERRED) if (found.has(name)) return found.get(name)
  const link = html.match(/<link\b[^>]*rel\s*=\s*["']image_src["'][^>]*>/i)
  return link ? attributes(link[0]).href : undefined
}

/** Returns an https image URL for the page, or null when none is usable. */
export async function findPageImage(pageUrl: string): Promise<string | null> {
  if (cache.has(pageUrl)) return cache.get(pageUrl) ?? null
  let result: string | null = null
  try {
    const { html, url } = await fetchHtml(new URL(pageUrl))
    const raw = extractImage(html)
    if (raw) {
      const image = new URL(raw, url)
      if (image.protocol === 'http:') image.protocol = 'https:'
      if (image.protocol === 'https:' && !/\.svg(\?|$)/i.test(image.pathname)) {
        result = image.toString()
      }
    }
  } catch {
    result = null
  }
  if (cache.size > 500) cache.delete(cache.keys().next().value as string)
  cache.set(pageUrl, result)
  return result
}
