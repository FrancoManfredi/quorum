---
title: Queue-based load leveling
summary: Put a queue between a bursty producer and a steady consumer, so a spike becomes a short wait instead of a failure.
section: patterns
group: Messaging and async
order: 401
aliases: queue, message queue, async, background jobs, buffer, worker, load leveling
---

A queue absorbs a burst of work and lets workers drain it at a pace they can sustain.

## Use it when

- The user does not need the result before the response, like a confirmation email or a thumbnail.
- Traffic comes in bursts, and sizing for the peak would leave capacity idle the rest of the day.
- A downstream service is slower or less reliable than the front end.

## How it works

The web tier writes a job to the queue and answers at once. A pool of workers reads jobs and does the slow part. If 5,000 signups arrive in a minute and workers handle 50 per second, the queue grows for a while and then empties, and no signup fails. Add workers to drain faster, or scale them on queue depth.

Delivery is usually at-least-once, so a job can run twice after a crash. Make jobs safe to repeat, and send jobs that keep failing to a dead letter queue instead of retrying them forever.

## What it costs

The work is no longer instant, so the user sees a delayed result or a status page. A queue that only grows means the workers are slower than the arrival rate, and then waiting time is unbounded, not leveled. Watch queue depth and the age of the oldest job, because depth alone hides slow jobs.

## In Quorum

::Design{id="queue-leveled"}

The App Server links to a [Queue](/components/queue) and to the Database. Kinds that can go async, such as uploads, exports, and webhooks, hand most of their work to the Queue, so the user waits only for the enqueue. The Queue links to a [Worker](/components/worker), which sizes the drain rate. Resize Workers, or add copies, when Queue depth keeps growing.

Research [Background jobs](/research/background-jobs), then [Message queues](/research/queues). [Capacity, utilization, and queues](/explanation/queues) explains why waiting rises with load. The glossary defines [at-least-once delivery](/glossary/at-least-once-delivery) and the [dead letter queue](/glossary/dead-letter-queue).
