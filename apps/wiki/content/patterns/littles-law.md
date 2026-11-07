---
title: Little's law
summary: The number of requests inside a system equals the arrival rate times the time each one spends there, which sizes every pool, queue and connection limit.
section: patterns
group: Foundations
order: 14
aliases: little's law, littles law, concurrency, in flight, pool sizing, queueing, l = lambda w
---

Little's law says that in a stable system the average number of items inside, L, equals the average arrival rate, λ, times the average time each item stays, W. John Little proved it in 1961, and it holds for any arrival pattern and any service order.

A web server gets 200 requests a second, and each takes 250 ms. L = 200 × 0.25 = 50, so about 50 requests are in flight at any moment. A worker pool of 40 cannot hold them, so the extra 10 wait in a queue or get refused. A pool of 64 holds them with room for bursts.

The same arithmetic sizes a database connection pool. 500 queries a second, each holding a connection for 20 ms, need 500 × 0.02 = 10 connections on average. Many teams set the pool at 100 and wonder why the database is overloaded, when 10 connections would have done the work.

## What it changes about a design

The law shows how a slow dependency becomes an outage. If the database slows from 20 ms to 2 s, the same 500 requests a second now need 500 × 2 = 1,000 connections. The pool fills, callers queue, the queue holds their threads, and the web tier is full within seconds, though nothing there got slower. Concurrency grew by 100 times because W did.

Three decisions follow. First, size pools from λ × W with headroom, not from habit. Second, bound W with [timeouts](/patterns/timeouts), because a call that waits 30 s multiplies the slots it holds for 30 s. Third, give each dependency its own slots ([Bulkhead](/patterns/bulkhead)) so one slow dependency cannot take them all.

The law also works backward. If you see 120 requests in flight at 400 requests a second, the average request takes 0.3 s, and you did not have to measure it.

The law promises averages only, so watch the tail separately ([Tail latency](/patterns/tail-latency)).

## In Quorum

An App Server that holds a worker or a thread per request has a fixed number of slots, and each request keeps its slot for its CPU time plus every database call it waits on. When the Database slows, slots fill first. The glossary entry for [Little's law](/glossary/littles-law) gives the game's version, [connection pooling](/glossary/connection-pooling) and [thread pool](/glossary/thread-pool) describe the limits, and [Capacity, utilization, and queues](/explanation/queues) shows the queue that forms when slots run out.
