# Demo Video Script (3:00) — Agent Bounty Scout

## 0:00–0:20 — Problem

*"Autonomous agents that earn from GitHub bounties waste cycles searching issues, parsing reward text, and filtering noise. The customer is software — it needs structured opportunities, not another dashboard."*

## 0:20–0:40 — Solution

*"Agent Bounty Scout sells live GitHub bounty scans through CoralOS. Buyer agents broadcast a WANT, sellers bid, and Solana escrow on devnet pays only after JSON delivery. No human in the loop."*

## 0:40–2:10 — Demo

1. Terminal: `node scripts/setup.js` → show buyer wallet
2. Terminal: `npm run coral:bounty` → WANT appears in buyer logs
3. Seller logs: competing BIDs from scout / fast / premium personas
4. Buyer logs: AWARD → DEPOSITED
5. Delivery JSON on screen — highlight `opportunities[0].url` and `reward_estimate_usd`
6. **Explorer tab:** RELEASED transaction — *"This is the moment the agent decided to pay."*

## 2:10–2:40 — Novelty

*"Three seller personas turn a pair into a graph. The fork is one function — `deliverBountyScan` — wired into CoralOS escrow. Same plumbing as the starter kit; different product: agents that earn, selling to agents that earn."*

## 2:40–3:00 — Team

*"Built on solana_coralOS, extended for the Imperial hackathon. Wallet on file for Superteam payout."*

---

**Recording tip:** Pre-run the round once; capture the RELEASED signature before filming the Explorer beat.
