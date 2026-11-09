import { Option, Result, Schema } from 'effect'
import * as Actions from './actions.ts'
import { COMPONENTS, HOME_REGION } from './catalog.ts'
import { decodeText, encodeText } from './codec.ts'
import { link } from './company.ts'
import {
  LINK_SETTINGS,
  NODE_SETTINGS,
  PlaybookNode,
  SHARED,
  STACK_SETTINGS,
  pick,
} from './playbook.ts'
import { FixId, GameLink, GameNode, Region, type Game } from './state.ts'
import { openRegions } from './regions.ts'
import { serviceOf } from './team.ts'
import { setFix } from './work.ts'

/** A Design: every Node the player can change, by its board id, and every Link. */
export const Design = Schema.Struct({
  nodes: Schema.Array(PlaybookNode),
  links: Schema.Array(
    Schema.Struct({
      from: Schema.String,
      to: Schema.String,
      settings: Schema.Record(Schema.String, Schema.Unknown),
    }),
  ),
  regions: Schema.optionalKey(Schema.Array(Region)),
  /** Fixes in the code, on a Challenge whose fixes cost Dev Hours. */
  fixes: Schema.optionalKey(Schema.Array(FixId)),
})
export type Design = typeof Design.Type

/** What ends an incident by hand: each one the incident panel offers. */
export const RESPONSES = [
  'disable-rule',
  'fence-leader',
  'roll-back-routes',
  'roll-back-config',
  'cancel-report',
  'expand-volume',
  'renew-certificate',
  'delete-message',
  'cancel-migration',
  'pin-and-redeploy',
  'restore-backup',
  'restart-clocks',
  'switch-provider',
  'fail-over-region',
  'fail-over-zone',
  'move-kind',
] as const
export type Response = (typeof RESPONSES)[number]

/** What the player may do while a Challenge runs: answer failures and incidents, and resize. */
export const ReplayAction = Schema.TaggedUnion({
  Restart: { node: Schema.String },
  Replace: { node: Schema.String },
  FailOver: { node: Schema.String },
  Throttle: { node: Schema.String },
  Resize: { node: Schema.String, direction: Schema.Literals([1, -1]) },
  Respond: { response: Schema.Literals(RESPONSES) },
})
export type ReplayAction = typeof ReplayAction.Type

export const Replay = Schema.Struct({
  v: Schema.Literal(1),
  challenge: Schema.String,
  simVersion: Schema.String,
  design: Design,
  actions: Schema.Array(Schema.Struct({ step: Schema.Finite, action: ReplayAction })),
})
export type Replay = typeof Replay.Type

/** Abuse limits the server checks before running anything. */
export const MAX_REPLAY_CHARS = 65_536
export const MAX_DESIGN_NODES = 80
export const MAX_REPLAY_ACTIONS = 400

const changeable = (node: GameNode): boolean =>
  !COMPONENTS[node.type].fixed && !SHARED.includes(node.type)

/** A Design keeps where each Node runs, which a Playbook leaves to the board it is placed on. */
const PLACE_SETTINGS = ['zone', 'region'] as const
const SETTINGS = [...STACK_SETTINGS, ...NODE_SETTINGS, ...PLACE_SETTINGS]

export const designOf = (game: Game): Design => {
  const regions = openRegions(game).filter((region) => region !== HOME_REGION)
  return {
    nodes: game.nodes.filter(changeable).map((node) => ({
      key: node.id,
      type: node.type,
      dx: node.x,
      dy: node.y,
      settings: pick(node, SETTINGS),
    })),
    links: game.links.map((entry) => ({
      from: entry.from,
      to: entry.to,
      settings: pick(entry, LINK_SETTINGS),
    })),
    ...(regions.length > 0 ? { regions } : {}),
    ...(game.scenario?.tasks ? { fixes: serviceOf(game).fixes } : {}),
  }
}

type Built = Result.Result<Game, string>

const decodeNode = Schema.decodeUnknownOption(GameNode)
const decodeLink = Schema.decodeUnknownOption(GameLink)

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

type Setter = (game: Game, id: string, node: GameNode) => Actions.Action

/** Each setting goes through its action, so a value the board refuses is refused here too. */
const SETTERS: ReadonlyArray<readonly [ReadonlyArray<keyof GameNode>, Setter]> = [
  [['workers'], (game, id, node) => Actions.setWorkers(game, id, node.workers)],
  [['sampleRate'], (game, id, node) => Actions.setSample(game, id, node.sampleRate)],
  [['retention'], (game, id, node) => Actions.setRetention(game, id, node.retention)],
  [['compress'], (game, id, node) => Actions.setCompression(game, id, node.compress)],
  [['recycle'], (game, id, node) => Actions.setRecycle(game, id, node.recycle)],
  [['policy'], (game, id, node) => Actions.setPolicy(game, id, node.policy)],
  [
    ['checkEvery', 'deepCheck'],
    (game, id, node) =>
      Actions.setHealthCheck(game, id, { checkEvery: node.checkEvery, deepCheck: node.deepCheck }),
  ],
  [['ttl'], (game, id, node) => Actions.setTtl(game, id, node.ttl)],
  [['engine'], (game, id, node) => Actions.setCacheEngine(game, id, node.engine)],
  [['dbEngine'], (game, id, node) => Actions.setDbEngine(game, id, node.dbEngine)],
  [['iops'], (game, id, node) => Actions.setStorageIops(game, id, node.iops)],
  [['shards'], (game, id, node) => Actions.setShards(game, id, node.shards)],
  [['topology'], (game, id, node) => Actions.setTopology(game, id, node.topology)],
  [['storageClass'], (game, id, node) => Actions.setStorageClass(game, id, node.storageClass)],
  [['keep'], (game, id, node) => Actions.setDbRetention(game, id, node.keep)],
  [['lifecycle'], (game, id, node) => Actions.setLifecycle(game, id, node.lifecycle)],
  [['cacheStrategy'], (game, id, node) => Actions.setCacheStrategy(game, id, node.cacheStrategy)],
  [['refresh'], (game, id, node) => Actions.setSearchRefresh(game, id, node.refresh)],
  [['sticky'], (game, id, node) => Actions.setSticky(game, id, node.sticky)],
  [['slowStart'], (game, id, node) => Actions.setSlowStart(game, id, node.slowStart)],
  [
    ['purge', 'cacheKey'],
    (game, id, node) =>
      Actions.setCdnOptions(game, id, { purge: node.purge, cacheKey: node.cacheKey }),
  ],
  [['shardKey'], (game, id, node) => Actions.setShardKey(game, id, node.shardKey)],
  [['sync'], (game, id, node) => Actions.setSync(game, id, node.sync)],
  [
    ['searchVariant', 'searchShards', 'searchReplicas', 'heap'],
    (game, id, node) =>
      Actions.setSearchOptions(game, id, {
        searchVariant: node.searchVariant,
        searchShards: node.searchShards,
        searchReplicas: node.searchReplicas,
        heap: node.heap,
      }),
  ],
  [['storeVariant'], (game, id, node) => Actions.setStoreVariant(game, id, node.storeVariant)],
  [['pm'], (game, id, node) => Actions.setPm(game, id, node.pm)],
  [['mode'], (game, id, node) => Actions.setPoolerMode(game, id, node.mode)],
  [['dlq'], (game, id, node) => Actions.setDlq(game, id, node.dlq)],
  [['attempts'], (game, id, node) => Actions.setAttempts(game, id, node.attempts)],
  [['maxLength'], (game, id, node) => Actions.setMaxLength(game, id, node.maxLength)],
  [['prefetch'], (game, id, node) => Actions.setPrefetch(game, id, node.prefetch)],
  [
    ['coalesce', 'warming', 'earlyExpiry', 'swr'],
    (game, id, node) =>
      Actions.setCacheGuard(game, id, {
        coalesce: node.coalesce,
        warming: node.warming,
        earlyExpiry: node.earlyExpiry,
        swr: node.swr,
      }),
  ],
  [['paranoia'], (game, id, node) => Actions.setParanoia(game, id, node.paranoia)],
  [
    ['standby', 'standbySync'],
    (game, id, node) => Actions.setStandby(game, id, node.standby, node.standbySync),
  ],
  [
    ['signal', 'target', 'minCopies', 'maxCopies'],
    (game, id, node) =>
      Actions.setAutoscaler(game, id, {
        signal: node.signal,
        target: node.target,
        minCopies: node.minCopies,
        maxCopies: node.maxCopies,
      }),
  ],
  [['gpu'], (game, id, node) => Actions.setGpuType(game, id, node.gpu)],
  [['gpuModel'], (game, id, node) => Actions.setGpuModel(game, id, node.gpuModel)],
  [['collector'], (game, id, node) => Actions.setCollector(game, id, node.collector)],
  [['gogc'], (game, id, node) => Actions.setGogc(game, id, node.gogc)],
  [['shed'], (game, id, node) => Actions.setShed(game, id, node.shed)],
  [['ryw'], (game, id, node) => Actions.setRyw(game, id, node.ryw)],
  [['n', 'r', 'w'], (game, id, node) => Actions.setQuorum(game, id, node.n, node.r, node.w)],
  [['spread'], (game, id, node) => Actions.setSpread(game, id, node.spread)],
  [['backup'], (game, id, node) => Actions.setBackup(game, id, node.backup)],
  [['fanout'], (game, id, node) => Actions.setFanout(game, id, node.fanout)],
  [['split'], (game, id, node) => Actions.setSplit(game, id, node.split)],
  [['pricing'], (game, id, node) => Actions.setPricing(game, id, node.pricing)],
  [['rateLimit'], (game, id, node) => Actions.setRateLimit(game, id, node.rateLimit)],
  [
    ['authEdge', 'merge'],
    (game, id, node) =>
      Actions.setGatewayOptions(game, id, { authEdge: node.authEdge, merge: node.merge }),
  ],
  [['strategy'], (game, id, node) => Actions.setDeployStrategy(game, id, node.strategy)],
  [
    ['presence', 'backoff', 'clustering'],
    (game, id, node) =>
      Actions.setHubOptions(game, id, {
        presence: node.presence,
        backoff: node.backoff,
        clustering: node.clustering,
      }),
  ],
]

const nodeIn = (game: Game, id: string): GameNode | undefined =>
  game.nodes.find((entry) => entry.id === id)

/** Sets a Node's Stack and settings. A refused setting stays as it was, as on the board. */
const configure = (game: Game, id: string, settings: Record<string, unknown>): Built => {
  const start = nodeIn(game, id)
  if (!start) return Result.fail('A Node of the Design is missing.')
  const wanted = decodeNode({ ...start, ...pick(settings, SETTINGS) })
  if (Option.isNone(wanted)) return Result.fail('A Node of the Design has a bad setting.')
  const target = wanted.value
  let next = game
  const attempt = (action: Actions.Action) => {
    if (Result.isSuccess(action)) next = action.success
  }
  if (target.region !== start.region) attempt(Actions.setRegion(next, id, target.region))
  if (target.zone !== nodeIn(next, id)?.zone) attempt(Actions.setZone(next, id, target.zone))
  if (target.family !== start.family) attempt(Actions.setFamily(next, id, target.family))
  for (let guard = 0; guard < 16; guard += 1) {
    const size = nodeIn(next, id)?.size ?? target.size
    if (size === target.size) break
    const resized = Actions.resize(next, id, size < target.size ? 1 : -1)
    if (Result.isFailure(resized) || nodeIn(resized.success, id)?.size === size) break
    next = resized.success
  }
  if (target.runtime !== nodeIn(next, id)?.runtime)
    attempt(Actions.setRuntime(next, id, target.runtime))
  if (target.framework !== nodeIn(next, id)?.framework)
    attempt(Actions.setFramework(next, id, target.framework))
  for (const [keys, set] of SETTERS) {
    const current = nodeIn(next, id)
    if (current && keys.some((key) => !same(current[key], target[key])))
      attempt(set(next, id, target))
  }
  return Result.succeed(next)
}

/**
 * Applies a Design to a Challenge's start. Start Nodes the Design leaves out
 * are sold; the others keep their state and take the Design's settings. New
 * Nodes are placed, and every Link is made again in order. Placing or linking
 * what the board would refuse fails the Design.
 */
export const applyDesign = (start: Game, design: Design): Built => {
  if (design.nodes.length > MAX_DESIGN_NODES) return Result.fail('The Design has too many Nodes.')
  const keys = new Set(design.nodes.map((entry) => entry.key))
  if (keys.size !== design.nodes.length) return Result.fail('The Design repeats a Node.')
  let game: Game = start
  // A start may open regions already; the Design opens the rest.
  for (const region of (design.regions ?? []).filter(
    (open) => !openRegions(start).includes(open),
  )) {
    const opened = Actions.openRegion(game, region)
    if (Result.isFailure(opened)) return Result.fail(Actions.describeRefusal(opened.failure))
    game = opened.success
  }
  for (const fix of design.fixes ?? []) {
    const fixed = setFix(game, fix, true)
    if (Result.isFailure(fixed)) return Result.fail(Actions.describeRefusal(fixed.failure))
    game = fixed.success
  }
  for (const node of start.nodes)
    if (changeable(node) && !keys.has(node.id)) {
      const sold = Actions.sell(game, node.id)
      if (Result.isFailure(sold)) return Result.fail(Actions.describeRefusal(sold.failure))
      game = sold.success
    }
  game = { ...game, links: [] }
  const ids = new Map<string, string>()
  for (const entry of design.nodes) {
    const existing = start.nodes.find((node) => node.id === entry.key && changeable(node))
    let id: string
    if (existing) {
      if (existing.type !== entry.type) return Result.fail('A Node of the Design changed type.')
      id = existing.id
      game = Actions.move(game, id, entry.dx, entry.dy)
    } else {
      id = `n${game.nextId}`
      const region = Schema.decodeUnknownOption(Region)(entry.settings['region'])
      const placed = Actions.place(
        game,
        entry.type,
        entry.dx,
        entry.dy,
        Option.getOrUndefined(region),
      )
      if (Result.isFailure(placed)) return Result.fail(Actions.describeRefusal(placed.failure))
      game = placed.success
    }
    const configured = configure(game, id, entry.settings)
    if (Result.isFailure(configured)) return configured
    game = configured.success
    ids.set(entry.key, id)
  }
  // Fixed Nodes link by id: the start's, and the Users of each region the Design opened.
  const endOf = (key: string): string | undefined =>
    ids.get(key) ?? game.nodes.find((node) => node.id === key && !changeable(node))?.id
  for (const entry of design.links) {
    const from = endOf(entry.from)
    const to = endOf(entry.to)
    if (!from || !to) return Result.fail('A Link of the Design has a missing end.')
    const linked = Actions.connect(game, from, to)
    if (Result.isFailure(linked)) return Result.fail(Actions.describeRefusal(linked.failure))
    game = linked.success
    const wanted = decodeLink({ ...link(from, to), ...pick(entry.settings, LINK_SETTINGS) })
    if (Option.isNone(wanted)) return Result.fail('A Link of the Design has a bad setting.')
    const { timeout, retries, breaker, kinds } = wanted.value
    const policy = Actions.setLinkPolicy(game, from, to, { timeout, retries, breaker })
    if (Result.isSuccess(policy)) game = policy.success
    if (kinds !== null) {
      const routed = Actions.setLinkKinds(game, from, to, kinds)
      if (Result.isSuccess(routed)) game = routed.success
    }
  }
  return Result.succeed(game)
}

const RESPOND: Record<Response, (game: Game) => Actions.Action> = {
  'disable-rule': Actions.disableRule,
  'fence-leader': Actions.fenceLeader,
  'roll-back-routes': Actions.rollBackRoutes,
  'roll-back-config': Actions.rollBackConfig,
  'cancel-report': Actions.cancelReport,
  'expand-volume': Actions.expandVolume,
  'renew-certificate': Actions.renewCertificate,
  'delete-message': Actions.deleteMessage,
  'cancel-migration': Actions.cancelMigration,
  'pin-and-redeploy': Actions.pinAndRedeploy,
  'restore-backup': Actions.restoreBackup,
  'restart-clocks': Actions.restartClocks,
  'switch-provider': Actions.switchProvider,
  'fail-over-region': Actions.failOverRegion,
  'fail-over-zone': Actions.failOverZone,
  'move-kind': Actions.moveKind,
}

/** Applies one run action. A refused action changes nothing, as a refused click does. */
export const applyAction = (game: Game, action: ReplayAction): Game => {
  const result = ReplayAction.match(action, {
    Restart: ({ node }) => Actions.restart(game, node),
    Replace: ({ node }) => Actions.replace(game, node),
    FailOver: ({ node }) => Actions.failOver(game, node),
    Throttle: ({ node }) => Actions.throttleConnects(game, node),
    Resize: ({ node, direction }) => Actions.resize(game, node, direction),
    Respond: ({ response }) => RESPOND[response](game),
  })
  return Result.isSuccess(result) ? result.success : game
}

const PREFIX = 'QRP1:'

export const encodeReplay = (replay: Replay): string =>
  encodeText(PREFIX, Schema.encodeSync(Replay)(replay))

const decode = Schema.decodeUnknownOption(Replay)

export const decodeReplay = (text: string): Result.Result<Replay, string> => {
  if (text.length > MAX_REPLAY_CHARS) return Result.fail('The replay is too long.')
  const parsed = decode(decodeText(PREFIX, text))
  if (Option.isNone(parsed)) return Result.fail('That is not a replay.')
  if (parsed.value.actions.length > MAX_REPLAY_ACTIONS)
    return Result.fail('The replay has too many actions.')
  return Result.succeed(parsed.value)
}
