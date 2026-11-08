import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const serverGlossary: ReadonlyArray<string> = ['process-per-request']

export const PmMode = Schema.Literals(['static', 'dynamic', 'ondemand'])
export type PmMode = typeof PmMode.Type

export const Collector = Schema.Literals(['g1', 'parallel', 'zgc'])
export type Collector = typeof Collector.Type

export const Fanout = Schema.Literals(['pull', 'push'])
export type Fanout = typeof Fanout.Type

/** The saved properties of a server Node, with the defaults an old save decodes to. */
export const serverFields = {
  workers: Schema.Finite,
  /** Postgres runs on this App Server. Only the starting box has it. */
  localDb: Schema.Boolean,
  /** Supervised process crashes a BEAM App Server has absorbed (06 "Fault isolation"). */
  crashes: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A persistent App Server recycles its workers every so many requests (pm.max_requests, a worker killer). */
  recycle: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The App Server gzips page and read responses. */
  compress: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  pm: PmMode.pipe(Schema.withDecodingDefaultKey(Effect.succeed('static' as const))),
  /** A Java App Server's collector, and a Go App Server's GOGC. */
  collector: Collector.pipe(Schema.withDecodingDefaultKey(Effect.succeed('g1' as const))),
  gogc: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(100))),
  /** A saturated App Server drops the lowest-value kinds first (Priority load shedding). */
  shed: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A saturated App Server drops its most expensive kinds first (Graceful degradation). */
  degrade: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** An App Server sends reads that follow a write to the primary (Read-your-writes routing). */
  ryw: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  fanout: Fanout.pipe(Schema.withDecodingDefaultKey(Effect.succeed('pull' as const))),
} as const

export const serverDef = def({
  id: 'server',
  code: 'app',
  name: 'App Server',
  product: 'VM',
  group: 'compute',
  blurb: 'Runs your code. Answers requests and sends queries to the database.',
  cost: 60,
  sized: true,
  latency: 2,
  accepts: REQUEST_KINDS,
  sends: [
    'q-read',
    'q-write',
    'auth',
    'q-search',
    'blob-put',
    'task',
    'blob-get',
    'q-tx',
    'charge',
    'q-scan',
    'infer',
    'notify',
    'callout',
    'k-write',
  ],
  stack: true,
  limiting: true,
  coldStart: true,
})
