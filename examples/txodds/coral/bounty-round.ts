/**
 * CoralOS bounty-scout round — buyer agent + three competing bounty sellers.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = process.env.CORAL_SERVER_URL ?? 'http://localhost:5555'
const TOKEN = process.env.CORAL_TOKEN ?? 'dev'
const NS = 'default'
const AUTH = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) }
  try {
    const p = fileURLToPath(new URL('../../../.env', import.meta.url))
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* rely on process.env */
  }
  return env
}

const str = (value: string) => ({ type: 'string', value })
const f64 = (value: number) => ({ type: 'f64', value })
const agent = (name: string, options: Record<string, unknown>, idName = name) => ({
  id: { name: idName, version: '0.1.0', registrySourceId: { type: 'local' } },
  name,
  provider: { type: 'local', runtime: 'docker' },
  options,
})

async function main(): Promise<void> {
  const env = loadEnv()
  const wallet = env.WALLET
  const keypair = env.BUYER_KEYPAIR_B58
  const arbiter = env.ARBITER_KEYPAIR_B58
  if (!arbiter) throw new Error('ARBITER_KEYPAIR_B58 must be in .env - run `node scripts/setup.js`')
  if (!wallet || !keypair) throw new Error('WALLET + BUYER_KEYPAIR_B58 must be in .env — run `node scripts/setup.js`')
  const rpc = env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

  const llm: Record<string, unknown> = {}
  if (env.ANTHROPIC_API_KEY) llm.ANTHROPIC_API_KEY = str(env.ANTHROPIC_API_KEY)
  if (env.OPENAI_API_KEY) llm.OPENAI_API_KEY = str(env.OPENAI_API_KEY)
  if (env.LLM_PROVIDER) llm.LLM_PROVIDER = str(env.LLM_PROVIDER)
  if (env.LLM_MODEL) llm.LLM_MODEL = str(env.LLM_MODEL)
  if (env.TRACE) llm.TRACE = str(env.TRACE)

  const sellerOpts = (name: string, floor: string, persona: string) => ({
    SELLER_WALLET: str(wallet),
    SOLANA_RPC_URL: str(rpc),
    AGENT_NAME: str(name),
    SERVICES: str('bounty'),
    FLOOR_SOL: f64(Number(floor)),
    PERSONA: str(persona),
    SERVICE: str('bounty'),
    SETTLEMENT_MODE: str('arbiter'),
    ...(env.GITHUB_TOKEN ? { GITHUB_TOKEN: str(env.GITHUB_TOKEN) } : {}),
    ...llm,
  })

  const scout = agent(
    'seller-scout',
    sellerOpts('seller-scout', env.SCOUT_FLOOR_SOL ?? '0.0004', 'a GitHub bounty scout with tight floors and fresh scans'),
  )
  const fast = agent(
    'seller-fast',
    sellerOpts('seller-fast', env.FAST_SELLER_FLOOR_SOL ?? '0.0006', 'a fast generalist bounty scanner with broader filters'),
    'seller-scout',
  )
  const premium = agent(
    'seller-premium',
    sellerOpts('seller-premium', env.PREMIUM_SELLER_FLOOR_SOL ?? '0.00085', 'a premium analyst that adds commentary on top of scans'),
    'seller-scout',
  )
  const buyer = agent('buyer-agent', {
    BUYER_KEYPAIR_B58: str(keypair),
    AGENT_NAME: str('buyer-agent'),
    SOLANA_RPC_URL: str(rpc),
    ARBITER_KEYPAIR_B58: str(arbiter),
    SETTLEMENT_MODE: str('arbiter'),
    SELLER_WALLET: str(wallet),
    BUYER_MAX_SOL: f64(Number(env.BUYER_MAX_SOL ?? '0.001')),
    BUYER_SERVICE: str('bounty'),
    BUYER_ARG: str(env.BUYER_ARG ?? 'scan min 5 max 500 limit 8'),
    MARKET_SELLERS: str('seller-scout,seller-fast,seller-premium'),
    ...llm,
  })

  const res = await fetch(`${BASE}/api/v1/local/session`, {
    method: 'POST',
    headers: AUTH,
    body: JSON.stringify({
      agentGraphRequest: { agents: [buyer, scout, fast, premium] },
      namespaceProvider: { type: 'create_if_not_exists', namespaceRequest: { name: NS } },
      execution: { mode: 'immediate' },
    }),
  })
  if (!res.ok) throw new Error(`session create failed: ${res.status} ${await res.text()}`)
  const { sessionId } = (await res.json()) as { sessionId: string }

  console.log(`\nCoralOS bounty round ${sessionId} — buyer-agent + 3 bounty sellers.`)
  console.log('Watch WANT -> BID -> AWARD -> DEPOSITED -> DELIVERED -> RELEASED in docker logs.\n')
}

main().catch((e) => {
  console.error(`[coral bounty round] ${e}`)
  process.exitCode = 1
})
