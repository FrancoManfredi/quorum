---
title: Eras and Research
summary: Why your Company moves through Eras, why each Era's Research needs that Era's traffic, and how Studies turn Insight into new tools.
section: explanation
order: 10
aliases: eras, progression, research, studies, study, insight, recipe, pools, spike, milestone, unlock, tracks, queue
gdd: /design/10-progression
---

A Company grows through eight Eras, from the Garage to the Public Era, and each Era brings its
problems and the Research to solve them together. New request kinds and failure modes arrive with the
Era. You buy the tools with Insight, and your own traffic produces it, so you cannot research a
problem you have not met.

## What an Era changes

You leave an Era by reaching its user milestone and taking (or declining) the funding round it
offers. [Cash, Burn, and funding](/explanation/money) explains that choice. Each new Era changes five
things at once:

- **The request mix.** New kinds of traffic arrive, such as writes and logins in Pre-seed, or search,
  uploads, and bots in Seed. Each kind loads your Design in its own way.
- **The market.** Each Era has a larger market, which caps how many users you can win. Features can
  raise it.
- **The bar.** The Apdex target rises each Era, so a Design that kept users happy in one Era may lose
  them in the next. From Series A, an availability SLO also counts every failed request.
- **Prices.** A cost index and a salary index scale every price, so Burn stays a real share of
  revenue.
- **Incidents.** From Pre-seed, incidents start, and later Eras allow more severe ones.

Here is the Seed Era's request mix:

::Mix{era="2"}

The [Eras](/eras) reference pages show each Era's milestone, market, targets, mix, and arrivals.

:::Note{tone="real"}
Each Era asks one question that companies meet at about that size: "How far does one box go?" in the
Garage, and "What happens when a whole zone fails?" in Series A. The order follows the usual path of
a growing product: vertical scaling, then the database, then separating unlike workloads, then
availability, then data at scale, then geography.
:::

## Insight comes in kinds

Insight is the Research currency, and the [Analytics](/components/analytics) Node makes it by
sampling the Nodes you link into it. A sampled request gives Insight of its own kind: a sampled read
gives read Insight, and a sampled search gives search Insight. Your Company keeps one pool for each
request kind, plus a **Failure** pool that fills from requests that fail or frustrate users.
[Insight and observability](/explanation/observability) explains the yield in detail.

The first time your Design serves more than half of a new request kind successfully, that kind's
pool also gets a one-time gift of 20 Insight.

## Recipes tie Research to traffic

Each Research item has a **recipe**: the pools that pay for it. By default, an item's recipe is the
request kinds of its Era. Some items ask for the kinds that show their problem: Caching asks for read
Insight, and Connection pooling asks for write Insight. Half of every Reliability item's cost is
Failure Insight, because you learn reliability by seeing failures.

So more page views never buy Series B Research. You must serve the new kinds first. Factory games use
the same design with science packs, where each stage's production line pays for the next step.

You cannot study an item before its Era or before the items it requires. Locked items of the next Era
stay visible, so you can plan.

## Studies run one at a time

A Research item runs as a **Study**, and one Study runs at a time. You can queue up to 8, reorder
them, and switch which one runs. A Study keeps its progress when you switch away, but cancelling one
loses its progress and the Insight it took. Its effect starts when it completes.

A Study draws Insight as it runs, not all at once. Each Era sets a base duration, from seconds in the
Garage to an hour of sim time in the Public Era. Each second, the Study takes its share of the cost
from every pool in its recipe. When a pool runs dry, the Study slows to the rate that pool earns, so
the scarcest kind sets the pace. Traffic falls at night, so a Study that needs a quiet kind slows at
night too.

You can start a Study with no Insight saved, and you cannot hoard much anyway. Each pool holds only
what your Analytics retention window collects at the current rate, and never less than one Study's
share. Studies keep running while you are away.

## Making Studies faster

Two things raise a Study's speed:

- **A Spike.** Put a Spike on a team's backlog, and that team works on the running Study instead of
  the product. While it does, the Study runs at twice the speed. Research competes with Features for
  engineers, as it does at real companies. See [Team and velocity](/explanation/team-and-velocity).
- **Study-speed Research.** [Trace search](/research/trace-search) and
  [Notebooks](/research/notebooks) each add 25%.

Some Observability items also need breadth. [Distributed tracing](/research/tracing) needs its kinds
sampled at 3 Component types, because a trace needs more than one hop.

## The tracks

Research is grouped into ten tracks: Infrastructure, Data, Reliability, Observability, Performance,
Runtimes, Frameworks, Security, Product, and Cost. Tracks are a way to browse, and an item in any track can
require one in another. The [Research](/research) reference lists every item with its Era, cost, and
requirements.

Incidents also steer Research. When an incident ends, its postmortem names the first Research that
would prevent it and that you can study now, and until you own it, that incident is likelier.
[How incidents work](/explanation/incidents) explains this loop.

## Above the Company

Eras and Research reset when a Company ends. Legacy, which you earn at an Exit, carries over. [Why a Company ends](/explanation/legacy) explains that layer. To start, follow
[Earn Insight and research](/tutorials/research-and-insight).
