import { at, design, set, wire } from '../design.ts'

/* Patterns: operate and observe, security and edge, cost. */

export const patternsOps = {
  'tracing-sampled': design({
    users: 3_000,
    stage: 2,
    researched: ['percentiles', 'tracing', 'tail-sampling'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('server', 'server', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium gives the app four vCPUs, so the trace tap has room to run.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium keeps the slowest hop on the app, where the trace should find it.',
        ),
      ]),
      at('traces', 'analytics', 2, 2, [
        set(
          'sampleRate',
          0.05,
          'Sample rate',
          'Keep one request in twenty. A full sample costs CPU and latency on every tapped Node.',
        ),
        set(
          'retention',
          3_600,
          'Retention',
          'An hour of traces is enough to compare a slow request with its neighbours.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'database'),
      wire('lb', 'traces'),
      wire('server', 'traces'),
      wire('database', 'traces'),
    ],
  }),
  'dr-zone-standby': design({
    users: 3_000,
    stage: 2,
    researched: ['pitr', 'multi-az', 'health-checks'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium for the app, so the Database is the part under test.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the primary. The standby copies this size.'),
        set(
          'standby',
          true,
          'Standby',
          'A second box in another zone takes over within seconds if the primary zone fails, and doubles the Node bill.',
        ),
        set(
          'backup',
          'nightly',
          'Backups',
          'A nightly snapshot is the cheap floor: a bad delete loses up to a day of writes.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'rpo-pitr': design({
    users: 3_000,
    stage: 2,
    researched: ['pitr', 'multi-az', 'health-checks', 'restore-drills'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium for the app, so the Database is the part under test.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the primary.'),
        set(
          'backup',
          'pitr',
          'Backups',
          'Point-in-time recovery archives the write log, so the gap shrinks from a day to minutes.',
        ),
        set(
          'standby',
          true,
          'Standby',
          'The standby shortens the recovery time when a zone fails. It does nothing for a bad delete.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'gateway-front-door': design({
    users: 3_000,
    stage: 2,
    note: 'Demand stays under the limit here, so nothing is throttled. The limit matters when a client floods.',
    researched: ['api-gateway', 'rate-limiting'],
    nodes: [
      at('gateway', 'gw', 1, 0, [
        set(
          'rateLimit',
          1_000,
          'Rate limit',
          'Requests per second past this answer as throttled, so a runaway client cannot take the services down.',
        ),
        set(
          'burst',
          200,
          'Token bucket',
          'A short burst passes whole while the long-run average holds at the limit.',
        ),
        set(
          'authEdge',
          true,
          'Auth at the edge',
          'The Gateway checks each token once, so the services behind it skip that work.',
        ),
        set(
          'merge',
          true,
          'Request coalescing',
          'Identical reads in flight at once become one call to the services.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the app behind the front door.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium for the Database.'),
      ]),
    ],
    links: [wire('users', 'gateway'), wire('gateway', 'server'), wire('server', 'database')],
  }),
  'waf-tuned': design({
    users: 3_000,
    stage: 2,
    researched: ['waf', 'bot-management'],
    nodes: [
      at('waf', 'waf', 1, 0, [
        set(
          'paranoia',
          3,
          'Paranoia level',
          'A higher level blocks more bots but also more real users, and costs more CPU per request.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the app behind the WAF.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium for the Database.'),
      ]),
    ],
    links: [wire('users', 'waf'), wire('waf', 'server'), wire('server', 'database')],
  }),
  'tls-renewed': design({
    users: 3_000,
    stage: 2,
    researched: ['tls-everywhere', 'cert-automation'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('certs', 'pki', 1, 2),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the app behind the Load Balancer.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium for the Database.'),
      ]),
    ],
    links: [wire('users', 'lb'), wire('lb', 'server'), wire('server', 'database')],
  }),
  'fleet-pricing': design({
    users: 3_000,
    stage: 3,
    mix: { page: 0.45, read: 0.35, write: 0.15, login: 0.05 },
    researched: [
      'autoscaling',
      'reserved-instances',
      'spot-instances',
      'health-checks',
      'load-balancing',
    ],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('steady', 'server', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Sized for the steady load, which is what a commitment should cover.',
        ),
        set(
          'pricing',
          'reserved',
          'Pricing model',
          'The always-on box takes the reserved discount in return for a one-week term.',
        ),
        set(
          'pricingUntil',
          10_080,
          'Term',
          'One calendar week, in sim minutes, so the discount applies.',
        ),
      ]),
      at('extra', 'server', 2, 2, [
        set(
          'size',
          3,
          'Instance size',
          'The same size, so the Load Balancer treats the two alike.',
        ),
        set(
          'pricing',
          'spot',
          'Pricing model',
          'The box that can vanish takes the deepest discount, because the steady box still serves if it is reclaimed.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium for the Database, which has no spot or reserved choice.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'steady'),
      wire('lb', 'extra'),
      wire('steady', 'database'),
      wire('extra', 'database'),
    ],
  }),
  'egress-heavy': design({
    users: 3_000,
    stage: 2,
    mix: { page: 0.3, media: 0.5, read: 0.2 },
    researched: ['object-storage'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium for the app, as in the lean Design.'),
      ]),
      at('storage', 'storage', 2, 0, [
        set(
          'storeVariant',
          's3',
          'Object Storage product',
          'The S3-style product bills every byte it sends to the internet.',
        ),
      ]),
      at('database', 'database', 2, 2, [
        set('size', 3, 'Instance size', 'Medium for the Database.'),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'storage'), wire('server', 'database')],
  }),
  'egress-lean': design({
    users: 3_000,
    stage: 2,
    mix: { page: 0.3, media: 0.5, read: 0.2 },
    researched: ['gzip', 'cdn', 'object-storage', 'egress-optimization'],
    nodes: [
      at('cdn', 'cdn', 1, 0),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium for the app.'),
        set(
          'compress',
          true,
          'Compression',
          'Gzip shrinks page and read responses before they leave, for a little extra CPU.',
        ),
      ]),
      at('storage', 'storage', 3, 0, [
        set(
          'storeVariant',
          'r2',
          'Object Storage product',
          'The R2-style product serves files to the internet with no egress charge.',
        ),
      ]),
      at('database', 'database', 3, 2, [
        set('size', 3, 'Instance size', 'Medium for the Database.'),
      ]),
    ],
    links: [
      wire('users', 'cdn'),
      wire('cdn', 'server'),
      wire('server', 'storage'),
      wire('server', 'database'),
    ],
  }),
} as const satisfies Record<string, ReturnType<typeof design>>
