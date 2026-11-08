---
title: OLTP and OLAP split
summary: Run reports on a separate columnar warehouse, so large scans stop evicting the cache and slowing the database that serves users.
section: patterns
group: Scaling data
order: 310
aliases: olap, oltp, data warehouse, bigquery, redshift, snowflake, analytics database, reporting, columnar
---

Keep analytics on a warehouse that stores columns, and keep the transactional database for the small reads and writes users wait for.

## Use it when

- A report or an export makes the primary's CPU spike and checkouts slow down.
- Analysts want to scan months of history, and the production database cannot hold it all cheaply.
- Queries aggregate a few columns over millions of rows.

## How it works

A transactional database stores each row together, which suits fetching one order. A warehouse stores each column together, so summing `amount` over 100 million rows reads one column, not the whole table. Rows reach the warehouse through a pipeline, often [change data capture](/patterns/change-data-capture), so the app never queries it for live traffic.

A big scan on the primary also pushes hot rows out of its buffer cache, so ordinary reads go to disk afterward. That second harm is why a single nightly report can slow the whole afternoon.

## What it costs

The warehouse lags the primary by the pipeline's delay, so reports show slightly old data. You pay per scan or per byte read, and a careless query can be expensive. You also run a pipeline and keep two schemas in step. A replica takes read load but not scan-heavy analytics, because it has the same row layout.

## In Quorum

::Design{id="warehouse-for-reports"}

The other Nodes in the picture only serve the other request kinds of Series B, such as checkouts and realtime. Report requests send scans. With only a [Database](/components/database), the scans run there. With a [Data Warehouse](/components/warehouse) linked, the scans go there instead, so the Database serves users alone. A scan on the warehouse is slow but has no capacity limit, and it is billed per scan. The game does not model how stale the warehouse copy is.

The warehouse unlocks with [Data warehousing](/research/data-warehouse). The [Report kills the database](/incidents/report-db) incident is what it prevents. The glossary defines [OLTP and OLAP](/glossary/oltp-and-olap). [Reports off the primary](/patterns/reports-off-the-primary-warehouse) is the step.
