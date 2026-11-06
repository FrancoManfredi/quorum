import { type Action, endIncident, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
import { BOT_MANAGEMENT_FALSE, REGEX_CAPACITY, PARANOIA, UNDER_ATTACK } from '../catalog.ts'
import { failSome } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import {
  type ComponentRule,
  each,
  flatCapacity,
  noConnections,
  noProbe,
  relay,
} from '../rule-kit.ts'

/** A WAF's paranoia level, or Under attack mode. Bot management halves its false positives. */
const wafOf = (node: GameNode, game?: Game) => {
  const level =
    PARANOIA[Math.max(0, Math.min(PARANOIA.length - 1, node.paranoia - 1))] ?? PARANOIA[1]
  const challenged = game !== undefined && has(game, 'bot-management')
  const soften = (rate: number): number => (challenged ? rate * BOT_MANAGEMENT_FALSE : rate)
  return node.underAttack
    ? {
        block: UNDER_ATTACK.block,
        falsePositive: soften(UNDER_ATTACK.falsePositive),
        cpu: UNDER_ATTACK.cpu,
      }
    : {
        block: level.block,
        falsePositive: soften(level.falsePositive),
        cpu: level.cpu,
      }
}

export const wafRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      (flatCapacity(node) / wafOf(node, solver.game).cpu) *
        (solver.game.incident?.kind === 'regex' ? REGEX_CAPACITY : 1),
      arriving,
      { fixed: 2 + (node.underAttack ? UNDER_ATTACK.latency : 0), variable: 0.1 },
      solver.boost(node),
    ),
  // Bots stop here at the block rate; real users at the false positive rate.
  serve: (serve, node, rates, share) => {
    const waf = wafOf(node, serve.solver.game)
    each(rates, share, (kind, processed) =>
      serve.route(kind, processed * (1 - (kind === 'bot' ? waf.block : waf.falsePositive))),
    )
  },
  outcome: (answer, node, kind) =>
    failSome(
      relay(answer, node, kind),
      kind === 'bot' ? wafOf(node, answer.game).block : wafOf(node, answer.game).falsePositive,
      'blocked',
    ),
  connections: noConnections,
  probe: noProbe,
}

/** Sets a WAF's paranoia level, 1 to 4. */
export const setParanoia = (game: Game, id: string, paranoia: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'waf') return notAllowed('Only a WAF has a paranoia level.')
    if (!PARANOIA.some((entry) => entry.level === paranoia))
      return notAllowed('Paranoia runs from 1 to 4.')
    return ok(node.paranoia === paranoia ? game : patch(game, id, { paranoia }))
  })

/** Turns a WAF's Under attack mode on or off: it challenges every request. */
export const setUnderAttack = (game: Game, id: string, underAttack: boolean): Action =>
  withNode(game, id, (node) =>
    node.type === 'waf'
      ? ok(node.underAttack === underAttack ? game : patch(game, id, { underAttack }))
      : notAllowed('Only a WAF has Under attack mode.'),
  )

/** Disables the WAF rule that backtracks. */
export const disableRule = (game: Game): Action =>
  endIncident(game, 'regex', 'No WAF rule is backtracking.')
