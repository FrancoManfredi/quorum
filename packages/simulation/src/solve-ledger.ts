import {
  ANALYTICS_CAPACITY,
  BACKEND_KB,
  EGRESS_CDN,
  EGRESS_CROSS_ZONE,
  EGRESS_ORIGIN,
  PSP_FIXED,
  SECOND_PROVIDER_FEE,
  PSP_RATE,
  EGRESS_CROSS_REGION,
  MSGP_PRICE,
  GATEWAY_PRICE,
  QUEUE_MESSAGE_PRICE,
  LLM_PRICE,
  SCAN_PRICE,
  STORAGE_CLASSES,
  TOKENS_PER_PROMPT,
  MONEY_KINDS,
  LATENCY_REGRESSION_MS,
  COMPONENTS,
  DIURNAL_AMPLITUDE,
  FRAMEWORKS,
  FAILURE_YIELD,
  INSIGHT_YIELD,
  KINDS,
  LANGUAGES,
  PROFILES,
  REQUEST_KINDS,
  RUNTIMES,
  TASK_RETRY_SECONDS,
  MESH_INSIGHT,
  JVM_INSIGHT,
  isBackendKind,
  DEVICES,
  DEVICE_INFO,
  type DeviceId,
  type InsightPool,
  type Kind,
  type RegionId,
  type RequestKind,
} from './catalog.ts'
import { earnsInTime, insightPerk, ventureOf } from './founding.ts'
import { NO_RESOURCES } from './capacity.ts'
import {
  ERROR_CAUSES,
  NO_FAILURES,
  taskAttempts,
  taskLost,
  apdexOf,
  blend,
  failed,
  hop,
  meanOf,
  percentile,
  through,
  type ErrorCause,
  type Outcome,
} from './distribution.ts'
import { marketOf, subscriptionsOf, valueFactor } from './features.ts'
import type {
  KindLedger,
  Ledger,
  LinkLedger,
  NodeLedger,
  NodeStatus,
  RegionKindLedger,
} from './ledger.ts'
import {
  burnOf,
  burnSharesOf,
  edgeBurnOf,
  eraOf,
  grown,
  has,
  isDown,
  languageOf,
  meshOf,
  serverlessBurnOf,
  storageRequestBurnOf,
  zoneMs,
} from './lookups.ts'
import {
  slotOf,
  accepts,
  cdnHitOf,
  evictionShareOf,
  gatewayShare,
  type Pass,
  type Rates,
} from './rules.ts'
import { isGlobal, regional, userHopMs, type UserRoute } from './regions.ts'
import { NO_INSIGHT, type Game, type GameLink, type GameNode } from './state.ts'
import { payrollOf, serviceOfKind } from './team.ts'
import { ventureDiurnal, ventureWeekly } from './solve-demand.ts'
import { type Edge, type Graph, NO_POLICY, edgeOf, carriedOn, originsOf } from './solve-graph.ts'
import { attemptsAllowed } from './solve-pass.ts'
import { outcomesOf, meanServiceOf } from './solve-outcomes.ts'

/* ---------- the solve ---------- */

export const statusOf = (
  node: GameNode,
  inbound: number,
  utilization: number,
  trouble: boolean,
): NodeStatus =>
  isDown(node)
    ? 'down'
    : inbound <= 0
      ? 'idle'
      : utilization >= 0.9
        ? 'danger'
        : utilization >= 0.7 || trouble
          ? 'warn'
          : 'ok'

/** A deep health check fails when a database behind the server is down or overloaded. */
export const databaseSick = (graph: Graph, pass: Pass, server: GameNode): boolean => {
  const seen = new Set<string>()
  const visit = (node: GameNode): boolean =>
    (graph.routes.get(node.id) ?? []).some((child) => {
      if (seen.has(child.id) || !(accepts(child, 'q-read') || accepts(child, 'q-write')))
        return false
      seen.add(child.id)
      if (isDown(child)) return true
      if (
        (child.type === 'database' || child.type === 'replica') &&
        (pass.models[slotOf(pass, child)]?.utilization ?? 0) >= 1
      )
        return true
      return visit(child)
    })
  return visit(server)
}

export const sumRates = (rates: Rates): number =>
  Object.values(rates).reduce((total, rate) => total + (rate ?? 0), 0)

export const completionsOf = (game: Game, pass: Pass, outcomes: ReturnType<typeof outcomesOf>) => {
  const enqueued: Partial<Record<RequestKind, number>> = {}
  const scored: Partial<Record<RequestKind, number>> = {}
  const waits = new Map<string, number>()
  for (const queue of game.nodes) {
    if (queue.type !== 'queue') continue
    const slot = slotOf(pass, queue)
    const drained = pass.drained[slot] ?? 0
    const wait =
      queue.depth <= 0 ? 0 : drained > 0 ? queue.depth / drained : Number.POSITIVE_INFINITY
    waits.set(queue.id, wait)
    const tasks = pass.tasks[slot]
    if (!tasks || isDown(queue)) continue
    const worker = outcomes.downstream(queue, 'task')
    // A task a busy Worker dropped waits in the Queue: the wait counts it, not the attempts.
    const failure = Math.min(1, Math.max(0, 1 - worker.success - worker.fail.dropped))
    const allowed = attemptsAllowed(queue)
    const lost = taskLost(failure, allowed)
    const extra = taskAttempts(failure, allowed) - 1
    const done: Outcome =
      wait === Number.POSITIVE_INFINITY || worker.fail.stranded >= 1
        ? failed('stranded')
        : {
            ...worker,
            success: 1 - lost,
            fixed: worker.fixed + (wait + extra * TASK_RETRY_SECONDS) * 1000,
            fail: { ...NO_FAILURES, upstream: lost },
          }
    for (const kind of Object.keys(tasks) as Array<RequestKind>) {
      const target = PROFILES[kind].completion
      const rate = tasks[kind] ?? 0
      if (!target || rate <= 0) continue
      enqueued[kind] = (enqueued[kind] ?? 0) + rate
      scored[kind] = (scored[kind] ?? 0) + rate * done.success * apdexOf(done, target)
    }
  }
  return { enqueued, scored, waits }
}

/** One region's answer to a request kind, with and without its users' hop. */
export type RouteAnswer = Readonly<{ entry: UserRoute; answer: Outcome; raw: Outcome }>

/** Attribute a tap's sampled volume to its source's incoming operations, not routed calls. */
export const sampledTraffic = (source: NodeLedger | undefined, rate: number): Rates => {
  const traffic: Rates = {}
  if (!source || source.inbound <= 0) return traffic
  const scale = ((source.inbound - source.dropped) / source.inbound) * rate
  for (const kind of Object.keys(source.traffic) as Array<Kind>)
    traffic[kind] = (source.traffic[kind] ?? 0) * scale
  return traffic
}

export const ledgerOf = (
  game: Game,
  graph: Graph,
  demand: Partial<Record<RequestKind, number>>,
  pass: Pass,
  outcomes: ReturnType<typeof outcomesOf>,
  routes: ReadonlyArray<UserRoute>,
): Ledger => {
  // A latency regression puts every answer this much further out (13 "Ventures", Ad tech).
  const regressed = game.incident?.kind === 'latency-regression' ? LATENCY_REGRESSION_MS : 0
  /** What one request of `kind` gets back for each region's users, and what it would with no user hop. */
  const answersOf = (kind: RequestKind): ReadonlyArray<RouteAnswer> =>
    routes.map((entry) => {
      const raw = entry.source ? outcomes.outcome(entry.source, kind) : failed('stranded')
      const extraMs = userHopMs(game, entry.extraMs, kind) + regressed
      return {
        entry,
        raw,
        answer: extraMs > 0 ? through(hop({ fixed: extraMs }), [[raw, 1]]) : raw,
      }
    })
  /** What one request of `kind` gets back, over every region's users. */
  const answerOf = (answers: ReadonlyArray<RouteAnswer>, kind: RequestKind): Outcome => {
    const only = answers.length === 1 ? answers[0] : undefined
    if (only && userHopMs(game, only.entry.extraMs, kind) + regressed === 0) return only.answer
    return (
      blend(answers.map(({ entry, answer }) => [answer, entry.share] as const)) ??
      failed('stranded')
    )
  }
  // Each region's users get their own Apdex (04 "Users and growth"), and their own rows for the
  // Churn breakdown (12 "The Churn breakdown").
  const regionRate: Partial<Record<RegionId, number>> = {}
  const regionSatisfied: Partial<Record<RegionId, number>> = {}
  const regionKinds: Partial<Record<RegionId, Partial<Record<RequestKind, RegionKindLedger>>>> = {}

  const completion = completionsOf(game, pass, outcomes)

  // What users get back, per kind.
  const kinds: Partial<Record<RequestKind, KindLedger>> = {}
  const errors: Record<ErrorCause, number> = { ...NO_FAILURES }
  const mixture: Array<readonly [Outcome, number]> = []
  let rateTotal = 0
  let served = 0
  let satisfied = 0
  let revenue = 0
  let fines = 0
  let latencyWeight = 0
  const failing: Array<RequestKind> = []
  for (const kind of REQUEST_KINDS) {
    const rate = demand[kind] ?? 0
    if (rate <= 0) continue
    const answers = answersOf(kind)
    const result = answerOf(answers, kind)
    // The part that went through a Queue is also scored on when its result is ready.
    const enqueued = completion.enqueued[kind] ?? 0
    const done = enqueued > 0 ? (completion.scored[kind] ?? 0) / enqueued : null
    const async =
      done === null || result.success <= 0 ? 0 : Math.min(1, enqueued / (rate * result.success))
    const finish = 1 - async + async * (done ?? 1)
    const apdex = apdexOf(result, PROFILES[kind].apdex) * finish
    kinds[kind] = {
      rate,
      success: result.success,
      apdex,
      completion: done,
      mean: meanOf(result),
      p50: percentile(result, 0.5),
      p95: percentile(result, 0.95),
      p99: percentile(result, 0.99),
    }
    // Bots earn nothing and do not count toward Apdex or errors: blocking one is a success.
    if (!PROFILES[kind].scored) continue
    for (const { entry, answer, raw } of answers) {
      const sent = rate * entry.share
      const region = entry.region
      // Each region's users wait for queued work as long as everyone else.
      const own = answer === result ? apdex : apdexOf(answer, PROFILES[kind].apdex) * finish
      regionRate[region] = (regionRate[region] ?? 0) + sent
      regionSatisfied[region] = (regionSatisfied[region] ?? 0) + sent * answer.success * own
      regionKinds[region] = {
        ...regionKinds[region],
        [kind]: {
          rate: sent,
          success: answer.success,
          apdex: own,
          near: raw === answer ? own : apdexOf(raw, PROFILES[kind].apdex) * finish,
          fail: answer.fail,
          hopMs: userHopMs(game, entry.extraMs, kind),
          p99: percentile(answer, 0.99),
        },
      }
    }
    rateTotal += rate
    served += rate * result.success
    satisfied += rate * result.success * apdex
    const mean = meanOf(result)
    // A request that misses the Venture's deadline earns nothing (13 "Ventures", Ad tech).
    revenue +=
      rate *
      result.success *
      apdex *
      KINDS[kind].value *
      result.value *
      valueFactor(game, kind) *
      (earnsInTime(game, mean) ? 1 : 0)
    latencyWeight += rate * result.success * mean
    for (const cause of ERROR_CAUSES) errors[cause] += rate * result.fail[cause]
    // Fintech fines a stale answer to a money kind (13 "Ventures").
    if (!game.sandbox && MONEY_KINDS.includes(kind))
      fines += rate * result.fail.stale * KINDS[kind].value * ventureOf(game).constraint.staleFine
    if (result.success > 0) mixture.push([result, rate * result.success])
    if (result.success < 0.05 && result.fail.stranded >= 0.5) failing.push(kind)
  }
  const overall = blend(mixture)

  // Node ledgers.
  const nodes: Record<string, NodeLedger> = {}
  for (const node of game.nodes) {
    const slot = slotOf(pass, node)
    const rates = pass.arriving[slot] ?? {}
    const model = pass.models[slot]
    const inbound = sumRates(rates)
    const share = isDown(node) ? 0 : (model?.share ?? 1)
    const pool = pass.connections[slot] ?? null
    const refusedShare = pool && pool.used > pool.max ? 1 - pool.max / pool.used : 0
    const strand = pass.stranded[slot]
    const out: Rates = {}
    for (const child of graph.routes.get(node.id) ?? []) {
      const carried = carriedOn(graph, pass, node.id, child.id)
      for (const [kind, rate] of Object.entries(carried) as Array<[Kind, number]>)
        out[kind] = (out[kind] ?? 0) + rate
    }
    const kindsHere = Object.keys(rates) as Array<Kind>
    // Each kind's own hop time at this Node, before it is blended into `latency` (12 "The
    // visibility ladder", `tracing`): the waterfall needs a Node's time split by kind.
    const hopByKind: Partial<Record<Kind, number>> = {}
    for (const kind of kindsHere) {
      const service = model?.service[kind]
      if (service) hopByKind[kind] = service.fixed + service.variable
    }
    const latency =
      inbound > 0 && model
        ? kindsHere.reduce(
            (total, kind) => total + (rates[kind] ?? 0) * (hopByKind[kind] ?? 0),
            0,
          ) / inbound
        : 0
    // A Queue's wait applies to every kind it holds; every other Node waits for nothing.
    const queueTasks = node.type === 'queue' ? (pass.tasks[slot] ?? {}) : null
    const queueWait = node.type === 'queue' ? (completion.waits.get(node.id) ?? 0) : 0
    const waitByKind: Partial<Record<Kind, number>> = {}
    if (queueTasks)
      for (const kind of Object.keys(queueTasks) as Array<RequestKind>)
        if ((queueTasks[kind] ?? 0) > 0) waitByKind[kind] = queueWait
    // The slowest 1% of this Node's own time, for its busiest kind.
    const busiest = kindsHere.reduce<Kind | null>(
      (best, kind) => (best === null || (rates[kind] ?? 0) > (rates[best] ?? 0) ? kind : best),
      null,
    )
    const own = busiest && model?.service[busiest]
    const p99 =
      inbound > 0 && model && own
        ? percentile(
            through(
              hop({
                fixed: own.fixed,
                variable: own.variable,
                tailP: model.tailP,
                tailMs: model.tailMs,
              }),
            ),
            0.99,
          )
        : 0
    const utilization =
      refusedShare > 0
        ? Math.max(model?.utilization ?? 0, 1 / (1 - refusedShare))
        : (model?.utilization ?? 0)
    nodes[node.id] = {
      inbound,
      traffic: rates,
      capacity: model && inbound > 0 ? model.capacity : 0,
      utilization,
      limit: refusedShare > 0 ? 'connections' : (model?.limit ?? 'none'),
      latency,
      p99,
      hopByKind,
      waitByKind,
      dropped: inbound * (1 - share),
      refused: inbound * share * refusedShare,
      stranded: strand?.rate ?? 0,
      strandedKinds: strand ? [...strand.kinds] : [],
      connections: pool,
      hitRatio: node.type === 'cache' || node.type === 'cdn' ? (pass.hits[slot] ?? 0) : null,
      evictions:
        node.type === 'cache'
          ? (rates['q-read'] ?? 0) * (1 - (pass.hits[slot] ?? 0)) * evictionShareOf(game, node)
          : null,
      age:
        node.type === 'queue' || node.type === 'log' ? (completion.waits.get(node.id) ?? 0) : null,
      lag: node.type === 'replica' ? pass.lag : null,
      disk: model?.disk ?? false,
      out,
      resources: model?.resources ?? NO_RESOURCES,
      throttled: model?.throttled ?? false,
      swapping: model?.swapping ?? false,
      status: statusOf(node, inbound, utilization, (strand?.rate ?? 0) > 0 || refusedShare > 0),
    }
  }

  // Analytics turns sampled traffic into Insight of each request kind (12 "Earning Insight").
  const apdex = rateTotal > 0 ? satisfied / rateTotal : 1
  const origins = originsOf(graph, pass)
  const sampledBy = new Map<string, number>()
  // The share of each key's samples that came from a Node a Service Mesh watches: per-Link metrics
  // without code changes earn Insight on top of it (05 "Service Mesh": +20%).
  const meshedBy = new Map<string, number>()
  // The share that came from a Java App Server: its profilers (Java Flight Recorder) expose more.
  const profiledBy = new Map<string, number>()
  const failedBy = new Map<string, number>()
  // The regions each request kind is sampled in: Real user monitoring needs two of them.
  const regionsBy = new Map<RequestKind, Set<RegionId>>()
  for (const [tapId, sources] of graph.taps) {
    const tap = graph.byId.get(tapId)
    if (!tap) continue
    const rate = tap.sampleRate
    const volume = sources.reduce((total, source) => {
      const entry = nodes[source]
      return total + (entry ? entry.inbound - entry.dropped : 0)
    }, 0)
    const traffic: Rates = {}
    for (const source of sources) {
      const sampled = sampledTraffic(nodes[source], rate)
      for (const kind of Object.keys(sampled) as Array<Kind>)
        traffic[kind] = (traffic[kind] ?? 0) + (sampled[kind] ?? 0)
    }
    const capacity = grown(ANALYTICS_CAPACITY, 2, tap.size - 1)
    // Samples beyond the tap's capacity are dropped, evenly.
    const kept = isDown(tap) || volume * rate <= 0 ? 0 : Math.min(1, capacity / (volume * rate))
    for (const source of sources) {
      const entry = nodes[source]
      const from = graph.byId.get(source)
      if (!entry || !from || kept <= 0) continue
      const done = (entry.inbound - entry.dropped) * rate * kept
      for (const [kind, share] of origins.get(source) ?? []) {
        const samples = done * share
        if (samples <= 0) continue
        const key = `${from.type}:${kind}`
        const seen = regionsBy.get(kind as RequestKind) ?? new Set<RegionId>()
        seen.add(from.region)
        regionsBy.set(kind as RequestKind, seen)
        sampledBy.set(key, (sampledBy.get(key) ?? 0) + samples)
        if (meshOf(game, from)) meshedBy.set(key, (meshedBy.get(key) ?? 0) + samples)
        if (from.type === 'server' && RUNTIMES[from.runtime].language === 'java')
          profiledBy.set(key, (profiledBy.get(key) ?? 0) + samples)
        // A request that fails or frustrates its user teaches Failure, a tolerated one half.
        const answer = kinds[kind]
        if (answer && PROFILES[kind].scored)
          failedBy.set(
            from.type,
            (failedBy.get(from.type) ?? 0) + samples * (1 - answer.success * answer.apdex),
          )
      }
    }
    nodes[tapId] = {
      ...(nodes[tapId] as NodeLedger),
      inbound: volume * rate,
      traffic,
      capacity,
      utilization: capacity > 0 ? (volume * rate) / capacity : 0,
      limit: volume * rate > capacity ? 'throughput' : 'none',
      status: statusOf(tap, volume, capacity > 0 ? (volume * rate) / capacity : 0, false),
    }
  }
  // The square root per Component type and kind: a broad Design teaches more than a big one.
  const perk = insightPerk(game)
  const insight: Record<InsightPool, number> = { ...NO_INSIGHT }
  const breadth: Partial<Record<RequestKind, number>> = {}
  for (const [key, samples] of sampledBy) {
    const kind = key.slice(key.indexOf(':') + 1) as RequestKind
    // A mesh watches each Link, so the samples from its members earn their 20% again, under the
    // same square root: a Design where every sampled Node is meshed earns a full 20% more.
    const watched = meshedBy.get(key) ?? 0
    // Mature JVM tooling earns the same 25% on the samples from its servers (06 "Java").
    const profiled = profiledBy.get(key) ?? 0
    insight[kind] +=
      INSIGHT_YIELD *
      (Math.sqrt(samples) + MESH_INSIGHT * Math.sqrt(watched) + JVM_INSIGHT * Math.sqrt(profiled)) *
      perk
    breadth[kind] = (breadth[kind] ?? 0) + 1
  }
  // Tail-based sampling keeps the failed traces instead of dropping most of them with the rest
  // (12 "Earning Insight", `tail-sampling`): twice the Failure Insight for the same failures.
  const tailSampled = has(game, 'tail-sampling') ? 2 : 1
  for (const failed of failedBy.values())
    insight.failure +=
      INSIGHT_YIELD * FAILURE_YIELD * Math.sqrt(Math.max(0, failed)) * perk * tailSampled

  const links: Array<LinkLedger> = game.links.map((link) => {
    const to = graph.byId.get(link.to)
    if (to && COMPONENTS[to.type].tap) {
      const source = nodes[link.from]
      return {
        ...link,
        rate: source ? (source.inbound - source.dropped) * 0.15 : 0,
        traffic: sampledTraffic(source, 0.15),
        kind: 'page',
        failing: false,
        failure: 0,
      }
    }
    const carried = carriedOn(graph, pass, link.from, link.to)
    const entries = Object.entries(carried) as Array<[Kind, number]>
    const top = entries.reduce<[Kind, number]>(
      (best, entry) => (entry[1] > best[1] ? entry : best),
      ['page', -1],
    )
    const target = nodes[link.to]
    const rate = entries.reduce((total, [, rate]) => total + rate, 0)
    return {
      ...link,
      rate,
      traffic: carried,
      kind: top[0],
      failing:
        !!target && (target.status === 'down' || target.refused > 0 || target.dropped > 0.01),
      failure: linkFailure(game, graph, outcomes, link, entries, rate),
    }
  })

  // Velocity: how fast the Stack ships, which sets the Team's Dev Hours.
  const servers = game.nodes.filter((node) => node.type === 'server')
  const traffic = servers.reduce((total, node) => total + (nodes[node.id]?.inbound ?? 0), 0)
  const velocity =
    servers.length === 0
      ? 1
      : servers.reduce((total, node) => {
          const weight = traffic > 0 ? (nodes[node.id]?.inbound ?? 0) / traffic : 1 / servers.length
          return (
            total +
            weight *
              LANGUAGES[languageOf(node)].velocity *
              FRAMEWORKS[node.framework].velocity *
              (RUNTIMES[node.runtime].velocity ?? 1)
          )
        }, 0)

  // Egress (09 "Egress"): bytes App Servers send to the internet, and pages a CDN answers at the edge.
  // Billed from Seed: before it, the smallest box costs more than every byte the Company sends.
  // Egress optimization moves `upload` and `media` onto an R2-priced Object Storage variant,
  // which reaches the internet at $0 instead of the origin price (09 "Egress", `egress-optimization`).
  const r2 = has(game, 'egress-optimization')
  let egress = 0
  if (game.stage >= 2) {
    for (const node of game.nodes) {
      if (node.type === 'server') {
        const own = nodes[node.id]
        const bytes = own?.resources.network?.used ?? 0
        // The share of this Node's own traffic that Object Storage serves: its payload rides
        // R2's $0 egress once the Node links to a storage Node.
        const r2Share =
          r2 &&
          own &&
          own.inbound > 0 &&
          (graph.routes.get(node.id) ?? []).some(
            (child) => child.type === 'storage' && child.storeVariant === 'r2',
          )
            ? ((own.traffic.upload ?? 0) + (own.traffic.media ?? 0)) / own.inbound
            : 0
        egress += ((bytes * (1 - r2Share)) / 1_000_000) * EGRESS_ORIGIN
      }
      if (node.type === 'cdn' && !isDown(node)) {
        const rates = pass.arriving[slotOf(pass, node)] ?? {}
        for (const kind of REQUEST_KINDS)
          egress +=
            (((rates[kind] ?? 0) * cdnHitOf(node, kind, game) * PROFILES[kind].payloadKB) /
              1_000_000) *
            EGRESS_CDN
      }
    }
    // Traffic between zones bills both ways: requests at their payload, backend calls at 4 KB.
    for (const index of pass.linkOrder) {
      const { from: source, to: target } = graph.edges[index] as Edge
      const carried = pass.links[index] as Rates
      // Between regions (09 "Egress": $0.02/GB); global Components are reached at no charge.
      const crossRegion = source.region !== target.region && !isGlobal(source) && !isGlobal(target)
      if (!crossRegion && zoneMs(source, target) === 0) continue
      for (const [kind, rate] of Object.entries(carried) as Array<[Kind, number]>) {
        const kb = isBackendKind(kind) ? BACKEND_KB : PROFILES[kind as RequestKind].payloadKB
        egress += crossRegion
          ? ((rate * kb) / 1_000_000) * EGRESS_CROSS_REGION
          : ((rate * kb) / 1_000_000) * EGRESS_CROSS_ZONE * 2
      }
    }
    egress *= eraOf(game).costIndex * ventureOf(game).constraint.egress
  }

  // Object Storage's class (07 "Object Storage"): an infrequent-access object bills a retrieval fee
  // per GB read back. An archive-class read has already failed as a timeout, and bills nothing.
  let retrieval = 0
  for (const node of game.nodes) {
    if (node.type !== 'storage' || isDown(node)) continue
    const fee = STORAGE_CLASSES[node.storageClass].retrieval
    if (fee <= 0) continue
    const reads = pass.arriving[slotOf(pass, node)]?.['blob-get'] ?? 0
    retrieval += ((reads * PROFILES.media.payloadKB) / 1_000_000) * fee * eraOf(game).costIndex
  }

  // Third parties (09 "Third-party fees"): the Payment Provider takes a share of each checkout
  // and a fixed part. Both are real dollars on a real-dollar checkout, so the cost index skips them.
  const checkouts = kinds.buy ? kinds.buy.rate * kinds.buy.success : 0
  const fees =
    checkouts > 0
      ? checkouts *
        (KINDS.buy.value * valueFactor(game, 'buy') * PSP_RATE + PSP_FIXED) *
        (game.nodes.some((node) => node.type === 'psp' && node.provider === 'second')
          ? SECOND_PROVIDER_FEE
          : 1)
      : 0

  // A Data Warehouse bills each scan; the LLM API bills each token (09 "Pricing models").
  let usage = 0
  for (const node of game.nodes) {
    const done = (nodes[node.id]?.inbound ?? 0) - (nodes[node.id]?.dropped ?? 0)
    if (done <= 0 || isDown(node)) continue
    if (node.type === 'warehouse') usage += done * SCAN_PRICE
    if (node.type === 'llm') usage += ((done * TOKENS_PER_PROMPT) / 1_000) * LLM_PRICE
    if (node.type === 'msgp') usage += done * MSGP_PRICE
  }
  const thirdParty = usage > 0 ? fees + usage * eraOf(game).costIndex : fees

  // An API Gateway, a Serverless Function and an Edge Function bill each request on the Requests
  // line (09 "The cloud bill"), × cost index. A function's uses also bill the GB-seconds its
  // executions ran, so a slow call to a data tier shows up on it.
  let requests = 0
  const index = eraOf(game).costIndex
  for (const node of game.nodes) {
    if (isDown(node)) continue
    const done = (nodes[node.id]?.inbound ?? 0) - (nodes[node.id]?.dropped ?? 0)
    if (done <= 0) continue
    if (node.type === 'gw') {
      const arriving = pass.arriving[slotOf(pass, node)] ?? {}
      requests += done * gatewayShare(node, arriving) * GATEWAY_PRICE * index
    }
    if (node.type === 'fn')
      requests += serverlessBurnOf(game, node, done, meanServiceOf(pass, node))
    if (node.type === 'edge') requests += edgeBurnOf(game, node, done)
    // Object Storage bills each read and write at its product's price, and a Queue each task as a
    // message (09 "Base prices").
    if (node.type === 'storage') {
      const arriving = pass.arriving[slotOf(pass, node)] ?? {}
      requests +=
        storageRequestBurnOf(node, arriving['blob-get'] ?? 0, arriving['blob-put'] ?? 0) * index
    }
    if (node.type === 'queue') requests += done * QUEUE_MESSAGE_PRICE * index
  }

  const subscriptions = subscriptionsOf(game)
  const salaries = payrollOf(game)
  const shares = burnSharesOf(game)
  const errorTotal = ERROR_CAUSES.reduce((total, cause) => total + errors[cause], 0)
  const totalBurn =
    (thirdParty > 0
      ? game.nodes.reduce((total, node) => total + burnOf(game, node), 0) + thirdParty
      : game.nodes.reduce((total, node) => total + burnOf(game, node), 0)) +
    salaries +
    egress +
    retrieval +
    requests
  // Unit economics splits Burn across kinds by their share of demand, then costs each kind's
  // own served rate (10 "Track: Cost", `unit-economics`); cost allocation rolls that up by the
  // Service each kind's code lives in (10 "Track: Cost", `cost-allocation`).
  const costPerKind: Partial<Record<RequestKind, number>> = {}
  const costPerService: Partial<Record<string, number>> = {}
  const serviceWork: Record<
    string,
    {
      kinds: Array<RequestKind>
      rate: number
      served: number
      satisfied: number
      latency: number
      p99: number
    }
  > = {}
  for (const service of game.services)
    serviceWork[service.id] = { kinds: [], rate: 0, served: 0, satisfied: 0, latency: 0, p99: 0 }
  for (const kind of REQUEST_KINDS) {
    const entry = kinds[kind]
    if (!entry || entry.rate <= 0) continue
    const service = serviceOfKind(game, kind).id
    const work = serviceWork[service]
    if (work) {
      const servedRate = entry.rate * entry.success
      work.kinds.push(kind)
      work.rate += entry.rate
      work.served += servedRate
      work.satisfied += entry.rate * entry.apdex
      work.latency += servedRate * entry.mean
      work.p99 = Math.max(work.p99, entry.p99)
    }
    if (rateTotal > 0 && totalBurn > 0) {
      const kindBurn = totalBurn * (entry.rate / rateTotal)
      const servedRate = entry.rate * entry.success
      if (servedRate > 0) costPerKind[kind] = kindBurn / servedRate
      costPerService[service] = (costPerService[service] ?? 0) + kindBurn
    }
  }
  const services = Object.fromEntries(
    Object.entries(serviceWork).map(([id, work]) => [
      id,
      {
        kinds: work.kinds,
        rate: work.rate,
        served: work.served,
        failed: work.rate - work.served,
        apdex: work.rate > 0 ? work.satisfied / work.rate : 1,
        mean: work.served > 0 ? work.latency / work.served : 0,
        p99: work.p99,
      },
    ]),
  )
  return {
    nodes,
    links,
    kinds,
    demand: rateTotal,
    served,
    errors,
    errorShare: rateTotal > 0 ? errorTotal / rateTotal : 0,
    latency: served > 0 ? latencyWeight / served : 0,
    p50: overall ? percentile(overall, 0.5) : 0,
    p95: overall ? percentile(overall, 0.95) : 0,
    p99: overall ? percentile(overall, 0.99) : 0,
    apdex,
    regions: Object.fromEntries(
      Object.entries(regionRate).map(([region, sent]) => [
        region,
        sent > 0 ? (regionSatisfied[region as RegionId] ?? 0) / sent : 1,
      ]),
    ),
    deviceLatency: Object.fromEntries(
      DEVICES.map((device) => [
        device,
        (served > 0 ? latencyWeight / served : 0) + DEVICE_INFO[device].rttMs,
      ]),
    ) as Record<DeviceId, number>,
    regionKinds,
    revenue: revenue + subscriptions,
    subscriptions,
    insight,
    breadth,
    breadthRegions: Object.fromEntries(
      [...regionsBy].map(([kind, regions]) => [kind, regions.size]),
    ),
    burn: totalBurn,
    fines,
    salaries,
    egress,
    fees: thirdParty,
    burnLines: {
      compute: shares.compute,
      data: shares.data,
      storage: shares.storage + retrieval,
      egress,
      thirdParty,
      requests,
      observability: shares.observability,
      salaries,
    },
    costPerKind,
    costPerService,
    services,
    market: marketOf(game),
    velocity,
    failing,
    forecastPeak: forecastPeakOf(game, rateTotal),
    bottleneck: null,
    bottleneckByKind: bottleneckByKindOf(game, nodes),
  }
}

/**
 * Projects today's demand to tomorrow's peak hour, using the known diurnal cycle instead of a
 * statistical fit (10 "Track: Observability", `anomaly-detection`). A Company with no diurnal
 * cycle (a Sandbox with no daily cycle, or a regional Company) reports the current demand: the
 * cycle this function reads is the single-region, non-regional cycle `demandOf` also uses.
 */
export const forecastPeakOf = (game: Game, demand: number): number => {
  if (demand <= 0 || regional(game) || (game.sandbox && !game.scenario?.daily)) return demand
  const now = ventureDiurnal(game) * ventureWeekly(game)
  const peak = (1 + DIURNAL_AMPLITUDE) * ventureWeekly(game)
  return now > 0 ? demand * (peak / now) : demand
}

/**
 * The most utilized limiting Node on each request kind's own path (12 "The visibility ladder",
 * `tracing`): cheaper than `bottleneckOf`'s re-solve search, because it reads utilization and
 * traffic the Node loop already produced instead of re-solving once per kind.
 */
export const bottleneckByKindOf = (
  game: Game,
  nodes: Readonly<Record<string, NodeLedger>>,
): Partial<Record<RequestKind, string>> => {
  const byKind: Partial<Record<RequestKind, string>> = {}
  for (const kind of REQUEST_KINDS) {
    let best: string | null = null
    let bestUtilization = 0.6
    for (const node of game.nodes) {
      if (!COMPONENTS[node.type].limiting || isDown(node)) continue
      const ledger = nodes[node.id]
      if (!ledger || (ledger.traffic[kind] ?? 0) <= 0) continue
      if (ledger.utilization > bestUtilization) {
        bestUtilization = ledger.utilization
        best = node.id
      }
    }
    if (best) byKind[kind] = best
  }
  return byKind
}

/**
 * Share of calls that fail on a Link that retries or has a breaker, by what it
 * carries. Zero for every other Link: nothing reads it.
 */
export const linkFailure = (
  game: Game,
  graph: Graph,
  outcomes: ReturnType<typeof outcomesOf>,
  link: GameLink,
  entries: ReadonlyArray<readonly [Kind, number]>,
  rate: number,
): number => {
  const edge = edgeOf(graph, link.from, link.to)
  const policy = edge?.policy ?? NO_POLICY
  const watched = policy.retry !== 'none' || (link.breaker && has(game, 'circuit-breakers'))
  if (!watched || policy.open || rate <= 0 || !edge) return 0
  return entries.reduce(
    (total, [kind, carried]) => total + (carried / rate) * outcomes.failureOn(edge, kind),
    0,
  )
}
