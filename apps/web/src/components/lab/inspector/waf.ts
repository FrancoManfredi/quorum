import type { Html, HtmlBuilder } from 'foldkit/html'
import { PARANOIA } from '@quorum/simulation/catalog'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, picker, section } from './shared.ts'

const waf = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Paranoia',
    [
      picker(
        'paranoia',
        PARANOIA.map((entry) => [entry.level, `${entry.level}`] as const),
        node.paranoia,
        (paranoia) => Message.ParanoiaChosen({ nodeId: node.id, paranoia }),
        h,
      ),
      picker(
        'under-attack',
        [
          [false, 'Normal'],
          [true, 'Under attack'],
        ],
        node.underAttack,
        (underAttack) => Message.UnderAttackChosen({ nodeId: node.id, underAttack }),
        h,
      ),
    ],
    h,
  )

export const wafPanel: Panel = {
  body: ({ node, h }) => [waf(node, h)],
}
