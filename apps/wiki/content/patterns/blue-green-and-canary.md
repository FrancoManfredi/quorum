---
title: Blue-green and canary deploys
summary: Ship a new version beside the old one, or to a few users first, so a bad release reaches few people and rolls back fast.
section: patterns
group: Deploys and change
order: 602
aliases: blue green, canary, rolling deploy, rollback, deployment strategy, release
---

Blue-green and canary deploys both limit how many users a bad release can hurt.

## Use it when

- A bad deploy would hurt many users, and you want to cap how many.
- You can run two versions at once and route traffic between them.
- You have metrics that tell you in minutes whether the new version is worse.

## How it works

Blue-green runs two full fleets. Blue serves users while green comes up with the new version and is checked. Then the router flips to green, and flipping back is the rollback. A canary sends a small share of real traffic, say 2%, to the new version first. If errors and latency hold for a set time, the share grows in steps until it reaches 100%. Blue-green is simple and rolls back at once. A canary has the smallest reach and the slowest rollout.

## What it costs

Blue-green doubles the compute for the deploy, and both versions must work with the same database, which leads to [expand and contract](/patterns/expand-and-contract). A canary needs good metrics and enough traffic on its slice to show a problem. Rolling deploys that replace a few servers at a time cost the least and protect the least.

## In Quorum

::Design{id="deploy-blue-green"}

The strategy is a setting on a CI/CD Pipeline: Recreate, Rolling, Blue-green or Canary. Recreate and Rolling come with the Pipeline, and Blue-green and Canary each need their research. Blue-green keeps the old fleet serving, so a bad deploy breaks only a slice of requests, but it deploys slower and bills more. The Pipeline carries no traffic, so the caption looks the same in every strategy. The difference shows during a [Bad deploy](/incidents/bad-deploy).

::Design{id="deploy-canary"}

A canary sends a small share of traffic first, so a bad deploy has its smallest reach. It is also the slowest strategy to ship. Blue-green needs [Blue-green deploys](/research/blue-green), and the canary needs [Canary deploys](/research/canary), which also needs [Percentiles](/research/percentiles). Both need [Continuous delivery](/research/ci). The glossary defines [blue-green deployment](/glossary/blue-green-deployment) and [canary deployment](/glossary/canary-deployment).
