import type { Html, HtmlBuilder } from 'foldkit/html'
import { SCALE_MAXIMA, SCALE_TARGETS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

const MIN_COPIES = [1, 2, 4, 8] as const

const autoscaler = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Scaling',
    [
      picker(
        'scale-signal',
        [
          ['cpu', 'CPU'],
          ['load', 'Load'],
          ['rps', 'Requests'],
          ['queue', 'Queue depth'],
        ],
        node.signal,
        (signal) => Message.AutoscalerChosen({ nodeId: node.id, signal }),
        h,
      ),
      picker(
        'scale-target',
        SCALE_TARGETS.map((target) => [target, `${Math.round(target * 100)}%`] as const),
        node.target,
        (target) => Message.AutoscalerChosen({ nodeId: node.id, target }),
        h,
      ),
      picker(
        'scale-min',
        MIN_COPIES.map((copies) => [copies, `min ${copies}`] as const),
        node.minCopies,
        (minCopies) => Message.AutoscalerChosen({ nodeId: node.id, minCopies }),
        h,
        (copies) => node.maxCopies === 0 || copies <= node.maxCopies,
      ),
      picker(
        'scale-max',
        SCALE_MAXIMA.map((copies) => [copies, copies === 0 ? 'no max' : `max ${copies}`] as const),
        node.maxCopies,
        (maxCopies) => Message.AutoscalerChosen({ nodeId: node.id, maxCopies }),
        h,
        (copies) => copies === 0 || copies >= node.minCopies,
      ),
      picker(
        'scale-schedule',
        [
          [false, 'On load'],
          [true, 'Ahead of the peak'],
        ],
        node.schedule,
        (schedule) => Message.AutoscalerChosen({ nodeId: node.id, schedule }),
        h,
        (schedule) => !schedule || has(game, 'scheduled-scaling'),
      ),
      caption(
        node.schedule
          ? 'Two calendar hours before the daily peak it adds the copies the peak will need, so they are warm when it arrives.'
          : 'It reacts to the load it sees. Research Scheduled scaling to provision for the peak first.',
        h,
      ),
    ],
    h,
  )

export const autoscalerPanel: Panel = {
  body: ({ game, node, h }) => [autoscaler(game, node, h)],
}
