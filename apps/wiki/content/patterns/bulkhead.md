---
title: Bulkhead
summary: Give each dependency or customer its own pool of capacity, so one failing part cannot drain the resources every other part needs.
section: patterns
group: Resilience
order: 504
aliases: bulkheads, isolation, noisy neighbor, blast radius, thread pool isolation
---

A bulkhead splits shared capacity into separate compartments, like the walls inside a ship's hull.

## Use it when

- One pool of threads, connections or workers serves several dependencies.
- A slow dependency can use up that whole pool.
- One tenant or one kind of traffic can crowd out the rest.

## How it works

Each dependency gets its own limit. A service with 100 worker threads might give 30 to the search call, 30 to payments and 40 to everything else. When search turns slow, its 30 threads fill and further search calls fail fast, while the 70 other threads keep serving pages. Without the split, search takes all 100 and the whole service stops, though only one feature was broken.

The same idea works at any size: separate connection pools, separate queues, separate deployments per customer tier, or separate cells that each serve a slice of users.

## What it costs

Walls waste capacity. A compartment can sit idle while its neighbor is full, so the total you need grows. The limits also need tuning, because a compartment sized too small rejects work that the system could have handled. Start with the dependencies most likely to hang.

## In Quorum

::Design{id="bulkhead-search"}

A bulkhead is a setting on a Link, not on the App Server. It stops one call from holding its caller's slot for longer than a short fixed time, so a slow Search Engine fails its own calls and frees the slot for the Database and Storage calls. The Link into search carries it, and the other Links keep their normal wait. Search is healthy at the solved load, so the caption matches the same Design without the bulkhead. [Bulkheads](/research/bulkheads) unlocks it and needs [Circuit breakers](/research/circuit-breakers).

The game's bulkhead limits how long a dependency may hold a slot, which is the same compartment idea applied to time. The [Connection Pooler](/components/pooler) guards a shared pool in a related way. The glossary defines [bulkhead](/glossary/bulkhead) and [blast radius](/glossary/blast-radius).
