import { RUNNING, warming } from './life.ts'
import { step as incidentStep } from './incident-machine.ts'
import {
  type Action,
  Refusal,
  endIncident,
  answering,
  no,
  notAllowed,
  ok,
  patch,
  spend,
  withNode,
} from './action-kit.ts'
import { Result } from 'effect'
import {
  ALERT_THRESHOLDS,
  CACHE_TTLS,
  CDN_TTLS,
  COMPONENTS,
  STANDBY_TYPES,
  ZONES,
  rttOf,
  CREDIT_CAP,
  DRAIN_SECONDS,
  GOGC,
  DEFAULT_FPM_WORKERS,
  DNS_TTLS,
  ERAS,
  FIRST_INCIDENT_AFTER,
  FRAMEWORKS,
  KINDS,
  LANGUAGES,
  DELETE_CHURN,
  POOL_LIMITS,
  PRICING_FROM_STAGE,
  REQUEST_KINDS,
  RESEARCH,
  RUNTIMES,
  DATA_KINDS,
  MAX_STUDIES,
  RESERVED_SECONDS,
  SIZES,
  type ComponentId,
  type FamilyId,
  type FrameworkId,
  type IncidentId,
  type Kind,
  type RequestKind,
  type ResearchId,
  type RuntimeId,
  HOME_REGION,
  OPEN_REGION_PRICE,
  REGION_INFO,
  REGIONS_FROM_STAGE,
  FAMILIES,
} from './catalog.ts'
import {
  frameworkReady,
  has,
  eraOf,
  certLifeOf,
  inCluster,
  isDown,
  isFinalEra,
  isUnlocked,
  maxSize,
  nextEra,
  owedOf,
  priceOf,
  pricingOf,
  refundOf,
  replacePrice,
  researchReady,
  resizePrice,
  restarted,
  warmAfterRestart,
  runtimeReady,
  vcpuOf,
} from './lookups.ts'
import { nextOrdinal } from './labels.ts'
import { link } from './company.ts'
import { goGlobal, isGlobal, openRegions, survivesRegion } from './regions.ts'
import {
  alumniOf,
  dilutionOf,
  grantOf,
  perkLevel,
  placeRefusal,
  placedLife,
  retryRefusal,
  runtimeRefusal,
  ventureOf,
} from './founding.ts'
import { restoreSeconds, startIncident, zoned } from './director.ts'
import { IPO_BURN_SECONDS, PRE_IPO_STAGE, ipoReady, newDrill } from './ipo.ts'
import { firstQuarter, guidanceOpen } from './quarters.ts'
import { step as quarterStep } from './quarter-machine.ts'
import { solveFlow } from './solve.ts'
import type { AlertRule } from './events.ts'
import { POLICY_LEVEL } from './catalog/legacy.ts'
import type {
  Policies,
  Collector,
  Game,
  GameLink,
  GameNode,
  PmMode,
  Pricing,
  Retries,
  Zone,
  Region,
  DbEngine,
} from './state.ts'

export { Refusal, describeRefusal, type Action } from './action-kit.ts'
export { setProvider, switchProvider } from './components/psp.rule.ts'
export { setSample, setRetention } from './components/analytics.rule.ts'
export { setRollout } from './components/ff.rule.ts'
export { setLogOptions } from './components/log.rule.ts'
export { setVecIndex } from './components/vec.rule.ts'
export { setDocOptions } from './components/doc.rule.ts'
export { setStoreVariant, setStorageClass, setLifecycle } from './components/storage.rule.ts'
export { setSearchOptions, setSearchRefresh } from './components/search.rule.ts'
export { setSync } from './components/replica.rule.ts'
export {
  setBackup,
  rollRestore,
  runRestoreDrill,
  setMaterialized,
  setStorageIops,
  setShards,
  setShardKey,
  setDbRetention,
  expandVolume,
} from './components/database.rule.ts'
export { setQuorum } from './components/wide.rule.ts'
export { setCompression, setShed, setDegrade, setRyw, setFanout } from './components/server.rule.ts'
export { setGpuType, setPrecision, setBatch, setGpuModel } from './components/gpu.rule.ts'
export { setAutoscaler } from './components/autoscaler.rule.ts'
export { setDeployStrategy } from './components/ci.rule.ts'
export { setHubOptions } from './components/ws.rule.ts'
export { setRateLimit, setGatewayBucket, setGatewayOptions } from './components/gw.rule.ts'
export { setParanoia, setUnderAttack, disableRule } from './components/waf.rule.ts'
export { setPoolerMode } from './components/pooler.rule.ts'
export { setCdnOptions } from './components/cdn.rule.ts'
export {
  setLbVariant,
  setPolicy,
  setSticky,
  setSlowStart,
  setHealthCheck,
} from './components/lb.rule.ts'
export { setCacheEngine, setCacheGuard, setCacheStrategy } from './components/cache.rule.ts'
export { setPrefetch } from './components/worker.rule.ts'
export { setDlq, setAttempts, setMaxLength, deleteMessage } from './components/queue.rule.ts'

/**
 * Cash is short (09 "Runway and running out of Cash"): at zero or below, the
 * Company places nothing, upgrades nothing, and hires nobody until Cash is
 * positive again. Selling, layoffs, research, and the backlog still run, and
 * Burn still bills.
 */
export const shortOfCash = (game: Game): boolean => !game.sandbox && game.cash <= 0

const shortfall = (): Action =>
  notAllowed('Out of Cash: no placement, upgrade, or hire until Cash is above zero.')

export const blankNode = (
  game: Game,
  id: string,
  type: ComponentId,
  x: number,
  y: number,
  region: Region = HOME_REGION,
): GameNode => {
  const stack = game.nodes.find((node) => node.type === 'server')
  return {
    id,
    type,
    ordinal: nextOrdinal(game, type),
    x: Math.round(x),
    y: Math.round(y),
    size: 1,
    family: 'general',
    runtime: stack?.runtime ?? 'mod_php',
    framework: stack?.framework ?? 'none',
    workers: stack?.workers ?? DEFAULT_FPM_WORKERS,
    localDb: false,
    sample: 1,
    sampleRate: 0.1,
    retention: 900,
    life: COMPONENTS[type].coldStart ? warming(0) : RUNNING,
    credits: 0,
    leak: 0,
    service: { _tag: 'InService' },
    compress: stack?.compress ?? false,
    certUntil: null,
    recycle: stack?.recycle ?? false,
    authEdge: false,
    merge: false,
    downAt: 0,
    policy: 'weighted',
    variant: 'l7',
    sticky: false,
    slowStart: false,
    provider: 'first',
    purge: false,
    cacheKey: 'full',
    staleUntil: 0,
    earlyExpiry: false,
    swr: false,
    shardKey: 'hash',
    sync: false,
    searchVariant: 'elasticsearch',
    searchShards: 1,
    searchReplicas: 0,
    heap: 'half',
    storeVariant: 's3',
    burst: 0,
    checkEvery: 10,
    deepCheck: false,
    ttl: type === 'cache' ? 60 : 300,
    engine: 'redis',
    dbEngine: 'postgres',
    iops: 'general',
    shards: 1,
    storageClass: 'standard',
    crashes: 0,
    keep: 'keep',
    lifecycle: 0,
    cacheStrategy: 'aside',
    refresh: 1,
    restore: 'ok',
    pm: 'static',
    mode: 'transaction',
    depth: 0,
    dlq: false,
    attempts: 25,
    maxLength: 0,
    prefetch: 10,
    upgradedAt: game.time,
    coalesce: false,
    warming: false,
    paranoia: 2,
    underAttack: false,
    rateLimit: 0,
    strategy: 'rolling',
    presence: false,
    backoff: false,
    clustering: false,
    zone: 'a',
    standby: false,
    pricing: 'on-demand',
    pricingUntil: null,
    replicas: 1,
    scaler: { _tag: 'Steady' },
    scaledAt: 0,
    signal: 'cpu',
    target: 0.6,
    minCopies: 1,
    maxCopies: 8,
    gpu: 't4',
    precision: 'fp16',
    gpuModel: 'medium',
    batch: 1,
    collector: 'g1',
    gogc: 100,
    shed: false,
    degrade: false,
    schedule: false,
    materialized: false,
    ryw: false,
    region,
    // A Wide-column Store starts with three replicas per key; an Event Stream keeps one copy of
    // each partition until the player pays for the second and third (07 "Event Stream").
    n: type === 'log' ? 1 : 3,
    r: 1,
    w: 1,
    lost: 0,
    spread: false,
    backup: 'none',
    fanout: 'pull',
    split: false,
    transactions: false,
    indexType: 'exact',
    partitions: 3,
    acks: 'all',
    retain: 3_600,
    keyed: true,
  }
}

export const place = (
  game: Game,
  type: ComponentId,
  x: number,
  y: number,
  region: Region = HOME_REGION,
): Action => {
  const def = COMPONENTS[type]
  if (def.fixed) return notAllowed(`${def.name} cannot be placed.`)
  if (shortOfCash(game)) return shortfall()
  if (!isUnlocked(game, type) && def.unlock)
    return no(Refusal.Locked({ what: def.name, research: RESEARCH[def.unlock].name }))
  const banned = placeRefusal(game, type, region)
  if (banned) return notAllowed(banned)
  if (!openRegions(game).includes(region)) return notAllowed('Open that region first.')
  const node = blankNode(game, `n${game.nextId}`, type, x, y, region)
  return spend(game, priceOf(game, type), def.name, (paid) => ({
    ...paid,
    nextId: paid.nextId + 1,
    nodes: [...paid.nodes, { ...node, life: placedLife(paid, node) }],
  }))
}

/** Draws a box around the chosen Nodes, named in order: Box 1, Box 2. A Node leaves the box it was in. */
export const boxNodes = (game: Game, ids: ReadonlyArray<string>): Action => {
  const chosen = ids.filter((id) => game.nodes.some((node) => node.id === id))
  if (chosen.length < 2) return notAllowed('Select two or more Nodes to box.')
  const number =
    game.boxes.reduce((most, box) => Math.max(most, Number(box.id.slice(3)) || 0), 0) + 1
  const kept = game.boxes
    .map((box) => ({ ...box, nodes: box.nodes.filter((id) => !chosen.includes(id)) }))
    .filter((box) => box.nodes.length >= 2)
  return ok({
    ...game,
    boxes: [...kept, { id: `box${number}`, name: `Box ${number}`, nodes: chosen }],
  })
}

/** Takes the box off a group of Nodes: the Nodes stay. */
export const unboxNodes = (game: Game, ids: ReadonlyArray<string>): Action => {
  const boxes = game.boxes.filter((box) => !box.nodes.some((id) => ids.includes(id)))
  return boxes.length === game.boxes.length
    ? notAllowed('No box holds these Nodes.')
    : ok({ ...game, boxes })
}

export const sell = (game: Game, id: string): Action =>
  withNode(game, id, (node) =>
    COMPONENTS[node.type].fixed
      ? notAllowed(`${COMPONENTS[node.type].name} stays.`)
      : ok({
          ...game,
          // A reserved Node still owes the Burn of its calendar week (09 "Pricing models").
          cash: game.cash + refundOf(game, node) - owedOf(game, node),
          nodes: game.nodes.filter((entry) => entry.id !== id),
          links: game.links.filter((link) => link.from !== id && link.to !== id),
        }),
  )

export const move = (game: Game, id: string, x: number, y: number): Game =>
  patch(game, id, { x: Math.round(x), y: Math.round(y) })

/** Kinds a Node sends on its routing links. */
const emitsOf = (node: GameNode): ReadonlyArray<Kind> => COMPONENTS[node.type].sends

/** A Load Balancer passes queries on only as an L4: an L7 one reads HTTP and takes requests. */
const relays = (from: GameNode, to: GameNode, kind: Kind): boolean =>
  !(DATA_KINDS as ReadonlyArray<Kind>).includes(kind) ||
  [from, to].every((node) => node.type !== 'lb' || node.variant === 'l4')

const reaches = (links: ReadonlyArray<GameLink>, from: string, to: string): boolean => {
  const seen = new Set<string>()
  const stack = [from]
  while (stack.length > 0) {
    const at = stack.pop() as string
    if (at === to) return true
    if (seen.has(at)) continue
    seen.add(at)
    for (const link of links) if (link.from === at) stack.push(link.to)
  }
  return false
}

const kindList = (kinds: ReadonlyArray<Kind>): string =>
  kinds.map((kind) => KINDS[kind].label.toLowerCase()).join(', ')

export const connect = (game: Game, from: string, to: string): Action => {
  const source = game.nodes.find((node) => node.id === from)
  const target = game.nodes.find((node) => node.id === to)
  if (!source || !target || from === to) return notAllowed('Link two different Nodes.')
  const sourceDef = COMPONENTS[source.type]
  const targetDef = COMPONENTS[target.type]
  if (game.links.some((link) => link.from === from && link.to === to))
    return notAllowed('Already linked.')
  // App Servers and Workers link into an Autoscaler or a Cluster to come under it: one of each.
  if (targetDef.control) {
    if (source.type !== 'server' && source.type !== 'worker')
      return notAllowed(`Link App Servers or Workers into the ${targetDef.name}.`)
    const taken = game.links.some(
      (entry) =>
        entry.from === from &&
        game.nodes.some((node) => node.id === entry.to && node.type === target.type),
    )
    if (taken) return notAllowed(`${sourceDef.name} already has a ${targetDef.name}.`)
    // A mesh puts a sidecar in each pod: the service has to run in a Kubernetes Cluster first.
    if (target.type === 'mesh' && !inCluster(game, source))
      return notAllowed(
        `Link ${sourceDef.name} into a Kubernetes Cluster first: the sidecar rides in its pod.`,
      )
    return ok({ ...game, links: [...game.links, link(from, to)] })
  }
  // A CDC Connector reads one Database's write log: that Database keeps all of its traffic.
  if (targetDef.mirror) {
    if (source.type !== 'database')
      return notAllowed(`Link a Database into the ${targetDef.name}: it reads its write log.`)
    if (game.links.some((entry) => entry.from === from && entry.to === to))
      return notAllowed('Already linked.')
    return ok({ ...game, links: [...game.links, link(from, to)] })
  }
  if (targetDef.tap) {
    if (sourceDef.tap || source.type === 'payments')
      return notAllowed(`${sourceDef.name} has no traffic to sample.`)
    return ok({ ...game, links: [...game.links, link(from, to)] })
  }
  if (sourceDef.maxOut === 0 || emitsOf(source).length === 0)
    return notAllowed(`${sourceDef.name} sends nothing on. Link it into Analytics to sample it.`)
  if (targetDef.accepts.length === 0) return notAllowed(`${targetDef.name} has no input.`)
  const carried = emitsOf(source).filter(
    (kind) => targetDef.accepts.includes(kind) && relays(source, target, kind),
  )
  if (carried.length === 0 && emitsOf(source).some((kind) => targetDef.accepts.includes(kind)))
    return notAllowed('An L7 Load Balancer reads HTTP. Switch it to L4 to balance queries.')
  if (carried.length === 0)
    return notAllowed(
      `${targetDef.name} takes ${kindList(targetDef.accepts)}. ${sourceDef.name} sends ${kindList(emitsOf(source))}.`,
    )
  const routing = game.links.filter((link) => {
    const end = game.nodes.find((node) => node.id === link.to)
    return link.from === from && end && !COMPONENTS[end.type].tap
  })
  if (routing.length >= sourceDef.maxOut)
    return notAllowed(
      source.type === 'users'
        ? 'A domain resolves to one host. Put DNS or a Load Balancer in front to reach more.'
        : source.type === 'pooler'
          ? 'A Connection Pooler pools to one host. Put a Load Balancer after it to reach more.'
          : `${sourceDef.name} takes ${sourceDef.maxOut} links.`,
    )
  if (reaches(game.links, to, from)) return notAllowed('That link would make a loop.')
  const linked: Game = { ...game, links: [...game.links, link(from, to)] }
  // Linking the first box to a Database moves Postgres off it, for good.
  return ok(
    source.localDb &&
      (target.type === 'database' || target.type === 'pooler' || target.type === 'cache')
      ? patch(linked, from, { localDb: false })
      : linked,
  )
}

/** Timeouts a Link can wait, in seconds. */
export const LINK_TIMEOUTS = [1, 5, 30] as const

/** Sets a Link's timeout, retry policy, breaker, bulkhead or hedge. Needs Timeouts and retries. */
export const setLinkPolicy = (
  game: Game,
  from: string,
  to: string,
  change: Readonly<{
    timeout?: number
    retries?: Retries
    breaker?: boolean
    bulkhead?: boolean
    hedge?: boolean
  }>,
): Action => {
  const index = game.links.findIndex((entry) => entry.from === from && entry.to === to)
  const current = game.links[index]
  if (!current) return no(Refusal.Missing())
  if (!has(game, 'timeouts'))
    return no(Refusal.Locked({ what: 'Call policy', research: RESEARCH.timeouts.name }))
  if (change.retries === 'backoff' && !has(game, 'backoff-jitter'))
    return no(Refusal.Locked({ what: 'Backoff', research: RESEARCH['backoff-jitter'].name }))
  const banned = change.retries === undefined ? null : retryRefusal(game, change.retries)
  if (banned) return notAllowed(banned)
  if (change.breaker && !has(game, 'circuit-breakers'))
    return no(
      Refusal.Locked({ what: 'A circuit breaker', research: RESEARCH['circuit-breakers'].name }),
    )
  if (change.bulkhead && !has(game, 'bulkheads'))
    return no(Refusal.Locked({ what: 'A bulkhead', research: RESEARCH.bulkheads.name }))
  if (change.hedge && !has(game, 'hedged-requests'))
    return no(Refusal.Locked({ what: 'Hedging', research: RESEARCH['hedged-requests'].name }))
  if (
    change.timeout !== undefined &&
    !(LINK_TIMEOUTS as ReadonlyArray<number>).includes(change.timeout)
  )
    return notAllowed('A timeout is 1, 5, or 30 seconds.')
  // A new retry policy or breaker starts fresh.
  const next = {
    ...current,
    ...change,
    failure: 0,
    fuse: change.breaker === false ? ({ _tag: 'Closed' } as const) : current.fuse,
  }
  return ok({ ...game, links: game.links.map((entry, at) => (at === index ? next : entry)) })
}

/** Sets the request kinds a Load Balancer Link carries, or null for all of them. */
export const setLinkKinds = (
  game: Game,
  from: string,
  to: string,
  kinds: ReadonlyArray<RequestKind> | null,
): Action => {
  const index = game.links.findIndex((entry) => entry.from === from && entry.to === to)
  const current = game.links[index]
  const source = game.nodes.find((node) => node.id === from)
  if (!current || !source) return no(Refusal.Missing())
  if (source.type !== 'lb') return notAllowed('Only a Load Balancer routes by request kind.')
  const next = { ...current, kinds: kinds && REQUEST_KINDS.filter((kind) => kinds.includes(kind)) }
  return ok({ ...game, links: game.links.map((entry, at) => (at === index ? next : entry)) })
}

export const disconnect = (game: Game, from: string, to: string): Game => ({
  ...game,
  links: game.links.filter((link) => !(link.from === from && link.to === to)),
})

export const resize = (game: Game, id: string, direction: 1 | -1): Action =>
  withNode(game, id, (node) => {
    const def = COMPONENTS[node.type]
    const lowest = def.sized ? 0 : 1
    if (direction === -1) {
      if (node.size <= lowest) return notAllowed(`${def.name} is at its smallest size.`)
      return ok(patch(game, id, { size: node.size - 1, ...(def.sized ? restarted(node) : {}) }))
    }
    const price = resizePrice(game, node)
    if (price === null || node.size >= maxSize(node))
      return notAllowed(`${def.name} is at its largest size.`)
    if (shortOfCash(game)) return shortfall()
    const label = def.sized
      ? `${SIZES[node.size + 1]?.name ?? 'Next size'}`
      : `Size ${node.size + 1}`
    return spend(game, price, label, (paid) =>
      patch(paid, id, { size: node.size + 1, ...(def.sized ? restarted(node) : {}) }),
    )
  })

/** What `upgradeAll` did: the Game it made, and what it left alone (15 "Bulk actions"). */
export type UpgradeAllOutcome = Readonly<{
  readonly game: Game
  readonly upgraded: number
  /** Nodes that were already at their largest size. */
  readonly skipped: number
  /** Cash ran out before every Node that could grow had. */
  readonly short: boolean
}>

/**
 * Buys one size on every Node of `type` in `region`, in board order (15 "Bulk
 * actions"). A Node at its largest size is skipped, and the fold stops at the
 * first Node it cannot pay for, so Cash is never half spent on a step. The
 * caller applies the outcome as one undo entry and one log line.
 */
export const upgradeAll = (
  game: Game,
  type: ComponentId,
  region?: Region,
): Result.Result<UpgradeAllOutcome, Refusal> => {
  const nodes = game.nodes.filter(
    (node) => node.type === type && (region === undefined || node.region === region),
  )
  if (nodes.length === 0) return Result.fail(Refusal.Missing())
  if (shortOfCash(game))
    return Result.fail(
      Refusal.NotAllowed({
        reason: 'Out of Cash: no placement, upgrade, or hire until Cash is above zero.',
      }),
    )
  let next = game
  let upgraded = 0
  let skipped = 0
  let short = false
  let price = 0
  for (const node of nodes) {
    const current = next.nodes.find((entry) => entry.id === node.id)
    if (!current) continue
    if (current.size >= maxSize(current)) {
      skipped += 1
      continue
    }
    const step = resize(next, node.id, 1)
    if (Result.isFailure(step)) {
      // The cap was checked above, so the only refusal left is Cash.
      if (step.failure._tag === 'Unaffordable') price = step.failure.price
      short = true
      break
    }
    next = step.success
    upgraded += 1
  }
  if (upgraded === 0) {
    // Nothing grew: refuse, so the panel says why and no undo entry is written.
    if (short)
      return Result.fail(Refusal.Unaffordable({ what: 'An upgrade', price, currency: 'cash' }))
    return Result.fail(
      Refusal.NotAllowed({ reason: `Every ${COMPONENTS[type].name} is at its largest size.` }),
    )
  }
  return Result.succeed({ game: next, upgraded, skipped, short })
}

export const setFamily = (game: Game, id: string, family: FamilyId): Action =>
  withNode(game, id, (node) => {
    if (!COMPONENTS[node.type].sized) return notAllowed('Only VMs have an instance family.')
    // 05 "App Server": ARM is its own research item.
    if (family === 'arm' && !has(game, 'arm-instances'))
      return no(
        Refusal.Locked({ what: FAMILIES.arm.name, research: RESEARCH['arm-instances'].name }),
      )
    if (node.family === family) return ok(game)
    return ok(
      patch(game, id, {
        family,
        ...restarted(node),
        credits: family === 'burstable' ? (CREDIT_CAP * vcpuOf(node)) / 2 : 0,
      }),
    )
  })

const defaultWorkers = (node: GameNode, runtime: RuntimeId): number =>
  runtime === 'gunicorn' ? 2 * Math.max(1, Math.round(vcpuOf(node))) + 1 : DEFAULT_FPM_WORKERS

export const setRuntime = (game: Game, id: string, runtime: RuntimeId): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'server' && node.type !== 'worker' && node.type !== 'ws')
      return notAllowed('Only App Servers, Workers and Realtime Hubs run a Stack.')
    const def = RUNTIMES[runtime]
    if (!runtimeReady(game, runtime) && def.research)
      return no(Refusal.Locked({ what: def.name, research: RESEARCH[def.research].name }))
    const banned = runtimeRefusal(game, runtime)
    if (banned) return notAllowed(banned)
    if (node.runtime === runtime) return ok(game)
    const framework = FRAMEWORKS[node.framework].language === def.language ? node.framework : 'none'
    return ok(
      patch(game, id, {
        runtime,
        framework,
        workers: def.pool ? defaultWorkers(node, runtime) : node.workers,
        leak: 0,
        ...restarted({ ...node, runtime }),
      }),
    )
  })

export const setFramework = (game: Game, id: string, framework: FrameworkId): Action =>
  withNode(game, id, (node) => {
    const def = FRAMEWORKS[framework]
    const research = def.language ? RESEARCH[`fw-${framework}` as ResearchId] : undefined
    if (!frameworkReady(game, framework) && research)
      return no(Refusal.Locked({ what: def.name, research: research.name }))
    if (def.language !== null && def.language !== RUNTIMES[node.runtime].language)
      return notAllowed(`${def.name} needs ${LANGUAGES[def.language].name}.`)
    if (node.framework === framework) return ok(game)
    return ok(patch(game, id, { framework, ...restarted(node) }))
  })

export const setWorkers = (game: Game, id: string, workers: number): Action =>
  withNode(game, id, (node) =>
    RUNTIMES[node.runtime].pool
      ? ok(
          patch(game, id, {
            workers: Math.round(Math.max(POOL_LIMITS.min, Math.min(POOL_LIMITS.max, workers))),
          }),
        )
      : notAllowed(`${RUNTIMES[node.runtime].name} sizes its own pool.`),
  )

/**
 * Turns periodic restarts on or off for an App Server whose processes live across requests
 * (`pm.max_requests`, a Puma worker killer). A recycled process starts cold now and then, and a
 * leak never builds: the Node's heap returns to what it was.
 */
export const setRecycle = (game: Game, id: string, recycle: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'server' && node.type !== 'worker')
      return notAllowed('Only App Servers and Workers recycle their processes.')
    if (!RUNTIMES[node.runtime].persistent)
      return notAllowed(
        `${RUNTIMES[node.runtime].name} starts every request clean: nothing to recycle.`,
      )
    return ok(node.recycle === recycle ? game : patch(game, id, { recycle, leak: 0 }))
  })

/** Sets a Cache's TTL, or the DNS TTL. DNS needs Health checks, which make it drop dead hosts. */
export const setTtl = (game: Game, id: string, ttl: number): Action =>
  withNode(game, id, (node) => {
    if (node.type === 'cache')
      return CACHE_TTLS.some((entry) => entry.ttl === ttl)
        ? ok(patch(game, id, { ttl }))
        : notAllowed('A cache TTL is 10 seconds, 1 minute, or 1 hour.')
    if (node.type === 'cdn')
      return CDN_TTLS.some((entry) => entry.ttl === ttl)
        ? ok(patch(game, id, { ttl }))
        : notAllowed('A CDN TTL is 1 minute, 5 minutes, or 1 hour.')
    if (node.type !== 'dns') return notAllowed('Only DNS, CDNs and Caches have a TTL.')
    if (!(DNS_TTLS as ReadonlyArray<number>).includes(ttl))
      return notAllowed('A TTL is 30 seconds, 5 minutes, or 1 hour.')
    if (!has(game, 'health-checks'))
      return no(Refusal.Locked({ what: 'TTL', research: RESEARCH['health-checks'].name }))
    return ok(patch(game, id, { ttl }))
  })

export const setPm = (game: Game, id: string, pm: PmMode): Action =>
  withNode(game, id, (node) =>
    (node.type === 'server' || node.type === 'worker') && node.runtime === 'php_fpm'
      ? ok(node.pm === pm ? game : patch(game, id, { pm }))
      : notAllowed('Only PHP-FPM has a process manager.'),
  )

/** Moves a Node to another zone. Needs Multiple zones; a sized Node restarts there. */
export const setZone = (game: Game, id: string, zone: Zone): Action =>
  withNode(game, id, (node) => {
    if (!has(game, 'multi-az'))
      return no(Refusal.Locked({ what: 'Zones', research: RESEARCH['multi-az'].name }))
    if (!zoned(node)) return notAllowed(`${COMPONENTS[node.type].name} spans every zone.`)
    if (node.zone === zone) return ok(game)
    return ok(
      patch(game, id, {
        zone,
        ...(COMPONENTS[node.type].sized && !isDown(node) ? restarted(node) : {}),
      }),
    )
  })

/** Gives a data Node a standby in another zone, at twice the Burn. Needs Multiple zones. */
export const setStandby = (game: Game, id: string, standby: boolean): Action =>
  withNode(game, id, (node) => {
    if (!STANDBY_TYPES.includes(node.type))
      return notAllowed('Only a Database, Pooler, Cache, Search Engine, or Queue keeps a standby.')
    if (standby && !has(game, 'multi-az'))
      return no(Refusal.Locked({ what: 'A standby', research: RESEARCH['multi-az'].name }))
    return ok(node.standby === standby ? game : patch(game, id, { standby }))
  })

/**
 * Sets a compute Node's pricing model (09 "Pricing models"): on-demand at the
 * full rate, reserved at 0.6× for a commitment of one calendar week, or spot at
 * 0.3× on capacity the provider can reclaim. From Series A.
 */
export const setPricing = (game: Game, id: string, pricing: Pricing): Action =>
  withNode(game, id, (node) => {
    if (game.stage < PRICING_FROM_STAGE)
      return no(
        Refusal.TooEarly({
          what: 'A pricing model',
          era: ERAS[PRICING_FROM_STAGE]?.name ?? 'a later Era',
        }),
      )
    if (COMPONENTS[node.type].group !== 'compute')
      return notAllowed('Only compute Nodes have a pricing model.')
    if (!COMPONENTS[node.type].sized) return notAllowed('Only VMs have a pricing model.')
    if (pricing === 'reserved' && !has(game, 'reserved-instances'))
      return notAllowed('Reserved pricing needs research: Reserved instances.')
    if (pricing === 'spot' && !has(game, 'spot-instances'))
      return notAllowed('Spot pricing needs research: Spot instances.')
    const current = pricingOf(game, node)
    if (current === pricing) return ok(game)
    // A reserved term is the commitment: it holds until its calendar week ends.
    if (current === 'reserved')
      return notAllowed('A reserved Node stays reserved until its calendar week ends.')
    return ok(
      patch(game, id, {
        pricing,
        pricingUntil: pricing === 'reserved' ? game.time + RESERVED_SECONDS : null,
      }),
    )
  })

/** Picks a Java App Server's collector. ZGC needs its research. */
export const setCollector = (game: Game, id: string, collector: Collector): Action =>
  withNode(game, id, (node) => {
    if (RUNTIMES[node.runtime].language !== 'java')
      return notAllowed('Only Java runs a choice of collector.')
    if (collector === 'zgc' && !has(game, 'zgc'))
      return no(Refusal.Locked({ what: 'ZGC', research: RESEARCH.zgc.name }))
    if (node.collector === collector) return ok(game)
    return ok(patch(game, id, { collector, ...restarted(node) }))
  })

/** Sets a Go App Server's GOGC: 50, 100 or 200. Needs Go GC tuning. */
export const setGogc = (game: Game, id: string, gogc: number): Action =>
  withNode(game, id, (node) => {
    if (RUNTIMES[node.runtime].language !== 'go') return notAllowed('Only Go has GOGC.')
    if (!has(game, 'gogc-tuning'))
      return no(Refusal.Locked({ what: 'GOGC', research: RESEARCH['gogc-tuning'].name }))
    if (!GOGC.some((entry) => entry.gogc === gogc)) return notAllowed('GOGC is 50, 100 or 200.')
    return ok(node.gogc === gogc ? game : patch(game, id, { gogc }))
  })

/**
 * Turns the Company's scheduled chaos experiments on or off (Chaos engineering). While they run,
 * every `CHAOS_EVERY` sim seconds the Design's weakest Node fails `CHAOS_FAILURE` of its calls for
 * a few seconds, and the Company earns Failure Insight for it.
 */
export const setChaos = (game: Game, chaos: boolean): Action => {
  if (game.sandbox) return notAllowed('A Sandbox runs no experiments of its own.')
  if (chaos && !has(game, 'chaos-engineering'))
    return no(Refusal.Locked({ what: 'Chaos', research: RESEARCH['chaos-engineering'].name }))
  return ok(game.chaos === chaos ? game : { ...game, chaos, weakest: chaos ? game.weakest : null })
}

/** Opens a region: its own Users Node, and a tab on the board. Needs Multiple regions. */
export const openRegion = (game: Game, region: Region): Action => {
  if (!has(game, 'multi-region'))
    return no(Refusal.Locked({ what: 'Regions', research: RESEARCH['multi-region'].name }))
  if (openRegions(game).includes(region)) return notAllowed('That region is open.')
  const home = game.nodes.find((node) => node.type === 'users')
  const id = `users-${region}`
  const users: GameNode = {
    ...blankNode(game, id, 'users', home?.x ?? 80, home?.y ?? 280, region),
    life: RUNNING,
  }
  return spend(
    game,
    game.sandbox ? 0 : Math.round(OPEN_REGION_PRICE * eraOf(game).costIndex),
    REGION_INFO[region].name,
    (paid) => ({ ...paid, nodes: [...paid.nodes, users] }),
  )
}

/** Moves a Node to another open region. It restarts there. */
export const setRegion = (game: Game, id: string, region: Region): Action =>
  withNode(game, id, (node) => {
    if (COMPONENTS[node.type].fixed || isGlobal(node))
      return notAllowed(`${COMPONENTS[node.type].name} serves every region.`)
    if (!openRegions(game).includes(region)) return notAllowed('Open that region first.')
    if (node.region === region) return ok(game)
    return ok(
      patch(game, id, {
        region,
        ...(COMPONENTS[node.type].sized && !isDown(node) ? restarted(node) : {}),
      }),
    )
  })

/** Spreads a Wide-column Store or Distributed SQL Node across the open regions. */
export const setSpread = (game: Game, id: string, spread: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'wide' && node.type !== 'dsql')
      return notAllowed('Only a Wide-column Store or Distributed SQL spreads across regions.')
    if (spread && openRegions(game).length < 2) return notAllowed('Open a second region first.')
    return ok(node.spread === spread ? game : patch(game, id, { spread }))
  })

/** Picks the engine a Database or Read Replica runs (07 "Variants"): Postgres forks a process per
 * connection, MySQL gives each a thread and holds more of them. */
export const setDbEngine = (game: Game, id: string, dbEngine: DbEngine): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database' && node.type !== 'replica')
      return notAllowed('Only a Database or Read Replica has an engine.')
    return ok(node.dbEngine === dbEngine ? game : patch(game, id, { dbEngine }))
  })

/** Splits hot keys across a Cache's or Wide-column Store's shards. Needs Hybrid fan-out. */
export const setSplit = (game: Game, id: string, split: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'cache' && node.type !== 'wide')
      return notAllowed('Only a Cache or Wide-column Store splits keys.')
    if (split && !has(game, 'hybrid-fanout'))
      return no(Refusal.Locked({ what: 'Key splitting', research: RESEARCH['hybrid-fanout'].name }))
    return ok(node.split === split ? game : patch(game, id, { split }))
  })

/** Rolls back the routing change that withdrew the Company from the internet. */
export const rollBackRoutes = (game: Game): Action =>
  endIncident(game, 'bgp', 'No routing change to roll back.')

/** Share of the Users a phishing page drives away. The design gives no number: this is proposed. */
export const PHISH_CHURN = 0.1

/**
 * Acting on a phishing Mail leaks the Company's credentials and starts the Credential leak
 * (18 "Spam and phishing"). The act is the player's, so it is an Action like any other. With the
 * credentials in a secrets manager there is nothing on the page to take (10 "Secrets management").
 */
export const phished = (game: Game): Action => {
  if (game.sandbox) return notAllowed('A Sandbox has no credentials to leak.')
  if (has(game, 'secrets-management'))
    return notAllowed('The credentials live in the vault. The page has nothing to take.')
  if (game.incident) return notAllowed('Wait for the incident to end.')
  const started = startIncident(game, solveFlow(game), 'credential-leak', 0)
  if (!started) return notAllowed('There is nothing left to leak.')
  return ok({
    ...started.game,
    users: Math.max(1, Math.floor(started.game.users * (1 - PHISH_CHURN))),
  })
}

/** Paying an invoice from a provider the Company does not use: the Cash is gone (18 "Spam"). */
export const payFakeInvoice = (game: Game, amount: number): Action =>
  spend(game, amount, 'A fake invoice', (paid) => paid)

/** Rolls back the config push that crashed the servers: they restart on the old config. */
export const rollBackConfig = (game: Game): Action =>
  endIncident(game, 'config', 'No config push to roll back.')

/** Fences the old leader: the partition's writes stop diverging. */
export const fenceLeader = (game: Game): Action =>
  endIncident(game, 'partition', 'No partition to fence.')

/** Runs the DR drill: the home region fails for a minute (10 "Era 6"). Needs Disaster recovery drills. */
export const runDrill = (game: Game): Action => {
  if (!has(game, 'dr-drills'))
    return no(Refusal.Locked({ what: 'The DR drill', research: RESEARCH['dr-drills'].name }))
  if (game.incident) return notAllowed('Wait for the incident to end.')
  if (game.drill?._tag === 'Running') return notAllowed('A drill is running.')
  const ledger = solveFlow(game)
  const started = startIncident(game, ledger, 'dr-drill', 0)
  if (!started) return notAllowed('Nothing runs in the home region.')
  return ok({ ...started.game, drill: newDrill(game, ledger) })
}

/** Sets the quarter's guidance, on its first calendar day. */
export const setGuidance = (game: Game, growth: number, margin: number): Action => {
  if (!game.quarter) return notAllowed('Guidance starts after the IPO.')
  if (!guidanceOpen(game)) return notAllowed('Guidance is set on the first day of a quarter.')
  if (![0, 1, 2].includes(growth) || ![0, 1, 2].includes(margin))
    return notAllowed('Pick a level for each.')
  return ok({
    ...game,
    quarter: {
      ...game.quarter,
      growth,
      margin,
      phase: quarterStep(game.quarter.phase, { _tag: 'GuidanceSet' }),
    },
  })
}

/** Cancels the report that is scanning the primary. */
export const cancelReport = (game: Game): Action =>
  endIncident(game, 'report-db', 'No report is scanning the Database.')

/** Renews an expired certificate: the site comes back. */
export const renewCertificate = (game: Game): Action =>
  game.incident?.kind === 'certificate'
    ? // The renewal restarts the clock: the certificate is issued again now (05).
      ok({
        ...game,
        incident: { ...answering(game, game.incident), remaining: 0 },
        nodes: game.nodes.map((node) =>
          node.certUntil === null ? node : { ...node, certUntil: game.time + certLifeOf(game) },
        ),
      })
    : notAllowed('No certificate has expired.')

/** Cancels the migration that holds the table's lock: writes go through again. */
export const cancelMigration = (game: Game): Action =>
  endIncident(game, 'migration-lock', 'No migration is locking a table.')

/** Pins the dependency to a good version and redeploys: the malicious package is gone. */
export const pinAndRedeploy = (game: Game): Action =>
  endIncident(game, 'supply-chain', 'No compromised dependency is deployed.')

/**
 * Restores the deleted table from the Database's backup (11 "Accidental delete", 07 "Backups"). A
 * broken backup, or none at all, restores nothing: the users whose rows were in the table are lost.
 */
export const restoreBackup = (game: Game): Action => {
  const incident = game.incident
  if (incident?.kind !== 'accidental-delete') return notAllowed('No table was deleted.')
  const target = game.nodes.find((node) => node.id === incident.nodeId)
  const good = target !== undefined && target.backup !== 'none' && target.restore !== 'failed'
  return ok({
    ...game,
    users: good ? game.users : Math.max(1, Math.floor(game.users * (1 - DELETE_CHURN))),
    // A good restore takes time that grows with the rows it reads; a broken one ends the incident.
    incident: {
      ...answering(game, incident),
      remaining: good
        ? Math.min(incident.remaining, restoreSeconds(game, target?.backup ?? 'none'))
        : 0,
    },
  })
}

/** Restarts the Nodes whose clocks jumped: the region's timers and leases resync. */
export const restartClocks = (game: Game): Action =>
  endIncident(game, 'leap-second', 'No clock has jumped.')

/**
 * Acting on a fake advisory runs its patcher, which installs a backdoor (18 "Spam and phishing").
 * Dependency scanning catches the dropper first. The attacker uses the backdoor once it has sat
 * for BACKDOOR_FUSE sim seconds, and a Data breach starts.
 */
export const installBackdoor = (game: Game): Action => {
  if (game.sandbox) return notAllowed('A Sandbox has nothing to compromise.')
  if (has(game, 'dependency-scanning'))
    return notAllowed('Dependency scanning caught the dropper before it ran.')
  if (game.backdoorAt !== null) return notAllowed('The backdoor is already in.')
  return ok({ ...game, backdoorAt: game.time })
}

/** Takes a vendor's demo (18 "Spam and phishing"): the item's Study costs less Insight. */
export const takeDiscount = (game: Game, id: ResearchId): Action => {
  if (game.sandbox) return notAllowed('A Sandbox has no vendors.')
  if (has(game, id)) return notAllowed(`${RESEARCH[id].name} is already yours.`)
  if (game.discounts.includes(id)) return notAllowed('You already took that demo.')
  return ok({ ...game, discounts: [...game.discounts, id] })
}

/** Switches one of the Autopilot perk's policies on or off (13 "The Legacy shop"). */
export const setPolicyOn = (game: Game, policy: keyof Policies, on: boolean): Action => {
  if (game.sandbox || perkLevel(game, 'autopilot') < POLICY_LEVEL[policy])
    return notAllowed('The Autopilot perk has not reached that policy.')
  return ok(
    game.policies[policy] === on ? game : { ...game, policies: { ...game.policies, [policy]: on } },
  )
}

/** Sets an alert rule's threshold. A new threshold is a fresh start: its false alarms are forgiven. */
export const setAlertRule = (game: Game, rule: AlertRule, threshold: number): Action => {
  if (!has(game, 'alerting'))
    return no(Refusal.Locked({ what: 'Alert rules', research: RESEARCH.alerting.name }))
  if (!(ALERT_THRESHOLDS[rule] as ReadonlyArray<number>).includes(threshold))
    return notAllowed('That threshold is not on offer.')
  if (game.alertRules[rule] === threshold) return ok(game)
  return ok({
    ...game,
    alertRules: { ...game.alertRules, [rule]: threshold },
    falseAlarms: { ...game.falseAlarms, [rule]: 0 },
  })
}

/** Replaces a failed Node: it comes back cold after a restart. */
export const replace = (game: Game, id: string): Action =>
  withNode(game, id, (node) =>
    node.life._tag !== 'Stopped'
      ? notAllowed(`${COMPONENTS[node.type].name} has not failed.`)
      : spend(game, replacePrice(game, node), 'A replacement', (paid) =>
          patch(paid, id, restarted(node)),
        ),
  )

/**
 * Whether a Node is a box or process the player can restart: not the fixed Nodes, a Managed or
 * edge Component the provider runs, or a control, tap or mirror with no process of its own.
 */
export const restartable = (node: GameNode): boolean => {
  const def = COMPONENTS[node.type]
  return !def.fixed && !def.control && !def.tap && !def.mirror && !isGlobal(node)
}

/** Incidents a restart of the Node they hit ends: a stale cache, a bad package, a split cluster. */
const RESTART_FIXES: ReadonlyArray<IncidentId> = [
  'stale-opcache',
  'bun-compat',
  'gevent-compat',
  'split-brain',
  'gc-storm',
]

/**
 * Restarts a running Node (11 "Mitigation toolbox"): it goes down for its restart time and comes
 * back by the same rules as any restart, `restarted(node)`: cold, with leaked memory freed, a
 * Cache emptied (Redis reloads its data), a Realtime Hub's clients dropped to reconnect. A Node
 * that is already down is not restarted: a Stopped one is replaced.
 */
export const restart = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    const name = COMPONENTS[node.type].name
    if (!restartable(node)) return notAllowed(`${name} has no process of yours to restart.`)
    if (node.life._tag === 'Stopped') return notAllowed(`${name} is down for good. Replace it.`)
    if (isDown(node)) return notAllowed('It is already restarting.')
    const restarting = patch(game, id, { ...restarted(node), leak: 0 })
    // The restart is the fix for these incidents on the Node they hit: it ends them (11).
    const incident = game.incident
    return ok(
      incident?.nodeId === id && RESTART_FIXES.includes(incident.kind)
        ? { ...restarting, incident: { ...answering(game, incident), remaining: 0 } }
        : restarting,
    )
  })

/** Fails over every Node in the zone that is down and has a standby (11 "Zone outage"). */
export const failOverZone = (game: Game): Action => {
  if (!has(game, 'multi-az'))
    return no(Refusal.Locked({ what: 'Failing over', research: RESEARCH['multi-az'].name }))
  const zone = game.incident?.kind === 'zone' ? game.incident.zone : null
  if (zone === null) return notAllowed('No zone is down.')
  const standbys = game.nodes.filter((node) => node.zone === zone && node.standby && isDown(node))
  if (standbys.length === 0)
    return notAllowed('No Node in that zone has a standby to promote. Give one a standby first.')
  let next = game
  for (const node of standbys) {
    const promoted = failOver(next, node.id)
    if (Result.isFailure(promoted)) return promoted
    next = promoted.success
  }
  return ok(next)
}

/** Data a region outage leaves behind: only the Nodes that hold no state move to another region. */
const holdsState = (node: GameNode): boolean =>
  (COMPONENTS[node.type].group === 'data' && node.type !== 'cache' && node.type !== 'pooler') ||
  node.type === 'queue' ||
  node.type === 'log'

/**
 * Fails over a Node to its standby (11 "Mitigation toolbox", 05 "Zones"): the standby in another
 * zone takes over at once instead of after the usual failover time. The standby becomes the
 * primary and nothing keeps a copy any more, so the Burn halves until the player gives it a new
 * standby. A Node with no standby has nothing to promote. Needs Multiple zones.
 */
export const failOver = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    if (!has(game, 'multi-az'))
      return no(Refusal.Locked({ what: 'Failing over', research: RESEARCH['multi-az'].name }))
    const name = COMPONENTS[node.type].name
    if (!STANDBY_TYPES.includes(node.type))
      return notAllowed(`${name} keeps no standby. Copies of an App Server spread across zones.`)
    if (!node.standby) return notAllowed(`${name} has no standby. Give it one before a zone fails.`)
    if (!isDown(node)) return notAllowed(`${name} is serving: there is nothing to fail over.`)
    const out = game.incident?.zone ?? null
    const zone = ZONES.find((entry) => entry !== node.zone && entry !== out) ?? node.zone
    const promoted = patch(game, id, {
      life: warming(warmAfterRestart(node)),
      zone,
      standby: false,
    })
    return ok(game.incident ? { ...promoted, incident: answering(game, game.incident) } : promoted)
  })

/**
 * Fails the region over (11 "Mitigation toolbox", "Region outage", "DR drill"): every stateless
 * Node the outage took down starts again in the nearest other open region, cold, and the Design
 * pays a replacement for each. Data that lives in one region stays down: only a store spread
 * across regions survives, and a drill still tests that. Needs Multiple zones and a second region.
 */
export const failOverRegion = (game: Game): Action => {
  if (!has(game, 'multi-az'))
    return no(Refusal.Locked({ what: 'Failing over', research: RESEARCH['multi-az'].name }))
  const incident = game.incident
  if ((incident?.kind !== 'region' && incident?.kind !== 'dr-drill') || incident.region === null)
    return notAllowed('No region is down.')
  const out = incident.region
  const target = openRegions(game)
    .filter((region) => region !== out)
    .reduce<Region | undefined>(
      (best, region) => (!best || rttOf(out, region) < rttOf(out, best) ? region : best),
      undefined,
    )
  if (!target) return notAllowed('Open a second region first: there is nowhere to fail over to.')
  const moving = game.nodes.filter(
    (node) =>
      node.region === out &&
      isDown(node) &&
      !survivesRegion(game, node) &&
      !holdsState(node) &&
      !COMPONENTS[node.type].fixed,
  )
  if (moving.length === 0)
    return notAllowed('Nothing here can move: the data of the region stays until it is back.')
  const price = moving.reduce((sum, node) => sum + replacePrice(game, node), 0)
  return spend(game, price, 'Failing over', (paid) => ({
    ...paid,
    nodes: paid.nodes.map((node) =>
      moving.some((entry) => entry.id === node.id)
        ? { ...node, region: target, ...restarted(node) }
        : node,
    ),
    incident: paid.incident ? answering(paid, paid.incident) : paid.incident,
  }))
}

/**
 * Throttles the connects of a Realtime Hub during a Reconnect storm (11 "Reconnect storm"): the
 * Hub admits the wave at the rate it can take instead of refusing what it cannot, which is what
 * jittered backoff does, so the herd stops refusing clients while the Hub warms.
 */
export const throttleConnects = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    const incident = game.incident
    if (node.type !== 'ws') return notAllowed('Only a Realtime Hub takes connects.')
    if (incident?.kind !== 'reconnect' || incident.nodeId !== id)
      return notAllowed('No reconnect wave is hitting this Hub.')
    if (incident.throttled === true) return notAllowed('Its connects are already throttled.')
    return ok({ ...game, incident: { ...answering(game, incident), throttled: true } })
  })

/** An App Server whose runtime runs one event loop, which a heavy callback stalls. */
const onLoop = (node: GameNode): boolean =>
  node.type === 'server' && RUNTIMES[node.runtime].blocking === 'loop'

/**
 * Moves login off the blocked event loop (11 "Event loop block", 08 "Services", 05 "Load
 * Balancer"): each L7 Load Balancer in front of an App Server on an event loop stops sending it
 * `login` and sends it to a Service behind the same Load Balancer on a runtime with no event
 * loop. The incident ends once no login reaches a loop.
 */
export const moveKind = (game: Game): Action => {
  const incident = game.incident
  if (incident?.kind !== 'loop') return notAllowed('No event loop is blocked.')
  const behind = (lb: GameNode): ReadonlyArray<GameNode> =>
    game.links
      .filter((entry) => entry.from === lb.id)
      .map((entry) => game.nodes.find((candidate) => candidate.id === entry.to))
      .filter(
        (to): to is GameNode =>
          to !== undefined && (to.type === 'server' || to.type === 'fn') && !isDown(to),
      )
  const fronts = game.nodes.filter(
    (lb) => lb.type === 'lb' && behind(lb).some((child) => onLoop(child)),
  )
  if (fronts.length === 0)
    return notAllowed('Put a Load Balancer in front of the App Servers to route login elsewhere.')
  const l7 = fronts.filter((lb) => lb.variant === 'l7')
  if (l7.length === 0)
    return notAllowed(
      'An L4 Load Balancer carries every kind. Make it L7 to route login elsewhere.',
    )
  const moving = l7.filter((lb) => behind(lb).some((child) => !onLoop(child)))
  if (moving.length === 0)
    return notAllowed(
      'No other Service takes login off an event loop: add one on a runtime without it.',
    )
  const routed = new Set(moving.map((lb) => lb.id))
  const links = game.links.map((entry) => {
    if (!routed.has(entry.from)) return entry
    const child = game.nodes.find((candidate) => candidate.id === entry.to)
    if (!child) return entry
    if (onLoop(child))
      return {
        ...entry,
        kinds: REQUEST_KINDS.filter(
          (kind) => kind !== 'login' && (entry.kinds === null || entry.kinds.includes(kind)),
        ),
      }
    return entry.kinds === null || entry.kinds.includes('login')
      ? entry
      : {
          ...entry,
          kinds: REQUEST_KINDS.filter((kind) => kind === 'login' || entry.kinds?.includes(kind)),
        }
  })
  return ok({ ...game, links, incident: answering(game, incident) })
}

/**
 * Drains a Node (11 "Mitigation toolbox"): it takes no new traffic, finishes the work it holds,
 * and rejoins the rotation when it is empty. The Incident on it is cut to the drain window,
 * because the Node it was hurting users through stops answering.
 */
export const drain = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    if (!has(game, 'health-checks'))
      return no(
        Refusal.Locked({ what: 'Draining a Node', research: RESEARCH['health-checks'].name }),
      )
    if (node.service._tag === 'Shut') return notAllowed('It is shut down.')
    if (isDown(node)) return notAllowed('It is already down.')
    if (node.service._tag === 'Draining') return notAllowed('It is already draining.')
    const incident =
      game.incident?.nodeId === id
        ? {
            ...answering(game, game.incident),
            remaining: Math.min(game.incident.remaining, DRAIN_SECONDS),
          }
        : game.incident
    return ok({
      ...patch(game, id, { service: { _tag: 'Draining', since: game.time } }),
      incident,
    })
  })

/**
 * The player's first action while an Incident runs acknowledges it (11 "The incident loop"): MTTA
 * counts from the signal to this second. Any action counts, because it means the player is at the
 * board; a Sandbox and a Company otherwise are the same here.
 */
export const acknowledge = (game: Game): Game => {
  const incident = game.incident
  if (!incident) return game
  return {
    ...game,
    incident: {
      ...incident,
      phase: incidentStep(incident.phase, { _tag: 'Acked', at: game.time }),
    },
  }
}

/**
 * Files a postmortem. Taking its action item researches the prevention at its
 * normal price. Filing without it leaves the item open, and the incident it
 * prevents stays twice as likely until the research is owned.
 */
export const filePostmortem = (game: Game, id: number, take: boolean): Action => {
  const postmortem = game.postmortems.find((entry) => entry.id === id)
  if (!postmortem) return no(Refusal.Missing())
  const filed: Game = {
    ...game,
    postmortems: game.postmortems.filter((entry) => entry.id !== id),
  }
  const action = postmortem.action
  if (!take || !action || has(game, action)) return ok(filed)
  return study(filed, action, true)
}

/**
 * Queues an item's Study (10 "Studies"): at the end, or first so it runs now.
 * A queued item put first keeps its progress.
 */
export const study = (game: Game, id: ResearchId, first = false): Action => {
  const entry = RESEARCH[id]
  if (has(game, id)) return notAllowed(`${entry.name} is already yours.`)
  if (entry.era > game.stage)
    return no(Refusal.TooEarly({ what: entry.name, era: ERAS[entry.era]?.name ?? 'a later Era' }))
  if (!researchReady(game, id)) {
    const missing = entry.requires.filter((needed) => !has(game, needed))
    return no(
      Refusal.Locked({
        what: entry.name,
        research: missing.map((needed) => RESEARCH[needed].name).join(' and '),
      }),
    )
  }
  const queued = game.studies.find((item) => item.id === id)
  if (queued) {
    if (!first) return notAllowed(`${entry.name} is in the queue.`)
    return ok({ ...game, studies: [queued, ...game.studies.filter((item) => item.id !== id)] })
  }
  if (game.studies.length >= MAX_STUDIES)
    return notAllowed(`The queue holds ${MAX_STUDIES} Studies.`)
  const added = { id, phase: { _tag: 'Queued' as const, progress: 0 } }
  return ok({ ...game, studies: first ? [added, ...game.studies] : [...game.studies, added] })
}

/** Moves a queued Study to a position. The first one runs. */
export const moveStudyTo = (game: Game, id: ResearchId, index: number): Action => {
  const from = game.studies.findIndex((item) => item.id === id)
  if (from === -1) return no(Refusal.Missing())
  const to = Math.max(0, Math.min(game.studies.length - 1, Math.trunc(index)))
  if (to === from) return ok(game)
  const studies = [...game.studies]
  const [item] = studies.splice(from, 1)
  if (item) studies.splice(to, 0, item)
  return ok({ ...game, studies })
}

/** Moves a queued Study up or down. The first one runs. */
export const moveStudy = (game: Game, id: ResearchId, direction: 1 | -1): Action => {
  const index = game.studies.findIndex((item) => item.id === id)
  if (index === -1) return no(Refusal.Missing())
  return moveStudyTo(game, id, index + direction)
}

/** Takes a Study off the queue. Its progress and the Insight it took are lost, and its Spike ends. */
export const cancelStudy = (game: Game, id: ResearchId): Action =>
  game.studies.some((item) => item.id === id)
    ? ok({
        ...game,
        studies: game.studies.filter((item) => item.id !== id),
        backlog: game.backlog.filter((item) => !(item.kind === 'spike' && item.ref === id)),
      })
    : no(Refusal.Missing())

export const collect = (game: Game): Game => ({
  ...game,
  cash: game.cash + game.pending,
  pending: 0,
})

export const canRaise = (game: Game): boolean =>
  !game.sandbox &&
  !isFinalEra(game) &&
  game.users >= eraOf(game).raiseAt &&
  (game.stage !== PRE_IPO_STAGE || ipoReady(game, solveFlow(game)))

const advanceEra = (game: Game, raised: boolean, firstIncidentAfter: number): Action => {
  if (!canRaise(game)) {
    const era = eraOf(game)
    return notAllowed(
      game.stage === PRE_IPO_STAGE && game.users >= era.raiseAt
        ? 'Complete the IPO checklist first.'
        : `Reach ${era.raiseAt.toLocaleString('en-US')} users first.`,
    )
  }
  const era = eraOf(game)
  const stage = game.stage + 1
  const bootstrapped = ventureOf(game).bootstrapped
  if (raised && bootstrapped && game.stage !== PRE_IPO_STAGE)
    return notAllowed('A bootstrapped Company takes no rounds.')
  const dilution = bootstrapped ? 0 : dilutionOf(game, era.dilution)
  // The IPO: no declining it, a grant of Burn, and quarters from now on.
  if (game.stage === PRE_IPO_STAGE) {
    if (!raised) return notAllowed('The IPO cannot be declined.')
    const ledger = solveFlow(game)
    return ok({
      ...game,
      stage,
      stageAt: game.time,
      cash: game.cash + ledger.burn * IPO_BURN_SECONDS,
      equity: game.equity * (1 - dilution),
      round: { _tag: 'Raised' },
      quarter: firstQuarter(game, ledger.revenue),
    })
  }
  // Alumni network: former colleagues join when hiring opens.
  const alumni = stage === 1 ? alumniOf(game, perkLevel(game, 'alumni-network')) : []
  return ok({
    // Users abroad arrive with the regions (04 "Going global").
    ...(stage === REGIONS_FROM_STAGE ? goGlobal(game) : game),
    stage,
    stageAt: game.time,
    cash: game.cash + (raised ? grantOf(game, era.grant) : 0),
    equity: raised ? game.equity * (1 - dilution) : game.equity,
    // A bootstrapped Company declines every round, and grows at the full rate.
    round: raised ? { _tag: 'Raised' } : { _tag: 'Declined' },
    nextIncidentAt: stage === 1 ? game.time + firstIncidentAfter : game.nextIncidentAt,
    engineers: alumni.length > 0 ? [...game.engineers, ...alumni] : game.engineers,
    workSeq: game.workSeq + alumni.length,
  })
}

/** Takes the round: a grant for Equity, and full growth in the next Era. */
export const raise = (game: Game, firstIncidentAfter = FIRST_INCIDENT_AFTER): Action =>
  advanceEra(game, true, firstIncidentAfter)

/** Declines the round: keeps Equity, no grant, and slower growth in the next Era. */
export const decline = (game: Game, firstIncidentAfter = FIRST_INCIDENT_AFTER): Action =>
  advanceEra(game, false, firstIncidentAfter)

export const offer = (game: Game) => {
  if (game.round._tag !== 'Offered') return null
  const next = nextEra(game)
  if (!next) return null
  // The IPO pays a thousand seconds of Burn (plan 5.19).
  const grant =
    game.stage === PRE_IPO_STAGE
      ? solveFlow(game).burn * IPO_BURN_SECONDS
      : grantOf(game, eraOf(game).grant)
  const dilution = ventureOf(game).bootstrapped ? 0 : dilutionOf(game, eraOf(game).dilution)
  return { era: next, grant, dilution, bootstrapped: ventureOf(game).bootstrapped }
}
