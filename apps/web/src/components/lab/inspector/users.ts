import type { Html, HtmlBuilder } from 'foldkit/html'
import { KINDS, PROFILES, REQUEST_KINDS } from '@quorum/simulation/catalog'
import { regional, regionUsers } from '@quorum/simulation/regions'
import type { Ledger } from '@quorum/simulation/ledger'
import { eraOf, has } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { compact, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { packetMark } from '@quorum/ui/game/packets'
import { FIGURE, NESTED, row } from '@quorum/ui/game/bits'
import { type Panel, percent, section } from './shared.ts'

const traffic = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const percentiles = has(game, 'percentiles')
  const kinds = REQUEST_KINDS.filter((kind) => ledger.kinds[kind])
  const list = [
    section(
      'Requests',
      kinds.map((kind) => {
        const entry = ledger.kinds[kind]
        const failing = (entry?.success ?? 1) < 0.95
        const slow = (entry?.p99 ?? 0) > PROFILES[kind].apdex
        const line = h.div(
          [h.Key(kind), h.Class('flex items-center gap-2 text-[calc(12px*var(--type-scale))]')],
          [
            // The kind's packet shape, so the legend teaches what the belts carry (15).
            packetMark(kind, 8, h),
            h.span([h.Class('flex-1')], [KINDS[kind].label]),
            h.span(
              [
                h.Class(
                  `${FIGURE} text-[calc(11.5px*var(--type-scale))] ${failing ? 'text-danger' : slow ? 'text-warn' : 'text-muted-foreground'}`,
                ),
              ],
              [
                `${rate(entry?.rate ?? 0)}/s · ${percent(entry?.success ?? 0)} ok${
                  percentiles ? '' : ` · ${ms(entry?.mean ?? 0)}`
                }`,
              ],
            ),
          ],
        )
        if (!percentiles) return line
        return h.div(
          [h.Key(kind), h.Class('flex flex-col gap-0.5')],
          [
            line,
            h.span(
              [
                h.Class(
                  `${FIGURE} pl-4 text-[calc(11.5px*var(--type-scale))] ${slow ? 'text-warn' : 'text-muted-foreground'}`,
                ),
              ],
              [
                `mean ${ms(entry?.mean ?? 0)} · p50 ${ms(entry?.p50 ?? 0)} · p95 ${ms(entry?.p95 ?? 0)} · p99 ${ms(entry?.p99 ?? 0)}`,
              ],
            ),
          ],
        )
      }),
      h,
    ),
  ]
  if (has(game, 'logs')) {
    list.push(
      section(
        'Errors by cause',
        [
          h.div(
            [h.Class(NESTED)],
            Object.entries(ledger.errors).map(([cause, value]) =>
              row(cause, `${rate(value)}/s`, value > 0.01 ? 'danger' : 'plain', h),
            ),
          ),
        ],
        h,
      ),
    )
  }
  return list
}

export const usersPanel: Panel = {
  stats: ({ game, node, ledger, h }) => {
    const target = eraOf(game).apdexTarget
    return [
      row(
        'Users',
        compact(regional(game) ? regionUsers(game)[node.region] : game.users),
        'plain',
        h,
      ),
      row('Market', compact(ledger.market), 'plain', h),
      row('Requests', `${rate(ledger.demand)}/s`, 'plain', h),
      row('Apdex now', ledger.apdex.toFixed(3), ledger.apdex >= target ? 'ok' : 'danger', h),
      row('Apdex, last hour', game.apdex.toFixed(3), game.apdex >= target ? 'ok' : 'danger', h),
      row('Velocity', `${ledger.velocity.toFixed(2)}×`, 'plain', h),
    ]
  },
  top: ({ game, ledger, h }) => [...traffic(game, ledger, h)],
}
