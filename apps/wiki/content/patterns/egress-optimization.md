---
title: Egress optimization
summary: Cut the bill for bytes that leave your cloud by compressing responses, serving them from a CDN, and keeping chatty traffic inside one zone and region.
section: patterns
group: Cost
order: 902
aliases: egress, bandwidth cost, data transfer, transfer fees, r2, cloudflare r2, compression, gzip, brotli, cross az, cross region, cdn
---

Cloud providers charge for data leaving their network, so send fewer bytes, from cheaper places, over shorter paths.

## Use it when

- The bill has a large data-transfer line and the app serves images, video or big JSON.
- Services in different zones or regions call each other often.
- You serve files straight from the origin instead of a CDN.

## How it works

Four levers, in the order they pay back. **Compress** text responses with gzip or Brotli, which often cut HTML and JSON by two thirds or more. **Cache at a CDN**, which serves repeat requests from the edge, often at a lower rate, and spares the origin. **Choose storage with free egress**, such as Cloudflare R2, for files you serve publicly. **Keep traffic local**, since a call between availability zones bills both ways.

Real prices make it concrete. AWS charges around $0.09 per GB to the internet for the first tier, about $0.01 per GB each way between zones, and R2 charges nothing for egress. At 50 TB a month, AWS's tiers (the first 10 TB at $0.09, the next 40 TB at $0.085) come to roughly $4,400 before any free allowance.

## What it costs

Compression spends CPU, and it does nothing for images, which are already compressed. A CDN adds a hop on a miss and a cache to purge. Free egress usually comes with per-request fees.

## In Quorum

Egress is billed from Seed. The first Design serves a media-heavy mix straight from an S3-style store with no compression. The second applies three of the levers to the same Users and mix, and its caption shows the egress part of Burn fall. Total Burn does not fall at this load, because the CDN costs more than the egress it saves.

::Design{id="egress-heavy"}

::Design{id="egress-lean"}

The App Server's compression applies to the kinds that can shrink, such as pages and reads, and costs CPU. The CDN answers cacheable pages at the cheaper edge rate. The R2-style product carries files and media to the internet at no egress fee, and it reaches that price only when an App Server links to it. [Compression](/research/gzip), [Content delivery](/research/cdn) and [Egress optimization](/research/egress-optimization) unlock them, and the last needs [Object storage](/research/object-storage). See the [CDN](/components/cdn) and [Object Storage](/components/storage) pages, [Cut the cloud bill](/guides/cut-the-cloud-bill), and the glossary on [egress](/glossary/egress) and [compression](/glossary/compression).
