import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, LbPolicy } from '../state.ts'
import {
  CHECK_INTERVALS,
  COMPONENTS,
  DATA_KINDS,
  L4_CAPACITY,
  L4_MS,
  LB_POLICIES,
  LB_VARIANTS,
  P2C_CAPACITY,
  RESEARCH,
  type LbVariant,
} from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import {
  type ComponentRule,
  flatCapacity,
  noConnections,
  noProbe,
  passOn,
  relay,
} from '../rule-kit.ts'

export const lbRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      flatCapacity(node) *
        (node.variant === 'l4' ? L4_CAPACITY : 1) *
        (node.policy === 'p2c' && has(solver.game, 'lb-algorithms') ? P2C_CAPACITY : 1),
      arriving,
      // An L4 forwards TCP: no HTTP parsing, so a fifth of the hop (05 "Load Balancer").
      { fixedMs: node.variant === 'l4' ? L4_MS : 1, variableMs: 0.1 },
      solver.boost(node),
    ),
  serve: passOn,
  outcome: relay,
  connections: noConnections,
  probe: noProbe,
}

/** Sets a Load Balancer's variant. L4 needs its research (10 "Track: Infrastructure"). */
export const setLbVariant = (game: Game, id: string, variant: LbVariant): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'lb') return notAllowed('Only a Load Balancer has a variant.')
    const research = LB_VARIANTS[variant].research
    if (research !== null && !has(game, research))
      return no(
        Refusal.Locked({ what: LB_VARIANTS[variant].name, research: RESEARCH[research].name }),
      )
    // An L7 Load Balancer reads HTTP: it cannot keep the Database queries an L4 passes on.
    const queries = game.links.some((link) => {
      const other = game.nodes.find(
        (entry) => entry.id === (link.from === id ? link.to : link.from),
      )
      return (
        (link.from === id || link.to === id) &&
        other !== undefined &&
        DATA_KINDS.some((kind) => COMPONENTS[other.type].accepts.includes(kind))
      )
    })
    if (variant === 'l7' && queries)
      return notAllowed('Cut its links to the Database and Read Replicas first: an L7 reads HTTP.')
    return ok(node.variant === variant ? game : patch(game, id, { variant }))
  })

/** Chooses how a Load Balancer splits traffic. Least connections and two choices need research. */
export const setPolicy = (game: Game, id: string, policy: LbPolicy): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'lb') return notAllowed('Only a Load Balancer has a policy.')
    const research = LB_POLICIES[policy].research
    if (research && !has(game, research))
      return no(
        Refusal.Locked({ what: LB_POLICIES[policy].label, research: RESEARCH[research].name }),
      )
    return ok(patch(game, id, { policy }))
  })

/**
 * Turns sticky sessions on or off on a Load Balancer (05 "Load Balancer"): a share of its users stay
 * on the target they first reached.
 */
export const setSticky = (game: Game, id: string, sticky: boolean): Action =>
  withNode(game, id, (node) =>
    node.type === 'lb'
      ? ok(node.sticky === sticky ? game : patch(game, id, { sticky }))
      : notAllowed('Only a Load Balancer keeps users on a target.'),
  )

/**
 * Turns slow start on or off on a Load Balancer (11 "JVM warmup under load"): a new copy takes
 * traffic gradually, so a cold Java copy never answers at its cold speed.
 */
export const setSlowStart = (game: Game, id: string, slowStart: boolean): Action =>
  withNode(game, id, (node) =>
    node.type === 'lb'
      ? ok(node.slowStart === slowStart ? game : patch(game, id, { slowStart }))
      : notAllowed('Only a Load Balancer ramps a new copy up.'),
  )

/** Sets a Load Balancer's health checks. Intervals other than 10 s and deep checks need Health checks. */
export const setHealthCheck = (
  game: Game,
  id: string,
  change: Readonly<{ checkEvery?: number; deepCheck?: boolean }>,
): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'lb') return notAllowed('Only a Load Balancer runs health checks.')
    if (
      change.checkEvery !== undefined &&
      !(CHECK_INTERVALS as ReadonlyArray<number>).includes(change.checkEvery)
    )
      return notAllowed('A health check runs every 2, 10, or 30 seconds.')
    const tuned = (change.checkEvery ?? 10) !== 10 || change.deepCheck === true
    if (tuned && !has(game, 'health-checks'))
      return no(Refusal.Locked({ what: 'Health checks', research: RESEARCH['health-checks'].name }))
    return ok(patch(game, id, change))
  })
