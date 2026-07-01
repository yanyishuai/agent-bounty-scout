# Agent Bounty Scout — Imperial AI Hackathon Fork

**Solana × CoralOS track · [Superteam listing](https://superteam.fun/earn/listing/imperial-ai-agent-hackathon-build-the-agent-economy) · $5,000 prize pool**

Fork of [trilltino/solana_coralOS](https://github.com/trilltino/solana_coralOS) for the theme **agents that earn**.

## What we built

Buyer agents pay devnet SOL for **live GitHub bounty scans** (`deliverService` → `bounty scan`). Three seller personas compete in CoralOS; settlement runs through the existing escrow spine.

| Artifact | Path |
|----------|------|
| Service fork | `coral-agents/seller-agent/src/bounty.ts` |
| Pitch deck (5 slides) | [PITCH.md](./PITCH.md) |
| Demo walkthrough | [docs/DEMO-WALKTHROUGH.md](./docs/DEMO-WALKTHROUGH.md) |
| Demo video script | [docs/DEMO-VIDEO-SCRIPT.md](./docs/DEMO-VIDEO-SCRIPT.md) |
| Bounty CoralOS round | `npm run coral:bounty` (from `examples/txodds`) |

## Quick start

```bash
node scripts/setup.js
# add GITHUB_TOKEN + ANTHROPIC_API_KEY to .env, fund buyer wallet at faucet.solana.com
docker compose up -d coral
cd examples/txodds && npm install && npm run coral:bounty
```

## Smoke test (no Docker)

```bash
cd coral-agents/seller-agent
GITHUB_TOKEN=ghp_... npx tsx -e "import { deliverBountyScan } from './src/bounty.ts'; deliverBountyScan('scan min 5 max 100 limit 3').then(r=>console.log(JSON.parse(r)))"
```

See upstream README for architecture details.
