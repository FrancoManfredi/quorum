import { Result } from 'effect'
import {
  BLOCK_SIZE_AT,
  BLOCK_REMIND_DAYS,
  CALENDAR_DAY,
  COMPONENTS,
  CONTENT_MOOD,
  DATA_TEAM_HOURS,
  DB_ENGINES,
  DOC_PATTERN_FACTOR,
  DOC_SHAPE_DH,
  ELIXIR_HOT_UPGRADE_DEV_HOURS,
  ERAS,
  FREEZE_MOOD_DAYS,
  PAGE_MOOD,
  PAY_GAP_MOOD_DAYS,
  RUNTIMES,
  SIM_SECONDS_PER_DEV_HOUR,
  TIME_OFF_DAYS,
  UNHAPPY_MOOD,
  type ComponentId,
  BACKGROUND_FEATURES,
  FEATURES,
  FEATURE_IDS,
  FRAMEWORKS,
  INTERNAL_TOOL_FEATURES,
  FIXES,
  INCIDENTS,
  INCIDENT_IDS,
  HOTFIX_DEBT,
  KLOC_PER_DH,
  LIVE_TUNING,
  MIGRATION_FACTORS,
  MIGRATION_FEATURE_SPEED,
  MOOD_START,
  POLICIES,
  REFACTOR_PER_DH,
  RUSH_BUG_CHANCE,
  RUSH_DEBT,
  RESEARCH,
  type ResearchId,
  TASKS,
  TASK_LINK_TIMEOUT,
  LOAD_TEST_DAYS,
  AUTH_MOVE_DH,
  ENGINE_FACTOR,
  ENGINE_COPY_MINUTES_PER_GB,
  EXPAND_CONTRACT_DH,
  ONLINE_MIGRATION_DH,
  RESHARD_DH,
  RESHARD_MINUTES_PER_GB,
  SHARD_COUNTS,
  UNSTRUCTURED_DEBT,
  type FeatureId,
  type FixId,
  type FrameworkId,
  type PolicyId,
  type IncidentId,
  type RequestKind,
  type RuntimeId,
  type TaskId,
  type Tuning,
} from './catalog.ts'
import { Refusal, setFramework, setRuntime, shortOfCash, type Action } from './actions.ts'
import { startIncident } from './director.ts'
import { StepEvent } from './events.ts'
import type { Ledger } from './ledger.ts'
import { has, eraOf, isDown, restarted, sreStaffed } from './lookups.ts'
import { step as hireStep } from './hire-machine.ts'
import { step as moveStep } from './data-move-machine.ts'
import { step as blockStep } from './work-item-machine.ts'
import { step as featureStep } from './feature-machine.ts'
import { awaitingFeatures, isBuilt, isFeatureLive } from './features.ts'
import {
  bugsFixed,
  cancelMigration,
  isReady,
  shiftMigration,
  startMigration,
  stepOf,
  targetOf,
  trancheBuilt,
} from './migration.ts'
import { nextRandom } from './random.ts'
import { openRegions } from './regions.ts'
import { NEW_ENGINEER } from './state.ts'
import { warming } from './life.ts'
import type {
  GameNode,
  BlockKind,
  DbEngine,
  DbTopology,
  ShardKey,
  Game,
  Service,
  Team,
  TeamKind,
  WorkItem,
} from './state.ts'
import {
  blastService,
  dataStaffed,
  days,
  deployEvery,
  enqueue,
  fixed,
  hireSeconds,
  languageOfService,
  memberOf,
  membersOf,
  moraleSeconds,
  nextBadDeployChance,
  ownerOf,
  paidIndex,
  payGapOf,
  platformStaffed,
  policyNow,
  serviceOf,
  serviceOfFeature,
  serviceOfId,
  sharesDatabase,
  signingOf,
  stackOf,
  debtGrowthOf,
  teamOutputs,
  withService,
  withServiceId,
} from './team.ts'
import { rollOutcome } from './features.ts'
import { budgetVelocity } from './slo.ts'

const ok = (game: Game): Action => Result.succeed(game)
const no = (refusal: Refusal): Action => Result.fail(refusal)
const notAllowed = (reason: string): Action => no(Refusal.NotAllowed({ reason }))

const SANDBOX = 'A Sandbox has no Team.'
/** Teams the player can run in the slice. */
export const MAX_TEAMS = 4
/** A Platform team opens at Series A (08 "Teams"). */
export const PLATFORM_STAGE = 3
/** The autopilot refactors once debt reaches this. */
const AUTO_REFACTOR = 0.3

export const itemName = (item: WorkItem): string => {
  if (item.kind === 'feature') return FEATURES[item.ref as FeatureId]?.name ?? item.ref
  if (item.kind === 'task') {
    const name = TASKS[item.ref as TaskId]?.name ?? item.ref
    // A runbook names the incident kind it covers, so two on the backlog are told apart.
    return item.ref === 'runbook' && item.target
      ? `${name}: ${INCIDENTS[item.target as IncidentId]?.name ?? item.target}`
      : name
  }
  if (item.kind === 'patch')
    return `Patch ${COMPONENTS[item.target as ComponentId]?.name ?? 'Design'}`
  if (item.kind === 'spike') return `Spike: ${RESEARCH[item.ref as ResearchId]?.name ?? item.ref}`
  if (item.kind === 'split') return 'Split a service'
  if (item.kind === 'move')
    return item.ref === 'auth'
      ? 'Move auth in-house'
      : item.ref === 'reshard'
        ? 'Reshard the database'
        : 'Change the database engine'
  return `Migration step ${item.ref.slice(5)}`
}

const queued = (game: Game, ref: string): boolean => game.backlog.some((item) => item.ref === ref)

/** Features the Company has, has built, or has queued. */
const planned = (game: Game, id: FeatureId): boolean => isBuilt(game, id) || queued(game, id)

/** Dev Hours of a Database engine change: 0.8 of the codebase, to a tenth. */
export const engineCost = (game: Game): number =>
  Math.max(0.5, Math.round(serviceOf(game).codebase * ENGINE_FACTOR * 10) / 10)

/** Queues the move off an Auth Provider: a fixed 120 Dev Hours, whatever the codebase. */
export const queueAuthMove = (game: Game): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  if (!game.nodes.some((node) => node.type === 'auth'))
    return notAllowed('There is no Auth Provider to move off.')
  if (queued(game, 'auth')) return notAllowed('Moving auth in-house is on the backlog.')
  return ok(enqueue(game, 'move', 'auth', AUTH_MOVE_DH))
}

/** Queues a Database engine change: 0.8 of the codebase in Dev Hours, then a data copy. Every Database changes together: replication needs one engine (07 "Variants"). */
export const queueEngineChange = (game: Game, nodeId: string, to: DbEngine): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node || node.type !== 'database') return notAllowed('Only a Database changes engine.')
  if (node.dbEngine === to) return notAllowed(`It already runs ${DB_ENGINES[to].name}.`)
  if (game.engineChange || queued(game, 'engine'))
    return notAllowed('A Database engine change is already running.')
  return ok({
    ...enqueue(game, 'move', 'engine', engineCost(game), false, { target: nodeId }),
    engineChange: { node: nodeId, to, phase: { _tag: 'Building' } },
  })
}

/** Queues a Database's topology switch: the same Dev Hours and data copy as a resharding (07 "Topologies"). */
export const queueTopology = (game: Game, nodeId: string, topology: DbTopology): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node || node.type !== 'database') return notAllowed('Only a Database changes topology.')
  if (node.topology === topology) return ok(game)
  if (game.reshard || queued(game, 'reshard')) return notAllowed('A resharding is already running.')
  return ok({
    ...enqueue(game, 'move', 'reshard', RESHARD_DH, false, { target: nodeId }),
    reshard: {
      node: nodeId,
      shards: node.shards,
      key: node.shardKey,
      topology,
      phase: { _tag: 'Building' },
    },
  })
}

/** Queues a Database's resharding: Dev Hours first, then a data copy that halves its IOPS (07 "Partitioning"). */
export const queueReshard = (
  game: Game,
  nodeId: string,
  change: Readonly<{ shards?: number; key?: ShardKey }>,
): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node || node.type !== 'database') return notAllowed('Only a Database shards.')
  const shards = change.shards ?? node.shards
  const key = change.key ?? node.shardKey
  if (!(SHARD_COUNTS as ReadonlyArray<number>).includes(shards))
    return notAllowed(`Shard counts are ${SHARD_COUNTS.join(', ')}.`)
  if (shards > 1 && !has(game, 'sharding'))
    return Result.fail(Refusal.Locked({ what: 'Sharding', research: RESEARCH.sharding.name }))
  if (shards === node.shards && key === node.shardKey) return ok(game)
  if (game.reshard || queued(game, 'reshard')) return notAllowed('A resharding is already running.')
  return ok({
    ...enqueue(game, 'move', 'reshard', RESHARD_DH, false, { target: nodeId }),
    reshard: { node: nodeId, shards, key, topology: node.topology, phase: { _tag: 'Building' } },
  })
}

/** What a finished move does: auth leaves the Design, a resharding's or an engine's data copy starts. */
const moved = (game: Game, item: WorkItem, tuning: Tuning): Game => {
  if (item.ref === 'auth') {
    const gone = new Set(game.nodes.filter((node) => node.type === 'auth').map((node) => node.id))
    return {
      ...game,
      nodes: game.nodes.filter((node) => !gone.has(node.id)),
      links: game.links.filter((link) => !gone.has(link.from) && !gone.has(link.to)),
    }
  }
  if (item.ref === 'reshard') {
    const reshard = game.reshard
    if (!reshard) return game
    // The copy takes a calendar day at least, and a minute a GB of rows after that.
    const copy = Math.max(1, (game.data * RESHARD_MINUTES_PER_GB * 60) / CALENDAR_DAY)
    return {
      ...game,
      reshard: {
        ...reshard,
        phase: moveStep(reshard.phase, { _tag: 'Built', until: game.time + days(copy, tuning) }),
      },
    }
  }
  const change = game.engineChange
  if (!change) return game
  const copy = (game.data * ENGINE_COPY_MINUTES_PER_GB * 60) / CALENDAR_DAY
  return {
    ...game,
    engineChange: {
      ...change,
      phase: moveStep(change.phase, { _tag: 'Built', until: game.time + days(copy, tuning) }),
    },
  }
}

/** Ends a finished resharding copy: the Database runs the new shards and key from now on. */
const finishReshard = (game: Game): Game => {
  const reshard = game.reshard
  if (!reshard || reshard.phase._tag !== 'Copying' || game.time < reshard.phase.until) return game
  return {
    ...game,
    reshard: null,
    nodes: game.nodes.map((node) =>
      node.type === 'database'
        ? {
            ...node,
            // A topology switch lands on every Database together; a plain resharding keeps each
            // Database's own shards and key unless it is the one being resharded.
            ...(reshard.topology !== node.topology || node.id === reshard.node
              ? { topology: reshard.topology }
              : {}),
            ...(node.id === reshard.node ? { shards: reshard.shards, shardKey: reshard.key } : {}),
          }
        : node,
    ),
  }
}

/** Ends a finished data copy: every Database runs the new engine from now on (07 "Variants"). */
const finishEngineChange = (game: Game): Game => {
  const change = game.engineChange
  if (!change || change.phase._tag !== 'Copying' || game.time < change.phase.until) return game
  return {
    ...game,
    engineChange: null,
    nodes: game.nodes.map((node) =>
      node.type === 'database' ? { ...node, dbEngine: change.to } : node,
    ),
  }
}

export const featureRefusal = (game: Game, id: FeatureId): Refusal | null => {
  const def = FEATURES[id]
  if (game.sandbox) return Refusal.NotAllowed({ reason: SANDBOX })
  if (isFeatureLive(game, id)) return Refusal.NotAllowed({ reason: `${def.name} is live.` })
  if (isBuilt(game, id))
    return Refusal.NotAllowed({ reason: `${def.name} waits for the next deploy.` })
  if (queued(game, id)) return Refusal.NotAllowed({ reason: `${def.name} is on the backlog.` })
  if (def.era > game.stage)
    return Refusal.TooEarly({ what: def.name, era: ERAS[def.era]?.name ?? 'a later Era' })
  if (def.research && !has(game, def.research))
    return Refusal.Locked({ what: def.name, research: RESEARCH[def.research].name })
  const missing = def.requires.filter((needed) => !planned(game, needed))
  if (missing.length > 0)
    return Refusal.NotAllowed({
      reason: `${def.name} needs ${missing.map((needed) => FEATURES[needed].name).join(' and ')}.`,
    })
  // Data residency needs an open EU region, not a Feature (08 "Features"): nowhere else is EU
  // data allowed to leave the region it names.
  if (id === 'data-residency' && !openRegions(game).includes('eu'))
    return Refusal.NotAllowed({ reason: `${def.name} needs an open EU region.` })
  // Email digests send in a burst of jobs that a Queue absorbs (08 "Features").
  if (id === 'email-digests' && !game.nodes.some((node) => node.type === 'queue'))
    return Refusal.NotAllowed({ reason: `${def.name} need a Queue to send through.` })
  return null
}

/** An App Server whose runtime is Node.js or Python on an event loop (08 "Engineering tasks"). */
const onLoop = (node: Game['nodes'][number]): boolean =>
  RUNTIMES[node.runtime].language === 'node' ||
  (RUNTIMES[node.runtime].language === 'python' && RUNTIMES[node.runtime].model === 'loop')

/** Whether a Link starts at an App Server or a Worker, the code the task changes. */
const callerOf = (game: Game, link: Game['links'][number]): boolean =>
  game.nodes.some(
    (node) => node.id === link.from && (node.type === 'server' || node.type === 'worker'),
  )

/** Whether a Link already holds the policy Add timeouts and retries writes. */
const policed = (link: Game['links'][number]): boolean =>
  link.timeout <= TASK_LINK_TIMEOUT && link.retries === 'backoff'

export const taskRefusal = (game: Game, id: TaskId): Refusal | null => {
  const def = TASKS[id]
  if (game.sandbox) return Refusal.NotAllowed({ reason: SANDBOX })
  if (def.internal) return Refusal.NotAllowed({ reason: `${def.name} comes with a migration.` })
  if (def.research && !has(game, def.research))
    return Refusal.Locked({ what: def.name, research: RESEARCH[def.research].name })
  if (queued(game, id)) return Refusal.NotAllowed({ reason: `${def.name} is on the backlog.` })
  if ((FIXES as ReadonlyArray<string>).includes(id) && serviceOf(game).fixes.includes(id as FixId))
    return Refusal.NotAllowed({ reason: `${def.name} is done.` })
  if (id === 'add-index' && serviceOf(game).shapes <= 0 && game.incident?.kind !== 'slow-query')
    return Refusal.NotAllowed({ reason: 'Every query has an index.' })
  if (id === 'refactor' && serviceOf(game).debt <= 0)
    return Refusal.NotAllowed({ reason: 'There is no tech debt.' })
  if (id === 'upgrade-cluster' && !game.nodes.some((node) => node.type === 'cluster'))
    return Refusal.NotAllowed({ reason: 'There is no Kubernetes Cluster to upgrade.' })
  // A runbook names one incident kind, which the Add work menu picks (11 "Runbooks").
  if (id === 'runbook')
    return Refusal.NotAllowed({ reason: 'Choose the incident a runbook covers.' })
  if (id === 'off-loop' && !game.nodes.some((node) => node.type === 'server' && onLoop(node)))
    return Refusal.NotAllowed({ reason: 'No App Server runs Node.js or Python on an event loop.' })
  if (
    id === 'timeouts-retries' &&
    !game.links.some((link) => callerOf(game, link) && !policed(link))
  )
    return Refusal.NotAllowed({ reason: 'Every Link out of a server already has a policy.' })
  if (id === 'load-test' && game.time < game.loadTestUntil)
    return Refusal.NotAllowed({ reason: 'A load test is already running.' })
  return null
}

/**
 * Incidents no runbook covers: a drill tests the team rather than the design, and a breach and a
 * credential leak run their course by design, with no mitigation to automate (11 "Catalog").
 */
const NO_RUNBOOK: ReadonlyArray<IncidentId> = ['dr-drill', 'breach', 'credential-leak']

/**
 * Why a runbook cannot be written for this incident kind, or null. The team must have handled it
 * by hand once, so automation is a reward for a lesson already learned (11 "Runbooks"), and an SRE
 * team must be staffed to keep the runbook current.
 */
export const runbookRefusal = (game: Game, kind: IncidentId): Refusal | null => {
  const name = INCIDENTS[kind].name
  if (game.sandbox) return Refusal.NotAllowed({ reason: SANDBOX })
  if (NO_RUNBOOK.includes(kind))
    return Refusal.NotAllowed({ reason: `${name} has no response to automate.` })
  if (!has(game, 'runbooks'))
    return Refusal.Locked({ what: 'A runbook', research: RESEARCH.runbooks.name })
  if (!sreStaffed(game))
    return Refusal.NotAllowed({ reason: 'A runbook needs an SRE team with an engineer on it.' })
  if (game.runbooks.includes(kind))
    return Refusal.NotAllowed({ reason: `${name} already has a runbook.` })
  if (!game.handled.includes(kind))
    return Refusal.NotAllowed({ reason: `Handle ${name} by hand first.` })
  if (
    game.backlog.some(
      (item) => item.kind === 'task' && item.ref === 'runbook' && item.target === kind,
    )
  )
    return Refusal.NotAllowed({ reason: `${name}’s runbook is on the backlog.` })
  return null
}

/** The incident kinds a runbook may be written for now: handled by hand, without one yet. */
export const runbookKinds = (game: Game): ReadonlyArray<IncidentId> =>
  INCIDENT_IDS.filter(
    (kind) =>
      game.handled.includes(kind) && !game.runbooks.includes(kind) && !NO_RUNBOOK.includes(kind),
  )

const refused = (refusal: Refusal | null, apply: () => Game): Action =>
  refusal ? no(refusal) : ok(apply())

/**
 * Dev Hours a Feature costs on this Design (07 "Document Store"). A Document Store has no schema
 * to migrate, so a Feature that changes the data shape costs a quarter less and skips the
 * migration. Every other Feature pays a little more, because with no joins each access pattern it
 * adds is its own collection and index to write.
 */
export const featureHoursOf = (game: Game, id: FeatureId): number => {
  const def = FEATURES[id]
  // A Data team makes the analytics and AI Features cheaper (08 "Teams").
  const data =
    dataStaffed(game) && def.unlocks && DATA_KINDS.includes(def.unlocks.kind as RequestKind)
      ? DATA_TEAM_HOURS
      : 1
  // The framework's own tools: Django's admin site for internal tools, Laravel's queues and
  // scheduler for background work (06 "Frameworks").
  const framework = FRAMEWORKS[stackOf(game).framework]
  const tooling =
    (INTERNAL_TOOL_FEATURES.includes(id) ? (framework.internalTools ?? 1) : 1) *
    (BACKGROUND_FEATURES.includes(id) ? (framework.workerHours ?? 1) : 1)
  const documents = game.nodes.some(
    (node) => node.type === 'doc' && !isDown(node) && node.service._tag !== 'Shut',
  )
  // A schema-change tool costs Dev Hours on every Feature that changes a relational schema.
  if (!documents)
    return (
      def.dh *
      data *
      tooling *
      (def.shapes > 0
        ? has(game, 'expand-contract')
          ? EXPAND_CONTRACT_DH
          : has(game, 'online-migrations')
            ? ONLINE_MIGRATION_DH
            : 1
        : 1)
    )
  return def.dh * data * tooling * (def.shapes > 0 ? DOC_SHAPE_DH : DOC_PATTERN_FACTOR)
}

/** The request kinds a Data team makes cheaper to build: `report` and `ai` (08 "Teams"). */
const DATA_KINDS: ReadonlyArray<RequestKind> = ['report', 'ai']

export const queueFeature = (game: Game, id: FeatureId): Action =>
  refused(featureRefusal(game, id), () =>
    enqueue(rollOutcome(game, id), 'feature', id, featureHoursOf(game, id), false, {
      service: serviceOfFeature(game, id).id,
    }),
  )

export const queueTask = (game: Game, id: TaskId): Action =>
  refused(taskRefusal(game, id), () => enqueue(game, 'task', id, TASKS[id].dh))

/**
 * Why a live Feature cannot be removed, or null. A turned-off Feature still pays its upkeep
 * (08 "Rollout"); removing it is the only thing that ends it. A Feature another live or planned
 * Feature requires stays, so the dependency graph the backlog checks never breaks underfoot.
 */
export const removeRefusal = (game: Game, id: FeatureId): Refusal | null => {
  const def = FEATURES[id]
  if (game.sandbox) return Refusal.NotAllowed({ reason: SANDBOX })
  if (!isFeatureLive(game, id)) return Refusal.NotAllowed({ reason: `${def.name} is not live.` })
  const dependents = FEATURE_IDS.filter(
    (other) => other !== id && FEATURES[other].requires.includes(id) && planned(game, other),
  )
  if (dependents.length > 0)
    return Refusal.NotAllowed({
      reason: `${dependents.map((other) => FEATURES[other].name).join(' and ')} need${dependents.length === 1 ? 's' : ''} it.`,
    })
  return null
}

/**
 * Removes a live Feature for good (08 "Rollout"): its code is gone, so it stops costing upkeep,
 * and every effect it had (market, growth, churn, value, load, the kind it unlocked) stops too.
 * Unlike a flag turned off, there is no bringing it back: building it again queues it from zero.
 */
export const removeFeature = (game: Game, id: FeatureId): Action => {
  const refusal = removeRefusal(game, id)
  if (refusal) return no(refusal)
  const service = serviceOfFeature(game, id)
  const removed: Game = {
    ...game,
    features: Object.fromEntries(Object.entries(game.features).filter(([entry]) => entry !== id)),
    rushedFeatures: Object.fromEntries(
      Object.entries(game.rushedFeatures).filter(([entry]) => entry !== id),
    ),
    outcomes: Object.fromEntries(Object.entries(game.outcomes).filter(([entry]) => entry !== id)),
  }
  return ok(
    withServiceId(removed, service.id, {
      features: service.features.filter((entry) => entry !== id),
      lastDeploy: service.lastDeploy.filter((entry) => entry !== id),
    }),
  )
}

/** Queues "Write a runbook" for one incident kind (11 "Runbooks"). */
export const queueRunbook = (game: Game, kind: IncidentId): Action =>
  refused(runbookRefusal(game, kind), () =>
    enqueue(game, 'task', 'runbook', TASKS.runbook.dh, false, { target: kind }),
  )

/** What a split asks for: the new Service's name, its owner, and the Features it takes with it. */
export type SplitRequest = Readonly<{
  name: string
  owner: string
  features: ReadonlyArray<FeatureId>
  /** The Database Node the new Service reads and writes; null keeps the Design's first one. */
  datastore?: string | null
}>

/**
 * Dev Hours a split costs: the migration factor for a split, 0.3, of the moved part of the
 * codebase (08 "Migrations"). A codebase is 0.5 KLOC per Dev Hour of the Features shipped on it.
 */
export const splitCost = (features: ReadonlyArray<FeatureId>): number =>
  Math.max(
    0.5,
    Math.round(
      features.reduce((sum, id) => sum + FEATURES[id].dh * KLOC_PER_DH, 0) *
        MIGRATION_FACTORS.split *
        10,
    ) / 10,
  )

/** Why a split cannot be made, or null. */
export const splitRefusal = (game: Game, request: SplitRequest): Refusal | null => {
  if (game.sandbox) return Refusal.NotAllowed({ reason: SANDBOX })
  if (!has(game, 'service-boundaries'))
    return Refusal.Locked({
      what: 'A service split',
      research: RESEARCH['service-boundaries'].name,
    })
  if (request.features.length === 0)
    return Refusal.NotAllowed({ reason: 'Choose at least one Feature to move.' })
  if (!game.teams.some((team) => team.id === request.owner))
    return Refusal.NotAllowed({ reason: 'That team is gone.' })
  if (
    request.datastore != null &&
    !game.nodes.some((node) => node.id === request.datastore && node.type === 'database')
  )
    return Refusal.NotAllowed({ reason: 'That Database is not on the Board.' })
  const name = request.name.trim()
  if (
    name !== '' &&
    game.services.some((service) => service.name.toLowerCase() === name.toLowerCase())
  )
    return Refusal.NotAllowed({ reason: `A Service is already called ${name}.` })
  for (const id of request.features) {
    if (!isFeatureLive(game, id))
      return Refusal.NotAllowed({ reason: `${FEATURES[id].name} is not live yet.` })
    const carrier = serviceOfFeature(game, id)
    if (carrier.id !== serviceOf(game).id)
      return Refusal.NotAllowed({
        reason: `${FEATURES[id].name} is already on ${carrier.name}.`,
      })
  }
  return null
}

/**
 * Splits a Service: the new codebase, owned by a team, carrying the Features it was split for.
 * Its Dev Hours go on the backlog as one split item, sized by the moved code. The moved Features
 * leave the codebase they came from.
 */
export const splitService = (game: Game, request: SplitRequest): Action => {
  const refusal = splitRefusal(game, request)
  if (refusal) return no(refusal)
  const features = [...new Set(request.features)]
  const name = request.name.trim() || `Service ${game.services.length}`
  const moved = features.reduce((sum, id) => sum + FEATURES[id].dh * KLOC_PER_DH, 0)
  // The code leaves the Services that carried it.
  const leaving = new Map<string, number>()
  for (const id of features) {
    const carrier = serviceOfFeature(game, id)
    leaving.set(carrier.id, (leaving.get(carrier.id) ?? 0) + FEATURES[id].dh * KLOC_PER_DH)
  }
  let seq = game.services.length + 1
  while (game.services.some((service) => service.id === `service-${seq}`)) seq += 1
  const service: Service = {
    id: `service-${seq}`,
    name,
    debt: 0,
    codebase: moved,
    fixes: [],
    shapes: 0,
    indexes: 0,
    migration: null,
    nextDeployAt: serviceOf(game).nextDeployAt,
    lastDeploy: [],
    owner: request.owner,
    features,
    datastore: request.datastore ?? null,
  }
  const next: Game = {
    ...game,
    services: [
      ...game.services.map((entry) =>
        leaving.has(entry.id)
          ? { ...entry, codebase: Math.max(0, entry.codebase - (leaving.get(entry.id) ?? 0)) }
          : entry,
      ),
      service,
    ],
  }
  return ok(enqueue(next, 'split', service.id, splitCost(features), false, { service: service.id }))
}

/**
 * Moves a Service to another team (08 "Ownership"): the new owner's engineers take its backlog
 * first, and the next bad deploy on it pages them. Instant, with no Dev Hours of its own; what it
 * costs is implicit in the coordination and debt the new owner now carries.
 */
export const moveService = (game: Game, serviceId: string, teamId: string): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const service = game.services.find((entry) => entry.id === serviceId)
  if (!service) return no(Refusal.Missing())
  if (!game.teams.some((team) => team.id === teamId)) return no(Refusal.Missing())
  if (service.owner === teamId) return ok(game)
  return ok(withServiceId(game, serviceId, { owner: teamId }))
}

/**
 * Names the Database a Service reads and writes (08 "Shared database penalty"): null keeps the
 * Design's first Database, which is why split Services share it until they name their own. Instant
 * and free; the penalty follows from whether two Services name the same Database (07 "Topologies").
 */
export const setDatastore = (game: Game, serviceId: string, datastore: string | null): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const service = game.services.find((entry) => entry.id === serviceId)
  if (!service) return no(Refusal.Missing())
  if (
    datastore !== null &&
    !game.nodes.some((node) => node.id === datastore && node.type === 'database')
  )
    return notAllowed('That Database is not on the Board.')
  if ((service.datastore ?? null) === datastore) return ok(game)
  return ok(withServiceId(game, serviceId, { datastore }))
}

/** The Service an App Server or Worker belongs to: its own, or the starting Service when none is set. */
export const serviceOfNode = (game: Game, node: GameNode): Service =>
  game.services.find((entry) => entry.id === node.serviceId) ?? serviceOf(game)

/** Moves an App Server or Worker to another Service (08 "Ownership"). Instant and free. */
export const assignService = (game: Game, nodeId: string, serviceId: string): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node || !game.services.some((entry) => entry.id === serviceId)) return no(Refusal.Missing())
  if (node.type !== 'server' && node.type !== 'worker')
    return notAllowed('Only an App Server or a Worker belongs to a Service.')
  if (serviceOfNode(game, node).id === serviceId) return ok(game)
  return ok({
    ...game,
    nodes: game.nodes.map((entry) => (entry.id === nodeId ? { ...entry, serviceId } : entry)),
  })
}

/** The App Servers and Workers of a Service. */
export const nodesOfService = (game: Game, serviceId: string): ReadonlyArray<GameNode> =>
  game.nodes.filter(
    (node) =>
      (node.type === 'server' || node.type === 'worker') &&
      serviceOfNode(game, node).id === serviceId,
  )

/** The Load Balancers that send traffic to a Service's App Servers. */
export const loadBalancersOf = (game: Game, serviceId: string): ReadonlyArray<GameNode> => {
  const members = new Set(nodesOfService(game, serviceId).map((node) => node.id))
  const ids = new Set(game.links.filter((link) => members.has(link.to)).map((link) => link.from))
  return game.nodes.filter((node) => node.type === 'lb' && ids.has(node.id))
}

/** The item's Service: a Feature's own codebase, or the Service the item names. */
export const serviceOfItem = (game: Game, item: WorkItem): Service =>
  item.kind === 'feature'
    ? serviceOfFeature(game, item.ref as FeatureId)
    : serviceOfId(game, item.service)

/**
 * Whether a team takes an item (08 "Ownership"): a Service is fixed by its owner. A team that owns
 * no Service helps on the starting one, which keeps a Company with one Service playing as it did.
 */
export const worksOn = (game: Game, team: Team, item: WorkItem): boolean => {
  if (game.services.length <= 1) return true
  const service = serviceOfItem(game, item)
  if (service.owner === team.id) return true
  return (
    !game.services.some((entry) => entry.owner === team.id) && service.id === serviceOf(game).id
  )
}

/**
 * Puts a fix in the code, or takes it out, on a Challenge whose fixes cost Dev Hours
 * (14 "The N+1"). The Challenge counts the Dev Hours; the fix itself is instant.
 */
export const setFix = (game: Game, id: FixId, on: boolean): Action => {
  if (!game.scenario?.tasks) return notAllowed(SANDBOX)
  const research = TASKS[id].research
  if (research && !has(game, research))
    return no(Refusal.Locked({ what: TASKS[id].name, research: RESEARCH[research].name }))
  const fixes = serviceOf(game).fixes
  if (fixes.includes(id) === on) return ok(game)
  return ok(
    withService(game, { fixes: on ? [...fixes, id] : fixes.filter((entry) => entry !== id) }),
  )
}

/** Puts a Team on the running Study (08 "Spikes"): it runs 2× while the Team works on it. */
export const queueSpike = (game: Game): Action => {
  const running = game.studies[0]
  if (game.sandbox) return notAllowed(SANDBOX)
  if (!running) return notAllowed('No Study is running.')
  if (queued(game, running.id))
    return notAllowed(`A Team already spikes ${RESEARCH[running.id].name}.`)
  // A Spike has no size: it holds its Team until its Study completes.
  return ok(enqueue(game, 'spike', running.id, Number.MAX_SAFE_INTEGER, true))
}

const withItem = (game: Game, id: number, apply: (index: number) => Action): Action => {
  const index = game.backlog.findIndex((item) => item.id === id)
  return index === -1 ? no(Refusal.Missing()) : apply(index)
}

/** Moves an item up or down the backlog. */
export const moveItem = (game: Game, id: number, direction: 1 | -1): Action =>
  withItem(game, id, (index) => {
    const to = index + direction
    if (to < 0 || to >= game.backlog.length) return ok(game)
    const backlog = [...game.backlog]
    const [item] = backlog.splice(index, 1)
    if (item) backlog.splice(to, 0, item)
    return ok({ ...game, backlog })
  })

/** Moves an item to the top of the backlog, so the next free team builds it. */
export const prioritizeItem = (game: Game, id: number): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (!item) return no(Refusal.Missing())
    return ok({ ...game, backlog: [item, ...game.backlog.filter((entry) => entry.id !== id)] })
  })

/** Takes an item off the backlog. Dev Hours spent on it are lost. */
export const cancelItem = (game: Game, id: number): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (item?.kind === 'migration') return notAllowed('Cancel the migration instead.')
    if (item?.ref === 'fix-bugs') return notAllowed('The migration needs its bugs fixed.')
    if (item?.kind === 'patch') return notAllowed('A patch stays until it is built or it expires.')
    const gone = { ...game, backlog: game.backlog.filter((entry) => entry.id !== id) }
    // A move cancelled before its data copy starts leaves nothing running.
    if (item?.ref === 'reshard') return ok({ ...gone, reshard: null })
    if (item?.ref === 'engine') return ok({ ...gone, engineChange: null })
    return ok(gone)
  })

/** Pays what an item still needs from the Dev Hours pool, as far as it reaches. */
export const rushItem = (game: Game, id: number): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (!item) return no(Refusal.Missing())
    if (item.kind === 'spike') return notAllowed('A Spike ends when its Study completes.')
    if (game.devHours < 0.01) return notAllowed('The Dev Hours pool is empty.')
    const paid = Math.min(game.devHours, item.cost - item.spent)
    const backlog = game.backlog.map((entry, at) =>
      at === index
        ? { ...entry, spent: entry.spent + paid, rushed: (entry.rushed ?? 0) + paid }
        : entry,
    )
    return ok({ ...game, devHours: game.devHours - paid, backlog })
  })

/**
 * The share of an item's cost a Rush pays, counting what earlier Rushes paid: 1 is a full rush.
 * It reads the item's own rushed Dev Hours, so a second click shows the total, not just its own.
 */
const rushedShareOf = (item: WorkItem, pool: number): number => {
  if (item.cost <= 0) return 0
  const paid = Math.max(0, Math.min(pool, item.cost - item.spent))
  return Math.min(1, ((item.rushed ?? 0) + paid) / item.cost)
}

/** The tech debt a rush adds once the item finishes: a full item's cost pays 2 points. */
export const rushDebtOf = (item: WorkItem, pool: number): number =>
  RUSH_DEBT * rushedShareOf(item, pool)

/** The bad-deploy chance a rushed Feature carries into its deploy: 10% for a full item's cost. */
export const rushBugOf = (game: Game, item: WorkItem, pool: number): number =>
  game.stage >= 1 && item.kind === 'feature' ? RUSH_BUG_CHANCE * rushedShareOf(item, pool) : 0

export const setAutopilot = (game: Game, autopilot: boolean): Game => ({ ...game, autopilot })

/** Sim seconds after which a block the player put off writes again. */
export const blockRemind = (tuning: Tuning = LIVE_TUNING): number =>
  (BLOCK_REMIND_DAYS * CALENDAR_DAY) / tuning.calendarPace

/**
 * Why an item stops (18 "Teammates"): the first of the four waits that holds. It waits on an index
 * while its Service has a query shape with none; on a copy while the Service shares its Database
 * with another; on a Team too big to coordinate; and on a decision while the
 * Design is failing its Apdex target, when what to build first is the player's call.
 */
export const blockReason = (game: Game, item: WorkItem): BlockKind | null => {
  // A patch ticket waits on nothing but its deadline (18 "CVEs and patches"): a CVE does not care
  // that the team outgrew itself or that the Design misses its Apdex target, and "Patch now" has
  // to mean now, or the ticket blocks until it is exploited.
  if (item.kind === 'patch') return null
  const service = serviceOfItem(game, item)
  if (service.shapes > 0) return 'index'
  if (sharesDatabase(game, service)) return 'copy'
  if (membersOf(game, ownerOf(game, service)).length >= BLOCK_SIZE_AT) return 'size'
  if (game.apdex < eraOf(game).apdexTarget) return 'decision'
  return null
}

/** Approves the thing a blocked item waits for: the work moves again. */
export const approveBlock = (game: Game, id: number): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (!item || item.block._tag !== 'Blocked')
      return notAllowed('Nothing on that item waits on you.')
    return ok({
      ...game,
      backlog: game.backlog.map((entry, at) =>
        at === index && entry.block._tag === 'Blocked'
          ? { ...entry, block: blockStep(entry.block, { _tag: 'Approved' }) }
          : entry,
      ),
    })
  })

/** Later: the block stays, and the owner writes again after a calendar day. */
export const laterBlock = (game: Game, id: number, tuning: Tuning = LIVE_TUNING): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (!item || item.block._tag !== 'Blocked')
      return notAllowed('Nothing on that item waits on you.')
    return ok({
      ...game,
      backlog: game.backlog.map((entry, at) =>
        at === index && entry.block._tag === 'Blocked'
          ? {
              ...entry,
              block: blockStep(entry.block, {
                _tag: 'Later',
                remindAt: game.time + blockRemind(tuning),
              }),
            }
          : entry,
      ),
    })
  })

const answerPatch = (game: Game, id: number, answer: 'now' | 'queued'): Action =>
  withItem(game, id, (index) => {
    const item = game.backlog[index]
    if (item?.kind !== 'patch') return notAllowed('No advisory waits on that item.')
    const answered = game.backlog.map((entry, at) =>
      at === index ? { ...entry, answered: answer } : entry,
    )
    return ok({
      ...game,
      backlog:
        answer === 'now'
          ? [answered[index]!, ...answered.filter((_, at) => at !== index)]
          : answered,
    })
  })

/** Patch now: the owner's ticket goes to the top of the backlog, ahead of the product. */
export const patchNow = (game: Game, id: number): Action => answerPatch(game, id, 'now')

/** Queue the patch: the ticket stays where it is, behind the product work. */
export const queuePatch = (game: Game, id: number): Action => answerPatch(game, id, 'queued')

/**
 * Adds the missing index. Needs Query analysis to find it. A Sandbox adds it at
 * once; a Company puts the task at the top of the backlog and rushes it from the pool.
 */
export const addIndex = (game: Game, nodeId: string): Action => {
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node) return no(Refusal.Missing())
  if (node.type !== 'database') return notAllowed('Indexes live on the Database.')
  if (!has(game, 'query-analysis'))
    return no(Refusal.Locked({ what: 'Add index', research: RESEARCH['query-analysis'].name }))
  if (game.sandbox) {
    const incident = game.incident
    if (incident?.kind !== 'slow-query') return notAllowed('Every query has an index.')
    return ok({ ...game, incident: { ...incident, remaining: 0 } })
  }
  const existing = game.backlog.find((item) => item.ref === 'add-index')
  const queuedTop: Action = existing
    ? ok({ ...game, backlog: [existing, ...game.backlog.filter((item) => item !== existing)] })
    : refused(taskRefusal(game, 'add-index'), () =>
        enqueue(game, 'task', 'add-index', TASKS['add-index'].dh, true),
      )
  return Result.map(queuedTop, (next) => {
    const top = next.backlog[0]
    return top && next.devHours > 0.01 ? Result.getOrElse(rushItem(next, top.id), () => next) : next
  })
}

/** Signs an engineer for the Service's language: they join after the time to hire. */
export const hire = (game: Game, tuning: Tuning = LIVE_TUNING): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  if (game.stage < 1) return no(Refusal.TooEarly({ what: 'Hiring', era: ERAS[1]?.name ?? '' }))
  // Cash is short, so no hire (09 "Runway and running out of Cash").
  if (shortOfCash(game))
    return notAllowed('Out of Cash: no placement, upgrade, or hire until Cash is above zero.')
  const language = languageOfService(game)
  const price = signingOf(game, language)
  if (game.cash < price)
    return no(Refusal.Unaffordable({ what: 'A hire', price, currency: 'cash' }))
  const team = game.teams[0]?.id ?? 'core'
  return ok({
    ...game,
    cash: game.cash - price,
    workSeq: game.workSeq + 1,
    hires: [
      ...game.hires,
      {
        id: `e${game.workSeq + 1}`,
        team,
        language,
        phase: {
          _tag: 'Pending',
          readyAt: game.time + hireSeconds(game, language, tuning),
        },
      },
    ],
  })
}

/** Lets an engineer go: no refund, no more salary, and the rest of the team loses heart for a week. */
export const layoff = (game: Game, engineerId: string, tuning: Tuning = LIVE_TUNING): Action => {
  if (!game.engineers.some((engineer) => engineer.id === engineerId)) return no(Refusal.Missing())
  return ok({
    ...game,
    engineers: game.engineers.filter((engineer) => engineer.id !== engineerId),
    moraleUntil: game.time + moraleSeconds(tuning),
  })
}

/** Gives an engineer time off: they produce nothing for three calendar days, and come back content. */
export const giveTimeOff = (
  game: Game,
  engineerId: string,
  tuning: Tuning = LIVE_TUNING,
): Action => {
  if (!game.engineers.some((engineer) => engineer.id === engineerId)) return no(Refusal.Missing())
  const off = (TIME_OFF_DAYS * CALENDAR_DAY) / tuning.calendarPace
  return ok({
    ...game,
    engineers: game.engineers.map((engineer) =>
      engineer.id === engineerId
        ? { ...engineer, offUntil: game.time + off, mood: MOOD_START, unhappyAt: 0 }
        : engineer,
    ),
  })
}

/** Raises an engineer to the Era's going rate: they stay, and the payroll grows with them. */
export const raiseSalary = (game: Game, engineerId: string): Action => {
  const engineer = game.engineers.find((entry) => entry.id === engineerId)
  if (!engineer) return no(Refusal.Missing())
  if (paidIndex(game, engineer) >= eraOf(game).salaryIndex)
    return notAllowed('They already earn the Era’s rate.')
  return ok({
    ...game,
    engineers: game.engineers.map((entry) =>
      entry.id === engineerId
        ? { ...entry, salary: eraOf(game).salaryIndex, mood: MOOD_START, unhappyAt: 0 }
        : entry,
    ),
  })
}

/** Accepts a resignation: the engineer leaves, and the payroll ends without a layoff's morale hit. */
export const acceptResignation = (game: Game, engineerId: string): Action => {
  if (!game.engineers.some((engineer) => engineer.id === engineerId)) return no(Refusal.Missing())
  return ok({
    ...game,
    engineers: game.engineers.filter((engineer) => engineer.id !== engineerId),
  })
}

export const createTeam = (game: Game): Action => {
  if (game.sandbox) return notAllowed(SANDBOX)
  if (game.stage < 1)
    return no(Refusal.TooEarly({ what: 'A second team', era: ERAS[1]?.name ?? '' }))
  if (game.teams.length >= MAX_TEAMS) return notAllowed(`At most ${MAX_TEAMS} teams.`)
  const id = `t${game.workSeq + 1}`
  return ok({
    ...game,
    workSeq: game.workSeq + 1,
    teams: [
      ...game.teams,
      {
        id,
        name: `Team ${game.teams.length + 1}`,
        kind: 'product',
        policy: 'balanced',
        previous: 'balanced',
        since: game.time,
      },
    ],
  })
}

/** Removes a team: its engineers move to the first team. The founder's team stays. */
export const removeTeam = (game: Game, teamId: string): Action => {
  const first = game.teams[0]
  if (!first || first.id === teamId) return notAllowed('The founder’s team stays.')
  if (!game.teams.some((team) => team.id === teamId)) return no(Refusal.Missing())
  return ok({
    ...game,
    teams: game.teams.filter((team) => team.id !== teamId),
    engineers: game.engineers.map((engineer) =>
      engineer.team === teamId ? { ...engineer, team: first.id } : engineer,
    ),
    hires: game.hires.map((entry) =>
      entry.team === teamId ? { ...entry, team: first.id } : entry,
    ),
  })
}

export const assign = (game: Game, engineerId: string, teamId: string): Action => {
  if (!game.teams.some((team) => team.id === teamId)) return no(Refusal.Missing())
  if (!game.engineers.some((engineer) => engineer.id === engineerId)) return no(Refusal.Missing())
  return ok({
    ...game,
    engineers: game.engineers.map((engineer) =>
      engineer.id === engineerId ? { ...engineer, team: teamId } : engineer,
    ),
  })
}

/**
 * Makes a team a product team or a Platform team (08 "Teams"). A Platform team
 * builds no backlog: it runs the Clusters and halves deploy time. From Series A;
 * the founder's team stays a product team.
 */
export const setTeamKind = (game: Game, teamId: string, kind: TeamKind): Action => {
  const team = game.teams.find((entry) => entry.id === teamId)
  if (!team) return no(Refusal.Missing())
  if (team.kind === kind) return ok(game)
  if (kind === 'platform') {
    if (game.stage < PLATFORM_STAGE)
      return no(
        Refusal.TooEarly({ what: 'A Platform team', era: ERAS[PLATFORM_STAGE]?.name ?? '' }),
      )
    if (!has(game, 'platform-team'))
      return no(
        Refusal.Locked({ what: 'A Platform team', research: RESEARCH['platform-team'].name }),
      )
    if (game.teams[0]?.id === teamId) return notAllowed('The founder’s team builds the product.')
  }
  if (kind === 'sre') {
    if (!has(game, 'sre-team'))
      return no(Refusal.Locked({ what: 'An SRE team', research: RESEARCH['sre-team'].name }))
    if (game.teams[0]?.id === teamId) return notAllowed('The founder’s team builds the product.')
  }
  if (kind === 'data') {
    if (!has(game, 'data-team'))
      return no(Refusal.Locked({ what: 'A Data team', research: RESEARCH['data-team'].name }))
    if (game.teams[0]?.id === teamId) return notAllowed('The founder’s team builds the product.')
  }
  if (kind === 'security') {
    if (!has(game, 'security-team'))
      return no(
        Refusal.Locked({ what: 'A Security team', research: RESEARCH['security-team'].name }),
      )
    if (game.teams[0]?.id === teamId) return notAllowed('The founder’s team builds the product.')
  }
  return ok({
    ...game,
    teams: game.teams.map((entry) => (entry.id === teamId ? { ...entry, kind } : entry)),
  })
}

/** Changes a team's policy. The old one holds for a calendar day while the team adjusts. */
export const setTeamPolicy = (
  game: Game,
  teamId: string,
  policy: PolicyId,
  tuning: Tuning = LIVE_TUNING,
): Action => {
  const team = game.teams.find((entry) => entry.id === teamId)
  if (!team) return no(Refusal.Missing())
  if (team.policy === policy) return ok(game)
  const now = policyNow(game, team, tuning).id
  return ok({
    ...game,
    teams: game.teams.map((entry) =>
      entry.id === teamId ? { ...entry, policy, previous: now, since: game.time } : entry,
    ),
  })
}

/**
 * A runtime or framework choice on an App Server. A Sandbox swaps it at once.
 * A Company starts a migration of its Service: Dev Hours, then the strangler.
 */
export const changeStack = (
  game: Game,
  nodeId: string,
  choice: Readonly<{ runtime?: RuntimeId; framework?: FrameworkId }>,
): Action => {
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node) return no(Refusal.Missing())
  if (game.sandbox || node.type !== 'server')
    return choice.runtime
      ? setRuntime(game, nodeId, choice.runtime)
      : setFramework(game, nodeId, choice.framework ?? node.framework)
  const target = targetOf(node, choice)
  const migration = serviceOf(game).migration
  // Choosing the Stack a migration already moves to, or the one it left, changes nothing.
  if (
    migration &&
    ((target.runtime === migration.runtime && target.framework === migration.framework) ||
      (target.runtime === node.runtime && target.framework === node.framework))
  )
    return ok(game)
  return startMigration(game, target)
}

export { cancelMigration, shiftMigration }

/**
 * Ships a batch: each Feature becomes live for every user with no adoption yet, at the end of the
 * live order, so the last deploy reads last.
 */
const deployed = (
  features: Game['features'],
  batch: ReadonlyArray<FeatureId>,
): Game['features'] => {
  const rest = Object.entries(features).filter(([id]) => !batch.includes(id as FeatureId))
  const live = batch.map((id) => {
    const phase = features[id]
    return [id, featureStep(phase ?? { _tag: 'Awaiting' }, { _tag: 'Deployed' })] as const
  })
  return Object.fromEntries([...rest, ...live])
}

/** Rolls a batch back: each waits for the next deploy again, at the front of the queue. */
const rolledBack = (
  features: Game['features'],
  batch: ReadonlyArray<FeatureId>,
): Game['features'] => {
  const rest = Object.entries(features).filter(([id]) => !batch.includes(id as FeatureId))
  const waiting = batch.map((id) => {
    const phase = features[id]
    return [id, featureStep(phase ?? { _tag: 'Awaiting' }, { _tag: 'RolledBack' })] as const
  })
  return Object.fromEntries([...waiting, ...rest])
}

/** Rolls back a bad deploy: its Features wait for the next deploy again. Needs Continuous delivery. */
export const rollback = (game: Game): Action => {
  if (game.incident?.kind !== 'bad-deploy') return notAllowed('No deploy needs rolling back.')
  if (!has(game, 'ci')) return no(Refusal.Locked({ what: 'Roll back', research: RESEARCH.ci.name }))
  const service = serviceOfId(game, game.incident.service ?? undefined)
  const batch = service.lastDeploy
  const rolled: Game = {
    ...game,
    features: rolledBack(game.features, batch),
    incident: { ...game.incident, remaining: 0 },
  }
  return ok(withServiceId(rolled, service.id, { lastDeploy: [] }))
}

type Advance = Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }>

/** The next Feature the autopilot builds: the first in catalog order the Company can start. */
export const nextFeature = (game: Game): FeatureId | undefined =>
  FEATURE_IDS.find((id) => featureRefusal(game, id) === null)

/** Idle teams pick work, and a built migration step shifts. */
const autopilot = (game: Game, events: Array<StepEvent>): Game => {
  let next = game
  const migration = serviceOf(next).migration
  if (migration && isReady(migration)) {
    const shifted = shiftMigration(next)
    if (Result.isSuccess(shifted)) {
      next = shifted.success
      events.push(StepEvent.MigrationShifted({ step: stepOf(migration) + 1 }))
    }
  }
  while (next.backlog.length < next.teams.length) {
    const feature = nextFeature(next)
    if (feature) {
      next = enqueue(next, 'feature', feature, featureHoursOf(next, feature), false, {
        service: serviceOfFeature(next, feature).id,
      })
      continue
    }
    if (serviceOf(next).debt >= AUTO_REFACTOR && !queued(next, 'refactor')) {
      next = enqueue(next, 'task', 'refactor', TASKS.refactor.dh)
      continue
    }
    break
  }
  return next
}

const clampMood = (mood: number): number => Math.max(0, Math.min(MOOD_START, mood))

/**
 * What a Step does to the Team's people: a new incident pages the Team that owns the Service it
 * hit, a spent error budget is a long freeze, and an engineer paid below the Era's rate carries a
 * pay gap. Each wears mood down; time off and a raise restore it. An engineer whose mood falls to
 * the threshold writes once, and a later recovery lets them write again.
 */
export const advanceMorale = (
  game: Game,
  before: Game,
  seconds: number,
  tuning: Tuning = LIVE_TUNING,
  events: Array<StepEvent> = [],
): Game => {
  if (game.sandbox || game.engineers.length === 0) return game
  const days = (seconds * tuning.calendarPace) / CALENDAR_DAY
  const freeze = budgetVelocity(game) < 1 ? days / FREEZE_MOOD_DAYS : 0
  const fresh =
    game.incident !== null && game.incident.startedAt !== (before.incident?.startedAt ?? -1)
  const pagedId = fresh ? ownerOf(game, blastService(game)).id : null
  const engineers = game.engineers.map((engineer) => {
    const page = pagedId !== null && engineer.team === pagedId ? PAGE_MOOD : 0
    const wear = freeze + payGapOf(game, engineer) * (days / PAY_GAP_MOOD_DAYS) + page
    const mood = clampMood(engineer.mood - wear)
    const unhappyAt =
      mood >= CONTENT_MOOD
        ? 0
        : engineer.unhappyAt === 0 && mood <= UNHAPPY_MOOD
          ? game.time
          : engineer.unhappyAt
    if (unhappyAt !== engineer.unhappyAt && unhappyAt !== 0)
      events.push(StepEvent.EngineerUnhappy({ engineerId: engineer.id }))
    return { ...engineer, mood, pages: engineer.pages + (page > 0 ? 1 : 0), unhappyAt }
  })
  return { ...game, engineers }
}

/** What a finished item does, including the tech debt its Rushes added (08 "Tech debt"). */
const complete = (game: Game, item: WorkItem, tuning: Tuning): Game => {
  const done = completed(game, item, tuning)
  if (item.cost <= 0) return done
  const rushed = Math.min(1, (item.rushed ?? 0) / item.cost)
  if (rushed <= 0) return done
  // A rushed Feature carries its share into the deploy that ships it, and keeps it through a rollback.
  const withRush: Game =
    item.kind === 'feature'
      ? { ...done, rushedFeatures: { ...done.rushedFeatures, [item.ref]: rushed } }
      : done
  const service = serviceOfItem(withRush, item)
  return withServiceId(withRush, service.id, {
    debt: Math.min(1, service.debt + RUSH_DEBT * rushed),
  })
}

const completed = (game: Game, item: WorkItem, tuning: Tuning): Game => {
  // A patch, a split, and a spike have no effect to apply: finishing them is the effect.
  if (item.kind === 'spike' || item.kind === 'patch' || item.kind === 'split') return game
  if (item.kind === 'move') return moved(game, item, tuning)
  const service = serviceOfItem(game, item)
  if (item.kind === 'migration') {
    const migration = serviceOf(game).migration
    return migration ? withService(game, { migration: trancheBuilt(migration) }) : game
  }
  if (item.kind === 'feature') {
    const id = item.ref as FeatureId
    const team = game.teams[0]
    const policy = team ? policyNow(game, team) : POLICIES.balanced
    const grows =
      (policy.debt + (stackOf(game).framework === 'none' ? UNSTRUCTURED_DEBT : 0)) *
      debtGrowthOf(game)
    const phase = game.features[id] ?? { _tag: 'Awaiting' as const }
    return withServiceId(
      { ...game, features: { ...game.features, [id]: featureStep(phase, { _tag: 'Built' }) } },
      service.id,
      {
        debt: Math.min(1, service.debt + grows),
        codebase: service.codebase + FEATURES[id].dh * KLOC_PER_DH,
      },
    )
  }
  const id = item.ref as TaskId
  // A task shipped during an incident is a hotfix: it adds debt.
  const hotfix = game.incident !== null && id !== 'refactor' ? HOTFIX_DEBT : 0
  const after = withService(game, { debt: Math.min(1, service.debt + hotfix) })
  switch (id) {
    case 'add-index':
      return withService(
        after.incident?.kind === 'slow-query'
          ? { ...after, incident: { ...after.incident, remaining: 0 } }
          : after,
        // The index covers a query shape, and every write pays to keep it (07 "Indexes").
        { shapes: Math.max(0, service.shapes - 1), indexes: service.indexes + 1 },
      )
    case 'fix-leak': {
      const leak = after.incident?.kind === 'leak' ? after.incident : null
      const cleaned: Game = leak
        ? {
            ...after,
            nodes: after.nodes.map((node) =>
              node.id === leak.nodeId ? { ...node, leak: 0 } : node,
            ),
            incident: { ...leak, remaining: 0 },
          }
        : after
      return withService(cleaned, { fixes: [...service.fixes, 'fix-leak'] })
    }
    case 'eager-loading':
    case 'session-state':
    case 'idempotency-keys':
    case 'off-loop':
    case 'graceful-shutdown':
    case 'health-check':
      return withService(after, { fixes: [...service.fixes, id] })
    case 'timeouts-retries':
      // Every Link out of an App Server or Worker gets a short timeout and backoff retries.
      return {
        ...after,
        links: after.links.map((link) =>
          callerOf(after, link)
            ? { ...link, timeout: Math.min(link.timeout, TASK_LINK_TIMEOUT), retries: 'backoff' }
            : link,
        ),
      }
    case 'load-test':
      return { ...after, loadTestUntil: after.time + days(LOAD_TEST_DAYS, tuning) }
    case 'refactor':
      return withService(after, { debt: Math.max(0, service.debt - item.cost * REFACTOR_PER_DH) })
    case 'fix-bugs':
      return bugsFixed(after)
    case 'upgrade-cluster': {
      const nodes = after.nodes.map((node) =>
        node.type === 'cluster' ? { ...node, upgradedAt: after.time } : node,
      )
      const incident =
        after.incident?.kind === 'cluster-upgrade'
          ? { ...after.incident, remaining: 0 }
          : after.incident
      return { ...after, nodes, incident }
    }
    case 'runbook': {
      // The incident kind the item was written for now resolves by itself (11 "Runbooks").
      const kind = item.target as IncidentId | undefined
      return kind && INCIDENT_IDS.includes(kind) && !after.runbooks.includes(kind)
        ? { ...after, runbooks: [...after.runbooks, kind] }
        : after
    }
  }
}

/**
 * Ships what one Service's own deploy slot has waiting. Each Service deploys on its own timer and
 * rolls its own bad deploy, from its own owner's policy and its own tech debt (08 "Services": "every
 * Service still shares the one deploy pipeline", built now as one shared cadence and strategy, not
 * one shared slot). Nothing ships on top of a bad deploy already running.
 */
const deployService = (
  game: Game,
  ledger: Ledger,
  tuning: Tuning,
  events: Array<StepEvent>,
  offline: boolean,
  service: Service,
  hotUpgrade: boolean,
): Game => {
  if (game.time < service.nextDeployAt) return game
  const after: Game = withServiceId(game, service.id, {
    nextDeployAt:
      game.time +
      deployEvery(game, tuning) +
      (hotUpgrade ? ELIXIR_HOT_UPGRADE_DEV_HOURS * SIM_SECONDS_PER_DEV_HOUR : 0),
  })
  if (game.incident?.kind === 'bad-deploy') return after
  const batch = awaitingFeatures(game).filter((id) => serviceOfFeature(game, id).id === service.id)
  if (batch.length === 0) return after
  // The chance counts the bad-deploy risk of every rushed Feature in this batch (08 "Rush").
  const chance = offline ? 0 : nextBadDeployChance(after, tuning, service)
  let next: Game = {
    ...after,
    features: deployed(after.features, batch),
    deploys: after.deploys + 1,
  }
  next = withServiceId(next, service.id, {
    lastDeploy: batch,
    shapes: service.shapes + batch.reduce((sum, id) => sum + FEATURES[id].shapes, 0),
    // A new Feature can leak again.
    fixes: service.fixes.filter((fix) => fix !== 'fix-leak'),
  })
  // A release swaps the code. PHP and Elixir reload it in place; every other runtime restarts its
  // App Servers cold (06 "Runtime behaviors", "Hot code reload").
  next = {
    ...next,
    nodes: next.nodes.map((node) =>
      node.type === 'server' &&
      node.service._tag !== 'Shut' &&
      RUNTIMES[node.runtime].hotReload !== true &&
      node.life._tag !== 'Restarting'
        ? // Graceful shutdown finishes in-flight requests: the new copies start cold, never down.
          fixed(next, 'graceful-shutdown')
          ? { ...node, life: warming(0) }
          : { ...node, ...restarted(node) }
        : node.type === 'cdn' && node.service._tag !== 'Shut'
          ? // A CDN with Purge on deploy clears its cache and refills it from the origin; without it
            // the edge keeps serving the last deploy's pages until their TTL passes (05 "CDN").
            node.purge
            ? { ...node, life: warming(0) }
            : { ...node, staleUntil: next.time + node.ttl }
          : node,
    ),
  }
  // No incident starts while the player is away (04 "Offline progress").
  let bad = false
  if (chance > 0) {
    const [roll, seed] = nextRandom(next.seed)
    next = { ...next, seed }
    const started =
      roll < chance ? startIncident(next, ledger, 'bad-deploy', roll, undefined, service.id) : null
    if (started) {
      next = { ...started.game, badDeploys: next.badDeploys + 1 }
      bad = true
      events.push(StepEvent.IncidentStarted({ incident: started.incident }))
    }
  }
  events.push(StepEvent.Deployed({ features: batch, bad }))
  return next
}

/** Ships what every Service's own deploy slot has waiting, in Service order. */
const deploy = (
  game: Game,
  ledger: Ledger,
  tuning: Tuning,
  events: Array<StepEvent>,
  offline: boolean,
): Game => {
  // A hot upgrade costs Elixir Dev Hours per release (06 "Runtime behaviors"): the next slot is
  // that many Dev Hours later.
  const hotUpgrade = game.nodes.some(
    (node) =>
      node.type === 'server' &&
      node.service._tag !== 'Shut' &&
      RUNTIMES[node.runtime].language === 'elixir' &&
      RUNTIMES[node.runtime].hotReload === true,
  )
  return game.services.reduce(
    (current, service) =>
      deployService(
        current,
        ledger,
        tuning,
        events,
        offline,
        current.services.find((entry) => entry.id === service.id) ?? service,
        hotUpgrade,
      ),
    game,
  )
}

/**
 * Whether a Team can work on an item: a Spike waits for its Study, and a blocked item for the
 * player. A patch never waits, even when a save from before that rule carries its block.
 */
export const takeable = (game: Game, item: WorkItem): boolean =>
  (item.kind !== 'spike' || game.studies[0]?.id === item.ref) &&
  (item.kind === 'patch' || item.block._tag !== 'Blocked')

/** A Product team with someone on it builds the backlog; the first team has the founder. */
const builds = (game: Game, team: Team, index: number): boolean =>
  team.kind === 'product' && (index === 0 || membersOf(game, team).length > 0)

const nextItem = <Item extends WorkItem>(
  game: Game,
  backlog: ReadonlyArray<Item>,
  team: Team,
  taken: ReadonlySet<number>,
): Item | undefined =>
  backlog.find(
    (entry) => !taken.has(entry.id) && takeable(game, entry) && worksOn(game, team, entry),
  )

/** The item each team builds now, by team id: the same pick `advanceTeam` makes. */
export const assignments = (game: Game): ReadonlyMap<string, WorkItem> => {
  const taken = new Set<number>()
  const assigned = new Map<string, WorkItem>()
  game.teams.forEach((team, index) => {
    if (!builds(game, team, index)) return
    const item = nextItem(game, game.backlog, team, taken)
    if (!item) return
    taken.add(item.id)
    assigned.set(team.id, item)
  })
  return assigned
}

/**
 * Advances the Team by some seconds: hires join, idle teams pick work, Dev
 * Hours build the backlog, finished items take effect, and deploys ship.
 */
export const advanceTeam = (
  game: Game,
  ledger: Ledger,
  seconds: number,
  tuning: Tuning = LIVE_TUNING,
  offline = false,
): Advance => {
  if (game.sandbox) return { game, events: [] }
  const events: Array<StepEvent> = []
  let next = game

  const phases = next.hires.map((hire) => ({
    hire,
    phase: hireStep(hire.phase, { _tag: 'Joined', at: next.time }),
  }))
  const joined = phases.filter((entry) => entry.phase._tag === 'Joined')
  if (joined.length > 0) {
    const teams = new Set(next.teams.map((team) => team.id))
    next = {
      ...next,
      hires: phases
        .filter((entry) => entry.phase._tag !== 'Joined')
        .map((entry) => ({ ...entry.hire, phase: entry.phase })),
      engineers: [
        ...next.engineers,
        ...joined.map((entry) => ({
          id: entry.hire.id,
          team: teams.has(entry.hire.team) ? entry.hire.team : (next.teams[0]?.id ?? 'core'),
          language: entry.hire.language,
          hiredAt: entry.hire.phase._tag === 'Pending' ? entry.hire.phase.readyAt : next.time,
          ...NEW_ENGINEER,
          // They sign at the Era's going rate; later Eras leave them behind until a raise (18).
          salary: eraOf(next).salaryIndex,
        })),
      ],
    }
    for (const entry of joined) events.push(StepEvent.Hired({ engineerId: entry.hire.id }))
  }

  if (next.autopilot) next = autopilot(next, events)

  // Each team builds the first item no team ahead of it has, on a Service it owns.
  const migrating = serviceOf(next).migration !== null
  const backlog = next.backlog.map((item) => ({ ...item }))
  const taken = new Set<number>()
  let pool = next.devHours
  let paydown = 0
  // A block the player put off writes again (18 "Blocked"): Later is not a no.
  for (const item of backlog) {
    const block = item.block
    if (block._tag !== 'Blocked' || block.remindAt > next.time) continue
    item.block = blockStep(block, { _tag: 'Later', remindAt: next.time + blockRemind(tuning) })
    events.push(
      StepEvent.Blocked({
        item: { ...item },
        reason: block.reason,
        engineerId: block.owner,
      }),
    )
  }
  for (const [index, output] of teamOutputs(next, ledger, tuning).entries()) {
    // A Platform, SRE or Data team runs the system: its Dev Hours build no backlog. An empty
    // team builds nothing, so it holds no item another team could take.
    if (!builds(next, output.team, index)) continue
    const made = output.devHoursPerSecond * seconds
    const kept = made * policyNow(next, output.team, tuning).paydown
    paydown += kept
    const item = nextItem(next, backlog, output.team, taken)
    if (!item) {
      pool += made - kept
      continue
    }
    // An item that has not started can stop on a decision, an index, a copy or a Team too big to
    // coordinate (18). The roll happens once: a block marks the item, and work that starts leaves
    // `spent` above zero.
    if (item.block._tag === 'Free' && item.spent <= 0 && item.kind !== 'spike') {
      const reason = blockReason(next, item)
      const owner = memberOf(next, ownerOf(next, serviceOfItem(next, item)).id, item.id)
      if (reason !== null && owner) {
        item.block = {
          _tag: 'Blocked',
          reason,
          owner: owner.id,
          at: next.time,
          remindAt: next.time + blockRemind(tuning),
        }
        events.push(StepEvent.Blocked({ item: { ...item }, reason, engineerId: owner.id }))
        pool += made - kept
        continue
      }
    }
    taken.add(item.id)
    const speed = item.kind === 'feature' && migrating ? MIGRATION_FEATURE_SPEED : 1
    const put = Math.min(item.cost - item.spent, (made - kept) * speed)
    item.spent += put
    pool += made - kept - put / speed
  }
  const finished = backlog.filter((item) => item.spent >= item.cost - 1e-9)
  const service = serviceOf(next)
  next = withService(
    {
      ...next,
      devHours: pool,
      backlog: backlog.filter((item) => item.spent < item.cost - 1e-9),
    },
    { debt: Math.max(0, service.debt - paydown * REFACTOR_PER_DH) },
  )
  for (const item of finished) {
    next = complete(next, item, tuning)
    events.push(StepEvent.WorkFinished({ item }))
  }

  // A Platform team keeps every Cluster on a supported version.
  if (platformStaffed(next) && next.nodes.some((node) => node.type === 'cluster'))
    next = {
      ...next,
      nodes: next.nodes.map((node) =>
        node.type === 'cluster' && node.upgradedAt !== next.time
          ? { ...node, upgradedAt: next.time }
          : node,
      ),
    }

  next = finishEngineChange(next)
  next = finishReshard(next)
  next = deploy(next, ledger, tuning, events, offline)
  return { game: next, events }
}
