The Connection Pooler stands for PgBouncer: a proxy that lets many app connections share a few database connections.

## When to place it

- Place it when the Database refuses connections: errors show `refused` while its CPU is not full. This happens when you add App Servers, or when a runtime opens a large pool per process.

The [Connection Limit](/sandboxes/connection-limit) Sandbox shows it.

::Sandbox{id="connection-limit"}

## How it works

Place it between your App Servers or Workers and the [Database](/components/database). It takes the same queries the Database takes and passes them on, with almost no added latency. It has a throughput limit, and each size step doubles it.

It takes **one** link out. A real PgBouncer reads no SQL and sends every connection to one host, so it cannot send reads to a replica and writes to the primary. To reach a [Read Replica](/components/replica) as well, link the pooler into a [Load Balancer](/components/lb), and the Load Balancer into the Database and each replica. The Load Balancer then splits reads by its algorithm, while writes go to the Database only.

Both pooled modes break session state the same way: prepared statements and `SET` at session level belong to a connection the client no longer holds. See [connection pooling](/glossary/connection-pooling).

## Options

Its mode sets how many Database connections it opens:

- **Transaction** (the default): every client shares 20 server connections. Code that keeps session state breaks, and a share of requests crash until your team finishes the "Drop session state" task on the [Team](/team#tasks) page.
- **Statement**: one server connection per statement. It shares the same 20 server connections as Transaction, so it packs no tighter here. A transaction that spans several statements cannot run through it, so every checkout fails. Choose it only in a Design whose writes are single statements.
- **Session**: one server connection per client. Nothing breaks, and it barely helps.

## How it fails

- Without one, [Connection exhaustion](/incidents/connections) is much more likely. A deploy doubles every pool, and Postgres refuses the excess.
- In transaction mode, crashes continue until the session-state task is done.
- Overloaded, it drops queries before they reach the Database.

### [Instance failure](/incidents/instance)

- **Signs:** The Connection Pooler's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host. A **Standby** (Zone section, needs [Multiple zones](/research/multi-az)) takes over by itself, with no click.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Press **Fail over** on the banner, or on the Node's card. It needs [Multiple zones](/research/multi-az) and promotes the Node's **Standby** at once; the Node then keeps no standby until you give it one. A Node with no standby stays down until the incident ends, at most 120 sim seconds, and one with a standby also fails over by itself after a share of that time.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting. Give it a **Standby**.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Queue the "Drop session state" task as soon as you place a Pooler in transaction mode.
- Link a [Cache](/components/cache) to the Pooler, not straight to the Database.
