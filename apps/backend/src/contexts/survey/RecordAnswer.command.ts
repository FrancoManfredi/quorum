import * as Domain from '@alchemy.run/domain'
import { Schema } from 'effect'
import { SurveyExit } from '@quorum/rpc'
import { SurveyId } from './ExitSurvey.id.ts'

/** The Exit or the answers are not acceptable. `message` is what the player is told. */
export class SurveyRefused extends Domain.Rejection('SurveyRefused', { message: Schema.String }) {}

/** An answer, with the Exit it describes, as it is kept. */
export class AnswerGiven extends Domain.Event('AnswerGiven', {
  deviceId: Schema.String,
  exitKey: Schema.String,
  exitId: Schema.String,
  stage: Schema.Finite,
  time: Schema.Finite,
  peak: Schema.Finite,
  payout: Schema.Finite,
  legacy: Schema.Finite,
  venture: Schema.String,
  mutators: Schema.Array(Schema.String),
  issues: Schema.String,
  likes: Schema.String,
  locale: Schema.String,
  /** Epoch milliseconds. */
  at: Schema.Finite,
}) {}

/** Keep the answers to the two Exit questions, once the Exit is checked against the catalog. */
export class RecordAnswer extends Domain.Command('RecordAnswer', {
  target: SurveyId,
  input: {
    deviceId: Schema.String,
    exitKey: Schema.String,
    locale: Schema.String,
    exit: SurveyExit,
    issues: Schema.String,
    likes: Schema.String,
  },
  events: [AnswerGiven],
  rejects: [SurveyRefused],
  // Lengths only: the answers' text never reaches a trace.
  attributes: (cmd) => ({
    'survey.exit': cmd.exit.exit,
    'survey.stage': cmd.exit.stage,
    'survey.issues_chars': cmd.issues.trim().length,
    'survey.likes_chars': cmd.likes.trim().length,
  }),
}) {}
