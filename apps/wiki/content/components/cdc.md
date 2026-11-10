The CDC Connector publishes every change a Database makes as an event, as Debezium does.

## When to place it

- Place it when a second copy of the data has to follow the [Database](/components/database): a search index, a warehouse, or a feed for another service. It unlocks with [Change data capture](/research/cdc) in Series B, for 18,000 ◇, after [Event streaming](/research/event-streaming) and [Data warehousing](/research/data-warehouse). It sits in Series B because it needs a consumer worth feeding, and usually a stream to fan the changes out to more than one.
- Copy it when you add a second Database, since each Database needs its own connector.

## How it works

Debezium is a **change data capture** tool that reads a database's write-ahead log and publishes every insert, update and delete as an event. Drag from the Database's out port to the connector, then drag from the connector's out port to an [Event Stream](/components/log), a [Search Engine](/components/search), a [Data Warehouse](/components/warehouse), or a [Cache](/components/cache). It takes a copy of the writes the Database processed, one change each, and publishes them as changes at **20,000 changes a second**. Nothing else in the Design sees the copy, so the App Servers' writes still go to the Database and are still answered by it.

That is what makes it useful. The [Search Engine](/components/search), the [Data Warehouse](/components/warehouse) and a [Cache](/components/cache) can each follow the Database, and the app never writes the same fact twice. A stream can feed all three at once; a direct link feeds one. The alternative is a **dual write**: the app writes to the Database and to the index in one request, and a crash between the two leaves them disagreeing forever.

It carries no traffic of its own and has no options. Its settings are the Database it reads and the one Node it publishes to. It never slows a write.

## How it fails

- **Lag.** The changes reach the stream or the consumer directly, and a consumer reads them at its own pace. A search result or a report is behind by that lag, and a consumer further behind than the retention window loses the oldest changes. The connector's card shows that lag, because the connector buffers nothing: the stream holds what has not been read.
- **Order.** A change is a copy, so it carries no ordering beyond the order the writes committed in. A stream with several partitions keeps order only inside a partition, so an unkeyed stream lets a superseded write land after the one that replaced it. Key the stream by the row's primary key.
- **Its own rate.** Past 20,000 changes a second it drops what it cannot publish, like any flat-capacity Component. A busy Database outruns one connector.
- **No consumer.** With nothing linked to read the changes, they are stranded.
- **A loop.** A consumer that writes back to the Database, with the stream reading that Database, closes a loop the board refuses: a change that causes a write that causes a change.

### [Instance failure](/incidents/instance)

- **Signs:** The CDC Connector card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second Node of the Component, so one is still serving while the other is replaced.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once, the CDC Connector with them.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az) and keep a copy of the Component in a second zone.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the CDC Connector in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

## Tips

- Place it next to the Database it reads and the stream it writes.
- Read the lag, not the connector's latency.
- Look for a slow design's fix in the consumer or the stream, not the connector.
