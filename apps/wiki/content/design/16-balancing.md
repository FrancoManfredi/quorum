---
title: 16. Balancing
summary: Every formula, every tunable constant, and the pacing model.
section: design
order: 16
---

This document collects every formula and tunable constant, and describes how balance is checked.

**Source of truth.** The build is normative: every number below is checked against the catalog in
`packages/simulation/src/catalog` at `SIM_VERSION` 32, whose golden replay hashes to `d736ca6f`. Where
the design and the build disagree, [Live tuning](#live-tuning) names the knob and why it moved,
[Open gaps](#open-gaps) names what the build does not have, and
[Known balance gaps](#known-balance-gaps) names the checks that fail or have never run. Numbers
measured from the build are in [Measurements](/design/measurements).

## Number ranges

Upload Labs players lose interest when numbers become meaningless
([Influences](/design/02-influences#why-players-quit)). Quorum keeps every number in a real range.

| Number    | Range at start | Range at the end of the first company | Hard limit                            |
| --------- | -------------- | ------------------------------------- | ------------------------------------- |
| Users     | 150            | 50 million                            | About 6 billion (online population)   |
| Demand    | 3 rps          | 1 million rps                         | Users × R_user                        |
| Latency   | 30–500 ms      | 30–500 ms                             | —                                     |
| Cash      | $300           | Trillions of game dollars             | —                                     |
| Valuation | —              | About $1 billion at the IPO           | About $100 billion at 6 billion users |

Cash, revenue, and Burn are game dollars. Valuation, payout, and Legacy use real dollars, converted
by the [valuation scale](#valuation-scale).

Formatting: SI suffixes only (k, M, B, T). No letter suffixes such as "aa".

## Constants

| Constant              | Symbol         | Value                                                                        | Where used                                                                 |
| --------------------- | -------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Step length           | —              | 100 ms                                                                       | [Simulation](/design/04-simulation#time)                                   |
| Calendar rate         | —              | 1 sim s = 1 calendar min                                                     | [Simulation](/design/04-simulation#time)                                   |
| Requests per user     | `R_user`       | 0.02 rps                                                                     | [Demand](/design/04-simulation#demand)                                     |
| Diurnal amplitude     | `A`            | 0.45                                                                         | [Demand](/design/04-simulation#demand)                                     |
| Copy price growth     | —              | 1.25×                                                                        | [Prices](#prices)                                                          |
| Resize price growth   | —              | 2× per size step                                                             | [Vertical and horizontal](#vertical-and-horizontal)                        |
| Sell refund           | —              | 50%                                                                          | [Components](/design/05-components#rules-for-all-components)               |
| Insight yield         | —              | 1 × √(sampled rps), per Component type and kind                              | [Observability](/design/12-observability#earning-insight)                  |
| Default sample rate   | —              | 10%                                                                          | [Observability](/design/12-observability#earning-insight)                  |
| Default retention     | —              | 15 min; pool cap at least 100                                                | [Observability](/design/12-observability#retention)                        |
| Study duration        | —              | 20 s (Garage) to 60 min (Public)                                             | [Progression](/design/10-progression#studies)                              |
| Spike speed           | —              | 2×                                                                           | [Team](/design/08-team-and-velocity#spikes)                                |
| Growth rate           | `g`            | See [User growth](#user-growth)                                              |                                                                            |
| Churn rate            | `c`            | 0.004/s                                                                      | [User growth](#user-growth)                                                |
| Declined-round growth | —              | 0.7 × `g`                                                                    | [Funding](/design/09-economy#funding)                                      |
| Abroad seed share     | `seed_share`   | 0.05 (proposed)                                                              | [Going global](/design/04-simulation#going-global)                         |
| Fickle share          | `f`            | 0.5 (proposed)                                                               | [Users and growth](/design/04-simulation#users-and-growth)                 |
| Steady churn          | `s`            | 0.2 × `c` (proposed)                                                         | [Users and growth](/design/04-simulation#users-and-growth)                 |
| Border mixing         | `m`            | 0.1 (proposed)                                                               | [Users and growth](/design/04-simulation#users-and-growth)                 |
| Mirror time           | `mirror_time`  | 30 calendar minutes (proposed)                                               | [Mirror a region](/design/05-components#mirror-a-region)                   |
| Staged sync wait      | `stage_wait`   | 60 calendar minutes (proposed)                                               | [GitOps](/design/05-components#gitops)                                     |
| GitOps poll           | `sync_poll`    | 3 calendar minutes (Argo CD's default)                                       | [GitOps](/design/05-components#gitops)                                     |
| Plan refresh          | `refresh_time` | 0.5 calendar minutes per Node (proposed)                                     | [IaC tools](/design/05-components#iac-tools)                               |
| IaC tool switch       | `iac_switch`   | 1,440 calendar minutes (proposed)                                            | [IaC tools](/design/05-components#iac-tools)                               |
| Valuation scale       | —              | 1.5 × 10⁻⁴                                                                   | [Valuation scale](#valuation-scale)                                        |
| Coordination penalty  | `k`            | 0.08                                                                         | [Team](/design/08-team-and-velocity#coordination)                          |
| Dev Hours per day     | —              | 8 per engineer, 6.4 founder                                                  | [Team](/design/08-team-and-velocity#dev-hours)                             |
| Adoption time         | `τ`            | 7 calendar days                                                              | [Adoption](/design/08-team-and-velocity#adoption)                          |
| Lift spread           | `σ`            | 1.0                                                                          | [Measured lift](/design/08-team-and-velocity#measured-lift)                |
| Upkeep ceiling        | —              | 0.4 × S / (S + 2,000), max 0.6                                               | [Upkeep](/design/08-team-and-velocity#upkeep)                              |
| Market gain cap       | —              | +100% of the Era market                                                      | [Sizes](/design/08-team-and-velocity#sizes)                                |
| Link timeout          | —              | 30 s                                                                         | [Simulation](/design/04-simulation#capacity-utilization-and-queues)        |
| Drawer size           | —              | `max($25, 60 s of revenue)`                                                  | [Economy](/design/09-economy#the-payments-drawer)                          |
| Offline cap           | —              | 8 h; 12, 18, 24 h with Night shift                                           | [Simulation](/design/04-simulation#offline-progress)                       |
| Offline churn cap     | —              | 5%                                                                           | [Simulation](/design/04-simulation#offline-progress)                       |
| SLA credit            | —              | 10% of subscription revenue while the trailing week misses the signed target | [Incidents](/design/11-incidents#sla-credits)                              |
| On-call ack           | —              | 5 sim s after the page (proposed)                                            | [Incidents](/design/11-incidents#the-incident-loop)                        |
| CDC change rate       | —              | 20,000 changes/s (05)                                                        | [CDC Connector](/design/05-components#cdc-connector)                       |
| Sidecar overhead      | —              | 5% of a member's CPU and Burn (05)                                           | [Service Mesh](/design/05-components#service-mesh)                         |
| Sidecar hop           | —              | 1 ms per hop (05)                                                            | [Service Mesh](/design/05-components#service-mesh)                         |
| Mesh Insight          | —              | +20% on watched traffic (05)                                                 | [Service Mesh](/design/05-components#service-mesh)                         |
| Mesh Platform tax     | —              | 0.5 engineers per mesh (proposed)                                            | [Team](/design/08-team-and-velocity#teams)                                 |
| Rollout steps         | —              | off, 5%, 25%, 50%, 100% (05)                                                 | [Feature Flags](/design/05-components#feature-flags)                       |
| Certificate life      | —              | 90 calendar days; 45 from Series C (05)                                      | [Secrets and Certificates](/design/05-components#secrets-and-certificates) |
| Certificate renewal   | —              | two thirds of the life                                                       | [Secrets and Certificates](/design/05-components#secrets-and-certificates) |

The rollout steps and the certificate's two lifetimes are 05's own. The mesh's tax is the build's:
05 says Platform Dev Hours and gives no figure, so a mesh takes a Cluster's half an engineer.

Four rows describe the Features lifecycle, which the build does not have: adoption time, lift spread,
the upkeep ceiling, and the market gain cap. The build multiplies a Feature's market and growth at
full strength as soon as it ships ([Open gaps](#open-gaps)).

## Prices

```text
place_price(component, k) = base_price(component) × 1.25^(k − 1)      k = copy number
```

The 1.25 growth on copies is a soft push toward bigger instances and toward better design over more
copies. It is stylized: real clouds charge the same for the hundredth VM as the first. The
justification is operational overhead, and the game says so on the card. Selling refunds half of what
the last copy cost, at the copy markup.

### Cost index

Request values stay fixed. Prices rise with the Era. Every price in this document is a Garage price,
and the Era's **cost index** multiplies it: placement, Burn, egress, and third-party fees. A separate
**salary index** multiplies engineer salary. Without them, a vCPU costs about 0.1% of the value of the
requests it serves, and Burn never matters.

| Era      | Cost index | Salary index | vCPU ($/s) | Engineer salary ($/s) |
| -------- | ---------- | ------------ | ---------- | --------------------- |
| Garage   | 1          | 1            | 0.05       | 0.40                  |
| Pre-seed | 4          | 4            | 0.20       | 1.60                  |
| Seed     | 8          | 8            | 0.40       | 3.20                  |
| Series A | 12         | 12           | 0.60       | 4.80                  |
| Series B | 16         | 16           | 0.80       | 6.40                  |
| Series C | 20         | 20           | 1.00       | 8.00                  |
| Pre-IPO  | 24         | 24           | 1.20       | 9.60                  |
| Public   | 24         | 24           | 1.20       | 9.60                  |

Garage and Pre-seed sit at the floor because there the smallest box, not the traffic, sets the cost.
From Seed the index climbs by 4 points an Era, so infrastructure and payroll grow with the company
while request values stay put. Salary follows the index, and the language factor multiplies on top of
it: PHP 0.85, Node.js and C# 1.0, Python and Java 1.05, Ruby 1.1, Go 1.15, Elixir 1.2, Rust and Zig
1.25, Haskell 1.4 ([Runtimes](/design/06-runtimes#hiring-and-salaries)). [Live tuning](#live-tuning)
records how far these values sit from the design's.

A Balanced design should land at a margin of 25% to 45%, which puts the Rule of 40 checklist item
within reach but not free. No bot asserts that margin yet ([Known balance gaps](#known-balance-gaps)).

### Valuation scale

Game revenue is stylized: 50 million users at 0.02 rps send 1 million rps, and the average request
is worth about $1 to $3. A year of that revenue is about $500 billion. A real company of that size
reports an ARR near $77 million. The valuation scale, 1.5 × 10⁻⁴, converts a year of game revenue into
that real ARR. At the IPO, a Rule of 40 multiple of 13 gives a Valuation of about $1 billion. At 6
billion users the Valuation is about $100 billion.

## Vertical and horizontal

A size step doubles vCPU, RAM, and Burn. Price is linear in resources, as in real clouds. So the
choice between one big box and many small ones is not about price per vCPU. It is about:

| One big box                                                                                    | Many small boxes                                           |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| No load balancer, no network hop                                                               | Redundancy: one failure loses a fraction                   |
| One runtime base memory instead of many                                                        | Fine-grained scaling: add 10%, not 100%                    |
| Runtimes that cannot use more cores waste the size (Node.js on one loop, a pool at one worker) | Needs a load balancer and more connections to the database |
| Resize means a restart                                                                         | Rolling changes                                            |
| Hard cap at `metal` (96 vCPU)                                                                  | Each copy costs 25% more to place                          |

Flat Components have size steps of their own, and each step doubles both capacity and Burn: Payments
6, Analytics 8, Load Balancer 6, Connection Pooler 4, Cache 8, Search Engine 8, Queue 6, WAF 6,
Payment Provider 8, GPU Node 8, LLM API 8, Wide-column Store 6, and Distributed SQL 6.

## User growth

```text
growth = g(Era) × Users × (1 − Users / Market) × h(A)
```

| Era      | `g` (per sim second) | Time to the milestone at Apdex 1.0 with no capacity limit |
| -------- | -------------------- | --------------------------------------------------------- |
| Garage   | 0.0040               | 12 minutes, from 150 to 1,000                             |
| Pre-seed | 0.0022               | 21 minutes, from 1,000 to 5,000                           |
| Seed     | 0.0016               | 28 minutes, from 5,000 to 25,000                          |
| Series A | 0.0009               | 56 minutes, from 25,000 to 150,000                        |
| Series B | 0.0007               | 1 hour 12 minutes, from 150,000 to 1 million              |
| Series C | 0.0005               | 1 hour 56 minutes, from 1 million to 10 million           |
| Pre-IPO  | 0.0003               | 2 hours 30 minutes, from 10 million to 50 million         |
| Public   | 0.0002               | —                                                         |

The times solve the logistic equation from the Era's start to its milestone with the market sizes in
[Progression](/design/10-progression#eras): `t = ln(((M − U₀) / U₀) × (U₁ / (M − U₁))) / g`. The sum is
about 7 hours 36 minutes.

From Series C the formula runs per region ([Simulation](/design/04-simulation#users-and-growth)). With
`seed_share` at 0.05, a Company that reaches Series C with 1,000,000 users starts Europe at 37,500,
Asia-Pacific at 25,000, and South America at 12,500. Far demand is then about 7% of the total, not
60%, so a single-region Design meets the round trip as a warning, not as a collapse. North America's
market alone is 5.6 million, so the 10 million Milestone needs users abroad. The table above assumes
one region and the Era's full market.

Churn is steep on purpose, and much steeper than in real life. Brutlag (2009) found that 400 ms of
extra latency cost Google 0.59% of searches over six weeks; the game compresses weeks into minutes.
Fickle users carry the steepness: at the Series C target of 0.92, an Apdex of 0.91 loses them at
about 3% per calendar hour. Steady users leave at a fifth of that. Three calendar days at 0.909
take a region of 1,000,000 users, half of them steady, to about 360,000, not 93,000 as with one rate.
The [Churn breakdown](/design/12-observability#the-churn-breakdown) shows the rate.

Word of mouth crosses borders at `m` = 0.1. With 1,000,000 users at home, a region abroad grows as
if it had 100,000 users of its own on top of its seed, so it fills fast once its users are served
well, and it recovers after it lost its users.

Brutlag also found that searches stayed low for a while after the delay was removed. The game does
not model that lag: users respond to the last calendar hour only, so a fix shows its effect within
the hour. A lag would hide the feedback the Churn breakdown exists to give.

These are lower bounds: capacity, Cash, and research make a real player slower, while Features raise
`g` and the market, which makes growth faster still. Growth alone sets the length of the first two
Eras: at `g` × 1 the Garage takes 12 sim minutes to go from 150 to 1,000 users and Pre-seed 21 more to
5,000, so Seed arrives at about 33 sim minutes whatever the Design does. At the Company pace, where
`g` is doubled, the same growth takes half as long.

## Pacing model

The pacing model is a set of scripted players that run against the real simulation in tests, so a
balance change shows up as a test failure rather than in a playtest report. Every bot leaves the
Team's autopilot on, and every bot but Greedy hires while payroll, the new hire included, stays under
25% of revenue, up to 4 engineers.

| Bot      | Strategy                                                                                     | Design limit                                       | In the build                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Balanced | Relieves the bottleneck Node, researches by a fixed priority list, builds each Era's content | Inside the targets                                 | Built. Seeds 1–5: Seed reached on every seed at 26.8–35.7 sim minutes, Pre-seed within 20 min, positive Garage and Pre-seed margins |
| Greedy   | Bigger boxes and the cheapest research; never hires                                          | Not beat a target by more than 40%                 | Built. Seeds 1–3: Seed no faster than 27 minutes                                                                                    |
| Stubborn | Never changes the starting Stack                                                             | Reach IPO within 1.6× the target time              | Built. Seeds 1–3: Seed within 1.6× Balanced on the same seed                                                                        |
| Polyglot | Migrates to every language it researches                                                     | Not beat Balanced by more than 30%                 | Built. Seeds 1–3: Seed no faster than 0.7× Balanced                                                                                 |
| Decliner | Plays Balanced and declines every funding round                                              | Legacy per hour not beat Balanced by more than 15% | Built. Seeds 1–3: reaches Seed with Equity at 100%                                                                                  |
| Idle     | Logs in every 2 hours, spends everything, leaves                                             | Reach Series A within 24 hours of real time        | Not built                                                                                                                           |
| Margin   | Plays like Balanced and records margin at each Era milestone                                 | Margin in 25% to 45% from Seed on                  | Not built. `pacing.test.ts` records the margin at Seed and Series A entry instead                                                   |

A balance change passes when the five bots meet their limits on seeds 1–5: Balanced runs on all five
seeds, the other four on seeds 1–3.

## The dominance test

Pillar 2 says no option strictly dominates another. The test checks it.

Four option-set kinds, each scored on every reference design:

| Option set               | Options                                                    |
| ------------------------ | ---------------------------------------------------------- |
| Runtimes                 | The 28 runtimes                                            |
| Frameworks, per language | Each language's frameworks, plus the language-neutral ones |
| Instance families        | Burstable, General, Compute, Memory                        |
| PHP-FPM pool modes       | Static, dynamic, and on demand                             |

The 21 reference designs are the Garage start, the Pre-seed start, a three-server Pre-seed Design,
and the 18 guided Sandboxes. For each design the test applies each option, sizes every pool the way a
careful player would (10 workers per vCPU, no more than fits in RAM after the OS and any local
Postgres, no more than its share of `max_connections`), runs 10 sim minutes at 5 s Steps with the
Team's autopilot on and no incidents, and scores revenue per Burn, p99, error share, and velocity,
the stand-in for Dev Hours.

**Pass** if every option beats every sibling option by at least 10% on at least one of the four
scores on at least one reference design. Membership of the Pareto front is not enough: a cheaper
option is always on the front. **Fail** if any option has no such design; the fix is a design change
to the option, not a number tweak that only passes the test. Three pairs are listed as known gaps, and
the list is exact, so a new gap fails and a closed one fails too
([Known balance gaps](#known-balance-gaps)).

The test runs only under `SLOW_TESTS=1`. CI does not set it.

## Runtime balance targets

| Check                                                                       | Target                                     | Status                                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| PHP-FPM with OPcache against Node.js cluster on `read` with a fast database | Node.js 1.5× to 2.5× throughput per dollar | Pass                                                                        |
| Same, with a database at 100 ms latency                                     | Node.js 3× to 6× (workers held by waits)   | Pass                                                                        |
| Node.js single process with 5% `login`, p99 rise                            | +40 to +120 ms                             | Pass, at ρ = 0.5 and 0.8, and the solve adds the stall to the p99 of `read` |
| Java cold against warm throughput                                           | 30% at start, 100% after 30 s              | `test.todo`                                                                 |
| Rust against Go, server cost for the same load                              | 25% to 40% lower                           | `test.todo`                                                                 |
| Rust against Go, Dev Hours for the same feature set                         | 50% to 70% higher                          | `test.todo`                                                                 |
| Elixir against Node.js, `rt` connections per GB                             | 3× to 5×                                   | `test.todo`                                                                 |
| Rails against Go, Dev Hours for the same feature set                        | 35% to 50% lower                           | `test.todo`                                                                 |

Five of the eight rows are `test.todo` in `balance.test.ts`: the runtimes they compare are in the
build, but the checks are not written. A target that fails is a design change to the runtime, not a
new number.

## Prestige curve

```text
legacy = floor( sqrt( payout / $1,000,000 ) )
```

| Company | Expected payout | Legacy | Cumulative | Shop progress (1,133 ★) |
| ------- | --------------- | ------ | ---------- | ----------------------- |
| 1       | $500 million    | 22     | 22         | 2%                      |
| 2       | $1.5 billion    | 38     | 60         | 5%                      |
| 3       | $5 billion      | 70     | 130        | 11%                     |
| 5       | $20 billion     | 141    | 371        | 33%                     |
| 8       | $50 billion     | 223    | 967        | 85%                     |
| 9       | $80 billion     | 282    | 1,249      | the whole shop          |
| 12      | $200 billion    | 447    | 2,442      | the shop twice over     |

The eleven perks of [the Legacy shop](/design/13-prestige#the-legacy-shop) cost 1,133 ★ in all. The
cumulative column follows payouts of $500 million, $1.5, $5, $10, $20, $30, $40, $50, $80, $120,
$160, and $200 billion for companies 1 to 12, so the shop is complete around the ninth company.

Payout is Equity × Valuation × the Exit's multiplier, so the rounds set it
([Economy](/design/09-economy#funding)): 10% at 1,000 users, 19% at 5,000 and 25,000, 13% at 150,000,
12% at 1,000,000 and 10,000,000, and 15% sold in the IPO offering.

## Live tuning

The pacing knobs live in `catalog/tuning.ts`, and the cost and salary indexes in each Era
(`EraDef.costIndex` and `EraDef.salaryIndex`). Two tunings read them:

- **A Company** plays at `LIVE_TUNING`: growth × 2, an incident every 200 sim seconds, and the first
  90 seconds after the Pre-seed raise.
- **A Challenge and a Sandbox** replay at `CHALLENGE_TUNING`: growth × 1, an incident every 720
  seconds, and the first after 600. The pacing bots use it too, so a run shows a whole curve inside
  a test.

Both share the calendar pace, so a calendar day lasts 60 sim seconds. The `tuning` parameter of
`step`, `growthOf`, `directIncidents`, `raise`, and `decline` selects one.

| Knob           | Challenge pace                     | Company pace                      | Why they differ                                                                                                 | Constant                                            |
| -------------- | ---------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Growth pace    | `g` × 1                            | `g` × 2                           | A session of 15 to 30 minutes needs the faster rate; a replay keeps the slower one so a whole curve fits a test | `CHALLENGE_TUNING`, `LIVE_TUNING` (`PLAYTEST_PACE`) |
| Incident gap   | 720 sim s mean (12 minutes)        | 200 sim s mean                    | A replay spreads incidents across the curve; a session has to meet several                                      | `INCIDENT_GAP`                                      |
| First incident | 600 sim s after the Pre-seed raise | 90 sim s after the Pre-seed raise | A session meets an incident early; a replay does not need to                                                    | `FIRST_INCIDENT_AFTER`                              |
| Calendar pace  | 60 sim s a day                     | 60 sim s a day                    | One value for both: a hire and a deploy have to fit inside a session                                            | `CALENDAR_PACE`                                     |

The cost index, the salary index, and the speeds are one value each, set per Era or per perk rather
than per tuning:

| Knob           | Value                                                      | Why                                                                               | Constant                    |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| Cost index     | 1 / 4 / 8 / 12 / 16 / 20 / 24 / 24                         | Rises with the Era so Burn stays a real share of revenue at every size of company | `EraDef.costIndex`          |
| Salary index   | follows the cost index: 1 / 4 / 8 / 12 / 16 / 20 / 24 / 24 | Payroll has to stay a real share of Burn at the prices the player pays            | `EraDef.salaryIndex`        |
| Company speeds | 0.5×, 1×, 3×, 10×; 20× and 40× with Time dilation          | A slower speed for watching a Design settle, faster ones for the late Eras        | `SPEEDS`, `DILATION_SPEEDS` |

## Open gaps

One row per mechanic the build does not have, grouped by area. Each comes from a "Not built yet"
marker in the document that owns the mechanic, or from the build-against-design comparison this
document used to carry. The last column says what closes the row; it names no owner and no date.

| Area                        | What is missing                                                                                                                                                                                                                                                                                | Document                                               | What closes it                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Features and the Team       | Feature outcomes, rollout, adoption, measured lift, and upkeep: a Feature applies at full strength the moment it ships                                                                                                                                                                         | [08](/design/08-team-and-velocity#features)            | An outcome roll per Feature, a rollout per Feature, an `adoption` share, A/B measurement, and `upkeep_share` |
| Features and the Team       | A rollout that scales a Feature's effects and load, its holdout and measured lift, and a Remove work item: a flagged Feature keeps its full effect and its full load                                                                                                                           | [08](/design/08-team-and-velocity#rollout)             | The outcome and adoption shares, the `ab-testing` research, and a Remove work item                           |
| Features and the Team       | Email digests ship their churn effect only; their `job` burst needs Queues                                                                                                                                                                                                                     | [08](/design/08-team-and-velocity#features)            | A Queue on the Feature's backlog item                                                                        |
| Features and the Team       | Data residency: the 1,440 Dev Hour Feature and the EU market it needs                                                                                                                                                                                                                          | [08](/design/08-team-and-velocity#features)            | The Feature in the catalog and an open EU region                                                             |
| Features and the Team       | Team kinds: Data and Security teams, and their effects. The SRE team and its MTTR effect are built                                                                                                                                                                                             | [08](/design/08-team-and-velocity#teams)               | A team type per kind, with its Dev Hours, MTTR, and incident effects                                         |
| Features and the Team       | Engineering tasks: idempotency keys, timeouts and retries, health check endpoint, graceful shutdown, CPU off the loop, load tests                                                                                                                                                              | [08](/design/08-team-and-velocity#engineering-tasks)   | The task in 08's list, and the mechanic each one changes                                                     |
| Features and the Team       | Migration kinds: move auth in-house, database engine change                                                                                                                                                                                                                                    | [08](/design/08-team-and-velocity#migrations)          | The migration in 08's table, with its Dev Hours                                                              |
| Components                  | Options inside built Components: sticky sessions, purge on deploy, cache key, ARM instances, scheduled scaling, the autoscaler's request-rate and queue-depth signals, bulkheads, WAF bot management                                                                                           | [05](/design/05-components#catalog-overview)           | Each option's rule in the capacity model                                                                     |
| Data tier                   | The MySQL variant's Table bloat incident, and a migration between Database engines                                                                                                                                                                                                             | [07](/design/07-data-tier#capacity)                    | The incident, and a migration that moves a Database from one engine to the other                             |
| Data tier                   | The shard key choice and its skew, scatter-gather, the failure mode of a distributed transaction, and the Dev Hours resharding takes                                                                                                                                                           | [07](/design/07-data-tier#partitioning-sharding)       | A key choice per Database, a hot shard, a fan-out cost, and a resharding work item                           |
| Data tier                   | Synchronous replication; `sync-replication` only gates `consensus`                                                                                                                                                                                                                             | [07](/design/07-data-tier#keeping-copies-in-sync)      | Sync replicas with their latency cost                                                                        |
| Data tier                   | Search Engine options: shards, replicas, heap, and the Elasticsearch and OpenSearch variants                                                                                                                                                                                                   | [07](/design/07-data-tier#search-engine)               | Each option's rule in the search model                                                                       |
| Data tier                   | Object Storage: the R2 variant                                                                                                                                                                                                                                                                 | [07](/design/07-data-tier#object-storage)              | A second store, with its egress and its first-byte latency                                                   |
| Data tier                   | Stampede protection: probabilistic early expiration and stale-while-revalidate; the four write strategies are built                                                                                                                                                                            | [07](/design/07-data-tier#stampedes)                   | Each strategy as a Cache option                                                                              |
| Data tier                   | An index's write cost; indexes add none today                                                                                                                                                                                                                                                  | [07](/design/07-data-tier#indexes)                     | A write cost per index                                                                                       |
| Data tier                   | Data volume touches only the bill and a report's scan: no backup, replica, or migration slows with it, and no Feature value falls when retention deletes its history                                                                                                                           | [07](/design/07-data-tier#data-volume)                 | A time per GB on backups and migrations, and a Feature that needs the window                                 |
| Economy                     | Per-request prices (SQS, Object Storage) and block storage                                                                                                                                                                                                                                     | [09](/design/09-economy#how-prices-map-to-real-prices) | A per-request and per-GB price per Component                                                                 |
| Observability               | The `tracing` waterfall, which waits on a per-kind hop time on the Node ledger, plus a per-kind wait and a per-kind bottleneck marker; `profiling`, `tail-sampling`, `rum` and `anomaly-detection`                                                                                             |
| Observability               | The Service variable, which waits on a per-Service figure in the Ledger                                                                                                                                                                                                                        |
| Observability               | Queue growth and budget burn alert rules; the build watches errors, latency, and saturation only                                                                                                                                                                                               | [12](/design/12-observability#alerting)                | A queue-depth and a budget-burn rule                                                                         |
| Observability               | Era annotations, which need the sim second the Era changed                                                                                                                                                                                                                                     |
| Observability               | Load tests, chaos experiments, and the DR drill                                                                                                                                                                                                                                                | [12](/design/12-observability#the-visibility-ladder)   | Each as a research with its effect                                                                           |
| Incidents                   | Slow start on the Load Balancer, one of the three preventions 11 gives JVM warmup under load; scheduled scaling and the native image are built                                                                                                                                                 | [11](/design/11-incidents#the-six-kinds)               | A slow-start option on the Load Balancer, so a new copy takes traffic gradually                              |
| Exit and Legacy             | The Autopilot perk; upgrades, research queues, and hiring stay manual                                                                                                                                                                                                                          | [13](/design/13-prestige#the-legacy-shop)              | The perk's policy settings                                                                                   |
| Exit and Legacy             | Head start levels 2 and 3: the Seed and Series A starts                                                                                                                                                                                                                                        | [13](/design/13-prestige#the-legacy-shop)              | A starting Era per level, paced by the bots                                                                  |
| Exit and Legacy             | The Shared tenancy Mutator, which needs CPU steal on every instance                                                                                                                                                                                                                            | [13](/design/13-prestige#mutators)                     | A noisy-neighbour model                                                                                      |
| Exit and Legacy             | Venture rules: Fintech's fine for stale money reads and E-commerce's scheduled sale are unbuilt; three older Ventures' rules, Bootstrapped indie's no-funding rule and the four newer Ventures' rules are built, and Consumer social and Streaming media are constrained by their market shape |
| Challenges and achievements | None: all 44 achievements in 14 are detected                                                                                                                                                                                                                                                   | [14](/design/14-challenges#achievements)               | —                                                                                                            |
| Research                    | 33 of the 187 research items are not built. Built per track: Infrastructure 26 of 34, Data 24 of 26, Reliability 16 of 20, Observability 8 of 12, Performance 5 of 8, Runtimes 37 of 37, Frameworks 19 of 19, Security 7 of 9, Cost 2 of 7, Product 10 of 15                                   | [10](/design/10-progression#research)                  | The mechanic each item gates; 10's track lines list the ids                                                  |
| Interface                   | The Limit row on a Node card itself, which waits on `profiling`; the Inspector already names the tightest limit and gauges it                                                                                                                                                                  |
| Mail                        | Switch provider, because no Component has a second provider                                                                                                                                                                                                                                    |
| Mail                        | Blocked, Burnout and quitting, and Proposal to patch threads; the world event draws only a hire                                                                                                                                                                                                | [18](/design/18-mail#teammates)                        | The three senders and their actions                                                                          |
| Mail                        | The fake-CVE backdoor and the recruiter hint, and vendor research discounts                                                                                                                                                                                                                    |
| Mail                        | The Security team's own mail: the pager writes the credential-leak warning                                                                                                                                                                                                                     |

## Known balance gaps

| Gap                                                   | Evidence                                                                                                                                       | What closes it                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| BEAM never beats Go or Kestrel                        | The dominance test lists both pairs as `KNOWN_GAPS`. BEAM holds a realtime connection in half the memory, and the test scores no `rt` design.  | A reference design with `rt`, so connection memory is one of the scores             |
| Axum and Actix each beat the other by about 5%        | Axum 1.0× CPU and 1.15× velocity, Actix 0.95× and 1.10× ([Runtimes](/design/06-runtimes#frameworks)); under the 10% bar, so neither separates. | A Rust framework difference above 10% on one score, or a design that separates them |
| IPO in 9–12 hours has never been measured             | No bot reaches Public; the Balanced bot ends Series B at about 92 sim minutes on seed 3.                                                       | A bot that plays to the IPO checklist, and a measured time against the M6 gate      |
| A second company in 3–6 hours has never been measured | `legacy-pacing.test.ts` stops at Seed; the Balanced bot does not reach Public.                                                                 | A measured second company against the M7 gate                                       |
| The dominance suite does not run in CI                | `dominance.test.ts` is `describe.skipIf(!SLOW)`, and CI runs `pnpm test` without `SLOW_TESTS=1`.                                               | A CI job with `SLOW_TESTS=1`, or a faster dominance run                             |
| The bridge and shutdown are untuned                   | No bot runs a Company short, so the bridge and the shutdown fire at the design's numbers, unmeasured.                                          | A pacing bot that plays a Company into a shortfall                                  |
