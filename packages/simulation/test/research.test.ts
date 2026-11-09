import { describe, expect, test } from 'vitest'
import {
  ERAS,
  ERA_RECIPES,
  INSIGHT_YIELD,
  RECIPE,
  RPS_PER_USER,
  STUDY_SECONDS,
  researchList,
  type FeatureId,
  type InsightPool,
  type RequestKind,
  type ResearchId,
} from '../src/catalog.ts'
import { newGame } from '../src/company.ts'
import { demandOf } from '../src/solve-demand.ts'
import type { Game } from '../src/state.ts'

/*
 * Research is sustainable when each Era's packs flow (12 "Earning Insight", 10 "Recipes"): its
 * default recipe kinds keep a real share of the Era's demand, and the Insight they earn at the
 * Era's top traffic pays a Study of the Era's median item in a couple of base durations. Failure
 * Insight is left out: it comes from failures, not from the mix.
 */

/** Least share of demand each of an Era's default recipe kinds keeps: below this a pack dries up. */
const PACK_FLOOR = 0.02
/** Base durations a median Study may take at the Era's top traffic: on the packs, and on any recipe. */
const SLOWEST = 2
const LOOSEST = 3

const live = { _tag: 'Live' as const, rollout: 1, adoption: 1, lift: null }

/** Insight a kind earns a second at `users`, on a 10% sample nothing drops. */
const insightAt = (users: number, share: number) =>
  INSIGHT_YIELD * Math.sqrt(0.1 * users * RPS_PER_USER * share)

/** An item's pools and their Insight cost: every pool but Failure, which failures pay for. */
const poolsOf = (id: ResearchId): ReadonlyArray<[RequestKind, number]> =>
  (Object.entries(RECIPE[id]) as Array<[InsightPool, number]>).filter(
    (entry): entry is [RequestKind, number] => entry[0] !== 'failure',
  )

/** The Era's items, priciest last, with the slowest pool of each one at the Era's top traffic. */
const itemsOf = (stage: number) => {
  const exit = ERAS[stage]?.raiseAt ?? 1_000_000
  const mix = ERAS[stage]?.mix ?? {}
  return researchList
    .filter((entry) => entry.era === stage)
    .map((entry) => ({
      id: entry.id,
      total: Object.values(RECIPE[entry.id]).reduce((sum, cost) => sum + cost, 0),
      slowest: Math.max(
        0,
        ...poolsOf(entry.id).map(
          ([pool, cost]) =>
            cost / (STUDY_SECONDS[stage] ?? 3_600) / insightAt(exit, mix[pool] ?? 0),
        ),
      ),
    }))
    .toSorted((a, b) => a.total - b.total)
}

const medianOf = (items: ReadonlyArray<{ slowest: number }>) =>
  items[Math.floor(items.length / 2)]?.slowest ?? 0

/** Whether an item is paid in the Era's default recipe rather than a recipe of its own. */
const onDefaults = (stage: number, id: ResearchId) =>
  Object.keys(RECIPE[id]).toSorted().join() === (ERA_RECIPES[stage] ?? []).toSorted().join()

describe('an Era pays for its research in its own packs', () => {
  test('each Era mix sums to one', () => {
    for (const era of ERAS)
      expect(Object.values(era.mix).reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 9)
  })

  test('every default recipe kind keeps a share of its Era demand', () => {
    for (let stage = 0; stage < 6; stage += 1)
      for (const kind of ERA_RECIPES[stage] ?? [])
        if (kind !== 'failure')
          expect(ERAS[stage]?.mix[kind] ?? 0).toBeGreaterThanOrEqual(PACK_FLOOR)
  })

  test('the packs pay a median Study in a couple of its base durations', () => {
    for (let stage = 0; stage < 6; stage += 1) {
      const items = itemsOf(stage)
      const defaults = items.filter((entry) => onDefaults(stage, entry.id))
      expect(medianOf(defaults)).toBeLessThanOrEqual(SLOWEST)
      expect(medianOf(items)).toBeLessThanOrEqual(LOOSEST)
    }
  })
})

/** The share of an Era's demand a kind takes once every Feature it needs is live. */
const shareOf = (
  stage: number,
  kind: 'login' | 'upload',
  ...ids: ReadonlyArray<FeatureId>
): number => {
  const game: Game = {
    ...newGame(1),
    stage,
    users: 25_000,
    features: Object.fromEntries(ids.map((id) => [id, live])),
  }
  const demand = demandOf(game)
  const total = Object.values(demand).reduce((sum, rate) => sum + (rate ?? 0), 0)
  return (demand[kind] ?? 0) / total
}

describe('login and upload traffic', () => {
  /*
   * Login is the Pre-seed CPU-heavy kind and upload the Seed payload kind. A rebalance that
   * starves either one leaves its Insight pool, and every Study that draws on it, dry.
   */
  test('the Era that introduces a kind keeps a real share of its demand', () => {
    expect(shareOf(1, 'login', 'signup-flow', 'password-login')).toBeGreaterThanOrEqual(0.05)
    expect(
      shareOf(2, 'upload', 'signup-flow', 'password-login', 'profile-photos'),
    ).toBeGreaterThanOrEqual(0.05)
  })
})

describe('Profile photos puts uploads on the wire', () => {
  const seeded = (features: Game['features']): Game => {
    const game = newGame(1)
    return { ...game, stage: 2, users: 25_000, features }
  }
  const shipped = seeded({ 'profile-photos': live })

  test('uploads are a pack the Seed Era can sample', () => {
    const demand = demandOf(shipped)
    const total = Object.values(demand).reduce((sum, rate) => sum + (rate ?? 0), 0)
    expect(demand.upload ?? 0).toBeGreaterThanOrEqual(30)
    expect((demand.upload ?? 0) / total).toBeGreaterThanOrEqual(PACK_FLOOR)
  })

  test('without the Feature, the Seed Era sends no uploads at all', () => {
    expect(demandOf(seeded({})).upload ?? 0).toBe(0)
  })
})
