import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  CHECK_INTERVALS,
  LB_POLICIES,
  LB_VARIANTS,
  REQUEST_KINDS,
  type RequestKind,
  type LbVariant,
} from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode, LbPolicy } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import {
  type Panel,
  caption,
  choice,
  nodeLink,
  outbound,
  picker,
  section,
  segmented,
} from './shared.ts'

const loadBalancer = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const checked = has(game, 'health-checks')
  const policies = Object.entries(LB_POLICIES) as ReadonlyArray<
    readonly [LbPolicy, (typeof LB_POLICIES)[LbPolicy]]
  >
  return [
    section(
      t.inspectorLb.variant,
      [
        picker(
          'lb-variant',
          (Object.keys(LB_VARIANTS) as ReadonlyArray<LbVariant>).map(
            (id) => [id, LB_VARIANTS[id].name] as const,
          ),
          node.variant,
          (variant) => Message.LbVariantChosen({ nodeId: node.id, variant }),
          h,
          (id) => LB_VARIANTS[id].research === null || has(game, LB_VARIANTS[id].research),
          'grid-cols-2',
        ),
        caption(
          node.variant === 'l4'
            ? t.inspectorLb.forwardsTCPTenTimesTheThroughput
            : t.inspectorLb.readsHTTPRoutesByKindRetries,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorLb.policy,
      [
        picker(
          'policy',
          policies.map(([policy]) => [policy, t.catalog.lbPolicies[policy].label] as const),
          node.policy,
          (policy) => Message.PolicyChosen({ nodeId: node.id, policy }),
          h,
          (policy) => {
            const research = LB_POLICIES[policy].research
            return research === null || has(game, research)
          },
          'grid-cols-2',
        ),
      ],
      h,
    ),
    section(
      t.inspectorLb.sessions,
      [
        picker(
          'sticky',
          [
            [false, t.inspectorLb.balanced],
            [true, t.inspectorLb.sticky],
          ],
          node.sticky,
          (sticky) => Message.StickyChosen({ nodeId: node.id, sticky }),
          h,
        ),
        caption(
          node.sticky ? t.inspectorLb.stickyHolds : t.inspectorLb.everyRequestGoesWhereTheAlgorithm,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorLb.slowStart,
      [
        picker(
          'slow-start',
          [
            [false, t.inspectorLb.off],
            [true, t.inspectorLb.on],
          ],
          node.slowStart,
          (slowStart) => Message.SlowStartChosen({ nodeId: node.id, slowStart }),
          h,
        ),
        caption(node.slowStart ? t.inspectorLb.slowStartOn : t.inspectorLb.slowStartOff, h),
      ],
      h,
    ),
    section(
      t.inspectorLb.healthChecks,
      [
        picker(
          'check-every',
          CHECK_INTERVALS.map((seconds) => [seconds, t.inspectorLb.s(seconds)] as const),
          node.checkEvery,
          (checkEvery) => Message.HealthCheckChosen({ nodeId: node.id, checkEvery }),
          h,
          (seconds) => checked || seconds === 10,
        ),
        picker(
          'deep-check',
          [
            [false, t.inspectorLb.shallow],
            [true, t.inspectorLb.deep],
          ],
          node.deepCheck,
          (deepCheck) => Message.HealthCheckChosen({ nodeId: node.id, deepCheck }),
          h,
          (deep) => checked || !deep,
        ),
      ],
      h,
    ),
    section(
      t.inspectorLb.routes,
      outbound(game, node).map(([link, target]) => {
        const carried = link.kinds ?? REQUEST_KINDS
        const toggled = (kind: RequestKind) => {
          const next = carried.includes(kind)
            ? carried.filter((entry) => entry !== kind)
            : REQUEST_KINDS.filter((entry) => entry === kind || carried.includes(entry))
          return next.length === REQUEST_KINDS.length ? null : next
        }
        return h.div(
          [h.Key(link.to), h.Class('flex flex-col gap-1.5')],
          [
            nodeLink(game, target, h),
            segmented(
              'grid-cols-4',
              REQUEST_KINDS.map((kind) => {
                const next = toggled(kind)
                return choice(
                  `${link.to}-${kind}`,
                  carried.includes(kind),
                  next === null || next.length > 0,
                  Message.LinkKindsChosen({ from: node.id, to: link.to, kinds: next }),
                  [
                    h.span(
                      [h.Class('w-full truncate text-center')],
                      [t.inspectorShared.kindShort[kind]],
                    ),
                  ],
                  t.catalog.kinds[kind].label,
                  h,
                )
              }),
              h,
            ),
          ],
        )
      }),
      h,
    ),
  ]
}

export const lbPanel: Panel = {
  body: ({ game, node, h }) => [...loadBalancer(game, node, h)],
}
