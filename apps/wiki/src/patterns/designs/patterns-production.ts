import { at, design, set, setLink, wire } from '../design.ts'

/* Patterns: "Ran in production". Each Design is the shape a real system runs, at game scale.
   The note under every caption says what the board does not reproduce: the company's numbers,
   and the parts of its stack the game has no Component for. */

const note = (shape: string): string =>
  `${shape} The caption is Quorum's result, not the company's numbers.`

export const patternsProduction = {
  'so-nine-servers': design({
    users: 4_000,
    stage: 2,
    mix: { page: 0.5, read: 0.35, search: 0.15 },
    researched: ['caching', 'full-text-search', 'multi-az'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'Traffic goes to the copy with the most room, so a slow web server takes less before it is dropped.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the site runs one application on a handful of big web servers and keeps them lightly loaded.',
        ),
        set(
          'replicas',
          9,
          'Copies',
          'Nine copies stand for the nine primary IIS servers that served the network in 2016.',
        ),
      ]),
      at('cache', 'cache', 3, 0, [
        set(
          'engine',
          'memcached',
          'Engine',
          'The site uses Redis, which runs one thread. Memcached is the game engine that scales with cores, so the board does not understate the cache tier.',
        ),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The application fills the cache on a miss and writes straight to the database, the L1/L2 pattern the site uses.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute bounds how stale an answer can be.'),
        set('size', 3, 'Instance size', 'Medium, enough for the hot set in front of the database.'),
      ]),
      at('database', 'database', 4, 0, [
        set(
          'size',
          5,
          'Instance size',
          'Extra large, because the site buys one big SQL Server rather than many small ones.',
        ),
        set(
          'standby',
          true,
          'Standby',
          'A second box in another zone takes over when the primary zone fails, the hot standby the site keeps.',
        ),
        set(
          'backup',
          'nightly',
          'Backups',
          'A nightly snapshot is the cheap floor for a single primary.',
        ),
      ]),
      at('search', 'search', 3, 2, [
        set(
          'searchVariant',
          'elasticsearch',
          'Product',
          'The site runs Elasticsearch beside the database, and the search tier takes the search queries off it.',
        ),
        set('refresh', 1, 'Refresh interval', 'A new post is searchable within a second.'),
        set('size', 2, 'Instance size', 'Small, because search is a small share of the traffic.'),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'cache'),
      wire('cache', 'database'),
      wire('server', 'search'),
    ],
    note: note('The board is the site’s shape at game scale.'),
  }),
  'shopify-tenant-shards': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.3, read: 0.3, write: 0.2, buy: 0.1, job: 0.1 },
    researched: ['sharding', 'caching', 'queues', 'background-jobs'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'The load balancer sends each request to a copy with room, as Sorting Hat sends each shop to its pod.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the monolith does the work for every shop.',
        ),
        set(
          'replicas',
          4,
          'Copies',
          'The stateless app servers are shared across pods, so the board keeps them in one group.',
        ),
      ]),
      at('cache', 'cache', 3, 0, [
        set(
          'engine',
          'memcached',
          'Engine',
          'Memcached scales with cores, which suits a cache shared by many app servers.',
        ),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The app fills the cache on a miss and writes to the database, so the cache holds what shoppers read.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute keeps catalog reads hot without long staleness.'),
        set('size', 3, 'Instance size', 'Medium, sized for the hot catalog and shop rows.'),
      ]),
      at('database', 'database', 4, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Each shard is another MySQL database, and the shops divide across them as they do across pods.',
        ),
        set(
          'shardKey',
          'tenant',
          'Shard key',
          'A tenant key keeps one shop’s rows together, which is the pod boundary. A huge shop can still make its shard the busy one, which is why Shopify gives big merchants their own pod.',
        ),
        set(
          'dbEngine',
          'mysql',
          'Engine',
          'MySQL, the engine Shopify runs, with cheaper writes and online schema changes.',
        ),
        set('size', 3, 'Instance size', 'Medium for each shard, so a hot shard shows.'),
      ]),
      at('queue', 'queue', 3, 2, [
        set(
          'dlq',
          true,
          'Dead-letter queue',
          'A job that keeps failing is parked, not retried forever.',
        ),
        set(
          'maxLength',
          10_000,
          'Max length',
          'A full queue refuses work instead of hiding a growing backlog.',
        ),
      ]),
      at('worker', 'worker', 4, 2, [
        set('size', 2, 'Instance size', 'Small, because a job is one shop’s work at a time.'),
        set('replicas', 3, 'Copies', 'Shared workers drain the queue for every pod.'),
      ]),
      at('pay', 'psp', 2, 2),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'cache'),
      wire('cache', 'database'),
      wire('server', 'queue'),
      wire('queue', 'worker'),
      wire('worker', 'database'),
      wire('server', 'pay'),
    ],
    note: note(
      'The board splits shops across shards as the pods do, but it does not give each pod its own app servers.',
    ),
  }),
  'discord-channel-partitions': design({
    users: 4_000,
    stage: 3,
    mix: { read: 0.4, write: 0.4, rt: 0.2 },
    researched: ['leaderless', 'websockets', 'caching', 'lang-elixir'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'A gateway connection is long-lived, so the load balancer sends it to a hub with room.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the API tier does the routing and the reads.',
        ),
        set(
          'replicas',
          3,
          'Copies',
          'Three copies stand for the API tier in front of the message store.',
        ),
      ]),
      at('wide', 'wide', 3, 0, [
        set('n', 3, 'Replicas per key (N)', 'Three copies of each key, as the store keeps.'),
        set(
          'r',
          2,
          'Replicas a read asks (R)',
          'Two of three replies, the quorum Discord reads with.',
        ),
        set(
          'w',
          2,
          'Replicas a write waits for (W)',
          'Two of three, so a read that asks two overlaps the latest write.',
        ),
        set('size', 3, 'Instance size', 'Medium for each node, so a hot partition shows.'),
      ]),
      at('cache', 'cache', 3, 2, [
        set(
          'engine',
          'redis',
          'Engine',
          'Redis is the store Discord uses for presence and hot state beside the message store.',
        ),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The API fills the cache on a miss, so a popular channel is read from memory.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A short TTL keeps hot channel reads current.'),
        set(
          'size',
          2,
          'Instance size',
          'Small, because it holds hot state and not the message log.',
        ),
      ]),
      at('ws', 'ws', 2, 2, [
        set(
          'runtime',
          'beam',
          'Stack',
          'BEAM holds a lightweight process per connection, which is why Discord’s gateway fits so many on a box.',
        ),
        set(
          'clustering',
          true,
          'Clustering',
          'Several hubs sit behind one pub/sub backbone, so one box does not take every connection.',
        ),
        set(
          'backoff',
          true,
          'Reconnect backoff',
          'Clients reconnect with jitter after a restart, so the gateway is not hit by every client at once.',
        ),
        set(
          'presence',
          true,
          'Presence',
          'The hub tracks who is online, which costs CPU on each join.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server', [
        setLink(
          'kinds',
          ['page', 'read', 'write', 'login'],
          'Kinds carried',
          'Messages and reads go to the API tier.',
        ),
      ]),
      wire('lb', 'ws', [
        setLink(
          'kinds',
          ['rt'],
          'Kinds carried',
          'Realtime events go to a hub, not to an app server.',
        ),
      ]),
      wire('server', 'wide'),
      wire('server', 'cache'),
      wire('cache', 'wide'),
    ],
    note: note(
      'The board is the message store’s shape at game scale. The data services that coalesce hot channels are not on it.',
    ),
  }),
  'netflix-own-cdn': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.3, media: 0.45, read: 0.2, write: 0.05 },
    researched: ['cdn', 'caching', 'object-storage', 'tiered-caching'],
    nodes: [
      at('cdn', 'cdn', 1, 0, [
        set(
          'ttl',
          3_600,
          'TTL (seconds)',
          'An edge copy lives for an hour, as a video object does on an Open Connect appliance.',
        ),
        set(
          'purge',
          true,
          'Purge on deploy',
          'A new release clears the edge, so no viewer gets the old file.',
        ),
        set(
          'cacheKey',
          'query',
          'Cache key',
          'Video is not personalized, so the path and query are enough. The personalized pages stay on the app tier.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the control plane serves the personalized pages.',
        ),
        set(
          'replicas',
          4,
          'Copies',
          'Four copies stand for the stateless app servers behind the edge.',
        ),
      ]),
      at('cache', 'cache', 3, 0, [
        set(
          'engine',
          'memcached',
          'Engine',
          'EVCache runs on memcached, and memcached is the game engine that scales with cores.',
        ),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The app fills the cache on a miss, the read path EVCache serves.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute bounds how stale a personalized answer can be.'),
        set(
          'size',
          4,
          'Instance size',
          'Large, because the cache holds each member’s personalized state.',
        ),
      ]),
      at('database', 'database', 4, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium, because most reads stop at the cache or the edge.',
        ),
      ]),
      at('storage', 'storage', 3, 2, [
        set(
          'storageClass',
          'standard',
          'Storage class',
          'The origin keeps the video objects that the edge has not cached.',
        ),
        set(
          'lifecycle',
          30,
          'Lifecycle (days)',
          'Older titles move to a cheaper class after a month.',
        ),
      ]),
    ],
    links: [
      wire('users', 'cdn'),
      wire('cdn', 'server'),
      wire('server', 'cache'),
      wire('cache', 'database'),
      wire('server', 'storage'),
    ],
    note: note(
      'The board is the request path at game scale. Open Connect’s own appliances and EVCache’s Kafka replication are not on it.',
    ),
  }),
  'github-move-tables': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.35, read: 0.4, write: 0.2, login: 0.05 },
    researched: ['pooling', 'replication', 'sharding'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'The load balancer sends each request to the cluster that owns its data.',
        ),
      ]),
      at('core', 'server', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the core application keeps the busiest tables.',
        ),
        set('replicas', 3, 'Copies', 'Three copies stand for the app tier over the core cluster.'),
      ]),
      at('feature', 'server', 2, 2, [
        set(
          'size',
          3,
          'Instance size',
          'Medium, because the feature domain is smaller than the core.',
        ),
        set('replicas', 2, 'Copies', 'The feature domain scales on its own.'),
      ]),
      at('core-pool', 'pooler', 3, 0, [
        set(
          'mode',
          'transaction',
          'Pooler mode',
          'A connection is lent for one transaction, so many app connections share a few. ProxySQL does this at GitHub.',
        ),
      ]),
      at('feature-pool', 'pooler', 3, 2, [
        set(
          'mode',
          'transaction',
          'Pooler mode',
          'Each cluster gets its own pool, as each domain gets its own cluster.',
        ),
      ]),
      at('core-db', 'database', 4, 0, [
        set('size', 4, 'Instance size', 'Large, because the core tables still take most queries.'),
        set('dbEngine', 'mysql', 'Engine', 'MySQL, the engine GitHub runs.'),
      ]),
      at('feature-db', 'database', 4, 2, [
        set('size', 3, 'Instance size', 'Medium, sized for the feature domain alone.'),
        set('dbEngine', 'mysql', 'Engine', 'MySQL, the engine GitHub runs.'),
      ]),
      at('read-copy', 'replica', 4, 4, [
        set(
          'size',
          4,
          'Instance size',
          'Match the primary, so the copy takes an equal share of reads.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'core', [
        setLink(
          'kinds',
          ['write', 'login'],
          'Kinds carried',
          'Writes and logins go to the cluster that owns the core tables.',
        ),
      ]),
      wire('lb', 'feature', [
        setLink(
          'kinds',
          ['page', 'read'],
          'Kinds carried',
          'Pages and reads go to the feature domain, which the split made independent.',
        ),
      ]),
      wire('core', 'core-pool'),
      wire('core-pool', 'core-db'),
      wire('feature', 'feature-pool'),
      wire('feature-pool', 'feature-db'),
      wire('core', 'read-copy'),
    ],
    note: note(
      'The board is the split at game scale. Vitess and the schema linters that made the split safe are not on it.',
    ),
  }),
  'slack-queue-in-front': design({
    users: 4_000,
    stage: 4,
    mix: { page: 0.3, read: 0.3, write: 0.2, job: 0.2 },
    researched: ['event-streaming', 'queues', 'background-jobs', 'backoff-jitter'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, because the web tier only enqueues the slow work.'),
        set(
          'replicas',
          3,
          'Copies',
          'Three copies stand for the web tier that hands work to Kafka.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 3, 'Instance size', 'Medium, because the workers read and write it too.'),
      ]),
      at('log', 'log', 2, 2, [
        set(
          'partitions',
          12,
          'Partitions',
          'Many partitions let many consumers read at once, as Kafka partitions do at Slack.',
        ),
        set(
          'acks',
          'all',
          'Acks',
          'A producer waits for every replica, so an acknowledged job is not lost.',
        ),
        set('keyed', true, 'Keyed by entity', 'One job keeps its order in one partition.'),
        set(
          'retain',
          3_600,
          'Retention',
          'An hour of retention is enough to replay a failed consumer.',
        ),
      ]),
      at('queue', 'queue', 3, 2, [
        set(
          'dlq',
          true,
          'Dead-letter queue',
          'A job that fails every time is parked, so it cannot block the line.',
        ),
        set(
          'maxLength',
          10_000,
          'Max length',
          'A full queue refuses work instead of hiding a backlog.',
        ),
      ]),
      at('worker', 'worker', 4, 2, [
        set('size', 2, 'Instance size', 'Small, because a job is one message at a time.'),
        set('replicas', 4, 'Copies', 'Several copies drain the queue faster than one box could.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'log'),
      wire('log', 'queue'),
      wire('queue', 'worker'),
      wire('worker', 'database'),
    ],
    note: note(
      'The board is the two-hop queue at game scale. JQRelay and the 50 Redis clusters are not on it.',
    ),
  }),
  'meta-cache-graph': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.15, read: 0.55, write: 0.3 },
    researched: ['caching', 'cache-strategies', 'sharding'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, because the app tier answers the graph reads.'),
        set('replicas', 3, 'Copies', 'Three copies stand for the app tier over the graph.'),
      ]),
      at('cache', 'cache', 2, 0, [
        set('engine', 'memcached', 'Engine', 'Memcached, the cache TAO puts in front of MySQL.'),
        set(
          'cacheStrategy',
          'write-through',
          'Cache strategy',
          'A write goes through the cache and on to the database, so the cache never holds an old object. TAO is a write-through cache over MySQL.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute bounds staleness for an object nobody writes.'),
        set(
          'size',
          5,
          'Instance size',
          'Extra large, because the hot graph is the point of the cache.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'shards',
          8,
          'Shards',
          'TAO splits the graph into many shards. Eight is the widest the board offers, and it stands for hundreds of thousands.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash spreads objects and associations evenly, so no shard owns the hot end of the graph.',
        ),
        set(
          'size',
          4,
          'Instance size',
          'Large for each shard, because each shard is a real MySQL database.',
        ),
        set('dbEngine', 'mysql', 'Engine', 'MySQL, the engine TAO keeps the graph in.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')],
    note: note(
      'The board is the read path at game scale. TAO’s per-shard primary regions are not on it.',
    ),
  }),
  'notion-block-shards': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.35, read: 0.35, write: 0.3 },
    researched: ['sharding', 'cdc', 'event-streaming'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, because the app serves blocks from many shards.'),
        set('replicas', 3, 'Copies', 'Three copies stand for the app tier over the shards.'),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Notion splits its block table across logical shards. Four is the board’s widest, and it stands for 480.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash spreads blocks and pages, so no shard takes one workspace’s whole document tree.',
        ),
        set('size', 3, 'Instance size', 'Medium for each shard, so a busy shard shows.'),
      ]),
      at('cdc', 'cdc', 3, 0),
      at('log', 'log', 3, 2, [
        set(
          'partitions',
          12,
          'Partitions',
          'Many partitions let the indexer read every shard’s changes at once.',
        ),
        set('acks', 'all', 'Acks', 'A change is not acknowledged until every replica has it.'),
        set('keyed', true, 'Keyed by entity', 'One block’s changes stay in order.'),
        set(
          'retain',
          3_600,
          'Retention',
          'An hour of retention lets a failed indexer replay its work.',
        ),
      ]),
      at('worker', 'worker', 4, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small, because the indexer reads changes and writes them on.',
        ),
        set('replicas', 2, 'Copies', 'Two copies keep up with the change rate.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('database', 'cdc'),
      wire('cdc', 'log'),
      wire('log', 'worker'),
    ],
    note: note(
      'The board is the shard and CDC path at game scale. The 480 logical shards and Hudi are not on it.',
    ),
  }),
  'figma-shard-router': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.35, read: 0.4, write: 0.25 },
    researched: ['sharding', 'pooling', 'caching', 'replication'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the app builds the queries the router sends on.',
        ),
        set(
          'replicas',
          3,
          'Copies',
          'Three copies stand for the app tier over the sharded database.',
        ),
      ]),
      at('cache', 'cache', 2, 0, [
        set('engine', 'redis', 'Engine', 'Redis, the cache in front of the shards.'),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The app fills the cache on a miss, so repeated file reads do not cross every shard.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute keeps a file’s hot rows current.'),
        set('size', 3, 'Instance size', 'Medium, sized for the hot files.'),
      ]),
      at('pooler', 'pooler', 2, 2, [
        set(
          'mode',
          'transaction',
          'Pooler mode',
          'A connection is lent for one transaction. The game’s pooler stands for DBProxy, which routes each query to a shard.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Figma shards its Postgres tables horizontally. Four is the board’s widest, and it stands for the shards it grew to.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash spreads files and teams, so no shard owns one big organization.',
        ),
        set('size', 3, 'Instance size', 'Medium for each shard, so a hot shard shows.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'cache', [
        setLink('kinds', ['page', 'read'], 'Kinds carried', 'Reads try the cache first.'),
      ]),
      wire('cache', 'database'),
      wire('server', 'pooler', [
        setLink('kinds', ['write'], 'Kinds carried', 'Writes go through the router.'),
      ]),
      wire('pooler', 'database'),
    ],
    note: note(
      'The board is the sharded path at game scale. DBProxy’s query engine and scatter-gather are not on it.',
    ),
  }),
  'cloudflare-edge-rule': design({
    users: 4_000,
    stage: 4,
    mix: { page: 0.5, read: 0.3, bot: 0.2 },
    researched: ['waf', 'cdn', 'load-balancing', 'lang-node'],
    nodes: [
      at('dns', 'dns', 1, 0),
      at('waf', 'waf', 2, 0, [
        set(
          'paranoia',
          2,
          'Paranoia level',
          'A middle level blocks most bots and few real visitors. The 2019 rule that failed was a managed rule at this layer.',
        ),
      ]),
      at('cdn', 'cdn', 3, 0, [
        set(
          'ttl',
          60,
          'TTL (seconds)',
          'A minute keeps a page current while the edge absorbs repeat reads.',
        ),
        set(
          'purge',
          true,
          'Purge on deploy',
          'A deploy clears the edge, so no visitor gets the old release.',
        ),
      ]),
      at('edge', 'edge', 3, 2, [
        set(
          'runtime',
          'node',
          'Stack',
          'The edge runs JavaScript or TypeScript, and Rust or Go built to WebAssembly. Workers run in the same family of runtimes.',
        ),
      ]),
      at('server', 'server', 4, 0, [
        set('size', 3, 'Instance size', 'Medium, because the edge takes the cheap requests first.'),
      ]),
      at('database', 'database', 4, 2, [
        set('size', 3, 'Instance size', 'Medium, behind both the edge and the app tier.'),
      ]),
    ],
    links: [
      wire('users', 'dns'),
      wire('dns', 'waf'),
      wire('waf', 'cdn'),
      wire('cdn', 'edge', [
        setLink('kinds', ['page', 'read'], 'Kinds carried', 'Pages and reads run at the edge.'),
      ]),
      wire('cdn', 'server', [
        setLink(
          'kinds',
          ['write', 'login', 'bot'],
          'Kinds carried',
          'Writes and logins need the app tier.',
        ),
      ]),
      wire('edge', 'database'),
      wire('server', 'database'),
    ],
    incident: { kind: 'regex', node: 'waf' },
    note: note(
      'The board runs the 2019 edge shape with the game’s regex incident on the WAF, not the 27-minute outage.',
    ),
  }),
  'pinterest-id-shards': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.3, read: 0.4, write: 0.3 },
    researched: ['sharding', 'caching'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the API tier decodes the ID and asks the cache.',
        ),
        set('replicas', 3, 'Copies', 'Three copies stand for the API tier over the shard fleet.'),
      ]),
      at('cache', 'cache', 2, 0, [
        set(
          'engine',
          'memcached',
          'Engine',
          'Memcached holds the objects; the mappings live in Redis. The board keeps one cache for both.',
        ),
        set(
          'cacheStrategy',
          'aside',
          'Cache strategy',
          'The app fills the cache on a miss, so a popular Pin is read from memory.',
        ),
        set('ttl', 60, 'TTL (seconds)', 'A minute bounds how stale a Pin can be.'),
        set('size', 3, 'Instance size', 'Medium, sized for the hot Pins and boards.'),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'shards',
          8,
          'Shards',
          'Pinterest ran 4,096 virtual shards. Eight is the board’s widest, and it stands for the fleet.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'The shard number lives in the top 16 bits of the 64-bit ID. A hash is the closest key the game has.',
        ),
        set('dbEngine', 'mysql', 'Engine', 'MySQL, the engine of every shard.'),
        set('size', 3, 'Instance size', 'Medium for each shard, so a busy shard shows.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')],
    note: note(
      'The board is the ID-sharded fleet at game scale. The 4,096 shards and the config table are not on it.',
    ),
  }),
  'uber-domain-gateway': design({
    users: 4_000,
    stage: 3,
    mix: { page: 0.35, read: 0.35, write: 0.2, login: 0.1 },
    researched: ['load-balancing', 'api-gateway', 'containers', 'service-mesh'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'The load balancer spreads traffic across the gateways.',
        ),
      ]),
      at('gw', 'gw', 2, 0, [
        set(
          'authEdge',
          true,
          'Auth at the gateway',
          'The gateway validates the token once, so every service behind it skips that work.',
        ),
        set(
          'rateLimit',
          0,
          'Rate limit',
          'No flat cap. The gateway is the domain entry, not a throttle.',
        ),
      ]),
      at('server', 'server', 3, 0, [
        set('size', 4, 'Instance size', 'Large, because the domain’s services do the work.'),
        set('replicas', 3, 'Copies', 'Three copies stand for the services in one domain.'),
      ]),
      at('database', 'database', 4, 0, [
        set('size', 4, 'Instance size', 'Large, because the domain owns its data.'),
      ]),
      at('cluster', 'cluster', 3, 2),
      at('mesh', 'mesh', 3, 3),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'gw'),
      wire('gw', 'server'),
      wire('server', 'database'),
      wire('server', 'cluster'),
      wire('server', 'mesh'),
    ],
    note: note(
      'The board is one domain at game scale. The 2,200 services and the layer rules are not on it.',
    ),
  }),
  'dropbox-block-index': design({
    users: 3_000,
    stage: 3,
    mix: { page: 0.2, read: 0.3, write: 0.2, upload: 0.2, media: 0.1 },
    researched: ['object-storage', 'sharding', 'caching'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the app hashes each block and looks up the index.',
        ),
        set('replicas', 3, 'Copies', 'Three copies stand for the API tier.'),
      ]),
      at('storage', 'storage', 2, 0, [
        set(
          'storageClass',
          'standard',
          'Storage class',
          'The block store keeps the immutable blocks.',
        ),
        set(
          'lifecycle',
          30,
          'Lifecycle (days)',
          'Older blocks move to a cheaper class after a month.',
        ),
      ]),
      at('database', 'database', 2, 2, [
        set(
          'shards',
          4,
          'Shards',
          'The Block Index is a sharded MySQL cluster. Four is the board’s widest, and it stands for the fleet.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A block is keyed by its SHA-256 hash, which spreads blocks evenly.',
        ),
        set('dbEngine', 'mysql', 'Engine', 'MySQL, the engine of the Block Index.'),
        set('size', 3, 'Instance size', 'Medium for each index shard, so a busy shard shows.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'storage'), wire('server', 'database')],
    note: note(
      'The board is the block-and-index split at game scale. Magic Pocket’s erasure coding and three zones are not on it.',
    ),
  }),
  'stripe-online-shards': design({
    users: 3_000,
    stage: 3,
    mix: { page: 0.3, read: 0.35, write: 0.35 },
    researched: ['sharding', 'cdc', 'event-streaming', 'background-jobs'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the app keeps writing while a shard moves.',
        ),
        set('replicas', 3, 'Copies', 'Three copies stand for the API tier.'),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'shards',
          4,
          'Shards',
          'DocDB splits its data across shards. Four is the board’s widest, and it stands for the fleet.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash spreads objects across shards, so no shard owns one big customer.',
        ),
        set('size', 3, 'Instance size', 'Medium for each shard, so a busy shard shows.'),
      ]),
      at('cdc', 'cdc', 3, 0),
      at('log', 'log', 3, 2, [
        set(
          'partitions',
          12,
          'Partitions',
          'Many partitions let the mover read each shard’s changes in order.',
        ),
        set('acks', 'all', 'Acks', 'A change is not acknowledged until every replica has it.'),
        set('keyed', true, 'Keyed by entity', 'One object’s changes stay in order.'),
        set('retain', 3_600, 'Retention', 'An hour of retention lets a mover replay its work.'),
      ]),
      at('worker', 'worker', 4, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small, because the mover reads changes and replays them on the target.',
        ),
        set('replicas', 2, 'Copies', 'Two copies keep up with the change rate.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('database', 'cdc'),
      wire('cdc', 'log'),
      wire('log', 'worker'),
    ],
    note: note(
      'The board is the sharded store and change stream at game scale. DocDB’s chunk copy and dual-write cutover are not on it.',
    ),
  }),
  'roblox-control-plane': design({
    users: 20_000,
    stage: 5,
    mix: { page: 0.4, read: 0.35, write: 0.15, login: 0.1 },
    researched: ['load-balancing', 'containers', 'service-mesh', 'gitops'],
    nodes: [
      at('lb', 'lb', 1, 0, [
        set(
          'policy',
          'least-conn',
          'Policy',
          'The load balancer spreads traffic across the app tier.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 4, 'Instance size', 'Large, because the app tier carries the game traffic.'),
        set(
          'replicas',
          1,
          'Copies',
          'One copy stands for the fleet, because the control plane is shared by every copy.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 4, 'Instance size', 'Large, because the game state lives here.'),
      ]),
      at('cluster', 'cluster', 2, 2),
      at('mesh', 'mesh', 2, 3),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'database'),
      wire('server', 'cluster'),
      wire('server', 'mesh'),
    ],
    incident: { kind: 'config', node: 'server' },
    note: 'The board runs the game’s Bad config push incident on the app tier. Consul and the 73-hour recovery are not on it. The caption is the game’s result, not Roblox’s outage.',
  }),
  's3-index-region': design({
    users: 3_000,
    stage: 5,
    mix: { page: 0.35, read: 0.3, write: 0.2, upload: 0.15 },
    researched: ['object-storage', 'multi-region', 'multi-az'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('server', 'server', 2, 0, [
        set('size', 4, 'Instance size', 'Large, because the app tier serves the object requests.'),
        set('replicas', 3, 'Copies', 'Three copies stand for the S3 front end.'),
      ]),
      at('storage', 'storage', 3, 0, [
        set('storageClass', 'standard', 'Storage class', 'The object store holds the bytes.'),
        set(
          'lifecycle',
          30,
          'Lifecycle (days)',
          'Older objects move to a cheaper class after a month.',
        ),
      ]),
      at('database', 'database', 3, 2, [
        set(
          'size',
          4,
          'Instance size',
          'Large, because the index holds the metadata for every object.',
        ),
        set(
          'backup',
          'nightly',
          'Backups',
          'A nightly snapshot is the only copy outside the index.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'storage'),
      wire('server', 'database'),
    ],
    incident: { kind: 'disk-full', node: 'database' },
    note: 'The board runs the game’s Disk full incident on the index Database, which stands for the index losing its servers. The caption is the game’s result, not AWS’s outage.',
  }),
}
