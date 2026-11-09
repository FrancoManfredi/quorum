# The Company pauses when the player leaves

Quorum is an endless incremental systems game in the style of Upload Labs and Factorio. A Company
grows through Eras, ends in an Exit, and the player founds the next one with Legacy. The Simulation
is a pure TypeScript module that runs in the browser. It models the behaviors the player optimizes
(capacity, concurrency models, queues, latency, errors, and money) directly.

The Company advances only while the player has its board open and the clock running. Closing the
page stops the Simulation. Nothing accrues while the player is gone, and opening the Company again
resumes at the Step the save holds, with the same Users, Cash, queues, and Studies. There is no
offline catch-up and no return screen.

Factorio is the model: its single-player factory waits when you leave. Quorum takes the same shape,
because an idle game that runs without the player turns the Company into a second job. A player who
closes the game should stop thinking about it, not return to a bill, a churn report, or a missed
SLO. The game is incremental because its numbers grow and its loops nest, not because it plays
itself.

Considered options:

- **Offline progress.** Earlier drafts replayed time away when the player returned. Rejected: it
  rewards absence over play, makes the calendar and the SLO run against a player who is not there,
  and asks the player to plan their day around a Company. It also needed a second Simulation path
  with its own rules (a coarse Step, no incidents, a churn floor), which the live game had to keep
  explaining.
- **A server-authoritative Simulation.** Rejected for the Company: the browser can run the
  Simulation, so a server is needed only while people play together, and a per-player server would
  charge every player for time they are not looking. The server keeps only the jobs that need trust:
  Room sessions, the Exit survey, and, once accounts exist, Challenge verification.
- **Bounded sessions, such as one simulated month per play.** Rejected: they give no long-term goals,
  and the game must hold players for many hours.
- **Driving a faithful Kubernetes simulation.** Rejected: it would not produce the numbers the player
  optimizes, and its bundle size and CPU cost do not fit a browser game that steps ten times a second.

## Consequences

- The Game schema has no wall-clock field. A Company file records when it was last played for the
  Companies page, and the Simulation never reads that time.
- The calendar is a function of sim time, so a paused Company also pauses its day and night cycle,
  its weeks, and its quarters. Pacing is measured in play time.
- The Simulation has one Step path. A live Company and a replayed Challenge run the same code, with
  no offline variant to keep in step.
- The Simulation stays deterministic, so the server can verify a Challenge by replaying the same
  Design, seed, and actions. JavaScript engines differ in `sin`, `cos`, `exp`, `log`, and `pow`, so
  the Simulation uses only exact operations, committed tables, and constants
  ([Simulation](https://github.com/elianiva/quorum/blob/main/apps/wiki/content/design/04-simulation.md#determinism-and-randomness)). The server score is
  authoritative, and a cross-engine hash check guards the rule.
- The Payments drawer applies at all times. It never fills while the clock is stopped, so nothing
  waits in it between sessions.
- The Night shift Perk raises Dev Hours by 10% per level. It used to raise the offline cap, which
  no longer exists.
- A Room freezes when its last Seat leaves, as it already did
  ([ADR 0019](./0019-anonymous-multiplayer-rooms.md)).
- The Company is played in sessions. A player can stop after any bottleneck and resume at the same
  Step, and a session never starts with catch-up work.
- Kubernetes appears as a Component with modeled behavior, not as a simulated cluster.
