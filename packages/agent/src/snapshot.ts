import { Schema } from 'effect'
import { Game, Region, Sample } from '@quorum/simulation/state'
import { NodeSample } from './node-metrics.ts'

/* ==========================================================================
   What a browser uploads, and what the MCP server reads. The snapshot is plain
   data: no Model, no DOM, so the web app, the Worker, and the view all use it.
   ========================================================================== */

export const AgentMode = Schema.Literals(['company', 'sandbox', 'challenge'])
export type AgentMode = typeof AgentMode.Type

/** A Mail as an agent reads it: the choices are labels, never actions. */
export const AgentMailPhase = Schema.Union([
  Schema.TaggedStruct('Active', {}),
  Schema.TaggedStruct('Answered', { answer: Schema.String }),
  Schema.TaggedStruct('Resolved', {}),
])
export type AgentMailPhase = typeof AgentMailPhase.Type

export const AgentMail = Schema.Struct({
  id: Schema.Finite,
  sender: Schema.String,
  subject: Schema.String,
  time: Schema.Finite,
  read: Schema.Boolean,
  trashed: Schema.Boolean,
  spam: Schema.Boolean,
  phase: AgentMailPhase,
  actions: Schema.Array(Schema.String),
  entries: Schema.Array(Schema.Unknown),
})
export type AgentMail = typeof AgentMail.Type

export const AgentScreen = Schema.Struct({
  route: Schema.String,
  panel: Schema.String,
  region: Region,
  selectedNode: Schema.NullOr(Schema.String),
})
export type AgentScreen = typeof AgentScreen.Type

export const AgentWhatIf = Schema.Struct({
  nodeId: Schema.String,
  at: Schema.Finite,
  rows: Schema.Array(
    Schema.Struct({
      change: Schema.String,
      target: Schema.String,
      before: Schema.Finite,
      after: Schema.Finite,
    }),
  ),
})
export type AgentWhatIf = typeof AgentWhatIf.Type

/** The small part of a snapshot: everything except the sample streams. */
export const AgentHead = Schema.Struct({
  game: Schema.NullOr(Game),
  mode: AgentMode,
  screen: AgentScreen,
  paused: Schema.Boolean,
  speed: Schema.Finite,
  bottleneck: Schema.NullOr(Schema.String),
  whatIfs: Schema.NullOr(AgentWhatIf),
  /** A change detector for the Inbox, not a security hash. */
  inboxHash: Schema.String,
})
export type AgentHead = typeof AgentHead.Type

/** One incremental upload from the browser. */
export const Upload = Schema.Struct({
  v: Schema.Literal(1),
  epoch: Schema.String,
  rev: Schema.Finite,
  reset: Schema.Boolean,
  head: AgentHead,
  samples: Schema.Struct({
    /** The last sim second the server has, in absolute sample sequence. */
    from: Schema.Finite,
    /** The sim second this upload reaches. */
    to: Schema.Finite,
    items: Schema.Array(Sample),
  }),
  nodes: Schema.Struct({
    from: Schema.Finite,
    items: Schema.Record(Schema.String, Schema.Array(NodeSample)),
  }),
  /** The whole Inbox, sent only when `head.inboxHash` changes. */
  inbox: Schema.NullOr(Schema.Array(AgentMail)),
})
export type Upload = typeof Upload.Type

export const Ack = Schema.Struct({
  epoch: Schema.String,
  rev: Schema.Finite,
  sampleSeq: Schema.Finite,
  nodeTime: Schema.Finite,
  inboxHash: Schema.String,
  at: Schema.Finite,
})
export type Ack = typeof Ack.Type

export const Status = Schema.Struct({
  mode: AgentMode,
  updatedAt: Schema.Finite,
  sampleSeq: Schema.Finite,
  nodeTime: Schema.Finite,
  samples: Schema.Finite,
  nodes: Schema.Finite,
  inbox: Schema.Finite,
  epoch: Schema.String,
  rev: Schema.Finite,
})
export type Status = typeof Status.Type

/** Everything one tool call needs, assembled from the stored Room. */
export type AgentSnapshot = Readonly<{
  game: Game | null
  mode: AgentMode
  screen: AgentScreen
  paused: boolean
  speed: number
  bottleneck: string | null
  whatIfs: AgentWhatIf | null
  samples: ReadonlyArray<Sample>
  nodeSamples: Readonly<Record<string, ReadonlyArray<NodeSample>>>
  inbox: ReadonlyArray<AgentMail>
  /** Wall time the server stored the snapshot. */
  updatedAt: number
}>
