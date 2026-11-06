import type { Html, HtmlBuilder } from 'foldkit/html'
import { CERT_RENEW } from '@quorum/simulation/catalog'
import { burnOf, certDaysLeft, certDaysOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, section } from './shared.ts'

/** Secrets and Certificates: what is left of the certificate, and who renews it (05). */
const secrets = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const left = certDaysLeft(game)
  const life = certDaysOf(game)
  return [
    section(
      'Certificate',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A certificate lasts ${life} calendar days, and the sidecar renews it at ${Math.round(life * CERT_RENEW)}. Renewal is automatic while this Node runs.`,
          ],
        ),
        caption(
          left === null
            ? 'The first Step with a manager issues it.'
            : left <= 0
              ? 'Expired: every browser refuses the site until one is live again, or you press Renew.'
              : `${Math.max(0, Math.round(left))} days left.`,
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'Sell it or leave it down past the expiry date and the certificate lapses: every Node that terminates TLS fails until one runs again. From Series C certificates last 45 days, so manual renewal gets harder.',
          ],
        ),
      ],
      h,
      true,
    ),
    section(
      'Secrets',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'The keys live here, not in the code. Secrets management research keeps them off a phishing page too.',
          ],
        ),
      ],
      h,
    ),
  ]
}

export const pkiPanel: Panel = {
  stats: ({ game, node, h }) => {
    const left = certDaysLeft(game)
    const life = certDaysOf(game)
    return [
      row('Lifetime', `${life} d`, 'plain', h),
      row(
        'Expires',
        left === null
          ? 'not issued yet'
          : left <= 0
            ? 'expired'
            : `in ${Math.max(0, Math.round(left))} d`,
        left === null ? 'warn' : left <= 1 ? 'danger' : left < 14 ? 'warn' : 'ok',
        h,
      ),
      row('Renews at', `${Math.round(life * CERT_RENEW)} d`, 'plain', h),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...secrets(game, node, h)],
}
