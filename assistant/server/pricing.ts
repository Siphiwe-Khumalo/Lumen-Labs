import type Anthropic from '@anthropic-ai/sdk'

// Approximate list prices in USD per million tokens. Used only for the HUD's cost estimate;
// check https://platform.claude.com for current pricing.
const PRICES: Record<
  string,
  { input: number; output: number; cacheWrite: number; cacheRead: number }
> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
}
const WEB_SEARCH_USD = 10 / 1000

export function estimateCost(model: string, usage: Anthropic.Beta.BetaUsage): number {
  const p = PRICES[model] ?? PRICES['claude-opus-5-5']
  const tokens =
    usage.input_tokens * p.input +
    usage.output_tokens * p.output +
    (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
    (usage.cache_read_input_tokens ?? 0) * p.cacheRead
  const searches = usage.server_tool_use?.web_search_requests ?? 0
  return tokens / 1_000_000 + searches * WEB_SEARCH_USD
}
