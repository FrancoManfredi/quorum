---
title: 12. Observability and Insight
summary: Fog of war for systems: what the player can see and how they earn the right to see more.
section: design
order: 12
---

A Hacker News comment on Factorio says: "The only thing preventing you from doing this to your
application is the lack of visibility into the problems." Quorum makes visibility a progression track.
The player starts with almost nothing, like a real early startup, and earns better tools. This is fog
of war for systems.

Observability does two jobs:

1. It produces **Insight**, the research currency, in one pool per request kind.
2. It decides what the player can **see**.

## Earning Insight

**Analytics** is a tap ([Components](/design/05-components#analytics)). Each Node linked into it sends a
sample of its traffic.

Insight has a request kind. A sampled `read` gives `read` Insight, a sampled `buy` gives `buy`
Insight, and so on. The Company holds one pool for each of the 16 request kinds and one **Failure**
pool. Research costs Insight from named pools ([Progression](/design/10-progression#research)), so a
new Era's research needs that Era's traffic. This is the Factorio science pack pattern, with request
kinds as the packs ([Influences](/design/02-influences#research-in-factory-games)).

```text
sampled(c, kind)  = Σ tapped Nodes of Component c: λ(node, kind) × sample_rate
insight(kind)     = yield × Σ Component types c: √sampled(c, kind) × multipliers(c)
insight(Failure)  = 3 × yield × Σ Component types c: √failed(c) × multipliers(c)
```

| Term             | Value                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sample_rate`    | A setting: 1%, 5%, 10% (default), 50%, or 100%.                                                                                                                                         |
| `λ(node, kind)`  | The requests of that request kind that reach the Node. A request keeps its request kind on every hop: the `q-read` a `read` sends counts as `read`.                                     |
| `failed(c)`      | The sampled requests at Component c that fail or frustrate the user, plus half of those that only tolerate it ([Apdex](/design/04-simulation#apdex-and-revenue)). `bot` is not counted. |
| `yield`          | 1 ([Balancing](/design/16-balancing#constants)).                                                                                                                                        |
| `multipliers(c)` | The Pattern recognition Perk, +20% per level.                                                                                                                                           |

A Service Mesh's +20% is built ([Components](/design/05-components#service-mesh)): the samples that come
from a Node with a sidecar earn a fifth more, under the same square root, so a Design whose sampled
Nodes are all meshed earns 20% more. `tail-sampling` is built too: it doubles the whole Failure
Insight formula below, outside the square root.

Analytics has a capacity in samples per second. Samples beyond it are dropped.

The rules behind the formula:

- **The square root rewards a broad Design.** Insight grows with the square root of the traffic, so
  four times the traffic gives two times the Insight. Each Component type and each request kind is
  its own term, so a Design that samples a `read` at the Load Balancer, the App Server, the Cache,
  and the Database learns four times as much as one that samples it at one Node.
- **The sum is per Component type, not per Node.** Ten App Servers make one term. Splitting a Node
  into many Nodes teaches nothing new.
- **`bot` Insight is real.** Bots teach how bots behave. Only security research asks for it.
- **Failure Insight comes from failures.** Reliability research asks for it, so the player learns
  reliability by seeing failures, as real teams do. Failures also cost users, revenue, and error
  budget, so failing on purpose is a bad trade. Postmortems still pay no Insight
  ([Incidents](/design/11-incidents#postmortems)).

### The cost of seeing

Sampling is not free. That is real, and observability bills are a common surprise.

| Sample rate | CPU overhead on tapped Nodes | Latency per tapped hop | Storage Burn | Insight |
| ----------- | ---------------------------- | ---------------------- | ------------ | ------- |
| 1%          | +0.2%                        | +0 ms                  | 0.1×         | 0.32×   |
| 5%          | +1%                          | +0.5 ms                | 0.5×         | 0.71×   |
| 10%         | +2%                          | +1 ms                  | 1×           | 1×      |
| 50%         | +8%                          | +3 ms                  | 5×           | 2.24×   |
| 100%        | +15%                         | +5 ms                  | 10×          | 3.16×   |

Ten times the samples gives about three times the Insight, and it costs capacity and Apdex while it
is on. A high sample rate is a choice to learn faster at a known price, not free Insight.

### Retention

Analytics keeps traces for a window: 15 minutes (default), 1 hour, or 6 hours of sim time. A
longer window multiplies the tap's Storage Burn by 1, 2, or 4.

```text
cap(pool) = max(floor(pool), retention_window × insight(pool))
```

Insight above a pool's cap is not added. The cap follows the live rate, so the player cannot save
up a large balance and buy a whole Era when it opens. `floor(pool)` is the pool's share of the
costliest item open in the Era, and at least 100: a pool always holds one Study, so the Failure
Insight of an incident still pays for a Study after the incident ends. Grants ignore the cap.

### Other Insight sources

| Source              | Amount                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Load tests          | 2 Failure Insight a second while a Load test's readout runs                                |
| Chaos experiments   | 1 Failure Insight a second while an experiment runs                                        |
| DR drill            | 5 Failure Insight a second while the drill's outage runs                                   |
| First time per kind | 20 Insight of that kind, the first time the Design serves more than 50% of it successfully |

A Load test's readout ([Team](/design/08-team-and-velocity#engineering-tasks)) puts every Node at twice
the demand, and a DR drill ([Exit](/design/10-progression#era-6-pre-ipo)) fails the home region for a
minute. Both push the Design past its limits on purpose, so both pay Failure Insight for as long as
they run, on top of whatever the failures they cause earn through Analytics. An experiment that
Chaos engineering schedules pays for the 10 seconds it runs
([Progression](/design/10-progression#track-reliability)).

## The visibility ladder

| Step | Research            | Era      | What the player can now see                                                                                                                                                                                                                                                                  |
| ---- | ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Starting view       | Garage   | Load bars, inbound rps, mean latency, a red "Stranded" row, the bottleneck marker. Errors as one number.                                                                                                                                                                                     |
| 1    | `logs`              | Garage   | The error breakdown by cause: `timeout`, `refused`, `oom`, and the rest ([Simulation](/design/04-simulation#errors)).                                                                                                                                                                        |
| 2    | `metrics`           | Garage   | A history graph on each Node card for the last calendar day, and [the Dashboard](#the-dashboard). Before this, the player sees only "now".                                                                                                                                                   |
| 3    | `percentiles`       | Pre-seed | p99 on cards and the HUD, next to the mean. The mean is still shown, so the player sees how much it hides.                                                                                                                                                                                   |
| 4    | `alerting`          | Pre-seed | A pager banner when thresholds are crossed ([Alerting](#alerting)).                                                                                                                                                                                                                          |
| 5    | `tracing`           | Seed     | The Dashboard's Services and Resources rows, and a waterfall of a request kind's path: `NodeLedger` gained `hopByKind` and `waitByKind`, so each hop and each Queue wait can be split by kind, and `Ledger.bottleneckByKind` names the busiest limiting Node on each kind's own path.        |
| 6    | `slo-dashboards`    | Series A | The error budget panel and burn rate.                                                                                                                                                                                                                                                        |
| 7    | `profiling`         | Series A | Its own Research now, at the breadth `tracing` carried: 4 Component types. The Dashboard's Resources row names the resource that limits each Node ([Runtimes](/design/06-runtimes#the-capacity-model)), and it is locked behind `profiling` rather than arriving with `tracing`.             |
| 8    | `tail-sampling`     | Series B | Failure Insight doubles ([Charts by research](#charts-by-research)).                                                                                                                                                                                                                         |
| 9    | `rum`               | Series C | A device split — desktop, mobile, and tablet — on the Users row, with each device's own mean latency including a stylized round trip. Its Study needs `page` and `feed` sampled in two regions, each through an Analytics tap on a Node there ([Research](/design/10-progression#research)). |
| 10   | `anomaly-detection` | Series C | A shorter hold before the pager fires, so the warning lands while an incident is still ramping up, and a forecast line at tomorrow's predicted peak, projected from the known diurnal cycle. The cycle gives one line, not a range, so the forecast is a line.                               |

### What the player sees at each step: an example

The same problem, a database at 95% utilization behind PHP-FPM servers, seen at three steps:

| Step | What the board shows                                                                                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | The App Servers are red with full load bars. The database is amber. The bottleneck marker is on the database. Mean latency 180 ms.                                                                                  |
| 3    | Same, plus p99 1.4 s. The player sees that some users wait more than a second.                                                                                                                                      |
| 7    | The Dashboard's Resources row and the Inspector name the limit. The Node card itself says "Limit: Workers 20/20" ([Interface](/design/15-ui-ux#node-cards)). The player knows that more App Servers would not help. |

The player can solve the problem at step 0 by trusting the bottleneck marker. At step 7 they
understand why, and they can predict the effect of a change before they make it.

## Alerting

With `alerting`, the player can set alert rules. The defaults:

| Alert           | Condition                                      |
| --------------- | ---------------------------------------------- |
| High error rate | Error rate above 1% for 30 s                   |
| High latency    | p99 above 4× the kind's Apdex T for 30 s       |
| Saturation      | Any Node above 90% utilization for 60 s        |
| Queue growth    | A Queue's oldest task older than 30 s for 60 s |
| Budget burn     | Error budget burning above 10× for 30 s        |

Queue growth reads the age of the oldest task in any Queue, and Budget burn the error budget's burn
rate: the share of requests failing against the share the SLO allows, so 1 spends exactly the whole
budget over the SLO window. Each rule's threshold has three settings, and a rule pages like the
others. Budget burn counts from Series A, when the budget starts.

Alerts that fire too often lower their own value: after five false alarms in a calendar day, the
banner shows "Ignored" and the player must tune the rule. This is alert fatigue, and it is real.

## The Ledger and what is hidden

The Ledger always holds every number. Visibility research changes what the UI shows, not what the
simulation computes. A player who has not researched `percentiles` still loses revenue to slow
requests. They just cannot see the p99.

The bottleneck marker is always visible. It is the safety net that keeps the game playable at step 0.

## The Churn breakdown

The bottleneck marker tells the player what limits revenue. The **Churn breakdown** tells the player
why users leave. Users leave when Apdex falls slightly under target, with no outage and no red Node
([Simulation](/design/04-simulation#users-and-growth)), so the player needs a direct answer. Like the
bottleneck marker, the Churn breakdown is always available. Research adds detail to it, but does not
unlock it.

It opens from the Users figure on the HUD and from the Users Node. It has one section per region,
with the region that loses the most users per hour first:

```text
Europe   Apdex 0.91 · target 0.92 · −1.8% users per hour · 1 day at this rate: 410k → 277k
  read     slow     ██████████   0.05   p99 310 ms, T 200 ms
  feed     slow     ████         0.02
  write    failed   ██           0.01   refused
  page     slow     ██           0.01
```

In the Series C Era, one point of Apdex under target costs a region about a third of its users in a
calendar day, when half of them are steady. The Churn breakdown
exists because nothing else on the screen says so.

- Each row is one Request kind and one cause. Its bar is the Apdex points that the row takes from
  the region: the share of the region's requests in that row, times 1 for a failure and ½ for a
  tolerating request.
- The rows add up to `1 − A_r`. The header marks the target, so the player sees how many points they
  must win back and which rows hold them.
- The header shows the rate and a forecast for one calendar day at the current Apdex. The figures
  use the same formula as the Simulation, with no estimate.
- The cause is `far` for the round trip to a Design in another region, `slow` for time inside the
  Design, or `failed`. Each needed row names one fix, such as Open Asia-Pacific, Research GeoDNS, or
  Show the bottleneck Node, and shows it once per region.
- Without research, a failure reads `failed`. With `logs`, `failed` shows the error class
  ([Errors](/design/04-simulation#errors)). With `percentiles`, a `slow` row shows p99 against the kind's
  T. With `tracing`, a `slow` row also names the Node whose hop takes the most time on that kind's
  path, read from `hopByKind`. With `rum`, a `slow` or `far` row names the device with the longest
  round trip over the internet ([The visibility ladder](#the-visibility-ladder)).
- Each row's fix button selects the Node it names, or opens the region or the research it needs.

When a region's users fall for one calendar hour, the Customers sender writes a Mail with the top two
rows ([Mail](/design/18-mail#senders)).

## The Inspector

Click a Node and the Inspector opens on its numbers. It also breaks the Node's load down, so a spike
can be traced to the operations and the upstream Nodes that caused it.

- **Incoming operations.** Offered traffic per request kind, largest first, as a rate and as a share
  of the Node's inbound traffic, with the change since the previous sample. Shares describe incoming
  traffic, not CPU usage.
- **Sent by.** The same rate, share and change for each Node linked into it, so the cause is one hop
  back.
- **A recommendation only on a measured constraint.** A callout appears when the Node is down,
  swapping, out of CPU credits, refusing connections, reading from disk, stalled, or saturated at its
  limit, and it names that limit. A large traffic share alone raises nothing.

The Inspector keeps a one-day history per Node in session state, not in the Game: 144 samples, one
every 10 sim seconds. With `metrics`, Traffic & load draws it. Click a point on the chart, or use
Earlier sample and Later sample, to read a past sample: the panel labels it "Recorded sample" and
every rate, share and delta is the one recorded then. Selecting a sample changes no Game state and no
time, so the Board keeps running. Back to live returns to now. The selection clears when its sample
expires or its Node is sold.

## The Dashboard

The Board shows the system **now**. The **Dashboard** shows it **over time**. It is a full-screen
view of Charts, with the look of a Grafana dashboard, from the Monitoring sender Grafauna
([Mail](/design/18-mail#senders)). It opens with `D` once `metrics` is researched, and each later
visibility step adds Charts to it. The player does not buy the Dashboard with its own research.
It grows as they climb the ladder.

### The Dashboard and pillar 4

[Pillar 4](/design/01-vision#pillar-4-the-board-is-the-dashboard) says that the Board is the
dashboard. The Dashboard keeps that rule because it answers only questions about time and
correlation, which the Board cannot answer:

- Did p99 go up after that deploy, or after that resize?
- What happened during the 03\:00 spike while I was away?
- Which Node saturated first, and which ones followed?
- Is the error budget burning faster this week than last week?

Rules:

1. **No number is only on the Dashboard.** Every value on a Chart's last point is also on a Node
   card, the HUD, or a panel. The Dashboard adds history, not new facts.
2. **The bottleneck stays on the Board.** The Dashboard has no bottleneck marker. Test: during
   normal play, the player can still find the bottleneck without the Dashboard.
3. **It shows only what the player has researched.** It follows
   [the Ledger and what is hidden](#the-ledger-and-what-is-hidden): a Chart that needs a later step
   shows as a greyed tile that names the research, as in "No data. Research `tracing`."
4. **It works while paused.** The player can study the past while time stands still.

### How real teams build dashboards

The Dashboard copies the methods that real teams use, so that what the player learns transfers.

| Practice                    | What it is                                                                                                                                                      | In the Dashboard                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four golden signals         | Google SRE: if you can measure only four things about a user-facing system, measure latency, traffic, errors, and saturation.                                   | The Overview row is the four signals.                                                                                                                                                                                                                                                                                                                               |
| RED method                  | Rate, Errors, Duration for each service. It measures what users feel, so alerts go here.                                                                        | One row per Service, with request rate, errors, and latency side by side.                                                                                                                                                                                                                                                                                           |
| USE method                  | Utilization, Saturation, Errors for each resource. It measures causes.                                                                                          | One row per Node for the data tier and with `profiling`.                                                                                                                                                                                                                                                                                                            |
| One row per service         | Grafana's best practice: the layout follows the service hierarchy, rate and errors on the left, duration on the right.                                          | Rows follow the Board: edge, App Servers, Workers, data tier, Managed Components.                                                                                                                                                                                                                                                                                   |
| Annotations                 | Vertical markers for deploys, incidents, and maintenance, so a change in a graph has a visible cause.                                                           | Markers for deploys, incidents, Design changes, research, and Eras.                                                                                                                                                                                                                                                                                                 |
| Shared crosshair            | Hover on one panel draws the same moment on every panel.                                                                                                        | On by default.                                                                                                                                                                                                                                                                                                                                                      |
| Template variables          | Drop-downs at the top, such as service, instance, or environment, that filter every panel.                                                                      | Service, Request kind, and Region.                                                                                                                                                                                                                                                                                                                                  |
| Percentiles from histograms | Prometheus records latency in buckets and computes `histogram_quantile(0.99, ...)` at query time. Percentiles cannot be averaged across instances; buckets can. | p50, p95, and p99 lines. The mean stays on the Chart, so the player sees how much it hides.                                                                                                                                                                                                                                                                         |
| Burn rate                   | How fast an SLO spends its error budget. A burn rate of 1 spends exactly the whole budget in the SLO window.                                                    | The SLO row, with lines at 1× and at the 10× of the Budget burn alert.                                                                                                                                                                                                                                                                                              |
| Exemplars                   | Points on a metric graph that link to one trace of a real request.                                                                                              | An exemplar strip under the Traffic and Latency Charts, with `tracing`: the three slowest seconds of the range, each marked with a dot on the Latency Chart and a button that opens the Waterfall of the Request kind that was slowest in it. A one-minute Sample keeps that kind; the 15-minute and 1-hour blocks keep none, so a longer range shows no exemplars. |
| Downsampling and retention  | Thanos keeps raw samples, then 5-minute blocks after 40 hours and 1-hour blocks after 10 days. Each block stores min, max, sum, and count.                      | Three resolutions, each keeping min, max, sum, and count ([History and resolution](#history-and-resolution)).                                                                                                                                                                                                                                                       |
| Cardinality                 | Every label combination is a new time series. Labels such as user ID make the storage bill explode.                                                             | Series are per Node, per Request kind, and per Region only, never per request or per User.                                                                                                                                                                                                                                                                          |
| Logs, traces, and profiles  | Grafana's stack adds Loki (logs), Tempo (traces), Pyroscope (profiles), and Faro (real user monitoring) next to Prometheus metrics.                             | The visibility ladder: `logs`, `tracing`, `profiling`, and `rum` each add their signal.                                                                                                                                                                                                                                                                             |

### Charts by research

Each visibility step adds a row. A row appears only when its research is owned.

| Research            | Row             | Charts                                                                                                                                                                                                                                                                                                                           |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metrics`           | Overview        | Stats for Users, Apdex, and Cash per second, each with a sparkline; Cash per second is the Samples' `cash` read as a rate. Time series: demand against served (traffic), mean latency, errors, and utilization per Node with lines at 70% and 90% (saturation). Revenue against Burn. From Series C, Users and Apdex per region. |
| `logs`              | Errors          | Errors per second as a stacked area by cause: `timeout`, `refused`, `oom`, and the rest.                                                                                                                                                                                                                                         |
| `percentiles`       | Latency         | p99 with the mean. Latency per Node as a bar gauge for the selected moment.                                                                                                                                                                                                                                                      |
| `alerting`          | Alerts          | A state timeline per rule, OK, pending, firing and ignored, from the pages the Inbox kept and the seconds each rule has held; a table of each rule's threshold, its value now, and its state; and the threshold on the Errors and Latency Charts.                                                                                |
| `tracing`           | Services (RED)  | One row per Request kind, with its rate, its share of the traffic, its errors, and its mean and p99 duration, and the Waterfall table under it: every Node a selected kind's traffic touches, its hop time, its Queue wait, and whether it is that kind's bottleneck. The latency Charts carry no exemplar dots.                 |
| `slo-dashboards`    | SLO             | Availability this calendar week as a stat, error budget left as a gauge, the SLA credit the Venture owes as a figure, and burn rate over the last day. The HUD keeps availability and the budget left, and adds an SLA row while the credit pays.                                                                                |
| `profiling`         | Resources (USE) | A state timeline per Node that colours the resource that limited it: CPU, workers, memory, connections, network, disk, or throughput; locked behind its own Research rather than arriving with `tracing`. Pool waits and queue depths are on the Queue row.                                                                      |
| `tail-sampling`     | —               | No Chart. The research doubles Failure Insight (12 "Earning Insight").                                                                                                                                                                                                                                                           |
| `rum`               | Users           | Users by region against the region's market, with its Apdex and its churn per hour, and a Real user monitoring table under it: mean latency from each device's side. Latency is per device, not per region.                                                                                                                      |
| `anomaly-detection` | —               | A rule at tomorrow's predicted peak on the Traffic Chart, projected from the diurnal cycle. The cycle gives one line, not a range.                                                                                                                                                                                               |

A chaos experiment ([Progression](/design/10-progression#track-reliability)) writes its injected
`refused` errors into the Errors row while it runs, so the experiment is visible on the same Chart as
the failures it causes. The Team panel's Chaos switch names the Node the next experiment will hit,
which is the Design's weakest.

The Dashboard has eight of these rows: Overview, Errors, Latency, Alerts, Services, Resources, Users
and SLO. Two more rows read the Game, the Ledger and the Inbox rather than a signal:
[Company and Incidents](/design/15-ui-ux#company-and-incidents-panels). They exist because a Chart
cannot say who is on the Team, how long the money lasts, or what the last Incident cost. Each adds
one series drawn from history the Board cannot show, and no new figure: the Company's Money card
draws Cash from the Samples' `cash`, and the Incidents row draws each Postmortem's run from `endedAt`
less its `duration` to `endedAt`, split at the first signal and the acknowledgement so the spans
before each show, with the running Incident last. It reaches back only as far as the four Postmortems
the Game keeps and the Chart history behind its axis, so a run older than either stays in the table
alone. They are not visibility steps: they gather facts the player already has, not a new signal.

### Component rows

Each Component adds its own row of the numbers that matter for it, the way the community dashboards
for Postgres, Redis, nginx, or the JVM do. A row appears the first time the Board holds that
Component, after `metrics`, and each Chart reads a number the Ledger already holds.

| Component         | Charts                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| Load Balancer     | Requests per backend Node, which shows uneven balancing                                 |
| App Server        | Copies, from the Game's `replicas` and `pending`, and the workers busy against the pool |
| Database          | Connections used against the limit, refused queries, and replica lag                    |
| Cache             | Hit ratio, and evictions a second                                                       |
| Queue             | Queue depth and the age of the oldest Task                                              |
| CDN               | Hit ratio, beside the Design's Egress                                                   |
| Managed Component | Calls, latency and outage state                                                         |

The Cache row also carries its evictions: the keys a second it pushes out because the hot data does not fit its memory, which is 0 while it fits.

### Annotations

Every time series shows vertical markers for the events that change a system. The variables bar
carries a switch per group, pressed by default, so the player can hide the marks that sit in the way
of a change; the switch shows each group in its colour.

| Group          | Marks                                                           | Colour |
| -------------- | --------------------------------------------------------------- | ------ |
| Deploys        | A deploy of Shipped Features, and a bad one                     | Purple |
| Design changes | Nodes placed, resized, or removed; Links drawn; options changed | Blue   |
| Incidents      | Where an Incident started, with its SEV                         | Red    |
| Research       | A Study finished, from the Inbox's `event:finished` Thread      | Green  |
| Company        | A funding round, the IPO, and a hire                            | Pink   |

The Deploy, Incident and Company marks come from the Inbox, which is the only record the client keeps
of when an event happened: the Game holds no Deploy, Study or round time. That bounds them to the
Threads the Inbox still keeps, and it is why a mark names its kind rather than its detail. The running
Incident is marked once, with the SEV it holds now; every other Incident is marked where its Thread
started. The marks show when an Incident began; its band, with the spans before it was seen and
answered, is on the Incidents row ([Interface](/design/15-ui-ux#company-and-incidents-panels)).

Research marks read the same Inbox, and they are the one group the Game does not date. A Study is
`{ id, progress }` while it runs, and `advanceStudies` takes it off `studies` and adds its id to
`researched` when it completes, so no field holds the second it finished. The mark is the
`event:finished` entry that names a Research, at the second the Inbox wrote it. That Thread carries
a finished task's Mail too, and a letter names its item rather than its kind, so the mark is read
from the item name in the text: the mark says Research for an entry that names a Research item. A
per-item field on the Thread's entry would make the mark exact, and so would the time on the Game.

Era markers are in the Company group: the Game holds `stageAt`, the sim second the current Era began,
and the Dashboard marks it with the Era's name.

Design changes are the most important group. The player changes the Board to fix a problem, and
the marker shows whether the line moved after the change. This closes the loop that the
[ghost-simulation preview](/design/15-ui-ux#feedback-after-a-change) opens before the change.

### Controls

- **Time range.** Last 1 hour, 6 hours (the default), 24 hours, 7 days, and 30 days, in calendar
  time. At 1× speed, 1 calendar hour is 1 real minute.
- **Compare.** A switch that draws yesterday's line for the same time range as a faint dashed line
  under the current series, on the Traffic Chart (Served) and the Latency Chart (p99, or the mean
  before Percentiles), so the player can separate the daily cycle from a real change. Grafana calls
  this a time shift. It reads the Dashboard's own blocks, so a range under 10 hours compares against
  15-minute means, and a row whose day the history no longer reaches leaves a gap rather than a
  guess. The line is drawn by default and the switch takes it away.
- **Variables.** A Request kind and a Region, as drop-downs at the top of the page. They narrow every
  panel that reads a per-kind or a per-region figure: the Request mix and the Services row by kind;
  the Users row, the Users stat and the Apdex gauge by region. The Charts over time read the
  Simulation's global Samples, which carry no kind and no region, so a filter cannot narrow them;
  a Sample history per Request kind and per Region would be needed to narrow them. The bar keeps
  read-only chips for the Era and the SLO, and the region drop-down appears from Series C, when
  users live in more than one place.
- **Service.** A drop-down that appears with a second Service
  ([Services](/design/08-team-and-velocity#services)). It narrows the per-kind panels to the kinds
  that Service's Features touch, and a Code row beside the Services row gives each Service's rate,
  errors and duration from the Ledger's per-Service figures.
- **Crosshair and focus.** Hover shows the same moment on every Chart. Clicking a Node's series
  selects that Node on the Board and closes the Dashboard.
- **Table view.** A switch that shows each time series' values as a table in place of its plot: one
  row per time, one column per series with yesterday's when the compare line is drawn, formatted the
  way the Chart formats them, and a caption naming the Chart and its unit. It is there for screen
  readers and for reading an exact number
  ([Accessibility](/design/15-ui-ux#accessibility)).

The player cannot edit queries, add Charts, or move rows. The Dashboard teaches what to look at;
building dashboards is out of scope.

### History and resolution

The Simulation keeps only the last 600 one-second Samples of global numbers. The Dashboard needs
more, per Node, per Request kind, and over days, so the web app keeps its own history.

| Resolution        | Kept for          | Points per series |
| ----------------- | ----------------- | ----------------- |
| 1 calendar minute | The last 10 hours | 600               |
| 15 minutes        | The last 7 days   | 672               |
| 1 hour            | The last 30 days  | 720               |

Each point at a coarser resolution stores min, max, sum, and count, so a Chart can show the mean and
the worst value of a 15-minute block. A spike shorter than the block still shows in the max.

The history is client state, in the same way as Mail
([ADR 0006](https://github.com/elianiva/quorum/blob/main/docs/adr/0006-mail-is-client-state.md)). It is not part of the Game schema, so it
does not grow the Simulation's state or change replays
([ADR 0004](https://github.com/elianiva/quorum/blob/main/docs/adr/0004-simulation-package.md)). The save keeps it, and a save without it
starts with empty Charts. Offline progress has no per-minute history: the Dashboard shows the time
away as one band labelled "Away", with the values from the away card.

The error budget is the one exception: the Simulation already keeps it per calendar hour
(`BudgetHour`), so the SLO row reads it from the Game.

The Dashboard redraws once per real second, not on every frame.
