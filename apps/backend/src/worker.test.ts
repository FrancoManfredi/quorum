import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Scope from 'effect/Scope'
import { FetchHttpClient } from 'effect/http'
import { RpcClient, RpcSerialization } from 'effect/rpc'
import { beforeEach, expect, test, vi } from 'vitest'
import { Api, RPC_PATH, type SurveyExit, type SurveySubmission } from '@quorum/rpc'
import { RoomDirectory } from './contexts/room/directory.ts'
import { sqliteRunner } from './platform/sqlite-runner.ts'
import type { SqlRunner } from './platform/sql.ts'
import { handlerFor } from './handler.ts'

const url = `http://api.test${RPC_PATH}`

const directory = (): RoomDirectory['Service'] => ({
  publish: () => Effect.succeed({ code: 'AAAAAA', token: 'token' }),
  info: () => Effect.succeed({ exists: false, seats: 0 }),
})

let feedback: SqlRunner = sqliteRunner()
let handler = handlerFor({ feedback, directory: directory() })
beforeEach(() => {
  feedback = sqliteRunner()
  handler = handlerFor({ feedback, directory: directory() })
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
  const rows = await feedback
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
  const rows = await feedback.prepare('SELECT COUNT(*) AS n FROM survey_responses').all<{
    n: number
  }>()
  expect(rows.results[0]?.n).toBe(0)
})

test('a failing survey store reaches the client as unavailable and logs its cause', async () => {
  const cause = new Error('D1_ERROR: no such table: survey_responses')
  feedback = {
    prepare: () => {
      throw cause
    },
  } as unknown as SqlRunner
  handler = handlerFor({ feedback, directory: directory() })
  const logged: Array<unknown> = []
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
})
