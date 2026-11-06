import type { Html, HtmlBuilder } from 'foldkit/html'
import { RUNTIMES, EDGE_CPU_MS, EDGE_MEMORY_MB } from '@quorum/simulation/catalog'
import { edgeRuns } from '@quorum/simulation/rules'
import { burnOf, edgeBurnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, section } from './shared.ts'

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

export const edgePanel: Panel = {
  stats: ({ game, node, own, h }) => {
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
  },
  body: ({ game, node, h }) => [...edge(game, node, h)],
}
