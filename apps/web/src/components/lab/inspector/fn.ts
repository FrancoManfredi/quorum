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
import { compact, money, ms, rate } from '@quorum/ui/game/format'
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
  const own = ledger.nodes[node.id]
  const slots = own?.resources.slots
  const used = slots ? Math.min(slots.used, slots.total) : 0
  const done = own ? own.inbound - own.dropped : 0
  return [
    section(
      'Executions',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `One execution holds the request for as long as it runs, up to ${compact(SERVERLESS_CONCURRENCY)} at a time. Past the cap the provider throttles: the requests are dropped, not queued.`,
          ],
        ),
        caption(
          `${compact(Math.round(used))} of ${compact(slots?.total ?? SERVERLESS_CONCURRENCY)} in flight`,
          h,
        ),
      ],
      h,
      true,
    ),
    section(
      'Cold start',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A new execution environment boots before the code runs: ${ms(coldStartMs(node))} for this Stack. A function that idles loses its environments, so a trickle of traffic pays it more often than a steady one.`,
          ],
        ),
        caption('Change the runtime in the Stack to trade the cold start for throughput.', h),
      ],
      h,
    ),
    section(
      'Bill',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `There is no box to pay for: nothing stands while it idles. Each use bills ${money(SERVERLESS_REQUEST_PRICE * 1_000)} per 1,000 requests plus ${money(SERVERLESS_GB_SECOND)} per GB-second, at ${SERVERLESS_MEMORY_GB} GB an execution, on the Requests line of the bill.`,
          ],
        ),
        caption(`This use: ${money(serverlessBurnOf(game, node, done, own?.latency ?? 0))}/s`, h),
      ],
      h,
    ),
  ]
}

export const fnPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const slots = own.resources.slots
    const used = slots ? Math.min(slots.used, slots.total) : 0
    return [
      row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
      row(
        'Executions',
        slots ? `${used.toFixed(1)} / ${compact(Math.round(slots.total))}` : '—',
        slots && used >= slots.total * 0.9 ? 'danger' : 'plain',
        h,
      ),
      row('Cold start', ms(coldStartMs(node)), 'plain', h),
      row(
        'Uses',
        `${money(serverlessBurnOf(game, node, own.inbound - own.dropped, own.latency))}/s`,
        'plain',
        h,
      ),
      row('Standing Burn', `${money(burnOf(game, node))}/s`, 'ok', h),
    ]
  },
  body: ({ game, node, ledger, h }) => [...serverless(game, node, ledger, h)],
}
