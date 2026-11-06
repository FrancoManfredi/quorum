import { formats } from '@/i18n/format.ts'
import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { EDGE_CPU_MS, EDGE_MEMORY_MB, EDGE_MS, EDGE_READ_HIT } from '@quorum/simulation/catalog'
import { edgeRuns } from '@quorum/simulation/rules'
import { burnOf, edgeBurnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, section } from './shared.ts'

/** An Edge Function's ceilings, and the Stack it needs (05 "Edge Function"). */
const edge = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorEdge.ceilings,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorEdge.aHandlerRunsIn(EDGE_MEMORY_MB, t.units.ms(EDGE_CPU_MS))],
        ),
        caption(
          edgeRuns(node)
            ? t.inspectorEdge.thisStackCompilesToTheEdge
            : t.inspectorEdge.cannotRunAtTheEdge(t.catalog.runtimes[node.runtime].name),
          h,
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorEdge.edgeCache,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorEdge.aUserInItsRegion(t.units.ms(EDGE_MS), Math.round(EDGE_READ_HIT * 100))],
        ),
      ],
      h,
    ),
  ]
}

export const edgePanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    const refused = !edgeRuns(node)
    return [
      row(t.inspectorEdge.inbound, t.inspectorEdge.s(rate(own.inbound)), 'plain', h),
      row(t.inspectorEdge.latency, formats(t).ms(own.latency), 'plain', h),
      row(t.inspectorEdge.cPUCeiling, t.units.ms(EDGE_CPU_MS), 'plain', h),
      row(
        t.inspectorEdge.stack,
        refused
          ? t.inspectorEdge.cannotRunHere(t.catalog.runtimes[node.runtime].name)
          : t.catalog.runtimes[node.runtime].name,
        refused ? 'danger' : 'plain',
        h,
      ),
      row(
        t.inspectorEdge.uses,
        t.inspectorEdge.s(money(edgeBurnOf(game, node, own.inbound - own.dropped))),
        'plain',
        h,
      ),
      row(t.inspectorEdge.standingBurn, t.inspectorEdge.s(money(burnOf(game, node))), 'ok', h),
    ]
  },
  body: ({ game, node, h }) => [...edge(game, node, h)],
}
