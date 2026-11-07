---
title: Object storage and lifecycle rules
summary: Keep files in object storage and let lifecycle rules move old objects to cheaper classes, so storage cost stops growing in step with every upload.
section: patterns
group: Scaling data
order: 311
aliases: s3, blob storage, storage class, glacier, infrequent access, archive, ttl, r2, retention
---

Object storage holds files cheaply without limit, and lifecycle rules shift objects that are rarely read into cheaper classes.

## Use it when

- Users upload images, video or documents that a database stores badly.
- Most objects are read in their first weeks and almost never afterward.
- The storage bill grows every month and old data is rarely touched.

## How it works

The app stores each file under a key and reads it back over HTTP. Classes trade price against access: Standard is the dearest and reads at once, Infrequent access costs about half to store but charges a fee per read, and Archive costs a small fraction and needs a restore that takes hours. A lifecycle rule says that an object older than 30 days moves one class down, and after 90 days it moves again.

A photo app with 100 TB, most of it older than a year, can cut its storage bill sharply this way. The cost is that a request for an archived object cannot be answered at once.

## What it costs

Retrieval fees and restore waits show up on the oldest objects, the ones nobody planned to read. A viral old photo becomes both slow and expensive. Rules also act on age, not on use, so an object that is still popular gets demoted unless access tracking is in place. Small objects can cost more to transition than they save.

## In Quorum

::Design{id="lifecycle-storage"}

[Object Storage](/components/storage) takes uploads off the Database. Its card has a storage class and a lifecycle window. A request for an archived object fails as a timeout, so the lifecycle window decides how much of the store a read can still reach. The caption shows the Design under traffic, not the storage bill, which grows over calendar time.

Unlock it with [Object storage](/research/object-storage), and lifecycle windows with [Storage lifecycle rules](/research/lifecycle-rules). An R2 product that bills no egress needs [Egress optimization](/research/egress-optimization). The glossary defines [object storage](/glossary/object-storage), and [CDN push and pull](/patterns/cdn-push-and-pull) fronts it.
