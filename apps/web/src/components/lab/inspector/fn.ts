import { formats } from '@/i18n/format.ts'
import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  SERVERLESS_CONCURRENCY,
  SERVERLESS_GB_SECOND,
  SERVERLESS_MEMORY_GB,
  SERVERLESS_REQUEST_PRICE,
} from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { burnOf, coldStartMs, serverlessBurnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { compact, money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, section } from './shared.ts'

/** A Serverless Function's executions, its cold start, and the bill it runs up (05). */
const serverless = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const own = ledger.nodes[node.id]
  const slots = own?.resources.slots
  const used = slots ? Math.min(slots.used, slots.total) : 0
  const done = own ? own.inbound - own.dropped : 0
  return [
    section(
      t.inspectorFn.executions,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorFn.oneExecutionHoldsTheRequest(compact(SERVERLESS_CONCURRENCY))],
        ),
        caption(
          t.inspectorFn.inFlight(
            compact(Math.round(used)),
            compact(slots?.total ?? SERVERLESS_CONCURRENCY),
          ),
          h,
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorFn.coldStart,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorFn.aNewEnvironmentBoots(formats(t).ms(coldStartMs(node)))],
        ),
        caption(t.inspectorFn.changeTheRuntime, h),
      ],
      h,
    ),
    section(
      t.inspectorFn.bill,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            t.inspectorFn.noBoxToPayFor(
              money(SERVERLESS_REQUEST_PRICE * 1_000),
              money(SERVERLESS_GB_SECOND),
              SERVERLESS_MEMORY_GB,
            ),
          ],
        ),
        caption(
          t.inspectorFn.thisUse(money(serverlessBurnOf(game, node, done, own?.latency ?? 0))),
          h,
        ),
      ],
      h,
    ),
  ]
}

export const fnPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    const slots = own.resources.slots
    const used = slots ? Math.min(slots.used, slots.total) : 0
    return [
      row(t.inspectorFn.inbound, t.inspectorFn.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorFn.executions,
        slots ? `${used.toFixed(1)} / ${compact(Math.round(slots.total))}` : '—',
        slots && used >= slots.total * 0.9 ? 'danger' : 'plain',
        h,
      ),
      row(t.inspectorFn.coldStart, formats(t).ms(coldStartMs(node)), 'plain', h),
      row(
        t.inspectorFn.uses,
        t.inspectorFn.s(
          money(serverlessBurnOf(game, node, own.inbound - own.dropped, own.latency)),
        ),
        'plain',
        h,
      ),
      row(t.inspectorFn.standingBurn, t.inspectorFn.s(money(burnOf(game, node))), 'ok', h),
    ]
  },
  body: ({ game, node, ledger, h }) => [...serverless(game, node, ledger, h)],
}
