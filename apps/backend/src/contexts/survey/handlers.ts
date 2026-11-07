import { Cause, Effect, ErrorReporter } from 'effect'
import { ApiError, SurveyRpc, type SurveyExit } from '@quorum/rpc'
import { ExitSurvey } from './ExitSurvey.aggregate.ts'
import { surveyIdOf } from './ExitSurvey.id.ts'
import { RecordAnswer } from './RecordAnswer.command.ts'
import { SurveyRows } from './SurveyRows.projection.ts'
import { SurveyStoreError } from './store.ts'

/* The Exit survey (13 "Exit"): the ExitSurvey aggregate checks the Exit and keeps the first answer. */

const DEVICE_ID = /^[A-Za-z0-9-]{8,64}$/
const MAX_LOCALE_CHARS = 16

const unavailable = () => new ApiError({ message: 'Feedback is unavailable. Try again later.' })

/** A store failure reaches the client as "unavailable"; its cause goes to the Worker log and the error reporters. */
const storeUnavailable = <A, E, R>(effect: Effect.Effect<A, E | SurveyStoreError, R>) =>
  effect.pipe(
    Effect.tapError((error) =>
      error instanceof SurveyStoreError
        ? Effect.logError('SurveyStore failed', error.cause).pipe(
            Effect.andThen(ErrorReporter.report(Cause.fail(error))),
          )
        : Effect.void,
    ),
    Effect.catchTag('SurveyStoreError', () => Effect.fail(unavailable())),
  )

const fail = (message: string) => Effect.fail(new ApiError({ message }))

/** The key one Exit writes: a retry of the same survey keeps the same row. */
const exitKeyOf = (exit: SurveyExit): string =>
  [exit.exit, exit.stage, exit.time, exit.peak, exit.payout, exit.legacy].join(':')

export const SurveyHandlers = SurveyRpc.toLayer(
  Effect.gen(function* () {
    const surveys = yield* ExitSurvey
    return SurveyRpc.of({
      surveySubmit: (submission) =>
        Effect.gen(function* () {
          if (!DEVICE_ID.test(submission.deviceId))
            return yield* fail('The device id is not valid.')
          if (submission.locale.length > MAX_LOCALE_CHARS)
            return yield* fail('The locale is not valid.')
          const exitKey = exitKeyOf(submission.exit)
          yield* Effect.annotateCurrentSpan({ 'survey.exit': submission.exit.exit })
          const receipt = yield* surveys
            .send(
              surveyIdOf(submission.deviceId, exitKey),
              new RecordAnswer({
                deviceId: submission.deviceId,
                exitKey,
                locale: submission.locale,
                exit: submission.exit,
                issues: submission.issues,
                likes: submission.likes,
              }),
            )
            .pipe(Effect.catchTag('SurveyRefused', (refused) => fail(refused.message)))
          // The row is written by the projection; answer once it is there.
          yield* SurveyRows.caughtUp(receipt, { timeout: '2 seconds' }).pipe(
            Effect.mapError(unavailable),
          )
          return { received: true }
        }).pipe(Effect.withSpan('survey.submit'), storeUnavailable),
    })
  }),
)
