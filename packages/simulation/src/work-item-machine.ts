import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { BlockKind as BlockKindSchema } from './state.ts'

/* ==========================================================================
   A backlog item's block (18 "Blocked"). It moves, it waits on the player, or
   the player approved what it waited for and it moves again. Progress, a
   patch's deadline, and the player's answer stay on the Game's WorkItem; this
   machine only tracks what stops it.
   ========================================================================== */

/** Nothing stops it. */
export const Free = Schema.TaggedStruct('Free', {})
/** It waits on the player, who is reminded again at `remindAt`. */
export const Blocked = Schema.TaggedStruct('Blocked', {
  reason: BlockKindSchema,
  owner: Schema.String,
  at: Schema.Finite,
  remindAt: Schema.Finite,
})
/** The player approved it: it moves again, and the block never stops it twice. */
export const Approved = Schema.TaggedStruct('Approved', {
  reason: BlockKindSchema,
  owner: Schema.String,
  at: Schema.Finite,
})
export const WorkBlock = Schema.Union([Free, Blocked, Approved])
export type WorkBlock = typeof WorkBlock.Type

/** It stopped at `at` on `reason`, owned by `owner`, and reminds again at `remindAt`. */
export const BlockedEvent = Schema.TaggedStruct('Blocked', {
  reason: BlockKindSchema,
  owner: Schema.String,
  at: Schema.Finite,
  remindAt: Schema.Finite,
})
/** The player approved what it waited for. */
export const ApprovedEvent = Schema.TaggedStruct('Approved', {})
/** The player put it off: the block stays, and the owner writes again at `remindAt`. */
export const Later = Schema.TaggedStruct('Later', { remindAt: Schema.Finite })
/** A cleared block is done with. */
export const Unblocked = Schema.TaggedStruct('Unblocked', {})
export const WorkBlockEvent = Schema.Union([BlockedEvent, ApprovedEvent, Later, Unblocked])
export type WorkBlockEvent = typeof WorkBlockEvent.Type

const States = Machine.state({
  states: { Free, Blocked, Approved },
})

const Events = Machine.events({
  Blocked: {
    reason: BlockKindSchema,
    owner: Schema.String,
    at: Schema.Finite,
    remindAt: Schema.Finite,
  },
  Approved: {},
  Later: { remindAt: Schema.Finite },
  Unblocked: {},
})

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
        // The approval keeps what the block was and when it started.
        Approved: {
          target: 'Approved',
          data: ({ state }) => ({
            _tag: 'Approved',
            reason: state.reason,
            owner: state.owner,
            at: state.at,
          }),
        },
        // Later is not a no: the block stays, and only the next reminder moves.
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

/** The next block phase, or the same one when the event does not apply. */
export const step = (block: WorkBlock, event: WorkBlockEvent): WorkBlock =>
  planState(workBlockMachine, block, event)
