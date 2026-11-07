---
title: Cut the cloud bill
summary: Find the lines that make your Burn, remove idle capacity, pick cheaper instance families, and lower egress without losing Apdex.
section: guides
order: 3
aliases: burn, cost, cloud bill, margin, save money, runway, egress, cheaper, spend less
gdd: /design/09-economy
---

Use this guide when Burn is close to income, your runway is short, or you want a better
[margin](/glossary/operating-margin) before an [Exit](/guides/prepare-for-an-exit).

[Burn](/explanation/money) is the Cash you spend per second. It adds up every Node's price, your
salaries, egress, and third-party fees. Every cut in this guide has a cost in capacity or risk, so
make one change at a time and check Apdex after each one.

## Read the bill

1. Look at the **Cash** figure on the HUD. The line under it is your net income per second, so a
   negative value means that Burn is larger than income.
2. Select the **Payments** Node to open the Inspector.
3. Read the **Revenue**, **Burn**, and **Salaries** rows. Salaries are part of Burn.
4. Press **D** to open the Dashboard, once you own [Metrics](/research/metrics). The **Revenue
   and Burn** chart shows when the gap opened, and a blue line marks each change you made.

If salaries are most of the Burn, the board is not your problem, so hire fewer engineers or wait
until revenue grows. See [Team and velocity](/explanation/team-and-velocity).

## Find the expensive Nodes

1. Select each Node in turn. Every Node card in the Inspector has a **Burn** row.
2. Compare the Burn row with the **Load** row of the same Node.
3. Mark each Node that costs much and runs under 50% load. These are your first cuts.

A Node with a **Standby** costs twice its Burn, and a Database with **Backups** costs more than one
without. Both are deliberate insurance, so remove them only if you accept the risk.

## Remove idle capacity

1. For an idle sized Node, open the **Instance** section and select **Smaller (free)**.
2. Wait a few seconds of game time, then check that Load stays under 70%.
3. If you have two copies of a Node and both run cool, sell one: select it and click the trash
   button. The refund is half of what the last copy cost.

If the Node goes amber or red after the change, select **Undo** (Z) at once.

:::Note{tone="warn"}
A resize restarts the Node for a short time. A single Node with no second copy drops its traffic
while it restarts.
:::

## Pick a cheaper family

1. Open the **Instance** section of an App Server, Worker, or Database.
2. Read the gauges in **Resources** before you change anything.
3. Pick a family that matches the full gauge:
   - **Compute** costs 0.85 times General per vCPU and has half the RAM. Use it when CPU is the
     limit and RAM has room.
   - **Burstable** costs 0.4 times General. It runs on CPU credits and drops to a fraction of its
     CPU when they run out, so use it only for a Node that is idle most of the time.
   - **Memory** costs 1.3 times General. It is not a cut, but a Database whose working set does
     not fit in RAM can serve more on a smaller Memory box.
4. Watch the **CPU credits** gauge on a Burstable Node. If it falls toward zero, go back to General.

## Lower egress

From the Seed Era, every byte that an App Server sends to the internet costs
[egress](/glossary/egress), and media and page views send the most.

1. Research [Compression](/research/gzip), then open the **Compression** section of each App Server
   and select **Gzip**. Page and read responses get smaller for a little more CPU.
2. Research [Content delivery](/research/cdn) and place a [CDN](/components/cdn) in front of the
   App Servers. Pages that the CDN answers at the edge cost $0.02 per GB, against $0.09 per GB
   from an App Server.
3. Keep Nodes that call each other in the same zone, because a call between zones pays egress both
   ways.

## Let capacity follow demand

Traffic follows a daily cycle, so a fleet sized for the evening peak is idle at night.

1. Research [Autoscaling](/research/autoscaling) and place an [Autoscaler](/components/autoscaler).
2. Link the App Servers into it.
3. In **Scaling**, set a low **min** and a **max** that covers the peak. The Autoscaler removes
   copies when the load falls well under the target.
4. Later, research [Container orchestration](/research/containers). App Servers linked into a
   [Kubernetes Cluster](/components/cluster) pack onto shared nodes and cost 0.85 times their
   Burn. Each Cluster also takes Dev Hours until you have a Platform team.

## Trim the smaller lines

- **Analytics.** A higher **Sample rate** earns more Insight and costs more storage Burn, so lower
  it once you have the Research you need.
- **Auth Provider.** It charges per user, so at very large user counts, compare its Burn row with
  the App Server CPU it saves.
- **Search Engine, Cache, Queue.** Each size step doubles capacity and Burn, so size them up only
  when their Load passes 70%.

Then check the Cash line on the HUD, which must move up, and make sure Apdex stays at or above its
target, because a cut that loses users loses more revenue than it saves. Open the Dashboard, where
the Burn line on **Revenue and Burn** must fall and stay down through the next evening peak.

The [Out of Credits](/sandboxes/out-of-credits) Sandbox ends with a Burn limit at night traffic.
The [Read Mostly](/sandboxes/read-mostly) Sandbox doubles the demand and sets a Burn limit.
