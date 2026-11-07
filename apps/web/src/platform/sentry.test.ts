import { expect, test, vi } from 'vitest'
import * as Sentry from '@sentry/browser'

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  close: vi.fn(),
  metrics: { distribution: vi.fn() },
  browserTracingIntegration: vi.fn(),
  browserProfilingIntegration: vi.fn(),
  getActiveSpan: vi.fn(),
}))

const capture = vi.mocked(Sentry.captureException)

const report = async (
  error: Readonly<{ _tag: string; message: string }>,
): Promise<Readonly<{ error: Error; options: Record<string, unknown> }>> => {
  vi.stubEnv('VITE_SENTRY_DSN', 'https://public@example.com/1')
  vi.resetModules()
  const { reportSurveyFailure } = await import('./sentry.ts')
  reportSurveyFailure(error, { exit: 'acquisition', stage: 4 })
  vi.unstubAllEnvs()
  const call = capture.mock.calls.at(-1)
  return { error: call?.[0] as Error, options: (call?.[1] ?? {}) as Record<string, unknown> }
}

test('a rejected survey reports its sentence and labels, never the answers', async () => {
  const { error, options } = await report({
    _tag: 'ApiError',
    message: 'The Exit Legacy does not match its payout.',
  })
  expect(error).toBeInstanceOf(Error)
  expect(error.message).toBe('The Exit Legacy does not match its payout.')
  expect(options).toMatchObject({
    level: 'error',
    tags: { survey: 'rejected', exit: 'acquisition', era: '4' },
  })
})

test('a transport failure reports one fixed sentence, not the RPC error', async () => {
  const { error, options } = await report({
    _tag: 'RpcClientError',
    message: 'request body: {"issues":"the tutorial was long"}',
  })
  expect(error.message).toBe('The API Worker could not be reached.')
  expect(JSON.stringify(error)).not.toContain('tutorial')
  expect(options).toMatchObject({ level: 'error', tags: { survey: 'unreachable' } })
})
