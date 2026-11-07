---
title: Multi-region with GeoDNS
summary: Open a second region, route each region's Users to it with GeoDNS, and keep reads local, so far Users stop paying the ocean twice on every request.
section: patterns
group: Stack ladder
order: 130
aliases: geodns, regions, latency abroad, europe, region tab, round trip, read replica abroad, anycast, geo routing
---

Run a copy of the stack near each large group of Users, and let GeoDNS send them there.

## Move up when

- Users on another continent are slow and the load bars look healthy, so the delay is distance.
- **Why users leave** lists far regions at the top.
- A far Users' request pays the round trip twice, once to open the connection and once to ask.

## The Design

Before, all Users enter the home region.

::Design{id="far-users"}

After, European Users enter their own Users Node.

::Design{id="geodns-two-regions"}

The picture shows the home tab. Nodes in Europe carry an EU tag and the round trip to reach them, and a link across regions shows its cost under the belt. The European App Server reads from a local replica and writes to the home primary.

## Why it works

With GeoDNS each region's Users enter their own Users Node, or the nearest one that is up. Their App Server sits beside them, so calls skip the ocean. A replica answers reads at home. Regions with no Node of their own, such as Asia-Pacific here, still reach the nearest one and pay its trip, which that region's own Apdex shows.

## What it costs

Writes still cross to the primary, and some replica reads come back stale. Calls between regions bill egress, so keep each region's App Server calling its own data. Each open region costs Cash to open and adds the Burn of every Node you copy into it. The Mirror copies a region for you and then drifts, and a Region outage takes down every Node in it that is not global.

## In Quorum

Set a Node's **Region** and place a Users Node there. Research [Multiple zones](/research/multi-az), [Multiple regions](/research/multi-region), [GeoDNS](/research/geo-dns) and [Infrastructure as code](/research/infra-as-code). Follow [Go global](/guides/go-global) and read [GeoDNS](/glossary/geodns). The next rung, [compute at the edge](/patterns/compute-at-the-edge), moves small handlers next to the user.
