---
title: Compute at the edge
summary: Run small handlers on Edge Functions next to the user and keep heavy work on the App Server, so cheap requests skip the trip to the origin.
section: patterns
group: Scaling steps
order: 131
aliases: edge functions, cloudflare workers, isolates, cold start, wasm, edge handlers, cpu ceiling, edge cache
---

Answer the cheap, common requests at the edge and send everything else to the origin.

## Move up when

- Pages and reads from far Users are slow even with a regional copy.
- The origin spends capacity on tiny requests such as redirects and header changes.
- A cold start on a function hurts a user-facing request.

## The Design

::Design{id="edge-handlers"}

The API Gateway sends pages and reads to the Edge Function and the heavier kinds to the App Server. Both call the Database. This picture runs in one region, so it shows the split of kinds and the CPU ceiling, not the saved distance.

## Why it works

An Edge Function starts in milliseconds with no cold start, and it bills per request. It runs your Service's Stack, so the Stack must be JavaScript or TypeScript, or Rust or Go built to WebAssembly. A PHP, Ruby or Python Stack is refused there.

A handler has a CPU ceiling instead of a box. A request that needs more is killed as a timeout, so a login's password hash or an upload does not fit.

## What it costs

An edge handler that calls the Database on every request still pays the trip, so it saves the user hop and not the query. One Edge Function serves only its own region, so copy it per region. It cannot hold a working set, since the memory is small. A Company on PHP must migrate its Stack first, which costs Dev Hours.

## In Quorum

Place an [Edge Function](/components/edge) and set a Stack that compiles for it. Research [Edge compute](/research/edge-compute), which needs Content delivery. A live Edge Function also holds the edge cache that a CDN answers reads from. The [Certificate expired](/incidents/certificate) incident applies to it. The next step, [disaster recovery and a failover region](/patterns/disaster-recovery-and-failover-region), covers losing a whole region.
