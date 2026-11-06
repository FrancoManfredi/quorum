import { drawerSize } from '@quorum/simulation/lookups'
import { money } from '@quorum/ui/game/format'
import { row } from '@quorum/ui/game/bits'
import { type Panel } from './shared.ts'

export const paymentsPanel: Panel = {
  stats: ({ game, ledger, h }) => {
    return [
      row(
        'In the drawer',
        money(game.pending),
        game.pending >= drawerSize(game, ledger.revenue) * 0.98 ? 'warn' : 'plain',
        h,
      ),
      row('Drawer size', money(drawerSize(game, ledger.revenue)), 'plain', h),
      row('Spilled', money(game.spilled), game.spilled > 0 ? 'warn' : 'plain', h),
      row('Revenue', `${money(ledger.revenue)}/s`, 'ok', h),
      ...(ledger.subscriptions > 0
        ? [row('Subscriptions', `${money(ledger.subscriptions)}/s`, 'ok', h)]
        : []),
      row('Burn', `${money(ledger.burn)}/s`, 'plain', h),
      ...(ledger.salaries > 0 ? [row('Salaries', `${money(ledger.salaries)}/s`, 'plain', h)] : []),
    ]
  },
}
