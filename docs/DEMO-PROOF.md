# Demo Proof — Agent Bounty Scout

**Generated:** 2026-07-01 · **Mode:** `coralos-devnet-full-round`

## Protocol (CoralOS wire format)

```
WANT → BID ×3 → AWARD → ESCROW_REQUIRED → DEPOSITED → DELIVERED → RELEASED
```

| Field | Value |
|-------|-------|
| Coral session | `4e18ec16-ceb1-4b5b-b6a7-49cbb0d91652` |
| Buyer | `GJNKdyNX9MovfYuaPiYPYY5yYMRruiyRHSFqCnyq6MHe` |
| Seller | `D3Be6hVPnTBuKgkjUWYNc3MW9gprurcWdnhfVpHfoDk9` |
| Winner | `seller-fast` @ 0.0006 SOL |
| Settlement | direct escrow (devnet) |

## Explorer links (devnet)

| Step | Transaction |
|------|-------------|
| **DEPOSITED** (CoralOS round 1) | [3AWmB4YD…xFpbkhk](https://explorer.solana.com/tx/3AWmB4YDo3p4wB9UHVfGmAExJmbmFpGdxCS9ZGEkNEagFFaFcVRWD2UHRgaoGyJyRaTJ6hXfCu25MWDHxFpbkhk?cluster=devnet) |
| **RELEASED** (CoralOS round 1) | [45zxAiXq…HoFCHH](https://explorer.solana.com/tx/45zxAiXqU4ajhdaHpgDzjSyKnKUU9AuwHZnkfnWMVEDHs3G3ahceeoxDzoRpr5MZq1MCqjWfv3TZ6RmtKYHoFCHH?cluster=devnet) |

## Live delivery sample

Seller `deliverBountyScan()` returned 8 GitHub opportunities including:

- [claude-builders-bounty #3](https://github.com/claude-builders-bounty/claude-builders-bounty/issues/3) — $100
- [xevrion-v2/agent-playground #3377](https://github.com/xevrion-v2/agent-playground/issues/3377) — $50

Full JSON: [DEMO-PROOF.json](./DEMO-PROOF.json)

## Reproduce

```bash
docker compose up -d coral
docker build -f coral-agents/buyer-agent/Dockerfile -t buyer-agent:0.1.0 .
docker build -f coral-agents/seller-agent/Dockerfile -t seller-agent:0.1.0 .
node scripts/fund-seller.mjs   # seller needs rent-exempt balance for micro-payments
cd examples/txodds && npm run coral:bounty
```
