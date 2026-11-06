import { formats } from '@/i18n/format.ts'
import { copy, nodeTitle } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, section } from './shared.ts'

/** The CDC Connector's flow: the Database it reads, and the Stream it publishes to. */
const changes = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

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
      t.inspectorCdc.changeStream,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorCdc.itReadsEveryWriteOffThe],
        ),
        caption(
          source === undefined || stream === undefined
            ? t.inspectorCdc.linkADatabaseIntoItAnd
            : t.inspectorCdc.readingPublishingTo(
                nodeTitle(t, game, source),
                nodeTitle(t, game, stream),
              ),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorCdc.itAddsLagAConsumerReads],
        ),
        caption(t.inspectorCdc.notBuiltTheDualWriteInconsistency, h),
      ],
      h,
      true,
    ),
  ]
}

export const cdcPanel: Panel = {
  stats: ({ game, node, ledger, own, h }) => {
    const t = copy(h)

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
      row(t.inspectorCdc.changes, t.inspectorCdc.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorCdc.load,
        own.inbound > 0
          ? t.inspectorCdc.ofS(percent(Math.min(own.utilization, 9.99)), rate(own.capacity))
          : t.inspectorCdc.idle,
        own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
        h,
      ),
      row(
        t.inspectorCdc.lag,
        stream
          ? backlog < 1
            ? t.inspectorCdc.caughtUp
            : t.inspectorCdc.sBehind(Math.round(behind))
          : t.inspectorCdc.noStream,
        stream === undefined ? 'warn' : behind > stream.retain ? 'danger' : 'plain',
        h,
      ),
      row(t.inspectorCdc.published, t.inspectorCdc.s(rate(own.out.task ?? 0)), 'plain', h),
      row(t.inspectorCdc.latency, formats(t).ms(own.latency), 'plain', h),
      row(t.inspectorCdc.burn, t.inspectorCdc.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...changes(game, node, h)],
}
