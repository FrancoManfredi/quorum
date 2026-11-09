import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const LiftSample = Schema.Struct({
  exposed: Schema.Finite,
  holdout: Schema.Finite,
  step: Schema.Finite,
})
export type LiftSample = typeof LiftSample.Type

export const FeaturePhase = Schema.TaggedUnion({
  Awaiting: {},
  Live: {
    /** Effective share reaching users now; converges toward `target` as flag changes propagate. */
    rollout: Schema.Finite,
    /** The share the flag is set to; propagation moves `rollout` toward it (05 "Feature Flags"). */
    target: Schema.optional(Schema.Finite),
    adoption: Schema.Finite,
    lift: Schema.NullOr(LiftSample),
  },
})
export type FeaturePhase = typeof FeaturePhase.Type

export const FeatureEvent = Schema.TaggedUnion({
  Built: {},
  Deployed: {},
  RolloutChanged: { share: Schema.Finite },
  Adopted: { share: Schema.Finite },
  Sampled: { lift: LiftSample },
  RolledBack: {},
  Removed: {},
})
export type FeatureEvent = typeof FeatureEvent.Type

const States = Machine.state({ states: FeaturePhase.cases })
const Events = Machine.eventsFromSchemas(FeatureEvent)

export const featureMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Awaiting' },
  states: {
    Awaiting: {
      on: {
        Built: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
        Deployed: {
          target: 'Live',
          data: () => ({ _tag: 'Live', rollout: 1, target: 1, adoption: 0, lift: null }),
        },
        Removed: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
      },
    },
    Live: {
      on: {
        RolloutChanged: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, target: event.share }),
        },
        Adopted: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, adoption: event.share }),
        },
        Sampled: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, lift: event.lift }),
        },
        RolledBack: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
        Removed: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
      },
    },
  },
})

export const step = (phase: FeaturePhase, event: FeatureEvent): FeaturePhase =>
  planState(featureMachine, phase, event)

export const isLive = FeaturePhase.guards.Live

/** The flag's set share; `-1` on old saves means the effective rollout (no pending propagation). */
export const targetRolloutOf = (phase: FeaturePhase): number =>
  FeaturePhase.match(phase, {
    Awaiting: () => 0,
    Live: ({ rollout, target }) => (target === undefined || target < 0 ? rollout : target),
  })

/** The share reaching users now (effective), which propagation moves toward the target. */
export const rolloutOf = (phase: FeaturePhase): number =>
  FeaturePhase.match(phase, {
    Awaiting: () => 0,
    Live: ({ rollout }) => rollout,
  })

export const adoptionOf = (phase: FeaturePhase): number =>
  FeaturePhase.match(phase, {
    Awaiting: () => 0,
    Live: ({ adoption }) => adoption,
  })

export const liftOf = (phase: FeaturePhase): LiftSample | null =>
  FeaturePhase.match(phase, {
    Awaiting: () => null,
    Live: ({ lift }) => lift,
  })
