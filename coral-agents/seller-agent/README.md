# seller-agent

The TxODDS fulfillment agent competes in the CoralOS market and delivers verified fair-line reads. It
is intentionally TxODDS-only for the demo; generic CoinGecko/Jupiter/news services are no longer routed
through this seller path.

```text
WANT service=txline arg="edge <fixtureId>"
  -> BID price=<floor-or-LLM-price>
  -> AWARD to=<me>
  -> ESCROW_REQUIRED settlement=arbiter reference=<bound order>
  -> verify funded escrow using vault PDA
  -> DELIVERED {teams, odds, analysis}
```

The seller only delivers after `isFunded` confirms the escrow names its payout wallet and holds at
least the quoted price. In arbiter mode it checks the escrow buyer as the vault PDA from `DEPOSITED`,
not the human buyer wallet.

## Files

| File | Role |
|---|---|
| `src/index.ts` | Market loop and arbiter-aware funding verification |
| `src/bidder.ts` | LLM bid proposal with code-enforced floor/budget |
| `src/escrow.ts` | Read-only escrow funding check |
| `src/service.ts` | TxODDS delivery: fixtures, odds, edge |

`src/payment.ts` and `src/replay.ts` remain for the older direct-pay helpers and tests, but they are
not part of the TxODDS CoralOS seller loop.

## Env

`SELLER_WALLET`, `AGENT_NAME`, `SERVICES=txline`, `FLOOR_SOL`, `PERSONA`, `SETTLEMENT_MODE=arbiter`,
`ESCROW_DEADLINE_SECS`, `SOLANA_RPC_URL`, and `TXLINE_API_KEY`.

Use `ANTHROPIC_API_KEY`, or `LLM_PROVIDER=openai` plus `OPENAI_API_KEY`, for live analysis. Without a
live key, `service.ts` returns a deterministic odds read and labels it as fallback.

## Test

```sh
npm install
npm run typecheck
npm test
```
