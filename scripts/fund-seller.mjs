import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction,
} from '@solana/web3.js'
import bs58 from 'bs58'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const rpc = process.env.SOLANA_RPC_URL ?? env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const buyer = Keypair.fromSecretKey(bs58.decode(env.BUYER_KEYPAIR_B58))
const seller = new PublicKey(env.WALLET)
const connection = new Connection(rpc, 'confirmed')

const bal = await connection.getBalance(seller)
console.log(`seller ${seller.toBase58()} balance=${bal / LAMPORTS_PER_SOL} SOL`)
if (bal < 0.001 * LAMPORTS_PER_SOL) {
  const sig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(SystemProgram.transfer({
      fromPubkey: buyer.publicKey,
      toPubkey: seller,
      lamports: Math.round(0.01 * LAMPORTS_PER_SOL),
    })),
    [buyer],
  )
  console.log(`funded seller: ${sig}`)
}
