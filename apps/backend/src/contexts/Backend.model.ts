import * as Domain from '@alchemy.run/domain'
import * as Layer from 'effect/Layer'
import { Boards, BoardsLive } from './challenges/Boards.projection.ts'
import { ChallengeEntry } from './challenges/ChallengeEntry.aggregate.ts'
import { ExitSurvey } from './survey/ExitSurvey.aggregate.ts'
import { SurveyRows, SurveyRowsLive } from './survey/SurveyRows.projection.ts'

/** Everything the API Worker keeps: Challenge results and Exit surveys. */
export class Backend extends Domain.Model('Backend', {
  aggregates: [ChallengeEntry, ExitSurvey],
  projections: [Boards, SurveyRows],
}) {}

/** Every projection's implementation. They need `ResultStore` and `SurveyStore`. */
export const BackendHandlers = Layer.mergeAll(BoardsLive, SurveyRowsLive)
