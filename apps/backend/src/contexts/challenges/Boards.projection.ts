import * as Domain from '@alchemy.run/domain'
import { Effect, Schema } from 'effect'
import { ChallengeEntry } from './ChallengeEntry.aggregate.ts'
import { BestImproved } from './RecordResult.command.ts'
import { ResultStore } from './store.ts'

/** A Challenge's board for one Simulation version: the key its histogram counts under. */
export const BoardKey = Schema.String.pipe(Schema.brand('BoardKey'))
export type BoardKey = typeof BoardKey.Type

export const boardKeyOf = (simVersion: string, challengeId: string): BoardKey =>
  BoardKey.make(`${simVersion}:${challengeId}`)

/**
 * Writes each improved best into the `results` table, where percentiles and histograms are SQL
 * counts. One key per board, so a board's writes run in order.
 */
export class Boards extends Domain.Projection('Boards', {
  from: [ChallengeEntry],
  key: BoardKey,
  keyOf: {
    BestImproved: ({ event }) => boardKeyOf(event.simVersion, event.challengeId),
  },
  on: [BestImproved],
}) {}

/**
 * The write is an upsert that keeps the lower value per axis, so a replayed event changes nothing.
 * A store failure is a defect: Domain keeps the inputs and runs them again.
 */
export const BoardsLive = Boards.toLayer(
  Effect.gen(function* () {
    const store = yield* ResultStore
    return Effect.fn(function* (batch) {
      for (const { event } of batch)
        yield* store
          .record(
            { challengeId: event.challengeId, simVersion: event.simVersion },
            event.deviceId,
            event.score,
            event.replay,
            event.at,
          )
          .pipe(
            Effect.tapError((error) => Effect.logError('ResultStore failed', error.cause)),
            Effect.orDie,
          )
    })
  }),
)
