import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { PARANOIA } from '@quorum/simulation/catalog'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, picker, section } from './shared.ts'

const waf = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorWaf.paranoia,
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
          [false, t.inspectorWaf.normal],
          [true, t.inspectorWaf.underAttack],
        ],
        node.underAttack,
        (underAttack) => Message.UnderAttackChosen({ nodeId: node.id, underAttack }),
        h,
      ),
    ],
    h,
  )
}

export const wafPanel: Panel = {
  body: ({ node, h }) => [waf(node, h)],
}
