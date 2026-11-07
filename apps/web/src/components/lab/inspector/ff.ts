import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { BAD_DEPLOY_ERRORS, ROLLOUT_STEPS } from '@quorum/simulation/catalog'
import { badDeployShareOf, blastService, rolloutOf } from '@quorum/simulation/team'
import { liveFeatures } from '@quorum/simulation/features'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import {
  type Panel,
  caption,
  choice,
  percentNumber,
  section,
  segmented,
  serviceNameIn,
} from './shared.ts'

/** A Feature Flags Node's rollouts: each Feature's share, and what a bad deploy of it can break. */
const flags = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const service = blastService(game)
  const batch = service.lastDeploy
  const listed = batch.length > 0 ? batch : liveFeatures(game)
  return [
    section(
      t.inspectorFf.rollout,
      [
        ...(listed.length === 0
          ? [caption(t.inspectorFf.shipAFeatureFirstAFlag, h)]
          : listed.map((feature) =>
              h.div(
                [h.Key(feature), h.Class('flex flex-col gap-1.5 pb-1')],
                [
                  caption(t.catalog.features[feature].name, h),
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
                            [share <= 0 ? t.inspectorFf.off : `${Math.round(share * 100)}%`],
                          ),
                        ],
                        share <= 0
                          ? t.inspectorFf.offNoUserHasTheFeature
                          : t.inspectorFf.aBadDeployOfItReaches(Math.round(share * 100)),
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
            t.inspectorFf.aBadDeployFails(
              percentNumber(BAD_DEPLOY_ERRORS),
              serviceNameIn(t, service),
              batch.length,
              percentNumber(badDeployShareOf(game, service)),
            ),
          ],
        ),
      ],
      h,
      true,
    ),
    section(
      t.inspectorFf.flagsAreAShield,
      [
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [t.inspectorFf.aFeatureAt5OfUsers],
        ),
        caption(t.inspectorFf.notBuiltTheHoldoutGroupThat, h),
      ],
      h,
    ),
  ]
}

export const ffPanel: Panel = {
  stats: ({ game, node, h }) => {
    const t = copy(h)

    // The last deploy shipped each Service its own code: the blast is the Service that broke.
    const service = blastService(game)
    const batch = service.lastDeploy
    const rolled = batch.filter((feature) => rolloutOf(game, feature) < 1)
    const blast = badDeployShareOf(game, service)
    return [
      row(t.inspectorFf.service, serviceNameIn(t, service), 'plain', h),
      row(t.inspectorFf.inTheBatch, `${batch.length}`, 'plain', h),
      row(t.inspectorFf.behindAFlag, `${rolled.length}`, rolled.length > 0 ? 'ok' : 'plain', h),
      row(
        t.inspectorFf.badDeploy,
        t.inspectorFf.upToOfItsTraffic(percentNumber(blast)),
        blast >= 0.4 ? 'warn' : blast <= 0.1 ? 'ok' : 'plain',
        h,
      ),
      row(t.inspectorFf.burn, t.inspectorFf.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [...flags(game, node, h)],
}
