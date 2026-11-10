---
title: Change data capture
summary: Read the database's change log and publish each change as an event, so search, warehouse, and cache stay in step without the app writing twice.
section: patterns
group: Messaging and async
order: 408
aliases: cdc, debezium, wal, write-ahead log, binlog, logical decoding, dual write, change stream
---

Change data capture turns the database's own log into a stream of events that other systems follow.

## Use it when

- A second copy of the data must follow the database: a search index, a warehouse, a cache, or another service.
- The app currently writes to two stores, and they drift apart after a crash.
- You cannot change every writer to emit events.

## How it works

Every database writes changes to a log before it applies them. A connector such as Debezium reads that log and publishes each insert, update, and delete to a stream. Consumers read the stream and apply the changes to their copies. The app writes once, to the database, so there is nothing to disagree.

Key the stream by the row's primary key. Order holds only inside a partition, so an unkeyed stream can apply an old write after the newer one.

## What it costs

Copies lag the database by however far behind the consumer is, and a consumer further behind than the stream's retention loses changes. Changes are row-level, so consumers see the schema, and a migration can break them. You run a connector and a stream. A consumer that writes back to the source can start a loop.

## In Quorum

::Design{id="cdc-stream"}

Link the [Database](/components/database) into a [CDC Connector](/components/cdc), the connector into an [Event Stream](/components/log), and the stream into the copy that follows: a [Search Engine](/components/search), a [Data Warehouse](/components/warehouse), or a [Cache](/components/cache). The connector has no options of its own. It copies the writes the Database processes and never slows them. The stream's key and partitions set order and read speed.

The Search Engine in the picture also answers the App Server's queries; the other extra Nodes only serve the remaining Series B request kinds. Research [Change data capture](/research/cdc), which needs [Event streaming](/research/event-streaming) and [Data warehousing](/research/data-warehouse). The same effect without a stream is the [transactional outbox](/patterns/transactional-outbox). The glossary defines [CDC](/glossary/cdc-change-data-capture).
