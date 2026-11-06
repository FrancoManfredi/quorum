import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
import {
  HERD_REFUSED,
  STICKY_HERD,
  HUB_RAM_KB,
  PRESENCE_CPU,
  PRESENCE_VALUE,
  RUNTIME_INCIDENT_FAILURES,
  RT_HOLD_SECONDS,
  RUNTIMES,
} from '../catalog.ts'
import { failSome, failed, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, has, pinnedOf } from '../lookups.ts'
import { type ComponentRule, noConnections, nothing } from '../rule-kit.ts'

/* ---------- the Realtime Hub ---------- */

/**
 * Connections a Hub holds at its size: the RAM it gives them over what one costs its runtime
 * (06 "Realtime connections"). A runtime that holds a worker or a thread per connection holds
 * none, and without Clustering only one box takes connections, so the larger sizes add Burn and
 * no room.
 */
export const hubConnections = (node: GameNode, builtIn = false): number => {
  const perConnection = RUNTIMES[node.runtime].connectionKB
  if (perConnection === null) return 0
  return (HUB_RAM_KB * (node.clustering || builtIn ? flatScale(node) : 1)) / perConnection
}

/** Realtime messages a second a Hub holds: a message keeps its connection open for the hold time. */
const hubRate = (node: GameNode, builtIn = false): number =>
  (hubConnections(node, builtIn) / RT_HOLD_SECONDS) * (node.presence ? 1 - PRESENCE_CPU : 1)

/**
 * Distributed Erlang gives an Elixir Hub its own cluster backbone, so it takes connections on
 * every box without the Clustering option (06 "Elixir", "Realtime connections").
 */
export const distributedErlang = (game: Game, node: GameNode): boolean =>
  has(game, 'distributed-erlang') && RUNTIMES[node.runtime].language === 'elixir'

// A Realtime Hub holds a connection for each realtime message instead of serving it as a
// request, and sends nothing on (05 "Realtime Hub", 06 "Realtime connections").
export const wsRule: ComponentRule = {
  // A runtime that holds a worker per connection holds none: the Hub takes the traffic and
  // refuses it, rather than dividing a box that cannot hold a connection.
  model: (solver, node, arriving) =>
    RUNTIMES[node.runtime].connectionKB === null
      ? flatModel(Number.POSITIVE_INFINITY, arriving, { fixed: 1, variable: 0 }, solver.boost(node))
      : flatModel(
          hubRate(node, distributedErlang(solver.game, node)),
          arriving,
          { fixed: 1, variable: 0 },
          solver.boost(node),
        ),
  serve: nothing,
  outcome: (answer, node, kind) => {
    // PHP-FPM and Gunicorn sync hold a worker per open connection: they cannot hold any.
    if (RUNTIMES[node.runtime].connectionKB === null) return failed('refused')
    // A Hub that just came back takes the fleet's whole reconnect wave at once. Jittered
    // backoff spreads it over the hold time; without it, the Hub refuses what it cannot take.
    // A throttled storm admits the wave at the rate the Hub can take, as backoff does.
    const incident = answer.game.incident
    const throttled =
      incident?.kind === 'reconnect' && incident.nodeId === node.id && incident.throttled === true
    const herd = node.life._tag === 'Warming' && !node.backoff && !throttled
    // A split cluster loses the messages that cross the cut.
    const split =
      incident?.kind === 'split-brain' && incident.nodeId === node.id
        ? (RUNTIME_INCIDENT_FAILURES['split-brain'] ?? 0)
        : 0
    return failSome(
      failSome(through(answer.ownHop(kind, node.presence ? PRESENCE_VALUE : 1)), split, 'stale'),
      // A sticky Load Balancer sends each client back to the Hub it had, so a restarted Hub
      // takes only its own half of the wave.
      herd ? HERD_REFUSED * (pinnedOf(answer.game, node) ? STICKY_HERD : 1) : 0,
      'refused',
    )
  },
  connections: noConnections,
  // An LB weighs it by the connections it holds, which depend on its runtime.
  probe: () => ({ rt: 1 }),
}

/** Sets a Realtime Hub's Presence, Reconnect backoff, or Clustering (05 "Realtime Hub"). */
export const setHubOptions = (
  game: Game,
  id: string,
  change: Readonly<{ presence?: boolean; backoff?: boolean; clustering?: boolean }>,
): Action =>
  withNode(game, id, (node) =>
    node.type === 'ws' ? ok(patch(game, id, change)) : notAllowed('Only a Realtime Hub has these.'),
  )
