import { config } from './config.ts'

// Weather fast path. Weather is the most common quick question, and a web search for it
// costs several seconds. Open-Meteo (free, no API key) answers in a fraction of a second, so
// for weather questions and briefings Lumen fetches the home forecast first and hands it to
// Claude, which can then answer without searching. Any failure just falls back to search.

const FORECAST_URL =
  process.env.OPEN_METEO_FORECAST_URL ?? 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL =
  process.env.OPEN_METEO_GEOCODE_URL ?? 'https://geocoding-api.open-meteo.com/v1/search'
const TIMEOUT_MS = 2500
const CACHE_MS = 10 * 60 * 1000

const WEATHER_WORDS =
  /\b(weather|temperature|temp|hot|cold|warm|chilly|rain|raining|rainy|storms?|thunder\w*|hail|forecast|umbrella|sunny|cloudy|wind|windy|humid\w*|uv|sunrise|sunset|degrees)\b/i

export const isWeatherQuestion = (text: string) => WEATHER_WORDS.test(text)

type Place = { label: string; latitude: number; longitude: number }

const WMO: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'freezing fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  56: 'freezing drizzle',
  57: 'freezing drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  66: 'freezing rain',
  67: 'freezing rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'light showers',
  81: 'showers',
  82: 'heavy showers',
  85: 'snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorms',
  96: 'thunderstorms with hail',
  99: 'severe thunderstorms with hail',
}
const describe = (code: unknown) =>
  typeof code === 'number' ? (WMO[code] ?? 'mixed conditions') : 'unknown conditions'

async function getJson(url: URL): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  return res.json()
}

let placePromise: Promise<Place | null> | undefined

function homePlace(): Promise<Place | null> {
  placePromise ??= (async () => {
    const { city, region, country } = config.home
    const label = [city, region, country].filter(Boolean).join(', ')
    const lat = Number(process.env.LUMEN_HOME_LAT)
    const lon = Number(process.env.LUMEN_HOME_LON)
    if (Number.isFinite(lat) && Number.isFinite(lon) && process.env.LUMEN_HOME_LAT) {
      return { label: label || 'Home', latitude: lat, longitude: lon }
    }
    if (!city) return null
    const url = new URL(GEOCODE_URL)
    url.searchParams.set('name', city)
    url.searchParams.set('count', '5')
    url.searchParams.set('language', 'en')
    const data = (await getJson(url)) as {
      results?: { latitude: number; longitude: number; country_code?: string }[]
    }
    const results = data.results ?? []
    const match =
      results.find(
        (r) => !country || r.country_code?.toUpperCase() === country.toUpperCase(),
      ) ?? results[0]
    return match ? { label, latitude: match.latitude, longitude: match.longitude } : null
  })().catch(() => {
    placePromise = undefined // retry next time
    return null
  })
  return placePromise
}

type Forecast = {
  current?: Record<string, number | string>
  daily?: Record<string, (number | string)[]>
}

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
const clockOf = (iso: unknown) => (typeof iso === 'string' ? iso.slice(11, 16) : '?')
const round = (n: unknown) => (typeof n === 'number' ? Math.round(n) : '?')

export function formatForecast(place: Place, data: Forecast): string {
  const c = data.current ?? {}
  const d = data.daily ?? {}
  const lines = [
    `Now (${clockOf(c.time)} local): ${round(c.temperature_2m)}°C, feels like ${round(c.apparent_temperature)}°C, ${describe(c.weather_code)}, humidity ${round(c.relative_humidity_2m)}%, wind ${round(c.wind_speed_10m)} km/h, precipitation ${c.precipitation ?? 0} mm.`,
  ]
  const names = ['Today', 'Tomorrow', 'Day after']
  ;(d.time ?? []).slice(0, 3).forEach((date, i) => {
    lines.push(
      `${names[i]} (${day(String(date))}): high ${round(d.temperature_2m_max?.[i])}°C, low ${round(d.temperature_2m_min?.[i])}°C, ${describe(d.weather_code?.[i])}, rain chance ${round(d.precipitation_probability_max?.[i])}%, UV index ${round(d.uv_index_max?.[i])}, sunrise ${clockOf(d.sunrise?.[i])}, sunset ${clockOf(d.sunset?.[i])}.`,
    )
  })
  return `<weather source="Open-Meteo" place="${place.label}">\n${lines.join('\n')}\n</weather>`
}

let cache: { at: number; text: string } | undefined

/** Live forecast for the home location as a context block, or null if unavailable. */
export async function homeWeather(): Promise<string | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.text
  try {
    const place = await homePlace()
    if (!place) return null
    const url = new URL(FORECAST_URL)
    url.searchParams.set('latitude', String(place.latitude))
    url.searchParams.set('longitude', String(place.longitude))
    url.searchParams.set(
      'current',
      'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    )
    url.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,uv_index_max,sunrise,sunset',
    )
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('forecast_days', '3')
    const text = formatForecast(place, (await getJson(url)) as Forecast)
    cache = { at: Date.now(), text }
    return text
  } catch {
    return null
  }
}
