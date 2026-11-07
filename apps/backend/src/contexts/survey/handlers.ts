import { Cause, Clock, Effect, ErrorReporter } from 'effect'
import { ApiError, SurveyRpc, type SurveyExit } from '@quorum/rpc'
import {
  ERAS,
  EXITS,
  EXIT_IDS,
  MUTATORS,
  PERKS,
  PERK_IDS,
  VENTURES,
  type ExitId,
  type MutatorId,
  type VentureId,
} from '@quorum/simulation/catalog'
import { legacyOf } from '@quorum/simulation/exit'
import { legacyMultiplier } from '@quorum/simulation/founding'
import { SurveyStore, SurveyStoreError } from './store.ts'

/* The Exit survey (13 "Exit"): two answers, checked against the Exit they claim before they are kept. */

const DEVICE_ID = /^[A-Za-z0-9-]{8,64}$/
const MAX_ANSWER_CHARS = 2_000
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

const isExitId = (id: string): id is ExitId => (EXIT_IDS as ReadonlyArray<string>).includes(id)

const isVenture = (id: string): id is VentureId => Object.hasOwn(VENTURES, id)

const isMutator = (id: string): id is MutatorId => Object.hasOwn(MUTATORS, id)

const isPerk = (id: string): boolean => Object.hasOwn(PERKS, id)

/** The key one Exit writes: a retry of the same survey keeps the same row. */
const exitKeyOf = (exit: SurveyExit): string =>
  [exit.exit, exit.stage, exit.time, exit.peak, exit.payout, exit.legacy].join(':')

export const SurveyHandlers = SurveyRpc.toLayer(
  Effect.gen(function* () {
    const store = yield* SurveyStore
    return SurveyRpc.of({
      surveySubmit: (submission) =>
        Effect.gen(function* () {
          if (!DEVICE_ID.test(submission.deviceId))
            return yield* fail('The device id is not valid.')
          if (submission.locale.length > MAX_LOCALE_CHARS)
            return yield* fail('The locale is not valid.')

          const exit = submission.exit
          const id = exit.exit
          if (!isExitId(id)) return yield* fail('There is no such Exit.')
          // The IPO lists a Company that keeps playing, so it has no Exit to report on.
          if (EXITS[id].continues) return yield* fail('That Exit does not end a Company.')
          const lastEra = ERAS.length - 1
          if (!Number.isInteger(exit.stage) || exit.stage < EXITS[id].stage || exit.stage > lastEra)
            return yield* fail('That Exit does not match its Era.')
          if (
            ![exit.time, exit.peak, exit.payout, exit.legacy].every(
              (value) => Number.isFinite(value) && value >= 0,
            )
          )
            return yield* fail('The Exit figures are not valid.')

          const venture = exit.venture
          if (!isVenture(venture)) return yield* fail('There is no such Venture.')
          const mutators = exit.mutators.filter(isMutator)
          if (mutators.length !== exit.mutators.length)
            return yield* fail('There is no such Mutator.')
          const perks: Record<string, number> = {}
          for (const [perk, level] of Object.entries(exit.perks)) {
            if (!isPerk(perk) || !Number.isFinite(level) || level < 0)
              return yield* fail('The Founding is not valid.')
            perks[perk] = level
          }
          if (Object.keys(perks).length > PERK_IDS.length)
            return yield* fail('The Founding is not valid.')

          // Legacy is the payout's square root, so a row that claims more than that is not an Exit.
          const most = legacyOf(exit.payout, legacyMultiplier({ venture, mutators, perks }))
          if (exit.legacy > most) return yield* fail('The Exit Legacy does not match its payout.')

          const issues = submission.issues.trim()
          const likes = submission.likes.trim()
          if (issues.length === 0 && likes.length === 0)
            return yield* fail('Write an answer to at least one question.')
          if (issues.length > MAX_ANSWER_CHARS || likes.length > MAX_ANSWER_CHARS)
            return yield* fail('An answer is too long.')

          const now = yield* Clock.currentTimeMillis
          yield* Effect.annotateCurrentSpan({
            'survey.exit': id,
            'survey.stage': exit.stage,
            'survey.issues_chars': issues.length,
            'survey.likes_chars': likes.length,
          })
          yield* store.record({
            deviceId: submission.deviceId,
            exitKey: exitKeyOf(exit),
            exitId: id,
            stage: exit.stage,
            time: exit.time,
            peak: exit.peak,
            payout: exit.payout,
            legacy: exit.legacy,
            venture,
            mutators,
            issues,
            likes,
            locale: submission.locale,
            at: now,
          })
          return { received: true }
        }).pipe(Effect.withSpan('survey.submit'), storeUnavailable),
    })
  }),
)
