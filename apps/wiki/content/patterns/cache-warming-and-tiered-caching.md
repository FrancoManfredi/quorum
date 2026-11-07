---
title: Cache warming and tiered caching
summary: Fill a cache before it takes traffic, and put a second cache between the first and the origin, so a cold or distant cache does not send every read to the source.
section: patterns
group: Scaling reads and compute
order: 204
aliases: warm cache, cold cache, prewarm, tiered cache, origin shield, regional cache, cache hierarchy
---

Warming fills a cache ahead of demand, and tiering lets a miss ask a nearby cache before it asks the origin.

## Use it when

- A cache restart or a deploy leaves the database overloaded for minutes.
- Many CDN edges miss the same large file and each fetches it from your origin.
- You know what will be hot before it is requested, such as a launch page.

## How it works

Warming replays recent or popular keys into the cache before it receives users. Tools do this by reading a key list from the database, or by loading a snapshot, as Redis does when it reloads its data file after a restart.

Tiering adds a layer. A CDN edge that misses asks a regional cache, and only that cache calls the origin. Ten edges missing the same video cost the origin one fetch, not ten. Cloudflare and Fastly both sell this as a shield or tiered cache.

## What it costs

Warming takes time and database reads of its own, so a warm-up run during peak hours can cause the load it was meant to prevent. A stale key list warms the wrong data. Tiering adds a hop on a miss and one more cache to purge, so a purge that reaches only the edge leaves old content in the regional tier.

## In Quorum

Warming is a switch on the [Cache](/components/cache), and it needs [Cache warming](/research/cache-warming), which in turn needs [Stampede protection](/research/stampede-protection). Tiered caching is a [CDN](/components/cdn) effect with no switch: [Tiered caching](/research/tiered-caching) makes edges ask a regional tier for video, and the Design lists it as a research it needs.

::Design{id="cache-warmed-tiered"}

The [Cache stampede](/incidents/stampede) incident is what warming prevents. The glossary defines [cache warming](/glossary/cache-warming) and [tiered caching](/glossary/tiered-caching).
