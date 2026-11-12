import { Effect, Option } from 'effect'
import { AccessStore, AccessStoreError, type FeatureKeyRecord } from '../contexts/access/store.ts'
import type { SqlRunner } from './sql.ts'

/** The row a normalized key hashes to. Nothing selects by the key itself, because D1 holds no key. */
const SELECT = `SELECT features, expires_at, revoked_at FROM feature_keys WHERE key_hash = ?`

type Row = Readonly<{ features: string; expires_at: number | null; revoked_at: number | null }>

/**
 * A key is a bearer secret, so the database keeps only its SHA-256 hash. A copy of
 * `feature_keys` therefore opens nothing, and `scripts/feature-key.ts` prints the row to insert.
 */
const hashOf = async (key: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const rowOf = (row: Row): FeatureKeyRecord => ({
  features: row.features
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== ''),
  expiresAt: row.expires_at,
  revokedAt: row.revoked_at,
})

/** One span per store operation, named for the job, never for the SQL or its values. */
const traced = Effect.withSpan('AccessStore.find', { attributes: { 'db.system': 'd1' } })

export const d1AccessStore = (db: SqlRunner): AccessStore['Service'] => ({
  find: (key) =>
    Effect.gen(function* () {
      const hash = yield* Effect.tryPromise({
        try: () => hashOf(key),
        catch: (cause) => new AccessStoreError({ cause }),
      })
      const rows = yield* Effect.tryPromise({
        try: () => db.prepare(SELECT).bind(hash).all<Row>(),
        catch: (cause) => new AccessStoreError({ cause }),
      })
      const row = rows.results[0]
      return row === undefined ? Option.none() : Option.some(rowOf(row))
    }).pipe(traced),
})
