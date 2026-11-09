---
title: 10. Progression
summary: Eras, the research tree, product features, and pacing targets.
section: design
order: 10
---

Progression has three layers inside a company:

1. **Eras** gate content by company stage. They decide which request kinds arrive and which research
   is available.
2. **Research** spends Insight to unlock Components, variants, techniques, and visibility.
3. **Features** spend Dev Hours to grow the market and change the request mix
   ([Team and velocity](/design/08-team-and-velocity#features)).

Above the company, [Exit and Legacy](/design/13-prestige) carries progress between companies.

## Eras

| #   | Era      | Milestone to leave                     | Market size         | New kinds                   | New failure mode                                                      | SLO    | Apdex target |
| --- | -------- | -------------------------------------- | ------------------- | --------------------------- | --------------------------------------------------------------------- | ------ | ------------ |
| 0   | Garage   | 1,000 users                            | 1,500               | `page`, `read`              | One box runs out of CPU, then RAM                                     | 99%    | 0.85         |
| 1   | Pre-seed | 5,000 users                            | 7,000               | `write`, `login`            | Database contention, connections, a CPU-heavy kind                    | 99%    | 0.86         |
| 2   | Seed     | 25,000 users                           | 35,000              | `search`, `upload`, `bot`   | Unlike workloads, abuse, large payloads                               | 99.5%  | 0.88         |
| 3   | Series A | 150,000 users                          | 200,000             | `media`, `rt`, `buy`, `bid` | Zone failures, egress cost, money correctness, long-lived connections | 99.9%  | 0.90         |
| 4   | Series B | 1,000,000 users                        | 1,400,000           | `job`, `report`, `ai`       | OLTP against OLAP, GPU economics, team scaling                        | 99.9%  | 0.91         |
| 5   | Series C | 10,000,000 users                       | 14,000,000          | `feed`, `hook`, `push`      | Fan-out, hot keys, geography, region failures                         | 99.95% | 0.92         |
| 6   | Pre-IPO  | 50,000,000 users and the IPO checklist | 70,000,000          | None                        | Compliance, disaster recovery, margin                                 | 99.9%  | 0.93         |
| 7   | Public   | None (endless)                         | Up to 6,000,000,000 | None                        | Quarterly targets                                                     | 99.99% | 0.94         |

Market size is multiplied by features, regions, and Venture rules. It caps user growth inside an Era
([Simulation](/design/04-simulation#users-and-growth)).

### Request mix by Era

Shares of demand, in percent. Features and Ventures shift these shares.

| Kind     | Garage | Pre-seed | Seed | Series A | Series B | Series C+ |
| -------- | ------ | -------- | ---- | -------- | -------- | --------- |
| `page`   | 60     | 45       | 28   | 17       | 17       | 13        |
| `read`   | 40     | 35       | 30   | 25       | 22       | 18        |
| `write`  |        | 15       | 12   | 10       | 9        | 8         |
| `login`  |        | 5        | 4    | 3        | 3        | 2         |
| `search` |        |          | 10   | 10       | 7        | 6         |
| `upload` |        |          | 6    | 5        | 3        | 2         |
| `bot`    |        |          | 10   | 8        | 7        | 7         |
| `media`  |        |          |      | 10       | 10       | 10        |
| `rt`     |        |          |      | 8        | 8        | 8         |
| `buy`    |        |          |      | 3        | 3        | 3         |
| `bid`    |        |          |      | 1        | 1        | 1         |
| `job`    |        |          |      |          | 2        | 2         |
| `report` |        |          |      |          | 3        | 2         |
| `ai`     |        |          |      |          | 5        | 6         |
| `feed`   |        |          |      |          |          | 8         |
| `hook`   |        |          |      |          |          | 2         |
| `push`   |        |          |      |          |          | 2         |

### Era 0: Garage

Garage is the tutorial, without tutorial screens. A player who wants to learn a later Era's mechanics first
plays its [Sandbox track](/design/14-challenges#sandbox-tracks).

- **Start.** 150 users, $300, and one Burstable App Server running PHP with Apache `mod_php` and
  PostgreSQL **on the same box**, connected to Users and Payments. Analytics is linked to the box.
- **First choices, in order.**
  1. Collect revenue from the Payments drawer.
  2. Upgrade the box (it is out of CPU credits).
  3. Research "Structured logs" or "Stripe Billing" with the first Insight.
  4. The box runs out of RAM because the database and Apache share it. Split the database onto its
     own Node. It is the classic first scaling step.
  5. Research "DNS round robin" or "Load balancing" and add a second App Server.
- **The lesson.** Vertical scaling first, then the first horizontal step. Measure income per second.
- **Unlocks available.** Stack: PHP-FPM, OPcache, Laravel, Ruby with Rails, Node.js with Express.
  Components: DNS, Load Balancer.

### Era 1: Pre-seed

- **New kinds.** `write` changes the database from read-mostly to contended. `login` brings bcrypt,
  80 ms of CPU per request.
- **New problems.** The database is the bottleneck. More app servers exhaust Postgres connections.
  Node.js players see the event loop stall on `login`. PHP players see FPM workers wait on the
  database.
- **New systems.** Hiring and Dev Hours ([Team](/design/08-team-and-velocity)). Incidents begin, with
  types up to SEV2 only ([Incidents](/design/11-incidents#catalog)).
- **Unlocks available.** Cache, Connection Pooler, Read Replica, CI/CD Pipeline, Auth Provider,
  percentiles, alerting, Python, Node.js cluster mode.

### Era 2: Seed

- **New kinds.** `search` needs a search engine (Postgres full-text search works at low volume).
  `upload` is CPU-heavy and large. `bot` earns nothing and costs capacity.
- **New problems.** One App Server type cannot serve all kinds well. Work must be separated: CPU work
  to Workers through a Queue, bots blocked at the edge, payloads moved to Object Storage.
- **Unlocks available.** WAF, CDN, Search Engine, Object Storage, Queue, Worker, distributed tracing,
  Go, Java, C#.

### Era 3: Series A

- **New kinds.** `media` makes egress the largest bill line. `rt` holds connections open, which
  breaks process-per-request runtimes. `buy` is worth $25 and needs correctness: no stale reads, no
  double charges. `bid` is worth a tenth of a cent and has to answer inside 100 ms; every Venture
  serves a little of it, and Ad tech serves ten times as much
  ([Exit and Legacy](/design/13-prestige#ventures)).
- **New problems.** Availability. Zone outages begin, so a single database is a single point of
  failure. Users expect 99.9%.
- **New systems.** Zones ([Components](/design/05-components#zones-and-regions)), pricing models
  ([Economy](/design/09-economy#pricing-models)), SLOs and error budgets
  ([Incidents](/design/11-incidents#slos-and-error-budgets)), team types.
- **Unlocks available.** Multi-zone, Kubernetes, Autoscaler, Serverless Functions, Realtime Hub,
  Document Store, Payment Provider, Feature Flags, canary deploys, Elixir, Rust.

### Era 4: Series B

- **New kinds.** `report` scans tables and hurts the transactional database. `job` runs for seconds
  and must be asynchronous. `ai` needs GPUs or an LLM API.
- **New problems.** Analytics and transactions must separate. GPU cost per prompt decides whether
  `ai` makes money. The team passes 15 people and coordination drops velocity.
- **New systems.** Service splits ([Team](/design/08-team-and-velocity#services)), data pipelines.
- **Unlocks available.** Data Warehouse, Event Stream, CDC Connector, GPU Node, LLM API, Vector Index,
  Service Mesh, sharding, ARM instances.

### Era 5: Series C

- **New kinds.** `feed` fans out. `hook` calls slow customer servers. `push` fans out on write.
- **New problems.** Users are global. A single region gives users far away 200 ms of extra round trip,
  and each region's users leave on their own Apdex. Celebrity accounts create hot keys. Region
  outages begin.
- **New systems.** Regions as separate boards, Users per region
  ([Simulation](/design/04-simulation#going-global)), GeoDNS, regional demand peaks (follow the sun).
- **Unlocks available.** Multi-region, GeoDNS, Infrastructure as code (Mirror a region), Anycast,
  Wide-column Store, Distributed SQL, Edge Functions, HTTP/3, hedged requests.

### Era 6: Pre-IPO

Pre-IPO brings no new kinds. Play shifts from growth to proof.

**The IPO checklist.** All items must be true at the same time:

| Item              | Requirement                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Users             | 50,000,000                                                                  |
| Reliability       | 99.9% availability over the last calendar week                              |
| SOC 2             | Research "SOC 2 program" and a Security team                                |
| Disaster recovery | A passed DR drill: RTO under 1 calendar hour, RPO under 5 calendar minutes  |
| Data residency    | EU users served from an EU region                                           |
| Rule of 40        | Growth plus margin of at least 40 ([Economy](/design/09-economy#valuation)) |

The list gives the late game concrete goals that are not "more users". It answers the missing end
target that Upload Labs has ([Influences](/design/02-influences#why-players-quit)).

### Era 7: Public

The company is listed, and play becomes an endless series of quarters.

- A **quarter** lasts 7 calendar days (2 hours 48 minutes of real time at 1×).
- At the start of each quarter, the player sets **guidance**: a revenue growth target and a margin
  target. Higher guidance raises the valuation multiple if met.
- At the end, the market compares results to guidance. A beat raises the multiple. A miss lowers it.
  A streak of beats adds a bonus.
- The player can Exit at any time in the Public Era. The payout uses the current market value
  ([Exit and Legacy](/design/13-prestige#exits)).
- Growth slows near the online population. The late Public Era is about margin, regions, latency,
  and reliability.

## Research

Research costs Insight of named request kinds and takes time, and each item is a **Study**. Each
item belongs to a track, needs an Era, and may need other items. The research screen shows the tree by
track. The next Era's items show their price and requirements, so the player can plan. Later items are
silhouettes: a name and one line of effect, with no price and no click, so the player can want them
before the game makes them a choice ([Interface](/design/15-ui-ux#research-screen)).

The track tables below list every item the game offers: 203 items across 10 tracks.

### Recipes

The ◇ column in the track tables is an item's total cost. Its **recipe** says which Insight pools
pay it ([Observability](/design/12-observability#earning-insight)). The cost is split equally across
the pools in the recipe.

Until Seed, the default recipe is the request kinds that the item's Era brings. From Series A, it is
the kinds of the Era before. A Series A kind such as `buy` arrives only when its Feature ships, and
the Checkout Feature itself needs research, so a Series A default of `buy` could never be paid.

| Era      | Default recipe                            |
| -------- | ----------------------------------------- |
| Garage   | `page`, `read`                            |
| Pre-seed | `write`, `login`                          |
| Seed     | `search`, `upload`                        |
| Series A | `search`, `upload`                        |
| Series B | `media`, `rt`, `buy`                      |
| Series C | `job`, `report`, `ai`                     |
| Pre-IPO  | Every request kind except `bot` and `bid` |
| Public   | Every request kind except `bot` and `bid` |

A player cannot study Series B research before Series A's Features bring their traffic, and more
`page` traffic never buys it. Items that teach a new kind's problem ask for that kind, so the player
ships the Feature first. The Feature is the production line for that kind's Insight, and no item a
Feature needs costs the kind that Feature brings.

A Venture's request mix changes which recipes are cheap. Fintech serves 4× `buy`, so its Series A
research is fast. Every Venture serves every request kind, so every recipe can be paid.

**Every Era's packs stay payable.** An Era's default recipe kinds keep enough of its demand that a
median Study of that Era takes about a base duration at the Era's top traffic. A pack with a small
share of the mix slows every Study of its Era; a pack with none stalls the queue.

**Reliability track rule.** Half of every Reliability item's cost is Failure Insight. The other half
uses the item's recipe.

Items whose recipe is not the default:

| Item                                                                    | Recipe                          | Why                                         |
| ----------------------------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| `logs`                                                                  | `page`                          | The first traffic the player sees           |
| `metrics`, `query-analysis`, `eager-loading`                            | `read`                          | Slow reads show the problem                 |
| `percentiles`                                                           | `read`, `login`                 | bcrypt makes `login` the slow tail          |
| `alerting`                                                              | Failure, `read`                 | An alert needs something to fire on         |
| `health-checks`                                                         | Failure, `read`                 | A check needs a Node that fails             |
| `caching`                                                               | `read`                          | A cache serves reads                        |
| `pooling`, `pitr`, `online-migrations`                                  | `write`                         | Connections and data loss show under writes |
| `replication`, `ryw-routing`, `sharding`, `denormalization`             | `read`, `write`                 | The read and write split                    |
| `cache-strategies`                                                      | `read`, `write`                 | Each strategy differs on writes             |
| `stampede-protection`                                                   | `read`, Failure                 | A stampede is a failure on cached reads     |
| `full-text-search`                                                      | `search`                        |                                             |
| `object-storage`                                                        | `upload`                        |                                             |
| `cdn`, `http2`, `http3`                                                 | `page`, `upload`                | Static assets and payloads                  |
| `waf`, `bot-management`                                                 | `bot`                           | Bots teach how bots behave                  |
| `credential-protection`                                                 | `login`, `bot`                  | Credential stuffing is bot `login`          |
| `funnels`                                                               | `page`, `login`                 | Sign-up is the funnel                       |
| `auth-provider`                                                         | `login`                         |                                             |
| `idempotency-keys`                                                      | `buy`                           | Retried charges                             |
| `notifications`                                                         | `push`                          |                                             |
| `websockets`                                                            | `rt`                            |                                             |
| `tiered-caching`                                                        | `media`                         |                                             |
| `esi`                                                                   | `page`, `media`                 |                                             |
| `slo-dashboards`                                                        | Failure, `buy`                  | The budget protects the money path          |
| `sync-replication`, `consensus`                                         | `write`, `buy`                  | Money cannot be lost                        |
| `data-warehouse`, `precompute`                                          | `report`                        |                                             |
| `cdc`                                                                   | `report`, `write`               |                                             |
| `outbox`                                                                | `buy`, `job`                    | Dual writes between money and jobs          |
| `embeddings`                                                            | `ai`, `search`                  |                                             |
| `hosted-models`, `model-serving`, `quantization`, `continuous-batching` | `ai`                            |                                             |
| `hybrid-fanout`, `leaderless`                                           | `feed`                          | Hot keys come from celebrity feeds          |
| `rum`                                                                   | `page`, `feed`                  | Latency from the user's side                |
| `tail-sampling`                                                         | Failure                         | It keeps the failed traces                  |
| `anomaly-detection`                                                     | Failure, `feed`, `hook`, `push` |                                             |

**Breadth.** Some Observability items also need their recipe kinds sampled at a number of
Component types. A trace needs more than one hop. The count is checked before the Study starts, like
a shape: once the Study runs, removing a tap does not stall it.

| Item        | Breadth              |
| ----------- | -------------------- |
| `tracing`   | 3 Component types    |
| `profiling` | 4 Component types    |
| `rum`       | Sampled in 2 regions |

The `rum` rule reads the Ledger's `breadthRegions`. Each of its kinds must be sampled by an Analytics
tap on a Node in two regions, so the Study waits for a second region to have its own tap before it
starts.

**Shapes.** A few items ask the Design to show a behaviour before the Study starts. The Study stalls
until the Ledger shows it, and the Research screen says what is missing. The item teaches a system, so
the player runs the system first.

| Item               | Shape                                              |
| ------------------ | -------------------------------------------------- |
| `pooling`          | App Servers hold more than 20 connections.         |
| `replication`      | A Database spends 60% of its work on reads.        |
| `cache-strategies` | A Cache hits on 60% of its reads.                  |
| `event-streaming`  | A Queue holds a backlog of 1 s or more.            |
| `data-warehouse`   | A Database spends 10% of its work on report scans. |
| `autoscaling`      | A Node runs at 80% of its capacity.                |
| `consensus`        | A Read Replica serves reads.                       |

The `pooling` count is the Pooler's own 20 server connections, not a share of the Database's
`max_connections`. Below 20, a Pooler that keeps 20 saves nothing. An absolute count also asks the
same of Postgres and MySQL: a larger connection budget never makes the gate harder.

A shape reads the live Ledger, so it clears as soon as the Design does the thing, and it adds no save
field. The shape gates the start of the Study, not its whole run: once a Study has started it keeps
running if the behaviour lapses, so a shape that follows demand or the calendar, such as a Node at
80% of its capacity, does not stall halfway through a Study that spans hours.

### Studies

A Study runs one item. One Study runs at a time; the player queues up to 8, reorders them, and can
switch the running Study. A switched Study keeps its progress, as in Factorio. The effect starts when
the Study completes.

| Era      | Base duration |
| -------- | ------------- |
| Garage   | 20 s          |
| Pre-seed | 1 min         |
| Seed     | 2 min         |
| Series A | 4 min         |
| Series B | 8 min         |
| Series C | 15 min        |
| Pre-IPO  | 30 min        |
| Public   | 60 min        |

A Study takes its Insight as it runs, like a Factorio lab takes packs. In each Step:

```latex
\begin{aligned}
\text{draw} \left(\text{pool}\right) &= \text{cost} \left(\text{pool}\right) \times \text{speed} \times \frac{\text{dt}}{\text{base duration}} \\
\text{progress} \left(\text{next}\right) &= \text{progress} + \text{speed} \times \text{dt} \times \operatorname{min}\left(1{,}\ \text{balance} \left(\text{pool}\right) / \text{draw} \left(\text{pool}\right)\right) \\
&\quad \text{the lowest ratio across the recipe's pools}
\end{aligned}
```

Each pool pays `draw(pool)` times the same factor. When a pool is empty, the Study runs at the rate
that pool earns, so the scarcest kind limits it. Traffic falls at night, so a `buy` Study slows at
night. The player can start a Study with no Insight saved.

A Study **stalls** when a recipe pool earns nothing and holds less than the Study still draws, when
it has not started and the Design samples its kinds at too few Component types, or when it has not
started and the shape its item asks for is missing. A stalled running Study holds every Study behind
it. The queue row, the Insight card, and the item's sidebar mark a stalled Study and say why: the pool
that earns nothing, the shape that is missing, and the Feature that brings the pool's kind when one
does, such as Password login for `login`. The item's sidebar shows the Design's current value against
the requirement, such as 47% of 60% of a Database's work on reads, and **Queue Study** puts the item
in the queue to start when the Design clears it. Queueing a stalled item says the same. While the
running Study is stalled, a teammate's Mail waits in Needs action with an Open Research button; its
Thread resolves when the Study moves again or leaves the queue.

`speed` is 1, and two things raise it:

- **A Spike.** A Team takes the running Study as its backlog item
  ([Team](/design/08-team-and-velocity#spikes)). While it does, `speed` × 2. A Spike whose Study is
  not running waits, and no Team takes it.
- **Study-speed research.** `trace-search` and `notebooks` add +25% each.

Studies run offline ([Simulation](/design/04-simulation#offline-progress)). A postmortem's action item
puts its Study first in the queue ([Incidents](/design/11-incidents#postmortems)).

Queueing a locked item queues its missing prerequisites with it, each ahead of what needs it, as
picking a distant technology in Civilization researches the path to it. In Seed with nothing
researched, queueing Trace search adds Metrics, Percentiles, Distributed tracing and Trace search, in
that order. Every member of the chain must be open, so an item whose chain reaches a later Era opens
in that Era. The 8-Study limit counts the whole chain: a queue that holds 5 Studies has no room for
those 4. Queueing a chain names what joined and, if one of them will stall, the first that does.

A queued Study never sits above a queued prerequisite, so the running Study is always one the
player can research. The queue keeps that rule in three places:

- **Moving.** A move by arrow or drag that would pass a prerequisite is refused, and the toast
  names the pair.
- **Study now.** Switching to an item brings its queued prerequisites to the front with it. Each
  keeps its progress.
- **Cancelling.** Cancelling a prerequisite cancels the queued Studies that need it, and their
  Spikes.

The autopilot's research policy queues only items whose prerequisites the Company owns. It judges a
Study by that item's own price and recipe, which would misjudge a chain.

### Cost bands

The ◇ column in the track tables is what a Study pays. Prices already grow tenfold an Era, so there
is no Era multiplier on top: a pack's Insight grows with the square root of its traffic, and a
multiplier would make an Era's research unpayable.

| Era      | Cost range (◇)       |
| -------- | -------------------- |
| Garage   | 10–60                |
| Pre-seed | 60–300               |
| Seed     | 300–900              |
| Series A | 1,500–8,000          |
| Series B | 8,000–40,000         |
| Series C | 40,000–200,000       |
| Pre-IPO  | 200,000–1,000,000    |
| Public   | 1,000,000–10,000,000 |

### Track: Infrastructure

| ID                    | Name                      | Era      | ◇       | Requires          | Effect                                                                                        |
| --------------------- | ------------------------- | -------- | ------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `dns-rr`              | DNS round robin           | Garage   | 15      | None              | DNS Component                                                                                 |
| `load-balancing`      | Load balancing            | Garage   | 25      | None              | Load Balancer (L7, round robin and weighted)                                                  |
| `health-checks`       | Health checks             | Pre-seed | 90      | `load-balancing`  | Health-checked DNS, deep checks, check intervals                                              |
| `lb-algorithms`       | Load balancing algorithms | Pre-seed | 120     | `load-balancing`  | Least connections, power of two choices, consistent hashing                                   |
| `auth-provider`       | Managed identity          | Pre-seed | 140     | None              | Auth Provider; logins stop costing your CPU                                                   |
| `background-jobs`     | Background jobs           | Seed     | 300     | None              | Worker                                                                                        |
| `queues`              | Message queues            | Seed     | 600     | `background-jobs` | Queue (RabbitMQ, SQS)                                                                         |
| `cdn`                 | Content delivery          | Seed     | 350     | None              | CDN                                                                                           |
| `waf`                 | Web application firewall  | Seed     | 500     | None              | WAF                                                                                           |
| `l4-lb`               | L4 load balancing         | Seed     | 400     | `lb-algorithms`   | L4 variant                                                                                    |
| `multi-az`            | Multiple zones            | Series A | 3,000   | `health-checks`   | Zone placement                                                                                |
| `autoscaling`         | Autoscaling               | Series A | 4,000   | `load-balancing`  | Autoscaler                                                                                    |
| `containers`          | Container orchestration   | Series A | 5,000   | `autoscaling`     | Kubernetes Cluster                                                                            |
| `serverless`          | Serverless                | Series A | 3,500   | None              | Serverless Function                                                                           |
| `websockets`          | WebSockets                | Series A | 2,500   | None              | Realtime Hub                                                                                  |
| `api-gateway`         | API gateway               | Series A | 2,000   | `load-balancing`  | API Gateway                                                                                   |
| `rate-limiting`       | Rate limiting             | Series A | 1,800   | `api-gateway`     | Token bucket limits on the gateway                                                            |
| `tiered-caching`      | Tiered caching            | Series A | 2,000   | `cdn`             | CDN `media` hit ratio 92%                                                                     |
| `esi`                 | Edge-side includes        | Series A | 3,000   | `cdn`             | +20% `page` hit ratio for logged-in users                                                     |
| `bot-management`      | Bot management            | Series A | 2,500   | `waf`             | Challenges suspicious clients; lowers false positives                                         |
| `scheduled-scaling`   | Scheduled scaling         | Series B | 9,000   | `autoscaling`     | Scale ahead of the daily peak                                                                 |
| `service-mesh`        | Service mesh              | Series B | 20,000  | `containers`      | Service Mesh                                                                                  |
| `arm-instances`       | ARM instances             | Series B | 12,000  | None              | ARM family, 0.8× price                                                                        |
| `hosted-models`       | Hosted models             | Series B | 8,000   | None              | LLM API                                                                                       |
| `model-serving`       | Model serving             | Series B | 15,000  | None              | GPU Node                                                                                      |
| `quantization`        | Quantization              | Series B | 18,000  | `model-serving`   | INT8 and INT4 options                                                                         |
| `continuous-batching` | Continuous batching       | Series B | 25,000  | `model-serving`   | Batch throughput without the latency cost                                                     |
| `multi-region`        | Multiple regions          | Series C | 60,000  | `multi-az`        | Regions as boards                                                                             |
| `geo-dns`             | GeoDNS                    | Series C | 50,000  | `multi-region`    | Route users to the nearest region                                                             |
| `infra-as-code`       | Infrastructure as code    | Series C | 40,000  | `multi-region`    | Pick an IaC tool; Mirror a region ([Components](/design/05-components#mirror-a-region))       |
| `gitops`              | GitOps                    | Series C | 90,000  | `infra-as-code`   | Mirrors sync on their own, all at once or staged ([Components](/design/05-components#gitops)) |
| `anycast`             | Anycast                   | Series C | 120,000 | `geo-dns`         | −20 ms on the user hop everywhere                                                             |
| `edge-compute`        | Edge compute              | Series C | 80,000  | `cdn`             | Edge Function                                                                                 |
| `notifications`       | Notifications             | Series C | 40,000  | None              | Push Provider                                                                                 |

Each option is wired to its Component (05 "Load Balancer", "CDN", "WAF",
"Autoscaler", "App Server", "GPU Node"): the L4 variant, the Gateway's token bucket, Edge-side
includes' 20 points of `page`, Bot management's half false positives, Scheduled scaling's lead on the
peak, the ARM family at 0.8× the price, and the GPU's INT8/INT4 and batch sizes.

### Track: Data

| ID                    | Name                       | Era      | ◇       | Requires                            | Effect                                                |
| --------------------- | -------------------------- | -------- | ------- | ----------------------------------- | ----------------------------------------------------- |
| `query-analysis`      | Query analysis (`EXPLAIN`) | Garage   | 40      | None                                | Shows unindexed query shapes; enables "Add index"     |
| `caching`             | Caching                    | Pre-seed | 80      | None                                | Cache (Redis, Memcached), cache-aside                 |
| `pooling`             | Connection pooling         | Pre-seed | 120     | None                                | Connection Pooler                                     |
| `replication`         | Read replicas              | Pre-seed | 220     | None                                | Read Replica (asynchronous)                           |
| `cache-strategies`    | Cache strategies           | Seed     | 600     | `caching`                           | Read-through, write-through, write-behind             |
| `stampede-protection` | Stampede protection        | Seed     | 900     | `caching`                           | Coalescing, early expiration, stale-while-revalidate  |
| `full-text-search`    | Full-text search           | Seed     | 450     | None                                | Search Engine                                         |
| `object-storage`      | Object storage             | Seed     | 500     | None                                | Object Storage                                        |
| `pitr`                | Point-in-time recovery     | Seed     | 700     | None                                | Backup options                                        |
| `cache-warming`       | Cache warming              | Series A | 2,000   | `stampede-protection`               | Warm before traffic                                   |
| `sync-replication`    | Synchronous replication    | Series A | 2,500   | `replication`                       | Synchronous replica option                            |
| `ryw-routing`         | Read-your-writes routing   | Series A | 3,000   | `replication`                       | Removes most `stale` after writes                     |
| `lifecycle-rules`     | Storage lifecycle rules    | Series A | 1,500   | `object-storage`                    | Automatic storage classes                             |
| `document-db`         | Document databases         | Series A | 3,500   | None                                | Document Store                                        |
| `online-migrations`   | Online schema migrations   | Series A | 4,000   | `query-analysis`                    | Migrations without table locks                        |
| `event-streaming`     | Event streaming            | Series B | 15,000  | `queues`                            | Event Stream                                          |
| `data-warehouse`      | Data warehousing           | Series B | 12,000  | None                                | Data Warehouse                                        |
| `cdc`                 | Change data capture        | Series B | 18,000  | `event-streaming`, `data-warehouse` | CDC Connector                                         |
| `outbox`              | Transactional outbox       | Series B | 14,000  | `queues`                            | Shrinks dual-write divergence to a relay's lag window |
| `sharding`            | Sharding                   | Series B | 25,000  | `replication`                       | Database partitioning                                 |
| `expand-contract`     | Expand and contract        | Series B | 10,000  | `online-migrations`                 | Zero-lock schema changes                              |
| `embeddings`          | Embeddings                 | Series B | 16,000  | None                                | Vector Index                                          |
| `hybrid-fanout`       | Hybrid fan-out             | Series C | 90,000  | `caching`                           | Push for normal accounts, pull for celebrities        |
| `leaderless`          | Leaderless replication     | Series C | 70,000  | `sharding`                          | Wide-column Store with tunable quorums                |
| `consensus`           | Consensus databases        | Series C | 150,000 | `sync-replication`                  | Distributed SQL                                       |
| `retention`           | Retention policies         | Pre-IPO  | 250,000 | None                                | Archive or delete old data                            |

With `online-migrations`, a migration does not hold a big table's lock ([Incidents](/design/11-incidents#the-six-kinds)). `expand-contract` removes what is left of it,
and `outbox` shrinks dual-write divergence in the Search Engine's answers to a relay's lag window
([Data tier](/design/07-data-tier#keeping-copies-in-sync)).

### Track: Reliability

| ID                     | Name                     | Era      | ◇       | Requires                         | Effect                                                                                         |
| ---------------------- | ------------------------ | -------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `timeouts`             | Timeouts and retries     | Pre-seed | 60      | None                             | Link timeout and naive retries                                                                 |
| `ci`                   | Continuous delivery      | Pre-seed | 100     | None                             | CI/CD Pipeline, with Recreate and Rolling                                                      |
| `backoff-jitter`       | Backoff with jitter      | Seed     | 400     | `timeouts`                       | Retry policy option                                                                            |
| `cert-automation`      | Certificate automation   | Seed     | 300     | None                             | Secrets and Certificates                                                                       |
| `blue-green`           | Blue-green deploys       | Seed     | 900     | `ci`                             | Blue-green deploy strategy                                                                     |
| `feature-flags`        | Feature flags            | Seed     | 800     | `ci`                             | Feature Flags                                                                                  |
| `circuit-breakers`     | Circuit breakers         | Series A | 2,500   | `backoff-jitter`                 | Link option                                                                                    |
| `bulkheads`            | Bulkheads                | Series A | 3,500   | `circuit-breakers`               | Link option                                                                                    |
| `load-shedding`        | Priority load shedding   | Series A | 4,000   | `timeouts`                       | When saturated, drop the lowest-value kinds first                                              |
| `graceful-degradation` | Graceful degradation     | Series A | 3,000   | `feature-flags`                  | Turn off expensive features automatically during overload                                      |
| `canary`               | Canary deploys           | Series A | 3,000   | `ci`, `percentiles`              | Canary deploy strategy                                                                         |
| `on-call`              | On-call rotation         | Series A | 2,000   | `alerting`                       | Faster triage; incidents page the player                                                       |
| `error-budgets`        | Error budgets            | Series A | 3,000   | `slo-dashboards`                 | Velocity bonus with budget left, freeze when spent                                             |
| `runbooks`             | Runbooks                 | Series A | 5,000   | `on-call`                        | Automatic mitigation for known incident types                                                  |
| `restore-drills`       | Restore drills           | Series A | 2,000   | `pitr`                           | Removes the failed-restore chance                                                              |
| `idempotency-keys`     | Idempotency keys         | Series A | 1,500   | `checkout`                       | A retried charge never charges twice                                                           |
| `hedged-requests`      | Hedged requests          | Series C | 100,000 | `tracing`                        | Send a second request after the p95; cuts the tail, adds load                                  |
| `chaos-engineering`    | Chaos engineering        | Pre-IPO  | 300,000 | `runbooks`                       | Scheduled failure injection that earns Failure Insight and reveals weak spots                  |
| `dr-drills`            | Disaster recovery drills | Pre-IPO  | 400,000 | `restore-drills`, `multi-region` | Run the DR drill for the IPO checklist                                                         |
| `leap-smearing`        | Leap smearing            | Series C | 60,000  | None                             | A clock never jumps, so no timer fires twice ([Incidents](/design/11-incidents#the-six-kinds)) |

Four items act on incidents. With `on-call` the rotation answers the page. With `runbooks` a written
runbook resolves its incident kind by itself ([Incidents](/design/11-incidents#runbooks)). With
`leap-smearing` a clock jump does not time out a region.

`bulkheads`, `graceful-degradation`, `hedged-requests` and `chaos-engineering` each add a behavior
([Components](/design/05-components#links)):

- `bulkheads`: a Link option that frees a caller's slot after 1,000 ms.
- `graceful-degradation`: a saturated App Server drops its dearest kinds first.
- `hedged-requests`: a Link races a second copy.
- `chaos-engineering`: scheduled experiments fail the weakest Node and pay Failure Insight.

### Track: Observability

[Observability](/design/12-observability#the-visibility-ladder) explains what each step reveals.

| ID                  | Name                 | Era      | ◇      | Requires       | Effect                                                 |
| ------------------- | -------------------- | -------- | ------ | -------------- | ------------------------------------------------------ |
| `logs`              | Structured logs      | Garage   | 20     | None           | Error breakdown by cause                               |
| `metrics`           | Metrics              | Garage   | 50     | None           | History graphs per Node; the Dashboard                 |
| `percentiles`       | Percentiles          | Pre-seed | 150    | `metrics`      | p50, p95, p99 on cards                                 |
| `alerting`          | Alerting             | Pre-seed | 250    | `metrics`      | Pager banner before users notice                       |
| `tracing`           | Distributed tracing  | Seed     | 800    | `percentiles`  | Per-kind waterfalls; bottleneck per kind               |
| `slo-dashboards`    | SLO dashboards       | Series A | 2,500  | `percentiles`  | Error budget panel                                     |
| `profiling`         | Continuous profiling | Series A | 3,000  | `tracing`      | CPU, wait, GC, and lock time per Node; names the limit |
| `trace-search`      | Trace search         | Seed     | 600    | `tracing`      | Studies +25% speed                                     |
| `tail-sampling`     | Tail-based sampling  | Series B | 10,000 | `tracing`      | Keep slow and failed traces: ×2 Failure Insight        |
| `notebooks`         | Notebooks            | Series B | 12,000 | `trace-search` | Studies +25% speed                                     |
| `rum`               | Real user monitoring | Series C | 50,000 | `tracing`      | Latency per region and device                          |
| `anomaly-detection` | Anomaly detection    | Series C | 80,000 | `alerting`     | Early warnings before an incident peaks                |

`profiling` names each Node's limiting resource and arrives with the Resources
(USE) row ([Observability](/design/12-observability#the-visibility-ladder)); it carries `tracing`'s
breadth rule at 4 Component types. `tail-sampling` doubles Failure Insight. `rum` adds a device
split (desktop, mobile, and tablet) to the Users row; the device shares and each one's extra
round trip are the game's own stylization. `anomaly-detection` halves how
long a threshold must hold before the pager fires, and adds a forecast line at tomorrow's peak,
projected from the known diurnal cycle rather than fit from history.

### Track: Performance

| ID                | Name                        | Era      | ◇      | Requires | Effect                                                                  |
| ----------------- | --------------------------- | -------- | ------ | -------- | ----------------------------------------------------------------------- |
| `keepalive`       | Connection reuse            | Garage   | 25     | None     | −1 ms per internal hop (no new TCP handshake)                           |
| `gzip`            | Compression                 | Garage   | 30     |          | `page`, `read`, `search`, `bot`, `report` and `feed` payload −70%, +CPU |
| `eager-loading`   | Eager loading               | Pre-seed | 100    | None     | Enables the "Eager loading" task                                        |
| `http2`           | HTTP/2                      | Seed     | 350    |          | −15% user hop latency on `page`                                         |
| `denormalization` | Denormalization             | Series A | 3,000  | None     | Read cost −30%, write cost +20%                                         |
| `precompute`      | Materialized views          | Series B | 12,000 | None     | `report` cost −50%, data is stale by the refresh interval               |
| `binary-rpc`      | Binary RPC between services | Series B | 15,000 | None     | Inter-service serialization CPU −50%                                    |
| `http3`           | HTTP/3                      | Series C | 60,000 | `http2`  | −20% user hop latency for distant and mobile users                      |

Denormalization takes 30% off a read's CPU and adds 20% to a write's, Materialized
views halve a report's scan, and Binary RPC halves the CPU a Node spends serialising its calls
([Data tier](/design/07-data-tier#data-warehouse)).

### Track: Runtimes

PHP is the starting language. Each other language needs its research, and each variant needs its
language ([Runtimes](/design/06-runtimes#variants-by-language)).

| ID                   | Name                   | Era      | ◇      | Requires      |
| -------------------- | ---------------------- | -------- | ------ | ------------- |
| `php-fpm`            | PHP-FPM                | Garage   | 25     | None          |
| `opcache`            | OPcache                | Garage   | 45     | `php-fpm`     |
| `lang-ruby`          | Ruby                   | Garage   | 30     | None          |
| `lang-node`          | Node.js                | Garage   | 40     | None          |
| `lang-python`        | Python                 | Pre-seed | 120    | None          |
| `node-cluster`       | Node.js cluster mode   | Pre-seed | 100    | `lang-node`   |
| `libuv-pool`         | libuv thread pool      | Pre-seed | 120    | `lang-node`   |
| `lang-go`            | Go                     | Seed     | 600    | None          |
| `lang-java`          | Java                   | Seed     | 800    | None          |
| `lang-csharp`        | C#                     | Seed     | 800    | None          |
| `php-jit`            | PHP JIT                | Seed     | 500    | `opcache`     |
| `worker-threads`     | Node.js worker threads | Seed     | 500    | `lang-node`   |
| `yjit`               | YJIT                   | Seed     | 400    | `lang-ruby`   |
| `gevent`             | gevent                 | Seed     | 400    | `lang-python` |
| `asgi`               | ASGI with Uvicorn      | Seed     | 500    | `lang-python` |
| `lang-elixir`        | Elixir                 | Series A | 2,500  | None          |
| `lang-rust`          | Rust                   | Series A | 4,000  | None          |
| `lang-zig`           | Zig                    | Series A | 3,500  | None          |
| `lang-haskell`       | Haskell                | Series A | 3,000  | None          |
| `php-worker-mode`    | PHP worker mode        | Series A | 2,500  | `php-fpm`     |
| `swoole`             | Swoole                 | Series A | 3,000  | `php-fpm`     |
| `bun`                | Bun                    | Series A | 2,000  | `lang-node`   |
| `deno`               | Deno                   | Series A | 2,000  | `lang-node`   |
| `falcon`             | Falcon                 | Series A | 2,000  | `lang-ruby`   |
| `pypy`               | PyPy                   | Series A | 2,500  | `lang-python` |
| `virtual-threads`    | Java virtual threads   | Series A | 3,000  | `lang-java`   |
| `webflux`            | Spring WebFlux         | Series A | 3,000  | `lang-java`   |
| `fasthttp`           | fasthttp               | Series A | 2,000  | `lang-go`     |
| `gogc-tuning`        | Go GC tuning           | Series A | 2,500  | `lang-go`     |
| `spawn-blocking`     | Tokio blocking pool    | Series A | 3,000  | `lang-rust`   |
| `zgc`                | ZGC                    | Series B | 9,000  | `lang-java`   |
| `graal-native`       | GraalVM native image   | Series B | 12,000 | `lang-java`   |
| `native-aot`         | .NET Native AOT        | Series B | 10,000 | `lang-csharp` |
| `distributed-erlang` | Distributed Erlang     | Series B | 12,000 | `lang-elixir` |
| `nifs`               | NIFs                   | Series B | 10,000 | `lang-elixir` |
| `jemalloc`           | jemalloc               | Series B | 8,000  | `lang-rust`   |
| `free-threading`     | Free-threaded Python   | Series C | 50,000 | `lang-python` |

### Track: Frameworks

| Framework    | Era      | ◇      | Requires       |
| ------------ | -------- | ------ | -------------- |
| Laravel      | Garage   | 20     | None           |
| Rails        | Garage   | 30     | `lang-ruby`    |
| Express      | Garage   | 30     | `lang-node`    |
| Symfony      | Pre-seed | 80     | None           |
| Sinatra      | Pre-seed | 60     | `lang-ruby`    |
| CodeIgniter  | Pre-seed | 60     | None           |
| Django       | Pre-seed | 150    | `lang-python`  |
| Flask        | Pre-seed | 100    | `lang-python`  |
| Sanic        | Seed     | 500    | `lang-python`  |
| FastAPI      | Seed     | 500    | `asgi`         |
| Fastify      | Seed     | 400    | `lang-node`    |
| Koa          | Seed     | 300    | `lang-node`    |
| Hono         | Seed     | 400    | `lang-node`    |
| Next.js      | Seed     | 600    | `lang-node`    |
| Spring Boot  | Seed     | 900    | `lang-java`    |
| ASP.NET Core | Seed     | 900    | `lang-csharp`  |
| Gin          | Seed     | 700    | `lang-go`      |
| NestJS       | Series A | 2,000  | `lang-node`    |
| AdonisJS     | Series A | 1,500  | `lang-node`    |
| Fiber        | Series A | 2,000  | `fasthttp`     |
| Elysia       | Series A | 2,000  | `bun`          |
| Phoenix      | Series A | 2,500  | `lang-elixir`  |
| Axum         | Series A | 3,000  | `lang-rust`    |
| Actix Web    | Series A | 3,000  | `lang-rust`    |
| Rocket       | Series A | 3,000  | `lang-rust`    |
| Jetzig       | Series A | 3,000  | `lang-zig`     |
| Tokamak      | Series A | 2,000  | `lang-zig`     |
| Servant      | Series A | 3,000  | `lang-haskell` |
| IHP          | Series A | 3,500  | `lang-haskell` |
| Quarkus      | Series B | 10,000 | `lang-java`    |

### Track: Security

| ID                      | Name                           | Era      | ◇       | Requires                                                      | Effect                                                       |
| ----------------------- | ------------------------------ | -------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `tls-everywhere`        | TLS everywhere                 | Seed     | 300     | None                                                          | Encrypts internal links; +0.2 ms per hop; required for SOC 2 |
| `secrets-management`    | Secrets management             | Seed     | 400     | None                                                          | Removes the "Leaked credentials" incident                    |
| `credential-protection` | Credential stuffing protection | Series A | 2,500   | `rate-limiting`                                               | Blocks bot `login` bursts                                    |
| `dependency-scanning`   | Dependency scanning            | Series A | 3,000   | `ci`                                                          | Supply-chain incident chance −70%                            |
| `encryption-at-rest`    | Encryption at rest             | Series B | 9,000   | None                                                          | Required for SOC 2                                           |
| `pen-testing`           | Penetration testing            | Pre-IPO  | 200,000 | None                                                          | Reveals one weakness per calendar week                       |
| `soc2`                  | SOC 2 program                  | Pre-IPO  | 300,000 | `tls-everywhere`, `encryption-at-rest`, `dependency-scanning` | IPO checklist item                                           |
| `gdpr-residency`        | Data residency controls        | Pre-IPO  | 350,000 | `multi-region`                                                | IPO checklist item                                           |
| `security-team`         | Security team                  | Pre-IPO  | 200,000 | None                                                          | Team type                                                    |
| `spam-filter`           | Spam filter                    | Pre-seed | 300     | None                                                          | Postbox filter setting; spam sorts into its own folder       |

`credential-protection` cuts the Credential stuffing incident's weakness and its
bot-login magnitude once a WAF is also in place. `pen-testing` reveals one weakness a calendar
week: it finds the Design's highest-weakness incident kind (the same score the director weighs
incidents by) and opens its prevention research as an action item, the same way a Postmortem does.

### Track: Cost

| ID                    | Name                | Era      | ◇       | Requires             | Effect                                    |
| --------------------- | ------------------- | -------- | ------- | -------------------- | ----------------------------------------- |
| `reserved-instances`  | Reserved instances  | Series A | 2,000   | `autoscaling`        | Reserved pricing model                    |
| `spot-instances`      | Spot instances      | Series A | 3,000   | `autoscaling`        | Spot pricing model                        |
| `rightsizing`         | Rightsizing report  | Series A | 2,500   | `metrics`            | Marks Nodes below 30% utilization at peak |
| `egress-optimization` | Egress optimization | Series A | 3,500   | `object-storage`     | R2 variant; egress line breakdown         |
| `unit-economics`      | Unit economics      | Series B | 8,000   | None                 | Cost per request for each kind            |
| `cost-allocation`     | Cost allocation     | Series B | 10,000  | `unit-economics`     | Cost per service and team                 |
| `savings-plans`       | Savings plans       | Pre-IPO  | 250,000 | `reserved-instances` | −20% compute with no per-Node lock        |

`reserved-instances` and `spot-instances` unlock the two pricing models on a
compute Node from Series A ([Economy](/design/09-economy#pricing-models)). `rightsizing` marks a
Node whose peak utilization stayed under 30% over its kept history, in the Inspector. It reads the
client-side Inspector history, not a Ledger field, so it needs no save change.
`egress-optimization` moves `upload` and `media` traffic that reaches an Object Storage Node onto
an R2-priced path at $0 origin egress, lowering the Egress line by that share
([Economy](/design/09-economy#egress)). `unit-economics` and `cost-allocation` split Burn by
request kind and by the Service that owns each kind's code, shown in the cloud bill panel.
`savings-plans` takes a further 20% off every compute Node's box, on top of whichever pricing model
it already runs, with no per-Node commitment. These five numbers are the game's own rates.

### Track: Product and business

| ID                    | Name                    | Era      | ◇         | Requires                   | Effect                                               |
| --------------------- | ----------------------- | -------- | --------- | -------------------------- | ---------------------------------------------------- |
| `stripe`              | Stripe Billing          | Garage   | 30        | None                       | Payments collect automatically                       |
| `funnels`             | Funnel analytics        | Pre-seed | 150       | None                       | Growth +10%                                          |
| `code-review`         | Code review             | Pre-seed | 120       | None                       | Shows hidden costs of features before they ship      |
| `testing-culture`     | Automated tests         | Pre-seed | 150       | `ci`                       | Bad-deploy chance −30%                               |
| `dev-environment`     | Reproducible dev env    | Pre-seed | 300       | `ci`                       | Ramp-up −50%                                         |
| `static-analysis`     | Static analysis         | Pre-seed | 180       | `ci`                       | Bad-deploy chance −20%                               |
| `ab-testing`          | A/B testing             | Seed     | 700       | `funnels`, `feature-flags` | Measures each Feature's lift against a holdout group |
| `hiring-pipeline`     | Hiring pipeline         | Seed     | 600       | None                       | Time to hire −30%                                    |
| `trunk-based`         | Trunk-based development | Seed     | 800       | `ci`                       | Deploy frequency +50%                                |
| `build-cache`         | Build cache             | Seed     | 600       | `ci`                       | Build minutes −25%                                   |
| `platform-team`       | Platform team           | Series A | 3,000     | `containers`               | Team type                                            |
| `sre-team`            | SRE team                | Series A | 4,000     | `on-call`                  | Team type                                            |
| `formal-verification` | Formal verification     | Series A | 5,000     | `testing-culture`          | Velocity −15%, bad-deploy chance −50%                |
| `checkout`            | Checkout                | Series A | 1,500     | None                       | Payment Provider and the Checkout Feature            |
| `service-boundaries`  | Service boundaries      | Series B | 15,000    | None                       | Split a Service                                      |
| `data-team`           | Data team               | Series B | 10,000    | `data-warehouse`           | Team type                                            |
| `enterprise-sales`    | Enterprise sales        | Series B | 20,000    | None                       | Signs the SLA: a missed week costs SLA credits       |
| `investor-relations`  | Investor relations      | Pre-IPO  | 300,000   | None                       | Valuation multiple +2                                |
| `guidance-modeling`   | Guidance modeling       | Public   | 1,000,000 | None                       | Shows the probability of beating each guidance level |

Each item does what its Effect column says:

- `ab-testing` reads a Feature's lift and its interval on the Team card, between 5% and 50% rollout
  ([Measured lift](/design/08-team-and-velocity#measured-lift)).
- `hiring-pipeline` takes 30% off the time to hire.
- `trunk-based` raises the deploy frequency by half, on top of the policy's own cap.
- `platform-team` and `data-team` unlock their team types ([Team](/design/08-team-and-velocity#teams)).
  A Platform team runs the Clusters and halves deploy time; a Data team makes `report` and `ai`
  Features cost 30% less and halves a CDC pipeline's lag.
- `sre-team` unlocks the SRE team.
- `enterprise-sales` signs the SLA and its credits.

## Pacing targets for the first company

The times are measured, not targeted: the Balanced bot at the live pace
([pacing model](/design/16-balancing#pacing-model)), at `SIM_VERSION` 17 on seeds 1 and 3, reaches each
Era at the sim minutes below. The numbers are re-measured when the tuning changes.

| Era      | Measured time from start (sim minutes) |
| -------- | -------------------------------------- |
| Pre-seed | 5.8                                    |
| Seed     | 20.5–21.1                              |
| Series A | 65.5                                   |
| Series B | 102–106                                |
