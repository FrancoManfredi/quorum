---
title: Consistent hashing
summary: Place keys on a ring of servers, so adding or removing one server moves only its share of the keys instead of nearly all of them.
section: patterns
group: Scaling data
order: 302
aliases: hash ring, rendezvous hashing, virtual nodes, vnodes, modulo hashing, key placement
---

Consistent hashing maps keys to servers so that a change in the server list moves only a small share of the keys.

## Use it when

- A key must always reach the same server, such as a cache entry, a shard or a user's session.
- Servers come and go, and a plain `hash(key) % n` would move almost every key each time `n` changes.

## How it works

Hash each server onto a ring, hash each key onto the same ring, and give the key to the next server clockwise. With 10 servers, removing one hands its keys to its neighbour and leaves the other nine servers' keys where they were. Modulo hashing would remap about 90% of all keys on the same change.

A single point per server gives uneven slices. Real systems put each server on the ring many times, as virtual nodes, so slices even out and a failed server's keys spread over many neighbours instead of one.

## What it costs

The ring spreads keys evenly, not load. One popular key still lands on one server, which is a [hot key](/patterns/hot-keys-and-hot-shards). Placement also ignores how busy a server is, so a slow server keeps its share. The routing layer must know the same ring everywhere, or two clients disagree about where a key lives.

## In Quorum

::Design{id="hash-balanced-pair"}

A [Load Balancer](/components/lb) can split by **Consistent hash**. Each target takes an equal share of the keys whatever its load, and a target that leaves moves only its own keys. The two App Servers are the same size on purpose, because the split ignores load. The Policy option needs [Load balancing algorithms](/research/lb-algorithms).

A [Wide-column Store](/components/wide) places each key on its replicas the same way. The glossary defines [consistent hashing](/glossary/consistent-hashing), and [sharding](/patterns/sharding) uses the same idea for data.
