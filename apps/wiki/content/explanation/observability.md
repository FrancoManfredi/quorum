---
title: Insight and observability
summary: How the Analytics Node turns sampled traffic into Insight, what sampling costs, and how observability Research changes what you can see.
section: explanation
order: 12
aliases: insight, observability, analytics, sample rate, sampling, retention, visibility, logs, metrics, percentiles, alerting, alert fatigue, dashboard, tracing, failure insight
gdd: /design/12-observability
---

You start Quorum almost blind, like an early startup. You see load bars, request rates, a mean
latency, and one error number. Observability does two jobs here. It produces Insight, the currency
that buys Research, and observability Research decides how much of your system you can see.

## Analytics samples your traffic

The [Analytics](/components/analytics) Node is a tap. Link any Node into it, and it samples that
Node's traffic. Each sample has a request kind and adds Insight to that kind's pool, and failed or
frustrated requests also add to the Failure pool. [Eras and Research](/explanation/progression)
explains why Insight comes in kinds.

The yield follows a square root:

```latex
\begin{aligned}
\text{Insight} \left(\text{kind}\right) &= \sum_{\text{over Component types}} \sqrt{\text{sampled requests of that kind per second}} \\
\text{Failure} &= 3 \times \sum_{\text{over Component types}} \sqrt{\text{sampled failed requests per second}}
\end{aligned}
```

Two rules follow from the square root:

- **Breadth beats size.** Four times the traffic gives only twice the Insight, but each Component
  type adds its own term. A read sampled at the Load Balancer, the App Server, the Cache, and the
  Database teaches four times as much as a read sampled at one Node.
- **Copies do not count twice.** Ten App Servers make one term, so splitting a Node into many teaches
  nothing new.

The Failure pool earns three times as much per sample, because a healthy Design fails rarely. A
request that fails or frustrates its user counts fully, and a tolerated one counts in part. Failing on
purpose is still a bad trade, because failures cost users, revenue, and error budget.

## Seeing costs something

Analytics has a capacity in samples per second, and each size step doubles it. Samples past it are
dropped evenly. You choose the sample rate: 1%, 5%, 10% (the default), 50%, or 100%.

A higher rate gives more Insight, but not in proportion. 100% gives about three times the Insight of
10%, and it costs:

- **CPU** on every tapped Node.
- **Latency** on every tapped hop, which can lower Apdex.
- **Storage Burn** on the Analytics bill.

Analytics also keeps traces for a retention window: 15 minutes, 1 hour, or 6 hours of sim time. A
longer window costs more storage and lets each Insight pool hold more. A pool holds about one window's
worth of Insight at your current rate, so you cannot save up a huge balance and buy a whole Era when
it opens.

:::Note{tone="real"}
Observability bills surprise real teams too. Real tracing systems keep that cost down by sampling:
they keep a share of requests and accept that rare events may be missed.
:::

## The visibility ladder

The Simulation always computes every number in the Ledger, and Research changes only what the
interface shows. A player without [Percentiles](/research/percentiles) still loses revenue to slow
requests but cannot see the p99.

Each step of the [Observability track](/research) shows you more:

| Research                                   | What you can see                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| [Structured logs](/research/logs)          | Errors split by cause, such as `stranded`, `dropped`, `refused`, `down`, and `oom`. |
| [Metrics](/research/metrics)               | History graphs on every Node, and the Dashboard.                                    |
| [Percentiles](/research/percentiles)       | p50, p95, and p99 next to the mean.                                                 |
| [Alerting](/research/alerting)             | A pager when errors, p99, or saturation cross a threshold.                          |
| [SLO dashboards](/research/slo-dashboards) | The error budget on the HUD, and its burn rate on the Dashboard.                    |

[Distributed tracing](/research/tracing) sits on the track, and other items require it. It adds the
Services and Resources rows to the Dashboard: the rate, errors and duration of each request kind, and
each Node's utilisation, saturation and limit.

::Track{track="observability"}

## Two tools that are always on

The **bottleneck marker** names the Node whose extra capacity would earn the most. It keeps the game
playable before you can see anything else.

The **Churn breakdown** opens from the Users figure and lists the rows that cost each region its
Apdex, by request kind and cause. Research adds detail: with Structured logs, a failure names its
cause, and with Percentiles, a slow row shows its p99.
[Users and growth](/explanation/users-and-growth) explains how to read it.

## Alerts and alert fatigue

With Alerting, five default rules watch your system:

- The error rate stays above 1% for 30 seconds.
- A kind's p99 stays above 4 times its Apdex target for 30 seconds.
- A Node stays above 90% utilization for 60 seconds.
- A Queue's oldest task stays older than 30 seconds for 60 seconds.
- The error budget burns above 10 times its even rate for 30 seconds, from Series A.

You can make each rule more or less sensitive. An alert that fires with no incident behind it is a
false alarm, and after 5 false alarms in one calendar day the rule is marked as ignored and stops
paging you. This is alert fatigue, and real teams have it too: people who are paged for nothing stop
looking. Tune a noisy rule instead of living with it.

## The Dashboard

The Board shows your system now, and the Dashboard shows it over time. It opens with `D` after
Metrics. Its first rows chart the [four golden signals](/glossary/four-golden-signals): traffic,
latency, errors, and saturation. Lines on the charts mark your recent Design changes and the start of
an incident, so you can check that a line moved after your fix and not before it. See
[annotation](/glossary/annotation).

Long ranges show averaged blocks of time, but the p99 line draws the worst minute in each block,
because an average would hide the spike. See [downsampling](/glossary/downsampling) and
[Read p99](/guides/read-p99).

## Further reading

- [Observability](/glossary/observability) in the glossary.
- [Earn Insight and research](/tutorials/research-and-insight), a tutorial.
- [Find the bottleneck](/guides/find-the-bottleneck), a guide.
