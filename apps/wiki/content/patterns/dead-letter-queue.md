---
title: Dead-letter queue
summary: Move a message that keeps failing to a separate queue after a few attempts, so one bad message cannot block the workers.
section: patterns
group: Messaging and async
order: 404
aliases: dlq, poison message, dead letter, failed messages, max attempts, redrive
---

A dead-letter queue holds messages that a consumer could not process, after a fixed number of attempts.

## Use it when

- A message can fail every time, such as a malformed payload or a record that was deleted.
- Workers stay busy while queue depth climbs, which is the sign of a poison message.
- People need to inspect or replay failed messages later.

## How it works

The consumer tries a message, and on failure the broker redelivers it after a delay. After the max attempts, often 3 to 10, the broker moves it to the dead-letter queue and the workers carry on. Without the limit, one poison message retries forever and takes most of the workers' time.

An alarm on the dead-letter queue's depth tells you something is wrong, and a redrive tool sends messages back once the bug is fixed.

## What it costs

Failed messages sit there until a person looks. Messages that were only unlucky, such as a database outage, land in the same place as truly bad ones. Order is lost for the parked message. A dead-letter queue with no alarm is a place where data quietly disappears.

## In Quorum

::Design{id="queue-dlq"}

The [Queue](/components/queue) card has a dead-letter switch and a max attempts value. With it on, a task is retried that many times, with a pause between tries, and then set aside. In the game a task that fails every attempt is lost, since there is no queue to inspect. Without it, a failing task retries forever.

The [Poison message](/incidents/poison) incident hits only a Queue with no dead-letter queue, and needs no Research to prevent. The glossary defines the [dead-letter queue](/glossary/dead-letter-queue). Pair it with [Retry with backoff](/patterns/retry-with-backoff) and [Idempotency keys](/patterns/idempotency-keys).
