---
title: Latency vs throughput
summary: Latency is how long one request takes, throughput is how many finish per second, and pushing one up often pushes the other the wrong way.
section: patterns
group: Foundations
order: 10
aliases: latency, throughput, response time, rps, qps, batching, saturation
---

Latency is the time one request takes from send to answer, and throughput is the number of requests that finish each second. A design can be good at one and bad at the other.

Take a server with 8 workers and a request that needs 100 ms of work. Each worker finishes 10 requests a second, so the server's throughput tops out at 80 a second, and a request that arrives when a worker is free takes 100 ms. At 40 requests a second both numbers are fine. At 79 they are not, because arrivals wait in line for a free worker, and the wait comes out of the user's latency while throughput stays flat at 80.

That is the shape to remember. Throughput rises with load until a limit, and past about 70% of that limit latency climbs steeply. In a simple queue the wait grows in proportion to ρ / (1 − ρ), where ρ is the share of capacity in use. Going from 50% busy to 90% busy multiplies the wait by 9.

Batching trades the other way. A database that commits one row at a time might manage 2,000 inserts a second, and 100 rows per commit can pass 20,000, but each row waits for its batch to fill.

## What it changes about a design

Size a service for the latency you promise, not for its peak throughput. A box that survives 80 requests a second in a benchmark should be planned for about 55 in production, so the queue stays short. Add copies before the first one runs hot, because the last 20% of capacity buys very little.

Choose by who is waiting: a person at a spinner needs low latency, and a nightly export needs throughput. When one path needs both, send the user's request down the quick path and push the heavy part to a queue ([Queue load leveling](/patterns/queue-load-leveling)).

Report latency as percentiles ([Percentiles, not averages](/patterns/percentiles-not-averages)), and use [Little's law](/patterns/littles-law) to turn a latency and a rate into the concurrency you must provide.

## In Quorum

Every Node shows its [utilization](/glossary/utilization), and the Dashboard charts latency beside it, so you can watch one climb as the other flattens. [Latency and percentiles](/explanation/latency) explains how the game builds a request's time, and [Capacity, utilization, and queues](/explanation/queues) covers the wait that grows near the limit. Satisfied users are counted by [Apdex](/glossary/apdex).
