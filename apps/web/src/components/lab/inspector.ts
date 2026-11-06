import { isDown } from '@quorum/simulation/life'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowDownToLine,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Minus,
  Plus,
  RotateCcw,
  ArrowRightLeft,
  Trash2,
  X,
} from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import {
  COMPONENTS,
  CREDIT_CAP,
  FAMILIES,
  FAMILY_IDS,
  KINDS,
  LB_POLICIES,
  PRICING_FROM_STAGE,
  PRICING_IDS,
  PRICINGS,
  RUNTIMES,
  SIZES,
  SPOT_WARNING,
  STANDBY_TYPES,
  TASKS,
  AUTH_MOVE_DH,
  LOAD_TEST_DEMAND,
  ZONES,
  DB_ENGINES,
  REGION_INFO,
  SHARD_KEYS,
} from '@quorum/simulation/catalog'
import { nodeLabel, nodeLabelOf } from '@quorum/simulation/labels'
import { isGlobal, openRegions } from '@quorum/simulation/regions'
import { platformTax, quartersBehind } from '@quorum/simulation/team'
import type { Limit } from '@quorum/simulation/capacity'
import type { Ledger, NodeLedger } from '@quorum/simulation/ledger'
import {
  burnOf,
  has,
  hasPricing,
  maxSize,
  pricingOf,
  ramOf,
  refundOf,
  replacePrice,
  resizePrice,
  sizeLabel as sizeLabelOf,
  vcpuOf,
  zoned,
  nodeCertDaysLeft,
} from '@quorum/simulation/lookups'
import { LINK_TIMEOUTS, restartable } from '@quorum/simulation/actions'
import type { Game, GameLink, GameNode } from '@quorum/simulation/state'
import { compact, duration, money, ms, priceLabel, queueWait, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { hasTraffic, hintOf, oversized, sampleNode, TRAFFIC_KINDS } from '@/game/node-metrics.ts'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
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
} from '@quorum/ui/game/bits'
import {
  KIND_SHORT,
  caption,
  choice,
  holdListeners,
  nodeLink,
  outbound,
  percent,
  picker,
  section,
  segmented,
  smallButton,
} from './inspector/shared.ts'
import { PANELS } from './inspector/index.ts'

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
  const incident = game.incident
  if (incident?.nodeId === node.id && incident.kind === 'reconnect' && incident.throttled !== true)
    list.push(
      callout(
        'Every client is reconnecting at once. The Hub refuses what it cannot take.',
        'danger',
        button(
          {
            onClick: Message.ConnectsThrottled({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          ['Throttle connects'],
          h,
        ),
        h,
      ),
    )
  if (
    incident?.kind === 'loop' &&
    node.type === 'server' &&
    RUNTIMES[node.runtime].blocking === 'loop'
  )
    list.push(
      callout(
        'A heavy login hash blocks this event loop, and every kind behind it waits.',
        'danger',
        button(
          {
            onClick: Message.KindMoved(),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          ['Move login'],
          h,
        ),
        h,
      ),
    )
  if (isDown(node.life) && node.life._tag === 'Restarting' && node.standby && has(game, 'multi-az'))
    list.push(
      callout(
        'Its standby takes over in a few seconds.',
        'warn',
        button(
          {
            onClick: Message.FailedOver({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start',
          },
          ['Fail over'],
          h,
        ),
        h,
      ),
    )
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
  if (node.draining)
    list.push(
      callout(
        'Draining: it takes no new traffic, and rejoins once the work it holds is finished.',
        'warn',
        null,
        h,
      ),
    )
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
  if (node.type === 'auth' && !game.sandbox)
    list.push(
      callout(
        'Move login in-house: the App Servers hash passwords themselves, and the per-user fee ends.',
        'warn',
        button(
          {
            onClick: Message.AuthMoveQueued(),
            isDisabled: game.backlog.some((item) => item.ref === 'auth'),
            variant: 'outline',
            size: 'sm',
            className: 'self-start',
          },
          [`Move auth in-house · ${AUTH_MOVE_DH} DH`],
          h,
        ),
        h,
      ),
    )
  if (game.time < game.loadTestUntil && own.utilization > 0)
    list.push(
      callout(
        `Load test: at ${LOAD_TEST_DEMAND}× demand this Node runs at ${Math.round(own.utilization * LOAD_TEST_DEMAND * 100)}% utilization.`,
        own.utilization * LOAD_TEST_DEMAND > 1 ? 'danger' : 'warn',
        null,
        h,
      ),
    )
  if (node.type === 'database' && game.engineChange?.node === node.id)
    list.push(
      callout(
        game.engineChange.until > 0
          ? `Copying its data to ${DB_ENGINES[game.engineChange.to].name}. It keeps serving on ${DB_ENGINES[node.dbEngine].name} until the copy ends.`
          : `Rewriting the code for ${DB_ENGINES[game.engineChange.to].name}. It is on the backlog.`,
        'warn',
        null,
        h,
      ),
    )
  if (node.type === 'database' && game.reshard?.node === node.id)
    list.push(
      callout(
        game.reshard.until > 0
          ? `Copying its data to ${game.reshard.shards} shard${game.reshard.shards === 1 ? '' : 's'} by ${SHARD_KEYS[game.reshard.key].name}. The volume runs at half its IOPS until the copy ends.`
          : 'Rewriting the code for the new shards. It is on the backlog.',
        'warn',
        null,
        h,
      ),
    )
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
  if (node.type === 'psp' && game.incident?.kind === 'psp-outage')
    fix(
      'Their outage, not yours. Every checkout fails.',
      'Switch provider',
      Message.ProviderSwitched(),
    )
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

const stats = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const own = ledger.nodes[node.id]
  if (!own) return []
  const panelStats = PANELS[node.type]?.stats
  if (panelStats) return panelStats({ game, node, ledger, own, h })
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
    ...(own.evictions !== null
      ? [row('Evictions', `${rate(own.evictions)}/s`, own.evictions > 0 ? 'warn' : 'plain', h)]
      : []),
    ...(own.lag !== null ? [row('Lag', ms(own.lag), 'plain', h)] : []),
    ...(node.certUntil !== null
      ? [
          row(
            'Certificate',
            (nodeCertDaysLeft(game, node) ?? 0) <= 0
              ? 'expired'
              : `${Math.round(nodeCertDaysLeft(game, node) ?? 0)} d left`,
            (nodeCertDaysLeft(game, node) ?? 0) <= 1 ? 'danger' : 'plain',
            h,
          ),
        ]
      : []),
    row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
  ]
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

/** A Node's name, numbered when the Design has more than one of its kind. */
const nodeCaption = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const label = nodeLabelOf(game, node)
  return h.span([], [label.name, ...(label.ordinal > 0 ? [` ${label.ordinal}`] : [])])
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
            ...(has(game, 'bulkheads')
              ? [
                  picker(
                    `bulkhead-${link.to}`,
                    [
                      [false, 'No bulkhead'],
                      [true, 'Bulkhead'],
                    ],
                    link.bulkhead,
                    (bulkhead) =>
                      Message.LinkPolicyChosen({ from: node.id, to: link.to, bulkhead }),
                    h,
                  ),
                ]
              : []),
            ...(has(game, 'hedged-requests')
              ? [
                  picker(
                    `hedge-${link.to}`,
                    [
                      [false, 'One copy'],
                      [true, 'Hedge'],
                    ],
                    link.hedge,
                    (hedge) => Message.LinkPolicyChosen({ from: node.id, to: link.to, hedge }),
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
        [
          h.Class(
            'min-w-0 break-words text-[calc(12.5px*var(--type-scale))] text-muted-foreground',
          ),
        ],
        typeof label === 'string' ? [label] : label,
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
      ...(!hint && has(game, 'rightsizing') && oversized(history)
        ? [
            callout(
              'Rightsizing report: peak utilization stayed under 30% over the last calendar day. Consider a smaller size.',
              'warn',
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
  const panel = PANELS[node.type]
  const context = { model, game, node, ledger, h }

  return h.aside(
    [
      // Key the panel by the Node it inspects: a control's click handler closes over that Node's
      // id, so reusing the previous Node's DOM would send the previous Node's id.
      h.Key(`inspector-${node.id}`),
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
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-muted-foreground'),
                  ),
                ],
                [def.product],
              ),
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
      h.p(
        [
          h.Class(
            'px-4 pb-3 text-[calc(12.5px*var(--type-scale))] leading-snug text-muted-foreground',
          ),
        ],
        [def.blurb],
      ),
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
          ...(panel?.top?.(context) ?? []),
          ...(def.sized ? [instance(game, node, h)] : []),
          ...(panel?.body?.(context) ?? []),
          ...(has(game, 'multi-az') && zoned(node) ? [placement(node, h)] : []),
          ...regionSection(game, node, h),
          ...(panel?.late?.(context) ?? []),
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
          restartable(node) && !isDown(node.life)
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
          node.standby && isDown(node.life) && has(game, 'multi-az')
            ? button(
                {
                  onClick: Message.FailedOver({ nodeId: node.id }),
                  variant: 'outline',
                  size: 'icon-lg',
                  attributes: [
                    h.Title('Fail over: the standby takes over now'),
                    h.AriaLabel('Fail over'),
                  ],
                },
                icon(h, ArrowRightLeft, 'size-4'),
                h,
              )
            : h.empty,
          has(game, 'health-checks') && !def.fixed && !isDown(node.life) && !node.draining
            ? button(
                {
                  onClick: Message.DrainChosen({ nodeId: node.id }),
                  variant: 'outline',
                  size: 'icon-lg',
                  attributes: [
                    h.Title('Drain: stop new traffic and let it finish what it holds'),
                    h.AriaLabel('Drain'),
                  ],
                },
                icon(h, ArrowDownToLine, 'size-4'),
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
