# The Simulation is a workspace package

The Simulation lives in `packages/simulation` (`@quorum/simulation`), not inside the website.
The browser plays it, and from M8 the API Worker replays Challenge submissions with it to compute
the authoritative score ([ADR 0002](./0002-endless-incremental-game-in-the-browser.md),
[Challenges](https://github.com/elianiva/quorum/blob/main/apps/wiki/content/design/14-challenges.md#rules)). Two runtimes execute the same code, so it is a real
shared boundary, and [GDD 17](https://github.com/elianiva/quorum/blob/main/apps/wiki/content/design/17-scope-and-roadmap.md#scope-rules) already names it: the
Simulation stays a pure module that runs in tests, offline progress, the Tradeoff preview, and
server verification. CONTEXT.md defines the word, so the package is named for it.

Considered options:

- Keep it in `apps/web/src/game/engine` and let the backend import it by relative path or through
  `@quorum/web`. Rejected: an app-to-app dependency breaks the dependency direction in
  [Architecture](../architecture.md), and it pulls the website's Vite and DOM configuration into
  the Worker.
- Put it in `packages/rpc`. Rejected: that package is the wire contract only.
- Copy it into the backend. Rejected: a score is only authoritative if both sides run one source.

## Consequences

- `apps/web` and, from M8, `apps/backend` depend on `@quorum/simulation`. `packages/rpc` does not:
  a Challenge submission crosses the wire as an encoded string that the backend decodes with the
  Simulation's schemas.
- The Simulation imports only `effect` and its own files. Its tsconfig has no DOM library, and
  `test/purity.test.ts` rejects any other import, host globals such as `Date` and `window`, and the
  math that engines may compute differently (`Math.cos`, `Math.exp`, `Math.pow`, `**`, and the
  rest), as [GDD 04](https://github.com/elianiva/quorum/blob/main/apps/wiki/content/design/04-simulation.md#determinism-and-randomness) requires.
- `SIM_VERSION` is the git tree hash of `packages/simulation/src`, filled in at build time by
  `packages/simulation/sim-version.ts`. A commit that changes the Simulation changes the version, so
  results from different versions are never compared, and nobody bumps a number or re-pins a hash.
  `pnpm test:engines` replays one fixed Company and every Challenge's reference solution in each
  engine and compares the hashes with Node's, which it computes on the spot.
- The UI stays in `apps/web`. The Simulation exports data and pure functions; it never renders,
  stores, or schedules anything.
