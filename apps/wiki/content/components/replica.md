The Read Replica stands for a PostgreSQL or MySQL streaming replica: a copy of the primary that answers reads.

## When to place it

- Place it when the Database CPU is high from reads and a [Cache](/components/cache) cannot hold the hot data. Link your App Servers to both the primary and the replicas, and reads spread across them.
- Skip it when the mix is write-heavy. That needs a bigger primary, not more replicas.

The [Stale Checkout](/sandboxes/stale-checkout) and [Missed Write](/sandboxes/missed-write) Sandboxes show stale reads.

::Sandbox{id="stale-checkout"}

## How it works

It takes only read queries and sends nothing on. It uses the same capacity model as the [Database](/components/database), with an instance type and size, and it has its own connection limit. Its engine is its own choice too: a MySQL replica gives each connection a thread, and holds more of them than a Postgres one. Writes still go to the primary.

Replicas lag behind the primary, and the lag grows with the write rate. A read that hits a lagging replica can come back stale. A stale answer fails an API read and a checkout that reads its own write, though page views accept it. See [replication lag](/glossary/replication-lag).

## Options

With [Synchronous replication](/research/sync-replication) a replica can be made synchronous. Every write on the primary then waits for it, more across zones and regions, and it serves no stale read. If it goes down, every write times out until it is back. Keep one when a read must never be stale and the writes can afford the wait.

## How it fails

- [Replication lag](/incidents/repl-lag): a burst of writes leaves the replicas seconds behind, and reads after a write come back stale. [Read-your-writes routing](/research/ryw-routing) lets an App Server send those reads to the primary.
- Like every Database, it refuses connections past its limit.
- [Instance failure](/incidents/instance) takes one replica out. Its share of reads fails until you replace it.

## Tips

- Turn on read-your-writes on App Servers that serve checkouts.
- Buy a bigger primary, not more replicas, for a write-heavy mix.

:::Note{tone="real"}
Asynchronous replication is the default in real Postgres, so real replicas lag too. See [read-your-writes consistency](/glossary/read-your-writes-consistency).
:::
