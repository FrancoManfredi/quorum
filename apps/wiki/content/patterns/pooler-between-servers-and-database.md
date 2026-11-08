---
title: Pooler between servers and database
summary: Put a Connection Pooler between the App Servers and the Database so many app connections share a few database connections.
section: patterns
group: Scaling steps
order: 107
aliases: connection pooling, pgbouncer, max connections, too many connections, connection pool, proxy
---

Place a Connection Pooler in front of the Database and point every App Server at it.

## Move up when

- The Database card reads that it is refusing queries for too many connections while its CPU is not full.
- Adding an App Server, or deploying, makes the errors worse.

## The Design

::Design{id="pools-exhaust-database"}

::Design{id="pooler-shares-connections"}

Both pictures run the same servers. In the first, each PHP-FPM worker holds its own connection, so two servers ask for more than the Database allows and requests are refused. In the second, the servers connect to the pooler, which holds a few connections to the Database.

## Why it works

Postgres forks a process per connection, so its limit arrives early. The pooler turns many short client connections into a few long server ones. The Database card in the second picture shows a small, steady connection count, and the refused requests are gone.

## What it costs

The pooler adds a small hop and one more Node that can fail. Transaction mode breaks code that keeps session state, such as prepared statements or session-level settings, so a share of requests crash until your Team finishes the Drop session state task. Statement mode cannot run a transaction that spans statements, so checkouts fail. Session mode breaks nothing and helps little.

## In Quorum

Research [Connection pooling](/research/pooling) to unlock the [Connection Pooler](/components/pooler). The [Connection Limit](/sandboxes/connection-limit) Sandbox shows the failure, and [Connection exhaustion](/incidents/connections) is the incident. [Connection pooling](/patterns/connection-pooling) covers the pattern. The next step is [DNS in front](/patterns/dns-in-front).
