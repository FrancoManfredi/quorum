import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { SAMPLE_RATES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import { unsampledOf } from '@quorum/simulation/solve-insight'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, choice, section, segmented } from './shared.ts'

const sampler = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorAnalytics.sampleRate,
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
            t.inspectorAnalytics.moreSamplesMoreInsightMoreCPU,
            h,
          ),
        ),
        h,
      ),
    ],
    h,
  )
}

export const analyticsPanel: Panel = {
  stats: ({ game, node, own, ledger, h }) => {
    const t = copy(h)
    const unsampled = unsampledOf(ledger)

    return [
      row(t.inspectorAnalytics.sampling, t.inspectorAnalytics.s(rate(own.inbound)), 'plain', h),
      row(
        t.inspectorAnalytics.kept,
        t.inspectorAnalytics.s2(rate(Math.min(own.inbound, own.capacity)), rate(own.capacity)),
        own.inbound > own.capacity ? 'warn' : 'plain',
        h,
      ),
      // The share no tap sees: load the player pays for, with no Insight and no kind to read.
      row(
        t.hud.unclassified,
        `${Math.round(unsampled.share * 100)}%`,
        unsampled.share >= 0.01 ? 'warn' : 'plain',
        h,
      ),
      row(t.inspectorAnalytics.burn, t.inspectorAnalytics.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, ledger, h }) => {
    const t = copy(h)
    return [
      unsampledOf(ledger).share >= 0.01
        ? h.p(
            [h.Class('px-4 pb-2 text-[calc(12px*var(--type-scale))] leading-snug text-warn')],
            [t.hud.unsampledHint],
          )
        : h.empty,
      sampler(game, node, h),
    ]
  },
}
