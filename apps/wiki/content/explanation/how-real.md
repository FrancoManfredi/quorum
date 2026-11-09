---
title: How real is Quorum
summary: What the Simulation models faithfully, what it simplifies on purpose, and where it bends reality.
section: explanation
order: 14
aliases: realism, accuracy, simplification, model, simulation, determinism, real world, faithful, limits, simplifications
gdd: /design/reality-check
---

Quorum bends reality in a few places, on purpose, and this page lists them. Every rule has to be true
enough that what you learn helps you at work. It also has to run ten times a second in a browser tab,
and it has to be fun. Those three demands pull against each other, so the rules keep the real shape
and simplify the math.

## The design rule: real shape, simple math

The Simulation computes rates. It runs no real servers, no real Kubernetes, and no network packets.
Each Step, it walks your Design from the Users outward and works out what arrives at each Node, what
it can serve, what waits, and what fails. The result is the Ledger: every number the game shows.
[How requests flow](/explanation/requests) describes this walk.

The curves have the shape of real systems. Latency rises sharply near full utilization, tails grow
with fan-out, and retries make overload worse. The exact numbers are stylized, so they stay cheap to
compute and easy to read.

:::Note{tone="real"}
The designers considered a faithful Kubernetes simulation and rejected it. It would not model the
numbers you optimize, such as latency and revenue, and it is too heavy for a browser game. So
Kubernetes is a Component with modeled behavior, not a simulated cluster.
:::

## What the game models faithfully

These rules follow the real formula or the real behavior closely:

- **Little's law.** Requests in flight equal throughput times the time each one stays. This is exact,
  and it is why a slow Database fills the slots of the App Servers that call it. See
  [Little's law](/glossary/littles-law).
- **The utilization curve.** Waiting grows with ρ / (1 − ρ), the shape of a single-server queue.
  Real servers have many workers, but the hockey stick is the same. See
  [Capacity, utilization, and queues](/explanation/queues).
- **Apdex.** The Simulation uses the standard Apdex formula: satisfied requests count fully,
  tolerating ones as half. See [Apdex and revenue](/explanation/apdex-and-revenue).
- **Tail amplification.** When a request fans out, the slowest call decides its latency. This
  follows Dean and Barroso's "The Tail at Scale".
- **Metastable failure.** Retries can keep a system overloaded after the trigger is gone. The Retry
  storm incident ends only when the backlog drains. See [Errors and retries](/explanation/errors-and-retries).
- **Runtime behavior.** One event loop stalls every request when one request burns CPU. A worker
  pool holds a slot while the request waits. PHP frees memory after every request, so it cannot leak
  across them. See the [Runtimes](/runtimes) pages.
- **Error budgets** follow the Google SRE policy, and **dilution** per round follows Carta's
  published medians.
- **User growth and churn.** Growth follows the classic word-of-mouth diffusion curve, and the
  least loyal users leave first, as retention studies show. See
  [Users and growth](/explanation/users-and-growth).

## Simplifications made on purpose

Each of these rules bends reality so the game is playable. Each one keeps the lesson and changes the
scale.

**Time runs fast.** One sim second is one calendar minute, so a calendar day passes in 24 real
minutes at 1× speed. The Team's calendar runs faster still. A Team day lasts one real minute, so hires
and deploys happen within one session.

**Users are impatient.** Real users drift away over weeks when a site gets slow. In Quorum, they
leave within minutes when Apdex falls under the target, so you can feel the effect and fix it. They
also stop leaving as soon as you fix it, and they hold no grudge.

**Overload drops at once.** A real server builds a backlog when it is over capacity. A Node in
Quorum drops work past capacity at once, which keeps each Step independent of the last. Queues are the
exception, because a [Queue](/components/queue) stores its depth.

**Latency settles in passes.** Latency and capacity depend on each other, because a slow Database
fills the App Servers that wait on it. The Simulation settles this circle with a few damped passes
each Step instead of an exact solution.

**Prices map two ways.** Prices billed by time map one sim second to one real hour, so a vCPU costs
what one costs per hour. Prices billed by use, such as egress, keep the real list price. The two
scales disagree on purpose: at the time-billed rate, egress would eat half of every page view's value.

Request values, the cost index, and the salary index are balance controls, not real prices. Revenue is
in game dollars, and the Valuation scales it to real-dollar ARR. See
[Cash, Burn, and funding](/explanation/money).

**A Company never dies.** No incident ends a Company, and running out of Cash is a setback, not a
game over. Users never fall below a small floor. Nothing runs while the Company is closed: no incident starts,
no users leave, and no cash moves. Real startups do die, and the game chooses not to model it.

**Regions are tabs over one Design.** Each Node has a region, and a call between regions pays the
round trip between them, based on the speed of light in fiber. The board shows one tab per region, but
the Simulation solves one graph.

## Deterministic on purpose

Real systems are noisy, and Quorum is exactly repeatable. The same save, the same seed, and the same
actions give the same result in every browser. All randomness, such as incident timing, comes from
one seeded generator in the save.

To guarantee this, the Simulation uses only math that every JavaScript engine computes the same way:
add, subtract, multiply, divide, and square root. It never calls functions such as `sin` or `exp`,
which engines compute slightly differently. Smooth curves such as the daily demand cycle are built
from those exact operations. That is how the server can replay a Challenge and check its score.

## What the game simplifies

- **Services.** A Service is a codebase owned by one team. The coordination cost of a shared database
  is the team size penalty, not a model of the database. See [Conway's law](/glossary/conways-law).
- **Feature Flags.** A flag sets the share of users a Feature reaches. Nothing removes a Feature's
  code afterwards, so flags never pile up as they do in a real codebase. See
  [feature flag](/glossary/feature-flag).
- **Spot instances.** A spot Node is cheaper and the provider can reclaim it with a 10 s warning. See
  [spot instance](/glossary/spot-instance).
- **Distributed tracing.** The Research adds the Dashboard's Services and waterfall tables. They come
  from per-hop times, not from stored traces. See [distributed tracing](/glossary/distributed-tracing).

The design documents keep a reality check: a table of every claim the game makes, with the rule that
models it, the simplification, and the source. The wiki's [glossary](/glossary) gives the real meaning
of each term and what it does in the game, side by side.
