import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, ScaleSignal } from '../state.ts'
import { RESEARCH, SCALE_MAXIMA, SCALE_TARGETS } from '../catalog.ts'
import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

export const autoscalerRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}

/** Sets an Autoscaler's signal, target, and copy limits. */
export const setAutoscaler = (
  game: Game,
  id: string,
  change: Readonly<{
    signal?: ScaleSignal
    target?: number
    minCopies?: number
    maxCopies?: number
    schedule?: boolean
  }>,
): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'autoscaler') return notAllowed('Only an Autoscaler scales.')
    if (change.schedule === true && !has(game, 'scheduled-scaling'))
      return no(
        Refusal.Locked({ what: 'A schedule', research: RESEARCH['scheduled-scaling'].name }),
      )
    if (
      change.target !== undefined &&
      !(SCALE_TARGETS as ReadonlyArray<number>).includes(change.target)
    )
      return notAllowed('A target is 40%, 60%, or 80%.')
    if (
      change.maxCopies !== undefined &&
      !(SCALE_MAXIMA as ReadonlyArray<number>).includes(change.maxCopies)
    )
      return notAllowed('A max is 4, 8, 16, or none.')
    const minCopies = change.minCopies ?? node.minCopies
    const maxCopies = change.maxCopies ?? node.maxCopies
    if (minCopies < 1 || minCopies > 16 || !Number.isInteger(minCopies))
      return notAllowed('A min is 1 to 16 copies.')
    if (maxCopies > 0 && minCopies > maxCopies) return notAllowed('The min is above the max.')
    return ok(patch(game, id, change))
  })
