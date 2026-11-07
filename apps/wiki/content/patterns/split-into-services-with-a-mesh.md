---
title: Split into services with a mesh
summary: Break one codebase into Services on a Kubernetes Cluster and put a Service Mesh beside them, so each deploys alone and every call gets retries, a breaker and metrics.
section: patterns
group: Stack ladder
order: 129
aliases: microservices, service mesh, istio, sidecar, mtls, service boundaries, kubernetes, per service deploy, blast radius
---

Split the monolith into Services that deploy alone, and run them in a Cluster with a Service Mesh.

## Move up when

- One bad deploy breaks every request kind, because everything ships together.
- Teams block each other, because one codebase has one release.
- You cannot tell which service called which, and every call needs the same retry and breaker settings.

## The Design

::Design{id="mesh-services"}

A Load Balancer sends each request kind to one of two App Servers. Both call the Database and link into the Cluster and the Mesh. Those two Nodes carry no traffic.

## Why it works

Each App Server stands for a Service, so a bad deploy of one breaks only its own kinds. The mesh puts a sidecar beside each member. That adds mutual TLS, retries and a circuit breaker to every Link out of it, and per-Link metrics, even before the matching research. A Link you set yourself keeps your policy.

The sidecar rides in the pod, so a Service must run in a Cluster first. The game refuses the link otherwise.

## What it costs

The mesh adds latency to each hop and takes a share of the member's CPU, and it bills a share of its members' Burn. The Cluster and the mesh each take Dev Hours from the product Teams unless a Platform team runs them. In a Company a new Service also needs [Service boundaries](/research/service-boundaries), a Team and a deploy pipeline of its own. The picture here only splits traffic by kind. Retries on every Link can also feed a [Retry storm](/incidents/retry-storm).

## In Quorum

Place a [Service Mesh](/components/mesh) and a [Kubernetes Cluster](/components/cluster), then link App Servers into both. Research [Container orchestration](/research/containers) and [Service mesh](/research/service-mesh). Read [container orchestration](/glossary/container-orchestration) and [blast radius](/glossary/blast-radius). The next rung, [multi-region with GeoDNS](/patterns/multi-region-with-geodns), puts copies near far users.
