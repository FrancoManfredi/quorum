import { Context, Data, type Effect, type Option } from 'effect'

/** One row of the key whitelist. The key itself is stored as a hash, so a row holds no secret. */
export type FeatureKeyRecord = Readonly<{
  /** The feature ids the row names. A build ignores ids it does not know. */
  features: ReadonlyArray<string>
  /** When the key stops working, in epoch milliseconds, or null for no end. */
  expiresAt: number | null
  /** When an operator turned the key off, or null while it works. */
  revokedAt: number | null
}>

export class AccessStoreError extends Data.TaggedError('AccessStoreError')<{
  readonly cause: unknown
}> {}

/** The feature key whitelist: the keys this deployment accepts, and what each unlocks. */
export class AccessStore extends Context.Service<
  AccessStore,
  {
    /** The row a normalized key hashes to, or none when no row matches. */
    readonly find: (key: string) => Effect.Effect<Option.Option<FeatureKeyRecord>, AccessStoreError>
  }
>()('quorum/backend/AccessStore') {}
