---
title: One control plane, 73 hours: Roblox
summary: A Consul streaming change under load took Roblox down for 73 hours, because the control plane was also the path for deployments and monitoring.
section: patterns
group: When it broke
order: 970
aliases: roblox, consul, outage, control plane, boltdb, postmortem, 73 hours
---

On 28 October 2021, Roblox went down for 73 hours. A new streaming feature on Consul, the service discovery and coordination layer, caused contention under load, and a BoltDB bug made it worse. The control plane also carried deployments and monitoring, so the team could not see or fix the outage.

## The system

Roblox ran hundreds of internal services, and one Consul cluster supported several workloads. The team enabled a new Consul 1.10 streaming feature on a traffic-routing backend the day before the outage. Under high load, the new protocol contended, and BoltDB's free-page list made writes pathologically slow. Consul's leaders fell behind, and the control plane could not keep the services consistent.

## The board

::Design{id="roblox-control-plane"}

The Load Balancer and App Server are the game tier, the Database is the state, and the Kubernetes Cluster and Service Mesh are the control plane. The board runs the game's [Bad config push](/incidents/config) incident on the App Server, which stands for a control-plane change that reached the fleet.

## What broke

A control plane is a shared dependency. A change to it under load can take down every service that relies on it, and the monitoring and deployment paths sit in the same blast radius. Roblox lost visibility and the ability to deploy a fix while the control plane was unhealthy. One Consul cluster for several workloads widened the impact. The recovery took 73 hours because the team had to rebuild the Consul cluster and the cache, not roll back one deploy.

## What changed

Roblox disabled the streaming feature, rebuilt the Consul cluster, deleted obsolete data, and worked with HashiCorp on a BoltDB successor. [GitOps Staged](/research/gitops) is the closest guardrail: a change lands on one region first. [Bulkhead](/patterns/bulkhead) is the other: keep the failure inside one part.

## Where the game stops

The game has no Consul, so the Cluster and Mesh stand for the control plane. The config incident is a config push, not a streaming feature. The board cannot show 73 hours, the BoltDB bug, or the monitoring dependency. The caption is the game's incident, not Roblox's outage.

## Sources

- [Roblox Return to Service, Roblox](https://about.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021): the timeline, Consul streaming, the BoltDB bug, and the changes made.
- [An Update on Our Outage, Roblox](https://about.roblox.com/newsroom/2021/11/update-recent-service-outage): the initial statement and the 73-hour recovery.
- [Consul architecture, HashiCorp](https://developer.hashicorp.com/consul/docs/architecture): what Consul does, and why a control plane is a shared dependency.
