---
title: CDN push and pull
summary: Put copies of your content on servers near users, either filling them on demand from your origin (pull) or uploading them yourself (push).
section: patterns
group: Scaling reads and compute
order: 206
aliases: cdn, content delivery network, edge cache, origin pull, origin push, purge, cache key, ttl, cloudflare
---

A CDN keeps copies of your responses at the edge, and pull and push differ in who puts them there.

## Use it when

- Most traffic is pages, images, or video that many users share.
- Users are far from your origin, and the round trip dominates latency.
- Egress from your servers is a large part of the bill.

## How it works

With pull, the first request for a file misses, the edge fetches it from your origin, stores it for the TTL, and serves the next visitors itself. You do nothing to publish. With push, you upload files to the CDN yourself, which suits large files that change rarely, such as installers or video segments.

The cache key decides what counts as the same file. A key of path alone shares one copy among everyone and has the best hit ratio. A key that includes cookies keeps personal pages apart. A TTL of an hour raises hits and also lets old pages live for an hour, which is why deploys purge the cache.

## What it costs

A key that leaves out the cookie can show one user's page to another, and a long TTL without a purge serves yesterday's release. Pull also makes the first visitor to each file slow, and a purge sends a wave of misses back to the origin.

## In Quorum

Place a [CDN](/components/cdn) after [Content delivery](/research/cdn) and link it in front of the App Server. The game models pull only, so push is out of scope. Purge on deploy is the nearest control: a deploy empties the edge, and it refills from the origin.

::Design{id="cdn-pull"}

The [Cached page leak](/incidents/page-leak) incident is the cache key mistake, and [Edge-side includes](/research/esi) is what makes a logged-in page cacheable at all. The glossary defines [CDN](/glossary/cdn-content-delivery-network).
