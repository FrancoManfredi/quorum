import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/** One Node's managed settings, as the code says them. */
export const NodeSpec = Schema.Record(
  Schema.String,
  Schema.Union([Schema.String, Schema.Finite, Schema.Boolean]),
)
export type NodeSpec = typeof NodeSpec.Type

/** A Mirror's live state as a refresh read it. */
export const Observed = Schema.Struct({
  nodes: Schema.Record(Schema.String, NodeSpec),
  links: Schema.Array(Schema.String),
})
export type Observed = typeof Observed.Type

/* ==========================================================================
   A Mirror's sync (05 "Mirror a region"). It is in sync while its live state
   matches its code, applying while an Apply waits to land, and drifted when
   the source moved ahead of the code or someone changed the Mirror by hand.
   The code, the hold, the overrides, and the computed settings stay on the
   Game's Mirror; this machine only tracks where the sync stands.
   ========================================================================== */

/** An Apply waits to land at `readyAt`; the live state is not read until it does. */
export const Applying = Schema.TaggedStruct('Applying', { readyAt: Schema.Finite })
/** The Mirror matches its code. `seen` is the last refresh, or null until one. */
export const InSync = Schema.TaggedStruct('InSync', { seen: Schema.NullOr(Observed) })
/** The Mirror moved away from its code at `since`, the first drift of this run. */
export const Drifted = Schema.TaggedStruct('Drifted', {
  since: Schema.Finite,
  seen: Schema.NullOr(Observed),
})
export const MirrorSync = Schema.Union([Applying, InSync, Drifted])
export type MirrorSync = typeof MirrorSync.Type

/** An Apply was written at `readyAt` and has not landed yet. */
export const Applied = Schema.TaggedStruct('Applied', { readyAt: Schema.Finite })
/** The waiting Apply landed. */
export const Landed = Schema.TaggedStruct('Landed', {})
/** A refresh read the Mirror's live state. */
export const ObservedEvent = Schema.TaggedStruct('Observed', { observed: Observed })
/** The Mirror changed away from its code at `at`, by hand or by the source. */
export const HandChanged = Schema.TaggedStruct('HandChanged', { at: Schema.Finite })
/** The drift was repaired without an Apply landing. */
export const Repaired = Schema.TaggedStruct('Repaired', {})
export const MirrorEvent = Schema.Union([Applied, Landed, ObservedEvent, HandChanged, Repaired])
export type MirrorEvent = typeof MirrorEvent.Type

const States = Machine.state({
  states: { Applying, InSync, Drifted },
})

const Events = Machine.events({
  Applied: { readyAt: Schema.Finite },
  Landed: {},
  Observed: { observed: Observed },
  HandChanged: { at: Schema.Finite },
  Repaired: {},
})

export const mirrorMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'InSync', data: { seen: null } },
  states: {
    Applying: {
      on: {
        // A refresh while an Apply waits cannot say what the landing will leave.
        Landed: {
          target: 'InSync',
          data: () => ({ _tag: 'InSync', seen: null }),
        },
      },
    },
    InSync: {
      on: {
        Applied: {
          target: 'Applying',
          data: ({ event }) => ({ _tag: 'Applying', readyAt: event.readyAt }),
        },
        Observed: {
          target: 'InSync',
          data: ({ event }) => ({ _tag: 'InSync', seen: event.observed }),
        },
        HandChanged: {
          target: 'Drifted',
          data: ({ state, event }) => ({
            _tag: 'Drifted',
            since: event.at,
            seen: state.seen,
          }),
        },
      },
    },
    Drifted: {
      on: {
        Applied: {
          target: 'Applying',
          data: ({ event }) => ({ _tag: 'Applying', readyAt: event.readyAt }),
        },
        // Another hand change keeps the first drift's time: GitOps waits from it.
        Observed: {
          target: 'Drifted',
          data: ({ state, event }) => ({ ...state, seen: event.observed }),
        },
        Landed: {
          target: 'InSync',
          data: () => ({ _tag: 'InSync', seen: null }),
        },
        Repaired: {
          target: 'InSync',
          data: () => ({ _tag: 'InSync', seen: null }),
        },
      },
    },
  },
})

/** The next sync phase, or the same one when the event does not apply. */
export const step = (sync: MirrorSync, event: MirrorEvent): MirrorSync =>
  planState(mirrorMachine, sync, event)

/** An Apply is waiting to land, so the live state is not read yet. */
export const isApplying = (sync: MirrorSync): sync is typeof Applying.Type =>
  sync._tag === 'Applying'

/** The Mirror is away from its code: behind, by hand, or both. */
export const isDrifted = (sync: MirrorSync): boolean => sync._tag === 'Drifted'

/** The live state the last refresh read, or null before one and while applying. */
export const seenOf = (sync: MirrorSync): Observed | null =>
  sync._tag === 'Applying' ? null : sync.seen
