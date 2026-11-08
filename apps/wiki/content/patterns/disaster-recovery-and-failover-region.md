---
title: Disaster recovery and a failover region
summary: Back up the primary, keep a standby for zone loss and a store spread across regions for region loss, and prove it with a drill.
section: patterns
group: Scaling steps
order: 132
aliases: dr, failover, standby, rpo, rto, backups, pitr, region outage, dr drill, restore drill, multi az
---

Plan for losing a zone and for losing a region, because they need different answers.

## Move up when

- A Region outage takes your home region's Nodes down and Users have nowhere else to go.
- You cannot say how much data a lost primary would cost.
- A backup has never been restored, so nobody knows whether it works.

## The Design

::Design{id="failover-region"}

A Wide-column Store with **Spread** replicates across the open regions, so it keeps serving reads and taking writes when the home region goes. Both App Servers link to it, and the home Users also link to the European App Server, so their requests have a live path when the home App Server is down. GeoDNS sends Users to the nearest region that is up.

## Why it works

The drill fails the home region and passes once errors fall under 1%. A store that spreads across regions survives, and with a read and write quorum of two, a read after the failover still sees the last write. A single primary does not survive: its writes stay down until its region returns. With two App Servers, an outage costs home Users some latency and nothing else.

A standby in another zone covers a zone loss in seconds and bills a second box. It does nothing for a region. For a Database with no remote copy, point-in-time recovery archives the write log, so the loss is minutes instead of a night. A restore drill proves the backup works, because an untested one can fail.

## What it costs

You pay for a second region's Nodes while it sits mostly idle, and for standby and backup Burn on top. A spread store costs several times a single Database, because every region holds a copy. Failing a region over restarts only stateless Nodes, cold, and never moves data, so only a spread store passes the drill. The game has no cold or warm standby tiers, only these settings.

## In Quorum

Set **Spread** on a [Wide-column Store](/components/wide) after researching [Leaderless replication](/research/leaderless). On a [Database](/components/database), set **Backup** and **Standby**. Research [Backups](/research/pitr), [Restore drills](/research/restore-drills), [Multiple zones](/research/multi-az) and [Disaster recovery drills](/research/dr-drills). The [Region outage](/incidents/region) and [DR drill](/incidents/dr-drill) incidents test it. Read [RPO and RTO](/glossary/rpo-and-rto) and [Prepare for an Exit](/guides/prepare-for-an-exit). The next step, [an LLM behind a gateway on GPUs](/patterns/llm-behind-a-gateway-on-gpus), adds AI prompts.
