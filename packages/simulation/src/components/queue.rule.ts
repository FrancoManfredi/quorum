import { type Action, answering, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game } from '../state.ts'
import { BACKLOG_MS, DRAIN_SECONDS, MAX_ATTEMPTS, QUEUE_LENGTHS, QUEUE_RATE } from '../catalog.ts'
import { failSome, failed, through } from '../distribution.ts'

import { flatScale } from '../lookups.ts'
import { type ComponentRule, flat, noConnections, noProbe, slotOf } from '../rule-kit.ts'

export const queueRule: ComponentRule = {
  model: flat({ fixed: 2, variable: 0.05 }, (node) => QUEUE_RATE * flatScale(node)),
  // It offers its Workers what arrived, plus a share of its backlog as far as they have room.
  serve: (serve, node, rates, share) => {
    if (share <= 0) return
    const arrived = (rates.task ?? 0) * share
    const room = Math.max(0, serve.solver.drainable(node) - arrived)
    serve.route('task', arrived + Math.min(node.depth / DRAIN_SECONDS, room))
  },
  // The caller waits for the enqueue only. A long backlog slows the broker.
  outcome: (answer, node, kind) => {
    const own = answer.ownHop(kind)
    // With no Worker linked, the task has nowhere to go.
    if (answer.downstream(kind).fail.stranded >= 1) return failed('stranded')
    const enqueued = through({ ...own, fixed: own.fixed + BACKLOG_MS * node.depth })
    // A full Queue refuses what its Workers cannot take (RabbitMQ `reject-publish`).
    if (node.maxLength <= 0 || node.depth < node.maxLength) return enqueued
    const slot = slotOf(answer.pass, node)
    const inflow = answer.pass.arriving[slot]?.task ?? 0
    const drained = answer.pass.drained[slot] ?? 0
    return inflow > 0 ? failSome(enqueued, Math.max(0, 1 - drained / inflow), 'dropped') : enqueued
  },
  connections: noConnections,
  probe: noProbe,
}

/** Turns a Queue's dead-letter queue on or off. */
export const setDlq = (game: Game, id: string, dlq: boolean): Action =>
  withNode(game, id, (node) =>
    node.type === 'queue'
      ? ok(node.dlq === dlq ? game : patch(game, id, { dlq }))
      : notAllowed('Only a Queue has a dead-letter queue.'),
  )

/** Sets the attempts a Queue's dead-letter queue allows a task. */
export const setAttempts = (game: Game, id: string, attempts: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'queue') return notAllowed('Only a Queue retries tasks.')
    if (!(MAX_ATTEMPTS as ReadonlyArray<number>).includes(attempts))
      return notAllowed(`Max attempts are ${MAX_ATTEMPTS.join(', ')}.`)
    return ok(node.attempts === attempts ? game : patch(game, id, { attempts }))
  })

/** Sets the most tasks a Queue holds before it refuses new ones; 0 means no limit. */
export const setMaxLength = (game: Game, id: string, maxLength: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'queue') return notAllowed('Only a Queue has a max length.')
    if (!(QUEUE_LENGTHS as ReadonlyArray<number>).includes(maxLength))
      return notAllowed('That max length is not on offer.')
    return ok(
      node.maxLength === maxLength
        ? game
        : patch(game, id, {
            maxLength,
            depth: maxLength > 0 ? Math.min(node.depth, maxLength) : node.depth,
          }),
    )
  })

/** Deletes the poison message: the Workers get back to the queue. */
export const deleteMessage = (game: Game): Action =>
  game.incident?.kind === 'poison'
    ? ok({ ...game, incident: { ...answering(game, game.incident), remaining: 0 } })
    : notAllowed('No poison message is stuck.')
