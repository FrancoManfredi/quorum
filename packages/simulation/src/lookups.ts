import {
  CACHE_ENGINES,
  AUTH_PRICE_PER_USER,
  COMPONENTS,
  COMPONENT_IDS,
  COPY_PRICE_GROWTH,
  CROSS_ZONE_MS,
  DRAWER_MIN,
  DRAWER_SECONDS,
  ERAS,
  FAMILIES,
  FRAMEWORKS,
  FRAMEWORK_RESEARCH,
  RESEARCH,
  researchList,
  RUNTIMES,
  SAMPLE_RATES,
  RETENTION_STORAGE,
  RETENTION_WINDOWS,
  SAMPLE_STORAGE,
  GPU_TYPES,
  GZIP_RATIO,
  HANDSHAKE_MS,
  HOP_MS,
  POD_BURN,
  PROFILES,
  PRICINGS,
  DEPLOY_STRATEGIES,
  RESTART_SECONDS,
  SELL_REFUND,
  SIZES,
  STORAGE_PRICE,
  STREAM_KB,
  VCPU_PRICE,
  WARMED,
  USER_MBPS,
  USER_UP_MBPS,
  VM_RESTART_SECONDS,
  type BuildGroup,
  type ComponentId,
  type EraDef,
  type FrameworkId,
  type RequestKind,
  type RequestProfile,
  type ResearchId,
  type RuntimeId,
  BACKUPS,
  DB_RETENTIONS,
  DB_STORAGE_MULT,
  SPREAD_REGIONS,
  STORAGE_CLASSES,
  STORAGE_IOPS,
  COLD_START_MS,
  NATIVE_COLD_MS,
  EDGE_REQUEST_PRICE,
  SERVERLESS_GB_SECOND,
  SERVERLESS_MEMORY_GB,
  SERVERLESS_REQUEST_PRICE,
  LOG_REPLICAS,
  LOG_REPLICA_BURN,
  VEC_INDEXES,
  CALENDAR_DAY,
  CERT_DAYS,
  CERT_DAYS_SHORT,
  CERT_SHORT_FROM,
  MESH_OVERHEAD,
  LIVE_TUNING,
  type Tuning,
} from './catalog.ts'
import { restarting, type DownCause } from './life.ts'
import type { Game, GameNode, Pricing, StorageClass } from './state.ts'

/* ==========================================================================
   Small facts about a Game that the solver, the actions and the UI all ask:
   what is researched, what a Node's hardware is, and what things cost.
   ========================================================================== */

/** The researched list as a set, built once per list: the solver asks on every hop. */
const researchedSets = new WeakMap<ReadonlyArray<ResearchId>, ReadonlySet<ResearchId>>()

export const has = (game: Game, id: ResearchId): boolean => {
  let set = researchedSets.get(game.researched)
  if (!set) {
    set = new Set(game.researched)
    researchedSets.set(game.researched, set)
  }
  return set.has(id)
}

/** All pools together, for figures that show one Insight number. */
export const insightTotal = (pools: Readonly<Record<string, number>>): number =>
  Object.values(pools).reduce((sum, value) => sum + value, 0)

/**
 * An SRE team with at least one engineer holds the pager (08 "Teams"): more than a team of a
 * kind, it needs someone on it, as a Platform team does to run the Clusters.
 */
export const sreStaffed = (game: Game): boolean =>
  game.teams.some(
    (team) => team.kind === 'sre' && game.engineers.some((engineer) => engineer.team === team.id),
  )

export const eraOf = (game: Game): EraDef => ERAS[Math.min(game.stage, ERAS.length - 1)] as EraDef

export const nextEra = (game: Game): EraDef | undefined => ERAS[game.stage + 1]

export const isFinalEra = (game: Game): boolean => game.stage >= ERAS.length - 1

/** The Components a player can place from one build group, in catalog order. */
export const buildItems = (group: BuildGroup): ReadonlyArray<ComponentId> =>
  COMPONENT_IDS.filter((type) => COMPONENTS[type].group === group && !COMPONENTS[type].fixed)

export const isUnlocked = (game: Game, type: ComponentId): boolean => {
  const unlock = COMPONENTS[type].unlock
  return unlock === null || has(game, unlock)
}

export const researchReady = (game: Game, id: ResearchId): boolean =>
  RESEARCH[id].era <= game.stage && RESEARCH[id].requires.every((needed) => has(game, needed))

/** Insight covers the cheapest Research item the player can study now: Research is worth opening. */
export const researchAffordable = (game: Game): boolean =>
  insightTotal(game.pools) >=
  Math.min(
    ...researchList
      .filter((entry) => !has(game, entry.id) && researchReady(game, entry.id))
      .map((entry) => entry.cost),
  )

export const runtimeReady = (game: Game, runtime: RuntimeId): boolean => {
  const needed = RUNTIMES[runtime].research
  return needed === null || has(game, needed)
}

export const frameworkReady = (game: Game, framework: FrameworkId): boolean => {
  const needed = FRAMEWORK_RESEARCH[framework]
  return needed === null || has(game, needed)
}

/* ---------- hardware ---------- */

export const sizeName = (node: GameNode): string => SIZES[node.size]?.name ?? 'custom'

/** What a card calls a size: the instance size, or a step number for flat Components. */
export const sizeLabel = (node: GameNode, size = node.size): string =>
  COMPONENTS[node.type].sized ? (SIZES[size]?.name ?? '') : `size ${size}`

/** Capacity and Burn multiplier of a flat Component's size: each step doubles both. */
export const flatScale = (node: GameNode): number => grown(1, 2, node.size - 1)

/** A Node whose box carries a pricing model: a sized compute Node (09 "Pricing models"). */
export const hasPricing = (node: GameNode): boolean =>
  COMPONENTS[node.type].sized && COMPONENTS[node.type].group === 'compute'

/** Where an Analytics Node's sample rate sits on the ladder of rates. */
export const sampleIndex = (node: GameNode): number => {
  const index = (SAMPLE_RATES as ReadonlyArray<number>).indexOf(node.sampleRate)
  return index === -1 ? 2 : index
}

export const vcpuOf = (node: GameNode): number => SIZES[node.size]?.vcpu ?? 1

/** KB a response of this kind sends from this Node: gzip shrinks the compressible kinds. */
export const payloadOf = (node: GameNode, kind: RequestKind, offloaded = false): number =>
  (offloaded && PROFILES[kind].offload > 0 ? PROFILES[kind].asyncKB : PROFILES[kind].payloadKB) *
  (node.compress && PROFILES[kind].compressible ? GZIP_RATIO : 1)

/** Milliseconds the response takes to reach the user over their downlink, after the request came up. */
export const transferMs = (node: GameNode, kind: RequestKind, offloaded = false): number =>
  ((PROFILES[kind].stream
    ? Math.min(STREAM_KB, payloadOf(node, kind, offloaded))
    : payloadOf(node, kind, offloaded)) *
    8) /
    USER_MBPS +
  (PROFILES[kind].inKB * 8) / USER_UP_MBPS

/** Credential stuffing: bots send logins, each one a password hash. */
export const stuffing = (game: Game): boolean => game.incident?.kind === 'stuffing'

/** A kind's profile now: during credential stuffing, bots send logins. */
export const profileOf = (game: Game, kind: RequestKind): RequestProfile =>
  kind === 'bot' && stuffing(game) ? { ...PROFILES.login, scored: false } : PROFILES[kind]

/** This kind costs an App Server a login: a password hash, or a call to the Auth Provider. */
export const asLogin = (game: Game, kind: RequestKind): boolean =>
  kind === 'login' || (kind === 'bot' && stuffing(game))

/** Milliseconds one internal call costs on the wire: a hop, plus a handshake without keep-alive. */
export const hopMs = (game: Game): number => HOP_MS + (has(game, 'keepalive') ? 0 : HANDSHAKE_MS)

/** Nodes a zone outage takes down: what the Company runs in one zone itself. */
export const zoned = (node: GameNode): boolean =>
  COMPONENTS[node.type].limiting &&
  !COMPONENTS[node.type].fixed &&
  // A provider's, and the regional Load Balancer's, WAF's and API Gateway's, span every zone.
  node.type !== 'psp' &&
  node.type !== 'llm' &&
  node.type !== 'lb' &&
  node.type !== 'waf' &&
  node.type !== 'gw' &&
  // A store spread across regions keeps replicas in every zone too.
  !((node.type === 'wide' || node.type === 'dsql') && node.spread)

/** Extra milliseconds a call between two Nodes pays for leaving its zone. Regional Nodes span every zone. */
export const zoneMs = (from: GameNode, to: GameNode): number =>
  zoned(from) && zoned(to) && from.zone !== to.zone ? CROSS_ZONE_MS : 0

/** KB per second the box's network card moves: Gbps × 125,000. */
export const networkOf = (node: GameNode): number => (SIZES[node.size]?.gbps ?? 1) * 125_000

/** GB of RAM. */
export const ramOf = (node: GameNode): number => vcpuOf(node) * FAMILIES[node.family].ram

export const isDown = (node: GameNode): boolean =>
  node.life._tag === 'Restarting' || node.life._tag === 'Stopped'

/** The Node links into a live Kubernetes Cluster: it runs as pods. */
export const inCluster = (game: Game, node: GameNode): boolean =>
  clusterOf(game, node) !== undefined

/** The id of the live Kubernetes Cluster an App Server or Worker runs in, if any. */
export const clusterOf = (game: Game, node: GameNode): string | undefined =>
  node.type === 'server' || node.type === 'worker' ? clusteredOf(game).get(node.id) : undefined

/** The Nodes with a Link into a live Cluster, and that Cluster, found once per Game. */
const clustered = new WeakMap<Game, ReadonlyMap<string, string>>()
const clusteredOf = (game: Game): ReadonlyMap<string, string> => {
  let ids = clustered.get(game)
  if (!ids) {
    const live = new Set(
      game.nodes
        .filter((entry) => entry.type === 'cluster' && !isDown(entry))
        .map((entry) => entry.id),
    )
    const found = new Map<string, string>()
    for (const link of game.links)
      if (live.has(link.to) && !found.has(link.from)) found.set(link.from, link.to)
    ids = found
    clustered.set(game, ids)
  }
  return ids
}

/** The App Servers and Workers that run in a Cluster. */
export const podsOf = (game: Game, cluster: GameNode): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => clusterOf(game, node) === cluster.id)

/** Copies of a Node that bill: the ones serving and the ones still booting. */
export const copiesOf = (node: GameNode): number => node.replicas + node.pending

/** Seconds a Node stays down when it restarts: an App Server boots its runtime, at least 1 s for the VM. */
export const restartSeconds = (node: GameNode): number =>
  node.type === 'server'
    ? Math.max(
        VM_RESTART_SECONDS,
        RUNTIMES[node.runtime].startup + FRAMEWORKS[node.framework].startup,
      )
    : RESTART_SECONDS

/** The fields of a Node that restarts and comes back cold. */
/** How warm a Node comes back from a restart: cold, except Redis, which reloads its data. */
export const warmAfterRestart = (node: GameNode, warming = false): number =>
  node.type === 'cache'
    ? Math.max(CACHE_ENGINES[node.engine].warmAfterRestart, warming ? WARMED : 0)
    : 0

/** A Node restarting: it comes back warm or cold, and a shut Node comes back in service. */
export const restarted = (node: GameNode, cause: DownCause = 'restart', warming = false) => ({
  life: restarting(restartSeconds(node), cause, warmAfterRestart(node, warming)),
  ...(node.shut ? { shut: false } : {}),
})

export const languageOf = (node: GameNode) => RUNTIMES[node.runtime].language

/**
 * Milliseconds a cold start costs this Serverless Function (05 "Cold starts"): its language's
 * figure, or 100 ms when the Stack is an ahead-of-time binary (the design's GraalVM native image).
 */
export const coldStartMs = (node: GameNode): number => {
  const runtime = RUNTIMES[node.runtime]
  return runtime.id === 'graal' || runtime.id === 'native_aot'
    ? NATIVE_COLD_MS
    : (COLD_START_MS[runtime.language] ?? NATIVE_COLD_MS)
}

/** A live Edge Function holds the edge key-value cache a CDN answers `read` from (05 "CDN"). */
export const hasEdge = (game: Game): boolean =>
  game.nodes.some((node) => node.type === 'edge' && !isDown(node))

/**
 * The live Vector Index a Node links to, if any: the company's own documents behind an `ai`
 * answer (07 "Vector Index"). A Node that reaches one pays the nearest-neighbour lookup, and the
 * prompt it answers earns more.
 */
export const vecOf = (game: Game, node: GameNode): GameNode | undefined =>
  game.nodes.find(
    (entry) =>
      entry.type === 'vec' &&
      !isDown(entry) &&
      game.links.some((link) => link.from === node.id && link.to === entry.id),
  )

/** Replicas an Event Stream keeps of each partition, 1 to 3 (07 "Event Stream"). */
export const logReplicas = (node: GameNode): number =>
  Math.max(1, Math.min(LOG_REPLICAS[LOG_REPLICAS.length - 1] ?? 3, Math.floor(node.n)))

/* ---------- the Service Mesh ---------- */

/** The live Service Mesh Nodes, and the members that link into each, found once per Game. */
const meshed = new WeakMap<Game, ReadonlyMap<string, ReadonlyArray<GameNode>>>()

const meshMembersOf = (game: Game): ReadonlyMap<string, ReadonlyArray<GameNode>> => {
  let map = meshed.get(game)
  if (!map) {
    const live = new Set(
      game.nodes
        .filter((entry) => entry.type === 'mesh' && !isDown(entry))
        .map((entry) => entry.id),
    )
    const found = new Map<string, Array<GameNode>>()
    const byId = new Map(game.nodes.map((node) => [node.id, node]))
    for (const link of game.links) {
      if (!live.has(link.to)) continue
      const member = byId.get(link.from)
      if (!member || (member.type !== 'server' && member.type !== 'worker')) continue
      found.set(link.to, [...(found.get(link.to) ?? []), member])
    }
    map = found
    meshed.set(game, map)
  }
  return map
}

/**
 * Whether a sidecar sits beside this Node: it links into a live Service Mesh (05 "Service Mesh").
 * Its calls retry and break, each hop costs a millisecond more, and its own CPU shrinks by the
 * sidecar's share.
 */
export const meshOf = (game: Game, node: GameNode): boolean => {
  if (node.type !== 'server' && node.type !== 'worker') return false
  for (const members of meshMembersOf(game).values())
    if (members.some((member) => member.id === node.id)) return true
  return false
}

/** The App Servers and Workers a Service Mesh has put a sidecar beside: its billing members. */
export const meshMembers = (game: Game, mesh: GameNode): ReadonlyArray<GameNode> =>
  meshMembersOf(game).get(mesh.id) ?? []

/* ---------- certificates ---------- */

/**
 * Sim seconds a TLS certificate lasts: 90 calendar days, and 45 from Series C (05 "Secrets and
 * Certificates"). The calendar is the Team's, so `calendarPace` shortens it the same way it
 * shortens a hire.
 */
export const certLifeOf = (game: Game, tuning: Tuning = LIVE_TUNING): number =>
  ((game.stage >= CERT_SHORT_FROM ? CERT_DAYS_SHORT : CERT_DAYS) * CALENDAR_DAY) /
  tuning.calendarPace

/** Sim seconds left on the Company's certificate, or null when no secrets manager has ever run. */
export const certLeftOf = (game: Game, tuning: Tuning = LIVE_TUNING): number | null =>
  game.certificate == null ? null : game.certificate + certLifeOf(game, tuning) - game.time

/** Calendar days a certificate lasts in this Era, for the cards: 90, or 45 from Series C. */
export const certDaysOf = (game: Game): number =>
  game.stage >= CERT_SHORT_FROM ? CERT_DAYS_SHORT : CERT_DAYS

/** Calendar days left on the certificate, negative once it has run out; null when none is tracked. */
export const certDaysLeft = (game: Game, tuning: Tuning = LIVE_TUNING): number | null => {
  const left = certLeftOf(game, tuning)
  return left === null ? null : (left * tuning.calendarPace) / CALENDAR_DAY
}

/** Whether a Secrets and Certificates Node is live to renew the certificate (05). */
export const certManaged = (game: Game): boolean =>
  game.nodes.some((node) => node.type === 'pki' && !isDown(node))

/* ---------- money ---------- */

/** base × factor^steps by repeated multiplication: `**` is not exact across engines. */
export const grown = (base: number, factor: number, steps: number): number => {
  let value = base
  for (let index = 0; index < steps; index += 1) value *= factor
  for (let index = 0; index > steps; index -= 1) value /= factor
  return value
}

/** Regions a spread store replicates to: the open regions, at most SPREAD_REGIONS. */
export const spreadCount = (game: Game): number =>
  Math.min(
    SPREAD_REGIONS,
    new Set([
      'na',
      ...game.nodes.filter((node) => node.type === 'users').map((node) => node.region),
    ]).size,
  )

/**
 * The pricing model a Node bills at now: a reserved term that has run out bills
 * on-demand again until the player reserves it once more (09 "Pricing models").
 */
export const pricingOf = (game: Game, node: GameNode): Pricing =>
  node.pricing === 'reserved' && !(node.pricingUntil !== null && node.pricingUntil > game.time)
    ? 'on-demand'
    : node.pricing

/** The classes in price order, so Lifecycle rules can step an object one class cheaper. */
const CLASS_ORDER: ReadonlyArray<StorageClass> = ['standard', 'infrequent', 'archive']

/**
 * The share of a store's GB an object older than `days` calendar days makes up: the store holds
 * its uploads, so its oldest object is `stored / uploads` long, and everything past the window is
 * the older share. Proposed: the design gives no age model, only "moves old objects".
 */
export const agedShareOf = (game: Game, days: number): number => {
  if (days <= 0) return 0
  // One sim second bills a calendar minute, so a calendar day is 1,440 sim seconds of uploads.
  const perDay = game.uploads * 1_440
  if (perDay <= 0 || game.stored <= 0) return 0
  return Math.max(0, Math.min(1, 1 - days / (game.stored / perDay)))
}

/** One band of a store's GB that shares a storage class. */
export type StorageBand = Readonly<{
  gb: number
  /** Share of the Standard price it bills. */
  price: number
  /** Dollars per GB read back out of it. */
  retrieval: number
  /** A read has to restore it first, so it fails as a timeout. */
  archived: boolean
}>

/**
 * A store's GB by class (07 "Object Storage"): everything in the class the card shows, or, with
 * Lifecycle rules, the older share one class cheaper.
 */
export const storageBands = (game: Game, node: GameNode): ReadonlyArray<StorageBand> => {
  const mine = STORAGE_CLASSES[node.storageClass]
  const share = node.lifecycle > 0 ? agedShareOf(game, node.lifecycle) : 0
  if (share <= 0) return [{ gb: game.stored, ...mine }]
  const older =
    CLASS_ORDER[Math.min(CLASS_ORDER.length - 1, CLASS_ORDER.indexOf(node.storageClass) + 1)] ??
    node.storageClass
  return [
    { gb: game.stored * (1 - share), ...mine },
    { gb: game.stored * share, ...STORAGE_CLASSES[older] },
  ]
}

/** Dollars per second a store's GB bill at the classes it holds them in, before the cost index. */
export const storageBurnOf = (game: Game, node: GameNode): number =>
  storageBands(game, node).reduce((sum, band) => sum + band.gb * STORAGE_PRICE * band.price, 0)

/** Dollars per GB per second a Database's rows bill: gp3 against S3 Standard, about 3.5×. */
export const DB_GB_PRICE = STORAGE_PRICE * DB_STORAGE_MULT

/** GB of the Company's rows one Database holds: the figure split over the Databases it lives in. */
export const dataOf = (game: Game, node: GameNode): number => {
  if (node.type !== 'database') return 0
  const databases = game.nodes.filter((entry) => entry.type === 'database').length
  return game.data / Math.max(1, databases)
}

/**
 * Dollars per second a Database's rows bill (07 "Data volume"): its share of the GB at the
 * Database price, times what its retention policy keeps on the fast tier. A policy that deletes
 * old rows bills nothing for them, and the cost index scales the line with the Era.
 */
export const dataBurnOf = (game: Game, node: GameNode): number =>
  dataOf(game, node) *
  DB_GB_PRICE *
  (node.type === 'database' ? DB_RETENTIONS[node.keep].price : 1) *
  eraOf(game).costIndex

/** Dollars per second a Node costs while it exists, down or not; nothing once it is shut. */
export const burnOf = (game: Game, node: GameNode): number => {
  if (node.shut) return 0
  const def = COMPONENTS[node.type]
  const index = eraOf(game).costIndex
  if (def.sized) {
    // The pricing model discounts the box, before copies and standbys (09 "Pricing models").
    const box =
      vcpuOf(node) *
      VCPU_PRICE *
      FAMILIES[node.family].price *
      PRICINGS[pricingOf(game, node)].price *
      index
    // Backups store snapshots or the WAL on top of the box (07 "Backups"). A provisioned volume
    // bills a multiple of the box (07 "Capacity"), and each shard is another copy of it (07
    // "Partitioning").
    // The rows the Database holds bill on the Storage line, at its retention policy's price.
    const one =
      node.type === 'database'
        ? box *
            (node.backup !== 'none' ? 1 + BACKUPS[node.backup].burn : 1) *
            STORAGE_IOPS[node.iops].burn *
            Math.max(1, Math.floor(node.shards)) +
          dataBurnOf(game, node)
        : box
    // A standby is a second box; pods pack onto shared nodes.
    if (node.standby) return one * 2
    if (copiesOf(node) === 1 && !inCluster(game, node)) return one
    return one * copiesOf(node) * (inCluster(game, node) ? POD_BURN : 1)
  }
  if (node.type === 'analytics')
    return (
      def.burn *
      (SAMPLE_STORAGE[sampleIndex(node)] ?? 1) *
      (RETENTION_STORAGE[(RETENTION_WINDOWS as ReadonlyArray<number>).indexOf(node.retention)] ??
        1) *
      flatScale(node) *
      index
    )
  if (node.type === 'auth') return game.users * AUTH_PRICE_PER_USER
  // A blue-green second fleet or a canary's metrics bill on the Pipeline's own line, as a multiple.
  if (node.type === 'ci')
    return (
      def.burn *
      DEPLOY_STRATEGIES[node.strategy].burn *
      flatScale(node) *
      index *
      (node.standby ? 2 : 1)
    )
  if (node.type === 'storage') return (def.burn + storageBurnOf(game, node)) * index
  // A Vector Index holds its graph in memory: HNSW bills twice the vectors' box (07 "Vector Index").
  if (node.type === 'vec')
    return def.burn * VEC_INDEXES[node.indexType].burn * flatScale(node) * index
  // An Event Stream copies every partition once per replica, and the copies are disk (07).
  if (node.type === 'log')
    return (
      def.burn *
      (1 + (logReplicas(node) - 1) * LOG_REPLICA_BURN) *
      flatScale(node) *
      index *
      (node.standby ? 2 : 1)
    )
  if (node.type === 'gpu') return GPU_TYPES[node.gpu].burn * flatScale(node) * index
  // A mesh bills for its sidecars, not for a box: each member's own Burn pays the proxy's share
  // (05 "Service Mesh": "CPU and memory per sidecar, about 5% per replica"). A member's Burn
  // already carries the cost index, so this does not multiply it again.
  if (node.type === 'mesh')
    return (
      MESH_OVERHEAD * meshMembers(game, node).reduce((sum, member) => sum + burnOf(game, member), 0)
    )
  // A spread store runs its nodes in each region it replicates to.
  if ((node.type === 'wide' || node.type === 'dsql') && node.spread)
    return def.burn * flatScale(node) * index * spreadCount(game)
  return def.burn * flatScale(node) * index * (node.standby ? 2 : 1)
}

/**
 * Dollars per second a Serverless Function's uses bill (09 "The cloud bill"): each request, plus
 * the GB-seconds its executions ran, at the cost index. `meanMs` is how long one request lasts.
 */
export const serverlessBurnOf = (
  game: Game,
  node: GameNode,
  done: number,
  meanMs: number,
): number =>
  node.type !== 'fn'
    ? 0
    : done *
      (SERVERLESS_REQUEST_PRICE + SERVERLESS_GB_SECOND * SERVERLESS_MEMORY_GB * (meanMs / 1_000)) *
      eraOf(game).costIndex

/** Dollars per second an Edge Function's requests bill (09 "The cloud bill"), at the cost index. */
export const edgeBurnOf = (game: Game, node: GameNode, done: number): number =>
  node.type !== 'edge' ? 0 : done * EDGE_REQUEST_PRICE * eraOf(game).costIndex

/** Burn split the way the Cost panel reads it (09 "The cloud bill"), in dollars per second. */
export type BurnShares = Readonly<{
  /** Compute, edge, and platform Nodes. */
  compute: number
  /** Data Nodes, without the GB they store. */
  data: number
  /** GB stored, priced per GB per second. */
  storage: number
  /** Analytics, whose Burn is sampling and retention. */
  observability: number
}>

export const burnSharesOf = (game: Game): BurnShares => {
  const index = eraOf(game).costIndex
  let compute = 0
  let data = 0
  let storage = 0
  let observability = 0
  for (const node of game.nodes) {
    const burn = burnOf(game, node)
    if (node.type === 'analytics') {
      observability += burn
      continue
    }
    if (COMPONENTS[node.type].group === 'data') {
      data += burn
      if (node.type === 'database') storage += dataBurnOf(game, node)
      if (node.type === 'storage') storage += storageBurnOf(game, node) * index
    } else compute += burn
  }
  return { compute, data: data - storage, storage, observability }
}

/* A Sandbox has no money: every price below is 0 there. */

/** What the copy after `count` copies costs: each further copy costs 25% more. */
const copyPrice = (game: Game, type: ComponentId, count: number): number =>
  Math.round(grown(COMPONENTS[type].cost, COPY_PRICE_GROWTH, count) * eraOf(game).costIndex)

export const priceOf = (game: Game, type: ComponentId): number => {
  if (game.sandbox) return 0
  return copyPrice(game, type, game.nodes.filter((node) => node.type === type).length)
}

/** Selling refunds half of what the last copy of its Component cost to place. */
export const refundOf = (game: Game, node: GameNode): number => {
  if (game.sandbox) return 0
  const count = game.nodes.filter((entry) => entry.type === node.type).length
  return Math.round(copyPrice(game, node.type, Math.max(0, count - 1)) * SELL_REFUND)
}

/** The Burn a reserved Node still owes: selling it before the term ends does not stop the bill. */
export const owedOf = (game: Game, node: GameNode): number =>
  game.sandbox || node.pricing !== 'reserved' || node.pricingUntil === null
    ? 0
    : burnOf(game, node) * Math.max(0, node.pricingUntil - game.time)

export const maxSize = (node: GameNode): number =>
  COMPONENTS[node.type].sized ? SIZES.length - 1 : Math.max(node.size, COMPONENTS[node.type].steps)

/** Cash for the next size step, or null at the largest size. */
export const resizePrice = (game: Game, node: GameNode): number | null => {
  if (node.size >= maxSize(node)) return null
  if (game.sandbox) return 0
  const index = eraOf(game).costIndex
  if (node.type === 'payments') return Math.round(grown(40, 3, node.size - 1) * index)
  if (node.type === 'analytics') return Math.round(grown(40, 2, node.size) * index)
  // Instance prices are linear in vCPU: twice the place price per vCPU of the next size.
  if (COMPONENTS[node.type].sized)
    return Math.round(COMPONENTS[node.type].cost * 2 * (SIZES[node.size + 1]?.vcpu ?? 0) * index)
  return Math.round(grown(COMPONENTS[node.type].cost, 2, node.size + 1) * index)
}

/** Cash to replace a failed Node. */
export const replacePrice = (game: Game, node: GameNode): number =>
  game.sandbox ? 0 : Math.round(COMPONENTS[node.type].cost * 0.5 * eraOf(game).costIndex)

/** The drawer holds about a minute of revenue; each size step doubles it. */
export const drawerSize = (game: Game, revenue: number): number => {
  const payments = game.nodes.find((node) => node.type === 'payments')
  return Math.max(DRAWER_MIN, revenue * DRAWER_SECONDS) * grown(1, 2, (payments?.size ?? 1) - 1)
}
