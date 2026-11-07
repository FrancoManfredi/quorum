---
title: Fallacies of distributed computing
summary: Eight assumptions that hold on one machine and fail across a network, each of which has a standard defense.
section: patterns
group: Foundations
order: 16
aliases: fallacies, eight fallacies, deutsch, network is reliable, latency is zero, distributed computing
---

The fallacies of distributed computing are eight things programmers assume about networks and learn the hard way. L. Peter Deutsch listed seven at Sun Microsystems in 1994, building on four that Bill Joy and Dave Lyon had named, and James Gosling added the eighth around 1997.

Each one fails with a concrete number:

- **The network is reliable.** A call can vanish, so a timeout is the only honest answer. Retrying it risks doing the work twice, which means the operation must be safe to repeat ([Idempotency keys](/patterns/idempotency-keys)).
- **Latency is zero.** A round trip between Frankfurt and Virginia takes roughly 90 ms. A loop that makes 10 of them in sequence costs 900 ms, where on one machine it cost nothing.
- **Bandwidth is infinite.** A 5 MB response sent to 1,000 clients a second is 5 GB a second.
- **The network is secure.** Anything on the wire can be read or altered, so encrypt service-to-service traffic too.
- **Topology does not change.** Hosts come and go, so use names and health checks, not fixed addresses.
- **There is one administrator.** A dependency run by another team, or another company, changes without telling you.
- **Transport cost is zero.** Serializing and shipping data uses CPU, and cloud providers bill for bytes that cross zones and regions.
- **The network is homogeneous.** Clients, links and servers differ in speed, version and behavior.

## What it changes about a design

Treat every remote call as something that can be slow, wrong or absent. Give it a [timeout](/patterns/timeouts), retry it with [backoff](/patterns/retry-with-backoff), and make sure the work can run twice. Prefer one coarse call to ten fine ones, because each call pays latency and failure odds again, and keep chatty services in one zone.

None of this needs rare events. At a yearly failure rate of a few percent, a fleet of 1,000 servers loses a host every week or two, so failure is routine and the design should assume it.

## In Quorum

Several Incidents and costs here are the fallacies in action. In the [Network partition](/incidents/partition) Incident, calls between regions time out. A call to another Zone adds latency and [Egress](/glossary/egress), and a call to another region pays the round trip. Until you research [Timeouts and retries](/research/timeouts), every Link waits a long time for an answer, which is the first fallacy in a Board. The glossary entry [fallacies of distributed computing](/glossary/fallacies-of-distributed-computing) lists them, and [Errors and retries](/explanation/errors-and-retries) shows how callers giving up changes the load.
