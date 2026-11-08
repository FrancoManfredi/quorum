---
title: Autoscale the compute tier
summary: Link App Servers to an Autoscaler so the number of copies follows the load, inside a floor and a cap you choose.
section: patterns
group: Scaling steps
order: 119
aliases: auto scaling group, hpa, scale out, scale in, cooldown, target tracking, elastic
---

Let an Autoscaler add and remove App Server copies as load changes, instead of sizing for the worst hour.

## Move up when

- Demand swings through the day, and you either pay for idle copies at night or run hot at peak.
- You add copies by hand after every spike.
- A spike hurts before a person can react.

## The Design

::Design{id="autoscaled-servers"}

Users go through a Load Balancer to the App Server, which calls the Database. The App Server also links into the Autoscaler. No traffic passes through the Autoscaler. It watches its **Signal**, compares it with the target, and changes the copy count.

## Why it works

When the Node runs above target, the Autoscaler asks for more copies, and when it idles well below, it gives one back. The **Signal** should fit the runtime. CPU misreads a runtime that waits on I/O, because its worker slots fill while CPU stays low. Request rate follows traffic whatever the runtime, and queue depth suits a Worker. **Min copies** keeps the service up while a new copy boots, and **Max copies** is the cost guard.

## What it costs

New copies are not instant. A VM takes minutes to boot, so a sudden spike hurts before the copies arrive, and new copies start cold. More copies send more connections and queries to the Database, so it needs room, and a [pooler](/patterns/pooler-between-servers-and-database) may follow. A scaler with no cap can turn a bug into a large bill.

## In Quorum

Place an [Autoscaler](/components/autoscaler) after [Autoscaling](/research/autoscaling), and put copies behind a [Load Balancer](/components/lb). [Scheduled scaling](/research/scheduled-scaling) provisions ahead of a known peak. The pattern is on [Autoscaling](/patterns/autoscaling-reactive-and-scheduled), and [Survive a traffic spike](/guides/survive-a-traffic-spike) uses it. The next step keeps copies of data in sync: [Stream changes with CDC](/patterns/stream-changes-with-cdc).
