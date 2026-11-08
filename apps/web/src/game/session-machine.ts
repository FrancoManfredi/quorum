import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { Progress, SANDBOX_IDS } from '@quorum/simulation/sandbox'
import { ChallengeRun } from './challenge-machine.ts'
import { planState } from './machine.ts'

export const SandboxId = Schema.Literals(SANDBOX_IDS)

export const SandboxRun = Schema.Struct({
  id: Schema.NullOr(SandboxId),
  progress: Progress,
})
export type SandboxRun = typeof SandboxRun.Type

export const Session = Schema.TaggedUnion({
  Company: {},
  Sandbox: { run: SandboxRun },
  Challenge: { run: ChallengeRun },
})
export type Session = typeof Session.Type

export const SessionEvent = Schema.TaggedUnion({
  SandboxOpened: { run: SandboxRun },
  ChallengeOpened: { run: ChallengeRun },
  Closed: {},
  SandboxUpdated: { run: SandboxRun },
  ChallengeUpdated: { run: ChallengeRun },
})
export type SessionEvent = typeof SessionEvent.Type

const States = Machine.state({ states: Session.cases })
const Events = Machine.eventsFromSchemas(SessionEvent)

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

export const sessionStep = (session: Session, event: SessionEvent): Session =>
  planState(sessionMachine, session, event)
