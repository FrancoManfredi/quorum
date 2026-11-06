import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { AUTH_CHECK_MS, GATEWAY_AUTH_MS, GATEWAY_LIMITS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { compact } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** An API Gateway's rate limit, in requests per second; Off lets every request through. */
const gateway = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorGw.rateLimit,
    [
      picker(
        'rate-limit',
        GATEWAY_LIMITS.map(
          (limit) =>
            [limit, limit === 0 ? t.inspectorGw.off : t.inspectorGw.s(compact(limit))] as const,
        ),
        node.rateLimit,
        (rateLimit) => Message.RateLimitChosen({ nodeId: node.id, rateLimit }),
        h,
      ),
      caption(
        node.rateLimit > 0
          ? t.inspectorGw.pastRequestsASecondTheyFail(compact(node.rateLimit))
          : t.inspectorGw.noLimitEveryRequestGoesOn,
        h,
      ),
      picker(
        'gateway-bucket',
        [
          [false, t.inspectorGw.flatCap],
          [true, t.inspectorGw.tokenBucket],
        ],
        node.burst > 0,
        (bucket) => Message.GatewayBucketChosen({ nodeId: node.id, bucket }),
        h,
        (bucket) => !bucket || has(game, 'rate-limiting'),
      ),
      caption(
        node.burst > 0
          ? t.inspectorGw.aBurstOfUpToRequests(compact(node.burst))
          : t.inspectorGw.everyStepOverTheLimitIs,
        h,
      ),
      picker(
        'gateway-auth',
        [
          [false, t.inspectorGw.servicesCheck],
          [true, t.inspectorGw.authAtTheEdge],
        ],
        node.authEdge,
        (authEdge) => Message.GatewayOptionsChosen({ nodeId: node.id, authEdge }),
        h,
      ),
      caption(
        node.authEdge
          ? t.inspectorGw.theGatewayValidatesEachToken(
              t.units.ms(GATEWAY_AUTH_MS),
              `${AUTH_CHECK_MS * 1_000} µs`,
            )
          : t.inspectorGw.everyServiceValidatesTheToken(`${AUTH_CHECK_MS * 1_000} µs`),
        h,
      ),
      picker(
        'gateway-merge',
        [
          [false, t.inspectorGw.everyReadGoesOn],
          [true, t.inspectorGw.requestCoalescing],
        ],
        node.merge,
        (merge) => Message.GatewayOptionsChosen({ nodeId: node.id, merge }),
        h,
      ),
      caption(t.inspectorGw.identicalReadsInFlightAtOnce, h),
    ],
    h,
  )
}

export const gwPanel: Panel = {
  body: ({ game, node, h }) => [gateway(game, node, h)],
}
