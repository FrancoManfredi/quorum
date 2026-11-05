---
title: 11. Incidents and reliability
summary: The incident catalog, the incident loop, SLOs, and error budgets.
section: design
order: 11
---

An **Incident** is an event that stresses the design. Incidents are the game's tests. They check
whether the design survives the real failure modes that its Era makes likely.

## Design rules

1. **Attack the design, not the player.** The incident director prefers incidents that hit a real
   weakness in the current design: a single point of failure, a missing timeout, an unbounded queue.
   A well-built design survives most incidents with no action. This follows the Factorio lesson that
   problems should come from the player's own choices ([Influences](/design/02-influences#factorio)).
2. **Readable in seconds.** Every incident has a visible signal on the board within 5 seconds.
3. **Real.** Every incident type is a real class of outage, and most cite a real event.
4. **Survivable.** No incident ends a company. The worst case is lost users, lost Cash, and a lower
   valuation.
5. **No incidents offline.** The game does not punish the player for leaving
   ([Simulation](/design/04-simulation#offline-progress)).
6. **One at a time, early.** Before Series A, at most one incident runs at a time. Later, cascades are
   possible, because cascades are what real large outages look like. Cascades are not built yet: the
   director starts no incident while one is running.

## The incident director

The director picks the next incident and its time.

```text
time_between_incidents = base_interval(Era) × random(0.6, 1.4)
weight(type)           = weakness(type, design) × (1 + tech_debt)
```

There is no per-type base weight: every incident the Era allows starts from the same weight, before
weakness.

| Era      | Base interval (sim time) | Highest starting severity |
| -------- | ------------------------ | ------------------------- |
| Garage   | None                     | —                         |
| Pre-seed | 12 min                   | SEV2                      |
| Seed     | 10 min                   | SEV2                      |
| Series A | 9 min                    | SEV2                      |
| Series B | 8 min                    | SEV1                      |
| Series C | 8 min                    | SEV1                      |
| Pre-IPO  | 10 min                   | SEV1                      |
| Public   | 10 min                   | SEV1                      |

`weakness(type, design)` is 0.2 to 3.0. For example, "Instance failure" has weakness 3.0 when a
critical path has a single Node and 0.5 when every Node on it has a redundant copy in another zone;
0.2 is only the floor that every possible incident keeps. This makes the director a teacher: it shows
the player their weakest point.

**Severity.** SEV3 affects one Node or one kind. SEV2 affects a service or a zone. SEV1 affects the
whole company or a region. An arrow in the catalog, such as "3→2", means that the incident escalates
once, halfway through, if it has hurt users for more than half its run so far: it steps to the
severity the arrow names, its remaining time is multiplied by 1.5, and a traffic spike's demand by
1.5 too. An incident with no arrow has no second severity. The director never starts an incident above
the Era's highest starting severity.

**Duration.** Incident durations are in calendar time, because the SLO is. One sim second is one
calendar minute. Before Series A, each incident runs for the playtest duration in its catalog entry,
between 30 and 300 sim seconds. From Series A, when the error budget counts, an unmitigated incident
lasts at most its starting severity's calendar duration:

| Starting severity | Sim seconds | Calendar time |
| ----------------- | ----------- | ------------- |
| SEV3              | 5           | 5 minutes     |
| SEV2              | 20          | 20 minutes    |
| SEV1              | 60          | 60 minutes    |

Only failed requests spend the error budget, so a design with spare capacity or redundancy loses
little or nothing.

## The incident loop

```text
SIGNAL ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POSTMORTEM ──► ACTION ITEMS
```

| Metric | Meaning                                         | Shown after   |
| ------ | ----------------------------------------------- | ------------- |
| MTTD   | Mean time to detect: from start to first signal | Not built yet |
| MTTA   | Mean time to acknowledge                        | Not built yet |
| MTTR   | Mean time to restore service                    | Always        |

Not built yet: MTTD, MTTA, and the `on-call` and `anomaly-detection` research. The postmortem records
MTTR, the seconds users were impaired, and nothing measures detection or acknowledgement.

Without research `alerting`, the first signal is the board itself, and users start to leave before
the player knows. With alerting, a pager banner appears when the error rate or p99 crosses a
threshold. With `anomaly-detection`, a warning appears before the incident peaks.

## Catalog

| Incident                     | Era           | Sev | Trigger and weakness                                                                                  | Symptoms on the board                                                      | Mitigation                                 | Prevention                                                                         | Real reference                                                              |
| ---------------------------- | ------------- | --- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Traffic spike                | Pre-seed      | 3→2 | A link on a big news site. Weak: no spare capacity                                                    | Demand ×3 to ×10 for minutes. Every card amber, then red                   | Scale up, shed load, serve cached pages    | Autoscaler, CDN, load shedding                                                     | The "Slashdot effect" and "hug of death"                                    |
| Instance failure             | Pre-seed      | 3→2 | The host under a VM dies. Weak: single Node on a path                                                 | One card goes grey. Stranded requests                                      | Replace the Node                           | Redundancy, health checks                                                          | Cloud providers retire degraded hosts routinely                             |
| Bad deploy                   | Pre-seed      | 3→2 | A deploy ships a bug. Weak: recreate deploys, no tests                                                | Error rate jumps right after a deploy                                      | Roll back                                  | Canary, feature flags, tests                                                       | Knight Capital lost about $440M in 45 minutes after a bad deploy (2012)     |
| Slow query                   | Pre-seed      | 3→2 | A feature added an unindexed query. Weak: large tables                                                | Database CPU climbs with data volume                                       | Add index                                  | Code review, query analysis                                                        | Common                                                                      |
| Connection exhaustion        | Pre-seed      | 2→1 | App servers or functions scaled out. Weak: no pooler                                                  | `refused` errors on the database                                           | Reduce pool size, remove app servers       | Connection Pooler                                                                  | PostgreSQL "too many clients already"                                       |
| Memory leak                  | Pre-seed      | 3→2 | A persistent runtime leaks. Weak: no periodic restarts                                                | RSS climbs over uptime, then `oom` and a cold restart                      | Restart the service                        | `max_requests` restarts, "Fix memory leak" task, PHP-FPM                           | Common in long-running processes                                            |
| Event loop block             | Pre-seed      | 3→2 | A CPU-heavy kind on an event loop                                                                     | p99 rises on every kind on that service                                    | Move the kind to another service           | Worker threads, async crypto                                                       | Node.js "Don't block the event loop" guide                                  |
| Data breach                  | Pre-seed      | 1   | An expired patch ticket is exploited, not the director. Weak: a patch that waits past its deadline    | Users fall 15% at once; the ticket is gone and a Mail arrives              | None: it runs its course                   | Dependency scanning, a Security team                                               | The Equifax breach, 2017                                                    |
| Bot surge                    | Seed          | 3→2 | Scrapers. Weak: no WAF                                                                                | `bot` share rises to 50%                                                   | Block at the edge                          | WAF, rate limits                                                                   | Common                                                                      |
| Credential stuffing          | Seed          | 2→1 | Bots try leaked passwords on `login`. Weak: no limits                                                 | `login` volume ×20, CPU pinned by bcrypt                                   | Rate-limit `login`                         | Credential protection, Auth Provider                                               | Common                                                                      |
| Cache stampede               | Seed          | 2→1 | A hot key expires or the cache restarts                                                               | Database load spikes when cache hit ratio falls                            | Throttle, warm the cache                   | Stampede protection                                                                | Facebook's 2010 outage involved a cache and database feedback loop          |
| Certificate expired          | Seed          | 2→1 | Calendar date. Weak: no automation                                                                    | Every TLS Node fails at once                                               | Renew                                      | Certificate automation                                                             | Many large services have had certificate-expiry outages                     |
| Disk full                    | Seed          | 2→1 | Logs or WAL fill a disk                                                                               | Database writes fail                                                       | Expand the volume                          | Retention, alerts on disk                                                          | Common                                                                      |
| Poison message               | Seed          | 3→2 | A job that always fails. Weak: no dead-letter queue                                                   | Queue depth climbs forever; Workers busy                                   | Delete the message                         | Dead-letter queue, max attempts                                                    | Common                                                                      |
| Regex backtracking           | Series B      | 1   | A WAF rule with catastrophic backtracking                                                             | WAF CPU 100% on every Node                                                 | Disable the rule                           | Canary rule rollouts                                                               | Cloudflare global outage, 2 July 2019                                       |
| DDoS                         | Seed          | 2→1 | An attacker floods the edge                                                                           | Demand ×50 of junk                                                         | Enable "Under attack" mode (challenge all) | WAF, CDN, Anycast                                                                  | Common                                                                      |
| Zone outage                  | Series A      | 2→1 | A zone fails. Weak: single-zone services                                                              | All Nodes in one zone go grey                                              | Fail over                                  | Multi-zone with spare capacity                                                     | Several AWS us-east-1 events                                                |
| Retry storm                  | Series A      | 2→1 | A brief slowdown plus naive retries. See [below](#retry-storm)                                        | Load keeps rising after the trigger ends                                   | Open circuit breakers, shed load           | Backoff with jitter, circuit breakers, retry budgets                               | Metastable failures (HotOS 2021, OSDI 2022)                                 |
| Replication lag              | Series A      | 3→2 | Heavy writes                                                                                          | `stale` errors after writes                                                | Route reads to the primary                 | Read-your-writes routing, sync replica                                             | Common                                                                      |
| Payment provider outage      | Series A      | 2→1 | The provider fails. Weak: one provider                                                                | `buy` fails as `upstream`                                                  | Queue checkouts for later, show a banner   | A second provider, a queue                                                         | Third-party outages are routine                                             |
| Double charge                | Series A      | 2→1 | A timed-out `buy` retried. Weak: no idempotency keys                                                  | `duplicate` errors, refunds                                                | Stop retries on `buy`                      | Idempotency keys                                                                   | Why payment APIs require idempotency keys                                   |
| Forced cluster upgrade       | Series A      | 2→1 | A Cluster left on a version the provider no longer supports. Weak: a Cluster a quarter or more behind | Pods that use removed APIs crash-loop                                      | Upgrade the Cluster                        | Upgrade at least once a quarter, or a Platform team                                | Kubernetes removes deprecated APIs on a schedule                            |
| Spot reclaim                 | Series A      | 3→2 | The provider needs the capacity back. Weak: a spot Node on the request path                           | One Node goes grey after a 10 s warning                                    | Switch it to on-demand                     | Mixed fleets, graceful shutdown                                                    | Spot interruption notices                                                   |
| Thundering herd on reconnect | Not built yet | —   | A Realtime Hub restarts                                                                               | All clients reconnect in one second                                        | Throttle connects                          | Reconnect jitter                                                                   | Common                                                                      |
| JVM warmup under load        | Not built yet | —   | Scaling up Java during a spike                                                                        | New copies make p99 worse for 30 s                                         | Wait, or route less traffic to new copies  | Slow start on the load balancer, scheduled scaling, native image                   | Common                                                                      |
| GC pause storm               | Series A      | 3→2 | Heap above 90% on a GC runtime                                                                        | p99 spikes; p50 normal                                                     | Restart, resize                            | More memory, ZGC, GOGC tuning                                                      | Discord's Go read-states service (2020)                                     |
| Hot key                      | Series C      | 2→1 | One key or tenant gets a huge share                                                                   | One shard or cache node red, others idle                                   | Cache the key locally                      | Key splitting, hybrid fan-out                                                      | Celebrity posts                                                             |
| Report kills the database    | Series B      | 2→1 | `report` runs on the primary                                                                          | Every kind slows down                                                      | Disable reports                            | Data Warehouse                                                                     | Common                                                                      |
| Schema migration lock        | Not built yet | —   | An `ALTER TABLE` on a big table                                                                       | Writes queue and time out                                                  | Cancel the migration                       | Online migrations, expand and contract                                             | Common                                                                      |
| GPU shortage                 | Series B      | 3→2 | No H100 capacity this month                                                                           | GPU Nodes cannot be placed                                                 | Use the LLM API or smaller GPUs            | Reserved GPU capacity                                                              | 2023–2024 GPU supply shortage                                               |
| Supply-chain compromise      | Not built yet | —   | A malicious package version                                                                           | A service exfiltrates data; reputation falls                               | Pin and redeploy                           | Dependency scanning, Deno permissions                                              | event-stream (2018), xz-utils backdoor (2024)                               |
| Runaway bill                 | Not built yet | —   | An autoscaler or function loop with no limit                                                          | Burn ×10 with no extra revenue                                             | Set a max                                  | Autoscaler max, budget alerts                                                      | Many public "surprise cloud bill" reports                                   |
| Accidental delete            | Not built yet | —   | An operator deletes data                                                                              | A table disappears                                                         | Restore from backup                        | PITR, restore drills                                                               | GitLab database deletion incident (2017)                                    |
| Region outage                | Series C      | 1   | A whole region fails                                                                                  | One region board goes grey                                                 | Fail over to another region                | Multi-region                                                                       | Large cloud regions have had multi-hour outages                             |
| Network partition            | Series C      | 1   | Regions lose contact for seconds                                                                      | Split brain on leader-based stores; writes diverge                         | Fence the old leader                       | Consensus stores, careful failover                                                 | GitHub's 43-second partition led to a 24-hour degradation (21 October 2018) |
| DNS or BGP misconfiguration  | Series C      | 1   | A routing change withdraws the company from the internet                                              | Users cannot reach any region                                              | Roll back the change                       | Change review, staged rollouts                                                     | Facebook outage, 4 October 2021                                             |
| Bad config push              | Series C      | 1   | A config update reaches every App Server and Worker at once                                           | They crash together; with GitOps all at once, in every mirrored region too | Roll back                                  | Staged config rollouts, GitOps Staged ([Components](/design/05-components#gitops)) | CrowdStrike update failure, 19 July 2024                                    |
| Operator typo                | Not built yet | —   | A command removes more capacity than intended                                                         | A data Component loses most Nodes                                          | Re-add capacity, restart                   | Safeguards on capacity removal                                                     | Amazon S3 us-east-1 outage, 28 February 2017                                |
| Leap second or clock skew    | Not built yet | —   | Clocks jump                                                                                           | Timeouts and lock errors across a region                                   | Restart affected Nodes                     | Leap smearing                                                                      | The 2012 leap second caused outages at several sites                        |
| Audit finding                | Pre-IPO       | 3→2 | A SOC 2 auditor finds a gap                                                                           | An IPO checklist item resets                                               | Fix within the calendar week               | Security team                                                                      | Compliance work                                                             |
| DR drill                     | Pre-IPO       | 1   | The player runs a drill, not the director: the home region fails for 60 s                             | The home region goes grey; reads and writes must move                      | Fail over, and get errors back under 1%    | `dr-drills`, Multi-region, GeoDNS, and data in both regions                        | The quarterly DR drill                                                      |

## Flagship incidents

### Retry storm

The incident that teaches metastable failure.

1. A trigger: a 20-second slowdown on one data Node.
2. Callers time out and retry at once (naive retries, up to 3).
3. Load on the slow Node rises to nearly 4× while it recovers.
4. The trigger ends, but the Node stays overloaded, because retries keep it full.
5. Timeouts upstream cascade to other services.

The player can stop it by opening circuit breakers, shedding load, or temporarily removing traffic
until queues drain. The lesson is that the stable state of an overloaded system with retries can be
"overloaded" ([Simulation](/design/04-simulation#retries)).

### Cache stampede

1. A cache Node restarts or a hot key expires.
2. Hit ratio falls from 90% to 0%.
3. The database receives 10× its normal reads and saturates.
4. Requests that refill the cache time out, so the cache stays cold.

Mitigation: limit traffic until the cache fills. Prevention: stampede protection and cache warming
([Data tier](/design/07-data-tier#stampedes)).

### Bad deploy

Bad-deploy chance per deploy:

```text
chance = base(Era) × policy_factor × (1 + 2 × tech_debt) × (1 − tests) × (1 − code_review)
```

The blast radius depends on the deploy batch ([Components](/design/05-components#cicd-pipeline)): a bad
deploy fails 8% of App Server requests for each Feature in the batch it shipped. The ceiling on that
share is the CI/CD Pipeline's deploy strategy: 40% without a Pipeline and on Rolling, 100% on
Recreate, 10% on Blue-green and 5% on Canary. A rolling Cluster deploy stops after its first batch
of pods, so pods there take a quarter of that. Per-Feature rollouts are not built yet.

## Mitigation toolbox

Actions the player can take during an incident. Most need research.

| Action               | Effect                                                        | Research           |
| -------------------- | ------------------------------------------------------------- | ------------------ |
| Roll back            | Returns a service to its previous version in deploy time      | `ci`               |
| Scale up now         | Adds copies of a Node, with boot and warmup delay             | —                  |
| Shed load            | Rejects a share of the lowest-value kinds at the edge         | `load-shedding`    |
| Turn off a feature   | Removes the feature's load and value                          | `feature-flags`    |
| Under attack mode    | Challenges every request at the WAF: +latency, blocks bots    | `waf`              |
| Fail over            | Promotes a replica or moves traffic to another zone or region | `multi-az`         |
| Open circuit breaker | Stops calls to a failing dependency                           | `circuit-breakers` |
| Drain a Node         | Stops new traffic to a Node and lets it finish                | Not built yet      |
| Static fallback      | Serves cached pages for `page` and errors for others          | `cdn`              |

There is no drain action in the build yet: a Node is restarted or sold, and there is no
`health-checks` way to take it out of rotation first.

## Runbooks

Not built yet: runbooks and automatic responses. The build has no `runbooks` research, so every
incident is handled by hand.

With research `runbooks` and an SRE team, each "Write a runbook" task turns one incident type into an
automatic response. The response runs when the incident starts, with no player action. This is
automation as a reward ([pillar 5](/design/01-vision#pillar-5-respect-the-player)): the player must have
handled the incident by hand at least once before writing its runbook.

## Postmortems

When an incident resolves, a postmortem card appears. It names the incident, the timeline, and the
cost (users lost, revenue lost). It is blameless, like the practice it models.

A postmortem pays no Insight. A flat reward made incidents a source of income, so a weak design that
failed often researched faster than a strong one. Instead, the postmortem opens one **action item**: the
first research in the incident's prevention list that the player does not own and can study now.
The card can put its Study first in the queue. Filing without it leaves the item open, and while any
prevention of an incident is open and not owned, the director picks that incident twice as often. An
unfixed root cause comes back. A player short on Insight is never blocked; the item stays open until
its Study completes. When the design already has every prevention, the card opens no action item.

## SLOs and error budgets

From the Series A Era, the company has an **SLO**: an availability target per calendar week
([Progression](/design/10-progression#eras)).

```text
error_budget = (1 − SLO) × requests in the window
budget_left  = error_budget − failed requests
```

| Budget state       | Effect                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| More than 50% left | Velocity × 1.1: the team can take risks                                  |
| 0% to 50% left     | Normal                                                                   |
| Spent              | Feature freeze: velocity × 0.5, only reliability tasks run at full speed |

This is the Google SRE error budget policy. It turns reliability into a resource that the player
spends on speed. The budget's hold on velocity needs research `error-budgets`, after `slo-dashboards`
([Progression](/design/10-progression#research)): from Series A the budget is always measured, but without
that research it changes no velocity.

| SLO     | Allowed downtime per calendar week | Real time at 1× speed |
| ------- | ---------------------------------- | --------------------- |
| 99%     | 1 hour 41 minutes                  | 101 seconds           |
| 99.5%   | 50 minutes                         | 50 seconds            |
| 99.9%   | 10 minutes                         | 10 seconds            |
| 99.95%  | 5 minutes                          | 5 seconds             |
| 99.99%  | 1 minute                           | 1 second              |
| 99.999% | 6 seconds                          | 0.1 second (1 step)   |

The budget counts failed requests, not clock time, so a partial failure spends a partial budget. A
SEV1 incident that fails 100% of requests for its full 60 calendar minutes spends six times a 99.9%
budget. A design that fails 2% of requests for the same hour spends about 12% of it.

**SLA credits.** Not built yet: there is no SLA and no `enterprise-sales` research. The design was an
SLA under which each calendar week below it pays credits to customers: 10% of that week's subscription
revenue.
