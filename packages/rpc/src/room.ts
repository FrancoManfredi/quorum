import { Schema } from 'effect'
import { Rpc, RpcGroup } from 'effect/rpc'
import { ApiError } from './errors.ts'

/**
 * Taking a Company online. The Game and its Dashboard samples cross as encoded
 * JSON: the API Worker decodes them with the Simulation, and this package stays
 * free of game rules (docs/architecture.md).
 */
export const RoomPublish = Schema.Struct({
  /** The Company's name, for the join screen. */
  name: Schema.String,
  /** The encoded Game, without its `history`. */
  game: Schema.Unknown,
  /** The Dashboard samples the Company already has. */
  samples: Schema.Array(Schema.Unknown),
  /** The browser's wall clock when the Company went online. */
  wall: Schema.Finite,
  /**
   * The feature key that unlocks Online Rooms. The API Worker checks it on every
   * publish, so a key that was turned off stops working even in a loaded tab.
   */
  key: Schema.NullOr(Schema.String),
})
export type RoomPublish = typeof RoomPublish.Type

export const RoomOpened = Schema.Struct({
  code: Schema.String,
  /** The secret that claims the owner Seat. It lives in the Company file. */
  token: Schema.String,
})
export type RoomOpened = typeof RoomOpened.Type

export const RoomQuery = Schema.Struct({
  code: Schema.String,
})
export type RoomQuery = typeof RoomQuery.Type

export const RoomInfo = Schema.Struct({
  exists: Schema.Boolean,
  /** Seats taken, the owner included. */
  seats: Schema.Finite,
})
export type RoomInfo = typeof RoomInfo.Type

export class RoomRpc extends RpcGroup.make(
  Rpc.make('roomPublish', {
    payload: RoomPublish,
    success: RoomOpened,
    error: ApiError,
  }),
  Rpc.make('roomInfo', {
    payload: RoomQuery,
    success: RoomInfo,
    error: ApiError,
  }),
) {}
