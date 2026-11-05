import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from './actions.ts'
import type { Action } from './actions.ts'
import { ON_CALL_ACK, SRE_MTTR } from './catalog.ts'
import { link, node, preseedGame } from './company.ts'
import { forceIncident, incidentDuration, runbookCovers } from './director.ts'
import { openActionWeight } from './founding.ts'
import { sreStaffed } from './lookups.ts'
import { budgetOf, slaCreditsOf } from './slo.ts'
import { solve } from './solve.ts'
import { DEFAULT_FOUNDING, NEW_ENGINEER, type Game, type Team } from './state.ts'
import { step } from './step.ts'
import { advanceTeam, queueRunbook, runbookRefusal } from './work.ts'

/* The incident loop (11 "The incident loop", "Runbooks", "SLA credits", 08 "Teams"). */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

/** A Pre-seed Company that has researched Alerting, so the pager is its first signal. */
const board = (change: Partial<Game> = {}): Game => {
  const base = preseedGame(7)
  return { ...base, researched: [...base.researched, 'alerting'], ...change }
}

/** A pre-seed instance failure: the only App Server dies, so every request fails. */
const instance = (game: Game): Game => {
  const started = forceIncident(game, solve(game), 'instance', 'server')
  if (!started) throw new Error('no instance failure')
  return started
}

describe('the three times', () => {
  test('an Incident records its signal, its acknowledgement, and its MTTR', () => {
    const started = instance(board())
    expect(started.incident?.signalAt).toBeNull()
    expect(started.incident?.ackAt).toBeNull()
    // One second in, the requests fail and the pager fires: the first signal lands.
    const signalled = step(started, 1).game
    expect(signalled.incident?.signalAt).toBe(started.time + 1)
    expect(signalled.incident?.ackAt).toBeNull()
    // The player acts two seconds later, which acknowledges it.
    const acked = Actions.acknowledge(step(signalled, 2).game)
    expect(acked.incident?.ackAt).toBe(started.time + 3)
    // Run it out: the postmortem keeps all three times.
    const over = step(acked, 200).game
    const postmortem = over.postmortems.find((entry) => entry.kind === 'instance')
    expect(postmortem).toBeDefined()
    expect(postmortem?.mttd).toBe(1)
    expect(postmortem?.mtta).toBe(2)
    expect(postmortem?.mttr).toBeGreaterThan(0)
    expect(postmortem?.duration).toBeGreaterThanOrEqual(postmortem?.mttr ?? 0)
  })

  test('without Alerting the board is the signal, and it lands when requests fail', () => {
    const plain = preseedGame(7)
    const started = instance(plain)
    expect(step(started, 1).game.incident?.signalAt).toBe(started.time + 1)
  })
})

describe('on-call', () => {
  test('the rotation acknowledges the page before the player would', () => {
    const staffed = board({ researched: [...board().researched, 'on-call'] })
    const started = instance(staffed)
    const signalled = step(started, 1).game
    expect(signalled.incident?.ackAt).toBeNull()
    const answered = step(signalled, ON_CALL_ACK).game
    expect(answered.incident?.ackAt).toBe((answered.incident?.signalAt ?? 0) + ON_CALL_ACK)
    // Without it, nobody acknowledges until the player acts, and that is later.
    const manual = step(step(instance(board()), 1).game, ON_CALL_ACK * 2).game
    expect(manual.incident?.ackAt).toBeNull()
    const acted = Actions.acknowledge(manual)
    expect((acted.incident?.ackAt ?? 0) - (acted.incident?.signalAt ?? 0)).toBeGreaterThan(
      ON_CALL_ACK,
    )
  })
})

describe('runbooks', () => {
  test('a runbook resolves its incident kind with no player action', () => {
    const written = board({ handled: ['instance'], runbooks: ['instance'] })
    expect(runbookCovers(written, 'instance')).toBe(true)
    const over = step(instance(written), 1).game
    expect(over.incident).toBeNull()
    const postmortem = over.postmortems.at(-1)
    expect(postmortem?.kind).toBe('instance')
    expect(postmortem?.auto).toBe(true)
    // The Node the Incident took down is back, because the runbook ended it.
    expect(over.nodes.find((entry) => entry.id === 'server')?.life._tag).not.toBe('Stopped')
  })

  test('the task writes one runbook, for a kind the team has handled by hand', () => {
    const team: Team = {
      id: 'sre',
      name: 'SRE',
      kind: 'sre',
      policy: 'balanced',
      previous: 'balanced',
      since: 0,
    }
    const hired = {
      id: 'e1',
      team: 'sre',
      language: 'php' as const,
      hiredAt: 0,
      ...NEW_ENGINEER,
    }
    const game = board({
      stage: 3,
      researched: [...board().researched, 'runbooks', 'sre-team'],
      handled: ['instance'],
      teams: [board().teams[0] as Team, team],
      engineers: [hired],
    })
    expect(runbookRefusal(game, 'leak')?._tag).toBe('NotAllowed')
    // A drill tests the team, and a breach has no response to automate.
    expect(runbookRefusal({ ...game, handled: ['dr-drill', 'breach'] }, 'dr-drill')?._tag).toBe(
      'NotAllowed',
    )
    expect(runbookRefusal({ ...game, handled: ['breach'] }, 'breach')?._tag).toBe('NotAllowed')
    expect(runbookRefusal(game, 'instance')).toBeNull()
    expect(Result.isSuccess(queueRunbook(game, 'instance'))).toBe(true)
    // Dev Hours finish it: the runbook is written, and the kind resolves by itself from now on.
    const queued = ok(queueRunbook(game, 'instance'))
    const item = queued.backlog.at(-1)
    const built = advanceTeam(
      { ...queued, backlog: [{ ...item!, spent: item!.cost }] },
      solve(queued),
      1,
    ).game
    expect(built.runbooks).toEqual(['instance'])
  })
})

describe('the SRE team', () => {
  const staffed = (game: Game): Game => ({
    ...game,
    stage: 3,
    teams: [
      game.teams[0] as Team,
      { id: 'sre', name: 'SRE', kind: 'sre', policy: 'balanced', previous: 'balanced', since: 0 },
    ],
    engineers: [{ id: 'e1', team: 'sre', language: 'php', hiredAt: 0, ...NEW_ENGINEER }],
  })

  test('it holds the pager once someone is on it', () => {
    const plain = board()
    expect(sreStaffed(plain)).toBe(false)
    const team = staffed(plain)
    expect(sreStaffed(team)).toBe(true)
    expect(sreStaffed({ ...team, engineers: [] })).toBe(false)
  })

  test('it restores service 40% faster, so an incident runs 60% as long', () => {
    const plain = board({ stage: 3 })
    const team = staffed(plain)
    expect(incidentDuration(team, 'instance')).toBeCloseTo(
      incidentDuration(plain, 'instance') * (1 - SRE_MTTR),
      6,
    )
  })

  test('it halves what an open action item adds to an incident’s odds', () => {
    const open = board({ openActions: ['health-checks'] })
    expect(openActionWeight(open)).toBe(2)
    expect(openActionWeight(staffed(open))).toBe(1.5)
  })
})

describe('draining a Node', () => {
  /** Two App Servers behind a Load Balancer, and a Queue holding a backlog behind the first. */
  const pair = (): Game => {
    const base = preseedGame(7)
    return {
      ...base,
      sandbox: true,
      researched: [...base.researched, 'health-checks'],
      nodes: [
        node('users', 'users', 120, 280),
        node('lb', 'lb', 320, 280),
        node('a', 'server', 520, 200, { size: 2, runtime: 'php_fpm', workers: 16 }),
        node('b', 'server', 520, 360, { size: 2, runtime: 'php_fpm', workers: 16 }),
        node('queue', 'queue', 760, 200, { depth: 4 }),
        node('worker', 'worker', 960, 200, { prefetch: 1 }),
      ],
      links: [
        link('users', 'lb'),
        link('lb', 'a'),
        link('lb', 'b'),
        link('a', 'queue'),
        link('queue', 'worker'),
      ],
    }
  }

  test('it refuses without Health checks, and takes no new traffic', () => {
    const game = pair()
    expect(Result.isFailure(Actions.drain({ ...game, researched: [] }, 'a'))).toBe(true)
    const before = solve(game)
    const drained = ok(Actions.drain(game, 'a'))
    expect(drained.nodes.find((entry) => entry.id === 'a')?.draining).toBe(true)
    const after = solve(drained)
    expect(after.nodes.a?.inbound).toBe(0)
    // The traffic it carried goes to the other server, which now carries all of it.
    const carried = (before.nodes.a?.inbound ?? 0) + (before.nodes.b?.inbound ?? 0)
    expect(after.nodes.b?.inbound).toBeCloseTo(carried, 6)
  })

  test('it finishes the work it holds, then rejoins the rotation', () => {
    const game = pair()
    const drained = ok(Actions.drain(game, 'queue'))
    const first = step(drained, 1).game
    // The backlog is finished while it is out of rotation: its Workers keep taking from it.
    expect(first.nodes.find((entry) => entry.id === 'queue')?.depth).toBe(0)
    expect(first.nodes.find((entry) => entry.id === 'queue')?.draining).toBe(true)
    const rejoined = step(first, 10).game
    expect(rejoined.nodes.find((entry) => entry.id === 'queue')?.draining).toBe(false)
  })

  test('draining the Node an Incident hit ends the Incident with it', () => {
    // A leak runs on the box without stopping it, so it can be drained out from under the Incident.
    const base = preseedGame(7)
    const leaking: Game = {
      ...base,
      researched: [...base.researched, 'alerting', 'health-checks', 'lang-node'],
      nodes: base.nodes.map((entry) =>
        entry.id === 'server' ? { ...entry, runtime: 'node' as const } : entry,
      ),
    }
    const started = forceIncident(leaking, solve(leaking), 'leak')
    if (!started) throw new Error('no leak')
    expect(started.incident?.nodeId).toBe('server')
    const drained = ok(Actions.drain(started, 'server'))
    expect(drained.incident?.remaining ?? 0).toBeLessThan(started.incident?.remaining ?? 0)
  })
})

describe('SLA credits', () => {
  /** A Series B B2B SaaS that has shipped paid plans, and a week whose availability missed. */
  const saas = (change: Partial<Game> = {}): Game => {
    const base = preseedGame(7)
    return {
      ...base,
      stage: 4,
      founding: { ...DEFAULT_FOUNDING, venture: 'b2b-saas' },
      researched: [...base.researched, 'enterprise-sales'],
      shipped: ['paid-plans'],
      budget: [{ hour: 0, requests: 10_000, failed: 500, users: base.users }],
      ...change,
    }
  }

  test('a missed week pays subscription revenue back to customers', () => {
    const game = saas()
    expect(budgetOf(game).availability).toBeLessThan(budgetOf(game).slo)
    const credit = slaCreditsOf(game, solve(game))
    expect(credit).toBeGreaterThan(0)
    // It leaves the bank: the same second costs the Burn plus the credit.
    const paid = step(game, 1).game
    const unsold: Game = {
      ...game,
      researched: game.researched.filter((id) => id !== 'enterprise-sales'),
    }
    const without = step(unsold, 1).game
    expect(without.cash - paid.cash).toBeCloseTo(credit, 6)
  })

  test('a Venture without an SLA pays nothing, and neither does a week that met it', () => {
    const fintech = saas({ founding: { ...DEFAULT_FOUNDING, venture: 'fintech' } })
    expect(slaCreditsOf(fintech, solve(fintech))).toBe(0)
    const met = saas({ budget: [{ hour: 0, requests: 10_000, failed: 0, users: 1_050 }] })
    expect(slaCreditsOf(met, solve(met))).toBe(0)
    const early = saas({ stage: 3 })
    expect(slaCreditsOf(early, solve(early))).toBe(0)
  })
})
