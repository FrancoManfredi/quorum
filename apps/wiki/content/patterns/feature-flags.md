---
title: Feature flags
summary: Put a new feature behind a switch you can turn up or down at runtime, so deploying code and releasing it are separate steps.
section: patterns
group: Deploys and change
order: 603
aliases: feature flag, toggle, dark launch, rollout, kill switch, percentage rollout
---

A feature flag decides at runtime who sees a feature, so you can release without a deploy and undo without a rollback.

## Use it when

- A feature is risky, and you want to show it to 2% of users before everyone.
- You want a kill switch for a dependency or a costly path.
- You deploy often and finish features over several releases.

## How it works

The code ships with the feature off. A flag service answers "is this on for this user?" from a rule, such as a percentage or a list. You turn the share up in steps while you watch errors, then remove the flag when the feature is at 100%. If something breaks, you turn the flag off in seconds and no new build is needed. A bad deploy of a flagged feature reaches only the users who have it.

## What it costs

Every flag is a branch that has to be tested both ways, and old flags pile up as dead code. Flag service downtime needs a safe default. Flags also let teams ship half-built work, so set an owner and a removal date for each one.

## In Quorum

::Design{id="feature-flag-rollout"}

Feature Flags and the CI/CD Pipeline carry no traffic, so this Design has no settings table: the Nodes are the point. Once a Feature has shipped, the Feature Flags Node lets you set its rollout to off, or to one of a few shares of users, and a bad deploy of it reaches only that share. A Feature that is off still pays its upkeep until you remove it. [Feature flags](/research/feature-flags) needs [Continuous delivery](/research/ci). [Graceful degradation](/patterns/graceful-degradation) builds on it. The glossary defines [feature flag](/glossary/feature-flag).
