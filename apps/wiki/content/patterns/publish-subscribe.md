---
title: Publish and subscribe
summary: Publish each event once to a topic and let every interested service read it, so producers stop knowing who consumes their events.
section: patterns
group: Messaging and async
order: 403
aliases: pubsub, pub/sub, topic, event bus, kafka, fan-out, sns, event stream, consumer group
---

Publish and subscribe sends each event to a topic, and every subscriber gets its own copy.

## Use it when

- More than one service must react to the same event, such as a search index, a warehouse, and an email sender.
- The producer should not change when a new consumer appears.
- A new consumer must be able to replay history.

## How it works

A queue gives a task to one worker. A topic gives an event to every subscriber group, and inside a group the members share the work. With a log such as Kafka, the events stay for a retention window, so a new subscriber can read from the start, and a slow one falls behind without slowing anyone else.

A topic splits into partitions, and a group can use at most one consumer per partition. Keying events by entity keeps one entity's events in order inside a partition.

## What it costs

Delivery is at least once, so consumers must tolerate duplicates. Order holds only inside a partition. A slow subscriber's lag grows without any visible failure, so watch lag, not latency. A key that carries most of the traffic overloads its partition whatever the partition count.

## In Quorum

::Design{id="pubsub-stream"}

An [Event Stream](/components/log) stands for Kafka. The App Server appends to it, and its consumers read at their own pace while the events stay. Partitions cap how many consumers read at once, the key decides order, retention decides how far behind a consumer can fall, and acknowledgements trade write latency for durability.

Workers linked to one stream split its tasks between them, so the game does not give each its own copy. The game's [Push Provider](/components/msgp) sends push and email messages, which is a different thing. Research [Event streaming](/research/event-streaming) after [Message queues](/research/queues). [Hot key](/incidents/hot-key) shows one key filling one partition. The glossary defines [at-least-once delivery](/glossary/at-least-once-delivery).
