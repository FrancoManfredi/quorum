import * as Domain from '@alchemy.run/domain'
import { Effect } from 'effect'
import { ExitSurvey } from './ExitSurvey.aggregate.ts'
import { AnswerGiven } from './RecordAnswer.command.ts'
import { SurveyStore } from './store.ts'

/** Writes each recorded answer into the `survey_responses` table, where it is read. */
export class SurveyRows extends Domain.Projection('SurveyRows', {
  from: [ExitSurvey],
  key: ExitSurvey,
  on: [AnswerGiven],
}) {}

/** The insert keeps the first row for a device and Exit, so a replayed event changes nothing. */
export const SurveyRowsLive = SurveyRows.toLayer(
  Effect.gen(function* () {
    const store = yield* SurveyStore
    return Effect.fn(function* (batch) {
      for (const { event } of batch)
        yield* store
          .record({
            deviceId: event.deviceId,
            exitKey: event.exitKey,
            exitId: event.exitId,
            stage: event.stage,
            time: event.time,
            peak: event.peak,
            payout: event.payout,
            legacy: event.legacy,
            venture: event.venture,
            mutators: event.mutators,
            issues: event.issues,
            likes: event.likes,
            locale: event.locale,
            at: event.at,
          })
          .pipe(
            Effect.tapError((error) => Effect.logError('SurveyStore failed', error.cause)),
            Effect.orDie,
          )
    })
  }),
)
