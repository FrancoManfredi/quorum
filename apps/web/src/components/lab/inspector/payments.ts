import { copy } from '@/i18n/messages.ts'
import { drawerSize } from '@quorum/simulation/lookups'
import { money } from '@quorum/ui/game/format'
import { row } from '@quorum/ui/game/bits'
import { type Panel } from './shared.ts'

export const paymentsPanel: Panel = {
  stats: ({ game, ledger, h }) => {
    const t = copy(h)

    return [
      row(
        t.inspectorPayments.inTheDrawer,
        money(game.pending),
        game.pending >= drawerSize(game, ledger.revenue) * 0.98 ? 'warn' : 'plain',
        h,
      ),
      row(t.inspectorPayments.drawerSize, money(drawerSize(game, ledger.revenue)), 'plain', h),
      row(t.inspectorPayments.spilled, money(game.spilled), game.spilled > 0 ? 'warn' : 'plain', h),
      row(t.inspectorPayments.revenue, t.inspectorPayments.s(money(ledger.revenue)), 'ok', h),
      ...(ledger.subscriptions > 0
        ? [
            row(
              t.inspectorPayments.subscriptions,
              t.inspectorPayments.s(money(ledger.subscriptions)),
              'ok',
              h,
            ),
          ]
        : []),
      row(t.inspectorPayments.burn, t.inspectorPayments.s(money(ledger.burn)), 'plain', h),
      ...(ledger.salaries > 0
        ? [
            row(
              t.inspectorPayments.salaries,
              t.inspectorPayments.s(money(ledger.salaries)),
              'plain',
              h,
            ),
          ]
        : []),
    ]
  },
}
