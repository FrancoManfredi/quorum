import * as Sentry from '@sentry/cloudflare'
import { SentryEffectLogger, SentryEffectTracer } from '@sentry/effect'
import { Cause, ErrorReporter, Schema } from 'effect'
import * as HttpRouter from 'effect/http/HttpRouter'
import * as Layer from 'effect/Layer'
import * as Logger from 'effect/Logger'
import * as Tracer from 'effect/Tracer'
import { RpcSerialization, RpcServer } from 'effect/rpc'
import { Api, ApiError, RPC_PATH } from '@quorum/rpc'
import { FeatureGate } from './contexts/access/gate.ts'
import { AccessHandlers } from './contexts/access/handlers.ts'
import { AccessStore } from './contexts/access/store.ts'
import { RoomDirectory } from './contexts/room/directory.ts'
import { RoomHandlers } from './contexts/room/handlers.ts'
import { SurveyHandlers } from './contexts/survey/handlers.ts'
import { SurveyStore } from './contexts/survey/store.ts'
import { SystemHandlers } from './contexts/system/handlers.ts'
import { d1AccessStore } from './platform/d1-access-store.ts'
import { d1SurveyStore } from './platform/d1-survey-store.ts'
import type { AgentRoomInstance } from './platform/agent-room.ts'
import type { RoomInstance } from './platform/room-object.ts'
import type { SqlRunner } from './platform/sql.ts'

/**
 * The bindings the stack gives the API Worker. A `D1Database` is a `SqlRunner`.
 * `FEEDBACK` holds the Exit survey, `ACCESS` the feature keys, and `ROOMS` hosts an
 * online Company. `FEEDBACK` and `ACCESS` are one database under two names, so each
 * context reads its own table without a second resource.
 */
export type Env = Readonly<{
  FEEDBACK: SqlRunner
  ACCESS: SqlRunner
  ROOMS: DurableObjectNamespace<RoomInstance>
  AGENT_ROOMS: DurableObjectNamespace<AgentRoomInstance>
  SENTRY_DSN?: string
  SENTRY_RELEASE?: string
}>

/**
 * Sentry gets every failure Effect reports except `ApiError`: it is the declared answer to a bad
 * request, not a fault, so it stays out of the issue list. The reporter hands a pretty-printed
 * copy to its callback, so the decision reads the original cause instead.
 */
const declaredAnswer = (cause: Cause.Cause<unknown>): boolean =>
  cause.reasons.every(
    (reason) =>
      Cause.isInterruptReason(reason) ||
      (Cause.isFailReason(reason) && Schema.is(ApiError)(reason.error)),
  )

const SentryErrors = ErrorReporter.layer(
  [
    ErrorReporter.make(({ cause, error }) => {
      if (declaredAnswer(cause)) return
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

/** What the RPC path needs, so a test can drive it without the Worker runtime. */
export type HandlerInput = Readonly<{
  feedback: SqlRunner
  access: SqlRunner
  directory: RoomDirectory['Service']
}>

export const handlerFor = (input: HandlerInput) =>
  HttpRouter.toWebHandler(
    RpcServer.layerHttp({
      group: Api,
      path: RPC_PATH,
      protocol: 'http',
    }).pipe(
      Layer.provide(Layer.mergeAll(SystemHandlers, SurveyHandlers, RoomHandlers, AccessHandlers)),
      Layer.provide(FeatureGate.layer),
      Layer.provide(Layer.succeed(AccessStore, d1AccessStore(input.access))),
      Layer.provide(Layer.succeed(SurveyStore, d1SurveyStore(input.feedback))),
      Layer.provide(Layer.succeed(RoomDirectory, input.directory)),
      Layer.provideMerge(RpcSerialization.layerJson),
      Layer.provide(SentryLive),
    ),
  )
