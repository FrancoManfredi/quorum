import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { place, renewCertificate, study, phished, type Action } from './actions.ts'
import { CERT_DAYS, CERT_DAYS_SHORT, CERT_RENEW, RESEARCH } from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { certLeftOf, certLifeOf, researchReady } from './lookups.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'
import { LIVE_TUNING } from './catalog.ts'

/*
 * Secrets and Certificates (05 "Secrets and Certificates", 11 "Certificate expired"): the Node
 * holds the TLS certificate and renews it. Without it live, the certificate runs out on the
 * calendar and every browser refuses the site.
 */

const rich = (game: Board): Board => ({ ...game, cash: 1e9, insight: 1e9 })

const ok = (action: Action): Board => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const tune = (game: Board, id: string, change: Partial<GameNode>): Board => ({
  ...game,
  nodes: game.nodes.map((node) => (node.id === id ? { ...node, ...change } : node)),
})

/** A Seed Company with a secrets manager, and no director incidents to confuse the count. */
const managedBoard = (): Board => {
  const base: Board = {
    ...rich(preseedGame()),
    stage: 2,
    nextIncidentAt: Number.MAX_SAFE_INTEGER,
    researched: [...preseedGame().researched, 'cert-automation'],
  }
  return ok(place(base, 'pki', 1_040, 640))
}

const managerOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'pki')
  if (!node) throw new Error('Missing Secrets and Certificates')
  return node
}

/** Sim seconds a certificate lasts in this Era, on the Team's calendar. */
const lifeOf = (game: Board): number => certLifeOf(game, LIVE_TUNING)

describe('Secrets and Certificates', () => {
  test('a certificate lasts 90 calendar days, and 45 from Series C', () => {
    const seed = managedBoard()
    expect(lifeOf(seed)).toBe((CERT_DAYS * 1_440) / LIVE_TUNING.calendarPace)
    const seriesC: Board = { ...seed, stage: 5 }
    expect(lifeOf(seriesC)).toBe((CERT_DAYS_SHORT * 1_440) / LIVE_TUNING.calendarPace)
    expect(lifeOf(seriesC)).toBe(lifeOf(seed) / 2)
  })

  test('issues the certificate, then renews it two thirds of the way through', () => {
    const game = managedBoard()
    expect(game.certificate ?? null).toBe(null)
    const issued = step(game, 1).game
    expect(issued.certificate).toBe(issued.time)
    const life = lifeOf(issued)
    // Nothing renews before the renewal point: the same certificate is still in place.
    const early: Board = { ...issued, time: issued.time + life * 0.5 }
    expect(step(early, 1).game.certificate).toBe(issued.certificate)
    // Two thirds in, the manager renews it without the player doing anything.
    const late: Board = { ...issued, time: (issued.certificate ?? 0) + life * CERT_RENEW }
    const renewed = step(late, 1).game
    expect(renewed.certificate).toBeGreaterThan(issued.certificate ?? 0)
    expect(renewed.incident).toBe(null)
  })

  test('an expired certificate takes the site down, and comes back when it is renewed', () => {
    const game = managedBoard()
    const issued = step(game, 1).game
    const life = lifeOf(issued)
    // The manager is sold: nothing renews the certificate it issued.
    const unmanaged: Board = {
      ...issued,
      nodes: issued.nodes.filter((node) => node.type !== 'pki'),
      links: issued.links.filter((edge) => edge.from !== managerOf(issued).id),
    }
    const before: Board = { ...unmanaged, time: unmanaged.time + life - 10 }
    expect(step(before, 1).game.incident).toBe(null)
    const after: Board = { ...unmanaged, time: unmanaged.time + life + 1 }
    const expired = step(after, 1).game
    expect(expired.incident?.kind).toBe('certificate')
    // Every browser refuses the site: the users' requests fail as down.
    expect(solve(expired).errors.down).toBeGreaterThan(0)
    expect(solve(unmanaged).errors.down ?? 0).toBeCloseTo(0, 9)
    // Pressing Renew issues it again, and the site comes back.
    const renewed = ok(renewCertificate(expired))
    expect(renewed.incident?.remaining).toBe(0)
    expect(renewed.certificate).toBe(renewed.time)
    const settled = step(renewed, 1).game
    expect(settled.incident).toBe(null)
    expect(certLeftOf(settled, LIVE_TUNING) ?? 0).toBeGreaterThan(life - 5)
  })

  test('an expired certificate starts again until something renews it', () => {
    const game = managedBoard()
    const issued = step(game, 1).game
    const unmanaged: Board = {
      ...issued,
      nodes: issued.nodes.filter((node) => node.type !== 'pki'),
      links: issued.links.filter((edge) => edge.from !== managerOf(issued).id),
      time: issued.time + lifeOf(issued) + 1,
    }
    const first = step(unmanaged, 1).game
    expect(first.incident?.kind).toBe('certificate')
    // The incident runs out, and the certificate is still expired: it starts again.
    const over: Board = { ...first, incident: null }
    expect(step(over, 1).game.incident?.kind).toBe('certificate')
  })

  test('a manager that is down renews nothing', () => {
    const game = managedBoard()
    const issued = step(game, 1).game
    const life = lifeOf(issued)
    const stopped: Board = {
      ...tune(issued, managerOf(issued).id, {
        life: { _tag: 'Restarting', left: 10_000, cause: 'failure', warm: 0 },
      } as Partial<GameNode>),
      time: issued.time + life + 1,
    }
    expect(step(stopped, 1).game.incident?.kind).toBe('certificate')
  })

  test('is placeable only with its research, and only from Seed', () => {
    expect(RESEARCH['cert-automation'].era).toBe(2)
    expect(Result.isFailure(place(rich(preseedGame()), 'pki', 240, 280))).toBe(true)
    const preseed: Board = rich(preseedGame())
    expect(researchReady(preseed, 'cert-automation')).toBe(false)
    expect(Result.isFailure(study(preseed, 'cert-automation'))).toBe(true)
    const seed: Board = { ...preseed, stage: 2 }
    expect(Result.isSuccess(study(seed, 'cert-automation'))).toBe(true)
    const owned: Board = { ...seed, researched: [...seed.researched, 'cert-automation'] }
    expect(ok(place(owned, 'pki', 240, 280)).nodes.some((node) => node.type === 'pki')).toBe(true)
  })

  test('Secrets management keeps the keys out of a phishing page’s reach', () => {
    expect(RESEARCH['secrets-management'].era).toBe(2)
    const seed: Board = { ...rich(preseedGame()), stage: 2, incident: null }
    expect(Result.isSuccess(phished(seed))).toBe(true)
    const vaulted: Board = { ...seed, researched: [...seed.researched, 'secrets-management'] }
    expect(Result.isFailure(phished(vaulted))).toBe(true)
    expect(vaulted.users).toBe(seed.users)
    // The research alone changes nothing about the certificate: it is not the Component.
    expect(vaulted.certificate ?? null).toBe(null)
  })
})

describe('an old save', () => {
  test('opens with no certificate tracked, and steps without one', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.certificate ?? null).toBe(null)
    expect(game.nodes.some((node) => node.type === 'pki')).toBe(false)
    expect(solve(game).revenue).toBeGreaterThan(0)
    const later = step(game, 1).game
    expect(later.certificate ?? null).toBe(null)
    expect(later.time).toBe(game.time + 1)
  })
})
