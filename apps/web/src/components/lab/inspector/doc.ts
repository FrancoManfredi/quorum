import type { Html, HtmlBuilder } from 'foldkit/html'
import { DOC_JOIN_COST, DOC_SHAPE_DH } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, picker, section } from './shared.ts'

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

export const docPanel: Panel = {
  stats: ({ game, node, own, h }) => {
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
  },
  body: ({ game, node, h }) => [...documents(game, node, h)],
}
