import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const BlockKind = Schema.Literals(['decision', 'index', 'copy', 'size'])
export type BlockKind = typeof BlockKind.Type

export const WorkBlock = Schema.TaggedUnion({
  Free: {},
  Blocked: {
    reason: BlockKind,
    owner: Schema.String,
    at: Schema.Finite,
    remindAt: Schema.Finite,
  },
  Approved: {
    reason: BlockKind,
    owner: Schema.String,
    at: Schema.Finite,
  },
})
export type WorkBlock = typeof WorkBlock.Type

export const WorkBlockEvent = Schema.TaggedUnion({
  Blocked: {
    reason: BlockKind,
    owner: Schema.String,
    at: Schema.Finite,
    remindAt: Schema.Finite,
  },
  Approved: {},
  Later: { remindAt: Schema.Finite },
  Unblocked: {},
})
export type WorkBlockEvent = typeof WorkBlockEvent.Type

const States = Machine.state({ states: WorkBlock.cases })
const Events = Machine.eventsFromSchemas(WorkBlockEvent)

export const workBlockMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Free' },
  states: {
    Free: {
      on: {
        Blocked: {
          target: 'Blocked',
          data: ({ event }) => ({
            _tag: 'Blocked',
            reason: event.reason,
            owner: event.owner,
            at: event.at,
            remindAt: event.remindAt,
          }),
        },
      },
    },
    Blocked: {
      on: {
        Approved: {
          target: 'Approved',
          data: ({ state }) => ({
            _tag: 'Approved',
            reason: state.reason,
            owner: state.owner,
            at: state.at,
          }),
        },
        Later: {
          target: 'Blocked',
          data: ({ state, event }) => ({ ...state, remindAt: event.remindAt }),
        },
      },
    },
    Approved: {
      on: {
        Unblocked: { target: 'Free', data: () => ({ _tag: 'Free' }) },
      },
    },
  },
})

export const step = (block: WorkBlock, event: WorkBlockEvent): WorkBlock =>
  planState(workBlockMachine, block, event)
