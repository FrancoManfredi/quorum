---
title: Precomputation
summary: Do expensive work before anyone asks for it, so a request reads a ready answer instead of building one.
section: patterns
group: Scaling reads and compute
order: 214
aliases: precompute, static generation, static site, incremental static regeneration, isr, pre-rendering, build time, ahead of time
---

Precomputation moves work from request time to a moment you choose, such as a build, a schedule, or a write.

## Use it when

- Many users get the same answer, such as a product page or a leaderboard.
- The answer is costly to build but changes rarely.
- A small delay between a change and its appearance is acceptable.

## How it works

A static site generator renders every page at build time and uploads files, so a request costs a file read. Incremental static regeneration, as Next.js does it, renders a page on first request, keeps the result, and rebuilds it in the background after a set time. Search indexes, recommendation lists, and daily reports follow the same plan: a job computes them, and requests read the output.

A page rendered once and read 100,000 times spends its cost once. Putting a CDN in front of the files makes the repeat reads nearly free.

## What it costs

You pay for work no one may ever read, and you must decide when to rebuild. Pages that depend on the user cannot be shared. A change shows up late, and a purge or a revalidate is the only way to force it. Large sites can spend minutes rebuilding.

## In Quorum

Two controls get close. The Framework on an [App Server](/components/server) can be Next.js, after [Next.js](/research/fw-nextjs) and [Node](/research/lang-node), which renders a share of pages as static output that a [CDN](/components/cdn) can cache. Report reads can use a Database view, which [Materialized views and denormalization](/patterns/materialized-views-and-denormalization) covers.

::Design{id="precomputed"}

[CDN push and pull](/patterns/cdn-push-and-pull) covers the cache layer in front.
