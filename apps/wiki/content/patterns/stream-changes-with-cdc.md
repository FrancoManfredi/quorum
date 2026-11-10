---
title: Stream changes with CDC
summary: Read the Database's write log and publish each change to a stream, so search and other copies follow the data without a second write.
section: patterns
group: Scaling steps
order: 120
aliases: change data capture, debezium, kafka, event stream, dual write, binlog, write ahead log
---

Publish every change from the write log to an Event Stream, and let consumers build their copies from it.

## Move up when

- The app writes to the Database and the search index in one request, and the two drift apart.
- A warehouse, a cache, or another service needs to follow the data.
- Stale search results appear after a crash between the two writes.

## The Design

::Design{id="cdc-feed"}

The App Server writes once, to the Database. The CDC Connector reads the Database's log and publishes each change to the Event Stream. The stream feeds the Search Engine, which applies each change to its index while it keeps answering the App Server's queries. The stream is **Keyed by entity**, so a row's changes stay in one partition and arrive in order.

## Why it works

The app never writes the same fact twice, so a crash cannot leave the copies disagreeing for good. The connector reads the log, so it adds no work to a write. The stream keeps its messages, so a new index can replay them, and a second consumer can read them too.

Watch consumer lag, not the connector. A slow index shows up as growing lag, and the fix is in the consumer or the stream.

## What it costs

You add a connector and a stream, and each has its own Burn and failure modes. The copy is eventually consistent, so a search can miss the newest row for a moment. A consumer further behind than the retention window loses the oldest changes. An unkeyed stream with several partitions can apply an old change after a newer one.

## In Quorum

The [CDC Connector](/components/cdc) needs [Change data capture](/research/cdc), which follows [Event streaming](/research/event-streaming) and [Data warehousing](/research/data-warehouse). Place it beside the [Event Stream](/components/log). The pattern is [Change data capture](/patterns/change-data-capture), and the older option is the [Transactional outbox](/patterns/transactional-outbox). The glossary has [CDC](/glossary/cdc-change-data-capture). The next step moves reports off the primary: [Reports off the primary, in a warehouse](/patterns/reports-off-the-primary-warehouse).
