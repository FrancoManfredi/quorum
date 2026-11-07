---
title: Hot keys and hot shards
summary: When one key or one shard takes a large share of the traffic, adding servers does not help, so spread that key or change the shard key.
section: patterns
group: Scaling data
order: 303
aliases: hotspot, hot partition, celebrity problem, skew, key splitting, write sharding
---

A hot key or a hot shard saturates one machine while the rest of the fleet idles, so more machines buy nothing.

## Use it when

- One shard or one cache node runs red while the others sit near idle.
- A single item, such as a celebrity profile or a flash-sale product, draws a large share of reads.
- New rows always land on the same shard, because the key grows with time.

## How it works

Hashing spreads keys evenly, but it cannot spread one key. Two repairs exist. Pick a shard key that matches how the traffic is spread, and for a key that is hot anyway, split it: store copies under suffixed keys (`item:7#0` to `item:7#9`) and read a random one. A cache in front absorbs read-heavy keys too.

A range key such as an auto-increment ID sends every new user to the last shard. A hash of the ID does not. A hot key that takes writes is harder. A counter can be split into suffixed parts that a read adds up, but a value that must stay in step cannot.

## What it costs

Splitting a read-heavy key makes writes touch every copy, and splitting a counter makes a read sum every part. You also have to know which keys are hot, usually from metrics, and the hot set changes. A tenant key keeps a tenant together, which is good for queries and bad when one tenant is huge.

## In Quorum

::Design{id="hot-shard-range-key"}

The range key piles new users onto one shard, so one box takes the writes. Against the hash Design on [Sharding](/patterns/sharding), the same shards, Users and sizes give a lower Apdex and a longer p99.

::Design{id="hot-key-bare"}

::Design{id="hot-key-split"}

Both Boards run a Hot key incident on the Cache. Read the Load row on each card: without splitting, the Cache's capacity falls while the hot key runs, and with it the capacity stays whole. Nothing fails at this load, so the capacity figure is the evidence. On a [Cache](/components/cache), turn on key splitting so a hot key spreads over the cache's shards. It needs [Hybrid fan-out](/research/hybrid-fanout). A [Wide-column Store](/components/wide) has the same switch.

The [Hot key](/incidents/hot-key) incident sends a large share of reads to one key, and [Hot shard](/incidents/hot-shard) lands the biggest tenant on one shard. The glossary defines the [hot key](/glossary/hot-key).
