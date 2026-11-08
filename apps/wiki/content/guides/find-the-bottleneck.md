---
title: Find the bottleneck
summary: Find the one Node that limits your Design, learn which of its resources is full and why, and pick the fix that moves the limit.
section: guides
order: 1
aliases: bottleneck, slow design, red node, amber node, limit, saturation, hottest node, high load, busy node, why is my node slow, load change, amplification, work share, cost receipt, cost per request, what if
gdd: /design/04-simulation
---

Use this guide when Apdex falls under its target, users leave, and you do not know which Node to
fix. If you have never fixed a limit before,
[Your first bottleneck](/tutorials/first-bottleneck) teaches the same loop step by step.

A Design is only as fast as its slowest Node. That Node is the
[bottleneck](/explanation/queues), and adding capacity anywhere else costs Cash and changes nothing.

## Find the Node

1. Look for the Node with a pulsing amber outline. Only one Node has it at a time.
2. Select that Node. The Inspector opens.
3. Read the **Load** row. It shows the [utilization](/glossary/utilization) of that Node, as in
   "85% of 120/s".
4. Compare the row color with these limits:
   - Plain: under 70%. The Node is healthy.
   - Amber: 70% or more. Waiting time rises fast.
   - Red: 90% or more. The tail latency is several times the median.

The game rechecks once per second, trying each of the busiest Nodes with double the capacity and
marking the one that earns the most revenue. Only Nodes above 60% load can get the marker.

If no Node has the outline, capacity does not limit your revenue, so go to "When there is no marker"
below.

## Find the full resource

1. In the Inspector, read the **Resources** section of the bottleneck Node.
2. Find the gauge that is nearest to full. Use the table to choose the fix.

| Full gauge                 | What it means                                                            | Fix                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| CPU                        | The Node does too much work per request.                                 | Select **Larger**, or place a second copy behind a [Load Balancer](/components/lb).                    |
| Workers busy, with CPU low | Each request holds a worker while it waits for a slower Node downstream. | Fix the Node that the requests wait for. Or select **More workers** if **RAM fits** a larger pool.     |
| RAM                        | The process is near its memory limit.                                    | Select **Fewer workers**, select **Larger**, or pick the **Memory** family.                            |
| CPU credits                | A Burstable box spent its credits and runs at a fraction of its CPU.     | Pick the **General** or **Compute** family.                                                            |
| Connections                | The Database is at its connection limit.                                 | Place a [Connection Pooler](/components/pooler). See [Scale the database](/guides/scale-the-database). |

A full "Workers busy" gauge with low CPU is the most common trap: the App Server looks full, but the
slow part is the Database behind it. That is [Little's law](/glossary/littles-law): a request that
waits longer holds its worker longer.

## Find out why it is busy

A full gauge says which resource ran out, not why. Load rises for one of three reasons: more requests
arrive, each request costs more, or the Node has less capacity. Each reason has different fixes, so
find the reason before you buy anything. The **Traffic & load** section of the Inspector has a block
for each question, and each block's **Why?** link opens its part of this page.

### Read the Load change

**Load change** compares the Node now with one calendar hour earlier.

- **More traffic** means demand grew. Capacity is the fix: a larger size, a second copy behind a
  [Load Balancer](/components/lb), or a [Cache](/components/cache) in front so fewer requests arrive.
- **Each request costs more** means the same requests got heavier. More capacity hides it until
  traffic grows again, so read the **Cost per request** block to find what changed.
- **Less capacity** means the Node lost room: a copy went down, a Burstable box ran out of credits, or
  a restart left the Node cold.

With [Metrics](/research/metrics), the block splits the change into points for demand, cost per
request, and capacity, and they add up to the change. A dashed line on the chart marks each moment
the cost per request jumped. Select that point to read the sample from just after the jump.

### Read Amplification

With [Distributed tracing](/research/tracing), **Amplification** lists the Users' Request kinds behind
the Node's traffic, as "300/s × 4.0 = 1,200/s": one `checkout` from the Users becomes four calls here.

- **A multiplier under 1** means most of those requests never reach this Node: a Cache answered them,
  their path does not call it, or a Node in front dropped them.
- **A large multiplier** on one kind points at the code, not the Node. An ORM that sends one query per
  row is an [N+1 query](/glossary/n1-query), and [Eager loading](/research/eager-loading) folds them
  into one.
- **Retries and hedges** is the share of the traffic that is a second try. When it climbs while the
  Node fails calls, it is a [Retry storm](/incidents/retry-storm): set **Backoff** and **Breaker** on
  the Links into the Node. [Stop a retry storm](/guides/stop-a-retry-storm) walks through it.
- **Cache misses** is the share that came through a Cache or CDN that did not have the answer. A high
  share after a restart is a cold Cache. A high share that stays means the Cache is too small or its
  TTL too short.

**Slowest call** names the Node this one calls that takes the longest. On an App Server with full
**Workers busy**, fix that Node first.

### Read the Cost receipt

With [Profiling](/research/profiling), each operation under **Incoming operations** shows its work
share next to its traffic share: how much of the limiting resource it takes. A rare operation can take
most of it. **Cost per request** lists the operations, most expensive first. Open one to read its Cost
receipt: the base cost, then every factor that multiplies it. A factor above 1 is amber, and a factor
below 1 is a fix you already have.

| Line                             | Where it comes from                                    | What removes it                                                                                                                          |
| -------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Table bloat                      | Dead rows that VACUUM has not cleaned yet.             | [Table bloat](/incidents/table-bloat) passes. A [Retention](/research/retention) window or a MySQL engine prevents it.                   |
| Hot shard                        | One big tenant's key on one shard.                     | [Big tenant hot shard](/incidents/hot-shard): [Sharding](/research/sharding) with a better key, or [Caching](/research/caching).         |
| Unindexed scan                   | A query that reads the whole table.                    | [Slow query](/incidents/slow-query): [Query analysis](/research/query-analysis) finds the missing index.                                 |
| Report scans in the buffer cache | Reports push hot pages out of RAM.                     | Move reports to a [Data Warehouse](/components/warehouse). See [Report kills the database](/incidents/report-db).                        |
| Working set on disk              | The data no longer fits in RAM.                        | A larger size or the **Memory** family, or a [Read Replica](/components/replica) for reads.                                              |
| Features                         | Shipped Features that make queries heavier.            | The cost of the Feature. [Denormalization](/research/denormalization) makes reads cheaper.                                               |
| Indexes                          | Each index the Team added slows every write.           | The price of faster reads. Add an index only for a query that needs it.                                                                  |
| Shard fan-out                    | A search or report asks every shard.                   | A [Search](/components/search) Node for searches, a Data Warehouse for reports.                                                          |
| Cold start                       | A restart, or a JIT runtime that has not warmed.       | Wait, or see [JVM warmup under load](/incidents/jvm-warmup).                                                                             |
| Garbage collection               | The heap is nearly full.                               | More RAM, or a better collector: [ZGC](/research/zgc), [Go GC tuning](/research/gogc-tuning). See [GC pause storm](/incidents/gc-storm). |
| Swapping                         | The process is out of RAM.                             | **Fewer workers**, a larger size, or the **Memory** family.                                                                              |
| Runtime, Framework               | The Stack's speed and its overhead per request.        | [Choose a Stack](/guides/choose-a-stack).                                                                                                |
| Serialization                    | Each call the code makes is encoded on the way out.    | Fewer calls, or [Binary RPC](/research/binary-rpc).                                                                                      |
| Analytics sampling               | An Analytics tap samples this Node.                    | A lower sample rate on the [Analytics](/components/analytics) Node.                                                                      |
| Noisy neighbours                 | The Shared tenancy Mutator lends your cores to others. | Nothing: it comes and goes.                                                                                                              |

### Try a what-if

With [Profiling](/research/profiling), a selected Node that is amber or red shows **What if** rows:
its load after one change you can make now, such as **Larger** on this Node, on the Cache in front of
it, or on the busiest Node it calls, and **Retries off** on the Links into it. Each row is a short
ghost run of the real Design, so a row can surprise you. A larger App Server that waits on a slow
Database lets more requests through to that Database, and its own load goes up.

The rows show what happens, not what to buy. Compare each row's drop with its Burn before you pick.

## Apply the fix and check it

1. Make one change only.
2. Wait a few seconds of game time, so that the flow settles.
3. Check that the Load row of the old bottleneck falls under 70%.
4. Check that Apdex on the HUD rises toward its target.
5. Look for the outline again. It usually moves to a new Node, so repeat from the first step.

If the outline stays on the same Node and its Load does not fall, you fixed the wrong resource, so go
back to the gauges and pick again.

:::Note{tone="warn"}
**Larger** and a change of family restart the Node for a short time. A single Node with no second
copy drops its traffic while it restarts.
:::

The Shared Box Sandbox starts with the Database and the App Server on one box, so you can find out
which resource fills first and fix it within the Burn limit.

::Sandbox{id="shared-box"}

## When there is no marker

The Design can lose users with no bottleneck at all, so check these places:

- **A red "Stranded" row** on a Node card. No linked Node accepts a request kind. Draw a Link
  to a Node that accepts it.
- **Errors** on the HUD. With [Structured logs](/research/logs), select the Users Node and read
  **Errors by cause**.
- **Why users leave.** Select **Users** on the HUD. Each row names a request kind and a cause. A
  `slow` row has a **Show** button that selects the bottleneck Node for you.

## Other ways to find it

- Press **D** to open the [Dashboard](/explanation/observability), once you own
  [Metrics](/research/metrics). The **Saturation** row shows each Node's load over time. The stat
  **Hottest Node** names the busiest Node.
- With [Percentiles](/research/percentiles), the Latency row of each card shows the p99. A Node with
  a high p99 and a low load points to tail events, not capacity. See
  [Read p99 and tail latency](/guides/read-p99).
