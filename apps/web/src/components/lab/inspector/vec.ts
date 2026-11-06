import type { Html, HtmlBuilder } from 'foldkit/html'
import { VEC_AI_LIFT, VEC_INDEXES, VEC_QUERIES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode, VecIndexType } from '@quorum/simulation/state'
import { money, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, outbound, percent, picker, section } from './shared.ts'

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

export const vecPanel: Panel = {
  stats: ({ game, node, own, h }) => {
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
  },
  body: ({ game, node, h }) => [...vector(game, node, h)],
}
