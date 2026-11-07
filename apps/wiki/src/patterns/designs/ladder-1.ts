import { at, design, set, setLink, wire } from '../design.ts'
import type { Design } from '../design.ts'

/* Ladder tier 1: one box. */

/** A failed host. Its table row reads "Down", and the Simulation sees a stopped Node. */
const DOWN = Object.defineProperty(
  { _tag: 'Stopped', cause: 'failure', warm: 1 } as const,
  'toString',
  { value: () => 'Down' },
)

/** The same Design, this many sim seconds after a host went down at second zero. */
const secondsAfter = (seconds: number, base: Design): Design => ({
  ...base,
  game: { ...base.game, time: seconds },
})

export const ladder1 = {
  'one-box': design({
    users: 200,
    stage: 0,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'localDb',
          true,
          'Local database',
          'The app keeps its data on its own disk, so there is no second Node to run or pay for.',
        ),
        set(
          'size',
          1,
          'Instance size',
          'Micro is the starter box. It is enough for a few hundred Users.',
        ),
      ]),
    ],
    links: [wire('users', 'server')],
  }),
  'split-storage': design({
    users: 600,
    stage: 1,
    researched: ['timeouts'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small gives the app two vCPUs. The Database now takes its own work, so the app only runs code.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Match the App Server at first. Grow it alone when its load bar climbs first.',
        ),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database', [
        setLink(
          'timeout',
          5,
          'Timeout',
          'A call to the Database should answer in milliseconds. Five seconds frees a stuck caller long before the default wait.',
        ),
      ]),
    ],
  }),
  'files-in-database': design({
    users: 15_000,
    stage: 2,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'The App Server keeps nothing on its own disk, so any copy of it could answer. Large leaves room for this traffic.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          4,
          'Instance size',
          'The Database holds the rows and, with no other place to put them, the uploaded files too.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'files-in-storage': design({
    users: 15_000,
    stage: 2,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Unchanged from the Design before, so the only difference is where the files go.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 4, 'Instance size', 'Unchanged, and it now stores rows only.'),
      ]),
      at('storage', 'storage', 2, 2, [
        set(
          'storeVariant',
          's3',
          'Product',
          'S3 needs no extra research. Uploads and downloads go here instead of into Database rows.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'storage')],
  }),
  'small-box-full': design({
    users: 3000,
    stage: 1,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          1,
          'Instance size',
          'Micro is the starter size. Its CPU is the first thing to fill as Users arrive.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'The Database has room to spare, so the App Server is the only limit.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'bigger-box': design({
    users: 3000,
    stage: 1,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'One step up gives the App Server twice the vCPUs for a small rise in Burn. Resizing restarts the Node, so do it before the peak.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 2, 'Instance size', 'Unchanged, so the App Server is the only difference.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'one-server-saturated': design({
    users: 6000,
    stage: 1,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small was enough a rung ago. At this many Users its CPU is over full.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium keeps the Database out of the way while the App Server is the problem.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'two-servers-balanced': design({
    users: 6000,
    stage: 1,
    researched: [],
    nodes: [
      at('lb', 'lb', 1, 1, [
        set(
          'policy',
          'weighted',
          'Algorithm',
          'Both servers are the same size, so splitting by capacity is an even split. Pick least connections when sizes or runtimes differ.',
        ),
      ]),
      at('server-a', 'server', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'The same small box as before, now taking half the traffic.',
        ),
      ]),
      at('server-b', 'server', 2, 2, [
        set(
          'size',
          2,
          'Instance size',
          'A twin of the first server, so either can answer any request.',
        ),
      ]),
      at('database', 'database', 3, 1, [
        set('size', 3, 'Instance size', 'Unchanged. Both servers share this one Database.'),
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
  'slow-health-checks': secondsAfter(
    10,
    design({
      users: 3000,
      stage: 1,
      researched: ['health-checks'],
      nodes: [
        at('lb', 'lb', 1, 2, [
          set(
            'checkEvery',
            30,
            'Health check interval (s)',
            'The Load Balancer looks at each server this rarely, so a host that died moments ago still gets its share.',
          ),
        ]),
        at('server-a', 'server', 2, 0, [set('size', 2, 'Instance size', 'Three equal servers.')]),
        at('server-b', 'server', 2, 2, [
          set('size', 2, 'Instance size', 'Three equal servers.'),
          set(
            'life',
            DOWN,
            'State',
            'This host died ten seconds before the picture. The Design shows what the Load Balancer does in those seconds.',
          ),
        ]),
        at('server-c', 'server', 2, 4, [set('size', 2, 'Instance size', 'Three equal servers.')]),
        at('database', 'database', 3, 2, [
          set('size', 3, 'Instance size', 'Medium, shared by all three.'),
        ]),
      ],
      links: [
        wire('users', 'lb'),
        wire('lb', 'server-a'),
        wire('lb', 'server-b'),
        wire('lb', 'server-c'),
        wire('server-a', 'database'),
        wire('server-b', 'database'),
        wire('server-c', 'database'),
      ],
    }),
  ),
  'fast-health-checks': secondsAfter(
    10,
    design({
      users: 3000,
      stage: 1,
      researched: ['health-checks'],
      nodes: [
        at('lb', 'lb', 1, 2, [
          set(
            'checkEvery',
            2,
            'Health check interval (s)',
            'The Load Balancer takes the dead host out of rotation at its next look, a couple of seconds after it fails.',
          ),
        ]),
        at('server-a', 'server', 2, 0, [set('size', 2, 'Instance size', 'Three equal servers.')]),
        at('server-b', 'server', 2, 2, [
          set('size', 2, 'Instance size', 'Three equal servers.'),
          set(
            'life',
            DOWN,
            'State',
            'The same host, down for the same ten seconds as in the Design before.',
          ),
        ]),
        at('server-c', 'server', 2, 4, [set('size', 2, 'Instance size', 'Three equal servers.')]),
        at('database', 'database', 3, 2, [
          set('size', 3, 'Instance size', 'Medium, shared by all three.'),
        ]),
      ],
      links: [
        wire('users', 'lb'),
        wire('lb', 'server-a'),
        wire('lb', 'server-b'),
        wire('lb', 'server-c'),
        wire('server-a', 'database'),
        wire('server-b', 'database'),
        wire('server-c', 'database'),
      ],
    }),
  ),
  'pools-exhaust-database': design({
    users: 4000,
    stage: 1,
    researched: ['php-fpm'],
    nodes: [
      at('lb', 'lb', 1, 1),
      at('server-a', 'server', 2, 0, [
        set(
          'runtime',
          'php_fpm',
          'Runtime',
          'PHP-FPM keeps a fixed pool of workers, and every worker holds its own Database connection.',
        ),
        set(
          'workers',
          60,
          'Workers',
          'A big pool is common. Two of them ask the Database for more connections than it allows.',
        ),
        set('size', 2, 'Instance size', 'Small, so CPU is not what fails.'),
      ]),
      at('server-b', 'server', 2, 2, [
        set('runtime', 'php_fpm', 'Runtime', 'The same stack as the first server.'),
        set('workers', 60, 'Workers', 'The same pool size.'),
        set('size', 2, 'Instance size', 'Small, so CPU is not what fails.'),
      ]),
      at('database', 'database', 3, 1, [
        set(
          'size',
          2,
          'Instance size',
          'Small is plenty of CPU. Its connection limit is what runs out.',
        ),
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
  'pooler-shares-connections': design({
    users: 4000,
    stage: 1,
    researched: ['php-fpm'],
    nodes: [
      at('lb', 'lb', 1, 1),
      at('server-a', 'server', 2, 0, [
        set('runtime', 'php_fpm', 'Runtime', 'Unchanged from the Design before.'),
        set('workers', 60, 'Workers', 'Unchanged. The pool is not what shrinks.'),
        set('size', 2, 'Instance size', 'Unchanged.'),
      ]),
      at('server-b', 'server', 2, 2, [
        set('runtime', 'php_fpm', 'Runtime', 'Unchanged.'),
        set('workers', 60, 'Workers', 'Unchanged.'),
        set('size', 2, 'Instance size', 'Unchanged.'),
      ]),
      at('pooler', 'pooler', 3, 1, [
        set(
          'mode',
          'transaction',
          'Mode',
          'Transaction mode hands a Database connection to a client only while a transaction runs, so many workers share a few connections. Code that keeps session state must stop doing it.',
        ),
      ]),
      at('database', 'database', 4, 1, [
        set('size', 2, 'Instance size', 'Unchanged. It now sees only the pooler.'),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server-a'),
      wire('lb', 'server-b'),
      wire('server-a', 'pooler'),
      wire('server-b', 'pooler'),
      wire('pooler', 'database'),
    ],
  }),
  'dns-slow-ttl': secondsAfter(
    60,
    design({
      users: 3000,
      stage: 1,
      researched: ['health-checks'],
      nodes: [
        at('dns', 'dns', 1, 2, [
          set(
            'ttl',
            3600,
            'TTL (s)',
            'Resolvers keep the answer this long, so a dead Load Balancer keeps getting its share for as long.',
          ),
        ]),
        at('lb-a', 'lb', 2, 0),
        at('lb-b', 'lb', 2, 3, [
          set('life', DOWN, 'State', 'This Load Balancer died a minute before the picture.'),
        ]),
        at('server-a', 'server', 3, 0, [
          set('size', 2, 'Instance size', 'Two equal servers behind both balancers.'),
        ]),
        at('server-b', 'server', 3, 3, [
          set('size', 2, 'Instance size', 'Two equal servers behind both balancers.'),
        ]),
        at('database', 'database', 4, 1, [
          set('size', 3, 'Instance size', 'Medium, shared by both servers.'),
        ]),
      ],
      links: [
        wire('users', 'dns'),
        wire('dns', 'lb-a'),
        wire('dns', 'lb-b'),
        wire('lb-a', 'server-a'),
        wire('lb-a', 'server-b'),
        wire('lb-b', 'server-a'),
        wire('lb-b', 'server-b'),
        wire('server-a', 'database'),
        wire('server-b', 'database'),
      ],
    }),
  ),
  'dns-fast-ttl': secondsAfter(
    60,
    design({
      users: 3000,
      stage: 1,
      researched: ['health-checks'],
      nodes: [
        at('dns', 'dns', 1, 2, [
          set(
            'ttl',
            30,
            'TTL (s)',
            'A short answer lifetime lets DNS drop a dead Load Balancer within seconds, at the price of more lookups.',
          ),
        ]),
        at('lb-a', 'lb', 2, 0),
        at('lb-b', 'lb', 2, 3, [
          set('life', DOWN, 'State', 'The same Load Balancer, down for the same minute.'),
        ]),
        at('server-a', 'server', 3, 0, [
          set('size', 2, 'Instance size', 'Two equal servers behind both balancers.'),
        ]),
        at('server-b', 'server', 3, 3, [
          set('size', 2, 'Instance size', 'Two equal servers behind both balancers.'),
        ]),
        at('database', 'database', 4, 1, [
          set('size', 3, 'Instance size', 'Medium, shared by both servers.'),
        ]),
      ],
      links: [
        wire('users', 'dns'),
        wire('dns', 'lb-a'),
        wire('dns', 'lb-b'),
        wire('lb-a', 'server-a'),
        wire('lb-a', 'server-b'),
        wire('lb-b', 'server-a'),
        wire('lb-b', 'server-b'),
        wire('server-a', 'database'),
        wire('server-b', 'database'),
      ],
    }),
  ),
  'origin-serves-pages': design({
    users: 15_000,
    stage: 2,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Every page view reaches this App Server, including the ones that are the same for everyone.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 4, 'Instance size', 'Large, with the files already out of its rows.'),
      ]),
      at('storage', 'storage', 2, 2),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'storage')],
  }),
  'cdn-in-front': design({
    users: 15_000,
    stage: 2,
    researched: [],
    nodes: [
      at('cdn', 'cdn', 1, 0, [
        set(
          'ttl',
          3600,
          'TTL (s)',
          'Page shells and assets change rarely, so the edge can keep them for the longest time on offer.',
        ),
        set(
          'purge',
          true,
          'Purge on deploy',
          "A release empties the edge, so users do not see the last release's pages until the TTL runs out.",
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 4, 'Instance size', 'Unchanged. It now sees only what the edge misses.'),
      ]),
      at('database', 'database', 3, 0, [set('size', 4, 'Instance size', 'Unchanged.')]),
      at('storage', 'storage', 3, 2),
    ],
    links: [
      wire('users', 'cdn'),
      wire('cdn', 'server'),
      wire('server', 'database'),
      wire('server', 'storage'),
    ],
  }),
  'reads-hit-database': design({
    users: 4000,
    stage: 2,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 2, 'Instance size', 'Small, and every API read lands on it.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'cache-in-front': design({
    users: 4000,
    stage: 2,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [set('size', 3, 'Instance size', 'Unchanged.')]),
      at('cache', 'cache', 2, 0, [
        set(
          'engine',
          'redis',
          'Engine',
          'One Redis thread answers far more operations than this traffic sends, and it reloads part of its data after a restart.',
        ),
        set(
          'ttl',
          60,
          'TTL (s)',
          'A minute keeps most hot reads as hits and caps how old a stale answer can be.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Unchanged. It now takes only the reads the Cache misses, plus every write.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'cache'), wire('cache', 'database')],
  }),
  'primary-alone': design({
    users: 5000,
    stage: 1,
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the App Server is not the limit.'),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 2, 'Instance size', 'Small, and one machine takes every read and every write.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'primary-and-replica': design({
    users: 5000,
    stage: 1,
    researched: [],
    nodes: [
      at('server', 'server', 1, 1, [set('size', 3, 'Instance size', 'Unchanged.')]),
      at('database', 'database', 2, 0, [
        set('size', 2, 'Instance size', 'Unchanged. Writes still all land here.'),
      ]),
      at('replica', 'replica', 2, 2, [
        set(
          'size',
          2,
          'Instance size',
          'The same size as the primary, so the App Server splits reads evenly between them.',
        ),
        set(
          'dbEngine',
          'postgres',
          'Engine',
          "A replica runs the primary's engine. It copies the primary and answers reads only.",
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database'), wire('server', 'replica')],
  }),
}
