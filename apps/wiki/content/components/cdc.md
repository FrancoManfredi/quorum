## What it does

The CDC Connector stands for Debezium: a **change data capture** tool that reads a database's
write-ahead log and publishes every insert, update and delete as an event.

Link a [Database](/components/database) into it, and it into an [Event Stream](/components/log). It
takes a copy of the writes that Database processed, one change each, and publishes them to the stream
as tasks, at **20,000 changes a second**. Nothing else in the Design sees the copy: the App Servers'
writes still go to the Database and are still answered by it.

That is what makes it useful. The [Search Engine](/components/search), the
[Data Warehouse](/components/warehouse) and a cache can each read the stream and follow the
Database, and the app never writes the same fact twice. In the real product the alternative is a
**dual write**: the app writes to the Database and to the index in one request, and a crash between
the two leaves them disagreeing forever.

It carries no traffic of its own. It has no options: its settings are the Database it reads and the
stream it publishes to.

## When to place it

Place it when a second copy of the data has to follow the Database: a search index, a warehouse, or
a feed for another service. It unlocks with [Change data capture](/research/cdc) in Series B, for
18,000 ◇, after [Event streaming](/research/event-streaming) and
[Data warehousing](/research/data-warehouse).

It is a Series B tool because it needs both of the things it feeds: a stream to publish into, and a
consumer worth feeding.

## How it fails

- **Lag.** The changes reach the stream, and a consumer reads the stream at its own pace. A search
  result or a report is behind by the stream's lag, and a consumer further behind than the
  retention window loses the oldest changes. The connector's card shows that lag, because the
  connector's own buffering is nothing: the stream holds what has not been read.
- **Order.** A change is a copy, so it carries no ordering of its own beyond the order the writes
  committed in. A stream with several partitions keeps order only inside a partition, so an unkeyed
  stream lets a superseded write land after the one that replaced it. Key the stream by the row's
  primary key.
- **Its own rate.** Past 20,000 changes a second it drops what it cannot publish, like any
  flat-capacity Component. A busy Database outruns one connector.
- **No consumer.** With nothing reading the stream, the changes it publishes are stranded.
- **A loop.** A consumer that writes back to the Database, with the stream reading that Database,
  closes a loop the board refuses: a change that causes a write that causes a change.

## Tips

- Place it next to the Database it reads and the stream it writes, and read the lag, not the
  connector's latency.
- One connector per Database. A second Database needs its own.
- It never slows a write. If a design is slow, the connector is not the reason, and the fix is in
  the consumer or the stream.
