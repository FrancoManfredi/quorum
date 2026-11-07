---
title: Event sourcing
summary: Event sourcing stores every change as an event in an append-only log and builds current state by replaying it.
section: patterns
group: Outside the game
order: 1003
aliases: event sourcing, event log, replay, snapshot, audit log, temporal query
---

Event sourcing stores each change to an entity as an immutable event in an ordered log, and the current state is whatever you get by replaying those events.

Use it when the history matters as much as the present. An account balance is the sum of its deposits and withdrawals, so the log is an audit trail you cannot quietly edit. Martin Fowler lists what it buys: rebuild state from scratch, ask what the state was at any past time, and replay a corrected event with the ones after it. Chris Richardson adds a use that fits microservices, which is that publishing the events is the same write as saving them, so no separate message needs to be sent atomically.

It costs more than it looks. Replaying a long history is slow, so you keep periodic snapshots and replay only what came after. Events live forever, so changing their shape needs versioned schemas. Reading current state needs a read model built from the log, which is why it is usually paired with CQRS, and that read model is eventually consistent. Azure calls it a complex pattern that is costly to migrate to or from, so adopt it only when the history is worth that.

## Nearest in Quorum

The game has the log, not the pattern. The [Event Stream](/components/log) keeps messages after they are read so consumers can replay them, and Research [Event streaming](/research/event-streaming) unlocks it. [Change data capture](/patterns/change-data-capture) turns a database's write log into events, which gets some of the benefit without making events the source of truth. The [Transactional outbox](/patterns/transactional-outbox) solves the write-and-publish problem in the usual way.

## References

- [Event Sourcing, Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html): complete rebuild, temporal query and event replay, explained with a shipping example.
- [Event Sourcing pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing): when to use it, and the issues with snapshots, ordering and versioning.
- [Event sourcing, microservices.io](https://microservices.io/patterns/data/event-sourcing.html): how an event store removes the need for two-phase commit between a database and a broker.
