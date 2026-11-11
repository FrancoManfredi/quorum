---
title: 17. Scope and roadmap
summary: What the game contains, the milestones, and open questions.
section: design
order: 17
---

## What the game contains

The game runs all eight Eras, Garage to Public, in the browser. Paths that start with `simulation/`
are under `packages/simulation/src/` ([ADR 0004](https://github.com/elianiva/quorum/blob/main/docs/adr/0004-simulation-package.md)). Paths that start with `packages/` or `apps/` are from the repository root. All other paths are under `apps/web/src/`.

### Board

Code: `packages/ui/src/board/board.ts`

- PixiJS board
- Node cards that collapse to a chip with a load ring at low zoom
- Links that show a cross-region round trip
- Particles
- The Bottleneck marker
- Pan and zoom

### Simulation

Code: `simulation/solve.ts`, `rules.ts`, `capacity.ts`, `distribution.ts`, `step.ts`, `director.ts`, `slo.ts`, `regions.ts`, `ipo.ts`, `valuation.ts`, `quarters.ts`, `preview.ts`

Core model:

- Pure flow solve, one rule per Component (`simulation/rules.ts`)
- Capacity model and latency coupling
- Connections and link timeouts
- Apdex revenue
- The Bottleneck search

Resilience:

- Naive and backed-off retries
- Circuit breakers and load shedding
- Bulkheads and hedged Links
- Graceful degradation
- Chaos experiments

Traffic:

- Load Balancer policies and health checks, and the Load Balancer's L4 variant
- DNS TTL and GeoDNS
- The CDN and WAF, Edge-side includes, and Bot management
- The Gateway's token bucket
- Keep-alive and gzip
- Binary serialization between services

Data:

- The Cache hit-ratio model and stampedes, and the Cache's four strategies
- Replica lag
- Partitions, hot keys, and quorum reads and writes
- Distributed SQL
- Backups with their restore roll and drill
- The Database's engine, topology, volume, shards, retention window and rows
- Statement pooling
- Denormalized reads and a Database's materialized view
- The CDC Connector's change stream
- The outbox and expand-and-contract
- The Search Engine's refresh interval
- Object Storage's class and lifecycle rules

Compute:

- Queues and Workers with saved queue depth
- Zones with cross-zone latency and egress
- Standbys, copies, and the Autoscaler
- Scheduled scaling and the ARM family
- The Kubernetes Cluster
- JVM and .NET warmup, and GC pauses
- PHP-FPM process managers
- Realtime connections and push fan-out
- The GPU's precision and batch sizes

Money:

- Egress and storage Burn
- The Payment Provider and its fees

Regions:

- Regions with regional demand and peaks
- Cross-region latency and egress

Platform:

- The Service Mesh's sidecars with their retries, breakers, Insight and Platform tax
- Feature Flags' per-Feature rollouts
- The certificate's calendar and its renewal

Time and incidents:

- The 100 ms Step with logistic growth, OOM kills, warmup, alert fatigue, and first-kind Insight
- The incident director with spike magnitude and escalation, a per-Era interval and severity cap, zone and region outages, and cascades from Series A
- The SLO and its error budget
- The valuation, the IPO checklist, the DR drill, and quarters

### Team

Code: `simulation/team.ts`, `work.ts`, `migration.ts`, `features.ts`, `catalog/team.ts`, `catalog/work.ts`, `components/lab/team.ts`

People:

- The founder and hired engineers in up to 4 teams of five kinds (Product, Platform, SRE, Data and Security)
- Policies, ramp-up, layoffs and morale
- Coordination and tech debt
- Salaries and signing costs
- A per-engineer mood, page count and pay gap with three answers
- Hiring in 11 languages

Work:

- Dev Hours with upkeep on the live Features
- The backlog with the autopilot and a block on each item
- A runbook per incident kind
- 29 Features with adoption and measured lift
- 14 Engineering tasks

Shipping:

- Deploys with Bad deploy rolls, rollback, and four deploy strategies
- Stack migrations with the strangler steps
- Pooler session, transaction and statement modes

### Actions

Code: `simulation/actions.ts`

- Every player action, as a new Game or a refusal that says why

### Catalog

Code: `simulation/catalog/*.ts` (`catalog.ts` re-exports them)

- All 38 Components in [05's overview](/design/05-components#catalog-overview)
- 17 user kinds and 14 backend kinds
- 11 languages, 28 runtime variants, and 31 frameworks
- 9 instance sizes in 5 families
- 203 research items in 10 tracks
- 8 Eras, 56 incidents, and 4 regions
- Six axes and glossary terms for every runtime and framework

### Prestige

Code: `simulation/exit.ts`, `founder.ts`, `founding.ts`, `playbook.ts`, `catalog/legacy.ts`, `catalog/ventures.ts`, `components/lab/legacy.ts`, `game/title.ts`

- Exits (Acqui-hire, Acquisition, IPO, Step down) paying Legacy
- The Founder record (`quorum.founder.v1`) with company history
- The Legacy shop (12 perks)
- Playbooks with board multi-select and `QPB1:` text
- 12 Ventures and 10 Mutators chosen on the title screen

### Rooms

Code: `game/room-machine.ts`, `platform/room-socket.ts`, `apps/backend/src/platform/room-object.ts`, `simulation/room.ts`

- A Company goes online in a Room: a Durable Object that owns the Game and steps it while a Seat is connected.
- Seats join with a six-character code. The owner's token claims the owner Seat; guests keep nothing.
- A funding round and the end of a session are votes. The owner sets the speed and can remove a Seat.
- The Room keeps the Company for 24 hours after the last Seat leaves. A deploy ends a Room whose rules are older.
- The browser keeps the Company file. Taking the Company offline returns it to single-player with the progress from the last snapshot.

### Challenges

Code: `simulation/challenges.ts`, `replay.ts`, and `components/lab/challenge.ts`

- All 32 Challenges and the daily drill
- `QRP1:` replays recorded in the browser; server verification and histograms wait for accounts
- The cross-engine golden check `pnpm test:engines`

### Save

Code: `game/saves.ts`, `game/logos.ts`, `simulation/state.ts`

- Effect Schema for the Game, saved to local storage
- Company files: a named, logo'd Company in an index (`quorum.saves.v1`) with one Game per Company (`quorum.save.v3.<id>`)
- The Companies page, and the founding screen's name and logo
- The old single save, migrated as the first Company and left in place with a hidden Settings recovery action
- Company deletion
- Export and import as text: one `QSV1:` line from Settings
- A decoding default on every field added since the first release

### UI

Code: `components/lab/` (`tradeoff.ts`), `game/update.ts`, `game/feedback.ts`

Panels:

- HUD, build dock, and inspector
- Region tabs
- Research panel and Team panel
- The HUD's work strip
- The quarter panel

Inspector settings:

- Load Balancer and its L4 variant, DNS, Cache, CDN, Queue, WAF and Bot management
- Zone, standby, Autoscaler and its schedule
- Call with its bulkhead and hedge, compression, process-manager
- Region, quorum, spread, backup with its Restore drill, fan-out, key-split
- Gateway with its token bucket, deploy-strategy, database-engine, volume, shard, retention, storage-class, lifecycle and cache-strategy settings
- The Database's materialized view, the GPU's precision and batch, the App Server's graceful degradation, and the Search Engine's refresh
- The Feature Flags' rollouts and the certificate's state

Reliability and incidents:

- The SLO, its error budget and the SLA credit in the HUD and the SLO row
- The IPO checklist with the DR drill
- The Certificate bar with Renew
- The Team panel's Chaos switch
- The Bad deploy bar with Roll back
- Pager with Ignored rules, and postmortems with their MTTD, MTTA and MTTR
- The Incident timeline's not-seen and awaiting-ack spans
- The Drain action

Feedback:

- Card sparklines and p99
- The Settling ring, Stable, and the delta toast
- Undo and Redo over 50 actions
- Tradeoff cards with the radar and preview

### Sandbox

Code: `simulation/sandbox.ts`, `components/lab/sandbox.ts`

- Garage, Pre-seed, Seed, Series A, Series B, and Series C Sandbox tracks (18 guided Sandboxes)
- The free Sandbox
- The Sandbox menu

### Balance tools

Code: `simulation/pacing.ts`, `solve.bench.ts`, and `packages/simulation/test/pacing.test.ts`

- Runtime balance targets
- The Balanced, Greedy, Stubborn, Decliner, Polyglot, and Idle pacing bots (which hire and ship Features) with margins
- A 200-Node and preview benchmark

### Tests

Code: `packages/simulation/test/`, `packages/simulation/engines/`

The suite is one end-to-end suite with no unit proofs. It covers:

- The whole catalog, built and run
- Every incident
- The guided Sandboxes
- Every Challenge
- The Balanced bot's playthrough
- Purity
- The cross-engine check

The [balancing document](/design/16-balancing) records the live tuning and what the checks cover.

## Scope rules

- The Simulation is a pure module with no UI imports, so it runs in tests, in the Tradeoff card
  preview, and, once accounts exist, in Challenge verification on the server.
- Sandboxes run only in the browser. They need no server, no account, and no histogram, so they ship
  with the milestone that adds their mechanics, not with Challenges in M8.
- The browser owns the company simulation, which pauses when the player leaves
  ([ADR 0022](https://github.com/elianiva/quorum/blob/main/docs/adr/0022-the-company-pauses-when-the-player-leaves.md)).
  The API Worker owns only what needs a server: today the Exit survey, and with accounts Challenge
  verification and histograms. Those contracts go in `packages/rpc` and their handlers in `apps/backend`, as the repository
  guide requires.
- Content is data. A new Component, runtime, kind, incident, or research item is a catalog entry plus,
  at most, one new rule in the solver. A Product lever is a catalog entry per kind: its steps, its
  Dev Hours, and its growth cost. The solver applies the mix after the Era and the Venture, before
  the Features' unlocks and load.

## Milestones

Each milestone is playable on its own and ends with the [pacing bots](/design/16-balancing#pacing-model)
and the [dominance rule](/design/16-balancing#dominance) holding for the content it includes.

| #   | Milestone                    | Contents                                                                                                                                                                                                                                 | Exit check                                                                                                                                                                          |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Design and vocabulary        | These documents, [CONTEXT.md](https://github.com/elianiva/quorum/blob/main/CONTEXT.md), [ADR 0022](https://github.com/elianiva/quorum/blob/main/docs/adr/0022-the-company-pauses-when-the-player-leaves.md)                              | Reviewed                                                                                                                                                                            |
| M1  | Real capacity model          | Instance types, concurrency models, memory limits, the latency coupling, Apdex revenue, logistic growth, connection limits, the bottleneck marker                                                                                        | Runtime balance targets pass ([Balancing](/design/16-balancing#runtime-balance-targets)). The margin bot passes ([Cost index](/design/16-balancing#cost-index)).                    |
| M2  | Garage and Pre-seed complete | Kinds `page` to `login`; PHP, Ruby, Node.js, Python with their early variants; Cache, Pooler, Replica, DNS, Load Balancer; visibility steps 0–4; first incidents; the Garage and Pre-seed Sandbox tracks                                 | Balanced bot reaches Seed on every seed, at 26.8–35.7 sim minutes at the Challenge pace. Each guided Sandbox passes with its fix and fails with its wrong option.                   |
| M3  | Tradeoff cards and preview   | The six-axis card, the ghost-simulation preview, Settling and Stable, delta toasts, undo; the free Sandbox                                                                                                                               | Playtest: players predict the effect of a Stack change                                                                                                                              |
| M4  | Team and Dev Hours           | Hiring, teams, backlog, features, tasks, migrations, tech debt, deploy frequency                                                                                                                                                         | Stubborn and Polyglot bots within limits                                                                                                                                            |
| M5  | Seed to Series B             | Kinds to `ai`; Go, Java, C#, Elixir, Rust; Queue, Worker, Serverless Function, CDN, WAF, Search, Object Storage, zones, Autoscaler, Kubernetes, Warehouse, GPU; SLOs; incident director; the Seed, Series A, and Series B Sandbox tracks | Balanced bot raises Series B at 91–106 sim minutes on seeds 1–5 (`pacing.test.ts`); it does not reach Series C in that run, and 03's 6–10 h is a human player's pace, not the bot's |
| M6  | Series C to Public           | Regions as boards, quorum stores, distributed SQL, the IPO checklist, quarters; the Series C Sandbox track                                                                                                                               | Balanced bot reaches IPO in 9–12 hours                                                                                                                                              |
| M7  | Exit and Legacy              | Exits, the Legacy shop, Playbooks, Ventures, Mutators, company history                                                                                                                                                                   | Second company 3–6 hours                                                                                                                                                            |
| M8  | Challenges                   | Challenge mode and the daily drill, scored in the browser                                                                                                                                                                                | Golden-hash replays match in Chromium, Firefox, WebKit, and the API Worker runtime ([Determinism](/design/04-simulation#determinism-and-randomness))                                |
| M9  | Polish                       | Accessibility, sound, achievements, the glossary catalog                                                                                                                                                                                 | Accessibility checklist passes                                                                                                                                                      |
| M10 | Product levers               | The twelve levers, their backlog items, the Insight bottleneck and its Build button in the Research screen                                                                                                                               | The Balanced bot raises the lever of the pool that limits its Study. `research.test.ts` asserts every default recipe pool has one                                                   |

**Vertical slice gate.** The catalog is large, so no content for M5 or later is written until M2 is
playable and a playtest shows that players meet a new bottleneck every few minutes
([pillar 3](/design/01-vision#pillar-3-the-bottleneck-is-the-content)). If the slice fails that test,
fix the loop before adding Components.

## Out of scope

- Accounts. Challenge histograms and server verification wait for them.
- Paid currency of any kind.
- A simulated Kubernetes cluster ([ADR 0022](https://github.com/elianiva/quorum/blob/main/docs/adr/0022-the-company-pauses-when-the-player-leaves.md)).
- A mobile design target. Below 640 px wide or 500 px tall the screen switches to a compact layout (the Inbox panes stack, and the toolbar folds rarely used controls into More), but the board needs space, so the game is tuned for larger screens.

## Open questions

| Question                                                                        | Notes                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the Team system make the idle part too busy?                               | The fallback is the autopilot (on by default). It queues the next Feature, refactors at 30% debt, and shifts built migration steps, so a player who ignores the Team still progresses. Whether the Team is too busy still needs a playtest.                                                                                |
| Is 100 ms the right step for 200 Nodes with the latency coupling?               | Measured in M1 (`solve.bench.ts`, Node.js 26): one solve of a 200-Node board takes about 24 ms and the Bottleneck search about 24 ms, against budgets of 2 ms and 3 ms. Boards have 5 to 20 Nodes (the Pre-seed start solves in 0.23 ms), so the 100 ms Step stays. The solver needs about 12× before M5 boards.           |
| Do players keep Mirrors in sync before GitOps?                                  | A Mirror stays linked to its source, drift is its failure mode, and `gitops` trades drift for blast radius ([Keeping a Mirror in sync](/design/05-components#keeping-a-mirror-in-sync)). Playtest: count how long Mirrors stay behind, and whether players who pick Pulumi or Alchemy forget to refresh before they Apply. |
| Is the Region outage weight fair to a player who has not built a second region? | The director raises it from 0.5 to 3.0 when `multi-region` is researched ([Incidents](/design/11-incidents)). With Users per region, the outage hits only home users, and a Mirror makes the fix cheap. Measure again once both exist.                                                                                     |
| Should regions be separate boards or one large board?                           | [ADR 0005](https://github.com/elianiva/quorum/blob/main/docs/adr/0005-regions-are-tabs-over-one-design.md) decides it: one Design, one tab per region. A tab shows its region's Nodes and the remote Nodes they call.                                                                                                      |
| How visible should runtime stereotypes be in copy?                              | Copy names behaviors ("holds a worker while waiting"), never judgments ("slow language").                                                                                                                                                                                                                                  |
| Do Challenge histograms need an account?                                        | Yes. A device ID resets with the browser's storage, so histograms wait for accounts.                                                                                                                                                                                                                                       |
| How do we keep real outage references respectful?                               | Name the event and the year, link the public postmortem, and never mock the company.                                                                                                                                                                                                                                       |
| Does the free Sandbox spoil discovery?                                          | It unlocks everything from the start. Fallback: unlock each Component in the free Sandbox when the player meets it in a Company or a guided Sandbox.                                                                                                                                                                       |
| Does the Dashboard pull players off the Board?                                  | The Dashboard shows only history ([Observability](/design/12-observability#the-dashboard)). Playtest: count how often players find the bottleneck from the Dashboard instead of the Board. If it is more than one time in five, remove the per-Node Charts from the Overview row.                                          |
| Should the Public Era have an end?                                              | No end, but the Step down Exit gives a natural stopping point with a score.                                                                                                                                                                                                                                                |
| Does the mix become too controllable?                                           | Zero-sum shares, Dev Hours, and the growth cost are the brakes. Playtest: do players plan a mix for the Era's recipes, or flip a lever for every Study? If they flip, give each step an adoption ramp.                                                                                                                     |
