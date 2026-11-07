---
title: CQRS
summary: CQRS uses one model to change data and a different one to read it, so each side can be shaped and scaled for its own job.
section: patterns
group: Outside the game
order: 1002
aliases: cqrs, command query responsibility segregation, read model, write model, query side
---

Command Query Responsibility Segregation uses a separate model for commands that change state and for queries that read it. The two can be different classes in one service or different databases.

Use it when reads and writes have different shapes. A checkout writes a normalized order across five tables, while the order history page wants one flat row per order with the product name already in it. A read store built for that page, and scaled apart from the write store, answers in one lookup. Collaborative or task-based screens also gain, since commands can be small and specific and so conflict less.

The cost is a second model to keep in step. When the read store is separate it is eventually consistent, so a user can save an order and not see it for a moment, and the code must handle that. Messaging between the sides brings duplicates and retries. Martin Fowler warns that for most systems CQRS adds risky complexity, and that a plain CRUD design fits many domains better. Start with a Read Replica or a view before you split the model.

## Nearest in Quorum

The game builds the read side without the split model. A [Read Replica](/patterns/read-replicas) serves queries from a lagging copy, and [Materialized views and denormalization](/patterns/materialized-views-and-denormalization) store the answer a page needs. [Change data capture](/patterns/change-data-capture) feeds a second store from the write log, and the [CDC Connector](/components/cdc) is the Component. Research [Denormalization](/research/denormalization) and [Change data capture](/research/cdc), and read [OLTP and OLAP split](/patterns/oltp-and-olap-split) for the same idea on reports.

## References

- [CQRS, Martin Fowler](https://martinfowler.com/bliki/CQRS.html): the short definition and the warning that most systems do not need it.
- [CQRS pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs): separate stores, consistency problems, and when to use it.
- [CQRS, microservices.io](https://microservices.io/patterns/data/cqrs.html): how CQRS answers queries that span services.
