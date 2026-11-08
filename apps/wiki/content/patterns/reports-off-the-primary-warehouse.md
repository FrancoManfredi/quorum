---
title: Reports off the primary, in a warehouse
summary: Send report scans to a columnar Data Warehouse, so analytics stops evicting the buffer cache that checkouts depend on.
section: patterns
group: Scaling steps
order: 121
aliases: olap, oltp, bigquery, redshift, snowflake, analytics, reporting, columnar, data warehouse
---

Answer report scans from a Data Warehouse, and keep the primary for the transactions it was built for.

## Move up when

- Reports run on the primary, and reads and writes of every kind slow while they do.
- A report evicts the buffer cache, so the next checkout reads from disk.
- Report volume grows with the business.

## The Design

::Design{id="reports-on-warehouse"}

The App Server sends report scans to the Data Warehouse and everything else to the Database. The Warehouse has no options. The App Server is a little larger, because a scan is slow and holds a worker slot for its whole run.

## Why it works

A scan on the primary reads huge ranges, pushes hot rows out of memory, and holds locks. A warehouse stores data by column and reads only the columns a report needs, so a big scan is cheap there. With scans gone, the Database keeps its memory for the rows checkouts need, and every non-report kind gets faster.

A Warehouse has no capacity limit and bills per scan, so a busy month costs more and a quiet one costs little.

## What it costs

Each scan is slow, so this is for reports and not for page loads. The warehouse needs data, and this Design does not load it. In real systems a pipeline copies changes in, and the previous step shows one. The data is a little behind, and per-scan pricing punishes a dashboard that refreshes every few seconds.

## In Quorum

Place a [Data Warehouse](/components/warehouse) after [Data warehousing](/research/data-warehouse), and watch for the [Report kills the database](/incidents/report-db) incident. The pattern is on [OLTP and OLAP split](/patterns/oltp-and-olap-split), and the glossary has [OLTP and OLAP](/glossary/oltp-and-olap). The next step protects the front door: [WAF and gateway at the front](/patterns/waf-and-gateway-at-the-front).
