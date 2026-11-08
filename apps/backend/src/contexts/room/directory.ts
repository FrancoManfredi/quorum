import { Context, Data, type Effect } from 'effect'
import type { Game, Sample } from '@quorum/simulation/state'

/** What a browser uploads when a Company goes online. */
export type PublishRequest = Readonly<{
  name: string
  game: Game
  samples: ReadonlyArray<Sample>
  wall: number
  simVersion: string
}>

export type Published = Readonly<{ code: string; token: string }>

export type PublishInput = PublishRequest & Readonly<{ token: string }>

export type Info = Readonly<{ exists: boolean; seats: number }>

/** The Durable Object methods the directory calls, as the native stub exposes them. */
export type RoomStub = Readonly<{
  info: () => Promise<Info>
  publish: (input: PublishInput) => Promise<void>
  fetch: (request: Request) => Promise<Response>
}>

export class RoomError extends Data.TaggedError('RoomError')<{ readonly cause: unknown }> {}

/** The Rooms a deployment runs. The platform adapter owns the Durable Object namespace. */
export class RoomDirectory extends Context.Service<
  RoomDirectory,
  {
    readonly publish: (request: PublishRequest) => Effect.Effect<Published, RoomError>
    readonly info: (code: string) => Effect.Effect<Info, RoomError>
  }
>()('quorum/backend/RoomDirectory') {}
