## What it does

The Document Store stands for MongoDB, Firestore and DynamoDB: a database that holds documents instead of rows.

It serves `q-read` and `q-write` on documents, and it answers a checkout's `q-tx` and a report's `q-scan` too, sending nothing on. It has one flat rate of **3,000 ops a second** at its first size, doubled at each of its eight sizes. A read or a write is one op. A join is three.

The shape that differs from a [relational table](/components/database):

- **No joins.** A query that spans several documents is a scan of the collection, at [three times the ops](#a-join-costs-three-ops), and a checkout that writes several documents is not atomic unless multi-document transactions are on. With them, every write waits for the rest: its latency rises by half.
- **No connections to pool.** An App Server opens no pool it has to share through a [Connection Pooler](/components/pooler), so a spike of App Servers cannot exhaust it the way PostgreSQL's 100 connections are exhausted. It has no buffer cache and no IOPS volume either, so it has no disk limit to meet.
- **No schema to migrate.** A Feature that changes the data shape costs **25% fewer Dev Hours**, because there is no migration to write, run, or lock a table for. Every other Feature costs **10% more**, because with no joins each access pattern it adds is its own collection and index to write and read. The [Team](/team) panel charges the total.

That last row is the trade the design names: developer velocity against joins and transactions.

## A join costs three ops

A Feature that adds reads is what a Document Store is good at: it answers them at one op each, from its own flat rate. What it cannot do cheaply is ask two documents about each other:

| What it answers         | Ops it costs | Why                                                                     |
| ----------------------- | ------------ | ----------------------------------------------------------------------- |
| A read of one document  | 1            | A key lookup, or an index lookup on one collection.                     |
| A write of one document | 1            | One document is atomic.                                                 |
| A checkout (`q-tx`)     | 3            | It reads the cart, writes the order and writes the receipt, in the app. |
| A report (`q-scan`)     | 3            | It scans the whole collection, because there is no join to narrow it.   |

Past its rate the excess is dropped, like any flat-capacity Node. A hot shard from incident [Hot key](/incidents/hot-key) divides its rate, the same way it divides a [Wide-column Store](/components/wide)'s.

## When to place it

Place it when the schema keeps changing and the features ship slowly because of it, or when the work is documents read and written by key: a profile, a cart, a settings page. It unlocks with [Document databases](/research/document-db) in Series A, for 3,500 ◇, and it is the mirror image of the [Database](/components/database): cheaper to change, worse at questions that span more than one record.

A report on a Document Store works, and badly. Link a [Data Warehouse](/components/warehouse) instead, or leave reports on the Database, which still holds the money.

## How it fails

- **The join.** A checkout spread over documents loses atomicity without multi-document transactions: a retry can charge the card twice, and the card shows the duplicate. Turn them on, and pay half again the write latency.
- **The report.** A `q-scan` through a Document Store is a collection scan at three ops. It also holds the Collection's slots while it runs.
- **Hot keys.** One shard's key takes the traffic, and the Node's flat rate is the first thing that bends.
- **A Document Store is not a Database.** Nothing joins, nothing is transactional by default, and there is no point-in-time recovery to research: a Design that keeps its money here is a Design that loses a charge now and then.

## Tips

- Keep the money on the [Database](/components/database) and the documents here. The two can live side by side: link the App Server to both, and each takes the kinds it accepts.
- A feature that changes the data shape is the reason to own one. Watch the Team backlog: its Dev Hours drop the moment the Store serves.
- Its reads do not compete with a Cache for a buffer cache, because it has none. A [Cache](/components/cache) in front still helps, and its hits never reach the Store at all.
