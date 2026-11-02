import process from 'node:process'

// Load .env from the working directory when present (Node >= 20.12). Real environment
// variables (e.g. on Render) always win because loadEnvFile never overrides them.
try {
  process.loadEnvFile()
} catch {
  // No .env file: rely on the environment.
}

const args = new Set(process.argv.slice(2))
const prod = args.has('--prod')

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export const config = {
  prod,
  demo: args.has('--demo') || process.env.LUMEN_DEMO === '1',
  port: Number(process.env.PORT ?? 3000),
  host: optional('LUMEN_HOST') ?? (prod ? '0.0.0.0' : '127.0.0.1'),
  model: optional('LUMEN_MODEL') ?? 'claude-opus-5-5',
  passcode: optional('LUMEN_PASSCODE') ?? '',
  sessionSecret: optional('LUMEN_SESSION_SECRET'),
  dailyBudgetUsd: Number(optional('LUMEN_DAILY_BUDGET_USD') ?? 0) || 0,
  hasApiKey: Boolean(optional('ANTHROPIC_API_KEY') ?? optional('ANTHROPIC_AUTH_TOKEN')),
  home: {
    city: optional('LUMEN_HOME_CITY'),
    region: optional('LUMEN_HOME_REGION'),
    country: optional('LUMEN_HOME_COUNTRY'),
    timezone: optional('LUMEN_HOME_TIMEZONE'),
  },
}

if (config.prod && !config.passcode) {
  throw new Error(
    'LUMEN_PASSCODE must be set when running in production, otherwise anyone with the URL could use your API credit.',
  )
}
