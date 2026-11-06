import type { Html, HtmlBuilder } from 'foldkit/html'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

const pooler = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Pooling mode',
    [
      picker(
        'pooler-mode',
        [
          ['session', 'Session'],
          ['transaction', 'Transaction'],
          ['statement', 'Statement'],
        ],
        node.mode,
        (mode) => Message.PoolerModeChosen({ nodeId: node.id, mode }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        node.mode === 'statement'
          ? 'One server connection per statement: a transaction that spans statements fails.'
          : node.mode === 'session'
            ? 'One server connection per client: barely smaller than no pooler at all.'
            : 'One server connection per active transaction. Session state breaks.',
        h,
      ),
    ],
    h,
  )

export const poolerPanel: Panel = {
  body: ({ node, h }) => [pooler(node, h)],
}
