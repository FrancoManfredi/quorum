import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game } from '../state.ts'
import { RETENTION_WINDOWS, SAMPLE_RATES } from '../catalog.ts'
import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

export const analyticsRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}

export const setSample = (game: Game, id: string, sampleRate: number): Action =>
  withNode(game, id, (node) =>
    node.type === 'analytics' && (SAMPLE_RATES as ReadonlyArray<number>).includes(sampleRate)
      ? ok(patch(game, id, { sampleRate }))
      : notAllowed('Only Analytics has a sample rate.'),
  )

/** How long Analytics keeps traces (12 "Retention"). */
export const setRetention = (game: Game, id: string, retention: number): Action =>
  withNode(game, id, (node) =>
    node.type === 'analytics' && (RETENTION_WINDOWS as ReadonlyArray<number>).includes(retention)
      ? ok(patch(game, id, { retention }))
      : notAllowed('Only Analytics keeps traces.'),
  )
