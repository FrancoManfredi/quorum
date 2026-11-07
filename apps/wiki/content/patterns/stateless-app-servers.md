---
title: Stateless app servers
summary: Keep nothing on the App Server that a second copy would need, so any copy can answer any request and a dead one costs nothing.
section: patterns
group: Stack ladder
order: 103
aliases: stateless, twelve factor, shared nothing, sessions, uploads, local disk, externalize state
---

A stateless App Server keeps rows in the Database and files in Object Storage, so a second server could take over without losing anything.

## Move up when

- You want a second App Server but cannot say what would break if a request reached the wrong one.
- Uploaded files or sessions live on the server's own disk, so replacing the host loses them.
- Uploads fill the Database's rows and slow every query beside them.

## The Design

::Design{id="files-in-database"}

::Design{id="files-in-storage"}

In the first picture the App Server holds no data, but uploaded files are stored as Database rows. In the second the App Server sends files to Object Storage and the Database keeps rows only.

## Why it works

The game has no stateless switch, because statelessness is a rule for your code. It does model the places state hides: the Local database setting (the last rung), where files go (this one), and the Load Balancer's sticky sessions switch (the next rungs). Leave that switch off and every request can go to any server.

Moving files out also lightens the Database. Its load bar and p99 both fall in the second picture, because a file no longer passes through its buffer cache and disk.

## What it costs

Object Storage is one more Node, billed per request and per stored byte, and each read waits longer for its first byte than a Database query does. A session kept in memory has no home of its own here. Real systems put it in a cookie or a [Cache](/patterns/cache-aside), and that choice is yours.

## In Quorum

Place [Object Storage](/components/storage) after you research [Object storage](/research/object-storage). The [Slow Uploads](/sandboxes/slow-uploads) Sandbox shows a slow upload holding an App Server slot. The next rung is to [scale up first](/patterns/scale-up-first).
