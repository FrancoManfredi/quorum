import type { Html, HtmlBuilder } from 'foldkit/html'
import { nodeLabel } from '@quorum/simulation/labels'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, section } from './shared.ts'

/** The CDC Connector's flow: the Database it reads, and the Stream it publishes to. */
const changes = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const source = game.nodes.find(
    (entry) =>
      entry.type === 'database' &&
      game.links.some((link) => link.from === entry.id && link.to === node.id),
  )
  const stream = game.nodes.find(
    (entry) =>
      entry.type === 'log' &&
      game.links.some((link) => link.from === node.id && link.to === entry.id),
  )
  return [
    section(
      'Change stream',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'It reads every write off the Database’s write log and publishes it to the Stream, so the Search Engine or the Warehouse follows the Database without the app writing twice.',
          ],
        ),
        caption(
          source === undefined || stream === undefined
            ? 'Link a Database into it, and it into an Event Stream, before it carries anything.'
            : `Reading ${nodeLabel(game, source)}, publishing to ${nodeLabel(game, stream)}.`,
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'It adds lag: a consumer reads the Stream at its own pace, so a search result or a report is behind by the Stream’s lag. Order holds only inside a partition, and the Stream’s key decides that.',
          ],
        ),
        caption(
          'Not built: the dual-write inconsistency it removes, since the build never writes twice.',
          h,
        ),
      ],
      h,
      true,
    ),
  ]
}

export const cdcPanel: Panel = {
  stats: ({ game, node, ledger, own, h }) => {
    // It reads a Database's write log; its lag is the stream's backlog behind its consumers.
    const stream = game.nodes.find(
      (entry) =>
        entry.type === 'log' &&
        game.links.some((link) => link.from === node.id && link.to === entry.id),
    )
    const backlog = stream?.depth ?? 0
    const read = stream ? (ledger.nodes[stream.id]?.out.task ?? 0) : 0
    const behind = read > 0 ? backlog / read : 0
    return [
      row('Changes', `${rate(own.inbound)}/s`, 'plain', h),
      row(
        'Load',
        own.inbound > 0
          ? `${percent(Math.min(own.utilization, 9.99))} of ${rate(own.capacity)}/s`
          : 'idle',
        own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
        h,
      ),
      row(
        'Lag',
        stream ? (backlog < 1 ? 'caught up' : `${Math.round(behind)} s behind`) : 'no stream',
        stream === undefined ? 'warn' : behind > stream.retain ? 'danger' : 'plain',
        h,
      ),
      row('Published', `${rate(own.out.task ?? 0)}/s`, 'plain', h),
      row('Latency', ms(own.latency), 'plain', h),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...changes(game, node, h)],
}
