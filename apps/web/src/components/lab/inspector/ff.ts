import type { Html, HtmlBuilder } from 'foldkit/html'
import { FEATURES, ROLLOUT_STEPS } from '@quorum/simulation/catalog'
import { badDeployShareOf, blastService, rolloutOf } from '@quorum/simulation/team'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, choice, percent, section, segmented } from './shared.ts'

/** A Feature Flags Node's rollouts: each Feature's share, and what a bad deploy of it can break. */
const flags = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const service = blastService(game)
  const batch = service.lastDeploy
  const listed = batch.length > 0 ? batch : game.shipped
  return [
    section(
      'Rollout',
      [
        ...(listed.length === 0
          ? [caption('Ship a Feature first: a flag has nothing to roll out yet.', h)]
          : listed.map((feature) =>
              h.div(
                [h.Key(feature), h.Class('flex flex-col gap-1.5 pb-1')],
                [
                  caption(FEATURES[feature].name, h),
                  segmented(
                    'grid-cols-5',
                    ROLLOUT_STEPS.map((share) =>
                      choice(
                        `${feature}-${share}`,
                        Math.abs(rolloutOf(game, feature) - share) < 1e-9,
                        true,
                        Message.RolloutChosen({ nodeId: node.id, feature, share }),
                        [
                          h.span(
                            [h.Class('w-full text-center')],
                            [share <= 0 ? 'Off' : `${Math.round(share * 100)}%`],
                          ),
                        ],
                        share <= 0
                          ? 'Off: no user has the Feature, so a bad deploy of it breaks nobody'
                          : `A bad deploy of it reaches at most ${Math.round(share * 100)}% of users`,
                        h,
                      ),
                    ),
                    h,
                  ),
                ],
              ),
            )),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            `A bad deploy fails 8% of requests for each Feature its batch shipped, and a flag cuts that to the share of users it reached. The last deploy of ${service.name} shipped ${batch.length} Feature${batch.length === 1 ? '' : 's'}, so its ceiling is ${percent(badDeployShareOf(game, service))}. Only that Service's traffic breaks.`,
          ],
        ),
      ],
      h,
      true,
    ),
    section(
      'Flags are a shield',
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [
            'A Feature at 5% of users can break at most 5% of the traffic it would have, whatever the deploy strategy. Turn it Off and the next bad deploy of it breaks nobody: that is the one click an incident needs.',
          ],
        ),
        caption(
          'Not built: the holdout group that measures a Feature’s lift, and the load a dark Feature no longer adds.',
          h,
        ),
      ],
      h,
    ),
  ]
}

export const ffPanel: Panel = {
  stats: ({ game, node, h }) => {
    // The last deploy shipped each Service its own code: the blast is the Service that broke.
    const service = blastService(game)
    const batch = service.lastDeploy
    const rolled = batch.filter((feature) => rolloutOf(game, feature) < 1)
    const blast = badDeployShareOf(game, service)
    return [
      row('Service', service.name, 'plain', h),
      row('In the batch', `${batch.length}`, 'plain', h),
      row('Behind a flag', `${rolled.length}`, rolled.length > 0 ? 'ok' : 'plain', h),
      row(
        'Bad deploy',
        `up to ${percent(blast)} of its traffic`,
        blast >= 0.4 ? 'warn' : blast <= 0.1 ? 'ok' : 'plain',
        h,
      ),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...flags(game, node, h)],
}
