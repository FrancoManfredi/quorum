---
title: Backpressure
summary: Make a slow consumer push back on its producers, so a queue stays bounded instead of growing until memory or latency runs out.
section: patterns
group: Messaging and async
order: 405
aliases: bounded queue, max length, reject publish, flow control, load shedding, slow consumer
---

Backpressure is the signal a slow consumer sends upstream so producers slow down, queue less, or fail fast.

## Use it when

- Producers can outrun consumers for long stretches, not just bursts.
- An unbounded queue would make each task wait minutes, which users judge as a failure.
- You would rather refuse some work now than finish all of it too late.

## How it works

Bound the buffer. When a queue holds its maximum, new tasks are refused, and the producer must decide: retry later, drop the work, or tell the user. With a limit of 10,000 tasks and workers that drain 100 a second, nothing waits more than about 100 seconds.

Other forms are a bounded worker pool, a token the producer must hold to send, and a rate limit at the edge. All of them turn an invisible backlog into a visible refusal.

## What it costs

Someone loses work, so the producer needs a plan for a refusal. A limit set too low refuses work during ordinary bursts. Too high, and it protects nothing. Refusals can trigger retries, which add load, so pair the limit with backoff and with [load shedding](/patterns/load-shedding).

## In Quorum

::Design{id="queue-bounded"}

The Design starts with the Queue already at its limit and the Worker slower than arrivals, so the caption shows the refusals. The [Queue](/components/queue) card has a max length. Past it, the Queue refuses what its Workers cannot take, and those requests fail as dropped. With no limit, depth grows whenever Workers drain slower than tasks arrive, and a new task waits behind the backlog.

Add Workers or make them bigger to bring depth down. See [Capacity, utilization, and queues](/explanation/queues). The glossary defines [backpressure](/glossary/backpressure).
