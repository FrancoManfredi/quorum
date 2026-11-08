import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { ComponentId } from '@quorum/simulation/state'
import { planState } from './machine.ts'

export const StampSource = Schema.Union([Schema.Finite, Schema.Literal('clipboard')])
export type StampSource = typeof StampSource.Type

export const BoardFlow = Schema.TaggedUnion({
  Idle: {},
  Placing: {
    type: ComponentId,
  },
  Stamping: {
    source: StampSource,
  },
  Linking: {
    from: Schema.String,
  },
  ConfirmingSell: {
    ids: Schema.Array(Schema.String),
  },
})
export type BoardFlow = typeof BoardFlow.Type

export const BoardFlowEvent = Schema.TaggedUnion({
  PartChosen: {
    type: ComponentId,
  },
  StampChosen: {
    source: StampSource,
  },
  Placed: {},
  LinkStarted: {
    from: Schema.String,
  },
  LinkRequested: {
    to: Schema.String,
  },
  SellAsked: {
    ids: Schema.Array(Schema.String),
  },
  SellConfirmed: {},
  SellDismissed: {},
  Cancelled: {},
})
export type BoardFlowEvent = typeof BoardFlowEvent.Type

const States = Machine.state({ states: BoardFlow.cases })
const Events = Machine.eventsFromSchemas(BoardFlowEvent)

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

export const step = (flow: BoardFlow, event: BoardFlowEvent): BoardFlow =>
  planState(boardMachine, flow, event)

export const placingOf = (flow: BoardFlow): typeof ComponentId.Type | null =>
  BoardFlow.match(flow, {
    Idle: () => null,
    Placing: ({ type }) => type,
    Stamping: () => null,
    Linking: () => null,
    ConfirmingSell: () => null,
  })

export const stampingOf = (flow: BoardFlow): StampSource | null =>
  BoardFlow.match(flow, {
    Idle: () => null,
    Placing: () => null,
    Stamping: ({ source }) => source,
    Linking: () => null,
    ConfirmingSell: () => null,
  })

export const linkFromOf = (flow: BoardFlow): string | null =>
  BoardFlow.match(flow, {
    Idle: () => null,
    Placing: () => null,
    Stamping: () => null,
    Linking: ({ from }) => from,
    ConfirmingSell: () => null,
  })

export const confirmSellOf = (flow: BoardFlow): ReadonlyArray<string> | null =>
  BoardFlow.match(flow, {
    Idle: () => null,
    Placing: () => null,
    Stamping: () => null,
    Linking: () => null,
    ConfirmingSell: ({ ids }) => ids,
  })
