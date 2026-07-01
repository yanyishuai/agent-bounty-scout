/**
 * Standalone Imperial hackathon proof — no Docker/Coral required.
 * Runs: WANT→BID→AWARD→devnet escrow DEPOSIT→deliverBountyScan→RELEASE
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Keypair, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'
import bs58 from 'bs58'
import {
  formatWant,
  formatBid,
  selectBids,
  pickCheapest,
  formatAward,
  formatEscrowRequired,
  formatDeposited,
  verb,
} from '@pay/agent-runtime'
import { deliverBountyScan } from '../../../coral-agents/seller-agent/src/bounty.ts'
import { makeProgram, deposit, release } from '../agent/escrow.ts'

const ROOT_ENV = fileURLToPath(new URL('../../../.env', import.meta.url))
const PROOF_PATH = fileURLToPath(new URL('../../../docs/DEMO-PROOF.json', import.meta.url))

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) }
  for (const line of readFileSync(ROOT_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const expl = (kind: 'tx' | 'address', id: string) => `https://explorer.solana.com/${kind}/${id}?cluster=devnet`

function boundReference(round: number, service: string, arg: string, seller: string, priceSol: number): string {
  const preimage = `txodds-coral:${round}:${service}:${arg}:${seller}:${priceSol}`
  return new PublicKey(createHash('sha256').update(preimage).digest()).toBase58()
}

const RPC_CANDIDATES = [
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com',
  'https://solana-devnet.rpc.extrnode.com',
]

async function connectRpc(preferred?: string): Promise<Connection> {
  const urls = [preferred, ...RPC_CANDIDATES].filter((u): u is string => !!u)
  const seen = new Set<string>()
  for (const url of urls) {
    if (seen.has(url)) continue
    seen.add(url)
    const connection = new Connection(url, 'confirmed')
    try {
      await connection.getVersion()
      console.error(`[smoke] using RPC ${url}`)
      return connection
    } catch (e) {
      console.error(`[smoke] RPC unavailable ${url}: ${(e as Error).message}`)
    }
  }
  throw new Error('no devnet RPC reachable')
}

async function fundBuyer(connection: Connection, buyer: Keypair): Promise<void> {
  const before = await connection.getBalance(buyer.publicKey)
  if (before >= 0.05 * LAMPORTS_PER_SOL) {
    console.error(`[smoke] buyer already funded: ${before / LAMPORTS_PER_SOL} SOL`)
    return
  }
  console.error('[smoke] requesting devnet airdrop (may fail on gated RPC)...')
  try {
    const sig = await connection.requestAirdrop(buyer.publicKey, LAMPORTS_PER_SOL)
    await connection.confirmTransaction(sig, 'confirmed')
    const after = await connection.getBalance(buyer.publicKey)
    console.error(`[smoke] airdrop ok: ${after / LAMPORTS_PER_SOL} SOL`)
  } catch (e) {
    console.error(`[smoke] airdrop failed: ${(e as Error).message}`)
    console.error('[smoke] fund buyer manually: https://faucet.solana.com')
    throw e
  }
}

async function main(): Promise<void> {
  const env = loadEnv()
  const buyerB58 = env.BUYER_KEYPAIR_B58
  const sellerWallet = env.WALLET
  if (!buyerB58 || !sellerWallet) throw new Error('Run node scripts/setup.js first')
  if (!env.GITHUB_TOKEN) throw new Error('Set GITHUB_TOKEN in .env for live bounty scan')

  process.env.GITHUB_TOKEN = env.GITHUB_TOKEN
  const buyer = Keypair.fromSecretKey(bs58.decode(buyerB58))
  const seller = new PublicKey(sellerWallet)
  const rpc = env.SOLANA_RPC_URL ?? RPC_CANDIDATES[0]
  let connection: Connection | null = null
  try {
    connection = await connectRpc(rpc)
  } catch (e) {
    console.error(`[smoke] on-chain escrow skipped: ${(e as Error).message}`)
  }

  const round = 1
  const budget = Number(env.BUYER_MAX_SOL ?? '0.001')
  const service = 'bounty'
  const arg = env.BUYER_ARG ?? 'scan min 5 max 500 limit 8'
  const thread: string[] = []

  const bids = [
    { round, priceSol: 0.0004, by: 'seller-scout', note: 'tight floor, fresh GitHub scan' },
    { round, priceSol: 0.0006, by: 'seller-fast', note: 'broader filters' },
    { round, priceSol: 0.00085, by: 'seller-premium', note: 'premium analyst persona' },
  ]

  thread.push(formatWant({ round, service, arg, budgetSol: budget }))
  for (const b of bids) thread.push(formatBid(b))
  const winner = pickCheapest(selectBids(bids, round))!
  thread.push(formatAward(round, winner.by, 'cheapest available (deterministic fallback)'))
  const reference = boundReference(round, service, arg, sellerWallet, winner.priceSol)
  thread.push(
    formatEscrowRequired({
      round,
      reference,
      seller: sellerWallet,
      amountSol: winner.priceSol,
      deadlineSecs: 600,
      settlement: 'direct',
    }),
  )

  let depositSig: string | null = null
  let releaseSig: string | null = null

  if (connection) {
    try {
      await fundBuyer(connection, buyer)
      const program = await makeProgram(buyer, connection.rpcEndpoint)
      const referencePk = new PublicKey(reference)
      depositSig = await deposit(program, buyer, seller, referencePk, winner.priceSol, 600)
      thread.push(formatDeposited({ round, reference, buyer: buyer.publicKey.toBase58(), sig: depositSig, settlement: 'direct' }))
    } catch (e) {
      console.error(`[smoke] deposit skipped: ${(e as Error).message}`)
      thread.push(`DEPOSITED round=${round} reference=${reference} buyer=${buyer.publicKey.toBase58()} sig=SKIPPED_OFFLINE`)
    }
  } else {
    thread.push(`DEPOSITED round=${round} reference=${reference} buyer=${buyer.publicKey.toBase58()} sig=SKIPPED_NO_RPC`)
  }

  const delivery = await deliverBountyScan(arg)
  thread.push(`DELIVERED round=${round} ${delivery}`)

  if (connection && depositSig) {
    try {
      const program = await makeProgram(buyer, connection.rpcEndpoint)
      releaseSig = await release(program, buyer, seller, new PublicKey(reference))
      thread.push(`RELEASED round=${round} sig=${releaseSig} settlement=direct`)
    } catch (e) {
      console.error(`[smoke] release skipped: ${(e as Error).message}`)
      thread.push(`RELEASED round=${round} sig=SKIPPED_OFFLINE settlement=direct`)
    }
  } else {
    thread.push(`RELEASED round=${round} sig=SKIPPED_NO_RPC settlement=direct`)
  }

  const verbs = thread.map((t) => verb(t))
  const proof = {
    generated_at: new Date().toISOString(),
    mode: releaseSig ? 'standalone-devnet-smoke' : 'protocol-plus-live-scan',
    buyer: buyer.publicKey.toBase58(),
    seller: sellerWallet,
    protocol_sequence: verbs,
    deposit_tx: depositSig,
    deposit_explorer: depositSig ? expl('tx', depositSig) : null,
    release_tx: releaseSig,
    release_explorer: releaseSig ? expl('tx', releaseSig) : null,
    winner: winner.by,
    amount_sol: winner.priceSol,
    delivery: JSON.parse(delivery),
    thread,
    note: releaseSig
      ? 'Full devnet escrow round captured.'
      : 'Live GitHub bounty delivery + protocol thread; fund buyer and re-run for Explorer RELEASE tx.',
  }

  writeFileSync(PROOF_PATH, JSON.stringify(proof, null, 2))
  console.log(JSON.stringify({
    status: 'ok',
    mode: proof.mode,
    release_explorer: proof.release_explorer,
    deposit_explorer: proof.deposit_explorer,
    opportunities: proof.delivery.count,
    proof_file: 'docs/DEMO-PROOF.json',
  }, null, 2))
}

main().catch((e) => {
  console.error(`[bounty-devnet-smoke] ${e}`)
  process.exitCode = 1
})
