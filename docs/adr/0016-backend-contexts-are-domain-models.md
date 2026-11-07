# Backend contexts are Alchemy Domain models

The API Worker kept Challenge results and Exit surveys with handlers that wrote D1 directly. The
rules of each, a device keeps its best per axis and a survey keeps its first answer, lived in SQL
(`MIN`, `ON CONFLICT DO NOTHING`) and in handler code.

## Decision

Each context is an `@alchemy.run/domain` model behind the same RPC contract:

- `ChallengeEntry`, keyed by Simulation version, Challenge, and device, keeps the best per axis.
  Only the handler sends `RecordResult`, after the Simulation has re-run the replay.
- `ExitSurvey`, keyed by device and Exit, checks the Exit against the catalog in `decide` and keeps
  the first answer.
- The `Boards` and `SurveyRows` projections write the D1 tables. Percentiles and histograms stay SQL
  counts, as ADR 0015 argued. A handler waits on `caughtUp` before it reads them, so a submission
  still sees its own write.

`packages/rpc` and the web client do not change. `systemStatusGet` has no state and stays a plain
handler.

## Consequences

- Contexts may import `@alchemy.run/domain` and nothing else from Alchemy; the boundary test now also
  blocks `@alchemy.run/cloudflare`. The host provides the platform: `Domain.InMemory` today, Durable
  Objects next.
- `apps/backend` turns off `exactOptionalPropertyTypes`: Domain's own types do not satisfy it.
- A store failure now happens in a projection. It logs the cause and retries, and the client sees
  "unavailable" after a two-second wait.
- Existing rows in `results` are not aggregates yet. A returning device needs a one-off backfill
  before the Durable Object host ships.
