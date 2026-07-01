/**
 * Bounty Scout — sells structured GitHub /bounty opportunity scans to buyer agents.
 * Uses the public GitHub search API (read-only). No LLM required for the data layer.
 */

const DEFAULT_QUERIES = [
  'label:bounty is:issue is:open',
  '"/bounty $" in:body is:issue is:open',
  '[$50 BOUNTY] in:body is:issue is:open',
]

type BountyHit = {
  repo: string
  number: number
  title: string
  url: string
  updated: string
  reward_estimate_usd: number | null
}

function parseReward(text: string): number | null {
  const patterns = [
    /\[\$(\d+)\s*BOUNTY\]/i,
    /\/bounty\s*\$?\s*(\d+)/i,
    /Bounty:\s*\$(\d+)/i,
    /\$(\d+)\s*USDC/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return Number(match[1])
  }
  return null
}

async function githubSearch(token: string, query: string, perPage = 10): Promise<BountyHit[]> {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${perPage}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'agent-bounty-scout-coralos',
    },
  })
  if (!response.ok) {
    return []
  }
  const payload = (await response.json()) as { items?: Array<Record<string, unknown>> }
  const hits: BountyHit[] = []
  for (const item of payload.items ?? []) {
    const repoUrl = String((item.repository_url as string | undefined) ?? '')
    const repo = repoUrl.split('/repos/')[1] ?? 'unknown/unknown'
    const body = String(item.body ?? '')
    const title = String(item.title ?? '')
    hits.push({
      repo,
      number: Number(item.number ?? 0),
      title: title.slice(0, 120),
      url: String(item.html_url ?? ''),
      updated: String(item.updated_at ?? '').slice(0, 10),
      reward_estimate_usd: parseReward(body + ' ' + title),
    })
  }
  return hits
}

function dedupe(hits: BountyHit[]): BountyHit[] {
  const seen = new Set<string>()
  const out: BountyHit[] = []
  for (const hit of hits) {
    const key = `${hit.repo}#${hit.number}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(hit)
  }
  return out
}

export async function deliverBountyScan(request: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return JSON.stringify({
      error: 'GITHUB_TOKEN not set in seller environment',
      hint: 'Set GITHUB_TOKEN in .env for live bounty scans',
    })
  }

  const tokens = request.trim().split(/\s+/).filter(Boolean)
  let maxUsd = 500
  let minUsd = 5
  let limit = 8
  for (let index = 0; index < tokens.length; index += 1) {
    const tokenWord = tokens[index].toLowerCase()
    if (tokenWord === 'max' && tokens[index + 1]) {
      maxUsd = Number(tokens[index + 1])
      index += 1
    } else if (tokenWord === 'min' && tokens[index + 1]) {
      minUsd = Number(tokens[index + 1])
      index += 1
    } else if (tokenWord === 'limit' && tokens[index + 1]) {
      limit = Number(tokens[index + 1])
      index += 1
    }
  }

  const raw: BountyHit[] = []
  for (const query of DEFAULT_QUERIES) {
    raw.push(...(await githubSearch(token, query, 5)))
  }

  const filtered = dedupe(raw)
    .filter((hit) => hit.reward_estimate_usd === null || (hit.reward_estimate_usd >= minUsd && hit.reward_estimate_usd <= maxUsd))
    .slice(0, limit)

  return JSON.stringify({
    service: 'bounty-scan',
    generated_at: new Date().toISOString(),
    filters: { min_usd: minUsd, max_usd: maxUsd, limit },
    count: filtered.length,
    opportunities: filtered,
    summary:
      filtered.length === 0
        ? 'No open bounties matched filters — widen max/min or retry later.'
        : `Top ${filtered.length} actionable GitHub bounties ($${minUsd}-$${maxUsd}) sorted by recency.`,
  })
}
