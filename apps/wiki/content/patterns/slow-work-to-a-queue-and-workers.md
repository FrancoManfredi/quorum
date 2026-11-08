---
title: Slow work to a queue and workers
summary: Hand work the user does not wait for to a Queue, and let Workers drain it at their own pace.
section: patterns
group: Scaling steps
order: 116
aliases: message queue, background jobs, workers, rabbitmq, sqs, sidekiq, async, task queue, dead letter
---

Have the App Server enqueue slow work and answer at once, and let Workers do the work later.

## Move up when

- Exports, uploads, or webhooks hold App Server slots, and page latency climbs when they run.
- A spike in slow work makes fast requests time out.
- The work can happen seconds later without the user minding.

## The Design

::Design{id="queue-and-workers"}

The App Server answers pages and reads itself, and for an export it hands a task to the Queue and returns. The Queue holds tasks, and the Workers take them and read the Database. Both the App Server and the Workers call the same Database, so it has to take their combined load.

## Why it works

The user waits only for the enqueue, which is fast, so slow work no longer holds a request slot. Queue depth becomes the first gauge to watch. When it grows, the Workers are too slow, and adding copies fixes it without touching the App Server.

The settings keep it honest. A **dead-letter queue** parks a task that keeps failing, so it cannot loop forever. **Max attempts** says how many tries a task gets. **Max length** refuses new tasks when full, instead of letting a backlog grow unseen. A Worker's **Prefetch** lets each process take tasks ahead of time, which saves broker round trips and loses those tasks if it crashes.

## What it costs

You add two Nodes and a delay the user can see, since the result is not ready when the request returns. Delivery is at least once, so a task can run twice and the work must be idempotent. A backlog hides trouble until it hits the limit. The Workers also read the Database, so it can become the bottleneck.

## In Quorum

Place a [Queue](/components/queue) and a [Worker](/components/worker) after [Background jobs](/research/background-jobs) and [Message queues](/research/queues). The pattern is [Queue-based load leveling](/patterns/queue-load-leveling), with [competing consumers](/patterns/competing-consumers) and a [dead-letter queue](/patterns/dead-letter-queue). The glossary has [at-least-once delivery](/glossary/at-least-once-delivery). The next step sends one task to many receivers: [Message platform for fan-out](/patterns/message-platform-for-fan-out).
