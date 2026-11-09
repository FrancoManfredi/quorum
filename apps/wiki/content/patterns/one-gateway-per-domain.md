---
title: One gateway per domain: Uber
summary: Uber grouped 2,200 critical microservices into domains, put a gateway in front of each, and used a mesh for the calls between them.
section: patterns
group: Ran in production
order: 961
aliases: uber, doma, microservices, api gateway, service mesh, domain oriented, layers
---

By 2020 Uber ran 2,200 critical microservices. Domain-Oriented Microservice Architecture groups them into domains, each with one API and one owner, and puts a gateway in front of the domain. A caller depends on the gateway, not on every service behind it.

## The system

DOMA sorts domains into layers. The infrastructure layer answers storage and networking, the business layer holds capabilities shared across products, and the product layer holds the services a rider or driver calls. A domain may not depend on a domain above it, so the graph has one direction. Each domain exposes one API, and its gateway is the only entry a caller needs. A service mesh adds retries, circuit breakers, mutual TLS, and per-call metrics between the services.

## The board

::Design{id="uber-domain-gateway"}

The Load Balancer spreads traffic across the gateways. The API Gateway stands for one domain's entry. On the board it validates the token once and sends the call to the App Server, which stands for the domain's services. The Database belongs to the domain. The Kubernetes Cluster and Service Mesh are control Nodes and carry no traffic.

## Why it works

One gateway per domain means a caller has one contract to learn and one owner to call, and a change inside the domain does not reach the caller. The mesh makes every call between services carry the same retry, breaker, and metrics policy. [Split into services with a mesh](/patterns/split-into-services-with-a-mesh) and [API gateway patterns](/patterns/api-gateway-patterns) cover the two pieces.

## Where the game stops

The board has one domain, not 2,200 services and five layers. It cannot show the layer rule, domain ownership, or the product and business layers. The caption is Quorum's result, not Uber's traffic.

## Sources

- [Introducing Domain-Oriented Microservice Architecture, Uber Engineering](https://www.uber.com/blog/microservice-architecture): the domains, the five layers, the gateway, and the 2,200 services.
- [The Uber Engineering Tech Stack, Part I: The Foundation, Uber Engineering](https://www.uber.com/blog/tech-stack-part-one-foundation): the services, storage, and discovery underneath DOMA.
- [Istio architecture, Istio](https://istio.io/latest/docs/ops/deployment/architecture/): how a data plane of sidecars and a control plane split the work a mesh does.
