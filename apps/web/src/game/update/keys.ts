import { CARD_W, CLEARANCE, boxOf, freeSpot, heightOf } from '@quorum/ui/board/geometry'
import { FocusInspector, ToggleFullscreen } from '../commands.ts'
import { Message } from '../message.ts'
import {
  Model,
  confirmSellOf,
  linkFromOf,
  offCompany,
  placingOf,
  stampedPlaybook,
} from '../model.ts'
import { step as boardStep } from '../board-machine.ts'
import { isExited } from '../company-machine.ts'
import { NUDGE } from './canvas.ts'
import { PrefsMessage } from '../prefs.ts'
import { clockIn } from './shell.ts'
import { closePanel, type Dispatch, type MessageCases, type UpdateResult } from './shared.ts'
import { step as tradeoffStep } from '../tradeoff-machine.ts'
import { dockGroups, dockItems, playbooksShown, shown } from '../reveal.ts'
import { leaveExited } from './companies.ts'
import { has } from '@quorum/simulation/lookups'
import { mailKey } from './mail.ts'
import { nearestNode, type Direction } from '../viewport.ts'
import { onBoard } from '../route.ts'
import { regionView } from '@quorum/simulation/regions'

export const NUDGES: Record<string, readonly [number, number]> = {
  'Shift+ArrowUp': [0, -NUDGE],
  'Shift+ArrowDown': [0, NUDGE],
  'Shift+ArrowLeft': [-NUDGE, 0],
  'Shift+ArrowRight': [NUDGE, 0],
}

export const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

/**
 * The spot a part placed from the keyboard lands in (15 "Accessibility"): the
 * next free corner below the Design, so Enter never drops a card on another.
 */
export const keyboardSpot = (
  model: Model,
  w: number,
  h: number,
): Readonly<{ x: number; y: number }> => {
  const nodes = regionView(model.board.game, model.board.region).nodes
  const left = nodes.length > 0 ? Math.min(...nodes.map((node) => node.x)) : 0
  const bottom =
    nodes.length > 0 ? Math.max(...nodes.map((node) => node.y + heightOf(node.type))) : 0
  return freeSpot(nodes.map(boxOf), { x: left, y: bottom + CLEARANCE, w, h })
}

type KeysTag = 'KeyPressed'

export const keysHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, KeysTag> => ({
  KeyPressed: ({ key }) => {
    if (!onBoard(model.route)) return key === 'Escape' ? { model } : clockIn(model)
    // A screenshot holds the board still: Escape or the same keys leave it, and no other key
    // opens a panel over the image.
    if (model.board.screenshot)
      return key === 'Escape' || key === 'Shift+s'
        ? route(model, Message.ScreenshotToggled())
        : { model }
    if (model.panel === 'inbox') {
      const mail = mailKey(model, key, route)
      if (mail) return mail
    }
    const selected = model.board.selected
    switch (key) {
      case 'Escape': {
        if (isExited(model.companyPhase)) return leaveExited(model, 'found')
        if (confirmSellOf(model.board))
          return {
            model: {
              ...model,
              board: {
                ...model.board,
                flow: boardStep(model.board.flow, { _tag: 'SellDismissed' }),
              },
            },
          }
        if (model.board.tradeoff._tag !== 'Closed')
          return {
            model: {
              ...model,
              board: {
                ...model.board,
                tradeoff: tradeoffStep(model.board.tradeoff, { _tag: 'Cancelled' }),
              },
            },
          }
        if (model.board.insightHelp)
          return { model: { ...model, board: { ...model.board, insightHelp: false } } }
        if (linkFromOf(model.board) !== null)
          return {
            model: {
              ...model,
              board: {
                ...model.board,
                flow: boardStep(model.board.flow, { _tag: 'Cancelled' }),
              },
            },
          }
        if (model.board.flow._tag === 'Stamping' || model.board.selection.length > 0) {
          const cleared: Model = {
            ...model,
            board: {
              ...model.board,
              flow:
                model.board.flow._tag === 'Stamping'
                  ? boardStep(model.board.flow, { _tag: 'Cancelled' })
                  : model.board.flow,
              selection: [],
            },
          }
          return { model: cleared }
        }
        const next: Model =
          model.board.flow._tag !== 'Idle'
            ? {
                ...model,
                board: {
                  ...model.board,
                  flow: boardStep(model.board.flow, { _tag: 'Cancelled' }),
                },
              }
            : model.board.buildGroup !== null
              ? { ...model, board: { ...model.board, buildGroup: null } }
              : model.panel !== 'none'
                ? closePanel(model)
                : model.board.selected !== null
                  ? { ...model, board: { ...model.board, selected: null } }
                  : { ...model, panel: 'menu' }
        return { model: next }
      }
      case 'r':
        if (offCompany(model) || !shown(model, 'research')) return { model }
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'research' ? 'none' : 'research' }),
        )
      case 't':
        if (offCompany(model) || !shown(model, 'team')) return { model }
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'team' ? 'none' : 'team' }),
        )
      case 'd':
        if (!has(model.board.game, 'metrics')) return { model }
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'dashboard' ? 'none' : 'dashboard' }),
        )
      case 'p':
        if (!playbooksShown(model)) return { model }
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'playbooks' ? 'none' : 'playbooks' }),
        )
      case '?':
      case 'h':
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'help' ? 'none' : 'help' }),
        )
      case '`':
        return route(model, Message.PanelOpened({ panel: model.panel === 'dev' ? 'none' : 'dev' }))
      case 'i':
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'inbox' ? 'none' : 'inbox' }),
        )
      case '$':
        if (offCompany(model)) return { model }
        return route(
          model,
          Message.PanelOpened({ panel: model.panel === 'cost' ? 'none' : 'cost' }),
        )
      case 'm':
        return route(model, Message.PrefsChanged({ message: PrefsMessage.MuteToggled() }))
      case 'Shift+t':
        return route(model, Message.BoardTidied())
      case 'Shift+s':
        return route(model, Message.ScreenshotToggled())
      case 'Shift+f':
        return route(model, Message.BoardFitted())
      case 'l': {
        if (model.panel !== 'none') return { model }
        const from = linkFromOf(model.board)
        if (from !== null)
          return selected && selected !== from
            ? route(model, Message.LinkRequested({ from, to: selected }))
            : { model }
        return selected
          ? {
              model: {
                ...model,
                board: {
                  ...model.board,
                  flow: boardStep(model.board.flow, { _tag: 'LinkStarted', from: selected }),
                },
              },
            }
          : { model }
      }
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (model.panel !== 'none') return { model }
        const direction = ARROWS[key] ?? 'right'
        const id = nearestNode(
          regionView(model.board.game, model.board.region).nodes,
          selected,
          direction,
        )
        return id && id !== selected ? route(model, Message.NodeTapped({ nodeId: id })) : { model }
      }
      case 'Enter': {
        if (confirmSellOf(model.board)) return route(model, Message.SellConfirmed())
        if (model.panel !== 'none') return { model }
        // A part in hand (or a Playbook) lands in the next free spot: the
        // keyboard's equivalent of clicking the board (15 "Accessibility").
        const type = placingOf(model)
        if (type) {
          const spot = keyboardSpot(model, CARD_W, heightOf(type))
          return route(model, Message.NodePlaced({ x: spot.x, y: spot.y }))
        }
        const playbook = stampedPlaybook(model)
        if (playbook) {
          const spot = keyboardSpot(
            model,
            Math.max(...playbook.nodes.map((node) => node.dx)) + CARD_W,
            Math.max(...playbook.nodes.map((node) => node.dy + heightOf(node.type))),
          )
          return route(model, Message.NodePlaced({ x: spot.x, y: spot.y }))
        }
        // A keyboard link from the selected Node to the one the arrows reached.
        const from = linkFromOf(model.board)
        if (from !== null)
          return selected && selected !== from
            ? route(model, Message.LinkRequested({ from, to: selected }))
            : { model }
        // A pinned Tradeoff card's Confirm, when it has a preview to confirm.
        const card = model.board.tradeoff
        if (card._tag === 'Pinned' && card.preview !== null)
          return route(model, Message.OptionConfirmed())
        return selected ? { model, commands: [FocusInspector({})] } : { model }
      }
      case ' ':
        return route(model, Message.PauseToggled())
      case 's':
        return route(model, Message.SpeedCycled())
      case 'f':
        return { model, commands: [ToggleFullscreen({})] }
      case 'c':
        return route(model, Message.Collected())
      case 'z':
        return route(model, Message.UndoChosen())
      case 'Z':
      case 'y':
        return route(model, Message.RedoChosen())
      case 'u':
        return selected
          ? route(model, Message.ResizeChosen({ nodeId: selected, direction: 1 }))
          : { model }
      case 'Mod+a':
        return model.panel === 'none' ? route(model, Message.SelectionAll()) : { model }
      case 'Mod+c':
        return model.panel === 'none' ? route(model, Message.NodesCopied()) : { model }
      case 'Mod+x':
        return model.panel === 'none' ? route(model, Message.NodesCut()) : { model }
      case 'Mod+d':
        return model.panel === 'none' ? route(model, Message.NodesDuplicated()) : { model }
      case 'Shift+ArrowUp':
      case 'Shift+ArrowDown':
      case 'Shift+ArrowLeft':
      case 'Shift+ArrowRight': {
        if (model.panel !== 'none') return { model }
        const step = NUDGES[key] ?? [0, 0]
        return route(model, Message.NodesNudged({ dx: step[0], dy: step[1] }))
      }
      case 'Mod+v':
        return model.panel === 'none' ? route(model, Message.NodesPasted()) : { model }
      case 'Delete':
      case 'Backspace':
        return route(model, Message.SellAsked())
      default: {
        // With a group open, a digit picks that part.
        const picked = (
          model.board.buildGroup ? dockItems(model.board.game, model.board.buildGroup) : []
        )[Number(key) - 1]
        if (picked) return route(model, Message.PlacingChosen({ type: picked }))
        const group = /^[1-9]$/.test(key)
          ? dockGroups(model.board.game)[Number(key) - 1]
          : undefined
        return group ? route(model, Message.BuildGroupChosen({ group })) : { model }
      }
    }
  },
})
