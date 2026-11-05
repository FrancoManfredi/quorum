import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, setDeployStrategy, setPoolerMode, type Action } from './actions.ts'
import { callsOf } from './capacity.ts'
import {
  BAD_DEPLOY_ERRORS,
  BAD_DEPLOY_MAX,
  CALENDAR_DAY,
  CHALLENGE_TUNING,
  DEPLOY_STRATEGIES,
  FEATURE_IDS,
  FEATURES,
  PAYING_SHARE,
  PLAN_PER_DAY,
  POOLER_CONNECTIONS,
  STRATEGY_RESEARCH,
  type DeployStrategyId,
  type FeatureId,
} from './catalog.ts'
import { preseedGame } from './company.ts'
import { forceIncident } from './director.ts'
import type { Ledger } from './ledger.ts'
import { burnOf } from './lookups.ts'
import { nextRandom } from './random.ts'
import { solve, solveFlow } from './solve.ts'
import { Game, NEW_ENGINEER, type GameNode } from './state.ts'
import { growthOf } from './step.ts'
import {
  badDeployChance,
  badDeployShare,
  deploysPerDay,
  quarterSeconds,
  quartersBehind,
  serviceOf,
  teamOutputs,
  withService,
} from './team.ts'
import {
  addIndex,
  advanceTeam,
  approveBlock,
  assign,
  blockReason,
  createTeam,
  laterBlock,
  moveItem,
  queueFeature,
  queueTask,
  rollback,
  rushItem,
  setTeamKind,
  setTeamPolicy,
} from './work.ts'

/* 08 "Features", "Engineering tasks", "Tech debt", "Team policy", and "Deploy frequency". */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const at = (game: Game, velocity = 1): Ledger => ({ ...solveFlow(game), velocity })

/** Pre-seed with the autopilot off and nothing to interrupt. */
const preseed = (): Game => ({
  ...preseedGame(),
  cash: 1e6,
  autopilot: false,
  nextIncidentAt: Number.MAX_SAFE_INTEGER,
})

/** Advances only the Team, by `seconds` in 1 s Steps, at velocity 1 and the design's calendar. */
const work = (game: Game, seconds: number): Game => {
  let current = game
  for (let elapsed = 0; elapsed < seconds; elapsed += 1)
    current = advanceTeam(
      { ...current, time: current.time + 1 },
      at(current),
      1,
      CHALLENGE_TUNING,
    ).game
  return current
}

const shipped = (game: Game, ...features: ReadonlyArray<FeatureId>): Game => ({
  ...game,
  shipped: features,
})

describe('the backlog', () => {
  test('the top item gets the Dev Hours; the next waits', () => {
    const game = ok(queueFeature(ok(queueFeature(preseed(), 'landing-page')), 'pagination'))
    // 5 sim s are a twelfth of a calendar day: the founder makes 6.4 / 12 DH.
    const after = work(game, 5)
    expect(after.backlog[0]?.spent).toBeCloseTo(6.4 / 12)
    expect(after.backlog[1]?.spent).toBe(0)
  })

  test('two teams build the first two items at once', () => {
    const queued = ok(queueFeature(ok(queueFeature(preseed(), 'landing-page')), 'pagination'))
    const second = ok(createTeam(queued))
    const team = second.teams[1]?.id ?? ''
    const staffed: Game = {
      ...second,
      engineers: [{ id: 'e1', team, language: 'php', hiredAt: -1e6, ...NEW_ENGINEER }],
    }
    // A twelfth of a calendar day: the founder makes 6.4 / 12 DH, an engineer 8 / 12.
    const after = work(staffed, 5)
    expect(after.backlog[0]?.spent).toBeCloseTo(6.4 / 12)
    expect(after.backlog[1]?.spent).toBeCloseTo(8 / 12)
  })

  test('items move, and the pool rushes one', () => {
    const game = ok(queueFeature(ok(queueFeature(preseed(), 'landing-page')), 'pagination'))
    const moved = ok(moveItem(game, game.backlog[1]?.id ?? 0, -1))
    expect(moved.backlog[0]?.ref).toBe('pagination')
    const rushed = ok(rushItem({ ...moved, devHours: 4 }, moved.backlog[0]?.id ?? 0))
    expect(rushed.backlog[0]?.spent).toBe(4)
    expect(rushed.devHours).toBe(0)
  })

  test('with the autopilot on, an idle team picks the next Feature itself', () => {
    expect(work({ ...preseed(), autopilot: true }, 1).backlog[0]?.ref).toBe('landing-page')
    expect(work(preseed(), 1).backlog).toEqual([])
  })

  test('Paid plans needs Password login on the way, and Pre-seed Features wait for Pre-seed', () => {
    const signedUp = shipped(preseed(), 'signup-flow')
    expect(Result.isFailure(queueFeature(preseed(), 'password-login'))).toBe(true)
    expect(Result.isFailure(queueFeature(signedUp, 'paid-plans'))).toBe(true)
    expect(
      Result.isSuccess(queueFeature(ok(queueFeature(signedUp, 'password-login')), 'paid-plans')),
    ).toBe(true)
    expect(Result.isFailure(queueFeature({ ...preseed(), stage: 0 }, 'password-login'))).toBe(true)
  })
})

describe('deploys', () => {
  test('a built Feature waits for the next deploy, then ships', () => {
    const built = ok(queueFeature(preseed(), 'pagination'))
    const almost: Game = {
      ...built,
      backlog: built.backlog.map((item) => ({ ...item, spent: item.cost - 0.001 })),
    }
    const finished = work(withService(almost, { nextDeployAt: almost.time + 100 }), 2)
    expect(finished.awaiting).toEqual(['pagination'])
    expect(finished.shipped).toEqual([])
    const deployed = work(finished, 100)
    expect(deployed.shipped).toEqual(['pagination'])
    expect(deployed.deploys).toBe(1)
    // Pagination ships a query shape with no index.
    expect(serviceOf(deployed).shapes).toBe(1)
  })

  test('PHP deploys more often than Node.js at the same policy, and a pipeline more still', () => {
    const fast = ok(setTeamPolicy(preseed(), 'core', 'move-fast', CHALLENGE_TUNING))
    const php: Game = { ...fast, time: fast.time + CALENDAR_DAY }
    const node: Game = {
      ...php,
      nodes: php.nodes.map((entry) =>
        entry.type === 'server' ? { ...entry, runtime: 'node' } : entry,
      ),
    }
    expect(deploysPerDay(php, CHALLENGE_TUNING)).toBeGreaterThan(
      deploysPerDay(node, CHALLENGE_TUNING),
    )
    const piped: Game = { ...php, researched: [...php.researched, 'ci'] }
    expect(deploysPerDay(piped, CHALLENGE_TUNING)).toBeGreaterThan(
      deploysPerDay(php, CHALLENGE_TUNING),
    )
    // Balanced caps the day at 8 deploys.
    expect(deploysPerDay({ ...preseed(), researched: ['ci'] }, CHALLENGE_TUNING)).toBe(8)
  })

  /** Pre-seed with a placed Pipeline on `strategy`, and the research that strategy needs. */
  const piped = (strategy: DeployStrategyId): Game => {
    const base = preseed()
    const needs = STRATEGY_RESEARCH[strategy]
    const researched = [...base.researched, 'ci', ...(needs ? [needs] : [])] as Game['researched']
    const placed = ok(place({ ...base, researched }, 'ci', 520, 80))
    const pipeline = placed.nodes.find((entry) => entry.type === 'ci') as GameNode
    return ok(setDeployStrategy(placed, pipeline.id, strategy))
  }

  const pipelineIn = (game: Game): GameNode =>
    game.nodes.find((entry) => entry.type === 'ci') as GameNode

  /** Move fast on a Rust Stack, so the cap leaves the strategy's deploy time room to show. */
  const moveFastRust = (game: Game): Game => {
    const switched = ok(setTeamPolicy(game, 'core', 'move-fast', CHALLENGE_TUNING))
    return {
      ...switched,
      time: switched.time + CALENDAR_DAY,
      nodes: switched.nodes.map((entry) =>
        entry.type === 'server' ? { ...entry, runtime: 'tokio' } : entry,
      ),
    }
  }

  test('each deploy strategy sets how much of a bad deploy reaches users', () => {
    const batch = FEATURE_IDS.slice(0, 6)
    const share = (strategy: DeployStrategyId): number =>
      badDeployShare(withService(piped(strategy), { lastDeploy: batch }))
    // Six Features at 8% each is 48%: Recreate takes it all, Rolling stops at 16's 40%.
    expect(share('recreate')).toBeCloseTo(BAD_DEPLOY_ERRORS * 6)
    expect(share('rolling')).toBeCloseTo(BAD_DEPLOY_MAX)
    expect(share('blue-green')).toBeCloseTo(0.1)
    expect(share('canary')).toBeCloseTo(0.05)
    // A batch big enough to break everything does, under Recreate.
    expect(
      badDeployShare(withService(piped('recreate'), { lastDeploy: FEATURE_IDS.slice(0, 13) })),
    ).toBe(1)
  })

  test('without a Pipeline the blast radius stays 16’s, whatever a Node’s strategy would do', () => {
    const batch = FEATURE_IDS.slice(0, 6)
    const research: Game = { ...preseed(), researched: [...preseed().researched, 'ci'] }
    expect(badDeployShare(withService(preseed(), { lastDeploy: batch }))).toBeCloseTo(
      BAD_DEPLOY_MAX,
    )
    expect(badDeployShare(withService(research, { lastDeploy: batch }))).toBeCloseTo(BAD_DEPLOY_MAX)
    // The research alone still deploys in 5 minutes, against 30 by hand.
    expect(deploysPerDay(moveFastRust(research), CHALLENGE_TUNING)).toBeCloseTo(480 / (12 + 5 + 15))
    expect(deploysPerDay(moveFastRust(preseed()), CHALLENGE_TUNING)).toBeCloseTo(
      480 / (12 + 30 + 15),
    )
    expect(deploysPerDay(moveFastRust(piped('rolling')), CHALLENGE_TUNING)).toBeCloseTo(
      deploysPerDay(moveFastRust(research), CHALLENGE_TUNING),
    )
  })

  test('a slower strategy deploys less often', () => {
    const days = (strategy: DeployStrategyId): number =>
      deploysPerDay(moveFastRust(piped(strategy)), CHALLENGE_TUNING)
    const minutes = (strategy: DeployStrategyId): number =>
      DEPLOY_STRATEGIES[strategy].deployMinutes
    expect(days('canary')).toBeCloseTo(480 / (12 + minutes('canary') + 15))
    expect(days('blue-green')).toBeCloseTo(480 / (12 + minutes('blue-green') + 15))
    // Recreate still fits inside Move fast's 16 a day; every slower strategy loses deploys.
    expect(days('recreate')).toBe(16)
    expect(days('recreate')).toBeGreaterThan(days('rolling'))
    expect(days('rolling')).toBeGreaterThan(days('canary'))
  })

  test('blue-green and canary cost more Burn on the Pipeline', () => {
    const burn = (strategy: DeployStrategyId): number => {
      const game = piped(strategy)
      return burnOf(game, pipelineIn(game))
    }
    // A second fleet and the canary's metrics bill on the Pipeline's own line.
    expect(burn('recreate')).toBeCloseTo(burn('rolling'))
    expect(burn('blue-green')).toBeCloseTo(burn('rolling') * 2)
    expect(burn('canary')).toBeCloseTo(burn('rolling') * 1.5)
  })

  test('the Pipeline waits for Continuous delivery, and carries no traffic', () => {
    expect(Result.isFailure(place(preseed(), 'ci', 520, 80))).toBe(true)
    const placed = piped('rolling')
    const pipeline = pipelineIn(placed)
    expect(pipeline.type).toBe('ci')
    const ledger = solveFlow(placed)
    // Nothing routes into it: it ships deploys, and the solve leaves it alone.
    expect(ledger.nodes[pipeline.id]?.inbound).toBe(0)
    expect(ledger.nodes[pipeline.id]?.stranded).toBe(0)
  })

  test('Blue-green and Canary wait for their own research; Rolling and Recreate do not', () => {
    const base = preseed()
    const placed = ok(place({ ...base, researched: [...base.researched, 'ci'] }, 'ci', 520, 80))
    const id = pipelineIn(placed).id
    // The Pipeline alone ships Recreate and Rolling.
    expect(Result.isSuccess(setDeployStrategy(placed, id, 'recreate'))).toBe(true)
    expect(Result.isSuccess(setDeployStrategy(placed, id, 'rolling'))).toBe(true)
    const refused = setDeployStrategy(placed, id, 'blue-green')
    expect(Result.isFailure(refused)).toBe(true)
    if (Result.isFailure(refused)) expect(refused.failure._tag).toBe('Locked')
    expect(Result.isFailure(setDeployStrategy(placed, id, 'canary'))).toBe(true)
    // Blue-green's research opens Blue-green only.
    const green: Game = { ...placed, researched: [...placed.researched, 'blue-green'] }
    expect(Result.isSuccess(setDeployStrategy(green, id, 'blue-green'))).toBe(true)
    expect(Result.isFailure(setDeployStrategy(green, id, 'canary'))).toBe(true)
    // Canary also asks for Percentiles.
    const canary: Game = { ...placed, researched: [...placed.researched, 'canary'] }
    expect(Result.isSuccess(setDeployStrategy(canary, id, 'canary'))).toBe(true)
    expect(STRATEGY_RESEARCH.canary).toBe('canary')
  })

  test('a save from before the strategy opens on Rolling', () => {
    const saved = JSON.parse(JSON.stringify(piped('canary'))) as {
      nodes: Array<Record<string, unknown>>
    }
    for (const entry of saved.nodes) delete entry.strategy
    const opened = Schema.decodeUnknownSync(Game)(saved)
    expect(opened.nodes.find((entry) => entry.type === 'ci')?.strategy).toBe('rolling')
    expect(opened.nodes.find((entry) => entry.type === 'ci')).toBeDefined()
  })

  test('the bad-deploy chance follows the policy, the debt, tests, and review', () => {
    const game = preseed()
    const base = badDeployChance(game, CHALLENGE_TUNING)
    expect(base).toBeCloseTo(0.1)
    const fast = ok(setTeamPolicy(game, 'core', 'move-fast', CHALLENGE_TUNING))
    expect(
      badDeployChance({ ...fast, time: fast.time + CALENDAR_DAY }, CHALLENGE_TUNING),
    ).toBeCloseTo(0.15)
    expect(badDeployChance(withService(game, { debt: 0.5 }), CHALLENGE_TUNING)).toBeCloseTo(0.2)
    const careful: Game = {
      ...game,
      researched: [...game.researched, 'ci', 'testing-culture', 'code-review'],
    }
    expect(badDeployChance(careful, CHALLENGE_TUNING)).toBeCloseTo(0.1 * 0.7 * 0.8)
  })

  test('a seeded deploy is bad exactly when its roll is under the chance', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const ready: Game = withService(
        { ...preseed(), seed, awaiting: ['landing-page'] },
        { nextDeployAt: 0, debt: 1 },
      )
      const chance = badDeployChance(ready, CHALLENGE_TUNING)
      const deployed = work(ready, 1)
      expect(deployed.badDeploys === 1).toBe(nextRandom(seed)[0] < chance)
    }
  })

  test('a bad deploy fails App Server requests; rolling back needs Continuous delivery', () => {
    const live = withService(shipped(preseed(), 'landing-page'), { lastDeploy: ['landing-page'] })
    const broken = forceIncident(live, solveFlow(live), 'bad-deploy')
    if (!broken) throw new Error('no bad deploy')
    expect(solveFlow(broken).errors.crash).toBeGreaterThan(0)
    expect(Result.isFailure(rollback(broken))).toBe(true)
    const rolled = ok(rollback({ ...broken, researched: [...broken.researched, 'ci'] }))
    expect(rolled.shipped).toEqual([])
    expect(rolled.awaiting).toEqual(['landing-page'])
    expect(rolled.incident?.remaining).toBe(0)
  })
})

describe('Features', () => {
  test('Landing page raises the market by 20% and page views by 10%', () => {
    const before = solveFlow(preseed())
    const after = solveFlow(shipped(preseed(), 'landing-page'))
    expect(after.market / before.market).toBeCloseTo(1.2)
    expect((after.kinds.page?.rate ?? 0) / (before.kinds.page?.rate ?? 1)).toBeCloseTo(1.1)
  })

  test('Signup flow raises growth by 15%', () => {
    const game: Game = { ...preseed(), apdex: 1 }
    const ledger = { ...solveFlow(game) }
    expect(growthOf(shipped(game, 'signup-flow'), ledger) / growthOf(game, ledger)).toBeCloseTo(
      1.15,
    )
  })

  test('Password login is what brings logins', () => {
    expect(solveFlow(preseed()).kinds.login).toBeUndefined()
    const after = solveFlow(shipped(preseed(), 'password-login'))
    expect((after.kinds.login?.rate ?? 0) / after.demand).toBeCloseTo(0.05)
  })

  test('Paid plans adds subscriptions, paid per paying user per calendar day', () => {
    const game = shipped(preseed(), 'password-login', 'paid-plans')
    const ledger = solveFlow(game)
    expect(ledger.subscriptions).toBeCloseTo(
      (game.users * PAYING_SHARE * PLAN_PER_DAY) / CALENDAR_DAY,
    )
    expect(ledger.revenue).toBeGreaterThan(
      solveFlow(shipped(preseed(), 'password-login')).revenue + ledger.subscriptions,
    )
  })

  test('a shipped Feature survives a save round trip', () => {
    const game = shipped(preseed(), 'landing-page', 'pagination')
    const decoded = Schema.decodeUnknownSync(Game)(
      JSON.parse(JSON.stringify(Schema.encodeSync(Game)(game))),
    )
    expect(decoded.shipped).toEqual(['landing-page', 'pagination'])
    expect(decoded.services).toEqual(game.services)
  })

  test('every Feature belongs to an Era the build has: Garage to Public', () => {
    for (const feature of Object.values(FEATURES)) expect(feature.era).toBeLessThanOrEqual(7)
  })
})

describe('Engineering tasks and tech debt', { timeout: 30_000 }, () => {
  test('Add index from the pool ends a Slow query', () => {
    const game: Game = {
      ...preseed(),
      researched: [...preseed().researched, 'query-analysis'],
      devHours: 10,
    }
    const slow = forceIncident(game, solveFlow(game), 'slow-query')
    if (!slow) throw new Error('no slow query')
    const indexed = work(ok(addIndex(slow, 'database')), 1)
    // The pool paid the 4 DH; the founder's second of work (6.4 DH over a
    // 60 s calendar day) went back into it.
    expect(indexed.devHours).toBeCloseTo(6 + 6.4 / 60)
    expect(indexed.incident?.remaining ?? 0).toBeLessThanOrEqual(0)
  })

  test('Eager loading is researched to find the N+1 queries, and built to remove them', () => {
    const laravel: Game = {
      ...preseed(),
      researched: [...preseed().researched, 'eager-loading'],
      nodes: preseed().nodes.map((node) =>
        node.type === 'server' ? { ...node, framework: 'laravel' } : node,
      ),
    }
    const server = laravel.nodes.find((node) => node.type === 'server')
    if (!server) throw new Error('no server')
    expect(callsOf(laravel, server, 'read', false)['q-read']).toBe(3)
    const fixedUp = work({ ...ok(queueTask(laravel, 'eager-loading')), devHours: 0 }, 39 * 60)
    expect(serviceOf(fixedUp).fixes).toContain('eager-loading')
    expect(callsOf(fixedUp, server, 'read', false)['q-read']).toBe(1)
  })

  test('debt slows velocity by 1 − 0.5 × debt, and a Refactor pays it down', () => {
    const clean = preseed()
    const indebted = withService(clean, { debt: 0.4 })
    const ratio =
      (teamOutputs(indebted, at(indebted))[0]?.velocity ?? 0) /
      (teamOutputs(clean, at(clean))[0]?.velocity ?? 1)
    expect(ratio).toBeCloseTo(0.8)
    const refactored = work(ok(queueTask(indebted, 'refactor')), 60 * 60)
    expect(serviceOf(refactored).debt).toBeCloseTo(0.2)
  })

  test('Move fast ships with more debt than Quality', () => {
    const built = (policy: 'move-fast' | 'quality') => {
      const set = ok(setTeamPolicy(preseed(), 'core', policy, CHALLENGE_TUNING))
      const queued = ok(queueFeature({ ...set, time: set.time + CALENDAR_DAY }, 'pagination'))
      return serviceOf(work(queued, 30 * 60)).debt
    }
    expect(built('move-fast')).toBeGreaterThan(built('quality'))
  })
})

describe('Connection Pooler modes', () => {
  const pooled = (mode: 'session' | 'transaction', fixes: ReadonlyArray<'session-state'> = []) => {
    let game: Game = withService(
      {
        ...preseed(),
        researched: [...preseed().researched, 'pooling'],
        users: 2_000,
        nodes: preseed().nodes.map((node) =>
          node.type === 'server' ? { ...node, size: 4, workers: 64 } : node,
        ),
      },
      { fixes },
    )
    game = ok(place(game, 'pooler', 600, 160))
    const pooler = game.nodes.at(-1)?.id ?? ''
    game = {
      ...game,
      links: game.links.filter((link) => !(link.from === 'server' && link.to === 'database')),
    }
    game = ok(connect(ok(connect(game, 'server', pooler)), pooler, 'database'))
    return ok(setPoolerMode(game, pooler, mode))
  }

  test('transaction mode fails queries that need session state, until the task ships', () => {
    expect(solve(pooled('transaction')).errors.crash).toBeGreaterThan(0)
    expect(solve(pooled('transaction', ['session-state'])).errors.crash).toBe(0)
  })

  test('session mode holds a server connection per client', () => {
    const session = solve(pooled('session')).nodes.database?.connections?.used ?? 0
    const transaction = solve(pooled('transaction')).nodes.database?.connections?.used ?? 0
    expect(transaction).toBe(POOLER_CONNECTIONS)
    expect(session).toBeGreaterThan(transaction)
  })
})

describe('Kubernetes Clusters and the Platform team (08 "Teams")', () => {
  /** Series A with three engineers on the founder's team and one Kubernetes Cluster. */
  const clustered = (): Game => {
    const base: Game = {
      ...preseed(),
      stage: 3,
      researched: [...preseed().researched, 'containers', 'platform-team'],
      engineers: ['e1', 'e2', 'e3'].map((id) => ({
        id,
        team: 'core',
        language: 'php' as const,
        hiredAt: -1e6,
        ...NEW_ENGINEER,
      })),
    }
    return ok(place(base, 'cluster', 900, 80))
  }

  test('each Cluster takes half an engineer of Dev Hours from the product teams', () => {
    const game = clustered()
    const without: Game = { ...game, nodes: game.nodes.filter((node) => node.type !== 'cluster') }
    const effective = teamOutputs(without, at(without))[0]?.effective ?? 0
    const rate = (current: Game) => teamOutputs(current, at(current))[0]?.rate ?? 0
    expect(rate(game)).toBeCloseTo(rate(without) * (1 - 0.5 / effective), 9)
  })

  test('a staffed Platform team takes the Clusters off the product teams, builds no backlog, and halves deploy time', () => {
    const game = clustered()
    // The founder's team builds the product, and no team turns Platform before Series A.
    expect(Result.isFailure(setTeamKind(game, 'core', 'platform'))).toBe(true)
    const second = ok(createTeam(game))
    const id = second.teams[1]?.id ?? ''
    expect(Result.isFailure(setTeamKind({ ...second, stage: 2 }, id, 'platform'))).toBe(true)
    const empty = ok(setTeamKind(second, id, 'platform'))
    const staffed = ok(assign(empty, 'e3', id))
    const noCluster = (current: Game): Game => ({
      ...current,
      nodes: current.nodes.filter((node) => node.type !== 'cluster'),
    })
    const product = (current: Game) => teamOutputs(current, at(current))[0]?.rate ?? 0
    // An empty Platform team lifts nothing; one engineer on it lifts the whole cost.
    expect(product(empty)).toBeLessThan(product(noCluster(empty)))
    expect(product(staffed)).toBeCloseTo(product(noCluster(staffed)), 9)
    // Two items: the founder's team builds the first; a product team would build the second.
    const two = (current: Game) =>
      work(ok(queueFeature(ok(queueFeature(current, 'landing-page')), 'pagination')), 1)
    expect(two(staffed).backlog[1]?.spent).toBe(0)
    expect(two(ok(setTeamKind(staffed, id, 'product'))).backlog[1]?.spent ?? 0).toBeGreaterThan(0)
    // At Move fast, manual deploys of 30 minutes cap the day; a Platform team's take 15.
    const fast = (current: Game): Game => ({
      ...current,
      teams: current.teams.map((team, index) =>
        index === 0 ? { ...team, policy: 'move-fast', previous: 'move-fast' } : team,
      ),
    })
    expect(deploysPerDay(fast(empty))).toBeCloseTo(480 / (0.5 + 30 + 15), 6)
    expect(deploysPerDay(fast(staffed))).toBeCloseTo(480 / (0.5 + 15 + 15), 6)
  })

  test('Upgrade clusters puts every Cluster on a supported version and ends a forced upgrade', () => {
    const game = clustered()
    const stale: Game = { ...game, time: game.time + 3 * quarterSeconds(CHALLENGE_TUNING) }
    const cluster = stale.nodes.find((node) => node.type === 'cluster')
    expect(quartersBehind(stale, cluster as GameNode, CHALLENGE_TUNING)).toBeCloseTo(2, 6)
    const forced: Game = {
      ...stale,
      incident: {
        kind: 'cluster-upgrade',
        remaining: 60,
        nodeId: cluster?.id ?? null,
        startedAt: stale.time,
        baseline: 0,
        usersAtStart: stale.users,
        impaired: 0,
        lostRevenue: 0,
        failed: 0,
        signalAt: null,
        ackAt: null,
        severity: 2,
        magnitude: 3,
        zone: null,
        region: null,
        causedBy: null,
      },
    }
    const upgraded = work(ok(queueTask(forced, 'upgrade-cluster')), 30 * 60)
    const after = upgraded.nodes.find((node) => node.type === 'cluster') as GameNode
    expect(quartersBehind(upgraded, after, CHALLENGE_TUNING)).toBe(0)
    expect(upgraded.incident?.remaining ?? 0).toBeLessThanOrEqual(0)
    expect(Result.isFailure(queueTask(preseed(), 'upgrade-cluster'))).toBe(true)
  })
})

/* 18 "Blocked": an item a team cannot move waits on the player, and the owner writes. */
describe('blocked work', () => {
  /** A Pre-seed Company with one engineer on the founder's team and a quiet clock. */
  const staffed = (change: Partial<Game> = {}): Game => ({
    ...preseed(),
    engineers: [{ id: 'e1', team: 'core', language: 'php', hiredAt: -1e6, ...NEW_ENGINEER }],
    ...change,
  })

  /** One Step of Team work, with what it reported. */
  const oneStep = (game: Game) => {
    const ready: Game = { ...game, time: game.time + 1 }
    return advanceTeam(ready, at(ready), 1, CHALLENGE_TUNING)
  }

  test('an item waits on an index its Service needs, and the owner writes', () => {
    const shaped: Game = {
      ...staffed(),
      services: [{ ...serviceOf(staffed()), shapes: 1 }],
    }
    const queued = ok(queueFeature(shaped, 'landing-page'))
    const { game: after, events } = oneStep(queued)
    const blocked = events.find((event) => event._tag === 'Blocked')
    expect(blocked?._tag).toBe('Blocked')
    expect(blocked && blocked._tag === 'Blocked' ? blocked.reason : null).toBe('index')
    expect(blocked && blocked._tag === 'Blocked' ? blocked.engineerId : null).toBe('e1')
    const item = after.backlog[0]
    expect(item?.blockedBy).toMatchObject({ kind: 'index', owner: 'e1', cleared: false })
    // The Team cannot move it, so its Dev Hours go to the pool.
    expect(item?.spent).toBe(0)
    expect(after.devHours).toBeGreaterThan(0)
  })

  test('Approve clears it and the work moves again; Later brings the Mail back', () => {
    const shaped: Game = {
      ...staffed(),
      services: [{ ...serviceOf(staffed()), shapes: 1 }],
    }
    const queued = ok(queueFeature(shaped, 'landing-page'))
    const blocked = oneStep(queued).game
    const id = blocked.backlog[0]?.id ?? 0
    const approved = ok(approveBlock(blocked, id))
    expect(approved.backlog[0]?.blockedBy?.cleared).toBe(true)
    // The same item never stops twice, even with the shape still there.
    const moving = advanceTeam(
      { ...approved, time: approved.time + 1 },
      at(approved),
      1,
      CHALLENGE_TUNING,
    )
    expect(moving.game.backlog[0]?.spent).toBeGreaterThan(0)
    expect(moving.events.some((event) => event._tag === 'Blocked')).toBe(false)
    // Later leaves it blocked, and the owner writes again a calendar day later.
    const deferred = ok(laterBlock(blocked, id, CHALLENGE_TUNING))
    let now = deferred
    const again: Array<string> = []
    for (let second = 0; second < 70; second += 1) {
      const step = advanceTeam({ ...now, time: now.time + 1 }, at(now), 1, CHALLENGE_TUNING)
      now = step.game
      for (const event of step.events) if (event._tag === 'Blocked') again.push(event.engineerId)
    }
    expect(again).toEqual(['e1'])
  })

  test('the four waits, in order: an index, a copy, a hire, a decision', () => {
    const game = staffed()
    const feature = {
      id: 1,
      kind: 'feature' as const,
      ref: 'landing-page',
      cost: 8,
      spent: 0,
      blockedBy: null,
      answered: null,
    }
    expect(blockReason(game, feature)).toBe(null)
    expect(blockReason({ ...game, services: [{ ...serviceOf(game), shapes: 2 }] }, feature)).toBe(
      'index',
    )
    // Two Services on one Database need a copy before the schema moves.
    const split: Game = {
      ...game,
      services: [
        { ...serviceOf(game), shapes: 0 },
        {
          ...serviceOf(game),
          id: 'service-2',
          name: 'Checkout',
          features: ['checkout'],
          owner: 'core',
        },
      ],
    }
    expect(blockReason(split, feature)).toBe('copy')
    const big: Game = {
      ...game,
      engineers: Array.from({ length: 8 }, (_, index) => ({
        id: `e${index + 1}`,
        team: 'core',
        language: 'php' as const,
        hiredAt: -1e6,
        ...NEW_ENGINEER,
      })),
    }
    expect(blockReason(big, feature)).toBe('hire')
    // A Design missing its Apdex target needs a decision on what to build first.
    expect(blockReason({ ...game, apdex: 0.5 }, feature)).toBe('decision')
  })
})
