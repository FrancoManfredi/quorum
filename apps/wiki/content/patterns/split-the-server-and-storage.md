---
title: Split the server and the storage
summary: Move the data off the App Server into its own Database Node, so code and data stop fighting over one machine and each can grow alone.
section: patterns
group: Stack ladder
order: 102
aliases: separate database, two tier, app and database, web tier, data tier, database server
---

Put the Database on its own Node and have the App Server call it over a Link.

## Move up when

- The single box shows a red load bar, and its CPU and memory split between running code and serving data.
- A slow query makes every page slow, because both live on the same machine.
- You want to resize the app and the data separately, since one is usually full long before the other.

## The Design

::Design{id="split-storage"}

Users send requests to the App Server. The App Server runs your code and calls the Database for anything it must read or write. Nothing else changed: the same traffic crosses one more hop.

## Why it works

A Database wants memory and fast disk. An App Server wants CPU. On one box they compete, and the busier one starves the other. After the split, each Node has its own load bar, so the card that turns amber tells you which tier to grow.

The split also makes the data a shared place. Two App Servers can call one Database, which is the step that lets you add servers later.

## What it costs

Every request now pays a network hop to the Database, so latency rises a little. You pay for two Nodes where you paid for one, and the Link can fail or time out in ways a local disk cannot. Keep the timeout short so a stuck Database does not hold the App Server's workers.

## In Quorum

Place a [Database](/components/database) and link the [App Server](/components/server) to it. The Link's timeout needs [Timeouts and retries](/research/timeouts). The next rung adds a [Load Balancer](/patterns/several-app-servers-behind-a-load-balancer) in front of more App Servers, and [Connection pooling](/patterns/connection-pooling) protects the Database when they multiply.
