import { formats } from '@/i18n/format.ts'
import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { VEC_AI_LIFT, VEC_INDEXES, VEC_QUERIES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode, VecIndexType } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, outbound, percent, picker, section } from './shared.ts'

/** A Vector Index's type: its recall, its lookups, and the memory it bills (07). */
const vector = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const index = VEC_INDEXES[node.indexType]
  const prompts = game.nodes.filter(
    (entry) => entry.type === 'server' || entry.type === 'worker' || entry.type === 'fn',
  )
  const reached = prompts.filter((entry) =>
    outbound(game, entry).some(([, to]) => to.id === node.id),
  )
  return [
    section(
      t.inspectorVec.index,
      [
        picker(
          'index-type',
          (
            Object.entries(VEC_INDEXES) as ReadonlyArray<
              [VecIndexType, (typeof VEC_INDEXES)['exact']]
            >
          ).map(([id]) => [id, t.catalog.vecIndexes[id].name] as const),
          node.indexType,
          (indexType) => Message.VecIndexChosen({ nodeId: node.id, indexType }),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            t.inspectorVec.exactComparesTheQueryToEvery(
              VEC_QUERIES,
              index.queries,
              percent(index.recall),
            ),
          ],
        ),
        caption(t.inspectorVec.recallBurnS(percent(index.recall), money(burnOf(game, node))), h),
      ],
      h,
      true,
    ),
    section(
      t.inspectorVec.retrieval,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorVec.linkANodeThatAnswersPrompts(Math.round((VEC_AI_LIFT - 1) * 100))],
        ),
        caption(
          reached.length === 0
            ? t.inspectorVec.nothingAnswersPromptsThroughItYet
            : t.inspectorVec.nodesRetrieveFromIt(reached.length),
          h,
        ),
      ],
      h,
    ),
  ]
}

export const vecPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    const index = VEC_INDEXES[node.indexType]
    return [
      row(t.inspectorVec.lookups, t.inspectorVec.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorVec.load,
        own.inbound > 0
          ? t.inspectorVec.ofS(percent(Math.min(own.utilization, 9.99)), rate(own.capacity))
          : t.inspectorVec.idle,
        own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
        h,
      ),
      row(t.inspectorVec.index, t.catalog.vecIndexes[node.indexType].name, 'plain', h),
      row(t.inspectorVec.recall, percent(index.recall), index.recall >= 1 ? 'ok' : 'warn', h),
      row(t.inspectorVec.latency, formats(t).ms(own.latency), 'plain', h),
      row(t.inspectorVec.burn, t.inspectorVec.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...vector(game, node, h)],
}
