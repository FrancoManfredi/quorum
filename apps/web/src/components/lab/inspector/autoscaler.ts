import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { SCALE_MAXIMA, SCALE_TARGETS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

const MIN_COPIES = [1, 2, 4, 8] as const

const autoscaler = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorAutoscaler.scaling,
    [
      picker(
        'scale-signal',
        [
          ['cpu', 'CPU'],
          ['load', t.inspectorAutoscaler.load],
          ['rps', t.inspectorAutoscaler.requests],
          ['queue', t.inspectorAutoscaler.queueDepth],
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
        MIN_COPIES.map((copies) => [copies, t.inspectorAutoscaler.min(copies)] as const),
        node.minCopies,
        (minCopies) => Message.AutoscalerChosen({ nodeId: node.id, minCopies }),
        h,
        (copies) => node.maxCopies === 0 || copies <= node.maxCopies,
      ),
      picker(
        'scale-max',
        SCALE_MAXIMA.map(
          (copies) =>
            [
              copies,
              copies === 0 ? t.inspectorAutoscaler.noMax : t.inspectorAutoscaler.max(copies),
            ] as const,
        ),
        node.maxCopies,
        (maxCopies) => Message.AutoscalerChosen({ nodeId: node.id, maxCopies }),
        h,
        (copies) => copies === 0 || copies >= node.minCopies,
      ),
      picker(
        'scale-schedule',
        [
          [false, t.inspectorAutoscaler.onLoad],
          [true, t.inspectorAutoscaler.aheadOfThePeak],
        ],
        node.schedule,
        (schedule) => Message.AutoscalerChosen({ nodeId: node.id, schedule }),
        h,
        (schedule) => !schedule || has(game, 'scheduled-scaling'),
      ),
      caption(
        node.schedule
          ? t.inspectorAutoscaler.twoCalendarHoursBeforeTheDaily
          : t.inspectorAutoscaler.itReactsToTheLoadIt,
        h,
      ),
    ],
    h,
  )
}

export const autoscalerPanel: Panel = {
  body: ({ game, node, h }) => [autoscaler(game, node, h)],
}
