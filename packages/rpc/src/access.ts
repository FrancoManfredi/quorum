import { Schema } from 'effect'
import { Rpc, RpcGroup } from 'effect/rpc'
import { ApiError } from './errors.ts'

/**
 * A feature the API Worker keeps behind a key. Online Rooms is the first: a Room
 * costs Durable Objects and a socket, so it is not open to every visitor. A new
 * keyed feature adds its id here, a check in its handler, and a row in Settings.
 * It is not a game Feature, the product change a player builds with Dev Hours.
 */
export const KeyedFeature = Schema.Literals(['multiplayer'])
export type KeyedFeature = typeof KeyedFeature.Type

/**
 * A key as the player typed it. The API Worker trims it and ignores case, so a
 * key pasted with spaces or in lower case still works.
 */
export const FeatureKeyCheck = Schema.Struct({
  key: Schema.String,
})
export type FeatureKeyCheck = typeof FeatureKeyCheck.Type

/** What a key unlocks. The API Worker answers with the key it read, normalized. */
export const FeatureKeyStatus = Schema.Struct({
  key: Schema.String,
  features: Schema.Array(KeyedFeature),
  /** When the key stops working, in epoch milliseconds, or null for no end. */
  expiresAt: Schema.NullOr(Schema.Finite),
})
export type FeatureKeyStatus = typeof FeatureKeyStatus.Type

export class AccessRpc extends RpcGroup.make(
  Rpc.make('featureKeyCheck', {
    payload: FeatureKeyCheck,
    success: FeatureKeyStatus,
    error: ApiError,
  }),
) {}
