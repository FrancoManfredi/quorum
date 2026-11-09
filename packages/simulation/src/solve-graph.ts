import {
  COMPONENTS,
  REQUEST_KINDS,
  SAMPLE_LATENCY,
  SAMPLE_OVERHEAD,
  LINK_TIMEOUT,
  BACKEND_KINDS,
  type RequestKind,
} from './catalog.ts'
import { RETRY_BUDGET, attemptsFor } from './distribution.ts'
import { has, meshOf, sampleIndex } from './lookups.ts'
import { isOpen } from './breaker-machine.ts'
import { slotOf, accepts, type Pass, type Rates } from './rules.ts'
import { type Game, type GameLink, type GameNode } from './state.ts'
import { fixed } from './team.ts'

/**
 * A routing Link as the solve sees it: numbered, so per-Link state in a pass lives in
 * arrays, with its key and policy worked out once per solve instead of on every call.
 * Two Links with the same ends share one Edge, as they share one key.
 */
export type Edge = Readonly<{
  index: number
  /** `from>to`, the key of the Ledger's Link figures. */
  key: string
  from: GameNode
  to: GameNode
  /** The callee's place in the per-Node arrays. */
  toAt: number
  /** The last Link with these ends: its kinds and policy are the ones that apply. */
  link: GameLink
  policy: Policy
}>

export type Graph = Readonly<{
  byId: ReadonlyMap<string, GameNode>
  /** Each Node's place in the per-Node arrays of a solve: its index in the Design, by id. */
  at: ReadonlyMap<string, number>
  /** Each routing Link, by caller, then callee. */
  edgeTo: ReadonlyMap<string, ReadonlyMap<string, Edge>>
  /** Each Node's outgoing Edges, one per routing Link, in the Design's order. */
  out: ReadonlyMap<string, ReadonlyArray<Edge>>
  /**
   * The Edges that copy a Node's writes to a CDC Connector. They carry no share of the traffic:
   * the source keeps all of it, and the connector reads the changes off its log.
   */
  mirrors: ReadonlyMap<string, ReadonlyArray<Edge>>
  edges: ReadonlyArray<Edge>
  routes: ReadonlyMap<string, ReadonlyArray<GameNode>>
  parents: ReadonlyMap<string, ReadonlyArray<GameNode>>
  taps: ReadonlyMap<string, ReadonlyArray<string>>
  order: ReadonlyArray<GameNode>
  /** DNS drops dead hosts after its TTL, and Load Balancers check deep, only with Health checks. */
  healthChecked: boolean
  /** Sim seconds, so a Load Balancer or DNS notices a dead Node late. */
  time: number
}>

/** One Graph per Game: the Bottleneck search re-solves the same Game, and reuses it. */
export const graphs = new WeakMap<Game, Graph>()

export const graphOf = (game: Game): Graph => {
  let graph = graphs.get(game)
  if (!graph) {
    graph = buildGraph(game)
    graphs.set(game, graph)
  }
  return graph
}

export const buildGraph = (game: Game): Graph => {
  const byId = new Map(game.nodes.map((node) => [node.id, node]))
  const at = new Map(game.nodes.map((node, index) => [node.id, index]))
  const routes = new Map<string, Array<GameNode>>()
  const parents = new Map<string, Array<GameNode>>()
  const taps = new Map<string, Array<string>>()
  const routing: Array<readonly [GameNode, GameNode]> = []
  const mirroring: Array<readonly [GameNode, GameNode]> = []
  const last = new Map<string, GameLink>()
  for (const link of game.links) {
    const from = byId.get(link.from)
    const to = byId.get(link.to)
    if (!from || !to) continue
    // A link into an Autoscaler or a Cluster puts the Node under its control: no traffic.
    if (COMPONENTS[to.type].control) continue
    // A link into a CDC Connector copies the changes the caller writes: no traffic either.
    if (COMPONENTS[to.type].mirror) {
      mirroring.push([from, to])
      last.set(`${from.id}>${to.id}`, link)
    } else if (COMPONENTS[to.type].tap) {
      taps.set(to.id, [...(taps.get(to.id) ?? []), from.id])
    } else {
      routing.push([from, to])
      last.set(`${from.id}>${to.id}`, link)
      routes.set(from.id, [...(routes.get(from.id) ?? []), to])
      parents.set(to.id, [...(parents.get(to.id) ?? []), from])
    }
  }
  const edgeTo = new Map<string, Map<string, Edge>>()
  const out = new Map<string, Array<Edge>>()
  const mirrors = new Map<string, Array<Edge>>()
  const edges: Array<Edge> = []
  const edgeOfPair = (from: GameNode, to: GameNode): Edge => {
    const byTo = edgeTo.get(from.id) ?? new Map<string, Edge>()
    edgeTo.set(from.id, byTo)
    const existing = byTo.get(to.id)
    if (existing) return existing
    const key = `${from.id}>${to.id}`
    const edge: Edge = {
      index: edges.length,
      key,
      from,
      to,
      toAt: at.get(to.id) as number,
      link: last.get(key) as GameLink,
      policy: policyOf(game, last.get(key), from),
    }
    byTo.set(to.id, edge)
    edges.push(edge)
    return edge
  }
  for (const [from, to] of routing)
    out.set(from.id, [...(out.get(from.id) ?? []), edgeOfPair(from, to)])
  for (const [from, to] of mirroring)
    mirrors.set(from.id, [...(mirrors.get(from.id) ?? []), edgeOfPair(from, to)])
  // Kahn's order over routing links. A Node caught in a cycle never runs. A CDC Connector also
  // waits for every Node whose log it reads, so it sees this pass's writes.
  const mirrored = new Map<string, number>()
  for (const edges of mirrors.values())
    for (const edge of edges) mirrored.set(edge.to.id, (mirrored.get(edge.to.id) ?? 0) + 1)
  const indegree = new Map<string, number>(
    game.nodes.map((node) => [
      node.id,
      (parents.get(node.id)?.length ?? 0) + (mirrored.get(node.id) ?? 0),
    ]),
  )
  const order: Array<GameNode> = []
  const ready = game.nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0)
  while (ready.length > 0) {
    const node = ready.shift() as GameNode
    order.push(node)
    const children = [
      ...(routes.get(node.id) ?? []),
      ...(mirrors.get(node.id) ?? []).map((edge) => edge.to),
    ]
    for (const child of children) {
      const left = (indegree.get(child.id) ?? 0) - 1
      indegree.set(child.id, left)
      if (left === 0) ready.push(child)
    }
  }
  return {
    byId,
    at,
    edgeTo,
    out,
    mirrors,
    edges,
    routes,
    parents,
    taps,
    order,
    healthChecked: has(game, 'health-checks') && fixed(game, 'health-check'),
    time: game.time,
  }
}

export type Policy = Readonly<{
  timeout: number
  /** It retries failed calls: at once and up to three times, or with backoff inside a budget. */
  retry: 'none' | 'naive' | 'backoff'
  /** Its circuit breaker is open: it sends nothing and fails fast. */
  open: boolean
  /** A bulkhead caps how long one call may hold its caller's slot. */
  bulkhead: boolean
  /** It sends a second copy of a slow call and keeps the faster answer. */
  hedge: boolean
}>

export const NO_POLICY: Policy = {
  timeout: LINK_TIMEOUT * 1000,
  retry: 'none',
  open: false,
  bulkhead: false,
  hedge: false,
}

/**
 * A Link's timeout in ms, its retries, and its breaker. Every Link waits 30 s and
 * never retries until Timeouts and retries; backoff and breakers need their research.
 *
 * A Service Mesh gives every Link out of a Node with a sidecar the retries and the breaker the
 * sidecar runs by itself (05 "Service Mesh"), even without their research. A Link whose player set
 * its own policy keeps it: the mesh is the default, not an override.
 */
export const policyOf = (game: Game, link: GameLink | undefined, from?: GameNode): Policy => {
  if (!link) return NO_POLICY
  const meshed = from !== undefined && meshOf(game, from)
  // An L4 Load Balancer forwards TCP: it cannot retry a call it cannot read (05 "Load Balancer").
  const blind = from !== undefined && from.type === 'lb' && from.variant === 'l4'
  if (blind || (!meshed && !has(game, 'timeouts'))) return NO_POLICY
  const retry =
    link.retries === 'none'
      ? meshed
        ? 'naive'
        : 'none'
      : link.retries === 'backoff'
        ? has(game, 'backoff-jitter')
          ? 'backoff'
          : 'naive'
        : link.retries
  return {
    timeout: link.timeout * 1000,
    retry,
    open: isOpen(link.fuse) && (has(game, 'circuit-breakers') || meshed),
    bulkhead: link.bulkhead && has(game, 'bulkheads'),
    hedge: link.hedge && has(game, 'hedged-requests'),
  }
}

/** The Edge from one Node to another, if a routing Link joins them. */
export const edgeOf = (graph: Graph, from: string, to: string): Edge | undefined =>
  graph.edgeTo.get(from)?.get(to)

export const NO_RATES: Rates = {}

/** What a pass sent from one Node to another, by kind. */
export const carriedOn = (graph: Graph, pass: Pass, from: string, to: string): Rates => {
  const edge = edgeOf(graph, from, to)
  return (edge && pass.links[edge.index]) ?? NO_RATES
}

/** Calls per call a retrying Link sends when a share `failure` fails. */
export const amplification = (policy: Policy, failure: number): number =>
  policy.open
    ? 0
    : policy.retry === 'naive'
      ? attemptsFor(failure)
      : policy.retry === 'backoff'
        ? 1 + Math.min(RETRY_BUDGET, attemptsFor(failure) - 1)
        : 1

export const delegates = (graph: Graph, node: GameNode): boolean =>
  (graph.routes.get(node.id) ?? []).some((child) => accepts(child, 'auth'))

/** A CDC Connector reads this Node's write log (05 "CDC Connector"). */
export const cdcMirrored = (graph: Graph, node: GameNode): boolean =>
  (graph.mirrors.get(node.id)?.length ?? 0) > 0

/** An App Server with a Link to a Queue hands its async work to Workers. */
export const offloads = (graph: Graph, node: GameNode): boolean =>
  node.type === 'server' &&
  (graph.routes.get(node.id) ?? []).some((child) => accepts(child, 'task'))

export const runsLocalDb = (graph: Graph, node: GameNode): boolean =>
  node.localDb &&
  !(graph.routes.get(node.id) ?? []).some(
    (child) => accepts(child, 'q-read') || accepts(child, 'q-write'),
  )

/** CPU overhead from Analytics sampling a Node: the highest rate of any tap on it. */
export const samplingOf = (game: Game, graph: Graph, node: GameNode): number => {
  let overhead = 0
  for (const [tapId, sources] of graph.taps) {
    if (!sources.includes(node.id)) continue
    const tap = graph.byId.get(tapId)
    if (tap) overhead = Math.max(overhead, SAMPLE_OVERHEAD[sampleIndex(tap)] ?? 0)
  }
  return overhead
}

/** Milliseconds sampling adds to a Node's hop: the highest rate of any tap on it. */
export const samplingMsOf = (graph: Graph, node: GameNode): number => {
  let ms = 0
  for (const [tapId, sources] of graph.taps) {
    if (!sources.includes(node.id)) continue
    const tap = graph.byId.get(tapId)
    if (tap) ms = Math.max(ms, SAMPLE_LATENCY[sampleIndex(tap)] ?? 0)
  }
  return ms
}

/**
 * The request kinds behind each Node's traffic, as shares. A request keeps its
 * kind on every hop: the backend kinds a Node receives carry the mix of the
 * Nodes that sent them.
 */
export const originsOf = (
  graph: Graph,
  pass: Pass,
): Map<string, ReadonlyArray<readonly [RequestKind, number]>> => {
  const origins = new Map<string, ReadonlyArray<readonly [RequestKind, number]>>()
  for (const node of graph.order) {
    const mix = new Map<RequestKind, number>()
    const arriving = pass.arriving[slotOf(pass, node)] ?? {}
    for (const kind of REQUEST_KINDS) {
      const rate = arriving[kind] ?? 0
      if (rate > 0) mix.set(kind, rate)
    }
    for (const parent of graph.parents.get(node.id) ?? []) {
      const carried = carriedOn(graph, pass, parent.id, node.id)
      let backend = 0
      for (const kind of BACKEND_KINDS) backend += carried[kind] ?? 0
      if (backend <= 0) continue
      for (const [kind, share] of origins.get(parent.id) ?? [])
        mix.set(kind, (mix.get(kind) ?? 0) + backend * share)
    }
    let total = 0
    for (const rate of mix.values()) total += rate
    origins.set(
      node.id,
      total > 0 ? [...mix].map(([kind, rate]) => [kind, rate / total] as const) : [],
    )
  }
  return origins
}
