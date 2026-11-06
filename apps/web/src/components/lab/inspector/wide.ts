import type { Html, HtmlBuilder } from 'foldkit/html'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, picker, section, splitting, spreading } from './shared.ts'

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

export const widePanel: Panel = {
  late: ({ game, node, h }) => [...wide(game, node, h)],
}
