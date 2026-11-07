import { Schema } from 'effect'
import { Rpc, RpcGroup } from 'effect/rpc'
import { ApiError } from './errors.ts'

/**
 * The Exit a survey describes: the history row an Exit writes, without its
 * snapshot. The API Worker checks it against the catalog before it stores
 * anything, so only a Company that ended can answer.
 */
export const SurveyExit = Schema.Struct({
  exit: Schema.String,
  /** The Era the Company reached. */
  stage: Schema.Finite,
  /** Sim seconds played. */
  time: Schema.Finite,
  peak: Schema.Finite,
  payout: Schema.Finite,
  legacy: Schema.Finite,
  venture: Schema.String,
  mutators: Schema.Array(Schema.String),
  perks: Schema.Record(Schema.String, Schema.Finite),
})
export type SurveyExit = typeof SurveyExit.Type

/** The two questions after an Exit, and the Exit they describe. */
export const SurveySubmission = Schema.Struct({
  /** A random id the browser keeps; there are no accounts. */
  deviceId: Schema.String,
  locale: Schema.String,
  exit: SurveyExit,
  /** What went wrong while the player played. */
  issues: Schema.String,
  /** What the player liked. */
  likes: Schema.String,
})
export type SurveySubmission = typeof SurveySubmission.Type

export const SurveyReceipt = Schema.Struct({
  received: Schema.Boolean,
})
export type SurveyReceipt = typeof SurveyReceipt.Type

export class SurveyRpc extends RpcGroup.make(
  Rpc.make('surveySubmit', {
    payload: SurveySubmission,
    success: SurveyReceipt,
    error: ApiError,
  }),
) {}
