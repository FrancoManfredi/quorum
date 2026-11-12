import { Effect, Option, Schema } from 'effect'
import { ApiError, RoomRpc } from '@quorum/rpc'
import { FeatureGate } from '../access/gate.ts'
import { SIM_VERSION } from '@quorum/simulation/version'
import { Game, Sample } from '@quorum/simulation/state'
import { RoomDirectory, RoomError } from './directory.ts'

/* A Company goes online, and a join screen asks whether a code is real. */

const MAX_SAMPLES = 600
const MAX_NAME = 40

const fail = (message: string) => Effect.fail(new ApiError({ message }))

const decodeGame = Schema.decodeUnknownOption(Game)
const decodeSample = Schema.decodeUnknownOption(Sample)

const unavailable = (error: RoomError) =>
  Effect.gen(function* () {
    yield* Effect.logError('RoomDirectory failed', error.cause)
    return yield* fail('The Room is unavailable. Try again later.')
  })

export const RoomHandlers = RoomRpc.toLayer(
  Effect.gen(function* () {
    const directory = yield* RoomDirectory
    const gate = yield* FeatureGate
    return RoomRpc.of({
      roomPublish: Effect.fn('room.publish')(function* (payload) {
        // A Room costs a Durable Object and a socket, so it is behind a feature key.
        yield* gate.require('multiplayer', payload.key)
        const game = decodeGame(payload.game)
        if (Option.isNone(game)) return yield* fail('The Company could not be read.')
        if (payload.samples.length > MAX_SAMPLES)
          return yield* fail('The Company has too much history.')
        const samples = payload.samples.flatMap((entry) => {
          const decoded = decodeSample(entry)
          return Option.isSome(decoded) ? [decoded.value] : []
        })
        if (samples.length !== payload.samples.length)
          return yield* fail('The Company has bad history.')
        const name = payload.name.trim().slice(0, MAX_NAME) || 'Untitled company'
        // The seeded Game is the only one this build can step.
        if (!Number.isFinite(payload.wall)) return yield* fail('The clock is not valid.')
        const published = yield* directory
          .publish({ name, game: game.value, samples, wall: payload.wall, simVersion: SIM_VERSION })
          .pipe(Effect.catchTag('RoomError', unavailable))
        yield* Effect.annotateCurrentSpan({
          'room.code': published.code,
          'room.samples': samples.length,
        })
        return published
      }),
      roomInfo: (payload) =>
        directory.info(payload.code).pipe(Effect.catchTag('RoomError', unavailable)),
    })
  }),
)
