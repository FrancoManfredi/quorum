import { Schema } from 'effect'

/* ==========================================================================
   State schemas shared by the Model and the machines. They live here so a
   machine can own its phase union without importing the Model, which imports
   the machine. The Model re-exports every one of them.
   ========================================================================== */

/** Ticks a change must hold steady for: about 3 real seconds at four ticks a second (16 D18). */
export const STEADY_TICKS = 12
/** A change counts as settled after this many sim seconds even if it still moves. */
export const SETTLE_LIMIT = 30
/** Ticks "Stable" shows once a change settles: 2 real seconds. */
export const STABLE_TICKS = 8

/** The figures a change is measured by. */
export const Figures = Schema.Struct({
  revenue: Schema.Finite,
  latency: Schema.Finite,
  p99: Schema.Finite,
  errors: Schema.Finite,
})
export type Figures = typeof Figures.Type

/** A change the player made, settling: queues drain, caches and runtimes warm up. */
export const Change = Schema.Struct({
  label: Schema.String,
  count: Schema.Finite,
  startedAt: Schema.Finite,
  before: Figures,
  /** Revenue, served, and error share over the last few ticks, to tell when they stop moving. */
  recent: Schema.Array(
    Schema.Struct({ revenue: Schema.Finite, served: Schema.Finite, errors: Schema.Finite }),
  ),
  /** Trailing ticks the figures have held within 1%. */
  steady: Schema.Finite,
})
export type Change = typeof Change.Type

/** What a ghost run says an option does to the player's Design. */
export const PreviewFigures = Schema.Struct({
  before: Figures,
  after: Figures,
  burn: Schema.Array(Schema.Finite),
  restart: Schema.Finite,
  cash: Schema.Finite,
})
export type PreviewFigures = typeof PreviewFigures.Type

/** The result of a change, once it settled. */
export const Delta = Schema.Struct({
  id: Schema.Finite,
  label: Schema.String,
  before: Figures,
  after: Figures,
  worse: Schema.Boolean,
  shownAt: Schema.Finite,
})
export type Delta = typeof Delta.Type

/** An element a first Company shows only once it is useful (15 "Progressive disclosure"). */
export const Reveal = Schema.Literals([
  'undo',
  'collect',
  'resize',
  'research',
  'errors',
  'team',
  'engineering',
  'autopilot',
  'glossary',
])
export type Reveal = typeof Reveal.Type
