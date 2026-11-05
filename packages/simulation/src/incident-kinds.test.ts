import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from './actions.ts'
import type { Action } from './actions.ts'
import {
  CLOCK_SKEW_MS,
  DELETE_CHURN,
  ERAS,
  INCIDENTS,
  SUPPLY_CHAIN_CHURN,
  type IncidentId,
} from './catalog.ts'
import { speedOf } from './capacity.ts'
import { link, node, preseedGame } from './company.ts'
import { forceIncident, leftAlone, weaknessOf } from './director.ts'
import save from './fixtures/save-v2-m3.json' with { type: 'json' }
import { isDown } from './lookups.ts'
import { solve } from './solve.ts'
import { Game, type Game as Board } from './state.ts'
import { step } from './step.ts'

/*
 * The six incident kinds 11's catalog names by hand, and the cascades one left alone starts
 * (11 "Catalog", "One at a time, early"). Each test names the trigger, the effect, and the
 * mitigation or action item the design gives that kind.
 */

const ok = (action: Action): Board => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const founded = (game: Board, researched: ReadonlyArray<Board['researched'][number]>): Board => ({
  ...game,
  researched: [...new Set([...game.researched, ...researched])],
  // The director stays out of these boards: each test starts its own incident.
  nextIncidentAt: Number.MAX_SAFE_INTEGER,
})

/** The target Node of the running incident, or a failure. */
const targetOf = (game: Board): NonNullable<Board['nodes'][number]> => {
  const node = game.nodes.find((entry) => entry.id === game.incident?.nodeId)
  if (!node) throw new Error('the incident has no target')
  return node
}

/** Runs the incident out on its clock and returns the Game with its postmortem filed. */
const runOut = (game: Board, seconds = 400): Board => step(game, seconds).game

test('every kind can start in the Era it ships in: none is more severe than that Era allows', () => {
  const kinds: ReadonlyArray<IncidentId> = [
    'jvm-warmup',
    'migration-lock',
    'supply-chain',
    'accidental-delete',
    'operator-typo',
    'leap-second',
  ]
  for (const kind of kinds) {
    const def = INCIDENTS[kind]
    const cap = ERAS[def.era]?.maxSeverity
    expect([kind, def.severity >= (cap ?? 3)]).toEqual([kind, true])
  }
})

/* ---------- JVM warmup under load ---------- */

describe('JVM warmup under load', () => {
  /** A Seed Company on Java: an App Server an Autoscaler can add cold copies to. */
  const java = (change: Partial<Board> = {}): Board => {
    const base = founded(preseedGame(7), ['lang-java', 'autoscaling'])
    return {
      ...base,
      stage: 2,
      nodes: [
        node('users', 'users', 120, 280),
        node('lb', 'lb', 320, 280),
        node('server', 'server', 520, 220, { size: 2, runtime: 'tomcat' }),
        node('scaler', 'autoscaler', 520, 400, { minCopies: 1, maxCopies: 4 }),
        node('database', 'database', 760, 280),
      ],
      links: [
        link('users', 'lb'),
        link('lb', 'server'),
        link('server', 'database'),
        link('server', 'scaler'),
      ],
      ...change,
    }
  }

  test('scaling up Java during a spike is the trigger, and needs an App Server to hit', () => {
    const game = java()
    expect(weaknessOf(game, solve(game), 'jvm-warmup')).toBeGreaterThan(0)
    // No Java App Server, nothing to warm up.
    const php: Board = {
      ...game,
      nodes: game.nodes.map((entry) =>
        entry.id === 'server' ? { ...entry, runtime: 'php_fpm' as const } : entry,
      ),
    }
    expect(weaknessOf(php, solve(php), 'jvm-warmup')).toBe(0)
    const started = forceIncident(game, solve(game), 'jvm-warmup')
    expect(started?.incident?.kind).toBe('jvm-warmup')
    expect(started && started.incident?.severity).toBe(3)
    expect(started && targetOf(started).runtime).toBe('tomcat')
  })

  test('new copies make p99 worse: the Node answers at its cold speed for 30 s', () => {
    const game = java()
    const warm = game.nodes.find((entry) => entry.id === 'server')
    if (!warm) throw new Error('missing the App Server')
    const before = speedOf(game, warm)
    const started = forceIncident(game, solve(game), 'jvm-warmup')
    if (!started) throw new Error('no JVM warmup')
    const cold = speedOf(started, targetOf(started))
    expect(cold).toBeLessThan(before)
    // The cold speed is the runtime's own warm-up floor, not a new number.
    expect(cold / before).toBeCloseTo(0.3 / (0.3 + 0.7 * 1), 6)
    // 30 s later it is over and the Node runs warm again.
    const over = step(started, 31).game
    expect(over.incident).toBeNull()
    const after = over.nodes.find((entry) => entry.id === 'server')
    expect(after && speedOf(over, after)).toBeCloseTo(before, 6)
  })

  test('its action item is the native image, for a Company that owns Java', () => {
    const game = { ...java(), stage: 4 }
    const over = runOut(forceIncident(game, solve(game), 'jvm-warmup') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'jvm-warmup')
    expect(postmortem?.action).toBe('graal-native')
  })
})

/* ---------- Schema migration lock ---------- */

describe('schema migration lock', () => {
  const seriesA = (change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), ['query-analysis']),
      stage: 3,
      users: 20_000,
      ...change,
    }) as Board

  test('an ALTER TABLE on a big table is the trigger, and writes time out', () => {
    const game = seriesA()
    expect(weaknessOf(game, solve(game), 'migration-lock')).toBeGreaterThan(0)
    const before = solve(game)
    const started = forceIncident(game, solve(game), 'migration-lock')
    if (!started) throw new Error('no migration lock')
    expect(targetOf(started).type).toBe('database')
    const after = solve(started)
    // Writes queue behind the lock and time out; reads do not.
    expect(after.kinds.write?.success ?? 1).toBe(0)
    expect(after.errors.timeout).toBeGreaterThan(before.errors.timeout)
    expect(after.kinds.read?.success ?? 0).toBeGreaterThan(0.05)
  })

  test('cancelling the migration ends it, and the lock goes with it', () => {
    const started = forceIncident(seriesA(), solve(seriesA()), 'migration-lock')
    if (!started) throw new Error('no migration lock')
    const cancelled = ok(Actions.cancelMigration(started))
    // The response is the player's answer, so this run is not one left alone to cascade.
    expect(cancelled.incident?.ackAt).not.toBeNull()
    expect(cancelled.incident?.remaining).toBe(0)
    const over = step(cancelled, 1).game
    expect(over.incident).toBeNull()
    expect(solve(over).kinds.write?.success ?? 0).toBeGreaterThan(0)
  })

  test('its action item is online schema migrations', () => {
    const game = seriesA()
    const over = runOut(forceIncident(game, solve(game), 'migration-lock') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'migration-lock')
    expect(postmortem?.action).toBe('online-migrations')
  })
})

/* ---------- Supply-chain compromise ---------- */

describe('supply-chain compromise', () => {
  const compromised = (change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), ['lang-node', 'ci']),
      stage: 4,
      users: 20_000,
      ...change,
    }) as Board

  test('a malicious package version is the trigger, and the reputation falls at once', () => {
    const game = compromised()
    expect(weaknessOf(game, solve(game), 'supply-chain')).toBeGreaterThan(0)
    const started = forceIncident(game, solve(game), 'supply-chain')
    if (!started) throw new Error('no supply-chain compromise')
    expect(targetOf(started).type).toBe('server')
    expect(started.users).toBe(game.users - Math.floor(game.users * SUPPLY_CHAIN_CHURN))
    expect(started.incident?.severity).toBe(1)
  })

  test('pinning and redeploying ends it, and the postmortem counts the users', () => {
    const game = compromised()
    const started = forceIncident(game, solve(game), 'supply-chain')
    if (!started) throw new Error('no supply-chain compromise')
    const pinned = ok(Actions.pinAndRedeploy(started))
    expect(pinned.incident?.remaining).toBe(0)
    const over = step(pinned, 1).game
    expect(over.incident).toBeNull()
    const postmortem = over.postmortems.find((entry) => entry.kind === 'supply-chain')
    expect(postmortem?.lostUsers).toBeGreaterThan(0)
  })

  test('its action item is dependency scanning', () => {
    const game = compromised()
    const over = runOut(forceIncident(game, solve(game), 'supply-chain') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'supply-chain')
    expect(postmortem?.action).toBe('dependency-scanning')
  })
})

/* ---------- Accidental delete ---------- */

describe('accidental delete', () => {
  const deleting = (backup: Board['nodes'][number]['backup'], change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), []),
      stage: 4,
      users: 200_000,
      nodes: preseedGame(7).nodes.map((entry) =>
        entry.type === 'database' ? { ...entry, backup, restore: 'ok' as const } : entry,
      ),
      ...change,
    }) as Board

  test('dropping a table takes reads and writes with it', () => {
    const game = deleting('pitr')
    expect(weaknessOf(game, solve(game), 'accidental-delete')).toBeGreaterThan(0)
    const before = solve(game)
    const started = forceIncident(game, solve(game), 'accidental-delete')
    if (!started) throw new Error('no accidental delete')
    expect(targetOf(started).type).toBe('database')
    const after = solve(started)
    expect(after.kinds.read?.success ?? 1).toBeLessThan(before.kinds.read?.success ?? 0)
    expect(after.errors.refused).toBeGreaterThan(0)
    // A backup makes the restore likely, so the Design has less to fear.
    expect(weaknessOf(game, solve(game), 'accidental-delete')).toBeLessThan(
      weaknessOf(deleting('none'), solve(deleting('none')), 'accidental-delete'),
    )
  })

  test('restoring from a good backup ends it with no users lost', () => {
    const started = forceIncident(deleting('pitr'), solve(deleting('pitr')), 'accidental-delete')
    if (!started) throw new Error('no accidental delete')
    const restored = ok(Actions.restoreBackup(started))
    expect(restored.users).toBe(started.users)
    expect(restored.incident?.remaining).toBe(0)
    expect(step(restored, 1).game.incident).toBeNull()
  })

  test('no backup, or a broken one, restores nothing: the users go with the table', () => {
    for (const backup of ['none', 'nightly'] as const) {
      const game = deleting(backup)
      const broken: Board =
        backup === 'nightly'
          ? {
              ...game,
              nodes: game.nodes.map((entry) => ({ ...entry, restore: 'failed' as const })),
            }
          : game
      const started = forceIncident(broken, solve(broken), 'accidental-delete')
      if (!started) throw new Error('no accidental delete')
      const restored = ok(Actions.restoreBackup(started))
      expect(restored.users).toBe(Math.max(1, Math.floor(started.users * (1 - DELETE_CHURN))))
    }
  })

  test('its action item is point-in-time recovery', () => {
    const game = deleting('none')
    const over = runOut(forceIncident(game, solve(game), 'accidental-delete') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'accidental-delete')
    expect(postmortem?.action).toBe('pitr')
  })
})

/* ---------- Operator typo ---------- */

describe('operator typo', () => {
  const typo = (change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), ['replication', 'multi-region']),
      stage: 5,
      users: 2_000_000,
      ...change,
    }) as Board

  test('a command that removes more capacity than intended takes the data Component down', () => {
    const game = typo()
    expect(weaknessOf(game, solve(game), 'operator-typo')).toBeGreaterThan(0)
    const started = forceIncident(game, solve(game), 'operator-typo')
    if (!started) throw new Error('no operator typo')
    const database = targetOf(started)
    expect(database.type).toBe('database')
    expect(isDown(database)).toBe(true)
    expect(solve(started).kinds.write?.success ?? 1).toBe(0)
  })

  test('re-adding capacity ends it: a Node of the Component serves again', () => {
    const started = forceIncident(typo(), solve(typo()), 'operator-typo')
    if (!started) throw new Error('no operator typo')
    const restored = ok(Actions.place({ ...started, cash: 1e9 }, 'database', 900, 400))
    const over = step(restored, 1).game
    expect(over.incident).toBeNull()
    expect(over.postmortems.some((entry) => entry.kind === 'operator-typo')).toBe(true)
  })

  test('its action item is infrastructure as code', () => {
    const game = typo()
    const over = runOut(forceIncident(game, solve(game), 'operator-typo') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'operator-typo')
    expect(postmortem?.action).toBe('infra-as-code')
  })
})

/* ---------- Leap second or clock skew ---------- */

describe('leap second or clock skew', () => {
  const skidding = (change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), ['replication', 'alerting']),
      stage: 5,
      users: 2_000_000,
      ...change,
    }) as Board

  test('a clock that jumps times out requests across the region', () => {
    const game = skidding()
    expect(weaknessOf(game, solve(game), 'leap-second')).toBeGreaterThan(0)
    const before = solve(game)
    const started = forceIncident(game, solve(game), 'leap-second')
    if (!started) throw new Error('no leap second')
    expect(started.incident?.region).toBe('na')
    const after = solve(started)
    expect(after.errors.timeout).toBeGreaterThan(before.errors.timeout)
    expect(after.p99).toBeGreaterThan(before.p99)
    expect(after.p99 - before.p99).toBeGreaterThanOrEqual(CLOCK_SKEW_MS)
  })

  test('restarting the affected Nodes ends it', () => {
    const started = forceIncident(skidding(), solve(skidding()), 'leap-second')
    if (!started) throw new Error('no leap second')
    const restarted = ok(Actions.restartClocks(started))
    expect(restarted.incident?.remaining).toBe(0)
    expect(step(restarted, 1).game.incident).toBeNull()
  })

  test('its action item is leap smearing', () => {
    const game = skidding()
    const over = runOut(forceIncident(game, solve(game), 'leap-second') ?? game)
    const postmortem = over.postmortems.find((entry) => entry.kind === 'leap-second')
    expect(postmortem?.action).toBe('leap-smearing')
  })
})

/* ---------- Cascades ---------- */

describe('cascades', () => {
  /** A Series A Company with a Database that a slow query can turn into a retry storm. */
  const seriesA = (change: Partial<Board> = {}): Board =>
    ({
      ...founded(preseedGame(7), ['query-analysis', 'timeouts']),
      stage: 3,
      users: 20_000,
      nodes: preseedGame(7).nodes.map((entry) =>
        entry.id === 'server' ? { ...entry, runtime: 'php_fpm' as const } : entry,
      ),
      links: preseedGame(7).links.map((entry) =>
        entry.to === 'database' ? { ...entry, retries: 'naive' as const } : entry,
      ),
      ...change,
    }) as Board

  test('an incident nobody answers starts the next one after it, and records the cause', () => {
    const game = seriesA()
    const started = forceIncident(game, solve(game), 'slow-query')
    if (!started) throw new Error('no slow query')
    expect(leftAlone(started.incident!)).toBe(false)
    const over = runOut(started, 10)
    // One at a time: the cause has ended before its effect begins.
    expect(over.postmortems.at(-1)?.kind).toBe('slow-query')
    expect(over.incident?.kind).toBe('retry-storm')
    expect(over.incident?.causedBy).toBe('slow-query')
  })

  test('one the player acknowledged, or one before Series A, starts nothing', () => {
    const answered = Actions.acknowledge(
      forceIncident(seriesA(), solve(seriesA()), 'slow-query') ?? seriesA(),
    )
    expect(answered.incident?.ackAt).not.toBeNull()
    const quiet = runOut(answered, 10)
    expect(quiet.incident).toBeNull()

    // Before Series A an incident keeps its playtest duration, and cascades are not possible.
    const early = seriesA({ stage: 2 })
    const raised = forceIncident(early, solve(early), 'slow-query')
    if (!raised) throw new Error('no slow query')
    const aged = runOut(raised, 400)
    expect(aged.incident).toBeNull()
    expect(aged.postmortems.map((entry) => entry.kind)).toEqual(['slow-query'])
  })

  test('a chain stops after one hop: a cascade never starts another', () => {
    const first = forceIncident(seriesA(), solve(seriesA()), 'slow-query')
    if (!first) throw new Error('no slow query')
    const cascade = runOut(first, 10)
    expect(cascade.incident?.causedBy).toBe('slow-query')
    expect(leftAlone(cascade.incident!)).toBe(false)
    // A chain stops after one hop: the cascaded incident starts nothing, so it just ends.
    const chain = runOut(cascade, 400)
    expect(chain.incident).toBeNull()
    const retryStorm = chain.postmortems.find((entry) => entry.kind === 'retry-storm')
    expect(retryStorm?.causedBy).toBe('slow-query')
    expect(chain.postmortems.map((entry) => entry.kind)).not.toContain('connections')
    // The cascade held the director's clock: the next incident waits its own gap.
    expect(chain.nextIncidentAt).toBeGreaterThan(chain.time)
  })
})

/* ---------- An old save ---------- */

describe('an old save', () => {
  test('opens with no cascade on record, and steps', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.incident).toBeNull()
    expect(game.postmortems.every((entry) => entry.causedBy === null)).toBe(true)
    const stepped = step(game, 1).game
    expect(stepped.time).toBeGreaterThan(game.time)
  })
})
