import {
  CALLOUT_FAILURE,
  CALLOUT_MS,
  LAG_SURGE,
  COMPONENTS,
  DB_ENGINES,
  P2C_IMBALANCE,
  STICKY_DECAY,
  STICKY_SHARE,
  PROFILES,
  REQUEST_KINDS,
  FOREVER_ATTEMPTS,
  HEDGE_LOAD,
  CDC_CHANGES,
  type Kind,
  type RequestKind,
} from './catalog.ts'
import { FLAT_CAPACITY, type Calls } from './capacity.ts'
import { taskAttempts, failSome, hop, through, type Outcome } from './distribution.ts'
import { engineOf, has, isDown, primaryOf } from './lookups.ts'
import {
  RULES,
  accepts,
  flatCapacity,
  taskMixOf,
  type Model,
  type Pass,
  type Rates,
  type Solver,
} from './rules.ts'
import { causeOf } from './life.ts'
import { type Game, type GameNode } from './state.ts'

import {
  type Edge,
  type Graph,
  amplification,
  cdcMirrored,
  delegates,
  offloads,
  runsLocalDb,
  samplingOf,
} from './solve-graph.ts'

/** Replication lag: a floor, plus milliseconds per write per second to replay (16 D12). */
export const REPLICA_LAG_MS = 20
export const REPLICA_LAG_PER_WRITE = 2
/**
 * Share of the reads in a lag window that ask for a row a write just changed. A replica serves a
 * stale answer only to those; the rest read rows no recent write touched.
 */
export const REPLICA_STALE_REUSE = 0.25

export type Inputs = Readonly<{
  game: Game
  graph: Graph
  demand: Partial<Record<RequestKind, number>>
  boost: string | null
  /** The per-Node figures below are indexed by the Graph's `at`. */
  callLatency: ReadonlyArray<Calls | undefined>
  inflight: ReadonlyArray<number | undefined>
  weights: ReadonlyArray<number | undefined>
  /** Share of calls that fail on each retrying Link, by `from>to:kind`, from the last pass. */
  failures: ReadonlyArray<Partial<Record<Kind, number>> | undefined>
  /** Capacity each Node had on paper at the start of the solve: what a weighted split sees. */
  nominal: ReadonlyArray<number | undefined>
  /** App Servers whose database is down or overloaded: a deep health check takes them out. */
  sick: ReadonlyArray<boolean | undefined>
  /** Share of the demand each Users Node takes in. */
  intake: ReadonlyArray<number | undefined>
  /** Share of each Worker's attempts that failed on the last pass: they come back as retries. */
  taskFailure: ReadonlyArray<number | undefined>
  /** Tasks per second each Worker could take on the last pass. */
  taskCapacity: ReadonlyArray<number | undefined>
  /** Server connections held open on each Node on the last pass. */
  connectionUsed: ReadonlyArray<number | undefined>
}>

/** Attempts a Queue gives a task: its max attempts with a dead-letter queue, else forever. */
export const attemptsAllowed = (queue: GameNode): number =>
  queue.dlq ? queue.attempts : FOREVER_ATTEMPTS

/** The Queue a Worker pulls from, if any. */
export const queueOf = (graph: Graph, node: GameNode): GameNode | undefined =>
  (graph.parents.get(node.id) ?? []).find((parent) => parent.type === 'queue')

/** Shares of a per-kind rate record, or null when it is empty. */
export const sharesOf = (
  rates: Partial<Record<RequestKind, number>> | undefined,
): Partial<Record<RequestKind, number>> | null => {
  if (!rates) return null
  let total = 0
  for (const kind of Object.keys(rates) as Array<RequestKind>) total += rates[kind] ?? 0
  if (total <= 0) return null
  const shares: Partial<Record<RequestKind, number>> = {}
  for (const kind of Object.keys(rates) as Array<RequestKind>)
    shares[kind] = (rates[kind] ?? 0) / total
  return shares
}

export const NO_CALLS: Calls = {}

/**
 * What the rules may ask about the Design in this pass. `tasks` holds what the
 * pass has sent so far: Nodes walk in order, so a Worker sees its Queue's mix.
 */
export const solverOf = (
  inputs: Inputs,
  tasks: ReadonlyArray<Partial<Record<RequestKind, number>> | undefined> = [],
  arriving: ReadonlyArray<Rates> = [],
): Solver => {
  const { game, graph } = inputs
  return {
    game,
    boost: (node) => (inputs.boost === node.id ? 2 : 1),
    callLatency: (node) => inputs.callLatency[graph.at.get(node.id) as number] ?? NO_CALLS,
    inflight: (node) => inputs.inflight[graph.at.get(node.id) as number] ?? 0,
    connections: (node) => inputs.connectionUsed[graph.at.get(node.id) as number] ?? 0,
    delegates: (node) => delegates(graph, node),
    runsLocalDb: (node) => runsLocalDb(graph, node),
    sampling: (node) => samplingOf(game, graph, node),
    offloads: (node) => offloads(graph, node),
    cdcMirrored: (node) => cdcMirrored(graph, node),
    poisoned: (node) => {
      const incident = game.incident
      if (incident?.kind !== 'poison') return false
      return (graph.parents.get(node.id) ?? []).some(
        (parent) => parent.id === incident.nodeId && !parent.dlq,
      )
    },
    taskMix: (node) => sharesOf(tasks[graph.at.get(node.id) as number]) ?? taskMixOf(game),
    attempts: (node) => {
      const queue = queueOf(graph, node)
      if (!queue) return 1
      const failure = Math.min(0.99, inputs.taskFailure[graph.at.get(node.id) as number] ?? 0)
      return taskAttempts(failure, attemptsAllowed(queue))
    },
    drainable: (node) => {
      let total = 0
      for (const edge of graph.out.get(node.id) ?? []) {
        if (edge.to.type !== 'worker' || isDown(edge.to)) continue
        total += inputs.taskCapacity[edge.toAt] ?? Number.POSITIVE_INFINITY
      }
      return total
    },
    arriving: (node) => arriving[graph.at.get(node.id) as number] ?? {},
  }
}

/** Requests per second a Node could take with the Era's mix, for splitting traffic. */
export const probeCapacity = (inputs: Inputs, solver: Solver, node: GameNode): number => {
  const probe = RULES[node.type].probe(inputs.game)
  if (probe === null) return FLAT_CAPACITY[node.type] === undefined ? 1_000 : flatCapacity(node)
  const model = RULES[node.type].model(solver, node, probe)
  return model.utilization > 0 ? 1 / model.utilization : 1_000
}

/** A Users Node's share of the demand. */
export const intakeOf = (demand: Partial<Record<RequestKind, number>>, share: number) => {
  if (share === 1) return { ...demand }
  const rates: Partial<Record<Kind, number>> = {}
  for (const kind of Object.keys(demand) as Array<RequestKind>)
    if (share > 0) rates[kind] = (demand[kind] ?? 0) * share
  return rates
}

/** A customer's webhook endpoint: slow, and it fails now and then (04 "Request kinds"). */
export const CALLOUT: Outcome = failSome(
  through(hop({ fixedMs: CALLOUT_MS / 2, variableMs: CALLOUT_MS / 2 })),
  CALLOUT_FAILURE,
  'upstream',
)

export const forward = (inputs: Inputs): Pass => {
  const { game, graph, demand } = inputs
  const tasks: Array<Partial<Record<RequestKind, number>> | undefined> = []
  const at = graph.at
  const arriving: Array<Rates> = game.nodes.map(() => ({}))
  const solver = solverOf(inputs, tasks, arriving)
  // The request kinds behind the tasks the Node now walking sends on.
  let composition: Partial<Record<RequestKind, number>> | null = null
  const models: Array<Model | undefined> = []
  const hits: Array<number | undefined> = []
  const staleHits: Array<number | undefined> = []
  const stranded: Array<{ rate: number; kinds: Set<Kind> } | undefined> = []
  const links: Array<Rates | undefined> = []
  const linkOrder: Array<number> = []
  const repeated: Array<number | undefined> = []

  const route = (node: GameNode, slot: number, kind: Kind, rate: number) => {
    // A webhook's call goes to a customer's server, outside the Design.
    if (rate <= 0 || kind === 'callout') return
    const targets = splitOf(inputs, node, kind)
    if (targets.length === 0) {
      const entry = stranded[slot] ?? { rate: 0, kinds: new Set<Kind>() }
      entry.rate += rate
      entry.kinds.add(kind)
      stranded[slot] = entry
      return
    }
    for (const [edge, weight] of targets) {
      // Retries resend what failed: the callee sees more. An open breaker sends nothing. A hedged
      // Link sends its second copy of every call, so the callee sees that much more again (05).
      const amplified =
        amplification(edge.policy, inputs.failures[edge.index]?.[kind] ?? 0) *
        (edge.policy.hedge ? 1 + HEDGE_LOAD : 1)
      const sent = rate * weight * amplified
      if (amplified > 1) repeated[edge.toAt] = (repeated[edge.toAt] ?? 0) + sent - rate * weight
      const into = arriving[edge.toAt] as Rates
      into[kind] = (into[kind] ?? 0) + sent
      let carried = links[edge.index]
      if (!carried) {
        carried = {}
        links[edge.index] = carried
        linkOrder.push(edge.index)
      }
      carried[kind] = (carried[kind] ?? 0) + sent
      if (kind === 'task' && composition) {
        const into = tasks[edge.toAt] ?? {}
        for (const origin of Object.keys(composition) as Array<RequestKind>)
          into[origin] = (into[origin] ?? 0) + sent * (composition[origin] ?? 0)
        tasks[edge.toAt] = into
      }
    }
  }

  for (const node of graph.order) {
    const slot = at.get(node.id) as number
    const rates =
      node.type === 'users' ? intakeOf(demand, inputs.intake[slot] ?? 0) : (arriving[slot] as Rates)
    arriving[slot] = rates
    const rule = RULES[node.type]
    const model = rule.model(solver, node, rates)
    models[slot] = model
    const shares = model.shares
    const share = isDown(node) ? 0 : shares ? 1 : model.share
    // Load shedding keeps a different share of each kind.
    const kept: Rates = shares && !isDown(node) ? {} : rates
    if (shares && !isDown(node))
      for (const kind of Object.keys(rates) as Array<Kind>)
        kept[kind] = (rates[kind] ?? 0) * (shares[kind] ?? model.share)
    // An App Server enqueues one task per request of a kind that goes async; a Queue passes on its mix.
    if (node.type === 'server') {
      const offloaded: Partial<Record<RequestKind, number>> = {}
      for (const kind of REQUEST_KINDS)
        if (PROFILES[kind].offload > 0 && (kept[kind] ?? 0) > 0) offloaded[kind] = kept[kind] ?? 0
      composition = sharesOf(offloaded)
    } else composition = node.type === 'queue' || node.type === 'log' ? sharesOf(tasks[slot]) : null
    rule.serve(
      {
        solver,
        route: (kind, rate) => route(node, slot, kind, rate),
        setHits: (hit, stale) => {
          hits[slot] = hit
          staleHits[slot] = stale
        },
      },
      node,
      kept,
      share,
    )
    // A CDC Connector takes a copy of the changes a Node wrote and none of its traffic: the writes
    // stay answered by the Node, and the connector publishes what they changed (05 "CDC Connector").
    for (const edge of graph.mirrors.get(node.id) ?? []) {
      let carried = links[edge.index]
      const into = arriving[edge.toAt] as Rates
      for (const kind of CDC_CHANGES) {
        const written = (kept[kind] ?? 0) * share
        if (written <= 0) continue
        into[kind] = (into[kind] ?? 0) + written
        if (!carried) {
          carried = {}
          links[edge.index] = carried
          linkOrder.push(edge.index)
        }
        carried[kind] = (carried[kind] ?? 0) + written
      }
    }
  }

  // Every app process holds its own pool to each database it reaches.
  const connectionsIn: Array<number | undefined> = []
  for (const node of graph.order) {
    const slot = at.get(node.id) as number
    // An L4 Load Balancer hands the connections it holds on to its targets, each its share.
    const through = node.type === 'lb'
    const out = through
      ? (connectionsIn[slot] ?? 0)
      : RULES[node.type].connections(solver, node, models[slot], connectionsIn[slot] ?? 0)
    if (out <= 0) continue
    const shares = through
      ? new Map(splitOf(inputs, node, 'q-read').map(([edge, share]) => [edge, share]))
      : null
    for (const edge of graph.out.get(node.id) ?? []) {
      const child = edge.to
      if (!accepts(child, 'q-read') && !accepts(child, 'q-write')) continue
      connectionsIn[edge.toAt] = (connectionsIn[edge.toAt] ?? 0) + out * (shares?.get(edge) ?? 1)
    }
  }
  const connections: Array<{ used: number; max: number } | undefined> = []
  let writes = 0
  for (const node of game.nodes) {
    if (node.type !== 'database' && node.type !== 'replica') continue
    const slot = at.get(node.id) as number
    // Postgres forks a process per connection; MySQL gives each a thread and holds more (07).
    // A replica runs its primary's engine.
    const engine = DB_ENGINES[engineOf(game, node)]
    connections[slot] = {
      used: connectionsIn[slot] ?? 0,
      max: engine.connections * (inputs.boost === node.id ? 2 : 1),
    }
    // An engine's replication applies writes at its own pace; MySQL's row-based apply keeps up
    // with more of them than Postgres's streaming replication (07 "Read Replica").
    writes += (arriving[slot]?.['q-write'] ?? 0) * engine.lag
  }

  // What each Queue's Workers take from it.
  const drained: Array<number | undefined> = []
  for (const node of game.nodes) {
    if (node.type !== 'queue') continue
    let total = 0
    for (const edge of graph.out.get(node.id) ?? []) {
      if (edge.to.type !== 'worker') continue
      const share = isDown(edge.to) ? 0 : (models[edge.toAt]?.share ?? 1)
      total += (links[edge.index]?.task ?? 0) * share
    }
    drained[at.get(node.id) as number] = total
  }

  // A burst of writes during a Replication lag incident leaves replicas far behind.
  const surge = game.incident?.kind === 'repl-lag'
  const lag = REPLICA_LAG_MS + REPLICA_LAG_PER_WRITE * writes
  return {
    at,
    arriving,
    models,
    hits,
    staleHits,
    stranded,
    repeated,
    links,
    linkOrder,
    connections,
    tasks,
    drained,
    lagMs: surge ? lag * LAG_SURGE : lag,
    staleShare: surge
      ? Math.min(0.5, (lag * LAG_SURGE) / 1000)
      : Math.min(0.15, (lag * REPLICA_STALE_REUSE) / 1000),
  }
}

/** Whether a Node is down and the router in front of it has noticed. Planned restarts drain first. */
export const noticed = (graph: Graph, child: GameNode, after: number): boolean =>
  isDown(child) && (causeOf(child.life) === 'restart' || graph.time - child.downAt >= after)

/**
 * The kinds a Link carries: an API Gateway's route table sends each kind on chosen Links, and every
 * other Node sends every kind on every Link (05 "API Gateway").
 */
export const carries = (node: GameNode, edge: Edge, kind: Kind): boolean => {
  if (node.type !== 'gw') return true
  const kinds = edge.link.kinds
  return !kinds || (kinds as ReadonlyArray<Kind>).includes(kind)
}

export type Split = ReadonlyArray<readonly [Edge, number]>

/** Splits by Node and kind, per pass: routing, outcomes and held time all ask for the same ones. */
export const splits = new WeakMap<Inputs, Map<GameNode, Map<Kind, Split>>>()

export const splitOf = (inputs: Inputs, node: GameNode, kind: Kind): Split => {
  let byNode = splits.get(inputs)
  if (!byNode) {
    byNode = new Map()
    splits.set(inputs, byNode)
  }
  let byKind = byNode.get(node)
  if (!byKind) {
    byKind = new Map()
    byNode.set(node, byKind)
  }
  let split = byKind.get(kind)
  if (!split) {
    split = splitFor(inputs, node, kind)
    byKind.set(kind, split)
  }
  return split
}

/** The Edges out of a Node that can take a kind, per Graph: they do not change during a solve. */
export const takersByGraph = new WeakMap<Graph, Map<GameNode, Map<Kind, ReadonlyArray<Edge>>>>()

export const takersOf = (graph: Graph, node: GameNode, kind: Kind): ReadonlyArray<Edge> => {
  let byNode = takersByGraph.get(graph)
  if (!byNode) {
    byNode = new Map()
    takersByGraph.set(graph, byNode)
  }
  let byKind = byNode.get(node)
  if (!byKind) {
    byKind = new Map()
    byNode.set(node, byKind)
  }
  let takers = byKind.get(kind)
  if (!takers) {
    const linked = (graph.out.get(node.id) ?? []).filter(
      (edge) => accepts(edge.to, kind) && carries(node, edge, kind),
    )
    // A Node built for the kind takes it from one that only falls back to it.
    const own = linked.filter((edge) => !COMPONENTS[edge.to.type].fallback.includes(kind))
    takers = own.length > 0 ? own : linked
    byKind.set(kind, takers)
  }
  return takers
}

/** The share of `kind` each Edge out of `node` takes in this pass. */
export const splitFor = (inputs: Inputs, node: GameNode, kind: Kind): Split => {
  const { game, graph } = inputs
  // A drained Node is out of rotation at once: the router plans the drain, so it waits for no
  // health check. With nowhere left to send the request, it is stranded (11 "Drain a Node").
  // A Read Replica that no Database ships its log to copies nothing, so it takes no query.
  const takers = takersOf(graph, node, kind).filter(
    (edge) =>
      edge.to.service._tag !== 'Draining' &&
      (edge.to.type !== 'replica' || primaryOf(game, edge.to)),
  )
  if (takers.length === 0) return []
  const even = (live: ReadonlyArray<Edge>) => live.map((edge) => [edge, 1 / live.length] as const)
  if (node.type === 'dns') {
    // DNS round robin splits evenly. With health checks, a dead host leaves once its TTL runs out.
    const live = graph.healthChecked
      ? takers.filter((edge) => !noticed(graph, edge.to, node.ttl))
      : takers
    return even(live.length > 0 ? live : takers)
  }
  if (node.type !== 'lb') return weighted(takers, (edge) => inputs.weights[edge.toAt])
  // A Load Balancer notices a dead host at its next health check. A deep check also takes out
  // servers whose database is down or overloaded, even when that leaves none.
  const up = takers.filter((edge) => !noticed(graph, edge.to, node.checkEvery))
  const checked = up.length > 0 ? up : takers
  const healthy =
    node.deepCheck && graph.healthChecked
      ? checked.filter((edge) => !inputs.sick[edge.toAt])
      : checked
  if (healthy.length === 0) return []
  // A dead host the checks have not caught yet still looks as big as it was.
  const live = (edge: Edge) =>
    isDown(edge.to) ? inputs.nominal[edge.toAt] : inputs.weights[edge.toAt]
  const policy =
    has(game, 'lb-algorithms') || node.policy === 'round-robin' ? node.policy : 'weighted'
  const base = ((): Split => {
    switch (policy) {
      case 'round-robin':
        return even(healthy)
      case 'weighted':
        return weighted(healthy, (edge) => inputs.nominal[edge.toAt])
      case 'least-conn':
        return weighted(healthy, live)
      // Consistent hashing places each key on a ring of the targets: every target takes an equal
      // share of the keys, whatever its load, and a target that leaves moves only its own keys.
      case 'hash':
        return even(healthy)
      case 'p2c': {
        const spread = 1 / healthy.length
        return weighted(healthy, live).map(
          ([edge, share]) => [edge, (1 - P2C_IMBALANCE) * share + P2C_IMBALANCE * spread] as const,
        )
      }
    }
  })()
  return node.sticky ? pinned(takers, base) : base
}

/**
 * Sticky sessions (05 "Load Balancer"): a share of the traffic belongs to users already pinned to a
 * target, wherever the algorithm would send them now. The oldest target holds the most of them,
 * each later one `STICKY_DECAY` times the one before, and a dead target keeps its users: the
 * Load Balancer sends them to it, and they lose their session.
 */
export const pinned = (targets: ReadonlyArray<Edge>, base: Split): Split => {
  const weights: Array<number> = []
  let weight = 1
  let sum = 0
  for (let index = 0; index < targets.length; index += 1) {
    weights.push(weight)
    sum += weight
    weight *= STICKY_DECAY
  }
  const algorithm = new Map(base.map(([edge, share]) => [edge, share] as const))
  return targets.map(
    (edge, index) =>
      [
        edge,
        (1 - STICKY_SHARE) * (algorithm.get(edge) ?? 0) +
          (STICKY_SHARE * (weights[index] ?? 0)) / sum,
      ] as const,
  )
}

export const weighted = (
  targets: ReadonlyArray<Edge>,
  weightOf: (edge: Edge) => number | undefined,
): Split => {
  const raw = targets.map((edge) => {
    const weight = weightOf(edge) ?? 1
    return Number.isFinite(weight) ? Math.max(weight, 1e-6) : 1e9
  })
  const sum = raw.reduce((total, weight) => total + weight, 0)
  return targets.map((edge, index) => [edge, (raw[index] ?? 0) / sum] as const)
}
