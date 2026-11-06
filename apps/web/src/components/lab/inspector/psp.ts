import type { Html, HtmlBuilder } from 'foldkit/html'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** Which Payment Provider takes the checkouts (18 "Senders"): the second keeps serving through an outage of the first. */
const paymentProvider = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Provider',
    [
      picker(
        'provider',
        [
          ['first', 'First'],
          ['second', 'Second'],
        ] as const,
        node.provider,
        (provider) => Message.ProviderChosen({ nodeId: node.id, provider }),
        h,
      ),
      caption(
        node.provider === 'second'
          ? 'A second provider charges 15% more per checkout and keeps serving when the first is down.'
          : 'One provider takes every checkout. When it is down, checkouts fail until it is back.',
        h,
      ),
    ],
    h,
  ),
]

export const pspPanel: Panel = {
  body: ({ node, h }) => [...paymentProvider(node, h)],
}
