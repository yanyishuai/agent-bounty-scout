# Demo Walkthrough — Agent Bounty Scout

Imperial AI Agent Hackathon · Solana × CoralOS track

## One-command setup

```bash
git clone https://github.com/yanyishuai/agent-bounty-scout.git
cd agent-bounty-scout
npm install --prefix examples/txodds
node scripts/setup.js
```

Add to `.env` (never commit):

```ini
GITHUB_TOKEN=ghp_...          # read-only GitHub search
ANTHROPIC_API_KEY=sk-...      # buyer bid selection (optional: sellers work without LLM)
```

Fund the **buyer wallet** printed by setup at https://faucet.solana.com

## CoralOS round (multi-agent)

```bash
docker compose up -d coral
cd examples/txodds && npm run coral:bounty
```

Expected log sequence:

1. `WANT` — buyer requests `bounty scan min 5 max 500`
2. `BID` — seller-scout / seller-fast / seller-premium compete
3. `AWARD` — buyer picks best value
4. `DEPOSITED` — buyer funds arbiter escrow on devnet
5. `DELIVERED` — seller returns JSON opportunity list
6. `RELEASED` — arbiter pays seller; paste Explorer link below

### Explorer proof (fill after local run)

```
RELEASED tx: <paste devnet explorer URL>
Program: escrow (devnet ID from examples/txodds/escrow)
Amount: ~0.0004–0.001 SOL
```

## Single-agent smoke (no Docker)

Test `deliverService` directly:

```bash
cd coral-agents/seller-agent
GITHUB_TOKEN=ghp_... npx tsx -e "import { deliverBountyScan } from './src/bounty.ts'; deliverBountyScan('scan min 5 max 100 limit 5').then(console.log)"
```

## Full protocol + devnet escrow (no Docker)

Runs WANT→BID→AWARD→DEPOSITED→DELIVERED→RELEASED with a **real devnet RELEASE tx**:

```bash
node scripts/setup.js
# add GITHUB_TOKEN to .env, fund buyer at https://faucet.solana.com
cd examples/txodds && npm install && npm run demo:bounty-smoke
```

Output: `docs/DEMO-PROOF.json` with `release_explorer` URL. Or from repo root:

```bash
python scripts/run_imperial_demo.py
```

## What judges should see in delivery JSON

```json
{
  "service": "bounty-scan",
  "count": 8,
  "opportunities": [
    {
      "repo": "org/repo",
      "number": 123,
      "title": "...",
      "url": "https://github.com/...",
      "reward_estimate_usd": 50
    }
  ]
}
```

## Demo video

See `docs/DEMO-VIDEO-SCRIPT.md` for the 3-minute shot list. Record against this walkthrough + Explorer RELEASED tx.
