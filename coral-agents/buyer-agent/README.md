# buyer-agent

The marketplace buyer broadcasts a `WANT`, collects competing seller bids, awards the best value, and
settles the winner through the arbiter-gated escrow by default.

```text
WANT -> BID* -> AWARD
  -> ESCROW_REQUIRED settlement=arbiter reference=<bound order>
  -> ARBITER_OPENED / DEPOSITED vault=<vault PDA>
  -> DELIVERED
  -> ARBITER_RELEASED
```

`SETTLEMENT_MODE=direct` keeps the legacy base escrow path available, but the TxODDS CoralOS round uses
`SETTLEMENT_MODE=arbiter` so the buyer cannot unilaterally claw back after delivery.

## Files

| File | Role |
|---|---|
| `src/index.ts` | Market loop: WANT, bid collection, award, arbiter open, delivery wait, release |
| `src/arbiter.ts` | Arbiter wrapper client: config, vault PDA, open, release |
| `src/escrow.ts` | Legacy direct base escrow client |
| `src/guard.ts` | Seller payout binding and legacy payment guards |

## Env

`BUYER_KEYPAIR_B58` funds the order. `ARBITER_KEYPAIR_B58` signs arbiter release/refund.
`SELLER_WALLET` binds the payout wallet. `BUYER_SERVICE` defaults to `txline`, `BUYER_ARG` defaults to
an `edge <fixtureId>` style request, and `MARKET_SELLERS` controls the competing sellers.

Use `LLM_PROVIDER=openai` plus `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`, for best-value bid selection.
Without a live key, selection falls back to the cheapest valid bid.

## Test

```sh
npm install
npm run typecheck
npm test
```

Live settlement signs devnet transactions and is exercised through `examples/txodds/coral`.
