import {
  ALERT_FATIGUE,
  ALERT_RULES,
  BREAKER_OPEN,
  BREAKER_THRESHOLD,
  APDEX_WINDOW,
  BEAM_CRASHES_PER_REQUESTS,
  BORDER_MIXING,
  CHURN,
  CREDIT_CAP,
  DECLINED_GROWTH,
  FEATURES,
  FICKLE_SHARE,
  FIRST_KIND_INSIGHT,
  FUNNEL_GROWTH,
  LIVE_TUNING,
  OOM_RATIO,
  PROFILES,
  REGION_INFO,
  REGIONS,
  REQUEST_KINDS,
  POD_REACTION,
  RUNTIMES,
  ROW_KB,
  DB_RETENTIONS,
  REPLICA_SYNC_MINUTES_PER_GB,
  SCALE_COOLDOWN,
  SCALE_QUEUE_DEPTH,
  SCALE_RPS_PER_VCPU,
  SCALE_IN,
  STEADY_CHURN,
  UPLOAD_MB,
  WRITE_BEHIND_SECONDS,
  VM_REACTION,
  CERT_FROM_STAGE,
  CERT_RENEW,
  TLS_TERMINATORS,
  DRAIN_SECONDS,
  WARMUP_SECONDS,
  SCHEDULE_LEAD_MINUTES,
  CHAOS_INSIGHT,
  DRILL_INSIGHT,
  LOAD_TEST_INSIGHT,
  NO_DEVICE_LATENCY,
  ANOMALY_DETECTION_HOLD,
  type RegionId,
  type RequestKind,
  type Tuning,
} from './catalog.ts'
import { advanceCves } from './cve.ts'
import {
  advanceIncident,
  directIncidents,
  markSignal,
  pentestWeakness,
  startIncident,
} from './director.ts'
import { advanceMirrors } from './mirror.ts'
import { StepEvent, type AlertRule } from './events.ts'
import { advanceFeatures, churnFactor, growthFactor, isFeatureLive } from './features.ts'
import { growthPerk, ventureOf } from './founding.ts'
import type { Ledger } from './ledger.ts'
import {
  certExpired,
  certLifeOf,
  certManaged,
  certNodes,
  copiesOf,
  drawerSize,
  eraOf,
  has,
  inCluster,
  isDown,
  logLoss,
  meshOf,
  restarted,
  vcpuOf,
  warmAfterRestart,
} from './lookups.ts'
import { causeOf, warming, warmOf, withWarm } from './life.ts'
import { isOpen, step as breakerStep } from './breaker-machine.ts'
import { step as scalerStep } from './autoscaler-machine.ts'
import { canRaise } from './actions.ts'
import { isDraining, step as serviceStep } from './node-service-machine.ts'
import { burnRateOf, recordBudget, slaCreditsOf, spendBudget } from './slo.ts'
import { cosTurns } from './calendar.ts'
import { calendarMinute, carryLedger, chaosRunning, solveFlow } from './solve.ts'
import { advanceDrill } from './ipo.ts'
import { advanceQuarter, QUARTER_SECONDS } from './quarters.ts'
import { advanceRunway } from './runway.ts'
import { accrue, advanceStudies } from './studies.ts'
import { perRegion, regional, regionApdexOf, regionUsers, withRegionUsers } from './regions.ts'
import type { Alarms, FalseAlarms, Game, GameLink, GameNode, PerRegion, Sample } from './state.ts'
import { applyPolicies } from './policies.ts'
import { advanceMorale, advanceTeam } from './work.ts'

/* ==========================================================================
   Time. `step` advances a Game by some seconds: money moves, credits drain,
   cold Nodes warm up, users grow or leave, incidents run, and the pager
   counts how long each alert condition has held.
   ========================================================================== */

export type StepResult = Readonly<{
  game: Game
  ledger: Ledger
  events: ReadonlyArray<StepEvent>
}>

const HISTORY = 600

/** The scored Request kind with the highest p99 this Step, or null when none was served. */
const slowestKind = (ledger: Ledger): RequestKind | null => {
  let slowest: RequestKind | null = null
  let worst = 0
  for (const kind of REQUEST_KINDS) {
    const entry = ledger.kinds[kind]
    if (!PROFILES[kind].scored || !entry || entry.rate <= 0) continue
    if (entry.p99 > worst) {
      worst = entry.p99
      slowest = kind
    }
  }
  return slowest
}

/** Users per second one region gains, before the split into fickle and steady. */
type Flow = Readonly<{ fickle: number; steady: number }>

/** Each region's share of its users who are steady. */
const steadyOf = (game: Game, region: RegionId): number => game.steady?.[region] ?? 1 - FICKLE_SHARE

/**
 * Users grow along an S-curve while Apdex beats the Era's target, and leave fast
 * when it does not (04 "Users and growth"). `pace` multiplies `g`: the live game
 * plays faster than the design. Shipped Features raise growth and the market, and
 * lower churn. From Series C each region grows toward its share of the market on
 * its own users' Apdex, and word of mouth crosses borders at `BORDER_MIXING`. New
 * users are fickle at `FICKLE_SHARE`; steady users leave at `STEADY_CHURN` of the rate.
 */
const flowsOf = (game: Game, ledger: Ledger, pace: number): Readonly<Record<RegionId, Flow>> => {
  const era = eraOf(game)
  const users = regionUsers(game)
  const split = regional(game)
  const total = REGIONS.reduce((sum, region) => sum + users[region], 0)
  const rate =
    era.growth *
    pace *
    growthFactor(game) *
    growthPerk(game) *
    (game.round._tag === 'Declined' ? DECLINED_GROWTH : 1) *
    (has(game, 'funnels') ? FUNNEL_GROWTH : 1)
  const flows = {} as Record<RegionId, Flow>
  for (const region of REGIONS) {
    const own = users[region]
    const apdex = regionApdexOf(game, region)
    const health = Math.max(-1, Math.min(1, (apdex - era.apdexTarget) / (1 - era.apdexTarget)))
    const steady = own * steadyOf(game, region)
    if (health < 0) {
      const churn = CHURN * churnFactor(game) * health
      flows[region] = { fickle: churn * (own - steady), steady: churn * STEADY_CHURN * steady }
      continue
    }
    // Data residency is required for the EU market (08 "Features"): EU data must stay in an EU
    // region, so without it the Company cannot grow there once this is a real choice to make, from
    // the Pre-IPO Era (08 "Features": Data residency's own Era) on. Earlier Eras play as they did,
    // so Series C's region split is not gated by a Feature two Eras away.
    const reachable =
      region === 'eu' &&
      split &&
      game.stage >= FEATURES['data-residency'].era &&
      !isFeatureLive(game, 'data-residency')
        ? 0
        : REGION_INFO[region].share
    const market = split ? ledger.market * reachable : ledger.market
    const talk = split ? own + BORDER_MIXING * (total - own) : own
    const growth = rate * talk * Math.max(0, 1 - own / market) * health
    flows[region] = { fickle: growth * FICKLE_SHARE, steady: growth * (1 - FICKLE_SHARE) }
  }
  return flows
}

/** Users per second each region gains, or loses below 0. */
export const regionGrowth = (game: Game, ledger: Ledger, pace = LIVE_TUNING.pace): PerRegion => {
  const flows = flowsOf(game, ledger, pace)
  return perRegion((region) => flows[region].fickle + flows[region].steady)
}

/** Users per second the Company gains, or loses below 0, over every region. */
export const growthOf = (game: Game, ledger: Ledger, pace = LIVE_TUNING.pace): number => {
  const growth = regionGrowth(game, ledger, pace)
  return REGIONS.reduce((total, region) => total + growth[region], 0)
}

/**
 * Users after `seconds`, never under 20. Offline, users grow only while the
 * errors stay inside the SLO; they still leave.
 */
const grow = (
  game: Game,
  ledger: Ledger,
  seconds: number,
  pace: number,
  offline: boolean,
): Pick<Game, 'users' | 'userShares' | 'steady'> => {
  if (game.sandbox) return game
  const flows = flowsOf(game, ledger, pace)
  const holds = !offline || ledger.errorShare <= 1 - eraOf(game).slo
  const moved = (flow: number): number => (flow <= 0 || holds ? flow * seconds : 0)
  const users = regionUsers(game)
  const steady = perRegion((region) =>
    Math.max(0, users[region] * steadyOf(game, region) + moved(flows[region].steady)),
  )
  const fickle = perRegion((region) =>
    Math.max(0, users[region] * (1 - steadyOf(game, region)) + moved(flows[region].fickle)),
  )
  const grown = perRegion((region) => steady[region] + fickle[region])
  const shares = perRegion((region) =>
    grown[region] > 0 ? steady[region] / grown[region] : steadyOf(game, region),
  )
  if (!regional(game)) {
    const total = REGIONS.reduce((sum, region) => sum + grown[region], 0)
    return { users: Math.max(20, total), userShares: game.userShares, steady: shares }
  }
  const next = withRegionUsers(game, grown)
  return { users: Math.max(20, next.users), userShares: next.userShares, steady: shares }
}

/**
 * Each region's Users after `seconds` if every region's Apdex stays where it is:
 * the forecast the Churn breakdown shows (12 "The Churn breakdown"). Runs the
 * same growth rule as the Step, in 10-second steps.
 */
export const forecastUsers = (
  game: Game,
  ledger: Ledger,
  seconds: number,
  pace = LIVE_TUNING.pace,
): PerRegion => {
  let current = game
  for (let left = seconds; left > 0; left -= FORECAST_STEP) {
    const grown = grow(
      { ...current, sandbox: false },
      ledger,
      Math.min(FORECAST_STEP, left),
      pace,
      false,
    )
    current = { ...current, ...grown }
  }
  return regionUsers(current)
}

const FORECAST_STEP = 10

/** Each region's hourly Apdex moves toward what its users get now; null before Series C. */
const regionApdexAfter = (game: Game, ledger: Ledger, seconds: number): PerRegion | null => {
  if (!regional(game)) return null
  const weight = Math.min(1, seconds / APDEX_WINDOW)
  return perRegion((region) => {
    const before = regionApdexOf(game, region)
    return before + ((ledger.regions[region] ?? before) - before) * weight
  })
}

/**
 * During a Cache stampede, refills time out while a database behind the Cache
 * is overloaded, so the Cache stays cold (11 "Cache stampede").
 */
/** Database load at which a cold Cache's refill queries start to time out. */
const REFILL_STALL = 0.9

const refillsStall = (game: Game, ledger: Ledger, node: GameNode): boolean =>
  node.type === 'cache' &&
  game.incident?.kind === 'stampede' &&
  game.links.some((link) => {
    if (link.from !== node.id) return false
    const target = game.nodes.find((entry) => entry.id === link.to)
    return (
      (target?.type === 'database' || target?.type === 'pooler') &&
      (ledger.nodes[link.to]?.utilization ?? 0) >= REFILL_STALL
    )
  })

/**
 * A Queue's backlog: tasks it accepted minus tasks its Workers took. With no
 * Worker linked, nothing drains.
 */
const depthAfter = (game: Game, ledger: Ledger, queue: GameNode, seconds: number): number => {
  const own = ledger.nodes[queue.id]
  if (!own) return queue.depth
  const accepted = Math.max(0, own.inbound - own.dropped)
  let drained = 0
  for (const link of ledger.links) {
    if (link.from !== queue.id) continue
    const worker = ledger.nodes[link.to]
    if (!worker || worker.inbound <= 0) continue
    drained += link.rate * ((worker.inbound - worker.dropped) / worker.inbound)
  }
  const depth = Math.max(0, queue.depth + (accepted - drained) * seconds)
  // A full Queue refuses new tasks: its outcome failed the excess already.
  return queue.maxLength > 0 ? Math.min(queue.maxLength, depth) : depth
}

/**
 * Tasks Workers held when they crashed: each process had `prefetch` taken from
 * the Queue and not finished. A planned restart hands them back first. A crash
 * counts once: in the Step whose start it falls in, or that follows it.
 */
const lostOnCrash = (game: Game, from: number, seconds: number): number => {
  let lost = 0
  for (const node of game.nodes) {
    if (node.type !== 'worker' || !isDown(node) || causeOf(node.life) === 'restart') continue
    if (node.downAt < from || node.downAt >= from + seconds) continue
    const processes = RUNTIMES[node.runtime].pool ? node.workers : vcpuOf(node)
    lost += node.prefetch * Math.max(1, processes) * copiesOf(node)
  }
  return lost
}

/**
 * Events an Event Stream lost when its broker failed (07 "Event Stream"): the share its replicas
 * and `acks` leave exposed, of the events it held. A planned restart hands them over first. A
 * failure counts once, in the Step whose start it falls in.
 */
const crashedLog = (node: GameNode, from: number, seconds: number): boolean =>
  node.type === 'log' &&
  isDown(node) &&
  causeOf(node.life) !== 'restart' &&
  node.downAt >= from &&
  node.downAt < from + seconds

/**
 * Writes a write-behind Cache lost when it failed (07 "Strategies"): the ones it had acknowledged
 * and not yet flushed to the Database. The Cache keeps that backlog in `depth`.
 */
const crashedCache = (node: GameNode, from: number, seconds: number): boolean =>
  node.type === 'cache' &&
  isDown(node) &&
  causeOf(node.life) !== 'restart' &&
  node.downAt >= from &&
  node.downAt < from + seconds

const lostOnBroker = (game: Game, from: number, seconds: number): number =>
  game.nodes.reduce(
    (lost, node) =>
      crashedLog(node, from, seconds)
        ? lost + node.depth * logLoss(node)
        : crashedCache(node, from, seconds)
          ? lost + node.depth
          : lost,
    0,
  )

/** Seconds a cold Node takes to warm: its runtime's JIT for App Servers and Workers. */
const warmupOf = (game: Game, node: GameNode): number =>
  node.type === 'server' || node.type === 'worker'
    ? RUNTIMES[node.runtime].warmup
    : // A new Read Replica copies the rows before it serves: a calendar half minute per GB (07 \"Data volume\").
      node.type === 'replica'
      ? Math.max(WARMUP_SECONDS, game.data * REPLICA_SYNC_MINUTES_PER_GB)
      : WARMUP_SECONDS

/** The live Autoscaler a Node links into, if any. */
const autoscalerOf = (game: Game, node: GameNode): GameNode | undefined => {
  if (node.type !== 'server' && node.type !== 'worker') return undefined
  for (const link of game.links) {
    if (link.from !== node.id) continue
    const target = game.nodes.find((entry) => entry.id === link.to)
    if (target?.type === 'autoscaler' && !isDown(target)) return target
  }
  return undefined
}

/**
 * What an Autoscaler reads off a Node (05 "Autoscaler"): CPU alone, the whole load (CPU, slots and
 * memory), the requests a second each copy takes against what a vCPU is rated for, or the tasks
 * waiting in the Queues that feed it against what a copy can hold. A Node no Queue feeds reads 0
 * on the queue-depth signal.
 */
const scaleLoadOf = (
  game: Game,
  node: GameNode,
  own: NonNullable<Ledger['nodes'][string]>,
  signal: GameNode['signal'],
): number => {
  const copies = Math.max(1, node.replicas)
  if (signal === 'rps')
    return own.inbound / (copies * Math.max(1, vcpuOf(node)) * SCALE_RPS_PER_VCPU)
  if (signal === 'queue') {
    let waiting = 0
    for (const link of game.links) {
      if (link.to !== node.id) continue
      const from = game.nodes.find((entry) => entry.id === link.from)
      if (from?.type === 'queue') waiting += from.depth
    }
    return waiting / (copies * SCALE_QUEUE_DEPTH)
  }
  if (signal === 'cpu') {
    const cpu = own.resources.cpu
    return cpu && cpu.total > 0 ? cpu.used / cpu.total : 0
  }
  return own.utilization
}

/**
 * Copies boot, then join cold. An Autoscaler asks for more when the Node runs
 * above its target, and gives one back when it idles, at most once per cooldown.
 */
const scale = (game: Game, node: GameNode, ledger: Ledger, seconds: number): GameNode => {
  if (node.scaler._tag === 'Scaling') {
    const readyIn = node.scaler.readyIn - seconds
    if (readyIn > 0) return { ...node, scaler: { ...node.scaler, readyIn } }
    const replicas = node.replicas + node.scaler.pending
    // The new copies start cold: a JIT runtime runs them slowly for its warmup.
    return {
      ...node,
      replicas,
      scaler: scalerStep(node.scaler, { _tag: 'Ready' }),
      life: withWarm(node.life, (warmOf(node.life) * node.replicas) / replicas),
    }
  }
  const scaler = autoscalerOf(game, node)
  if (!scaler || isDown(node) || game.time - node.scaledAt < SCALE_COOLDOWN) return node
  const own = ledger.nodes[node.id]
  if (!own) return node
  const load = scaleLoadOf(game, node, own, scaler.signal)
  // Scheduled scaling provisions for the peak that is coming, not the load of this minute: inside
  // the lead window, the load it plans for is today's peak (10 "Track: Infrastructure").
  const planned = scaler.schedule && has(game, 'scheduled-scaling') ? peakLoadOf(game, load) : load
  const most = scaler.maxCopies > 0 ? scaler.maxCopies : Number.POSITIVE_INFINITY
  // A runaway bill is an Autoscaler with no ceiling: it grows every copy it can, and Burn rises.
  const wanted =
    game.incident?.kind === 'runaway-bill'
      ? Math.max(node.replicas, most === Number.POSITIVE_INFINITY ? 16 : most)
      : Math.min(
          most,
          Math.max(
            scaler.minCopies,
            Math.ceil((node.replicas * Math.max(load, planned)) / scaler.target),
          ),
        )
  if (wanted > node.replicas)
    return {
      ...node,
      scaler: {
        _tag: 'Scaling',
        pending: wanted - node.replicas,
        readyIn: inCluster(game, node) ? POD_REACTION : VM_REACTION,
      },
      scaledAt: game.time,
    }
  // Give one back only when the rest would still run under the target, so it does not flap.
  if (
    node.replicas > scaler.minCopies &&
    load < scaler.target * SCALE_IN &&
    (load * node.replicas) / (node.replicas - 1) < scaler.target
  )
    return { ...node, replicas: node.replicas - 1, scaledAt: game.time }
  return node
}

/**
 * The load a Node will see at the daily peak, from the load it sees now, when the peak is inside
 * the schedule's lead window. Otherwise the current load: outside the window an Autoscaler waits
 * (05 "Autoscaler": "Scheduled scaling ... Adds capacity before the known daily peak").
 */
export const peakLoadOf = (game: Game, load: number): number => {
  const venture = ventureOf(game)
  const minute = calendarMinute(game.time) % 1440
  const peak = venture.peak * 60
  const ahead = (((peak - minute) % 1440) + 1440) % 1440
  if (ahead > SCHEDULE_LEAD_MINUTES) return load
  const now = 1 + venture.amplitude * cosTurns((minute - peak) / 1440)
  return now > 0 ? (load * (1 + venture.amplitude)) / now : load
}

const advanceNode = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  seconds: number,
  events: Array<StepEvent>,
): GameNode => {
  const time = game.time
  let next = node
  const life = node.life
  if (life._tag === 'Restarting') {
    const left = Math.max(0, life.left - seconds)
    next =
      left > 0
        ? { ...next, life: { ...life, left } }
        : {
            ...next,
            life: warming(warmAfterRestart(node, node.warming && has(game, 'cache-warming'))),
          }
  } else if (life._tag === 'Warming' && !refillsStall(game, ledger, node)) {
    next = { ...next, life: warming(Math.min(1, life.warm + seconds / warmupOf(game, node))) }
  }
  if (node.type === 'server' || node.type === 'worker') next = scale(game, next, ledger, seconds)
  // BEAM supervisors restart a process now and then, and the request is retried inside the VM:
  // the crash is absorbed, so it counts without failing anyone (06 "Fault isolation"). A NIF crash
  // is not a process crash: it takes the whole VM, so it is not absorbed (06 "Elixir").
  if (
    next.type === 'server' &&
    RUNTIMES[next.runtime].language === 'elixir' &&
    !has(game, 'nifs') &&
    !isDown(next)
  ) {
    const inbound = ledger.nodes[next.id]?.inbound ?? 0
    if (inbound > 0)
      next = { ...next, crashes: next.crashes + (inbound * seconds) / BEAM_CRASHES_PER_REQUESTS }
  }
  if (node.type === 'queue' || node.type === 'log')
    next = { ...next, depth: depthAfter(game, ledger, node, seconds) }
  // A write-behind Cache holds the writes it has acknowledged and not flushed.
  if (node.type === 'cache')
    next = {
      ...next,
      depth:
        !isDown(node) && has(game, 'cache-strategies') && node.cacheStrategy === 'write-behind'
          ? (ledger.nodes[node.id]?.traffic['q-write'] ?? 0) * WRITE_BEHIND_SECONDS
          : 0,
    }
  // A failed broker takes the events its replicas did not have with it.
  if (crashedLog(node, time, seconds)) next = { ...next, depth: next.depth * (1 - logLoss(node)) }
  if (node.lost > 0) next = { ...next, lost: Math.max(0, node.lost - seconds) }
  // A drained Node takes no new traffic (the solver routes around it) and finishes what it holds:
  // a Queue hands its backlog to its Workers at its own rate, and a lost replica comes back. Empty
  // for DRAIN_SECONDS, it rejoins the rotation.
  if (isDraining(next.service)) {
    // It finishes what it holds at whatever it can hand on: its own rate, or what the Nodes it
    // feeds could take if that is more.
    const handoff = ledger.links
      .filter((link) => link.from === node.id)
      .reduce((sum, link) => sum + (ledger.nodes[link.to]?.capacity ?? 0), 0)
    const held =
      next.depth > 0
        ? Math.max(
            0,
            next.depth - Math.max(ledger.nodes[node.id]?.capacity ?? 0, handoff) * seconds,
          )
        : next.depth
    if (
      next.service._tag === 'Draining' &&
      Math.round((time + seconds) * 1e6) / 1e6 - next.service.since >= DRAIN_SECONDS &&
      held <= 0 &&
      next.lost <= 0
    )
      next = { ...next, depth: held, service: serviceStep(next.service, { _tag: 'DrainFinished' }) }
    else if (held !== next.depth) next = { ...next, depth: held }
  }
  // A Database in a retry storm queues what it cannot take, and drains once it can.
  if (
    node.type === 'database' &&
    (node.depth > 0 || (game.incident?.kind === 'retry-storm' && game.incident.nodeId === node.id))
  ) {
    const own = ledger.nodes[node.id]
    const drain = own && own.inbound > 0 ? own.capacity : Number.POSITIVE_INFINITY
    next = { ...next, depth: Math.max(0, node.depth + ((own?.inbound ?? 0) - drain) * seconds) }
  }
  const credits = ledger.nodes[node.id]?.resources.credits
  if (node.family === 'burstable' && credits) {
    const balance = Math.max(
      0,
      Math.min(CREDIT_CAP * vcpuOf(node), node.credits + credits.rate * seconds),
    )
    if (node.credits >= 1 && balance < 1)
      events.push(StepEvent.CreditsExhausted({ nodeId: node.id }))
    next = { ...next, credits: balance }
  }
  // A pool the player sized too big for its RAM swaps, then the kernel kills it, and so does a
  // leak. Runtimes that size themselves (mod_php, Puma, Node.js) only swap: the player has no
  // pool size to fix, only the box.
  const ram = ledger.nodes[node.id]?.resources.ram
  const killable = RUNTIMES[node.runtime].pool || node.leak > 0
  if (
    (node.type === 'server' || node.type === 'worker') &&
    !isDown(node) &&
    killable &&
    ram &&
    ram.used > ram.total * OOM_RATIO
  ) {
    events.push(StepEvent.OutOfMemory({ nodeId: node.id }))
    next = { ...next, ...restarted(node, 'oom'), leak: 0, downAt: time }
  }
  return next
}

/**
 * The certificate's clock (05 "Secrets and Certificates"). A live Secrets and Certificates Node
 * issues the certificate on the first Step it sees, then renews it two thirds of the way through
 * its life, which is where an ACME client renews with a third left. With none live nothing renews
 * it: once it runs out, every Node that terminates TLS fails until one is live again or the player
 * presses Renew, and the incident starts again if it does not.
 */
const advanceCertificate = (
  game: Game,
  ledger: Ledger,
  tuning: Tuning,
): Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }> => {
  if (game.sandbox || game.stage < CERT_FROM_STAGE) return { game, events: [] }
  const life = certLifeOf(game, tuning)
  const managed = certManaged(game)
  let changed = false
  // Each Node that terminates TLS holds its own certificate. A live manager issues it the first
  // time and renews it before it can run out; with none live nothing renews it.
  const nodes = game.nodes.map((node) => {
    if (!TLS_TERMINATORS.includes(node.type) || !managed) return node
    if (node.certUntil !== null && game.time < node.certUntil - life * (1 - CERT_RENEW)) return node
    changed = true
    return { ...node, certUntil: game.time + life }
  })
  const next = changed ? { ...game, nodes } : game
  if (!certNodes(next).some((node) => certExpired(next, node)) || next.incident)
    return { game: next, events: [] }
  const started = startIncident(next, ledger, 'certificate', 0)
  return started
    ? { game: started.game, events: [StepEvent.IncidentStarted({ incident: started.incident })] }
    : { game: next, events: [] }
}

/**
 * Links that retry carry their failure share into the next Step. A breaker opens
 * when half the calls fail, stays open, then closes to try again. A Service Mesh
 * runs its own breaker on each Link out of a Node with a sidecar (05).
 */
const advanceLinks = (game: Game, ledger: Ledger, seconds: number): ReadonlyArray<GameLink> => {
  const links = game.links.map((link, index) => {
    if (isOpen(link.fuse)) {
      const fuse = breakerStep(link.fuse, { _tag: 'ClosedAt', at: game.time + seconds })
      return { ...link, fuse, failure: isOpen(fuse) ? link.failure : 0 }
    }
    const measured = ledger.links[index]?.failure ?? 0
    const source = game.nodes.find((node) => node.id === link.from)
    const watched =
      (link.breaker && has(game, 'circuit-breakers')) ||
      (source !== undefined && meshOf(game, source))
    if (watched && measured > BREAKER_THRESHOLD)
      return {
        ...link,
        fuse: breakerStep(link.fuse, {
          _tag: 'Tripped',
          until: game.time + seconds + BREAKER_OPEN,
        }),
        failure: 0,
      }
    return measured === link.failure ? link : { ...link, failure: measured }
  })
  return links.every((link, index) => link === game.links[index]) ? game.links : links
}

/** Whether the player has stopped listening to a rule: too many false alarms today. */
export const ignored = (game: Game, rule: AlertRule): boolean =>
  game.falseAlarms[rule] >= ALERT_FATIGUE

const advanceAlarms = (
  game: Game,
  ledger: Ledger,
  seconds: number,
  events: Array<StepEvent>,
): Readonly<{ alarms: Alarms; falseAlarms: FalseAlarms }> => {
  const rules = game.alertRules
  const slowest = Object.entries(ledger.kinds).some(
    ([kind, entry]) => entry.p99 > rules.latency * PROFILES[kind as keyof typeof PROFILES].apdex,
  )
  const hottest = Math.max(
    0,
    ...game.nodes
      .filter((node) => node.type !== 'users' && node.type !== 'analytics')
      .map((node) => ledger.nodes[node.id]?.utilization ?? 0),
  )
  const oldest = Math.max(
    0,
    ...game.nodes.map((node) => (node.type === 'queue' ? (ledger.nodes[node.id]?.age ?? 0) : 0)),
  )
  const burning = burnRateOf(game, ledger) > rules.budget
  const next: Alarms = {
    errors: ledger.errorShare > rules.errors ? game.alarms.errors + seconds : 0,
    latency: slowest ? game.alarms.latency + seconds : 0,
    saturation: hottest > rules.saturation ? game.alarms.saturation + seconds : 0,
    queue: oldest > rules.queue ? game.alarms.queue + seconds : 0,
    budget: burning ? game.alarms.budget + seconds : 0,
  }
  // A new calendar day forgives false alarms, except on rules the player already ignores.
  const day = Math.floor(calendarMinute(game.time) / 1440)
  const fresh = day !== game.falseAlarms.day
  const counts: Record<AlertRule, number> = {
    errors: game.falseAlarms.errors,
    latency: game.falseAlarms.latency,
    saturation: game.falseAlarms.saturation,
    queue: game.falseAlarms.queue,
    budget: game.falseAlarms.budget,
  }
  for (const rule of ['errors', 'latency', 'saturation', 'queue', 'budget'] as const) {
    if (fresh && counts[rule] < ALERT_FATIGUE) counts[rule] = 0
    if (!has(game, 'alerting')) continue
    const limit =
      ALERT_RULES[rule].seconds * (has(game, 'anomaly-detection') ? ANOMALY_DETECTION_HOLD : 1)
    if (game.alarms[rule] >= limit || next[rule] < limit) continue
    if (ignored(game, rule)) continue
    events.push(StepEvent.AlertFired({ rule }))
    // An alert with no incident behind it is a false alarm.
    if (!game.incident) {
      counts[rule] += 1
      if (counts[rule] === ALERT_FATIGUE) events.push(StepEvent.AlertIgnored({ rule }))
    }
  }
  return { alarms: next, falseAlarms: { day, ...counts } }
}

/**
 * Advances the Company by `seconds`. `offline` is the return from time away
 * (04 "Offline progress"): revenue goes straight to Cash, no incident starts,
 * and users grow only while the Era's SLO holds.
 */
export const step = (
  game: Game,
  seconds: number,
  tuning: Tuning = LIVE_TUNING,
  offline = false,
): StepResult => {
  const ledger = solveFlow(game)
  const events: Array<StepEvent> = []

  // Money: revenue waits in the drawer until Stripe Billing collects it.
  const earned = ledger.revenue * seconds
  let cash = game.cash
  let pending = game.pending
  let spilled = game.spilled
  if (game.sandbox) {
    // A Sandbox has no money: placing is free, and revenue and Burn are only figures.
  } else if (has(game, 'stripe') || offline) {
    cash += earned
  } else {
    const room = Math.max(0, drawerSize(game, ledger.revenue) - pending)
    if (room > 0 && earned >= room) events.push(StepEvent.DrawerFull())
    pending += Math.min(room, earned)
    spilled += Math.max(0, earned - room)
  }
  // An SLA pays its credits back to customers: 10% of subscription revenue while the week misses.
  if (!game.sandbox) cash -= (ledger.burn + slaCreditsOf(game, ledger) + ledger.fines) * seconds

  const nodes = game.nodes.map((node) => advanceNode(game, node, ledger, seconds, events))
  // Object Storage keeps every file it is sent: data never shrinks by itself (07 "Data volume").
  const puts = game.nodes.reduce(
    (total, node) =>
      node.type === 'storage' ? total + (ledger.nodes[node.id]?.inbound ?? 0) : total,
    0,
  )
  // Rows: every write to a Database and every realtime message it holds adds data, and data never
  // shrinks by itself. A retention window caps it at what the Company writes in its window.
  const rows = game.nodes.reduce((sum, node) => {
    const own = ledger.nodes[node.id]?.traffic
    if (!own) return sum
    const writes = node.type === 'database' || node.type === 'wide' ? (own['q-write'] ?? 0) : 0
    const messages = node.type === 'ws' ? (own.rt ?? 0) : 0
    return sum + writes + messages
  }, 0)
  const added = ((rows * ROW_KB) / 1_000_000) * seconds
  const windows = game.nodes
    .filter((node) => node.type === 'database')
    .map((node) => DB_RETENTIONS[node.keep].days)
  const keptDays =
    windows.length === 0 || windows.some((days) => days === 0) ? 0 : Math.max(...windows)
  // Calendar days of writes the retention window keeps: one sim second is one calendar minute.
  const kept =
    keptDays > 0 ? ((rows * ROW_KB) / 1_000_000) * keptDays * 1_440 : Number.POSITIVE_INFINITY
  const data = Math.min(kept, game.data + added)
  const { users, userShares, steady } = grow(game, ledger, seconds, tuning.pace, offline)
  const apdex = game.apdex + (ledger.apdex - game.apdex) * Math.min(1, seconds / APDEX_WINDOW)
  // Sim time stays on a microsecond grid, so ten 0.1 s Steps make exactly one second.
  const time = Math.round((game.time + seconds) * 1e6) / 1e6
  const { alarms, falseAlarms } = advanceAlarms(game, ledger, seconds, events)

  // The first time users get a new kind of request through, the team learns from it, once.
  const firsts = REQUEST_KINDS.filter(
    (kind) =>
      PROFILES[kind].scored &&
      !game.servedKinds.includes(kind) &&
      (ledger.kinds[kind]?.success ?? 0) > 0.5,
  )

  const crossedSecond = Math.floor(time) > Math.floor(game.time)
  const sample: Sample = {
    users: game.users,
    demand: ledger.demand,
    served: ledger.served,
    revenue: ledger.revenue,
    burn: ledger.burn,
    cash,
    latency: ledger.latency,
    p99: ledger.p99,
    apdex: ledger.apdex,
    errors: ledger.errorShare,
    device: has(game, 'rum') ? ledger.deviceLatency : NO_DEVICE_LATENCY,
    slow: slowestKind(ledger),
  }

  // A chaos experiment earns Failure Insight for as long as it runs (10 "Reliability").
  const chaotic = chaosRunning(game)
  const pools = accrue(game, ledger, seconds, firsts, FIRST_KIND_INSIGHT)
  let next: Game = {
    ...game,
    nodes,
    links: advanceLinks(game, ledger, seconds),
    cash,
    pending,
    spilled,
    users,
    userShares,
    steady,
    peak: Math.max(game.peak, users),
    apdex,
    regionApdex: regionApdexAfter(game, ledger, seconds),
    alarms,
    falseAlarms,
    insight: 0,
    pools: {
      ...pools,
      failure:
        pools.failure +
        (chaotic ? CHAOS_INSIGHT * seconds : 0) +
        (game.time < game.loadTestUntil ? LOAD_TEST_INSIGHT * seconds : 0) +
        (game.drill?._tag === 'Running' ? DRILL_INSIGHT * seconds : 0),
    },
    // The Node the next experiment hits: the Design's weakest right now (10 "Chaos engineering").
    weakest: game.chaos ? (ledger.bottleneck ?? game.weakest) : null,
    servedKinds: firsts.length > 0 ? [...game.servedKinds, ...firsts] : game.servedKinds,
    stored: puts > 0 ? game.stored + (puts * UPLOAD_MB * seconds) / 1_000 : game.stored,
    data,
    uploads: (puts * UPLOAD_MB) / 1_000,
    budget: recordBudget(game, ledger, seconds),
    drill: advanceDrill({ ...game, time }, ledger),
    quarter: advanceQuarter({ ...game, time }, ledger),
    time,
    earned: game.earned + earned,
    history: crossedSecond ? [...game.history, sample].slice(-HISTORY) : game.history,
  }

  // The first signal of the running Incident: the pager, or the board's failed requests.
  next = markSignal(next, ledger)
  const running = advanceIncident(next, ledger, seconds)
  next = running.game
  events.push(...running.events)
  next = advanceStudies(next, ledger, seconds, events)
  next = advanceMirrors(next)
  // The Era's Milestone puts its round on the table once.
  if (canRaise(next) && next.round._tag !== 'Offered')
    next = { ...next, round: { _tag: 'Offered' } }
  const team = advanceTeam(next, ledger, seconds, tuning, offline)
  next = team.game
  events.push(...team.events)
  if (!offline) next = advanceCves(next, ledger, seconds, events)
  if (!offline) {
    const certificates = advanceCertificate(next, ledger, tuning)
    next = certificates.game
    events.push(...certificates.events)
    const directed = directIncidents(next, ledger, tuning.incidentGap)
    next = directed.game
    events.push(...directed.events)
  }
  // Penetration testing reveals one weakness a calendar week: the first time a week's worth of
  // calendar minutes rolls over, its prevention research joins the open action items, the same
  // way a Postmortem's action item does (10 "Track: Security", `pen-testing`).
  const lastWeek = Math.floor(calendarMinute(game.time) / QUARTER_SECONDS)
  const thisWeek = Math.floor(calendarMinute(time) / QUARTER_SECONDS)
  if (has(next, 'pen-testing') && thisWeek > lastWeek) {
    const revealed = pentestWeakness(next, ledger)
    if (revealed && !next.openActions.includes(revealed))
      next = { ...next, openActions: [...next.openActions, revealed] }
  }
  // Users adopt a Feature over a calendar week, and Analytics counts the A/B samples (08).
  next = advanceFeatures(next, ledger.demand, seconds, tuning)
  // The pager, a freeze and a pay gap wear the Team down (18 "Burnout and quitting").
  next = advanceMorale(next, game, seconds, tuning, events)
  // A crashed Worker's prefetched tasks are lost: they spend the error budget like failed requests.
  const lost = lostOnCrash(next, game.time, seconds) + lostOnBroker(game, game.time, seconds)
  if (lost > 0)
    next = {
      ...next,
      budget: spendBudget(next, lost),
      incident: next.incident ? { ...next.incident, failed: next.incident.failed + lost } : null,
    }

  // The Autopilot perk's policies act on the Design and the Team (13 "The Legacy shop").
  if (!offline) next = applyPolicies(next, ledger)

  // Money out: Burn keeps billing, and a shortfall brings the bridge or the shutdown.
  next = advanceRunway(next, ledger)

  if (solveHolds(game, next, events)) carryLedger(game, next)
  return { game: next, ledger, events }
}

/**
 * The flow solve runs on the sim-time grid: at each whole second, and whenever something it reads
 * changes in kind, or while an incident runs or a Node warms or scales. The Steps between share one Ledger, so ten 100 ms Steps cost one solve, and a
 * Company plays out the same at every game speed.
 */
const solveHolds = (before: Game, after: Game, events: ReadonlyArray<StepEvent>): boolean =>
  events.length === 0 &&
  Math.floor(after.time) === Math.floor(before.time) &&
  after.stage === before.stage &&
  before.incident === null &&
  after.incident === null &&
  after.nodes.length === before.nodes.length &&
  after.links.length === before.links.length &&
  after.nodes.every((node, index) => {
    const was = before.nodes[index]
    // A Node still warming or scaling changes what it can take within a second: solve every Step.
    return (
      was !== undefined &&
      node.life._tag === 'Running' &&
      was.life._tag === 'Running' &&
      node.scaler._tag === 'Steady' &&
      node.replicas === was.replicas
    )
  })
