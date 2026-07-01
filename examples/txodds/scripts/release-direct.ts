/** One-shot direct escrow release for demo proof (run where devnet RPC works). */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { makeProgram, release } from '../agent/escrow.ts'

const envPath = fileURLToPath(new URL('../../../.env', import.meta.url))
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const reference = process.argv[2] ?? '6w3RouPvEnWHUtwFj5gKTCpuWKqSLrxAt1pyNuqY3oKU'
const rpc = env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const buyer = Keypair.fromSecretKey(bs58.decode(env.BUYER_KEYPAIR_B58))
const seller = new PublicKey(env.WALLET)
const referencePk = new PublicKey(reference)

const program = await makeProgram(buyer, rpc)
const sig = await release(program, buyer, seller, referencePk)
const explorer = `https://explorer.solana.com/tx/${sig}?cluster=devnet`
console.log(JSON.stringify({ release_tx: sig, release_explorer: explorer }, null, 2))
