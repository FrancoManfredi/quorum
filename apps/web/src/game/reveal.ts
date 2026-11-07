import { DOCK_GROUPS, COMPONENTS, RESEARCH } from '@quorum/simulation/catalog'
import type { DockGroup, ComponentId } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import {
  buildItems,
  drawerSize,
  has,
  isUnlocked,
  researchAffordable,
  researchReady,
  resizePrice,
} from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import type { Message } from './message.ts'
import { Reveal, offCompany, type Model } from './model.ts'
import { step as disclosureStep, type DisclosureFlow } from './disclosure-machine.ts'

/* ==========================================================================
   Progressive disclosure (GDD 15): a first Company shows each element the
   first time the game state makes it useful, one at a time, and the new
   element glows until the player uses it.
   ========================================================================== */

const ALL: ReadonlyArray<Reveal> = Reveal.literals

/** The Sandbox, Challenges, and every Company after the first Exit show everything. */
export const veteran = (model: Model): boolean =>
  offCompany(model) || model.founder.history.length > 0

export const shown = (model: Model, key: Reveal): boolean =>
  veteran(model) || model.board.disclosure.revealed.includes(key)

export const glowing = (model: Model, key: Reveal): boolean => {
  const flow = model.board.disclosure
  return flow._tag === 'Cueing' && flow.key === key && flow.left > 0
}

/** Playbooks are a Legacy feature: they appear after the first Exit. */
export const playbooksShown = (model: Model): boolean =>
  !offCompany(model) && model.founder.history.length > 0

/** The Node whose footer the resize cue points at: the bottleneck, when it can grow. */
const resizable = (game: Game, bottleneck: string | null): string | null => {
  const node = game.nodes.find((entry) => entry.id === bottleneck)
  return node &&
    node.type !== 'payments' &&
    node.life._tag !== 'Stopped' &&
    resizePrice(game, node) !== null
    ? node.id
    : null
}

const triggered = (key: Reveal, model: Model, ledger: Ledger): boolean => {
  const game = model.board.game
  switch (key) {
    case 'undo':
      return model.board.undo.length > 0
    case 'collect':
      return !has(game, 'stripe') && game.pending >= drawerSize(game, ledger.revenue) / 2
    case 'resize':
      return resizable(game, ledger.bottleneck) !== null
    case 'research':
      return researchAffordable(game)
    case 'errors':
      return ledger.errorShare > 0.001
    case 'team':
      return game.shipped.length > 0 || game.awaiting.length > 0
    case 'engineering':
      return (
        game.nodes.some((node) => node.leak > 0) ||
        game.services.some((service) => service.debt > 0)
      )
    case 'autopilot':
      return game.backlog.length >= 2
    case 'glossary':
      return model.board.tradeoff._tag !== 'Closed'
  }
}

/** Cues on controls that are always there: they only glow. */
const CUES: ReadonlyArray<Reveal> = ['collect', 'resize']

/** A new Company shows what its state already calls for at once, with no cue. */
export const revealAtStart = (model: Model, ledger: Ledger): Model => ({
  ...model,
  board: {
    ...model.board,
    disclosure: disclosureStep(model.board.disclosure, {
      _tag: 'RevealedAtStart',
      triggered: ALL.filter((key) => !CUES.includes(key) && triggered(key, model, ledger)),
    }),
  },
})

/** One UI tick: queues the triggers that fired, and shows the next one once the cue is free. */
export const advanceReveals = (model: Model, ledger: Ledger): Model => {
  if (veteran(model)) return model
  const flow = model.board.disclosure
  const pending = flow._tag === 'Queued' ? flow.pending : flow._tag === 'Cueing' ? flow.pending : []
  const fired = ALL.filter(
    (key) =>
      !flow.revealed.includes(key) && !pending.includes(key) && triggered(key, model, ledger),
  )
  return {
    ...model,
    board: {
      ...model.board,
      disclosure: disclosureStep(flow, { _tag: 'Ticked', triggered: fired }),
    },
  }
}

/** What using each element looks like. */
const USES: Partial<Record<Message['_tag'], (message: Message) => Reveal | null>> = {
  UndoChosen: () => 'undo',
  Collected: () => 'collect',
  ResizeChosen: () => 'resize',
  TaskQueued: () => 'engineering',
  AuthMoveQueued: () => 'engineering',
  AutopilotToggled: () => 'autopilot',
  GlossaryOpened: () => 'glossary',
  PanelOpened: (message) =>
    message._tag === 'PanelOpened' && (message.panel === 'research' || message.panel === 'team')
      ? message.panel
      : null,
}

/** Using an element shows it for good and ends its glow. */
export const noticed = (model: Model, message: Message): Model => {
  const key = USES[message._tag]?.(message) ?? null
  if (key === null || veteran(model)) return model
  return {
    ...model,
    board: {
      ...model.board,
      disclosure: disclosureStep(model.board.disclosure, { _tag: 'Used', key }),
    },
  }
}

/** The Node whose footer button glows on the board. */
export const cueNode = (model: Model): string | null => {
  const flow = model.board.disclosure
  if (flow._tag !== 'Cueing' || !glowing(model, flow.key)) return null
  if (flow.key === 'collect')
    return model.board.game.nodes.find((node) => node.type === 'payments')?.id ?? null
  if (flow.key === 'resize') return resizable(model.board.game, model.board.bottleneck)
  return null
}

/** What a save says about disclosure. A save from before it shows everything. */
export const revealsOfSave = (
  saved: unknown,
): Readonly<{ revealed: ReadonlyArray<Reveal>; pending: ReadonlyArray<Reveal> }> => {
  const disclosure =
    typeof saved === 'object' && saved !== null && 'disclosure' in saved ? saved.disclosure : null
  if (typeof disclosure !== 'object' || disclosure === null) return { revealed: ALL, pending: [] }
  const pick = (value: unknown): ReadonlyArray<Reveal> =>
    Array.isArray(value) ? ALL.filter((key) => value.includes(key)) : []
  return {
    revealed: pick('revealed' in disclosure ? disclosure.revealed : null),
    pending: pick('pending' in disclosure ? disclosure.pending : null),
  }
}

/** The disclosure flow a save opens on. */
export const disclosureOfSave = (saved: unknown): DisclosureFlow => {
  const { revealed, pending } = revealsOfSave(saved)
  return pending.length > 0
    ? { _tag: 'Queued', revealed, pending: [pending[0]!, ...pending.slice(1)] }
    : { _tag: 'Idle', revealed }
}

/* ---------- the build dock ---------- */

/** A group's Components the dock lists: those the player can place, then the next one to unlock. */
export const dockItems = (game: Game, group: DockGroup): ReadonlyArray<ComponentId> => {
  const items = buildItems(group)
  const placeable = items.filter((type) => isUnlocked(game, type))
  const next = items
    .filter((type) => {
      const unlock = COMPONENTS[type].unlock
      return !isUnlocked(game, type) && unlock !== null && researchReady(game, unlock)
    })
    .toSorted(
      (a, b) =>
        RESEARCH[COMPONENTS[a].unlock ?? 'stripe'].cost -
        RESEARCH[COMPONENTS[b].unlock ?? 'stripe'].cost,
    )[0]
  return next ? [...placeable, next] : placeable
}

/** The dock's groups with something to list, in order: the number keys follow it. */
export const dockGroups = (game: Game): ReadonlyArray<DockGroup> =>
  DOCK_GROUPS.map((group) => group.key).filter((key) => dockItems(game, key).length > 0)
