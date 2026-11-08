---
title: Autoscaling, reactive and scheduled
summary: Add copies of a service when load rises and remove them when it falls, either after the load shows up or ahead of a peak you can predict.
section: patterns
group: Scaling reads and compute
order: 208
aliases: autoscaler, auto scaling group, hpa, scale in, scale out, target tracking, scheduled scaling, cooldown
---

An autoscaler changes the number of running copies to follow demand, so you pay for the peak only while it lasts.

## Use it when

- Traffic has a daily shape, so a fixed fleet is idle at night and short at noon.
- Spikes arrive faster than a person can add servers.
- The tier is stateless, so a new copy can take traffic as soon as it boots.

## How it works

A reactive policy reads a signal, such as CPU, requests per copy, or queue depth for workers. It compares the signal with a target and adds copies when it passes. A new copy takes time to boot and warm up, so a reactive policy always trails the load. A min keeps the floor high enough to survive a failure, and a max caps the bill.

A scheduled policy adds copies before a known peak, such as 9 a.m. on weekdays, so they are warm when users arrive. Reactive scaling then handles whatever the schedule missed.

## What it costs

Boot time is the weak point: scaling at the moment of a spike is too late for a slow-starting runtime. Aggressive scale-in causes flapping, and a missing max turns a bot flood into a large bill. Signal choice matters too. CPU misses a service that waits on a slow database.

## In Quorum

Link an [App Server](/components/server) into an [Autoscaler](/components/autoscaler) after researching [Autoscaling](/research/autoscaling). The schedule switch needs [Scheduled scaling](/research/scheduled-scaling). The Design pairs it with slow start on the [Load Balancer](/components/lb), so a new copy takes traffic gradually.

::Design{id="autoscaled"}

The [JVM warmup under load](/incidents/jvm-warmup) incident shows cold copies arriving mid-spike. The glossary defines [autoscaling](/glossary/autoscaling) and [diurnal traffic](/glossary/diurnal-traffic), and the [Autoscale the compute tier](/patterns/autoscale-the-compute-tier) step builds it piece by piece.
