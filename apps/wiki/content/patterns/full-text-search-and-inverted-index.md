---
title: Full-text search and the inverted index
summary: Index every word to the documents that hold it in a separate search engine, so a query reads a few short lists instead of scanning every row.
section: patterns
group: Scaling data
order: 309
aliases: search, elasticsearch, opensearch, meilisearch, lucene, inverted index, relevance, tokenizer
---

A search engine builds an inverted index, which maps each word to the documents that contain it, so a query reads a few lists instead of every row.

## Use it when

- Users type free text and expect ranked, typo-tolerant results, and `LIKE '%word%'` is slow.
- Search queries use so much database CPU that checkouts slow down.
- You need filters, facets or suggestions on top of text.

## How it works

At write time the engine splits text into terms and stores, for each term, the sorted list of documents that contain it. A query for `red shoes` fetches two lists and intersects them. The index is split into shards so it can grow, and each shard has replicas that answer queries and survive a failure.

A new document is not searchable at once. The engine refreshes on an interval, often one second, and a longer interval saves indexing work at the price of staler results. The search index is a copy, so something must keep it in step with the database: see [change data capture](/patterns/change-data-capture).

## What it costs

You run a second system that is never the source of truth, and it can drift from the database. More shards add a fan-out, because every query asks all of them. A longer refresh interval returns results that are a few seconds old. Teams that skip the sync step find deleted items still showing in results.

## In Quorum

::Design{id="search-index-tuned"}

Without a [Search Engine](/components/search), the [Database](/components/database) answers searches itself, at far more CPU than a normal read. The card's product choice matters: Elasticsearch and OpenSearch take shards, replicas and a heap setting, and Meilisearch runs one node with none of those, and its relevance drifts as the index grows.

Search unlocks with [Full-text search](/research/full-text-search). From Series B the game also counts a share of search answers as stale when the app writes to both stores and nothing carries the change, until a [Transactional outbox](/research/outbox) or a [CDC Connector](/components/cdc) is in place. The glossary defines the [inverted index](/glossary/inverted-index).
