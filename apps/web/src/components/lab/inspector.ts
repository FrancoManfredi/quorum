import { isDown } from '@quorum/simulation/life'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import {
  CACHE_ENGINES,
  CACHE_TTLS,
  CDN_TTLS,
  CHECK_INTERVALS,
  COLLECTORS,
  COMPONENTS,
  DEPLOY_STRATEGIES,
  DEPLOY_STRATEGY_IDS,
  GOGC,
  GPU_TYPES,
  CREDIT_CAP,
  DNS_TTLS,
  FAMILIES,
  FAMILY_IDS,
  FEATURES,
  FRAMEWORKS,
  FRAMEWORK_IDS,
  GATEWAY_LIMITS,
  KINDS,
  LB_POLICIES,
  MAX_ATTEMPTS,
  PM_MODES,
  PREFETCH,
  PRICING_FROM_STAGE,
  PRICING_IDS,
  PRICINGS,
  QUEUE_LENGTHS,
  OS_RAM,
  PARANOIA,
  PROFILES,
  REQUEST_KINDS,
  RT_HOLD_SECONDS,
  RUNTIMES,
  RUNTIME_IDS,
  SAMPLE_RATES,
  SCALE_MAXIMA,
  SCALE_TARGETS,
  SIZES,
  SPOT_WARNING,
  STANDBY_TYPES,
  TASKS,
  ZONES,
  type RequestKind,
  type RuntimeId,
  BACKUPS,
  DB_ENGINES,
  REGION_INFO,
  SHARD_COUNTS,
  STORAGE_CLASSES,
  STORAGE_IOPS,
  DB_RETENTIONS,
  CACHE_STRATEGIES,
  SEARCH_REFRESH,
  LIFECYCLE_DAYS,
  RESTORE_DRILL_DH,
  EDGE_CPU_MS,
  EDGE_MEMORY_MB,
  DOC_JOIN_COST,
  DOC_SHAPE_DH,
  LOG_ACKS,
  LOG_PARTITIONS,
  LOG_READ_RATE,
  LOG_RETENTION,
  VEC_AI_LIFT,
  VEC_INDEXES,
  VEC_QUERIES,
  SERVERLESS_CONCURRENCY,
  SERVERLESS_GB_SECOND,
  SERVERLESS_MEMORY_GB,
  SERVERLESS_REQUEST_PRICE,
  MESH_HOP_MS,
  MESH_OVERHEAD,
  MESH_INSIGHT,
  CERT_RENEW,
  ROLLOUT_STEPS,
} from '@quorum/simulation/catalog'
import { nodeLabel, nodeLabelOf } from '@quorum/simulation/labels'
import { isGlobal, openRegions, regional, regionUsers } from '@quorum/simulation/regions'
import { distributedErlang, edgeRuns, hubConnections } from '@quorum/simulation/rules'
import {
  badDeployShareOf,
  blastService,
  deploysPerDay,
  platformTax,
  quartersBehind,
  rolloutOf,
} from '@quorum/simulation/team'
import type { Limit } from '@quorum/simulation/capacity'
import type { Ledger, NodeLedger } from '@quorum/simulation/ledger'
import {
  burnOf,
  coldStartMs,
  drawerSize,
  edgeBurnOf,
  eraOf,
  frameworkReady,
  has,
  hasPricing,
  maxSize,
  pricingOf,
  ramOf,
  refundOf,
  replacePrice,
  resizePrice,
  runtimeReady,
  logReplicas,
  serverlessBurnOf,
  sizeLabel as sizeLabelOf,
  vcpuOf,
  zoned,
  agedShareOf,
  certDaysLeft,
  certDaysOf,
  meshMembers,
} from '@quorum/simulation/lookups'
import { LINK_TIMEOUTS } from '@quorum/simulation/actions'
import type {
  Acks,
  CacheEngine,
  DbEngine,
  Game,
  GameLink,
  GameNode,
  IopsClass,
  LbPolicy,
  PmMode,
  StorageClass,
  CacheStrategy,
  DbRetention,
  VecIndexType,
} from '@quorum/simulation/state'
import { compact, duration, money, ms, priceLabel, queueWait, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { hasTraffic, hintOf, sampleNode, TRAFFIC_KINDS } from '@/game/node-metrics.ts'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { packetMark } from '@quorum/ui/game/packets'
import { icon } from '@quorum/ui/primitives/icon'
import { badge } from '@quorum/ui/primitives/badge'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import {
  EYEBROW,
  FIGURE,
  NESTED,
  PANEL,
  SCROLL,
  WELL,
  groupBadge,
  meter,
  row,
  stackLogo,
} from '@quorum/ui/game/bits'

/* ==========================================================================
   The inspector: one Node up close. Its numbers and resources, its instance
   type, its Stack if it is an App Server, and the actions it offers.
   ========================================================================== */

const gauge = (
  name: string,
  used: number,
  total: number,
  value: string,
  h: HtmlBuilder<Message>,
  invert = false,
) => {
  const share = total > 0 ? Math.min(1, used / total) : 0
  const level = invert ? 1 - share : share
  const fill = level >= 0.9 ? 'bg-danger' : level >= 0.7 ? 'bg-warn' : 'bg-primary-fill'
  return h.div(
    [h.Key(name), h.Class('flex flex-col gap-1.5 py-0.5')],
    [
      h.div(
        [h.Class('flex items-baseline justify-between')],
        [
          h.span([h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')], [name]),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12px*var(--type-scale))]',
                  level >= 0.9 ? 'text-danger' : level >= 0.7 ? 'text-warn' : '',
                ),
              ),
            ],
            [value],
          ),
        ],
      ),
      meter(share, fill, h),
    ],
  )
}

/**
 * A folded section: the title alone until opened. Once the player has opened or
 * closed it, the browser owns that state, so a re-render on every Step leaves
 * the section as they left it. `open` forces it open while it holds, as a
 * pinned Tradeoff card does; when it stops holding, the fold is the player's
 * again.
 */
const section = (
  title: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
  open = false,
) =>
  h.details(
    [h.Key(title), ...(open ? [h.Open(true)] : []), h.Class('fold group px-4')],
    [
      h.summary(
        [
          h.Class(
            'flex cursor-pointer list-none items-center gap-1.5 py-2.5 hover:[&>span]:text-foreground [&::-webkit-details-marker]:hidden',
          ),
        ],
        [
          icon(
            h,
            ChevronRight,
            'fold-chevron size-3.5 shrink-0 text-muted-foreground group-open:rotate-90',
          ),
          h.span([h.Class(EYEBROW)], [title]),
        ],
      ),
      h.div([h.Class('flex flex-col gap-2 pb-3')], children),
    ],
  )

/** A segmented control: options sunk in a well, the chosen one raised. */
const segmented = (columns: string, children: ReadonlyArray<Html>, h: HtmlBuilder<Message>) =>
  h.div([h.Class(cn('grid gap-[3px] p-[3px]', WELL, 'rounded-[11px]', columns))], children)

const choice = (
  key: string,
  selected: boolean,
  ready: boolean,
  message: Message,
  children: ReadonlyArray<Html | string>,
  title: string,
  h: HtmlBuilder<Message>,
  /** Hovering previews the option on a Tradeoff card. */
  hover?: Message,
) =>
  h.button(
    [
      h.Key(key),
      h.Type('button'),
      h.Title(title),
      h.Disabled(!ready),
      h.AriaPressed(selected ? 'true' : 'false'),
      h.OnClick(message),
      ...(hover && !selected && ready
        ? [h.OnMouseEnter(hover), h.OnMouseLeave(Message.OptionLeft())]
        : []),
      h.Class(
        `flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-left text-[calc(12px*var(--type-scale))] font-medium transition-colors ${
          selected
            ? 'bg-raised text-foreground shadow-raised'
            : ready
              ? 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/45 [&_svg]:opacity-45 [&_svg]:grayscale'
        }`,
      ),
    ],
    children,
  )

const COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

/** One option set as a segmented control: each value with its label. */
const picker = <T extends string | number | boolean>(
  key: string,
  values: ReadonlyArray<readonly [T, string]>,
  current: T,
  message: (value: T) => Message,
  h: HtmlBuilder<Message>,
  ready: (value: T) => boolean = () => true,
  columns = COLUMNS[values.length] ?? 'grid-cols-4',
): Html =>
  segmented(
    columns,
    values.map(([value, label]) =>
      choice(
        `${key}-${String(value)}`,
        value === current,
        ready(value),
        message(value),
        [h.span([h.Class('w-full truncate text-center')], [label])],
        label,
        h,
      ),
    ),
    h,
  )

/** A control that buys one size at a time while its pointer stays down (15 "Bulk actions"). */
const holdListeners = (nodeId: string, h: HtmlBuilder<Message>) => [
  h.OnPointerDown(() => Option.some(Message.HoldStarted({ nodeId, now: Date.now() }))),
  h.OnPointerUp(() => Option.some(Message.HoldEnded({ nodeId }))),
  h.OnPointerLeave(() => Option.some(Message.HoldEnded({ nodeId }))),
]

const smallButton = (
  label: string,
  glyph: Parameters<typeof icon>[1],
  message: Message,
  enabled: boolean,
  h: HtmlBuilder<Message>,
  /** The Node it buys for, when holding it repeats the buy. */
  holdFor?: string,
) =>
  button(
    {
      onClick: message,
      isDisabled: !enabled,
      variant: 'outline',
      size: 'icon-sm',
      attributes: [
        h.AriaLabel(label),
        h.Title(label),
        ...(holdFor ? holdListeners(holdFor, h) : []),
      ],
    },
    icon(h, glyph, 'size-3.5'),
    h,
  )

const percent = (value: number) => `${Math.round(value * 100)}%`

/* ---------- warnings ---------- */

const callout = (
  text: string,
  tone: 'danger' | 'warn',
  action: Html | null,
  h: HtmlBuilder<Message>,
  className = '',
) =>
  h.div(
    [
      h.Key(text),
      h.Class(
        cn(
          'mx-4 mb-3 flex flex-col gap-2 rounded-xl px-3 py-2.5 text-[calc(12px*var(--type-scale))] leading-snug',
          tone === 'danger'
            ? 'bg-danger/8 text-danger shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--danger)_25%,transparent)]'
            : 'bg-warn/10 text-warn shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--warn)_28%,transparent)]',
          className,
        ),
      ),
    ],
    [h.span([], [text]), ...(action ? [action] : [])],
  )

const warnings = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const own = ledger.nodes[node.id]
  if (!own) return []
  const list: Array<Html> = []
  if (node.life._tag === 'Stopped') {
    const price = replacePrice(game, node)
    list.push(
      callout(
        'The host under this VM died. It still bills.',
        'danger',
        button(
          {
            onClick: Message.ReplaceBought({ nodeId: node.id }),
            isDisabled: game.cash < price,
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          ['Replace', h.span([h.Class(FIGURE)], [priceLabel(game.sandbox, price)])],
          h,
        ),
        h,
      ),
    )
  }
  if (own.stranded > 0.01) {
    const names = own.strandedKinds.map((kind) => KINDS[kind].label.toLowerCase()).join(', ')
    list.push(callout(`${rate(own.stranded)}/s of ${names} have nowhere to go.`, 'danger', null, h))
  }
  if (own.refused > 0.01)
    list.push(
      callout(`Refusing ${rate(own.refused)} queries/s: too many connections.`, 'danger', null, h),
    )
  if (own.swapping)
    list.push(callout('Out of RAM and swapping: every request is slower.', 'danger', null, h))
  if (own.throttled)
    list.push(callout('Out of CPU credits: throttled to 20% CPU.', 'warn', null, h))
  if (own.disk)
    list.push(callout('The working set does not fit in RAM: reads hit disk.', 'warn', null, h))
  if (node.leak > 0) {
    list.push(
      callout(
        `Memory grows: ${node.leak.toFixed(1)} GB leaked.`,
        'danger',
        button(
          {
            onClick: Message.RestartChosen({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [icon(h, RotateCcw, 'size-3.5'), 'Restart'],
          h,
        ),
        h,
      ),
    )
  }
  if (node.type === 'cluster' && !game.sandbox) {
    const upgrade = button(
      {
        onClick: Message.TaskQueued({ id: 'upgrade-cluster' }),
        variant: 'outline',
        size: 'sm',
        className: 'self-start',
      },
      [`Upgrade clusters · ${TASKS['upgrade-cluster'].dh} DH`],
      h,
    )
    if (game.incident?.kind === 'cluster-upgrade' && game.incident.nodeId === node.id)
      list.push(
        callout(
          'The provider is forcing an upgrade. Pods that use removed APIs crash.',
          'danger',
          upgrade,
          h,
        ),
      )
    else if (quartersBehind(game, node) > 0)
      list.push(
        callout(
          'Its Kubernetes version is out of support. The provider can force an upgrade.',
          'warn',
          upgrade,
          h,
        ),
      )
    if (platformTax(game) > 0)
      list.push(
        callout(
          `Clusters take ${platformTax(game)} engineers of Dev Hours. A Platform team takes that work.`,
          'warn',
          null,
          h,
        ),
      )
  }
  if (node.type === 'queue' && game.incident?.kind === 'poison' && game.incident.nodeId === node.id)
    list.push(
      callout(
        node.dlq
          ? 'A task keeps failing. The dead-letter queue holds it.'
          : 'A task keeps failing. Workers retry it forever.',
        node.dlq ? 'warn' : 'danger',
        node.dlq
          ? null
          : button(
              {
                onClick: Message.MessageDeleted(),
                variant: 'outline',
                size: 'sm',
                className: 'self-start text-danger',
              },
              ['Delete message'],
              h,
            ),
        h,
      ),
    )
  // A spot reclaim warns before it takes the Node (09 "Pricing models").
  if (game.incident?.kind === 'spot-reclaim' && game.incident.nodeId === node.id) {
    const left = Math.max(0, Math.ceil(SPOT_WARNING - (game.time - game.incident.startedAt)))
    list.push(
      callout(
        isDown(node.life)
          ? 'The provider reclaimed this Spot Node.'
          : `The provider reclaims this Spot Node in ${left} s. Replace it with on-demand.`,
        'danger',
        node.pricing === 'spot'
          ? button(
              {
                onClick: Message.PricingChosen({ nodeId: node.id, pricing: 'on-demand' }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start text-danger',
              },
              ['Switch to on-demand'],
              h,
            )
          : null,
        h,
      ),
    )
  }
  const fix = (text: string, label: string, message: Message) =>
    list.push(
      callout(
        text,
        'danger',
        button(
          { onClick: message, variant: 'outline', size: 'sm', className: 'self-start text-danger' },
          [label],
          h,
        ),
        h,
      ),
    )
  if (node.type === 'waf' && game.incident?.kind === 'regex')
    fix('A rule backtracks. CPU at 100%.', 'Disable rule', Message.RuleDisabled())
  if (node.type === 'database' && game.incident?.kind === 'report-db')
    fix('A report is scanning every table.', 'Cancel report', Message.ReportCancelled())
  if (
    node.type === 'database' &&
    game.incident?.kind === 'disk-full' &&
    game.incident.nodeId === node.id
  )
    fix('The disk is full. Writes fail.', 'Expand volume', Message.VolumeExpanded())
  if (node.type === 'waf' && game.incident?.kind === 'ddos' && !node.underAttack)
    list.push(
      callout(
        'A flood of junk traffic.',
        'danger',
        button(
          {
            onClick: Message.UnderAttackChosen({ nodeId: node.id, underAttack: true }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          ['Under attack'],
          h,
        ),
        h,
      ),
    )
  if (node.type === 'database' && game.incident?.kind === 'slow-query') {
    const analysed = has(game, 'query-analysis')
    list.push(
      callout(
        analysed
          ? 'A new query has no index. Every read scans the table.'
          : 'A new query has no index. Research Query analysis to find it.',
        'danger',
        analysed
          ? button(
              {
                onClick: Message.IndexAdded({ nodeId: node.id }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start text-danger',
              },
              ['Add index'],
              h,
            )
          : null,
        h,
      ),
    )
  }
  return list
}

/* ---------- numbers ---------- */

const stats = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const own = ledger.nodes[node.id]
  if (!own) return []
  switch (node.type) {
    case 'users': {
      const target = eraOf(game).apdexTarget
      return [
        row(
          'Users',
          compact(regional(game) ? regionUsers(game)[node.region] : game.users),
          'plain',
          h,
        ),
        row('Market', compact(ledger.market), 'plain', h),
        row('Requests', `${rate(ledger.demand)}/s`, 'plain', h),
        row('Apdex now', ledger.apdex.toFixed(3), ledger.apdex >= target ? 'ok' : 'danger', h),
        row('Apdex, last hour', game.apdex.toFixed(3), game.apdex >= target ? 'ok' : 'danger', h),
        row('Velocity', `${ledger.velocity.toFixed(2)}×`, 'plain', h),
      ]
    }
    case 'payments':
      return [
        row(
          'In the drawer',
          money(game.pending),
          game.pending >= drawerSize(game, ledger.revenue) * 0.98 ? 'warn' : 'plain',
          h,
        ),
        row('Drawer size', money(drawerSize(game, ledger.revenue)), 'plain', h),
        row('Spilled', money(game.spilled), game.spilled > 0 ? 'warn' : 'plain', h),
        row('Revenue', `${money(ledger.revenue)}/s`, 'ok', h),
        ...(ledger.subscriptions > 0
          ? [row('Subscriptions', `${money(ledger.subscriptions)}/s`, 'ok', h)]
          : []),
        row('Burn', `${money(ledger.burn)}/s`, 'plain', h),
        ...(ledger.salaries > 0
          ? [row('Salaries', `${money(ledger.salaries)}/s`, 'plain', h)]
          : []),
      ]
    case 'analytics':
      return [
        row('Sampling', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Kept',
          `${rate(Math.min(own.inbound, own.capacity))} / ${rate(own.capacity)}/s`,
          own.inbound > own.capacity ? 'warn' : 'plain',
          h,
        ),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    case 'ws': {
      // The Hub's limit is connections, not requests: each realtime message holds one open.
      const max = hubConnections(node, distributedErlang(game, node))
      const held = own.inbound * RT_HOLD_SECONDS
      return [
        row(
          'Connections',
          `${compact(Math.round(held))} / ${compact(Math.round(max))}`,
          max <= 0 || held >= max * 0.9 ? 'danger' : held >= max * 0.7 ? 'warn' : 'plain',
          h,
        ),
        row('Messages', `${rate(own.inbound)}/s`, 'plain', h),
        row('Latency', ms(own.latency), 'plain', h),
        row('Dropped', `${rate(own.dropped)}/s`, own.dropped > 0.05 ? 'danger' : 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'fn': {
      const slots = own.resources.slots
      const used = slots ? Math.min(slots.used, slots.total) : 0
      return [
        row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Executions',
          slots ? `${used.toFixed(1)} / ${compact(Math.round(slots.total))}` : '—',
          slots && used >= slots.total * 0.9 ? 'danger' : 'plain',
          h,
        ),
        row('Cold start', ms(coldStartMs(node)), 'plain', h),
        row(
          'Uses',
          `${money(serverlessBurnOf(game, node, own.inbound - own.dropped, own.latency))}/s`,
          'plain',
          h,
        ),
        row('Standing Burn', `${money(burnOf(game, node))}/s`, 'ok', h),
      ]
    }
    case 'edge': {
      const refused = !edgeRuns(node)
      return [
        row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
        row('Latency', ms(own.latency), 'plain', h),
        row('CPU ceiling', `${EDGE_CPU_MS} ms`, 'plain', h),
        row(
          'Stack',
          refused ? `${RUNTIMES[node.runtime].name} cannot run here` : RUNTIMES[node.runtime].name,
          refused ? 'danger' : 'plain',
          h,
        ),
        row('Uses', `${money(edgeBurnOf(game, node, own.inbound - own.dropped))}/s`, 'plain', h),
        row('Standing Burn', `${money(burnOf(game, node))}/s`, 'ok', h),
      ]
    }
    case 'doc': {
      // One flat rate of ops: a read or a write is one, and a join is three of them (07).
      const ops = (own.traffic['q-tx'] ?? 0) + (own.traffic['q-scan'] ?? 0)
      return [
        row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Load',
          own.inbound > 0
            ? `${percent(Math.min(own.utilization, 9.99))} of ${rate(own.capacity)} ops/s`
            : 'idle',
          own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
          h,
        ),
        row('Joins', `${rate(ops)}/s`, ops > 0 ? 'warn' : 'plain', h),
        row(
          'Transactions',
          node.transactions ? 'multi-document' : 'one document',
          node.transactions ? 'plain' : 'warn',
          h,
        ),
        row('Connections', 'none to pool', 'ok', h),
        row('Latency', ms(own.latency), 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'vec': {
      const index = VEC_INDEXES[node.indexType]
      return [
        row('Lookups', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Load',
          own.inbound > 0
            ? `${percent(Math.min(own.utilization, 9.99))} of ${rate(own.capacity)}/s`
            : 'idle',
          own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
          h,
        ),
        row('Index', index.name, 'plain', h),
        row('Recall', percent(index.recall), index.recall >= 1 ? 'ok' : 'warn', h),
        row('Latency', ms(own.latency), 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'log': {
      const lag = node.depth / Math.max(1, own.capacity)
      return [
        row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Lag',
          `${compact(Math.round(node.depth))} events`,
          node.depth > 0 ? 'warn' : 'plain',
          h,
        ),
        row(
          'Behind',
          node.depth < 1 ? 'caught up' : `${Math.round(lag)} s`,
          lag > node.retain ? 'danger' : lag > node.retain / 2 ? 'warn' : 'plain',
          h,
        ),
        row('Retention', retentionLabel(node.retain), lag > node.retain ? 'danger' : 'plain', h),
        row('Partitions', `${node.partitions}`, 'plain', h),
        row('Replicas', `${logReplicas(node)} · acks ${LOG_ACKS[node.acks].name}`, 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'ci': {
      const strategy = DEPLOY_STRATEGIES[node.strategy]
      return [
        row('Deploys', `${deploysPerDay(game).toFixed(1)}/day`, 'plain', h),
        row('Deploy time', `${strategy.deployMinutes} min`, 'plain', h),
        row(
          'Blast radius',
          `up to ${percent(strategy.blast)}`,
          strategy.blast >= 1 ? 'danger' : strategy.blast <= 0.05 ? 'ok' : 'plain',
          h,
        ),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    // It reads a Database's write log; its lag is the stream's backlog behind its consumers.
    case 'cdc': {
      const stream = game.nodes.find(
        (entry) =>
          entry.type === 'log' &&
          game.links.some((link) => link.from === node.id && link.to === entry.id),
      )
      const backlog = stream?.depth ?? 0
      const read = stream ? (ledger.nodes[stream.id]?.out.task ?? 0) : 0
      const behind = read > 0 ? backlog / read : 0
      return [
        row('Changes', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Load',
          own.inbound > 0
            ? `${percent(Math.min(own.utilization, 9.99))} of ${rate(own.capacity)}/s`
            : 'idle',
          own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
          h,
        ),
        row(
          'Lag',
          stream ? (backlog < 1 ? 'caught up' : `${Math.round(behind)} s behind`) : 'no stream',
          stream === undefined ? 'warn' : behind > stream.retain ? 'danger' : 'plain',
          h,
        ),
        row('Published', `${rate(own.out.task ?? 0)}/s`, 'plain', h),
        row('Latency', ms(own.latency), 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'mesh': {
      const members = meshMembers(game, node)
      const sidecars = members.length
      return [
        row('Sidecars', `${sidecars}`, sidecars === 0 ? 'warn' : 'plain', h),
        row('Per hop', `+${MESH_HOP_MS} ms`, 'plain', h),
        row('Member CPU', `−${percent(MESH_OVERHEAD)}`, 'plain', h),
        row('Insight', `+${percent(MESH_INSIGHT)} on its Links`, 'ok', h),
        row('Platform', `${platformTax(game).toFixed(1)} engineers`, 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'ff': {
      // The last deploy shipped each Service its own code: the blast is the Service that broke.
      const service = blastService(game)
      const batch = service.lastDeploy
      const rolled = batch.filter((feature) => rolloutOf(game, feature) < 1)
      const blast = badDeployShareOf(game, service)
      return [
        row('Service', service.name, 'plain', h),
        row('In the batch', `${batch.length}`, 'plain', h),
        row('Behind a flag', `${rolled.length}`, rolled.length > 0 ? 'ok' : 'plain', h),
        row(
          'Bad deploy',
          `up to ${percent(blast)} of its traffic`,
          blast >= 0.4 ? 'warn' : blast <= 0.1 ? 'ok' : 'plain',
          h,
        ),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    case 'pki': {
      const left = certDaysLeft(game)
      const life = certDaysOf(game)
      return [
        row('Lifetime', `${life} d`, 'plain', h),
        row(
          'Expires',
          left === null
            ? 'not issued yet'
            : left <= 0
              ? 'expired'
              : `in ${Math.max(0, Math.round(left))} d`,
          left === null ? 'warn' : left <= 1 ? 'danger' : left < 14 ? 'warn' : 'ok',
          h,
        ),
        row('Renews at', `${Math.round(life * CERT_RENEW)} d`, 'plain', h),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
    default: {
      const util = own.utilization
      return [
        row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
        row(
          'Load',
          own.inbound > 0 ? `${percent(util)} of ${rate(own.capacity)}/s` : 'idle',
          util >= 0.9 ? 'danger' : util >= 0.7 ? 'warn' : 'plain',
          h,
        ),
        row('Latency', ms(own.latency), 'plain', h),
        // What a Worker cannot take waits in its Queue: it is not lost.
        node.type === 'worker'
          ? row('Requeued', `${rate(own.dropped)}/s`, own.dropped > 0.05 ? 'warn' : 'plain', h)
          : row('Dropped', `${rate(own.dropped)}/s`, own.dropped > 0.05 ? 'danger' : 'plain', h),
        ...(own.hitRatio !== null ? [row('Hit ratio', percent(own.hitRatio), 'plain', h)] : []),
        ...(own.lag !== null ? [row('Lag', ms(own.lag), 'plain', h)] : []),
        row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
      ]
    }
  }
}

const LIMIT_NAME: Record<Limit, string> = {
  cpu: 'CPU',
  credits: 'CPU credits',
  memory: 'RAM',
  workers: 'Workers busy',
  connections: 'Connections',
  network: 'Network',
  disk: 'Disk IOPS',
  throughput: 'Throughput',
  none: 'Nothing',
}

/** One resource gauge's figures, as the Inspector draws them. */
type GaugeSpec = Readonly<{
  label: string
  used: number
  total: number
  text: string
  /** The bar reads the room left, as CPU credits do. */
  invert?: boolean
}>

/**
 * The gauges the Ledger can support for one Node (16 "Open gaps"): CPU, RAM,
 * worker slots, connections, CPU credits, and the network card. A limit with no
 * figure in the Ledger, such as disk IOPS or a flat Component's throughput, has
 * no entry here.
 */
const gaugesOf = (node: GameNode, own: NodeLedger) => {
  const { cpu, ram, slots, credits, network } = own.resources
  const gauges: Partial<Record<Limit, GaugeSpec>> = {}
  if (cpu)
    gauges.cpu = {
      label: 'CPU',
      used: cpu.used,
      total: cpu.total,
      text: `${cpu.used.toFixed(2)} / ${cpu.total.toFixed(1)} cores`,
    }
  if (ram)
    gauges.memory = {
      label: 'RAM',
      used: ram.used,
      total: ram.total,
      text: `${ram.used.toFixed(1)} / ${ram.total.toFixed(0)} GB`,
    }
  if (slots)
    gauges.workers = {
      label: node.type === 'fn' ? 'Executions' : 'Workers busy',
      used: slots.used,
      total: slots.total,
      text: `${slots.used.toFixed(1)} / ${slots.total}`,
    }
  if (own.connections)
    gauges.connections = {
      label: 'Connections',
      used: own.connections.used,
      total: own.connections.max,
      text: `${Math.round(own.connections.used)} / ${own.connections.max}`,
    }
  if (credits) {
    const cap = CREDIT_CAP * vcpuOf(node)
    gauges.credits = {
      label: 'CPU credits',
      used: credits.balance,
      total: cap,
      text: `${Math.round(credits.balance)} · ${credits.rate >= 0 ? '+' : ''}${credits.rate.toFixed(2)}/s`,
      invert: true,
    }
  }
  if (network)
    gauges.network = {
      label: 'Network',
      used: network.used,
      total: network.total,
      text: `${(network.used / 1_000).toFixed(1)} / ${(network.total / 1_000).toFixed(0)} MB/s`,
    }
  return gauges
}

const resources = (
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const own = ledger.nodes[node.id]
  if (!own) return []
  const gauges = gaugesOf(node, own)
  const list: Array<Html> = []
  // The goal bar names the tightest limit, and the gauge behind it when the Ledger has one.
  const tight = gauges[own.limit]
  if (own.limit === 'none') list.push(row('Limit', 'Nothing tight', 'ok', h))
  else if (tight)
    list.push(gauge(`Limit · ${tight.label}`, tight.used, tight.total, tight.text, h, tight.invert))
  // The Inspector says so rather than leaving a limit unexplained.
  else list.push(row('Limit', `${LIMIT_NAME[own.limit]} · no gauge`, 'warn', h))
  for (const limit of ['cpu', 'memory', 'workers', 'connections', 'credits', 'network'] as const) {
    const spec = gauges[limit]
    if (spec) list.push(gauge(spec.label, spec.used, spec.total, spec.text, h, spec.invert))
  }
  return list.length > 0 ? [section('Resources', list, h)] : []
}

const sparkline = (
  points: ReadonlyArray<number>,
  h: HtmlBuilder<Message>,
  options: Readonly<{
    selected?: number
    onPick?: (index: number) => Message
    label?: string
  }> = {},
): Html => {
  const width = 300
  const height = 44
  const top = Math.max(1, ...points)
  const x = (index: number) => (index / Math.max(1, points.length - 1)) * width
  const y = (value: number) => height - (Math.min(value, top) / top) * height
  const path = points.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const limit = height - (1 / top) * height
  const selected =
    options.selected !== undefined && options.selected >= 0 && options.selected < points.length
      ? options.selected
      : null
  const onPick = options.onPick
  return h.svg(
    [
      h.Class(cn('h-11 w-full', selected !== null ? 'overflow-visible' : '')),
      h.Attribute('viewBox', `0 0 ${width} ${height}`),
      h.Attribute('preserveAspectRatio', 'none'),
      ...(options.label ? [h.AriaLabel(options.label)] : []),
    ],
    [
      h.line([
        h.Attribute('x1', '0'),
        h.Attribute('x2', String(width)),
        h.Attribute('y1', String(limit)),
        h.Attribute('y2', String(limit)),
        h.Attribute('stroke', 'var(--danger)'),
        h.Attribute('stroke-dasharray', '3 3'),
        h.Attribute('stroke-width', '1'),
      ]),
      h.polyline([
        h.Attribute('points', path),
        h.Attribute('fill', 'none'),
        h.Attribute('stroke', 'var(--primary-strong)'),
        h.Attribute('stroke-width', '1.5'),
      ]),
      ...(selected !== null
        ? [
            h.line([
              h.Attribute('x1', String(x(selected))),
              h.Attribute('x2', String(x(selected))),
              h.Attribute('y1', '0'),
              h.Attribute('y2', String(height)),
              h.Attribute('stroke', 'var(--muted-foreground)'),
              h.Attribute('stroke-width', '1'),
            ]),
            h.circle([
              h.Attribute('cx', String(x(selected))),
              h.Attribute('cy', String(y(points[selected] ?? 0))),
              h.Attribute('r', '2.5'),
              h.Attribute('fill', 'var(--foreground)'),
            ]),
          ]
        : []),
      ...(onPick
        ? points.map((_, index) => {
            const left = index === 0 ? 0 : x(index - 0.5)
            const right = index === points.length - 1 ? width : x(index + 0.5)
            return h.rect([
              h.Attribute('x', String(left)),
              h.Attribute('y', '0'),
              h.Attribute('width', String(right - left)),
              h.Attribute('height', String(height)),
              h.Attribute('fill', 'transparent'),
              h.Class('cursor-crosshair'),
              h.OnClick(onPick(index)),
            ])
          })
        : []),
    ],
  )
}

/* ---------- instance and Stack ---------- */

/** A compute Node's pricing model, from Series A on (09 "Pricing models"). */
const pricing = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const current = pricingOf(game, node)
  const term =
    current === 'reserved' && node.pricingUntil !== null
      ? Math.ceil((node.pricingUntil - game.time) / 1_440)
      : null
  return h.div(
    [h.Class('flex flex-col gap-1.5 pt-1')],
    [
      h.span(
        [h.Class(cn(EYEBROW, 'px-1 text-muted-foreground'))],
        [term === null ? 'Pricing' : `Pricing · reserved for ${term} more d`],
      ),
      segmented(
        'grid-cols-3',
        PRICING_IDS.map((id) =>
          choice(
            id,
            current === id,
            true,
            Message.PricingChosen({ nodeId: node.id, pricing: id }),
            [h.span([h.Class('w-full text-center')], [PRICINGS[id].name])],
            PRICINGS[id].blurb,
            h,
          ),
        ),
        h,
      ),
    ],
  )
}

/**
 * One size on every Node of this Node's kind in its region (15 "Bulk actions").
 * It shows once there is more than one to upgrade, and stays off while nothing
 * can grow or nothing can be paid for.
 */
const upgradeAll = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const peers = game.nodes.filter(
    (entry) => entry.type === node.type && entry.region === node.region,
  )
  if (peers.length < 2) return h.empty
  const name = COMPONENTS[node.type].name
  const growable = peers.filter((entry) => entry.size < maxSize(entry))
  const payable = growable.some((entry) => {
    const price = resizePrice(game, entry)
    return price !== null && (game.sandbox || game.cash >= price)
  })
  return h.div(
    [h.Class('px-4 py-3')],
    [
      button(
        {
          onClick: Message.UpgradeAllChosen({ nodeId: node.id }),
          isDisabled: !payable,
          variant: 'outline',
          size: 'sm',
          className: 'w-full justify-between',
          attributes: [
            h.AriaLabel(`Upgrade every ${name} here`),
            h.Title(`One size on every ${name} on this board`),
          ],
        },
        [
          h.span(
            [h.Class('flex items-center gap-1.5')],
            [
              icon(h, ArrowUp, 'size-3.5'),
              growable.length > 0 ? `Upgrade all ${growable.length}` : 'Upgrade all',
            ],
          ),
        ],
        h,
      ),
    ],
  )
}

const instance = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const price = resizePrice(game, node)
  return section(
    'Instance',
    [
      h.div(
        [h.Class(cn('flex items-center justify-between gap-2 p-1', WELL))],
        [
          smallButton(
            'Smaller (free)',
            Minus,
            Message.ResizeChosen({ nodeId: node.id, direction: -1 }),
            node.size > 0,
            h,
          ),
          h.span(
            [h.Class(cn(FIGURE, 'flex-1 text-center text-[calc(12.5px*var(--type-scale))]'))],
            [`${SIZES[node.size]?.name ?? ''} · ${vcpuOf(node)} vCPU · ${ramOf(node)} GB`],
          ),
          smallButton(
            price === null ? 'Largest size' : game.sandbox ? 'Larger' : `Larger · ${money(price)}`,
            Plus,
            Message.ResizeChosen({ nodeId: node.id, direction: 1 }),
            price !== null && game.cash >= price,
            h,
            node.id,
          ),
        ],
      ),
      h.div(
        [h.Class('flex items-center gap-2 px-1 pt-1')],
        [
          smallButton(
            'Buy ten sizes',
            ChevronsRight,
            Message.BulkResizeChosen({ nodeId: node.id, mode: 'ten' }),
            price !== null && game.cash >= price,
            h,
          ),
          smallButton(
            'Buy to the largest size',
            ArrowUp,
            Message.BulkResizeChosen({ nodeId: node.id, mode: 'max' }),
            price !== null && game.cash >= price,
            h,
          ),
        ],
      ),
      segmented(
        'grid-cols-4',
        FAMILY_IDS.map((id) =>
          choice(
            id,
            node.family === id,
            true,
            Message.OptionChosen({ nodeId: node.id, option: { kind: 'family', id } }),
            [h.span([h.Class('w-full text-center')], [FAMILIES[id].name])],
            FAMILIES[id].blurb,
            h,
            Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'family', id } }),
          ),
        ),
        h,
      ),
      ...(hasPricing(node) && game.stage >= PRICING_FROM_STAGE ? [pricing(game, node, h)] : []),
    ],
    h,
  )
}

const stack = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
  reviewingRuntime: RuntimeId | null,
): ReadonlyArray<Html> => {
  const runtime = RUNTIMES[node.runtime]
  const frameworks = FRAMEWORK_IDS.filter(
    (id) => id === 'none' || FRAMEWORKS[id].language === runtime.language,
  )
  const fit = Math.max(
    0,
    Math.floor(
      ((ramOf(node) - OS_RAM - (node.localDb ? 1 : 0)) * 1024) /
        (runtime.memory + FRAMEWORKS[node.framework].memory),
    ),
  )
  return [
    section(
      'Runtime',
      [
        segmented(
          'grid-cols-2',
          RUNTIME_IDS.map((id) =>
            choice(
              id,
              node.runtime === id,
              runtimeReady(game, id),
              Message.OptionChosen({ nodeId: node.id, option: { kind: 'runtime', id } }),
              [
                stackLogo(RUNTIMES[id].language, 'size-4', h),
                h.span([h.Class('truncate')], [RUNTIMES[id].name]),
                ...(reviewingRuntime === id
                  ? [
                      h.span(
                        [h.Class('text-[calc(10px*var(--type-scale))] text-group-compute')],
                        ['Proposed'],
                      ),
                    ]
                  : []),
              ],
              runtimeReady(game, id)
                ? RUNTIMES[id].blurb
                : `Research ${RUNTIMES[id].name} to unlock`,
              h,
              Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'runtime', id } }),
            ),
          ),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [runtime.blurb],
        ),
      ],
      h,
      reviewingRuntime !== null,
    ),
    ...(runtime.pool
      ? [
          section(
            'Pool size',
            [
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  smallButton(
                    'Fewer workers',
                    Minus,
                    Message.WorkersChosen({
                      nodeId: node.id,
                      workers: Math.max(1, Math.round(node.workers * 0.75)),
                    }),
                    node.workers > 1,
                    h,
                  ),
                  h.span(
                    [h.Class(cn(FIGURE, 'w-12 text-center text-[calc(13px*var(--type-scale))]'))],
                    [String(node.workers)],
                  ),
                  smallButton(
                    'More workers',
                    Plus,
                    Message.WorkersChosen({
                      nodeId: node.id,
                      workers: Math.max(node.workers + 1, Math.round(node.workers * 1.5)),
                    }),
                    true,
                    h,
                  ),
                  h.span(
                    [
                      h.Class(
                        `ml-auto ${FIGURE} text-[calc(11.5px*var(--type-scale))] ${node.workers > fit ? 'text-danger' : 'text-muted-foreground'}`,
                      ),
                    ],
                    [`RAM fits ${fit}`],
                  ),
                ],
              ),
            ],
            h,
          ),
        ]
      : []),
    section(
      'Framework',
      [
        segmented(
          'grid-cols-2',
          frameworks.map((id) =>
            choice(
              id,
              node.framework === id,
              frameworkReady(game, id),
              Message.OptionChosen({ nodeId: node.id, option: { kind: 'framework', id } }),
              [
                id === 'none' ? h.empty : stackLogo(id, 'size-4', h),
                h.span([h.Class('truncate')], [FRAMEWORKS[id].name]),
              ],
              frameworkReady(game, id)
                ? FRAMEWORKS[id].blurb
                : `Research ${FRAMEWORKS[id].name} to unlock`,
              h,
              Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'framework', id } }),
            ),
          ),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [FRAMEWORKS[node.framework].blurb],
        ),
      ],
      h,
    ),
    ...(node.runtime === 'php_fpm'
      ? [
          section(
            'Process manager',
            [
              picker(
                'pm',
                (Object.keys(PM_MODES) as ReadonlyArray<PmMode>).map(
                  (pm) => [pm, PM_MODES[pm].label] as const,
                ),
                node.pm,
                (pm) => Message.PmChosen({ nodeId: node.id, pm }),
                h,
              ),
            ],
            h,
          ),
        ]
      : []),
    ...(has(game, 'gzip')
      ? [
          section(
            'Compression',
            [
              picker(
                'gzip',
                [
                  [false, 'Off'],
                  [true, 'Gzip'],
                ],
                node.compress,
                (compress) => Message.CompressionChosen({ nodeId: node.id, compress }),
                h,
              ),
            ],
            h,
          ),
        ]
      : []),
  ]
}

/** The runtime a Realtime Hub holds its connections on: the per-connection cost is the whole model. */
const hubStack = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const runtime = RUNTIMES[node.runtime]
  return section(
    'Runtime',
    [
      picker(
        'runtime',
        RUNTIME_IDS.map((id) => [id, RUNTIMES[id].name] as const),
        node.runtime,
        (id) => Message.OptionChosen({ nodeId: node.id, option: { kind: 'runtime', id } }),
        h,
        (id) => runtimeReady(game, id),
      ),
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [runtime.blurb],
      ),
      caption(
        runtime.connectionKB === null
          ? `${runtime.name} holds no connections. Pick a runtime that does.`
          : `Holds about ${compact(hubConnections(node, distributedErlang(game, node)))} connections.`,
        h,
      ),
    ],
    h,
  )
}

const sampler = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Sample rate',
    [
      segmented(
        'grid-cols-5',
        SAMPLE_RATES.map((value) =>
          choice(
            String(value),
            node.sampleRate === value,
            true,
            Message.SampleChosen({ nodeId: node.id, sampleRate: value }),
            [h.span([h.Class('w-full text-center')], [`${Math.round(value * 100)}%`])],
            'More samples: more Insight, more CPU on sampled Nodes, more storage Burn',
            h,
          ),
        ),
        h,
      ),
    ],
    h,
  )

/** A Node's name, numbered when the Design has more than one of its kind. */
const nodeCaption = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const label = nodeLabelOf(game, node)
  return h.span([], [label.name, ...(label.ordinal > 0 ? [` ${label.ordinal}`] : [])])
}

/** A Node's name as a button that reveals it on the Board. */
const nodeLink = (game: Game, node: GameNode, h: HtmlBuilder<Message>, className = ''): Html => {
  const label = nodeLabelOf(game, node)
  return h.button(
    [
      h.Type('button'),
      h.OnClick(Message.RevealNode({ nodeId: node.id })),
      h.AriaLabel(`Open ${nodeLabel(game, node)}`),
      h.Class(
        cn(
          'flex min-w-0 items-center gap-1 text-left text-[12px] font-medium text-muted-foreground hover:text-foreground',
          className,
        ),
      ),
    ],
    [
      h.span(
        [h.Class('truncate')],
        [label.name, ...(label.ordinal > 0 ? [` ${label.ordinal}`] : [])],
      ),
      icon(h, ChevronRight, 'size-3.5 shrink-0'),
    ],
  )
}

/** The routing Links out of a Node, with the Node at the far end. */
const outbound = (game: Game, node: GameNode): ReadonlyArray<readonly [GameLink, GameNode]> =>
  game.links.flatMap((link) => {
    const target = game.nodes.find((entry) => entry.id === link.to)
    return link.from === node.id && target && !COMPONENTS[target.type].tap
      ? [[link, target] as const]
      : []
  })

const caption = (text: string, h: HtmlBuilder<Message>): Html =>
  h.span([h.Class('text-[calc(12px*var(--type-scale))] font-medium text-muted-foreground')], [text])

const loadBalancer = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const checked = has(game, 'health-checks')
  const policies = Object.entries(LB_POLICIES) as ReadonlyArray<
    readonly [LbPolicy, (typeof LB_POLICIES)[LbPolicy]]
  >
  return [
    section(
      'Policy',
      [
        picker(
          'policy',
          policies.map(([policy, entry]) => [policy, entry.label] as const),
          node.policy,
          (policy) => Message.PolicyChosen({ nodeId: node.id, policy }),
          h,
          (policy) => {
            const research = LB_POLICIES[policy].research
            return research === null || has(game, research)
          },
          'grid-cols-2',
        ),
      ],
      h,
    ),
    section(
      'Health checks',
      [
        picker(
          'check-every',
          CHECK_INTERVALS.map((seconds) => [seconds, `${seconds} s`] as const),
          node.checkEvery,
          (checkEvery) => Message.HealthCheckChosen({ nodeId: node.id, checkEvery }),
          h,
          (seconds) => checked || seconds === 10,
        ),
        picker(
          'deep-check',
          [
            [false, 'Shallow'],
            [true, 'Deep'],
          ],
          node.deepCheck,
          (deepCheck) => Message.HealthCheckChosen({ nodeId: node.id, deepCheck }),
          h,
          (deep) => checked || !deep,
        ),
      ],
      h,
    ),
    section(
      'Routes',
      outbound(game, node).map(([link, target]) => {
        const carried = link.kinds ?? REQUEST_KINDS
        const toggled = (kind: RequestKind) => {
          const next = carried.includes(kind)
            ? carried.filter((entry) => entry !== kind)
            : REQUEST_KINDS.filter((entry) => entry === kind || carried.includes(entry))
          return next.length === REQUEST_KINDS.length ? null : next
        }
        return h.div(
          [h.Key(link.to), h.Class('flex flex-col gap-1.5')],
          [
            nodeLink(game, target, h),
            segmented(
              'grid-cols-4',
              REQUEST_KINDS.map((kind) => {
                const next = toggled(kind)
                return choice(
                  `${link.to}-${kind}`,
                  carried.includes(kind),
                  next === null || next.length > 0,
                  Message.LinkKindsChosen({ from: node.id, to: link.to, kinds: next }),
                  [h.span([h.Class('w-full truncate text-center')], [KIND_SHORT[kind]])],
                  KINDS[kind].label,
                  h,
                )
              }),
              h,
            ),
          ],
        )
      }),
      h,
    ),
  ]
}

const KIND_SHORT: Record<RequestKind, string> = {
  page: 'Page',
  bid: 'Bid',
  read: 'Read',
  write: 'Write',
  login: 'Login',
  search: 'Search',
  upload: 'Upload',
  bot: 'Bot',
  media: 'Media',
  rt: 'Realtime',
  buy: 'Buy',
  job: 'Export',
  report: 'Report',
  ai: 'AI',
  feed: 'Feed',
  hook: 'Webhook',
  push: 'Push',
}

/** The Links that route traffic into a Node. Taps and control Links are separate. */
const inboundLinks = (game: Game, node: GameNode): ReadonlyArray<readonly [GameLink, GameNode]> =>
  game.links.flatMap((link) => {
    const source = game.nodes.find((entry) => entry.id === link.from)
    return link.to === node.id &&
      source &&
      !COMPONENTS[source.type].control &&
      !COMPONENTS[source.type].tap
      ? [[link, source] as const]
      : []
  })

/** The routing settings that live on the source Node. */
const routeSummaryOf = (node: GameNode): string => {
  switch (node.type) {
    case 'lb':
      return `${LB_POLICIES[node.policy].label} · checks every ${duration(node.checkEvery)}${
        node.deepCheck ? ' · deep' : ''
      }`
    case 'dns':
      return `TTL ${duration(node.ttl)}`
    case 'cdn':
      return `TTL ${duration(node.ttl)}`
    case 'waf':
      return `Paranoia ${node.paranoia}${node.underAttack ? ' · under attack' : ''}`
    case 'users':
      return 'Where traffic starts'
    default:
      return COMPONENTS[node.type].name
  }
}

const kindsOf = (link: GameLink): string =>
  link.kinds === null ? 'Every kind' : link.kinds.map((kind) => KIND_SHORT[kind]).join(', ')

const liveRateOf = (ledger: Ledger, from: string, to: string): number =>
  ledger.links.find((link) => link.from === from && link.to === to)?.rate ?? 0

/** The always-visible answer to "what routes to this Node?" */
const inboundSummary = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const links = inboundLinks(game, node)
  if (links.length === 0) return []
  return [
    h.div(
      [h.Class('flex flex-col gap-1.5 px-4 pb-2')],
      [
        h.p([h.Class(`${EYEBROW} text-muted-foreground`)], ['Inbound']),
        ...links.map(([link, source]) => {
          const live = liveRateOf(ledger, source.id, node.id)
          return h.button(
            [
              h.Key(`in-${source.id}`),
              h.Type('button'),
              h.OnClick(Message.RevealNode({ nodeId: source.id })),
              h.AriaLabel(`Open ${nodeLabel(game, source)}`),
              h.Class(
                'flex w-full items-center gap-2 rounded-lg bg-well px-2.5 py-2 text-left transition-colors hover:bg-foreground/5',
              ),
            ],
            [
              h.span(
                [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
                [
                  h.span(
                    [h.Class('flex items-center gap-1 text-[12px] font-medium')],
                    [
                      nodeCaption(game, source, h),
                      icon(h, ChevronRight, 'size-3.5 shrink-0 text-muted-foreground'),
                    ],
                  ),
                  h.span(
                    [h.Class('text-[11px] text-muted-foreground')],
                    [`${routeSummaryOf(source)} · ${kindsOf(link)}`],
                  ),
                ],
              ),
              live > 0.01
                ? h.span(
                    [h.Class(`${FIGURE} text-[11px] text-muted-foreground`)],
                    [`${rate(live)}/s`],
                  )
                : h.empty,
            ],
          )
        }),
      ],
    ),
  ]
}

const dnsTtl = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'TTL',
    [
      picker(
        'ttl',
        DNS_TTLS.map((ttl) => [ttl, duration(ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

const cache = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Cache',
    [
      picker(
        'strategy',
        (Object.keys(CACHE_STRATEGIES) as ReadonlyArray<CacheStrategy>).map(
          (id) => [id, CACHE_STRATEGIES[id].name] as const,
        ),
        node.cacheStrategy,
        (cacheStrategy) => Message.CacheStrategyChosen({ nodeId: node.id, cacheStrategy }),
        h,
        (id) => id === 'aside' || has(game, 'cache-strategies'),
        'grid-cols-2',
      ),
      caption(
        CACHE_STRATEGIES[node.cacheStrategy].write === 'ahead'
          ? 'A write returns from the Cache and reaches the Database late. A crash loses what has not flushed.'
          : CACHE_STRATEGIES[node.cacheStrategy].write === 'through'
            ? 'Every write goes to the Cache and the Database together: fresher, and a write longer.'
            : 'Reads come from the Cache, writes go around it. A miss can store an old row until the TTL.',
        h,
      ),
      ...(has(game, 'stampede-protection')
        ? [
            picker(
              'coalesce',
              [
                [false, 'Every miss'],
                [true, 'Coalesce'],
              ],
              node.coalesce,
              (coalesce) => Message.CacheGuardChosen({ nodeId: node.id, coalesce }),
              h,
            ),
          ]
        : []),
      ...(has(game, 'cache-warming')
        ? [
            picker(
              'warming',
              [
                [false, 'Cold start'],
                [true, 'Warm start'],
              ],
              node.warming,
              (warming) => Message.CacheGuardChosen({ nodeId: node.id, warming }),
              h,
            ),
          ]
        : []),
      picker(
        'engine',
        (Object.keys(CACHE_ENGINES) as ReadonlyArray<CacheEngine>).map(
          (engine) => [engine, CACHE_ENGINES[engine].name] as const,
        ),
        node.engine,
        (engine) => Message.CacheEngineChosen({ nodeId: node.id, engine }),
        h,
      ),
      picker(
        'cache-ttl',
        CACHE_TTLS.map((entry) => [entry.ttl, duration(entry.ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

/** A Database's or Read Replica's engine (07 "Variants"). */
const engine = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Engine',
    [
      picker(
        'db-engine',
        (Object.keys(DB_ENGINES) as ReadonlyArray<DbEngine>).map(
          (id) => [id, DB_ENGINES[id].name] as const,
        ),
        node.dbEngine,
        (dbEngine) => Message.DbEngineChosen({ nodeId: node.id, dbEngine }),
        h,
        () => true,
        'grid-cols-2',
      ),
      caption(
        `${DB_ENGINES[node.dbEngine].connections} connections: Postgres forks a process for each, MySQL gives it a thread.`,
        h,
      ),
    ],
    h,
  )

/** A Database's engine, its volume, and its shards (07 "Variants", "Capacity", "Partitioning"). */
const database = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const volume = STORAGE_IOPS[node.iops]
  const iops = `${volume.iops / 1_000}k`
  const shards = Math.max(1, Math.floor(node.shards))
  return [
    engine(node, h),
    section(
      'Volume',
      [
        picker(
          'volume',
          (Object.keys(STORAGE_IOPS) as ReadonlyArray<IopsClass>).map(
            (id) => [id, STORAGE_IOPS[id].name] as const,
          ),
          node.iops,
          (chosen) => Message.StorageIopsChosen({ nodeId: node.id, iops: chosen }),
          h,
          () => true,
          'grid-cols-2',
        ),
        caption(
          `${iops} IOPS at ${volume.burn}× the box's Burn. Reads that miss the buffer cache and every write wait on it.`,
          h,
        ),
      ],
      h,
    ),
    section(
      'Shards',
      [
        picker(
          'shards',
          SHARD_COUNTS.map((count) => [count, `${count}`] as const),
          shards,
          (chosen) => Message.ShardsChosen({ nodeId: node.id, shards: chosen }),
          h,
          (count) => count === 1 || has(game, 'sharding'),
          'grid-cols-4',
        ),
        caption(
          shards > 1
            ? `Writes divide across ${shards} shards, and each one bills. A transaction across shards costs 3×.`
            : 'One primary: a Read Replica is what takes the reads off it.',
          h,
        ),
      ],
      h,
    ),
    section(
      'Retention',
      [
        picker(
          'retention-policy',
          (Object.keys(DB_RETENTIONS) as ReadonlyArray<DbRetention>).map(
            (id) => [id, DB_RETENTIONS[id].name] as const,
          ),
          node.keep,
          (keep) => Message.DbRetentionChosen({ nodeId: node.id, keep }),
          h,
          (id) => id === 'keep' || has(game, 'retention'),
          'grid-cols-3',
        ),
        caption(
          node.keep === 'archive'
            ? 'Old rows move to cheap storage: the bill falls, and a report waits on the restore.'
            : node.keep === 'delete'
              ? 'Old rows are gone: the bill falls, and a report rebuilds its figures at three times the scan.'
              : 'Every row stays on the fast tier and bills for it.',
          h,
        ),
      ],
      h,
    ),
  ]
}

/** Object Storage's class and lifecycle (07 "Object Storage"): price against retrieval. */
const storage = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Storage class',
    [
      picker(
        'storage-class',
        (Object.keys(STORAGE_CLASSES) as ReadonlyArray<StorageClass>).map(
          (id) => [id, STORAGE_CLASSES[id].name] as const,
        ),
        node.storageClass,
        (storageClass) => Message.StorageClassChosen({ nodeId: node.id, storageClass }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        STORAGE_CLASSES[node.storageClass].archived
          ? 'Cheapest to keep. Media reads fail as timeout until the objects are restored.'
          : STORAGE_CLASSES[node.storageClass].retrieval > 0
            ? `Half the storage price, and $${STORAGE_CLASSES[node.storageClass].retrieval} per GB read back.`
            : 'Full storage price. Reads come back at once.',
        h,
      ),
    ],
    h,
  ),
  section(
    'Lifecycle',
    [
      picker(
        'lifecycle',
        LIFECYCLE_DAYS.map((days) => [days, days === 0 ? 'Off' : `${days} d`] as const),
        node.lifecycle,
        (lifecycle) => Message.LifecycleChosen({ nodeId: node.id, lifecycle }),
        h,
        (days) => days === 0 || has(game, 'lifecycle-rules'),
      ),
      caption(
        node.lifecycle > 0
          ? `${Math.round(agedShareOf(game, node.lifecycle) * 100)}% of the store is older than ${node.lifecycle} days and moves one class cheaper. A read of an archived object fails.`
          : 'Every object keeps the class above, however old it is.',
        h,
      ),
    ],
    h,
  ),
]

/** A Search Engine's refresh interval (07 "Search Engine"): fresher answers cost indexing CPU. */
const search = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Refresh',
    [
      picker(
        'refresh',
        SEARCH_REFRESH.map((entry) => [entry.seconds, `${entry.seconds} s`] as const),
        node.refresh,
        (refresh) => Message.SearchRefreshChosen({ nodeId: node.id, refresh }),
        h,
      ),
      caption(
        node.refresh <= 1
          ? 'A new document is searchable within a second, at the cost of indexing CPU.'
          : `A new document waits up to ${node.refresh} s: indexing is cheaper, and answers are staler.`,
        h,
      ),
    ],
    h,
  )

/**
 * How long an Event Stream keeps a message, as a calendar reads: one sim second is one calendar
 * minute, so 1,440 sim seconds are a day.
 */
const retentionLabel = (seconds: number): string =>
  seconds >= 1_440
    ? `${Math.round((seconds / 1_440) * 10) / 10} d`
    : `${Math.round(seconds / 60)} h`

/** A Document Store's transactions, and the access patterns its Dev Hours buy (07). */
const documents = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Transactions',
    [
      picker(
        'transactions',
        [
          [false, 'One document'],
          [true, 'Multi-document'],
        ],
        node.transactions,
        (transactions) => Message.DocOptionsChosen({ nodeId: node.id, transactions }),
        h,
      ),
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          'A checkout writes several documents. Without multi-document transactions one can land without the others, and a retry charges the card again; with them every write waits for the rest, at half again its latency.',
        ],
      ),
    ],
    h,
    true,
  ),
  section(
    'Access patterns',
    [
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          `There are no joins: a query that spans documents is a scan, at ${DOC_JOIN_COST}× the ops, and each new pattern a Feature needs is its own collection and index to write. A Feature that changes the data shape costs ${Math.round((1 - DOC_SHAPE_DH) * 100)}% fewer Dev Hours, because there is no migration; the rest cost a little more.`,
        ],
      ),
      caption(
        'The Team panel charges the Dev Hours. The Database is the other side of this trade: joins and schemas, at the price of migrations.',
        h,
      ),
    ],
    h,
  ),
]

/** A Vector Index's type: its recall, its lookups, and the memory it bills (07). */
const vector = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const index = VEC_INDEXES[node.indexType]
  const prompts = game.nodes.filter(
    (entry) => entry.type === 'server' || entry.type === 'worker' || entry.type === 'fn',
  )
  const reached = prompts.filter((entry) =>
    outbound(game, entry).some(([, to]) => to.id === node.id),
  )
  return [
    section(
      'Index',
      [
        picker(
          'index-type',
          (
            Object.entries(VEC_INDEXES) as ReadonlyArray<
              [VecIndexType, (typeof VEC_INDEXES)['exact']]
            >
          ).map(([id, type]) => [id, type.name] as const),
          node.indexType,
          (indexType) => Message.VecIndexChosen({ nodeId: node.id, indexType }),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `Exact compares the query to every vector: every lookup finds its nearest neighbour, at ${VEC_QUERIES} a second per size step. HNSW walks a graph instead: ${index.queries}× the lookups, twice the memory in Burn, and ${percent(index.recall)} recall, so one lookup in twenty quotes the wrong document.`,
          ],
        ),
        caption(`Recall ${percent(index.recall)} · Burn ${money(burnOf(game, node))}/s`, h),
      ],
      h,
      true,
    ),
    section(
      'Retrieval',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `Link a Node that answers prompts into it and each prompt pays one nearest-neighbour lookup for the documents it quotes. Those answers earn ${Math.round((VEC_AI_LIFT - 1) * 100)}% more, and a Python Stack keeps its ML ecosystem bonus only with an index in the path.`,
          ],
        ),
        caption(
          reached.length === 0
            ? 'Nothing answers prompts through it yet. Link an App Server into it.'
            : `${reached.length} Node${reached.length === 1 ? '' : 's'} retrieve from it.`,
          h,
        ),
      ],
      h,
    ),
  ]
}

/** An Event Stream's partitions, acknowledgements, retention and key (07 "Event Stream"). */
const events = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Partitions',
    [
      picker(
        'partitions',
        LOG_PARTITIONS.map((partitions) => [partitions, String(partitions)] as const),
        node.partitions,
        (partitions) => Message.LogOptionsChosen({ nodeId: node.id, partitions }),
        h,
      ),
      picker(
        'keyed',
        [
          [true, 'Keyed'],
          [false, 'Round robin'],
        ],
        node.keyed,
        (keyed) => Message.LogOptionsChosen({ nodeId: node.id, keyed }),
        h,
      ),
      caption(
        node.keyed
          ? 'One key keeps an entity in one partition, so its events stay in order. A hot key fills a partition and slows it.'
          : 'Events spread evenly, and order is lost: a superseded write can land after the one that replaced it.',
        h,
      ),
      caption(
        `A consumer group reads one consumer per partition, so this stream hands on at most ${compact(LOG_READ_RATE * node.partitions)}/s.`,
        h,
      ),
    ],
    h,
    true,
  ),
  section(
    'Durability',
    [
      picker(
        'acks',
        (Object.entries(LOG_ACKS) as ReadonlyArray<[Acks, (typeof LOG_ACKS)['all']]>).map(
          ([id, ack]) => [id, ack.name] as const,
        ),
        node.acks,
        (acks) => Message.LogOptionsChosen({ nodeId: node.id, acks }),
        h,
      ),
      caption(
        `A producer waits ${LOG_ACKS[node.acks].latency}× the 5 ms append. A replica past the first bills half a broker's Burn again.`,
        h,
      ),
    ],
    h,
  ),
  section(
    'Retention',
    [
      picker(
        'retain',
        LOG_RETENTION.map((retain) => [retain, retentionLabel(retain)] as const),
        node.retain,
        (retain) => Message.LogOptionsChosen({ nodeId: node.id, retain }),
        h,
      ),
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          'Messages stay after they are read, so a consumer can replay them into a new index or a second Worker without touching the Database. A consumer further behind than the window loses the oldest events.',
        ],
      ),
    ],
    h,
  ),
]

/** A Feature Flags Node's rollouts: each Feature's share, and what a bad deploy of it can break. */
const flags = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const service = blastService(game)
  const batch = service.lastDeploy
  const listed = batch.length > 0 ? batch : game.shipped
  return [
    section(
      'Rollout',
      [
        ...(listed.length === 0
          ? [caption('Ship a Feature first: a flag has nothing to roll out yet.', h)]
          : listed.map((feature) =>
              h.div(
                [h.Key(feature), h.Class('flex flex-col gap-1.5 pb-1')],
                [
                  caption(FEATURES[feature].name, h),
                  segmented(
                    'grid-cols-5',
                    ROLLOUT_STEPS.map((share) =>
                      choice(
                        `${feature}-${share}`,
                        Math.abs(rolloutOf(game, feature) - share) < 1e-9,
                        true,
                        Message.RolloutChosen({ nodeId: node.id, feature, share }),
                        [
                          h.span(
                            [h.Class('w-full text-center')],
                            [share <= 0 ? 'Off' : `${Math.round(share * 100)}%`],
                          ),
                        ],
                        share <= 0
                          ? 'Off: no user has the Feature, so a bad deploy of it breaks nobody'
                          : `A bad deploy of it reaches at most ${Math.round(share * 100)}% of users`,
                        h,
                      ),
                    ),
                    h,
                  ),
                ],
              ),
            )),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A bad deploy fails 8% of requests for each Feature its batch shipped, and a flag cuts that to the share of users it reached. The last deploy of ${service.name} shipped ${batch.length} Feature${batch.length === 1 ? '' : 's'}, so its ceiling is ${percent(badDeployShareOf(game, service))}. Only that Service's traffic breaks.`,
          ],
        ),
      ],
      h,
      true,
    ),
    section(
      'Flags are a shield',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'A Feature at 5% of users can break at most 5% of the traffic it would have, whatever the deploy strategy. Turn it Off and the next bad deploy of it breaks nobody: that is the one click an incident needs.',
          ],
        ),
        caption(
          'Not built: the holdout group that measures a Feature’s lift, and the load a dark Feature no longer adds.',
          h,
        ),
      ],
      h,
    ),
  ]
}

/** Secrets and Certificates: what is left of the certificate, and who renews it (05). */
const secrets = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const left = certDaysLeft(game)
  const life = certDaysOf(game)
  return [
    section(
      'Certificate',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A certificate lasts ${life} calendar days, and the sidecar renews it at ${Math.round(life * CERT_RENEW)}. Renewal is automatic while this Node runs.`,
          ],
        ),
        caption(
          left === null
            ? 'The first Step with a manager issues it.'
            : left <= 0
              ? 'Expired: every browser refuses the site until one is live again, or you press Renew.'
              : `${Math.max(0, Math.round(left))} days left.`,
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'Sell it or leave it down past the expiry date and the certificate lapses: every Node that terminates TLS fails until one runs again. From Series C certificates last 45 days, so manual renewal gets harder.',
          ],
        ),
      ],
      h,
      true,
    ),
    section(
      'Secrets',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'The keys live here, not in the code. Secrets management research keeps them off a phishing page too.',
          ],
        ),
      ],
      h,
    ),
  ]
}

/** The Service Mesh's members and what each sidecar costs them (05 "Service Mesh"). */
const sidecars = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const members = meshMembers(game, node)
  return [
    section(
      'Sidecars',
      [
        ...(members.length === 0
          ? [caption('Link App Servers or Workers into it. Nothing is under the mesh yet.', h)]
          : members.map((member) =>
              h.div(
                [h.Key(member.id), h.Class('flex items-center justify-between gap-2 py-0.5')],
                [caption(nameOf(game, member), h)],
              ),
            )),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `Each sidecar retries and breaks the Links out of its Node, watches them for Insight (+${percent(MESH_INSIGHT)}), adds ${MESH_HOP_MS} ms to each hop, and takes ${percent(MESH_OVERHEAD)} of the box's CPU. Every member's Burn pays for its sidecar, and each mesh takes Platform Dev Hours.`,
          ],
        ),
        caption(
          'Mutual TLS sits on every member-to-member call. It is a property, not a figure.',
          h,
        ),
      ],
      h,
      true,
    ),
  ]
}

/** The CDC Connector's flow: the Database it reads, and the Stream it publishes to. */
const changes = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const source = game.nodes.find(
    (entry) =>
      entry.type === 'database' &&
      game.links.some((link) => link.from === entry.id && link.to === node.id),
  )
  const stream = game.nodes.find(
    (entry) =>
      entry.type === 'log' &&
      game.links.some((link) => link.from === node.id && link.to === entry.id),
  )
  return [
    section(
      'Change stream',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'It reads every write off the Database’s write log and publishes it to the Stream, so the Search Engine or the Warehouse follows the Database without the app writing twice.',
          ],
        ),
        caption(
          source === undefined || stream === undefined
            ? 'Link a Database into it, and it into an Event Stream, before it carries anything.'
            : `Reading ${nameOf(game, source)}, publishing to ${nameOf(game, stream)}.`,
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'It adds lag: a consumer reads the Stream at its own pace, so a search result or a report is behind by the Stream’s lag. Order holds only inside a partition, and the Stream’s key decides that.',
          ],
        ),
        caption(
          'Not built: the dual-write inconsistency it removes, since the build never writes twice.',
          h,
        ),
      ],
      h,
      true,
    ),
  ]
}

const queue = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Failed tasks',
    [
      picker(
        'dlq',
        [
          [false, 'Retry forever'],
          [true, 'Dead-letter queue'],
        ],
        node.dlq,
        (dlq) => Message.DlqChosen({ nodeId: node.id, dlq }),
        h,
      ),
      ...(node.dlq
        ? [
            picker(
              'attempts',
              MAX_ATTEMPTS.map((attempts) => [attempts, `${attempts}×`] as const),
              node.attempts,
              (attempts) => Message.AttemptsChosen({ nodeId: node.id, attempts }),
              h,
            ),
          ]
        : []),
    ],
    h,
  ),
  section(
    'Max length',
    [
      picker(
        'max-length',
        QUEUE_LENGTHS.map(
          (maxLength) => [maxLength, maxLength === 0 ? 'None' : compact(maxLength)] as const,
        ),
        node.maxLength,
        (maxLength) => Message.MaxLengthChosen({ nodeId: node.id, maxLength }),
        h,
      ),
    ],
    h,
  ),
]

const prefetching = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Prefetch',
    [
      picker(
        'prefetch',
        PREFETCH.map((prefetch) => [prefetch, String(prefetch)] as const),
        node.prefetch,
        (prefetch) => Message.PrefetchChosen({ nodeId: node.id, prefetch }),
        h,
      ),
    ],
    h,
  )

/** Which zone the Node runs in, and a standby in another for data Nodes. */
const placement = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Zone',
    [
      picker(
        'zone',
        ZONES.map((zone) => [zone, zone.toUpperCase()] as const),
        node.zone,
        (zone) => Message.ZoneChosen({ nodeId: node.id, zone }),
        h,
      ),
      ...(STANDBY_TYPES.includes(node.type)
        ? [
            picker(
              'standby',
              [
                [false, 'No standby'],
                [true, 'Standby'],
              ],
              node.standby,
              (standby) => Message.StandbyChosen({ nodeId: node.id, standby }),
              h,
            ),
          ]
        : []),
    ],
    h,
  )

/** The region a Node runs in, once a second region is open. */
const regionSection = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const open = openRegions(game)
  if (open.length < 2 || isGlobal(node) || COMPONENTS[node.type].fixed) return []
  return [
    section(
      'Region',
      [
        picker(
          'region',
          open.map((region) => [region, REGION_INFO[region].short] as const),
          node.region,
          (region) => Message.NodeRegionChosen({ nodeId: node.id, region }),
          h,
        ),
      ],
      h,
    ),
  ]
}

/** A store that can replicate across the open regions. */
const spreading = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> =>
  openRegions(game).length < 2
    ? []
    : [
        section(
          'Regions',
          [
            picker(
              'spread',
              [
                [false, 'One'],
                [true, 'Spread'],
              ],
              node.spread,
              (spread) => Message.SpreadChosen({ nodeId: node.id, spread }),
              h,
            ),
          ],
          h,
        ),
      ]

const QUORUM = [1, 2, 3, 4, 5] as const

/** N, R and W (07 "Wide-column Store"), then key splitting and regions. */
const wide = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Quorum',
    [
      picker(
        'n',
        QUORUM.map((n) => [n, `N${n}`] as const),
        node.n,
        (n) =>
          Message.QuorumChosen({
            nodeId: node.id,
            n,
            r: Math.min(node.r, n),
            w: Math.min(node.w, n),
          }),
        h,
      ),
      picker(
        'r',
        QUORUM.filter((r) => r <= node.n).map((r) => [r, `R${r}`] as const),
        node.r,
        (r) => Message.QuorumChosen({ nodeId: node.id, n: node.n, r, w: node.w }),
        h,
      ),
      picker(
        'w',
        QUORUM.filter((w) => w <= node.n).map((w) => [w, `W${w}`] as const),
        node.w,
        (w) => Message.QuorumChosen({ nodeId: node.id, n: node.n, r: node.r, w }),
        h,
      ),
    ],
    h,
  ),
  ...(has(game, 'hybrid-fanout') ? [splitting(node, h)] : []),
  ...spreading(game, node, h),
]

const backups = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Backups',
    [
      picker(
        'backup',
        (Object.keys(BACKUPS) as ReadonlyArray<keyof typeof BACKUPS>).map(
          (id) => [id, BACKUPS[id].name] as const,
        ),
        node.backup,
        (backup) => Message.BackupChosen({ nodeId: node.id, backup }),
        h,
      ),
      caption(
        node.backup === 'none'
          ? 'No backup: a lost table is lost for good.'
          : node.restore === 'failed'
            ? 'A restore failed: this backup would lose everything. Drill it again.'
            : 'This backup restores. Drill it again after a change, or research Restore drills.',
        h,
      ),
      ...(node.backup === 'none'
        ? []
        : [
            button(
              {
                onClick: Message.RestoreDrilled({ nodeId: node.id }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start',
                isDisabled: game.devHours < RESTORE_DRILL_DH,
              },
              [`Restore drill · ${RESTORE_DRILL_DH} DH`],
              h,
            ),
          ]),
    ],
    h,
  )

const fanout = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Feeds',
    [
      picker(
        'fanout',
        [
          ['pull', 'Pull'],
          ['push', 'Push'],
        ],
        node.fanout,
        (choice) => Message.FanoutChosen({ nodeId: node.id, fanout: choice }),
        h,
      ),
    ],
    h,
  )

const splitting = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Hot keys',
    [
      picker(
        'split',
        [
          [false, 'One shard'],
          [true, 'Split'],
        ],
        node.split,
        (split) => Message.SplitChosen({ nodeId: node.id, split }),
        h,
      ),
    ],
    h,
  )

const MIN_COPIES = [1, 2, 4, 8] as const

const autoscaler = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Scaling',
    [
      picker(
        'scale-signal',
        [
          ['cpu', 'CPU'],
          ['load', 'Load'],
        ],
        node.signal,
        (signal) => Message.AutoscalerChosen({ nodeId: node.id, signal }),
        h,
      ),
      picker(
        'scale-target',
        SCALE_TARGETS.map((target) => [target, `${Math.round(target * 100)}%`] as const),
        node.target,
        (target) => Message.AutoscalerChosen({ nodeId: node.id, target }),
        h,
      ),
      picker(
        'scale-min',
        MIN_COPIES.map((copies) => [copies, `min ${copies}`] as const),
        node.minCopies,
        (minCopies) => Message.AutoscalerChosen({ nodeId: node.id, minCopies }),
        h,
        (copies) => node.maxCopies === 0 || copies <= node.maxCopies,
      ),
      picker(
        'scale-max',
        SCALE_MAXIMA.map((copies) => [copies, copies === 0 ? 'no max' : `max ${copies}`] as const),
        node.maxCopies,
        (maxCopies) => Message.AutoscalerChosen({ nodeId: node.id, maxCopies }),
        h,
        (copies) => copies === 0 || copies >= node.minCopies,
      ),
    ],
    h,
  )

const gpu = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'GPU',
    [
      picker(
        'gpu',
        (Object.keys(GPU_TYPES) as ReadonlyArray<keyof typeof GPU_TYPES>).map(
          (id) => [id, GPU_TYPES[id].name] as const,
        ),
        node.gpu,
        (choice) => Message.GpuChosen({ nodeId: node.id, gpu: choice }),
        h,
      ),
    ],
    h,
  )

/** A Java App Server's collector, or a Go App Server's GOGC. */
const collector = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const language = RUNTIMES[node.runtime].language
  if (language === 'java')
    return [
      section(
        'Collector',
        [
          picker(
            'collector',
            (Object.keys(COLLECTORS) as ReadonlyArray<keyof typeof COLLECTORS>).map(
              (id) => [id, COLLECTORS[id].label] as const,
            ),
            node.collector,
            (choice) => Message.CollectorChosen({ nodeId: node.id, collector: choice }),
            h,
            (choice) => choice !== 'zgc' || has(game, 'zgc'),
          ),
        ],
        h,
      ),
    ]
  if (language === 'go' && has(game, 'gogc-tuning'))
    return [
      section(
        'GOGC',
        [
          picker(
            'gogc',
            GOGC.map((entry) => [entry.gogc, `${entry.gogc}`] as const),
            node.gogc,
            (gogc) => Message.GogcChosen({ nodeId: node.id, gogc }),
            h,
          ),
        ],
        h,
      ),
    ]
  return []
}

/** Load shedding and read-your-writes routing on an App Server. */
const routing = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const rows: Array<Html> = []
  if (has(game, 'load-shedding'))
    rows.push(
      picker(
        'shed',
        [
          [false, 'Drop evenly'],
          [true, 'Shed low value'],
        ],
        node.shed,
        (shed) => Message.ShedChosen({ nodeId: node.id, shed }),
        h,
      ),
    )
  if (has(game, 'ryw-routing'))
    rows.push(
      picker(
        'ryw',
        [
          [false, 'Reads anywhere'],
          [true, 'Read your writes'],
        ],
        node.ryw,
        (ryw) => Message.RywChosen({ nodeId: node.id, ryw }),
        h,
      ),
    )
  return rows.length > 0 ? [section('Overload', rows, h)] : []
}

const waf = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Paranoia',
    [
      picker(
        'paranoia',
        PARANOIA.map((entry) => [entry.level, `${entry.level}`] as const),
        node.paranoia,
        (paranoia) => Message.ParanoiaChosen({ nodeId: node.id, paranoia }),
        h,
      ),
      picker(
        'under-attack',
        [
          [false, 'Normal'],
          [true, 'Under attack'],
        ],
        node.underAttack,
        (underAttack) => Message.UnderAttackChosen({ nodeId: node.id, underAttack }),
        h,
      ),
    ],
    h,
  )

/** An API Gateway's rate limit, in requests per second; Off lets every request through. */
const gateway = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Rate limit',
    [
      picker(
        'rate-limit',
        GATEWAY_LIMITS.map(
          (limit) => [limit, limit === 0 ? 'Off' : `${compact(limit)}/s`] as const,
        ),
        node.rateLimit,
        (rateLimit) => Message.RateLimitChosen({ nodeId: node.id, rateLimit }),
        h,
      ),
      caption(
        node.rateLimit > 0
          ? `Past ${compact(node.rateLimit)} requests a second, they fail as throttled.`
          : 'No limit: every request goes on to the services.',
        h,
      ),
    ],
    h,
  )

/** A Serverless Function's executions, its cold start, and the bill it runs up (05). */
const serverless = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const own = ledger.nodes[node.id]
  const slots = own?.resources.slots
  const used = slots ? Math.min(slots.used, slots.total) : 0
  const done = own ? own.inbound - own.dropped : 0
  return [
    section(
      'Executions',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `One execution holds the request for as long as it runs, up to ${compact(SERVERLESS_CONCURRENCY)} at a time. Past the cap the provider throttles: the requests are dropped, not queued.`,
          ],
        ),
        caption(
          `${compact(Math.round(used))} of ${compact(slots?.total ?? SERVERLESS_CONCURRENCY)} in flight`,
          h,
        ),
      ],
      h,
      true,
    ),
    section(
      'Cold start',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A new execution environment boots before the code runs: ${ms(coldStartMs(node))} for this Stack. A function that idles loses its environments, so a trickle of traffic pays it more often than a steady one.`,
          ],
        ),
        caption('Change the runtime in the Stack to trade the cold start for throughput.', h),
      ],
      h,
    ),
    section(
      'Bill',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `There is no box to pay for: nothing stands while it idles. Each use bills ${money(SERVERLESS_REQUEST_PRICE * 1_000)} per 1,000 requests plus ${money(SERVERLESS_GB_SECOND)} per GB-second, at ${SERVERLESS_MEMORY_GB} GB an execution, on the Requests line of the bill.`,
          ],
        ),
        caption(`This use: ${money(serverlessBurnOf(game, node, done, own?.latency ?? 0))}/s`, h),
      ],
      h,
    ),
  ]
}

/** An Edge Function's ceilings, and the Stack it needs (05 "Edge Function"). */
const edge = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Ceilings',
    [
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          `A handler runs in ${EDGE_MEMORY_MB} MB of isolate and may spend ${EDGE_CPU_MS} ms of CPU a request. A request past the ceiling fails as a timeout, so CPU-heavy kinds belong on an App Server.`,
        ],
      ),
      caption(
        edgeRuns(node)
          ? 'This Stack compiles to the edge: JavaScript, TypeScript, Rust or Go to WebAssembly.'
          : `${RUNTIMES[node.runtime].name} cannot run at the edge. Migrate the Stack to Node.js, Rust or Go.`,
        h,
      ),
    ],
    h,
    true,
  ),
  section(
    'Edge cache',
    [
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          'A user in its region reaches it in 5 ms, so the hop is the region’s edge and not a round trip to the origin. Place one in each region whose users need it. A live Edge Function’s key-value cache also lets a CDN answer 30% of reads at the edge.',
        ],
      ),
    ],
    h,
  ),
]

/** A Realtime Hub's Presence, Reconnect backoff and Clustering (05 "Realtime Hub"). */
const hub = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Clients',
    [
      picker(
        'presence',
        [
          [false, 'No presence'],
          [true, 'Presence'],
        ],
        node.presence,
        (presence) => Message.HubOptionsChosen({ nodeId: node.id, presence }),
        h,
      ),
      picker(
        'backoff',
        [
          [false, 'Reconnect at once'],
          [true, 'Backoff with jitter'],
        ],
        node.backoff,
        (backoff) => Message.HubOptionsChosen({ nodeId: node.id, backoff }),
        h,
      ),
      picker(
        'clustering',
        [
          [false, 'One box'],
          [true, 'Clustered'],
        ],
        node.clustering,
        (clustering) => Message.HubOptionsChosen({ nodeId: node.id, clustering }),
        h,
      ),
      caption(
        node.clustering
          ? 'Boxes share a pub/sub backbone, so every size step adds room.'
          : 'One box takes every connection: larger sizes add Burn and no room.',
        h,
      ),
    ],
    h,
  )

/** A CI/CD Pipeline's deploy strategy (05 "CI/CD Pipeline"): its blast radius and price. */
const pipeline = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const strategy = DEPLOY_STRATEGIES[node.strategy]
  return section(
    'Deploy strategy',
    [
      picker(
        'deploy-strategy',
        DEPLOY_STRATEGY_IDS.map((id) => [id, DEPLOY_STRATEGIES[id].name] as const),
        node.strategy,
        (chosen) => Message.DeployStrategyChosen({ nodeId: node.id, strategy: chosen }),
        h,
      ),
      caption(
        `Deploys in ${strategy.deployMinutes} min; a bad deploy breaks up to ${percent(strategy.blast)} of requests.`,
        h,
      ),
      caption(`${deploysPerDay(game).toFixed(1)} deploys a day at this build and strategy.`, h),
    ],
    h,
  )
}

const cdnTtl = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'TTL',
    [
      picker(
        'cdn-ttl',
        CDN_TTLS.map((entry) => [entry.ttl, duration(entry.ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

const pooler = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Pooling mode',
    [
      picker(
        'pooler-mode',
        [
          ['session', 'Session'],
          ['transaction', 'Transaction'],
          ['statement', 'Statement'],
        ],
        node.mode,
        (mode) => Message.PoolerModeChosen({ nodeId: node.id, mode }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        node.mode === 'statement'
          ? 'One server connection per statement: a transaction that spans statements fails.'
          : node.mode === 'session'
            ? 'One server connection per client: barely smaller than no pooler at all.'
            : 'One server connection per active transaction. Session state breaks.',
        h,
      ),
    ],
    h,
  )

/** Timeout and retries on each call a Node makes. */
const calls = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const links = outbound(game, node)
  if (links.length === 0) return []
  return [
    section(
      'Calls',
      links.map(([link, target]) =>
        h.div(
          [h.Key(link.to), h.Class('flex flex-col gap-1.5')],
          [
            nodeLink(game, target, h),
            picker(
              `timeout-${link.to}`,
              LINK_TIMEOUTS.map((seconds) => [seconds, `${seconds} s`] as const),
              link.timeout,
              (timeout) => Message.LinkPolicyChosen({ from: node.id, to: link.to, timeout }),
              h,
            ),
            picker(
              `retries-${link.to}`,
              [
                ['none', 'No retries'],
                ['naive', 'Retry 3×'],
                ['backoff', 'Backoff'],
              ],
              link.retries,
              (retries) => Message.LinkPolicyChosen({ from: node.id, to: link.to, retries }),
              h,
              (retries) => retries !== 'backoff' || has(game, 'backoff-jitter'),
            ),
            ...(has(game, 'circuit-breakers')
              ? [
                  picker(
                    `breaker-${link.to}`,
                    [
                      [false, 'No breaker'],
                      [true, link.open > 0 ? 'Breaker open' : 'Breaker'],
                    ],
                    link.breaker,
                    (breaker) => Message.LinkPolicyChosen({ from: node.id, to: link.to, breaker }),
                    h,
                  ),
                ]
              : []),
          ],
        ),
      ),
      h,
    ),
  ]
}

const traffic = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const percentiles = has(game, 'percentiles')
  const kinds = REQUEST_KINDS.filter((kind) => ledger.kinds[kind])
  const list = [
    section(
      'Requests',
      kinds.map((kind) => {
        const entry = ledger.kinds[kind]
        const failing = (entry?.success ?? 1) < 0.95
        const slow = (entry?.p99 ?? 0) > PROFILES[kind].apdex
        const line = h.div(
          [h.Key(kind), h.Class('flex items-center gap-2 text-[calc(12px*var(--type-scale))]')],
          [
            // The kind's packet shape, so the legend teaches what the belts carry (15).
            packetMark(kind, 8, h),
            h.span([h.Class('flex-1')], [KINDS[kind].label]),
            h.span(
              [
                h.Class(
                  `${FIGURE} text-[calc(11.5px*var(--type-scale))] ${failing ? 'text-danger' : slow ? 'text-warn' : 'text-muted-foreground'}`,
                ),
              ],
              [
                `${rate(entry?.rate ?? 0)}/s · ${percent(entry?.success ?? 0)} ok${
                  percentiles ? '' : ` · ${ms(entry?.mean ?? 0)}`
                }`,
              ],
            ),
          ],
        )
        if (!percentiles) return line
        return h.div(
          [h.Key(kind), h.Class('flex flex-col gap-0.5')],
          [
            line,
            h.span(
              [
                h.Class(
                  `${FIGURE} pl-4 text-[calc(11.5px*var(--type-scale))] ${slow ? 'text-warn' : 'text-muted-foreground'}`,
                ),
              ],
              [
                `mean ${ms(entry?.mean ?? 0)} · p50 ${ms(entry?.p50 ?? 0)} · p95 ${ms(entry?.p95 ?? 0)} · p99 ${ms(entry?.p99 ?? 0)}`,
              ],
            ),
          ],
        )
      }),
      h,
    ),
  ]
  if (has(game, 'logs')) {
    list.push(
      section(
        'Errors by cause',
        [
          h.div(
            [h.Class(NESTED)],
            Object.entries(ledger.errors).map(([cause, value]) =>
              row(cause, `${rate(value)}/s`, value > 0.01 ? 'danger' : 'plain', h),
            ),
          ),
        ],
        h,
      ),
    )
  }
  return list
}

/* ---------- traffic breakdown ---------- */

const when = (time: number): string => {
  const clock = clockOf(time)
  return `Day ${clock.day} · ${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}`
}

const difference = (value: number): string =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${rate(Math.abs(value))}/s`

/** A share of incoming traffic, with its change since the previous sample. */
const breakdown = (
  label: string | ReadonlyArray<string>,
  value: number,
  total: number,
  previous: number | null,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(typeof label === 'string' ? label : label.join('')),
      h.Class('flex items-baseline justify-between gap-3 px-3 py-1.5'),
    ],
    [
      h.span(
        [h.Class('min-w-0 break-words text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        typeof label === 'string' ? [label] : label,
      ),
      h.span(
        [
          h.Class(
            'min-w-0 break-words text-[calc(12.5px*var(--type-scale))] text-muted-foreground',
          ),
        ],
        [label],
      ),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'flex items-baseline justify-end gap-1.5 text-[calc(12px*var(--type-scale))] whitespace-nowrap',
            ),
          ),
        ],
        [
          `${rate(value)}/s · ${total > 0 ? percent(value / total) : '0%'}`,
          ...(previous === null
            ? []
            : [
                h.span(
                  [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
                  [difference(value - previous)],
                ),
              ]),
        ],
      ),
    ],
  )

/** The live sample or a recorded one, broken down by operation and source. */
const trafficBreakdown = (
  model: Model,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const game = model.board.game
  const history = model.board.nodeHistory[node.id] ?? []
  const selection = model.board.nodeSample
  const index =
    selection?.nodeId === node.id
      ? history.findIndex((sample) => sample.time === selection.time)
      : -1
  const sample = history[index] ?? sampleNode(game, node, ledger)
  const previous = index > 0 ? history[index - 1] : index === -1 ? history.at(-1) : undefined
  const hint = hintOf(sample)
  const kinds = TRAFFIC_KINDS.filter(
    (kind) => (sample.traffic[kind] ?? 0) > 0 || (previous?.traffic[kind] ?? 0) > 0,
  ).sort((a, b) => (sample.traffic[b] ?? 0) - (sample.traffic[a] ?? 0))
  const sources = [...sample.sources].sort((a, b) => b.rate - a.rate)
  const load = sample.utilization >= 0.9 ? 'danger' : sample.utilization >= 0.7 ? 'warn' : 'plain'
  const earlier = index === -1 ? history.at(-1) : history[index - 1]
  return section(
    'Traffic & load',
    [
      h.div(
        [h.Class('flex items-center justify-between gap-2')],
        [
          caption(index >= 0 ? 'Recorded sample' : 'Live traffic', h),
          ...(index >= 0
            ? [
                button(
                  {
                    onClick: Message.NodeSampleChosen({ nodeId: node.id, time: null }),
                    variant: 'outline',
                    size: 'xs',
                  },
                  [icon(h, ChevronsRight, 'size-3'), 'Back to live'],
                  h,
                ),
              ]
            : []),
        ],
      ),
      ...(has(game, 'metrics') && history.length > 1
        ? [
            sparkline(
              history.map((entry) => entry.utilization),
              h,
              {
                selected: index >= 0 ? index : history.length - 1,
                onPick: (at) =>
                  Message.NodeSampleChosen({ nodeId: node.id, time: history[at]?.time ?? null }),
                label: 'Load history. Select a point or use the sample buttons below.',
              },
            ),
            h.div(
              [h.Class(cn('flex items-center justify-between gap-2 p-1', WELL))],
              [
                smallButton(
                  'Earlier sample',
                  ChevronLeft,
                  Message.NodeSampleChosen({ nodeId: node.id, time: earlier?.time ?? null }),
                  earlier !== undefined,
                  h,
                ),
                h.span(
                  [h.Class(cn(FIGURE, 'flex-1 text-center text-[calc(12.5px*var(--type-scale))]'))],
                  [when(sample.time)],
                ),
                smallButton(
                  'Later sample',
                  ChevronRight,
                  Message.NodeSampleChosen({
                    nodeId: node.id,
                    time: history[index + 1]?.time ?? null,
                  }),
                  index >= 0 && index < history.length - 1,
                  h,
                ),
              ],
            ),
          ]
        : [
            h.p(
              [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
              [
                has(game, 'metrics')
                  ? 'History appears after two recorded samples.'
                  : 'Research Metrics to inspect past samples.',
              ],
            ),
          ]),
      h.div(
        [h.Class(NESTED)],
        [
          row('Inbound', `${rate(sample.inbound)}/s`, 'plain', h),
          row(
            'Load',
            sample.inbound > 0
              ? `${percent(sample.utilization)} of ${rate(sample.capacity)}/s`
              : 'idle',
            sample.inbound > 0 ? load : 'plain',
            h,
          ),
          ...(sample.dropped > 0
            ? [
                row(
                  node.type === 'worker' ? 'Requeued' : 'Dropped',
                  `${rate(sample.dropped)}/s`,
                  sample.dropped > 0.05 ? (node.type === 'worker' ? 'warn' : 'danger') : 'plain',
                  h,
                ),
              ]
            : []),
          ...(sample.refused > 0
            ? [
                row(
                  'Refused',
                  `${rate(sample.refused)}/s`,
                  sample.refused > 0.05 ? 'danger' : 'plain',
                  h,
                ),
              ]
            : []),
          ...(sample.hitRatio !== null
            ? [row('Hit ratio', percent(sample.hitRatio), 'plain', h)]
            : []),
          ...(sample.queue
            ? [
                row('Backlog', compact(sample.queue.depth), 'plain', h),
                row('Sent to Workers', `${rate(sample.queue.out)}/s`, 'plain', h),
                row(
                  'Queue wait',
                  queueWait(sample.queue.stalled ? Number.POSITIVE_INFINITY : sample.queue.wait),
                  sample.queue.stalled ? 'warn' : 'plain',
                  h,
                ),
              ]
            : []),
        ],
      ),
      h.div(
        [h.Class('flex flex-col gap-1')],
        [
          caption('Incoming operations', h),
          ...(kinds.length
            ? [
                h.div(
                  [h.Class(NESTED)],
                  kinds.map((kind) =>
                    breakdown(
                      KINDS[kind].label,
                      sample.traffic[kind] ?? 0,
                      sample.inbound,
                      previous ? (previous.traffic[kind] ?? 0) : null,
                      h,
                    ),
                  ),
                ),
              ]
            : [
                h.p(
                  [h.Class('px-3 text-[calc(12px*var(--type-scale))] text-muted-foreground')],
                  ['No incoming traffic at this sample.'],
                ),
              ]),
          h.p(
            [
              h.Class(
                'px-3 text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground',
              ),
            ],
            ['Shares describe incoming traffic, not CPU usage.'],
          ),
        ],
      ),
      ...(sources.length
        ? [
            h.div(
              [h.Class('flex flex-col gap-1')],
              [
                caption('Sent by', h),
                h.div(
                  [h.Class(NESTED)],
                  sources.map((source) =>
                    breakdown(
                      [source.name, ...(source.ordinal > 0 ? [` ${source.ordinal}`] : [])],
                      source.rate,
                      sample.inbound,
                      previous
                        ? (previous.sources.find((entry) => entry.id === source.id)?.rate ?? 0)
                        : null,
                      h,
                    ),
                  ),
                ),
              ],
            ),
          ]
        : []),
      ...(hint
        ? [
            callout(
              hint,
              sample.down || sample.swapping || sample.refused > 0 ? 'danger' : 'warn',
              null,
              h,
              'mx-0 mb-0',
            ),
          ]
        : []),
    ],
    h,
    true,
  )
}

/* ---------- the panel ---------- */

export const inspector = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const game = model.board.game
  const node = game.nodes.find((entry) => entry.id === model.board.selected)
  if (!node) return h.empty
  const def = COMPONENTS[node.type]
  const label = nodeLabelOf(game, node)
  const history = model.board.nodeHistory[node.id] ?? []
  const price = resizePrice(game, node)
  const sizeLabel = def.sized || def.steps > 1 ? sizeLabelOf(node) : null

  return h.aside(
    [
      h.Key('inspector'),
      h.DataAttribute('exit', 'gesture'),
      h.DataAttribute('inspector', ''),
      h.AriaLabel(nodeLabel(game, node)),
      h.Class(
        `absolute top-[76px] right-3 bottom-3 z-20 flex w-[348px] flex-col overflow-hidden ${PANEL} enter-panel compact:inset-x-2 compact:top-auto compact:bottom-[max(8px,env(safe-area-inset-bottom))] compact:z-30 compact:max-h-[62%] compact:w-auto short:inset-x-auto short:top-[132px] short:right-[max(8px,env(safe-area-inset-right))] short:w-[320px] short:max-h-none`,
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-3 px-4 pt-4 pb-2')],
        [
          groupBadge(def.group, COMPONENT_ICONS[node.type], 'size-10', h),
          h.div(
            [h.Class('flex min-w-0 flex-1 flex-col')],
            [
              h.span(
                [h.Class('text-[calc(17px*var(--type-scale))] font-semibold tracking-[-0.025em]')],
                [label.name, ...(label.ordinal > 0 ? [` ${label.ordinal}`] : [])],
              ),
              h.span([h.Class(cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-muted-foreground'))], [def.product]),
            ],
          ),
          sizeLabel
            ? badge({ variant: 'secondary', className: 'font-mono' }, [sizeLabel], h)
            : h.empty,
          button(
            {
              onClick: Message.EmptyTapped(),
              variant: 'ghost',
              size: 'icon-sm',
              className: 'text-muted-foreground',
              attributes: [h.AriaLabel('Close')],
            },
            icon(h, X, 'size-4'),
            h,
          ),
        ],
      ),
      h.p([h.Class('px-4 pb-3 text-[calc(12.5px*var(--type-scale))] leading-snug text-muted-foreground')], [def.blurb]),
      ...inboundSummary(game, node, ledger, h),
      ...warnings(game, node, ledger, h),
      h.div(
        [h.Class(`flex min-h-0 flex-1 flex-col divide-y divide-hairline ${SCROLL}`)],
        [
          h.div(
            [h.Class('px-4 pt-1 pb-2')],
            [
              ...(hasTraffic(node)
                ? [h.p([h.Class(`${EYEBROW} mb-2 text-muted-foreground`)], ['Live now'])]
                : []),
              h.div([h.Class(NESTED)], stats(game, node, ledger, h)),
            ],
          ),
          ...(hasTraffic(node) ? [trafficBreakdown(model, node, ledger, h)] : []),
          ...(has(game, 'metrics') && history.length > 1 && !def.fixed && !hasTraffic(node)
            ? [
                section(
                  'Load, last day',
                  [
                    sparkline(
                      history.map((sample) => sample.utilization),
                      h,
                    ),
                  ],
                  h,
                ),
              ]
            : []),
          ...resources(node, ledger, h),
          ...(node.type === 'users' ? traffic(game, ledger, h) : []),
          ...(def.sized ? [instance(game, node, h)] : []),
          ...(node.type === 'server' || node.type === 'worker'
            ? stack(
                game,
                node,
                h,
                model.board.tradeoff?.nodeId === node.id &&
                  model.board.tradeoff.option.kind === 'runtime' &&
                  model.board.tradeoff.pinned
                  ? model.board.tradeoff.option.id
                  : null,
              )
            : []),
          ...(node.type === 'ws' ? [hubStack(game, node, h)] : []),
          ...(node.type === 'server' ? collector(game, node, h) : []),
          ...(node.type === 'server' ? routing(game, node, h) : []),
          ...(node.type === 'gpu' ? [gpu(node, h)] : []),
          ...(node.type === 'analytics' ? [sampler(game, node, h)] : []),
          ...(node.type === 'lb' ? loadBalancer(game, node, h) : []),
          ...(node.type === 'cache' ? [cache(game, node, h)] : []),
          ...(node.type === 'database' ? database(game, node, h) : []),
          ...(node.type === 'replica' ? [engine(node, h)] : []),
          ...(node.type === 'storage' ? storage(game, node, h) : []),
          ...(node.type === 'search' ? [search(node, h)] : []),
          ...(node.type === 'queue' ? queue(node, h) : []),
          ...(node.type === 'worker' ? [prefetching(node, h)] : []),
          ...(node.type === 'waf' ? [waf(node, h)] : []),
          ...(node.type === 'gw' ? [gateway(node, h)] : []),
          ...(node.type === 'doc' ? documents(game, node, h) : []),
          ...(node.type === 'vec' ? vector(game, node, h) : []),
          ...(node.type === 'log' ? events(node, h) : []),
          ...(node.type === 'cdc' ? changes(game, node, h) : []),
          ...(node.type === 'mesh' ? sidecars(game, node, h) : []),
          ...(node.type === 'ff' ? flags(game, node, h) : []),
          ...(node.type === 'pki' ? secrets(game, node, h) : []),
          ...(node.type === 'fn' ? serverless(game, node, ledger, h) : []),
          ...(node.type === 'edge' ? edge(game, node, h) : []),
          ...(node.type === 'ci' ? [pipeline(game, node, h)] : []),
          ...(node.type === 'ws' ? [hub(node, h)] : []),
          ...(node.type === 'cdn' ? [cdnTtl(node, h)] : []),
          ...(node.type === 'pooler' ? [pooler(node, h)] : []),
          ...(node.type === 'autoscaler' ? [autoscaler(node, h)] : []),
          ...(has(game, 'multi-az') && zoned(node) ? [placement(node, h)] : []),
          ...regionSection(game, node, h),
          ...(node.type === 'wide' ? wide(game, node, h) : []),
          ...(node.type === 'dsql' ? spreading(game, node, h) : []),
          ...(node.type === 'database' && has(game, 'pitr') ? [backups(game, node, h)] : []),
          ...(node.type === 'server' && regional(game) ? [fanout(node, h)] : []),
          ...(node.type === 'cache' && has(game, 'hybrid-fanout') ? [splitting(node, h)] : []),
          ...(node.type === 'dns' && has(game, 'health-checks') ? [dnsTtl(node, h)] : []),
          ...(has(game, 'timeouts') ? calls(game, node, h) : []),
          upgradeAll(game, node, h),
        ],
      ),
      h.div(
        [h.Class('flex gap-2 border-t border-hairline bg-nested p-3')],
        [
          node.type === 'payments' && game.pending > 0
            ? h.button(
                [
                  h.Type('button'),
                  h.OnClick(Message.Collected()),
                  h.Class(
                    'flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-ok text-[calc(13px*var(--type-scale))] font-medium text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--ok),black_25%),0_2px_6px_-2px_color-mix(in_oklch,var(--ok)_50%,transparent)] transition-[filter] hover:brightness-105 active:translate-y-px',
                  ),
                ],
                ['Collect', h.span([h.Class(FIGURE)], [money(game.pending)])],
              )
            : h.empty,
          price !== null && node.life._tag !== 'Stopped'
            ? button(
                {
                  onClick: Message.ResizeChosen({ nodeId: node.id, direction: 1 }),
                  isDisabled: game.cash < price,
                  size: 'lg',
                  className: 'min-w-0 flex-1 justify-between px-3',
                  attributes: [h.Title('U'), ...holdListeners(node.id, h)],
                },
                [
                  h.span(
                    [h.Class('flex items-center gap-1.5 truncate')],
                    [
                      icon(h, ArrowUp, 'size-4 shrink-0'),
                      node.type === 'payments'
                        ? 'Bigger drawer'
                        : node.type === 'analytics'
                          ? 'More samples'
                          : sizeLabelOf(node, node.size + 1),
                    ],
                  ),
                  h.span([h.Class(FIGURE)], [priceLabel(game.sandbox, price)]),
                ],
                h,
              )
            : h.empty,
          (node.type === 'server' || node.type === 'worker') && !isDown(node.life)
            ? button(
                {
                  onClick: Message.RestartChosen({ nodeId: node.id }),
                  variant: 'outline',
                  size: 'icon-lg',
                  attributes: [
                    h.Title('Restart: frees leaked memory, comes back cold'),
                    h.AriaLabel('Restart'),
                  ],
                },
                icon(h, RotateCcw, 'size-4'),
                h,
              )
            : h.empty,
          def.fixed
            ? h.empty
            : button(
                {
                  onClick: Message.SellAsked(),
                  variant: 'outline',
                  size: 'icon-lg',
                  className: 'text-muted-foreground hover:text-danger',
                  attributes: [
                    h.Title(`Sell for ${money(refundOf(game, node))} (Delete)`),
                    h.AriaLabel('Sell'),
                  ],
                },
                icon(h, Trash2, 'size-4'),
                h,
              ),
        ],
      ),
    ],
  )
}
