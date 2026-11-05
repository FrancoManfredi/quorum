import { describe, expect, test } from 'vitest'
import {
  challengeAchievements,
  countStats,
  detectAchievements,
  everyVenture,
  type Moment,
} from './achievements.ts'
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_IDS,
  FALLACY_IDS,
  FALLACY_INCIDENTS,
  MUTATOR_IDS,
  VENTURE_IDS,
} from './catalog.ts'
import { newGame } from './company.ts'
import { NO_FAILURES } from './distribution.ts'
import { StepEvent } from './events.ts'
import {
  completeChallenge,
  earnAchievements,
  emptyFounder,
  recordExit,
  toggleMutator,
  unlockVenture,
} from './founder.ts'
import type { Ledger } from './ledger.ts'
import { solveFlow } from './solve.ts'
import type { Game, GameNode, Incident, MigrationState, Postmortem, Sample } from './state.ts'
import { Result } from 'effect'

/* Achievements (14): each fires on its moment, not on a near miss, and never in a Sandbox. */

const base = newGame(7)
const ledgerOf = (game: Game, change: Partial<Ledger> = {}): Ledger => ({
  ...solveFlow(game),
  ...change,
})
const moment = (change: Partial<Moment> = {}): Moment => ({
  before: base,
  after: base,
  ledger: ledgerOf(base),
  events: [],
  stats: { postmortems: 0, terminations: 0, fallacies: [] },
  previousBottleneck: null,
  ...change,
})
const earned = (change: Partial<Moment>) => detectAchievements(moment(change), [])
const postmortem = (change: Partial<Postmortem>): Postmortem => ({
  id: 1,
  kind: 'instance',
  target: null,
  duration: 60,
  mttr: 30,
  mttd: null,
  mtta: null,
  lostUsers: 0,
  lostRevenue: 0,
  failed: 0,
  action: null,
  severity: 3,
  endedAt: 600,
  ...change,
})
const resolved = (change: Partial<Postmortem>) =>
  StepEvent.IncidentResolved({ postmortem: postmortem(change) })
const withNodes = (game: Game, nodes: ReadonlyArray<Partial<GameNode>>): Game => ({
  ...game,
  nodes: nodes.map((node, at) => ({ ...base.nodes[0]!, id: `n${at}`, ...node })),
})
const incident = (kind: Incident['kind'], change: Partial<Incident> = {}): Incident => ({
  kind,
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
  ...change,
})
const sample = (change: Partial<Sample> = {}): Sample => ({
  users: 0,
  demand: 0,
  served: 0,
  revenue: 0,
  burn: 0,
  cash: 0,
  latency: 0,
  p99: 0,
  apdex: 1,
  errors: 0,
  ...change,
})
const quiet = (ledger: Ledger, utilization: number): Ledger => ({
  ...ledger,
  nodes: Object.fromEntries(
    Object.entries(ledger.nodes).map(([id, node]) => [id, { ...node, utilization }]),
  ),
})
/** A ledger with one Node's entry borrowed from the starting server, so a check can read it. */
const nodeAt = (ledger: Ledger, id: string, change: Partial<Ledger['nodes'][string]>): Ledger => ({
  ...ledger,
  nodes: { ...ledger.nodes, [id]: { ...ledger.nodes['server']!, ...change } },
})
/** Four regions, each with its own Users Node, from Series C. */
const fourRegions = (nodes: ReadonlyArray<Partial<GameNode>> = []): Game =>
  withNodes({ ...base, stage: 5, users: 1_000 }, [
    { type: 'users', region: 'na' },
    { type: 'users', region: 'eu' },
    { type: 'users', region: 'apac' },
    { type: 'users', region: 'sa' },
    ...nodes,
  ])

describe('achievements', () => {
  test('every achievement has a name and a condition, and unlocks follow GDD 13/14', () => {
    for (const id of ACHIEVEMENT_IDS) expect(ACHIEVEMENTS[id].name.length).toBeGreaterThan(0)
    expect(ACHIEVEMENTS['default-alive'].unlocks?.venture).toBe('bootstrapped')
    expect(ACHIEVEMENTS['chaos-monkey'].unlocks?.mutator).toBe('chaos-monkey')
  })

  test('Hello, World needs a served request', () => {
    expect(earned({ ledger: ledgerOf(base, { served: 1 }) })).toContain('hello-world')
    expect(earned({ ledger: ledgerOf(base, { served: 0 }) })).not.toContain('hello-world')
  })

  test('a bad deploy, not a good one, is It Works on My Machine', () => {
    const bad = StepEvent.Deployed({ features: [], bad: true })
    const good = StepEvent.Deployed({ features: [], bad: false })
    expect(earned({ events: [bad] })).toContain('works-on-my-machine')
    expect(earned({ events: [good] })).not.toContain('works-on-my-machine')
  })

  test('Split Brain fires when the first database Node appears', () => {
    const before = withNodes(base, [{ type: 'server' }])
    const after = withNodes(base, [{ type: 'server' }, { type: 'database' }])
    expect(earned({ before, after })).toContain('split-brain')
    expect(earned({ before: after, after })).not.toContain('split-brain')
  })

  test('Metastable needs a retry storm resolved', () => {
    expect(earned({ events: [resolved({ kind: 'retry-storm' })] })).toContain('metastable')
    expect(earned({ events: [resolved({ kind: 'spike' })] })).not.toContain('metastable')
  })

  test('Polyglot needs five languages on compute Nodes', () => {
    const runtimes = ['php_fpm', 'puma', 'node', 'go', 'tokio'] as const
    const five = withNodes(
      base,
      runtimes.map((runtime) => ({ type: 'server' as const, runtime })),
    )
    const four = withNodes(
      base,
      runtimes.slice(0, 4).map((runtime) => ({ type: 'server' as const, runtime })),
    )
    expect(earned({ after: five })).toContain('polyglot')
    expect(earned({ after: four })).not.toContain('polyglot')
  })

  test('Hug of Death needs a ×10 spike resolved with no users lost', () => {
    const spiking = {
      ...base,
      incident: {
        kind: 'spike' as const,
        remaining: 1,
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
        magnitude: 10,
        zone: null,
        region: null,
      },
    }
    const clean = [resolved({ kind: 'spike', lostUsers: 0 })]
    expect(earned({ before: spiking, events: clean })).toContain('hug-of-death')
    expect(
      earned({ before: spiking, events: [resolved({ kind: 'spike', lostUsers: 5 })] }),
    ).not.toContain('hug-of-death')
    const small = { ...spiking, incident: { ...spiking.incident, magnitude: 3 } }
    expect(earned({ before: small, events: clean })).not.toContain('hug-of-death')
  })

  test('the counting achievements count across Companies', () => {
    const stats = countStats({ postmortems: 49, terminations: 99, fallacies: [] }, [
      resolved({ kind: 'instance' }),
    ])
    expect(stats).toEqual({ postmortems: 50, terminations: 100, fallacies: [] })
    expect(earned({ stats })).toEqual(expect.arrayContaining(['blameless', 'chaos-monkey']))
    expect(earned({ stats: { postmortems: 49, terminations: 99, fallacies: [] } })).not.toContain(
      'blameless',
    )
  })

  test('Two Hard Things needs a stale-read incident resolved', () => {
    expect(earned({ events: [resolved({ kind: 'stale-read' })] })).toContain('two-hard-things')
    expect(earned({ events: [resolved({ kind: 'stampede' })] })).not.toContain('two-hard-things')
  })

  test("Conway's Law needs more Services than teams, then a team for each", () => {
    const second = { ...base.teams[0]!, id: 't2', name: 'Team 2' }
    const services = [...base.services, { ...base.services[0]!, id: 'service-2', name: 'Search' }]
    const mismatched = { ...base, services }
    expect(
      earned({ before: mismatched, after: { ...mismatched, teams: [...base.teams, second] } }),
    ).toContain('conways-law')
    expect(earned({ before: mismatched, after: mismatched })).not.toContain('conways-law')
    expect(earned({ before: base, after: base })).not.toContain('conways-law')
  })

  test('Fallacies needs all eight fallacies, each broken by an incident', () => {
    expect(new Set(Object.values(FALLACY_INCIDENTS)).size).toBe(FALLACY_IDS.length)
    const seven = FALLACY_IDS.slice(0, 7)
    expect(earned({ stats: { postmortems: 0, terminations: 0, fallacies: seven } })).not.toContain(
      'fallacies',
    )
    expect(
      earned({ stats: { postmortems: 0, terminations: 0, fallacies: FALLACY_IDS } }),
    ).toContain('fallacies')
    const met = countStats({ postmortems: 0, terminations: 0, fallacies: [] }, [
      resolved({ kind: FALLACY_INCIDENTS.reliable }),
      resolved({ kind: FALLACY_INCIDENTS.administrator }),
      resolved({ kind: FALLACY_INCIDENTS.administrator }),
    ])
    expect(met.fallacies).toEqual(['reliable', 'administrator'])
  })

  test('Thundering Herd needs a reconnect storm resolved with no errors', () => {
    expect(earned({ events: [resolved({ kind: 'reconnect', failed: 0 })] })).toContain(
      'thundering-herd',
    )
    expect(earned({ events: [resolved({ kind: 'reconnect', failed: 5 })] })).not.toContain(
      'thundering-herd',
    )
    expect(earned({ events: [resolved({ kind: 'spike', failed: 0 })] })).not.toContain(
      'thundering-herd',
    )
  })

  test('Runbook needs a postmortem the Design ended on its own', () => {
    expect(earned({ events: [resolved({ kind: 'instance', auto: true })] })).toContain('runbook')
    expect(earned({ events: [resolved({ kind: 'instance' })] })).not.toContain('runbook')
  })

  test('FinOps needs reserved, on-demand, and spot compute at once', () => {
    const priced = (models: ReadonlyArray<GameNode['pricing']>): Game =>
      withNodes(
        base,
        models.map((pricing) => ({
          type: 'server' as const,
          pricing,
          pricingUntil: pricing === 'reserved' ? 1_000 : null,
        })),
      )
    expect(earned({ after: priced(['reserved', 'on-demand', 'spot']) })).toContain('finops')
    expect(earned({ after: priced(['reserved', 'on-demand']) })).not.toContain('finops')
    // A reserved term that has ended bills on-demand, so the fleet no longer has all three.
    const expired = {
      ...priced(['reserved', 'on-demand', 'spot']),
      time: 2_000,
    }
    expect(earned({ after: expired })).not.toContain('finops')
  })

  test('Spot the Difference needs a spot reclaim resolved with no errors', () => {
    expect(earned({ events: [resolved({ kind: 'spot-reclaim', failed: 0 })] })).toContain(
      'spot-the-difference',
    )
    expect(earned({ events: [resolved({ kind: 'spot-reclaim', failed: 2 })] })).not.toContain(
      'spot-the-difference',
    )
  })

  test('Let It Crash needs 1,000 absorbed BEAM crashes and no failed request', () => {
    const beam = (crashes: number, runtime: 'beam' | 'go' = 'beam'): Game =>
      withNodes(base, [{ type: 'server', runtime, crashes }])
    const ledger = nodeAt(ledgerOf(base, { errorShare: 0 }), 'n0', { inbound: 10 })
    expect(earned({ after: beam(1_000), ledger })).toContain('let-it-crash')
    expect(earned({ after: beam(999), ledger })).not.toContain('let-it-crash')
    expect(earned({ after: beam(1_000, 'go'), ledger })).not.toContain('let-it-crash')
    expect(earned({ after: beam(1_000), ledger: { ...ledger, errorShare: 0.01 } })).not.toContain(
      'let-it-crash',
    )
  })

  test('Shared Nothing needs the Seed Era, PHP-FPM only, and no memory incident', () => {
    const preSeed = { ...base, stage: 1 }
    const php = withNodes({ ...base, stage: 2 }, [{ type: 'server', runtime: 'php_fpm' }])
    expect(earned({ before: preSeed, after: php })).toContain('shared-nothing')
    expect(earned({ before: php, after: php })).not.toContain('shared-nothing')
    const puma = withNodes({ ...base, stage: 2 }, [{ type: 'server', runtime: 'puma' }])
    expect(earned({ before: preSeed, after: puma })).not.toContain('shared-nothing')
    const leaked = { ...php, postmortems: [postmortem({ kind: 'leak' })] }
    expect(earned({ before: preSeed, after: leaked })).not.toContain('shared-nothing')
  })

  test('Blocked needs a Node.js event loop and the loop incident resolved', () => {
    const node = {
      ...withNodes(base, [{ type: 'server', runtime: 'node' }]),
      incident: incident('loop'),
    }
    const done = [resolved({ kind: 'loop' })]
    expect(earned({ before: node, events: done })).toContain('blocked')
    expect(earned({ before: node, events: [resolved({ kind: 'spike' })] })).not.toContain('blocked')
    const go = {
      ...withNodes(base, [{ type: 'server', runtime: 'go' }]),
      incident: incident('loop'),
    }
    expect(earned({ before: go, events: done })).not.toContain('blocked')
  })

  test('Off by One Region needs a user more than 150 ms from the Design', () => {
    const region = (hopMs: number): Ledger =>
      ledgerOf(base, {
        regionKinds: {
          apac: {
            page: { rate: 10, success: 1, apdex: 1, near: 1, fail: NO_FAILURES, hopMs, p99: 100 },
          },
        },
      })
    expect(earned({ ledger: region(400) })).toContain('off-by-one-region')
    expect(earned({ ledger: region(150) })).not.toContain('off-by-one-region')
  })

  test("Little's Law needs the database to take the load, with no bigger App Servers", () => {
    const before = withNodes(base, [{ type: 'server' }, { type: 'database' }])
    const after = withNodes(base, [{ type: 'server' }, { type: 'database', size: 2 }])
    const ledger = ledgerOf(base, { bottleneck: 'n1' })
    expect(earned({ before, after, ledger, previousBottleneck: 'n0' })).toContain('littles-law')
    const grown = withNodes(base, [
      { type: 'server', size: 2 },
      { type: 'database', size: 2 },
    ])
    expect(earned({ before, after: grown, ledger, previousBottleneck: 'n0' })).not.toContain(
      'littles-law',
    )
    expect(earned({ before, after, ledger, previousBottleneck: 'n1' })).not.toContain('littles-law')
    expect(earned({ before, after, ledger })).not.toContain('littles-law')
  })

  test('Big Rewrite needs a finished migration to another language on every App Server', () => {
    const migration: MigrationState = {
      _tag: 'Ready',
      runtime: 'go',
      framework: 'none',
      fromRuntime: 'mod_php',
      fromFramework: 'none',
      total: 3,
      step: 3,
      bugs: false,
    }
    const before = {
      ...withNodes(base, [{ type: 'server', runtime: 'mod_php' }]),
      services: [{ ...base.services[0]!, migration }],
    }
    const after = {
      ...withNodes(base, [{ type: 'server', runtime: 'go', framework: 'none' }]),
      services: [{ ...base.services[0]!, migration: null }],
    }
    expect(earned({ before, after })).toContain('big-rewrite')
    expect(earned({ before, after: before })).not.toContain('big-rewrite')
    const variant: MigrationState = {
      _tag: 'Ready',
      runtime: 'mod_php',
      framework: 'none',
      fromRuntime: 'mod_php',
      fromFramework: 'none',
      total: 3,
      step: 3,
      bugs: false,
    }
    const stillPhp = { ...before, services: [{ ...before.services[0]!, migration: variant }] }
    expect(earned({ before: stillPhp, after })).not.toContain('big-rewrite')
  })

  test('Quorum needs R + W > N across three regions', () => {
    const three = fourRegions([{ type: 'wide', spread: true, n: 3, r: 2, w: 2 }])
    expect(
      earned({ after: three, ledger: nodeAt(ledgerOf(base), 'n4', { inbound: 10 }) }),
    ).toContain('quorum')
    const weak = fourRegions([{ type: 'wide', spread: true, n: 3, r: 1, w: 1 }])
    expect(
      earned({ after: weak, ledger: nodeAt(ledgerOf(base), 'n4', { inbound: 10 }) }),
    ).not.toContain('quorum')
    const two = withNodes({ ...base, stage: 5, users: 1_000 }, [
      { type: 'users', region: 'na' },
      { type: 'users', region: 'eu' },
      { type: 'wide', spread: true, n: 3, r: 2, w: 2 },
    ])
    expect(
      earned({ after: two, ledger: nodeAt(ledgerOf(base), 'n2', { inbound: 10 }) }),
    ).not.toContain('quorum')
  })

  test('Eventually needs R = 1, W = 1 at a billion users', () => {
    const wide = (users: number): Game => ({
      ...withNodes(base, [{ type: 'wide', n: 3, r: 1, w: 1 }]),
      stage: 5,
      users,
    })
    expect(earned({ after: wide(1e9) })).toContain('eventually')
    expect(earned({ after: wide(999_999_999) })).not.toContain('eventually')
  })

  test('Egress Shock needs egress to top the bill', () => {
    const lines = (egress: number, salaries: number) =>
      ledgerOf(base, {
        burnLines: {
          compute: 0.2,
          data: 0.1,
          storage: 0,
          egress,
          thirdParty: 0,
          requests: 0,
          observability: 0,
          salaries,
        },
      })
    expect(earned({ ledger: lines(3, 1) })).toContain('egress-shock')
    expect(earned({ ledger: lines(1, 3) })).not.toContain('egress-shock')
    expect(earned({ ledger: lines(0, 0) })).not.toContain('egress-shock')
  })

  test('Everyone Online needs six billion users', () => {
    expect(earned({ after: { ...base, users: 6e9 } })).toContain('everyone-online')
    expect(earned({ after: { ...base, users: 5.9e9 } })).not.toContain('everyone-online')
  })

  test('Follow the Sun needs four regions, a local peak, and nothing busy', () => {
    const busy = fourRegions()
    expect(earned({ after: busy, ledger: quiet(ledgerOf(base), 0.2) })).toContain('follow-the-sun')
    expect(earned({ after: busy, ledger: quiet(ledgerOf(base), 0.9) })).not.toContain(
      'follow-the-sun',
    )
    const offPeak = { ...fourRegions(), time: 100 }
    expect(earned({ after: offPeak, ledger: quiet(ledgerOf(base), 0.2) })).not.toContain(
      'follow-the-sun',
    )
    const three = withNodes({ ...base, stage: 5, users: 1_000, time: 360 }, [
      { type: 'users', region: 'na' },
      { type: 'users', region: 'eu' },
      { type: 'users', region: 'apac' },
    ])
    expect(earned({ after: three, ledger: quiet(ledgerOf(base), 0.2) })).not.toContain(
      'follow-the-sun',
    )
  })

  test('Warm Start needs JVM copies added during a spike with the p99 held', () => {
    const before = {
      ...withNodes(base, [{ type: 'server', runtime: 'tomcat' }]),
      incident: incident('spike'),
      history: [sample({ p99: 200 })],
    }
    const scaled = { ...before, nodes: before.nodes.map((node) => ({ ...node, replicas: 2 })) }
    expect(earned({ before, after: scaled, ledger: ledgerOf(base, { p99: 180 }) })).toContain(
      'warm-start',
    )
    expect(earned({ before, after: scaled, ledger: ledgerOf(base, { p99: 260 }) })).not.toContain(
      'warm-start',
    )
    expect(earned({ before, after: before, ledger: ledgerOf(base, { p99: 180 }) })).not.toContain(
      'warm-start',
    )
    const go = {
      ...before,
      nodes: before.nodes.map((node) => ({ ...node, runtime: 'go' as const })),
    }
    const goScaled = { ...go, nodes: go.nodes.map((node) => ({ ...node, replicas: 2 })) }
    expect(
      earned({ before: go, after: goScaled, ledger: ledgerOf(base, { p99: 180 }) }),
    ).not.toContain('warm-start')
  })

  test('Celebrity needs a hot key resolved with no failed requests', () => {
    const hot = { ...base, incident: incident('hot-key') }
    const clean = [resolved({ kind: 'hot-key', failed: 0 })]
    expect(earned({ before: hot, events: clean })).toContain('celebrity')
    expect(
      earned({ before: hot, events: [resolved({ kind: 'hot-key', failed: 20 })] }),
    ).not.toContain('celebrity')
    expect(earned({ events: clean })).not.toContain('celebrity')
  })

  test('Default Alive needs the IPO with no round raised', () => {
    const preIpo = { ...base, stage: 6, equity: 0.9 }
    const listed = { ...preIpo, stage: 7 }
    expect(earned({ before: preIpo, after: listed })).toContain('default-alive')
    const raised = { ...preIpo, equity: 0.6 }
    expect(earned({ before: raised, after: { ...raised, stage: 7 } })).not.toContain(
      'default-alive',
    )
  })

  test('Beat and Raise needs eight beats in a row', () => {
    const quarter = (streak: number): Game => ({
      ...base,
      stage: 7,
      quarter: {
        index: 0,
        startedAt: 0,
        growth: 0,
        margin: 0,
        revenue: 0,
        streak,
        bonus: 0,
        last: null,
      },
    })
    expect(earned({ after: quarter(8) })).toContain('beat-and-raise')
    expect(earned({ after: quarter(7) })).not.toContain('beat-and-raise')
  })

  test('a Sandbox earns nothing, and owned achievements are not earned twice', () => {
    const sandbox = { ...base, sandbox: true }
    expect(earned({ after: sandbox, ledger: ledgerOf(base, { served: 1 }) })).toEqual([])
    expect(
      detectAchievements(moment({ ledger: ledgerOf(base, { served: 1 }) }), ['hello-world']),
    ).not.toContain('hello-world')
  })

  test('Challenge percentiles earn Histogram and Pareto', () => {
    expect(challengeAchievements([0.91, 0.1, 0.1])).toEqual(['histogram'])
    expect(challengeAchievements([0.7, 0.75, 0.8])).toEqual(['pareto'])
    expect(challengeAchievements([0.89, 0.69, 0.9])).toEqual(['histogram'])
    expect(challengeAchievements([0.5, 0.5, 0.5])).toEqual([])
  })

  test('Serial founder needs an Exit with every Venture', () => {
    expect(everyVenture(VENTURE_IDS)).toBe(true)
    expect(everyVenture(VENTURE_IDS.slice(1))).toBe(false)
  })
})

describe('achievement unlocks', () => {
  test('Default Alive opens Bootstrapped; an Exit does not', () => {
    const row = {
      exit: 'acquisition',
      founding: base.founding,
      time: 0,
      peak: 0,
      stage: 4,
      payout: 0,
      legacy: 1,
      stack: [],
      snapshot: { nodes: [], links: [] },
    } as never
    const exited = recordExit(emptyFounder(), { legacy: 1, row } as never)
    expect(exited.mutators).not.toContain('no-caches')
    expect(Result.isFailure(unlockVenture(exited, 'bootstrapped'))).toBe(true)
    const alive = earnAchievements(emptyFounder(), ['default-alive'])
    expect(alive.ventures).toContain('bootstrapped')
    expect(Result.isSuccess(unlockVenture(alive, 'bootstrapped'))).toBe(true)
  })

  test('Five Nines comes from completing its own Challenge, not another', () => {
    expect(completeChallenge(emptyFounder(), 'five-nines', 10).achievements).toContain('five-nines')
    expect(completeChallenge(emptyFounder(), 'celebrity', 10).achievements).not.toContain(
      'five-nines',
    )
    expect(completeChallenge(emptyFounder(), 'five-nines', 10).achievements).toEqual(['five-nines'])
  })

  test('a Mutator opens with its achievement, and earning twice changes nothing', () => {
    expect(Result.isFailure(toggleMutator(emptyFounder(), 'no-caches'))).toBe(true)
    const once = earnAchievements(emptyFounder(), ['no-cache', 'no-cache'])
    expect(once.achievements).toEqual(['no-cache'])
    expect(once.mutators).toEqual(['no-caches'])
    expect(earnAchievements(once, ['no-cache'])).toBe(once)
    expect(Result.isSuccess(toggleMutator(once, 'no-caches'))).toBe(true)
    expect(MUTATOR_IDS).toContain('no-caches')
  })
})
