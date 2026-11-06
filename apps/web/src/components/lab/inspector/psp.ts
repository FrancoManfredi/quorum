import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { SECOND_PROVIDER_FEE } from '@quorum/simulation/components/psp'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** Which Payment Provider takes the checkouts (18 "Senders"): the second keeps serving through an outage of the first. */
const paymentProvider = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorPayments.provider,
      [
        picker(
          'provider',
          [
            ['first', t.inspectorPayments.firstProvider],
            ['second', t.inspectorPayments.secondProvider],
          ] as const,
          node.provider,
          (provider) => Message.ProviderChosen({ nodeId: node.id, provider }),
          h,
        ),
        caption(
          node.provider === 'second'
            ? t.inspectorPayments.aSecondProviderCharges(
                Math.round((SECOND_PROVIDER_FEE - 1) * 100),
              )
            : t.inspectorPayments.oneProviderTakesEveryCheckout,
          h,
        ),
      ],
      h,
    ),
  ]
}

export const pspPanel: Panel = {
  body: ({ node, h }) => [...paymentProvider(node, h)],
}
