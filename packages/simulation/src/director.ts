import { Match } from 'effect'
import {
  ALERT_RULES,
  CASCADE_FROM_STAGE,
  CASCADES,
  CALENDAR_DURATION,
  COMPONENTS,
  ERAS,
  ESCALATION,
  FAILOVER_SECONDS,
  INCIDENTS,
  INCIDENT_GAP,
  INCIDENT_IDS,
  LEAK_RATE,
  MIN_WEAKNESS,
  ON_CALL_ACK,
  POD_RESCHEDULE,
  RUNTIMES,
  SLO_FROM_STAGE,
  SPOT_WARNING,
  SRE_MTTR,
  STORM_TRIGGER,
  SPIKE_MAGNITUDE,
  SUPPLY_CHAIN_CHURN,
  WARMED,
  type ComponentId,
  type IncidentId,
  HOME_REGION,
} from './catalog.ts'
import { StepEvent, type AlertRule } from './events.ts'
import { mutatorWeight, openActionWeight, signatureWeakness, signatureWeight } from './founding.ts'
import type { Ledger } from './ledger.ts'
import {
  clusterOf,
  eraOf,
  has,
  isDown,
  podsOf,
  pricingOf,
  ramOf,
  researchReady,
  restarted,
  sreStaffed,
  zoned,
} from './lookups.ts'
import { nodeLabel } from './labels.ts'

export { zoned }
import { causeOf, down as takeDown, withWarm } from './life.ts'
import { nextRandom, pickWeighted } from './random.ts'
import type { Game, GameLink, GameNode, Incident, Postmortem, Region, Zone } from './state.ts'
import { isGlobal, survivesRegion } from './regions.ts'
import { collectorOf } from './capacity.ts'
import { fixed, platformStaffed, quartersBehind, serviceOf } from './team.ts'

/* ==========================================================================
   The incident director. It attacks the Design, not the player: each
   incident type weighs more when the Design has the weakness it tests. A
   well-built Design survives most incidents without a click.
   ========================================================================== */

/**
 * Sim seconds an incident runs unmitigated. Once the error budget counts, it runs on
 * the calendar: at most 5, 20 or 60 sim seconds by severity (11 "Duration"). An SRE team
 * restores service 40% faster (08 "Teams"), so the incident and the recovery it drives run
 * 60% as long.
 */
export const incidentDuration = (game: Game, kind: IncidentId): number => {
  const def = INCIDENTS[kind]
  const clock = (): number => {
    // A retry storm ends when the backlog drains, not on the clock; a Sandbox gives it no clock.
    if (kind === 'retry-storm') return game.sandbox ? SANDBOX_STORM : def.duration
    // A spot reclaim warns for 10 s before it takes the Node, longer than a SEV3 calendar
    // duration, so it runs on its own clock (09 "Pricing models").
    if (kind === 'spot-reclaim') return def.duration
    return !game.sandbox && game.stage >= SLO_FROM_STAGE
      ? Math.min(def.duration, CALENDAR_DURATION[def.severity])
      : def.duration
  }
  return clock() * (sreStaffed(game) ? 1 - SRE_MTTR : 1)
}

/** Sim seconds a Sandbox retry storm may last: long enough that only draining ends it. */
const SANDBOX_STORM = 3_600

/** A standby takes over in a share of the outage: 20 s of a 120 s zone outage. */
export const failoverSeconds = (game: Game): number =>
  (FAILOVER_SECONDS * incidentDuration(game, 'zone')) / INCIDENTS.zone.duration

/** A Cluster reschedules a pod in a share of the outage: 30 s of a 60 s instance failure. */
export const rescheduleSeconds = (game: Game): number =>
  (POD_RESCHEDULE * incidentDuration(game, 'instance')) / INCIDENTS.instance.duration

/** The director avoids repeating the last incident type. */
const REPEAT_WEIGHT = 0.3

const busy = (ledger: Ledger, node: GameNode): boolean => (ledger.nodes[node.id]?.inbound ?? 0) > 0

/** The busiest live Node of a type. */
const busiest = (game: Game, ledger: Ledger, type: ComponentId): GameNode | undefined =>
  game.nodes
    .filter((node) => node.type === type && !isDown(node) && busy(ledger, node))
    .reduce<GameNode | undefined>(
      (best, node) =>
        !best || (ledger.nodes[node.id]?.inbound ?? 0) > (ledger.nodes[best.id]?.inbound ?? 0)
          ? node
          : best,
      undefined,
    )

/** Links into a type of Node that retry, and how. */
const retriesInto = (game: Game, type: ComponentId): ReadonlyArray<GameLink['retries']> =>
  has(game, 'timeouts')
    ? game.links
        .filter((link) => game.nodes.some((node) => node.id === link.to && node.type === type))
        .map((link) => link.retries)
    : []

/** App Servers with a global garbage collector, and how full their heap is. */
const gcTargets = (game: Game, ledger: Ledger): ReadonlyArray<readonly [GameNode, number]> =>
  game.nodes
    .filter(
      (node) =>
        node.type === 'server' && collectorOf(node) !== null && !isDown(node) && busy(ledger, node),
    )
    .map((node) => {
      const ram = ledger.nodes[node.id]?.resources.ram
      const heap = ram && ram.total > 0 ? ram.used / ram.total : 0
      return [node, heap > 0.9 ? 3 : heap > 0.7 ? 1.5 : 0.3] as const
    })

/** GPU Nodes a shortage can reclaim, H100s first. */
const gpuTargets = (game: Game, ledger: Ledger): ReadonlyArray<readonly [GameNode, number]> =>
  game.nodes
    .filter((node) => node.type === 'gpu' && !isDown(node) && busy(ledger, node))
    .map((node) => [node, node.gpu === 'h100' ? 3 : 1] as const)

/** Spot Nodes the provider can reclaim: the ones serving now, with no spot capacity it has nothing to take. */
const spotTargets = (game: Game, ledger: Ledger): ReadonlyArray<GameNode> =>
  game.nodes.filter(
    (node) => pricingOf(game, node) === 'spot' && !isDown(node) && busy(ledger, node),
  )

/** Realtime Hubs serving now: a restart only strands clients if they are connected. */
const wsTargets = (game: Game, ledger: Ledger): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'ws' && !isDown(node) && busy(ledger, node))

/** App Servers and Workers an Autoscaler runs, which a runaway bill can grow. */
const autoscaled = (game: Game): ReadonlyArray<GameNode> =>
  game.nodes.filter(
    (node) =>
      (node.type === 'server' || node.type === 'worker') &&
      game.links.some((link) => {
        if (link.from !== node.id) return false
        const target = game.nodes.find((entry) => entry.id === link.to)
        return target?.type === 'autoscaler' && !isDown(target)
      }),
  )

/** A Node's live Autoscaler, if it has one, which is what adds the cold copies (11 "JVM warmup"). */
const autoscalerInto = (game: Game, node: GameNode): boolean =>
  game.links.some((link) => {
    if (link.from !== node.id) return false
    const target = game.nodes.find((entry) => entry.id === link.to)
    return target?.type === 'autoscaler' && !isDown(target)
  })

/** Java App Servers serving now, weighted up when an Autoscaler can add cold copies to them. */
const javaTargets = (game: Game, ledger: Ledger): ReadonlyArray<readonly [GameNode, number]> =>
  game.nodes
    .filter(
      (node) =>
        node.type === 'server' &&
        RUNTIMES[node.runtime].language === 'java' &&
        RUNTIMES[node.runtime].warmup > 0 &&
        !isDown(node) &&
        busy(ledger, node),
    )
    .map((node) => [node, autoscalerInto(game, node) ? 3 : 1] as const)

/**
 * The data Component an operator's command reaches: the busiest Node whose loss takes reads or
 * writes with it (11 "Operator typo").
 */
const DATA_TYPES: ReadonlyArray<ComponentId> = ['database', 'replica', 'wide', 'dsql', 'doc']

const dataTarget = (game: Game, ledger: Ledger): GameNode | undefined =>
  DATA_TYPES.map((type) => busiest(game, ledger, type)).find((node) => node !== undefined)

/** Nodes an instance failure can hit, weighted toward Nodes with no second copy. */
const instanceTargets = (game: Game, ledger: Ledger): ReadonlyArray<readonly [GameNode, number]> =>
  game.nodes
    .filter((node) => COMPONENTS[node.type].limiting && !isDown(node) && busy(ledger, node))
    .map((node) => {
      const copies = game.nodes.filter((other) => other.type === node.type).length
      return [node, copies === 1 ? 3 : 0.5] as const
    })

const leakTargets = (game: Game, ledger: Ledger): ReadonlyArray<GameNode> =>
  game.nodes.filter(
    (node) =>
      node.type === 'server' &&
      RUNTIMES[node.runtime].persistent &&
      !isDown(node) &&
      busy(ledger, node),
  )

const hasNode = (game: Game, type: ComponentId): boolean =>
  game.nodes.some((node) => node.type === type && !isDown(node))

const cacheTargets = (game: Game, ledger: Ledger): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'cache' && !isDown(node) && busy(ledger, node))

/** Clusters with pods that run past their version's support, weighted by how far. */
const clusterTargets = (game: Game): ReadonlyArray<readonly [GameNode, number]> =>
  platformStaffed(game)
    ? []
    : game.nodes
        .filter(
          (node) =>
            node.type === 'cluster' &&
            !isDown(node) &&
            podsOf(game, node).length > 0 &&
            quartersBehind(game, node) > 0,
        )
        .map((node) => [node, Math.min(3, 1 + quartersBehind(game, node))] as const)

const poisonTargets = (game: Game): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'queue' && !node.dlq)

/**
 * Zones whose loss would take a whole Component out: every live copy of some
 * Component sits there, and a data Node there has no standby elsewhere.
 */
export const fragileZones = (game: Game): ReadonlyArray<Zone> => {
  const live = game.nodes.filter((node) => zoned(node) && !isDown(node))
  const zones = new Set<Zone>()
  for (const node of live) {
    if (node.standby) continue
    const copies = live.filter((other) => other.type === node.type)
    if (copies.every((other) => other.zone === node.zone)) zones.add(node.zone)
  }
  return [...zones].toSorted()
}

/** Links between Nodes in two regions, neither of them global. */
const crossRegionLinks = (game: Game): number =>
  game.links.filter((link) => {
    const from = game.nodes.find((node) => node.id === link.from)
    const to = game.nodes.find((node) => node.id === link.to)
    return (
      from &&
      to &&
      from.region !== to.region &&
      !isGlobal(from) &&
      !isGlobal(to) &&
      from.type !== 'users'
    )
  }).length

/** Caches and Wide-column Stores that answer reads: where a celebrity's key lands. */
const hotKeyTargets = (game: Game, ledger: Ledger): ReadonlyArray<GameNode> =>
  game.nodes.filter(
    (node) =>
      (node.type === 'cache' || node.type === 'wide') && !isDown(node) && busy(ledger, node),
  )

/** The region with the most region-bound live Nodes. */
/** Nodes a config push reaches: the ones that run the Service. */
const configured = (node: GameNode): boolean => node.type === 'server' || node.type === 'worker'

/** Where a config push lands first: a Mirror's source, or else the region with the most App Servers. */
const configRegion = (game: Game): Region | null => {
  const source = (game.mirrors ?? [])[0]?.source
  if (source) return source
  const counts = new Map<Region, number>()
  for (const node of game.nodes)
    if (configured(node) && !isDown(node))
      counts.set(node.region, (counts.get(node.region) ?? 0) + 1)
  return (
    [...counts.entries()].reduce<readonly [Region, number] | undefined>(
      (best, entry) => (!best || entry[1] > best[1] ? entry : best),
      undefined,
    )?.[0] ?? null
  )
}

/** Regions a Bad config push reaches: with GitOps all at once, every Mirror of its region too. */
export const configReach = (game: Game, region: Region): ReadonlyArray<Region> =>
  game.iac?.sync === 'all'
    ? [
        region,
        ...(game.mirrors ?? [])
          .filter((mirror) => mirror.source === region)
          .map((mirror) => mirror.region),
      ]
    : [region]

const busiestRegion = (game: Game): Region | undefined => {
  const counts = new Map<Region, number>()
  for (const node of game.nodes)
    if (!survivesRegion(game, node) && !isDown(node))
      counts.set(node.region, (counts.get(node.region) ?? 0) + 1)
  return [...counts.entries()].reduce<readonly [Region, number] | undefined>(
    (best, entry) => (!best || entry[1] > best[1] ? entry : best),
    undefined,
  )?.[0]
}

/** How hard this incident would hit the current Design: 0 when it has nothing to hit, else 0.2 to 3. */
export const weaknessOf = (game: Game, ledger: Ledger, kind: IncidentId): number => {
  if (INCIDENTS[kind].era > game.stage) return 0
  // A Venture's signature incident keeps its own floor: only that Venture meets it often.
  const weakness = Math.max(rawWeakness(game, ledger, kind), signatureWeakness(game, kind))
  return weakness > 0 ? Math.max(MIN_WEAKNESS, weakness) : 0
}

/** How hard each incident would hit the Design, before the floor. */
const rawWeakness = (game: Game, ledger: Ledger, kind: IncidentId): number => {
  const weakness: Record<IncidentId, () => number> = {
    spike: () => {
      const hottest = Math.max(
        0,
        ...game.nodes
          .filter((node) => COMPONENTS[node.type].limiting)
          .map((node) => ledger.nodes[node.id]?.utilization ?? 0),
      )
      return hottest > 0.5 ? 2 : 1
    },
    instance: () => Math.max(0, ...instanceTargets(game, ledger).map(([, weight]) => weight)),
    connections: () => {
      if (game.nodes.some((node) => node.type === 'pooler')) return 0.1
      const fullest = Math.max(
        0,
        ...Object.values(ledger.nodes).map((entry) =>
          entry.connections ? entry.connections.used / entry.connections.max : 0,
        ),
      )
      return fullest > 0.5 ? 2.5 : fullest > 0.2 ? 0.8 : 0
    },
    loop: () =>
      !has(game, 'libuv-pool') &&
      game.nodes.some(
        (node) =>
          node.type === 'server' && RUNTIMES[node.runtime].model === 'loop' && busy(ledger, node),
      ) &&
      (ledger.kinds.login?.rate ?? 0) > 0
        ? 3
        : 0,
    // Fix memory leak keeps the code from leaking until the next Feature ships.
    leak: () =>
      leakTargets(game, ledger).length > 0 && !(fixed(game, 'fix-leak') && !game.sandbox) ? 2 : 0,
    // Each query shape with no index makes a Slow query likelier.
    'slow-query': () =>
      game.nodes.some((node) => node.type === 'database' && busy(ledger, node))
        ? 1.5 * (1 + Math.max(0, ...game.services.map((service) => service.shapes)))
        : 0,
    // Only a deploy ships a bug: the director never picks one.
    'bad-deploy': () => 0,
    // Scrapers and floods hit every Design; a WAF makes them a nuisance.
    'bot-surge': () => (hasNode(game, 'waf') ? 0.5 : 2),
    ddos: () => (hasNode(game, 'waf') ? 0.5 : 1.5),
    stuffing: () => ((ledger.kinds.login?.rate ?? 0) > 0 ? (hasNode(game, 'waf') ? 0.5 : 2) : 0),
    stampede: () =>
      cacheTargets(game, ledger).some(
        (node) => !(node.coalesce && has(game, 'stampede-protection')),
      )
        ? 2
        : cacheTargets(game, ledger).length > 0
          ? 0.5
          : 0,
    // A dead-letter queue moves the poison message aside: nothing to hit.
    poison: () => (poisonTargets(game).length > 0 ? 2 : 0),
    certificate: () => (has(game, 'cert-automation') ? 0 : 0.5),
    // Their outage, not yours: it hits whoever takes checkouts.
    'psp-outage': () =>
      game.nodes.some((node) => node.type === 'psp' && busy(ledger, node)) ? 1 : 0,
    // 3.0 once the Company could spread across zones and has not; before Multiple
    // zones it has no answer, so the outage stays rare. 0.2 when nothing depends on one zone.
    zone: () =>
      game.nodes.some((node) => zoned(node) && !isDown(node))
        ? fragileZones(game).length > 0
          ? has(game, 'multi-az')
            ? 3
            : 0.5
          : 0.2
        : 0,
    // Logs and WAL fill the disk of a Database that takes writes.
    'disk-full': () => (busiest(game, ledger, 'database') ? 1 : 0),
    // Heavy writes leave replicas behind; read-your-writes routing hides most of it.
    'repl-lag': () =>
      game.nodes.some((node) => node.type === 'replica' && busy(ledger, node))
        ? game.nodes.some((node) => node.type === 'server' && node.ryw) && has(game, 'ryw-routing')
          ? 0.3
          : 2
        : 0,
    'gc-storm': () => Math.max(0, ...gcTargets(game, ledger).map(([, weight]) => weight)),
    // A signature-only incident: its weakness is the Venture's floor, and no one else's (13).
    'latency-regression': () => 0,
    'deadline-day': () => 0,
    // The older Ventures' signatures exist for them alone (13 "Ventures").
    'hot-shard': () => 0,
    'premiere-spike': () => 0,
    'launch-day': () => 0,
    'flash-sale': () => 0,
    // Naive retries into a Database turn a slowdown into a storm; backoff contains it.
    'retry-storm': () => {
      if (!busiest(game, ledger, 'database')) return 0
      const retries = retriesInto(game, 'database')
      return retries.includes('naive') ? 3 : retries.includes('backoff') ? 0.5 : 0.2
    },
    // A slow Payment Provider double-charges only through retries without idempotency keys.
    'double-charge': () =>
      game.nodes.some((node) => node.type === 'psp' && busy(ledger, node)) &&
      retriesInto(game, 'psp').some((retry) => retry !== 'none') &&
      !has(game, 'idempotency-keys')
        ? 2.5
        : 0,
    // Reports that scan the primary; a Data Warehouse takes them.
    'report-db': () =>
      (ledger.kinds.report?.rate ?? 0) > 0 && busiest(game, ledger, 'database')
        ? hasNode(game, 'warehouse')
          ? 0
          : 3
        : 0,
    'gpu-shortage': () =>
      gpuTargets(game, ledger).length > 0 ? (hasNode(game, 'llm') ? 0.5 : 2) : 0,
    // The provider reclaims spot capacity whenever it needs it: no spot Node, no reclaim.
    'spot-reclaim': () => (spotTargets(game, ledger).length > 0 ? 1.5 : 0),
    // A Cache with writes to invalidate and a long TTL has the most to serve stale.
    'stale-read': () => {
      const targets = cacheTargets(game, ledger).filter(
        (node) => (ledger.nodes[node.id]?.traffic['q-write'] ?? 0) > 0,
      )
      if (targets.length === 0) return 0
      return targets.some((node) => node.ttl >= 3_600) ? 2 : 1
    },
    // A Hub that just came back takes every client at once; jittered backoff spreads it.
    reconnect: () => {
      const targets = wsTargets(game, ledger)
      if (targets.length === 0) return 0
      return targets.some((node) => !node.backoff) ? 2 : 0.5
    },
    // An Autoscaler with no ceiling grows every copy it can.
    'runaway-bill': () => (autoscaled(game).length > 0 ? 2 : 0),
    // A partner path with a smaller MTU times out the large uploads.
    mtu: () => ((ledger.kinds.upload?.rate ?? 0) > 0 ? 1.5 : 0),
    regex: () => (hasNode(game, 'waf') ? 1 : 0),
    // 3.0 once the Company could open a second region and every region-bound Node sits in one.
    region: () => {
      const bound = game.nodes.filter((node) => !survivesRegion(game, node) && !isDown(node))
      if (bound.length === 0) return 0
      const regions = new Set(bound.map((node) => node.region))
      return regions.size === 1 ? (has(game, 'multi-region') ? 3 : 0.5) : 0.3
    },
    // Calls between regions time out; a consensus store keeps a single leader through it.
    partition: () => (crossRegionLinks(game) > 0 ? (hasNode(game, 'dsql') ? 0.5 : 2) : 0),
    'hot-key': () => {
      const targets = hotKeyTargets(game, ledger)
      if (targets.length === 0 || (ledger.kinds.feed?.rate ?? 0) <= 0) return 0
      return targets.every((node) => node.split) && has(game, 'hybrid-fanout') ? 0.3 : 2
    },
    // Nothing prevents it: rare, and it ends with a rollback.
    bgp: () => 0.2,
    // Infrastructure as code pushes config to every server at once (11 "Bad config push").
    config: () => (has(game, 'infra-as-code') && configRegion(game) !== null ? 1 : 0),
    // An auditor resets the DR drill; a Security team fixes the gap first.
    audit: () => (game.drill?.passed && !has(game, 'security-team') ? 1.5 : 0),
    // Only the player starts a drill.
    'dr-drill': () => 0,
    // Only an expired patch ticket starts one.
    breach: () => 0,
    // Only a phishing trap the player clicks starts one.
    'credential-leak': () => 0,
    // A Cluster left on an unsupported version: likelier the further behind it is.
    'cluster-upgrade': () => Math.max(0, ...clusterTargets(game).map(([, weight]) => weight)),
    // Java warms for 30 s, so copies an Autoscaler adds during a spike make p99 worse (11).
    'jvm-warmup': () => Math.max(0, ...javaTargets(game, ledger).map(([, weight]) => weight)),
    // A big table and no online migrations: the ALTER holds its lock through the copy. Expand and
    // contract never takes the lock at all, so it cannot stall a write (07 "Schema migrations").
    'migration-lock': () =>
      busiest(game, ledger, 'database')
        ? has(game, 'expand-contract')
          ? 0
          : has(game, 'online-migrations')
            ? 0.3
            : 2.5
        : 0,
    // Every Service installs its dependencies; scanning is the only thing that reads them.
    'supply-chain': () =>
      game.nodes.some((node) => node.type === 'server' && busy(ledger, node))
        ? has(game, 'dependency-scanning')
          ? 0.5
          : 2
        : 0,
    // A table with no restorable backup is gone for good; a drill proves the backup.
    'accidental-delete': () => {
      const database = busiest(game, ledger, 'database')
      if (!database) return 0
      if (database.backup === 'none' || database.restore === 'failed') return 3
      return has(game, 'restore-drills') ? 0.5 : 1
    },
    // A plan shows what a command removes; without one, a typo takes the whole Component.
    'operator-typo': () => {
      const target = dataTarget(game, ledger)
      if (!target) return 0
      return has(game, 'infra-as-code') ? 0.5 : 2
    },
    // A clock that jumps breaks the timers and leases of one region; smearing stops the jump.
    'leap-second': () =>
      game.nodes.some((node) => node.type === 'server' && !isDown(node) && busy(ledger, node))
        ? has(game, 'leap-smearing')
          ? 0.3
          : 1.5
        : 0,
  }
  return weakness[kind]()
}

/** A postmortem opened an action item against this incident, and its research is not owned yet. */
const unaddressed = (game: Game, kind: IncidentId): boolean =>
  INCIDENTS[kind].actions.some((id) => game.openActions.includes(id) && !has(game, id))

/** Starts an incident. Returns null when the Design has nothing it can hit. */
export const startIncident = (
  game: Game,
  ledger: Ledger,
  kind: IncidentId,
  roll: number,
  only?: ComponentId,
  service?: string,
  causedBy: IncidentId | null = null,
): Readonly<{ game: Game; incident: Incident }> | null => {
  const target = Match.value(kind).pipe(
    Match.when('instance', () =>
      pickWeighted(
        instanceTargets(game, ledger).filter(([node]) => !only || node.type === only),
        roll,
      ),
    ),
    Match.when('leak', () => {
      const targets = leakTargets(game, ledger)
      return targets[Math.floor(roll * targets.length)]
    }),
    Match.when('slow-query', () =>
      game.nodes.find((node) => node.type === 'database' && busy(ledger, node)),
    ),
    Match.when('stampede', () => {
      const targets = cacheTargets(game, ledger)
      return targets[Math.floor(roll * targets.length)]
    }),
    // It strikes a Queue without a dead-letter queue first; one with a DLQ shrugs it off.
    Match.when('poison', () => {
      const exposed = poisonTargets(game)
      const targets =
        exposed.length > 0 ? exposed : game.nodes.filter((node) => node.type === 'queue')
      return targets[Math.floor(roll * targets.length)]
    }),
    Match.when('disk-full', () => busiest(game, ledger, 'database')),
    Match.when('retry-storm', () => busiest(game, ledger, 'database')),
    Match.when('gc-storm', () =>
      pickWeighted(
        gcTargets(game, ledger).filter(([node]) => !only || node.type === only),
        roll,
      ),
    ),
    Match.when('gpu-shortage', () => pickWeighted(gpuTargets(game, ledger), roll)),
    Match.when('spot-reclaim', () => {
      const targets = spotTargets(game, ledger)
      return targets[Math.floor(roll * targets.length)]
    }),
    Match.when('stale-read', () => {
      const targets = cacheTargets(game, ledger).filter(
        (node) => (ledger.nodes[node.id]?.traffic['q-write'] ?? 0) > 0,
      )
      return targets[Math.floor(roll * targets.length)]
    }),
    Match.when('reconnect', () => busiest(game, ledger, 'ws')),
    Match.when('cluster-upgrade', () => pickWeighted(clusterTargets(game), roll)),
    Match.when(
      (id) => id === 'hot-shard' || id === 'migration-lock' || id === 'accidental-delete',
      () => busiest(game, ledger, 'database'),
    ),
    Match.when('jvm-warmup', () => pickWeighted(javaTargets(game, ledger), roll)),
    Match.when(
      (id) => id === 'supply-chain' || id === 'leap-second',
      () => busiest(game, ledger, 'server'),
    ),
    Match.when('operator-typo', () => dataTarget(game, ledger)),
    Match.when('hot-key', () => {
      const targets = hotKeyTargets(game, ledger)
      return targets[Math.floor(roll * targets.length)]
    }),
    Match.orElse(() => undefined),
  )
  // A zone outage strikes a zone the Design depends on, or else the busiest one.
  const fragile = fragileZones(game)
  const used = [
    ...new Set(game.nodes.filter((node) => zoned(node) && !isDown(node)).map((node) => node.zone)),
  ].toSorted()
  const pool = fragile.length > 0 ? fragile : used
  const zone = kind === 'zone' ? (pool[Math.floor(roll * pool.length)] ?? null) : null
  if (kind === 'zone' && zone === null) return null
  const targeted = [
    'instance',
    'leak',
    'slow-query',
    'stampede',
    'poison',
    'disk-full',
    'retry-storm',
    'gc-storm',
    'gpu-shortage',
    'spot-reclaim',
    'stale-read',
    'reconnect',
    'hot-key',
    'cluster-upgrade',
    'hot-shard',
    'jvm-warmup',
    'migration-lock',
    'supply-chain',
    'accidental-delete',
    'operator-typo',
    'leap-second',
  ] as const
  if ((targeted as ReadonlyArray<IncidentId>).includes(kind) && !target) return null
  // A Region outage strikes the region most of the Design depends on; the DR drill, home; a leap
  // second the target App Server's own region.
  const region =
    kind === 'dr-drill'
      ? HOME_REGION
      : kind === 'leap-second'
        ? (target?.region ?? null)
        : kind === 'region'
          ? (busiestRegion(game) ?? null)
          : kind === 'config'
            ? configRegion(game)
            : null
  if ((kind === 'region' || kind === 'config') && region === null) return null
  // A bad config push crashes every App Server and Worker it reaches.
  const pushed = kind === 'config' && region !== null ? configReach(game, region) : []
  const incident: Incident = {
    kind,
    remaining: incidentDuration(game, kind),
    nodeId: target?.id ?? null,
    startedAt: game.time,
    baseline: ledger.revenue,
    usersAtStart: game.users,
    impaired: 0,
    lostRevenue: 0,
    failed: 0,
    signalAt: null,
    ackAt: null,
    severity: INCIDENTS[kind].severity,
    magnitude:
      kind === 'spike'
        ? SPIKE_MAGNITUDE[0] + (SPIKE_MAGNITUDE[1] - SPIKE_MAGNITUDE[0]) * roll
        : SPIKE_MAGNITUDE[0],
    zone,
    region,
    // A bad deploy names the Service whose code broke; every other incident hits the Design.
    service: kind === 'bad-deploy' ? (service ?? serviceOf(game).id) : null,
    // A cascade names the incident it followed, so the pager and the postmortem show the chain.
    causedBy,
  }
  // A stampede: the Cache restarted empty, or mostly warm with Cache warming.
  // A zone outage downs its zone for the incident; a Node with a standby fails over.
  const nodes = game.nodes.map((node) =>
    pushed.includes(node.region) && configured(node) && !isDown(node)
      ? {
          ...node,
          ...takeDown(node.life, incidentDuration(game, kind), 'failure'),
          downAt: game.time,
        }
      : (kind === 'region' || kind === 'dr-drill') &&
          region !== null &&
          node.region === region &&
          !survivesRegion(game, node) &&
          !isDown(node)
        ? {
            ...node,
            ...takeDown(node.life, incidentDuration(game, kind), 'failure'),
            downAt: game.time,
          }
        : // An operator's command takes most of a data Component's Nodes with it: every Node of
          // the target's type in its region goes down, not just the one it named (11).
          kind === 'operator-typo' &&
            target !== undefined &&
            node.type === target.type &&
            node.region === target.region &&
            !isDown(node)
          ? {
              ...node,
              ...takeDown(node.life, incidentDuration(game, kind), 'failure'),
              downAt: game.time,
            }
          : zone !== null && zoned(node) && node.zone === zone && !isDown(node)
            ? {
                ...node,
                ...takeDown(
                  node.life,
                  node.standby ? failoverSeconds(game) : incidentDuration(game, 'zone'),
                  'failure',
                ),
                downAt: game.time,
              }
            : node.id !== target?.id
              ? node
              : kind === 'reconnect'
                ? // The Hub restarted: it is back, cold, and every client reconnects at once.
                  { ...node, life: withWarm(node.life, 0) }
                : kind === 'instance' && node.type === 'wide'
                  ? // A Wide-column Store loses one replica and keeps serving the quorums it can still form.
                    { ...node, lost: incidentDuration(game, kind) }
                  : kind === 'instance'
                    ? {
                        ...node,
                        // A standby takes over: the Node is back once failover finishes. A Cluster
                        // reschedules a pod on another host by itself (self-healing).
                        ...takeDown(
                          node.life,
                          node.standby
                            ? failoverSeconds(game)
                            : clusterOf(game, node) !== undefined
                              ? rescheduleSeconds(game)
                              : -1,
                          'failure',
                        ),
                        downAt: game.time,
                      }
                    : kind === 'stampede'
                      ? {
                          ...node,
                          life: withWarm(
                            node.life,
                            node.warming && has(game, 'cache-warming') ? WARMED : 0,
                          ),
                        }
                      : kind === 'gpu-shortage'
                        ? {
                            ...node,
                            ...takeDown(node.life, incidentDuration(game, kind), 'failure'),
                            downAt: game.time,
                          }
                        : node,
  )
  // An audit finding resets the DR drill: it must pass again.
  const drill = kind === 'audit' ? null : game.drill
  // A malicious package ships the data out: users leave at once, and the postmortem counts them.
  const lost = kind === 'supply-chain' ? Math.floor(game.users * SUPPLY_CHAIN_CHURN) : 0
  return {
    game: { ...game, nodes, drill, incident, lastIncident: kind, users: game.users - lost },
    incident,
  }
}

/** Rolls the next incident when one is due. */
export const directIncidents = (
  game: Game,
  ledger: Ledger,
  gap = INCIDENT_GAP,
): Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }> => {
  if (game.sandbox || game.incident || game.stage < 1 || game.time < game.nextIncidentAt)
    return { game, events: [] }
  const [roll, afterRoll] = nextRandom(game.seed)
  const [spread, afterGap] = nextRandom(afterRoll)
  const [pick, afterPick] = nextRandom(afterGap)
  // Each Era sets its own interval; `gap` is Pre-seed's, so the playtest knob scales them all.
  const interval = eraOf(game).incidentInterval / (ERAS[1]?.incidentInterval ?? 720)
  const scheduled: Game = {
    ...game,
    seed: afterPick,
    nextIncidentAt: game.time + gap * interval * (0.6 + 0.8 * spread),
  }
  const cap = eraOf(game).maxSeverity
  const kind = pickWeighted(
    INCIDENT_IDS.map(
      (id) =>
        [
          id,
          (INCIDENTS[id].severity < cap ? 0 : weaknessOf(game, ledger, id)) *
            // A Venture's signature incident recurs for it.
            signatureWeight(game, id) *
            // Tech debt makes every incident likelier (08 "Tech debt"): the weakest codebase sets it.
            (1 + Math.max(0, ...game.services.map((service) => service.debt))) *
            (id === game.lastIncident ? REPEAT_WEIGHT : 1) *
            (unaddressed(game, id) ? openActionWeight(game) : 1) *
            mutatorWeight(game, id),
        ] as const,
    ),
    roll,
  )
  if (!kind) return { game: scheduled, events: [] }
  const started = startIncident(scheduled, ledger, kind, pick)
  if (!started) return { game: scheduled, events: [] }
  return { game: started.game, events: [StepEvent.IncidentStarted({ incident: started.incident })] }
}

const postmortemOf = (game: Game, incident: Incident, auto = false): Postmortem => {
  const target = game.nodes.find((node) => node.id === incident.nodeId)
  return {
    id: game.postmortemSeq + 1,
    kind: incident.kind,
    target: target ? nodeLabel(game, target) : null,
    duration: game.time - incident.startedAt,
    mttr: incident.impaired,
    mttd: incident.signalAt === null ? null : Math.max(0, incident.signalAt - incident.startedAt),
    // An acknowledgement before the signal still costs no time to acknowledge.
    mtta:
      incident.ackAt === null || incident.signalAt === null
        ? null
        : Math.max(0, incident.ackAt - incident.signalAt),
    lostUsers: Math.max(0, incident.usersAtStart - game.users),
    lostRevenue: incident.lostRevenue,
    failed: incident.failed,
    severity: incident.severity,
    endedAt: game.time,
    causedBy: incident.causedBy,
    action: game.sandbox
      ? null
      : (INCIDENTS[incident.kind].actions.find((id) => !has(game, id) && researchReady(game, id)) ??
        null),
    ...(auto ? { auto: true } : {}),
    ...(incident.service ? { service: incident.service } : {}),
  }
}

/**
 * The `runbooks` research and the "Write a runbook" task (11 "Runbooks"): a runbook the team wrote
 * for an incident kind runs the response by itself, so that kind ends with no player action.
 */
export const runbookCovers = (game: Game, kind: IncidentId): boolean => game.runbooks.includes(kind)

/**
 * The incidents the Design ends by itself, with no player action (11 "Runbooks"): a Cluster
 * reschedules a pod or a standby fails over, a Spot Node comes back, or a retry storm drains
 * behind backoff. The postmortem records it, so the Runbook achievement can see it.
 */
const resolvesItself = (game: Game, incident: Incident, target: GameNode | undefined): boolean => {
  if (incident.kind === 'instance')
    return target !== undefined && (target.standby || clusterOf(game, target) !== undefined)
  if (incident.kind === 'spot-reclaim')
    return target !== undefined && pricingOf(game, target) === 'spot'
  if (incident.kind === 'retry-storm')
    return game.links.some(
      (link) =>
        link.retries === 'backoff' &&
        game.nodes.some((node) => node.id === link.to && node.type === 'database'),
    )
  return false
}

/**
 * Whether the incident festered: nobody answered it, the player or a rotation (11 "Cascades").
 * A run the Design or a runbook ended never counts, because it was handled.
 */
export const leftAlone = (incident: Incident): boolean =>
  incident.ackAt === null && incident.remaining <= 0 && incident.causedBy === null

/**
 * The incident a left-alone one starts, or null (11 "One at a time, early"). Cascades arrive from
 * Series A, take one hop only, and need the second one to have something to hit.
 */
const cascadesInto = (game: Game, ledger: Ledger, incident: Incident): IncidentId | null => {
  if (game.sandbox || game.stage < CASCADE_FROM_STAGE) return null
  if (!leftAlone(incident)) return null
  const next = CASCADES[incident.kind]
  if (!next) return null
  return weaknessOf(game, ledger, next) > 0 ? next : null
}

/** Ends the running incident: undoes its effect and files a postmortem to write. */
const resolve = (
  game: Game,
  auto = false,
  ledger?: Ledger,
): Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }> => {
  const incident = game.incident
  if (!incident) return { game, events: [] }
  const postmortem = postmortemOf(game, incident, auto)
  const killed = game.nodes.find(
    (node) => node.id === incident.nodeId && incident.kind === 'leak' && node.leak > 0,
  )
  const nodes = game.nodes.map((node) => {
    // A rolled-back config: the crashed servers restart on the old one.
    if (
      incident.kind === 'config' &&
      configured(node) &&
      causeOf(node.life) === 'failure' &&
      node.downAt === incident.startedAt &&
      node.life._tag === 'Restarting'
    )
      return { ...node, ...restarted(node) }
    // A resolution with no player action puts back the Nodes the Incident took down with it.
    if (
      auto &&
      node.downAt === incident.startedAt &&
      causeOf(node.life) === 'failure' &&
      node.life._tag === 'Restarting'
    )
      return { ...node, ...restarted(node) }
    if (node.id !== incident.nodeId) return node
    if (incident.kind === 'instance' && node.life._tag === 'Stopped')
      return { ...node, ...restarted(node) }
    if (incident.kind === 'leak' && node.leak > 0)
      return { ...node, ...restarted(node, 'oom'), leak: 0, downAt: game.time }
    if (incident.kind === 'retry-storm' && node.depth > 0) return { ...node, depth: 0 }
    return node
  })
  const cleared: Game = {
    ...game,
    nodes,
    incident: null,
    postmortems: game.sandbox ? game.postmortems : [...game.postmortems, postmortem].slice(-4),
    postmortemSeq: postmortem.id,
    openActions:
      postmortem.action && !game.openActions.includes(postmortem.action)
        ? [...game.openActions, postmortem.action]
        : game.openActions,
    // A run that a player ended is one the team has handled by hand, so it may get a runbook.
    handled:
      auto || game.handled.includes(incident.kind)
        ? game.handled
        : [...game.handled, incident.kind],
  }
  const events: Array<StepEvent> = [
    ...(killed ? [StepEvent.OutOfMemory({ nodeId: killed.id })] : []),
    StepEvent.IncidentResolved({ postmortem }),
  ]
  // One at a time: a cascade starts after its cause has ended, never beside it (11).
  if (!ledger) return { game: cleared, events }
  const cascade = cascadesInto(cleared, ledger, incident)
  if (cascade === null) return { game: cleared, events }
  const [roll, seed] = nextRandom(cleared.seed)
  const started = startIncident(
    { ...cleared, seed },
    ledger,
    cascade,
    roll,
    undefined,
    undefined,
    incident.kind,
  )
  if (!started) return { game: cleared, events }
  events.push(StepEvent.IncidentStarted({ incident: started.incident }))
  // The cascade holds the director's clock: its own run, then the usual gap before the next one.
  return {
    game: {
      ...started.game,
      nextIncidentAt: Math.max(
        cleared.nextIncidentAt,
        started.game.time + started.incident.remaining + INCIDENT_GAP,
      ),
    },
    events,
  }
}

/**
 * The first signal of the running Incident (11 "The incident loop"): with Alerting it is the pager,
 * which fires the Step a rule's threshold is crossed; without it, the board shows nothing until
 * requests fail. Recorded once, at the Step it lands.
 */
export const markSignal = (game: Game, ledger: Ledger): Game => {
  const incident = game.incident
  if (!incident || incident.signalAt !== null) return game
  const rules = Object.keys(ALERT_RULES) as ReadonlyArray<AlertRule>
  const signalled = has(game, 'alerting')
    ? rules.some((rule) => game.alarms[rule] > 0)
    : ledger.errorShare > ALERT_RULES.errors.threshold
  return signalled ? { ...game, incident: { ...incident, signalAt: game.time } } : game
}

/** Advances the running incident by some seconds: its effect, its cost, and its end. */
export const advanceIncident = (
  game: Game,
  ledger: Ledger,
  seconds: number,
): Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }> => {
  const incident = game.incident
  if (!incident) return { game, events: [] }
  // A runbook the team wrote runs the known response: this kind ends with no player action.
  if (runbookCovers(game, incident.kind)) return resolve(game, true)
  const counted: Incident = {
    ...incident,
    remaining: incident.remaining - seconds,
    impaired: incident.impaired + (ledger.errorShare > 0.01 ? seconds : 0),
    lostRevenue: incident.lostRevenue + Math.max(0, incident.baseline - ledger.revenue) * seconds,
    failed: incident.failed + ledger.errorShare * ledger.demand * seconds,
  }
  // Halfway through, an incident that has hurt users more than half the time steps up once. An
  // incident the design gives no arrow has no second severity (11 "Severity").
  const def = INCIDENTS[incident.kind]
  const half = incidentDuration(game, incident.kind) / 2
  const elapsed = game.time - incident.startedAt
  const stepsTo =
    def.escalatesTo !== null &&
    !game.sandbox &&
    incident.severity === def.severity &&
    elapsed >= half &&
    elapsed - seconds < half &&
    counted.impaired > elapsed / 2
      ? def.escalatesTo
      : null
  const tracked: Incident =
    stepsTo !== null
      ? {
          ...counted,
          severity: stepsTo,
          remaining: counted.remaining * ESCALATION,
          magnitude:
            incident.kind === 'spike' ? incident.magnitude * ESCALATION : incident.magnitude,
        }
      : counted
  // On-call answers the page: the rotation acknowledges it a few seconds after the signal.
  const acked: Incident =
    tracked.ackAt === null &&
    has(game, 'on-call') &&
    tracked.signalAt !== null &&
    game.time >= tracked.signalAt + ON_CALL_ACK
      ? { ...tracked, ackAt: tracked.signalAt + ON_CALL_ACK }
      : tracked
  const target = game.nodes.find((node) => node.id === incident.nodeId)
  // A spot reclaim warns first: 10 s in, the provider takes the Node for the rest of it.
  const reclaims =
    incident.kind === 'spot-reclaim' &&
    target !== undefined &&
    pricingOf(game, target) === 'spot' &&
    !isDown(target) &&
    elapsed >= SPOT_WARNING
  const nodes =
    incident.kind === 'leak' && target
      ? game.nodes.map((node) =>
          node.id === target.id
            ? { ...node, leak: node.leak + ramOf(node) * LEAK_RATE * seconds }
            : node,
        )
      : reclaims && target
        ? game.nodes.map((node) =>
            node.id === target.id
              ? {
                  ...node,
                  ...takeDown(node.life, acked.remaining, 'failure'),
                  downAt: game.time,
                }
              : node,
          )
        : game.nodes
  const next: Game = { ...game, nodes, incident: acked }
  const elapsedAfter = game.time - incident.startedAt
  const held = nodes.find((node) => node.id === incident.nodeId)
  const fixed =
    (incident.kind === 'instance' && (!target || target.life._tag !== 'Stopped')) ||
    (incident.kind === 'leak' &&
      (!target || (target.leak === 0 && incident.remaining < incidentDuration(game, 'leak')))) ||
    // A restart clears the heap.
    (incident.kind === 'gc-storm' && (!target || target.life._tag === 'Restarting')) ||
    // The storm is over once the trigger has passed and the backlog has drained.
    (incident.kind === 'retry-storm' &&
      elapsedAfter >= STORM_TRIGGER &&
      (!target || target.depth <= 0)) ||
    // With no retries left on the charge Link, nothing charges twice.
    (incident.kind === 'double-charge' &&
      !game.links.some(
        (link) =>
          link.retries !== 'none' &&
          game.nodes.some((node) => node.id === link.to && node.type === 'psp'),
      )) ||
    // A reclaimed Node is back, sold, or no longer spot: the reclaim is over.
    (incident.kind === 'spot-reclaim' &&
      elapsedAfter >= SPOT_WARNING &&
      (!held || held.life._tag !== 'Restarting')) ||
    // The Hub is warm again: the reconnect wave is over.
    (incident.kind === 'reconnect' && (!held || held.life._tag === 'Running')) ||
    // Re-adding capacity: a Node of the Component the command emptied serves again (11).
    (incident.kind === 'operator-typo' &&
      target !== undefined &&
      game.nodes.some(
        (node) =>
          node.id !== target.id &&
          node.type === target.type &&
          node.region === target.region &&
          !isDown(node),
      ))
  // Fixed before its clock ran out, by a path the Design takes on its own: record that.
  const healed = fixed && acked.remaining > 0 && resolvesItself(game, incident, target)
  return acked.remaining <= 0 || fixed ? resolve(next, healed, ledger) : { game: next, events: [] }
}

/** Starts an incident on demand, for the playtest panel and Sandbox scripts. */
export const forceIncident = (
  game: Game,
  ledger: Ledger,
  kind: IncidentId,
  only?: ComponentId,
): Game | null => {
  if (game.incident) return null
  const [roll, seed] = nextRandom(game.seed)
  return startIncident({ ...game, seed }, ledger, kind, roll, only)?.game ?? null
}
