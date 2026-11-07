import { Schema } from 'effect'

/** One device's answer to the survey for one Exit: the device and the Exit's key. */
export const SurveyId = Schema.String.pipe(Schema.brand('ExitSurveyId'))
export type SurveyId = typeof SurveyId.Type

export const surveyIdOf = (deviceId: string, exitKey: string): SurveyId =>
  SurveyId.make(`${deviceId}:${exitKey}`)
