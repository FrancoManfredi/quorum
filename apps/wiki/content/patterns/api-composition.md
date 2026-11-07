---
title: API composition
summary: API composition answers a query that spans several services by calling each one and joining the results in memory.
section: patterns
group: Outside the game
order: 1007
aliases: api composition, gateway aggregation, aggregator, scatter gather, join across services, in-memory join
---

API composition answers a query whose data lives in several services by having a composer call each owner and join the replies in memory. A gateway doing this for a client is called gateway aggregation.

It is the simplest way to read across service boundaries, and it fits when each call is cheap and the result is small. An order page needs the order from one service, the customer from another, and the courier status from a third. The composer calls the three in parallel and returns one response, so the client makes one request instead of three. Azure notes this cuts chattiness over slow mobile networks.

It breaks down as data grows. Chris Richardson lists its drawback as inefficient in-memory joins of large datasets, so a query like "customers with an order over $500 in the last year" cannot run this way. It also multiplies failure: three services at 99.9% give a page that is 99.7% available, and the slowest call sets the latency, which is the tail problem in [Tail latency](/patterns/tail-latency). Use timeouts, and let the page render without the optional parts. For heavy queries, keep a precomputed read model instead.

## Nearest in Quorum

The game has no composer, but you can build the shape. An [API Gateway](/components/gw) sits in front of App Servers, and an App Server that calls several data Nodes waits on them in sequence, so their latencies add and their success rates multiply. [API gateway patterns](/patterns/api-gateway-patterns) covers aggregation at the edge. The alternative to composing at read time is storing the joined answer, as in [Materialized views and denormalization](/patterns/materialized-views-and-denormalization), and the [Timeouts](/patterns/timeouts) page covers the guard each call needs.

## References

- [API Composition, microservices.io](https://microservices.io/patterns/data/api-composition.html): the pattern for queries across services, with its benefit and its in-memory join drawback.
- [Gateway Aggregation pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation): putting the composer in a gateway to reduce chatty clients.
- [The Tail at Scale, Dean and Barroso](https://cacm.acm.org/research/the-tail-at-scale/): why a request that waits on many servers meets the slowest of them.
