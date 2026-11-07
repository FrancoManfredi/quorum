---
title: Cache stampede protection
summary: Stop many readers from rebuilding the same expired cache key at once, so one popular key cannot knock the database over.
section: patterns
group: Scaling reads and compute
order: 203
aliases: stampede, thundering herd, dogpile, request coalescing, single flight, early expiration, stale-while-revalidate, swr
---

A stampede happens when a hot key expires and every waiting reader asks the database for it at the same moment.

## Use it when

- The database CPU spikes at regular intervals that match a cache TTL.
- One key takes a large share of reads, so its expiry matters more than any other.
- A cache restart makes the database fall over and stay down while the cache refills.

## How it works

There are three fixes, and they combine. Coalescing (also called single flight) lets the first reader fetch while the others wait for its answer, so a thousand misses become one query. Early expiration has readers refresh a key slightly before it expires, picked at random, so keys do not all leave together. Stale-while-revalidate serves the old value while one request refreshes it, so nobody waits at all.

If a key takes 2,000 reads a second and the query takes 200 ms, an unguarded expiry sends about 400 queries before the first answer lands. Coalescing sends one.

## What it costs

Coalescing makes waiters slower while they wait, and a stuck fetch holds all of them. Early expiration spends a few extra reads. Stale-while-revalidate serves old data on purpose, which a price or an inventory count may not allow. None of this fixes a database that is too small for the miss rate.

## In Quorum

Place a [Cache](/components/cache) and research [Stampede protection](/research/stampede-protection). The first Design has no guards, and the second turns on two of them. The caption of each shows the result at the same Users. At steady state the gap is small and comes from early expiration, because coalescing only helps while the Cache is cold, as after a restart.

::Design{id="stampede-bare"}

::Design{id="stampede-guarded"}

The game also has stale-while-revalidate as a Cache switch, which serves old data and shows up as stale answers in the ledger. The [Cache stampede](/incidents/stampede) incident tests it, and the glossary defines [cache stampede](/glossary/cache-stampede) and [thundering herd](/glossary/thundering-herd).
