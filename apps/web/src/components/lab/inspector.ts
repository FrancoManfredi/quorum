import { formats } from '@/i18n/format.ts'
import { copy, localized, nodeLabelIn, nodeTitle, type Messages } from '@/i18n/messages.ts'
import { isDown } from '@quorum/simulation/life'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowDownToLine,
  ArrowUp,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Minus,
  Plus,
  RotateCcw,
  ArrowRightLeft,
  Trash2,
} from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import {
  COMPONENTS,
  CREDIT_CAP,
  FAMILY_IDS,
  PRICING_FROM_STAGE,
  PRICING_IDS,
  RUNTIMES,
  SIZES,
  SPOT_WARNING,
  STANDBY_TYPES,
  TASKS,
  AUTH_MOVE_DH,
  LOAD_TEST_DEMAND,
  ZONES,
  DB_ENGINES,
} from '@quorum/simulation/catalog'
import { isGlobal, openRegions } from '@quorum/simulation/regions'
import { platformTax, quartersBehind } from '@quorum/simulation/team'
import type { Limit } from '@quorum/simulation/capacity'
import type { Ledger, LinkLedger, NodeLedger } from '@quorum/simulation/ledger'
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
  vcpuOf,
  zoned,
  nodeCertDaysLeft,
} from '@quorum/simulation/lookups'
import { LINK_TIMEOUTS, restartable } from '@quorum/simulation/actions'
import type { Game, GameLink, GameNode } from '@quorum/simulation/state'
import { compact, money, priceLabel, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import {
  costShifts,
  hasTraffic,
  hintOf,
  oversized,
  sampleNode,
  TRAFFIC_KINDS,
  type NodeSample,
} from '@/game/node-metrics.ts'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { icon } from '@quorum/ui/primitives/icon'
import { badge } from '@quorum/ui/primitives/badge'
import { button, closeButton } from '@quorum/ui/primitives/button'
import { progress } from '@quorum/ui/primitives/progress'
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
  sizeLabelIn,
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
import { amplification, costReceipts, loadChange, whatIfs } from './inspector/diagnosis.ts'

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
  const t = copy(h)

  const own = ledger.nodes[node.id]
  if (!own) return []
  const list: Array<Html> = []
  if (node.life._tag === 'Stopped') {
    const price = replacePrice(game, node)
    list.push(
      callout(
        t.inspector.theHostUnderThisVMDied,
        'danger',
        button(
          {
            onClick: Message.ReplaceBought({ nodeId: node.id }),
            isDisabled: game.cash < price,
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [t.inspector.replace, h.span([h.Class(FIGURE)], [priceLabel(game.sandbox, price)])],
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
        t.inspector.everyClientIsReconnectingAtOnce,
        'danger',
        button(
          {
            onClick: Message.ConnectsThrottled({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [t.inspector.throttleConnects],
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
        t.inspector.aHeavyLoginHashBlocksThis,
        'danger',
        button(
          {
            onClick: Message.KindMoved(),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [t.inspector.moveLogin],
          h,
        ),
        h,
      ),
    )
  if (isDown(node.life) && node.life._tag === 'Restarting' && node.standby && has(game, 'multi-az'))
    list.push(
      callout(
        t.inspector.itsStandbyTakesOverInA,
        'warn',
        button(
          {
            onClick: Message.FailedOver({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start',
          },
          [t.inspector.failOver],
          h,
        ),
        h,
      ),
    )
  if (own.stranded > 0.01) {
    const names = own.strandedKinds
      .map((kind) => t.catalog.kinds[kind].label.toLowerCase())
      .join(', ')
    list.push(callout(t.inspector.sOfHaveNowhereToGo(rate(own.stranded), names), 'danger', null, h))
  }
  if (own.refused > 0.01)
    list.push(
      callout(t.inspector.refusingQueriesSTooManyConnections(rate(own.refused)), 'danger', null, h),
    )
  if (own.swapping) list.push(callout(t.inspector.outOfRAMAndSwappingEvery, 'danger', null, h))
  if (own.throttled) list.push(callout(t.inspector.outOfCPUCreditsThrottledTo, 'warn', null, h))
  if (own.disk) list.push(callout(t.inspector.theWorkingSetDoesNotFit, 'warn', null, h))
  if (node.leak > 0) {
    list.push(
      callout(
        t.inspector.memoryGrowsGBLeaked(node.leak.toFixed(1)),
        'danger',
        button(
          {
            onClick: Message.RestartChosen({ nodeId: node.id }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [icon(h, RotateCcw, 'size-3.5'), t.inspector.restart],
          h,
        ),
        h,
      ),
    )
  }
  if (node.service._tag === 'Draining') list.push(callout(t.inspector.draining, 'warn', null, h))
  if (node.type === 'cluster' && !game.sandbox) {
    const upgrade = button(
      {
        onClick: Message.TaskQueued({ id: 'upgrade-cluster' }),
        variant: 'outline',
        size: 'sm',
        className: 'self-start',
      },
      [t.inspector.upgradeClustersDH(TASKS['upgrade-cluster'].dh)],
      h,
    )
    if (game.incident?.kind === 'cluster-upgrade' && game.incident.nodeId === node.id)
      list.push(callout(t.inspector.theProviderIsForcingAnUpgrade, 'danger', upgrade, h))
    else if (quartersBehind(game, node) > 0)
      list.push(callout(t.inspector.itsKubernetesVersionIsOutOf, 'warn', upgrade, h))
    if (platformTax(game) > 0)
      list.push(
        callout(t.inspector.clustersTakeEngineersOfDevHours(platformTax(game)), 'warn', null, h),
      )
  }
  if (node.type === 'auth' && !game.sandbox)
    list.push(
      callout(
        t.inspector.moveLoginInHouseTheApp,
        'warn',
        button(
          {
            onClick: Message.AuthMoveQueued(),
            isDisabled: game.backlog.some((item) => item.ref === 'auth'),
            variant: 'outline',
            size: 'sm',
            className: 'self-start',
          },
          [t.inspector.moveAuthInHouseDH(AUTH_MOVE_DH)],
          h,
        ),
        h,
      ),
    )
  if (game.time < game.loadTestUntil && own.utilization > 0)
    list.push(
      callout(
        t.inspector.loadTestAtDemandThisNode(
          LOAD_TEST_DEMAND,
          Math.round(own.utilization * LOAD_TEST_DEMAND * 100),
        ),
        own.utilization * LOAD_TEST_DEMAND > 1 ? 'danger' : 'warn',
        null,
        h,
      ),
    )
  if (node.type === 'database' && game.engineChange?.node === node.id)
    list.push(
      callout(
        game.engineChange.phase._tag === 'Copying'
          ? t.inspector.copyingItsDataToItKeeps(
              DB_ENGINES[game.engineChange.to].name,
              DB_ENGINES[node.dbEngine].name,
            )
          : t.inspector.rewritingTheCodeForItIs(DB_ENGINES[game.engineChange.to].name),
        'warn',
        null,
        h,
      ),
    )
  if (node.type === 'database' && game.reshard?.node === node.id)
    list.push(
      callout(
        game.reshard.phase._tag === 'Copying'
          ? t.inspector.copyingToShards(
              game.reshard.shards,
              t.catalog.shardKeys[game.reshard.key].name,
            )
          : t.inspector.rewritingForTheNewShards,
        'warn',
        null,
        h,
      ),
    )
  if (node.type === 'queue' && game.incident?.kind === 'poison' && game.incident.nodeId === node.id)
    list.push(
      callout(
        node.dlq ? t.inspector.aTaskKeepsFailingTheDead : t.inspector.aTaskKeepsFailingWorkersRetry,
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
              [t.inspector.deleteMessage],
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
        isDown(node.life) ? t.inspector.spotReclaimed : t.inspector.spotReclaimsIn(t.units.s(left)),
        'danger',
        node.pricing === 'spot'
          ? button(
              {
                onClick: Message.PricingChosen({ nodeId: node.id, pricing: 'on-demand' }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start text-danger',
              },
              [t.inspector.switchToOnDemand],
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
    fix(t.inspector.aRuleBacktracksCPUAt100, t.inspector.disableRule, Message.RuleDisabled())
  if (node.type === 'database' && game.incident?.kind === 'report-db')
    fix(
      t.inspector.aReportIsScanningEveryTable,
      t.inspector.cancelReport,
      Message.ReportCancelled(),
    )
  if (node.type === 'psp' && game.incident?.kind === 'psp-outage')
    fix(t.inspector.providerOutage, t.inspector.switchProvider, Message.ProviderSwitched())
  if (
    node.type === 'database' &&
    game.incident?.kind === 'disk-full' &&
    game.incident.nodeId === node.id
  )
    fix(t.inspector.theDiskIsFullWritesFail, t.inspector.expandVolume, Message.VolumeExpanded())
  if (node.type === 'waf' && game.incident?.kind === 'ddos' && !node.underAttack)
    list.push(
      callout(
        t.inspector.aFloodOfJunkTraffic,
        'danger',
        button(
          {
            onClick: Message.UnderAttackChosen({ nodeId: node.id, underAttack: true }),
            variant: 'outline',
            size: 'sm',
            className: 'self-start text-danger',
          },
          [t.inspector.underAttack],
          h,
        ),
        h,
      ),
    )
  if (node.type === 'database' && game.incident?.kind === 'slow-query') {
    const analysed = has(game, 'query-analysis')
    list.push(
      callout(
        analysed ? t.inspector.aNewQueryHasNoIndex : t.inspector.aNewQueryHasNoIndex2,
        'danger',
        analysed
          ? button(
              {
                onClick: Message.IndexAdded({ nodeId: node.id }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start text-danger',
              },
              [t.inspector.addIndex],
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
  const t = copy(h)

  const own = ledger.nodes[node.id]
  if (!own) return []
  const panelStats = PANELS[node.type]?.stats
  if (panelStats) return panelStats({ game, node, ledger, own, h })
  const util = own.utilization
  return [
    row(t.inspector.inbound, t.inspector.s(rate(own.inbound)), 'plain', h),
    row(
      t.inspector.load,
      own.inbound > 0 ? t.inspector.ofS(percent(util), rate(own.capacity)) : t.inspector.idle,
      util >= 0.9 ? 'danger' : util >= 0.7 ? 'warn' : 'plain',
      h,
    ),
    row(t.inspector.latency, formats(t).ms(own.latency), 'plain', h),
    // What a Worker cannot take waits in its Queue: it is not lost.
    node.type === 'worker'
      ? row(
          t.inspector.requeued,
          t.inspector.s(rate(own.dropped)),
          own.dropped > 0.05 ? 'warn' : 'plain',
          h,
        )
      : row(
          t.inspector.dropped,
          t.inspector.s(rate(own.dropped)),
          own.dropped > 0.05 ? 'danger' : 'plain',
          h,
        ),
    ...(own.hitRatio !== null
      ? [row(t.inspector.hitRatio, percent(own.hitRatio), 'plain', h)]
      : []),
    ...(own.evictions !== null
      ? [
          row(
            t.inspector.evictions,
            t.inspector.s(rate(own.evictions)),
            own.evictions > 0 ? 'warn' : 'plain',
            h,
          ),
        ]
      : []),
    ...(own.lagMs !== null ? [row(t.inspector.lag, formats(t).ms(own.lagMs), 'plain', h)] : []),
    ...(node.certUntil !== null
      ? [
          row(
            t.inspector.certificate,
            (nodeCertDaysLeft(game, node) ?? 0) <= 0
              ? t.inspector.expired
              : t.inspector.dLeft(Math.round(nodeCertDaysLeft(game, node) ?? 0)),
            (nodeCertDaysLeft(game, node) ?? 0) <= 1 ? 'danger' : 'plain',
            h,
          ),
        ]
      : []),
    row(t.inspector.burn, t.inspector.s(money(burnOf(game, node))), 'plain', h),
  ]
}

const limitNameOf = (t: Messages): Record<Limit, string> => ({
  cpu: 'CPU',
  credits: t.inspector.cPUCredits,
  memory: t.inspector.rAM,
  workers: t.inspector.workersBusy,
  connections: t.inspector.connections,
  network: t.inspector.network,
  disk: t.inspector.diskIOPS,
  throughput: t.inspector.throughput,
  none: t.inspector.nothing,
})

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
const gaugesOf = (t: Messages, node: GameNode, own: NodeLedger) => {
  const { cpuCores, ramGb, slots, creditsCoreSeconds, networkKbps } = own.resources
  const gauges: Partial<Record<Limit, GaugeSpec>> = {}
  if (cpuCores)
    gauges.cpu = {
      label: 'CPU',
      used: cpuCores.used,
      total: cpuCores.total,
      text: t.inspector.cores(cpuCores.used.toFixed(2), cpuCores.total.toFixed(1)),
    }
  if (ramGb)
    gauges.memory = {
      label: t.inspector.rAM,
      used: ramGb.used,
      total: ramGb.total,
      text: t.inspector.gigabytes(ramGb.used.toFixed(1), ramGb.total.toFixed(0)),
    }
  if (slots)
    gauges.workers = {
      label: node.type === 'fn' ? t.inspector.executions : t.inspector.workersBusy,
      used: slots.used,
      total: slots.total,
      text: `${slots.used.toFixed(1)} / ${slots.total}`,
    }
  if (own.connections)
    gauges.connections = {
      label: t.inspector.connections,
      used: own.connections.used,
      total: own.connections.max,
      text: `${Math.round(own.connections.used)} / ${own.connections.max}`,
    }
  if (creditsCoreSeconds) {
    const cap = CREDIT_CAP * vcpuOf(node)
    gauges.credits = {
      label: t.inspector.cPUCredits,
      used: creditsCoreSeconds.balance,
      total: cap,
      text: `${Math.round(creditsCoreSeconds.balance)} · ${t.units.perSecond(`${creditsCoreSeconds.rate >= 0 ? '+' : ''}${creditsCoreSeconds.rate.toFixed(2)}`)}`,
      invert: true,
    }
  }
  if (networkKbps)
    gauges.network = {
      label: t.inspector.network,
      used: networkKbps.used,
      total: networkKbps.total,
      text: t.inspector.megabytesPerSecond(
        (networkKbps.used / 1_000).toFixed(1),
        (networkKbps.total / 1_000).toFixed(0),
      ),
    }
  return gauges
}

const resources = (
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const own = ledger.nodes[node.id]
  if (!own) return []
  const gauges = gaugesOf(t, node, own)
  const list: Array<Html> = []
  // The goal bar names the tightest limit, and the gauge behind it when the Ledger has one.
  const tight = gauges[own.limit]
  if (own.limit === 'none') list.push(row(t.inspector.limit, t.inspector.nothingTight, 'ok', h))
  else if (tight)
    list.push(
      gauge(t.inspector.limitOf(tight.label), tight.used, tight.total, tight.text, h, tight.invert),
    )
  // The Inspector says so rather than leaving a limit unexplained.
  else list.push(row(t.inspector.limit, t.inspector.noGauge(limitNameOf(t)[own.limit]), 'warn', h))
  for (const limit of ['cpu', 'memory', 'workers', 'connections', 'credits', 'network'] as const) {
    const spec = gauges[limit]
    if (spec) list.push(gauge(spec.label, spec.used, spec.total, spec.text, h, spec.invert))
  }
  return list.length > 0 ? [section(t.inspector.resources, list, h)] : []
}

const sparkline = (
  points: ReadonlyArray<number>,
  h: HtmlBuilder<Message>,
  options: Readonly<{
    selected?: number
    onPick?: (index: number) => Message
    label?: string
    /** Points to mark with a tick at the top, such as a change in cost per request. */
    marks?: ReadonlyArray<number>
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
      ...(options.marks ?? []).map((index) =>
        h.line([
          h.Attribute('x1', String(x(index))),
          h.Attribute('x2', String(x(index))),
          h.Attribute('y1', '0'),
          h.Attribute('y2', String(height)),
          h.Attribute('stroke', 'var(--warn)'),
          h.Attribute('stroke-dasharray', '2 2'),
          h.Attribute('stroke-width', '1'),
        ]),
      ),
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
  const t = copy(h)

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
        [term === null ? t.inspector.pricing : t.inspector.pricingReservedFor(term)],
      ),
      segmented(
        'grid-cols-3',
        PRICING_IDS.map((id) =>
          choice(
            id,
            current === id,
            true,
            Message.PricingChosen({ nodeId: node.id, pricing: id }),
            [h.span([h.Class('w-full text-center')], [t.catalog.pricings[id].name])],
            t.catalog.pricings[id].blurb,
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
  const t = copy(h)

  const peers = game.nodes.filter(
    (entry) => entry.type === node.type && entry.region === node.region,
  )
  if (peers.length < 2) return h.empty
  const name = t.catalog.components[node.type].name
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
            h.AriaLabel(t.inspector.upgradeEveryHere(name)),
            h.Title(t.inspector.oneSizeOnEveryOnThis(name)),
          ],
        },
        [
          h.span(
            [h.Class('flex items-center gap-1.5')],
            [
              icon(h, ArrowUp, 'size-3.5'),
              growable.length > 0
                ? t.inspector.upgradeAll(growable.length)
                : t.inspector.upgradeAll2,
            ],
          ),
        ],
        h,
      ),
    ],
  )
}

const instance = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const sizeName = SIZES[node.size]?.name
  const price = resizePrice(game, node)
  return section(
    t.inspector.instance,
    [
      h.div(
        [h.Class(cn('flex items-center justify-between gap-2 p-1', WELL))],
        [
          smallButton(
            t.inspector.smallerFree,
            Minus,
            Message.ResizeChosen({ nodeId: node.id, direction: -1 }),
            node.size > 0,
            h,
          ),
          h.span(
            [h.Class(cn(FIGURE, 'flex-1 text-center text-[calc(12.5px*var(--type-scale))]'))],
            [
              t.inspector.vCPUGB(
                sizeName ? t.nodeList.sizes[sizeName] : '',
                vcpuOf(node),
                ramOf(node),
              ),
            ],
          ),
          smallButton(
            price === null
              ? t.inspector.largestSize
              : game.sandbox
                ? t.inspector.larger
                : t.inspector.larger2(money(price)),
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
            t.inspector.buyTenSizes,
            ChevronsRight,
            Message.BulkResizeChosen({ nodeId: node.id, mode: 'ten' }),
            price !== null && game.cash >= price,
            h,
          ),
          smallButton(
            t.inspector.buyToTheLargestSize,
            ArrowUp,
            Message.BulkResizeChosen({ nodeId: node.id, mode: 'max' }),
            price !== null && game.cash >= price,
            h,
          ),
        ],
      ),
      segmented(
        'grid-cols-3',
        FAMILY_IDS.map((id) =>
          choice(
            id,
            node.family === id,
            true,
            Message.OptionChosen({ nodeId: node.id, option: { kind: 'family', id } }),
            [h.span([h.Class('w-full text-center')], [t.catalog.families[id].name])],
            t.catalog.families[id].blurb,
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

const liveLinkOf = (ledger: Ledger, from: string, to: string): LinkLedger | undefined =>
  ledger.links.find((link) => link.from === from && link.to === to)

/** The Links out of a Node that carry traffic. Taps and control Links are separate. */
const outboundRoutes = (game: Game, node: GameNode): ReadonlyArray<readonly [GameLink, GameNode]> =>
  game.links.flatMap((link) => {
    const target = game.nodes.find((entry) => entry.id === link.to)
    return link.from === node.id &&
      target &&
      !COMPONENTS[target.type].control &&
      !COMPONENTS[target.type].tap
      ? [[link, target] as const]
      : []
  })

/** One Link as a compact entry: its Node's badge and name, and its live rate. */
const connectionGrid = (
  game: Game,
  node: GameNode,
  links: ReadonlyArray<readonly [GameLink, GameNode]>,
  side: 'in' | 'out',
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  if (links.length === 0) return h.empty
  return h.div(
    [
      h.Class(
        `-mx-1.5 grid ${links.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-x-1 gap-y-0.5`,
      ),
    ],
    links.map(([, other]) => {
      const live =
        side === 'in'
          ? liveLinkOf(ledger, other.id, node.id)
          : liveLinkOf(ledger, node.id, other.id)
      const rateNow = live?.rate ?? 0
      const name = nodeTitle(t, game, other)
      return h.button(
        [
          h.Key(`${side}-${other.id}`),
          h.Type('button'),
          h.OnClick(Message.RevealNode({ nodeId: other.id })),
          h.AriaLabel(t.inspectorShared.openNode(name)),
          h.Title(`${name} · ${t.inspector.s(rate(rateNow))}`),
          h.DataAttribute('connection', side),
          h.Class(
            'group flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-well',
          ),
        ],
        [
          groupBadge(
            COMPONENTS[other.type].group,
            COMPONENT_ICONS[other.type],
            'size-4 shrink-0',
            h,
          ),
          h.span(
            [h.Class('min-w-0 flex-1 truncate text-[calc(11px*var(--type-scale))] font-medium')],
            [name],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'shrink-0 text-[calc(10.5px*var(--type-scale))]',
                  rateNow > 0.01 ? 'text-muted-foreground' : 'text-muted-foreground/55',
                ),
              ),
            ],
            [t.inspector.s(rate(rateNow))],
          ),
        ],
      )
    }),
  )
}

/** One direction's traffic against a shared scale, as a progress bar. */
const capacityMeter = (
  label: string,
  value: number,
  scale: number,
  bounded: boolean,
  glyph: Parameters<typeof icon>[1],
  links: ReadonlyArray<readonly [GameLink, GameNode]>,
  side: 'in' | 'out',
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  const share = scale > 0 ? Math.min(1, value / scale) : 0
  const valueText = bounded
    ? `${t.inspector.s(rate(value))} · ${t.inspector.ofS(percent(share), rate(scale))}`
    : t.inspector.s(rate(value))
  return h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.div(
        [h.Class('flex items-center justify-between gap-3')],
        [
          h.span(
            [h.Class('flex items-center gap-1.5')],
            [
              icon(h, glyph, 'size-3.5 shrink-0 text-muted-foreground'),
              h.span([h.Class(EYEBROW)], [label]),
            ],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
            [valueText],
          ),
        ],
      ),
      progress(
        {
          value: share * 100,
          className: 'gap-0',
          trackClassName: 'h-2',
          label: `${label} ${valueText}`,
        },
        h,
      ),
      ...(links.length > 0 ? [connectionGrid(game, node, links, side, ledger, h)] : []),
    ],
  )
}

/** The always-visible answer to "how much traffic moves each way, and through what?" */
const trafficMeters = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const inbound = inboundLinks(game, node)
  const outgoing = outboundRoutes(game, node)
  if (inbound.length === 0 && outgoing.length === 0) return []
  const own = ledger.nodes[node.id]
  const inboundRate = own?.inbound ?? 0
  const outboundRate = outgoing.reduce(
    (sum, [link]) => sum + (liveLinkOf(ledger, node.id, link.to)?.rate ?? 0),
    0,
  )
  const capacity = own?.capacity ?? 0
  // A fixed Component has no finite capacity. Its bars compare the two directions instead.
  const bounded = Number.isFinite(capacity) && capacity > 0
  const scale = bounded ? capacity : Math.max(inboundRate, outboundRate)
  return [
    h.div(
      [h.Class('flex flex-col gap-3 px-4 pb-3')],
      [
        capacityMeter(
          t.inspector.inbound,
          inboundRate,
          scale,
          bounded,
          ArrowDownToLine,
          inbound,
          'in',
          game,
          node,
          ledger,
          h,
        ),
        capacityMeter(
          t.inspector.outbound,
          outboundRate,
          scale,
          bounded,
          ArrowUpFromLine,
          outgoing,
          'out',
          game,
          node,
          ledger,
          h,
        ),
      ],
    ),
  ]
}

/** Which zone the Node runs in, and a standby in another for data Nodes. */
const placement = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspector.zone,
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
                ['off', t.inspector.noStandby],
                ['async', t.inspector.standbyAsync],
                ['sync', t.inspector.standbySync],
              ],
              !node.standby ? 'off' : node.standbySync ? 'sync' : 'async',
              (mode) =>
                Message.StandbyChosen({
                  nodeId: node.id,
                  standby: mode !== 'off',
                  standbySync: mode === 'sync',
                }),
              h,
            ),
          ]
        : []),
    ],
    h,
  )
}

/** The region a Node runs in, once a second region is open. */
const regionSection = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const open = openRegions(game)
  if (open.length < 2 || isGlobal(node) || COMPONENTS[node.type].fixed) return []
  return [
    section(
      t.inspector.region,
      [
        picker(
          t.inspector.region2,
          open.map((region) => [region, t.catalog.regionInfo[region].short] as const),
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
  const t = copy(h)

  const links = outbound(game, node)
  if (links.length === 0) return []
  return [
    section(
      t.inspector.calls,
      links.map(([link, target]) =>
        h.div(
          [h.Key(link.to), h.Class('flex flex-col gap-1.5')],
          [
            nodeLink(game, target, h),
            picker(
              `timeout-${link.to}`,
              LINK_TIMEOUTS.map((seconds) => [seconds, t.inspector.s2(seconds)] as const),
              link.timeout,
              (timeout) => Message.LinkPolicyChosen({ from: node.id, to: link.to, timeout }),
              h,
            ),
            picker(
              `retries-${link.to}`,
              [
                ['none', t.inspector.noRetries],
                ['naive', t.inspector.retry3],
                ['backoff', t.inspector.backoff],
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
                      [false, t.inspector.noBreaker],
                      [
                        true,
                        link.fuse._tag === 'Open' ? t.inspector.breakerOpen : t.inspector.breaker,
                      ],
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
                      [false, t.inspector.noBulkhead],
                      [true, t.inspector.bulkhead],
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
                      [false, t.inspector.oneCopy],
                      [true, t.inspector.hedge],
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

const when = (t: Messages, time: number): string => {
  const clock = clockOf(time)
  return t.inspector.dayAt(
    clock.day,
    `${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}`,
  )
}

const difference = (t: Messages, value: number): string =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${t.units.perSecond(rate(Math.abs(value)))}`

/** A share of incoming traffic, with its change since the previous sample. */
const breakdown = (
  label: string | ReadonlyArray<string>,
  value: number,
  total: number,
  previous: number | null,
  h: HtmlBuilder<Message>,
  work: number | null = null,
): Html => {
  const t = copy(h)
  const share = total > 0 ? percent(value / total) : '0%'
  return h.div(
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
          work === null
            ? t.inspector.rateAndShare(rate(value), share)
            : t.inspector.workShareOf(rate(value), share, percent(work)),
          ...(previous === null
            ? []
            : [
                h.span(
                  [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
                  [difference(t, value - previous)],
                ),
              ]),
        ],
      ),
    ],
  )
}

/** The resource Work share counts, or null on a Node where every request costs the same. */
const workResourceOf = (t: Messages, unit: NodeSample['workUnit']): string | null =>
  unit === null ? null : t.inspector.workResources[unit]

/** The live sample or a recorded one, broken down by operation and source. */
const trafficBreakdown = (
  model: Model,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

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
  // A recorded sample names its sources in English: the Node's Component says it in the player's words.
  const sourceNames = new Map(
    game.nodes.map((entry) => [entry.id, t.catalog.components[entry.type].name] as const),
  )
  const load = sample.utilization >= 0.9 ? 'danger' : sample.utilization >= 0.7 ? 'warn' : 'plain'
  const earlier = index === -1 ? history.at(-1) : history[index - 1]
  // Work share (12 "Load diagnosis") shows on Nodes whose requests cost different amounts.
  const workResource = has(game, 'profiling') ? workResourceOf(t, sample.workUnit) : null
  const change = loadChange(model, history, sample, index, h)
  const amplified = amplification(model, node, sample, h)
  const receipts = index === -1 ? costReceipts(model, node, ledger, h) : null
  const whatIf = index === -1 ? whatIfs(model, node, h) : null
  return section(
    t.inspector.trafficLoad,
    [
      h.div(
        [h.Class('flex items-center justify-between gap-2')],
        [
          caption(index >= 0 ? t.inspector.recordedSample : t.inspector.liveTraffic, h),
          ...(index >= 0
            ? [
                button(
                  {
                    onClick: Message.NodeSampleChosen({ nodeId: node.id, time: null }),
                    variant: 'outline',
                    size: 'xs',
                  },
                  [icon(h, ChevronsRight, 'size-3'), t.inspector.backToLive],
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
                label: t.inspector.loadHistorySelectAPointOr,
                marks: costShifts(history),
              },
            ),
            h.div(
              [h.Class(cn('flex items-center justify-between gap-2 p-1', WELL))],
              [
                smallButton(
                  t.inspector.earlierSample,
                  ChevronLeft,
                  Message.NodeSampleChosen({ nodeId: node.id, time: earlier?.time ?? null }),
                  earlier !== undefined,
                  h,
                ),
                h.span(
                  [h.Class(cn(FIGURE, 'flex-1 text-center text-[calc(12.5px*var(--type-scale))]'))],
                  [when(t, sample.time)],
                ),
                smallButton(
                  t.inspector.laterSample,
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
                  ? t.inspector.historyAppearsAfterTwoRecordedSamples
                  : t.inspector.researchMetricsToInspectPastSamples,
              ],
            ),
          ]),
      h.div(
        [h.Class(NESTED)],
        [
          row(t.inspector.inbound, t.inspector.s(rate(sample.inbound)), 'plain', h),
          row(
            t.inspector.load,
            sample.inbound > 0
              ? t.inspector.ofS(percent(sample.utilization), rate(sample.capacity))
              : t.inspector.idle,
            sample.inbound > 0 ? load : 'plain',
            h,
          ),
          ...(sample.dropped > 0
            ? [
                row(
                  node.type === 'worker' ? t.inspector.requeued : t.inspector.dropped,
                  t.inspector.s(rate(sample.dropped)),
                  sample.dropped > 0.05 ? (node.type === 'worker' ? 'warn' : 'danger') : 'plain',
                  h,
                ),
              ]
            : []),
          ...(sample.refused > 0
            ? [
                row(
                  t.inspector.refused,
                  t.inspector.s(rate(sample.refused)),
                  sample.refused > 0.05 ? 'danger' : 'plain',
                  h,
                ),
              ]
            : []),
          ...(sample.hitRatio !== null
            ? [row(t.inspector.hitRatio, percent(sample.hitRatio), 'plain', h)]
            : []),
          ...(sample.queue
            ? [
                row(t.inspector.backlog, compact(sample.queue.depth), 'plain', h),
                row(t.inspector.sentToWorkers, t.inspector.s(rate(sample.queue.out)), 'plain', h),
                row(
                  t.inspector.queueWait,
                  formats(t).queueWait(
                    sample.queue.stalled ? Number.POSITIVE_INFINITY : sample.queue.wait,
                  ),
                  sample.queue.stalled ? 'warn' : 'plain',
                  h,
                ),
              ]
            : []),
        ],
      ),
      ...(change ? [change] : []),
      h.div(
        [h.Class('flex flex-col gap-1')],
        [
          caption(t.inspector.incomingOperations, h),
          ...(kinds.length
            ? [
                h.div(
                  [h.Class(NESTED)],
                  kinds.map((kind) =>
                    breakdown(
                      t.catalog.kinds[kind].label,
                      sample.traffic[kind] ?? 0,
                      sample.inbound,
                      previous ? (previous.traffic[kind] ?? 0) : null,
                      h,
                      workResource ? (sample.workShare[kind] ?? 0) : null,
                    ),
                  ),
                ),
              ]
            : [
                h.p(
                  [h.Class('px-3 text-[calc(12px*var(--type-scale))] text-muted-foreground')],
                  [t.inspector.noIncomingTrafficAtThisSample],
                ),
              ]),
          h.p(
            [
              h.Class(
                'px-3 text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground',
              ),
            ],
            [
              workResource
                ? t.inspector.workIs(workResource)
                : t.inspector.sharesDescribeIncomingTrafficNotCPU,
            ],
          ),
        ],
      ),
      ...(receipts ? [receipts] : []),
      ...(sources.length
        ? [
            h.div(
              [h.Class('flex flex-col gap-1')],
              [
                caption(t.inspector.sentBy, h),
                h.div(
                  [h.Class(NESTED)],
                  sources.map((source) =>
                    breakdown(
                      [
                        sourceNames.get(source.id) ?? source.name,
                        ...(source.ordinal > 0 ? [` ${source.ordinal}`] : []),
                      ],
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
      ...(amplified ? [amplified] : []),
      ...(whatIf ? [whatIf] : []),
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
        ? [callout(t.inspector.rightsizingReport, 'warn', null, h, 'mx-0 mb-0')]
        : []),
    ],
    h,
    true,
  )
}

export const inspector = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const node = game.nodes.find((entry) => entry.id === model.board.selected)
  if (!node) return h.empty
  const def = localized(COMPONENTS[node.type], t.catalog.components[node.type])
  const label = nodeLabelIn(t, game, node)
  const history = model.board.nodeHistory[node.id] ?? []
  const price = resizePrice(game, node)
  const sizeLabel = def.sized || def.steps > 1 ? sizeLabelIn(t, node) : null
  const panel = PANELS[node.type]
  const context = { model, game, node, ledger, h }

  return h.aside(
    [
      // Key the panel by the Node it inspects: a control's click handler closes over that Node's
      // id, so reusing the previous Node's DOM would send the previous Node's id.
      h.Key(`inspector-${node.id}`),
      h.DataAttribute('exit', 'gesture'),
      h.DataAttribute('inspector', ''),
      h.AriaLabel(nodeTitle(t, game, node)),
      h.Class(
        `absolute top-[76px] right-3 bottom-3 z-20 flex w-[348px] flex-col overflow-hidden ${PANEL} enter-panel compact:inset-0 compact:max-h-none compact:w-auto compact:rounded-none compact:pt-[env(safe-area-inset-top)] compact:pb-[env(safe-area-inset-bottom)] compact:shadow-none short:inset-x-auto short:top-[132px] short:right-[max(8px,env(safe-area-inset-right))] short:w-[320px] short:max-h-none`,
      ),
    ],
    [
      closeButton(
        {
          label: t.inspector.close,
          onClick: Message.EmptyTapped(),
          className: 'compact:top-[max(6px,env(safe-area-inset-top))] compact:size-11',
        },
        h,
      ),
      h.div(
        [h.Class('flex items-center gap-3 px-4 pt-4 pr-10 pb-2 compact:pr-14')],
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
      ...trafficMeters(game, node, ledger, h),
      ...warnings(game, node, ledger, h),
      h.div(
        [h.Class(`flex min-h-0 flex-1 flex-col divide-y divide-hairline ${SCROLL}`)],
        [
          h.div(
            [h.Class('px-4 pt-1 pb-2')],
            [
              ...(hasTraffic(node)
                ? [h.p([h.Class(`${EYEBROW} mb-2 text-muted-foreground`)], [t.inspector.liveNow])]
                : []),
              h.div([h.Class(NESTED)], stats(game, node, ledger, h)),
            ],
          ),
          ...(hasTraffic(node) ? [trafficBreakdown(model, node, ledger, h)] : []),
          ...(has(game, 'metrics') && history.length > 1 && !def.fixed && !hasTraffic(node)
            ? [
                section(
                  t.inspector.loadLastDay,
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
                [t.inspector.collect, h.span([h.Class(FIGURE)], [money(game.pending)])],
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
                        ? t.inspector.biggerDrawer
                        : node.type === 'analytics'
                          ? t.inspector.moreSamples
                          : sizeLabelIn(t, node, node.size + 1),
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
                    h.Title(t.inspector.restartFreesLeakedMemoryComesBack),
                    h.AriaLabel(t.inspector.restart),
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
                    h.Title(t.inspector.failOverTheStandbyTakesOver),
                    h.AriaLabel(t.inspector.failOver),
                  ],
                },
                icon(h, ArrowRightLeft, 'size-4'),
                h,
              )
            : h.empty,
          has(game, 'health-checks') &&
          !def.fixed &&
          !isDown(node.life) &&
          node.service._tag !== 'Draining'
            ? button(
                {
                  onClick: Message.DrainChosen({ nodeId: node.id }),
                  variant: 'outline',
                  size: 'icon-lg',
                  attributes: [h.Title(t.inspector.drainTitle), h.AriaLabel(t.inspector.drain)],
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
                    h.Title(t.inspector.sellForDelete(money(refundOf(game, node)))),
                    h.AriaLabel(t.inspector.sell),
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
