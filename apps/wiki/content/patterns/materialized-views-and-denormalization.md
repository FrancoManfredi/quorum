---
title: Materialized views and denormalization
summary: Store the answer to an expensive query, or keep a joined copy of the data, so reads stop doing the same work again and again.
section: patterns
group: Scaling reads and compute
order: 213
aliases: materialized view, denormalize, denormalization, pre-joined, summary table, refresh, report query, read model
---

A materialized view saves the result of a query, and denormalization stores data in the shape it will be read.

## Use it when

- A report or dashboard query scans large tables and runs again and again.
- Reads need several joins, and the same joins run on every request.
- The reader can accept data as old as the last refresh.

## How it works

A materialized view is a table filled by a query, such as daily revenue by region. Reads hit the small result, and a refresh job recomputes it every few minutes or hours. PostgreSQL has `REFRESH MATERIALIZED VIEW` for this. A report that scanned 50 million rows now reads a few hundred.

Denormalization copies data into the table that needs it, such as storing a customer's name on each order, so a read skips the join. Reads get cheaper, and every write must now update each copy.

## What it costs

Both put old data on the page. A view is as stale as its refresh, and a denormalized copy is wrong between a write and the update of its copies. Denormalization also makes writes costlier and lets copies drift apart if one update fails. Use a view for reads that tolerate delay, and keep a normalized source of truth.

## In Quorum

A [Database](/components/database) has a Materialized view switch after [Materialized views](/research/precompute), which makes reports read a stored result and shows up as slightly stale answers. [Denormalization](/research/denormalization) has no switch: it makes reads cheaper and writes dearer, and the Design lists it as a research it needs.

::Design{id="materialized-report"}

The [Report kills the database](/incidents/report-db) incident shows the cost of scanning on the primary, and a Data Warehouse is the larger fix. The glossary defines [materialized view](/glossary/materialized-view) and [denormalization](/glossary/denormalization).
