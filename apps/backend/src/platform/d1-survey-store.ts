import { Effect } from 'effect'
import { SurveyStore, SurveyStoreError, type SurveyResponse } from '../contexts/survey/store.ts'
import type { SqlRunner } from './sql.ts'

/** The same device and Exit again keeps the first answer: a retry is not a second response. */
const INSERT = `INSERT INTO survey_responses (device_id, exit_key, exit_id, stage, sim_seconds,
    peak_users, payout, legacy, venture, mutators, issues, likes, locale, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (device_id, exit_key) DO NOTHING`

/** One span per store operation, named for the job, never for the SQL or its values. */
const traced = Effect.withSpan('SurveyStore.record', { attributes: { 'db.system': 'd1' } })

export const d1SurveyStore = (db: SqlRunner): SurveyStore['Service'] => ({
  record: (response: SurveyResponse) =>
    Effect.tryPromise({
      try: () =>
        db
          .prepare(INSERT)
          .bind(
            response.deviceId,
            response.exitKey,
            response.exitId,
            response.stage,
            response.time,
            response.peak,
            response.payout,
            response.legacy,
            response.venture,
            JSON.stringify(response.mutators),
            response.issues,
            response.likes,
            response.locale,
            response.at,
          )
          .all(),
      catch: (cause) => new SurveyStoreError({ cause }),
    }).pipe(Effect.asVoid, traced),
})
