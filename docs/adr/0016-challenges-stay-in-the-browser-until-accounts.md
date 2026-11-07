# Challenges stay in the browser until accounts

The API Worker used to re-run every submitted Challenge replay and keep each device's best per axis in
D1, so players could see a percentile and a histogram.

Without accounts, that layer adds little. A device ID is a random string in `localStorage`, so
clearing storage makes a new player and a modified client can submit as many as it likes. With few
players, a percentile means little. Each Simulation commit also starts a new histogram, so results
never accumulate. The server cost is a D1 table, replay CPU on the Worker, and a version rule.

## Decision

A Challenge is scored in the browser only. The page no longer sends a Replay, no longer reads
histograms, and the result card shows the run's own scores. The Challenge RPC group, its handlers, the
`ResultStore`, and the `results` table (migration `0004`) are removed.

The Replay format, the replay codec, and the verifier in `packages/simulation` stay: accounts will need
them to verify a user's best.

## Consequences

- The `histogram` Achievement (90th percentile on any axis) cannot be earned until histograms return.
- Accounts bring the server side back as a verified best per user, not per device.
- The D1 database keeps the name `Results`; it now holds only the Exit survey.
