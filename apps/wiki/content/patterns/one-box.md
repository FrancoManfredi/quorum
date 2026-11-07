---
title: One box
summary: Run the code and the data on one machine. It is the cheapest way to launch and the right place to start.
section: patterns
group: Stack ladder
order: 101
aliases: single server, monolith, lamp stack, all in one, one server, starter box, garage
---

Start with one machine that runs your code and holds your data.

## Move up when

- The box's load bar sits near full for minutes at a time, and p99 climbs with it.
- A slow query or a traffic burst slows every page, because code and data draw on the same CPU and memory.
- You want to resize the app and the data separately.

## The Design

::Design{id="one-box"}

Users reach one App Server. Its Local database setting keeps Postgres on the same machine, so there is no second Node, no Link to call over, and no second bill.

## Why it works

At a few hundred Users the work is small and so is the bill. A request reads from a disk it shares a machine with, and you have one thing to deploy, watch and restart. You also learn what your traffic looks like before you pay for structure you may not need.

## What it costs

One machine is one failure. When the host dies, the app and the data die together, and every request fails until you replace it. Code and data also fight over the same CPU, RAM and page cache, so the busier one starves the other, and you cannot grow either alone.

## In Quorum

The starting [App Server](/components/server) runs Postgres on its own box until you link it to a [Database](/components/database). An [Instance failure](/incidents/instance) shows what the single box costs. The next rung is to [split the server and the storage](/patterns/split-the-server-and-storage).
