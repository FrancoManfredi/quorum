import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, PoolerMode } from '../state.ts'
import { POOLER_CONNECTIONS, SESSION_STATE_CRASHES } from '../catalog.ts'
import { failSome, failed } from '../distribution.ts'
import { fixed } from '../team.ts'
import { type ComponentRule, flat, noProbe, passOn, relay } from '../rule-kit.ts'

export const poolerRule: ComponentRule = {
  model: flat({ fixed: 0.3, variable: 0 }),
  serve: passOn,
  // Transaction pooling breaks code that keeps session state, until a task removes it. Statement
  // pooling shares the fewest server connections of all, and cannot run a multi-statement
  // transaction: a checkout through it fails.
  outcome: (answer, node, kind) =>
    node.mode === 'statement' && kind === 'q-tx'
      ? failed('refused')
      : failSome(
          relay(answer, node, kind),
          node.mode !== 'session' && !fixed(answer.game, 'session-state')
            ? SESSION_STATE_CRASHES
            : 0,
          'crash',
        ),
  // Session mode holds a server connection per client; transaction and statement modes share a few.
  connections: (_, node, __, inbound) =>
    node.mode === 'session' ? inbound : Math.min(POOLER_CONNECTIONS, inbound),
  probe: noProbe,
}

/** Sets a Connection Pooler's mode: session holds a server connection per client, transaction shares a few. */
export const setPoolerMode = (game: Game, id: string, mode: PoolerMode): Action =>
  withNode(game, id, (node) =>
    node.type === 'pooler'
      ? ok(node.mode === mode ? game : patch(game, id, { mode }))
      : notAllowed('Only a Connection Pooler has a mode.'),
  )
