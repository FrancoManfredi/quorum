import type { Update } from 'foldkit'
import { Schema } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Survey } from './model.ts'

/* The Exit survey's two fields, folded into the parent with foldChild. The parent sends the answers. */

export const SurveyMessage = defineMessageUnion({
  IssuesChanged: { value: Schema.String },
  LikesChanged: { value: Schema.String },
})
export type SurveyMessage = typeof SurveyMessage.Type

export const updateSurvey = (
  survey: Survey,
  message: SurveyMessage,
): Update.Return<Survey, SurveyMessage> =>
  SurveyMessage.match<Update.Return<Survey, SurveyMessage>>(message, {
    IssuesChanged: ({ value }) => ({ model: { ...survey, issues: value } }),
    LikesChanged: ({ value }) => ({ model: { ...survey, likes: value } }),
  })
