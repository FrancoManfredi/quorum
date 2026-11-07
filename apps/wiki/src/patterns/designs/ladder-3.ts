import type { Design } from '../design.ts'
import { at, design, set, setLink, wire } from '../design.ts'

/* Ladder tier 3: the front door, safe change, realtime, and the data and compute that outgrow one machine. */

export const ladder3 = {
  'gateway-auth-tls': design({
    users: 2000,
    stage: 2,
    researched: ['load-balancing'],
    nodes: [
      at('gateway', 'gw', 1, 0, [
        set(
          'authEdge',
          true,
          'Auth at the edge',
          'The gateway checks each token once, so the App Server skips the check on every request that carries one.',
        ),
        set(
          'rateLimit',
          2500,
          'Rate limit',
          'A cap above real demand costs nothing, and it fails a flood as throttled before it reaches the App Server.',
        ),
      ]),
      at('certs', 'pki', 1, 1),
      at('server', 'server', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium leaves room for the password hash that each login still costs.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Match the App Server so neither tier hides the other.'),
      ]),
      at('auth', 'auth', 3, 2),
    ],
    links: [
      wire('users', 'gateway'),
      wire('gateway', 'server'),
      wire('server', 'database'),
      wire('server', 'auth'),
    ],
  }),
  'safe-deploys': design({
    users: 2000,
    stage: 2,
    researched: ['percentiles', 'canary'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium keeps the app away from its limit, so a bad deploy is the only thing that breaks it.',
        ),
      ]),
      at('database', 'database', 2, 0, [set('size', 3, 'Instance size', 'Match the App Server.')]),
      at('pipeline', 'ci', 3, 0, [
        set(
          'strategy',
          'canary',
          'Deploy strategy',
          'A canary sends a small share of traffic to the new code first, so a bad deploy breaks only that share.',
        ),
      ]),
      at('flags', 'ff', 3, 1),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'realtime-hub': design({
    users: 2000,
    stage: 3,
    mix: { page: 0.3, read: 0.3, write: 0.1, login: 0.05, rt: 0.25 },
    researched: ['lang-node'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('server', 'server', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium runs the request kinds that the Hub does not take.',
        ),
      ]),
      at('hub', 'ws', 2, 2, [
        set(
          'runtime',
          'node',
          'Stack',
          'The default Stack holds a worker for each open connection, so it holds none. An event loop holds each connection for a few KB.',
        ),
        set(
          'clustering',
          true,
          'Clustering',
          'Without it one box takes every connection, so a bigger Hub adds Burn and no room.',
        ),
        set(
          'presence',
          true,
          'Presence',
          'The Hub tracks who is online, so each message earns more and each join costs CPU.',
        ),
        set(
          'backoff',
          true,
          'Reconnect backoff',
          'Clients return after a restart with jitter, so the Hub does not refuse half of one reconnect wave.',
        ),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium, to match the App Server.'),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server', [
        setLink(
          'kinds',
          ['page', 'read', 'write', 'login'],
          'Kinds carried',
          'Every kind this Design sends except realtime. A Hub is the only Node here that can hold a realtime connection open.',
        ),
      ]),
      wire('lb', 'hub', [
        setLink(
          'kinds',
          ['rt'],
          'Kinds carried',
          'Only realtime messages go to the Hub, so the long connections never sit in the App Server.',
        ),
      ]),
      wire('server', 'database'),
    ],
  }),
  'sharded-database': design({
    users: 4000,
    stage: 2,
    researched: ['replication', 'sharding'],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium, so the Database is the tier that shows its limit.',
        ),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'shards',
          4,
          'Shards',
          'Writes split four ways, so each shard takes a quarter of them. Reads and writes now scale with the count.',
        ),
        set(
          'shardKey',
          'hash',
          'Shard key',
          'A hash of the user ID spreads Users evenly, so no shard becomes the busy one.',
        ),
        set(
          'size',
          3,
          'Instance size',
          'Each shard is another copy of this size, so size it for one shard.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'quorum-store': design({
    users: 3000,
    stage: 2,
    researched: ['replication', 'sharding', 'leaderless'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the store is the tier under test.'),
      ]),
      at('store', 'wide', 2, 0, [
        set('n', 3, 'Replicas per key (N)', 'Three copies of each key survive the loss of one.'),
        set(
          'r',
          2,
          'Replicas a read asks (R)',
          'Two of three replies, so a read overlaps any write that waited for two.',
        ),
        set(
          'w',
          2,
          'Replicas a write waits for (W)',
          'R plus W is above N, so every read sees the latest write.',
        ),
      ]),
      at('database', 'database', 2, 2, [
        set(
          'size',
          3,
          'Instance size',
          'Searches and uploads stay on a Database, because the store takes only reads, writes and transactions.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'store'), wire('server', 'database')],
  }),
  'distributed-sql': design({
    users: 3000,
    stage: 2,
    researched: ['replication', 'sync-replication', 'consensus'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium, so the store is the tier under test.'),
      ]),
      at('store', 'dsql', 2, 0, [
        set(
          'size',
          2,
          'Instance size',
          'Each size step doubles the nodes behind it, and every one is billed. Small is enough to show the write cost.',
        ),
      ]),
      at('database', 'database', 2, 2, [
        set(
          'size',
          3,
          'Instance size',
          'Searches and uploads stay on a Database, because the store takes only reads, writes and transactions.',
        ),
      ]),
    ],
    links: [wire('users', 'server'), wire('server', 'store'), wire('server', 'database')],
  }),
  'logs-metrics-traces': design({
    users: 2000,
    stage: 2,
    researched: ['percentiles', 'tracing', 'tail-sampling'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium leaves CPU for the sampling tap.'),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Match the App Server, so the slowest hop is not obvious from size alone.',
        ),
      ]),
      at('telemetry', 'analytics', 2, 2, [
        set(
          'size',
          4,
          'Size',
          'Each size step doubles the samples a second Analytics keeps. Past it, samples are dropped evenly.',
        ),
        set(
          'sampleRate',
          0.05,
          'Sample rate',
          'One request in twenty. A full sample costs CPU and latency on every tapped Node.',
        ),
        set(
          'retention',
          3600,
          'Retention',
          'An hour of traces is enough to compare a slow request with its neighbours.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'server'),
      wire('server', 'database'),
      wire('lb', 'telemetry'),
      wire('server', 'telemetry'),
      wire('database', 'telemetry'),
    ],
  }),
  'mesh-services': design({
    users: 2000,
    stage: 2,
    researched: ['autoscaling', 'containers'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('catalog', 'server', 2, 0, [
        set('size', 2, 'Instance size', 'Small, since this service takes only the cheap kinds.'),
      ]),
      at('uploads', 'server', 2, 2, [
        set('size', 3, 'Instance size', 'Medium, since uploads are the CPU-heavy kind.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Both services share it until their data splits too.'),
      ]),
      at('cluster', 'cluster', 3, 2),
      at('mesh', 'mesh', 3, 3),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'catalog', [
        setLink(
          'kinds',
          ['page', 'read', 'login', 'search', 'bot'],
          'Kinds carried',
          'The load balancer sends reads and pages to one service.',
        ),
      ]),
      wire('lb', 'uploads', [
        setLink(
          'kinds',
          ['write', 'upload'],
          'Kinds carried',
          'Writes and uploads go to the other, so a bad deploy of one stays in its own lane.',
        ),
      ]),
      wire('catalog', 'database'),
      wire('uploads', 'database'),
      wire('catalog', 'cluster'),
      wire('uploads', 'cluster'),
      wire('catalog', 'mesh'),
      wire('uploads', 'mesh'),
    ],
  }),
  'far-users': design({
    users: 3000,
    stage: 5,
    mix: { page: 0.45, read: 0.35, write: 0.15, login: 0.05 },
    researched: [],
    nodes: [
      at('server', 'server', 1, 0, [
        set(
          'size',
          4,
          'Instance size',
          'Large, so distance and not capacity is what the far users feel.',
        ),
      ]),
      at('database', 'database', 2, 0, [set('size', 4, 'Instance size', 'Match the App Server.')]),
    ],
    links: [wire('users', 'server'), wire('server', 'database')],
  }),
  'geodns-two-regions': design({
    users: 3000,
    stage: 5,
    mix: { page: 0.45, read: 0.35, write: 0.15, login: 0.05 },
    researched: ['multi-az', 'multi-region', 'geo-dns'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, as in the one-region Design.'),
      ]),
      at('database', 'database', 2, 0, [
        set('size', 4, 'Instance size', 'The primary stays at home and takes every write.'),
      ]),
      at('users-eu', 'users', 0, 3, [
        set(
          'region',
          'eu',
          'Region',
          'A Users Node in Europe gives GeoDNS somewhere nearby to send European Users.',
        ),
      ]),
      at('server-eu', 'server', 1, 3, [
        set(
          'region',
          'eu',
          'Region',
          'The App Server runs beside its Users, so their calls skip the ocean.',
        ),
        set('size', 4, 'Instance size', 'Match the home App Server.'),
      ]),
      at('replica-eu', 'replica', 2, 3, [
        set(
          'region',
          'eu',
          'Region',
          'Reads stay in Europe. A replica copies the primary, so some reads come back a little stale.',
        ),
        set('size', 4, 'Instance size', 'Match the primary, since it replays every write.'),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('users-eu', 'server-eu'),
      wire('server-eu', 'replica-eu'),
      wire('server-eu', 'database'),
    ],
  }),
  'edge-handlers': design({
    users: 2000,
    stage: 2,
    researched: ['lang-node', 'cdn'],
    nodes: [
      at('lb', 'lb', 1, 0),
      at('edge', 'edge', 2, 0, [
        set(
          'runtime',
          'node',
          'Stack',
          'The edge runs JavaScript or TypeScript, and Rust or Go built to WebAssembly. A PHP Stack is refused there.',
        ),
      ]),
      at('server', 'server', 2, 2, [
        set('size', 3, 'Instance size', 'Medium takes the kinds that are too heavy for the edge.'),
      ]),
      at('database', 'database', 3, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Both tiers still call it, so the edge saves the user hop and not the query.',
        ),
      ]),
    ],
    links: [
      wire('users', 'lb'),
      wire('lb', 'edge', [
        setLink(
          'kinds',
          ['page', 'read'],
          'Kinds carried',
          'Pages and reads fit the edge CPU ceiling. Anything heavier is killed there.',
        ),
      ]),
      wire('lb', 'server', [
        setLink(
          'kinds',
          ['write', 'login', 'search', 'upload', 'bot'],
          'Kinds carried',
          'Logins and uploads cost more CPU than an edge handler may spend, and writes belong beside the Database, so these go to the App Server.',
        ),
      ]),
      wire('edge', 'database'),
      wire('server', 'database'),
    ],
  }),
  'failover-region': design({
    users: 3000,
    stage: 5,
    mix: { page: 0.45, read: 0.35, write: 0.15, login: 0.05 },
    researched: ['multi-region', 'geo-dns', 'multi-az', 'sharding', 'leaderless', 'dr-drills'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 4, 'Instance size', 'Large, as in the earlier rungs.'),
      ]),
      at('wide', 'wide', 2, 0, [
        set(
          'spread',
          true,
          'Spread',
          'Replicates every key across the open regions, so the data and its writes outlive the home region.',
        ),
        set(
          'r',
          2,
          'Read quorum (R)',
          'Two of three replicas answer a read, so a read after a failover still sees the last write.',
        ),
        set(
          'w',
          2,
          'Write quorum (W)',
          'A write waits for two of three, so a lost region cannot take the only copy.',
        ),
        set('size', 3, 'Instance size', 'Medium, since the store shares the work across regions.'),
      ]),
      at('users-eu', 'users', 0, 3, [
        set(
          'region',
          'eu',
          'Region',
          'Gives GeoDNS a nearby entry and a place to send Users when the home region is down.',
        ),
      ]),
      at('server-eu', 'server', 1, 3, [
        set('region', 'eu', 'Region', 'It serves from Europe while the home region is gone.'),
        set(
          'size',
          4,
          'Instance size',
          'Match the home App Server, so one region can carry the other.',
        ),
      ]),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'wide'),
      wire('users', 'server-eu'),
      wire('users-eu', 'server-eu'),
      wire('server-eu', 'wide'),
    ],
  }),
  'gpu-behind-gateway': design({
    users: 1500,
    stage: 4,
    mix: { page: 0.4, read: 0.3, write: 0.1, login: 0.05, search: 0.05, ai: 0.1 },
    researched: ['model-serving', 'quantization', 'continuous-batching'],
    nodes: [
      at('gateway', 'gw', 1, 0, [
        set(
          'rateLimit',
          1000,
          'Rate limit',
          'Caps all requests a second, so a burst of prompts cannot queue behind a fixed number of GPUs. Keep it above real demand.',
        ),
      ]),
      at('server', 'server', 2, 0, [
        set('size', 3, 'Instance size', 'Medium runs the code and hands each prompt on.'),
      ]),
      at('database', 'database', 3, 0, [
        set('size', 3, 'Instance size', 'Medium, to match the App Server.'),
      ]),
      at('gpu', 'gpu', 3, 2, [
        set(
          'gpu',
          'a100',
          'GPU type',
          'An A100 costs less per second than an H100 and serves far more than a T4.',
        ),
        set(
          'gpuModel',
          'medium',
          'Model',
          'A medium model answers fast, and a larger one earns more per prompt but serves a fraction as many.',
        ),
        set(
          'precision',
          'int8',
          'Precision',
          'INT8 weights serve faster and take half the memory, and the answer is worth a little less.',
        ),
        set(
          'batch',
          8,
          'Batch size',
          'A bigger batch raises throughput, and continuous batching keeps the first-token wait low.',
        ),
      ]),
    ],
    links: [
      wire('users', 'gateway'),
      wire('gateway', 'server'),
      wire('server', 'database'),
      wire('server', 'gpu'),
    ],
  }),
  'vector-index': design({
    users: 1500,
    stage: 4,
    mix: { page: 0.35, read: 0.3, write: 0.1, login: 0.05, search: 0.15, ai: 0.05 },
    researched: ['hosted-models'],
    nodes: [
      at('server', 'server', 1, 0, [
        set('size', 3, 'Instance size', 'Medium runs the code that retrieves and then prompts.'),
      ]),
      at('database', 'database', 2, 0, [
        set(
          'size',
          3,
          'Instance size',
          'Medium keeps the rows. The index holds only the embeddings.',
        ),
      ]),
      at('index', 'vec', 2, 2, [
        set(
          'indexType',
          'hnsw',
          'Index type',
          'A graph walk answers twice the queries of an exact scan, and gives up a little recall for it.',
        ),
      ]),
      at('hosted', 'llm', 3, 2),
    ],
    links: [
      wire('users', 'server'),
      wire('server', 'database'),
      wire('server', 'index'),
      wire('server', 'hosted'),
    ],
  }),
} as const satisfies Record<string, Design>
