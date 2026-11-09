---
title: 4. Simulation
summary: How requests, capacity, queues, latency, errors, and users are calculated.
section: design
order: 4
---

The **Simulation** turns a **Design** and the current demand into the **Ledger**: every rate,
latency, error, and dollar the game shows. This page defines the model. Constants are in
[Balancing](/design/16-balancing#constants). Runtime-specific capacity rules are in
[Runtimes](/design/06-runtimes#the-capacity-model).

## Design goals for the model

1. **Real shape, simple math.** The curves have the shape of real systems: latency rises sharply
   near full utilization, tails grow with fan-out, and retries amplify overload. The math is cheap
   enough to run ten times a second in a browser tab.
2. **Deterministic.** The same save, seed, and actions produce the same result, and tests and
   Challenge replays depend on that.
3. **Explainable.** Every number on a card breaks down into terms. The player sees them once they
   unlock the matching observability tool ([Observability](/design/12-observability)).

## Time

Two clocks drive the game.

| Clock     | Rate                                     | Used for                                                                                                       |
| --------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Sim clock | 1 sim second = 1 real second at 1× speed | Rates ($/s, rps), queues, outages, deploys, warmup, incident durations, Dev Hour production.                   |
| Calendar  | 1 sim second = 1 calendar minute         | The day and night cycle, weekdays, quarters, certificate expiry, reserved-instance terms, the date in the HUD. |

So one calendar day lasts 24 real minutes, and one calendar week lasts 2 hours 48 minutes. Both
clocks run only while the player has the Company open: closing it stops the Simulation, and the
calendar stops with it ([The clock stops](#the-clock-stops)).

Operational durations, such as a JVM warmup or a spot interruption notice, run on the sim clock and
are stylized for play. [Reality check](/design/reality-check) lists their real values.

**The step.** The simulation advances in steps of 100 ms of sim time. Each step runs the flow solve,
updates queues, and accrues money. The UI reads the Ledger four times a second.

**Speed.** 0.5×, 1× (the default), 3×, and 10×. Time dilation adds 20× and 40×
([Exit and Legacy](/design/13-prestige#the-legacy-shop)). Pause is always available.

## Request kinds

A **Request kind** is a class of work that Users send. Each kind has a value, a cost profile, and a
patience target. Kinds arrive by Era ([Progression](/design/10-progression#eras)).

| Kind        | Code     | Era      | Value ($) | App CPU (ref ms) | Downstream calls                              | Payload   | Apdex T  | Traits                                                                                                |
| ----------- | -------- | -------- | --------- | ---------------- | --------------------------------------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------- |
| Page view   | `page`   | Garage   | 0.10      | 4                | 2 × `q-read`                                  | 80 KB     | 400 ms   | Cacheable at the edge for anonymous users (70%)                                                       |
| API read    | `read`   | Garage   | 0.20      | 1.5              | 1 × `q-read`                                  | 4 KB      | 200 ms   | Cacheable                                                                                             |
| API write   | `write`  | Pre-seed | 0.50      | 2                | 1 × `q-write`                                 | 2 KB      | 300 ms   | Invalidates cached reads; needs read-your-writes                                                      |
| Login       | `login`  | Pre-seed | 0.25      | 80               | 1 × `q-read`                                  | 1 KB      | 800 ms   | CPU-heavy (password hash); bot target                                                                 |
| Search      | `search` | Seed     | 0.60      | 3                | 1 × `q-search`                                | 8 KB      | 300 ms   | Fan-out inside the search engine                                                                      |
| Upload      | `upload` | Seed     | 0.75      | 120              | 1 × `blob-put`, 1 × `q-write`                 | 2 MB in   | 1,500 ms | CPU-heavy (image resize); can go async                                                                |
| Bot         | `bot`    | Seed     | 0         | 2                | 1 × `q-read`                                  | 4 KB      | —        | Earns nothing; WAF target                                                                             |
| Video       | `media`  | Series A | 1.00      | 1                | 1 × `blob-get`                                | 5 MB      | 1,000 ms | Egress-heavy; CDN-cacheable                                                                           |
| Realtime    | `rt`     | Series A | 0.025     | 0.3              | 1 × `ws` (connection)                         | 1 KB      | 100 ms   | Holds a long-lived connection                                                                         |
| Checkout    | `buy`    | Series A | 25.00     | 5                | 1 × `q-read` (cart), 1 × `q-tx`, 1 × `charge` | 2 KB      | 2,000 ms | Needs strong consistency and idempotency                                                              |
| Export job  | `job`    | Series B | 1.60      | 400              | 50 × `q-read`                                 | 10 MB out | 1,000 ms | Long-running; should go through a queue                                                               |
| Report      | `report` | Series B | 2.00      | 20               | 1 × `q-scan`                                  | 50 KB     | 3,000 ms | Analytical scan; harms the transactional database                                                     |
| AI prompt   | `ai`     | Series B | 24.00     | 5                | 1 × `infer`                                   | 4 KB      | 4,000 ms | GPU-bound; streams tokens                                                                             |
| Feed        | `feed`   | Series C | 0.30      | 6                | 20 × `q-read` (pull) or 1 × cache read (push) | 30 KB     | 300 ms   | Fan-out; celebrity accounts create hot keys                                                           |
| Webhook     | `hook`   | Series C | 0.40      | 2                | 1 × `callout` (customer endpoint)             | 2 KB      | 1,000 ms | Bursty; the far end is slow and unreliable                                                            |
| Notify      | `push`   | Series C | 0.05      | 0.5              | 1 × `notify` (push provider)                  | 1 KB      | 1,000 ms | Fan-out on write                                                                                      |
| Bid request | `bid`    | Series A | 0.001     | 0.5              | 1 × `q-read` (campaign)                       | 1 KB      | 100 ms   | Must answer inside its deadline; Ad tech serves 10× ([Exit and Legacy](/design/13-prestige#ventures)) |

"App CPU (ref ms)" is CPU time on a runtime with speed 1.0 (Go). Each runtime divides it by its
speed factor ([Runtimes](/design/06-runtimes#language-profiles)). Values are game dollars and are
stylized. [Balancing](/design/16-balancing#cost-index) sets the prices that they are measured against,
and the [valuation scale](/design/16-balancing#valuation-scale) converts annual revenue into the
Valuation.

A **Queue** makes a kind's downstream calls asynchronous: the user waits for the acknowledgement and a
Worker makes the calls. `job` and `upload` then carry a completion window, 60 s and 10 s, and are
scored on when the async part finishes rather than on the acknowledgement. `hook` and `push` have no
completion window, so they are scored synchronously at their 1,000 ms target even when a Queue runs
them. `bot` is unscored: the catalog carries its 400 ms target but nothing reads it. `rt` has no backend
call: an App Server holds the connection while its runtime can
([Runtimes](/design/06-runtimes#realtime-connections)), and a Realtime Hub holds it instead, on a
runtime built for it ([Components](/design/05-components#realtime-hub)).

### Backend kinds

App servers turn user requests into backend kinds. A backend kind earns nothing by itself and only
carries load to the data tier.

| Kind       | Meaning                           | Typical target                            |
| ---------- | --------------------------------- | ----------------------------------------- |
| `q-read`   | A point read or a small query     | Database, replica, cache, document store  |
| `q-write`  | An insert or an update            | Primary database, wide-column store       |
| `auth`     | A password hash off your own CPU  | Auth Provider                             |
| `q-search` | A full-text query                 | Search engine (or Postgres at low volume) |
| `blob-put` | Write an object                   | Object storage                            |
| `task`     | A unit of background work         | Queue, then Worker                        |
| `blob-get` | Read an object                    | Object storage, CDN                       |
| `q-tx`     | A multi-statement transaction     | Primary database or distributed SQL       |
| `charge`   | A card charge                     | Payment Provider                          |
| `q-scan`   | An analytical scan over many rows | Data warehouse (or the primary, badly)    |
| `infer`    | A model inference                 | GPU Node or LLM API                       |
| `notify`   | A push message or an email        | Push Provider                             |
| `callout`  | A call to a customer's webhook    | The customer's endpoint, simulated inline |
| `k-write`  | A timeline write, for fan-out     | Cache, database, or wide-column store     |

## Demand

```latex
\begin{aligned}
\text{demand rps} \left(\text{kind}\right) &= \sum_{\text{regions}} \text{Users} \left(\text{region}\right) \times \text{requests per user} \times \text{diurnal} \left(\text{region} ,\  t\right) \\ &\quad \times \text{weekly} \left(t\right) \times \text{mix} \left(\text{kind}\right) \times \text{feature mult} \left(\text{kind}\right)
\end{aligned}
```

| Term           | Meaning                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Users_r`      | The user count of region `r` ([Users and growth](#users-and-growth)). Before Series C, only North America.           |
| `diurnal_r(t)` | `diurnal(t)` at region `r`'s local hour, so each region peaks at its own 20\:00.                                     |
| `R_user`       | Requests per user per second, 0.02 by default.                                                                       |
| `diurnal(t)`   | `1 + A × cos(2π × (hour − 20) / 24)`. Peak at 20\:00, trough at 08\:00. `A` is 0.45 for the default Venture.         |
| `weekly(t)`    | 1.0 on weekdays. Each Venture defines its weekend factor (B2B 1 with an evening peak, consumer 1.15).                |
| `mix(kind)`    | The share of each unlocked kind. The mix changes with Era and features ([Progression](/design/10-progression#eras)). |
| `feature_mult` | Product features that raise usage of a kind ([Team and velocity](/design/08-team-and-velocity#features)).            |

Real traffic follows a daily cycle, so the player chooses: provision for the peak and pay for idle
capacity at night, or scale with demand ([Components: Autoscaler](/design/05-components#autoscaler)).

**Incidents** add to demand: spikes multiply it, bots add `bot` traffic, and DDoS adds very large
volumes of junk ([Incidents](/design/11-incidents)).

## The flow solve

The Design is a directed acyclic graph, and the game refuses a link that would create a cycle.

Each step, the solve walks the graph from the sources (**Users**) in topological order:

1. **Arrivals.** Each **Node** receives a rate per kind, `λ(node, kind)`.
2. **Accept or strand.** A Node that does not accept a kind passes it on. If no outbound link
   accepts the kind, those requests are **stranded** and count as errors. The card shows a red
   "Stranded" row.
3. **Serve.** The Node answers a share of each kind itself, for example a cache answers its hit ratio
   of `q-read`.
4. **Transform.** The Node turns some kinds into others, for example an app server turns `read` into
   `q-read`.
5. **Split.** The rest goes to outbound links. The split policy depends on the Node: a load balancer
   uses its algorithm ([Components](/design/05-components#load-balancer)), an API Gateway uses its
   route table ([Components](/design/05-components#api-gateway)), and every Node sends a kind only to a
   Link that accepts it.
6. **Capacity.** The Node's capacity limits what it can process
   ([Runtimes](/design/06-runtimes#the-capacity-model)). Excess arrivals are dropped.

### The latency coupling

A synchronous request holds a slot on the caller while it waits for the callee. So a slow database
reduces the capacity of every app server that uses a worker pool. This is
[Little's law](/glossary/littles-law):

```latex
\begin{aligned}
\text{in flight} \left(\text{node}\right) &= \text{throughput} \left(\text{node}\right) \times \text{residence time} \left(\text{node}\right) \\
\text{residence time} &= \text{own CPU time} + \sum_{\text{synchronous calls}} \text{downstream latency}
\end{aligned}
```

The coupling makes the solve circular. The app server's capacity depends on the database's latency,
and that latency depends on the load the app server sends. The solve resolves the loop with a damped
fixed-point iteration: six passes per step, each blending 50% of the new value with the previous
one. It converges in practice because latency changes slowly between steps.

The same coupling makes "the database is slow" show up as "the app servers are full" in the Garage
Era, as it does in production.

## Capacity, utilization, and queues

For each Node:

```latex
\begin{aligned}
\text{offered work} &= \sum_{\text{kinds}} \lambda \left(\text{kind}\right) \times \text{work} \left(\text{kind}\right) \\
&\quad \text{work in the Node's own unit (CPU ms, worker ms, IOPS)} \\
\text{utilization}\ \rho &= \frac{\text{offered work}}{\text{capacity}}
\end{aligned}
```

| Utilization   | Behavior                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ρ < 0.7       | Healthy. Queueing delay is small.                                                                                                                                                              |
| 0.7 ≤ ρ < 0.9 | Card turns amber. Waiting time rises fast.                                                                                                                                                     |
| 0.9 ≤ ρ < 1   | Card turns red. Tail latency is several times the median.                                                                                                                                      |
| ρ ≥ 1         | Saturated. The Node serves `capacity / arrivals` of the work and drops the rest. Utilization is capped at 0.98 in the queueing curve, so latency levels off instead of climbing without bound. |

**Queueing delay.** The curve is the M/M/1 waiting time, which gives the real "hockey stick" ([Reality check](/design/reality-check#queueing)):

```latex
\begin{aligned}
\text{wait} &= \text{service time} \times \frac{\rho}{1 - \rho} && \qquad \text{with $\rho$ capped at 0.98}
\end{aligned}
```

**Overload.** There is no per-Node backlog limit and no backlog-derived wait: work over a Node's
capacity is dropped as soon as it arrives and counts as an error, and the queueing curve caps
utilisation at 0.98. Worker pools have a listen backlog. Event loops have only memory as a limit, so
they fail later and harder ([Runtimes](/design/06-runtimes#concurrency-models)).

**Timeouts.** Each link has a timeout (30 s by default, which is common for HTTP clients). A request
that waits longer fails, but it has already used capacity downstream, and that work is wasted. This
is one way overload gets worse than it looks.

## Latency

The latency of one request is the sum along its synchronous path:

```latex
\begin{aligned}
\text{latency} &= \sum_{\text{hops}} \left(\text{base latency} + \text{service time} + \text{wait} + \text{network hop}\right) \\ &\quad + \text{tail events}
\end{aligned}
```

| Term           | Source                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_latency` | A fixed overhead per Component, for example 30 ms for the public internet hop from Users.                                                                           |
| `service_time` | CPU time divided by the runtime's speed, plus I/O time on data Nodes.                                                                                               |
| `wait`         | Queueing delay from the formula above.                                                                                                                              |
| `network_hop`  | 0 ms on the same box and in the same zone, 1 ms across zones, and distance-based across regions ([Components](/design/05-components#zones-and-regions)).            |
| `tail_events`  | GC pauses, event-loop blocking, cold starts, and lock waits. They affect high percentiles more than the median ([Runtimes](/design/06-runtimes#runtime-behaviors)). |

Asynchronous hops do not add to user-facing latency. A **Queue** marks everything behind it as
asynchronous ([Components](/design/05-components#queue)).

### Percentiles

The HUD shows the mean in the Garage Era, and the player earns percentiles later
([Observability](/design/12-observability#the-visibility-ladder)). When shown, percentiles come from this
model:

- The M/M/1 response time (wait plus service) is exponential with mean `service_time / (1 − ρ)`, so
  its q-th percentile is `mean × ln(1 / (1 − q))`. The p99 of the response time is about 4.6 times
  its mean. The wait alone is not exponential: a request waits at all with probability ρ.
- Fixed parts (base latency, network) add directly.
- Tail events add to the percentile that matches their probability. A GC pause that hits 2% of
  requests moves the p99 but not the p50.

**Fan-out amplifies the tail.** If a request calls N backends in parallel and waits for all of them,
the chance that at least one is slow is `1 − (1 − p)^N`. With N = 20 and a 1% slow rate per backend,
18% of requests are slow. This is [the tail at scale](/glossary/tail-at-scale). It matters for
`feed`, `search`, and any service split ([Data tier](/design/07-data-tier#fan-out)).

## Errors

A request fails for one of these reasons. Each reason has a label in the error breakdown once the
player researches Structured logs ([Observability](/design/12-observability#the-visibility-ladder)).

| Error       | Cause                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| `stranded`  | No downstream Node accepts the kind.                                                          |
| `dropped`   | The Node had no capacity left for the request.                                                |
| `timeout`   | The request waited longer than the link timeout.                                              |
| `refused`   | A connection limit is full, for example Postgres `max_connections`.                           |
| `down`      | The Node is in an outage.                                                                     |
| `oom`       | The process ran out of memory and was killed with requests in flight.                         |
| `crash`     | A crash took down in-flight requests ([blast radius](/design/06-runtimes#runtime-behaviors)). |
| `stale`     | A read returned old data where the kind needs fresh data.                                     |
| `blocked`   | The WAF blocked a real user (a false positive).                                               |
| `throttled` | A rate limiter rejected the request (HTTP 429).                                               |
| `upstream`  | A Managed Component, such as the payment provider, failed.                                    |
| `duplicate` | A retried checkout without an idempotency key charged twice.                                  |

## Retries

Each link has a retry policy: none, naive (retry at once, up to 3 times), or backoff with jitter.
Retries turn a failure into extra load:

```latex
\begin{aligned}
\text{effective}\ \lambda &= \lambda \times \left(1 + f + f^{2} + \ldots + f^{\text{max retries}}\right) \\
&\quad \text{f = failure rate on the link}
\end{aligned}
```

With naive retries and a 50% failure rate, the load on the callee nearly doubles. That can push a
recovering Node back into overload, and the overload continues after the original trigger is gone.
This is a [metastable failure](/glossary/metastable-failure). Backoff with jitter spreads
retries out, and a circuit breaker stops them completely
([Incidents: retry storm](/design/11-incidents#retry-storm)).

## Connections

Some Nodes have a connection limit. Postgres starts one process per connection, so its limit is low
(100 by default); MySQL gives each connection a thread and holds 500
([Data tier](/design/07-data-tier#variants)).

```latex
\text{connections needed} \left(\text{db}\right) = \sum_{\text{upstream processes}} \text{pool size}
```

Every app process holds its own pool. Ten app servers with four processes each and a pool of 10
need 400 connections. When the need exceeds the limit, the excess requests fail as `refused`, and
adding app servers makes it worse. A **Connection Pooler** fixes it
([Components](/design/07-data-tier#connection-pooler)).

## Apdex and revenue

Each kind has a target `T`. A served request is:

| Class      | Condition        | Revenue share |
| ---------- | ---------------- | ------------- |
| Satisfied  | latency ≤ T      | 100%          |
| Tolerating | T < latency ≤ 4T | 50%           |
| Frustrated | latency > 4T     | 0%            |
| Failed     | any error        | 0%            |

```latex
\begin{aligned}
\text{Apdex} &= \frac{\text{satisfied} + \text{tolerating} / 2}{\text{total}} \\
\text{revenue} &= \sum_{\text{kinds}} \text{value} \left(\text{kind}\right) \times \left(\text{satisfied} + \text{tolerating} / 2\right) \times \text{multipliers}
\end{aligned}
```

This is the real [Apdex](/glossary/apdex) formula. It ties money to latency in a way players
can read: slow pages earn half, and very slow pages earn nothing.

`job` and `upload` use their completion window instead of the acknowledgement when a Queue runs them,
with T measured in seconds. `hook` and `push` have no completion window, so they are scored on their
synchronous latency like every other kind.

## Users and growth

Users grow along an S-curve toward the market size, and only while the design keeps users happy.
From the Series C Era, each region counts its own Users and applies the formula on its own figures:

```latex
\begin{aligned}
h \left(r\right) &= \operatorname{clamp}\left(\left(A \left(r\right) - A\ \text{target}\right) / \left(1 - A\ \text{target}\right),\  1{,}\ 1\right) \\
&\quad \text{A(r) = Apdex of region r's users over the last calendar hour} \\
\text{talk} \left(r\right) &= \text{Users} \left(r\right) + m \times \left(\text{Users} - \text{Users} \left(r\right)\right) \\
&\quad \text{word of mouth: own users plus users elsewhere} \\
\text{growth} \left(r\right) &= g \times \text{funding mult} \times \text{talk} \left(r\right) \times \left(1 - \text{Users} \left(r\right) / \text{Market} \left(r\right)\right) \\ &\quad \times h \left(r\right) \\
&\quad \text{when h(r) $\geq$ 0} \\
\text{churn} \left(r\right) &= c \times \left(\text{Fickle} \left(r\right) + s \times \text{Steady} \left(r\right)\right) \times h \left(r\right) && \qquad \text{when h(r) < 0} \\
\text{Users} &= \sum_{\text{regions}} \text{Users} \left(r\right)
\end{aligned}
```

- Before the Series C Era there is one region, North America, and the formula is the same as one
  global count.
- **Fickle and steady users.** A share `f` of new users is fickle, and the rest are steady. Fickle
  users leave at the full rate `c`, and steady users at `s × c`. Under a bad Apdex the fickle users
  leave first, so the users who stay are steadier, and the next bad spell costs less. This is the
  sorting that Fader and Hardie (2007) found in real retention data: the retention rate rises with
  tenure because the least loyal customers leave first.
- **Word of mouth crosses borders.** A region grows from its own users and, at weight `m`, from the
  users in every other region. A region with few users still grows from the Company's users
  elsewhere, so a region that lost its users can recover once the player serves it well
  (Putsis et al. 1997; Takada and Jain 1991).
- `A_r` counts the requests that region r's users send, wherever the Design serves them. A Europe
  user whose read crosses the ocean to a North America App Server counts in Europe's Apdex.
- `A_target` is 0.85 in the Garage Era and rises to 0.94 in the Public Era. It is the same for every
  region.
- `Market` is the Era's market size, multiplied by features, regions, and Venture rules
  ([Progression](/design/10-progression#eras)). It never exceeds the online population (about 6 billion).
  `Market_r` is `Market × share_r`, with the region shares in
  [Zones and regions](/design/05-components#zones-and-regions).
- `funding_mult` is 1.0 in the Garage Era and in an Era that began with a raised round, and 0.7 in an
  Era that began with a declined round ([Economy](/design/09-economy#funding)). Money buys growth, so a declined round is
  slower and keeps Equity.
- Churn has no logistic term. Unhappy users leave fast, which is the main pressure in the game.
- The Milestone, the HUD, Valuation, and the Rule of 40 read the total `Users`.

### Going global

When the Series C Era starts, every existing user stays in North America: they are the users who
found the Company at home. Each other region starts with a seed of
`seed_share × Users × share_r / share_na` users and grows from there. Demand from a far region
starts small and rises as that region's users grow. The player sees the far regions' Apdex before
those regions carry much of the user count.

A far region whose Apdex is under target loses only its own users. A Region outage makes the users
of the failed region leave, and users in other regions stay while their requests still succeed.

Constants `g`, `c`, `f`, `s`, `m`, and `seed_share` are in
[Balancing](/design/16-balancing#user-growth). The player
reads the cause of each region's churn in the
[Churn breakdown](/design/12-observability#the-churn-breakdown).

## The bottleneck

The bottleneck marker shows the one Node that costs the most revenue right now:

```latex
\text{lost revenue} \left(\text{node}\right) = \text{revenue if this Node had infinite capacity} - \text{current revenue}
```

The Simulation estimates this by re-solving the flow with the Node's capacity doubled, for the top
three candidates by utilization. The Node with the largest gain gets the marker. This is a sensitivity
analysis, and it is cheaper than it sounds because only three extra solves run, once per second.

The marker is a learning aid, and research "Distributed tracing" refines it to show the bottleneck per
request kind ([Observability](/design/12-observability)).

## Particles

Particles on the board sample the flow visually and do not represent individual requests. Each link
shows at most 9 particles at once, colored by kind, with a density proportional to the log of the rate and to
the link's length. A failed request shows as a particle that turns red and fades. Particle math never
feeds the Ledger.

## Determinism and randomness

- All randomness comes from one seeded generator in the save.
- Randomness is used for incident timing and target selection, spot interruptions, and particle
  jitter. Everything else is deterministic.
- The same save, the same seed, and the same sequence of actions at the same steps produce the same
  Ledger. A test covers this property.
- **Exact math only.** ECMAScript defines `+ − × ÷`, `Math.sqrt`, `floor`, `ceil`, `round`, `min`,
  `max`, and `abs` as exact IEEE 754 operations. It leaves `sin`, `cos`, `exp`, `log`, and `pow` to
  the engine, and engines differ by 1 to 4 ulp ([Reality check](/design/reality-check#determinism)).
  The Simulation never calls them. The diurnal curve is a cosine series (`cosTurns` in `solve.ts`)
  built from those exact operations only, and it agrees with `Math.cos` to within 1e-12. Percentile
  factors such as `ln(1 / (1 − q))` are constants. A square root is `Math.sqrt`, never `** 0.5`.
- A cross-engine check replays one fixed save for 10,000 steps, and every Challenge's reference
  solution, in Chromium, Firefox, WebKit, and the API Worker runtime, and the hashes must match
  Node's. The server score of a Challenge is the
  authoritative one ([Challenges](/design/14-challenges#rules)).

## The clock stops

The Simulation runs only while the player has the Company open and the clock running. Closing the
page or pausing stops it. No Step runs, so revenue, Burn, user growth, queues, Incidents, Studies,
and the calendar all hold still. Opening the Company again resumes at the saved Step, with the same
Ledger inputs and the same queues.

This is a design rule, not a saving detail. A Company that runs while the player is away turns the
game into a second job and punishes leaving. Factorio's single-player factory waits when the player
quits, and so does Quorum. The player returns to the problem they left, not to a report about it
([ADR 0022](https://github.com/elianiva/quorum/blob/main/docs/adr/0022-the-company-pauses-when-the-player-leaves.md)).

## Performance budget

| Item                | Budget                           |
| ------------------- | -------------------------------- |
| One step, 200 Nodes | Under 2 ms on a mid-range laptop |
| Bottleneck analysis | Under 3 ms, once per second      |

The Simulation is a pure function of the save and the step. It lives in the
`packages/simulation` workspace package ([ADR 0004](https://github.com/elianiva/quorum/blob/main/docs/adr/0004-simulation-package.md)), imports only
`effect`, and has no access to the UI.
