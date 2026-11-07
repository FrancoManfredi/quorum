---
title: Strangler pattern
summary: Replace an old system piece by piece behind one front door, so the new one takes over without a big-bang rewrite.
section: patterns
group: Deploys and change
order: 604
aliases: strangler fig, strangler, incremental migration, rewrite, legacy, migration
---

The strangler pattern moves traffic from an old system to a new one in slices, until the old one has nothing left to serve.

## Use it when

- A rewrite would take a year, and the business cannot wait for it to finish.
- You can put a router or proxy in front of the old system.
- Parts of the old system can be replaced one at a time, such as one URL path.

## How it works

A router sits in front of both systems. At first, everything goes to the old one. You build one slice in the new system, send a small share of its traffic there, compare results, and grow the share. When a slice reaches 100%, you delete its old code. The name comes from Martin Fowler's image of a strangler fig growing around a tree.

## What it costs

Both systems run for a long time, so you pay for both and keep their data in sync. The router becomes a critical piece. Teams often stall in the middle with two half-used systems, so set an end date and delete old code as slices finish.

## In Quorum

The game teaches this as a Stack migration, not a Node setting, so it has no Design. Changing a Service's Stack costs Dev Hours, then shifts its App Servers over in steps while both versions run. Each moved server reveals bugs until the team ships a fix, and the Service's Features build slower during the migration. See [Choose a stack](/guides/choose-a-stack) and [Teams and velocity](/explanation/team-and-velocity). The glossary defines the [strangler pattern](/glossary/strangler-pattern).
