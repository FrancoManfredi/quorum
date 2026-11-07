The Search Engine stands for Elasticsearch: a separate index built for full-text search.

## When to place it

- Place it when searches load the Database: its CPU climbs as the Search share of the mix grows, and every other query slows with it. It unlocks with [Full-text search](/research/full-text-search).
- Resize it when its card shows it near its limit.
- Add a standby once you own [Multiple zones](/research/multi-az).

## How it works

It answers each search query in a fixed time, at a fixed number per second for each size step, and Features that make searches heavier lower that number. Only search queries reach it, and no Component sits downstream of it. See [inverted index](/glossary/inverted-index).

Until you link a Search Engine, the [Database](/components/database) answers searches with built-in full-text search. When an App Server links to both, searches go to the Search Engine, and Postgres stops answering them.

## Options

- **Refresh interval:** how long a new document waits before it is searchable, and how much indexing CPU the Node spends. A long interval answers more queries a second but returns staler results. A short one is fresher and answers fewer. A stale result fails a search that needed the new document. [Data tier](/design/07-data-tier#search-engine) says what each costs.
- **Product:** Elasticsearch, OpenSearch, or Meilisearch. The first two share a profile and take every option. Meilisearch is one smaller, faster node with none of the options below, and its relevance falls as the index grows.
- **Shards:** parallelize the index but fan every query out, so each one adds less than the last.
- **Replicas:** each adds query capacity, a box, and a copy of the index on a volume.
- **Heap:** trades garbage collection pauses against the file system cache. Too small pauses often. Too large pauses long and answers fewer queries.

[Data tier](/design/07-data-tier#search-engine) holds the numbers.

## How it fails

- Overloaded, it drops searches. Searches fail, but the rest of the Design is fine.
- Without one, search load sits on the primary, and a busy search slows checkouts and writes.

### [Instance failure](/incidents/instance)

- **Signs:** The Search Engine's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and searches fail, because the Database does not take them back while a Search Engine is linked.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host. A **Standby** (Zone section, needs [Multiple zones](/research/multi-az)) takes over by itself, with no click.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Press **Fail over** on the banner, or on the Node's card. It needs [Multiple zones](/research/multi-az) and promotes the Node's **Standby** at once; the Node then keeps no standby until you give it one. A Node with no standby stays down until the incident ends, at most 120 sim seconds, and one with a standby also fails over by itself after a share of that time.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting. Give it a **Standby**.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up. **Fail over** moves only Nodes that hold no data, so this one stays down until the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts. A store spread across regions needs nothing from you.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Keep search p99 low: search queries are among the higher-value kinds.
- Give it a standby once you own Multiple zones.

:::Note{tone="real"}
Real teams feed a search index from the database with dual writes or change data capture, and results lag a little behind. See [CDC](/glossary/cdc-change-data-capture).
:::
