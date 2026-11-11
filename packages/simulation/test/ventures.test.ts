import { describe, expect, test } from 'vitest'
import {
  ERAS,
  ERA_RECIPES,
  FEATURES,
  FEATURE_IDS,
  REQUEST_KINDS,
  VENTURES,
  VENTURE_IDS,
  type FeatureId,
  type RequestKind,
  type VentureId,
} from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { mixOf } from '../src/features.ts'
import { freeSandbox } from '../src/sandbox.ts'
import type { FeaturePhase } from '../src/feature-machine.ts'
import type { Game } from '../src/state.ts'

/*
 * Ventures (13 "Ventures"): each one runs its own traffic, not a modifier on the Era's. The Era
 * decides which kinds a Company serves; the Venture decides how much of each, and the profile is
 * masked to the Era and scaled back to one.
 */

const live: FeaturePhase = { _tag: 'Live', rollout: 1, adoption: 1, lift: null }

/** The gated Features whose kind this Era serves: the ones a Company at that Era has shipped. */
const shippedAt = (stage: number): ReadonlyArray<FeatureId> =>
  FEATURE_IDS.filter((id) => {
    const unlocks = FEATURES[id].unlocks
    return unlocks?.gated === true && (ERAS[stage]?.mix[unlocks.kind] ?? 0) > 0
  })

const founded = (venture: VentureId, stage: number): Game => {
  const base = preseedGame()
  return {
    ...base,
    stage,
    users: 1_000,
    founding: { venture, mutators: [], perks: {} },
    features: Object.fromEntries(shippedAt(stage).map((id) => [id, live])),
  }
}

const total = (mix: Partial<Record<RequestKind, number>>): number =>
  Object.values(mix).reduce((sum, share) => sum + (share ?? 0), 0)

describe('a Venture sets its own traffic', () => {
  test('every profile sums to one and gives every kind a share', () => {
    for (const id of VENTURE_IDS) {
      const shares = VENTURES[id].shares
      if (shares === null) continue
      expect(total(shares), id).toBeCloseTo(1, 9)
      for (const kind of REQUEST_KINDS)
        expect(shares[kind] ?? 0, `${id} ${kind}`).toBeGreaterThan(0)
    }
  })

  test('each Venture runs its profile once the Era serves every kind', () => {
    const atSeriesC = 5
    for (const id of VENTURE_IDS) {
      const shares = VENTURES[id].shares
      if (shares === null) continue
      const mix = mixOf(founded(id, atSeriesC))
      for (const kind of REQUEST_KINDS)
        expect(mix[kind] ?? 0, `${id} ${kind}`).toBeCloseTo(shares[kind] ?? 0, 9)
    }
  })

  test('the default Venture keeps the Era mix', () => {
    const mix = mixOf(founded('b2b-saas', 5))
    for (const kind of REQUEST_KINDS)
      expect(mix[kind] ?? 0, kind).toBeCloseTo(ERAS[5]?.mix[kind] ?? 0, 9)
  })

  test('the Era masks a profile to the kinds it serves, and the rest keep their proportion', () => {
    for (const id of VENTURE_IDS) {
      const mix = mixOf(founded(id, 0))
      expect(Object.keys(mix).toSorted(), id).toEqual(['page', 'read'])
      expect(total(mix), id).toBeCloseTo(1, 9)
      const shares = VENTURES[id].shares
      if (shares === null) continue
      const ratio = (mix.read ?? 0) / (mix.page ?? 0)
      expect(ratio, id).toBeCloseTo((shares.read ?? 0) / (shares.page ?? 0), 9)
    }
  })

  test('a kind a gated Feature has not shipped is not served, whatever the profile', () => {
    const game = { ...founded('fintech', 3), features: {} }
    const mix = mixOf(game)
    expect(mix.buy).toBeUndefined()
    expect(mix.media).toBeUndefined()
    expect(mix.bid ?? 0).toBeGreaterThan(0)
  })

  test('a Sandbox pins its mix, so the Venture changes nothing there', () => {
    const founding = freeSandbox().founding
    const sandbox = { ...freeSandbox(), founding: { ...founding, venture: 'fintech' as const } }
    expect(mixOf(sandbox)).toEqual(mixOf(freeSandbox()))
  })
})

describe('every Venture can pay every default recipe', () => {
  test('each recipe kind keeps a real share of the Venture demand', () => {
    for (const id of VENTURE_IDS)
      for (let stage = 0; stage < ERAS.length; stage += 1)
        for (const kind of ERA_RECIPES[stage] ?? []) {
          if (kind === 'failure') continue
          const share = mixOf(founded(id, stage))[kind] ?? 0
          expect(share, `${id} stage ${stage} ${kind}`).toBeGreaterThanOrEqual(0.02)
        }
  })
})
