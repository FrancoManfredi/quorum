import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  CHECK_INTERVALS,
  KINDS,
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
  KIND_SHORT,
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
  const checked = has(game, 'health-checks')
  const policies = Object.entries(LB_POLICIES) as ReadonlyArray<
    readonly [LbPolicy, (typeof LB_POLICIES)[LbPolicy]]
  >
  return [
    section(
      'Variant',
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
            ? 'Forwards TCP: ten times the throughput, 0.2 ms, and cheaper. It reads no HTTP, so it cannot route by kind or retry.'
            : 'Reads HTTP: routes by kind, retries, and checks health. Lower throughput and a longer hop.',
          h,
        ),
      ],
      h,
    ),
    section(
      'Policy',
      [
        picker(
          'policy',
          policies.map(([policy, entry]) => [policy, entry.label] as const),
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
      'Sessions',
      [
        picker(
          'sticky',
          [
            [false, 'Balanced'],
            [true, 'Sticky'],
          ],
          node.sticky,
          (sticky) => Message.StickyChosen({ nodeId: node.id, sticky }),
          h,
        ),
        caption(
          node.sticky
            ? 'A user stays on the target it first reached. The oldest copy holds the most users, a target that dies takes its sessions with it, and in-process caches and realtime clients stay warm.'
            : 'Every request goes where the algorithm sends it.',
          h,
        ),
      ],
      h,
    ),
    section(
      'Slow start',
      [
        picker(
          'slow-start',
          [
            [false, 'Off'],
            [true, 'On'],
          ],
          node.slowStart,
          (slowStart) => Message.SlowStartChosen({ nodeId: node.id, slowStart }),
          h,
        ),
        caption(
          node.slowStart
            ? 'A new copy takes traffic gradually, so a cold Java copy never answers at its cold speed.'
            : 'A new copy takes its full share at once.',
          h,
        ),
      ],
      h,
    ),
    section(
      'Health checks',
      [
        picker(
          'check-every',
          CHECK_INTERVALS.map((seconds) => [seconds, `${seconds} s`] as const),
          node.checkEvery,
          (checkEvery) => Message.HealthCheckChosen({ nodeId: node.id, checkEvery }),
          h,
          (seconds) => checked || seconds === 10,
        ),
        picker(
          'deep-check',
          [
            [false, 'Shallow'],
            [true, 'Deep'],
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
      'Routes',
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
                  [h.span([h.Class('w-full truncate text-center')], [KIND_SHORT[kind]])],
                  KINDS[kind].label,
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
