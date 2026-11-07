---
title: Expand and contract
summary: Change a database schema in small steps that old and new code both accept, so a deploy never needs downtime or a lockstep release.
section: patterns
group: Deploys and change
order: 601
aliases: online migration, schema change, zero downtime migration, parallel change, rename column
---

Expand and contract changes a schema in three safe phases instead of one risky one.

## Use it when

- You rename or retype a column, or split a table, on a database that stays up.
- Several versions of the app run at once during a rollout.

## How it works

Renaming `name` to `full_name` in one step breaks every server that still reads `name`. Instead:

1. Expand: add `full_name` and keep `name`. Deploy code that writes both and reads the new one, falling back to the old.
2. Migrate: copy old rows over in small batches, so no single statement holds a lock for long.
3. Contract: once every server runs the new code and the copy is complete, drop `name`.

Each phase can ship and roll back by itself. A bad deploy in phase 1 reverts without touching data.

## What it costs

A one-line change turns into three releases over days. Backfills add load, so run them in throttled batches. Skipping the contract phase leaves dead columns that confuse the next reader, and rushing it is how a rollback becomes impossible.

## In Quorum

Research [Online migrations](/research/online-migrations), then [Expand and contract](/research/expand-contract). The game has no Node setting for either. They change how a schema change behaves: online migrations make the [Migration lock](/incidents/migration-lock) incident rarer, and expand and contract removes its cause. Both cost extra Dev Hours on a Feature that changes a relational schema, and a Document Store has no schema to migrate. The glossary defines [expand and contract](/glossary/expand-and-contract), and [Online migrations](/patterns/online-migrations) covers the lock itself.
