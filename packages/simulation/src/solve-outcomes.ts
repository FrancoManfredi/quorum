import {
  CLOCK_SKEW_LOSS,
  CLOCK_SKEW_MS,
  COMPONENTS,
  MESH_HOP_MS,
  BULKHEAD_MS,
  HEDGE_LOAD,
  CHAOS_EVERY,
  CHAOS_SECONDS,
  CHAOS_FAILURE,
  type Kind,
} from './catalog.ts'
import {
  RETRY_BUDGET,
  hedged,
  backedOff,
  failSome,
  heldFor,
  retried,
  timedOut,
  blend,
  failed,
  hop,
  through,
  type Outcome,
} from './distribution.ts'
import { has, certExpired, isDown, meshOf } from './lookups.ts'
import { RULES, slotOf, type Pass } from './rules.ts'
import { isGlobal, placeMs } from './regions.ts'
import { causeOf } from './life.ts'
import { type Game, type GameNode } from './state.ts'
import { fixed } from './team.ts'
import {
  type Edge,
  amplification,
  delegates,
  offloads,
  runsLocalDb,
  samplingMsOf,
} from './solve-graph.ts'
import { type Inputs, CALLOUT, splitOf } from './solve-pass.ts'

/* ---------- outcomes ---------- */

/**
 * A leap second repeats one, so every Node in the region fires its timers twice: its answer waits
 * on a clock that jumped, and a share of its answers time out (11 "Leap second or clock skew").
 */
export const skewed = (game: Game, node: GameNode, answer: Outcome): Outcome => {
  const incident = game.incident
  if (incident?.kind !== 'leap-second' || incident.region === null) return answer
  if (node.region !== incident.region) return answer
  return failSome(through(hop({ fixed: CLOCK_SKEW_MS }), [[answer, 1]]), CLOCK_SKEW_LOSS, 'timeout')
}

/**
 * Whether a chaos experiment is running now (10 "Track: Reliability", "Chaos engineering"). An
 * experiment runs for its first seconds out of every gap, on the clock the Company started at.
 */
export const chaosRunning = (game: Game): boolean =>
  game.chaos && game.time % CHAOS_EVERY < CHAOS_SECONDS

/** The Node an experiment hits: the Design's weakest, or null when nothing runs or nothing is weak. */
export const chaosTarget = (game: Game): string | null => (chaosRunning(game) ? game.weakest : null)

/** What an experiment injects into its target: a share of that Node's calls fail as `refused`. */
export const chaotic = (game: Game, node: GameNode, answer: Outcome): Outcome =>
  chaosTarget(game) === node.id ? failSome(answer, CHAOS_FAILURE, 'refused') : answer

export const outcomesOf = (inputs: Inputs, pass: Pass) => {
  const { game, graph } = inputs
  const memo = new Map<GameNode, Map<Kind, Outcome>>()

  const ownHop = (node: GameNode, kind: Kind, value = 1) => {
    const model = pass.models[slotOf(pass, node)]
    const service = model?.service[kind] ?? { fixed: COMPONENTS[node.type].latency, variable: 0 }
    return hop({
      share: model?.shares?.[kind] ?? model?.share ?? 1,
      fixed: service.fixed + samplingMsOf(graph, node),
      variable: service.variable,
      tailP: model?.tailP ?? 0,
      tailMs: model?.tailMs ?? 0,
      value,
    })
  }

  /** One attempt on a Link: the callee's outcome cut at the Link's timeout, or its bulkhead. */
  const attempt = (edge: Edge, kind: Kind): Outcome => {
    const policy = edge.policy
    const wait = policy.bulkhead ? Math.min(policy.timeout, BULKHEAD_MS) : policy.timeout
    const answer = timedOut(outcome(edge.to, kind), wait)
    // A hedged Link races a second copy and keeps the faster answer (10 "Reliability").
    return policy.hedge ? hedged(answer) : answer
  }

  /**
   * A call on a Link: one attempt, and the retries if the Link retries. An open
   * breaker fails fast. A retried charge that timed out may already have charged:
   * without idempotency keys, those fail as `duplicate`.
   */
  const call = (edge: Edge, kind: Kind): Outcome => {
    const policy = edge.policy
    if (policy.open) return failed('refused')
    const once = attempt(edge, kind)
    if (policy.retry === 'none') return once
    const again =
      policy.retry === 'naive'
        ? retried(once, policy.timeout)
        : backedOff(once, policy.timeout, RETRY_BUDGET)
    // A charge that succeeded on a retry after a timeout charged twice: the first one went through.
    const timedOutShare = once.success < 1 ? once.fail.timeout / (1 - once.success) : 0
    const duplicates =
      again.success > 0
        ? (Math.max(0, again.success - once.success) / again.success) * timedOutShare
        : 0
    return kind === 'charge' &&
      !(has(game, 'idempotency-keys') && fixed(game, 'idempotency-keys')) &&
      duplicates > 0
      ? failSome(again, duplicates, 'duplicate')
      : again
  }

  /** Share of attempts that fail on a Link, which drives naive retries. */
  const failureOn = (edge: Edge, kind: Kind): number => 1 - attempt(edge, kind).success

  /** A call that leaves its zone or region pays the hop on top, and a sidecar one more millisecond. */
  const placed = (edge: Edge, kind: Kind): Outcome => {
    const node = edge.from
    const child = edge.to
    // A partition cuts calls between regions until it heals.
    if (
      game.incident?.kind === 'partition' &&
      node.region !== child.region &&
      node.type !== 'users' &&
      !isGlobal(node) &&
      !isGlobal(child)
    )
      return failed('timeout')
    const extra = placeMs(game, node, child) + (meshOf(game, node) ? MESH_HOP_MS : 0)
    const answer = call(edge, kind)
    return extra > 0 ? through(hop({ fixed: extra }), [[answer, 1]]) : answer
  }

  /** What one request of `kind` sent from `node` to its targets gets back. */
  const downstream = (node: GameNode, kind: Kind, extraHop = 0): Outcome => {
    if (kind === 'callout') return CALLOUT
    const mixed = blend(
      splitOf(inputs, node, kind).map(([edge, weight]) => [placed(edge, kind), weight]),
    )
    if (!mixed) return failed('stranded')
    return extraHop > 0 ? through(hop({ fixed: extraHop }), [[mixed, 1]]) : mixed
  }

  /** Milliseconds a caller holds its slot for one call: E[min(X, T)] per attempt, times the attempts. */
  const held = (node: GameNode, kind: Kind, extraHop = 0): number =>
    splitOf(inputs, node, kind).reduce((total, [edge, weight]) => {
      const policy = edge.policy
      if (policy.open) return total
      const attempts = policy.retry === 'none' ? 1 : amplification(policy, failureOn(edge, kind))
      // A bulkhead frees the slot early; a hedge holds two copies at once (05 "Links").
      const wait = policy.bulkhead ? Math.min(policy.timeout, BULKHEAD_MS) : policy.timeout
      const both = policy.hedge ? 1 + HEDGE_LOAD : 1
      const each =
        heldFor(outcome(edge.to, kind), wait) +
        extraHop +
        placeMs(game, node, edge.to) +
        (meshOf(game, node) ? MESH_HOP_MS : 0)
      return total + weight * attempts * both * Math.min(wait, each)
    }, 0)

  const outcome = (node: GameNode, kind: Kind): Outcome => {
    let byKind = memo.get(node)
    if (!byKind) {
      byKind = new Map()
      memo.set(node, byKind)
    }
    const cached = byKind.get(kind)
    if (cached) return cached
    // A Node the kernel killed for memory fails as `oom` until it is back.
    const result = isDown(node)
      ? failed(causeOf(node.life) === 'oom' ? 'oom' : 'down')
      : // A Node whose TLS certificate ran out is refused by every browser.
        certExpired(game, node)
        ? failed('down')
        : chaotic(
            game,
            node,
            skewed(
              game,
              node,
              RULES[node.type].outcome(
                {
                  game,
                  pass,
                  ownHop: (of, value) => ownHop(node, of, value),
                  downstream: (of, extraHop) => downstream(node, of, extraHop),
                  delegates: delegates(graph, node),
                  runsLocalDb: runsLocalDb(graph, node),
                  offloads: offloads(graph, node),
                },
                node,
                kind,
              ),
            ),
          )
    byKind.set(kind, result)
    return result
  }

  return { outcome, downstream, held, failureOn }
}

/**
 * Mean milliseconds one request spends inside a Node: its own service, weighted by the kinds that
 * reach it, and the cold starts that land on a share of them. A Serverless Function bills it.
 */
export const meanServiceOf = (pass: Pass, node: GameNode): number => {
  const slot = slotOf(pass, node)
  const arriving = pass.arriving[slot] ?? {}
  const model = pass.models[slot]
  let spent = 0
  let rate = 0
  for (const kind of Object.keys(arriving) as Array<Kind>) {
    const service = model?.service[kind]
    const each = arriving[kind] ?? 0
    if (!service || each <= 0) continue
    spent += each * (service.fixed + service.variable)
    rate += each
  }
  const cold = model ? model.tailP * model.tailMs : 0
  return rate > 0 ? spent / rate + cold : cold
}
