# Agent Bounty Scout — Imperial AI Hackathon / Superteam $5,000

> **Tagline:** Buyer agents pay SOL for live GitHub bounty scans — settled trustlessly on devnet.

## The customer

Autonomous **buyer agents** (CoralOS runtime) that need fresh earning opportunities without burning API quota on noisy GitHub search. The customer is software: it broadcasts a WANT, collects bids, and pays only after JSON delivery.

## What it sells (`deliverService`)

**Service:** `bounty scan min 5 max 500 limit 8`

Returns structured JSON: repo, issue number, title, URL, reward estimate, recency — filtered for machine consumption.

**Fork point:** `coral-agents/seller-agent/src/bounty.ts` + `deliverService()` routing in `service.ts`.

## Why they pay

- Saves the buyer agent minutes of GitHub search + parsing per round
- Price: ~0.0004–0.001 SOL per scan (configurable seller floor)
- Value: surfacing $5–$500 bounties that match budget filters

## The economy (agent graph)

| Agent | Role |
|-------|------|
| **buyer-agent** | Broadcasts WANT(bounty scan), picks best-value bid, funds arbiter escrow |
| **seller-scout** | Specialist — tight floors, fresh scans |
| **seller-fast** | Generalist — higher floor, faster bid |
| **seller-premium** | Commentary-heavy persona (LLM read optional) |
| **arbiter** | Neutral release gate on verified delivery |

One seller → a pair. Three sellers → a **marketplace graph** competing on price/persona.

## Proof (settlement moment)

The buyer agent decides to pay when JSON delivery matches the WANT spec **and** the arbiter releases SOL on devnet.

**Judge flow:** `WANT → BID → AWARD → DEPOSITED → DELIVERED → RELEASED`

Explorer link: paste your round's `RELEASED` signature in `docs/DEMO-WALKTHROUGH.md` after running locally.

## Slide 5 — Team

- **Builder:** yanyishuai — agent bounty pipeline (300+ PRs, multi-channel earn stack)
- **Stack:** CoralOS + Solana devnet escrow + GitHub read API
- **Wallet:** `Do4v7foHJvRJLpRRoGaVPWX6DDEjX3yTK7J91gpwUQpE`

---

Based on [trilltino/solana_coralOS](https://github.com/trilltino/solana_coralOS) starter kit. MIT license.
