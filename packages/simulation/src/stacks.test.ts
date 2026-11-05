import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from './actions.ts'
import type { Action } from './actions.ts'
import {
  FRAMEWORKS,
  ML_AI_BONUS,
  PHP_JIT_HEAVY,
  RUNTIMES,
  WORKER_THREADS,
  WORKER_THREAD_MB,
  RESEARCH as RESEARCH_DEFS,
  YJIT_MEMORY,
  YJIT_SPEED,
  type FrameworkId,
  type ResearchId,
  type RequestKind,
  type RuntimeId,
} from './catalog.ts'
import { company, link, node } from './company.ts'
import { runtimeReady, frameworkReady, researchReady } from './lookups.ts'
import { mlValueOf, hubConnections } from './rules.ts'
import { solve } from './solve.ts'
import type { Game, GameNode } from './state.ts'
import { advanceTeam } from './work.ts'
import type { FeatureId } from './catalog.ts'

/* Runtime variants and frameworks (06 "Variants by language", "Frameworks"): what each changes. */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const RESEARCH: ReadonlyArray<ResearchId> = [
  'php-fpm',
  'opcache',
  'lang-ruby',
  'lang-node',
  'lang-python',
  'lang-go',
  'lang-java',
  'lang-csharp',
  'lang-elixir',
  'lang-rust',
  'websockets',
  'background-jobs',
  'php-jit',
  'worker-threads',
  'yjit',
  'gevent',
  'asgi',
  'php-worker-mode',
  'swoole',
  'bun',
  'deno',
  'falcon',
  'pypy',
  'virtual-threads',
  'webflux',
  'fasthttp',
  'spawn-blocking',
  'graal-native',
  'native-aot',
  'distributed-erlang',
  'nifs',
  'jemalloc',
  'free-threading',
  'fw-fastapi',
  'fw-fastify',
  'fw-nextjs',
  'fw-nestjs',
  'fw-fiber',
  'fw-quarkus',
  'fw-laravel',
]

/** A flat Series A board: Users, one App Server, a Database. */
const board = (
  runtime: RuntimeId,
  options: Partial<GameNode> = {},
  extra: ReadonlyArray<Partial<GameNode>> = [],
  mix?: Partial<Record<RequestKind, number>>,
): Game => ({
  ...company(7),
  sandbox: true,
  stage: 3,
  users: 4_000,
  researched: RESEARCH,
  ...(mix ? { scenario: { mix } } : {}),
  nodes: [
    node('users', 'users', 120, 280),
    node('server', 'server', 440, 280, { size: 3, runtime, ...options }),
    node('database', 'database', 760, 200, { size: 4 }),
    ...extra.map((entry, index) =>
      node(entry.id ?? `extra${index}`, entry.type ?? 'storage', 760, 360 + index * 100, entry),
    ),
  ],
  links: [link('users', 'server'), link('server', 'database')],
})

/** The same board without one research item. */
const without = (game: Game, ...drops: ReadonlyArray<ResearchId>): Game => ({
  ...game,
  researched: game.researched.filter((id) => !drops.includes(id)),
})

const capacityOf = (game: Game): number => solve(game).nodes.server?.capacity ?? 0
const ramOf = (game: Game): number => solve(game).nodes.server?.resources.ram?.used ?? 0
const p99Of = (game: Game, kind: RequestKind): number => solve(game).kinds[kind]?.p99 ?? 0

const hubBoard = (
  runtime: RuntimeId,
  size = 1,
  researched: ReadonlyArray<ResearchId> = RESEARCH,
) => ({
  ...company(7),
  sandbox: true,
  stage: 3,
  users: 200_000,
  researched,
  nodes: [node('users', 'users', 120, 280), node('hub', 'ws', 440, 280, { runtime, size })],
  links: [link('users', 'hub')],
})

const hubCapacity = (game: Game): number => solve(game).nodes.hub?.capacity ?? 0

describe('the runtime variants', () => {
  const gated: ReadonlyArray<readonly [RuntimeId, ResearchId]> = [
    ['php_worker', 'php-worker-mode'],
    ['swoole', 'swoole'],
    ['unicorn', 'lang-ruby'],
    ['falcon', 'falcon'],
    ['gevent', 'gevent'],
    ['uvicorn', 'asgi'],
    ['python_ft', 'free-threading'],
    ['pypy', 'pypy'],
    ['bun', 'bun'],
    ['deno', 'deno'],
    ['java_virtual', 'virtual-threads'],
    ['webflux', 'webflux'],
    ['graal', 'graal-native'],
    ['native_aot', 'native-aot'],
    ['fasthttp', 'fasthttp'],
  ]

  test('each variant is unlocked by its own research, in its own Era', () => {
    const plain: Game = { ...board('php_fpm'), researched: [] }
    for (const [runtime, research] of gated) {
      expect([runtime, RUNTIMES[runtime].research]).toEqual([runtime, research])
      expect([runtime, runtimeReady(plain, runtime)]).toEqual([runtime, false])
      expect([runtime, runtimeReady({ ...plain, researched: [research] }, runtime)]).toEqual([
        runtime,
        true,
      ])
      // The Era gate holds even with every prerequisite researched: at Series A only Eras 0 to 3.
      expect([runtime, researchReady({ ...plain, researched: RESEARCH }, research)]).toEqual([
        runtime,
        RESEARCH_DEFS[research].era <= 3,
      ])
      expect([
        runtime,
        researchReady({ ...plain, stage: 5, researched: RESEARCH }, research),
      ]).toEqual([runtime, true])
    }
    // A Series C runtime is not offered at Garage, and a Seed one is after Seed.
    expect(researchReady({ ...plain, stage: 1 }, 'free-threading')).toBe(false)
    expect(
      researchReady({ ...plain, stage: 5, researched: ['lang-python'] }, 'free-threading'),
    ).toBe(true)
  })

  test('a locked variant refuses to run, and a language change drops its framework', () => {
    const game = without(board('php_fpm'), 'swoole')
    expect(Result.isFailure(Actions.setRuntime(game, 'server', 'swoole'))).toBe(true)
    const scored = ok(Actions.setFramework(game, 'server', 'laravel'))
    const tuned = ok(Actions.setRuntime(scored, 'server', 'fasthttp'))
    expect(tuned.nodes.find((entry) => entry.id === 'server')?.framework).toBe('none')
  })

  test('every new framework is gated by its research and its language', () => {
    const gatedFrameworks: ReadonlyArray<readonly [FrameworkId, ResearchId]> = [
      ['fastapi', 'fw-fastapi'],
      ['fastify', 'fw-fastify'],
      ['nextjs', 'fw-nextjs'],
      ['nestjs', 'fw-nestjs'],
      ['fiber', 'fw-fiber'],
      ['quarkus', 'fw-quarkus'],
    ]
    const plain: Game = { ...board('php_fpm'), researched: [] }
    for (const [framework, research] of gatedFrameworks) {
      expect([framework, frameworkReady(plain, framework)]).toEqual([framework, false])
      expect([framework, frameworkReady({ ...plain, researched: [research] }, framework)]).toEqual([
        framework,
        true,
      ])
    }
    const php = board('php_fpm')
    expect(Result.isFailure(Actions.setFramework(php, 'server', 'fastapi'))).toBe(true)
    const python = board('gunicorn')
    expect(
      ok(Actions.setFramework(python, 'server', 'fastapi')).nodes.find(
        (entry) => entry.id === 'server',
      )?.framework,
    ).toBe('fastapi')
  })

  test('YJIT raises Ruby’s CPU speed by 1.3, for 20% more memory', () => {
    const plain = without(board('puma', {}, [], { read: 1 }), 'yjit')
    const yjit = board('puma', {}, [], { read: 1 })
    expect(capacityOf(yjit) / capacityOf(plain)).toBeGreaterThan(YJIT_SPEED * 0.95)
    expect(ramOf(yjit) / ramOf(plain)).toBeGreaterThan(1 + (YJIT_MEMORY - 1) * 0.7)
    expect(ramOf(yjit)).toBeGreaterThan(ramOf(plain))
  })

  test('jemalloc is 1.05× on Rust, for 5% more memory', () => {
    expect(
      capacityOf(board('tokio')) / capacityOf(without(board('tokio'), 'jemalloc')),
    ).toBeCloseTo(1.05, 1)
  })

  test('the PHP JIT helps a CPU-heavy kind far more than a read', () => {
    const read = capacityOf(board('php_fpm', { workers: 24 }, [], { read: 1 }))
    const readBefore = capacityOf(
      without(board('php_fpm', { workers: 24 }, [], { read: 1 }), 'php-jit'),
    )
    expect(read / readBefore).toBeLessThan(1.1)
    const report = capacityOf(board('php_fpm', { workers: 24 }, [], { report: 1 }))
    const reportBefore = capacityOf(
      without(board('php_fpm', { workers: 24 }, [], { report: 1 }), 'php-jit'),
    )
    expect(report / reportBefore).toBeGreaterThan(PHP_JIT_HEAVY * 0.9)
  })

  test('NIFs make Elixir’s CPU-heavy kinds 3× faster', () => {
    const report = capacityOf(board('beam', {}, [], { report: 1 }))
    const before = capacityOf(without(board('beam', {}, [], { report: 1 }), 'nifs'))
    expect(report / before).toBeGreaterThan(2.5)
    // A read is not a CPU-heavy kind, so NIFs leave it alone.
    expect(capacityOf(board('beam', {}, [], { read: 1 }))).toBeCloseTo(
      capacityOf(without(board('beam', {}, [], { read: 1 }), 'nifs')),
      6,
    )
  })

  test('Node.js worker threads free the loop, at 10 MB a thread', () => {
    const mix = { read: 10, report: 1 }
    const light = (game: Game): Game => ({ ...game, users: 300 })
    const plain = light(without(board('node', {}, [], mix), 'worker-threads'))
    const threads = light(board('node', {}, [], mix))
    // The loop stall leaves the p99; with worker threads nothing is left on the loop.
    expect(p99Of(threads, 'report')).toBeLessThan(p99Of(plain, 'report'))
    expect(ramOf(threads) - ramOf(plain)).toBeCloseTo((WORKER_THREADS * WORKER_THREAD_MB) / 1024, 3)
  })

  test('Tokio’s blocking pool removes its worker-thread stall', () => {
    const mix = { read: 10, report: 1 }
    const plain = without(board('tokio', {}, [], mix), 'spawn-blocking')
    const pool = board('tokio', {}, [], mix)
    expect(p99Of(pool, 'report')).toBeLessThan(p99Of(plain, 'report'))
  })

  test('Swoole holds realtime connections; PHP-FPM and PHP worker mode refuse them', () => {
    const served = (runtime: RuntimeId): number => solve(hubBoard(runtime)).kinds.rt?.success ?? 0
    expect(served('swoole')).toBe(1)
    expect(served('php_fpm')).toBe(0)
    expect(served('php_worker')).toBe(0)
    expect(RUNTIMES.swoole.connectionKB).toBe(20)
    expect(hubCapacity(hubBoard('swoole'))).toBeGreaterThan(hubCapacity(hubBoard('uvicorn')))
  })

  test('Uvicorn and gevent hold connections that Gunicorn refuses; Unicorn refuses them too', () => {
    const served = (runtime: RuntimeId): number => solve(hubBoard(runtime)).kinds.rt?.success ?? 0
    expect(served('uvicorn')).toBeGreaterThan(0.5)
    expect(served('gevent')).toBeGreaterThan(0.5)
    expect(served('gunicorn')).toBe(0)
    expect(served('unicorn')).toBe(0)
    expect(served('falcon')).toBeGreaterThan(0.5)
    // Python ASGI's 30 KB is the design's figure; Ruby's 100 KB is the same row's.
    expect(hubCapacity(hubBoard('uvicorn'))).toBeGreaterThan(hubCapacity(hubBoard('falcon')))
  })

  test('free-threaded CPython and virtual threads use every core; a process pool does not', () => {
    // A thread pool on every core only has its 8 threads to give; a green-thread runtime has no slot
    // gauge at all, which is what lets a wait stop holding a worker (06 "Concurrency models").
    expect(RUNTIMES.python_ft.parallel).toBe(true)
    expect(RUNTIMES.java_virtual.parallel).toBe(true)
    expect(RUNTIMES.gunicorn.parallel).toBe(false)
    expect(
      solve(board('python_ft', { size: 2 }, [], { read: 1 })).nodes.server?.capacity ?? 0,
    ).toBeGreaterThan(
      solve(board('gunicorn', { size: 2 }, [], { read: 1 })).nodes.server?.capacity ?? 0,
    )
    expect(solve(board('java_virtual')).nodes.server?.resources.slots).toBeNull()
    expect(solve(board('tomcat')).nodes.server?.resources.slots).not.toBeNull()
  })

  test('GraalVM and Native AOT start at full speed, and Graal uses less memory than the JVM', () => {
    for (const runtime of ['graal', 'native_aot'] as const) {
      expect(RUNTIMES[runtime].warmFrom).toBe(1)
      expect(RUNTIMES[runtime].startup).toBe(0)
    }
    expect(RUNTIMES.graal.memory).toBeLessThan(RUNTIMES.tomcat.memory)
    expect(RUNTIMES.native_aot.memory).toBeLessThan(RUNTIMES.kestrel.memory)
  })

  test('fasthttp is 1.25× net/http, at 0.9× the velocity', () => {
    expect(
      capacityOf(board('fasthttp', {}, [], { read: 1 })) /
        capacityOf(board('go', {}, [], { read: 1 })),
    ).toBeCloseTo(1.25, 1)
    expect(RUNTIMES.fasthttp.velocity).toBe(0.9)
    expect(RUNTIMES.deno.velocity).toBe(0.9)
    expect(RUNTIMES.webflux.velocity).toBe(0.8)
  })

  test('Python earns the ML ecosystem bonus on `ai` when a Vector Index is in the path', () => {
    const context = (runtime: RuntimeId) => node('server', 'server', 0, 0, { size: 3, runtime })
    expect(mlValueOf(context('gunicorn'), 'ai', true)).toBe(ML_AI_BONUS)
    expect(mlValueOf(context('uvicorn'), 'ai', true)).toBe(ML_AI_BONUS)
    expect(mlValueOf(context('pypy'), 'ai', true)).toBe(1)
    expect(mlValueOf(context('go'), 'ai', true)).toBe(1)
    expect(mlValueOf(context('gunicorn'), 'read', true)).toBe(1)
    // 06's condition: without a Vector Index in the path there is nothing to embed.
    expect(mlValueOf(context('gunicorn'), 'ai', false)).toBe(1)
    // FastAPI's value bonus stacks on top, and only on `ai`.
    expect(FRAMEWORKS.fastapi.value.ai).toBe(1.15)
    expect(FRAMEWORKS.fastapi.value.read).toBeUndefined()
  })

  test('distributed Erlang clusters a BEAM Hub without the option', () => {
    const hub = node('hub', 'ws', 0, 0, { runtime: 'beam', size: 2 })
    expect(hubConnections(hub, true)).toBeCloseTo(hubConnections(hub, false) * 2, 6)
    const seeded = {
      ...hubBoard('beam', 2),
      researched: hubBoard('beam', 2).researched.filter((id) => id !== 'distributed-erlang'),
    }
    const plain = hubCapacity(seeded)
    const distributed = hubCapacity({
      ...seeded,
      researched: [...seeded.researched, 'distributed-erlang'],
    })
    expect(distributed).toBeCloseTo(plain * 2, 6)
    // It is an Elixir behavior: a Go Hub gains nothing.
    const goHub = {
      ...hubBoard('go', 2),
      researched: hubBoard('go', 2).researched.filter((id) => id !== 'distributed-erlang'),
    }
    expect(
      hubCapacity({ ...goHub, researched: [...goHub.researched, 'distributed-erlang'] }),
    ).toBeCloseTo(hubCapacity(goHub), 6)
  })

  test('a deploy restarts other runtimes cold, and reloads PHP and Elixir in place', () => {
    const deploy = (runtime: RuntimeId): GameNode => {
      const game: Game = {
        ...board(runtime),
        sandbox: false,
        awaiting: ['pagination'] as FeatureId[],
      }
      const after = advanceTeam(game, solve(game), 1).game
      return after.nodes.find((entry) => entry.id === 'server') as GameNode
    }
    expect(deploy('go').life._tag).toBe('Restarting')
    expect(deploy('php_fpm').life._tag).not.toBe('Restarting')
    expect(deploy('beam').life._tag).not.toBe('Restarting')
    // Elixir's hot upgrade costs Dev Hours, so its next deploy slot is later than Go's.
    const nextSlot = (runtime: RuntimeId): number => {
      const game: Game = {
        ...board(runtime),
        sandbox: false,
        awaiting: ['pagination'] as FeatureId[],
      }
      return advanceTeam(game, solve(game), 1).game.services[0]?.nextDeployAt ?? 0
    }
    expect(nextSlot('beam')).toBeGreaterThan(nextSlot('go'))
  })
})
