The Document Store holds documents instead of rows, as MongoDB, Firestore and DynamoDB do.

## When to place it

- Place it when the schema keeps changing and features ship slowly because of it. A Feature that changes the data shape is the reason to own one, and the Team backlog shows it: its Dev Hours drop the moment the Store serves.
- Place it when the work is documents read and written by key: a profile, a cart, a settings page. It unlocks with [Document databases](/research/document-db) in Series A, for 3,500 ◇.
- Skip it for reports. A report works, but badly, so link a [Data Warehouse](/components/warehouse) instead, or leave reports on the Database, which still holds the money.
- Keep the money on the [Database](/components/database) and the documents here.

## How it works

It trades joins and transactions for developer velocity, and it is the mirror image of the [Database](/components/database): cheaper to change, worse at questions that span more than one record.

It serves `q-read` and `q-write` on documents, answers a checkout's `q-tx` and a report's `q-scan` too, and sends nothing on. It has one flat rate of **3,000 ops a second** at its first size, doubled at each of its eight sizes. A read or a write is one op. A join is three. Past its rate the excess is dropped, like any flat-capacity Node.

It differs from a [relational table](/components/database) in three ways:

- **No joins.** A query that spans several documents is a scan of the collection, at [three times the ops](#a-join-costs-three-ops). A checkout that writes several documents is not atomic unless multi-document transactions are on, and with them every write waits for the rest, so its latency rises by half.
- **No connections to pool.** An App Server opens no pool it has to share through a [Connection Pooler](/components/pooler), so a spike of App Servers cannot exhaust it the way PostgreSQL's 100 connections are exhausted. It has no buffer cache and no IOPS volume either, so no disk limit applies.
- **No schema to migrate.** A Feature that changes the data shape costs **25% fewer Dev Hours**, because there is no migration to write, run, or lock a table for. Every other Feature costs **10% more**, because with no joins each access pattern it adds is its own collection and index to write and read. The [Team](/team) panel charges the total.

### A join costs three ops

A Feature that adds reads suits a Document Store, which answers them at one op each from its own flat rate. It cannot cheaply ask two documents about each other:

| What it answers         | Ops it costs | Why                                                                     |
| ----------------------- | ------------ | ----------------------------------------------------------------------- |
| A read of one document  | 1            | A key lookup, or an index lookup on one collection.                     |
| A write of one document | 1            | One document is atomic.                                                 |
| A checkout (`q-tx`)     | 3            | It reads the cart, writes the order and writes the receipt, in the app. |
| A report (`q-scan`)     | 3            | It scans the whole collection, because there is no join to narrow it.   |

A hot shard from incident [Hot key](/incidents/hot-key) divides its rate, the same way it divides a [Wide-column Store](/components/wide)'s.

## Options

- **Multi-document transactions**: they make a checkout atomic across documents, and every write waits for the rest, so its latency rises by half.

## How it fails

- **The join.** A checkout spread over documents loses atomicity without multi-document transactions: a retry can charge the card twice, and the card shows the duplicate. Turn them on, and pay half again the write latency.
- **The report.** A `q-scan` through a Document Store is a collection scan at three ops. It also holds the Collection's slots while it runs.
- **Hot keys.** One shard's key takes the traffic, and the Node's flat rate is the first thing that bends.
- **A Document Store is not a Database.** Nothing joins, nothing is transactional by default, and there is no point-in-time recovery to research. A Design that keeps its money here loses a charge now and then.

## Tips

- Link the App Server to both the Database and the Document Store, and each takes the kinds it accepts.
- Put a [Cache](/components/cache) in front. Its hits never reach the Store at all, and the Store has no buffer cache, so its reads do not compete with one.
