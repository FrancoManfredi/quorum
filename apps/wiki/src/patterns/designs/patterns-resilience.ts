import { at, design, set, setLink, wire } from '../design.ts'
import type { Design } from '../design.ts'

/* Resilience and deploys: Link policies (timeout, retries, breaker, bulkhead, hedge), an App
   Server's overload choices, a Gateway's rate limit, a Load Balancer's health checks, and the
   Pipeline's deploy strategy. */

/** The stressed pair the retry and breaker Designs share: a big App Server over a small Database. */
const stressed = (
  linkSettings: ReadonlyArray<ReturnType<typeof setLink>>,
  researched: Parameters<typeof design>[0]['researched'],
): Design =>
  design({
    users: 3500,
    stage: 1,
    researched,
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'A large App Server never runs out first, so the Database link is where the pressure shows.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          1,
          'Instance size',
          'A micro Database is too small for these Users, which stands in for a slow dependency.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database', linkSettings)],
  })

const callTimeout = setLink(
  'timeout',
  1,
  'Timeout',
  'A Database call that takes a second is already stuck, so the caller gives up and frees its slot.',
)

const noted = (base: Design, note: string): Design => ({ ...base, note })

export const patternsResilience = {
  'link-timeout': design({
    users: 600,
    stage: 1,
    note: 'A timeout acts only when a dependency slows down, so a steady-state solve looks the same with or without it.',
    researched: ['timeouts'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small gives the app room for its workers, so the Link is the only thing that waits.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 2, 'Instance size', 'Match the App Server so neither side hides the other.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database', [
        setLink(
          'timeout',
          1,
          'Timeout',
          'A Database answers in milliseconds, so a second is generous and still far below the default wait.',
        ),
      ]),
    ],
  }),

  'retries-naive': stressed(
    [
      callTimeout,
      setLink(
        'retries',
        'naive',
        'Retries',
        'Naive retries send each failed call again at once, up to three more times, which loads a Database that is already behind.',
      ),
    ],
    ['timeouts'],
  ),

  'retries-backoff': stressed(
    [
      callTimeout,
      setLink(
        'retries',
        'backoff',
        'Retries',
        'Backoff waits between attempts and keeps the extra calls inside a small budget, so a struggling Database gets room to recover.',
      ),
    ],
    ['timeouts', 'backoff-jitter'],
  ),

  'breaker-on': noted(
    stressed(
      [
        callTimeout,
        setLink(
          'retries',
          'backoff',
          'Retries',
          'Keep backoff for the short faults. The breaker covers the ones that last.',
        ),
        setLink(
          'breaker',
          true,
          'Breaker',
          'Once half the calls on this Link fail, it sends nothing for a few seconds and fails fast, so the Database can drain.',
        ),
      ],
      ['timeouts', 'backoff-jitter', 'circuit-breakers'],
    ),
    'A breaker opens over time, which a steady-state solve cannot show.',
  ),

  'bulkhead-search': design({
    users: 4000,
    stage: 2,
    note: 'A bulkhead acts only while search is slow, so a steady-state solve looks the same with or without it.',
    researched: ['timeouts', 'backoff-jitter', 'circuit-breakers', 'bulkheads'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'One App Server with one pool of slots serves every dependency, which is what a bulkhead protects.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 3, 'Instance size', 'Sized so the Database is not the weak part.'),
      ]),
      at('search', 'search', 2, 2, [
        set(
          'size',
          1,
          'Instance size',
          'The smallest Search Engine is the dependency most likely to slow down.',
        ),
      ]),
      at('storage', 'storage', 2, 4),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'search', [
        setLink(
          'bulkhead',
          true,
          'Bulkhead',
          'A call to search may hold the caller for only a short fixed time, so a slow search cannot keep every slot.',
        ),
      ]),
      wire('server', 'storage'),
    ],
  }),

  'shed-low-value': design({
    users: 6000,
    stage: 1,
    researched: ['timeouts', 'load-shedding'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small is too little for these Users, so the App Server runs past its limit.',
        ),
        set(
          'shed',
          true,
          'Overload: Shed low value',
          'Above its load line the App Server refuses the lowest-value kinds first and keeps the ones that earn most.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          5,
          'Instance size',
          'Large enough that the App Server is the one that overloads.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),

  'degrade-dearest': design({
    users: 6000,
    stage: 1,
    researched: ['ci', 'feature-flags', 'graceful-degradation'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Small is too little for these Users, so the App Server runs past its limit.',
        ),
        set(
          'degrade',
          true,
          'Overload: Drop dearest',
          'Above its load line the App Server turns off the kinds that cost the most CPU, so the cheap ones keep their latency.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          5,
          'Instance size',
          'Large enough that the App Server is the one that overloads.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),

  'gateway-rate-limit': design({
    users: 6000,
    stage: 1,
    researched: [],
    nodes: [
      at('gateway', 'gw', 1, 0, [
        set(
          'rateLimit',
          100,
          'Rate limit',
          'The Gateway lets this many requests per second through and answers the rest as throttled, before they reach the App Server.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 4, 'Instance size', 'Sized for the traffic the limit lets through.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Sized so the limit, not the Database, is the cap.'),
      ]),
    ],
    links: [wire('users', 'gateway'), wire('gateway', 'server'), wire('server', 'database')],
  }),

  'hedged-database-call': design({
    users: 3000,
    stage: 1,
    researched: ['timeouts', 'metrics', 'percentiles', 'tracing', 'hedged-requests'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, so the Database link sets the tail.'),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 3, 'Instance size', 'Has the room for a small share of extra calls.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database', [
        setLink(
          'hedge',
          true,
          'Hedge',
          'The Link sends a second copy of a slow call and keeps whichever answer comes first, which shortens the tail.',
        ),
      ]),
    ],
  }),

  'lb-health-checks': design({
    users: 3000,
    stage: 1,
    researched: ['health-checks', 'multi-az'],
    nodes: [
      at('lb', 'lb', 1, 1, [
        set(
          'checkEvery',
          2,
          'Health check interval',
          'A dead App Server stays in rotation until the next check, so a short interval shortens the errors.',
        ),
        set(
          'deepCheck',
          true,
          'Deep health check',
          'The check also asks the Database, so an App Server that cannot reach it leaves rotation too.',
        ),
      ]),
      at('server-a', 'server', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Each App Server can carry the load alone if its twin dies.',
        ),
        set('zone', 'a', 'Zone', 'One zone failing takes only one of the two App Servers.'),
      ]),
      at('server-b', 'server', 2, 2, [
        set(
          'size',
          2,
          'Instance size',
          'Each App Server can carry the load alone if its twin dies.',
        ),
        set('zone', 'b', 'Zone', 'The twin sits in a different zone from the first.'),
      ]),
      at('database', 'database', 3, 1, [
        set('size', 3, 'Instance size', 'Sized for the whole load.'),
        set(
          'standby',
          true,
          'Standby',
          'A second box in another zone takes over if the Database zone fails, for double the Burn.',
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

  'deploy-blue-green': noted(
    design({
      users: 500,
      stage: 1,
      researched: ['ci', 'blue-green'],
      nodes: [
        at('server', 'server', 1, 0),
        at('database', 'database', 2, 0),
        at('pipeline', 'ci', 1, 3, [
          set(
            'strategy',
            'blue-green',
            'Deploy strategy',
            'The new version comes up beside the old one, so a bad deploy reaches only a slice of requests, at the price of a second fleet.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'database')],
    }),
    "A bad deploy's reach depends on the strategy, and a steady-state solve has no bad deploy to measure.",
  ),

  'deploy-canary': noted(
    design({
      users: 500,
      stage: 1,
      researched: ['ci', 'percentiles', 'canary'],
      nodes: [
        at('server', 'server', 1, 0),
        at('database', 'database', 2, 0),
        at('pipeline', 'ci', 1, 3, [
          set(
            'strategy',
            'canary',
            'Deploy strategy',
            'A small share of traffic meets the new version first, so a bad deploy has the smallest reach and the slowest rollout.',
          ),
        ]),
      ],
      links: [wire('users', 'server'), wire('server', 'database')],
    }),
    "A bad deploy's reach depends on the strategy, and a steady-state solve has no bad deploy to measure.",
  ),

  'feature-flag-rollout': noted(
    design({
      users: 500,
      stage: 1,
      researched: [],
      nodes: [
        at('server', 'server', 1, 0),
        at('database', 'database', 2, 0),
        at('flags', 'ff', 1, 3),
        at('pipeline', 'ci', 2, 3),
      ],
      links: [wire('users', 'server'), wire('server', 'database')],
    }),
    "A bad deploy's reach depends on the strategy, and a steady-state solve has no bad deploy to measure.",
  ),
} as const satisfies Record<string, Design>
