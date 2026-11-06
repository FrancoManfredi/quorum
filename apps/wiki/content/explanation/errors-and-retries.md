---
title: Errors and retries
summary: Why requests fail, how timeouts and retries can turn a short slowdown into a long outage, and why more App Servers can break the Database.
section: explanation
order: 4
era: 1
aliases: errors, timeout, retry, retry storm, backoff, jitter, circuit breaker, connections, refused, max_connections, idempotency, duplicate
gdd: /design/04-simulation
---

A failed request earns nothing and counts as a frustrated user. Every failure has one cause, and each
cause points to a different fix. Some failures also create more load, which is how a small problem
becomes an outage.

## Every failure has a cause

Until you study [Structured logs](/research/logs), the screen shows errors as one number. The
research splits that number by cause:

- `stranded`: no Node on the path accepts the kind.
- `dropped`: the Node was over capacity and had no room.
- `refused`: a limit said no, such as the Database's connection limit.
- `down`: the Node is in an outage.
- `timeout`: the caller stopped waiting.
- `oom`: the process ran out of memory and was killed.
- `crash`: a bug or a crash took the request down.
- `stale`: a read returned old data where the kind needs fresh data.
- `blocked`: the WAF blocked a real user by mistake.
- `upstream`: a managed service, such as the Payment Provider, failed.
- `throttled`: a rate limit rejected the request.
- `duplicate`: a retried checkout charged a card twice.

With the split, "errors are up" becomes a question you can answer.

## Timeouts protect the caller

A Link waits for an answer until its timeout. Before the
[Timeouts and retries](/research/timeouts) research, every Link waits 30 seconds and never retries.
After it, you set each Link's timeout and retry policy.

A [timeout](/glossary/timeout) is a trade. On a runtime that holds a slot per request, a caller
holds its slot until the call answers or times out. A short timeout frees the slot sooner, so one
slow Database cannot fill every App Server. The price is that slow calls fail instead of finishing
late, and the work the callee already did for them is wasted, because nobody uses the answer.

## Retries multiply load

A retry turns one failure into another attempt. With naive retries, a Link retries at once, up to
three times. If a share `f` of calls fails, each call becomes this many attempts:

```formula
attempts = 1 + f + f² + f³
```

At a 50% failure rate, that is nearly twice the load on the callee. It was failing because it was
overloaded, so retries hand it almost double the work.

::Quiz{question="A Link retries at once, up to three times. Half of its calls fail. About how much load does the callee now get, compared with no retries?" options="1.5 times|Nearly 2 times|4 times" answer="2" explain="Attempts per call are 1 + 0.5 + 0.25 + 0.125, which is about 1.9. Load nearly doubles exactly when the callee can least take it."}

## How a retry storm outlives its cause

Retries form a feedback loop: overload causes failures, failures cause retries, and retries cause
more overload. The Simulation carries each retrying Link's failure share into the next Step, so the
loop keeps going on its own.

In the [Retry storm](/incidents/retry-storm) incident, the Database slows down for a short time. With
naive retries, the load stays above its capacity after the slowdown ends, and the Database queues what
it cannot take. The incident ends only when that backlog drains. This is a
[metastable failure](/glossary/metastable-failure): the system has two stable states, and the bad
one keeps itself going.

::Sandbox{id="retry-storm"}

Three tools break the loop:

- [Backoff with jitter](/research/backoff-jitter) waits before each retry, at a random delay, and keeps
  extra calls inside a small retry budget. Most failures are not retried during a storm.
- [Circuit breakers](/research/circuit-breakers) stop calls on a Link when most of them fail. The
  breaker fails calls at once for a few seconds, then tries again.
- [Priority load shedding](/research/load-shedding) drops the lowest-value kinds on an overloaded App
  Server, so the requests it keeps stay fast.

:::Note{tone="real"}
Bronson and others described metastable failures at HotOS 2021, and Huang and others measured them
across real outages at OSDI 2022. Cloud providers advise exponential backoff
with jitter for every client, and many services also cap retries with a budget.
:::

For a step-by-step fix during play, see [Stop a retry storm](/guides/stop-a-retry-storm).

## Connections: why more servers can break the Database

The Database runs one process per connection, so it accepts only a limited number of them. Every App
Server process holds its own pool of connections, and the Database needs the sum of every pool.

So adding App Servers raises the need. Past the limit, the extra queries fail as `refused`, and the
fix you made for CPU breaks the Database instead. The [Connection exhaustion](/incidents/connections)
incident makes it worse by doubling every pool.

A [Connection Pooler](/components/pooler) fixes this. In transaction mode, many app connections share
a few server connections. The price is that code which keeps session state breaks, until you ship the
task that removes it. See [connection pooling](/glossary/connection-pooling).

::Sandbox{id="connection-limit"}

## Retries and money

A checkout must not run twice. It sends a charge to the Payment Provider, and if the charge times out
and the Link retries, the first attempt may have succeeded already. The customer pays twice, and the
request fails as `duplicate`.

The [Idempotency keys](/research/idempotency-keys) research and the Idempotency keys engineering task
that puts it in the code give each charge a key, so a retry never charges twice. Without them, set the
charge Link's retries to none. See [idempotency](/glossary/idempotency) and the
[Double charge](/incidents/double-charge) incident.
