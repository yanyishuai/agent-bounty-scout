#!/usr/bin/env node
/** Fund buyer wallet on devnet via airdrop (best-effort). */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const rpc = env.SOLANA_RPC_URL ?? 'https://solana-devnet.g.alchemy.com/v2/demo'
const buyer = Keypair.fromSecretKey(bs58.decode(env.BUYER_KEYPAIR_B58))
const connection = new Connection(rpc, 'confirmed')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  let bal = await connection.getBalance(buyer.publicKey)
  console.log(`buyer ${buyer.publicKey.toBase58()} balance=${bal / LAMPORTS_PER_SOL} SOL (rpc=${rpc})`)
  if (bal >= 0.1 * LAMPORTS_PER_SOL) return

  for (let i = 0; i < 5; i++) {
    try {
      console.log(`airdrop attempt ${i + 1}...`)
      const sig = await connection.requestAirdrop(buyer.publicKey, LAMPORTS_PER_SOL)
      await connection.confirmTransaction(sig, 'confirmed')
      bal = await connection.getBalance(buyer.publicKey)
      console.log(`funded: ${bal / LAMPORTS_PER_SOL} SOL sig=${sig}`)
      return
    } catch (e) {
      console.error(`attempt ${i + 1} failed: ${e.message}`)
      await sleep(8000 * (i + 1))
    }
  }
  throw new Error('airdrop failed — fund manually at https://faucet.solana.com')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
