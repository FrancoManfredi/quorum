import { at, design, set, setLink, wire } from '../design.ts'
import type { Design } from '../design.ts'

/* Patterns in "Scaling reads and compute". */

const appSize = set(
  'size',
  2,
  'Instance size',
  'Small gives the app two vCPUs, enough to run code while the data tier does its own work.',
)

const dbSize = set(
  'size',
  2,
  'Instance size',
  'Small gives the Database two vCPUs, so the figures below reflect the Cache and not a starved Database.',
)

const bigApp = set(
  'size',
  3,
  'Instance size',
  'Medium gives the app four vCPUs, so the app tier is not the limit and the Database is what the guards change.',
)

/** Managed Components that answer the kinds a later Era adds, so those requests have somewhere to go. */
const extras = (column: number, ...types: ReadonlyArray<'psp' | 'llm' | 'msgp'>) =>
  types.map((type, index) => at(type, type, column + index, 2))

/** The three Nodes every cache page shares: App Server, Cache, Database in a row. */
const cacheRow = (
  cacheSettings: ReturnType<typeof set>[],
  app: ReturnType<typeof set> = appSize,
) => [
  at('server', 'server', 1, 0, [app]),
  at('cache', 'cache', 2, 0, cacheSettings),
  at('database', 'database', 3, 0, [dbSize]),
]

const cacheLinks = [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')]

const cacheSize = set(
  'size',
  2,
  'Instance size',
  'Memory decides how much of the hot set fits. A Cache too small for it misses even on popular rows.',
)

const cacheAside = design({
  users: 1_500,
  stage: 1,
  researched: [],
  nodes: cacheRow([
    set(
      'cacheStrategy',
      'aside',
      'Cache strategy',
      'The app fills the Cache on a miss and writes straight to the Database, so the Cache holds only what someone has read.',
    ),
    set(
      'ttl',
      60,
      'TTL (seconds)',
      'An entry lives for a minute, which keeps most hot reads as hits and bounds how stale an answer can get.',
    ),
    cacheSize,
  ]),
  links: cacheLinks,
})

const writeThrough = design({
  users: 1_500,
  stage: 1,
  researched: ['cache-strategies'],
  nodes: cacheRow([
    set(
      'cacheStrategy',
      'write-through',
      'Cache strategy',
      'Each write goes into the Cache and on to the Database before it returns, so the Cache never holds an old value.',
    ),
    set(
      'ttl',
      60,
      'TTL (seconds)',
      'The TTL only bounds how long a rarely written key stays in memory, since writes keep the entry fresh.',
    ),
    cacheSize,
  ]),
  links: cacheLinks,
})

const writeBehind = design({
  users: 1_500,
  stage: 1,
  researched: ['cache-strategies'],
  nodes: cacheRow([
    set(
      'cacheStrategy',
      'write-behind',
      'Cache strategy',
      'The Cache answers a write at once and flushes to the Database later, in batches, so the Database sees fewer writes. A Cache crash loses what it has not flushed.',
    ),
    set(
      'ttl',
      60,
      'TTL (seconds)',
      'Reads still expire on this clock, but a write lands in the Cache first, so a key stays current while it is written often.',
    ),
    cacheSize,
  ]),
  links: cacheLinks,
})

const stampedeBare = design({
  users: 4_000,
  stage: 2,
  researched: [],
  nodes: cacheRow(
    [
      set(
        'ttl',
        10,
        'TTL (seconds)',
        'The shortest TTL keeps data fresh but expires hot keys often, and every expiry sends readers to the Database together.',
      ),
      cacheSize,
    ],
    bigApp,
  ),
  links: cacheLinks,
})

const stampedeGuarded = design({
  users: 4_000,
  stage: 2,
  researched: ['stampede-protection'],
  nodes: cacheRow(
    [
      set(
        'ttl',
        10,
        'TTL (seconds)',
        'The same short TTL as before, so the difference below comes from the guards and not from a longer lifetime.',
      ),
      set(
        'coalesce',
        true,
        'Coalesce misses',
        'Readers that miss the same key wait on one fetch instead of each querying the Database. It matters most when the Cache is cold.',
      ),
      set(
        'earlyExpiry',
        true,
        'Early expiration',
        'A reader refreshes a key a little before it expires, at random, so keys leave the Cache one at a time and not all at once.',
      ),
      cacheSize,
    ],
    bigApp,
  ),
  links: cacheLinks,
})

const warmedAndTiered = design({
  users: 2_000,
  stage: 3,
  mix: { page: 0.4, media: 0.25, read: 0.25, write: 0.05, login: 0.05 },
  researched: ['stampede-protection', 'cache-warming', 'tiered-caching'],
  nodes: [
    at('cdn', 'cdn', 1, 0),
    at('server', 'server', 2, 0, [appSize]),
    at('cache', 'cache', 3, 0, [
      set(
        'warming',
        true,
        'Warming',
        'After a restart the Cache refills from the Database before it takes traffic, so a restart does not send every read through at once.',
      ),
      set(
        'coalesce',
        true,
        'Coalesce misses',
        'Warming needs Stampede protection first, and coalescing covers the misses that arrive while the Cache is still filling.',
      ),
      cacheSize,
    ]),
    at('database', 'database', 4, 0, [dbSize]),
    ...extras(2, 'psp'),
  ],
  links: [
    wire('users', 'cdn'),
    wire('cdn', 'server'),
    wire('server', 'cache'),
    wire('cache', 'database'),
    wire('server', 'psp'),
  ],
})

const cdnPull = design({
  users: 3_000,
  stage: 2,
  researched: [],
  nodes: [
    at('cdn', 'cdn', 1, 0, [
      set(
        'ttl',
        3_600,
        'TTL (seconds)',
        'An edge copy is reused for an hour before it asks the origin again, which raises the hit ratio and ages pages longer.',
      ),
      set(
        'purge',
        true,
        'Purge on deploy',
        'A deploy clears the edge, so no visitor gets the old release. The edge then refills from the origin.',
      ),
      set(
        'cacheKey',
        'query',
        'Cache key',
        'The key holds the path and query string but not cookies, so more visitors share one copy. It is safe only while no cached page is personal.',
      ),
    ]),
    at('server', 'server', 2, 0, [appSize]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [wire('users', 'cdn'), wire('cdn', 'server'), wire('server', 'database')],
})

const scaleUp = design({
  users: 3_000,
  stage: 1,
  researched: [],
  nodes: [
    at('server', 'server', 1, 0, [
      set(
        'size',
        3,
        'Instance size',
        'One Medium box has four vCPUs. It needs no Load Balancer, but it is a single point of failure and has a ceiling.',
      ),
    ]),
    at('database', 'database', 2, 0, [dbSize]),
  ],
  links: [wire('users', 'server'), wire('server', 'database')],
})

const scaleOut = design({
  users: 3_000,
  stage: 1,
  researched: [],
  nodes: [
    at('lb', 'lb', 1, 0),
    at('server-a', 'server', 2, -1, [
      set(
        'size',
        2,
        'Instance size',
        'Two Small boxes hold the same four vCPUs as one Medium, so the comparison is fair.',
      ),
    ]),
    at('server-b', 'server', 2, 1, [
      set('size', 2, 'Instance size', 'The second copy. If one dies, the other keeps serving.'),
    ]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [
    wire('users', 'lb'),
    wire('lb', 'server-a'),
    wire('lb', 'server-b'),
    wire('server-a', 'database'),
    wire('server-b', 'database'),
  ],
})

const autoscaled = design({
  users: 3_000,
  stage: 2,
  researched: ['scheduled-scaling'],
  nodes: [
    at('lb', 'lb', 1, 0, [
      set(
        'slowStart',
        true,
        'Slow start',
        'A new copy takes traffic gradually, so a copy that boots in the middle of a spike never meets it cold.',
      ),
    ]),
    at('server', 'server', 2, 0, [
      appSize,
      set(
        'replicas',
        3,
        'Copies serving now',
        'The Autoscaler chooses this number as load moves. It is fixed here only to show a point in time.',
      ),
    ]),
    at('scaler', 'autoscaler', 2, 2, [
      set(
        'signal',
        'cpu',
        'Signal',
        'The Autoscaler reads CPU load. Load covers slots and memory too, requests per copy suits uneven requests, and queue depth suits Workers.',
      ),
      set(
        'target',
        0.6,
        'Target',
        'It adds copies when load passes this share and removes them when load falls well below it. A lower target keeps more headroom.',
      ),
      set(
        'minCopies',
        2,
        'Min copies',
        'The floor keeps two copies running at night, so one failure never leaves the tier empty.',
      ),
      set(
        'maxCopies',
        8,
        'Max copies',
        'The ceiling caps the bill when a bot flood or a bug drives the signal up.',
      ),
      set(
        'schedule',
        true,
        'Schedule',
        'It adds copies ahead of the known daily peak, so they are warm when the peak arrives and not still booting.',
      ),
    ]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [
    wire('users', 'lb'),
    wire('lb', 'server'),
    wire('server', 'scaler'),
    wire('server', 'database'),
  ],
})

const pooled = design({
  users: 3_000,
  stage: 1,
  researched: [],
  nodes: [
    at('server', 'server', 1, 0, [appSize]),
    at('pooler', 'pooler', 2, 0, [
      set(
        'mode',
        'transaction',
        'Pooler mode',
        'A server connection is lent for one transaction and then returned, so many app connections share a few. Code that keeps session state breaks, until it is fixed.',
      ),
    ]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [wire('users', 'server'), wire('server', 'pooler'), wire('pooler', 'database')],
})

const balanced = design({
  users: 4_000,
  stage: 1,
  researched: ['lb-algorithms'],
  nodes: [
    at('lb', 'lb', 1, 0, [
      set(
        'policy',
        'least-conn',
        'Policy',
        'New requests go to the copy with the most spare room right now, so a big box takes more than a small one and a slow one takes less.',
      ),
    ]),
    at('big', 'server', 2, -1, [
      set('size', 3, 'Instance size', 'A Medium copy, twice the vCPUs of its neighbour.'),
    ]),
    at('small', 'server', 2, 1, [
      set(
        'size',
        2,
        'Instance size',
        'A Small copy. Round robin would hand it as much as the Medium.',
      ),
    ]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [
    wire('users', 'lb'),
    wire('lb', 'big'),
    wire('lb', 'small'),
    wire('big', 'database'),
    wire('small', 'database'),
  ],
})

const layer7 = design({
  users: 4_000,
  stage: 1,
  researched: [],
  nodes: [
    at('lb', 'lb', 1, 0, [
      set(
        'variant',
        'l7',
        'Variant',
        'An L7 balancer reads the HTTP request, so it can send a kind of request to the servers built for it.',
      ),
    ]),
    at('pages', 'server', 2, -1, [appSize]),
    at('api', 'server', 2, 1, [appSize]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [
    wire('users', 'lb'),
    wire('lb', 'pages', [
      setLink(
        'kinds',
        ['page'],
        'Kinds on this Link',
        'Only page views go to this server, so its CPU and memory serve one workload.',
      ),
    ]),
    wire('lb', 'api', [
      setLink(
        'kinds',
        ['read', 'write', 'login'],
        'Kinds on this Link',
        'API calls go here, so a burst of page views cannot starve them.',
      ),
    ]),
    wire('pages', 'database'),
    wire('api', 'database'),
  ],
})

const layer4 = design({
  users: 4_000,
  stage: 1,
  researched: ['lb-algorithms', 'l4-lb'],
  nodes: [
    at('lb', 'lb', 1, 0, [
      set(
        'variant',
        'l4',
        'Variant',
        'An L4 balancer forwards TCP without reading HTTP, so it handles far more traffic for less money. It cannot route by kind or retry.',
      ),
    ]),
    at('server-a', 'server', 2, -1, [appSize]),
    at('server-b', 'server', 2, 1, [appSize]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [
    wire('users', 'lb'),
    wire('lb', 'server-a'),
    wire('lb', 'server-b'),
    wire('server-a', 'database'),
    wire('server-b', 'database'),
  ],
})

const feedExtras = extras(1, 'psp', 'llm', 'msgp')

const feedLinks = [
  wire('users', 'server'),
  wire('server', 'cache'),
  wire('cache', 'database'),
  wire('server', 'psp'),
  wire('server', 'llm'),
  wire('server', 'msgp'),
]

const fanoutPull = design({
  users: 400,
  stage: 5,
  mix: { page: 0.3, feed: 0.35, read: 0.1, write: 0.15, login: 0.1 },
  researched: [],
  nodes: [
    at('server', 'server', 1, 0, [
      set(
        'fanout',
        'pull',
        'Fan-out',
        'A feed request reads the latest posts of each account the user follows, so one read becomes many queries.',
      ),
      appSize,
    ]),
    at('cache', 'cache', 2, 0, [cacheSize]),
    at('database', 'database', 3, 0, [dbSize]),
    ...feedExtras,
  ],
  links: feedLinks,
})

const fanoutPush = design({
  users: 400,
  stage: 5,
  mix: { page: 0.3, feed: 0.35, read: 0.1, write: 0.15, login: 0.1 },
  researched: ['hybrid-fanout'],
  nodes: [
    at('server', 'server', 1, 0, [
      set(
        'fanout',
        'push',
        'Fan-out',
        "Each post is written into followers' timelines, so a feed request reads one list. Writes cost more instead. With Hybrid fan-out researched, posts from the most followed accounts are pulled at read time and not pushed.",
      ),
      appSize,
    ]),
    at('cache', 'cache', 2, 0, [
      set(
        'split',
        true,
        'Split hot keys',
        "A famous account's timeline is spread over several shards, so no one shard takes every read of it.",
      ),
      cacheSize,
    ]),
    at('database', 'database', 3, 0, [dbSize]),
    ...feedExtras,
  ],
  links: feedLinks,
})

const materialized = design({
  users: 600,
  stage: 4,
  mix: { page: 0.4, read: 0.3, write: 0.1, login: 0.05, report: 0.15 },
  researched: ['precompute', 'denormalization'],
  nodes: [
    at('server', 'server', 1, 0, [appSize]),
    at('database', 'database', 2, 0, [
      set(
        'materialized',
        true,
        'Materialized view',
        'A report reads a stored result instead of scanning the tables, for about half the CPU. Its figures are as old as the last refresh.',
      ),
      set('size', 2, 'Instance size', 'Small gives the Database two vCPUs.'),
    ]),
    ...extras(1, 'psp', 'llm'),
  ],
  links: [
    wire('users', 'server'),
    wire('server', 'database'),
    wire('server', 'psp'),
    wire('server', 'llm'),
  ],
})

const precomputed = design({
  users: 3_000,
  stage: 2,
  researched: ['lang-node', 'fw-nextjs'],
  nodes: [
    at('cdn', 'cdn', 1, 0),
    at('server', 'server', 2, 0, [
      set(
        'runtime',
        'node',
        'Runtime',
        'Next.js runs on Node, so the App Server needs that runtime before it can take the framework.',
      ),
      set(
        'framework',
        'nextjs',
        'Framework',
        'Incremental static regeneration renders a share of pages ahead of time as static files, which the CDN can then keep.',
      ),
      appSize,
    ]),
    at('database', 'database', 3, 0, [dbSize]),
  ],
  links: [wire('users', 'cdn'), wire('cdn', 'server'), wire('server', 'database')],
})

const readReplica = design({
  users: 3_000,
  stage: 2,
  researched: ['ryw-routing'],
  nodes: [
    at('server', 'server', 1, 0, [
      appSize,
      set(
        'ryw',
        true,
        'Read-your-writes routing',
        "Reads that follow a user's own write go to the primary, so a user who saves and reloads rarely sees the old copy.",
      ),
    ]),
    at('database', 'database', 2, -1, [dbSize]),
    at('replica', 'replica', 2, 1, [
      set(
        'sync',
        false,
        'Synchronous replication',
        'Off means the replica applies changes after the primary commits, so writes stay fast and a read can be a moment stale.',
      ),
      set(
        'size',
        2,
        'Instance size',
        'Match the primary so each copy takes an equal share of the reads.',
      ),
    ]),
  ],
  links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'replica')],
})

export const patternsScale = {
  'read-replica': readReplica,
  'cache-aside': cacheAside,
  'cache-write-through': writeThrough,
  'cache-write-behind': writeBehind,
  'stampede-bare': stampedeBare,
  'stampede-guarded': stampedeGuarded,
  'cache-warmed-tiered': warmedAndTiered,
  'cdn-pull': cdnPull,
  'scale-up': scaleUp,
  'scale-out': scaleOut,
  autoscaled,
  pooled,
  'lb-least-conn': balanced,
  'lb-layer-7': layer7,
  'lb-layer-4': layer4,
  'fanout-pull': fanoutPull,
  'fanout-push': fanoutPush,
  'materialized-report': materialized,
  precomputed,
} as const satisfies Record<string, Design>
