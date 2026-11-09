import { describe, expect, test } from 'vitest'
import { PROFILES, REQUEST_KINDS } from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { subscriptionsOf } from '../src/features.ts'
import { solveFlow } from '../src/solve.ts'

describe('ledger attribution (#4)', () => {
  test('request revenue, subscriptions, and fines attribute exactly', () => {
    const game = preseedGame()
    const ledger = solveFlow(game)
    const requestRevenue = REQUEST_KINDS.reduce(
      (sum, kind) => sum + (ledger.revenueByKind[kind] ?? 0),
      0,
    )
    expect(requestRevenue + ledger.subscriptions).toBeCloseTo(ledger.revenue, 10)
    expect(ledger.subscriptions).toBe(subscriptionsOf(game))
    const fines = REQUEST_KINDS.reduce((sum, kind) => sum + (ledger.finesByKind[kind] ?? 0), 0)
    expect(fines).toBeCloseTo(ledger.fines, 10)
  })

  test('only scored kinds carry request revenue and unit/cost allocation', () => {
    const ledger = solveFlow(preseedGame())
    for (const kind of REQUEST_KINDS) {
      if (!PROFILES[kind].scored) {
        expect(ledger.revenueByKind[kind] ?? 0).toBe(0)
        expect(ledger.costPerKind[kind]).toBeUndefined()
      }
    }
  })
})
