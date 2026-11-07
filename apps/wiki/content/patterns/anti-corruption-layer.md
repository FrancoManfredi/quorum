---
title: Anti-corruption layer
summary: An anti-corruption layer translates between your model and a legacy or foreign system's, so the old design does not leak into the new one.
section: patterns
group: Outside the game
order: 1005
aliases: anti-corruption layer, acl, adapter, facade, translation layer, legacy integration, bounded context
---

An anti-corruption layer is an adapter between two subsystems that do not share the same model, which translates calls and data in both directions. Eric Evans described it in Domain-Driven Design.

Use it when a new service has to talk to something whose model you do not want to copy. A legacy billing system calls a customer an ACCT with a four-letter status code, and your new service has a Customer with a typed state. The layer maps one to the other in one place, so the service never sees ACCT. Azure lists the strangler fig as a related pattern: while you move features out of a legacy system piece by piece, the layer lets old and new talk without changes to either.

It adds a component to build, deploy and run, and a hop on every call. It can become a bottleneck, and if the two models drift apart its mapping rots quietly. If the systems already share concepts, or the integration is small and short-lived, a direct call is cheaper. Plan to delete the layer when the legacy system is gone.

## Nearest in Quorum

The game has no translation layer. The nearest thing is the move it supports, which is replacing an old part gradually. The [Strangler pattern](/patterns/strangler-pattern) routes traffic to new code a slice at a time, [Expand and contract](/patterns/expand-and-contract) changes a schema without breaking readers, and the Research [Service boundaries](/research/service-boundaries) splits a codebase into a Service with its own team. See also [strangler pattern](/glossary/strangler-pattern) in the glossary.

## References

- [Anti-Corruption Layer pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer): definition, origin in Domain-Driven Design, and the trade-offs.
- [Strangler Fig pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig): the incremental migration the layer supports, with a façade that routes between old and new.
- [Bounded Context, Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html): why two models of the same concept exist and need a mapping.
