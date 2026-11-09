# Quorum ships single-player first

Quorum ships as a single-player game. Each Company has one player. Shared companies, co-op, and
competitive modes are deferred.

Considered options: multiplayer from the start. Rejected because the core loop must be validated
alone, and multiplayer would need a shared authority for the Simulation before the single-player
game is proven.

## Consequences

- The Company Simulation runs on the player's device ([ADR 0022](./0022-the-company-pauses-when-the-player-leaves.md)).
- Players compare results through Challenge histograms and shared Playbooks, not shared Companies.
- Teams in the game are simulated Engineers, not other players.
