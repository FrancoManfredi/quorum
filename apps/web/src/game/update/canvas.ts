import * as Actions from '@quorum/simulation/actions'
import * as Work from '@quorum/simulation/work'
import { CARD_W, boxOf, crowds, freeSpot, heightOf } from '@quorum/ui/board/geometry'
import { COMPONENTS } from '@quorum/simulation/catalog'
import { FocusInspector } from '../commands.ts'
import { Game } from '@quorum/simulation/state'
import { Message } from '../message.ts'
import { Model, placingOf, stampedPlaybook } from '../model.ts'
import { Result } from 'effect'
import { capture, SHARED, duplicate, ghostReason, placePlaybook } from '@quorum/simulation/playbook'
import { isOne } from '../../i18n/plural.ts'
import { nameIn, reasonIn, refusalIn } from '../../i18n/refusal.ts'
import { redoGame, undoGame } from '../feedback.ts'
import { regionView } from '@quorum/simulation/regions'
import {
  say,
  sync,
  withToast,
  act,
  reverse,
  nodeName,
  type Dispatch,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { type Note } from './clock.ts'

/** The Nodes an edit applies to: the multi-selection, or the one Node open. */
export const chosenIds = (model: Model): ReadonlyArray<string> =>
  model.board.selection.length > 0
    ? model.board.selection
    : model.board.selected
      ? [model.board.selected]
      : []

export const NUDGE = 16

export const countNodes = (count: number): string => (count === 1 ? '1 Node' : `${count} Nodes`)

/** Sells every Node it can. Fixed Nodes stay; it fails only when nothing sold. */
export const sellAll = (game: Game, ids: ReadonlyArray<string>): Actions.Action => {
  let next = game
  let refusal: Actions.Action = Actions.sell(game, '')
  for (const id of ids) {
    const sold = Actions.sell(next, id)
    if (Result.isSuccess(sold)) next = sold.success
    else refusal = sold
  }
  return next === game ? refusal : Result.succeed(next)
}

type CanvasTag =
  | 'BuildGroupChosen'
  | 'PlacingChosen'
  | 'NodePlaced'
  | 'NodeSampleChosen'
  | 'NodeTapped'
  | 'ServiceAssigned'
  | 'RevealNode'
  | 'NodeToggled'
  | 'SelectionBoxed'
  | 'SelectionAll'
  | 'NodesCopied'
  | 'NodesCut'
  | 'NodesPasted'
  | 'NodesDuplicated'
  | 'NodesBoxed'
  | 'NodesNudged'
  | 'SellAsked'
  | 'SellConfirmed'
  | 'SellDismissed'
  | 'SelectionCleared'
  | 'NodeMoved'
  | 'LinkRequested'
  | 'LinkCut'
  | 'EmptyTapped'
  | 'FooterPressed'
  | 'UndoChosen'
  | 'RedoChosen'

export const canvasHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, CanvasTag> => ({
  BuildGroupChosen: ({ group }) => ({
    model: {
      ...model,
      board: { ...model.board, buildGroup: model.board.buildGroup === group ? null : group },
    },
  }),

  PlacingChosen: ({ type }) => {
    // Picking a part closes its list: the board is the next step.
    const next: Model = {
      ...model,
      panel: 'none',
      board: {
        ...model.board,
        tool: type === null || placingOf(model) === type ? null : { _tag: 'Placing', type },
        buildGroup: null,
      },
    }
    return { model: next }
  },

  NodePlaced: ({ x, y }) => {
    const playbook = stampedPlaybook(model)
    // Nothing lands on a card: a drop moves to the nearest spot that keeps clear.
    const others = regionView(model.board.game, model.board.region).nodes.map(boxOf)
    if (playbook) {
      const spot = freeSpot(others, {
        x,
        y,
        w: Math.max(...playbook.nodes.map((node) => node.dx)) + CARD_W,
        h: Math.max(...playbook.nodes.map((node) => node.dy + heightOf(node.type))),
      })
      const placed = placePlaybook(model.board.game, playbook, spot.x, spot.y, model.board.region)
      return act(
        model,
        `Placed ${playbook.name}`,
        Result.map(placed, (result) => result.game),
        {
          undoable: true,
          patch: () => ({ tool: null }),
          note: () =>
            Result.match(placed, {
              onFailure: () => null,
              onSuccess: (result): Note =>
                result.ghosts.length > 0
                  ? [
                      say(model).toasts.placedSome(
                        result.placed,
                        result.ghosts.length,
                        [
                          ...new Set(
                            result.ghosts.map((ghost) => {
                              const why = ghostReason(model.board.game, ghost, model.board.region)
                              return why === null
                                ? ''
                                : nameIn(say(model), reasonIn(say(model), why))
                            }),
                          ),
                        ].join(', '),
                      ),
                      'warn',
                    ]
                  : [say(model).toasts.placedOne(playbook.name), 'ok'],
            }),
        },
      )
    }
    const type = placingOf(model)
    if (!type) return { model }
    const spot = freeSpot(others, { x, y, w: CARD_W, h: heightOf(type) })
    return act(
      model,
      `Placed ${COMPONENTS[type].name}`,
      Actions.place(model.board.game, type, spot.x, spot.y, model.board.region),
      {
        undoable: true,
        patch: (_, game) => ({ tool: null, selected: game.nodes.at(-1)?.id ?? null }),
      },
    )
  },

  NodeSampleChosen: ({ nodeId, time }) => {
    if (nodeId !== model.board.selected) return { model }
    if (time !== null && !model.board.nodeHistory[nodeId]?.some((sample) => sample.time === time))
      return { model }
    return {
      model: {
        ...model,
        board: { ...model.board, nodeSample: time === null ? null : { nodeId, time } },
      },
    }
  },

  NodeTapped: ({ nodeId }) => {
    const next: Model = {
      ...model,
      board: {
        ...model.board,
        selected: nodeId,
        selection: [],
        nodeSample: model.board.selected === nodeId ? model.board.nodeSample : null,
        tradeoff: model.board.selected === nodeId ? model.board.tradeoff : null,
      },
    }
    return { model: next }
  },

  ServiceAssigned: ({ nodeId, serviceId }) =>
    act(
      model,
      `Moved a Node to ${model.board.game.services.find((entry) => entry.id === serviceId)?.name ?? 'a Service'}`,
      Work.assignService(model.board.game, nodeId, serviceId),
    ),

  RevealNode: ({ nodeId }) => {
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    const next: Model = {
      ...model,
      panel: 'none',
      board: {
        ...model.board,
        region: node.region,
        selected: nodeId,
        selection: [],
        tool: null,
        confirmSell: null,
        nodeSample: null,
        tradeoff: null,
      },
    }
    return { model: next, commands: [sync(next, false, nodeId), FocusInspector({})] }
  },

  NodeToggled: ({ nodeId }) => {
    const selection = model.board.selection.includes(nodeId)
      ? model.board.selection.filter((id) => id !== nodeId)
      : [
          ...model.board.selection,
          ...(model.board.selected &&
          model.board.selection.length === 0 &&
          model.board.selected !== nodeId
            ? [model.board.selected]
            : []),
          nodeId,
        ]
    const next: Model = {
      ...model,
      board: { ...model.board, selection, selected: null, tradeoff: null },
    }
    return { model: next }
  },

  SelectionBoxed: ({ ids, mode }) => {
    const selection =
      mode === 'add'
        ? [
            ...new Set([
              ...model.board.selection,
              ...(model.board.selected ? [model.board.selected] : []),
              ...ids,
            ]),
          ]
        : mode === 'subtract'
          ? model.board.selection.filter((id) => !ids.includes(id))
          : [...ids]
    const next: Model = {
      ...model,
      board: { ...model.board, selection, selected: null, tradeoff: null },
    }
    return { model: next }
  },

  SelectionAll: () => {
    const ids = regionView(model.board.game, model.board.region)
      .nodes.filter((node) => !COMPONENTS[node.type].fixed && !SHARED.includes(node.type))
      .map((node) => node.id)
    if (ids.length === 0) return { model }
    const next: Model = {
      ...model,
      board: { ...model.board, selection: ids, selected: null, tradeoff: null },
    }
    return { model: next }
  },

  NodesCopied: () => {
    const playbook = capture(model.board.game, chosenIds(model), 'Nodes')
    if (!playbook) return withToast(model, say(model).toasts.selectToCopy, 'plain')
    const next: Model = { ...model, board: { ...model.board, clipboard: playbook } }
    return withToast(
      next,
      say(model).toasts.copiedNodes(
        say(model).toasts.nodes(
          playbook.nodes.length,
          isOne(model.prefs.locale, playbook.nodes.length),
        ),
      ),
      'ok',
    )
  },

  NodesCut: () => {
    const playbook = capture(model.board.game, chosenIds(model), 'Nodes')
    if (!playbook) return withToast(model, say(model).toasts.selectToCut, 'plain')
    return act(
      model,
      `Cut ${countNodes(playbook.nodes.length)}`,
      sellAll(
        model.board.game,
        playbook.nodes.map((node) => node.key),
      ),
      {
        undoable: true,
        patch: () => ({ clipboard: playbook, selected: null, selection: [] }),
      },
    )
  },

  NodesPasted: () => {
    if (!model.board.clipboard) return withToast(model, say(model).toasts.copyFirst, 'plain')
    const next: Model = {
      ...model,
      panel: 'none',
      board: {
        ...model.board,
        tool: { _tag: 'Stamping', source: 'clipboard' },
        selected: null,
        selection: [],
      },
    }
    return { model: next }
  },

  NodesDuplicated: () => {
    const playbook = capture(model.board.game, chosenIds(model), 'Nodes')
    if (!playbook) return withToast(model, say(model).toasts.selectToDuplicate, 'plain')
    const keys = playbook.nodes.map((node) => node.key)
    const chosen = model.board.game.nodes.filter((node) => keys.includes(node.id))
    const left = Math.min(...chosen.map((node) => node.x))
    const top = Math.min(...chosen.map((node) => node.y))
    const spot = freeSpot(regionView(model.board.game, model.board.region).nodes.map(boxOf), {
      x: left + 48,
      y: top + 48,
      w: Math.max(...playbook.nodes.map((node) => node.dx)) + CARD_W,
      h: Math.max(...playbook.nodes.map((node) => node.dy + heightOf(node.type))),
    })
    const placed = duplicate(model.board.game, playbook, spot.x, spot.y, model.board.region)
    return act(
      model,
      `Duplicated ${countNodes(playbook.nodes.length)}`,
      Result.map(placed, (result) => result.game),
      { undoable: true },
    )
  },

  NodesBoxed: () => {
    const ids = chosenIds(model)
    const game = model.board.game
    const boxed = game.boxes.some(
      (box) => ids.length > 0 && ids.every((id) => box.nodes.includes(id)),
    )
    return boxed
      ? act(model, 'Unboxed the Nodes', Actions.unboxNodes(game, ids), { undoable: true })
      : act(model, `Boxed ${countNodes(ids.length)}`, Actions.boxNodes(game, ids), {
          undoable: true,
        })
  },

  NodesNudged: ({ dx, dy }) => {
    const ids = chosenIds(model)
    if (ids.length === 0) return { model }
    const moving = model.board.game.nodes.filter((node) => ids.includes(node.id))
    const still = regionView(model.board.game, model.board.region)
      .nodes.filter((node) => !ids.includes(node.id))
      .map(boxOf)
    const moved = moving.map((node) => ({ ...boxOf(node), x: node.x + dx, y: node.y + dy }))
    if (moved.some((box) => still.some((other) => crowds(box, other)))) return { model }
    const game = moving.reduce(
      (current, node) => Actions.move(current, node.id, node.x + dx, node.y + dy),
      model.board.game,
    )
    const next: Model = { ...model, board: { ...model.board, game } }
    return { model: next }
  },

  SellAsked: () => {
    if (model.board.confirmSell) return route(model, Message.SellConfirmed())
    const ids = chosenIds(model)
    if (ids.length === 0) return { model }
    const sold = sellAll(model.board.game, ids)
    // Nothing to sell (fixed Nodes): say why, without asking.
    if (Result.isFailure(sold)) return withToast(model, refusalIn(say(model), sold.failure), 'warn')
    return { model: { ...model, board: { ...model.board, confirmSell: ids } } }
  },

  SellConfirmed: () => {
    const ids = model.board.confirmSell ?? []
    const cleared: Model = { ...model, board: { ...model.board, confirmSell: null } }
    return act(cleared, `Sold ${countNodes(ids.length)}`, sellAll(model.board.game, ids), {
      undoable: true,
      patch: () => ({ selected: null, selection: [], linkFrom: null }),
    })
  },

  SellDismissed: () => ({ model: { ...model, board: { ...model.board, confirmSell: null } } }),

  SelectionCleared: () => {
    const next: Model = { ...model, board: { ...model.board, selection: [] } }
    return { model: next }
  },

  NodeMoved: ({ nodeId, x, y }) => {
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    // A card in a multi-selection takes the rest of it along.
    const group =
      model.board.selection.length > 1 && model.board.selection.includes(nodeId)
        ? model.board.selection
        : [nodeId]
    const members = model.board.game.nodes.filter((entry) => group.includes(entry.id))
    const others = regionView(model.board.game, model.board.region)
      .nodes.filter((entry) => !group.includes(entry.id))
      .map(boxOf)
    const left = Math.min(...members.map((entry) => entry.x))
    const top = Math.min(...members.map((entry) => entry.y))
    const spot = freeSpot(others, {
      x: left + x - node.x,
      y: top + y - node.y,
      w: Math.max(...members.map((entry) => entry.x + CARD_W)) - left,
      h: Math.max(...members.map((entry) => entry.y + heightOf(entry.type))) - top,
    })
    const dx = spot.x - left
    const dy = spot.y - top
    const next: Model = {
      ...model,
      board: {
        ...model.board,
        game: members.reduce(
          (game, entry) => Actions.move(game, entry.id, entry.x + dx, entry.y + dy),
          model.board.game,
        ),
      },
    }
    return { model: next }
  },

  LinkRequested: ({ from, to }) =>
    act(
      model,
      `Linked ${nodeName(model.board.game, from)} to ${nodeName(model.board.game, to)}`,
      Actions.connect(model.board.game, from, to),
      {
        undoable: true,
        patch: () => ({ linkFrom: null }),
        note: (game) =>
          model.board.game.nodes.find((node) => node.id === from)?.localDb &&
          !game.nodes.find((node) => node.id === from)?.localDb
            ? [say(model).toasts.postgresMoved, 'ok']
            : null,
      },
    ),

  LinkCut: ({ from, to }) =>
    act(
      model,
      `Cut ${nodeName(model.board.game, from)} → ${nodeName(model.board.game, to)}`,
      Result.succeed(Actions.disconnect(model.board.game, from, to)),
      {
        undoable: true,
      },
    ),

  EmptyTapped: () => {
    if (model.board.selected === null && model.board.selection.length === 0) return { model }
    const next: Model = {
      ...model,
      board: { ...model.board, selected: null, selection: [], tradeoff: null, linkFrom: null },
    }
    return { model: next }
  },

  FooterPressed: ({ nodeId }) => {
    const node = model.board.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return { model }
    if (node.type === 'payments') return route(model, Message.Collected())
    if (node.life._tag === 'Stopped') return route(model, Message.ReplaceBought({ nodeId }))
    return route(model, Message.ResizeChosen({ nodeId, direction: 1 }))
  },

  UndoChosen: () => reverse(model, undoGame(model.board), 'Undid'),

  RedoChosen: () => reverse(model, redoGame(model.board), 'Redid'),
})
