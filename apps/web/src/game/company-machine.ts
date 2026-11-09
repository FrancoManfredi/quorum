import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { HistoryRow } from '@quorum/simulation/exit'
import { ResearchId } from '@quorum/simulation/state'
import { planState } from './machine.ts'

export const CompanyPhase = Schema.TaggedUnion({
  None: {},
  Opening: {
    id: Schema.String,
  },
  Open: {
    id: Schema.String,
  },
  Exited: {
    id: Schema.String,
    row: HistoryRow,
    researched: Schema.Array(ResearchId),
  },
})
export type CompanyPhase = typeof CompanyPhase.Type

export const CompanyPhaseEvent = Schema.TaggedUnion({
  SavesLoaded: {
    current: Schema.NullOr(Schema.String),
  },
  Open: {
    id: Schema.String,
  },
  Loaded: {
    id: Schema.String,
  },
  Failed: {
    id: Schema.String,
  },
  ExitTaken: {
    id: Schema.String,
    row: HistoryRow,
    researched: Schema.Array(ResearchId),
  },
  Closed: {},
  Deleted: {
    id: Schema.String,
  },
})
export type CompanyPhaseEvent = typeof CompanyPhaseEvent.Type

const States = Machine.state({ states: CompanyPhase.cases })
const Events = Machine.eventsFromSchemas(CompanyPhaseEvent)

export const companyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'None' },
  states: {
    None: {
      on: {
        SavesLoaded: {
          target: 'Opening',
          guard: ({ event }) => event.current !== null,
          data: ({ event }) => ({ _tag: 'Opening', id: event.current ?? '' }),
        },
        Open: {
          target: 'Opening',
          data: ({ event }) => ({ _tag: 'Opening', id: event.id }),
        },
      },
    },
    Opening: {
      on: {
        Loaded: {
          target: 'Open',
          guard: ({ state, event }) => state.id === event.id,
          data: ({ event }) => ({ _tag: 'Open', id: event.id }),
        },
        Failed: {
          target: 'None',
          guard: ({ state, event }) => state.id === event.id,
        },
        Open: {
          target: 'Opening',
          data: ({ event }) => ({ _tag: 'Opening', id: event.id }),
        },
        Deleted: {
          target: 'None',
          guard: ({ state, event }) => state.id === event.id,
        },
      },
    },
    Open: {
      on: {
        ExitTaken: {
          target: 'Exited',
          data: ({ state, event }) => ({
            _tag: 'Exited',
            id: state.id,
            row: event.row,
            researched: event.researched,
          }),
        },
        Open: {
          target: 'Opening',
          data: ({ event }) => ({ _tag: 'Opening', id: event.id }),
        },
        Closed: { target: 'None' },
        Deleted: {
          target: 'None',
          guard: ({ state, event }) => state.id === event.id,
        },
      },
    },
    Exited: {
      on: {
        Closed: { target: 'None' },
        Deleted: { target: 'None' },
      },
    },
  },
})

export const step = (phase: CompanyPhase, event: CompanyPhaseEvent): CompanyPhase =>
  planState(companyMachine, phase, event)

export const opened = (phase: CompanyPhase, id: string): CompanyPhase =>
  step(step(phase, { _tag: 'Open', id }), { _tag: 'Loaded', id })

export const companyIdOf = (phase: CompanyPhase): string | null =>
  CompanyPhase.match(phase, {
    None: () => null,
    Opening: ({ id }) => id,
    Open: ({ id }) => id,
    Exited: ({ id }) => id,
  })

export const isOpen = CompanyPhase.guards.Open

export const isExited = CompanyPhase.guards.Exited

export const isPlaying = CompanyPhase.guards.Open
