import { Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { DragAndDrop } from '@foldkit/ui'
import { LeverKindId, ResearchId } from '@quorum/simulation/state'
import type { Research } from './model.ts'

/* The Research panel's side-pane focus, folded into the parent with foldChild.
   Buying and the Study queue change the Game, so the parent runs them. */

/** The Study queue is the drag gesture's only container. */
export const STUDY_QUEUE = 'study-queue'

export const ResearchMessage = defineMessageUnion({
  Focused: { id: ResearchId },
  Bought: { id: ResearchId },
  /** The Study queue: drag one, move one, run one now, or take one off. */
  DragChanged: { message: DragAndDrop.Message },
  StudyMoved: { id: ResearchId, direction: Schema.Literals([1, -1]) },
  StudyPrioritized: { id: ResearchId },
  StudyCancelled: { id: ResearchId },
  /** The pool deck shows every pool, or only the ones in reach. */
  PoolsToggled: {},
  /** The side pane's width, from dragging or stepping its edge. */
  SheetResized: { width: Schema.Finite },
  /** One more step on a pool's lever. */
  LeverBuilt: { kind: LeverKindId },
  /** Take a pool's lever back down one step. */
  LeverRemoved: { kind: LeverKindId },
})
export type ResearchMessage = typeof ResearchMessage.Type

export const ResearchOutMessage = defineMessageUnion({
  Study: { id: ResearchId },
  /** A drop puts a Study at this position in the queue. */
  MovedTo: { id: ResearchId, index: Schema.Finite },
  Move: { id: ResearchId, direction: Schema.Literals([1, -1]) },
  StudyNow: { id: ResearchId },
  Cancel: { id: ResearchId },
  LeverUp: { kind: LeverKindId },
  LeverDown: { kind: LeverKindId },
})
export type ResearchOutMessage = typeof ResearchOutMessage.Type

/**
 * The side pane's width: never so narrow that a cost row wraps, never so wide
 * that the tree loses the screen. The view also keeps room for the tree.
 */
export const SHEET_MIN = 280
export const SHEET_MAX = 640
export const SHEET_DEFAULT = 320

export const EMPTY_RESEARCH: Research = {
  focus: null,
  drag: DragAndDrop.init({ id: STUDY_QUEUE }),
  poolsOpen: false,
  sheetWidth: SHEET_DEFAULT,
}

type ResearchReturn = Update.ReturnWithOutMessage<Research, ResearchMessage, ResearchOutMessage>

const out = (research: Research, outMessage: ResearchOutMessage): ResearchReturn => ({
  model: research,
  outMessage,
})

/**
 * Where a drop leaves the dragged row. The component counts the dragged row where
 * it started, so taking it out of the count first turns its index into a place in
 * the queue. The view reads this too, to preview the drop before it lands.
 */
export const queueIndex = (fromIndex: number, dropIndex: number): number =>
  dropIndex > fromIndex ? dropIndex - 1 : dropIndex

/** A drop moves a Study only when it lands at a new place in the queue. */
const dragged = (research: Research, message: DragAndDrop.Message): ResearchReturn => {
  const next = DragAndDrop.update(research.drag, message)
  const drop = next.outMessage
  const moved: ResearchReturn = {
    model: { ...research, drag: next.model },
    commands: Command.mapMessages(next.commands, (child) =>
      ResearchMessage.DragChanged({ message: child }),
    ),
  }
  if (
    drop?._tag !== 'Reordered' ||
    drop.fromContainerId !== STUDY_QUEUE ||
    drop.toContainerId !== STUDY_QUEUE
  )
    return moved
  // The component's index counts the dragged item where it started; take it out first.
  const index = queueIndex(drop.fromIndex, drop.toIndex)
  return index === drop.fromIndex
    ? moved
    : {
        ...moved,
        outMessage: ResearchOutMessage.MovedTo({
          id: drop.itemId as typeof ResearchId.Type,
          index,
        }),
      }
}

export const updateResearch = (research: Research, message: ResearchMessage): ResearchReturn =>
  ResearchMessage.match<ResearchReturn>(message, {
    Focused: ({ id }) => ({ model: { ...research, focus: id } }),
    Bought: ({ id }) => out(research, ResearchOutMessage.Study({ id })),
    DragChanged: ({ message: child }) => dragged(research, child),
    StudyMoved: ({ id, direction }) => out(research, ResearchOutMessage.Move({ id, direction })),
    StudyPrioritized: ({ id }) => out(research, ResearchOutMessage.StudyNow({ id })),
    StudyCancelled: ({ id }) => out(research, ResearchOutMessage.Cancel({ id })),
    PoolsToggled: () => ({ model: { ...research, poolsOpen: !research.poolsOpen } }),
    LeverBuilt: ({ kind }) => out(research, ResearchOutMessage.LeverUp({ kind })),
    LeverRemoved: ({ kind }) => out(research, ResearchOutMessage.LeverDown({ kind })),
    SheetResized: ({ width }) => ({
      model: {
        ...research,
        sheetWidth: Math.round(Math.max(SHEET_MIN, Math.min(SHEET_MAX, width))),
      },
    }),
  })
