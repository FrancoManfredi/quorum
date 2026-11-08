import { Result } from 'effect'
import { expect, test } from 'vitest'
import { place } from '../src/actions.ts'
import { newGame } from '../src/company.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import { unsampledOf } from '../src/solve-insight.ts'
import { shapeHolds, studyStall } from '../src/studies.ts'

/* A Study asks the Design to do the thing it teaches (10 "Research shapes"), and traffic no tap
 * samples earns nothing (12 "The cost of seeing"). */

test('a Study waits for the behaviour it teaches', () => {
  const game = newGame(1)
  const ledger = solveFlow(game)
  expect(shapeHolds(game, ledger, 'autoscaling')).toBe(false)
  expect(studyStall(game, ledger, 'autoscaling')).toMatchObject({
    _tag: 'Shape',
    shape: 'saturation',
  })
})

test('a Read Replica satisfies the shape that leads to consensus', () => {
  const placed = place(freeSandbox(), 'replica', 800, 620)
  if (Result.isFailure(placed)) throw new Error('the replica could not be built')
  expect(shapeHolds(placed.success, solveFlow(placed.success), 'consensus')).toBe(true)
})

test('traffic that no Analytics tap samples is unclassified', () => {
  expect(unsampledOf(solveFlow(newGame(1))).share).toBeLessThan(0.01)
  expect(unsampledOf(solveFlow(freeSandbox())).share).toBeGreaterThan(0.99)
})
