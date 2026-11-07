---
title: Sidecar
summary: A sidecar runs next to the main application in its own process or container and handles shared chores like logging, proxying and security.
section: patterns
group: Outside the game
order: 1004
aliases: sidecar, sidekick, proxy, envoy, istio, linkerd, service mesh, ambassador
---

A sidecar is a helper process or container deployed beside an application and sharing its life cycle, so it can add features without touching the application's code.

Reach for it when many services in different languages need the same chore. One team runs Go and another Ruby, and both need mutual TLS, retries and metrics. A proxy next to each, such as Envoy in an Istio mesh, does it once for everyone, and the application's calls pass through it without code changes. Azure also notes the isolation: a crash in the helper does not take the app's process down, and the two can use different languages and release on their own.

The costs are real. Each sidecar uses CPU and memory on every instance, and Azure points out the extra hop adds latency. You now run and upgrade a second thing per pod, and a bug in the proxy hits every service at once. It is also overkill for one service, where a library is simpler.

## Nearest in Quorum

The game builds this one. The [Service Mesh](/components/mesh) puts a sidecar proxy beside each App Server and Worker that links into it, gives them retries, a circuit breaker and metrics, and charges the CPU and a hop for it. It needs the [Service mesh](/research/service-mesh) Research, and only services running in a [Kubernetes Cluster](/components/cluster) get a sidecar. [Split into services with a mesh](/patterns/split-into-services-with-a-mesh) shows the rung, and [Circuit breaker](/patterns/circuit-breaker) is one of the features it hands out.

## References

- [Sidecar pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar): the definition, the isolation benefits and the extra latency.
- [Ambassador pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/ambassador): a sidecar that proxies a service's outbound calls.
- [Istio architecture](https://istio.io/latest/docs/ops/deployment/architecture/): how a real mesh splits a data plane of sidecar proxies from a control plane.
