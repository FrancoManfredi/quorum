import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { MAX_ATTEMPTS, QUEUE_LENGTHS } from '@quorum/simulation/catalog'
import type { GameNode } from '@quorum/simulation/state'
import { compact } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, picker, section } from './shared.ts'

const queue = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorQueue.failedTasks,
      [
        picker(
          'dlq',
          [
            [false, t.inspectorQueue.retryForever],
            [true, t.inspectorQueue.deadLetterQueue],
          ],
          node.dlq,
          (dlq) => Message.DlqChosen({ nodeId: node.id, dlq }),
          h,
        ),
        ...(node.dlq
          ? [
              picker(
                'attempts',
                MAX_ATTEMPTS.map((attempts) => [attempts, `${attempts}×`] as const),
                node.attempts,
                (attempts) => Message.AttemptsChosen({ nodeId: node.id, attempts }),
                h,
              ),
            ]
          : []),
      ],
      h,
    ),
    section(
      t.inspectorQueue.maxLength,
      [
        picker(
          'max-length',
          QUEUE_LENGTHS.map(
            (maxLength) =>
              [maxLength, maxLength === 0 ? t.inspectorQueue.none : compact(maxLength)] as const,
          ),
          node.maxLength,
          (maxLength) => Message.MaxLengthChosen({ nodeId: node.id, maxLength }),
          h,
        ),
      ],
      h,
    ),
  ]
}

export const queuePanel: Panel = {
  body: ({ node, h }) => [...queue(node, h)],
}
