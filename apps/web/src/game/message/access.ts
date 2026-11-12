import { Schema } from 'effect'
import { KeyedFeature } from '@quorum/rpc'

/** The feature key Messages, as cases for the root union. */
export const accessCases = {
  /** The stored key, read once at boot. */
  AccessLoaded: { json: Schema.NullOr(Schema.String) },
  /** The player was told a feature needs a key, and asked for the field that takes one. */
  FeatureKeyAsked: {},
  /** The key field, while the player types or pastes one. */
  KeyTyped: { value: Schema.String },
  /** The player asks the API Worker what the typed key unlocks. */
  KeySubmitted: {},
  /** The API Worker accepted it, so this browser keeps it. */
  KeyAccepted: {
    key: Schema.String,
    features: Schema.Array(KeyedFeature),
    expiresAt: Schema.NullOr(Schema.Finite),
  },
  /** The API Worker refused it, or could not be reached. */
  KeyRefused: { note: Schema.String },
  /** The player takes the key off this browser. The API Worker forgets nothing. */
  KeyCleared: {},
}
