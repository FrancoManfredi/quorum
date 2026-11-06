import { Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { DragAndDrop } from '@foldkit/ui'
import { ResearchId } from '@quorum/simulation/state'
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
})
export type ResearchMessage = typeof ResearchMessage.Type

export const ResearchOutMessage = defineMessageUnion({
  Study: { id: ResearchId },
  /** A drop puts a Study at this position in the queue. */
  MovedTo: { id: ResearchId, index: Schema.Finite },
  Move: { id: ResearchId, direction: Schema.Literals([1, -1]) },
  StudyNow: { id: ResearchId },
  Cancel: { id: ResearchId },
})
export type ResearchOutMessage = typeof ResearchOutMessage.Type

export const EMPTY_RESEARCH: Research = {
  focus: null,
  drag: DragAndDrop.init({ id: STUDY_QUEUE }),
}

type ResearchReturn = Update.ReturnWithOutMessage<Research, ResearchMessage, ResearchOutMessage>

const out = (research: Research, outMessage: ResearchOutMessage): ResearchReturn => ({
  model: research,
  outMessage,
})

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
  const index = drop.toIndex > drop.fromIndex ? drop.toIndex - 1 : drop.toIndex
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
  })
