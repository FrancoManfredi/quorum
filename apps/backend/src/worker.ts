import * as Sentry from '@sentry/cloudflare'
import { SentryEffectLogger, SentryEffectTracer } from '@sentry/effect'
import { ErrorReporter } from 'effect'
import * as HttpRouter from 'effect/http/HttpRouter'
import * as Layer from 'effect/Layer'
import * as Logger from 'effect/Logger'
import * as Tracer from 'effect/Tracer'
import { RpcSerialization, RpcServer } from 'effect/rpc'
import { Api, RPC_PATH } from '@quorum/rpc'
import { SurveyHandlers } from './contexts/survey/handlers.ts'
import { SurveyStore } from './contexts/survey/store.ts'
import { SystemHandlers } from './contexts/system/handlers.ts'
import { d1SurveyStore } from './platform/d1-survey-store.ts'
import type { SqlRunner } from './platform/sql.ts'

/**
 * The bindings `alchemy.run.ts` gives the API Worker. A `D1Database` is a `SqlRunner`.
 * `FEEDBACK` holds the Exit survey.
 * Without `SENTRY_DSN` the Sentry SDK stays off.
 */
export type Env = Readonly<{
  FEEDBACK: SqlRunner
  SENTRY_DSN?: string
  SENTRY_RELEASE?: string
}>

/**
 * Sentry gets every failure Effect reports except `ApiError`: it is the declared answer to a bad
 * request, not a fault, so it stays out of the issue list.
 */
const SentryErrors = ErrorReporter.layer(
  [
    ErrorReporter.make(({ error }) => {
      if ('_tag' in error && error._tag === 'ApiError') return
      Sentry.captureException(error)
    }),
  ],
  { mergeWithExisting: true },
)

/** Effect spans become Sentry spans, and Effect logs reach Sentry next to the console. */
const SentryLive = Layer.mergeAll(
  SentryErrors,
  Layer.succeed(Tracer.Tracer, SentryEffectTracer),
  Logger.layer([SentryEffectLogger], { mergeWithExisting: true }),
)

const handlerFor = (env: Env) =>
  HttpRouter.toWebHandler(
    RpcServer.layerHttp({
      group: Api,
      path: RPC_PATH,
      protocol: 'http',
    }).pipe(
      Layer.provide(Layer.mergeAll(SystemHandlers, SurveyHandlers)),
      Layer.provide(Layer.succeed(SurveyStore, d1SurveyStore(env.FEEDBACK))),
      Layer.provideMerge(RpcSerialization.layerJson),
      Layer.provide(SentryLive),
    ),
  )

// Built on the first request and kept for the isolate, once per database binding.
let built: Readonly<{ feedback: SqlRunner; handler: ReturnType<typeof handlerFor> }> | undefined

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    release: env.SENTRY_RELEASE,
    // Sentry owns traces; Cloudflare Workers Observability keeps logs only (see `alchemy.run.ts`).
    // A request follows the browser's choice; one without a trace header is sampled on its own.
    tracesSampler: ({ parentSampled }) => parentSampled ?? 0.1,
    initialScope: { tags: { service: 'api-worker' } },
  }),
  {
    fetch: (request: Request, env: Env): Promise<Response> => {
      if (built?.feedback !== env.FEEDBACK)
        built = { feedback: env.FEEDBACK, handler: handlerFor(env) }
      return built.handler.handler(request)
    },
  },
)
