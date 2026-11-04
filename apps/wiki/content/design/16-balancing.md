---
title: 16. Balancing
summary: Every formula, every tunable constant, and the pacing model.
section: design
order: 16
---

This document collects every formula and tunable constant, and describes how balance is checked.

**Source of truth.** The build is normative: every number below is checked against the catalog in
`packages/simulation/src/catalog` at `SIM_VERSION` 17, whose golden replay hashes to `0cb85ad1`. Where
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

| Constant              | Symbol         | Value                                           | Where used                                                          |
| --------------------- | -------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| Step length           | —              | 100 ms                                          | [Simulation](/design/04-simulation#time)                            |
| Calendar rate         | —              | 1 sim s = 1 calendar min                        | [Simulation](/design/04-simulation#time)                            |
| Requests per user     | `R_user`       | 0.02 rps                                        | [Demand](/design/04-simulation#demand)                              |
| Diurnal amplitude     | `A`            | 0.45                                            | [Demand](/design/04-simulation#demand)                              |
| Copy price growth     | —              | 1.25×                                           | [Prices](#prices)                                                   |
| Resize price growth   | —              | 2× per size step                                | [Vertical and horizontal](#vertical-and-horizontal)                 |
| Sell refund           | —              | 50%                                             | [Components](/design/05-components#rules-for-all-components)        |
| Insight yield         | —              | 1 × √(sampled rps), per Component type and kind | [Observability](/design/12-observability#earning-insight)           |
| Default sample rate   | —              | 10%                                             | [Observability](/design/12-observability#earning-insight)           |
| Default retention     | —              | 15 min; pool cap at least 100                   | [Observability](/design/12-observability#retention)                 |
| Study duration        | —              | 20 s (Garage) to 60 min (Public)                | [Progression](/design/10-progression#studies)                       |
| Spike speed           | —              | 2×                                              | [Team](/design/08-team-and-velocity#spikes)                         |
| Growth rate           | `g`            | See [User growth](#user-growth)                 |                                                                     |
| Churn rate            | `c`            | 0.004/s                                         | [User growth](#user-growth)                                         |
| Declined-round growth | —              | 0.7 × `g`                                       | [Funding](/design/09-economy#funding)                               |
| Abroad seed share     | `seed_share`   | 0.05 (proposed)                                 | [Going global](/design/04-simulation#going-global)                  |
| Fickle share          | `f`            | 0.5 (proposed)                                  | [Users and growth](/design/04-simulation#users-and-growth)          |
| Steady churn          | `s`            | 0.2 × `c` (proposed)                            | [Users and growth](/design/04-simulation#users-and-growth)          |
| Border mixing         | `m`            | 0.1 (proposed)                                  | [Users and growth](/design/04-simulation#users-and-growth)          |
| Mirror time           | `mirror_time`  | 30 calendar minutes (proposed)                  | [Mirror a region](/design/05-components#mirror-a-region)            |
| Staged sync wait      | `stage_wait`   | 60 calendar minutes (proposed)                  | [GitOps](/design/05-components#gitops)                              |
| GitOps poll           | `sync_poll`    | 3 calendar minutes (Argo CD's default)          | [GitOps](/design/05-components#gitops)                              |
| Plan refresh          | `refresh_time` | 0.5 calendar minutes per Node (proposed)        | [IaC tools](/design/05-components#iac-tools)                        |
| IaC tool switch       | `iac_switch`   | 1,440 calendar minutes (proposed)               | [IaC tools](/design/05-components#iac-tools)                        |
| Valuation scale       | —              | 1.5 × 10⁻⁴                                      | [Valuation scale](#valuation-scale)                                 |
| Coordination penalty  | `k`            | 0.08                                            | [Team](/design/08-team-and-velocity#coordination)                   |
| Dev Hours per day     | —              | 8 per engineer, 6.4 founder                     | [Team](/design/08-team-and-velocity#dev-hours)                      |
| Adoption time         | `τ`            | 7 calendar days                                 | [Adoption](/design/08-team-and-velocity#adoption)                   |
| Lift spread           | `σ`            | 1.0                                             | [Measured lift](/design/08-team-and-velocity#measured-lift)         |
| Upkeep ceiling        | —              | 0.4 × S / (S + 2,000), max 0.6                  | [Upkeep](/design/08-team-and-velocity#upkeep)                       |
| Market gain cap       | —              | +100% of the Era market                         | [Sizes](/design/08-team-and-velocity#sizes)                         |
| Link timeout          | —              | 30 s                                            | [Simulation](/design/04-simulation#capacity-utilization-and-queues) |
| Drawer size           | —              | `max($25, 60 s of revenue)`                     | [Economy](/design/09-economy#the-payments-drawer)                   |
| Offline cap           | —              | 8 h; 12, 18, 24 h with Night shift              | [Simulation](/design/04-simulation#offline-progress)                |
| Offline churn cap     | —              | 5%                                              | [Simulation](/design/04-simulation#offline-progress)                |

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
`g` and the market, which makes growth faster still. Either way, growth alone reaches Seed 32 minutes
after the start, so no Design can stretch the Garage and Pre-seed to the 45–60 minutes the M2 gate
asks for ([Known balance gaps](#known-balance-gaps)).

## Pacing model

The pacing model is a set of scripted players that run against the real simulation in tests, so a
balance change shows up as a test failure rather than in a playtest report. Every bot leaves the
Team's autopilot on, and every bot but Greedy hires while payroll, the new hire included, stays under
25% of revenue, up to 4 engineers.

| Bot      | Strategy                                                                                     | Design limit                                       | In the build                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Balanced | Relieves the bottleneck Node, researches by a fixed priority list, builds each Era's content | Inside the targets                                 | Built. Seeds 1–5: Seed reached on every seed, Pre-seed within 20 min, positive Garage and Pre-seed margins. Seed is outside the 45–60 minute gate ([Known balance gaps](#known-balance-gaps)) |
| Greedy   | Bigger boxes and the cheapest research; never hires                                          | Not beat a target by more than 40%                 | Built. Seeds 1–3: Seed no faster than 27 minutes                                                                                                                                              |
| Stubborn | Never changes the starting Stack                                                             | Reach IPO within 1.6× the target time              | Built. Seeds 1–3: Seed within 1.6× Balanced on the same seed                                                                                                                                  |
| Polyglot | Migrates to every language it researches                                                     | Not beat Balanced by more than 30%                 | Built. Seeds 1–3: Seed no faster than 0.7× Balanced                                                                                                                                           |
| Decliner | Plays Balanced and declines every funding round                                              | Legacy per hour not beat Balanced by more than 15% | Built. Seeds 1–3: reaches Seed with Equity at 100%                                                                                                                                            |
| Idle     | Logs in every 2 hours, spends everything, leaves                                             | Reach Series A within 24 hours of real time        | Not built                                                                                                                                                                                     |
| Margin   | Plays like Balanced and records margin at each Era milestone                                 | Margin in 25% to 45% from Seed on                  | Not built. `pacing.test.ts` records the margin at Seed and Series A entry instead                                                                                                             |

A balance change passes when the five bots meet their limits on seeds 1–5: Balanced runs on all five
seeds, the other four on seeds 1–3.

## The dominance test

Pillar 2 says no option strictly dominates another. The test checks it.

Four option-set kinds, each scored on every reference design:

| Option set               | Options                                                    |
| ------------------------ | ---------------------------------------------------------- |
| Runtimes                 | The 13 runtimes                                            |
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

The knobs the build runs at, from `catalog/tuning.ts` and `ERAS` in `catalog/eras.ts`. Tests and bots
pass the design values instead (`DESIGN_TUNING`, `DESIGN_COST_INDEX`, `DESIGN_SALARY_INDEX`, and the
`tuning` parameter of `step`, `growthOf`, `directIncidents`, `raise`, and `decline`).

| Knob           | Design value                                               | Live value                                                 | Why it moved                                                                            | Constant                                                |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Growth pace    | `g` × 1                                                    | `g` × 2                                                    | The design pace left the slice empty in playtests                                       | `PLAYTEST_PACE`                                         |
| Incident gap   | 720 sim s mean (12 minutes)                                | 200 sim s                                                  | Twelve minutes put one incident in a whole playtest                                     | `INCIDENT_GAP`                                          |
| First incident | 600 sim s after the Pre-seed raise                         | 90 sim s                                                   | A playtest has to meet an incident early                                                | `FIRST_INCIDENT_AFTER`                                  |
| Calendar pace  | 1 sim s per calendar minute, so a day takes 24 sim minutes | ÷ 24, so a day takes 1 sim minute                          | A hire took a calendar day and joined near the end of the slice                         | `CALENDAR_PACE`                                         |
| Cost index     | 1 / 1 / 25 / 120 / 120 / 160 / 190 / 190                   | 1 / 4 / 8 / 12 / 16 / 20 / 24 / 24                         | Pre-seed at 1 made Cash free; Seed at 25 left the bot's Designs at a −55% to 20% margin | `EraDef.costIndex`; the design's is `DESIGN_COST_INDEX` |
| Salary index   | 1 / 1 / 12 / 100 / 400 / 1,400 / 2,700 / 2,700             | follows the cost index: 1 / 4 / 8 / 12 / 16 / 20 / 24 / 24 | Payroll has to stay a real share of Burn at the live prices                             | `EraDef.salaryIndex`; `DESIGN_SALARY_INDEX`             |
| Company speeds | 1×; 2× and 4× from Legacy                                  | 0.5×, 1×, 3×, 10×; 20× and 40× with Time dilation          | Extra speeds read better than a scaled top speed                                        | `SPEEDS` and `DILATION_SPEEDS`                          |

## Open gaps

One row per mechanic the build does not have, grouped by area. Each comes from a "Not built yet"
marker in the document that owns the mechanic, or from the build-against-design comparison this
document used to carry. The last column says what closes the row; it names no owner and no date.

| Area                        | What is missing                                                                                                                                                                                                                                                                                                                        | Document                                                                                   | What closes it                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Features and the Team       | Feature outcomes, rollout, adoption, measured lift, and upkeep: a Feature applies at full strength the moment it ships                                                                                                                                                                                                                 | [08](/design/08-team-and-velocity#features)                                                | An outcome roll per Feature, a rollout per Feature, an `adoption` share, A/B measurement, and `upkeep_share`                                                                          |
| Features and the Team       | Feature Flags and A/B testing, so a rollout cannot be staged or turned off                                                                                                                                                                                                                                                             | [08](/design/08-team-and-velocity#rollout)                                                 | The `ff` Component, the `ab-testing` research, and a Remove work item                                                                                                                 |
| Features and the Team       | Email digests ship their churn effect only; their `job` burst needs Queues                                                                                                                                                                                                                                                             | [08](/design/08-team-and-velocity#features)                                                | A Queue on the Feature's backlog item                                                                                                                                                 |
| Features and the Team       | Data residency: the 1,440 Dev Hour Feature and the EU market it needs                                                                                                                                                                                                                                                                  | [08](/design/08-team-and-velocity#features)                                                | The Feature in the catalog and an open EU region                                                                                                                                      |
| Features and the Team       | Service splits and Ownership: the Company is one Service                                                                                                                                                                                                                                                                               | [08](/design/08-team-and-velocity#services)                                                | More than one Service, with the Ownership rules                                                                                                                                       |
| Features and the Team       | Team kinds: SRE, Data, and Security teams, and their effects                                                                                                                                                                                                                                                                           | [08](/design/08-team-and-velocity#teams)                                                   | A team type per kind, with its Dev Hours, MTTR, and incident effects                                                                                                                  |
| Features and the Team       | Engineering tasks: idempotency keys, timeouts and retries, runbooks, health check endpoint, graceful shutdown, CPU off the loop, load tests                                                                                                                                                                                            | [08](/design/08-team-and-velocity#engineering-tasks)                                       | The task in 08's list, and the mechanic each one changes                                                                                                                              |
| Features and the Team       | Migration kinds: split a service, move auth in-house, database engine change                                                                                                                                                                                                                                                           | [08](/design/08-team-and-velocity#migrations)                                              | The migration in 08's table, with its Dev Hours                                                                                                                                       |
| Components                  | Eleven Components: API Gateway, Serverless Function, Edge Function, Document Store, Vector Index, Event Stream, CDC Connector, Service Mesh, CI/CD Pipeline, Feature Flags, Secrets and Certificates                                                                                                                                   | [05](/design/05-components#catalog-overview)                                               | A model for each Component, and the research that unlocks it                                                                                                                          |
| Components                  | Options inside built Components: sticky sessions, purge on deploy, cache key, ARM instances, scheduled scaling, the autoscaler's request-rate and queue-depth signals, bulkheads, WAF bot management                                                                                                                                   | [05](/design/05-components#catalog-overview)                                               | Each option's rule in the capacity model                                                                                                                                              |
| Data tier                   | IOPS and storage class: a Database's only limit is CPU and connections                                                                                                                                                                                                                                                                 | [07](/design/07-data-tier#capacity)                                                        | An IOPS limit set by storage class                                                                                                                                                    |
| Data tier                   | The MySQL variant, its thread-per-connection behaviour, and the Table bloat incident                                                                                                                                                                                                                                                   | [07](/design/07-data-tier#capacity)                                                        | A second Database engine                                                                                                                                                              |
| Data tier                   | Sharding and partitioning                                                                                                                                                                                                                                                                                                              | [07](/design/07-data-tier#partitioning-sharding)                                           | Shards and partitions in the data model                                                                                                                                               |
| Data tier                   | Synchronous replication; `sync-replication` only gates `consensus`                                                                                                                                                                                                                                                                     | [07](/design/07-data-tier#keeping-copies-in-sync)                                          | Sync replicas with their latency cost                                                                                                                                                 |
| Data tier                   | Search Engine options: refresh interval, shards, replicas, heap, and the Elasticsearch and OpenSearch variants                                                                                                                                                                                                                         | [07](/design/07-data-tier#search-engine)                                                   | Each option's rule in the search model                                                                                                                                                |
| Data tier                   | Object Storage options: R2, storage classes, and Lifecycle rules                                                                                                                                                                                                                                                                       | [07](/design/07-data-tier#object-storage)                                                  | A second store and a storage class                                                                                                                                                    |
| Data tier                   | Cache strategies: probabilistic early expiration and stale-while-revalidate                                                                                                                                                                                                                                                            | [07](/design/07-data-tier#strategies-a-tradeoff-card)                                      | Each strategy as a Cache option                                                                                                                                                       |
| Data tier                   | An index's write cost; indexes add none today                                                                                                                                                                                                                                                                                          | [07](/design/07-data-tier#indexes)                                                         | A write cost per index                                                                                                                                                                |
| Data tier                   | Backups: the 20% restore failure of untested backups, and Restore drills                                                                                                                                                                                                                                                               | [07](/design/07-data-tier#backups)                                                         | A restore roll and the research                                                                                                                                                       |
| Economy                     | Pricing models: on-demand, reserved, spot, and serverless; every Node bills at one rate                                                                                                                                                                                                                                                | [09](/design/09-economy#pricing-models)                                                    | A billing model per Node                                                                                                                                                              |
| Economy                     | Runway and bridge: no runway figure, no bridge offer, no automatic shutdown                                                                                                                                                                                                                                                            | [09](/design/09-economy#runway-and-running-out-of-cash)                                    | A runway rule on Cash and Burn                                                                                                                                                        |
| Economy                     | The Cost panel: Burn is not split into its lines                                                                                                                                                                                                                                                                                       | [09](/design/09-economy#the-cloud-bill), [15](/design/15-ui-ux#panels)                     | The panel over the Burn lines                                                                                                                                                         |
| Economy                     | Per-request prices (API Gateway, Serverless Functions, SQS, Object Storage) and block storage                                                                                                                                                                                                                                          | [09](/design/09-economy#how-prices-map-to-real-prices)                                     | A per-request and per-GB price per Component                                                                                                                                          |
| Observability               | The Dashboard ladder's upper rows: the `tracing` waterfall, `profiling`, `tail-sampling`, `rum`, and `anomaly-detection`                                                                                                                                                                                                               | [12](/design/12-observability#the-visibility-ladder)                                       | One row per research step                                                                                                                                                             |
| Observability               | The per-Service RED row and the per-resource USE row                                                                                                                                                                                                                                                                                   | [12](/design/12-observability#the-dashboard)                                               | A row per Service and per resource                                                                                                                                                    |
| Observability               | Queue growth and budget burn alert rules; the build watches errors, latency, and saturation only                                                                                                                                                                                                                                       | [12](/design/12-observability#alerting)                                                    | A queue-depth and a budget-burn rule                                                                                                                                                  |
| Observability               | Alert state timelines, and annotations for deploys, research, and Eras                                                                                                                                                                                                                                                                 | [12](/design/12-observability#the-dashboard)                                               | The timeline and the marker kinds                                                                                                                                                     |
| Observability               | Load tests, chaos experiments, and the DR drill                                                                                                                                                                                                                                                                                        | [12](/design/12-observability#the-visibility-ladder)                                       | Each as a research with its effect                                                                                                                                                    |
| Observability               | MTTD, MTTA, and on-call                                                                                                                                                                                                                                                                                                                | [11](/design/11-incidents#the-incident-loop), [12](/design/12-observability#the-dashboard) | The two metrics and the `on-call` research                                                                                                                                            |
| Incidents                   | Runbooks and automatic responses; every mitigation is a player action                                                                                                                                                                                                                                                                  | [11](/design/11-incidents#runbooks)                                                        | The `runbooks` research and a mitigation per incident                                                                                                                                 |
| Incidents                   | Nine incidents: spot reclaim wave, thundering herd on reconnect, JVM warmup under load, schema migration lock, supply-chain compromise, runaway bill, accidental delete, operator typo, leap second or clock skew                                                                                                                      | [11](/design/11-incidents#catalog)                                                         | One incident definition each, with its mitigations                                                                                                                                    |
| Incidents                   | Drain a Node                                                                                                                                                                                                                                                                                                                           | [11](/design/11-incidents#mitigation-toolbox)                                              | A mitigation that stops new traffic without a restart                                                                                                                                 |
| Incidents                   | SLA credits and `enterprise-sales`                                                                                                                                                                                                                                                                                                     | [11](/design/11-incidents#the-incident-loop), [09](/design/09-economy#pricing-models)      | An SLA per Venture and a credit when it is missed                                                                                                                                     |
| Exit and Legacy             | The Autopilot perk; upgrades, research queues, and hiring stay manual                                                                                                                                                                                                                                                                  | [13](/design/13-prestige#the-legacy-shop)                                                  | The perk's policy settings                                                                                                                                                            |
| Exit and Legacy             | Head start levels 2 and 3: the Seed and Series A starts                                                                                                                                                                                                                                                                                | [13](/design/13-prestige#the-legacy-shop)                                                  | A starting Era per level, paced by the bots                                                                                                                                           |
| Exit and Legacy             | The Shared tenancy Mutator, which needs CPU steal on every instance                                                                                                                                                                                                                                                                    | [13](/design/13-prestige#mutators)                                                         | A noisy-neighbour model                                                                                                                                                               |
| Exit and Legacy             | Four Ventures: Developer platform, Healthcare, Ad tech, and Government contract                                                                                                                                                                                                                                                        | [13](/design/13-prestige#ventures)                                                         | Each Venture's mix, demand shape, and unlock                                                                                                                                          |
| Exit and Legacy             | Venture constraints and signature incidents; only Bootstrapped indie's no-funding rule is built                                                                                                                                                                                                                                        | [13](/design/13-prestige#ventures)                                                         | One constraint and one signature incident per Venture                                                                                                                                 |
| Challenges and achievements | 21 of the 44 achievements are not detected: Shared Nothing, Blocked, Two Hard Things, Off by One Region, Little's Law, Big Rewrite, Conway's Law, Fallacies, Quorum, Eventually, Five Nines, Thundering Herd, Runbook, Egress Shock, FinOps, Spot the Difference, Warm Start, Let It Crash, Celebrity, Follow the Sun, Everyone Online | [14](/design/14-challenges#achievements)                                                   | A detector for each condition, and the mechanic behind it: a Services split, runbooks, spot Nodes, reserved pricing, the JVM warmup model, multi-region quorum stores, the Public Era |
| Runtimes                    | Runtime variants and frameworks: Swoole, Unicorn, YJIT, Falcon, gevent, Uvicorn, free-threaded CPython, PyPy, worker threads, Bun, Deno, virtual threads, WebFlux, GraalVM native image, Native AOT, fasthttp, distributed Erlang, NIFs, `spawn_blocking`, jemalloc, FastAPI, Fastify, Next.js, NestJS, Fiber, Quarkus                 | [06](/design/06-runtimes#language-profiles)                                                | A row per variant, with its speed, memory, and Dev Hours                                                                                                                              |
| Runtimes                    | Hot code reload, and the ML ecosystem value bonus                                                                                                                                                                                                                                                                                      | [06](/design/06-runtimes#language-profiles)                                                | A zero-restart deploy per runtime, and a value bonus per language                                                                                                                     |
| Runtimes                    | The Realtime Hub, so `rt` needs no migration to a runtime that holds connections                                                                                                                                                                                                                                                       | [05](/design/05-components#realtime-hub)                                                   | The Component and its connection model                                                                                                                                                |
| Research                    | 77 of the 179 research items are not built. Built per track: Infrastructure 21 of 34, Data 16 of 26, Reliability 10 of 19, Observability 8 of 12, Performance 5 of 8, Runtimes 16 of 37, Frameworks 13 of 19, Security 6 of 9, Cost 7 of 15                                                                                            | [10](/design/10-progression#research)                                                      | The mechanic each item gates; 10's track lines list the ids                                                                                                                           |
| Interface                   | The Cost, Company, and Incidents panels                                                                                                                                                                                                                                                                                                | [15](/design/15-ui-ux#panels)                                                              | A panel per key                                                                                                                                                                       |
| Interface                   | Buy ×10 and Max, hold to repeat, and upgrade all of a type                                                                                                                                                                                                                                                                             | [15](/design/15-ui-ux#bulk-actions)                                                        | The bulk actions on the card                                                                                                                                                          |
| Interface                   | A shape per request kind, and reduced-motion flow arrows with rate labels                                                                                                                                                                                                                                                              | [15](/design/15-ui-ux#the-board)                                                           | The particle shape and the arrow label                                                                                                                                                |
| Interface                   | Save export and import as a text string                                                                                                                                                                                                                                                                                                | [15](/design/15-ui-ux#panels)                                                              | The encoder and its version check                                                                                                                                                     |
| Interface                   | The inspector's `Limit` row and the gauges behind it: the Resource section shows CPU, RAM, workers busy, CPU credits, and connections; there is no network gauge and no goal bar                                                                                                                                                       | [15](/design/15-ui-ux#node-cards)                                                          | A gauge per limit, and the goal bar naming the tightest one                                                                                                                           |
| Interface                   | A radar on the Tradeoff card for the instance family; the radar is drawn for runtimes and frameworks only                                                                                                                                                                                                                              | [15](/design/15-ui-ux#tradeoff-cards)                                                      | Six axes for every option set. The glossary half is built: a card term opens the in-game glossary at its entry                                                                        |
| Mail                        | Most mail actions: Resize, Raise quota, Switch to Reserved, Approve, Later, Give time off, Raise salary, Accept resignation, Patch now, Queue the patch                                                                                                                                                                                | [18](/design/18-mail#actions)                                                              | An action per message kind                                                                                                                                                            |
| Mail                        | Blocked, Burnout and quitting, and Proposal to patch threads; the world event draws only a hire                                                                                                                                                                                                                                        | [18](/design/18-mail#teammates)                                                            | The three senders and their actions                                                                                                                                                   |
| Mail                        | Labels as filter chips and the sender-kind label on a row                                                                                                                                                                                                                                                                              | [18](/design/18-mail#the-inbox)                                                            | The filter chips and the row label                                                                                                                                                    |
| Mail                        | The exposure gate, the spam filter, phishing effects and tells, report-as-spam, the coloured left bar, and the digest                                                                                                                                                                                                                  | [18](/design/18-mail#spam-and-phishing)                                                    | Each mail rule                                                                                                                                                                        |
| Mail                        | The Credential leak incident and the Security team's mail                                                                                                                                                                                                                                                                              | [18](/design/18-mail#what-exists-today)                                                    | The incident, and the team that answers it                                                                                                                                            |

## Known balance gaps

| Gap                                                      | Evidence                                                                                                                                                                                                                                                                                                                                                             | What closes it                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| BEAM never beats Go or Kestrel                           | The dominance test lists both pairs as `KNOWN_GAPS`. BEAM holds a realtime connection in half the memory, and the test scores no `rt` design.                                                                                                                                                                                                                        | A reference design with `rt`, so connection memory is one of the scores             |
| Axum and Actix each beat the other by about 5%           | Axum 1.0× CPU and 1.15× velocity, Actix 0.95× and 1.10× ([Runtimes](/design/06-runtimes#frameworks)); under the 10% bar, so neither separates.                                                                                                                                                                                                                       | A Rust framework difference above 10% on one score, or a design that separates them |
| Seed arrives far earlier than the design's 45–60 minutes | The Balanced bot reaches Seed at 20.5–21.1 sim minutes at the live pace on seeds 1 and 3, and 26.8–29.3 at the design pace, which is also the pace a Challenge replays at. Growth alone takes the Garage from 150 to 1,000 users in 12 minutes and Pre-seed from 1,000 to 5,000 in 21, and Features raise `g` and the market, so no Design can stretch the two Eras. | A design decision, not tuning: raise the Pre-seed and Seed thresholds, or lower `g` |
| IPO in 9–12 hours has never been measured                | No bot reaches Public; the Balanced bot ends Series B at about 92 sim minutes on seed 3.                                                                                                                                                                                                                                                                             | A bot that plays to the IPO checklist, and a measured time against the M6 gate      |
| A second company in 3–6 hours has never been measured    | `legacy-pacing.test.ts` stops at Seed; the Balanced bot does not reach Public.                                                                                                                                                                                                                                                                                       | A measured second company against the M7 gate                                       |
| The dominance suite does not run in CI                   | `dominance.test.ts` is `describe.skipIf(!SLOW)`, and CI runs `pnpm test` without `SLOW_TESTS=1`.                                                                                                                                                                                                                                                                     | A CI job with `SLOW_TESTS=1`, or a faster dominance run                             |
