---
title: Survive a traffic spike
summary: Keep serving when demand jumps several times for a short while, during the spike and with spare capacity, caches, and load shedding before the next one.
section: guides
order: 5
era: 1
aliases: traffic spike, spike, hug of death, slashdot, demand, surge, viral, burst
gdd: /design/11-incidents
---

Use this guide when a [Traffic spike](/incidents/spike) incident starts, or when you want your
Design to survive the next one with no action.

In a spike, a big site links to you and demand rises 3 to 10 times for a short while, so every Node
on the path gets the extra load at once. A Design with no spare capacity drops requests and loses
users, because waiting time climbs fast as a Node nears full load. That curve is what
[Capacity, utilization, and queues](/explanation/queues) draws.

## Recognize the spike

- A red line labelled **▲ SEV3 Traffic spike** appears on the Dashboard charts (D).
- The **Requests** row on the Users Node jumps. Every Node card turns amber, then red.
- With [Alerting](/research/alerting), the pager fires on errors, p99, or saturation.

## During the spike

The spike ends on its own. Your goal is to lose as few users as you can until it does. An incident
that hurts users for more than half of its time [escalates](/explanation/incidents) once: it lasts
longer and the spike grows by half.

1. Press **Space** to pause if you need time to look. With the setting **Pause on SEV1 and SEV2**
   on, the game pauses for you on the worse incidents.
2. Find the first Node on the path that turned red, which is usually the App Server or the
   Database.
3. Select it and select **Larger**, or press **U**. Larger capacity helps at once, after a short
   restart.
4. If the App Server is red, place a second copy behind the Load Balancer instead, so that no
   restart drops traffic.
5. If you own [Priority load shedding](/research/load-shedding), open the **Overload** section of
   each App Server and select **Shed low value**, so that a saturated App Server drops the
   lowest-value kinds first, starting with bots.
6. Watch the Apdex figure on the HUD, and stop making changes once it holds near the target.

:::Note{tone="warn"}
Do not add an Autoscaler during a spike to save you. A new copy on a VM takes 180 seconds to
serve, so it usually arrives after the spike. In a [Kubernetes Cluster](/components/cluster), a new
copy takes 30 seconds.
:::

## After the spike

1. When the incident ends, a postmortem Mail arrives. If it offers an action item, press its button
   to put that Study first in the queue. Filing the message without it leaves the item open, and the
   incident stays twice as likely.
2. Use **Smaller (free)** on the Nodes you resized, once Load falls, if Burn matters to you.

## Prepare for the next spike

A Design that survives spikes with no action has headroom on every Node of the path. Do these in
order of cost.

1. **Keep spare capacity.** Size each Node so that its Load stays under 50% at the daily peak, then
   check the **Saturation** row on the Dashboard at the evening peak.
2. **Cache reads.** Research [Caching](/research/caching) and place a [Cache](/components/cache) in
   front of the Database, so most extra reads in a spike never reach it.
3. **Answer pages at the edge.** From the Seed Era, research [Content delivery](/research/cdn) and
   place a [CDN](/components/cdn) in front of the App Servers, which answers cacheable pages and
   media without your servers.
4. **Spread App Servers.** Use a [Load Balancer](/components/lb) with two or more copies of the App
   Server. A second copy adds headroom with no restart, and it also survives an instance failure.
5. **Scale with demand.** Research [Autoscaling](/research/autoscaling). Link the App Servers into
   an [Autoscaler](/components/autoscaler), and set its **min** to the copies you need at the peak.
   The minimum keeps copies warm, so the spike meets capacity that already runs.
6. **Shed load.** Turn on **Shed low value** on every App Server, so that a spike costs you bots and
   cheap kinds first.

Look at the Users Node during the next spike, where the `dropped` errors in **Errors by cause**
must stay near zero, and check that Apdex on the HUD stays above its target through the spike. If
one Node still turns red, it is the next limit, so see
[Find the bottleneck](/guides/find-the-bottleneck).

The [Cold Start](/sandboxes/cold-start) Sandbox sends a spike at a Java App Server. New Java copies
start slow, so you must plan the capacity before the spike arrives.
