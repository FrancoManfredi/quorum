import * as Sentry from '@sentry/browser'
import { SentryEffectTracer } from '@sentry/effect/client'
import { Layer, Option, Schema, Tracer } from 'effect'
import { Runtime } from 'foldkit'
import { API_PREFIX, ApiError } from '@quorum/rpc'
import { SIM_VERSION } from '@quorum/simulation/version'
import { crashTagsOf } from '../game/crash-context.ts'
import type { Message } from '../game/message.ts'
import type { Model } from '../game/model.ts'
import { PREFS_KEY, readStored } from '../game/storage.ts'

/* ==========================================================================
   Errors, traces, and profiles (ADR 0013). PostHog keeps the product events.
   Nothing starts without a DSN, so a clone of the repository sends nothing.
   ========================================================================== */

const DSN = import.meta.env.VITE_SENTRY_DSN
const RELEASE = import.meta.env.VITE_SENTRY_RELEASE

/**
 * Per-session and per-trace sampling. Sentry bills spans, so a trace holds only work that matters to
 * load time or smoothness, and one trace in ten is kept. The Workers follow the browser's choice.
 */
const TRACES_SAMPLE_RATE = 0.1
const PROFILE_SESSION_SAMPLE_RATE = 0.05
/** A tick runs eight times a second; one in this many is timed. */
const TICK_SAMPLE_EVERY = 16

/**
 * The same choice as the PostHog toggle ("Share anonymous usage data"), plus Do Not Track. The saved
 * Settings are read before the SDK starts, so an opted-out player never sends the page-load trace
 * or a session. Turning the toggle off later closes the client; turning it on takes a reload.
 */
const optedOut = (): boolean => {
  if (navigator.doNotTrack === '1') return true
  const raw = readStored(PREFS_KEY)
  if (raw === null) return false
  try {
    return (JSON.parse(raw) as { analytics?: unknown }).analytics === false
  } catch {
    return false
  }
}

export const setSentryConsent = (next: boolean): void => {
  if (!next) void Sentry.close()
}

export const startSentry = (): void => {
  if (!DSN || !import.meta.env.PROD || optedOut()) return
  Sentry.init({
    dsn: DSN,
    release: RELEASE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.browserProfilingIntegration()],
    tracesSampleRate: TRACES_SAMPLE_RATE,
    profileSessionSampleRate: PROFILE_SESSION_SAMPLE_RATE,
    profileLifecycle: 'trace',
    // Trace headers go to our own API only. `/q` is the PostHog proxy and must not see them.
    tracePropagationTargets: [`${API_PREFIX}/`],
    initialScope: { tags: { service: 'web', sim_version: SIM_VERSION } },
  })
}

/** Foldkit calls this after the runtime stops, before it paints the crash view. */
export const reportCrash = ({
  error,
  model,
  message,
}: Runtime.CrashContext<Model, Message>): void => {
  Sentry.captureException(error, {
    level: 'fatal',
    tags: Object.fromEntries(
      Object.entries(crashTagsOf(model, message)).map(([key, value]) => [key, String(value)]),
    ),
  })
}

/**
 * Foldkit measures update, view, and patch against a budget and calls this only for a phase over
 * it, so a healthy frame costs nothing. The Message tag says which gesture was slow.
 */
export const reportSlow = (context: Runtime.SlowContext<Model, Message>): void => {
  // An `onSlow` callback replaces Foldkit's console warning, so keep it in development.
  if (!import.meta.env.PROD) Runtime.defaultSlowCallback(context as never)
  if (!DSN) return
  const message =
    context._tag === 'Update'
      ? context.message._tag
      : context._tag === 'SubscriptionDependencies'
        ? context.subscriptionKey
        : Option.match(context.message, { onNone: () => 'none', onSome: (value) => value._tag })
  Sentry.metrics.distribution('foldkit.slow_ms', context.durationMs, {
    unit: 'millisecond',
    attributes: { phase: context._tag, message },
  })
}

/** The Board's renderer failed to start, such as under a CSP that forbids eval. */
export const reportBoardFailure = (error: unknown): void => {
  if (!DSN) return
  Sentry.captureException(error, {
    level: 'error',
    tags: { board: 'start-failed' },
  })
}

/**
 * A failed survey submission. The report carries the Exit's labels and one sentence, never the
 * answers or the RPC error: a transport error can hold the request body.
 */
export const reportSurveyFailure = (
  error: { readonly _tag: string; readonly message: string },
  exit: { readonly exit: string; readonly stage: number },
): void => {
  if (!DSN) return
  const rejected = Option.isSome(Schema.decodeUnknownOption(ApiError)(error))
  const report = new Error(rejected ? error.message : 'The API Worker could not be reached.')
  report.name = rejected ? 'SurveyRejected' : 'SurveyUnreachable'
  Sentry.captureException(report, {
    level: 'error',
    tags: {
      survey: rejected ? 'rejected' : 'unreachable',
      exit: exit.exit,
      era: String(exit.stage),
    },
    fingerprint: ['survey-submit', rejected ? 'rejected' : 'unreachable', exit.exit],
  })
}

/**
 * Foldkit wraps every Command in an Effect span named for it, with its arguments as attributes. Only
 * a Command that calls the API needs one: RPC calls inherit the trace headers from it. Every other
 * Command is local and sub-millisecond, or has its own `traced` span, so it gets an unsent span.
 * This tracer drops the attributes that are not plain values: a Command's arguments hold the whole
 * Game.
 */
const TRACED_COMMANDS = new Set(['SubmitSurvey'])
const isCommand = (name: string): boolean => /^[A-Z][A-Za-z]*$/.test(name)

const plain = (value: unknown): boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

export const tracerLayer: Layer.Layer<never> = DSN
  ? Layer.succeed(Tracer.Tracer, {
      ...SentryEffectTracer,
      span: (options) => {
        if (isCommand(options.name) && !TRACED_COMMANDS.has(options.name)) {
          return Tracer.nativeTracer.span(options)
        }
        const span = SentryEffectTracer.span(options)
        const attribute = span.attribute.bind(span)
        span.attribute = (key, value) => {
          if (plain(value)) attribute(key, value)
        }
        return span
      },
    })
  : Layer.empty

let ticks = 0

/**
 * Times one Message's `update`. Ticks are sampled into `sim.tick_ms`. No other Message gets a span:
 * an update runs in under a millisecond, and `reportSlow` already reports one over its budget.
 */
export const timedUpdate = <Result extends { readonly model: Model }>(
  message: Message,
  run: () => Result,
): Result => {
  if (!DSN) return run()
  if (message._tag === 'Ticked') {
    ticks += 1
    if (ticks % TICK_SAMPLE_EVERY !== 0) return run()
    const start = performance.now()
    const result = run()
    Sentry.metrics.distribution('sim.tick_ms', performance.now() - start, {
      unit: 'millisecond',
      attributes: { era: result.model.board.game.stage, sim_version: SIM_VERSION },
    })
    return result
  }
  return run()
}

/** One span around work that matters to load time or smoothness. Without a DSN it just runs. */
export const traced = <Result>(
  name: string,
  attributes: Record<string, string | number | boolean>,
  run: () => Result,
): Result => (DSN ? Sentry.startSpan({ name, op: 'game', attributes }, run) : run())

/** Adds attributes to the span `traced` opened. */
export const annotateSpan = (attributes: Record<string, string | number | boolean>): void => {
  if (DSN) Sentry.getActiveSpan()?.setAttributes(attributes)
}
