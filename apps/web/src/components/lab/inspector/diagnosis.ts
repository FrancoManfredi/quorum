import type { Html, HtmlBuilder } from 'foldkit/html'
import { ArrowUpRight, ChevronRight } from 'lucide'
import { REQUEST_KINDS, type Kind } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { has } from '@quorum/simulation/lookups'
import type { GameNode } from '@quorum/simulation/state'
import { rate } from '@quorum/ui/game/format'
import { FIGURE, NESTED, row } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { formats } from '@/i18n/format.ts'
import { copy, nodeTitle, type Messages } from '@/i18n/messages.ts'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { hourBefore, loadChangeOf, type NodeSample } from '@/game/node-metrics.ts'
import { WIKI_URL } from '@/platform/analytics.ts'
import { cn } from '@/lib/utils'
import { caption, percent } from './shared.ts'

/*
 * Load diagnosis (12 "Load diagnosis"): why a Node is busy. The rows name causes and give their
 * numbers. The fixes live in the wiki, behind each block's Why? link, so the player still learns
 * them.
 */

const GUIDE = `${WIKI_URL}/guides/find-the-bottleneck`

/** What-if rows older than this many sim seconds no longer describe the Board. */
const WHAT_IF_FRESH = 15

const whyLink = (anchor: string, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.a(
    [
      h.Href(`${GUIDE}#${anchor}`),
      h.Target('_blank'),
      h.Rel('noreferrer noopener'),
      h.AriaLabel(t.inspector.whyTitle),
      h.Class(
        'group inline-flex items-center gap-0.5 text-[calc(12px*var(--type-scale))] text-muted-foreground underline decoration-foreground/25 underline-offset-[3px] hover:text-foreground hover:decoration-foreground',
      ),
    ],
    [
      t.inspector.why,
      icon(
        h,
        ArrowUpRight,
        'size-3 shrink-0 transition-transform group-hover:translate-x-px group-hover:-translate-y-px',
      ),
    ],
  )
}

const block = (
  title: string,
  anchor: string,
  body: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.Key(anchor), h.Class('flex flex-col gap-1')],
    [
      h.div(
        [h.Class('flex items-baseline justify-between gap-2')],
        [caption(title, h), whyLink(anchor, h)],
      ),
      ...body,
    ],
  )

const signed = (t: Messages, value: number): string =>
  t.inspector.points(
    `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.round(Math.abs(value) * 100)}`,
  )

/** Below this change in utilization, the Load change reads Steady. */
const STEADY = 0.02

const words = (t: Messages, part: 'demand' | 'cost' | 'capacity', value: number): string => {
  const up = value > 0
  switch (part) {
    case 'demand':
      return up ? t.inspector.loadChangeMoreTraffic : t.inspector.loadChangeLessTraffic
    case 'cost':
      return up ? t.inspector.loadChangeCostsMore : t.inspector.loadChangeCostsLess
    case 'capacity':
      return up ? t.inspector.loadChangeLessCapacity : t.inspector.loadChangeMoreCapacity
  }
}

/**
 * Load change: what moved the load since one calendar hour earlier. Without `metrics` the player
 * gets the largest cause in words; with it, each part in points.
 */
export const loadChange = (
  model: Model,
  history: ReadonlyArray<NodeSample>,
  sample: NodeSample,
  index: number,
  h: HtmlBuilder<Message>,
): Html | null => {
  const t = copy(h)
  const game = model.board.game
  const earlier = hourBefore(history, index)
  const change = earlier ? loadChangeOf(sample, earlier) : null
  const callee = sample.slowest
  const calleeNode = callee && game.nodes.find((entry) => entry.id === callee.id)
  const slowest =
    has(game, 'tracing') && callee
      ? row(
          t.inspector.slowestCall,
          `${calleeNode ? nodeTitle(t, game, calleeNode) : callee.name} · ${formats(t).ms(callee.latency)}`,
          'plain',
          h,
        )
      : null
  if (!change || !earlier) return null
  const parts = (['demand', 'cost', 'capacity'] as const).map(
    (part) => [part, change[part]] as const,
  )
  const [largest, value] = parts.reduce((best, entry) =>
    Math.abs(entry[1]) > Math.abs(best[1]) ? entry : best,
  )
  const steady = Math.abs(sample.utilization - earlier.utilization) < STEADY
  const summary = steady ? t.inspector.loadChangeSteady : words(t, largest, value)
  const busy = sample.utilization >= 0.7
  const label = {
    demand: t.inspector.loadChangeDemand,
    cost: t.inspector.loadChangeCost,
    capacity: t.inspector.loadChangeCapacity,
  }
  return block(
    t.inspector.loadChange,
    'read-the-load-change',
    [
      h.div(
        [h.Class(NESTED)],
        has(game, 'metrics')
          ? [
              row(
                summary,
                t.inspector.loadChangeSince(
                  percent(earlier.utilization),
                  percent(sample.utilization),
                ),
                'plain',
                h,
              ),
              ...parts.map(([part, points]) =>
                row(
                  label[part],
                  signed(t, points),
                  busy && !steady && part === largest && points > 0 ? 'warn' : 'plain',
                  h,
                ),
              ),
              ...(slowest ? [slowest] : []),
            ]
          : [row(summary, '', busy && !steady && value > 0 ? 'warn' : 'plain', h)],
      ),
    ],
    h,
  )
}

/** Amplification: the Users' Request kinds behind this Node's inbound, and what repeats. */
export const amplification = (
  model: Model,
  node: GameNode,
  sample: NodeSample,
  h: HtmlBuilder<Message>,
): Html | null => {
  const t = copy(h)
  if (!has(model.board.game, 'tracing') || node.type === 'users' || sample.inbound <= 0) return null
  const kinds = REQUEST_KINDS.filter((kind) => (sample.origins[kind] ?? 0) > 0.005).toSorted(
    (a, b) => (sample.origins[b] ?? 0) - (sample.origins[a] ?? 0),
  )
  // A Node that takes the Users' requests once each, with nothing repeated, has nothing to explain.
  const multiplied = kinds.some(
    (kind) =>
      Math.abs((sample.origins[kind] ?? 0) - (sample.sent[kind] ?? 0)) >
      0.05 * (sample.sent[kind] ?? 1),
  )
  if (kinds.length === 0 || (!multiplied && sample.repeated <= 0.005 && sample.misses <= 0.005))
    return null
  return block(
    t.inspector.amplification,
    'read-amplification',
    [
      h.div(
        [h.Class(NESTED)],
        [
          ...kinds.map((kind) => {
            const here = sample.origins[kind] ?? 0
            const sent = sample.sent[kind] ?? 0
            return row(
              t.catalog.kinds[kind].label,
              sent > 0
                ? t.inspector.callsPerRequest(rate(sent), (here / sent).toFixed(1), rate(here))
                : t.units.perSecond(rate(here)),
              'plain',
              h,
            )
          }),
          ...(sample.repeated > 0.005
            ? [
                row(
                  t.inspector.repeatedCalls,
                  percent(sample.repeated / sample.inbound),
                  sample.repeated / sample.inbound >= 0.1 ? 'warn' : 'plain',
                  h,
                ),
              ]
            : []),
          ...(sample.misses > 0.005
            ? [row(t.inspector.cacheMisses, percent(sample.misses / sample.inbound), 'plain', h)]
            : []),
        ],
      ),
    ],
    h,
  )
}

const ms = (t: Messages, value: number): string =>
  t.units.ms(value < 10 ? value.toFixed(2) : value.toFixed(1))

const factor = (value: number): string =>
  `× ${value >= 10 ? value.toFixed(1) : value.toFixed(2).replace(/0$/, '')}`

/** The Cost receipt of each kind at a Node, the kinds that take the most CPU first. */
export const costReceipts = (
  model: Model,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html | null => {
  const t = copy(h)
  if (!has(model.board.game, 'profiling')) return null
  const own = ledger.nodes[node.id]
  if (!own) return null
  const kinds = (Object.keys(own.receipts) as Array<Kind>).filter(
    (kind) => (own.traffic[kind] ?? 0) > 0,
  )
  const cpu = (kind: Kind) => (own.traffic[kind] ?? 0) * (own.receipts[kind]?.total ?? 0)
  const total = kinds.reduce((sum, kind) => sum + cpu(kind), 0)
  if (kinds.length === 0 || total <= 0) return null
  const sorted = kinds.toSorted((a, b) => cpu(b) - cpu(a))
  return block(
    t.inspector.costPerRequest,
    'read-the-cost-receipt',
    [
      h.div(
        [h.Class(NESTED)],
        sorted.map((kind) => {
          const receipt = own.receipts[kind]!
          return h.details(
            [h.Key(kind), h.Class('group/receipt')],
            [
              h.summary(
                [
                  h.Class(
                    'flex cursor-pointer list-none items-baseline justify-between gap-3 px-3 py-1.5 [&::-webkit-details-marker]:hidden',
                  ),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        'flex items-center gap-1 text-[calc(12.5px*var(--type-scale))] text-muted-foreground',
                      ),
                    ],
                    [
                      icon(
                        h,
                        ChevronRight,
                        'size-3 shrink-0 transition-transform group-open/receipt:rotate-90',
                      ),
                      t.catalog.kinds[kind].label,
                    ],
                  ),
                  h.span(
                    [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] whitespace-nowrap'))],
                    [t.inspector.receiptTotal(ms(t, receipt.total), percent(cpu(kind) / total))],
                  ),
                ],
              ),
              h.div(
                [h.Class('pb-1 pl-4')],
                [
                  row(t.inspector.receiptBase, ms(t, receipt.base), 'plain', h),
                  ...receipt.lines.map((line) =>
                    row(
                      t.inspector.costCauses[line.cause],
                      line.op === 'times' ? factor(line.value) : `+ ${ms(t, line.value)}`,
                      line.op === 'times' ? (line.value > 1 ? 'warn' : 'ok') : 'plain',
                      h,
                    ),
                  ),
                ],
              ),
            ],
          )
        }),
      ),
    ],
    h,
  )
}

/** What-if rows: the Node's utilization after one change, from the compute worker's ghost runs. */
export const whatIfs = (model: Model, node: GameNode, h: HtmlBuilder<Message>): Html | null => {
  const t = copy(h)
  const game = model.board.game
  const found = model.board.whatIfs
  if (!has(game, 'profiling') || !found || found.nodeId !== node.id) return null
  const age = game.time - found.at
  if (age < 0 || age > WHAT_IF_FRESH || found.rows.length === 0) return null
  return block(
    t.inspector.whatIf,
    'try-a-what-if',
    [
      h.div(
        [h.Class(NESTED)],
        found.rows.map((entry) => {
          const target = game.nodes.find((candidate) => candidate.id === entry.target)
          const label =
            entry.change === 'retries-off'
              ? t.inspector.whatIfRetriesOff
              : t.inspector.whatIfLarger(target ? nodeTitle(t, game, target) : entry.target)
          return h.div(
            [h.Key(`${entry.change}:${entry.target}`)],
            [
              row(
                label,
                t.inspector.loadChangeSince(percent(entry.before), percent(entry.after)),
                entry.after >= 0.9 ? 'danger' : entry.after >= 0.7 ? 'warn' : 'ok',
                h,
              ),
            ],
          )
        }),
      ),
    ],
    h,
  )
}
