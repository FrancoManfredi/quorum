---
title: Own the edge: Netflix
summary: Netflix built its own CDN and put a memcached tier in front of the database, so video and personalized reads never touch the origin.
section: patterns
group: Ran in production
order: 953
aliases: netflix, open connect, cdn, evcache, memcached, streaming
---

Netflix started Open Connect in 2011, after the growth of streaming made a standard CDN too expensive. Open Connect is Netflix's own network of cache appliances, placed inside internet exchange points and, for qualifying ISPs, inside the ISP's own data center. Netflix said in 2016 that it carried 100% of its video traffic, about 125 million hours a day, from close to 1,000 locations.

## The system

The control plane runs on AWS: signup, browsing, playback, and the personalized data behind them. EVCache, a memcached tier, holds that data. Each write goes to every zone in the region, and a Kafka pipeline replicates it across regions, so any region can serve any member. The video itself never touches AWS. The player asks Open Connect for the bits.

## The board

::Design{id="netflix-own-cdn"}

The CDN is Open Connect: a cache close to the viewer that answers media without the origin. The App Servers are the control plane, the Cache is EVCache, the Database is the source of truth, and Object Storage holds the video objects the edge has not cached.

## Why it works

Two caches answer two different questions. The edge answers the same bytes to millions of viewers, so a copy near them removes almost all of the long-haul traffic. EVCache answers a personalized read from memory, so the database sees fewer queries. [CDN push and pull](/patterns/cdn-push-and-pull) and [tiered caching](/patterns/cache-warming-and-tiered-caching) cover the two layers.

## Where the game stops

The game's CDN is a managed Component, not a fleet of Netflix appliances inside ISPs. The board does not show EVCache's cross-region Kafka replication or its per-zone writes. The caption is Quorum's result, not Netflix's traffic. The shape is the part that carries: an edge for the bytes, a memory tier for the personal data.

## Sources

- [Open Connect Overview, Netflix](https://openconnect.netflix.com/Open-Connect-Overview.pdf): what Open Connect is, how the appliances are placed, and what the control plane does.
- [Caching for a Global Netflix, Netflix Technology Blog](https://netflixtechblog.com/caching-for-a-global-netflix-7bcc457012f1): EVCache, its per-zone writes, and the Kafka replication path.
- [How Netflix works with ISPs around the globe, About Netflix](https://about.netflix.com/en/news/how-netflix-works-with-isps-around-the-globe-to-deliver-a-great-viewing-experience): the 2016 figures for video share and the number of locations.
