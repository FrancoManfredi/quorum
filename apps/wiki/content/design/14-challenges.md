---
title: 14. Sandbox, Challenges, and achievements
summary: Guided and free Sandboxes, fixed puzzles scored in the browser, daily drills, and achievements.
section: design
order: 14
---

## Sandbox

A **Sandbox** is a Board outside any Company. It runs the same Simulation as a Company. Nothing in a
Sandbox changes a Company, and nothing in a Company changes a Sandbox. There are two kinds: guided
and free. [ADR 0003](https://github.com/elianiva/quorum/blob/main/docs/adr/0003-sandbox-teaches-outside-the-company.md) records why.

The Sandbox fixes one problem. A Company teaches each mechanic when the player first needs it, so a
player who wants to learn zones or GC pauses must first play the Company to Series A. The Garage Era
is the tutorial for a new player ([Progression](/design/10-progression#era-0-garage)).

### Guided Sandboxes

A guided Sandbox teaches one mechanic through two to four ordered objectives, like a Factorio
tutorial level.

- **Start.** A fixed Design with the problem already on the Board, or one that appears within the
  first minute: a red card, a long tail, or Stranded requests.
- **Objectives.** Each objective is one sentence that states the goal, for example "Keep p99 under
  300 ms for 2 minutes." It passes when its rule on the Ledger holds for 90 to 180 sim seconds
  without a break. A break starts the hold again.
- **Escalation.** Later objectives raise demand, add a Burn budget, or script an Incident, so the
  first fix stops being enough. An Incident the Design must survive fires again after each failure.
  An Incident the player must answer by hand, such as a slow query, fires once.
- **Palette.** The research the Sandbox grants. It holds the fix, plus at least one wrong option that
  a reasonable player would try. The wrong option plays out, so the player sees why it fails.
- **Demand and seed.** Fixed and flat, with no daily cycle. Users do not grow or leave.
- **Visibility.** The Sandbox grants the [visibility step](/design/12-observability#the-visibility-ladder)
  that the mechanic needs. A player cannot learn tail latency without seeing the p99.
- **Money.** None. Placing and resizing are free; Burn shows, because some objectives set a budget.
- **Length.** Varies with the mechanic. At 1× speed the fastest pass takes 4 to 11 sim minutes, and
  a first attempt takes longer. Later tracks are longer, as later Factorio tutorials are.

A guided Sandbox has no text overlays, arrows, or step-by-step prompts. The Board, the Node cards, and
the Tradeoff cards work as they do in a Company. The game teaches through consequences
([Vision](/design/01-vision#what-quorum-is-not)).

Results are pass or fail. There is no score, no histogram, and no server. Nothing pays Cash,
Insight, or Legacy, because a reward would make the Sandbox a required grind
([pillar 5](/design/01-vision#pillar-5-respect-the-player)).

### Sandbox tracks

A **Sandbox track** is the ordered set of guided Sandboxes for one Era. Every track is available from
the start. Inside a track, each Sandbox opens when the player passes the one before it.

| Era      | Guided Sandbox       | The problem on the Board                            | The fix it teaches                                                            |
| -------- | -------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Garage   | Out of Credits       | A Burstable box is throttled to 20%                 | Change the Instance type: vertical scaling                                    |
| Garage   | Shared Box           | App and database on one box run out of RAM          | Split the database onto its own Node                                          |
| Garage   | Second Server        | One App Server at 100%                              | A Load Balancer and a second App Server                                       |
| Pre-seed | Connection Limit     | More App Servers cause `refused` errors at Postgres | A Connection Pooler                                                           |
| Pre-seed | Event Loop Stall     | 5% `login` on Node.js raises the p99 of every kind  | Route `login` to its own App Servers, or change Stack                         |
| Pre-seed | Read Mostly          | The database is the bottleneck on `q-read`          | A Cache. A Read Replica passes the first objective, then fails on stale reads |
| Seed     | Stampede             | A cache restart sends every miss to the database    | Stampede protection and cache warming                                         |
| Seed     | Slow Uploads         | `upload` holds App Server slots                     | A Queue and a Worker                                                          |
| Seed     | Bots                 | A `bot` flood takes Capacity from real users        | Rate limits and a WAF                                                         |
| Series A | Zone Outage          | A zone fails at minute 2                            | Multi-zone with spare capacity                                                |
| Series A | Cold Start           | New JVM Nodes are slow during a spike               | Warmup and spare capacity                                                     |
| Series A | Stale Checkout       | `buy` reads its own write from a lagging replica    | Read-your-writes routing                                                      |
| Series B | GC Pauses            | Heap above 90%: the p99 spikes and the p50 does not | More memory or a different collector                                          |
| Series B | Retry Storm          | Retries multiply load after a short outage          | Retry budgets, backoff, and load shedding                                     |
| Series B | Analytics on Primary | `report` queries slow down checkout on the primary  | A Warehouse                                                                   |
| Series C | Far Away             | Users in another region see 150 ms more latency     | A second region                                                               |
| Series C | Missed Write         | Reads miss the latest write                         | R + W > N                                                                     |
| Series C | Hot Key              | One key receives 30% of reads                       | Key splitting and local caching                                               |

The list is a balance target. Each track arrives with the milestone that adds its mechanics
([Scope and roadmap](/design/17-scope-and-roadmap#milestones)). All six tracks hold 18
Sandboxes in all, and a test plays each one with its fix and with a wrong option.

### Free Sandbox

The free Sandbox is a test bench.

- Every Component, Stack, research item, and visibility step is unlocked.
- Cash is unlimited. Burn still shows, so the player sees what a Design costs.
- The player sets the users and an Era's Request kind mix, sets the speed, and triggers any Incident
  in the [catalog](/design/11-incidents#catalog).
- There are no Users to grow, no Funding rounds, no Team, no Dev Hours, and no Insight. A free
  Sandbox is Design and traffic only.
- The player can copy the current Company's Design into a free Sandbox, like a staging environment,
  to test a change before making it in the Company.
- The free Sandbox keeps its Board in local storage between visits, apart from the Company save.
- Achievements do not count in any Sandbox.

## Challenges

A **Challenge** is a fixed puzzle, separate from the company. It gives a brief, a fixed demand,
a fixed palette, a fixed budget, and a duration. The player builds a design and runs it. A Challenge
is complete when the design meets its targets.

This mode follows Opus Magnum: a crude solution is easy, and the depth is in improving it
([Influences](/design/02-influences#opus-magnum-and-zachtronics)).

### Scoring

Every completed Challenge scores three axes. Lower is better on all three.

| Axis       | Measure                              |
| ---------- | ------------------------------------ |
| Cost       | Burn per second at the target load   |
| Tail       | p99 latency over the run             |
| Complexity | Number of Nodes plus number of links |

The browser scores each axis and shows the run's own figures. Once accounts exist, each axis gets a
**histogram** of every player's best result, so the player sees where they fall, for example "Cost:
better than 72% of players". The game never shows a rank or a top-10 list. The question is whether
the player can reach the 70th percentile, not whether they can be first.

The three axes conflict. A cheap design has a long tail. A short tail needs more Nodes. So the player
picks a direction, and each player's best results usually come from different designs.

### Rules

- The first Challenge is open from the start. Completing a Challenge opens the next in the global
  list, including across Era boundaries. Completed Challenges remain open for replay; the daily drill
  is always open.
- A Challenge's palette is fixed. Legacy perks do not apply. Every player has the same tools.
- The seed is fixed. Incidents in a Challenge are scripted and the same for everyone.
- The browser scores the run and sends nothing. A device ID is a random string the player can reset, so
  a server score per device would prove little. With accounts, the result goes up as a design plus a
  seed, and the server re-runs it and keeps its own score. That works because the simulation is
  deterministic ([Simulation](/design/04-simulation#determinism-and-randomness)).
  [ADR 0016](https://github.com/elianiva/quorum/blob/main/docs/adr/0016-challenges-stay-in-the-browser-until-accounts.md)
  has the reasoning.
- Rewards: a badge, and Legacy on first completion (1 to 10 ★ by difficulty). No Cash, no power.

### Challenge list

Each Challenge is inspired by a real event or a real engineering problem. Briefs name the event as
an inspiration; the numbers are the game's.

| #   | Challenge                      | Era      | Inspired by                                                           | The problem                                                                      |
| --- | ------------------------------ | -------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Hello, World                   | Garage   | Every first deploy                                                    | Serve 20 rps of `page` on one box under $0.05/s                                  |
| 2   | Split the Box                  | Garage   | The first scaling step at most companies                              | App and database share a box; reach 100 rps                                      |
| 3   | Slashdotted                    | Pre-seed | The Slashdot effect                                                   | ×10 traffic for 3 minutes with a fixed budget                                    |
| 4   | C10k                           | Pre-seed | Dan Kegel's C10k problem (1999)                                       | 10,000 concurrent slow clients; process-per-request runtimes fail                |
| 5   | The Event Loop                 | Pre-seed | Node.js "Don't block the event loop"                                  | Node.js only; 5% `login`; p99 under 300 ms                                       |
| 6   | Too Many Connections           | Pre-seed | PostgreSQL connection limits                                          | 40 App Servers, one Postgres; no `refused` errors                                |
| 7   | Stack Overflow on a Shoestring | Seed     | Stack Overflow serving huge traffic from a small number of servers    | Serve the target with at most 12 Nodes                                           |
| 8   | The N+1                        | Seed     | ORM lazy loading                                                      | Rails with N+1; 12 Dev Hours to fix it, then minimize Cost                       |
| 9   | Thirteen Engineers             | Seed     | Instagram had 13 employees when Facebook acquired it (2012)           | Reach the target with a team of 13 and a fixed Dev Hour budget                   |
| 10  | Credential Stuffing            | Seed     | Common attacks on login endpoints                                     | Survive a `login` bot flood without blocking real users                          |
| 11  | Black Friday                   | Series A | Retail peak days                                                      | A known spike at a known hour; minimize cost                                     |
| 12  | us-east-1                      | Series A | Several AWS us-east-1 outages                                         | A zone dies at minute 5; keep 99.9%                                              |
| 13  | Exactly Once                   | Series A | Payment idempotency                                                   | Checkout with retries and no duplicates                                          |
| 14  | Two Million Sockets            | Series A | Phoenix reached 2 million WebSocket connections on one server (2015)  | Hold the most `rt` connections per dollar                                        |
| 15  | Pokémon GO                     | Series A | Pokémon GO launch traffic reached about 50× the planned target (2016) | Demand ×50 of the forecast within 10 minutes                                     |
| 16  | Healthcare Launch Day          | Series A | The healthcare.gov launch (2013)                                      | A fixed design with many faults; fix it under time pressure                      |
| 17  | Thundering Herd                | Series A | Reconnect storms                                                      | A Realtime Hub restart at minute 2; 60,000 users, then 240,000 reconnect at once |
| 18  | Read States                    | Series B | Discord moved a service from Go to Rust to remove GC spikes (2020)    | A hot service with a strict p99; any runtime                                     |
| 19  | The Fail Whale                 | Series B | Twitter's timeline scaling problems                                   | Serve `feed` for accounts with 10 million followers                              |
| 20  | Reports at Noon                | Series B | Analytical queries on transactional databases                         | Add dashboards without hurting checkout                                          |
| 21  | GPU Economics                  | Series B | Self-hosted inference against hosted APIs                             | Serve `ai` at the target with a positive margin                                  |
| 22  | Metastable                     | Series B | Metastable failures in distributed systems                            | A retry storm in progress; recover with the fewest changes                       |
| 23  | Regex of Doom                  | Series B | Cloudflare outage, 2 July 2019                                        | A WAF rule pins CPU worldwide; restore service                                   |
| 24  | 43 Seconds                     | Series C | GitHub network partition, 21 October 2018                             | A short partition between regions; avoid split brain                             |
| 25  | Follow the Sun                 | Series C | Global daily peaks                                                    | Four regions with offset peaks; minimize cost                                    |
| 26  | Celebrity                      | Series C | Hot keys from viral accounts                                          | One key receives 30% of reads                                                    |
| 27  | Gone From the Internet         | Series C | Facebook outage, 4 October 2021                                       | A routing change removes all regions; restore with a staged rollout              |
| 28  | The Typo                       | Series C | Amazon S3 outage, 28 February 2017                                    | A capacity removal command goes wrong; recover a data tier                       |
| 29  | Leap Second                    | Pre-IPO  | The 2012 leap second                                                  | Clock jumps across a region                                                      |
| 30  | Rule of 40                     | Pre-IPO  | The SaaS Rule of 40                                                   | Reach growth plus margin of 40 from a loss-making design                         |
| 31  | Postgres for Everything        | Pre-IPO  | The "just use Postgres" argument                                      | Serve every kind with only Postgres Components                                   |
| 32  | Five Nines                     | Public   | 99.999% availability targets                                          | 99.999% of requests across four calendar weeks of scripted incidents             |

## The daily drill

Every calendar day (real day, UTC), all players get the same short Challenge: a seeded design with
a seeded incident. With accounts, results go on a daily histogram. The drill takes 5 to 15 minutes. It is optional
and never rewards streaks, so missing a day costs nothing.

## Achievements

Achievements reward knowledge, unusual builds, and real engineering moments. They do not reward hours
played. Some unlock Mutators or Ventures ([Exit and Legacy](/design/13-prestige)).

| Achievement             | Condition                                                            | Unlocks                          |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------- |
| Hello, World            | Serve the first request                                              | None                             |
| It Works on My Machine  | Ship a bad deploy                                                    | None                             |
| Split Brain             | Split the database onto its own Node                                 | None                             |
| Averages Lie            | Research `percentiles` while p99 is more than 5× the mean            | None                             |
| Shared Nothing          | Reach Seed with only PHP-FPM servers and no memory incident          | None                             |
| Blocked                 | Have a Node.js service whose p99 rises by 100 ms from one kind       | None                             |
| Two Hard Things         | Have a stale-read incident on a cache                                | None                             |
| Off by One Region       | Serve a user from a region more than 150 ms away                     | None                             |
| Little's Law            | Fix an app server bottleneck by fixing the database                  | None                             |
| Default Alive           | Reach IPO without raising any round                                  | Bootstrapped indie               |
| Polyglot                | Run five languages in production at once                             | None                             |
| Monoglot                | Reach IPO with one language                                          | Mutator: Single language         |
| Big Rewrite             | Migrate every service to a new language in one company               | None                             |
| Strangler               | Finish a migration in four traffic steps with errors under 1%        | None                             |
| Conway's Law            | Have more Services than teams, then fix it                           | None                             |
| Fallacies               | Experience all eight fallacies of distributed computing in incidents | None                             |
| Quorum                  | Run a wide-column store with R + W > N across three regions          | None                             |
| Eventually              | Run R = 1, W = 1 at a billion users                                  | None                             |
| Nines                   | Hold 99.99% for a calendar week                                      | Mutator: Strict SLO              |
| Five Nines              | Complete the Five Nines Challenge                                    | None                             |
| Thundering Herd         | Survive a reconnect storm with no errors                             | None                             |
| Metastable              | Recover from a retry storm                                           | None                             |
| Blameless               | Write 50 postmortems                                                 | None                             |
| Runbook                 | Have an incident resolve with no player action                       | None                             |
| Chaos Monkey            | Survive 100 random terminations                                      | Mutator: Chaos Monkey            |
| Hug of Death            | Survive a ×10 spike with no lost users                               | Mutator: Hacker News front page  |
| Egress Shock            | Have egress be the largest line on the bill                          | None                             |
| FinOps                  | Run a fleet with reserved, on-demand, and spot Nodes at once         | None                             |
| Spot the Difference     | Survive a spot reclaim with no errors                                | None                             |
| Warm Start              | Scale a JVM service during a spike with no p99 regression            | None                             |
| Zero GC                 | Run a Rust service at 100,000 rps                                    | None                             |
| Let It Crash            | Have an Elixir service survive 1,000 crashes with no failed requests | None                             |
| Postgres for Everything | Reach Series B with only Postgres data Components                    | Mutator: Postgres for everything |
| No Cache                | Reach Series A with no Cache and no CDN                              | Mutator: No caches               |
| Celebrity               | Serve a 10-million-follower post with no hot key errors              | None                             |
| Follow the Sun          | Serve four regions with no Node above 70% at its local peak          | None                             |
| Rule of 40              | Reach a Rule of 40 score of 80 as a public company                   | None                             |
| Beat and Raise          | Beat guidance eight quarters in a row                                | None                             |
| Unicorn                 | Reach a $1 billion valuation                                         | None                             |
| Decacorn                | Reach a $10 billion valuation                                        | None                             |
| Everyone Online         | Reach 6 billion users                                                | None                             |
| Serial Founder          | Exit with every Venture                                              | None                             |
