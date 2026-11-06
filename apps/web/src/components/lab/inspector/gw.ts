import type { Html, HtmlBuilder } from 'foldkit/html'
import { AUTH_CHECK_MS, GATEWAY_AUTH_MS, GATEWAY_LIMITS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { compact } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** An API Gateway's rate limit, in requests per second; Off lets every request through. */
const gateway = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Rate limit',
    [
      picker(
        'rate-limit',
        GATEWAY_LIMITS.map(
          (limit) => [limit, limit === 0 ? 'Off' : `${compact(limit)}/s`] as const,
        ),
        node.rateLimit,
        (rateLimit) => Message.RateLimitChosen({ nodeId: node.id, rateLimit }),
        h,
      ),
      caption(
        node.rateLimit > 0
          ? `Past ${compact(node.rateLimit)} requests a second, they fail as throttled.`
          : 'No limit: every request goes on to the services.',
        h,
      ),
      picker(
        'gateway-bucket',
        [
          [false, 'Flat cap'],
          [true, 'Token bucket'],
        ],
        node.burst > 0,
        (bucket) => Message.GatewayBucketChosen({ nodeId: node.id, bucket }),
        h,
        (bucket) => !bucket || has(game, 'rate-limiting'),
      ),
      caption(
        node.burst > 0
          ? `A burst of up to ${compact(node.burst)} requests passes whole, and the average holds at the limit.`
          : 'Every Step over the limit is throttled at once. Research Rate limiting for a token bucket.',
        h,
      ),
      picker(
        'gateway-auth',
        [
          [false, 'Services check'],
          [true, 'Auth at the edge'],
        ],
        node.authEdge,
        (authEdge) => Message.GatewayOptionsChosen({ nodeId: node.id, authEdge }),
        h,
      ),
      caption(
        node.authEdge
          ? `The Gateway validates each token once, for ${GATEWAY_AUTH_MS} ms, and the services skip the ${AUTH_CHECK_MS * 1_000} µs check.`
          : `Every service validates the token itself: ${AUTH_CHECK_MS * 1_000} µs of CPU on each authenticated request.`,
        h,
      ),
      picker(
        'gateway-merge',
        [
          [false, 'Every read goes on'],
          [true, 'Request coalescing'],
        ],
        node.merge,
        (merge) => Message.GatewayOptionsChosen({ nodeId: node.id, merge }),
        h,
      ),
      caption(
        'Identical reads in flight at once become one call. The busier the Gateway, the more it merges, so a spike sends less on.',
        h,
      ),
    ],
    h,
  )

export const gwPanel: Panel = {
  body: ({ game, node, h }) => [gateway(game, node, h)],
}
