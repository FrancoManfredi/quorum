# The Exit survey is a D1 row

After an Exit, the game asks two questions: what went wrong while the player played, and what they
liked. The answers are text, and the API Worker checks the Exit they describe before keeping them.
PostHog counts what players do, but it cannot reject a submission: the browser writes the event, and
the free-tier budget in `apps/web/src/game/analytics-budget.ts` may drop it. A survey that silently
disappears is worse than no survey.

We keep each answer as a row in the D1 database the API Worker already has. `packages/rpc` carries
the submission, `apps/backend/src/contexts/survey` validates it, and
`apps/backend/src/platform/d1-survey-store.ts` writes it. The form opens only when
`model.board.exited` is set, which only `ExitTaken` sets.

Considered options:

- **PostHog Surveys.** Free for 1,500 responses a month, with its own UI and analysis. But a response
  is an event: the budget caps a session at 80 events and a device at 600 a month, so a player who
  plays a lot could lose the answer. It also cannot check that the Exit happened. Rejected.
- **A second D1 database.** Cleaner ownership, but the existing database already carries the
  migration path, and the guardrails ask for a concrete need before another Cloudflare service. One
  database holds both tables, bound twice as `RESULTS` and `FEEDBACK`.
- **A third-party form service.** Another processor in the privacy page, another host in the CSP,
  and the same lack of validation. Rejected.

## Consequences

- `apps/backend/migrations/0003_survey_responses.sql` adds `survey_responses`, keyed by `device_id`
  and `exit_key`, so a retry keeps the first answer.
- The handler checks the Exit against the catalog: a known Exit that ends the Company, an Era at or
  after its stage, finite non-negative figures, a known Venture, Mutators and perks, and a Legacy no
  larger than `legacyOf(payout, legacyMultiplier(founding))`. A modified client can still forge
  these, as it can forge the Design a Challenge replay carries; the check stops malformed and
  impossible rows, not a determined cheater.
- The answers never enter the playtest log. `SurveyChanged` is in `QUIET`, so an exported log holds
  only the fact that the player sent them.
- A sent survey also emits `survey:submitted` through the playtest log: the Exit's type, Era, payout,
  Legacy, language, and the length of each answer, never the text. If the free-tier budget drops that
  event, the D1 row is still there.
- Sentry sees the flow. `SubmitSurvey` is a traced Command, so the browser span reaches the API
  Worker's `survey.submit` span. A rejected or unreachable submission is captured as an error with
  the Exit's type, Era, and one sentence, never the answers. A store failure goes through the Worker's
  error reporter.
- The privacy page names the Exit survey and says the answers leave the browser only on Send. The
  "Share anonymous usage data" setting does not gate it, because a form the player submits is not
  anonymous analytics.
- There is no read API. The rows are read in D1.
