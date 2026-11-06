import { copy } from '@/i18n/messages.ts'
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
  const t = copy(h)

  const left = certDaysLeft(game)
  const life = certDaysOf(game)
  return [
    section(
      t.inspectorPki.certificate,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorPki.aCertificateLastsCalendarDaysAnd(life, Math.round(life * CERT_RENEW))],
        ),
        caption(
          left === null
            ? t.inspectorPki.theFirstStepWithAManager
            : left <= 0
              ? t.inspectorPki.expiredEveryBrowserRefusesTheSite
              : t.inspectorPki.daysLeft(Math.max(0, Math.round(left))),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorPki.sellItOrLeaveItDown],
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorPki.secrets,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorPki.theKeysLiveHereNotIn],
        ),
      ],
      h,
    ),
  ]
}

export const pkiPanel: Panel = {
  stats: ({ game, node, h }) => {
    const t = copy(h)

    const left = certDaysLeft(game)
    const life = certDaysOf(game)
    return [
      row(t.inspectorPki.lifetime, t.inspectorPki.d(life), 'plain', h),
      row(
        t.inspectorPki.expires,
        left === null
          ? t.inspectorPki.notIssuedYet
          : left <= 0
            ? t.inspectorPki.expired
            : t.inspectorPki.inD(Math.max(0, Math.round(left))),
        left === null ? 'warn' : left <= 1 ? 'danger' : left < 14 ? 'warn' : 'ok',
        h,
      ),
      row(t.inspectorPki.renewsAt, t.inspectorPki.d(Math.round(life * CERT_RENEW)), 'plain', h),
      row(t.inspectorPki.burn, t.inspectorPki.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...secrets(game, node, h)],
}
