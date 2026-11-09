import { Actions } from '../board-actions.ts'
import { Work } from '../board-actions.ts'
import { BIG_PURCHASE } from '../cues.ts'
import {
  CACHE_ENGINES,
  COMPONENTS,
  FAMILIES,
  FEATURES,
  FRAMEWORKS,
  BACKUPS,
  COLLECTORS,
  DEPLOY_STRATEGIES,
  GPU_MODELS,
  LOG_ACKS,
  VEC_INDEXES,
  CACHE_KEYS,
  DB_ENGINES,
  SHARD_KEYS,
  STORE_VARIANTS,
  STORAGE_CLASSES,
  STORAGE_IOPS,
  DB_RETENTIONS,
  CACHE_STRATEGIES,
  REGION_INFO,
  KINDS,
  LB_POLICIES,
  PM_MODES,
  PRICINGS,
  RUNTIMES,
  SIZES,
} from '@quorum/simulation/catalog'
import { FitBoard } from '../commands.ts'
import { intent } from '@quorum/simulation/room'
import { Game } from '@quorum/simulation/state'
import { Message } from '../message.ts'
import { Model, boardChallenge, type TradeoffOption } from '../model.ts'
import { REPEAT_MS } from './constant.ts'
import { Result } from 'effect'
import { UNDO_SECONDS } from '../feedback.ts'
import { step as holdStep } from '../hold-machine.ts'
import { alertText, duration, money } from '@quorum/ui/game/format'
import { isOne } from '../../i18n/plural.ts'
import { logRunAction, logResponse } from './session.ts'
import { onBoard } from '../route.ts'
import { refusalIn } from '../../i18n/refusal.ts'
import { say, withToast, act, nodeName, type MessageCases, type UpdateResult } from './shared.ts'
import { serviceOf } from '@quorum/simulation/team'
import { type Messages } from '../../i18n/messages.ts'
import { type Note } from './clock.ts'

/** A Stack choice on this Node starts a migration rather than swapping at once. */
export const migrates = (game: Game, nodeId: string): boolean =>
  !game.sandbox && game.nodes.some((node) => node.id === nodeId && node.type === 'server')

/** What the player hears when a Stack choice started a migration. */
export const migrationNote = (t: Messages, before: Game, after: Game): Note => {
  const migration = serviceOf(after).migration
  if (!migration || serviceOf(before).migration === migration) return null
  return [t.toasts.migrationQueued(Math.round(migration.total)), 'primary']
}

/** The Message that applies an option, as the inspector sent before Tradeoff cards. */
export const optionMessage = (nodeId: string, option: TradeoffOption): Message => {
  switch (option.kind) {
    case 'runtime':
      return Message.RuntimeChosen({ nodeId, runtime: option.id })
    case 'framework':
      return Message.FrameworkChosen({ nodeId, framework: option.id })
    case 'family':
      return Message.FamilyChosen({ nodeId, family: option.id })
  }
}

/** The undo hint a one-click purchase adds to its Toast, or nothing when it cost nothing. */
export const refundNote = (t: Messages, spent: number): ReadonlyArray<string> =>
  spent > 0 ? [t.toasts.undoRefunds(money(spent), t.units.s(UNDO_SECONDS))] : []

/** An instance size in words, or its number when the size has no name. */
export const sizeText = (t: Messages, size: number): string =>
  SIZES[size] ? t.nodeList.sizes[SIZES[size].name] : String(size)

type OptionsTag =
  | 'BulkResizeChosen'
  | 'UpgradeAllChosen'
  | 'HoldStarted'
  | 'HoldRepeated'
  | 'HoldEnded'
  | 'HoldLifted'
  | 'ResizeChosen'
  | 'FamilyChosen'
  | 'PricingChosen'
  | 'RuntimeChosen'
  | 'FrameworkChosen'
  | 'WorkersChosen'
  | 'PmChosen'
  | 'PoolerModeChosen'
  | 'CompressionChosen'
  | 'RecycleChosen'
  | 'PolicyChosen'
  | 'LbVariantChosen'
  | 'HealthCheckChosen'
  | 'TtlChosen'
  | 'CacheEngineChosen'
  | 'LinkPolicyChosen'
  | 'LinkKindsChosen'
  | 'AlertRuleChosen'
  | 'SampleChosen'
  | 'ReplaceBought'
  | 'RestartChosen'
  | 'FailedOver'
  | 'ConnectsThrottled'
  | 'KindMoved'
  | 'ZoneFailedOver'
  | 'RegionFailedOver'
  | 'DrainChosen'
  | 'IndexAdded'
  | 'CacheGuardChosen'
  | 'StickyChosen'
  | 'SlowStartChosen'
  | 'CdnOptionsChosen'
  | 'ShardKeyChosen'
  | 'SyncChosen'
  | 'PromoteReplica'
  | 'DbTopologyChosen'
  | 'SearchOptionsChosen'
  | 'StoreVariantChosen'
  | 'DlqChosen'
  | 'AttemptsChosen'
  | 'MaxLengthChosen'
  | 'PrefetchChosen'
  | 'ParanoiaChosen'
  | 'UnderAttackChosen'
  | 'RateLimitChosen'
  | 'GatewayBucketChosen'
  | 'GatewayOptionsChosen'
  | 'DbEngineChosen'
  | 'StorageIopsChosen'
  | 'ShardsChosen'
  | 'StorageClassChosen'
  | 'LifecycleChosen'
  | 'DbRetentionChosen'
  | 'MaterializedChosen'
  | 'ChaosChosen'
  | 'CacheStrategyChosen'
  | 'SearchRefreshChosen'
  | 'RestoreDrilled'
  | 'DeployStrategyChosen'
  | 'HubOptionsChosen'
  | 'DocOptionsChosen'
  | 'VecIndexChosen'
  | 'RolloutChosen'
  | 'LogOptionsChosen'
  | 'ZoneChosen'
  | 'StandbyChosen'
  | 'AutoscalerChosen'
  | 'GpuChosen'
  | 'PrecisionChosen'
  | 'BatchChosen'
  | 'GpuModelChosen'
  | 'CollectorChosen'
  | 'GogcChosen'
  | 'ShedChosen'
  | 'DegradeChosen'
  | 'RywChosen'
  | 'RuleDisabled'
  | 'RegionPicked'
  | 'RegionOpened'
  | 'NodeRegionChosen'
  | 'QuorumChosen'
  | 'SpreadChosen'
  | 'BackupChosen'
  | 'FanoutChosen'
  | 'SplitChosen'

export const optionsHandlers = (model: Model): MessageCases<UpdateResult, OptionsTag> => ({
  BulkResizeChosen: ({ nodeId, mode }) => {
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    let game = model.board.game
    const resized: Array<ReturnType<typeof Actions.resize>> = []
    for (let index = 0; index < (mode === 'ten' ? 10 : SIZES.length); index += 1) {
      const next = Actions.resize(game, nodeId, 1)
      if (Result.isFailure(next)) break
      resized.push(next)
      game = next.success
    }
    if (resized.length === 0) return { model }
    return act(model, `Resized ${nodeName(model.board.game, nodeId)} ×${resized.length}`, resized, {
      undoable: true,
      note: (after) => {
        const t = say(model)
        return [
          t.toasts.sentences([
            t.toasts.grewSizes(
              t.catalog.components[node.type].name,
              resized.length,
              sizeText(t, node.size),
              isOne(model.prefs.locale, resized.length),
            ),
            ...refundNote(t, model.board.game.cash - after.cash),
          ]),
          'ok',
        ]
      },
    })
  },

  UpgradeAllChosen: ({ nodeId }) => {
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    const before = model.board.game
    const outcome = Actions.upgradeAll(before, node.type, node.region)
    if (Result.isFailure(outcome))
      return withToast(model, refusalIn(say(model), outcome.failure), 'warn')
    const { game, upgraded, skipped, short } = outcome.success
    const name = COMPONENTS[node.type].name
    const spent = before.cash - game.cash
    return act(
      model,
      `Upgraded ${name} ×${upgraded}`,
      intent('upgradeAll', node.type, node.region),
      {
        undoable: true,
        note: () => {
          const t = say(model)
          return [
            t.toasts.sentences([
              t.toasts.upgradedAll(t.catalog.components[node.type].name, upgraded),
              ...(skipped > 0 ? [t.toasts.atLargest(skipped)] : []),
              ...(short ? [t.toasts.cashRanOut] : []),
              ...refundNote(t, spent),
            ]),
            'ok',
          ]
        },
      },
    )
  },

  HoldStarted: ({ nodeId, now }) => {
    // A Challenge run replays a fixed list of actions: a hold would flood it.
    if (boardChallenge(model.board)?._tag === 'Running') return { model }
    if (!model.board.game.nodes.some((entry) => entry.id === nodeId)) return { model }
    return {
      model: {
        ...model,
        board: {
          ...model.board,
          hold: holdStep(model.board.hold, { _tag: 'HoldStarted', nodeId, at: now }),
        },
      },
    }
  },

  HoldRepeated: ({ nodeId, now }) => {
    const hold = model.board.hold
    if (hold._tag !== 'Held' || hold.nodeId !== nodeId) return { model }
    // The board left the screen with the pointer down: nothing is held any more.
    if (!onBoard(model.route))
      return {
        model: {
          ...model,
          board: { ...model.board, hold: holdStep(hold, { _tag: 'HoldLifted' }) },
        },
      }
    // A stalled frame or a refocused tab delivers stale repeats: one buy per
    // REPEAT_MS, and the next one counts from now instead of catching up.
    if (now - hold.at < REPEAT_MS) return { model }
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node)
      return {
        model: {
          ...model,
          board: { ...model.board, hold: holdStep(hold, { _tag: 'HoldLifted' }) },
        },
      }
    const next = {
      ...model,
      board: {
        ...model.board,
        hold: holdStep(hold, { _tag: 'HoldRepeated', nodeId, at: now }),
      },
    }
    const bought = Actions.resize(next.board.game, nodeId, 1)
    // Cash or the size cap ends the hold where it stands: one refusal, then silence.
    if (Result.isFailure(bought))
      return withToast(
        {
          ...next,
          board: { ...next.board, hold: holdStep(next.board.hold, { _tag: 'HoldLifted' }) },
        },
        refusalIn(say(model), bought.failure),
        'warn',
      )
    return act(next, `Resized ${nodeName(next.board.game, nodeId)}`, bought, { undoable: true })
  },

  HoldEnded: ({ nodeId }) =>
    model.board.hold._tag === 'Held' && model.board.hold.nodeId === nodeId
      ? {
          model: {
            ...model,
            board: {
              ...model.board,
              hold: holdStep(model.board.hold, { _tag: 'HoldLifted' }),
            },
          },
        }
      : { model },

  HoldLifted: () => ({
    model: {
      ...model,
      board: { ...model.board, hold: holdStep(model.board.hold, { _tag: 'HoldLifted' }) },
    },
  }),

  ResizeChosen: ({ nodeId, direction }) => {
    const logged = logRunAction(model, { _tag: 'Resize', node: nodeId, direction })
    if (logged) return logged
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    const sized = COMPONENTS[node.type].sized
    const size = node.size + direction
    return act(
      model,
      `Resized ${nodeName(model.board.game, nodeId)}`,
      Actions.resize(model.board.game, nodeId, direction),
      {
        undoable: true,
        note: (game) => {
          const t = say(model)
          const spent = model.board.game.cash - game.cash
          const name = t.catalog.components[node.type].name
          return [
            t.toasts.sentences([
              ...(spent >= BIG_PURCHASE ? [t.toasts.upgradeComplete] : []),
              sized ? t.toasts.sizedNow(name, sizeText(t, size)) : t.toasts.sizeStepNow(name, size),
              // A one-click purchase says how to take it back (16 D17).
              ...refundNote(t, spent),
            ]),
            'ok',
          ]
        },
      },
    )
  },

  FamilyChosen: ({ nodeId, family }) =>
    act(
      model,
      `${FAMILIES[family].name} family`,
      Actions.setFamily(model.board.game, nodeId, family),
      {
        undoable: true,
      },
    ),

  PricingChosen: ({ nodeId, pricing }) =>
    act(
      model,
      `${PRICINGS[pricing].name} pricing`,
      Actions.setPricing(model.board.game, nodeId, pricing),
      {
        undoable: true,
        note: () =>
          pricing === 'reserved'
            ? [say(model).toasts.reservedWeek, 'ok']
            : [
                say(model).toasts.nowBilled(
                  say(model).catalog.pricings[pricing].name.toLowerCase(),
                ),
                'ok',
              ],
      },
    ),

  RuntimeChosen: ({ nodeId, runtime }) =>
    act(
      model,
      `Runtime ${RUNTIMES[runtime].name}`,
      Work.changeStack(model.board.game, nodeId, { runtime }),
      {
        undoable: !migrates(model.board.game, nodeId),
        note: (game) =>
          migrationNote(say(model), model.board.game, game) ?? [
            say(model).toasts.nowRunning(say(model).catalog.runtimes[runtime].name),
            'ok',
          ],
      },
    ),

  FrameworkChosen: ({ nodeId, framework }) =>
    act(
      model,
      `Framework ${FRAMEWORKS[framework].name}`,
      Work.changeStack(model.board.game, nodeId, { framework }),
      {
        undoable: !migrates(model.board.game, nodeId),
        note: (game) => migrationNote(say(model), model.board.game, game),
      },
    ),

  WorkersChosen: ({ nodeId, workers }) =>
    act(
      model,
      `Pool size ${Math.round(workers)}`,
      Actions.setWorkers(model.board.game, nodeId, workers),
      {
        undoable: true,
      },
    ),

  PmChosen: ({ nodeId, pm }) =>
    act(model, `pm ${PM_MODES[pm].label}`, Actions.setPm(model.board.game, nodeId, pm), {
      undoable: true,
    }),

  PoolerModeChosen: ({ nodeId, mode }) =>
    act(model, `${mode} pooling`, Actions.setPoolerMode(model.board.game, nodeId, mode), {
      undoable: true,
    }),

  CompressionChosen: ({ nodeId, compress }) =>
    act(
      model,
      compress ? 'Gzip on' : 'Gzip off',
      Actions.setCompression(model.board.game, nodeId, compress),
      { undoable: true },
    ),

  RecycleChosen: ({ nodeId, recycle }) =>
    act(
      model,
      recycle ? 'Recycle workers' : 'Keep workers',
      Actions.setRecycle(model.board.game, nodeId, recycle),
      { undoable: true },
    ),

  PolicyChosen: ({ nodeId, policy }) =>
    act(
      model,
      `Policy ${LB_POLICIES[policy].label}`,
      Actions.setPolicy(model.board.game, nodeId, policy),
      { undoable: true },
    ),

  LbVariantChosen: ({ nodeId, variant }) =>
    act(
      model,
      variant === 'l4' ? 'L4 load balancer' : 'L7 load balancer',
      Actions.setLbVariant(model.board.game, nodeId, variant),
      { undoable: true },
    ),

  HealthCheckChosen: ({ nodeId, checkEvery, deepCheck }) =>
    act(
      model,
      checkEvery === undefined
        ? deepCheck
          ? 'Deep checks'
          : 'Shallow checks'
        : `Checks every ${checkEvery} s`,
      Actions.setHealthCheck(model.board.game, nodeId, {
        ...(checkEvery === undefined ? {} : { checkEvery }),
        ...(deepCheck === undefined ? {} : { deepCheck }),
      }),
      { undoable: true },
    ),

  TtlChosen: ({ nodeId, ttl }) =>
    act(model, `TTL ${duration(ttl)}`, Actions.setTtl(model.board.game, nodeId, ttl), {
      undoable: true,
    }),

  CacheEngineChosen: ({ nodeId, engine }) =>
    act(
      model,
      `Engine ${CACHE_ENGINES[engine].name}`,
      Actions.setCacheEngine(model.board.game, nodeId, engine),
      { undoable: true },
    ),

  LinkPolicyChosen: ({ from, to, timeout, retries, breaker, bulkhead, hedge }) =>
    act(
      model,
      bulkhead !== undefined
        ? bulkhead
          ? 'Bulkhead on'
          : 'Bulkhead off'
        : hedge !== undefined
          ? hedge
            ? 'Hedged requests on'
            : 'Hedged requests off'
          : breaker !== undefined
            ? breaker
              ? 'Circuit breaker on'
              : 'Circuit breaker off'
            : timeout === undefined
              ? retries === 'naive'
                ? 'Retries on'
                : retries === 'backoff'
                  ? 'Retries with backoff'
                  : 'Retries off'
              : `Timeout ${timeout} s`,
      Actions.setLinkPolicy(model.board.game, from, to, {
        ...(timeout === undefined ? {} : { timeout }),
        ...(retries === undefined ? {} : { retries }),
        ...(breaker === undefined ? {} : { breaker }),
        ...(bulkhead === undefined ? {} : { bulkhead }),
        ...(hedge === undefined ? {} : { hedge }),
      }),
      { undoable: true },
    ),

  LinkKindsChosen: ({ from, to, kinds }) =>
    act(
      model,
      kinds ? `Routes ${kinds.map((kind) => KINDS[kind].label).join(', ')}` : 'Routes every kind',
      Actions.setLinkKinds(model.board.game, from, to, kinds),
      { undoable: true },
    ),

  AlertRuleChosen: ({ rule, threshold }) =>
    act(model, alertText(rule, threshold), Actions.setAlertRule(model.board.game, rule, threshold)),

  SampleChosen: ({ nodeId, sampleRate }) =>
    act(
      model,
      `Sample ${Math.round(sampleRate * 100)}%`,
      Actions.setSample(model.board.game, nodeId, sampleRate),
      {
        undoable: true,
      },
    ),

  ReplaceBought: ({ nodeId }) =>
    logRunAction(model, { _tag: 'Replace', node: nodeId }) ??
    act(
      model,
      `Replaced ${nodeName(model.board.game, nodeId)}`,
      Actions.replace(model.board.game, nodeId),
    ),

  RestartChosen: ({ nodeId }) =>
    logRunAction(model, { _tag: 'Restart', node: nodeId }) ??
    act(
      model,
      `Restarted ${nodeName(model.board.game, nodeId)}`,
      Actions.restart(model.board.game, nodeId),
    ),

  FailedOver: ({ nodeId }) =>
    logRunAction(model, { _tag: 'FailOver', node: nodeId }) ??
    act(
      model,
      `Failed over ${nodeName(model.board.game, nodeId)}`,
      Actions.failOver(model.board.game, nodeId),
    ),

  ConnectsThrottled: ({ nodeId }) =>
    logRunAction(model, { _tag: 'Throttle', node: nodeId }) ??
    act(
      model,
      `Throttled connects on ${nodeName(model.board.game, nodeId)}`,
      Actions.throttleConnects(model.board.game, nodeId),
    ),

  KindMoved: () =>
    logResponse(model, 'move-kind') ??
    act(model, 'Moved login', Actions.moveKind(model.board.game)),

  ZoneFailedOver: () =>
    logResponse(model, 'fail-over-zone') ??
    act(model, 'Failed over the zone', Actions.failOverZone(model.board.game)),

  RegionFailedOver: () =>
    logResponse(model, 'fail-over-region') ??
    act(model, 'Failed over the region', Actions.failOverRegion(model.board.game)),

  DrainChosen: ({ nodeId }) =>
    act(
      model,
      `Drained ${nodeName(model.board.game, nodeId)}`,
      Actions.drain(model.board.game, nodeId),
      { note: () => [say(model).toasts.draining, 'plain'] },
    ),

  IndexAdded: ({ nodeId }) =>
    act(model, 'Added an index', Work.addIndex(model.board.game, nodeId), {
      note: (game) =>
        game.backlog[0]?.ref === 'add-index' ? [say(model).toasts.indexOnTop, 'plain'] : null,
    }),

  CacheGuardChosen: ({ nodeId, coalesce, warming, earlyExpiry, swr }) =>
    act(
      model,
      coalesce !== undefined
        ? coalesce
          ? 'Coalescing on'
          : 'Coalescing off'
        : earlyExpiry !== undefined
          ? earlyExpiry
            ? 'Early expiration on'
            : 'Early expiration off'
          : swr !== undefined
            ? swr
              ? 'Stale-while-revalidate on'
              : 'Stale-while-revalidate off'
            : warming
              ? 'Warming on'
              : 'Warming off',
      Actions.setCacheGuard(model.board.game, nodeId, {
        ...(coalesce === undefined ? {} : { coalesce }),
        ...(warming === undefined ? {} : { warming }),
        ...(earlyExpiry === undefined ? {} : { earlyExpiry }),
        ...(swr === undefined ? {} : { swr }),
      }),
      { undoable: true },
    ),

  StickyChosen: ({ nodeId, sticky }) =>
    act(
      model,
      sticky ? 'Sticky sessions on' : 'Sticky sessions off',
      Actions.setSticky(model.board.game, nodeId, sticky),
      { undoable: true },
    ),

  SlowStartChosen: ({ nodeId, slowStart }) =>
    act(
      model,
      slowStart ? 'Slow start on' : 'Slow start off',
      Actions.setSlowStart(model.board.game, nodeId, slowStart),
      { undoable: true },
    ),

  CdnOptionsChosen: ({ nodeId, purge, cacheKey }) =>
    act(
      model,
      purge !== undefined
        ? purge
          ? 'Purge on deploy on'
          : 'Purge on deploy off'
        : `Cache key: ${cacheKey ? CACHE_KEYS[cacheKey].name : ''}`,
      Actions.setCdnOptions(model.board.game, nodeId, {
        ...(purge === undefined ? {} : { purge }),
        ...(cacheKey === undefined ? {} : { cacheKey }),
      }),
      { undoable: true },
    ),

  // A Company moves a Database's data to change its key (07 "Partitioning"): Dev Hours, then a copy.

  ShardKeyChosen: ({ nodeId, shardKey }) =>
    model.board.game.sandbox
      ? act(
          model,
          `Shard key: ${SHARD_KEYS[shardKey].name}`,
          Actions.setShardKey(model.board.game, nodeId, shardKey),
          { undoable: true },
        )
      : act(
          model,
          `Reshard by ${SHARD_KEYS[shardKey].name}`,
          Work.queueReshard(model.board.game, nodeId, { key: shardKey }),
        ),

  SyncChosen: ({ nodeId, sync }) =>
    act(
      model,
      sync ? 'Synchronous replica' : 'Asynchronous replica',
      Actions.setSync(model.board.game, nodeId, sync),
      { undoable: true },
    ),

  PromoteReplica: ({ nodeId }) =>
    act(model, 'Promote replica to primary', Actions.promoteReplica(model.board.game, nodeId), {
      undoable: true,
    }),

  DbTopologyChosen: ({ nodeId, topology }) =>
    model.board.game.sandbox
      ? act(
          model,
          `Topology: ${topology === 'single' ? 'Single primary' : topology === 'sharded' ? 'Sharded' : 'Multi-leader'}`,
          Actions.setTopology(model.board.game, nodeId, topology),
          { undoable: true },
        )
      : act(
          model,
          `Move to ${topology === 'single' ? 'single primary' : topology === 'sharded' ? 'sharded' : 'multi-leader'}`,
          Work.queueTopology(model.board.game, nodeId, topology),
        ),

  SearchOptionsChosen: ({ nodeId, ...change }) => {
    const pick = Object.fromEntries(
      Object.entries(change).filter(([, value]) => value !== undefined),
    )
    return model.board.game.sandbox
      ? act(model, 'Search Engine set', Actions.setSearchOptions(model.board.game, nodeId, pick), {
          undoable: true,
        })
      : act(model, 'Search Engine set', Actions.setSearchOptions(model.board.game, nodeId, pick))
  },

  StoreVariantChosen: ({ nodeId, storeVariant }) =>
    act(
      model,
      `Object Storage: ${STORE_VARIANTS[storeVariant].name}`,
      Actions.setStoreVariant(model.board.game, nodeId, storeVariant),
      { undoable: true },
    ),

  DlqChosen: ({ nodeId, dlq }) =>
    act(
      model,
      dlq ? 'Dead-letter queue on' : 'Dead-letter queue off',
      Actions.setDlq(model.board.game, nodeId, dlq),
      {
        undoable: true,
      },
    ),

  AttemptsChosen: ({ nodeId, attempts }) =>
    act(
      model,
      `Max attempts ${attempts}`,
      Actions.setAttempts(model.board.game, nodeId, attempts),
      {
        undoable: true,
      },
    ),

  MaxLengthChosen: ({ nodeId, maxLength }) =>
    act(
      model,
      maxLength > 0 ? `Max length ${maxLength}` : 'No max length',
      Actions.setMaxLength(model.board.game, nodeId, maxLength),
      { undoable: true },
    ),

  PrefetchChosen: ({ nodeId, prefetch }) =>
    act(model, `Prefetch ${prefetch}`, Actions.setPrefetch(model.board.game, nodeId, prefetch), {
      undoable: true,
    }),

  ParanoiaChosen: ({ nodeId, paranoia }) =>
    act(model, `Paranoia ${paranoia}`, Actions.setParanoia(model.board.game, nodeId, paranoia), {
      undoable: true,
    }),

  UnderAttackChosen: ({ nodeId, underAttack }) =>
    act(
      model,
      underAttack ? 'Under attack mode on' : 'Under attack mode off',
      Actions.setUnderAttack(model.board.game, nodeId, underAttack),
      { undoable: true },
    ),

  RateLimitChosen: ({ nodeId, rateLimit }) =>
    act(
      model,
      rateLimit > 0 ? `Rate limit ${rateLimit}/s` : 'Rate limit off',
      Actions.setRateLimit(model.board.game, nodeId, rateLimit),
      { undoable: true },
    ),

  GatewayBucketChosen: ({ nodeId, bucket }) =>
    act(
      model,
      bucket ? 'Token bucket on' : 'Token bucket off',
      Actions.setGatewayBucket(model.board.game, nodeId, bucket),
      { undoable: true },
    ),

  GatewayOptionsChosen: ({ nodeId, authEdge, merge }) =>
    act(
      model,
      authEdge !== undefined
        ? authEdge
          ? 'Auth at the edge on'
          : 'Auth at the edge off'
        : merge
          ? 'Request coalescing on'
          : 'Request coalescing off',
      Actions.setGatewayOptions(model.board.game, nodeId, {
        ...(authEdge === undefined ? {} : { authEdge }),
        ...(merge === undefined ? {} : { merge }),
      }),
      { undoable: true },
    ),

  DbEngineChosen: ({ nodeId, dbEngine }) => {
    const game = model.board.game
    // A Company changes a Database's engine through a migration (08 "Migrations").
    const company =
      !game.sandbox && game.nodes.some((n) => n.id === nodeId && n.type === 'database')
    return company
      ? act(
          model,
          `Change the database engine to ${DB_ENGINES[dbEngine].name}`,
          Work.queueEngineChange(game, nodeId, dbEngine),
        )
      : act(
          model,
          `Database engine: ${DB_ENGINES[dbEngine].name}`,
          Actions.setDbEngine(game, nodeId, dbEngine),
          { undoable: true },
        )
  },

  StorageIopsChosen: ({ nodeId, iops }) =>
    act(
      model,
      `Volume: ${STORAGE_IOPS[iops].name}`,
      Actions.setStorageIops(model.board.game, nodeId, iops),
      { undoable: true },
    ),

  // A Company moves a Database's data to change its shards (07 "Partitioning"): Dev Hours, then a copy.

  ShardsChosen: ({ nodeId, shards }) =>
    model.board.game.sandbox
      ? act(
          model,
          shards > 1 ? `${shards} shards` : 'One shard',
          Actions.setShards(model.board.game, nodeId, shards),
          { undoable: true },
        )
      : act(
          model,
          shards > 1 ? `Reshard to ${shards} shards` : 'Reshard to one shard',
          Work.queueReshard(model.board.game, nodeId, { shards }),
        ),

  StorageClassChosen: ({ nodeId, storageClass }) =>
    act(
      model,
      `Storage class: ${STORAGE_CLASSES[storageClass].name}`,
      Actions.setStorageClass(model.board.game, nodeId, storageClass),
      { undoable: true },
    ),

  LifecycleChosen: ({ nodeId, lifecycle }) =>
    act(
      model,
      lifecycle > 0 ? `Lifecycle after ${lifecycle} days` : 'Lifecycle off',
      Actions.setLifecycle(model.board.game, nodeId, lifecycle),
      { undoable: true },
    ),

  DbRetentionChosen: ({ nodeId, keep }) =>
    act(
      model,
      `Retention: ${DB_RETENTIONS[keep].name}`,
      Actions.setDbRetention(model.board.game, nodeId, keep),
      { undoable: true },
    ),

  MaterializedChosen: ({ nodeId, materialized }) =>
    act(
      model,
      materialized ? 'Materialized view on' : 'Materialized view off',
      Actions.setMaterialized(model.board.game, nodeId, materialized),
      { undoable: true },
    ),

  ChaosChosen: ({ chaos }) =>
    act(
      model,
      chaos ? 'Chaos experiments on' : 'Chaos experiments off',
      Actions.setChaos(model.board.game, chaos),
      { undoable: true },
    ),

  CacheStrategyChosen: ({ nodeId, cacheStrategy }) =>
    act(
      model,
      `Cache: ${CACHE_STRATEGIES[cacheStrategy].name}`,
      Actions.setCacheStrategy(model.board.game, nodeId, cacheStrategy),
      { undoable: true },
    ),

  SearchRefreshChosen: ({ nodeId, refresh }) =>
    act(
      model,
      `Refresh: ${refresh} s`,
      Actions.setSearchRefresh(model.board.game, nodeId, refresh),
      { undoable: true },
    ),

  RestoreDrilled: ({ nodeId }) => {
    const drill = Actions.runRestoreDrill(model.board.game, nodeId)
    const restore = Result.isSuccess(drill)
      ? drill.success.nodes.find((entry) => entry.id === nodeId)?.restore
      : undefined
    return act(
      model,
      restore === 'failed'
        ? 'The restore failed: the backup is broken'
        : restore === 'ok'
          ? 'The restore worked'
          : 'Restore drill',
      drill,
      { undoable: true },
    )
  },

  DeployStrategyChosen: ({ nodeId, strategy }) =>
    act(
      model,
      `Deploy strategy: ${DEPLOY_STRATEGIES[strategy].name}`,
      Actions.setDeployStrategy(model.board.game, nodeId, strategy),
      { undoable: true },
    ),

  HubOptionsChosen: ({ nodeId, presence, backoff, clustering }) =>
    act(
      model,
      presence !== undefined
        ? presence
          ? 'Presence on'
          : 'Presence off'
        : backoff !== undefined
          ? backoff
            ? 'Reconnect backoff on'
            : 'Reconnect backoff off'
          : clustering
            ? 'Clustering on'
            : 'Clustering off',
      Actions.setHubOptions(model.board.game, nodeId, {
        ...(presence === undefined ? {} : { presence }),
        ...(backoff === undefined ? {} : { backoff }),
        ...(clustering === undefined ? {} : { clustering }),
      }),
      { undoable: true },
    ),

  DocOptionsChosen: ({ nodeId, transactions }) =>
    act(
      model,
      transactions === undefined
        ? 'Document Store'
        : transactions
          ? 'Multi-document transactions on'
          : 'Multi-document transactions off',
      Actions.setDocOptions(
        model.board.game,
        nodeId,
        transactions === undefined ? {} : { transactions },
      ),
      { undoable: true },
    ),

  VecIndexChosen: ({ nodeId, indexType }) =>
    act(
      model,
      `Index: ${VEC_INDEXES[indexType].name}`,
      Actions.setVecIndex(model.board.game, nodeId, indexType),
      { undoable: true },
    ),

  // A rollout belongs to the Service, not to a Node, and Undo puts Nodes back only.

  RolloutChosen: ({ nodeId, feature, share }) =>
    act(
      model,
      share <= 0
        ? `${FEATURES[feature].name}: off`
        : `${FEATURES[feature].name}: ${Math.round(share * 100)}%`,
      Actions.setRollout(model.board.game, nodeId, feature, share),
    ),

  LogOptionsChosen: ({ nodeId, partitions, acks, retain, keyed, replicas }) =>
    act(
      model,
      partitions !== undefined
        ? `Partitions: ${partitions}`
        : acks !== undefined
          ? `Acks: ${LOG_ACKS[acks].name}`
          : replicas !== undefined
            ? `Replicas: ${replicas}`
            : retain !== undefined
              ? `Retention: ${retain} s`
              : keyed
                ? 'Partition key: keyed'
                : 'Partition key: round robin',
      Actions.setLogOptions(model.board.game, nodeId, {
        ...(partitions === undefined ? {} : { partitions }),
        ...(acks === undefined ? {} : { acks }),
        ...(retain === undefined ? {} : { retain }),
        ...(keyed === undefined ? {} : { keyed }),
        ...(replicas === undefined ? {} : { replicas }),
      }),
      { undoable: true },
    ),

  ZoneChosen: ({ nodeId, zone }) =>
    act(
      model,
      `${nodeName(model.board.game, nodeId)} to zone ${zone}`,
      Actions.setZone(model.board.game, nodeId, zone),
      { undoable: true },
    ),

  StandbyChosen: ({ nodeId, standby }) =>
    act(
      model,
      standby ? 'Standby on' : 'Standby off',
      Actions.setStandby(model.board.game, nodeId, standby),
      { undoable: true },
    ),

  AutoscalerChosen: ({ nodeId, signal, target, minCopies, maxCopies, schedule }) =>
    act(
      model,
      schedule === undefined
        ? 'Autoscaler set'
        : schedule
          ? 'Scheduled scaling on'
          : 'Scheduled scaling off',
      Actions.setAutoscaler(model.board.game, nodeId, {
        ...(signal === undefined ? {} : { signal }),
        ...(target === undefined ? {} : { target }),
        ...(minCopies === undefined ? {} : { minCopies }),
        ...(maxCopies === undefined ? {} : { maxCopies }),
        ...(schedule === undefined ? {} : { schedule }),
      }),
      { undoable: true },
    ),

  GpuChosen: ({ nodeId, gpu }) =>
    act(model, `GPU ${gpu.toUpperCase()}`, Actions.setGpuType(model.board.game, nodeId, gpu), {
      undoable: true,
    }),

  PrecisionChosen: ({ nodeId, precision }) =>
    act(
      model,
      `Precision ${precision.toUpperCase()}`,
      Actions.setPrecision(model.board.game, nodeId, precision),
      { undoable: true },
    ),

  BatchChosen: ({ nodeId, batch }) =>
    act(model, `Batch ${batch}`, Actions.setBatch(model.board.game, nodeId, batch), {
      undoable: true,
    }),

  GpuModelChosen: ({ nodeId, gpuModel }) =>
    act(
      model,
      `Model ${GPU_MODELS[gpuModel].name}`,
      Actions.setGpuModel(model.board.game, nodeId, gpuModel),
      { undoable: true },
    ),

  CollectorChosen: ({ nodeId, collector }) =>
    act(
      model,
      `Collector ${COLLECTORS[collector].label}`,
      Actions.setCollector(model.board.game, nodeId, collector),
      { undoable: true },
    ),

  GogcChosen: ({ nodeId, gogc }) =>
    act(model, `GOGC ${gogc}`, Actions.setGogc(model.board.game, nodeId, gogc), {
      undoable: true,
    }),

  ShedChosen: ({ nodeId, shed }) =>
    act(
      model,
      shed ? 'Load shedding on' : 'Load shedding off',
      Actions.setShed(model.board.game, nodeId, shed),
      { undoable: true },
    ),

  DegradeChosen: ({ nodeId, degrade }) =>
    act(
      model,
      degrade ? 'Graceful degradation on' : 'Graceful degradation off',
      Actions.setDegrade(model.board.game, nodeId, degrade),
      { undoable: true },
    ),

  RywChosen: ({ nodeId, ryw }) =>
    act(
      model,
      ryw ? 'Read-your-writes on' : 'Read-your-writes off',
      Actions.setRyw(model.board.game, nodeId, ryw),
      { undoable: true },
    ),

  RuleDisabled: () =>
    logResponse(model, 'disable-rule') ??
    act(model, 'Disabled the WAF rule', Actions.disableRule(model.board.game)),

  RegionPicked: ({ region }) => {
    const next = { ...model, board: { ...model.board, region, selected: null } }
    return { model: next, commands: [FitBoard({})] }
  },

  RegionOpened: ({ region }) =>
    act(model, `Opened ${REGION_INFO[region].name}`, Actions.openRegion(model.board.game, region), {
      undoable: true,
      patch: () => ({ region, selected: null }),
    }),

  NodeRegionChosen: ({ nodeId, region }) =>
    act(
      model,
      `Moved to ${REGION_INFO[region].name}`,
      Actions.setRegion(model.board.game, nodeId, region),
      { undoable: true },
    ),

  QuorumChosen: ({ nodeId, n, r, w }) =>
    act(model, `N${n} R${r} W${w}`, Actions.setQuorum(model.board.game, nodeId, n, r, w), {
      undoable: true,
    }),

  SpreadChosen: ({ nodeId, spread }) =>
    act(
      model,
      spread ? 'Spread across regions' : 'One region',
      Actions.setSpread(model.board.game, nodeId, spread),
      { undoable: true },
    ),

  BackupChosen: ({ nodeId, backup }) =>
    act(
      model,
      `Backups ${BACKUPS[backup].name}`,
      Actions.setBackup(model.board.game, nodeId, backup),
      {
        undoable: true,
      },
    ),

  FanoutChosen: ({ nodeId, fanout }) =>
    act(
      model,
      fanout === 'push' ? 'Fan-out on write' : 'Fan-out on read',
      Actions.setFanout(model.board.game, nodeId, fanout),
      { undoable: true },
    ),

  SplitChosen: ({ nodeId, split }) =>
    act(
      model,
      split ? 'Hot keys split' : 'Hot keys not split',
      Actions.setSplit(model.board.game, nodeId, split),
      { undoable: true },
    ),
})
