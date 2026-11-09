---
title: Shard by shop: Shopify
summary: Shopify split its MySQL fleet into pods by shop, then routed each request to the pod that owns it.
section: patterns
group: Ran in production
order: 951
aliases: shopify, pods, sharding, multi-tenant, mysql, sorting hat, black friday
---

Shopify ran one large MySQL database until 2015, when buying a bigger server stopped being an option. The team sharded by `shop_id`, then went further: each shard became a pod with its own database, cache, and app servers. A load balancer component called Sorting Hat reads the shop from the request and adds a header that sends it to the right pod.

## The system

The pod is the unit of isolation. A pod holds a subset of shops, its own MySQL shard, Redis, and Memcached, and it can run anywhere. App servers and job workers are shared across pods, so a flash sale in one pod can use capacity from the rest of the region. In 2024 the platform peaked at 489 million requests a minute at the edge, 117 million a minute at app servers, and 14.8 trillion database queries over the weekend.

## The board

::Design{id="shopify-tenant-shards"}

The Database has four shards on a tenant key, which is the pod boundary. The Load Balancer stands for Sorting Hat, the Cache is the per-pod Redis and Memcached, and the Queue and Workers are the shared job tier. The Payment Provider answers checkouts.

## Why it works

A tenant key keeps one shop's rows on one shard, so most queries stay local and a failure stays inside one pod. The trade is the hot tenant: one huge shop can still make its shard the busy one, which is why Shopify gives big merchants a dedicated pod. [Shard the database](/patterns/shard-the-database) covers the general trade.

## Where the game stops

The board shards the database but keeps one set of app servers, because Quorum has no pod-level app tier. It also has no Sorting Hat, so the shard key does the routing that the header does at Shopify. The caption is Quorum's result, not Shopify's traffic.

## Sources

- [A Pods Architecture To Allow Shopify To Scale, Shopify Engineering](https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale): the pod, Sorting Hat, and why sharding alone was not enough.
- [Shard Balancing: Moving Shops Confidently with Zero-Downtime at Terabyte-scale, Shopify Engineering](https://shopify.engineering/mysql-database-shard-balancing-terabyte-scale): how a shop moves between pods.
- [How we prepare Shopify for BFCM, Shopify Engineering](https://shopify.engineering/bfcm-readiness-2025): the 2024 peak numbers and the 2025 test plan.
