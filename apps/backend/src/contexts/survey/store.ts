import { Context, Data, type Effect } from 'effect'

/** One answer to the Exit survey, with the Exit it describes. */
export type SurveyResponse = Readonly<{
  deviceId: string
  /** One Exit writes one key, so a retry updates nothing. */
  exitKey: string
  exitId: string
  stage: number
  time: number
  peak: number
  payout: number
  legacy: number
  venture: string
  mutators: ReadonlyArray<string>
  issues: string
  likes: string
  locale: string
  at: number
}>

export class SurveyStoreError extends Data.TaggedError('SurveyStoreError')<{
  readonly cause: unknown
}> {}

/** Where Exit surveys live: one row per device and Exit. */
export class SurveyStore extends Context.Service<
  SurveyStore,
  {
    /** Keeps the answer. The same device and Exit again keeps the first row. */
    readonly record: (response: SurveyResponse) => Effect.Effect<void, SurveyStoreError>
  }
>()('quorum/backend/SurveyStore') {}
