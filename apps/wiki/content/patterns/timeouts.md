---
title: Timeouts
summary: Give every network call a deadline, because a call that waits forever holds a thread, a connection and a user hostage.
section: patterns
group: Resilience
order: 501
aliases: timeout, deadline, hang, slow dependency, connect timeout, read timeout
---

A timeout is a deadline on a call to another service, and every such call needs one.

## Use it when

- A service calls another service, a database or a third-party API.
- Callers hold a resource while they wait: a thread, a connection, a worker slot.
- A dependency can be slow without being down, which is the common case.

## How it works

The caller starts a clock when it sends the request. If no answer arrives in time, it gives up, frees what it held, and fails or falls back. Set the deadline from the dependency's p99, not its average. A service that answers in 40 ms at p50 and 300 ms at p99 fits a 500 ms timeout, which cuts off only the stuck calls.

Deadlines should shrink as a request moves inward. If the user's browser waits 3 seconds, the front service allows its caller 2.5 and the database call 1, so no inner call outlives the request that needed it.

## What it costs

A timeout turns a slow answer into an error, so a deadline that is too short fails requests that would have worked. A deadline that is too long does nothing: with 30 seconds on every call, a slow database ties up every thread long before the first one expires. A timeout also does not tell you whether the work finished, so a retry after it must be safe to repeat (see [Idempotency keys](/patterns/idempotency-keys)).

## In Quorum

::Design{id="link-timeout"}

The timeout is a setting on the Link from the App Server to the Database. A Link waits a long default time and never retries until you own [Timeouts and retries](/research/timeouts), which lets you pick a shorter deadline. The Design sets the short one because a Database answers in milliseconds, so the caption matches a Link with the default wait. A call that passes the deadline fails as a `timeout` error, and the caller's slot frees at that point instead of later.

[Stop a retry storm](/guides/stop-a-retry-storm) shows what a deadline does under load, and [Errors and retries](/explanation/errors-and-retries) shows what happens to the load when callers give up. The glossary defines [timeout](/glossary/timeout).
