import { copy, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  LOG_ACKS,
  LOG_PARTITIONS,
  LOG_REPLICAS,
  LOG_READ_RATE,
  LOG_RETENTION,
} from '@quorum/simulation/catalog'
import { burnOf, logLoss, logReplicas } from '@quorum/simulation/lookups'
import type { Acks, GameNode } from '@quorum/simulation/state'
import { compact, money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percentNumber, picker, section } from './shared.ts'

/**
 * How long an Event Stream keeps a message, as a calendar reads: one sim second is one calendar
 * minute, so 1,440 sim seconds are a day.
 */
const retentionLabel = (t: Messages, seconds: number): string =>
  seconds >= 1_440
    ? t.units.d(Math.round((seconds / 1_440) * 10) / 10)
    : t.units.h(Math.round(seconds / 60))

/** An Event Stream's partitions, acknowledgements, retention and key (07 "Event Stream"). */
const events = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorLog.partitions,
      [
        picker(
          'partitions',
          LOG_PARTITIONS.map((partitions) => [partitions, String(partitions)] as const),
          node.partitions,
          (partitions) => Message.LogOptionsChosen({ nodeId: node.id, partitions }),
          h,
        ),
        picker(
          'keyed',
          [
            [true, t.inspectorLog.keyed],
            [false, t.inspectorLog.roundRobin],
          ],
          node.keyed,
          (keyed) => Message.LogOptionsChosen({ nodeId: node.id, keyed }),
          h,
        ),
        caption(
          node.keyed
            ? t.inspectorLog.oneKeyKeepsAnEntityIn
            : t.inspectorLog.eventsSpreadEvenlyAndOrderIs,
          h,
        ),
        caption(
          t.inspectorLog.aConsumerGroupReadsOneConsumer(compact(LOG_READ_RATE * node.partitions)),
          h,
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorLog.durability,
      [
        picker(
          'acks',
          (Object.entries(LOG_ACKS) as ReadonlyArray<[Acks, (typeof LOG_ACKS)['all']]>).map(
            ([id]) => [id, t.catalog.logAcks[id].name] as const,
          ),
          node.acks,
          (acks) => Message.LogOptionsChosen({ nodeId: node.id, acks }),
          h,
        ),
        caption(t.inspectorLog.aProducerWaitsForTheAppend(LOG_ACKS[node.acks].latency), h),
        picker(
          'replicas',
          LOG_REPLICAS.map(
            (replicas) => [replicas, t.inspectorLog.replicaCount(replicas)] as const,
          ),
          logReplicas(node),
          (replicas) => Message.LogOptionsChosen({ nodeId: node.id, replicas }),
          h,
        ),
        caption(
          logLoss(node) >= 1
            ? t.inspectorLog.oneReplicaHoldsTheOnlyCopy
            : logLoss(node) > 0
              ? t.inspectorLog.aBrokerThatFailsLoses(percentNumber(logLoss(node)))
              : t.inspectorLog.everyReplicaHadEveryEvent,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorLog.retention,
      [
        picker(
          'retain',
          LOG_RETENTION.map((retain) => [retain, retentionLabel(t, retain)] as const),
          node.retain,
          (retain) => Message.LogOptionsChosen({ nodeId: node.id, retain }),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorLog.messagesStayAfterTheyAreRead],
        ),
      ],
      h,
    ),
  ]
}

export const logPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    const lag = node.depth / Math.max(1, own.capacity)
    return [
      row(t.inspectorLog.inbound, t.inspectorLog.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorLog.lag,
        t.inspectorLog.events(compact(Math.round(node.depth))),
        node.depth > 0 ? 'warn' : 'plain',
        h,
      ),
      row(
        t.inspectorLog.behind,
        node.depth < 1 ? t.inspectorLog.caughtUp : t.inspectorLog.s2(Math.round(lag)),
        lag > node.retain ? 'danger' : lag > node.retain / 2 ? 'warn' : 'plain',
        h,
      ),
      row(
        t.inspectorLog.retention,
        retentionLabel(t, node.retain),
        lag > node.retain ? 'danger' : 'plain',
        h,
      ),
      row(t.inspectorLog.partitions, `${node.partitions}`, 'plain', h),
      row(
        t.inspectorLog.replicas,
        t.inspectorLog.replicasAndAcks(logReplicas(node), t.catalog.logAcks[node.acks].name),
        'plain',
        h,
      ),
      row(t.inspectorLog.burn, t.inspectorLog.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ node, h }) => [...events(node, h)],
}
