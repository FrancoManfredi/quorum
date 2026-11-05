import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { newGame, preseedGame } from './company.ts'
import { codeCrashes } from './rules.ts'
import type { Action } from './actions.ts'
import { CORE_TEAM, Game, type Game as Board, type Incident, type Team } from './state.ts'
import {
  badDeployShareOf,
  failsKind,
  ownerOf,
  pagedTeam,
  serviceOfFeature,
  serviceOfKind,
  sharesDatabase,
  teamOutputs,
  withServiceId,
} from './team.ts'
import { splitCost, splitService, worksOn } from './work.ts'

/* Services and Ownership (08 "Services"): a split, the team that owns it, the traffic it breaks,
 * and the coordination a shared Database costs. */

const ok = (action: Action): Board => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const team = (id: string, name: string): Team => ({ ...CORE_TEAM, id, name })

/** A Series B Company with Service boundaries, two teams, and four live Features. */
const seriesB = (): Board => {
  const base = preseedGame()
  return {
    ...base,
    stage: 4,
    cash: 1e9,
    shipped: ['landing-page', 'password-login', 'checkout', 'dashboards'],
    researched: [...base.researched, 'service-boundaries'],
    teams: [CORE_TEAM, team('payments', 'Payments')],
  }
}

const split = (
  game: Board,
  features: ReadonlyArray<'checkout' | 'dashboards'>,
  owner = 'payments',
) => ok(splitService(game, { name: 'Payments', owner, features }))

const incident = (change: Partial<Incident>): Incident => ({
  kind: 'bad-deploy',
  remaining: 60,
  nodeId: null,
  startedAt: 0,
  baseline: 0,
  usersAtStart: 0,
  impaired: 0,
  lostRevenue: 0,
  failed: 0,
  signalAt: null,
  ackAt: null,
  severity: 3,
  magnitude: 3,
  zone: null,
  region: null,
  causedBy: null,
  ...change,
})

describe('splitting a Service', () => {
  test('costs the split factor of the moved code, and puts that on the backlog', () => {
    // A split is 0.3 of the moved part (08 "Migrations"); Checkout is 320 DH of a 0.5 KLOC/DH
    // codebase, so 160 KLOC × 0.3 = 48 DH.
    expect(splitCost(['checkout'])).toBeCloseTo(48, 9)
    expect(splitCost(['checkout', 'dashboards'])).toBeCloseTo(120, 9)
    const next = split(seriesB(), ['checkout'])
    const item = next.backlog.find((entry) => entry.kind === 'split')
    expect(item?.cost).toBeCloseTo(48, 9)
    expect(item?.service).toBe(next.services[1]?.id)
  })

  test('makes a named Service, owned by a team, carrying the Features it was split for', () => {
    // A codebase with the Features' lines already in it: 800 DH of Features is 400 KLOC.
    const before: Board = {
      ...seriesB(),
      services: [{ ...seriesB().services[0]!, codebase: 500 }],
    }
    const next = split(before, ['checkout', 'dashboards'])
    const made = next.services[1]
    expect(next.services).toHaveLength(2)
    expect(made).toMatchObject({
      id: 'service-2',
      name: 'Payments',
      owner: 'payments',
      debt: 0,
    })
    expect(made?.features).toEqual(['checkout', 'dashboards'])
    expect(made?.codebase).toBeCloseTo(400, 9)
    expect(next.services[0]?.codebase).toBeCloseTo(100, 9)
    expect(serviceOfFeature(next, 'checkout').id).toBe('service-2')
    expect(serviceOfFeature(next, 'landing-page').id).toBe('monolith')
  })

  test('takes its Features with it out of the Service that had them', () => {
    const once = split(seriesB(), ['checkout'])
    const twice = splitService(once, { name: 'Reports', owner: 'core', features: ['dashboards'] })
    const next = ok(twice)
    expect(next.services).toHaveLength(3)
    expect(serviceOfFeature(next, 'dashboards').id).toBe(next.services[2]?.id)
    // A Feature already moved cannot move again, and a Feature that is not live cannot move.
    expect(
      Result.isFailure(splitService(next, { name: 'X', owner: 'core', features: ['checkout'] })),
    ).toBe(true)
    expect(
      Result.isFailure(splitService(seriesB(), { name: 'X', owner: 'core', features: ['video'] })),
    ).toBe(true)
  })

  test('needs Service boundaries, a team, and a Feature to move', () => {
    const base = seriesB()
    const unstudied = {
      ...base,
      researched: base.researched.filter((id) => id !== 'service-boundaries'),
    }
    const locked = splitService(unstudied, { name: 'X', owner: 'core', features: ['checkout'] })
    expect(Result.isFailure(locked) && locked.failure._tag).toBe('Locked')
    expect(Result.isFailure(splitService(base, { name: 'X', owner: 'core', features: [] }))).toBe(
      true,
    )
    expect(
      Result.isFailure(splitService(base, { name: 'X', owner: 'ghost', features: ['checkout'] })),
    ).toBe(true)
  })

  test('an old save opens on one Service, owned by the first team, with no Features named', () => {
    const saved = JSON.parse(JSON.stringify(newGame(3))) as Record<string, never>
    for (const service of saved.services as unknown as Array<Record<string, unknown>>) {
      delete service.owner
      delete service.features
      delete service.datastore
    }
    const game = Schema.decodeUnknownSync(Game)(saved)
    expect(game.services).toHaveLength(1)
    expect(game.services[0]).toMatchObject({
      id: 'monolith',
      owner: 'core',
      features: [],
      datastore: null,
    })
    expect(serviceOfFeature(game, 'checkout').id).toBe('monolith')
  })
})

describe('Ownership', () => {
  test('a Service is fixed by its owner, and its owner is who is paged', () => {
    const next = split(seriesB(), ['checkout'])
    const made = next.services[1]!
    expect(ownerOf(next, made).id).toBe('payments')
    const feature = { id: 1, kind: 'feature' as const, ref: 'checkout', cost: 320, spent: 0 }
    const other = { id: 2, kind: 'task' as const, ref: 'refactor', cost: 10, spent: 0 }
    expect(worksOn(next, team('payments', 'Payments'), feature)).toBe(true)
    expect(worksOn(next, CORE_TEAM, feature)).toBe(false)
    expect(worksOn(next, CORE_TEAM, other)).toBe(true)
    // A team that owns no Service helps on the starting one rather than idling.
    const third = team('growth', 'Growth')
    expect(worksOn(next, third, other)).toBe(true)
    expect(pagedTeam({ ...next, incident: incident({ service: 'service-2' }) }).id).toBe('payments')
  })

  test('a team with no Service keeps working on the starting one', () => {
    const game = { ...seriesB(), teams: [CORE_TEAM, team('growth', 'Growth')] }
    const item = { id: 1, kind: 'feature' as const, ref: 'checkout', cost: 320, spent: 0 }
    expect(worksOn(game, team('growth', 'Growth'), item)).toBe(true)
    expect(worksOn(game, CORE_TEAM, item)).toBe(true)
  })
})

describe('Blast radius', () => {
  test('a bad deploy fails only the traffic of the Service that shipped it', () => {
    const next = split(seriesB(), ['checkout'])
    const broke: Board = {
      ...withServiceId({ ...next, incident: incident({ service: 'service-2' }) }, 'service-2', {
        lastDeploy: ['checkout'],
      }),
    }
    // Checkout moved to the Payments Service: its `buy` breaks, the monolith's `login` does not.
    expect(serviceOfKind(broke, 'buy').id).toBe('service-2')
    expect(serviceOfKind(broke, 'login').id).toBe('monolith')
    expect(failsKind(broke, 'buy')).toBe(true)
    expect(failsKind(broke, 'login')).toBe(false)
    const server = broke.nodes.find((node) => node.id === 'server')!
    const share = badDeployShareOf(broke, broke.services[1]!)
    expect(share).toBeCloseTo(0.08, 9)
    expect(codeCrashes(broke, server, 'buy')).toBeCloseTo(share, 9)
    expect(codeCrashes(broke, server, 'login')).toBe(0)
  })

  test('with one Service, a bad deploy still breaks every kind, as an old save did', () => {
    const broke: Board = {
      ...withServiceId({ ...seriesB(), incident: incident({ service: 'monolith' }) }, 'monolith', {
        lastDeploy: ['checkout'],
      }),
    }
    expect(failsKind(broke, 'buy')).toBe(true)
    expect(failsKind(broke, 'login')).toBe(true)
  })
})

describe('the shared-database penalty', () => {
  const dh = (game: Board): number =>
    teamOutputs(game, { velocity: 1 } as never).reduce((sum, entry) => sum + entry.rate, 0)

  /** Three engineers on each team, so the coordination penalty has a headcount to bite. */
  const staffed = (game: Board): Board => ({
    ...game,
    engineers: game.teams.flatMap((entry) =>
      [0, 1, 2].map((index) => ({
        id: `${entry.id}-${index}`,
        team: entry.id,
        language: 'php' as const,
        hiredAt: Number.MIN_SAFE_INTEGER,
      })),
    ),
  })

  test('two Services on one Database keep half the coordination penalty', () => {
    const next = staffed(split(seriesB(), ['checkout']))
    expect(sharesDatabase(next, next.services[0]!)).toBe(true)
    expect(sharesDatabase(next, next.services[1]!)).toBe(true)
    const together = dh(next)
    // Give the new Service its own Database Node: the penalty goes.
    const own: Board = withServiceId(next, 'service-2', {
      datastore: 'database-2',
    })
    expect(sharesDatabase(own, own.services[1]!)).toBe(false)
    expect(dh(own)).toBeGreaterThan(together)
  })

  test('one Service on one Database pays nothing extra', () => {
    const alone = seriesB()
    expect(sharesDatabase(alone, alone.services[0]!)).toBe(false)
  })
})
