---
title: Saga
summary: A saga runs a business transaction as a chain of local transactions across services and undoes finished steps with compensating actions when a later step fails.
section: patterns
group: Outside the game
order: 1001
aliases: saga, distributed transaction, compensating transaction, orchestration, choreography, long-running transaction
---

A saga is a business transaction split into local transactions, one per service, where a failure part-way is repaired by running compensating transactions for the steps that already finished.

Reach for it when one action touches data owned by several services and a single ACID transaction cannot span them. An order flow reserves stock, charges a card, then books a courier. If the courier step fails, the saga refunds the card and releases the stock. Two styles exist. In choreography each service publishes an event that triggers the next. In orchestration a central coordinator tells each participant what to do and tracks the state, which is easier to follow once the workflow gets complex.

It costs you rollback and isolation. A compensation is new business logic that you must design and test for every step, and some steps cannot be undone at all, such as an email already sent. Azure calls the point of no return a pivot transaction. Because other requests see the half-finished state, you need countermeasures like marking an order PENDING until the saga ends. Debugging also gets harder, since the story is spread over several services' logs.

## Nearest in Quorum

The game has no saga, but it teaches the pieces one needs. The [Transactional outbox](/patterns/transactional-outbox) publishes an event atomically with the write that caused it, which a saga step needs to do reliably. [Idempotency keys](/patterns/idempotency-keys) make a repeated step harmless, and a [Queue](/components/queue) carries the messages. Research [Transactional outbox](/research/outbox) and [Idempotency keys](/research/idempotency-keys) to build them.

## References

- [Saga pattern, microservices.io](https://microservices.io/patterns/data/saga.html): Chris Richardson's definition with choreography and orchestration examples, and a plain list of the drawbacks.
- [Saga design pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga): compensable and pivot transactions, and what to weigh before choosing orchestration.
- [Sagas, Garcia-Molina and Salem (1987)](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf): the original paper that named the pattern, for long-lived database transactions.
