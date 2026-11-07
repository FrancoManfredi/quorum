import { copy, nodeTitle, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  IAC_TOOLS,
  IAC_TOOL_INFO,
  MIRROR_TIME,
  OPEN_REGION_PRICE,
  REGIONS,
  SIZES,
  type DataPatternId,
  type RegionId,
} from '@quorum/simulation/catalog'
import { eraOf, has } from '@quorum/simulation/lookups'
import {
  applyCost,
  driftOf,
  mirrorOf,
  mirrorsOf,
  overridable,
  patternsFor,
  previewApply,
  switchLeft,
  type Change,
  type Drift,
  type Managed,
} from '@quorum/simulation/mirror'
import { isApplying } from '@quorum/simulation/mirror-machine'
import { openRegions } from '@quorum/simulation/regions'
import { solveFlow } from '@quorum/simulation/solve'
import type { Game, Mirror } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, SCROLL, WELL } from '@quorum/ui/game/bits'
import { shell } from './panels.ts'

/* ==========================================================================
   Mirrors (GDD 05 "Mirror a region"): the IaC tool, GitOps, and the plan for
   the region on the board. It opens from the region tabs.
   ========================================================================== */

const fieldLabelOf = (t: Messages): Record<Managed, string> => ({
  size: t.mirror.fieldSize,
  family: t.mirror.family,
  runtime: t.mirror.runtime,
  framework: t.mirror.framework,
  workers: t.mirror.workers,
  compress: t.mirror.compression,
  recycle: t.mirror.recycleWorkers,
  sampleRate: t.mirror.sampleRate,
  retention: t.mirror.retention,
  policy: t.mirror.policy,
  checkEvery: t.mirror.healthCheck,
  deepCheck: t.mirror.deepCheck,
  ttl: 'TTL',
  pm: t.mirror.processManager,
  engine: t.mirror.engine,
  dbEngine: t.mirror.databaseEngine,
  iops: t.mirror.volume,
  shards: t.mirror.shards,
  storageClass: t.mirror.storageClass,
  keep: t.mirror.retention,
  lifecycle: t.mirror.lifecycle,
  cacheStrategy: t.mirror.cacheStrategy,
  refresh: t.mirror.searchRefresh,
  sticky: t.mirror.stickySessions,
  slowStart: t.mirror.slowStart,
  purge: t.mirror.purgeOnDeploy,
  cacheKey: t.mirror.cacheKey,
  earlyExpiry: t.mirror.earlyExpiration,
  swr: t.mirror.staleWhileRevalidate,
  shardKey: t.mirror.shardKey,
  sync: t.mirror.synchronousReplica,
  searchVariant: t.mirror.searchProduct,
  searchShards: t.mirror.searchShards,
  searchReplicas: t.mirror.searchReplicas,
  heap: t.mirror.searchHeap,
  storeVariant: t.mirror.storageProduct,
  mode: t.mirror.poolMode,
  dlq: t.mirror.deadLetterQueue,
  attempts: t.mirror.attempts,
  maxLength: t.mirror.maxLength,
  prefetch: t.mirror.prefetch,
  coalesce: t.mirror.stampedeProtection,
  warming: t.mirror.cacheWarming,
  paranoia: t.mirror.paranoia,
  zone: t.mirror.zone,
  standby: t.mirror.standby,
  signal: t.mirror.signal,
  target: t.mirror.fieldTarget,
  minCopies: t.mirror.minCopies,
  maxCopies: t.mirror.maxCopies,
  gpu: 'GPU',
  collector: t.mirror.collector,
  gogc: 'GOGC',
  shed: t.mirror.loadShedding,
  ryw: t.mirror.readYourWrites,
  n: 'N',
  r: 'R',
  w: 'W',
  backup: t.mirror.backups,
  fanout: t.mirror.fanOut,
  split: t.mirror.keySplitting,
})

const patternLabelOf = (t: Messages): Record<DataPatternId, string> => ({
  replica: t.mirror.readReplica,
  primary: t.mirror.ownPrimary,
  replicate: t.mirror.replicate,
  call: t.mirror.callSource,
})

/** Each tool's documented default workflow: how a plan finds hand changes, and what Apply waits for. */
const toolFactsOf = (
  t: Messages,
): Record<(typeof IAC_TOOLS)[number], ReadonlyArray<readonly [string, string]>> => ({
  terraform: [
    [t.mirror.plan, t.mirror.refreshesLiveState],
    [t.mirror.apply2, t.mirror.minRefresh(MIRROR_TIME)],
    [t.mirror.drift, t.mirror.everyPlan],
  ],
  pulumi: [
    [t.mirror.plan, t.mirror.recordedState],
    [t.mirror.apply2, t.mirror.min(MIRROR_TIME)],
    [t.mirror.drift, 'pulumi refresh'],
  ],
  alchemy: [
    [t.mirror.plan, t.mirror.recordedState],
    [t.mirror.apply2, t.mirror.min(MIRROR_TIME)],
    [t.mirror.drift, t.mirror.alchemyDriftRepair],
  ],
})

const valueText = (t: Messages, field: Managed, value: unknown): string =>
  field === 'size' && typeof value === 'number'
    ? (t.nodeList.sizes[SIZES[value]?.name ?? 'custom'] ?? String(value))
    : typeof value === 'boolean'
      ? value
        ? t.mirror.valueOn
        : t.mirror.valueOff
      : String(value)

/**
 * A Node's name, with its region when it is not in the Mirror's: a Link to the
 * source shows where it goes. A Node the plan has not built yet is named after its source.
 */
const nodeName = (t: Messages, game: Game, id: string, mirror: Mirror): string => {
  if (id.startsWith('+')) {
    const source = game.nodes.find((entry) => entry.id === id.slice(1))
    if (!source) return t.mirror.node
    return source.type === 'database' && mirror.data[source.id] === 'replica'
      ? t.catalog.components.replica.name
      : nodeTitle(t, game, source)
  }
  const node = game.nodes.find((entry) => entry.id === id)
  if (!node) return t.mirror.node
  const name = nodeTitle(t, game, node)
  return node.region === mirror.region ? name : `${name} ${t.catalog.regionInfo[node.region].short}`
}

/** A segmented control: options sunk in a well, the chosen one raised. */
const segmented = <A>(
  key: string,
  options: ReadonlyArray<readonly [A, string]>,
  current: A,
  message: (value: A) => Message,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(key),
      h.Class(cn('grid gap-[3px] p-[3px]', WELL, 'rounded-[11px]')),
      h.Style({ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }),
    ],
    options.map(([value, label]) =>
      h.button(
        [
          h.Key(label),
          h.Type('button'),
          h.AriaPressed(value === current ? 'true' : 'false'),
          h.OnClick(message(value)),
          h.Class(
            cn(
              'h-7 rounded-lg px-2 text-[calc(12px*var(--type-scale))] font-medium transition-colors',
              value === current
                ? 'bg-raised text-foreground shadow-raised'
                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
            ),
          ),
        ],
        [label],
      ),
    ),
  )

const heading = (text: string, h: HtmlBuilder<Message>): Html =>
  h.span([h.Class(cn(EYEBROW, 'px-1'))], [text])

/* ---------- the IaC tool and GitOps ---------- */

const toolCards = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const current = game.iac?.tool ?? null
  const left = switchLeft(game)
  return h.section(
    [h.Key('tool'), h.Class('flex flex-col gap-2')],
    [
      heading(
        left > 0 && current
          ? t.mirror.iaCToolMovingToMin(IAC_TOOL_INFO[current].name, Math.ceil(left))
          : t.mirror.iaCTool,
        h,
      ),
      h.div(
        [h.Class('grid grid-cols-3 gap-2 compact:grid-cols-1')],
        IAC_TOOLS.map((tool) =>
          h.button(
            [
              h.Key(tool),
              h.Type('button'),
              h.AriaPressed(current === tool ? 'true' : 'false'),
              h.OnClick(Message.IacToolPicked({ tool })),
              h.Class(
                cn(
                  'flex flex-col gap-1.5 rounded-xl p-3 text-left transition-colors',
                  current === tool
                    ? 'bg-raised shadow-raised'
                    : cn(WELL, 'hover:brightness-[0.98]'),
                ),
              ),
            ],
            [
              h.span(
                [h.Class('flex items-baseline justify-between gap-2')],
                [
                  h.span(
                    [h.Class('text-[calc(14px*var(--type-scale))] font-semibold')],
                    [IAC_TOOL_INFO[tool].name],
                  ),
                  h.span(
                    [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
                    [IAC_TOOL_INFO[tool].language],
                  ),
                ],
              ),
              ...toolFactsOf(t)[tool].map(([name, value]) =>
                h.span(
                  [
                    h.Key(name),
                    h.Class('flex justify-between gap-2 text-[calc(12px*var(--type-scale))]'),
                  ],
                  [
                    h.span([h.Class('text-muted-foreground')], [name]),
                    h.span([h.Class('font-medium')], [value]),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    ],
  )
}

const gitops = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return !has(game, 'gitops') || !game.iac
    ? h.empty
    : h.section(
        [h.Key('gitops'), h.Class('flex flex-col gap-2')],
        [
          heading('GitOps', h),
          segmented(
            'sync',
            [
              [null, t.mirror.off],
              ['all', t.mirror.allAtOnce],
              ['staged', t.mirror.staged],
            ] as const,
            game.iac.sync,
            (sync) => Message.SyncModePicked({ sync }),
            h,
          ),
        ],
      )
}

/* ---------- the region on the board ---------- */

const driftText = (t: Messages, game: Game, mirror: Mirror, drift: Drift): string => {
  if (isApplying(mirror.sync))
    return t.mirror.applying(Math.max(1, Math.ceil(mirror.sync.readyAt - game.time)))
  const parts = [
    ...(drift.behind > 0 ? [t.mirror.behind(drift.behind)] : []),
    ...(drift.hand > 0 ? [t.mirror.handChanges(drift.hand)] : []),
  ]
  return parts.length === 0 ? t.mirror.inSync : parts.join(' · ')
}

const changeRow = (
  game: Game,
  mirror: Mirror,
  change: Change,
  index: number,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const [mark, text, keep] = ((): readonly [string, string, Message | null] => {
    switch (change._tag) {
      case 'create':
        return ['+', t.catalog.components[change.type].name, null]
      case 'remove':
        return [
          '−',
          `${t.catalog.components[change.type].name}${change.data ? ` · ${t.mirror.needsConfirm}` : ''}`,
          null,
        ]
      case 'set':
        return [
          '~',
          `${nodeName(t, game, change.node, mirror)} · ${fieldLabelOf(t)[change.field]} ${valueText(t, change.field, change.from)} → ${valueText(t, change.field, change.to)}`,
          change.hand && overridable(game)
            ? Message.MirrorOverrideSet({
                region: mirror.region,
                nodeId: change.node,
                field: change.field,
                keep: true,
              })
            : null,
        ]
      case 'link':
        return [
          change.add ? '+' : '−',
          t.mirror.link(
            nodeName(t, game, change.from, mirror),
            nodeName(t, game, change.to, mirror),
          ),
          null,
        ]
      case 'choose':
        return ['?', t.mirror.pickAPattern(t.catalog.components[change.type].name), null]
    }
  })()
  const hand = change._tag !== 'choose' && change.hand
  return h.div(
    [
      h.Key(`${index}`),
      h.Class(
        'grid grid-cols-[16px_1fr_auto] items-center gap-2 px-3 py-1 text-[calc(12.5px*var(--type-scale))]',
      ),
    ],
    [
      h.span([h.Class(cn(FIGURE, hand ? 'text-danger' : 'text-muted-foreground'))], [mark]),
      h.span([h.Class(cn('truncate', hand && 'text-danger'))], [hand ? t.mirror.hand(text) : text]),
      keep
        ? button({ onClick: keep, variant: 'ghost', size: 'xs' }, t.mirror.keepAsOverride, h)
        : h.span([], []),
    ],
  )
}

const dataChoices = (game: Game, mirror: Mirror, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const sources = game.nodes.filter(
    (node) => node.region === mirror.source && patternsFor(node.type).length > 0,
  )
  if (sources.length === 0) return h.empty
  return h.div(
    [h.Key('data'), h.Class('flex flex-col gap-1.5')],
    [
      heading(t.mirror.writes, h),
      ...sources.map((node) =>
        h.div(
          [h.Key(node.id), h.Class('grid grid-cols-[140px_1fr] items-center gap-3')],
          [
            h.span(
              [h.Class('text-[calc(12.5px*var(--type-scale))] font-medium')],
              [t.catalog.components[node.type].name],
            ),
            segmented(
              node.id,
              patternsFor(node.type).map(
                (pattern) => [pattern, patternLabelOf(t)[pattern]] as const,
              ),
              mirror.data[node.id] ?? null,
              (pattern) =>
                Message.MirrorDataPicked({
                  region: mirror.region,
                  source: node.id,
                  pattern: pattern ?? 'call',
                }),
              h,
            ),
          ],
        ),
      ),
    ],
  )
}

const overrides = (game: Game, mirror: Mirror, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const kept = Object.entries(mirror.overrides).flatMap(([nodeId, fields]) =>
    fields.map((field) => [nodeId, field as Managed] as const),
  )
  if (kept.length === 0) return h.empty
  return h.div(
    [h.Key('overrides'), h.Class('flex flex-col gap-1')],
    [
      heading(t.mirror.overrides, h),
      ...kept.map(([nodeId, field]) =>
        h.div(
          [
            h.Key(`${nodeId}:${field}`),
            h.Class(
              'flex items-center justify-between gap-2 px-1 text-[calc(12.5px*var(--type-scale))]',
            ),
          ],
          [
            h.span(
              [],
              [
                `${nodeName(t, game, nodeId, mirror)} · ${fieldLabelOf(t)[field]} ${valueText(t, field, game.nodes.find((node) => node.id === nodeId)?.[field])}`,
              ],
            ),
            button(
              {
                onClick: Message.MirrorOverrideSet({
                  region: mirror.region,
                  nodeId,
                  field,
                  keep: false,
                }),
                variant: 'ghost',
                size: 'xs',
              },
              t.mirror.remove,
              h,
            ),
          ],
        ),
      ),
    ],
  )
}

/** Burn per second the plan adds once it lands. Each Game computes it once, not every frame. */
const burnCache = new WeakMap<Game, number>()
const burnAdded = (game: Game, mirror: Mirror): number => {
  const cached = burnCache.get(game)
  if (cached !== undefined) return cached
  const added = solveFlow(previewApply(game, mirror.region)).burn - solveFlow(game).burn
  burnCache.set(game, added)
  return added
}

const mirrorSection = (game: Game, mirror: Mirror, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const drift = driftOf(game, mirror)
  const cost = applyCost(game, mirror)
  const burn = drift.changes.length > 0 ? burnAdded(game, mirror) : 0
  const changes = drift.changes
  const pending = isApplying(mirror.sync)
  const tool = game.iac ? IAC_TOOL_INFO[game.iac.tool] : null
  return h.section(
    [h.Key(`mirror-${mirror.region}`), h.Class('flex flex-col gap-3')],
    [
      h.div(
        [h.Class('flex flex-wrap items-baseline gap-x-3 gap-y-1')],
        [
          h.span(
            [h.Class('text-[calc(14px*var(--type-scale))] font-semibold')],
            [
              t.mirror.mirrorOf(
                t.catalog.regionInfo[mirror.region].name,
                t.catalog.regionInfo[mirror.source].name,
              ),
            ],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12.5px*var(--type-scale))]',
                  drift.hand > 0 ? 'text-danger' : drift.behind > 0 ? 'text-warn' : 'text-ok',
                ),
              ),
            ],
            [driftText(t, game, mirror, drift)],
          ),
        ],
      ),
      dataChoices(game, mirror, h),
      game.iac
        ? h.div(
            [h.Key('computed'), h.Class('grid grid-cols-[140px_1fr] items-center gap-3')],
            [
              h.span(
                [h.Class('text-[calc(12.5px*var(--type-scale))] font-medium')],
                [t.mirror.computedSizes],
              ),
              segmented(
                'computed',
                [
                  [false, t.mirror.off],
                  [true, t.mirror.followUsers],
                ] as const,
                mirror.computed,
                (computed) => Message.MirrorComputedSet({ region: mirror.region, computed }),
                h,
              ),
            ],
          )
        : h.empty,
      changes.length > 0
        ? h.div(
            [h.Key('plan'), h.Class(cn('flex flex-col py-1.5', WELL, SCROLL, 'max-h-[240px]'))],
            changes.map((change, index) => changeRow(game, mirror, change, index, h)),
          )
        : h.empty,
      overrides(game, mirror, h),
      h.div(
        [h.Class('flex flex-wrap items-center gap-2')],
        [
          button(
            {
              onClick: Message.MirrorApplied({ region: mirror.region, destroy: false }),
              isDisabled: pending || changes.length === 0 || drift.choices > 0,
              size: 'sm',
            },
            cost > 0 ? t.mirror.apply(money(cost)) : t.mirror.apply2,
            h,
          ),
          Math.abs(burn) >= 0.01
            ? h.span(
                [
                  h.Key('burn'),
                  h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground')),
                ],
                [t.mirror.burnS(burn > 0 ? '+' : '', money(burn))],
              )
            : h.empty,
          drift.data > 0
            ? button(
                {
                  onClick: Message.MirrorApplied({ region: mirror.region, destroy: true }),
                  isDisabled: pending || drift.choices > 0,
                  size: 'sm',
                  variant: 'destructive',
                },
                t.mirror.applyAndRemove(drift.data),
                h,
              )
            : h.empty,
          tool?.refresh
            ? button(
                {
                  onClick: Message.MirrorRefreshed({ region: mirror.region }),
                  isDisabled: pending,
                  size: 'sm',
                  variant: 'outline',
                },
                tool.repair ? t.mirror.checkDrift : t.mirror.refresh,
                h,
              )
            : h.empty,
          tool?.repair
            ? button(
                {
                  onClick: Message.MirrorRepaired({ region: mirror.region }),
                  isDisabled: pending,
                  size: 'sm',
                  variant: 'outline',
                },
                t.mirror.repair,
                h,
              )
            : h.empty,
          button(
            {
              onClick: Message.MirrorStopped({ region: mirror.region }),
              size: 'sm',
              variant: 'ghost',
              className: 'ml-auto',
            },
            t.mirror.stopMirroring,
            h,
          ),
        ],
      ),
    ],
  )
}

/** Regions the region on the board can mirror into, or mirror from when it is empty. */
const startSection = (game: Game, region: RegionId, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const open = openRegions(game)
  const mirrors = mirrorsOf(game)
  const isSource = (target: RegionId) => mirrors.some((mirror) => mirror.source === target)
  const empty = !game.nodes.some((node) => node.region === region && node.type !== 'users')
  const price = game.sandbox ? 0 : Math.round(OPEN_REGION_PRICE * eraOf(game).costIndex)
  const targets = empty
    ? open.filter((source) => source !== region && !mirrorOf(game, source))
    : REGIONS.filter((target) => target !== region && !mirrorOf(game, target) && !isSource(target))
  return h.section(
    [h.Key(`start-${region}`), h.Class('flex flex-col gap-2')],
    [
      heading(empty ? t.mirror.mirrorIntoFrom[region] : t.mirror.mirrorRegionInto[region], h),
      targets.length === 0
        ? h.span(
            [h.Class('px-1 text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
            [t.mirror.noRegionToPick],
          )
        : h.div(
            [h.Class('flex flex-wrap gap-2')],
            targets.map((other) =>
              button(
                {
                  onClick: empty
                    ? Message.MirrorStarted({ target: region, source: other })
                    : Message.MirrorStarted({ target: other, source: region }),
                  isDisabled: !game.iac,
                  size: 'sm',
                  variant: 'outline',
                },
                !empty && !open.includes(other)
                  ? `${t.catalog.regionInfo[other].name} · ${money(price)}`
                  : t.catalog.regionInfo[other].name,
                h,
              ),
            ),
          ),
    ],
  )
}

export const mirrorPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const region = model.board.region
  const mirror = mirrorOf(game, region)
  return shell(
    t.mirror.mirror,
    [],
    [
      h.div(
        [h.Class(cn('flex flex-col gap-5 px-5 pt-1 pb-5', SCROLL))],
        [
          toolCards(game, h),
          gitops(game, h),
          game.iac
            ? mirror
              ? mirrorSection(game, mirror, h)
              : startSection(game, region, h)
            : h.empty,
        ],
      ),
    ],
    'max-w-[680px]',
    h,
  )
}

/** The drift of the Mirror in a region, for its tab: 0 when in sync or not a Mirror. */
export const tabDrift = (game: Game, region: RegionId): number => {
  const mirror = mirrorOf(game, region)
  if (!mirror) return 0
  const drift = driftOf(game, mirror)
  return drift.behind + drift.hand
}
