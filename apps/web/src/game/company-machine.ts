import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { HistoryRow } from '@quorum/simulation/exit'
import { ResearchId } from '@quorum/simulation/state'
import { Away as AwayReport } from './machine-state.ts'
import { planState } from './machine.ts'

/* ==========================================================================
   Which Company the page is playing, and what is happening to it. The list
   has no Company open, Opening waits for the file, Open plays it, Away holds
   the offline report, and Exited keeps the last Company until the player
   leaves it. One state says which, so a load cannot land on another Company.
   ========================================================================== */

export const None = Schema.TaggedStruct('None', {})

export const Opening = Schema.TaggedStruct('Opening', {
  id: Schema.String,
})

export const Open = Schema.TaggedStruct('Open', {
  id: Schema.String,
})

export const Away = Schema.TaggedStruct('Away', {
  id: Schema.String,
  /** What happened while the player was away. */
  report: AwayReport,
})

export const Exited = Schema.TaggedStruct('Exited', {
  id: Schema.String,
  row: HistoryRow,
  /** The research the next Company could keep. */
  researched: Schema.Array(ResearchId),
})

export const CompanyPhase = Schema.Union([None, Opening, Open, Away, Exited])
export type CompanyPhase = typeof CompanyPhase.Type

export const SavesLoaded = Schema.TaggedStruct('SavesLoaded', {
  /** The Company file Continue opens, or null when there is none. */
  current: Schema.NullOr(Schema.String),
})
export const OpenCompany = Schema.TaggedStruct('Open', {
  id: Schema.String,
})
export const Loaded = Schema.TaggedStruct('Loaded', {
  id: Schema.String,
})
export const Failed = Schema.TaggedStruct('Failed', {
  id: Schema.String,
})
export const ExitTaken = Schema.TaggedStruct('ExitTaken', {
  id: Schema.String,
  row: HistoryRow,
  researched: Schema.Array(ResearchId),
})
export const AwayClosed = Schema.TaggedStruct('AwayClosed', {})
export const Closed = Schema.TaggedStruct('Closed', {})
export const Deleted = Schema.TaggedStruct('Deleted', {
  id: Schema.String,
})
export const CompanyPhaseEvent = Schema.Union([
  SavesLoaded,
  OpenCompany,
  Loaded,
  Failed,
  ExitTaken,
  AwayClosed,
  Closed,
  Deleted,
])
export type CompanyPhaseEvent = typeof CompanyPhaseEvent.Type

const States = Machine.state({ states: { None, Opening, Open, Away, Exited } })

const Events = Machine.events({
  SavesLoaded: { current: Schema.NullOr(Schema.String) },
  Open: { id: Schema.String },
  Loaded: { id: Schema.String },
  Failed: { id: Schema.String },
  ExitTaken: { id: Schema.String, row: HistoryRow, researched: Schema.Array(ResearchId) },
  AwayClosed: {},
  Closed: {},
  Deleted: { id: Schema.String },
})

export const companyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'None' },
  states: {
    None: {
      on: {
        /** Continue opens the Company file the index points at, when there is one. */
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
        /** A file that answers for another Company is stale: it does not land. */
        Loaded: {
          target: 'Open',
          guard: ({ state, event }) => state.id === event.id,
          data: ({ event }) => ({ _tag: 'Open', id: event.id }),
        },
        Failed: { target: 'None' },
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
        Closed: { target: 'None' },
        /** Deleting the Company that is open leaves nothing to play. */
        Deleted: {
          target: 'None',
          guard: ({ state, event }) => state.id === event.id,
        },
      },
    },
    Away: {
      on: {
        AwayClosed: {
          target: 'Open',
          data: ({ state }) => ({ _tag: 'Open', id: state.id }),
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

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: CompanyPhase, event: CompanyPhaseEvent): CompanyPhase =>
  planState(companyMachine, phase, event)

/** The Company the phase belongs to, or null on the list. */
export const companyIdOf = (phase: CompanyPhase): string | null =>
  phase._tag === 'None' ? null : phase.id

/** A Company is on the board. */
export const isOpen = (phase: CompanyPhase): boolean => phase._tag === 'Open'

/** The last Company exited and waits for the player to leave it. */
export const isExited = (phase: CompanyPhase): boolean => phase._tag === 'Exited'

/** The offline report is open over the Company. */
export const isAway = (phase: CompanyPhase): boolean => phase._tag === 'Away'
