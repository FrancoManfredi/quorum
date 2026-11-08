import {
  BACKEND_KINDS,
  CDN_HIT,
  CDN_TTLS,
  ESI_PAGE_HIT,
  STEP_SECONDS,
  GPU_PRECISIONS,
  GPU_MODELS,
  GPU_CACHE_GB,
  GPU_TYPES,
  ML_AI_BONUS,
  BLAST_FACTOR,
  LANGUAGES,
  RUNTIME_INCIDENT_FAILURES,
  HOT_KEY_SHARE,
  MTU_LOSS,
  TIERED_MEDIA_HIT,
  CACHE_KEYS,
  COMPONENTS,
  PROFILES,
  FRAMEWORKS,
  HOT_KB_PER_USER,
  MIGRATION_BUGS,
  REQUEST_KINDS,
  ROLLOUT_SHARE,
  RUNTIMES,
  UPGRADE_CRASHES,
  EDGE_READ_HIT,
  VEC_AI_LIFT,
  VEC_INDEXES,
  type ComponentId,
  type Kind,
  type RequestKind,
} from './catalog.ts'
import { FLAT_CAPACITY, callsOf, flatModel, type Calls, type NodeModel } from './capacity.ts'
import { failSome, failed, through, type Hop, type Outcome } from './distribution.ts'
import { mixOf, payloadFactor } from './features.ts'
import { clusterOf, flatScale, has, hasEdge, hopMs, isDown, transferMs, vecOf } from './lookups.ts'
import type { Game, GameNode } from './state.ts'
import { warmOf } from './life.ts'
import { badDeployShareOf, blastService, buggy, failsKind } from './team.ts'

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
  /** Calls per second each Node gets on top of the first try: retries and hedged copies. */
  repeated: ReadonlyArray<number | undefined>
  /** What each routing Link carried, by kind, indexed by the solve's Edge numbers. */
  links: ReadonlyArray<Rates | undefined>
  /** The Edges that carried anything, in the order they first did: sums over Links run in it. */
  linkOrder: ReadonlyArray<number>
  connections: ReadonlyArray<Readonly<{ used: number; max: number }> | undefined>
  /** Tasks per second each Queue or Worker gets, by the request kind that enqueued them. */
  tasks: ReadonlyArray<Partial<Record<RequestKind, number>> | undefined>
  /** Tasks per second each Queue's Workers take from it. */
  drained: ReadonlyArray<number | undefined>
  lagMs: number
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

/** Requests per second of a flat Component at its size. */
export const flatCapacity = (node: GameNode): number =>
  (FLAT_CAPACITY[node.type] ?? 0) * flatScale(node)

/** Each kind it processed, at its processed rate. */
export const each = (
  rates: Rates,
  share: number,
  apply: (kind: Kind, processed: number) => void,
) => {
  for (const kind of Object.keys(rates) as Array<Kind>) {
    const processed = (rates[kind] ?? 0) * share
    if (processed > 0) apply(kind, processed)
  }
}

export const passOn = (serve: Serve, _: GameNode, rates: Rates, share: number) =>
  each(rates, share, (kind, processed) => serve.route(kind, processed))

export const nothing = () => {}

export const noConnections = () => 0

export const noProbe = () => null

/** Its own hop, then what it sends on. */
export const relay = (answer: Answer, _: GameNode, kind: Kind): Outcome =>
  through(answer.ownHop(kind), [[answer.downstream(kind), 1]])

export const unlimited =
  (fixedMs: number, variableMs: number) => (_: Solver, __: GameNode, arriving: Rates) =>
    flatModel(Number.POSITIVE_INFINITY, arriving, { fixedMs, variableMs }, 1)

export const flat =
  (service: Readonly<{ fixedMs: number; variableMs: number }>, capacity = flatCapacity) =>
  (solver: Solver, node: GameNode, arriving: Rates) =>
    flatModel(capacity(node), arriving, service, solver.boost(node))

/** Share of read queries a Cache answers: sqrt(memory / hot data) × TTL × invalidation × warmth. */
/**
 * Share of a Cache's refills that push an older key out: 0 while the hot data fits its memory,
 * and the share that does not fit once it does not (07 \"Cache\").
 */
export const evictionShareOf = (game: Game, node: GameNode): number => {
  const hot = (game.users * HOT_KB_PER_USER) / 1_000_000
  return hot > 0 ? Math.max(0, 1 - Math.min(1, flatScale(node) / hot)) : 0
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
 * What a Node that runs the Service's code sends on for the work it processed: one backend call
 * for every call the request kind makes. An App Server, a Worker and a function all answer with it.
 */
export const serveCalls: ComponentRule['serve'] = (serve, node, rates, share) => {
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
export const answerCalls: ComponentRule['outcome'] = (answer, node, kind) => {
  const { game } = answer
  const requestKind = kind as RequestKind
  const served = answer.ownHop(
    kind,
    (FRAMEWORKS[node.framework].value[requestKind] ?? 1) * aiValueOf(game, node, requestKind),
  )
  // The response crosses the user's downlink: bytes over bandwidth.
  const own = {
    ...served,
    fixedMs:
      served.fixedMs +
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

export const terminal: Pick<ComponentRule, 'serve' | 'connections' | 'probe'> = {
  serve: nothing,
  connections: noConnections,
  probe: noProbe,
}

/** GB of GPU memory the Node's model needs: its weights at its precision, and the batch's attention cache. */
export const gpuNeedGB = (node: GameNode): number =>
  GPU_MODELS[node.gpuModel].gb * GPU_PRECISIONS[node.precision].memory + GPU_CACHE_GB * node.batch

/** GB of memory the Node's GPUs hold between them. */
export const gpuHeldGB = (node: GameNode): number => GPU_TYPES[node.gpu].gb * flatScale(node)

/** Whether the model fits in the Node's GPU memory. */
export const gpuFits = (node: GameNode): boolean => gpuNeedGB(node) <= gpuHeldGB(node)

/** Each Component's accepted kinds as a set: the solver asks on every route. */
export const ACCEPTS = new Map<ComponentId, ReadonlySet<Kind>>(
  Object.values(COMPONENTS).map((component) => [component.id, new Set(component.accepts)]),
)

/** Whether a Node takes a kind on an inbound Link. */
export const accepts = (node: GameNode, kind: Kind): boolean =>
  (ACCEPTS.get(node.type) as ReadonlySet<Kind>).has(kind)

export const splitWork = (arriving: Rates) => {
  const reads = arriving['q-read'] ?? 0
  const writes = (arriving['q-write'] ?? 0) + (arriving['q-tx'] ?? 0) + (arriving['k-write'] ?? 0)
  return { reads, writes }
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
