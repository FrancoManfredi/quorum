import type { RequestKind } from '@quorum/simulation/catalog'
import { at, design, set, setLink, wire } from '../design.ts'
import type { Design, DesignDef } from '../design.ts'

/** A Design whose Users send only the kinds the step is about, instead of the whole Era's mix. */
const withMix = (def: DesignDef, mix: Partial<Record<RequestKind, number>>): Design => {
  const built = design(def)
  return { ...built, game: { ...built.game, scenario: { mix } } }
}

/* Scaling steps 2: the data tier grows sideways, then the work that can wait leaves the request. */

export const step2 = {
  'read-write-split': withMix(
    {
      users: 3000,
      stage: 3,
      researched: ['replication', 'ryw-routing'],
      nodes: [
        at('server', 'server', 1, 0, [
          set(
            'ryw',
            true,
            'Read your writes',
            'A user who just saved something reads it from the primary, so a replica that has not caught up cannot show the old copy.',
          ),
          set(
            'size',
            2,
            'Instance size',
            'The app only runs code and routes, so it stays small while the data tier grows.',
          ),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'The primary takes every write and the reads that must be fresh. It no longer takes the bulk of the reads.',
          ),
        ]),
        at('replica', 'replica', 2, 2, [
          set(
            'size',
            2,
            'Instance size',
            'Match the primary, because it replays every write the primary takes and then answers reads on top.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'replica')],
    },
    { page: 0.3, read: 0.45, write: 0.2, login: 0.05 },
  ),
  'search-engine': withMix(
    {
      users: 3000,
      stage: 2,
      researched: ['full-text-search'],
      nodes: [
        at('server', 'server', 1, 0, [
          set(
            'size',
            2,
            'Instance size',
            'Small gives the app room to run the query it builds for each search.',
          ),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'The Database keeps the rows. Once a Search Engine is linked it stops answering searches.',
          ),
        ]),
        at('search', 'search', 2, 2, [
          set(
            'searchVariant',
            'elasticsearch',
            'Product',
            'Elasticsearch takes shards, replicas, and a heap choice when the index grows. Meilisearch is smaller and faster, but its results drift from the query as the index grows.',
          ),
          set(
            'refresh',
            1,
            'Refresh interval',
            'A new document is searchable within a second, so no search answers from an old index. A longer interval saves indexing CPU and returns staler results.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'search')],
    },
    { page: 0.3, read: 0.3, write: 0.1, search: 0.3 },
  ),
  'document-store': withMix(
    {
      users: 3000,
      stage: 3,
      researched: ['document-db'],
      nodes: [
        at('server', 'server', 1, 0, [
          set('size', 2, 'Instance size', 'Small is enough, because the store does the data work.'),
        ]),
        at('pay', 'psp', 2, 1),
        at('documents', 'doc', 2, 0, [
          set(
            'transactions',
            true,
            'Multi-document transactions',
            'A checkout writes several documents, and without this a failure halfway leaves the order half saved. Every write pays more latency for it.',
          ),
          set(
            'size',
            2,
            'Instance size',
            'One flat rate covers reads and writes, so size is the only capacity knob.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'documents'), wire('server', 'pay')],
    },
    { page: 0.3, read: 0.4, write: 0.25, buy: 0.05 },
  ),
  'wide-column-quorum': withMix(
    {
      users: 3000,
      stage: 3,
      researched: ['sharding', 'leaderless'],
      nodes: [
        at('server', 'server', 1, 0, [
          set('size', 2, 'Instance size', 'Small is enough, because the store does the data work.'),
        ]),
        at('wide', 'wide', 2, 0, [
          set(
            'r',
            2,
            'Read quorum (R)',
            'A read asks two of the three replicas, so at least one holds the latest write.',
          ),
          set(
            'w',
            2,
            'Write quorum (W)',
            'A write waits for two of three. With R at two, R plus W is above N, so every read sees the last write.',
          ),
          set(
            'size',
            2,
            'Instance size',
            'A write costs N replica operations and a read costs R, so capacity is spent faster than the size suggests.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'wide')],
    },
    { page: 0.3, read: 0.4, write: 0.3 },
  ),
  'split-by-feature': withMix(
    {
      users: 4000,
      stage: 3,
      researched: ['api-gateway'],
      nodes: [
        at('gateway', 'gw', 1, 1, []),
        at('browse', 'server', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'The browse side is read-heavy, so it is sized for code and cache-friendly reads.',
          ),
        ]),
        at('orders', 'server', 2, 2, [
          set(
            'size',
            2,
            'Instance size',
            'The orders side owns writes and checkouts, so it is sized on its own.',
          ),
        ]),
        at('browse-db', 'database', 3, 0, [
          set('size', 2, 'Instance size', 'Holds catalog data. Tune it for reads.'),
        ]),
        at('pay', 'psp', 3, 4),
        at('orders-db', 'database', 3, 2, [
          set('size', 2, 'Instance size', 'Holds orders. Tune it for writes and durability.'),
        ]),
      ],
      links: [
        wire('users', 'gateway'),
        wire('gateway', 'browse', [
          setLink(
            'kinds',
            ['page', 'read'],
            'Kinds sent to Browse',
            'The Gateway routes by request kind, which stands for routing by feature.',
          ),
        ]),
        wire('gateway', 'orders', [
          setLink(
            'kinds',
            ['write', 'buy'],
            'Kinds sent to Orders',
            'Writes and checkouts go to the side that owns the order data.',
          ),
        ]),
        wire('browse', 'browse-db'),
        wire('orders', 'orders-db'),
        wire('orders', 'pay'),
      ],
    },
    { page: 0.3, read: 0.4, write: 0.2, buy: 0.1 },
  ),
  'queue-and-workers': withMix(
    {
      users: 2000,
      stage: 4,
      researched: ['background-jobs', 'queues'],
      nodes: [
        at('server', 'server', 1, 0, [
          set('size', 2, 'Instance size', 'It only enqueues exports now, so it stays small.'),
        ]),
        at('database', 'database', 3, 0, [
          set('size', 3, 'Instance size', 'Workers read from it while users do, so give it room.'),
        ]),
        at('queue', 'queue', 2, 2, [
          set(
            'dlq',
            true,
            'Dead-letter queue',
            'A task that keeps failing is parked after its attempts, so it cannot block the line forever.',
          ),
          set(
            'attempts',
            3,
            'Max attempts',
            'Three tries cover a blip. Beyond that the task is broken and a retry only burns Worker time.',
          ),
          set(
            'maxLength',
            10_000,
            'Max length',
            'A full Queue refuses new tasks instead of hiding a backlog that grows without limit.',
          ),
        ]),
        at('worker', 'worker', 3, 2, [
          set(
            'size',
            2,
            'Instance size',
            'An export reads many rows, so a Worker needs room beyond the smallest box.',
          ),
          set(
            'replicas',
            3,
            'Copies',
            'Several copies drain the backlog faster than one box could, and Queue depth tells you when to add more.',
          ),
          set(
            'prefetch',
            10,
            'Prefetch',
            'Each process takes ten tasks ahead of time, which spares broker round trips. A crash loses only those ten.',
          ),
        ]),
      ],
      links: [
        wire('users', 'server'),
        wire('server', 'database'),
        wire('server', 'queue'),
        wire('queue', 'worker'),
        wire('worker', 'database'),
      ],
    },
    { page: 0.45, read: 0.4, write: 0.1, job: 0.05 },
  ),
  'push-fan-out': withMix(
    {
      users: 3000,
      stage: 5,
      researched: ['background-jobs', 'queues', 'notifications', 'timeouts', 'backoff-jitter'],
      nodes: [
        at('server', 'server', 1, 0, [
          set('size', 2, 'Instance size', 'It only hands the notification to the Queue.'),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'Serves the reads and writes the rest of the traffic makes.',
          ),
        ]),
        at('queue', 'queue', 2, 2, [
          set(
            'dlq',
            true,
            'Dead-letter queue',
            'A notification that fails every time is parked, not retried forever.',
          ),
        ]),
        at('worker', 'worker', 3, 2, [
          set(
            'replicas',
            2,
            'Copies',
            'The Workers do the sending, so more copies mean the Queue drains faster.',
          ),
        ]),
        at('push', 'msgp', 4, 2, []),
      ],
      links: [
        wire('users', 'server'),
        wire('server', 'database'),
        wire('server', 'queue'),
        wire('queue', 'worker'),
        wire('worker', 'push', [
          setLink(
            'timeout',
            5,
            'Timeout',
            'A provider that stalls should free the Worker in seconds, not hold it for the default wait.',
          ),
          setLink(
            'retries',
            'backoff',
            'Retries',
            'A failed send is tried again after a growing delay, so a provider blip does not drop notifications.',
          ),
        ]),
      ],
    },
    { page: 0.5, read: 0.1, write: 0.1, push: 0.3 },
  ),
  'function-front': withMix(
    {
      users: 1500,
      stage: 3,
      researched: ['serverless', 'lang-go'],
      nodes: [
        at('fn', 'fn', 1, 0, [
          set(
            'runtime',
            'go',
            'Runtime',
            'A Go binary starts cold in a few dozen milliseconds, where a JVM takes seconds. Cold starts are the price of scaling to zero.',
          ),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'Functions have no pool to share, so a spike of executions lands on the Database.',
          ),
        ]),
      ],
      links: [wire('users', 'fn'), wire('fn', 'database')],
    },
    { page: 0.5, read: 0.4, write: 0.1 },
  ),
  'autoscaled-servers': withMix(
    {
      users: 4000,
      stage: 3,
      researched: ['load-balancing', 'autoscaling'],
      nodes: [
        at('lb', 'lb', 1, 0, []),
        at('server', 'server', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'Each copy is a small box, so capacity grows in small steps.',
          ),
          set(
            'replicas',
            2,
            'Copies',
            'The Autoscaler starts here and moves the number as load changes.',
          ),
        ]),
        at('scaler', 'autoscaler', 2, 2, [
          set(
            'signal',
            'rps',
            'Signal',
            'Requests per copy follow traffic whatever the runtime. CPU can read low while worker slots are full.',
          ),
          set(
            'minCopies',
            2,
            'Min copies',
            'Two copies keep serving while a new one boots, which takes minutes on a VM.',
          ),
          set(
            'maxCopies',
            8,
            'Max copies',
            'The cap is the cost guard. A loop or an attack cannot buy more than this.',
          ),
        ]),
        at('database', 'database', 3, 0, [
          set(
            'size',
            3,
            'Instance size',
            'More copies mean more connections and more queries, so the Database has to take what they send.',
          ),
        ]),
      ],
      links: [
        wire('users', 'lb'),
        wire('lb', 'server'),
        wire('server', 'database'),
        wire('server', 'scaler'),
      ],
    },
    { page: 0.4, read: 0.4, write: 0.2 },
  ),
  'cdc-feed': withMix(
    {
      users: 3000,
      stage: 4,
      researched: [
        'full-text-search',
        'background-jobs',
        'queues',
        'event-streaming',
        'data-warehouse',
        'cdc',
      ],
      nodes: [
        at('server', 'server', 1, 0, [
          set(
            'size',
            2,
            'Instance size',
            'It writes once, to the Database, and never to the index.',
          ),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'The source of truth. The connector reads its write log, so it adds no load to a write.',
          ),
        ]),
        at('search', 'search', 2, 2, []),
        at('cdc', 'cdc', 3, 0, []),
        at('log', 'log', 4, 0, [
          set(
            'keyed',
            true,
            'Keyed by entity',
            'One row keeps its changes in one partition, so the index never applies an old change after a newer one.',
          ),
        ]),
        at('indexer', 'worker', 5, 0, [
          set(
            'size',
            2,
            'Instance size',
            'It reads every change, so it needs room for the write rate.',
          ),
        ]),
      ],
      links: [
        wire('users', 'server'),
        wire('server', 'database'),
        wire('server', 'search'),
        wire('database', 'cdc'),
        wire('cdc', 'log'),
        wire('log', 'indexer'),
      ],
    },
    { page: 0.4, read: 0.35, write: 0.1, search: 0.15 },
  ),
  'reports-on-warehouse': withMix(
    {
      users: 3000,
      stage: 4,
      researched: ['data-warehouse'],
      nodes: [
        at('server', 'server', 1, 0, [
          set(
            'size',
            3,
            'Instance size',
            'A report scan is slow, so the server holds a worker slot for each. It sends reports to the Warehouse and everything else to the Database.',
          ),
        ]),
        at('database', 'database', 2, 0, [
          set(
            'size',
            2,
            'Instance size',
            'With no scans, it spends its memory on the rows checkouts need.',
          ),
        ]),
        at('warehouse', 'warehouse', 2, 2, []),
      ],
      links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'warehouse')],
    },
    { page: 0.4, read: 0.3, write: 0.2, report: 0.1 },
  ),
  'front-door': withMix(
    {
      users: 3000,
      stage: 3,
      researched: ['waf', 'load-balancing', 'api-gateway'],
      nodes: [
        at('waf', 'waf', 1, 0, [
          set(
            'paranoia',
            2,
            'Paranoia level',
            'A middle level blocks most bots and few shoppers. Higher levels block more real users and cost more CPU.',
          ),
        ]),
        at('gateway', 'gw', 2, 0, [
          set(
            'rateLimit',
            1_000,
            'Rate limit',
            'Set a little above the peak you want to serve, so a burst past it fails as throttled at the edge instead of reaching the servers.',
          ),
        ]),
        at('server', 'server', 3, 0, [
          set('size', 2, 'Instance size', 'It sees only traffic the WAF and Gateway let through.'),
        ]),
        at('database', 'database', 4, 0, [
          set('size', 2, 'Instance size', 'Protected by both layers in front of it.'),
        ]),
      ],
      links: [
        wire('users', 'waf'),
        wire('waf', 'gateway'),
        wire('gateway', 'server'),
        wire('server', 'database'),
      ],
    },
    { page: 0.25, read: 0.35, write: 0.1, bot: 0.3 },
  ),
}
