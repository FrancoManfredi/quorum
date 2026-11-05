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
| 6   | Pre-IPO  | 50,000,000 users and the IPO checklist | 70,000,000          | —                           | Compliance, disaster recovery, margin                                 | 99.95% | 0.93         |
| 7   | Public   | None (endless)                         | Up to 6,000,000,000 | —                           | Quarterly targets                                                     | 99.99% | 0.94         |

Market size is multiplied by features, regions, and Venture rules. It caps user growth inside an Era
([Simulation](/design/04-simulation#users-and-growth)).

### Request mix by Era

Shares of demand, in percent. Features and Ventures shift these shares.

| Kind     | Garage | Pre-seed | Seed | Series A | Series B | Series C+ |
| -------- | ------ | -------- | ---- | -------- | -------- | --------- |
| `page`   | 60     | 45       | 30   | 21       | 17       | 13        |
| `read`   | 40     | 35       | 30   | 25       | 22       | 18        |
| `write`  | —      | 15       | 12   | 10       | 9        | 8         |
| `login`  | —      | 5        | 4    | 3        | 3        | 2         |
| `search` | —      | —        | 10   | 8        | 7        | 6         |
| `upload` | —      | —        | 4    | 3        | 3        | 2         |
| `bot`    | —      | —        | 10   | 8        | 7        | 7         |
| `media`  | —      | —        | —    | 10       | 10       | 10        |
| `rt`     | —      | —        | —    | 8        | 8        | 8         |
| `buy`    | —      | —        | —    | 3        | 3        | 3         |
| `bid`    | —      | —        | —    | 1        | 1        | 1         |
| `job`    | —      | —        | —    | —        | 2        | 2         |
| `report` | —      | —        | —    | —        | 3        | 2         |
| `ai`     | —      | —        | —    | —        | 5        | 6         |
| `feed`   | —      | —        | —    | —        | —        | 8         |
| `hook`   | —      | —        | —    | —        | —        | 2         |
| `push`   | —      | —        | —    | —        | —        | 2         |

### Era 0: Garage

The tutorial, without tutorial screens. A player who wants to learn a later Era's mechanics first
plays its [Sandbox track](/design/14-challenges#sandbox-tracks).

- **Start.** 150 users, $300, and one Burstable App Server running PHP with Apache `mod_php` and
  PostgreSQL **on the same box**, connected to Users and Payments. Analytics is linked to the box.
- **First choices, in order.**
  1. Collect revenue from the Payments drawer.
  2. Upgrade the box (it is out of CPU credits).
  3. Research "Structured logs" or "Stripe Billing" with the first Insight.
  4. The box runs out of RAM because the database and Apache share it. Split the database onto its
     own Node. This is the classic first scaling step of real companies.
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
- **New problems.** Availability. Zone outages begin. A single database is now a single point of
  failure. Users expect 99.9%.
- **New systems.** Zones ([Components](/design/05-components#zones-and-regions)), pricing models
  ([Economy](/design/09-economy#pricing-models)), SLOs and error budgets
  ([Incidents](/design/11-incidents#slos-and-error-budgets)), team types.
- **Unlocks available.** Multi-zone, Kubernetes, Autoscaler, Serverless Functions, Realtime Hub,
  Payment Provider, Feature Flags, canary deploys, Elixir, Rust.

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

No new kinds. The game changes from growth to proof.

**The IPO checklist.** All items must be true at the same time:

| Item              | Requirement                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Users             | 50,000,000                                                                  |
| Reliability       | 99.95% availability over the last calendar week                             |
| SOC 2             | Research "SOC 2 program" and a Security team                                |
| Disaster recovery | A passed DR drill: RTO under 1 calendar hour, RPO under 5 calendar minutes  |
| Data residency    | EU users served from an EU region                                           |
| Rule of 40        | Growth plus margin of at least 40 ([Economy](/design/09-economy#valuation)) |

This list gives the late game concrete goals that are not "more users". It is the Upload Labs fix for
a missing end target ([Influences](/design/02-influences#why-players-quit)).

### Era 7: Public

The company is listed. The game becomes an endless series of quarters.

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

Research costs Insight of named request kinds and takes time: each item is a **Study**. Each item
belongs to a track, needs an Era, and may need other items. The research screen shows the tree by
track, with the locked items of the next Era visible so that the player can plan
([Interface](/design/15-ui-ux#research-screen)).

The track tables below are design intent. Each one is followed by a status line saying how many of its
items the build has and which ones it does not, so that an item's presence in a table is never read as
a promise that the game offers it. The tables design 186 items across 10 tracks; the build has 138 of
them across all 10.

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

So the player cannot study Series B research before Series A's Features bring their traffic, and
more `page` traffic never buys it. Items that teach a new kind's problem ask for that kind, so the
player ships the Feature first: it is the production line for that kind's Insight. No item that a
Feature needs costs the kind that Feature brings. A Venture's request mix changes which recipes are cheap: Fintech serves 4×
`buy`, so its Series A research is fast. Every Venture serves every request kind, so every recipe
can be paid.

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
Component types. A trace needs more than one hop.

| Item        | Breadth              |
| ----------- | -------------------- |
| `tracing`   | 3 Component types    |
| `profiling` | 4 Component types    |
| `rum`       | Sampled in 2 regions |

**Not built yet.** Only `tracing` has a breadth rule. `profiling` and `rum` are not built, and neither
is the 2-region sampling rule.

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

```text
draw(pool) = cost(pool) × speed × dt / base_duration
progress  += speed × dt × min(1, min over recipe pools: balance(pool) / draw(pool))
```

Each pool pays `draw(pool)` times the same factor. When a pool is empty, the Study runs at the rate
that pool earns, so the scarcest kind limits it. Traffic falls at night, so a `buy` Study slows at
night. The player can start a Study with no Insight saved.

A Study **stalls** when a recipe pool earns nothing and holds less than the Study still draws, or
when the Design samples its kinds at too few Component types. A stalled running Study holds every
Study behind it. The queue row, the Insight card, and the item's card mark a stalled Study and say
why: the pool that earns nothing, and the Feature that brings its kind when one does, such as
Password login for `login`. Queueing a stalled item says the same. While the running Study is
stalled, a teammate's Mail waits in Needs action with an Open Research button; its Thread resolves
when the Study moves again or leaves the queue.

`speed` is 1, and two things raise it:

- **A Spike.** A Team takes the running Study as its backlog item
  ([Team](/design/08-team-and-velocity#spikes)). While it does, `speed` × 2. A Spike whose Study is
  not running waits, and no Team takes it.
- **Study-speed research.** `trace-search` and `notebooks` add +25% each.

Studies run offline ([Simulation](/design/04-simulation#offline-progress)). A postmortem's action item
puts its Study first in the queue ([Incidents](/design/11-incidents#postmortems)).

### Cost bands

The ◇ column in the track tables is a Study's list price. A Study charges that price times its Era's
price scale: ×2 in Seed and ×1.5 in Series A, ×1 in every other Era. The bands below are the charged
range.

| Era      | Cost range (◇)       |
| -------- | -------------------- |
| Garage   | 10–60                |
| Pre-seed | 60–300               |
| Seed     | 600–3,000            |
| Series A | 1,500–8,000          |
| Series B | 8,000–40,000         |
| Series C | 40,000–200,000       |
| Pre-IPO  | 200,000–1,000,000    |
| Public   | 1,000,000–10,000,000 |

### Track: Infrastructure

| ID                    | Name                      | Era      | ◇       | Requires          | Effect                                                                                        |
| --------------------- | ------------------------- | -------- | ------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `dns-rr`              | DNS round robin           | Garage   | 15      | —                 | DNS Component                                                                                 |
| `load-balancing`      | Load balancing            | Garage   | 25      | —                 | Load Balancer (L7, round robin and weighted)                                                  |
| `health-checks`       | Health checks             | Pre-seed | 90      | `load-balancing`  | Health-checked DNS, deep checks, check intervals                                              |
| `lb-algorithms`       | Load balancing algorithms | Pre-seed | 120     | `load-balancing`  | Least connections, power of two choices, consistent hashing                                   |
| `auth-provider`       | Managed identity          | Pre-seed | 140     | —                 | Auth Provider; logins stop costing your CPU                                                   |
| `background-jobs`     | Background jobs           | Seed     | 300     | —                 | Worker                                                                                        |
| `queues`              | Message queues            | Seed     | 600     | `background-jobs` | Queue (RabbitMQ, SQS)                                                                         |
| `cdn`                 | Content delivery          | Seed     | 350     | —                 | CDN                                                                                           |
| `waf`                 | Web application firewall  | Seed     | 500     | —                 | WAF                                                                                           |
| `l4-lb`               | L4 load balancing         | Seed     | 400     | `lb-algorithms`   | L4 variant                                                                                    |
| `multi-az`            | Multiple zones            | Series A | 3,000   | `health-checks`   | Zone placement                                                                                |
| `autoscaling`         | Autoscaling               | Series A | 4,000   | `load-balancing`  | Autoscaler                                                                                    |
| `containers`          | Container orchestration   | Series A | 5,000   | `autoscaling`     | Kubernetes Cluster                                                                            |
| `serverless`          | Serverless                | Series A | 3,500   | —                 | Serverless Function                                                                           |
| `websockets`          | WebSockets                | Series A | 2,500   | —                 | Realtime Hub                                                                                  |
| `api-gateway`         | API gateway               | Series A | 2,000   | `load-balancing`  | API Gateway                                                                                   |
| `rate-limiting`       | Rate limiting             | Series A | 1,800   | `api-gateway`     | Token bucket limits on the gateway                                                            |
| `tiered-caching`      | Tiered caching            | Series A | 2,000   | `cdn`             | CDN `media` hit ratio 92%                                                                     |
| `esi`                 | Edge-side includes        | Series A | 3,000   | `cdn`             | +20% `page` hit ratio for logged-in users                                                     |
| `bot-management`      | Bot management            | Series A | 2,500   | `waf`             | Challenges suspicious clients; lowers false positives                                         |
| `scheduled-scaling`   | Scheduled scaling         | Series B | 9,000   | `autoscaling`     | Scale ahead of the daily peak                                                                 |
| `service-mesh`        | Service mesh              | Series B | 20,000  | `containers`      | Service Mesh                                                                                  |
| `arm-instances`       | ARM instances             | Series B | 12,000  | —                 | ARM family, 0.8× price                                                                        |
| `hosted-models`       | Hosted models             | Series B | 8,000   | —                 | LLM API                                                                                       |
| `model-serving`       | Model serving             | Series B | 15,000  | —                 | GPU Node                                                                                      |
| `quantization`        | Quantization              | Series B | 18,000  | `model-serving`   | INT8 and INT4 options                                                                         |
| `continuous-batching` | Continuous batching       | Series B | 25,000  | `model-serving`   | Batch throughput without the latency cost                                                     |
| `multi-region`        | Multiple regions          | Series C | 60,000  | `multi-az`        | Regions as boards                                                                             |
| `geo-dns`             | GeoDNS                    | Series C | 50,000  | `multi-region`    | Route users to the nearest region                                                             |
| `infra-as-code`       | Infrastructure as code    | Series C | 40,000  | `multi-region`    | Pick an IaC tool; Mirror a region ([Components](/design/05-components#mirror-a-region))       |
| `gitops`              | GitOps                    | Series C | 90,000  | `infra-as-code`   | Mirrors sync on their own, all at once or staged ([Components](/design/05-components#gitops)) |
| `anycast`             | Anycast                   | Series C | 120,000 | `geo-dns`         | −20 ms on the user hop everywhere                                                             |
| `edge-compute`        | Edge compute              | Series C | 80,000  | `cdn`             | Edge Function                                                                                 |
| `notifications`       | Notifications             | Series C | 40,000  | —                 | Push Provider                                                                                 |

**Built: 23 of 34.** Not built yet: `l4-lb`, `serverless`, `rate-limiting`, `esi`, `bot-management`,
`scheduled-scaling`, `service-mesh`, `arm-instances`, `quantization`, `continuous-batching`,
`edge-compute`.

### Track: Data

| ID                    | Name                       | Era      | ◇       | Requires                            | Effect                                               |
| --------------------- | -------------------------- | -------- | ------- | ----------------------------------- | ---------------------------------------------------- |
| `query-analysis`      | Query analysis (`EXPLAIN`) | Garage   | 40      | —                                   | Shows unindexed query shapes; enables "Add index"    |
| `caching`             | Caching                    | Pre-seed | 80      | —                                   | Cache (Redis, Memcached), cache-aside                |
| `pooling`             | Connection pooling         | Pre-seed | 120     | —                                   | Connection Pooler                                    |
| `replication`         | Read replicas              | Pre-seed | 220     | —                                   | Read Replica (asynchronous)                          |
| `cache-strategies`    | Cache strategies           | Seed     | 600     | `caching`                           | Read-through, write-through, write-behind            |
| `stampede-protection` | Stampede protection        | Seed     | 900     | `caching`                           | Coalescing, early expiration, stale-while-revalidate |
| `full-text-search`    | Full-text search           | Seed     | 450     | —                                   | Search Engine                                        |
| `object-storage`      | Object storage             | Seed     | 500     | —                                   | Object Storage                                       |
| `pitr`                | Point-in-time recovery     | Seed     | 700     | —                                   | Backup options                                       |
| `cache-warming`       | Cache warming              | Series A | 2,000   | `stampede-protection`               | Warm before traffic                                  |
| `sync-replication`    | Synchronous replication    | Series A | 2,500   | `replication`                       | Synchronous replica option                           |
| `ryw-routing`         | Read-your-writes routing   | Series A | 3,000   | `replication`                       | Removes most `stale` after writes                    |
| `lifecycle-rules`     | Storage lifecycle rules    | Series A | 1,500   | `object-storage`                    | Automatic storage classes                            |
| `document-db`         | Document databases         | Series A | 3,500   | —                                   | Document Store                                       |
| `online-migrations`   | Online schema migrations   | Series A | 4,000   | `query-analysis`                    | Migrations without table locks                       |
| `event-streaming`     | Event streaming            | Series B | 15,000  | `queues`                            | Event Stream                                         |
| `data-warehouse`      | Data warehousing           | Series B | 12,000  | —                                   | Data Warehouse                                       |
| `cdc`                 | Change data capture        | Series B | 18,000  | `event-streaming`, `data-warehouse` | CDC Connector                                        |
| `outbox`              | Transactional outbox       | Series B | 14,000  | `queues`                            | Removes dual-write divergence                        |
| `sharding`            | Sharding                   | Series B | 25,000  | `replication`                       | Database partitioning                                |
| `expand-contract`     | Expand and contract        | Series B | 10,000  | `online-migrations`                 | Zero-lock schema changes                             |
| `embeddings`          | Embeddings                 | Series B | 16,000  | —                                   | Vector Index                                         |
| `hybrid-fanout`       | Hybrid fan-out             | Series C | 90,000  | `caching`                           | Push for normal accounts, pull for celebrities       |
| `leaderless`          | Leaderless replication     | Series C | 70,000  | `sharding`                          | Wide-column Store with tunable quorums               |
| `consensus`           | Consensus databases        | Series C | 150,000 | `sync-replication`                  | Distributed SQL                                      |
| `retention`           | Retention policies         | Pre-IPO  | 250,000 | —                                   | Archive or delete old data                           |

**Built: 19 of 26.** Not built yet: `document-db`, `online-migrations`, `event-streaming`, `cdc`,
`outbox`, `expand-contract`, `embeddings`.

### Track: Reliability

| ID                     | Name                     | Era      | ◇       | Requires                         | Effect                                                                        |
| ---------------------- | ------------------------ | -------- | ------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `timeouts`             | Timeouts and retries     | Pre-seed | 60      | —                                | Link timeout and naive retries                                                |
| `ci`                   | Continuous delivery      | Pre-seed | 100     | —                                | CI/CD Pipeline, with Recreate and Rolling                                     |
| `backoff-jitter`       | Backoff with jitter      | Seed     | 400     | `timeouts`                       | Retry policy option                                                           |
| `cert-automation`      | Certificate automation   | Seed     | 300     | —                                | Secrets and Certificates                                                      |
| `blue-green`           | Blue-green deploys       | Seed     | 900     | `ci`                             | Blue-green deploy strategy                                                    |
| `feature-flags`        | Feature flags            | Seed     | 800     | `ci`                             | Feature Flags                                                                 |
| `circuit-breakers`     | Circuit breakers         | Series A | 2,500   | `backoff-jitter`                 | Link option                                                                   |
| `bulkheads`            | Bulkheads                | Series A | 3,500   | `circuit-breakers`               | Link option                                                                   |
| `load-shedding`        | Priority load shedding   | Series A | 4,000   | `timeouts`                       | When saturated, drop the lowest-value kinds first                             |
| `graceful-degradation` | Graceful degradation     | Series A | 3,000   | `feature-flags`                  | Turn off expensive features automatically during overload                     |
| `canary`               | Canary deploys           | Series A | 3,000   | `ci`, `percentiles`              | Canary deploy strategy                                                        |
| `on-call`              | On-call rotation         | Series A | 2,000   | `alerting`                       | Faster triage; incidents page the player                                      |
| `error-budgets`        | Error budgets            | Series A | 3,000   | `slo-dashboards`                 | Velocity bonus with budget left, freeze when spent                            |
| `runbooks`             | Runbooks                 | Series A | 5,000   | `on-call`                        | Automatic mitigation for known incident types                                 |
| `restore-drills`       | Restore drills           | Series A | 2,000   | `pitr`                           | Removes the failed-restore chance                                             |
| `idempotency-keys`     | Idempotency keys         | Series A | 1,500   | `checkout`                       | A retried charge never charges twice                                          |
| `hedged-requests`      | Hedged requests          | Series C | 100,000 | `tracing`                        | Send a second request after the p95; cuts the tail, adds load                 |
| `chaos-engineering`    | Chaos engineering        | Pre-IPO  | 300,000 | `runbooks`                       | Scheduled failure injection that earns Failure Insight and reveals weak spots |
| `dr-drills`            | Disaster recovery drills | Pre-IPO  | 400,000 | `restore-drills`, `multi-region` | Run the DR drill for the IPO checklist                                        |

**Built: 12 of 19.** Not built yet: `feature-flags`, `bulkheads`,
`graceful-degradation`, `on-call`, `runbooks`, `hedged-requests`, `chaos-engineering`.

### Track: Observability

[Observability](/design/12-observability#the-visibility-ladder) explains what each step reveals.

| ID                  | Name                 | Era      | ◇      | Requires       | Effect                                                 |
| ------------------- | -------------------- | -------- | ------ | -------------- | ------------------------------------------------------ |
| `logs`              | Structured logs      | Garage   | 20     | —              | Error breakdown by cause                               |
| `metrics`           | Metrics              | Garage   | 50     | —              | History graphs per Node; the Dashboard                 |
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

**Built: 8 of 12.** Not built yet: `profiling`, `tail-sampling`, `rum`, `anomaly-detection`.

### Track: Performance

| ID                | Name                        | Era      | ◇      | Requires | Effect                                                    |
| ----------------- | --------------------------- | -------- | ------ | -------- | --------------------------------------------------------- |
| `keepalive`       | Connection reuse            | Garage   | 25     | —        | −1 ms per internal hop (no new TCP handshake)             |
| `gzip`            | Compression                 | Garage   | 30     | —        | `page` and `read` payload −70%, +CPU                      |
| `eager-loading`   | Eager loading               | Pre-seed | 100    | —        | Enables the "Eager loading" task                          |
| `http2`           | HTTP/2                      | Seed     | 350    | —        | −15% user hop latency on `page`                           |
| `denormalization` | Denormalization             | Series A | 3,000  | —        | Read cost −30%, write cost +20%                           |
| `precompute`      | Materialized views          | Series B | 12,000 | —        | `report` cost −50%, data is stale by the refresh interval |
| `binary-rpc`      | Binary RPC between services | Series B | 15,000 | —        | Inter-service serialization CPU −50%                      |
| `http3`           | HTTP/3                      | Series C | 60,000 | `http2`  | −20% user hop latency for distant and mobile users        |

**Built: 5 of 8.** Not built yet: `denormalization`, `precompute`, `binary-rpc`.

### Track: Runtimes

PHP is the starting language. Each other language needs its research, and each variant needs its
language ([Runtimes](/design/06-runtimes#variants-by-language)).

| ID                   | Name                   | Era      | ◇      | Requires      |
| -------------------- | ---------------------- | -------- | ------ | ------------- |
| `php-fpm`            | PHP-FPM                | Garage   | 25     | —             |
| `opcache`            | OPcache                | Garage   | 45     | `php-fpm`     |
| `lang-ruby`          | Ruby                   | Garage   | 30     | —             |
| `lang-node`          | Node.js                | Garage   | 40     | —             |
| `lang-python`        | Python                 | Pre-seed | 120    | —             |
| `node-cluster`       | Node.js cluster mode   | Pre-seed | 100    | `lang-node`   |
| `libuv-pool`         | libuv thread pool      | Pre-seed | 120    | `lang-node`   |
| `lang-go`            | Go                     | Seed     | 600    | —             |
| `lang-java`          | Java                   | Seed     | 800    | —             |
| `lang-csharp`        | C#                     | Seed     | 800    | —             |
| `php-jit`            | PHP JIT                | Seed     | 500    | `opcache`     |
| `worker-threads`     | Node.js worker threads | Seed     | 500    | `lang-node`   |
| `yjit`               | YJIT                   | Seed     | 400    | `lang-ruby`   |
| `gevent`             | gevent                 | Seed     | 400    | `lang-python` |
| `asgi`               | ASGI with Uvicorn      | Seed     | 500    | `lang-python` |
| `lang-elixir`        | Elixir                 | Series A | 2,500  | —             |
| `lang-rust`          | Rust                   | Series A | 4,000  | —             |
| `lang-zig`           | Zig                    | Series A | 3,500  | —             |
| `lang-haskell`       | Haskell                | Series A | 3,000  | —             |
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

**Built: 37 of 37.**

### Track: Frameworks

| Framework    | Era      | ◇      | Requires      |
| ------------ | -------- | ------ | ------------- |
| Laravel      | Garage   | 20     | —             |
| Rails        | Garage   | 30     | `lang-ruby`   |
| Express      | Garage   | 30     | `lang-node`   |
| Symfony      | Pre-seed | 80     | —             |
| Sinatra      | Pre-seed | 60     | `lang-ruby`   |
| Django       | Pre-seed | 150    | `lang-python` |
| Flask        | Pre-seed | 100    | `lang-python` |
| FastAPI      | Seed     | 500    | `asgi`        |
| Fastify      | Seed     | 400    | `lang-node`   |
| Next.js      | Seed     | 600    | `lang-node`   |
| Spring Boot  | Seed     | 900    | `lang-java`   |
| ASP.NET Core | Seed     | 900    | `lang-csharp` |
| Gin          | Seed     | 700    | `lang-go`     |
| NestJS       | Series A | 2,000  | `lang-node`   |
| Fiber        | Series A | 2,000  | `fasthttp`    |
| Phoenix      | Series A | 2,500  | `lang-elixir` |
| Axum         | Series A | 3,000  | `lang-rust`   |
| Actix Web    | Series A | 3,000  | `lang-rust`   |
| Quarkus      | Series B | 10,000 | `lang-java`   |

**Built: 19 of 19.**

### Track: Security

| ID                      | Name                           | Era      | ◇       | Requires                                                      | Effect                                                       |
| ----------------------- | ------------------------------ | -------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `tls-everywhere`        | TLS everywhere                 | Seed     | 300     | —                                                             | Encrypts internal links; +0.2 ms per hop; required for SOC 2 |
| `secrets-management`    | Secrets management             | Seed     | 400     | —                                                             | Removes the "Leaked credentials" incident                    |
| `credential-protection` | Credential stuffing protection | Series A | 2,500   | `rate-limiting`                                               | Blocks bot `login` bursts                                    |
| `dependency-scanning`   | Dependency scanning            | Series A | 3,000   | `ci`                                                          | Supply-chain incident chance −70%                            |
| `encryption-at-rest`    | Encryption at rest             | Series B | 9,000   | —                                                             | Required for SOC 2                                           |
| `pen-testing`           | Penetration testing            | Pre-IPO  | 200,000 | —                                                             | Reveals one weakness per calendar week                       |
| `soc2`                  | SOC 2 program                  | Pre-IPO  | 300,000 | `tls-everywhere`, `encryption-at-rest`, `dependency-scanning` | IPO checklist item                                           |
| `gdpr-residency`        | Data residency controls        | Pre-IPO  | 350,000 | `multi-region`                                                | IPO checklist item                                           |
| `security-team`         | Security team                  | Pre-IPO  | 200,000 | —                                                             | Team type                                                    |

**Built: 6 of 9.** Not built yet: `secrets-management`, `credential-protection`, `pen-testing`.

### Track: Cost

| ID                    | Name                | Era      | ◇       | Requires             | Effect                                    |
| --------------------- | ------------------- | -------- | ------- | -------------------- | ----------------------------------------- |
| `reserved-instances`  | Reserved instances  | Series A | 2,000   | —                    | Reserved pricing model                    |
| `spot-instances`      | Spot instances      | Series A | 3,000   | —                    | Spot pricing model                        |
| `rightsizing`         | Rightsizing report  | Series A | 2,500   | `metrics`            | Marks Nodes below 30% utilization at peak |
| `egress-optimization` | Egress optimization | Series A | 3,500   | `object-storage`     | R2 variant; egress line breakdown         |
| `unit-economics`      | Unit economics      | Series B | 8,000   | —                    | Cost per request for each kind            |
| `cost-allocation`     | Cost allocation     | Series B | 10,000  | `unit-economics`     | Cost per service and team                 |
| `savings-plans`       | Savings plans       | Pre-IPO  | 250,000 | `reserved-instances` | −20% compute with no per-Node lock        |

**Built: 2 of 7.** `reserved-instances` and `spot-instances` unlock the two pricing models on a
compute Node from Series A ([Economy](/design/09-economy#pricing-models)). Not built yet:
`rightsizing`, `egress-optimization`, `unit-economics`, `cost-allocation`, `savings-plans`.

### Track: Product and business

| ID                   | Name                    | Era      | ◇         | Requires                   | Effect                                               |
| -------------------- | ----------------------- | -------- | --------- | -------------------------- | ---------------------------------------------------- |
| `stripe`             | Stripe Billing          | Garage   | 30        | —                          | Payments collect automatically                       |
| `funnels`            | Funnel analytics        | Pre-seed | 150       | —                          | Growth +10%                                          |
| `code-review`        | Code review             | Pre-seed | 120       | —                          | Shows hidden costs of features before they ship      |
| `testing-culture`    | Automated tests         | Pre-seed | 150       | `ci`                       | Bad-deploy chance −30%                               |
| `ab-testing`         | A/B testing             | Seed     | 700       | `funnels`, `feature-flags` | Measures each Feature's lift against a holdout group |
| `hiring-pipeline`    | Hiring pipeline         | Seed     | 600       | —                          | Time to hire −30%                                    |
| `trunk-based`        | Trunk-based development | Seed     | 800       | `ci`                       | Deploy frequency +50%                                |
| `platform-team`      | Platform team           | Series A | 3,000     | `containers`               | Team type                                            |
| `sre-team`           | SRE team                | Series A | 4,000     | `on-call`                  | Team type                                            |
| `checkout`           | Checkout                | Series A | 1,500     | —                          | Payment Provider and the Checkout Feature            |
| `service-boundaries` | Service boundaries      | Series B | 15,000    | —                          | Split services                                       |
| `data-team`          | Data team               | Series B | 10,000    | `data-warehouse`           | Team type                                            |
| `enterprise-sales`   | Enterprise sales        | Series B | 20,000    | —                          | B2B market +30%; outages cost SLA credits            |
| `investor-relations` | Investor relations      | Pre-IPO  | 300,000   | —                          | Valuation multiple +2                                |
| `guidance-modeling`  | Guidance modeling       | Public   | 1,000,000 | —                          | Shows the probability of beating each guidance level |

**Built: 7 of 15.** Not built yet: `ab-testing`, `hiring-pipeline`, `trunk-based`, `platform-team`,
`sre-team`, `service-boundaries`, `data-team`, `enterprise-sales`.

## Pacing targets for the first company

These are measured, not targeted: the Balanced bot at the live pace
([pacing model](/design/16-balancing#pacing-model)), at `SIM_VERSION` 17 on seeds 1 and 3, reaches each
Era at the sim minutes below. The numbers are re-measured when the tuning changes.

| Era      | Measured time from start (sim minutes) |
| -------- | -------------------------------------- |
| Pre-seed | 5.8                                    |
| Seed     | 20.5–21.1                              |
| Series A | 65.5                                   |
| Series B | 102–106                                |
