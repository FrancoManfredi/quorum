import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const NodeSpec = Schema.Record(
  Schema.String,
  Schema.Union([Schema.String, Schema.Finite, Schema.Boolean]),
)
export type NodeSpec = typeof NodeSpec.Type

export const Observed = Schema.Struct({
  nodes: Schema.Record(Schema.String, NodeSpec),
  links: Schema.Array(Schema.String),
})
export type Observed = typeof Observed.Type

export const MirrorSync = Schema.TaggedUnion({
  Applying: { readyAt: Schema.Finite },
  InSync: { seen: Schema.NullOr(Observed) },
  Drifted: {
    since: Schema.Finite,
    seen: Schema.NullOr(Observed),
  },
})
export type MirrorSync = typeof MirrorSync.Type

export const MirrorEvent = Schema.TaggedUnion({
  Applied: { readyAt: Schema.Finite },
  Landed: {},
  Observed: { observed: Observed },
  HandChanged: { at: Schema.Finite },
  Repaired: {},
})
export type MirrorEvent = typeof MirrorEvent.Type

const States = Machine.state({ states: MirrorSync.cases })
const Events = Machine.eventsFromSchemas(MirrorEvent)

export const mirrorMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'InSync', data: { seen: null } },
  states: {
    Applying: {
      on: {
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

export const step = (sync: MirrorSync, event: MirrorEvent): MirrorSync =>
  planState(mirrorMachine, sync, event)

export const isApplying = MirrorSync.guards.Applying

export const isDrifted = MirrorSync.guards.Drifted

export const seenOf = (sync: MirrorSync): Observed | null =>
  MirrorSync.match(sync, {
    Applying: () => null,
    InSync: ({ seen }) => seen,
    Drifted: ({ seen }) => seen,
  })
