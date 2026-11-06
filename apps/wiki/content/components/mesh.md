The Service Mesh stands for Istio and Linkerd: a **sidecar proxy** beside every service.

## When to place it

- Place it when your App Servers and Workers are too many for per-Link settings to stay manageable.
- Place it when a retry storm is what hurts you.
- Skip it on a Database: a Database is not a service with a sidecar.

It unlocks with [Service mesh](/research/service-mesh) in Series B, for 20,000 ◇, after [Container orchestration](/research/containers). It is the same trade as a [Kubernetes Cluster](/components/cluster): automation pays off at a certain size, and it has a real operational cost.

## How it works

In the real product the proxy sits in the same pod as the service and takes over its network calls. Link App Servers and Workers into it. They have to run in a [Kubernetes Cluster](/components/cluster) first, because the sidecar rides in the pod. Each one gets a sidecar, and every Link out of it changes:

| Gives                                                         | Costs                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Retries at once, and a circuit breaker that opens on failure  | 5% of the member's CPU                                  |
| Per-Link metrics, and 20% more Insight on the traffic watched | +1 ms on every hop                                      |
| Mutual TLS between services                                   | 5% of the member's Burn, as the sidecar's share         |
|                                                               | 0.5 engineers of Platform Dev Hours, or a Platform team |

The retries and the breaker need no research of their own: the sidecar runs them for you. A Link whose player set its own policy keeps it, because the mesh is a default, not an override. The 1 ms, the 5% and the 20% are the figures the mesh uses.

## How it fails

- **Naive retries amplify.** A failing dependency gets its failed calls again, up to three times. On a bad day that is a retry storm, and the mesh is part of why.
- **The breaker hides the truth.** While it is open the Link fails fast and sends nothing, so the calls that depend on it fail as refused, not as slow.
- **The 5% is always paid.** A sidecar costs its share of the box whether the traffic is heavy or light, and the mesh bills it on its own line.
- **The 1 ms is per hop.** A checkout that makes six calls pays 6 ms on top of its work.
- **Platform Dev Hours.** Each mesh takes half an engineer from the product teams unless a Platform team runs it.

## Tips

- Put the mesh on the services that call each other most, not on every Node.
- Research [Circuit breakers](/research/circuit-breakers) so a Link can set its own breaker and retry policy. The mesh then supplies only the metrics and the millisecond.
- Watch the Insight line: a mesh on the services Analytics already samples earns 20% more, and that pays for the sidecars.
