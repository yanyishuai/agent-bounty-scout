# CoralOS Demo Session — Agent Bounty Scout

**Date:** 2026-07-01 · **Coral console:** http://localhost:5555/ui/console (API key: `dev`)

## What ran successfully

| Step | Status |
|------|--------|
| `docker compose up -d coral` | coral-server up on :5555 |
| `docker build` buyer-agent:0.1.0 + seller-agent:0.1.0 | Images built |
| `npm run coral:bounty` | Sessions created (e.g. `465dc3ec-…`, `e4f9d08e-…`) |
| 3 seller personas via MCP | seller-scout / seller-fast / seller-premium connected |
| Buyer agent MCP connect | buyer-agent connected, market thread created |
| Registry fix | Personas map to `seller-agent` image (not missing `seller-scout`) |

## Blocker for full RELEASE tx

Buyer wallet **`GJNKdyNX9MovfYuaPiYPYY5yYMRruiyRHSFqCnyq6MHe`** needs devnet SOL.

Public RPC (`alchemy.com/v2/demo`) returns **429** from this network; CLI airdrop is gated.

**Fix (one-time, ~2 min):**

1. Open https://faucet.solana.com (GitHub sign-in)
2. Paste buyer address: `GJNKdyNX9MovfYuaPiYPYY5yYMRruiyRHSFqCnyq6MHe`
3. Request 1–2 SOL
4. Set a reliable RPC in `.env`, e.g. `SOLANA_RPC_URL=https://your-helius-or-quicknode-devnet-url`
5. Re-run:

```bash
docker compose up -d coral
cd examples/txodds && npm run coral:bounty
docker logs -f $(docker ps -qf ancestor=buyer-agent:0.1.0 | head -1)
```

Look for `ARBITER_RELEASED` or `RELEASED` with Explorer link (`TRACE=1` in `.env`).

## Watch logs

```bash
# Buyer (WANT → AWARD → DEPOSITED → RELEASED)
docker logs -f $(docker ps -qf ancestor=buyer-agent:0.1.0 | head -1)

# Any seller (BID → DELIVERED)
docker logs -f $(docker ps -qf ancestor=seller-agent:0.1.0 | head -1)

# Coordinator
docker logs -f coral
```

## Offline proof (no faucet)

`npm run demo:bounty-smoke` in `examples/txodds` captures live GitHub bounty JSON + protocol thread → `docs/DEMO-PROOF.json`.
