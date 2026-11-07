---
title: Claim check
summary: Put a large payload in object storage and send only a reference through the queue, so messages stay small and fast.
section: patterns
group: Messaging and async
order: 409
aliases: large messages, payload offload, s3 pointer, reference message, message size limit
---

A claim check stores the big payload elsewhere and passes a small ticket for it through the message system.

## Use it when

- Messages carry files, images, or documents, and they hit the broker's size limit or slow it.
- Many consumers read a message, and each would copy the payload.
- The payload needs a different retention or access rule than the event.

## How it works

The producer uploads the payload to object storage under a key and sends a message with that key. The consumer reads the message, then fetches the payload with the key. Brokers are tuned for many small messages, so a 5 MB video sent as a 200-byte pointer keeps the queue fast. SQS caps a message at 1 MiB, and the usual fix for anything larger is this pattern.

## What it costs

You now have two systems to keep consistent: a message can point at an object that was deleted or never finished uploading. Someone must clean up objects after the last consumer is done. Reading takes an extra hop, and access control must cover both the message and the object.

## In Quorum

The game has no Queue setting for payload size and no way to link a Queue to Object Storage as a claim check, so there is no Design here. It teaches the two halves apart. [Object Storage](/components/storage) takes uploads off the Database, and a [Queue](/components/queue) carries tasks, so an upload is stored once and the slow work after it goes to a [Worker](/components/worker). [Object storage and lifecycle rules](/patterns/object-storage-and-lifecycle-rules) covers the store. The glossary defines [object storage](/glossary/object-storage).
