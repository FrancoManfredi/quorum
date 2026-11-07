import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { Progress, SANDBOX_IDS } from '@quorum/simulation/sandbox'
import { ChallengeRun } from './challenge-machine.ts'
import { planState } from './machine.ts'

/* ==========================================================================
   What a board plays. The Company, a Sandbox and a Challenge are exclusive;
   one machine moves between them.
   ========================================================================== */

export const SandboxId = Schema.Literals(SANDBOX_IDS)

/** The Sandbox on the board: a guided one and its progress, or the free one when `id` is null. */
export const SandboxRun = Schema.Struct({
  id: Schema.NullOr(SandboxId),
  progress: Progress,
})
export type SandboxRun = typeof SandboxRun.Type

export const Company = Schema.TaggedStruct('Company', {})
export const Sandbox = Schema.TaggedStruct('Sandbox', { run: SandboxRun })
export const Challenge = Schema.TaggedStruct('Challenge', { run: ChallengeRun })
export const Session = Schema.Union([Company, Sandbox, Challenge])
export type Session = typeof Session.Type

export const SandboxOpened = Schema.TaggedStruct('SandboxOpened', { run: SandboxRun })
export const ChallengeOpened = Schema.TaggedStruct('ChallengeOpened', { run: ChallengeRun })
export const Closed = Schema.TaggedStruct('Closed', {})
export const SandboxUpdated = Schema.TaggedStruct('SandboxUpdated', { run: SandboxRun })
export const ChallengeUpdated = Schema.TaggedStruct('ChallengeUpdated', { run: ChallengeRun })
export const SessionEvent = Schema.Union([
  SandboxOpened,
  ChallengeOpened,
  Closed,
  SandboxUpdated,
  ChallengeUpdated,
])
export type SessionEvent = typeof SessionEvent.Type

const States = Machine.state({ states: { Company, Sandbox, Challenge } })

const Events = Machine.events({
  SandboxOpened: { run: SandboxRun },
  ChallengeOpened: { run: ChallengeRun },
  Closed: {},
  SandboxUpdated: { run: SandboxRun },
  ChallengeUpdated: { run: ChallengeRun },
})

export const sessionMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Company' },
  states: {
    Company: {
      on: {
        SandboxOpened: {
          target: 'Sandbox',
          data: ({ event }) => ({ run: event.run }),
        },
        ChallengeOpened: {
          target: 'Challenge',
          data: ({ event }) => ({ run: event.run }),
        },
      },
    },
    Sandbox: {
      on: {
        Closed: { target: 'Company' },
        SandboxOpened: {
          target: 'Sandbox',
          data: ({ event }) => ({ run: event.run }),
        },
        SandboxUpdated: {
          target: 'Sandbox',
          data: ({ event }) => ({ run: event.run }),
        },
        ChallengeOpened: {
          target: 'Challenge',
          data: ({ event }) => ({ run: event.run }),
        },
      },
    },
    Challenge: {
      on: {
        Closed: { target: 'Company' },
        ChallengeOpened: {
          target: 'Challenge',
          data: ({ event }) => ({ run: event.run }),
        },
        ChallengeUpdated: {
          target: 'Challenge',
          data: ({ event }) => ({ run: event.run }),
        },
        SandboxOpened: {
          target: 'Sandbox',
          data: ({ event }) => ({ run: event.run }),
        },
      },
    },
  },
})

/** The next session, or the same one when the event does not apply. */
export const sessionStep = (session: Session, event: SessionEvent): Session =>
  planState(sessionMachine, session, event)
