import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  KINDS,
  LEVER_REFUND,
  MAX_LEVER_STEP,
  leverDh,
  leverStepEra,
  type FeatureId,
  type RequestKind,
} from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { leverGrowthFactor, mixOf, valueFactor } from '../src/features.ts'
import { freeSandbox } from '../src/sandbox.ts'
import type { FeaturePhase } from '../src/feature-machine.ts'
import type { Game } from '../src/state.ts'
import { leverRefusal, queueLever, removeLever } from '../src/work.ts'

/*
 * Product levers (10 "Product levers"): a step raises one kind's share from the
 * other kinds, keeps total demand, and earns what it displaced, so revenue per
 * user stays flat. A Company builds a step through its backlog; a free Sandbox
 * sets it at once.
 */

const live: FeaturePhase = { _tag: 'Live', rollout: 1, adoption: 1, lift: null }

/** Pre-seed with Password login live, so `login` carries its share of the Era. */
const serving = (): Game => ({ ...preseedGame(), features: { 'password-login': live } })

const withFeature = (game: Game, stage: number, id: FeatureId): Game => ({
  ...game,
  stage,
  features: { ...game.features, [id]: live },
})

/** The Company's revenue per user, with perfect service: each kind's share times its value. */
const perUser = (game: Game): number => {
  const mix = mixOf(game)
  return Object.entries(mix).reduce(
    (sum, [kind, share]) =>
      sum +
      (share ?? 0) * KINDS[kind as RequestKind].value * valueFactor(game, kind as RequestKind),
    0,
  )
}

describe('Product levers', () => {
  test('a step doubles the kind’s share, and the others give it up in proportion', () => {
    const before = mixOf(serving())
    const after = mixOf({ ...serving(), levers: { login: 1 } })
    expect(after.login ?? 0).toBeCloseTo((before.login ?? 0) * 2, 12)
    expect(Object.values(after).reduce((sum, share) => sum + (share ?? 0), 0)).toBeCloseTo(1, 12)
    expect((after.write ?? 0) / (before.write ?? 0)).toBeCloseTo(
      (after.read ?? 0) / (before.read ?? 0),
      12,
    )
  })

  test('the third step multiplies the share by four', () => {
    const before = mixOf(serving())
    const after = mixOf({ ...serving(), levers: { login: MAX_LEVER_STEP } })
    expect(after.login ?? 0).toBeCloseTo((before.login ?? 0) * 4, 12)
  })

  test('a pinned mix ignores the levers', () => {
    const pinned: Game = { ...serving(), fixedMix: true, levers: { login: 2 } }
    expect(mixOf(pinned)).toEqual(mixOf({ ...pinned, levers: {} }))
  })

  test('revenue per user stays flat, because the added requests earn what they displaced', () => {
    const before = perUser(serving())
    expect(before).toBeGreaterThan(0)
    expect(perUser({ ...serving(), levers: { login: 1 } })).toBeCloseTo(before, 12)
    expect(perUser({ ...serving(), levers: { login: MAX_LEVER_STEP } })).toBeCloseTo(before, 12)
  })

  test('every built step costs user growth', () => {
    expect(leverGrowthFactor(serving())).toBe(1)
    expect(leverGrowthFactor({ ...serving(), levers: { login: 1 } })).toBeCloseTo(0.99, 12)
    expect(leverGrowthFactor({ ...serving(), levers: { login: 2 } })).toBeCloseTo(0.99 * 0.98, 12)
  })
})

describe('building a lever step', () => {
  test('a Company queues one step on the Service that carries the kind’s Feature', () => {
    const action = queueLever(serving(), 'login')
    if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
    const item = action.success.backlog.find((entry) => entry.kind === 'lever')
    expect(item?.ref).toBe('login')
    expect(item?.step).toBe(1)
    expect(item?.cost).toBe(leverDh(1))
    expect(action.success.levers.login ?? 0).toBe(0)
  })

  test('a step already on the backlog refuses another', () => {
    const action = queueLever(serving(), 'login')
    if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
    expect(leverRefusal(action.success, 'login')).toMatchObject({ _tag: 'NotAllowed' })
  })

  test('the Era gates each step', () => {
    const seed = withFeature(preseedGame(), leverStepEra('upload', 1), 'profile-photos')
    expect(leverStepEra('upload', 1)).toBe(2)
    expect(leverStepEra('upload', 2)).toBe(3)
    expect(leverRefusal(seed, 'upload')).toBeNull()
    const first: Game = { ...seed, levers: { upload: 1 } }
    expect(leverRefusal(first, 'upload')).toMatchObject({ _tag: 'NotAllowed' })
    expect(leverRefusal({ ...first, stage: leverStepEra('upload', 2) }, 'upload')).toBeNull()
  })

  test('a Challenge pins its mix, so it carries no lever', () => {
    expect(leverRefusal({ ...freeSandbox(), fixedMix: true }, 'login')).toMatchObject({
      _tag: 'NotAllowed',
    })
  })

  test('a Venture can cap a lever at its first step', () => {
    const base = withFeature(preseedGame(), leverStepEra('upload', 2), 'profile-photos')
    const healthcare: Game = {
      ...base,
      levers: { upload: 1 },
      founding: { ...base.founding, venture: 'healthcare' },
    }
    expect(mixOf(base).upload ?? 0).toBeGreaterThan(0)
    expect(leverRefusal(healthcare, 'upload')).toMatchObject({ _tag: 'NotAllowed' })
    expect(leverRefusal({ ...healthcare, founding: base.founding }, 'upload')).toBeNull()
  })

  test('a free Sandbox sets the step at once, and takes it back', () => {
    const set = queueLever(freeSandbox(), 'login')
    if (Result.isFailure(set)) throw new Error(JSON.stringify(set.failure))
    expect(set.success.levers.login).toBe(1)
    expect(set.success.backlog.some((item) => item.kind === 'lever')).toBe(false)
    const off = removeLever(set.success, 'login')
    if (Result.isFailure(off)) throw new Error(JSON.stringify(off.failure))
    expect(off.success.levers.login).toBe(0)
  })

  test('removing a step refunds half its Dev Hours', () => {
    const built: Game = { ...serving(), levers: { login: 1 }, devHours: 100 }
    const off = removeLever(built, 'login')
    if (Result.isFailure(off)) throw new Error(JSON.stringify(off.failure))
    expect(off.success.devHours).toBeCloseTo(100 + leverDh(1) * LEVER_REFUND, 12)
    expect(off.success.levers.login).toBe(0)
  })
})
