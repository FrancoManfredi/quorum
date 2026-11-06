import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

const pooler = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorPooler.poolingMode,
    [
      picker(
        'pooler-mode',
        [
          ['session', t.inspectorPooler.session],
          ['transaction', t.inspectorPooler.transaction],
          ['statement', t.inspectorPooler.statement],
        ],
        node.mode,
        (mode) => Message.PoolerModeChosen({ nodeId: node.id, mode }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        node.mode === 'statement'
          ? t.inspectorPooler.oneServerConnectionPerStatementA
          : node.mode === 'session'
            ? t.inspectorPooler.oneServerConnectionPerClientBarely
            : t.inspectorPooler.oneServerConnectionPerActiveTransaction,
        h,
      ),
    ],
    h,
  )
}

export const poolerPanel: Panel = {
  body: ({ node, h }) => [pooler(node, h)],
}
