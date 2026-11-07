import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { LiftSample as LiftSampleSchema, type LiftSample } from './state.ts'

/* ==========================================================================
   Where a Feature stands (08 "Features"). It is built and waiting for a
   deploy, or it is live with a rollout, an adoption share, and a measured
   lift. Outcomes, the queue of waiting Features, and the A/B counts stay on
   the Game; this machine only tracks the phase and what the phase shows.
   ========================================================================== */

/** Built and waiting for the next deploy. */
export const Awaiting = Schema.TaggedStruct('Awaiting', {})
/** Live for `rollout` of users, adopted by `adoption` of them, at a measured `lift`. */
export const Live = Schema.TaggedStruct('Live', {
  rollout: Schema.Finite,
  adoption: Schema.Finite,
  lift: Schema.NullOr(LiftSampleSchema),
})
export const FeaturePhase = Schema.Union([Awaiting, Live])
export type FeaturePhase = typeof FeaturePhase.Type

/** A Team finished building it. */
export const Built = Schema.TaggedStruct('Built', {})
/** A deploy shipped it, so it reaches users and adoption starts at 0. */
export const Deployed = Schema.TaggedStruct('Deployed', {})
/** Its flag's rollout moved to `share`. */
export const RolloutChanged = Schema.TaggedStruct('RolloutChanged', { share: Schema.Finite })
/** Its users reached `share` adoption. */
export const Adopted = Schema.TaggedStruct('Adopted', { share: Schema.Finite })
/** Its experiment read `lift`. */
export const Sampled = Schema.TaggedStruct('Sampled', { lift: LiftSampleSchema })
/** A bad deploy rolled it back, so it waits for the next one again. */
export const RolledBack = Schema.TaggedStruct('RolledBack', {})
/** The Feature left the Company: the caller removes its entry. */
export const Removed = Schema.TaggedStruct('Removed', {})
export const FeatureEvent = Schema.Union([
  Built,
  Deployed,
  RolloutChanged,
  Adopted,
  Sampled,
  RolledBack,
  Removed,
])
export type FeatureEvent = typeof FeatureEvent.Type

const States = Machine.state({
  states: { Awaiting, Live },
})

const Events = Machine.events({
  Built: {},
  Deployed: {},
  RolloutChanged: { share: Schema.Finite },
  Adopted: { share: Schema.Finite },
  Sampled: { lift: LiftSampleSchema },
  RolledBack: {},
  Removed: {},
})

export const featureMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Awaiting' },
  states: {
    Awaiting: {
      on: {
        // A build finished again: still waiting for a deploy.
        Built: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
        Deployed: {
          target: 'Live',
          data: () => ({ _tag: 'Live', rollout: 1, adoption: 0, lift: null }),
        },
        Removed: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
      },
    },
    Live: {
      on: {
        RolloutChanged: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, rollout: event.share }),
        },
        Adopted: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, adoption: event.share }),
        },
        Sampled: {
          target: 'Live',
          data: ({ state, event }) => ({ ...state, lift: event.lift }),
        },
        // A rollback takes it out of the rotation and back onto the queue.
        RolledBack: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
        Removed: { target: 'Awaiting', data: () => ({ _tag: 'Awaiting' }) },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: FeaturePhase, event: FeatureEvent): FeaturePhase =>
  planState(featureMachine, phase, event)

/** A deploy shipped it, so its effects reach users. */
export const isLive = (phase: FeaturePhase): boolean => phase._tag === 'Live'

/** The share of users it reaches: 0 until a deploy ships it. */
export const rolloutOf = (phase: FeaturePhase): number =>
  phase._tag === 'Live' ? phase.rollout : 0

/** The share of its effect users have adopted: 0 until a deploy ships it. */
export const adoptionOf = (phase: FeaturePhase): number =>
  phase._tag === 'Live' ? phase.adoption : 0

/** Its A/B samples since the current step, or null before a deploy and before one is read. */
export const liftOf = (phase: FeaturePhase): LiftSample | null =>
  phase._tag === 'Live' ? phase.lift : null
