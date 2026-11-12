/**
 * Makes a feature key and prints the row that accepts it. Run it, put the INSERT
 * into the deployed database, and give the key to the player. The table stores a
 * hash, so the key itself is never in D1 and cannot be read back from it.
 *
 *   pnpm --filter @quorum/backend feature-key -- --note "Weekly stream" --days 30
 */
import { createHash, randomInt } from 'node:crypto'

/** The alphabet the API Worker accepts: no 0, O, 1, or I, so a key survives being read aloud. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const GROUPS = 4
const GROUP_LENGTH = 4

const args = process.argv.slice(2)
const option = (name: string): string | null => {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? null : (args[at + 1] ?? null)
}

const features = (option('features') ?? 'multiplayer')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => id !== '')
  .join(',')

const days = Number(option('days') ?? '0')
if (!Number.isFinite(days) || days < 0) throw new Error('--days takes a number of days')
// A single quote would end the string literal, and the note is prose from an operator.
const note = (option('note') ?? '').replaceAll("'", "''")

const key = Array.from({ length: GROUPS }, () =>
  Array.from({ length: GROUP_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join(''),
).join('-')

const hash = createHash('sha256').update(key).digest('hex')
const now = Date.now()
const expiresAt = days > 0 ? now + days * 24 * 60 * 60 * 1000 : null

const insert = `INSERT INTO feature_keys (key_hash, features, note, created_at, expires_at)
  VALUES ('${hash}', '${features}', '${note}', ${now}, ${expiresAt === null ? 'NULL' : expiresAt});`

console.log(`Feature key: ${key}`)
console.log(`Features:    ${features}`)
console.log(`Expires:     ${expiresAt === null ? 'never' : new Date(expiresAt).toISOString()}`)
console.log('')
console.log('The player enters it in Settings, under Features. Add it to the database with:')
console.log('')
console.log(insert)
