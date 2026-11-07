import * as Domain from '@alchemy.run/domain'
import { Schema } from 'effect'
import { ChallengeScores } from '@quorum/rpc'
import { EntryId } from './ChallengeEntry.id.ts'

/** A re-run replay improved at least one axis of a device's best on one board. */
export class BestImproved extends Domain.Event('BestImproved', {
  challengeId: Schema.String,
  simVersion: Schema.String,
  deviceId: Schema.String,
  /** The submission's own scores. The entry keeps the lower value on each axis. */
  score: ChallengeScores,
  replay: Schema.String,
  /** Epoch milliseconds. */
  at: Schema.Finite,
}) {}

/**
 * Keep a verified result. The Api does not publish it: only the handler sends it, after the
 * Simulation has re-run the replay, so a client cannot send scores of its own.
 */
export class RecordResult extends Domain.Command('RecordResult', {
  target: EntryId,
  input: {
    challengeId: Schema.String,
    simVersion: Schema.String,
    deviceId: Schema.String,
    score: ChallengeScores,
    replay: Schema.String,
  },
  events: [BestImproved],
  reply: { best: Schema.NullOr(ChallengeScores) },
}) {}
