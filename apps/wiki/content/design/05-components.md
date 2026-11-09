---
title: 5. Components
summary: Every placeable Component, its real product, its stats, and its options.
section: design
order: 5
---

A **Component** is an entry in the catalog. A **Node** is one placed copy of it. This page lists every
Component with the real product it stands for, its stats, and its options. Database and cache details
are in [Data tier](/design/07-data-tier). Runtime details for App Servers are in
[Runtimes](/design/06-runtimes).

## Rules for all Components

- **Place.** Placing a Node costs Cash. Each further copy of the same Component costs 25% more than
  the previous copy ([Balancing](/design/16-balancing#prices)).
- **Burn.** Each Node burns Cash every second while it exists, even while it is down. A Serverless
  Function and an Edge Function are the exception: they have no box, so they bill nothing while they
  idle and each use on the Requests line ([Economy](/design/09-economy#the-cloud-bill)).
- **Resize.** Most Components have sizes. A size step doubles resources and doubles Burn. A resize
  restarts the Node, so it is briefly down unless a redundant Node carries the load. Real cloud
  prices scale linearly with size, so a bigger box earns no discount. What it saves is a network hop,
  a load balancer, and per-process overhead ([Balancing](/design/16-balancing#vertical-and-horizontal)).
- **Sell.** Removing a Node refunds 50% of its placement cost and stops its Burn. Reserved Nodes keep
  burning until their term ends ([Economy](/design/09-economy#pricing-models)).
- **Options.** A Tradeoff card presents each option. An option belongs to the choice, not to the
  Component, so several Components share the same card ([Interface](/design/15-ui-ux#tradeoff-cards)).
- **Variants.** Some Components have product variants, such as RabbitMQ or Kafka for the Queue. A
  variant is a sidegrade: it changes the profile, not the tier.

## Catalog overview

The dock has seven groups: Edge, Compute, Data, Messaging, Platform, Observability and Managed. Four
of them have members that are not obvious from the name:

- **Messaging:** Queue, Event Stream, CDC Connector, Realtime Hub.
- **Platform:** Autoscaler, CI/CD Pipeline, Service Mesh, Feature Flags, Secrets and Certificates.
- **Observability:** Analytics, Payments.
- **Managed:** Auth Provider, Payment Provider, LLM API, Push Provider.

The number keys follow the visible groups. A Component's badge takes the colour and shape of the
family it belongs to: Edge, Compute, Data or Ops.

| Group         | Component                                                   | Code   | Unlocked by              | Era      |
| ------------- | ----------------------------------------------------------- | ------ | ------------------------ | -------- |
| Edge          | [Users](#users)                                             | `www`  | Starter                  | Garage   |
| Edge          | [DNS](#dns)                                                 | `dns`  | DNS round robin          | Garage   |
| Edge          | [Load Balancer](#load-balancer)                             | `lb`   | Load balancing           | Garage   |
| Edge          | [CDN](#cdn)                                                 | `cdn`  | Content delivery         | Seed     |
| Edge          | [WAF](#waf)                                                 | `waf`  | Web application firewall | Seed     |
| Edge          | [API Gateway](#api-gateway)                                 | `gw`   | API gateway              | Series A |
| Compute       | [App Server](#app-server)                                   | `app`  | Starter                  | Garage   |
| Compute       | [Worker](#worker)                                           | `wrk`  | Background jobs          | Seed     |
| Compute       | [Serverless Function](#serverless-function)                 | `fn`   | Serverless               | Series A |
| Compute       | [Kubernetes Cluster](#kubernetes-cluster)                   | `k8s`  | Container orchestration  | Series A |
| Compute       | [GPU Node](#gpu-node)                                       | `gpu`  | Model serving            | Series B |
| Compute       | [Edge Function](#edge-function)                             | `edge` | Edge compute             | Series C |
| Data          | [Database](/design/07-data-tier#relational-database)        | `sql`  | Starter                  | Garage   |
| Data          | [Connection Pooler](/design/07-data-tier#connection-pooler) | `pool` | Connection pooling       | Pre-seed |
| Data          | [Cache](/design/07-data-tier#cache)                         | `kv`   | Caching                  | Pre-seed |
| Data          | [Read Replica](/design/07-data-tier#read-replica)           | `rep`  | Read replicas            | Pre-seed |
| Data          | [Search Engine](/design/07-data-tier#search-engine)         | `fts`  | Full-text search         | Seed     |
| Data          | [Object Storage](/design/07-data-tier#object-storage)       | `s3`   | Object storage           | Seed     |
| Data          | [Document Store](/design/07-data-tier#document-store)       | `doc`  | Document databases       | Series A |
| Data          | [Data Warehouse](/design/07-data-tier#data-warehouse)       | `olap` | Data warehousing         | Series B |
| Data          | [Vector Index](/design/07-data-tier#vector-index)           | `vec`  | Embeddings               | Series B |
| Data          | [Wide-column Store](/design/07-data-tier#wide-column-store) | `wide` | Leaderless replication   | Series C |
| Data          | [Distributed SQL](/design/07-data-tier#distributed-sql)     | `dsql` | Consensus databases      | Series C |
| Messaging     | [Queue](#queue)                                             | `mq`   | Message queues           | Seed     |
| Messaging     | [Realtime Hub](#realtime-hub)                               | `ws`   | WebSockets               | Series A |
| Messaging     | [Event Stream](#event-stream)                               | `log`  | Event streaming          | Series B |
| Messaging     | [CDC Connector](#cdc-connector)                             | `cdc`  | Change data capture      | Series B |
| Platform      | [Autoscaler](#autoscaler)                                   | `hpa`  | Autoscaling              | Series A |
| Platform      | [Service Mesh](#service-mesh)                               | `mesh` | Service mesh             | Series B |
| Platform      | [CI/CD Pipeline](#cicd-pipeline)                            | `ci`   | Continuous delivery      | Pre-seed |
| Platform      | [Feature Flags](#feature-flags)                             | `ff`   | Feature flags            | Seed     |
| Platform      | [Secrets and Certificates](#secrets-and-certificates)       | `pki`  | Certificate automation   | Seed     |
| Observability | [Analytics](#analytics)                                     | `otel` | Starter                  | Garage   |
| Observability | [Payments](#payments)                                       | `pay`  | Starter                  | Garage   |
| Managed       | [Payment Provider](#payment-provider)                       | `psp`  | Checkout                 | Series A |
| Managed       | [Auth Provider](#auth-provider)                             | `idp`  | Managed identity         | Pre-seed |
| Managed       | [LLM API](#llm-api)                                         | `llm`  | Hosted models            | Series B |
| Managed       | [Push Provider](#push-and-email-provider)                   | `msgp` | Notifications            | Series C |

## Stats

| Component                | Place ($) | Burn at base ($/s)        | Capacity at base                            | Base latency           | Sizes |
| ------------------------ | --------- | ------------------------- | ------------------------------------------- | ---------------------- | ----- |
| Users                    |           |                           |                                             | 30 ms                  |       |
| DNS                      | 20        | 0.01                      | Unlimited                                   | 0 ms (cached)          |       |
| Load Balancer            | 120       | 0.08                      | 2,000 rps (L7), 20,000 rps (L4)             | 1 ms (L7), 0.2 ms (L4) | 6     |
| CDN                      | 220       | 0.05 + egress             | Unlimited                                   | 8 ms at edge           |       |
| WAF                      | 260       | 0.10                      | 5,000 rps                                   | 2 ms                   | 6     |
| API Gateway              | 300       | 0.002 per request         | 10,000 rps                                  | 6 ms                   |       |
| App Server               | 60        | Instance price            | Runtime model                               | 2 ms                   | 9     |
| Worker                   | 60        | Instance price            | Runtime model                               |                        | 9     |
| Serverless Function      | 0         | Per request + GB-s        | 1,000 concurrent                            | Cold start             |       |
| Kubernetes Cluster       | 500       | 0.10 control plane        | Holds services                              |                        |       |
| GPU Node                 | 900       | 0.53 (T4) to 3.30 (H100)  | Tokens per second                           | Model-based            | 8     |
| Edge Function            | 0         | Per request               | Unlimited                                   | 5 ms                   |       |
| Database                 | 90        | Instance price            | CPU and connections                         | 2.5 ms                 | 9     |
| Connection Pooler        | 80        | 0.03                      | 10,000 client connections                   | 0.3 ms                 | 4     |
| Cache                    | 150       | 0.06                      | 50,000 ops/s per core                       | 0.5 ms                 | 8     |
| Read Replica             | 160       | As Database               | As Database (reads only)                    | 2.5 ms                 | 9     |
| Search Engine            | 300       | 0.25                      | 400 queries/s per node                      | 15 ms                  | 8     |
| Object Storage           | 280       | 0.01 + $0.000032 per GB   | Unlimited                                   | 40 ms first byte       |       |
| Document Store           | 260       | 0.20                      | 3,000 ops/s                                 | 3 ms                   | 8     |
| Data Warehouse           | 800       | 0.05 + $0.02 per scan     | Scan throughput                             | 1,500 ms               |       |
| Vector Index             | 400       | 0.30                      | 500 queries/s                               | 20 ms                  | 6     |
| Wide-column Store        | 1,200     | 0.40 per node             | 30,000 replica ops/s (10,000 writes at N=3) | 3 ms                   | 6     |
| Distributed SQL          | 2,500     | 0.65 per node             | 2,000 tx/s per node                         | Quorum-based           | 6     |
| Queue                    | 360       | 0.10                      | 20,000 msg/s per node                       | 2 ms enqueue           | 6     |
| Realtime Hub             | 400       | 0.15                      | Connections by runtime                      | 1 ms                   | 8     |
| Event Stream             | 900       | 0.30                      | 100,000 msg/s per broker                    | 5 ms                   | 6     |
| CDC Connector            | 300       | 0.05                      | 20,000 changes/s                            | Lag-based              |       |
| Autoscaler               | 200       | 0                         |                                             |                        |       |
| Service Mesh             | 600       | Sidecar overhead          |                                             | +1 ms per hop          |       |
| CI/CD Pipeline           | 100       | 0.02                      |                                             | 1 ms                   |       |
| Feature Flags            | 150       | 0.01                      |                                             |                        |       |
| Secrets and Certificates | 80        | 0.005                     |                                             |                        |       |
| Analytics                | 40        | 0.05 + storage            | Samples per second                          |                        | 8     |
| Payments                 |           |                           | Drawer size                                 |                        | 6     |
| Payment Provider         | 0         | 2.9% + $0.30 per checkout | 1,000 tx/s                                  | 400 ms                 | 8     |
| Auth Provider            | 0         | Per monthly user          | Unlimited                                   | 120 ms                 |       |
| LLM API                  | 0         | Per token                 | 100 prompts/s per tier                      | 600 ms first token     | 8     |
| Push Provider            | 0         | Per message               | 10,000 msg/s                                | Async                  |       |

## Edge

### Users

The source of all traffic. Fixed, and the player cannot place or sell it.

- Users take **one** outbound link in the Garage Era, because a domain name resolves to one host. A
  **DNS** Node lifts this limit.
- In the Series C Era, Users split into regional sources (North America, Europe, Asia-Pacific, South
  America), each with its own user count, market share, and peak hour
  ([Zones and regions](#zones-and-regions)).

### DNS

Real products: Route 53, Cloudflare DNS.

DNS turns one link into many. It is the first fix when one box is not enough.

| Option                    | Effect                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Round robin               | Splits traffic evenly across up to 8 targets. No health checks: a dead target keeps its share until the TTL expires, and those requests fail. |
| TTL                       | 30 s, 300 s, or 3,600 s. A short TTL fails over faster and costs more queries. A long TTL is cheap and keeps sending users to a dead host.    |
| Health-checked (research) | Removes dead targets after the TTL.                                                                                                           |
| GeoDNS (Series C)         | Routes each region's users to the nearest target.                                                                                             |

Teaches: DNS is a slow, coarse load balancer. Real clients cache answers.

### Load Balancer

Real products: NGINX, HAProxy, Envoy, AWS ALB and NLB.

| Variant | Profile                                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L7      | Understands HTTP. Routes by path and kind, terminates TLS, retries failed requests. Lower capacity and 1 ms latency.                                           |
| L4      | Forwards TCP. Ten times the capacity, 0.2 ms latency, and cheaper. Cannot route by kind, cannot retry, and treats a long-lived connection as one unit of load. |

| Algorithm            | Behavior                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Round robin          | Equal shares. Good when targets are identical. Bad when one target is slower: it gets the same share and its queue grows.                                                                          |
| Weighted by capacity | Shares proportional to capacity. The default. Needs a reasonably fresh view of capacity.                                                                                                           |
| Least connections    | Sends to the target with the fewest in-flight requests. Adapts to slow targets. Best with mixed instance sizes.                                                                                    |
| Power of two choices | Picks two targets at random and sends to the less loaded one. Nearly as good as least connections, with no global state. Research "Load balancing algorithms".                                     |
| Consistent hash      | Places each key on a ring of the targets: every target takes an equal share of the keys whatever its load, and a target that leaves moves only its own keys. Research "Load balancing algorithms". |

| Option                | Effect                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health check interval | 2 s, 10 s, or 30 s. Short intervals detect failures fast and cost a little CPU on targets. Long intervals keep routing to a dead Node.                                                            |
| Health check depth    | Shallow (process alive) or deep (checks the database too). Deep checks catch more failures, and they take every app server out of rotation when the database is slow, which causes a full outage. |
| Retries               | L7 only. See [retries](/design/04-simulation#retries).                                                                                                                                            |
| Sticky sessions       | Keeps a user on one target. Helps in-process caches and realtime. Unbalances load and loses sessions when a target dies.                                                                          |

Teaches: load balancing is a policy choice, and health checks can cause outages as well as prevent them.

L7 is the default: 2,000 requests a second at size 1, with a 1 ms hop. It is the only variant that can
carry a chosen set of kinds on a Link, and the only one that can retry. L4 carries 20,000 at size 1 in
a 0.2 ms hop for 0.6× the Burn. It sends every kind whatever a Link asks for and never retries, even
with Timeouts and retries. It counts a realtime message as one message. L4 is unlocked by research
`l4-lb` ([Progression](/design/10-progression#track-infrastructure)).

Sticky sessions are a switch on the card. With it on, 40% of the Load Balancer's traffic belongs to
users already pinned to a target, whatever the algorithm would send now. The other 60% follows the
algorithm. Pinned users do not move when a copy is added, so the oldest target holds the most: each
later target holds 0.8× the pinned users of the one before. An App Server behind a sticky Load
Balancer answers 15% of its `q-read` calls from its own memory. A restarted Realtime Hub behind one
takes half the reconnect wave it would take otherwise, because its own clients return to it. A target
that dies keeps its pinned share until the Load Balancer notices, and those users lose their
session.

### CDN

Real products: Cloudflare, Fastly, CloudFront, Akamai.

A CDN answers cacheable requests at the edge, near the user. It also cuts egress cost, because
egress from a CDN is cheaper than egress from the origin ([Economy](/design/09-economy#egress)).

| Kind    | Base hit ratio           | Notes                                                                   |
| ------- | ------------------------ | ----------------------------------------------------------------------- |
| `page`  | 70% of anonymous traffic | Logged-in pages are not cacheable unless research "Edge-side includes". |
| `media` | 75%                      | Raised to 92% by "Tiered caching".                                      |
| `read`  | 0%                       | 30% with Edge compute ([Edge Function](#edge-function)).                |

| Option          | Effect                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TTL             | Longer TTL, higher hit ratio, staler content.                                                                                               |
| Purge on deploy | Clears the cache. The origin takes a burst of misses: a small [stampede](/glossary/cache-stampede).                                         |
| Cache key       | Including query strings or cookies lowers the hit ratio. Ignoring them can serve one user's page to another, which is a data leak incident. |

Purge on deploy is a switch on the card. With it on, a deploy empties the CDN and it refills from the
origin as it warms, so the origin takes the misses. With it off, the edge keeps serving the last
deploy's pages, and 30% of `page` answers are stale until the TTL passes.

The cache key is Path, query and cookies (the default), Path and query, or Path only. A smaller key
multiplies the hit ratio by 1.1× or 1.2×. With Edge-side includes a logged-in page is cached, so a
key that leaves out the cookie can serve one user's page to another. That is the Cached page leak
incident (weight 1 for Path and query, 2.5 for Path only), and it drives 5% of the Users away at
once. The research adds 20 points to the `page` base (70% to 90%), because the edge assembles the
personal parts of a logged-in page around a cached shell.

The TTL multiplies the hit ratio:

| TTL    | Hit-ratio factor |
| ------ | ---------------- |
| 60 s   | 0.8×             |
| 300 s  | 1× (default)     |
| 1 hour | 1.2×             |

### WAF

Real products: Cloudflare WAF, AWS WAF, ModSecurity with the OWASP Core Rule Set.

A WAF blocks bots and attacks before they reach the app.

| Option           | Bot block rate | False positive rate on real users | CPU per request |
| ---------------- | -------------- | --------------------------------- | --------------- |
| Paranoia level 1 | 60%            | 0.1%                              | Low             |
| Paranoia level 2 | 80%            | 0.5%                              | Medium          |
| Paranoia level 3 | 92%            | 2%                                | High            |
| Paranoia level 4 | 98%            | 6%                                | Very high       |

The OWASP Core Rule Set uses real paranoia levels with this tradeoff. Blocked real users fail as
`blocked`. Research "Bot management" challenges a suspicious client instead of blocking it outright:
the block rate stays and the false-positive rate halves.

Under attack mode is a switch on the card. While it is on, it replaces the paranoia level: the Node
challenges every request at paranoia level 1's CPU cost, blocks 99% of bots and 1% of real users, and
adds 40 ms. Turn it off and the paranoia level applies again.

Rules cost CPU. The Regex backtracking incident makes one rule consume all CPU on every WAF Node,
which takes the edge down ([Incidents](/design/11-incidents#catalog)).

### API Gateway

Real products: Kong, AWS API Gateway, Apigee.

Routes requests to services by path, checks authentication, and applies rate limits. It takes every
request kind and sends on what it lets through, adding its own hop. It is one front door with no
route table, so every kind goes on the same Links.

| Option             | Effect                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate limit         | A cap in requests per second. Rejected requests fail as `throttled` and cost no downstream capacity. Protects against bursts and abusive clients.                                                                                                 |
| Auth at the edge   | Validates tokens once, so services skip it. Adds 2 ms to the Gateway's hop, and takes 0.02 ms of CPU off each authenticated request a service answers.                                                                                            |
| Request coalescing | Merges identical in-flight reads: 30% of `page`, `read`, `feed` and `search` ask for popular objects, and λw / (1 + λw) of them find an identical read in flight (w = 50 ms). The busier the Gateway, the more it merges, so spikes send less on. |

The cap is one limit for the whole Node. The game counts requests per second at the gateway, not per
user or per API key, and a limit of 0 lets everything through. Research "Rate limiting" makes it a
token bucket: the limit refills every Step and the bucket holds 200 more requests, so a burst that
fits passes whole while the average holds. The bucket is one per Node because the game has no clients
to count. Past the gateway's own 10,000 requests per second it drops requests like any other
flat-capacity Component.

Cost is per request, so the gateway is cheap at low volume and expensive at high volume. It is the
one per-request line on the cloud bill ([Economy](/design/09-economy#the-cloud-bill)).

## Compute

### App Server

Real product: a virtual machine running your code.

The App Server is the center of the game. Its capacity depends on its instance type, its runtime, its
runtime variant, and its framework. [Runtimes and frameworks](/design/06-runtimes) defines all four.

| Instance family | vCPU : RAM    | Price per vCPU | Best for                                                                           |
| --------------- | ------------- | -------------- | ---------------------------------------------------------------------------------- |
| General         | 1 : 4 GB      | 1.0×           | Mixed workloads                                                                    |
| Compute         | 1 : 2 GB      | 0.85×          | CPU-bound runtimes and kinds: Go, Rust, Java, `login`, `upload`                    |
| Memory          | 1 : 8 GB      | 1.3×           | Memory-bound runtimes: many PHP-FPM or Ruby workers, the JVM                       |
| Burstable       | 1 : 2 GB      | 0.4×           | Garage. Earns CPU credits while idle and is throttled to 20% when credits run out. |
| ARM             | Same as above | 0.8×           | 20% cheaper. Some runtimes and libraries are slower or need work to port.          |

Sizes go from `nano` (0.5 vCPU) to `metal` (96 vCPU): nine sizes, each step doubling vCPU and RAM, and
`metal` a 1.5× last step.

The ARM family needs research `arm-instances` ([Progression](/design/10-progression#track-infrastructure)).
It runs at 0.95× a General box's CPU speed, so the 20% it saves costs 5% of the capacity. Any sized
Node can take it, not just the App Server.

The App Server answers `page` and `bot` itself and turns other kinds into backend kinds
([Simulation](/design/04-simulation#backend-kinds)).

### Worker

Real products: Sidekiq, Celery, BullMQ, Oban.

A Worker runs the same runtimes as an App Server, but it pulls `task` from a Queue instead of
receiving user requests. Its latency does not count toward user latency. Its throughput decides
how long the queue grows.

| Option   | Effect                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------ |
| Prefetch | Jobs taken from the queue ahead of time. Higher prefetch is faster, and a crash loses more jobs. |

### Serverless Function

Real products: AWS Lambda, Google Cloud Functions, Azure Functions.

Pay per request and per GB-second. Scales from zero to 1,000 concurrent executions with no
placement cost.

A Serverless Function bills per use on the Requests line. It has a concurrency cap per Node (two
functions in one region have 1,000 each), a cold start after idle, and the database connections each
execution opens. The price is Lambda's list price × 1,200, so the cost curve below crosses where the
design puts it ([Economy](/design/09-economy#the-cloud-bill)). No request kind in the game runs as
long as an export takes ([Duration limit](#serverless-function)).

| Tradeoff        | Detail                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cost curve      | Cheap at low and spiky volume. Above about 30% steady utilization of an equal VM, it costs more than the VM.                                                                        |
| Cold starts     | A new execution environment starts cold. Cold start by runtime: Rust and Go 50 ms, Node and Python 200 ms, .NET 500 ms, JVM 2,000 ms (native image 100 ms).                         |
| Concurrency cap | 1,000 per region by default. Spikes above the cap are throttled.                                                                                                                    |
| Connections     | Each concurrent execution opens its own database connections. Without a pooler, a spike exhausts Postgres.                                                                          |
| Duration limit  | 15 minutes. An export (`job`) runs 4 seconds for each GB the Databases hold, so past 225 GB a function cuts it off and it fails as `timeout`. A Worker behind a Queue has no limit. |

### Kubernetes Cluster

Real products: Kubernetes, EKS, GKE.

A cluster holds App Servers and Workers as replicas of services, instead of as separate VMs.

| Benefit                                                      | Cost                                                                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Bin packing: 15% less Burn for the same capacity             | Control plane Burn                                                                                             |
| Rolling deploys and self-healing restarts                    | Platform Dev Hours: 0.5 engineers per cluster, or a Platform team ([Team](/design/08-team-and-velocity#teams)) |
| Fast autoscaling of replicas (30 s instead of 3 min for VMs) | Noisy neighbors: replicas on the same node share CPU                                                           |
| Unlocks the Service Mesh                                     | A cluster upgrade incident every calendar quarter if not maintained                                            |

Teaches: orchestration pays off at a certain size, and it has a real operational cost.

### GPU Node

Real products: vLLM or Triton on NVIDIA T4, A100, and H100.

Serves `infer`. Capacity is measured in tokens per second.

| Option       | Effect                                                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPU type     | T4: cheap, slow. A100: balanced. H100: fastest per dollar, and scarce. Placing an H100 has a waiting list in some calendar months.                                                                                     |
| Batch size   | Larger batches raise throughput and raise time to first token. Continuous batching (research) keeps latency low at high throughput.                                                                                    |
| Quantization | FP16, INT8, INT4. Lower precision is faster and uses less memory, and it lowers answer quality, which lowers `ai` value by 5% (INT8) or 15% (INT4).                                                                    |
| Model size   | Small (3B), medium (7B), large (34B). Larger models earn more per prompt (0.6×, 1×, 1.8×), serve fewer tokens (2×, 1×, 0.25×) and need more GPU memory (6, 14, 68 GB at FP16). A model that does not fit causes `oom`. |

The GPU has a type, a model, a precision and a batch. T4 holds 16 GB per GPU, A100 and H100 80 GB.
The Node needs the model's weights at its precision plus 0.25 GB of attention cache for each prompt in
a batch. A Node whose GPUs hold less fails every prompt as `oom` until a lower precision, a smaller
model, a smaller batch or a bigger GPU fits it. Changing the model reloads the weights, so the Node
comes back cold.

Quantization (`quantization`) adds INT8 and INT4. INT8 serves 2× the tokens and INT4 3×, their weights
take half and a quarter of the memory, and each answer is worth 5% or 15% less. Continuous batching
(`continuous-batching`) adds batch 8 and batch 32, at 1.6× and 2.2× the throughput with the time to
the first token unchanged. Without it a larger batch adds 150 ms or 500 ms to that wait.

### Edge Function

Real products: Cloudflare Workers, Fastly Compute.

Runs small handlers in the CDN, near the user. Starts in under 5 ms because it uses V8 isolates
instead of containers.

- Answers 30% of `read` from an edge key-value cache, and personalizes cached pages.
- Supports JavaScript, TypeScript, and WebAssembly only. Rust and Go can compile to WebAssembly.
- Has a CPU time limit per request. CPU-heavy kinds fail as `timeout`.

The Component has a 5 ms hop in every region and a 10 ms CPU ceiling per request, past which the
request fails as `timeout`. It adds 30% of `read` to a CDN's cache and bills per request on the
Requests line. Its 128 MB isolate ceiling is a cap no response the game sends comes near. The Stack
gate lets only JavaScript and TypeScript, or Rust and Go compiled to WebAssembly, run there.
Personalizing cached pages is the same 30% effect.

## Data

The data tier has its own document: [Data tier](/design/07-data-tier). This table is a summary.

| Component         | Serves                                                       | The tradeoff it teaches                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database          | `q-read`, `q-write`, `q-tx`, small `q-search`, slow `q-scan` | One source of truth with a hard vertical limit, a connection limit, and a volume's IOPS; shards and the Sharded topology scale the writes, retention trades storage for history. |
| Connection Pooler | Database connections                                         | Fewer connections, and some session features stop working; statement mode also breaks transactions.                                                                              |
| Cache             | `q-read`                                                     | Speed against staleness and stampedes; the write strategy trades freshness against write latency.                                                                                |
| Read Replica      | `q-read`                                                     | Read capacity against replication lag.                                                                                                                                           |
| Search Engine     | `q-search`                                                   | Fast search against indexing lag and heap memory; a longer refresh is cheaper and staler.                                                                                        |
| Object Storage    | `blob-get`, `blob-put`                                       | Unlimited storage against egress cost, first-byte latency, the class's retrieval price, and a lifecycle that archives the oldest objects.                                        |
| Document Store    | `q-read`, `q-write`; `q-tx` and `q-scan` at 3× the ops       | Developer velocity against joins and transactions.                                                                                                                               |
| Data Warehouse    | `q-scan`                                                     | Cheap scans against freshness.                                                                                                                                                   |
| Vector Index      | `q-search`, with the lookups an `ai` prompt retrieves from   | Better AI answers against memory and recall.                                                                                                                                     |
| Wide-column Store | `q-read`, `q-write` at very high volume                      | Linear write scaling against partition design and eventual consistency. The game's namesake: quorums.                                                                            |
| Distributed SQL   | `q-tx` across regions                                        | Global consistency against write latency.                                                                                                                                        |

## Async

### Queue

Real products: RabbitMQ, Amazon SQS, Kafka (as a queue).

A Queue accepts work now and lets Workers finish it later. Everything behind a Queue is
asynchronous: the user does not wait for it ([Simulation](/design/04-simulation#latency)).

| Variant  | Profile                                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RabbitMQ | Smart broker. Per-message acknowledgment, routing by key, priorities. 20,000 msg/s per node. Memory grows with backlog, and a large backlog slows the broker.                                             |
| SQS      | Managed. No placement cost, pay per request. Standard queues: nearly unlimited throughput, at-least-once delivery, no strict order. FIFO queues: ordered and deduplicated, with a lower throughput limit. |
| Kafka    | See [Event Stream](#event-stream). A log, not a queue: messages stay after they are read.                                                                                                                 |

| Option             | Effect                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delivery           | At-most-once: fast, loses work on a crash. At-least-once: safe, delivers duplicates, so jobs must be idempotent ([Async patterns](/design/07-data-tier#delivery-semantics)). |
| Visibility timeout | How long a job stays hidden after a Worker takes it. Too short: a slow job runs twice. Too long: a crashed job waits.                                                        |
| Dead-letter queue  | Moves a job aside after its max attempts, set on the Queue. Without one, a poison message blocks the queue forever ([Incidents](/design/11-incidents#catalog)).              |
| Max length         | Rejects new work when full (backpressure) instead of growing without limit.                                                                                                  |

Queue depth is a game stat. A growing depth is the earliest sign that Workers are too slow.

### Realtime Hub

Real products: Phoenix Channels, Socket.IO, Centrifugo, Pusher.

Holds the long-lived connections that `rt` needs and fans messages out to them. Its capacity is
measured in concurrent connections and depends on the runtime: a thread per connection holds about
1 MB of memory, and a BEAM process holds a few KB ([Runtimes](/design/06-runtimes#realtime-connections)).

- **It holds connections.** A realtime message keeps one connection open for 300 s
  ([Simulation](/design/04-simulation#request-kinds)), so a Hub serving `rt` at 100 a second holds
  30,000 connections. Its capacity is those connections: an 8 GB box given to connections, divided
  by the runtime's memory per connection. Each size step doubles the RAM, and a larger Hub needs
  Clustering to use it.
- **It takes `rt` and nothing else, and sends nothing on.** Put it behind the Load Balancer next to
  the App Servers and give its Link only `rt` ([Links](#links)), so each runtime takes the traffic it
  is good at. A runtime that holds a worker per connection still refuses `rt` on the App Server, so a
  PHP or Gunicorn design places a Hub on a runtime that can hold them.
- **Its limit is memory, so the runtime is the upgrade.** Request handling, CPU, and the data tier
  stay on the App Servers. Only `rt` reaches it.

| Option            | Effect                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Presence          | Tracks who is online. Earns 25% more per message (social features) and spends 15% of the box's CPU on each join and leave. |
| Reconnect backoff | Clients reconnect at once after a deploy or crash without jittered backoff: a thundering herd, and half of it is refused.  |
| Clustering        | Several hubs share a pub/sub backbone. Needed above one box: without it the larger sizes add Burn and no room.             |

The per-connection numbers are the runtime table's ([Runtimes](/design/06-runtimes#realtime-connections)),
so the same box holds about 1.6 million BEAM connections, 800,000 Go ones, and 8,000 Java platform
threads. The 8 GB box, the 25% and 15%, and the half a Hub refuses without backoff are the Hub's own numbers.

### Event Stream

Real products: Apache Kafka, Redpanda, Amazon Kinesis.

A partitioned, replicated log. Producers append, consumers read at their own pace.

| Option             | Effect                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Partitions         | Parallelism. A consumer group can use at most one consumer per partition. Order is guaranteed only inside a partition. |
| Partition key      | A key with skewed volume makes a hot partition.                                                                        |
| Replication factor | 1, 2, or 3. Higher is safer and costs more disk and write latency.                                                     |
| `acks`             | `0`, `1`, or `all`. Trades write latency for durability.                                                               |
| Retention          | How long messages stay. Allows replay into a new consumer, such as a new search index, without touching the database.  |

Consumer lag is a game stat. It is the stream's version of queue depth.

The log keeps a message for its retention window, in sim seconds, so a consumer further behind than
the window loses the oldest events. A stream hands on one consumer's 20,000 messages a second per
partition. Round robin with more than one partition loses order, which the game counts as a stale
result. The 20,000, the three windows of 10 hours, 2.5 days and a week, the acknowledgement latencies
and the half-broker Burn a replica adds are the Event Stream's own numbers.

Durability follows the replication factor and `acks`. When a broker fails, it takes the events its
replicas did not have in that failure window:

- **One replica:** it holds the only copy, so the failed broker loses all of the events it held.
- **More replicas with `acks=all`:** the write waited for every replica, so none are lost.
- **`acks=1`:** the write was acknowledged after the leader alone, and 5% of the held events are lost.
- **`acks=0`:** the write did not wait, and 10% of the held events are lost.

The replication factor is chosen on the card. Changing it copies partition data, so the stream
recovers capacity while the copy runs. Partition key skew is the Hot key incident, not a model of the
key's distribution.

### CDC Connector

Real products: Debezium.

Reads the database's write-ahead log and publishes every change to an Event Stream. Feeds the
Search Engine, the Data Warehouse, and caches without dual writes from the app.

- Removes the "dual write" inconsistency risk: writing to the database and the index separately can
  leave them out of sync ([Data tier](/design/07-data-tier#keeping-copies-in-sync)).
- Adds lag. Search results and reports are behind, and a connector that cannot keep up drops changes.

The `cdc` Component is unlocked by Change data capture in Series B. Link a Database into it and it
into an Event Stream. It copies the writes that Database processed, one change each, and publishes
them as `task` at 20,000 changes a second. It takes none of the Database's traffic and adds no latency
to a write, but it reads the Database's write log and adds read IOPS to its volume. Its own hop is 2 ms,
and the lag it adds is the Stream's, which is the game stat its card shows. A Stream's key decides
order, so a change reaches a consumer in order only inside a partition. Past its rate it drops
changes, so the copies it feeds fall behind until the lag clears.

The "dual write" it removes is the publish that can miss a copy. With a CDC Connector, the change comes
from the log, so no answer waits on a repair job; the copies still lag by the connector's processing,
and a dropped change leaves them stale until the connector catches up.

## Platform

### Autoscaler

Real products: Kubernetes HPA, AWS Auto Scaling groups.

Attaches to a group of App Servers or Workers and adds or removes copies.

| Option                       | Effect                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Signal                       | CPU utilization or load (CPU, slots, and memory).                                                                                     |
| Signal: CPU                  | Wrong for runtimes that wait on I/O, because their CPU stays low while workers are full.                                              |
| Signal: request rate         | Reads each copy's requests a second against 100 a vCPU.                                                                               |
| Signal: queue depth          | Reads the tasks waiting in the Queues that feed it against 100 a copy.                                                                |
| Target                       | The utilization to hold, for example 60%. Lower is safer and costs more.                                                              |
| Reaction time                | VMs take 3 minutes to boot and warm. Containers take 30 seconds. A spike that is faster than the reaction time still hurts.           |
| Cooldown                     | Minimum time between scaling actions. Too short causes flapping. Too long reacts late.                                                |
| Min and max                  | The max is a cost guard. Without a max, a bug or an attack scales the bill ([Incidents: runaway bill](/design/11-incidents#catalog)). |
| Scheduled scaling (research) | Adds capacity before the known daily peak: two calendar hours ahead, it sizes for the peak's load.                                    |

JVM warmup interacts with autoscaling: new copies are slow for their first seconds, so a scale-up
under load can make the p99 worse at first ([Runtimes](/design/06-runtimes#runtime-behaviors)).

Every option in the table works. A Node that no Queue feeds reads 0 on the queue-depth signal.

The scheduled scaling research (`scheduled-scaling`, Series B) adds a switch. Inside the two calendar
hours before the Venture's peak hour, the Autoscaler plans for the peak's load (current load × the
peak's share of today's cycle) instead of the load it sees, so the copies it adds are warm when the
peak arrives. Outside that window it scales as usual.

### Service Mesh

Real products: Istio, Linkerd.

Adds a sidecar proxy to every service in a Kubernetes Cluster.

| Gives                                                                | Costs                                             |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| Mutual TLS between services                                          | +1 ms latency per hop                             |
| Retries, timeouts, and circuit breakers on every link                | CPU and memory per sidecar (about 5% per replica) |
| Per-link metrics without code changes (+20% Insight on mesh traffic) | Platform Dev Hours                                |

The `mesh` Component is unlocked by Service mesh in Series B. Link App Servers and Workers into it,
and a sidecar sits beside each one. The Design changes at every Link out of it: those Links retry at
once and open a breaker when half their calls fail, with no research for either, unless the player set
a policy of its own. Each hop costs the design's 1 ms, and each member loses 5% of its CPU. The mesh
bills 5% of each member's Burn as the sidecar's share, and it takes 0.5 engineers of Platform Dev
Hours, or none with a Platform team. A Node it watches also earns the design's 20% more Insight where
Analytics samples it.

The sidecar rides in the pod beside its service. So only an App Server or Worker that runs in a
Kubernetes Cluster can link into a mesh, and one that leaves its Cluster loses its sidecar. Mutual
TLS is a property the card reports. It produces no failure.

### CI/CD Pipeline

Real products: GitHub Actions, GitLab CI, Argo CD.

The `ci` Component is unlocked by research `ci` (Continuous delivery) and has four deploy strategies.
Recreate and Rolling come with the Pipeline. Blue-green needs the `blue-green` research and Canary
needs `canary` ([Progression](/design/10-progression#track-reliability)). The research alone cuts a
deploy from 30 minutes to 5 and lets a bad deploy roll back, and the Pipeline is what picks a
strategy. Without one placed, the Company keeps the default path: a 5-minute deploy with research
`ci`, 30 minutes by hand, and the 40% ceiling on a bad deploy.

The Pipeline decides how code reaches production. It affects how fast features ship and how bad a bad deploy is.
It carries no traffic: nothing links into or out of it.

| Deploy strategy | Deploy time | Bad deploy blast radius                           | Burn              |
| --------------- | ----------- | ------------------------------------------------- | ----------------- |
| Recreate        | 2 min       | 100% until rollback                               | 1× the Pipeline   |
| Rolling         | 5 min       | Grows as the rollout proceeds, to 40%             | 1× the Pipeline   |
| Blue-green      | 7 min       | 10%: the old fleet serves until the new one is up | 2× the Pipeline   |
| Canary          | 10 min      | 5% until promotion                                | 1.5× the Pipeline |

A bad deploy fails 8% of App Server requests for each Feature in its batch; the strategy sets the
ceiling on that share, so Recreate's 100% arrives with a batch of thirteen Features. The ceiling is
100% for Recreate and 5% for Canary, and Rolling keeps its 40%.

Blue-green's ceiling is 10%: the old fleet keeps serving until the new one is up, so the new fleet is
checked on a slice before the switch. A bad deploy breaks 10% of traffic. A deploy never
interrupts traffic, and a rollback returns the Service to its previous version in the deploy time.

Each strategy has a deploy time and a Burn multiple. The multiple is of the Pipeline's own rate and
stands for a second fleet or a canary's metrics.

Build time depends on the language ([Runtimes](/design/06-runtimes#language-profiles)). Deploy frequency
multiplies feature velocity ([Team and velocity](/design/08-team-and-velocity#deploy-frequency)).

### Feature Flags

Real products: LaunchDarkly, Unleash.

Ships features dark and turns them on gradually, in steps of 5%, 25%, 50%, and 100% of users
([Rollout](/design/08-team-and-velocity#rollout)). A feature behind a flag cannot cause a bad-deploy
incident larger than its rollout percentage, and the player can turn it off. The change propagates
to every server in seconds, so the blast radius shrinks as it reaches them. Users who
do not have a feature yet form the holdout group that measures its lift
([Measured lift](/design/08-team-and-velocity#measured-lift)). Flags also
enable graceful degradation: turning off expensive features during an incident
([Incidents](/design/11-incidents#mitigation-toolbox)).

The `ff` Component is unlocked by Feature flags in Seed. It carries no traffic. Each shipped Feature
has a rollout: dark, 5%, 25%, 50%, or every user, and a Feature with none is live for everyone.

A bad deploy fails 8% of App Servers' requests for each Feature its batch shipped, and a flag cuts
that Feature's share to its rollout. So Recreate's 100% ceiling cannot outrun a 5% rollout: thirteen
Features at 5% break 5.2% of traffic instead of everything. The rollout also scales a Feature's
effects and load, through its exposure (its rollout times its adoption), and `ab-testing` measures its
lift against the users it holds out ([Team and velocity](/design/08-team-and-velocity#rollout)).

A flag's Shift moves a live Feature's rollout, including to Off. A Feature turned off still pays its
upkeep. Remove takes the code out for good.

### Secrets and Certificates

Real products: Let's Encrypt with ACME, HashiCorp Vault, AWS Secrets Manager.

Without this Component, TLS certificates expire on the calendar, and the incident "Certificate
expired" takes down every Node that terminates TLS. Let's Encrypt certificates last 90 days, so
automation matters. With this Component, renewal is automatic.

Real lifetimes are shrinking: the industry maximum is 200 days since March 2026 and falls to 47 days
in March 2029, and Let's Encrypt moves to 45 days by 2028. The game follows that trend. Certificates
last 90 calendar days until Series C and 45 calendar days from Series C, so manual renewal gets
harder with each Era.

The `pki` Component is unlocked by Certificate automation and owns the countdown. Each Node that
terminates TLS (Load Balancer, CDN, WAF, API Gateway, Realtime Hub, Edge Function) holds a certificate
of its own. The first Step with a manager live issues one to each of them. Each renews itself two
thirds of the way through its life, which is where an ACME client renews with a third left.

With no manager live, nothing renews them. When one reaches its expiry date, every request through
that Node fails as `down` and the Certificate expired incident starts. It starts again after the
incident ends until a manager is live again or the player presses Renew, which reissues every
certificate. Selling the manager leaves the certificates it issued running down, so the Component owns
the calendar. A Node placed after the manager gets its certificate on the next Step. A Company that
never placed a manager holds none, and the director's own Certificate expired incident fails every
request from Users.

## Observability and money

### Analytics

Real products: an OpenTelemetry collector with a tracing backend.

Analytics is a tap. Link any Node into it, and it samples that Node's traffic. Each sampled request
earns Insight of its request kind. [Observability](/design/12-observability#earning-insight) defines the formula, the
sampling rate tradeoff, retention, and what Analytics reveals.

### Payments

Payments is the drawer where revenue waits until the player collects it. It has a size, and revenue
beyond that size is lost until the player collects or upgrades the drawer. Research "Stripe Billing" collects
automatically ([Economy](/design/09-economy#cash)).

## Managed Components

A **Managed Component** is a third-party service. It costs nothing to place and charges per use. It
has its own outages, which the player cannot fix, only survive.

### Payment Provider

Real products: Stripe, Adyen.

Needed for `buy`. Fee: 2.9% plus $0.30 per successful checkout, which is Stripe's standard US card
price. Latency is 400 ms, and it has outages a few times a calendar year. It has eight size steps,
each doubling its capacity, and a resize costs nothing.

- Retrying a timed-out charge without an **idempotency key** can charge twice. Duplicates fail as
  `duplicate` and cost a refund plus a reputation penalty. Research "Idempotency keys" fixes it.

### Auth Provider

Real products: Auth0, Clerk, Cognito.

Takes `login` off your servers, so your CPU does not pay for password hashing. Priced per monthly
active user. Cheap at first, and at scale it becomes one of the largest lines on the bill. Moving
auth back in-house later is a migration ([Team](/design/08-team-and-velocity#migrations)).

### LLM API

Real products: hosted model APIs.

Serves `infer` without GPUs. Priced per token, and rate limited per prompt: 100 prompts per second at
its first size, doubling at each of its eight size steps. A resize costs nothing, and there is no
placement cost. At high volume a GPU Node is cheaper per token, and it needs operations work. The rate
limit causes `throttled` errors during spikes.

### Push and Email Provider

Real products: Firebase Cloud Messaging, Apple Push Notification service, Amazon SES.

Delivers `push`. Priced per message. Has sending quotas and reputation: sending too many
notifications raises user churn ([Team: features](/design/08-team-and-velocity#features)).

## Links

A link is a network call. Each link has:

| Property        | Default        | Effect                                                                                                         |
| --------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| Latency         | By placement   | See [Zones and regions](#zones-and-regions).                                                                   |
| Timeout         | 30 s           | See [timeouts](/design/04-simulation#capacity-utilization-and-queues).                                         |
| Retry policy    | None           | See [retries](/design/04-simulation#retries).                                                                  |
| Circuit breaker | Off (research) | Opens after the error rate passes a threshold. Fails fast while open, then tests again.                        |
| Bulkhead        | Off (research) | Limits the share of the caller's slots that this link can hold, so one slow dependency cannot use all of them. |
| Hedged requests | Off (research) | Sends a second copy of a slow call after the p95 and keeps the faster answer.                                  |

[Simulation](/design/04-simulation#retries) explains the first three rows. A bulkhead (research
`bulkheads`) caps one call at 1,000 ms: past it the caller gives the call up, frees its slot, and the
request fails as `timeout`. It caps time rather than slots, which at the game's load is the same thing
by Little's law. Hedging (research `hedged-requests`) sends a second copy of every call on that Link.
The user waits for the faster of two, the mean halves, the tail thins, and the callee sees 10% more
calls, which the Link's own rate shows.

Links that cross zones or regions add egress cost ([Economy](/design/09-economy#egress)).

## Zones and regions

From Series A, Nodes have a placement.

| Placement             | Hop latency    | Hop cost          | Failure domain |
| --------------------- | -------------- | ----------------- | -------------- |
| Same box (co-located) | 0 ms           | Free              | Box            |
| Same zone             | 0.5 ms         | Free              | Zone           |
| Cross zone            | 1.5 ms         | $0.01/GB each way | Region         |
| Cross region          | Distance-based | $0.02/GB          | None shared    |

Cross-region latency follows the speed of light in fiber, about 5 µs per km one way, plus routing
overhead. Typical round trips: US East to US West 65 ms, US East to Europe 75 ms, Europe to Asia 160
ms, US East to Sydney 200 ms.

- **Multi-zone** (Series A) protects against a zone outage. It costs cross-zone traffic and
  redundancy. A data Node's standby takes over by itself after a share of the outage; the player's
  **Fail over** promotes it at once ([Mitigation toolbox](/design/11-incidents#mitigation-toolbox)).
  A synchronous standby waits for every write and loses nothing on failover. An asynchronous one
  adds no write latency, and failover loses the writes still in flight (RPO).
- **Multi-region** (Series C) brings latency down for distant users and protects against a region
  outage. It forces a data decision: where does each write go? ([Data tier](/design/07-data-tier#multi-region-data)).
- **Data residency** (Pre-IPO) requires European users' data to stay in Europe.

Each region is a separate board tab, like a planet in Factorio Space Age. Inter-region links connect
them.

| Region        | Share of users | Local 20\:00 on the home clock |
| ------------- | -------------- | ------------------------------ |
| North America | 40%            | 20\:00                         |
| Europe        | 30%            | 14\:00                         |
| Asia-Pacific  | 20%            | 06\:00                         |
| South America | 10%            | 18\:00                         |

The shares set each region's market (`Market_r`). Each region counts its own Users from the Series C
Era ([Simulation](/design/04-simulation#going-global)).

### Mirror a region

With research `infra-as-code`, the player can **Mirror** one region into another. Real teams
describe a region as code, such as Terraform modules or CloudFormation StackSets, and apply the same
code to a new region. Copying the servers is the easy part. The hard part is the data: where each
write goes.

1. On a region tab, the player picks **Mirror from** and a source region. The target region opens if
   it is not open yet, at the usual opening price.
2. The game shows a plan, like `terraform plan`: the Nodes to create, the Cash to place them, the Burn
   they add, and one choice for each data Node.
3. **Apply** pays at once. The plan lands after `mirror_time` when it builds Nodes, plus Terraform's
   refresh. New Nodes arrive cold and warm up as usual. The region's Users Node gets
   its Links only when the plan lands, so GeoDNS never sends users to a Mirror that is still being
   built. A plan with no new Nodes lands at once.

| In the source region                                                | In the Mirror                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edge, compute, and platform Nodes, Caches, and Queues               | A copy with the same Instance type, Stack, copies, and options. Caches start cold and Queues start empty.                                                                                               |
| Relational Database, with its replicas and pooler                   | The player picks one: a **read replica** of the source primary (the default: reads stay local, writes cross to the source), an **own primary** partitioned by region, or **call the source** (no copy). |
| Object Storage                                                      | The player picks one: **replicate** (pays cross-region Egress for each write) or **call the source**.                                                                                                   |
| Wide-column Store, Distributed SQL                                  | Not copied. The Mirror's Links go to the source Node; Spread it from its card to answer locally.                                                                                                        |
| Global and Managed Components                                       | Not copied. The Mirror's Links go to the same Node.                                                                                                                                                     |
| The source region's Users Node                                      | Its Links start from the target region's Users Node. With GeoDNS, the plan routes the region's users there.                                                                                             |
| Links between source Nodes, and from source Nodes to a third region | Copied with their timeout, retry, and circuit breaker settings. Drift counts a Link added or removed, not a change to its settings.                                                                     |

The three database choices are the patterns in [Multi-region data](/design/07-data-tier#multi-region-data),
and each one has the RPO and outage behavior that table gives.

A Mirror costs no Dev Hours, because the research is the work of writing the code. It is not a
Playbook: a Playbook is a part of a Design that survives Exits and uses a slot. A Mirror copies a
whole region inside one Company, stays linked to it, and asks the data question.

### Keeping a Mirror in sync

A Mirror stays linked to its source region. The source is the code; the Mirror is what the code
built. **Drift** is every difference between them, of two kinds:

- **Behind.** A change in the source that the Mirror does not have yet: a Node placed, sold, or
  resized, a Stack or option changed, a Link added or removed.
- **Hand change.** A change made directly on the Mirror's tab.

A Mirror's region tab shows a dot while it drifts. The **Mirror** button beside the region tabs
opens the plan, for example `Europe · Mirror of North America · 3 behind · 1 hand change`. The plan
lists each change. Apply brings the Mirror back to the source, on the same timing as the first Apply.
**Apply reverts every hand change**, and the plan marks those changes in red. A Node placed by hand in
a Mirror's region is not in the code, and Apply leaves it alone.

Some differences between regions are correct, because each region has its own demand. The player
can keep a hand change as an **override** from its row in the plan, like a per-region variable file in
Terraform or stack config in Pulumi. Any setting can be an override. An override is not drift, and
Apply keeps it.

Data Nodes are never applied without the player:

- A new data Node in the source stops the plan until the player picks its pattern.
- A data Node sold in the source stays in the Mirror until the player confirms. Real tools have the
  same guard, such as Terraform's `prevent_destroy`.

**What drift costs.** The Simulation adds no special penalty. The Mirror runs an older Design, and
that has its own cost:

- A new Request kind that the source routes to a new Node is Stranded in a Mirror that does not have
  that Node.
- A resize that the source needed for a Feature's load is missing, so the Mirror saturates at its
  own peak.
- In a Region outage, GeoDNS sends the failed region's users to the nearest live region. If that
  region is a Mirror that is behind, it takes the extra load with the older Design.

The [Churn breakdown](/design/12-observability#the-churn-breakdown) shows the result as a slow or
failed row in the Mirror's region.

### IaC tools

Research `infra-as-code` asks the player to pick an **IaC tool** on a Tradeoff card. All three tools
build every Component and can set any value per region: Terraform with variables, Pulumi with stack
config, and Alchemy with stage values. They differ in how a plan finds hand changes, as in each
tool's documented default workflow. No tool is best.

| Tool      | Language                  | How a plan finds hand changes                                                                                                                                 | Tradeoff                                                                                         |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Terraform | HCL                       | `terraform plan` refreshes live state first, so every plan shows every hand change.                                                                           | Each Apply waits `refresh_time` per managed Node before it changes anything.                     |
| Pulumi    | TypeScript, Python, or Go | `pulumi preview` diffs against the recorded state. **Refresh** (`pulumi refresh`) reads live state, and the plan then shows the hand changes made so far.     | Fast plans. A hand change made after the last Refresh stays through an Apply.                    |
| Alchemy   | TypeScript                | `alchemy plan` diffs against the recorded state. **Check drift** (`alchemy drift`) reads live state, and **Repair** (`drift --repair`) restores hand changes. | Fast plans. Repair restores the last deploy without taking source changes, which wait for Apply. |

- An Apply reverts only the hand changes its plan saw. The rest stay until the next refresh, as in
  the real tools.
- **Follow users** is a computed value any tool can express: each copy's size is the size nearest
  to the source size times the region's share of users over the source's, one size step per
  doubling. The Autoscaler's bounds scale the same way.
- Changing the tool later takes `iac_switch` calendar minutes, during which no Mirror applies or
  syncs.

Reality check: all three tools support many providers and have more ways to detect drift, such as
`terraform plan -refresh-only`, `pulumi up --refresh`, and Pulumi Cloud's scheduled drift detection.
The game uses each tool's default plan behavior and nothing else.

### GitOps

Research `gitops` applies each source change to every Mirror on its own, so a Mirror is never behind
for long. Hand changes revert at the next sync, because a GitOps controller reconciles against live
state with every tool. Overrides are the only way to tune a region.

All at once syncs at the next poll, `sync_poll` calendar minutes after the drift starts, as Argo CD
checks its repository at most every three minutes by default. Reverting hand changes matches Argo CD
with self-heal on. A sync pays for its plan like an Apply, and without the Cash the Mirror stays
behind. A new data Node still waits for the player to pick its pattern, and GitOps never removes a
data Node.

The cost moves from drift to blast radius: a bad change reaches every region. The player picks the
sync mode on a Tradeoff card:

| Sync mode   | Drift                                         | A bad change                                                                  |
| ----------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| All at once | None                                          | Reaches every region together.                                                |
| Staged      | The other Mirrors are behind for `stage_wait` | Reaches one region. The player rolls it back before the other Mirrors get it. |

The Bad config push incident uses this rule ([Incidents](/design/11-incidents#catalog)). It crashes every
App Server and Worker in the first Mirror's source region, or in the region with the most App Servers
when there is no Mirror. With GitOps all at once, it crashes them in every Mirror of that region too.
With Staged, or without GitOps, it stays in one region. Roll back ends it, and the crashed Nodes
restart on the old config. The director can pick it once `infra-as-code` is researched. GitOps works with
every IaC tool.
