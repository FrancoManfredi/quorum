import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { preseedGame } from '../src/company.ts'
import { solveFlow } from '../src/solve.ts'
import { devHoursPerk, devHoursRate } from '../src/team.ts'
import { MUTATOR_IDS, VENTURE_IDS } from '../src/catalog.ts'
import {
  buyPerk,
  chooseVenture,
  emptyFounder,
  Founder,
  foundingOf,
  toggleMutator,
} from '../src/founder.ts'

describe('the Founder picks any Venture or Mutator', () => {
  test('every Venture is open on a fresh Founder', () => {
    for (const id of VENTURE_IDS) {
      const changed = chooseVenture(emptyFounder(), id)
      expect(Result.isSuccess(changed)).toBe(true)
      if (Result.isSuccess(changed)) expect(foundingOf(changed.success).venture).toBe(id)
    }
  })

  test('every Mutator is open on a fresh Founder', () => {
    for (const id of MUTATOR_IDS) {
      const changed = toggleMutator(emptyFounder(), id)
      expect(Result.isSuccess(changed)).toBe(true)
      if (Result.isSuccess(changed)) expect(foundingOf(changed.success).mutators).toEqual([id])
    }
  })

  test('a Mutator toggles off again', () => {
    const on = toggleMutator(emptyFounder(), 'no-caches')
    expect(Result.isSuccess(on)).toBe(true)
    if (Result.isFailure(on)) return
    const off = toggleMutator(on.success, 'no-caches')
    expect(Result.isSuccess(off)).toBe(true)
    if (Result.isSuccess(off)) expect(foundingOf(off.success).mutators).toEqual([])
  })

  test('Perks still cost Legacy', () => {
    expect(Result.isFailure(buyPerk(emptyFounder(), 'angel-network'))).toBe(true)
  })

  test('Night shift adds 10% Dev Hours per level', () => {
    const base = preseedGame()
    const withLevel = (level: number) => ({
      ...base,
      founding: { ...base.founding, perks: { 'night-shift': level } },
    })
    expect(devHoursPerk(base)).toBe(1)
    expect(devHoursPerk(withLevel(3))).toBeCloseTo(1.3)
    const ledger = solveFlow(base)
    expect(devHoursRate(base, ledger)).toBeGreaterThan(0)
    expect(devHoursRate(withLevel(2), ledger) / devHoursRate(base, ledger)).toBeCloseTo(1.2)
  })

  test('a Founder file from before the change still loads', () => {
    const old = JSON.stringify({
      legacy: 12,
      earned: 12,
      perks: { 'angel-network': 1 },
      ventures: ['b2b-saas', 'fintech'],
      mutators: ['no-caches'],
      venture: 'fintech',
      chosen: ['no-caches'],
      history: [],
    })
    const founder = Schema.decodeSync(Schema.fromJsonString(Founder))(old)
    expect(founder.legacy).toBe(12)
    expect(foundingOf(founder)).toEqual({
      venture: 'fintech',
      mutators: ['no-caches'],
      perks: { 'angel-network': 1 },
    })
  })
})
