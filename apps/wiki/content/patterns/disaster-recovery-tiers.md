---
title: Disaster recovery tiers
summary: Choose how much standby capacity to keep for a lost region, from backups alone to a second site that serves traffic all the time, and pay for the speed you need.
section: patterns
group: Operate and observe
order: 706
aliases: disaster recovery, dr, backup and restore, pilot light, warm standby, active-active, multi-site, failover region, standby
---

Disaster recovery tiers trade money for recovery speed: the faster you must be back, the more idle or duplicate capacity you pay for.

## Use it when

- A whole region or zone loss would end the business, not just spoil a day.
- The business says how long it can be down and how much data it can lose, so the tier is a choice and not a guess.
- You have backups but have never restored one.

## How it works

AWS's whitepaper names four tiers, cheapest first:

1. **Backup and restore.** Copy data elsewhere, and rebuild everything after the disaster. Recovery takes hours.
2. **Pilot light.** Keep the data replicated and the core running, and start the rest on demand. Recovery takes tens of minutes.
3. **Warm standby.** Keep a scaled-down copy of the whole stack running, and scale it up on failover. Recovery takes minutes.
4. **Active-active.** Serve traffic from two sites at once, so a loss only removes half the capacity. Recovery is near zero.

A team that loses a region at `02:00` with only nightly backups restores a day-old copy and rebuilds servers by hand. A team with active-active already serves from the other site.

## What it costs

Each tier up multiplies the bill and the complexity, and active-active adds the cross-site consistency problems of [replication strategies](/patterns/replication-strategies). The common mistake is an untested restore. A backup you have not restored is a hope, so rehearse it.

## In Quorum

The game covers the tiers that matter. A snapshot-only Database is backup and restore. A zone standby covers a lost zone. A replica in another region behind GeoDNS is a warm standby, and a Spread store is active-active. It has no pilot light. The Design below shows a zone standby.

::Design{id="dr-zone-standby"}

[Point-in-time recovery](/research/pitr) unlocks backups, [Multiple zones](/research/multi-az) unlocks the standby, and [Disaster recovery drills](/research/dr-drills) runs the scripted regional outage the IPO checklist asks for. The [Zone outage](/incidents/zone) incident shows a standby taking over. See [RPO and RTO](/patterns/rpo-and-rto) for the two numbers a tier buys, and the glossary entry on [availability zones](/glossary/availability-zone).
