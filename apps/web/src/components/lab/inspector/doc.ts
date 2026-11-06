import { formats } from '@/i18n/format.ts'
import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { DOC_JOIN_COST, DOC_SHAPE_DH } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, picker, section } from './shared.ts'

/** A Document Store's transactions, and the access patterns its Dev Hours buy (07). */
const documents = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorDoc.transactions,
      [
        picker(
          'transactions',
          [
            [false, t.inspectorDoc.oneDocument],
            [true, t.inspectorDoc.multiDocument],
          ],
          node.transactions,
          (transactions) => Message.DocOptionsChosen({ nodeId: node.id, transactions }),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorDoc.aCheckoutWritesSeveralDocumentsWithout],
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorDoc.accessPatterns,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            t.inspectorDoc.thereAreNoJoinsAQuery(
              DOC_JOIN_COST,
              Math.round((1 - DOC_SHAPE_DH) * 100),
            ),
          ],
        ),
        caption(t.inspectorDoc.theTeamPanelChargesTheDev, h),
      ],
      h,
    ),
  ]
}

export const docPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    // One flat rate of ops: a read or a write is one, and a join is three of them (07).
    const ops = (own.traffic['q-tx'] ?? 0) + (own.traffic['q-scan'] ?? 0)
    return [
      row(t.inspectorDoc.inbound, t.inspectorDoc.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorDoc.load,
        own.inbound > 0
          ? t.inspectorDoc.ofOpsPerSecond(
              percent(Math.min(own.utilization, 9.99)),
              rate(own.capacity),
            )
          : t.inspectorDoc.idle,
        own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
        h,
      ),
      row(t.inspectorDoc.joins, t.inspectorDoc.s(rate(ops)), ops > 0 ? 'warn' : 'plain', h),
      row(
        t.inspectorDoc.transactions,
        node.transactions ? t.inspectorDoc.multiDocumentValue : t.inspectorDoc.oneDocumentValue,
        node.transactions ? 'plain' : 'warn',
        h,
      ),
      row(t.inspectorDoc.connections, t.inspectorDoc.noneToPool, 'ok', h),
      row(t.inspectorDoc.latency, formats(t).ms(own.latency), 'plain', h),
      row(t.inspectorDoc.burn, t.inspectorDoc.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...documents(game, node, h)],
}
