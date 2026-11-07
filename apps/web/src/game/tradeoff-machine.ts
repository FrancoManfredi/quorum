import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { TradeoffOption } from '@quorum/ui/game/tradeoff'
import { PreviewFigures } from './machine-state.ts'

/* ==========================================================================
   The Tradeoff card's phases: a hover previews an option, a click pins it, and
   only a pinned card whose preview arrived can be confirmed. The machine says
   which phase allows what; applying the option is the handler's work.
   ========================================================================== */

export const Closed = Schema.TaggedStruct('Closed', {})

export const Hovering = Schema.TaggedStruct('Hovering', {
  nodeId: Schema.String,
  option: TradeoffOption,
  preview: Schema.NullOr(PreviewFigures),
})

export const Pinned = Schema.TaggedStruct('Pinned', {
  nodeId: Schema.String,
  option: TradeoffOption,
  preview: Schema.NullOr(PreviewFigures),
})

export const Refused = Schema.TaggedStruct('Refused', {
  nodeId: Schema.String,
  option: TradeoffOption,
  /** Why the option cannot be chosen. */
  reason: Schema.String,
})

export const TradeoffState = Schema.Union([Closed, Hovering, Pinned, Refused])
export type TradeoffState = typeof TradeoffState.Type

export const Hovered = Schema.TaggedStruct('Hovered', {
  nodeId: Schema.String,
  option: TradeoffOption,
})

export const PreviewComputed = Schema.TaggedStruct('PreviewComputed', {
  nodeId: Schema.String,
  option: TradeoffOption,
  preview: PreviewFigures,
})

export const Left = Schema.TaggedStruct('Left', {})

export const Chosen = Schema.TaggedStruct('Chosen', {
  nodeId: Schema.String,
  option: TradeoffOption,
})

export const Confirmed = Schema.TaggedStruct('Confirmed', {})

export const Cancelled = Schema.TaggedStruct('Cancelled', {})

/** A refusal is both a phase and an event: the same option, refused for a reason. */
export const RefusedEvent = Schema.TaggedStruct('Refused', {
  nodeId: Schema.String,
  option: TradeoffOption,
  reason: Schema.String,
})

export const TradeoffEvent = Schema.Union([
  Hovered,
  PreviewComputed,
  Left,
  Chosen,
  Confirmed,
  Cancelled,
  RefusedEvent,
])
export type TradeoffEvent = typeof TradeoffEvent.Type

/** Two options are the same when their kinds and ids agree; ids are per kind. */
const sameOption = (a: TradeoffOption, b: TradeoffOption): boolean =>
  a.kind === b.kind && a.id === b.id

const States = Machine.state({ states: { Closed, Hovering, Pinned, Refused } })

const Events = Machine.events({
  Hovered: { nodeId: Schema.String, option: TradeoffOption },
  PreviewComputed: { nodeId: Schema.String, option: TradeoffOption, preview: PreviewFigures },
  Left: {},
  Chosen: { nodeId: Schema.String, option: TradeoffOption },
  Confirmed: {},
  Cancelled: {},
  Refused: { nodeId: Schema.String, option: TradeoffOption, reason: Schema.String },
})

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
          // A ghost run for an option the player has since left does not land.
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
          // Confirm applies the option, so the card must know what it costs first.
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

/** The next phase, or the same one when the event does not apply. */
export const step = (state: TradeoffState, event: TradeoffEvent): TradeoffState =>
  planState(tradeoffMachine, state, event)
