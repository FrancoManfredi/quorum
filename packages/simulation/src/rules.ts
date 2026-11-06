import {
  BACKEND_KINDS,
  BACKLOG_MS,
  CACHE_ENGINES,
  CACHE_OPS,
  CACHE_STRATEGIES,
  CACHE_TTLS,
  CDN_HIT,
  CDN_TTLS,
  ESI_PAGE_HIT,
  BOT_MANAGEMENT_FALSE,
  STEP_SECONDS,
  L4_CAPACITY,
  L4_MS,
  GPU_PRECISIONS,
  GPU_BATCHES,
  GPU_MODELS,
  GPU_CACHE_GB,
  DUAL_WRITE_STALE,
  MATERIALIZED_STALE,
  PSP_CAPACITY,
  GPU_FIRST_TOKEN_MS,
  GPU_TYPES,
  HERD_REFUSED,
  STICKY_HERD,
  HUB_RAM_KB,
  ML_AI_BONUS,
  LLM_FIRST_TOKEN_MS,
  LLM_RATE,
  PRESENCE_CPU,
  PRESENCE_VALUE,
  REGEX_CAPACITY,
  BLAST_FACTOR,
  LANGUAGES,
  EXPORT_MS_PER_GB,
  FUNCTION_LIMIT_MS,
  RUNTIME_INCIDENT_FAILURES,
  GATEWAY_AUTH_MS,
  COALESCE_KINDS,
  COALESCE_HOT,
  COALESCE_WINDOW,
  RT_HOLD_SECONDS,
  SEARCH_REFRESH,
  SLOW_CHARGE_MS,
  TOKENS_PER_PROMPT,
  DSQL_READ_COST,
  DSQL_TX,
  HOT_KEY_SHARE,
  MSGP_RATE,
  MTU_LOSS,
  SPREAD_REGIONS,
  STALE_SURGE,
  WIDE_OPS,
  WIDE_STALE,
  WIDE_TX_DUPLICATE,
  WIDE_TX_STALE,
  rttOf,
  TIERED_MEDIA_HIT,
  CACHE_KEYS,
  COALESCED,
  STALE_AFTER_DEPLOY,
  COMPONENTS,
  DRAIN_SECONDS,
  PARANOIA,
  POISON_SHARE,
  PROFILES,
  QUEUE_RATE,
  SEARCH_QPS,
  UNDER_ATTACK,
  FRAMEWORKS,
  HOT_KB_PER_USER,
  MIGRATION_BUGS,
  P2C_CAPACITY,
  POOLER_CONNECTIONS,
  REQUEST_KINDS,
  ROLLOUT_SHARE,
  RUNTIMES,
  SESSION_STATE_CRASHES,
  UPGRADE_CRASHES,
  STORAGE_CLASSES,
  EDGE_CPU_MS,
  EDGE_LANGUAGES,
  EDGE_MS,
  EDGE_READ_HIT,
  DOC_JOIN_COST,
  EARLY_LIFT,
  R2_FIRST_BYTE_MS,
  SEARCH_FANOUT,
  SEARCH_HEAPS,
  SEARCH_VARIANTS,
  EARLY_REFRESH,
  DOC_OPS,
  DOC_OP_MS,
  DOC_PARTIAL,
  DOC_TXN_LATENCY,
  LOG_ACKS,
  LOG_RATE,
  LOG_READ_RATE,
  VEC_AI_LIFT,
  VEC_INDEXES,
  VEC_QUERIES,
  CDC_CHANGES,
  CDC_RATE,
  CDC_MS,
  DATA_TEAM_LAG,
  isBackendKind,
  type ComponentId,
  type Kind,
  type RequestKind,
} from './catalog.ts'
import {
  FLAT_CAPACITY,
  asyncCallsOf,
  callsOf,
  databaseModel,
  flatModel,
  requestCpuMs,
  serverlessModel,
  serverModel,
  type Calls,
  type NodeModel,
} from './capacity.ts'
import {
  NO_FAILURES,
  answered,
  blend,
  failSome,
  failed,
  hop,
  kthFastest,
  through,
  type Hop,
  type Outcome,
} from './distribution.ts'
import { mixOf, payloadFactor, queryFactor } from './features.ts'
import {
  clusterOf,
  flatScale,
  grown,
  has,
  hasEdge,
  hopMs,
  certNodes,
  inCluster,
  isDown,
  meshOf,
  pinnedOf,
  shardingOf,
  storageBands,
  syncStalled,
  transferMs,
  vecOf,
} from './lookups.ts'
import { buggy } from './migration.ts'
import { spreadRegions } from './regions.ts'
import type { Game, GameNode } from './state.ts'
import { RUNNING, warmOf } from './life.ts'
import { badDeployShareOf, blastService, dataStaffed, failsKind, fixed } from './team.ts'

/* ==========================================================================
   What each Component does in the flow solve, one rule per Component. The
   solve walks the graph, splits traffic, repeats its passes, and builds the
   Ledger; a rule answers the questions that depend on the Component:

   - `model`: its capacity and latency for the work that reaches it.
   - `serve`: what it sends on for the work it processed.
   - `outcome`: what one request of a kind gets back from it.
   - `connections`: the database connections it opens to each data Node it calls.
   - `probe`: the work it is weighed with, for a Load Balancer's split.

   The table is a Record over every ComponentId, so a new Component cannot
   compile until it answers each one.
   ========================================================================== */

export type Rates = Partial<Record<Kind, number>>

/** What a rule may ask the solve about the Design in the current pass. */
export type Solver = Readonly<{
  game: Game
  /** 2 on the Node the Bottleneck search boosts, 1 elsewhere. */
  boost: (node: GameNode) => number
  /** Milliseconds an App Server holds a slot per call, by backend kind, from the last pass. */
  callLatency: (node: GameNode) => Calls
  /** Requests in flight on the last pass. */
  inflight: (node: GameNode) => number
  /** An Auth Provider takes this App Server's logins. */
  delegates: (node: GameNode) => boolean
  /** Postgres still runs on this App Server. */
  runsLocalDb: (node: GameNode) => boolean
  /** CPU overhead from Analytics sampling this Node. */
  sampling: (node: GameNode) => number
  /** This App Server can hand async work to a Queue. */
  offloads: (node: GameNode) => boolean
  /** This Worker pulls from a Queue a poison message is stuck in. */
  poisoned: (node: GameNode) => boolean
  /** Share of the tasks a Queue or Worker gets that come from each request kind, in this pass. */
  taskMix: (node: GameNode) => Partial<Record<RequestKind, number>>
  /** Attempts per task this Worker runs: failed tasks come back until the Queue parks them. */
  attempts: (node: GameNode) => number
  /** Tasks per second a Queue's live Workers could take, from the last pass; infinite before one. */
  drainable: (node: GameNode) => number
}>

export type Model = NodeModel & { disk?: boolean }

/** What one pass of the solve found. */
export type Pass = Readonly<{
  /** Each Node's place in the per-Node arrays below, by id. */
  at: ReadonlyMap<string, number>
  arriving: ReadonlyArray<Rates>
  models: ReadonlyArray<Model | undefined>
  hits: ReadonlyArray<number | undefined>
  /** Share of each Cache's hits that are stale. */
  staleHits: ReadonlyArray<number | undefined>
  stranded: ReadonlyArray<Readonly<{ rate: number; kinds: ReadonlySet<Kind> }> | undefined>
  /** What each routing Link carried, by kind, indexed by the solve's Edge numbers. */
  links: ReadonlyArray<Rates | undefined>
  /** The Edges that carried anything, in the order they first did: sums over Links run in it. */
  linkOrder: ReadonlyArray<number>
  connections: ReadonlyArray<Readonly<{ used: number; max: number }> | undefined>
  /** Tasks per second each Queue or Worker gets, by the request kind that enqueued them. */
  tasks: ReadonlyArray<Partial<Record<RequestKind, number>> | undefined>
  /** Tasks per second each Queue's Workers take from it. */
  drained: ReadonlyArray<number | undefined>
  /** Milliseconds replicas lag behind the primary. */
  lag: number
  /** Share of replica reads that are stale. */
  staleShare: number
}>

/** A Node's place in a pass's per-Node arrays. */
export const slotOf = (pass: Pass, node: GameNode): number => pass.at.get(node.id) as number

/** What `serve` may do: send work on, and record a Cache's hit ratio. */
export type Serve = Readonly<{
  solver: Solver
  /** Sends `rate` requests of `kind` on, split over the Links that take it. */
  route: (kind: Kind, rate: number) => void
  setHits: (hit: number, stale: number) => void
}>

/** With Read-your-writes routing, this share of stale reads still reaches a lagging replica. */
export const RYW_STALE = 0.2

/**
 * Share of the tasks that come from each kind when nothing says otherwise: the
 * kinds that can go async, by demand. A Queue's own mix comes from its App Servers.
 */
export const taskMixOf = (game: Game): Partial<Record<RequestKind, number>> => {
  const mix = mixOf(game)
  const shares: Partial<Record<RequestKind, number>> = {}
  let total = 0
  for (const kind of REQUEST_KINDS)
    if (PROFILES[kind].offload > 0 && (mix[kind] ?? 0) > 0) {
      shares[kind] = mix[kind] ?? 0
      total += mix[kind] ?? 0
    }
  if (total <= 0) return { upload: 1 }
  for (const kind of Object.keys(shares) as Array<RequestKind>)
    shares[kind] = (shares[kind] ?? 0) / total
  return shares
}

/** A Queue's or Worker's task mix in a pass, or null when no task reached it. */
export const mixIn = (pass: Pass, node: GameNode): Partial<Record<RequestKind, number>> | null => {
  const tasks = pass.tasks[slotOf(pass, node)]
  if (!tasks) return null
  let total = 0
  for (const kind of Object.keys(tasks) as Array<RequestKind>) total += tasks[kind] ?? 0
  if (total <= 0) return null
  const shares: Partial<Record<RequestKind, number>> = {}
  for (const kind of Object.keys(tasks) as Array<RequestKind>)
    shares[kind] = (tasks[kind] ?? 0) / total
  return shares
}

/**
 * Share of requests the code itself fails on an App Server or Worker: a bad
 * deploy, a migration's bugs, or a Cluster upgrade gone wrong. A rolling deploy
 * stops after its first batch of pods, so pods take a share of a bad deploy.
 * A bad deploy fails only the traffic of the Service that shipped it
 * (08 "Services", 11 "Bad deploy"); every other kind keeps its own code.
 */
export const codeCrashes = (
  game: Game,
  node: GameNode,
  kind: Kind,
  /** The kinds a Queue's task came from, when `kind` is the task itself rather than its origin. */
  origins: ReadonlyArray<Kind> = [],
): number => {
  const incident = game.incident
  const cluster = clusterOf(game, node)
  const request = kind as string
  const carries = (entry: Kind): boolean =>
    REQUEST_KINDS.includes(entry as RequestKind) && failsKind(game, entry as RequestKind)
  // A Worker's task is not a request kind: it breaks when one of the kinds that made it breaks.
  const failing = REQUEST_KINDS.includes(request as RequestKind)
    ? carries(kind)
    : origins.some(carries)
  const deploy =
    incident?.kind === 'bad-deploy' && failing
      ? badDeployShareOf(game, blastService(game)) * (cluster ? ROLLOUT_SHARE : 1)
      : 0
  const upgrade =
    incident?.kind === 'cluster-upgrade' && cluster !== undefined && cluster === incident.nodeId
      ? UPGRADE_CRASHES
      : 0
  // A runtime incident fails a share of the requests of the Node it runs on.
  const runtime =
    incident && incident.nodeId === node.id ? (RUNTIME_INCIDENT_FAILURES[incident.kind] ?? 0) : 0
  // A crash fails what the process holds: Node.js and Zig lose the whole process, Rust one task.
  const blast = BLAST_FACTOR[LANGUAGES[RUNTIMES[node.runtime].language].blast]
  return Math.min(
    1,
    (deploy + upgrade + runtime + (buggy(game, node) ? MIGRATION_BUGS : 0)) * blast,
  )
}

/** What `outcome` may ask: this Node's own hop, and what its calls get back. */
export type Answer = Readonly<{
  game: Game
  pass: Pass
  ownHop: (kind: Kind, value?: number) => Hop
  /** What one request of `kind` sent on from this Node gets back. */
  downstream: (kind: Kind, extraHop?: number) => Outcome
  delegates: boolean
  runsLocalDb: boolean
  offloads: boolean
}>

export type ComponentRule = Readonly<{
  model: (solver: Solver, node: GameNode, arriving: Rates) => Model
  serve: (serve: Serve, node: GameNode, rates: Rates, share: number) => void
  outcome: (answer: Answer, node: GameNode, kind: Kind) => Outcome
  /** Database connections it holds to each data Node it calls, given what reaches it. */
  connections: (solver: Solver, node: GameNode, model: Model | undefined, inbound: number) => number
  /** The work a Load Balancer weighs it by, or null to use its flat capacity. */
  probe: (game: Game) => Rates | null
}>

/* ---------- shared pieces ---------- */

/** Requests per second of a flat Component at its size. */
export const flatCapacity = (node: GameNode): number =>
  (FLAT_CAPACITY[node.type] ?? 0) * flatScale(node)

/** Each kind it processed, at its processed rate. */
const each = (rates: Rates, share: number, apply: (kind: Kind, processed: number) => void) => {
  for (const kind of Object.keys(rates) as Array<Kind>) {
    const processed = (rates[kind] ?? 0) * share
    if (processed > 0) apply(kind, processed)
  }
}

/** Sends everything it processed on, unchanged. */
const passOn = (serve: Serve, _: GameNode, rates: Rates, share: number) =>
  each(rates, share, (kind, processed) => serve.route(kind, processed))

const nothing = () => {}
const noConnections = () => 0
const noProbe = () => null

/** Its own hop, then what it sends on. */
const relay = (answer: Answer, _: GameNode, kind: Kind): Outcome =>
  through(answer.ownHop(kind), [[answer.downstream(kind), 1]])

const unlimited =
  (fixedMs: number, variableMs: number) => (_: Solver, __: GameNode, arriving: Rates) =>
    flatModel(Number.POSITIVE_INFINITY, arriving, { fixed: fixedMs, variable: variableMs }, 1)

const flat =
  (service: Readonly<{ fixed: number; variable: number }>, capacity = flatCapacity) =>
  (solver: Solver, node: GameNode, arriving: Rates) =>
    flatModel(capacity(node), arriving, service, solver.boost(node))

/* ---------- the Cache ---------- */

/**
 * The strategy a Cache runs (07 "Strategies"). The three that change the write path need their
 * research; without it the Cache is cache-aside.
 */
export const cacheStrategyOf = (game: Game, node: GameNode) =>
  has(game, 'cache-strategies') ? CACHE_STRATEGIES[node.cacheStrategy] : CACHE_STRATEGIES.aside

/** Redis answers on one main thread; Memcached on every core of its box. */
const cacheCapacity = (node: GameNode): number =>
  CACHE_OPS * (CACHE_ENGINES[node.engine].scales ? Math.max(1, grown(1, 2, node.size - 3)) : 1)

/** The TTL class a Cache's TTL falls in. */
export const cacheTtlOf = (ttl: number) =>
  ttl <= 10 ? CACHE_TTLS[0] : ttl < 3_600 ? CACHE_TTLS[1] : CACHE_TTLS[2]

/**
 * The share of reads a Cache's TTL keeps as hits (07 "TTL", "Stampedes"). Probabilistic early
 * expiration refreshes a key a little before it expires, so half the hits a short TTL loses stay;
 * stale-while-revalidate serves the old value while one request refreshes it, so none are lost.
 */
export const ttlFactorOf = (game: Game, node: GameNode): number => {
  const factor = cacheTtlOf(node.ttl).factor
  if (!has(game, 'stampede-protection')) return factor
  if (node.swr) return 1
  return node.earlyExpiry ? factor + (1 - factor) * EARLY_LIFT : factor
}

/** A Search Engine's refresh interval: how fresh its answers are and what indexing costs. */
export const refreshOf = (node: GameNode) =>
  SEARCH_REFRESH.find((entry) => entry.seconds === node.refresh) ??
  (SEARCH_REFRESH[0] as (typeof SEARCH_REFRESH)[number])

/** Share of read queries a Cache answers: sqrt(memory / hot data) × TTL × invalidation × warmth. */
/**
 * Share of a Cache's refills that push an older key out: 0 while the hot data fits its memory,
 * and the share that does not fit once it does not (07 \"Cache\").
 */
export const evictionShareOf = (game: Game, node: GameNode): number => {
  const hot = (game.users * HOT_KB_PER_USER) / 1_000_000
  return hot > 0 ? Math.max(0, 1 - Math.min(1, flatScale(node) / hot)) : 0
}

export const hitRatioOf = (game: Game, node: GameNode, writeShare: number): number => {
  const memory = flatScale(node)
  const hot = (game.users * HOT_KB_PER_USER) / 1_000_000
  const fits = hot > 0 ? Math.min(1, memory / hot) : 1
  return (
    Math.sqrt(fits) *
    ttlFactorOf(game, node) *
    (1 - Math.min(0.5, 2 * writeShare)) *
    warmOf(node.life)
  )
}

/** A CDN's hit ratio for a kind at its TTL. Tiered caching lifts video, and an Edge Function's
 * key-value cache lifts `read` (05 "CDN": 0% to 30% with Edge compute). */
export const cdnHitOf = (node: GameNode, kind: Kind, game?: Game): number => {
  const ttl = CDN_TTLS.find((entry) => entry.ttl === node.ttl) ?? CDN_TTLS[1]
  const base =
    kind === 'media' && game && has(game, 'tiered-caching')
      ? TIERED_MEDIA_HIT
      : kind === 'read' && game && hasEdge(game)
        ? EDGE_READ_HIT
        : // Edge-side includes cache the shell of a logged-in page, which the base rate leaves out.
          kind === 'page' && game && has(game, 'esi')
          ? (CDN_HIT.page ?? 0) + ESI_PAGE_HIT
          : (CDN_HIT[kind] ?? 0)
  // A key that leaves out the query string or the cookie shares more pages, and a cache that a
  // purge emptied fills again as it warms (05 "CDN").
  const hit = base * ttl.factor * CACHE_KEYS[node.cacheKey].hit * warmOf(node.life)
  // Incremental static regeneration makes a share of the pages the origin renders static, so the
  // CDN can answer them too (06 "Frameworks": Next.js).
  const regenerated = kind === 'page' && game ? staticPagesOf(game) : 0
  return Math.min(0.95, hit + (1 - hit) * regenerated * ttl.factor * warmOf(node.life))
}

/** The share of `page` requests a Next.js App Server renders statically, so a CDN can cache them. */
export const staticPagesOf = (game: Game): number =>
  game.nodes.reduce(
    (best, node) =>
      node.type === 'server' && !isDown(node)
        ? Math.max(best, FRAMEWORKS[node.framework].cacheable ?? 0)
        : best,
    0,
  )

/* ---------- the Edge Function ---------- */

/** Whether the Service's Stack runs at the edge: JavaScript, TypeScript, or Rust or Go to WASM. */
export const edgeRuns = (node: GameNode): boolean =>
  EDGE_LANGUAGES.includes(RUNTIMES[node.runtime].language)

/**
 * Whether one request of a kind fits the Edge Function's CPU ceiling (05 "Edge Function"): past
 * it the handler is killed, so CPU-heavy kinds fail as `timeout`. A login whose hash an Auth
 * Provider takes is a thin call and fits.
 */
export const edgeFits = (game: Game, node: GameNode, kind: Kind, delegated = false): boolean =>
  !isBackendKind(kind) && requestCpuMs(game, node, kind, delegated) <= EDGE_CPU_MS

/** A WAF's paranoia level, or Under attack mode. Bot management halves its false positives. */
export const wafOf = (node: GameNode, game?: Game) => {
  const level =
    PARANOIA[Math.max(0, Math.min(PARANOIA.length - 1, node.paranoia - 1))] ?? PARANOIA[1]
  const challenged = game !== undefined && has(game, 'bot-management')
  const soften = (rate: number): number => (challenged ? rate * BOT_MANAGEMENT_FALSE : rate)
  return node.underAttack
    ? {
        block: UNDER_ATTACK.block,
        falsePositive: soften(UNDER_ATTACK.falsePositive),
        cpu: UNDER_ATTACK.cpu,
      }
    : {
        block: level.block,
        falsePositive: soften(level.falsePositive),
        cpu: level.cpu,
      }
}

/* ---------- the API Gateway ---------- */

/** Requests per second a Gateway lets through: its rate limit, or every request when it is 0. */
export const gatewayLimitOf = (node: GameNode): number =>
  node.rateLimit > 0 ? node.rateLimit : Number.POSITIVE_INFINITY

/**
 * Share of its arrivals a Gateway's rate limit lets through; the rest fails as throttled. With
 * Rate limiting the cap becomes a token bucket: the limit refills over a Step and the bucket holds
 * `node.burst` more, so a burst that fits the bucket passes whole while the average still holds.
 */
export const gatewayShare = (node: GameNode, arriving: Rates, dt = STEP_SECONDS): number => {
  let total = 0
  for (const kind of Object.keys(arriving) as Array<Kind>) total += arriving[kind] ?? 0
  const limit = gatewayLimitOf(node)
  if (total <= 0 || limit === Number.POSITIVE_INFINITY) return 1
  const allowed = limit * dt + Math.max(0, node.burst)
  const asked = total * dt
  return allowed < asked ? allowed / asked : 1
}

/**
 * Share of a read kind's requests a Gateway merges into one already in flight (05 "Request
 * coalescing"): the popular reads that overlap, which grows with the rate.
 */
const merged = (node: GameNode, kind: Kind, rate: number): number => {
  if (!node.merge || !COALESCE_KINDS.includes(kind as RequestKind)) return 0
  const overlap = rate * COALESCE_WINDOW
  return (COALESCE_HOT * overlap) / (1 + overlap)
}

/* ---------- the Realtime Hub ---------- */

/**
 * Connections a Hub holds at its size: the RAM it gives them over what one costs its runtime
 * (06 "Realtime connections"). A runtime that holds a worker or a thread per connection holds
 * none, and without Clustering only one box takes connections, so the larger sizes add Burn and
 * no room.
 */
export const hubConnections = (node: GameNode, builtIn = false): number => {
  const perConnection = RUNTIMES[node.runtime].connectionKB
  if (perConnection === null) return 0
  return (HUB_RAM_KB * (node.clustering || builtIn ? flatScale(node) : 1)) / perConnection
}

/** Realtime messages a second a Hub holds: a message keeps its connection open for the hold time. */
export const hubRate = (node: GameNode, builtIn = false): number =>
  (hubConnections(node, builtIn) / RT_HOLD_SECONDS) * (node.presence ? 1 - PRESENCE_CPU : 1)

/**
 * The ML ecosystem bonus (06 "ML ecosystem"): a Python service runs small models in process, so
 * an `ai` request whose answer uses a Vector Index earns 20% more. PyPy cannot use it, because
 * the C extensions it needs are not ready. The index has to be in the path: without one, the
 * prompt has no documents of the company's own behind it and no small model to embed them.
 */
export const mlValueOf = (node: GameNode, kind: RequestKind, retrieved: boolean): number =>
  kind === 'ai' &&
  retrieved &&
  RUNTIMES[node.runtime].language === 'python' &&
  node.runtime !== 'pypy'
    ? ML_AI_BONUS
    : 1

/**
 * What an `ai` request earns (07 "Vector Index"): the ML ecosystem bonus when a Vector Index is
 * in the path, on top of the lift the retrieved documents add. An approximate index takes its
 * recall's share of the lift, because a lookup that misses a neighbour quotes the wrong document.
 */
export const aiValueOf = (game: Game, node: GameNode, kind: RequestKind): number => {
  if (kind !== 'ai') return 1
  const vec = vecOf(game, node)
  const lift = vec ? 1 + (VEC_AI_LIFT - 1) * VEC_INDEXES[vec.indexType].recall : 1
  return lift * mlValueOf(node, kind, vec !== undefined)
}

/**
 * Distributed Erlang gives an Elixir Hub its own cluster backbone, so it takes connections on
 * every box without the Clustering option (06 "Elixir", "Realtime connections").
 */
export const distributedErlang = (game: Game, node: GameNode): boolean =>
  has(game, 'distributed-erlang') && RUNTIMES[node.runtime].language === 'elixir'

/* ---------- code that runs the Service's Stack ---------- */

/**
 * What a Node that runs the Service's code sends on for the work it processed: one backend call
 * for every call the request kind makes. An App Server, a Worker and a function all answer with it.
 */
const serveCalls: ComponentRule['serve'] = (serve, node, rates, share) => {
  const { solver } = serve
  if (solver.runsLocalDb(node)) return
  const delegated = solver.delegates(node)
  const offloaded = solver.offloads(node)
  each(rates, share, (kind, processed) => {
    const calls = callsOf(solver.game, node, kind as RequestKind, delegated, offloaded)
    for (const backend of BACKEND_KINDS) serve.route(backend, processed * (calls[backend] ?? 0))
  })
}

/**
 * What one request of a kind gets back from a Node that runs the Service's code: its own hop, the
 * calls it makes, the code's own failures, and the bytes the response sends to the user.
 */
const answerCalls: ComponentRule['outcome'] = (answer, node, kind) => {
  const { game } = answer
  const requestKind = kind as RequestKind
  const served = answer.ownHop(
    kind,
    (FRAMEWORKS[node.framework].value[requestKind] ?? 1) * aiValueOf(game, node, requestKind),
  )
  // The response crosses the user's downlink: bytes over bandwidth.
  const own = {
    ...served,
    fixed:
      served.fixed +
      transferMs(node, requestKind, answer.offloads) * payloadFactor(game, requestKind),
  }
  const crashes = codeCrashes(game, node, kind)
  // A runtime that holds a worker per open connection cannot keep realtime connections.
  if (requestKind === 'rt' && RUNTIMES[node.runtime].connectionKB === null) return failed('refused')
  if (answer.runsLocalDb) return failSome(through(own), crashes, 'crash')
  const calls = callsOf(game, node, requestKind, answer.delegates, answer.offloads)
  const hop = hopMs(game)
  // Read-your-writes routing sends a checkout's read, and most reads after a write, to the primary.
  const ryw = node.ryw && has(game, 'ryw-routing')
  const fresh = (backend: Kind, outcome: Outcome): Outcome =>
    ryw && backend === 'q-read' && outcome.stale > 0
      ? { ...outcome, stale: requestKind === 'buy' ? 0 : outcome.stale * RYW_STALE }
      : outcome
  // A call to a Queue returns once the task is enqueued: what happens after is async.
  // A stale read fails an API read, and a checkout that reads its own write.
  const relayed = failSome(
    through(
      own,
      BACKEND_KINDS.flatMap((backend, index) =>
        index < 3 || (calls[backend] ?? 0) > 0
          ? [[fresh(backend, answer.downstream(backend, hop)), calls[backend] ?? 0] as const]
          : [],
      ),
      // A stale read fails an API read, a checkout that reads its own write, and a search.
      requestKind === 'read' || requestKind === 'buy' || requestKind === 'search',
    ),
    crashes,
    'crash',
  )
  // A path with a smaller MTU drops an upload larger than it: the request times out.
  return game.incident?.kind === 'mtu' && requestKind === 'upload'
    ? failSome(relayed, MTU_LOSS, 'timeout')
    : relayed
}

/* ---------- the table ---------- */

const terminal: Pick<ComponentRule, 'serve' | 'connections' | 'probe'> = {
  serve: nothing,
  connections: noConnections,
  probe: noProbe,
}

/**
 * The work a Document Store's arrivals make, in ops: a read or a write is one document, and a
 * join — a checkout across documents, or a report scanning the collection — is three (07
 * "Document Store": "`report` and `q-tx` across documents cost 3×").
 */
const docWork = (arriving: Rates): Readonly<{ rate: number; ops: number }> => {
  let rate = 0
  let ops = 0
  for (const kind of Object.keys(arriving) as Array<Kind>) {
    const each = arriving[kind] ?? 0
    rate += each
    ops += each * (kind === 'q-tx' || kind === 'q-scan' ? DOC_JOIN_COST : 1)
  }
  return { rate, ops }
}

export const RULES: Record<ComponentId, ComponentRule> = {
  users: {
    model: unlimited(30, 0),
    serve: passOn,
    // An expired certificate: every browser refuses the site until it is renewed.
    outcome: (answer, node, kind) =>
      (answer.game.incident?.kind === 'certificate' && certNodes(answer.game).length === 0) ||
      answer.game.incident?.kind === 'bgp'
        ? failed('down')
        : relay(answer, node, kind),
    connections: noConnections,
    probe: noProbe,
  },
  dns: {
    model: unlimited(0, 0),
    serve: passOn,
    outcome: relay,
    connections: noConnections,
    probe: noProbe,
  },
  lb: {
    model: (solver, node, arriving) =>
      flatModel(
        flatCapacity(node) *
          (node.variant === 'l4' ? L4_CAPACITY : 1) *
          (node.policy === 'p2c' && has(solver.game, 'lb-algorithms') ? P2C_CAPACITY : 1),
        arriving,
        // An L4 forwards TCP: no HTTP parsing, so a fifth of the hop (05 "Load Balancer").
        { fixed: node.variant === 'l4' ? L4_MS : 1, variable: 0.1 },
        solver.boost(node),
      ),
    serve: passOn,
    outcome: relay,
    connections: noConnections,
    probe: noProbe,
  },
  server: {
    model: (solver, node, arriving) =>
      serverModel({
        game: solver.game,
        node,
        arriving,
        callLatency: solver.callLatency(node),
        delegated: solver.delegates(node),
        local: solver.runsLocalDb(node),
        inflight: solver.inflight(node),
        boost: solver.boost(node),
        sampling: solver.sampling(node),
        hashing: solver.game.incident?.kind === 'loop' ? 4 : 1,
        offloaded: solver.offloads(node),
        pod: inCluster(solver.game, node),
        mesh: meshOf(solver.game, node),
      }),
    serve: serveCalls,
    outcome: answerCalls,
    // Every app process holds its own pool to each database it reaches.
    connections: (solver, node, model) => {
      if (solver.runsLocalDb(node)) return 0
      const surge = solver.game.incident?.kind === 'connections' ? 2 : 1
      return (model?.processes ?? 0) * RUNTIMES[node.runtime].connections * surge
    },
    probe: (game) => {
      const mix = mixOf(game)
      return Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, mix[kind] ?? 0]))
    },
  },
  database: {
    model: (solver, node, arriving) =>
      databaseModel({ game: solver.game, node, arriving, boost: solver.boost(node) }),
    outcome: (answer, node, kind) => {
      // A full disk: Postgres cannot extend a file, so every write fails.
      if (
        answer.game.incident?.kind === 'disk-full' &&
        answer.game.incident.nodeId === node.id &&
        (kind === 'q-write' || kind === 'q-tx' || kind === 'blob-put')
      )
        return failed('refused')
      // A migration holds the table's lock while it copies it: writes queue and time out
      // (11 "Schema migration lock").
      if (
        answer.game.incident?.kind === 'migration-lock' &&
        answer.game.incident.nodeId === node.id &&
        (kind === 'q-write' || kind === 'q-tx')
      )
        return failed('timeout')
      // A deleted table: every read and write that needs it fails until a restore (11).
      if (
        answer.game.incident?.kind === 'accidental-delete' &&
        answer.game.incident.nodeId === node.id &&
        (kind === 'q-read' || kind === 'q-write' || kind === 'q-tx')
      )
        return failed('refused')
      // A synchronous replica that is down stalls every write the primary takes, because each one
      // waits for it (07 "Read Replica").
      if (
        node.type === 'database' &&
        (kind === 'q-write' || kind === 'q-tx') &&
        syncStalled(answer.game)
      )
        return failed('timeout')
      const pool = answer.pass.connections[slotOf(answer.pass, node)]
      const refused = pool && pool.used > pool.max ? 1 - pool.max / pool.used : 0
      // A report read from a materialized view is as fresh as its last refresh (10 "Performance").
      const staleScan =
        kind === 'q-scan' && node.materialized && has(answer.game, 'precompute')
          ? MATERIALIZED_STALE
          : 0
      const reply: Outcome = {
        ...answered(0, 0),
        success: 1 - refused,
        stale: Math.max(
          node.type === 'replica' && kind === 'q-read' && !node.sync ? answer.pass.staleShare : 0,
          staleScan,
        ),
        fail: { ...NO_FAILURES, refused },
      }
      const own = through(answer.ownHop(kind), [[reply, 1]])
      // A transaction across shards commits on each of them, and any one can fail (07 "Partitioning").
      return kind === 'q-tx' ? failSome(own, shardingOf(node).failure, 'timeout') : own
    },
    ...terminal,
    probe: () => ({ 'q-read': 1 }),
  },
  // A Read Replica runs the Database's model and answers only reads.
  replica: {
    model: (solver, node, arriving) =>
      databaseModel({ game: solver.game, node, arriving, boost: solver.boost(node) }),
    outcome: (answer, node, kind) => RULES.database.outcome(answer, node, kind),
    ...terminal,
    probe: () => ({ 'q-read': 1 }),
  },
  pooler: {
    model: flat({ fixed: 0.3, variable: 0 }),
    serve: passOn,
    // Transaction pooling breaks code that keeps session state, until a task removes it. Statement
    // pooling shares the fewest server connections of all, and cannot run a multi-statement
    // transaction: a checkout through it fails.
    outcome: (answer, node, kind) =>
      node.mode === 'statement' && kind === 'q-tx'
        ? failed('refused')
        : failSome(
            relay(answer, node, kind),
            node.mode !== 'session' && !fixed(answer.game, 'session-state')
              ? SESSION_STATE_CRASHES
              : 0,
            'crash',
          ),
    // Session mode holds a server connection per client; transaction and statement modes share a few.
    connections: (_, node, __, inbound) =>
      node.mode === 'session' ? inbound : Math.min(POOLER_CONNECTIONS, inbound),
    probe: noProbe,
  },
  cache: {
    model: (solver, node, arriving) =>
      flatModel(
        cacheCapacity(node) / hotKeyFactor(solver.game, node),
        arriving,
        { fixed: 0.5, variable: 0.2 },
        solver.boost(node),
      ),
    serve: (serve, node, rates, share) => {
      const reads = rates['q-read'] ?? 0
      const writes = rates['q-write'] ?? 0
      const writeShare = reads + writes > 0 ? writes / (reads + writes) : 0
      const { game } = serve.solver
      const strategy = cacheStrategyOf(game, node)
      const hit = hitRatioOf(game, node, writeShare)
      // A write-behind Cache keeps its own copy fresh but the Database lags; cache-aside's race
      // stores old data now and then; write-through has nothing stale behind it. A stale-read
      // incident is an invalidation bug on top: the Cache keeps serving old rows (07 "TTL").
      const surge = game.incident?.kind === 'stale-read' && game.incident.nodeId === node.id
      // Stale-while-revalidate answers the reads an expired key would have missed from the old value.
      const revalidating =
        node.swr && has(game, 'stampede-protection') ? 1 - cacheTtlOf(node.ttl).factor : 0
      serve.setHits(
        hit,
        Math.min(
          1,
          cacheTtlOf(node.ttl).stale * writeShare * strategy.stale * (surge ? STALE_SURGE : 1) +
            revalidating,
        ),
      )
      // Stampede protection: misses only a cold Cache has wait on one fetch per key.
      const warmHit = hitRatioOf(game, { ...node, life: RUNNING }, writeShare)
      const early = node.earlyExpiry && has(game, 'stampede-protection') ? hit * EARLY_REFRESH : 0
      const sent =
        (node.coalesce && has(game, 'stampede-protection')
          ? 1 - warmHit + (warmHit - hit) * COALESCED
          : 1 - hit) + early
      each(rates, share, (kind, processed) => {
        if (kind === 'q-read') return serve.route(kind, processed * sent)
        // Write-behind answers the write here and flushes only its share to the Database.
        if (kind === 'q-write' && strategy.write === 'ahead')
          return serve.route(kind, processed * strategy.flush)
        serve.route(kind, processed)
      })
    },
    outcome: (answer, node, kind) => {
      const strategy = cacheStrategyOf(answer.game, node)
      // Write-through pays one more cache write; write-behind answers before the Database sees it.
      if (kind === 'q-write' && strategy.write === 'through') {
        const own = answer.ownHop(kind)
        return through({ ...own, fixed: own.fixed + strategy.writeMs }, [
          [answer.downstream(kind, hopMs(answer.game)), 1],
        ])
      }
      if (kind === 'q-write' && strategy.write === 'ahead') return through(answer.ownHop(kind))
      if (kind !== 'q-read') return relay(answer, node, kind)
      const hit = answer.pass.hits[slotOf(answer.pass, node)] ?? 0
      const mixed = blend([
        [{ ...answered(0, 0), stale: answer.pass.staleHits[slotOf(answer.pass, node)] ?? 0 }, hit],
        [answer.downstream(kind, hopMs(answer.game) + strategy.loadMs), 1 - hit],
      ])
      return through(answer.ownHop(kind), mixed ? [[mixed, 1]] : [])
    },
    // A Cache in front of the Database passes its callers' connections through.
    connections: (_, __, ___, inbound) => inbound,
    probe: noProbe,
  },
  auth: {
    model: unlimited(120, 15),
    outcome: (answer, _, kind) => through(answer.ownHop(kind)),
    ...terminal,
  },
  analytics: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  payments: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  search: {
    model: (solver, node, arriving) => {
      const variant = SEARCH_VARIANTS[node.searchVariant]
      // Shards parallelize the index and fan every query out; replicas add query capacity; the heap
      // trades garbage collection pauses against the file system cache (07 "Search Engine").
      const shards = variant.jvm ? node.searchShards : 1
      const heap = variant.jvm ? SEARCH_HEAPS[node.heap] : SEARCH_HEAPS.half
      const capacity =
        (SEARCH_QPS *
          flatScale(node) *
          refreshOf(node).capacity *
          variant.capacity *
          (shards / (1 + SEARCH_FANOUT * (shards - 1))) *
          (1 + (variant.jvm ? node.searchReplicas : 0)) *
          heap.capacity) /
        queryFactor(solver.game, 'q-search')
      return {
        ...flatModel(
          capacity,
          arriving,
          { fixed: variant.fixedMs, variable: 2 },
          solver.boost(node),
        ),
        tailP: heap.tailP,
        tailMs: heap.tailMs,
      }
    },
    // A slower refresh saves indexing CPU and answers staler: a new document waits to be seen. On
    // top of that, the app's dual write loses now and then: without a Transactional outbox or a CDC
    // Connector, a write's publish can fail and the index keeps the old document (07 "Keeping
    // copies in sync"). The design counts that divergence as stale search results.
    outcome: (answer, node, kind) => {
      const own = through(answer.ownHop(kind))
      if (kind !== 'q-search') return own
      const carried =
        has(answer.game, 'outbox') || answer.game.nodes.some((entry) => entry.type === 'cdc')
      // The copies can only diverge once the app writes to several of them: Series B (07).
      const diverged = carried || answer.game.stage < 4 ? 0 : DUAL_WRITE_STALE
      // Meilisearch's relevance falls as the index grows: its answers drift from what was asked.
      const variant = SEARCH_VARIANTS[node.searchVariant]
      const relevance = Math.min(variant.cap, answer.game.users * variant.relevance)
      return { ...own, stale: Math.max(refreshOf(node).stale, diverged, relevance) }
    },
    ...terminal,
  },
  // Archive-class objects must be restored before they can be read, so a `media` request for one
  // fails as `timeout` (07 "Object Storage").
  storage: {
    // R2 answers a little later than S3 outside its own CDN: a CDN on the board takes the first
    // byte (07 "Object Storage").
    model: (solver, node, arriving) =>
      flatModel(
        Number.POSITIVE_INFINITY,
        arriving,
        {
          fixed:
            40 +
            (node.storeVariant === 'r2' && !solver.game.nodes.some((entry) => entry.type === 'cdn')
              ? R2_FIRST_BYTE_MS
              : 0),
          variable: 5,
        },
        1,
      ),
    // A read of an archived object waits hours for its restore, so it fails as a timeout. Lifecycle
    // rules put the oldest share of the store in Archive, and that share of reads fails with it.
    outcome: (answer, node, kind) => {
      if (kind !== 'blob-get') return through(answer.ownHop(kind))
      const bands = storageBands(answer.game, node)
      const all = bands.reduce((sum, band) => sum + band.gb, 0)
      const archived = bands.reduce((sum, band) => sum + (band.archived ? band.gb : 0), 0)
      const share = all > 0 ? archived / all : STORAGE_CLASSES[node.storageClass].archived ? 1 : 0
      return failSome(through(answer.ownHop(kind)), share, 'timeout')
    },
    ...terminal,
  },
  // It answers reads and writes on documents: one flat rate of ops, a join at three of them, no
  // connections to pool, and no schema to migrate (07 "Document Store").
  doc: {
    model: (solver, node, arriving) => {
      const { rate, ops } = docWork(arriving)
      const perOp = rate > 0 ? ops / rate : 1
      const capacity = (DOC_OPS * flatScale(node)) / hotKeyFactor(solver.game, node) / perOp
      const model = flatModel(
        capacity,
        arriving,
        { fixed: 3, variable: DOC_OP_MS },
        solver.boost(node),
      )
      // A join makes the store touch three documents, and a transaction makes the write wait for
      // every one of them: the latency grows with the ops it costs, not only with the queue.
      const wait = (model.service['q-read']?.variable ?? DOC_OP_MS) - DOC_OP_MS
      const service: Record<string, { fixed: number; variable: number }> = {}
      for (const kind of Object.keys(arriving)) {
        const join = kind === 'q-tx' || kind === 'q-scan' ? DOC_JOIN_COST : 1
        const slower =
          node.transactions && (kind === 'q-write' || kind === 'q-tx') ? 1 + DOC_TXN_LATENCY : 1
        service[kind] = { fixed: 3, variable: DOC_OP_MS * join * slower + wait }
      }
      return { ...model, service }
    },
    // It takes every document op and sends nothing on: there is no database behind it.
    serve: nothing,
    outcome: (answer, node, kind) => {
      const reply = through(answer.ownHop(kind))
      // No joins: a checkout spreads over several documents, and without multi-document
      // transactions it can land half-applied, so the retry charges again (07 "Document Store").
      return kind === 'q-tx' && !node.transactions
        ? failSome(reply, DOC_PARTIAL, 'duplicate')
        : reply
    },
    // It has no connection limit to exhaust: an App Server opens none it has to pool.
    connections: noConnections,
    probe: () => ({ 'q-read': 1 }),
  },
  queue: {
    model: flat({ fixed: 2, variable: 0.05 }, (node) => QUEUE_RATE * flatScale(node)),
    // It offers its Workers what arrived, plus a share of its backlog as far as they have room.
    serve: (serve, node, rates, share) => {
      if (share <= 0) return
      const arrived = (rates.task ?? 0) * share
      const room = Math.max(0, serve.solver.drainable(node) - arrived)
      serve.route('task', arrived + Math.min(node.depth / DRAIN_SECONDS, room))
    },
    // The caller waits for the enqueue only. A long backlog slows the broker.
    outcome: (answer, node, kind) => {
      const own = answer.ownHop(kind)
      // With no Worker linked, the task has nowhere to go.
      if (answer.downstream(kind).fail.stranded >= 1) return failed('stranded')
      const enqueued = through({ ...own, fixed: own.fixed + BACKLOG_MS * node.depth })
      // A full Queue refuses what its Workers cannot take (RabbitMQ `reject-publish`).
      if (node.maxLength <= 0 || node.depth < node.maxLength) return enqueued
      const slot = slotOf(answer.pass, node)
      const inflow = answer.pass.arriving[slot]?.task ?? 0
      const drained = answer.pass.drained[slot] ?? 0
      return inflow > 0
        ? failSome(enqueued, Math.max(0, 1 - drained / inflow), 'dropped')
        : enqueued
    },
    connections: noConnections,
    probe: noProbe,
  },
  // A log, not a queue (07 "Event Stream"): it appends what producers send, and its consumers
  // read one partition each at their own pace, so they lag behind and the messages stay.
  log: {
    model: (solver, node, arriving) =>
      flatModel(
        (LOG_RATE * flatScale(node)) / hotKeyFactor(solver.game, node),
        arriving,
        { fixed: LOG_ACKS[node.acks].latency * 5, variable: 0.1 },
        solver.boost(node),
      ),
    // It offers its consumers what arrived plus a share of its lag, and no faster than one
    // consumer per partition can read (07 "Event Stream": "A consumer group can use at most one
    // consumer per partition").
    serve: (serve, node, rates, share) => {
      if (share <= 0) return
      const arrived = (rates.task ?? 0) * share
      const room = Math.max(0, serve.solver.drainable(node) - arrived)
      const read = LOG_READ_RATE * Math.max(1, Math.floor(node.partitions))
      serve.route('task', Math.min(arrived + Math.min(node.depth / DRAIN_SECONDS, room), read))
    },
    // The producer waits for its append only. A consumer further behind than the retention window
    // loses the oldest events, and one that reads unkeyed events sees them out of order.
    outcome: (answer, node, kind) => {
      const own = answer.ownHop(kind)
      // With no Worker linked, nothing consumes the stream.
      if (answer.downstream(kind).fail.stranded >= 1) return failed('stranded')
      const appended = through({ ...own, fixed: own.fixed + BACKLOG_MS * node.depth })
      const slot = slotOf(answer.pass, node)
      const inflow = answer.pass.arriving[slot]?.task ?? 0
      // How far behind the producer its consumers are, in seconds of arriving work.
      const lag = inflow > 0 ? node.depth / inflow : 0
      const expired = lag > node.retain && lag > 0 ? 1 - node.retain / lag : 0
      // Order holds only inside a partition, so an unkeyed stream spreads one entity's events and
      // they apply out of order: the value a consumer writes is the older one.
      const unordered = node.keyed ? 0 : 1 - 1 / Math.max(1, Math.floor(node.partitions))
      return failSome(failSome(appended, expired, 'dropped'), unordered, 'stale')
    },
    connections: noConnections,
    probe: noProbe,
  },
  worker: {
    // Each task costs the async part of the kind it came from, once per attempt. A poison
    // message eats most of its time.
    model: (solver, node, arriving) => {
      const tasks =
        ((arriving.task ?? 0) * solver.attempts(node)) /
        (solver.poisoned(node) ? 1 - POISON_SHARE : 1)
      const mix = solver.taskMix(node)
      const work: Partial<Record<RequestKind, number>> = {}
      for (const kind of Object.keys(mix) as Array<RequestKind>)
        work[kind] = tasks * (mix[kind] ?? 0)
      return serverModel({
        game: solver.game,
        node,
        arriving: work,
        callLatency: solver.callLatency(node),
        delegated: false,
        local: false,
        inflight: solver.inflight(node),
        boost: solver.boost(node),
        sampling: solver.sampling(node),
        hashing: 1,
        worker: true,
        pod: inCluster(solver.game, node),
        mesh: meshOf(solver.game, node),
      })
    },
    // It sends the async part's calls, once per attempt: an export's 50 reads.
    serve: (serve, node, rates, share) => {
      const tasks = (rates.task ?? 0) * share * serve.solver.attempts(node)
      if (tasks <= 0) return
      const mix = serve.solver.taskMix(node)
      for (const kind of Object.keys(mix) as Array<RequestKind>) {
        const calls = asyncCallsOf(serve.solver.game, kind)
        for (const backend of BACKEND_KINDS)
          serve.route(backend, tasks * (mix[kind] ?? 0) * (calls[backend] ?? 0))
      }
    },
    // One attempt: its own time, its calls, and the code's own failures. Users never wait for it.
    outcome: (answer, node, kind) => {
      const { game } = answer
      const mix = mixIn(answer.pass, node) ?? taskMixOf(game)
      const calls: Partial<Record<Kind, number>> = {}
      for (const origin of Object.keys(mix) as Array<RequestKind>) {
        const each = asyncCallsOf(game, origin)
        for (const backend of BACKEND_KINDS)
          calls[backend] = (calls[backend] ?? 0) + (mix[origin] ?? 0) * (each[backend] ?? 0)
      }
      const hop = hopMs(game)
      return failSome(
        through(
          answer.ownHop(kind),
          BACKEND_KINDS.flatMap((backend) =>
            (calls[backend] ?? 0) > 0
              ? [[answer.downstream(backend, hop), calls[backend] ?? 0] as const]
              : [],
          ),
        ),
        codeCrashes(game, node, kind, Object.keys(mix) as Array<Kind>),
        'crash',
      )
    },
    // A Worker holds a pool to each database it reads, like an App Server.
    connections: (_, node, model) => (model?.processes ?? 0) * RUNTIMES[node.runtime].connections,
    probe: noProbe,
  },
  // It runs the Service's code with no box: one execution per in-flight request up to the
  // concurrency cap, and a bill for each use (05 "Serverless Function").
  fn: {
    model: (solver, node, arriving) =>
      serverlessModel({
        game: solver.game,
        node,
        arriving,
        callLatency: solver.callLatency(node),
        delegated: solver.delegates(node),
        sampling: solver.sampling(node),
        hashing: solver.game.incident?.kind === 'loop' ? 4 : 1,
        boost: solver.boost(node),
      }),
    serve: serveCalls,
    outcome: (answer, node, kind) => {
      const own = answerCalls(answer, node, kind)
      if (kind !== 'job') return own
      // An export runs as long as the rows it reads take; past 15 minutes the function is killed.
      const ms = answer.game.data * EXPORT_MS_PER_GB
      if (ms > FUNCTION_LIMIT_MS) return failed('timeout')
      return through({ ...hop({ fixed: ms }) }, [[own, 1]])
    },
    // Each concurrent execution opens its own connections: a spike exhausts the Database's pool.
    connections: (_, node, model) => (model?.processes ?? 0) * RUNTIMES[node.runtime].connections,
    // An LB weighs it by the Era's mix, as it weighs an App Server.
    probe: (game) => {
      const mix = mixOf(game)
      return Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, mix[kind] ?? 0]))
    },
  },
  cdn: {
    model: unlimited(8, 0),
    serve: (serve, node, rates, share) => {
      const { game } = serve.solver
      serve.setHits(cdnHitOf(node, 'page', game), 0)
      each(rates, share, (kind, processed) =>
        serve.route(kind, processed * (1 - cdnHitOf(node, kind, game))),
      )
    },
    // A hit is answered at the edge; a miss goes on to the origin.
    outcome: (answer, node, kind) => {
      const hit = cdnHitOf(node, kind, answer.game)
      if (hit <= 0) return relay(answer, node, kind)
      // Without a purge, pages cached before the deploy are served until their TTL passes.
      const old = kind === 'page' && answer.game.time < node.staleUntil ? STALE_AFTER_DEPLOY : 0
      const mixed = blend([
        [{ ...answered(0, 0), stale: old }, hit],
        [answer.downstream(kind), 1 - hit],
      ])
      return through(answer.ownHop(kind), mixed ? [[mixed, 1]] : [])
    },
    connections: noConnections,
    probe: noProbe,
  },
  waf: {
    model: (solver, node, arriving) =>
      flatModel(
        (flatCapacity(node) / wafOf(node, solver.game).cpu) *
          (solver.game.incident?.kind === 'regex' ? REGEX_CAPACITY : 1),
        arriving,
        { fixed: 2 + (node.underAttack ? UNDER_ATTACK.latency : 0), variable: 0.1 },
        solver.boost(node),
      ),
    // Bots stop here at the block rate; real users at the false positive rate.
    serve: (serve, node, rates, share) => {
      const waf = wafOf(node, serve.solver.game)
      each(rates, share, (kind, processed) =>
        serve.route(kind, processed * (1 - (kind === 'bot' ? waf.block : waf.falsePositive))),
      )
    },
    outcome: (answer, node, kind) =>
      failSome(
        relay(answer, node, kind),
        kind === 'bot' ? wafOf(node, answer.game).block : wafOf(node, answer.game).falsePositive,
        'blocked',
      ),
    connections: noConnections,
    probe: noProbe,
  },
  // A Gateway relays every kind, and past its rate limit it answers throttled instead (05).
  gw: {
    model: (solver, node, arriving) =>
      flatModel(
        flatCapacity(node),
        arriving,
        { fixed: 6 + (node.authEdge ? GATEWAY_AUTH_MS : 0), variable: 0.1 },
        solver.boost(node),
      ),
    serve: (serve, node, rates, share) => {
      const kept = gatewayShare(node, rates)
      each(rates, share, (kind, processed) =>
        serve.route(kind, processed * kept * (1 - merged(node, kind, processed * kept))),
      )
    },
    outcome: (answer, node, kind) =>
      failSome(
        relay(answer, node, kind),
        1 - gatewayShare(node, answer.pass.arriving[slotOf(answer.pass, node)] ?? {}),
        'throttled',
      ),
    connections: noConnections,
    probe: noProbe,
  },
  // A Realtime Hub holds a connection for each realtime message instead of serving it as a
  // request, and sends nothing on (05 "Realtime Hub", 06 "Realtime connections").
  ws: {
    // A runtime that holds a worker per connection holds none: the Hub takes the traffic and
    // refuses it, rather than dividing a box that cannot hold a connection.
    model: (solver, node, arriving) =>
      RUNTIMES[node.runtime].connectionKB === null
        ? flatModel(
            Number.POSITIVE_INFINITY,
            arriving,
            { fixed: 1, variable: 0 },
            solver.boost(node),
          )
        : flatModel(
            hubRate(node, distributedErlang(solver.game, node)),
            arriving,
            { fixed: 1, variable: 0 },
            solver.boost(node),
          ),
    serve: nothing,
    outcome: (answer, node, kind) => {
      // PHP-FPM and Gunicorn sync hold a worker per open connection: they cannot hold any.
      if (RUNTIMES[node.runtime].connectionKB === null) return failed('refused')
      // A Hub that just came back takes the fleet's whole reconnect wave at once. Jittered
      // backoff spreads it over the hold time; without it, the Hub refuses what it cannot take.
      const herd = node.life._tag === 'Warming' && !node.backoff
      // A split cluster loses the messages that cross the cut.
      const incident = answer.game.incident
      const split =
        incident?.kind === 'split-brain' && incident.nodeId === node.id
          ? (RUNTIME_INCIDENT_FAILURES['split-brain'] ?? 0)
          : 0
      return failSome(
        failSome(through(answer.ownHop(kind, node.presence ? PRESENCE_VALUE : 1)), split, 'stale'),
        // A sticky Load Balancer sends each client back to the Hub it had, so a restarted Hub
        // takes only its own half of the wave.
        herd ? HERD_REFUSED * (pinnedOf(answer.game, node) ? STICKY_HERD : 1) : 0,
        'refused',
      )
    },
    connections: noConnections,
    // An LB weighs it by the connections it holds, which depend on its runtime.
    probe: () => ({ rt: 1 }),
  },
  // A Managed Component: 400 ms per charge, and its own outages.
  psp: {
    model: (solver, node, arriving) =>
      flatModel(
        PSP_CAPACITY * flatScale(node),
        arriving,
        {
          fixed: 400,
          variable: 30 + (solver.game.incident?.kind === 'double-charge' ? SLOW_CHARGE_MS : 0),
        },
        solver.boost(node),
      ),
    outcome: (answer, node, kind) =>
      answer.game.incident?.kind === 'psp-outage' && node.provider === 'first'
        ? failed('upstream')
        : through(answer.ownHop(kind)),
    ...terminal,
  },
  autoscaler: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  // The Pipeline ships deploys and carries no traffic: nothing routes into it.
  ci: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  cluster: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  // Columnar scans: slow, unlimited, and paid per scan.
  warehouse: {
    model: unlimited(1_500, 200),
    outcome: (answer, _, kind) => through(answer.ownHop(kind)),
    ...terminal,
  },
  // Nearest-neighbour lookups over the company's embeddings (07 "Vector Index"): the index lives
  // in memory, so its type decides how many lookups it answers and how many it gets right.
  vec: {
    model: (solver, node, arriving) => {
      const index = VEC_INDEXES[node.indexType]
      return flatModel(
        (VEC_QUERIES * flatScale(node) * index.queries) / hotKeyFactor(solver.game, node),
        arriving,
        { fixed: 20, variable: 2 },
        solver.boost(node),
      )
    },
    // An approximate index misses a true neighbour on its recall's shortfall: the search comes
    // back without the document it wanted, which is a stale result.
    outcome: (answer, node, kind) => {
      const miss = 1 - VEC_INDEXES[node.indexType].recall
      return { ...through(answer.ownHop(kind)), stale: kind === 'q-search' ? miss : 0 }
    },
    ...terminal,
    probe: () => ({ 'q-search': 1 }),
  },
  // Prompts per second: tokens per second over the tokens in a prompt. A cold Node loads its model.
  gpu: {
    model: (solver, node, arriving) => {
      const precision = GPU_PRECISIONS[node.precision]
      const batch = GPU_BATCHES.find((entry) => entry.batch === node.batch) ?? GPU_BATCHES[0]
      // Continuous batching serves the batch as it arrives, so the throughput stays and the wait
      // for a first token does not (05 "GPU Node").
      const batched = has(solver.game, 'continuous-batching')
      return flatModel(
        gpuCapacity(node) *
          GPU_MODELS[node.gpuModel].speed *
          precision.speed *
          batch.gain *
          Math.max(0.1, warmOf(node.life)),
        arriving,
        { fixed: GPU_FIRST_TOKEN_MS + (batched ? 0 : batch.ttft), variable: 100 },
        solver.boost(node),
      )
    },
    // A quantized answer is worth less: 5% at INT8 and 15% at INT4 (05 "GPU Node").
    // A model that does not fit in the GPU's memory is killed as it loads: every prompt fails as
    // `oom`. Quantization shrinks the weights until it fits.
    outcome: (answer, node, kind) =>
      gpuFits(node)
        ? through(
            answer.ownHop(
              kind,
              GPU_PRECISIONS[node.precision].value * GPU_MODELS[node.gpuModel].value,
            ),
          )
        : failed('oom'),
    ...terminal,
  },
  // Small handlers next to the user (05 "Edge Function"): 5 ms, no cold start, and a CPU ceiling
  // that CPU-heavy kinds hit as a `timeout`.
  edge: {
    model: (solver, node, arriving) =>
      flatModel(
        Number.POSITIVE_INFINITY,
        arriving,
        { fixed: EDGE_MS, variable: 0 },
        solver.boost(node),
      ),
    serve: (serve, node, rates, share) => {
      const { game } = serve.solver
      const delegated = serve.solver.delegates(node)
      // JavaScript, TypeScript, or Rust or Go compiled to WebAssembly: anything else is refused.
      if (!edgeRuns(node)) return
      each(rates, share, (kind, processed) => {
        if (!edgeFits(game, node, kind, delegated)) return
        const calls = callsOf(game, node, kind as RequestKind, delegated)
        for (const backend of BACKEND_KINDS) serve.route(backend, processed * (calls[backend] ?? 0))
      })
    },
    outcome: (answer, node, kind) =>
      !edgeRuns(node)
        ? failed('refused')
        : !edgeFits(answer.game, node, kind, answer.delegates)
          ? failed('timeout')
          : answerCalls(answer, node, kind),
    // A handler opens no pool of its own: the edge reaches the data tier through the platform.
    connections: noConnections,
    probe: noProbe,
  },
  // A Managed Component: 10,000 messages a second, paid per message.
  msgp: {
    model: (solver, node, arriving) =>
      flatModel(
        MSGP_RATE * flatScale(node),
        arriving,
        { fixed: 100, variable: 10 },
        solver.boost(node),
      ),
    outcome: (answer, _, kind) => through(answer.ownHop(kind)),
    ...terminal,
  },
  // Leaderless quorums: a read waits for R replies, a write for W, of N replicas.
  wide: {
    model: (solver, node, arriving) => {
      const { reads, writes } = splitWork(arriving)
      const ops = reads * quorumR(node) + writes * quorumN(node)
      const rate = reads + writes
      const capacity =
        (WIDE_OPS * flatScale(node)) / hotKeyFactor(solver.game, node) / (ops > 0 ? ops / rate : 1)
      const model = flatModel(capacity, arriving, { fixed: 1, variable: 0 }, solver.boost(node))
      const wait = model.service['q-read']?.variable ?? 0
      const service: Record<string, { fixed: number; variable: number }> = {}
      for (const kind of Object.keys(arriving))
        service[kind] = {
          fixed: 1,
          variable:
            wait +
            WIDE_REPLICA_MS *
              kthFastest(kind === 'q-read' ? quorumR(node) : quorumW(node), quorumN(node)),
        }
      return { ...model, service }
    },
    outcome: (answer, node, kind) => {
      const n = quorumN(node)
      // One replica lost: a quorum that needs every replica cannot form.
      const short = node.lost > 0 ? 1 : 0
      const needed = kind === 'q-read' ? quorumR(node) : quorumW(node)
      if (needed > n - short) return failed('refused')
      const reply = through(answer.ownHop(kind))
      // Overlap is not linearizability: a checkout on a quorum store still goes wrong now and then.
      if (kind === 'q-tx')
        return failSome({ ...reply, stale: WIDE_TX_STALE }, WIDE_TX_DUPLICATE, 'duplicate')
      if (kind !== 'q-read') return reply
      return {
        ...reply,
        stale: wideStale(answer.pass.arriving[slotOf(answer.pass, node)] ?? {}, node),
      }
    },
    ...terminal,
    probe: () => ({ 'q-read': 1 }),
  },
  // Consensus: a write waits for a majority of its regions; a read asks the leaseholder.
  dsql: {
    model: (solver, node, arriving) => {
      const { reads, writes } = splitWork(arriving)
      const rate = reads + writes
      const work = reads * DSQL_READ_COST + writes
      const capacity = (DSQL_TX * flatScale(node)) / (work > 0 ? work / rate : 1)
      const model = flatModel(capacity, arriving, { fixed: 3, variable: 1 }, solver.boost(node))
      const majority = majorityMs(solver.game, node)
      const service: Record<string, { fixed: number; variable: number }> = {}
      for (const kind of Object.keys(arriving)) {
        const base = model.service[kind] ?? { fixed: 3, variable: 1 }
        service[kind] = kind === 'q-read' ? base : { ...base, fixed: base.fixed + majority }
      }
      return { ...model, service }
    },
    outcome: (answer, _, kind) => through(answer.ownHop(kind)),
    ...terminal,
    probe: () => ({ 'q-tx': 1 }),
  },
  // A Managed Component with a rate limit: past it, prompts fail as `throttled` at once.
  llm: {
    model: (solver, node, arriving) =>
      flatModel(
        LLM_RATE * flatScale(node),
        arriving,
        { fixed: LLM_FIRST_TOKEN_MS, variable: 0 },
        solver.boost(node),
      ),
    outcome: (answer, _, kind) => through({ ...answer.ownHop(kind), cause: 'throttled' }),
    ...terminal,
  },
  // It reads a Database's write log and publishes every change to an Event Stream (05 "CDC
  // Connector"). The changes come in as a copy of the Database's writes, so it never takes the
  // app's traffic; it hands them on as `task`, one change each.
  cdc: {
    model: (solver, node, arriving) =>
      flatModel(
        CDC_RATE * flatScale(node),
        arriving,
        // A Data team owns the pipelines, and a pipeline has half the lag with one (08 "Teams").
        { fixed: CDC_MS * (dataStaffed(solver.game) ? DATA_TEAM_LAG : 1), variable: 0.05 },
        solver.boost(node),
      ),
    serve: (serve, node, rates, share) => {
      let changes = 0
      for (const kind of CDC_CHANGES) changes += (rates[kind] ?? 0) * share
      if (changes > 0) serve.route('task', changes)
    },
    // The change waits for the connector's own hop and then for the stream: a consumer further
    // behind than the retention window loses the oldest changes, as a stale copy.
    outcome: (answer, node, kind) => relay(answer, node, kind),
    connections: noConnections,
    probe: noProbe,
  },
  // A mesh carries nothing: it puts a sidecar beside each App Server and Worker that links into it,
  // and the solve reads that from the Design (05 "Service Mesh").
  mesh: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  // Feature Flags carry nothing either: what they change is how far a bad deploy reaches, which
  // `badDeployShare` reads from the Design (05 "Feature Flags", 08 "Rollout").
  ff: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
  // So do Secrets and Certificates: the Step renews the certificate while one is live, and lets it
  // run out when none is (05 "Secrets and Certificates").
  pki: {
    model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
    outcome: () => failed('stranded'),
    ...terminal,
  },
}

/** GB of GPU memory the Node's model needs: its weights at its precision, and the batch's attention cache. */
export const gpuNeedGB = (node: GameNode): number =>
  GPU_MODELS[node.gpuModel].gb * GPU_PRECISIONS[node.precision].memory + GPU_CACHE_GB * node.batch

/** GB of memory the Node's GPUs hold between them. */
export const gpuHeldGB = (node: GameNode): number => GPU_TYPES[node.gpu].gb * flatScale(node)

/** Whether the model fits in the Node's GPU memory. */
export const gpuFits = (node: GameNode): boolean => gpuNeedGB(node) <= gpuHeldGB(node)

/** Prompts per second a GPU Node serves at full warmth. */
export const gpuCapacity = (node: GameNode): number =>
  (GPU_TYPES[node.gpu].tokens * flatScale(node)) / TOKENS_PER_PROMPT

/** Each Component's accepted kinds as a set: the solver asks on every route. */
const ACCEPTS = new Map<ComponentId, ReadonlySet<Kind>>(
  Object.values(COMPONENTS).map((component) => [component.id, new Set(component.accepts)]),
)

/** Whether a Node takes a kind on an inbound Link. */
export const accepts = (node: GameNode, kind: Kind): boolean =>
  (ACCEPTS.get(node.type) as ReadonlySet<Kind>).has(kind)

/* ---------- quorums, consensus and hot keys ---------- */

/** Mean ms one Wide-column replica takes to answer.  */
export const WIDE_REPLICA_MS = 2

export const quorumN = (node: GameNode): number => Math.max(1, Math.min(5, node.n))
export const quorumR = (node: GameNode): number => Math.max(1, Math.min(quorumN(node), node.r))
export const quorumW = (node: GameNode): number => Math.max(1, Math.min(quorumN(node), node.w))

/** R + W > N: every read asks a replica that took the latest write (07 "Wide-column Store"). */
export const strongQuorum = (node: GameNode): boolean =>
  quorumR(node) + quorumW(node) > quorumN(node)

const splitWork = (arriving: Rates) => {
  const reads = arriving['q-read'] ?? 0
  const writes = (arriving['q-write'] ?? 0) + (arriving['q-tx'] ?? 0) + (arriving['k-write'] ?? 0)
  return { reads, writes }
}

/** Share of a weak quorum's reads that miss the latest write: more writes, fewer replicas asked. */
export const wideStale = (arriving: Rates, node: GameNode): number => {
  if (strongQuorum(node)) return 0
  const { reads, writes } = splitWork(arriving)
  const writeShare = reads + writes > 0 ? writes / (reads + writes) : 0
  const missed = (quorumN(node) - quorumW(node)) / quorumN(node)
  return Math.min(0.5, WIDE_STALE * writeShare * missed * (2 / (quorumR(node) + 1)) + 0.05 * missed)
}

/**
 * Ms a consensus write waits for its majority: the ⌈n/2⌉-th smallest round trip
 * from the leader's region, itself counting as 0 (07 "Distributed SQL").
 */
export const majorityMs = (game: Game, node: GameNode): number => {
  const regions = spreadRegions(game, node, SPREAD_REGIONS)
  const trips = regions.map((region) => rttOf(node.region, region)).toSorted((a, b) => a - b)
  const majority = Math.floor(trips.length / 2) + 1
  return trips[majority - 1] ?? 0
}

/**
 * During a Hot key, 30% of the reads ask one key on one shard (07 "Fan-out"):
 * the Node's capacity divides by this. Splitting hot keys spreads them again.
 */
export const hotKeyFactor = (game: Game, node: GameNode): number => {
  const incident = game.incident
  if (incident?.kind !== 'hot-key' || incident.nodeId !== node.id) return 1
  if (node.split && has(game, 'hybrid-fanout')) return 1
  const shards = Math.max(2, flatScale(node))
  return HOT_KEY_SHARE * shards + 1 - HOT_KEY_SHARE
}
