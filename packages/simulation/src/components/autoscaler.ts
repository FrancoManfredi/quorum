import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Autoscaler (05 "Autoscaler"): seconds before a new copy serves, on VMs and in a Kubernetes Cluster. */
export const VM_REACTION = 180
export const POD_REACTION = 30
/** Seconds between two scaling actions on one Node. */
export const SCALE_COOLDOWN = 30
/** Targets, and the most copies, the player can pick. Zero copies means no max. */
export const SCALE_TARGETS = [0.4, 0.6, 0.8] as const
export const SCALE_MAXIMA = [4, 8, 16, 0] as const
/** A Node scales in when its load falls below this share of the target. */
export const SCALE_IN = 0.6
/**
 * Calendar minutes before the daily peak that Scheduled scaling provisions for it (10 "Track:
 * Infrastructure": "scale ahead of the daily peak"). Two hours is long enough for a VM to
 * boot and warm inside the lead.
 */
export const SCHEDULE_LEAD_MINUTES = 120

/** Requests per second per vCPU, and tasks per copy, that read 100% on the request-rate and queue-depth signals. */
export const SCALE_RPS_PER_VCPU = 100
export const SCALE_QUEUE_DEPTH = 100

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const autoscalerGlossary: ReadonlyArray<string> = [
  'autoscaling',
  'cold-start',
  'diurnal-traffic',
  'vertical-and-horizontal-scaling',
]

/** What an Autoscaler reads (05 "Autoscaler"): CPU, the Node's whole load, requests per copy, or queue depth. */
export const ScaleSignal = Schema.Literals(['cpu', 'load', 'rps', 'queue'])
export type ScaleSignal = typeof ScaleSignal.Type

/** The saved properties of a autoscaler Node, with the defaults an old save decodes to. */
export const autoscalerFields = {
  /** An Autoscaler's signal, target load, and copy limits. A max of 0 means none. */
  signal: ScaleSignal.pipe(Schema.withDecodingDefaultKey(Effect.succeed('cpu' as const))),
  target: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0.6))),
  minCopies: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  maxCopies: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(8))),
  /** An Autoscaler provisions for the coming daily peak (Scheduled scaling). */
  schedule: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const autoscalerDef = def({
  id: 'autoscaler',
  code: 'hpa',
  name: 'Autoscaler',
  product: 'Auto Scaling group',
  group: 'ops',
  blurb:
    'Link App Servers or Workers into it. It adds copies when they run hot and removes them when idle.',
  cost: 200,
  latency: 0,
  accepts: [],
  maxOut: 0,
  control: true,
  unlock: 'autoscaling',
})
