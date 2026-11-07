import { at, design, set, setLink, wire } from '../design.ts'
import type { Design } from '../design.ts'

/* Patterns: "Scaling data" and "Messaging and async". */

export const patternsData = {
  'sharded-hash-key': design({
    users: 3_800,
    stage: 2,
    researched: ['sharding'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, so the App Server is not the limit and the shards are.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Each shard is another copy of the Database, and writes divide across them.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash of the user ID sends every user to one shard and spreads users evenly, so no shard runs hot.',
        ),
        set(
          'size',
          2,
          'Instance size',
          'Small for each shard, so a shard that takes too much of the load shows.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'hot-shard-range-key': design({
    users: 3_800,
    stage: 2,
    researched: ['sharding'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, so the App Server is not the limit and the shards are.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Four shards, the same as the hash Design, so only the key differs.',
        ),
        set(
          'shardKey',
          'range',
          'Shard key',
          'A range of IDs sends every new user to the last shard, so that shard takes the writes while the others idle.',
        ),
        set(
          'size',
          2,
          'Instance size',
          'Small for each shard, so a shard that takes too much of the load shows.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'hot-key-split': design({
    users: 4000,
    incident: { kind: 'hot-key', node: 'cache' },
    stage: 2,
    researched: ['caching', 'hybrid-fanout'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, so the App Server is not the limit.'),
      ]),
      at('cache', 'cache', 2, 0, [
        set(
          'split',
          true,
          'Split hot keys',
          'A key that takes a large share of reads is spread across the Cache shards, so the Cache keeps its full capacity while the hot key runs.',
        ),
        set('size', 3, 'Instance size', 'Medium, so the hot key has shards to spread over.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium. It serves only what the Cache misses.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')],
  }),
  'hot-key-bare': design({
    users: 4000,
    incident: { kind: 'hot-key', node: 'cache' },
    stage: 2,
    researched: ['caching', 'hybrid-fanout'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, so the App Server is not the limit.'),
      ]),
      at('cache', 'cache', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium, as in the split Design, so only the setting differs.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium. It serves only what the Cache misses.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')],
  }),
  'hash-balanced-pair': design({
    users: 3_000,
    stage: 2,
    researched: ['load-balancing', 'lb-algorithms'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'hash',
          'Policy',
          'Consistent hash gives every target an equal share of the keys, and a target that leaves moves only its own keys.',
        ),
      ]),
      at('server-a', 'server', 2, -1, [
        set('size', 2, 'Instance size', 'Small. Each target takes half of the keys.'),
      ]),
      at('server-b', 'server', 2, 1, [
        set(
          'size',
          2,
          'Instance size',
          'The same size as its twin, because a hash split ignores load.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium, shared by both App Servers.'),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server-a'),
      wire('lb', 'server-b'),
      wire('server-a', 'database'),
      wire('server-b', 'database'),
    ],
  }),
  'federated-by-kind': design({
    users: 3_000,
    stage: 2,
    researched: ['load-balancing'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('orders', 'server', 2, -1, [
        set('size', 2, 'Instance size', 'Small. The orders service carries checkouts and writes.'),
      ]),
      at('catalog', 'server', 2, 1, [
        set('size', 2, 'Instance size', 'Small. The catalog service carries page views and reads.'),
      ]),
      at('orders-db', 'database', 3, -1, [
        set(
          'size',
          2,
          'Instance size',
          'Holds orders only, so writes never queue behind catalog reads.',
        ),
      ]),
      at('catalog-db', 'database', 3, 1, [
        set(
          'size',
          2,
          'Instance size',
          'Holds the catalog only, and can be resized apart from orders.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'orders', [
        setLink(
          'kinds',
          ['write', 'buy', 'login'],
          'Request kinds',
          'The Load Balancer sends writes, checkouts, and logins to the orders service.',
        ),
      ]),
      wire('lb', 'catalog', [
        setLink(
          'kinds',
          ['page', 'read', 'search', 'upload', 'media', 'rt', 'bot', 'job', 'report', 'ai'],
          'Request kinds',
          'Everything else goes to the catalog service.',
        ),
      ]),
      wire('orders', 'orders-db'),
      wire('catalog', 'catalog-db'),
    ],
  }),
  'sync-replica': design({
    users: 3000,
    stage: 2,
    researched: ['replication', 'sync-replication'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set('size', 3, 'Instance size', 'Medium. It takes every write and waits for the replica.'),
      ]),
      at('replica', 'replica', 2, 1, [
        set(
          'sync',
          true,
          'Synchronous',
          'Every write waits for this replica before it is confirmed, so the replica never lags and serves no stale read.',
        ),
        set(
          'size',
          3,
          'Instance size',
          'The same size as the primary, because it repeats every write.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'replica')],
  }),
  'quorum-strong': design({
    users: 3000,
    stage: 1,
    researched: ['sharding', 'leaderless'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('store', 'wide', 2, 0, [
        set(
          'n',
          3,
          'N, replicas per key',
          'Three copies of every key, so one lost replica does not lose data.',
        ),
        set('r', 2, 'R, replicas a read asks', 'A read asks two of the three replicas.'),
        set(
          'w',
          2,
          'W, replicas a write waits for',
          'A write waits for two. R plus W is four, which is more than N, so every read overlaps the latest write.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'store')],
  }),
  'quorum-weak': design({
    users: 3000,
    stage: 1,
    researched: ['sharding', 'leaderless'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('store', 'wide', 2, 0, [
        set('n', 3, 'N, replicas per key', 'Three copies of every key, as in the strong Design.'),
        set(
          'r',
          1,
          'R, replicas a read asks',
          'A read asks one replica, the cheapest and fastest read.',
        ),
        set(
          'w',
          1,
          'W, replicas a write waits for',
          'A write waits for one. R plus W is two, which is not more than N, so a read can miss the latest write.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'store')],
  }),
  'consensus-store': design({
    users: 3000,
    stage: 1,
    note: 'The cost of consensus shows when the store spreads across regions. This single-region Node only shows its size and latency.',
    researched: ['sync-replication', 'consensus'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('store', 'dsql', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small. Each size step doubles its transactions per second.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'store')],
  }),
  'ryw-routed-reads': design({
    users: 3000,
    stage: 2,
    researched: ['replication', 'ryw-routing'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'ryw',
          true,
          'Read your writes',
          'Reads that follow a write go to the primary, so a user sees what they just saved.',
        ),
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set(
          'size',
          3,
          'Instance size',
          'Medium. It takes every write and the reads that follow one.',
        ),
      ]),
      at('replica', 'replica', 2, 1, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads that can be a moment old.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'replica')],
  }),
  'search-index-tuned': design({
    users: 3000,
    stage: 2,
    researched: ['full-text-search'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set(
          'size',
          3,
          'Instance size',
          'Medium. It keeps the source of truth and no longer answers search.',
        ),
      ]),
      at('search', 'search', 2, 1, [
        set(
          'searchVariant',
          'elasticsearch',
          'Product',
          'Elasticsearch runs shards and replicas. Meilisearch runs one node and takes neither.',
        ),
        set(
          'searchShards',
          2,
          'Shards',
          'Two shards split the index, but every query fans out to both.',
        ),
        set(
          'searchReplicas',
          1,
          'Replicas',
          'One replica copies each shard and adds query capacity.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'search')],
  }),
  'warehouse-for-reports': design({
    users: 800,
    stage: 4,
    mix: { page: 0.4, read: 0.3, write: 0.1, login: 0.05, report: 0.15 },
    researched: ['websockets', 'data-warehouse'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set('size', 3, 'Instance size', 'Medium. It serves users and no longer scans history.'),
      ]),
      at('warehouse', 'warehouse', 2, 1),
      at('llm', 'llm', 3, -1),
      at('psp', 'psp', 3, -3),
      at('ws', 'ws', 3, 1, [
        set(
          'runtime',
          'node',
          'Stack',
          'An event loop holds each open connection for a few KB, where the default Stack holds a worker for each.',
        ),
        set('clustering', true, 'Clustering', 'Without it one box takes every connection.'),
      ]),
      at('storage', 'storage', 3, 3),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'warehouse'),
      wire('server', 'psp'),
      wire('server', 'llm'),
      wire('users', 'ws'),
      wire('server', 'storage'),
    ],
  }),
  'lifecycle-storage': design({
    users: 3000,
    stage: 2,
    mix: { page: 0.3, read: 0.3, media: 0.25, upload: 0.15 },
    researched: ['object-storage', 'lifecycle-rules'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set(
          'size',
          3,
          'Instance size',
          'Medium. It keeps the rows, and the files live in Object Storage.',
        ),
      ]),
      at('storage', 'storage', 2, 1, [
        set(
          'storageClass',
          'standard',
          'Storage class',
          'New objects start in Standard, the class that reads fast and costs the most.',
        ),
        set(
          'lifecycle',
          30,
          'Lifecycle (days)',
          'An object older than this moves one class cheaper, from Standard to Infrequent access and then to Archive.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'storage')],
  }),
  'queue-leveled': design({
    users: 3_000,
    stage: 2,
    researched: ['queues', 'background-jobs'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('queue', 'queue', 2, -1),
      at('worker', 'worker', 3, -1, [
        set(
          'size',
          2,
          'Instance size',
          'Small. Workers set how fast the backlog drains, so size them for the average rate and let the Queue hold the burst.',
        ),
      ]),
      at('database', 'database', 2, 1, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads and writes users wait for.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'queue'),
      wire('server', 'database'),
      wire('queue', 'worker'),
    ],
  }),
  'competing-workers': design({
    users: 3_000,
    stage: 2,
    researched: ['queues', 'background-jobs'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('queue', 'queue', 2, 0),
      at('worker-a', 'worker', 3, -1, [
        set('size', 2, 'Instance size', 'Small. Each Worker is one consumer.'),
        set(
          'prefetch',
          10,
          'Prefetch',
          'Tasks a Worker process takes ahead of time. A higher number waits less on the broker, and a crash loses every task it had taken.',
        ),
      ]),
      at('worker-b', 'worker', 3, 1, [
        set('size', 2, 'Instance size', 'The same size, so the two share the work evenly.'),
        set('prefetch', 10, 'Prefetch', 'Matches its twin.'),
      ]),
      at('database', 'database', 2, 2, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads and writes users wait for.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'queue'),
      wire('server', 'database'),
      wire('queue', 'worker-a'),
      wire('queue', 'worker-b'),
    ],
  }),
  'queue-dlq': design({
    users: 3_000,
    stage: 2,
    researched: ['queues', 'background-jobs'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('queue', 'queue', 2, 0, [
        set(
          'dlq',
          true,
          'Dead-letter queue',
          'A task that keeps failing is set aside after its attempts, so it cannot hold the Workers.',
        ),
        set(
          'attempts',
          3,
          'Max attempts',
          'Three tries cover a passing fault. A task that fails all three is not tried again.',
        ),
      ]),
      at('worker', 'worker', 3, 0, [set('size', 2, 'Instance size', 'Small.')]),
      at('database', 'database', 2, 1, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads and writes users wait for.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'queue'),
      wire('queue', 'worker'),
    ],
  }),
  'queue-bounded': design({
    users: 3_000,
    stage: 2,
    mix: { page: 0.3, read: 0.3, write: 0.1, job: 0.3 },
    researched: ['queues', 'background-jobs'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('queue', 'queue', 2, 0, [
        set(
          'maxLength',
          10_000,
          'Max length',
          'Past this many waiting tasks the Queue refuses new ones, so the backlog and the wait have a ceiling.',
        ),
        set(
          'depth',
          10_000,
          'Tasks waiting',
          'The Queue has already filled to its limit, because the Worker is slower than arrivals, so it refuses new tasks.',
        ),
      ]),
      at('worker', 'worker', 3, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small. If it is slower than arrivals the Queue fills to its limit and then refuses work.',
        ),
      ]),
      at('database', 'database', 2, 1, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads and writes users wait for.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'queue'),
      wire('queue', 'worker'),
    ],
  }),
  'pubsub-stream': design({
    users: 3_000,
    stage: 2,
    researched: ['queues', 'background-jobs', 'event-streaming'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('stream', 'log', 2, 0, [
        set(
          'partitions',
          6,
          'Partitions',
          'A consumer group uses one consumer per partition, so partitions cap how many consumers read at once.',
        ),
        set(
          'keyed',
          true,
          'Partition key',
          "Keyed by entity, so one entity's events stay in order inside a partition.",
        ),
        set(
          'retain',
          10_080,
          'Retention',
          'Events stay for the window after they are read, so a new or slow consumer can still catch up.',
        ),
        set(
          'acks',
          'all',
          'Acknowledgements',
          'A producer waits for every replica before it moves on, the safest and slowest setting.',
        ),
      ]),
      at('worker-a', 'worker', 3, -1, [set('size', 2, 'Instance size', 'Small.')]),
      at('worker-b', 'worker', 3, 1, [set('size', 2, 'Instance size', 'Small.')]),
      at('database', 'database', 2, 1, [
        set('size', 3, 'Instance size', 'Medium. It serves the reads and writes users wait for.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'stream'),
      wire('stream', 'worker-a'),
      wire('stream', 'worker-b'),
    ],
  }),
  'outbox-search': design({
    users: 800,
    stage: 4,
    mix: { page: 0.35, read: 0.3, write: 0.2, login: 0.05, search: 0.1 },
    researched: ['websockets', 'queues', 'full-text-search', 'outbox'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set('size', 3, 'Instance size', 'Medium. It holds the rows and the outbox.'),
      ]),
      at('search', 'search', 2, 1),
      at('psp', 'psp', 3, -3),
      at('llm', 'llm', 3, -1),
      at('ws', 'ws', 3, 1, [
        set(
          'runtime',
          'node',
          'Stack',
          'An event loop holds each open connection for a few KB, where the default Stack holds a worker for each.',
        ),
        set('clustering', true, 'Clustering', 'Without it one box takes every connection.'),
      ]),
      at('storage', 'storage', 3, 3),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'search'),
      wire('server', 'psp'),
      wire('server', 'llm'),
      wire('users', 'ws'),
      wire('server', 'storage'),
    ],
  }),
  'cdc-stream': design({
    users: 800,
    stage: 4,
    mix: { page: 0.35, read: 0.3, write: 0.2, login: 0.05, search: 0.1 },
    researched: ['websockets', 'queues', 'full-text-search', 'event-streaming', 'cdc'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, -1, [
        set(
          'size',
          3,
          'Instance size',
          'Medium. The app writes here once, and the connector reads its log.',
        ),
      ]),
      at('search', 'search', 2, 2),
      at('cdc', 'cdc', 3, -1),
      at('stream', 'log', 4, -1, [
        set(
          'keyed',
          true,
          'Partition key',
          'Keyed by the row, so changes to one row apply in the order they committed.',
        ),
        set(
          'partitions',
          3,
          'Partitions',
          'Three partitions allow up to three consumers. This Design links one Worker, so that Worker sets the read rate.',
        ),
      ]),
      at('worker', 'worker', 5, -1, [
        set(
          'size',
          5,
          'Instance size',
          "Xlarge. Every write becomes a task, so it needs more room than the App Server's share of work.",
        ),
      ]),
      at('psp', 'psp', 3, 1),
      at('llm', 'llm', 3, 3),
      at('ws', 'ws', 4, 1, [
        set(
          'runtime',
          'node',
          'Stack',
          'An event loop holds each open connection for a few KB, where the default Stack holds a worker for each.',
        ),
        set('clustering', true, 'Clustering', 'Without it one box takes every connection.'),
      ]),
      at('storage', 'storage', 4, 3),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'search'),
      wire('database', 'cdc'),
      wire('cdc', 'stream'),
      wire('stream', 'worker'),
      wire('server', 'psp'),
      wire('server', 'llm'),
      wire('users', 'ws'),
      wire('server', 'storage'),
    ],
  }),
} as const satisfies Record<string, Design>
