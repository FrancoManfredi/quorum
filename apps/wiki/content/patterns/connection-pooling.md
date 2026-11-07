---
title: Connection pooling
summary: Put a pooler between the app and the database so many app connections share a few database connections.
section: patterns
group: Scaling reads and compute
order: 209
aliases: pgbouncer, connection pool, max connections, too many connections, session pooling, transaction pooling
---

A connection pooler keeps a small set of open database connections and lends them to app connections only while they are working.

## Use it when

- The database logs "too many connections" after you add app servers or workers.
- Most app connections sit idle between queries.
- Each app process opens its own pool, so the total grows with every deploy.

## How it works

A database connection is costly. PostgreSQL starts a process for each one and defaults to 100 connections. If 20 app servers each hold a pool of 20, that is 400 connections for a database that allows 100. A pooler such as PgBouncer accepts all 400 and forwards queries over a few dozen.

The mode sets how long a connection is lent. Session mode holds it for the whole client session, so it saves little. Transaction mode returns it after each transaction, which is the common choice. Statement mode returns it after each statement and cannot run a multi-statement transaction.

## What it costs

Transaction mode breaks anything that relies on session state, such as session variables, advisory locks, and prepared statements on some setups. The pooler is also one more hop and one more thing to keep running. Pooling hides a connection shortage, but it does not make the database faster.

## In Quorum

Place a [Connection Pooler](/components/pooler) between the [App Server](/components/server) and the [Database](/components/database) after researching [Connection pooling](/research/pooling). Mode is the one setting.

::Design{id="pooled"}

The [Connection exhaustion](/incidents/connections) incident is what it prevents. The glossary defines [connection pooling](/glossary/connection-pooling).
