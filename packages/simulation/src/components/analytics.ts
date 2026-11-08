import { Effect, Schema } from 'effect'
import { def } from './define.ts'

export const SAMPLE_RATES = [0.01, 0.05, 0.1, 0.5, 1] as const
/** CPU overhead on tapped Nodes, per sample rate. */
export const SAMPLE_OVERHEAD = [0.002, 0.01, 0.02, 0.08, 0.15] as const
/** Milliseconds sampling adds to each tapped hop, per sample rate. */
export const SAMPLE_LATENCY = [0, 0.5, 1, 3, 5] as const
export const SAMPLE_STORAGE = [0.1, 0.5, 1, 5, 10] as const
/** Seconds of traces Analytics keeps, and the Storage Burn multiplier of each window. */
export const RETENTION_WINDOWS = [900, 3_600, 21_600] as const
export const RETENTION_STORAGE = [1, 2, 4] as const
/** Samples per second Analytics keeps at size 1. Each size step doubles it. */
export const ANALYTICS_CAPACITY = 4

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const analyticsGlossary: ReadonlyArray<string> = ['observability']

/** The saved properties of a analytics Node, with the defaults an old save decodes to. */
export const analyticsFields = {
  sampleRate: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0.1))),
  retention: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(900))),
} as const

export const analyticsDef = def({
  id: 'analytics',
  code: 'otel',
  name: 'Analytics',
  product: 'OpenTelemetry',
  group: 'ops',
  blurb: 'Link any Node into it. It samples that traffic and turns it into Insight.',
  cost: 40,
  burn: 0.05,
  latency: 0,
  accepts: [],
  maxOut: 0,
  tap: true,
  steps: 8,
})
