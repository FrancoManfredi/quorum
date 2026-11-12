import { createHash } from 'node:crypto'
import * as Sentry from '@sentry/cloudflare'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Scope from 'effect/Scope'
import { FetchHttpClient } from 'effect/http'
import { RpcClient, RpcSerialization } from 'effect/rpc'
import { beforeEach, expect, test, vi } from 'vitest'
import { Api, RPC_PATH, type SurveyExit, type SurveySubmission } from '@quorum/rpc'
import { newGame } from '@quorum/simulation/company'
import { RoomDirectory } from './contexts/room/directory.ts'
import { sqliteRunner } from './platform/sqlite-runner.ts'
import type { SqlRunner } from './platform/sql.ts'
import { handlerFor } from './handler.ts'

// Sentry is at the edge of the Worker, so the test spies on it instead of sending anything.
vi.mock('@sentry/cloudflare', { spy: true })

const url = `http://api.test${RPC_PATH}`

/** How many Companies reached the Room layer, so a refused publish can prove it stopped there. */
let publishes = 0

const directory = (): RoomDirectory['Service'] => ({
  publish: () =>
    Effect.sync(() => {
      publishes += 1
    }).pipe(Effect.as({ code: 'AAAAAA', token: 'token' })),
  info: () => Effect.succeed({ exists: false, seats: 0 }),
})

// `FEEDBACK` and `ACCESS` are one database under two names, so the tests give both one runner.
let db: SqlRunner = sqliteRunner()
let handler = handlerFor({ feedback: db, access: db, directory: directory() })
beforeEach(() => {
  publishes = 0
  db = sqliteRunner()
  handler = handlerFor({ feedback: db, access: db, directory: directory() })
})

/**
 * Sends the RPC client's HTTP requests straight to the Worker entry module, so
 * the test covers request encoding, routing, the handler, and error mapping.
 */
const fetchThroughWorker: typeof globalThis.fetch = async (input, init) => {
  const request = new Request(input, init)
  return handler.handler(request)
}

const protocol = RpcClient.layerProtocolHttp({ url }).pipe(
  Layer.provide(RpcSerialization.layerJson),
  Layer.provide(FetchHttpClient.layer),
)

const run = <A, E>(effect: Effect.Effect<A, E, RpcClient.Protocol | Scope.Scope>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(protocol),
      Effect.provideService(FetchHttpClient.Fetch, fetchThroughWorker),
      Effect.scoped,
    ),
  )

const client = RpcClient.make(Api)

const DEVICE = '0b6f2f0e-5d0c-4b1e-9a51-1f5c2a7d9e10'

test('the API Worker serves the shared RPC contract over HTTP', async () => {
  const response = await run(
    Effect.gen(function* () {
      const api = yield* client
      return yield* api.systemStatusGet()
    }),
  )

  expect(response).toEqual({ message: 'The API Worker is connected.' })
})

test('the API Worker rejects unknown paths', async () => {
  const response = await handler.handler(new Request('http://api.test/unknown', { method: 'POST' }))

  expect(response.status).toBe(404)
})

const exitOf = (overrides: Partial<SurveyExit> = {}): SurveyExit => ({
  exit: 'acquisition',
  stage: 4,
  time: 7_200,
  peak: 200_000,
  payout: 4_000_000,
  legacy: 2,
  venture: 'b2b-saas',
  mutators: [],
  perks: {},
  ...overrides,
})

const survey = (overrides: Partial<SurveySubmission> = {}) =>
  Effect.gen(function* () {
    const api = yield* client
    return yield* api.surveySubmit({
      deviceId: DEVICE,
      locale: 'en',
      exit: exitOf(),
      issues: 'The tutorial ran long.',
      likes: 'Watching the board settle.',
      ...overrides,
    })
  })

const surveyFailure = (overrides: Partial<SurveySubmission> = {}) =>
  run(Effect.flip(survey(overrides))).then((error) => ({
    tag: error._tag,
    message: error.message,
  }))

test('an Exit survey is stored, and a retry keeps the first answer', async () => {
  expect(await run(survey())).toEqual({ received: true })
  expect(await run(survey({ issues: 'A second answer.', likes: '' }))).toEqual({
    received: true,
  })
  const rows = await db
    .prepare('SELECT exit_id, issues, likes FROM survey_responses')
    .all<{ exit_id: string; issues: string; likes: string }>()
  expect(rows.results).toEqual([
    {
      exit_id: 'acquisition',
      issues: 'The tutorial ran long.',
      likes: 'Watching the board settle.',
    },
  ])
})

test('a survey that is not a real Exit fails with ApiError and stores nothing', async () => {
  expect(await surveyFailure({ exit: exitOf({ exit: 'ipo' }) })).toEqual({
    tag: 'ApiError',
    message: 'That Exit does not end a Company.',
  })
  expect(await surveyFailure({ exit: exitOf({ exit: 'nope' }) })).toEqual({
    tag: 'ApiError',
    message: 'There is no such Exit.',
  })
  expect(await surveyFailure({ exit: exitOf({ stage: 2 }) })).toEqual({
    tag: 'ApiError',
    message: 'That Exit does not match its Era.',
  })
  expect(await surveyFailure({ exit: exitOf({ legacy: 99 }) })).toEqual({
    tag: 'ApiError',
    message: 'The Exit Legacy does not match its payout.',
  })
  expect(await surveyFailure({ exit: exitOf({ venture: 'nope' }) })).toEqual({
    tag: 'ApiError',
    message: 'There is no such Venture.',
  })
  expect(await surveyFailure({ exit: exitOf({ mutators: ['nope'] }) })).toEqual({
    tag: 'ApiError',
    message: 'There is no such Mutator.',
  })
  expect(await surveyFailure({ issues: '  ', likes: '' })).toEqual({
    tag: 'ApiError',
    message: 'Write an answer to at least one question.',
  })
  expect(await surveyFailure({ deviceId: 'short' })).toEqual({
    tag: 'ApiError',
    message: 'The device id is not valid.',
  })
  const rows = await db.prepare('SELECT COUNT(*) AS n FROM survey_responses').all<{
    n: number
  }>()
  expect(rows.results[0]?.n).toBe(0)
})

test('a failing survey store reaches the client as unavailable and logs its cause', async () => {
  const cause = new Error('D1_ERROR: no such table: survey_responses')
  const broken = {
    prepare: () => {
      throw cause
    },
  } as unknown as SqlRunner
  handler = handlerFor({ feedback: broken, access: db, directory: directory() })
  const logged: Array<unknown> = []
  const capture = vi.mocked(Sentry.captureException)
  capture.mockClear()
  const spies = (['log', 'error', 'warn'] as const).map((level) =>
    vi.spyOn(console, level).mockImplementation((...args) => void logged.push(...args)),
  )
  try {
    const error = await run(Effect.flip(survey()))
    expect(error).toMatchObject({
      _tag: 'ApiError',
      message: 'Feedback is unavailable. Try again later.',
    })
  } finally {
    for (const spy of spies) spy.mockRestore()
  }
  expect(
    JSON.stringify(logged, (_, value) => (value instanceof Error ? value.message : value)),
  ).toContain('no such table')
  // The store fault is a real one, so it still reaches Sentry; the ApiError that answers the
  // client is declared, so it does not.
  expect(capture).toHaveBeenCalledTimes(1)
})

/** A row as `scripts/feature-key.ts` writes it: the key hashed, and what it unlocks. */
const addKey = (
  key: string,
  row: Readonly<{ features?: string; expiresAt?: number | null; revokedAt?: number | null }> = {},
) =>
  db
    .prepare(
      `INSERT INTO feature_keys (key_hash, features, note, created_at, expires_at, revoked_at)
        VALUES (?, ?, '', 0, ?, ?)`,
    )
    .bind(
      createHash('sha256').update(key).digest('hex'),
      row.features ?? 'multiplayer',
      row.expiresAt ?? null,
      row.revokedAt ?? null,
    )
    .all()

const keyStatus = (key: string) =>
  Effect.gen(function* () {
    const api = yield* client
    return yield* api.featureKeyCheck({ key })
  })

const keyFailure = (key: string) =>
  run(Effect.flip(keyStatus(key))).then((error) => ({
    tag: error._tag,
    message: error.message,
  }))

const roomPublish = (key: string | null) =>
  Effect.gen(function* () {
    const api = yield* client
    return yield* api.roomPublish({
      name: 'Quorum',
      game: newGame(),
      samples: [],
      wall: 1,
      key,
    })
  })

const publishFailure = (key: string | null) =>
  run(Effect.flip(roomPublish(key))).then((error) => ({
    tag: error._tag,
    message: error.message,
  }))

test('a feature key answers with the features this build knows', async () => {
  // A row may name a feature a later build adds, so this one names one a future build might.
  await addKey('K7QM-3XPA-9RTF-2WHD', { features: 'multiplayer,future-feature' })

  expect(await run(keyStatus(' k7qm-3xpa-9rtf-2whd '))).toEqual({
    key: 'K7QM-3XPA-9RTF-2WHD',
    features: ['multiplayer'],
    expiresAt: null,
  })
  expect(await keyFailure('QQQQ-QQQQ-QQQQ-QQQQ')).toEqual({
    tag: 'ApiError',
    message: 'That feature key is not valid.',
  })
  expect(await keyFailure('not-a-key')).toEqual({
    tag: 'ApiError',
    message: 'That feature key is not valid.',
  })
})

test('a refused key stays out of Sentry', async () => {
  const capture = vi.mocked(Sentry.captureException)
  capture.mockClear()

  expect(await keyFailure('QQQQ-QQQQ-QQQQ-QQQQ')).toEqual({
    tag: 'ApiError',
    message: 'That feature key is not valid.',
  })
  expect(capture).not.toHaveBeenCalled()
})

test('a revoked or expired key is no longer active', async () => {
  await addKey('AAAA-BBBB-CCCC-DDDD', { revokedAt: 1 })
  await addKey('EEEE-2222-3333-4444', { expiresAt: 1 })
  await addKey('GGGG-5555-6666-7777', { expiresAt: Date.now() + 60_000 })

  for (const key of ['AAAA-BBBB-CCCC-DDDD', 'EEEE-2222-3333-4444'])
    expect(await keyFailure(key)).toEqual({
      tag: 'ApiError',
      message: 'That feature key is no longer active.',
    })
  expect(await run(keyStatus('GGGG-5555-6666-7777'))).toMatchObject({ features: ['multiplayer'] })
})

test('an Online Room opens with an active key and never without one', async () => {
  await addKey('K7QM-3XPA-9RTF-2WHD')
  await addKey('AAAA-BBBB-CCCC-DDDD', { revokedAt: 1 })

  expect(await run(roomPublish(' k7qm-3xpa-9rtf-2whd '))).toEqual({
    code: 'AAAAAA',
    token: 'token',
  })
  expect(await publishFailure(null)).toEqual({
    tag: 'ApiError',
    message: 'A feature key is needed for that.',
  })
  expect(await publishFailure('AAAA-BBBB-CCCC-DDDD')).toEqual({
    tag: 'ApiError',
    message: 'That feature key is no longer active.',
  })
  expect(await publishFailure('QQQQ-QQQQ-QQQQ-QQQQ')).toEqual({
    tag: 'ApiError',
    message: 'That feature key is not valid.',
  })
  // Only the accepted publish reached the Room layer.
  expect(publishes).toBe(1)
})

test('a failing key store answers that features are unavailable and logs its cause', async () => {
  const cause = new Error('D1_ERROR: no such table: feature_keys')
  const broken = {
    prepare: () => {
      throw cause
    },
  } as unknown as SqlRunner
  handler = handlerFor({ feedback: db, access: broken, directory: directory() })
  const logged: Array<unknown> = []
  const spies = (['log', 'error', 'warn'] as const).map((level) =>
    vi.spyOn(console, level).mockImplementation((...args) => void logged.push(...args)),
  )
  try {
    expect(await keyFailure('K7QM-3XPA-9RTF-2WHD')).toEqual({
      tag: 'ApiError',
      message: 'Features are unavailable. Try again later.',
    })
  } finally {
    for (const spy of spies) spy.mockRestore()
  }
  expect(
    JSON.stringify(logged, (_, value) => (value instanceof Error ? value.message : value)),
  ).toContain('no such table')
})
