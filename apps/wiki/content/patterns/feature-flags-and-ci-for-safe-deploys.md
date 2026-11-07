---
title: Feature flags and CI for safe deploys
summary: Ship through a pipeline that sends a canary first, and put new Features behind flags, so a bad deploy breaks a slice of users instead of all of them.
section: patterns
group: Stack ladder
order: 124
aliases: ci cd, continuous delivery, canary release, rollout, feature toggle, bad deploy, blast radius, deploy strategy, launchdarkly
---

Ship through a CI/CD Pipeline that rolls out gradually, and hide new Features behind flags you can turn off in one click.

## Move up when

- A **Bad deploy** bar appears and the error rate jumps for every user at once.
- You hesitate to deploy because any change can break the whole site.
- A Feature that nobody has measured is already live for everyone.

## The Design

::Design{id="safe-deploys"}

Users, the App Server and the Database serve traffic as before. The Pipeline and the Feature Flags Node carry none. The Pipeline sets how code reaches the App Server. The flags set how many users each Feature reaches.

## Why it works

A bad deploy fails a share of App Server requests for each Feature it shipped. The deploy strategy caps that share. Recreate swaps everything at once and has no cap, rolling stops after its first batch, blue-green keeps the old fleet serving, and a canary sends a small slice of traffic first.

A flag is a second ceiling. A Feature at a small rollout can only break that share of users, whatever the strategy. The smaller of the two ceilings applies, so even a Recreate deploy cannot outrun a flag.

## What it costs

A safer strategy takes longer per deploy and bills more than a plain rolling one, because a second fleet or the canary's metrics run beside it. A flag does not reduce a Feature's load or its upkeep, only its blast radius. A deploy also ships the code around the Features, so a batch with no Feature still breaks one Feature's worth. The rollout step is set per Feature on the flag card, not on a Node field, so the table shows only the strategy.

## In Quorum

Place a [CI/CD Pipeline](/components/ci) and [Feature Flags](/components/ff). Research [Continuous delivery](/research/ci), [Canary deploys](/research/canary) and [Feature flags](/research/feature-flags). Canary needs Percentiles. The [Bad deploy](/incidents/bad-deploy) incident is the one this limits. Read [canary deployment](/glossary/canary-deployment) and [feature flags](/glossary/feature-flag). The next rung, a [Realtime Hub](/patterns/websockets-tier-for-realtime), holds the connections that realtime features need.
