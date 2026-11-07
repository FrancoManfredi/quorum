---
title: Retry with backoff and jitter
summary: Retry a failed call after a growing, randomized wait, so a brief fault heals instead of turning into a retry storm.
section: patterns
group: Resilience
order: 502
aliases: retry, backoff, jitter, exponential backoff, retry storm, thundering herd, retry budget
---

A retry heals a short fault only if it waits longer each time and varies the wait, because callers that retry together keep a struggling dependency down.

## Use it when

- A call fails for a reason that may pass: a dropped connection, a deploy, a brief overload.
- The call is safe to repeat.
- Many callers talk to the same dependency, so their retries add up.

## How it works

The caller waits a base delay after the first failure and doubles it after each one, up to a cap: 100 ms, 200 ms, 400 ms. Jitter picks a random point inside that window, so a thousand callers that failed together do not return together. A retry budget caps retries at a share of normal traffic, say 10%, and stops when the budget is spent.

Without backoff the arithmetic is cruel. A database that slows for 20 seconds, behind callers that retry 3 times at once, receives up to 4 calls for every request. The slowdown ends and the load does not.

## What it costs

Every retry is extra load on a dependency that is already struggling. Backoff softens it and a budget bounds it, but neither removes it, and retries at several layers multiply: 3 attempts at each of 3 layers is 27 calls for one request. Retry at one layer, usually the one closest to the user. Pair retries with a [circuit breaker](/patterns/circuit-breaker) for the case where the fault does not pass.

## In Quorum

Both Designs below put the same short timeout on a Link into an undersized Database. Only the retry policy differs.

::Design{id="retries-naive"}

With **Naive** retries, each failed call is sent again at once. The caption shows the damage as errors and a long tail, because the Database gets more calls than the Users sent.

::Design{id="retries-backoff"}

With **Backoff**, retries wait and spread out, and the extra calls stay inside a small budget. Apdex rises and the p99 falls against the first Design, though the Database is still too small and still drops requests. Backoff limits the harm, and only capacity fixes the cause. Backoff needs [Backoff with jitter](/research/backoff-jitter) on top of [Timeouts and retries](/research/timeouts).

The [Retry storm](/incidents/retry-storm) incident shows the failure, and [Stop a retry storm](/guides/stop-a-retry-storm) walks through the fix. The glossary defines [retry with backoff and jitter](/glossary/retry-with-backoff-and-jitter) and the [thundering herd](/glossary/thundering-herd).
