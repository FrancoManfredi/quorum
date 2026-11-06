import type { Html, HtmlBuilder } from 'foldkit/html'
import { SAMPLE_RATES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, choice, section, segmented } from './shared.ts'

const sampler = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Sample rate',
    [
      segmented(
        'grid-cols-5',
        SAMPLE_RATES.map((value) =>
          choice(
            String(value),
            node.sampleRate === value,
            true,
            Message.SampleChosen({ nodeId: node.id, sampleRate: value }),
            [h.span([h.Class('w-full text-center')], [`${Math.round(value * 100)}%`])],
            'More samples: more Insight, more CPU on sampled Nodes, more storage Burn',
            h,
          ),
        ),
        h,
      ),
    ],
    h,
  )

export const analyticsPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    return [
      row('Sampling', `${rate(own.inbound)}/s`, 'plain', h),
      row(
        'Kept',
        `${rate(Math.min(own.inbound, own.capacity))} / ${rate(own.capacity)}/s`,
        own.inbound > own.capacity ? 'warn' : 'plain',
        h,
      ),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [sampler(game, node, h)],
}
