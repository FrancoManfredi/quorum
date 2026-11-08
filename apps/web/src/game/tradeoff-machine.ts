import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { TradeoffOption } from '@quorum/ui/game/tradeoff'
import { PreviewFigures } from './machine-state.ts'

export const TradeoffState = Schema.TaggedUnion({
  Closed: {},
  Hovering: {
    nodeId: Schema.String,
    option: TradeoffOption,
    preview: Schema.NullOr(PreviewFigures),
  },
  Pinned: {
    nodeId: Schema.String,
    option: TradeoffOption,
    preview: Schema.NullOr(PreviewFigures),
  },
  Refused: {
    nodeId: Schema.String,
    option: TradeoffOption,
    reason: Schema.String,
  },
})
export type TradeoffState = typeof TradeoffState.Type

export const TradeoffEvent = Schema.TaggedUnion({
  Hovered: {
    nodeId: Schema.String,
    option: TradeoffOption,
  },
  PreviewComputed: {
    nodeId: Schema.String,
    option: TradeoffOption,
    preview: PreviewFigures,
  },
  Left: {},
  Chosen: {
    nodeId: Schema.String,
    option: TradeoffOption,
  },
  Confirmed: {},
  Cancelled: {},
  Refused: {
    nodeId: Schema.String,
    option: TradeoffOption,
    reason: Schema.String,
  },
})
export type TradeoffEvent = typeof TradeoffEvent.Type

const sameOption = (a: TradeoffOption, b: TradeoffOption): boolean =>
  a.kind === b.kind && a.id === b.id

const States = Machine.state({ states: TradeoffState.cases })
const Events = Machine.eventsFromSchemas(TradeoffEvent)

export const tradeoffMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Closed' },
  states: {
    Closed: {
      on: {
        Hovered: {
          target: 'Hovering',
          data: ({ event }) => ({
            _tag: 'Hovering',
            nodeId: event.nodeId,
            option: event.option,
            preview: null,
          }),
        },
        Chosen: {
          target: 'Pinned',
          data: ({ event }) => ({
            _tag: 'Pinned',
            nodeId: event.nodeId,
            option: event.option,
            preview: null,
          }),
        },
        Refused: {
          target: 'Refused',
          data: ({ event }) => ({
            _tag: 'Refused',
            nodeId: event.nodeId,
            option: event.option,
            reason: event.reason,
          }),
        },
      },
    },
    Hovering: {
      on: {
        Hovered: {
          target: 'Hovering',
          data: ({ event }) => ({
            _tag: 'Hovering',
            nodeId: event.nodeId,
            option: event.option,
            preview: null,
          }),
        },
        PreviewComputed: {
          target: 'Hovering',
          guard: ({ state, event }) =>
            state.nodeId === event.nodeId && sameOption(state.option, event.option),
          data: ({ state, event }) => ({ ...state, preview: event.preview }),
        },
        Chosen: {
          target: 'Pinned',
          data: ({ event }) => ({
            _tag: 'Pinned',
            nodeId: event.nodeId,
            option: event.option,
            preview: null,
          }),
        },
        Left: { target: 'Closed' },
        Refused: {
          target: 'Refused',
          data: ({ event }) => ({
            _tag: 'Refused',
            nodeId: event.nodeId,
            option: event.option,
            reason: event.reason,
          }),
        },
      },
    },
    Pinned: {
      on: {
        PreviewComputed: {
          target: 'Pinned',
          guard: ({ state, event }) =>
            state.nodeId === event.nodeId && sameOption(state.option, event.option),
          data: ({ state, event }) => ({ ...state, preview: event.preview }),
        },
        Confirmed: {
          target: 'Closed',
          guard: ({ state }) => state.preview !== null,
        },
        Cancelled: { target: 'Closed' },
        Refused: {
          target: 'Refused',
          data: ({ event }) => ({
            _tag: 'Refused',
            nodeId: event.nodeId,
            option: event.option,
            reason: event.reason,
          }),
        },
      },
    },
    Refused: {
      on: {
        Cancelled: { target: 'Closed' },
        Left: { target: 'Closed' },
      },
    },
  },
})

export const step = (state: TradeoffState, event: TradeoffEvent): TradeoffState =>
  planState(tradeoffMachine, state, event)
