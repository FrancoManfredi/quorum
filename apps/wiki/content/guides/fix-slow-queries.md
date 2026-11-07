---
title: Fix slow queries
summary: End a Slow query incident with Add index, clear the missing indexes that new Features ship, and stop N+1 queries from ORM frameworks.
section: guides
order: 7
era: 1
aliases: slow query, index, add index, explain, query analysis, n+1, eager loading, unindexed, table scan
gdd: /design/07-data-tier
---

Use this guide when a [Slow query](/incidents/slow-query) incident runs, or when the Database CPU
climbs while traffic stays the same.

A query with no index scans the whole table. Its cost grows with the number of rows, and the rows
grow with your users. So a missing index is invisible at first and becomes the bottleneck later.

## Before you start

You need [Query analysis](/research/query-analysis), which opens in the Garage Era. Without it, the
game tells you that a query has no index, but you cannot add one.

## End a Slow query incident

1. Look for the message "A new query has no index. Every read scans the table." It appears when
   the incident starts.
2. Select the Database. The same message shows as a red callout at the top of the Inspector.
3. Click **Add index** in the callout. The **Add index** task goes to the top of the
   [Team backlog](/explanation/team-and-velocity), and the Team spends the Dev Hours it has on it
   at once.
4. Watch the line with the hammer icon at the bottom of the HUD, which names the work that the Team
   is building.
5. When the task ships, the incident ends, and the Database **Load** row should fall back.

:::Note{tone="tip"}
**Add index** costs 4 Dev Hours. A Team with no Dev Hours banked needs time to build it. Keep a
small reserve of Dev Hours if Slow query incidents are likely in your Design.
:::

If the callout says "Research Query analysis to find it", start that Research first. While you wait,
a [Cache](/components/cache) in front of the Database keeps most reads off the table.

The [Read Mostly](/sandboxes/read-mostly) Sandbox ends with a query that ships with no index. Keep
Apdex above its limit for two minutes after it ships.

## Find indexes before the incident

Some Features ship query shapes with no index, and each open shape makes a Slow query more likely.

1. Press **T** to open the Team panel.
2. Find the **Add index** tile under **Engineering**. If it shows **Queue**, at least one query
   shape has no index.
3. Click **Queue**. Each Add index covers one shape.
4. Repeat until the tile no longer offers **Queue**, which means every query has an index.

Engineering tiles appear only for tasks whose Research you own.

## Stop N+1 queries

Laravel, Rails, and Django use an ORM that sends several read queries where one would do, which is
the [N+1 query](/glossary/n1-query) pattern: the Database does several times the read work for the
same traffic.

1. Check the **Framework** section of an App Server. If it names Laravel, Rails, or Django, the
   pattern applies.
2. Research [Eager loading](/research/eager-loading).
3. In the Team panel, queue the **Eager loading** task. It costs 10 Dev Hours.
4. When it ships, check that the Database CPU gauge falls.

The other choice is a framework with no N+1 queries, such as Symfony, but that is a Stack migration
and costs more Dev Hours. See [Choose a Stack](/guides/choose-a-stack).

## Keep reads off the Database

An index makes each query cheaper, but every read still lands on the one Database that holds the
state, which is why [the data tier](/explanation/the-data-tier) is the long-term challenge in any
Design. These Components send fewer queries to it:

- A [Cache](/components/cache) answers repeated reads from memory.
- A [Read Replica](/components/replica) answers reads with a copy of the data.
- A [Data Warehouse](/components/warehouse) takes report scans, from the Series B Era.

See [Scale the database](/guides/scale-the-database) for the steps. Whichever fix you make, the
**CPU** gauge in **Resources** must fall, no red callout should remain at the top of the Inspector,
and Apdex on the HUD should return to its target.
