import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { ComponentId } from '@quorum/simulation/state'
import { planState } from './machine.ts'

/* ==========================================================================
   What a click on the Board does. The board holds one tool at a time: a part
   in hand, a Playbook to stamp, a link to finish, or a sale to confirm. One
   state says which, so two tools can never be active together.
   ========================================================================== */

export const Idle = Schema.TaggedStruct('Idle', {})

export const Placing = Schema.TaggedStruct('Placing', {
  type: ComponentId,
})

/** The Playbook a stamp places: the Founder's by index, or the copied Nodes. */
export const StampSource = Schema.Union([Schema.Finite, Schema.Literal('clipboard')])
export type StampSource = typeof StampSource.Type

export const Stamping = Schema.TaggedStruct('Stamping', {
  source: StampSource,
})

export const Linking = Schema.TaggedStruct('Linking', {
  /** The Node a keyboard link starts from. */
  from: Schema.String,
})

export const ConfirmingSell = Schema.TaggedStruct('ConfirmingSell', {
  ids: Schema.Array(Schema.String),
})

export const BoardFlow = Schema.Union([Idle, Placing, Stamping, Linking, ConfirmingSell])
export type BoardFlow = typeof BoardFlow.Type

export const PartChosen = Schema.TaggedStruct('PartChosen', {
  type: ComponentId,
})
export const StampChosen = Schema.TaggedStruct('StampChosen', {
  source: StampSource,
})
export const Placed = Schema.TaggedStruct('Placed', {})
export const LinkStarted = Schema.TaggedStruct('LinkStarted', {
  from: Schema.String,
})
export const LinkRequested = Schema.TaggedStruct('LinkRequested', {
  to: Schema.String,
})
export const SellAsked = Schema.TaggedStruct('SellAsked', {
  ids: Schema.Array(Schema.String),
})
export const SellConfirmed = Schema.TaggedStruct('SellConfirmed', {})
export const SellDismissed = Schema.TaggedStruct('SellDismissed', {})
export const Cancelled = Schema.TaggedStruct('Cancelled', {})
export const BoardFlowEvent = Schema.Union([
  PartChosen,
  StampChosen,
  Placed,
  LinkStarted,
  LinkRequested,
  SellAsked,
  SellConfirmed,
  SellDismissed,
  Cancelled,
])
export type BoardFlowEvent = typeof BoardFlowEvent.Type

const States = Machine.state({ states: { Idle, Placing, Stamping, Linking, ConfirmingSell } })

const Events = Machine.events({
  PartChosen: { type: ComponentId },
  StampChosen: { source: StampSource },
  Placed: {},
  LinkStarted: { from: Schema.String },
  LinkRequested: { to: Schema.String },
  SellAsked: { ids: Schema.Array(Schema.String) },
  SellConfirmed: {},
  SellDismissed: {},
  Cancelled: {},
})

export const boardMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Idle' },
  states: {
    Idle: {
      on: {
        PartChosen: {
          target: 'Placing',
          data: ({ event }) => ({ _tag: 'Placing', type: event.type }),
        },
        StampChosen: {
          target: 'Stamping',
          data: ({ event }) => ({ _tag: 'Stamping', source: event.source }),
        },
        LinkStarted: {
          target: 'Linking',
          data: ({ event }) => ({ _tag: 'Linking', from: event.from }),
        },
        SellAsked: {
          target: 'ConfirmingSell',
          data: ({ event }) => ({ _tag: 'ConfirmingSell', ids: event.ids }),
        },
      },
    },
    Placing: {
      on: {
        /** Picking another part swaps the one in hand; the tool stays active. */
        PartChosen: {
          target: 'Placing',
          data: ({ event }) => ({ _tag: 'Placing', type: event.type }),
        },
        Placed: { target: 'Idle' },
        Cancelled: { target: 'Idle' },
        StampChosen: {
          target: 'Stamping',
          data: ({ event }) => ({ _tag: 'Stamping', source: event.source }),
        },
      },
    },
    Stamping: {
      on: {
        /** Picking another Playbook swaps the stamp; the tool stays active. */
        StampChosen: {
          target: 'Stamping',
          data: ({ event }) => ({ _tag: 'Stamping', source: event.source }),
        },
        Placed: { target: 'Idle' },
        Cancelled: { target: 'Idle' },
        PartChosen: {
          target: 'Placing',
          data: ({ event }) => ({ _tag: 'Placing', type: event.type }),
        },
      },
    },
    Linking: {
      on: {
        /** A link to the Node it starts from is no link at all. */
        LinkRequested: {
          target: 'Idle',
          guard: ({ state, event }) => event.to !== state.from,
        },
        Cancelled: { target: 'Idle' },
        PartChosen: {
          target: 'Placing',
          data: ({ event }) => ({ _tag: 'Placing', type: event.type }),
        },
        StampChosen: {
          target: 'Stamping',
          data: ({ event }) => ({ _tag: 'Stamping', source: event.source }),
        },
      },
    },
    ConfirmingSell: {
      on: {
        SellConfirmed: { target: 'Idle' },
        SellDismissed: { target: 'Idle' },
        Cancelled: { target: 'Idle' },
        PartChosen: {
          target: 'Placing',
          data: ({ event }) => ({ _tag: 'Placing', type: event.type }),
        },
        StampChosen: {
          target: 'Stamping',
          data: ({ event }) => ({ _tag: 'Stamping', source: event.source }),
        },
      },
    },
  },
})

/** The next tool, or the same one when the event does not apply. */
export const step = (flow: BoardFlow, event: BoardFlowEvent): BoardFlow =>
  planState(boardMachine, flow, event)

/** The Component a click places, if any. */
export const placingOf = (flow: BoardFlow): typeof ComponentId.Type | null =>
  flow._tag === 'Placing' ? flow.type : null

/** The Playbook a click stamps, if any. */
export const stampingOf = (flow: BoardFlow): StampSource | null =>
  flow._tag === 'Stamping' ? flow.source : null

/** The Node a keyboard link starts from, if any. */
export const linkFromOf = (flow: BoardFlow): string | null =>
  flow._tag === 'Linking' ? flow.from : null

/** The Nodes a sale waits on, if any. */
export const confirmSellOf = (flow: BoardFlow): ReadonlyArray<string> | null =>
  flow._tag === 'ConfirmingSell' ? flow.ids : null
