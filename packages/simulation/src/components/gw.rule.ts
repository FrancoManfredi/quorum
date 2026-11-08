import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
import {
  GATEWAY_BURST,
  GATEWAY_LIMITS,
  RESEARCH,
  GATEWAY_AUTH_MS,
  COALESCE_KINDS,
  COALESCE_HOT,
  COALESCE_WINDOW,
  type Kind,
  type RequestKind,
} from '../catalog.ts'
import { failSome } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import {
  type ComponentRule,
  each,
  flatCapacity,
  gatewayShare,
  noConnections,
  noProbe,
  relay,
  slotOf,
} from '../rule-kit.ts'

/**
 * Share of a read kind's requests a Gateway merges into one already in flight (05 "Request
 * coalescing"): the popular reads that overlap, which grows with the rate.
 */
const merged = (node: GameNode, kind: Kind, rate: number): number => {
  if (!node.merge || !COALESCE_KINDS.includes(kind as RequestKind)) return 0
  const overlap = rate * COALESCE_WINDOW
  return (COALESCE_HOT * overlap) / (1 + overlap)
}

// A Gateway relays every kind, and past its rate limit it answers throttled instead (05).
export const gwRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      flatCapacity(node),
      arriving,
      { fixedMs: 6 + (node.authEdge ? GATEWAY_AUTH_MS : 0), variableMs: 0.1 },
      solver.boost(node),
    ),
  serve: (serve, node, rates, share) => {
    const kept = gatewayShare(node, rates)
    each(rates, share, (kind, processed) =>
      serve.route(kind, processed * kept * (1 - merged(node, kind, processed * kept))),
    )
  },
  outcome: (answer, node, kind) =>
    failSome(
      relay(answer, node, kind),
      1 - gatewayShare(node, answer.pass.arriving[slotOf(answer.pass, node)] ?? {}),
      'throttled',
    ),
  connections: noConnections,
  probe: noProbe,
}

/** Sets an API Gateway's rate limit in requests per second; 0 turns it off. */
export const setRateLimit = (game: Game, id: string, rateLimit: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gw') return notAllowed('Only an API Gateway rate-limits.')
    if (!(GATEWAY_LIMITS as ReadonlyArray<number>).includes(rateLimit))
      return notAllowed(`Rate limits are ${GATEWAY_LIMITS.join(', ')} requests per second.`)
    return ok(node.rateLimit === rateLimit ? game : patch(game, id, { rateLimit }))
  })

/**
 * Turns the Gateway's token bucket on or off (Rate limiting): a burst up to `GATEWAY_BURST`
 * requests passes whole, and the long-run average holds at the limit.
 */
export const setGatewayBucket = (game: Game, id: string, bucket: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'gw') return notAllowed('Only an API Gateway holds a token bucket.')
    if (bucket && !has(game, 'rate-limiting'))
      return no(
        Refusal.Locked({ what: 'A token bucket', research: RESEARCH['rate-limiting'].name }),
      )
    const burst = bucket ? GATEWAY_BURST : 0
    return ok(node.burst === burst ? game : patch(game, id, { burst }))
  })

/** Sets an API Gateway's Auth at the edge, or its Request coalescing (05 "API Gateway"). */
export const setGatewayOptions = (
  game: Game,
  id: string,
  change: Readonly<{ authEdge?: boolean; merge?: boolean }>,
): Action =>
  withNode(game, id, (node) =>
    node.type === 'gw' ? ok(patch(game, id, change)) : notAllowed('Only an API Gateway has these.'),
  )
