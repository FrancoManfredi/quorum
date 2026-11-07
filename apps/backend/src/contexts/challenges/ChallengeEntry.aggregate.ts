import * as Domain from '@alchemy.run/domain'
import * as DateTime from 'effect/DateTime'
import { Schema } from 'effect'
import { ChallengeScores } from '@quorum/rpc'
import { EntryId } from './ChallengeEntry.id.ts'
import { BestImproved, RecordResult } from './RecordResult.command.ts'

/** The lower value on each axis: every axis keeps its own best. */
const merge = (best: ChallengeScores | null, score: ChallengeScores): ChallengeScores => ({
  cost: Math.min(best?.cost ?? score.cost, score.cost),
  tail: Math.min(best?.tail ?? score.tail, score.tail),
  complexity: Math.min(best?.complexity ?? score.complexity, score.complexity),
})

const improves = (best: ChallengeScores | null, score: ChallengeScores): boolean =>
  best === null ||
  score.cost < best.cost ||
  score.tail < best.tail ||
  score.complexity < best.complexity

/**
 * A device's independent best per axis on one board (14 "Rules"). A result that improves no axis
 * records nothing.
 */
export class ChallengeEntry extends Domain.Aggregate('ChallengeEntry', {
  id: EntryId,
  state: Schema.Struct({ best: Schema.NullOr(ChallengeScores) }),
  initial: { best: null },
  commands: [RecordResult],
  decide: {
    RecordResult: (s, cmd, { now }) =>
      improves(s.best, cmd.score)
        ? [
            new BestImproved({
              challengeId: cmd.challengeId,
              simVersion: cmd.simVersion,
              deviceId: cmd.deviceId,
              score: cmd.score,
              replay: cmd.replay,
              at: DateTime.toEpochMillis(now),
            }),
          ]
        : [],
  },
  evolve: { BestImproved: (s, e) => ({ best: merge(s.best, e.score) }) },
  reply: { RecordResult: (s) => ({ best: s.best }) },
}) {}
