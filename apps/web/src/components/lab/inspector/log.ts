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
import { type Panel, caption, percent, picker, section } from './shared.ts'

/**
 * How long an Event Stream keeps a message, as a calendar reads: one sim second is one calendar
 * minute, so 1,440 sim seconds are a day.
 */
const retentionLabel = (seconds: number): string =>
  seconds >= 1_440
    ? `${Math.round((seconds / 1_440) * 10) / 10} d`
    : `${Math.round(seconds / 60)} h`

/** An Event Stream's partitions, acknowledgements, retention and key (07 "Event Stream"). */
const events = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Partitions',
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
          [true, 'Keyed'],
          [false, 'Round robin'],
        ],
        node.keyed,
        (keyed) => Message.LogOptionsChosen({ nodeId: node.id, keyed }),
        h,
      ),
      caption(
        node.keyed
          ? 'One key keeps an entity in one partition, so its events stay in order. A hot key fills a partition and slows it.'
          : 'Events spread evenly, and order is lost: a superseded write can land after the one that replaced it.',
        h,
      ),
      caption(
        `A consumer group reads one consumer per partition, so this stream hands on at most ${compact(LOG_READ_RATE * node.partitions)}/s.`,
        h,
      ),
    ],
    h,
    true,
  ),
  section(
    'Durability',
    [
      picker(
        'acks',
        (Object.entries(LOG_ACKS) as ReadonlyArray<[Acks, (typeof LOG_ACKS)['all']]>).map(
          ([id, ack]) => [id, ack.name] as const,
        ),
        node.acks,
        (acks) => Message.LogOptionsChosen({ nodeId: node.id, acks }),
        h,
      ),
      caption(
        `A producer waits ${LOG_ACKS[node.acks].latency}× the 5 ms append. A replica past the first bills half a broker's Burn again.`,
        h,
      ),
      picker(
        'replicas',
        LOG_REPLICAS.map(
          (replicas) =>
            [replicas, `${replicas} ${replicas === 1 ? 'replica' : 'replicas'}`] as const,
        ),
        logReplicas(node),
        (replicas) => Message.LogOptionsChosen({ nodeId: node.id, replicas }),
        h,
      ),
      caption(
        logLoss(node) >= 1
          ? 'One replica holds the only copy: a broker that fails takes every event it held.'
          : logLoss(node) > 0
            ? `A broker that fails loses ${percent(logLoss(node))} of the events it held: the ones its replicas had not copied.`
            : 'Every replica had every acknowledged event, so a broker that fails loses none.',
        h,
      ),
    ],
    h,
  ),
  section(
    'Retention',
    [
      picker(
        'retain',
        LOG_RETENTION.map((retain) => [retain, retentionLabel(retain)] as const),
        node.retain,
        (retain) => Message.LogOptionsChosen({ nodeId: node.id, retain }),
        h,
      ),
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [
          'Messages stay after they are read, so a consumer can replay them into a new index or a second Worker without touching the Database. A consumer further behind than the window loses the oldest events.',
        ],
      ),
    ],
    h,
  ),
]

export const logPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const lag = node.depth / Math.max(1, own.capacity)
    return [
      row('Inbound', `${rate(own.inbound)}/s`, 'plain', h),
      row('Lag', `${compact(Math.round(node.depth))} events`, node.depth > 0 ? 'warn' : 'plain', h),
      row(
        'Behind',
        node.depth < 1 ? 'caught up' : `${Math.round(lag)} s`,
        lag > node.retain ? 'danger' : lag > node.retain / 2 ? 'warn' : 'plain',
        h,
      ),
      row('Retention', retentionLabel(node.retain), lag > node.retain ? 'danger' : 'plain', h),
      row('Partitions', `${node.partitions}`, 'plain', h),
      row('Replicas', `${logReplicas(node)} · acks ${LOG_ACKS[node.acks].name}`, 'plain', h),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ node, h }) => [...events(node, h)],
}
