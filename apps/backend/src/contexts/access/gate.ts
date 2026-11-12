import { Clock, Context, Effect, Layer, Option, Schema } from 'effect'
import { ApiError, KeyedFeature, type FeatureKeyStatus } from '@quorum/rpc'
import { AccessStore, AccessStoreError, type FeatureKeyRecord } from './store.ts'

/* A key is a code the player types, not an account: the API Worker checks it on every gated call. */

/** Keys are read aloud and typed by hand: four groups of four, without 0, O, 1, or I. */
const KEY = /^[2-9A-HJ-NP-Z]{4}(?:-[2-9A-HJ-NP-Z]{4}){3}$/

/** Trimmed and upper-cased, so a key pasted with spaces or in lower case still works. */
const normalizeKey = (raw: string): string => raw.trim().toUpperCase()

/** A row is active while no operator turned it off and its end, if it has one, is ahead. */
const activeAt = (record: FeatureKeyRecord, now: number): boolean =>
  record.revokedAt === null && (record.expiresAt === null || record.expiresAt > now)

/** The features of a row that this build knows, so a row may name one that a later build adds. */
const knownFeatures = (ids: ReadonlyArray<string>): ReadonlyArray<KeyedFeature> =>
  ids.filter((id): id is KeyedFeature => Schema.is(KeyedFeature)(id))

const fail = (message: string) => Effect.fail(new ApiError({ message }))

/** A store failure reaches the client as "unavailable"; its cause goes to the Worker log. */
const storeFailed = (error: AccessStoreError) =>
  Effect.gen(function* () {
    yield* Effect.logError('AccessStore failed', error.cause)
    return yield* fail('Features are unavailable. Try again later.')
  })

/** The one place that decides whether a key works, shared by every gated handler. */
export class FeatureGate extends Context.Service<
  FeatureGate,
  {
    /** What a key unlocks, or the reason it works for nothing. */
    readonly check: (key: string) => Effect.Effect<FeatureKeyStatus, ApiError>
    /** Refuses unless the key unlocks `feature`. A gated call sends the key every time. */
    readonly require: (feature: KeyedFeature, key: string | null) => Effect.Effect<void, ApiError>
  }
>()('quorum/backend/FeatureGate') {
  static readonly layer = Layer.effect(
    FeatureGate,
    Effect.gen(function* () {
      const store = yield* AccessStore

      const check = (raw: string) =>
        Effect.gen(function* () {
          const key = normalizeKey(raw)
          if (!KEY.test(key)) return yield* fail('That feature key is not valid.')
          const found = yield* store
            .find(key)
            .pipe(Effect.catchTag('AccessStoreError', storeFailed))
          if (Option.isNone(found)) return yield* fail('That feature key is not valid.')
          const now = yield* Clock.currentTimeMillis
          if (!activeAt(found.value, now))
            return yield* fail('That feature key is no longer active.')
          return {
            key,
            features: knownFeatures(found.value.features),
            expiresAt: found.value.expiresAt,
          } satisfies FeatureKeyStatus
        })

      return {
        check,
        require: (feature, key) =>
          Effect.gen(function* () {
            if (key === null) return yield* fail('A feature key is needed for that.')
            const status = yield* check(key)
            if (!status.features.includes(feature))
              return yield* fail('That feature key does not unlock it.')
          }),
      }
    }),
  )
}
