---
title: Index the blobs: Dropbox
summary: Dropbox put a sharded MySQL Block Index in front of Magic Pocket's immutable blocks, so a read was one hash lookup and one block fetch.
section: patterns
group: Ran in production
order: 962
aliases: dropbox, magic pocket, object storage, block index, exabyte, erasure coding
---

In 2016 Dropbox moved its file data off S3 into Magic Pocket, its own multi-exabyte store. A file is cut into blocks of up to 4 MB, each block is hashed with SHA-256, and the hash goes into a sharded MySQL Block Index. A read looks up the hash and fetches the block.

## The system

Blocks are packed into 1 GB buckets and written to volumes across machines, in replicated or erasure-coded form, in three US zones. The Block Index is a sharded MySQL cluster behind an RPC layer, and it decides which volumes hold a block. The Watcher samples 1% of written blocks and fetches them after a minute, an hour, a day, a week, and a month. The metadata scanner walks the index at about a million blocks a second.

## The board

::Design{id="dropbox-block-index"}

The Object Storage is the block store: immutable blocks, keyed by their hash. The Database is the Block Index, four shards on a hash key. The App Server hashes the block, writes it to storage, and writes its hash and location to the index.

## Why it works

The blocks are immutable, so the index only appends and never updates a row. The index is tiny next to the bytes, so a sharded MySQL cluster can hold it while the blocks live on cheap disks. A read is one hash lookup and one fetch. [Object storage and lifecycle rules](/patterns/object-storage-and-lifecycle-rules) and [shard the database](/patterns/shard-the-database) are the two halves.

## Where the game stops

The game's Object Storage is a managed service, not Magic Pocket's own hardware. The board cannot show 4 MB blocks, 1 GB buckets, erasure coding, or the three zones. It shows the split: a hash index in front of an immutable block store. The caption is Quorum's result, not Dropbox's exabytes.

## Sources

- [Inside the Magic Pocket, Dropbox](https://dropbox.tech/infrastructure/inside-the-magic-pocket): the blocks, buckets, volumes, the sharded MySQL Block Index, and the multi-zone design.
- [Scaling to exabytes and beyond, Dropbox](https://dropbox.tech/infrastructure/magic-pocket-infrastructure): why Dropbox left S3 and what the store had to do.
- [Pocket watch: Verifying exabytes of data, Dropbox](https://dropbox.tech/infrastructure/pocket-watch): the scanner and the Watcher that sample and re-fetch blocks.
