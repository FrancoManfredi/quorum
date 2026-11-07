---
title: Idempotency keys
summary: Tag each write with a unique key the server remembers, so a retried request does the work once.
section: patterns
group: Messaging and async
order: 406
aliases: idempotency, idempotent, duplicate, double charge, dedupe, exactly once
---

An idempotency key lets a client repeat a request without repeating its effect.

## Use it when

- A request changes state: a charge, an order, a transfer.
- The client may retry after a timeout and cannot tell whether the first attempt worked.
- A message queue can deliver the same message twice.

## How it works

The client generates a key, such as a UUID, once per operation and sends it with every attempt. The server stores the key with the result in the same transaction as the change. A repeat with a known key returns the stored result and does nothing else.

A card charge times out at 10 seconds. The charge actually went through, and the client retries. Without a key the customer pays twice. With one, the second attempt gets the first charge's receipt.

## What it costs

The server must keep keys for as long as a retry can arrive, often a day, so storage and lookup add up. The check and the write must be atomic, or two simultaneous attempts both pass. And a key identifies an operation, so reusing one for a different request must be an error, not a silent replay.

## In Quorum

The [Double charge](/incidents/double-charge) incident is the failure, and [Idempotency keys](/research/idempotency-keys) is the research that prevents it. The glossary defines [idempotency](/glossary/idempotency). Pair this with [Timeouts](/patterns/timeouts) and [Retry with backoff and jitter](/patterns/retry-with-backoff).
