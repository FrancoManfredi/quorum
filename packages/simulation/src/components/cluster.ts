import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Kubernetes bin packing: members cost this share of their Burn (05 "Kubernetes Cluster"). */
export const POD_BURN = 0.85
/**
 * Noisy neighbours: a share of a member's requests wait `NOISY_MS`. The share grows with how
 * busy the shared nodes run: half of `NOISY_SHARE` when idle, twice it at full CPU.
 */
export const NOISY_SHARE = 0.01
export const NOISY_MS = 10

/** Seconds a Cluster takes to reschedule a pod whose host died (self-healing). */
export const POD_RESCHEDULE = 30
/** Share of pod requests that fail while a forced Cluster upgrade breaks them.  */
export const UPGRADE_CRASHES = 0.3
/** Calendar quarters a Kubernetes version stays supported before the provider forces an upgrade. */
export const SUPPORTED_QUARTERS = 1
/** Engineers of Dev Hours each Cluster takes from the product teams without a Platform team (08). */
export const PLATFORM_TAX = 0.5

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const clusterGlossary: ReadonlyArray<string> = ['cold-start', 'container-orchestration']

/** The saved properties of a cluster Node, with the defaults an old save decodes to. */
export const clusterFields = {
  /** Sim time a Kubernetes Cluster was last upgraded. */
  upgradedAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

export const clusterDef = def({
  id: 'cluster',
  code: 'k8s',
  name: 'Kubernetes Cluster',
  product: 'Kubernetes',
  group: 'compute',
  blurb:
    'Link App Servers or Workers into it. They pack onto shared nodes: 15% less Burn, copies in 30 s.',
  cost: 500,
  burn: 0.1,
  latency: 0,
  accepts: [],
  maxOut: 0,
  control: true,
  unlock: 'containers',
})
