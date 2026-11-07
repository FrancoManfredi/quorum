---
title: Document and wide-column stores
summary: Use a document store for data read and written by key with a changing shape, and a wide-column store when writes outgrow one machine, and accept what each gives up.
section: patterns
group: Stack ladder
order: 114
aliases: nosql, mongodb, dynamodb, firestore, cassandra, quorum, tunable consistency, leaderless
---

Move data that a relational table fits badly into a document store or a wide-column store, and keep what needs joins on the Database.

## Move up when

- The schema keeps changing and features ship slowly because every change is a migration.
- The work is documents read by key, such as a profile, a cart, or a settings page.
- Writes outgrow one Database, even after a bigger box, and you can live without joins.

## The Design

::Design{id="document-store"}

The App Server calls a Document Store for documents and a Payment Provider for charges. A checkout writes several documents, so **Multi-document transactions** is on, which keeps the order atomic.

::Design{id="wide-column-quorum"}

The second Design uses a Wide-column Store with N replicas per key. A write waits for **W** of them and a read asks **R**.

## Why it works

A document store trades joins for speed of change: no migration, no pool to share, and one flat rate for reads and writes. A wide-column store spreads each key over N replicas and has no single primary, so writes scale out. When R plus W is greater than N, a read always asks at least one replica holding the latest write.

## What it costs

A document store has no joins, so a checkout or report that spans documents costs more work, and without transactions a checkout can land half saved. A wide-column store spends N replica operations on every write, so a strong setting costs capacity and lowers the rate. A weak setting is cheap and serves stale reads. Even a strong quorum is not linearizable, so keep checkouts on a relational store.

## In Quorum

The [Document Store](/components/doc) needs [Document databases](/research/document-db). The [Wide-column Store](/components/wide) needs [Sharding](/research/sharding) and then [Leaderless replication](/research/leaderless). Watch for the [Hot key](/incidents/hot-key) incident. See [quorum](/glossary/quorum) and [eventual consistency](/glossary/eventual-consistency), and the pattern on [Quorum reads and writes](/patterns/quorum-reads-and-writes). The next rung keeps several stores apart: [Split the database by feature](/patterns/split-the-database-by-feature).
