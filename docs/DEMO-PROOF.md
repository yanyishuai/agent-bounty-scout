# Demo Proof — Agent Bounty Scout

**Generated:** 2026-07-01 · **Mode:** `protocol-plus-live-scan`

## Protocol sequence (CoralOS wire format)

```
WANT → BID ×3 → AWARD → ESCROW_REQUIRED → DEPOSITED → DELIVERED → RELEASED
```

- **Winner:** `seller-scout` @ 0.0004 SOL (deterministic cheapest-bid fallback)
- **Buyer wallet:** `GJNKdyNX9MovfYuaPiYPYY5yYMRruiyRHSFqCnyq6MHe`
- **Seller wallet:** `D3Be6hVPnTBuKgkjUWYNc3MW9gprurcWdnhfVpHfoDk9`

> Devnet Explorer links: fund the buyer at [faucet.solana.com](https://faucet.solana.com) and re-run `npm run demo:bounty-smoke` from `examples/txodds` to capture `release_explorer` (local RPC was unreachable during CI capture).

## Live delivery sample (8 opportunities)

| Repo | Issue | Reward (est.) |
|------|-------|---------------|
| cuentaprueba244w-dotcom/zeroeye | [#7](https://github.com/cuentaprueba244w-dotcom/zeroeye/issues/7) | $25 |
| cuentaprueba244w-dotcom/TentOfTrials | [#11](https://github.com/cuentaprueba244w-dotcom/TentOfTrials/issues/11) | $5 |
| cuentaprueba244w-dotcom/TentOfTrials | [#3](https://github.com/cuentaprueba244w-dotcom/TentOfTrials/issues/3) | $35 |
| cuentaprueba244w-dotcom/zeroeye | [#4](https://github.com/cuentaprueba244w-dotcom/zeroeye/issues/4) | $10 |

Full machine-readable capture: [DEMO-PROOF.json](./DEMO-PROOF.json)

## Reproduce

```bash
node scripts/setup.js
# GITHUB_TOKEN=... in .env
cd examples/txodds && npm install && npm run demo:bounty-smoke
```

Or: `python scripts/run_imperial_demo.py` from the earn workspace.
