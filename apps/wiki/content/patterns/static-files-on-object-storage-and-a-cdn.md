---
title: Static files on object storage and a CDN
summary: Serve pages and media from the edge and keep files in Object Storage, so the origin only handles what must be fresh.
section: patterns
group: Scaling steps
order: 109
aliases: cdn, cloudflare, s3, static assets, edge cache, object storage, egress, cache hit ratio
---

Put a CDN in front of the origin and keep uploaded files in Object Storage.

## Move up when

- Page views and video take most of the App Server's CPU and the egress line is large.
- Every user in the world waits for a round trip to one origin.

## The Design

::Design{id="origin-serves-pages"}

::Design{id="cdn-in-front"}

In the first picture every page view reaches the App Server. In the second, Users reach the CDN first. It answers what it has cached and sends misses and every other request kind to the origin.

## Why it works

The CDN's hit ratio is the share of page views it answers without touching your servers. The App Server and Database load bars fall, and p99 falls with them because the hit is answered near the user.

Two settings matter. A long TTL raises the hit ratio, and purge on deploy empties the edge when you release so no one sees old pages. A cache key with less in it raises hits further but can leak one user's page to another.

## What it costs

The CDN does not cache API reads, writes, logins or checkouts. A long TTL without a purge serves stale pages after a deploy. A purge makes the origin take a burst of misses while the edge refills. Object Storage reads wait longer for the first byte than a Database query.

## In Quorum

Research [Content delivery](/research/cdn) for the [CDN](/components/cdn) and [Object storage](/research/object-storage) for [Object Storage](/components/storage). The glossary defines a [CDN](/glossary/cdn-content-delivery-network) and [egress](/glossary/egress). [CDN push and pull](/patterns/cdn-push-and-pull) covers the pattern. The next step is to [add a cache](/patterns/add-a-cache).
