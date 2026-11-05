## What it does

The Search Engine stands for Elasticsearch: a separate index built for full-text search.

It takes search queries and sends nothing on. It answers each one in a fixed time, and it answers a fixed number per second per size step. Features that make searches heavier lower that number. See [inverted index](/glossary/inverted-index).

## Refresh

The refresh interval decides how long a new document waits before it is searchable, and how much indexing CPU the Node spends. A long interval answers more queries a second and staler results; a short one is fresher and answers fewer. The Inspector offers the intervals, and [Data tier](/design/07-data-tier#search-engine) says what each costs. A stale result fails a search that needed the new document.

Until you link a Search Engine, the [Database](/components/database) answers searches with built-in full-text search. When an App Server links to both, searches go to the Search Engine, and Postgres stops answering them.

## Product, shards, replicas and heap

The product is Elasticsearch, OpenSearch, or Meilisearch. The first two share a profile and take every option. More shards parallelize the index but fan every query out, so each one adds less than the last. Each replica adds query capacity, a box, and a copy of the index on a volume. The heap trades garbage collection pauses against the file system cache: too small pauses often, too large pauses long and answers fewer queries. Meilisearch is one smaller, faster node with none of these options, and its relevance falls as the index grows. [Data tier](/design/07-data-tier#search-engine) holds the numbers.

## When to place it

Place it when searches load the Database: its CPU climbs as the Search share of the mix grows, and every other query slows with it. It unlocks with [Full-text search](/research/full-text-search). Resize it when its card shows it near its limit.

## How it fails

- Overloaded, it drops searches. Searches fail, but the rest of the Design is fine.
- Without one, search load sits on the primary, and a busy search slows checkouts and writes.
- [Instance failure](/incidents/instance) takes a single copy offline. Searches fail until you replace it, because the Database does not take them back while a Search Engine is linked.
- A [Zone outage](/incidents/zone) takes it down unless it has a standby in another zone.

:::Note{tone="real"}
Real teams feed a search index from the database with dual writes or change data capture, and results lag a little behind. See [CDC](/glossary/cdc-change-data-capture).
:::

## Tips

- Search queries are among the higher-value kinds. Keep their p99 low.
- Give it a standby once you own [Multiple zones](/research/multi-az).
