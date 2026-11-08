---
title: Search beside the database
summary: Put full-text search on its own Search Engine, so a busy query stops taking CPU and cache from checkouts and writes.
section: patterns
group: Scaling steps
order: 113
aliases: elasticsearch, opensearch, meilisearch, full text search, inverted index, search index, lucene
---

Give search its own index on a Search Engine and link the App Server to it, so the Database stops answering searches.

## Move up when

- Database CPU climbs as the Search share of the mix grows, and every other query slows with it.
- Search latency is high even though the Database has room for point reads.
- You want to rank results or match typos, which a `LIKE` query cannot do cheaply.

## The Design

::Design{id="search-engine"}

Users call the App Server. Search queries go to the Search Engine, and everything else still goes to the Database. The Database keeps the rows and stays the source of truth. The index is a copy built for lookup.

## Why it works

A Search Engine keeps an inverted index, which maps each word to the documents that hold it, so a query reads a few lists instead of scanning rows. Once a Search Engine is linked, the Database stops answering searches at all, and the Database load bar falls.

The **Refresh interval** is the lever that matters. A new document is not searchable until the next refresh, so a short interval is fresh and costs indexing CPU, and a long one answers more queries a second but returns staler results. Shards and replicas on Elasticsearch trade fan-out against query capacity.

## What it costs

You now keep two copies of the data. If the app writes to both in one request, a crash between the two writes leaves them disagreeing, and the game counts that as stale search results. A [Transactional outbox](/patterns/transactional-outbox) or [change data capture](/patterns/stream-changes-with-cdc) closes the gap. Meilisearch is cheaper and faster, but it has no shards, replicas, or heap, and its relevance falls as the index grows.

## In Quorum

Place a [Search Engine](/components/search) after [Full-text search](/research/full-text-search). The pattern is on [Full-text search and the inverted index](/patterns/full-text-search-and-inverted-index), and the glossary defines the [inverted index](/glossary/inverted-index). The next step stores data that does not fit rows: [Document and wide-column stores](/patterns/document-and-wide-column-stores).
