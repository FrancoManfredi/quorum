import type { AgentMail, AgentSnapshot } from '@quorum/agent/snapshot'
import {
  refusal as refusalOf,
  readTool as readSnapshot,
  stateJson as snapshotJson,
} from '@quorum/agent/view'
import { boardChallenge, boardSandbox, clockPaused, type Model } from './model.ts'

/* ==========================================================================
   The web side of the agent tools: turn the Model into the plain snapshot the
   shared view reads. The update loop publishes the newest one after every
   Message, and the sync module uploads it to the Room.
   ========================================================================== */

type Input = Record<string, unknown>

let latest: AgentSnapshot | null = null

const agentMail = (mail: Model['board']['inbox']['mail'][number]): AgentMail => ({
  id: mail.id,
  sender: mail.sender,
  subject: mail.subject,
  time: mail.time,
  read: mail.read,
  trashed: mail.trashed,
  spam: mail.spam,
  phase:
    mail.phase._tag === 'Answered'
      ? { _tag: 'Answered', answer: mail.phase.answer }
      : { _tag: mail.phase._tag },
  actions: mail.actions.map((action) => action.label),
  entries: mail.entries,
})

/** The plain snapshot of the open board: no Model, no DOM, just what tools read. */
export const snapshotOfModel = (model: Model): AgentSnapshot => {
  const challenge = boardChallenge(model.board) !== null
  const sandbox = boardSandbox(model.board) !== null
  return {
    game: challenge ? null : model.board.game,
    mode: challenge ? 'challenge' : sandbox ? 'sandbox' : 'company',
    screen: {
      route: model.route._tag,
      panel: model.panel,
      region: model.board.region,
      selectedNode: model.board.selected,
    },
    paused: clockPaused(model),
    speed: model.board.clock.speed,
    bottleneck: null,
    whatIfs: model.board.whatIfs,
    samples: challenge ? [] : model.board.game.history,
    nodeSamples: challenge ? {} : model.board.nodeHistory,
    inbox: challenge ? [] : model.board.inbox.mail.map(agentMail),
    updatedAt: Date.now(),
  }
}

/** Remembers the newest snapshot. The update loop calls it after every Message. */
export const publish = (model: Model): void => {
  latest = snapshotOfModel(model)
}

/** Why an agent gets nothing, or null when it may read the board. */
export const refusal = (model: Model): string | null => refusalOf(snapshotOfModel(model))

/** Runs one tool over the newest snapshot, and returns its JSON text. */
export const readTool = (name: string, input: Input = {}): string =>
  readSnapshot(latest, name, input)

/** What the "Copy state as JSON" button copies: the same views the tools return. */
export const stateJson = (model: Model): string => snapshotJson(snapshotOfModel(model))
