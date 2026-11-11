import { type SeatActivity } from '@quorum/simulation/room'
import { BoardController } from './controller.ts'
import { type SeatCursor } from './cursors.ts'
import { resetPalette } from './palette.ts'
import type { BoardEvents, BoardState } from './types.ts'

export type { BoardEvents, BoardSound, BoardState, Stamp } from './types.ts'

/** Latest state per board, written by update and read on mount. */
const desired = new Map<string, BoardState>()
const controllers = new Map<string, BoardController>()

export const setBoard = (key: string, state: BoardState): void => {
  desired.set(key, state)
  controllers.get(key)?.draw(state)
}

export const fitBoard = (key: string): void => controllers.get(key)?.fit()

/** Centers the view on a Node after a reveal, zooming in if the Board was far out. */
export const focusBoard = (key: string, nodeId: string): void => controllers.get(key)?.focus(nodeId)

/** The theme changed: resolve the tokens again and redraw every card in the new palette. */
export const repaintBoards = (): void => {
  resetPalette()
  for (const controller of controllers.values()) controller.repaint()
}

const hasWebgl = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const attachBoard = (key: string, host: HTMLElement, events: BoardEvents): (() => void) => {
  if (!hasWebgl()) {
    host.dataset['boardUnavailable'] = 'webgl'
    return () => undefined
  }
  const controller = new BoardController(host, events)
  controllers.set(key, controller)
  controller.start(desired.get(key)).catch((error: unknown) => {
    console.error(`Quorum: the "${key}" board failed to start`, error)
    host.dataset['boardUnavailable'] = 'error'
    events.onStartFailed?.(error)
  })
  return () => {
    controller.destroy()
    if (controllers.get(key) === controller) controllers.delete(key)
  }
}

/** Another Seat's pointer moved: the Board at `key` draws it. */
export const moveSeatCursor = (key: string, cursor: SeatCursor): void => {
  controllers.get(key)?.moveSeatCursor(cursor)
}

/** Another Seat's pointer is gone: the Board at `key` stops drawing it. */
export const hideSeatCursor = (key: string, seat: string): void => {
  controllers.get(key)?.hideSeatCursor(seat)
}

/** The Room is over: no Seat's pointer stays on the Board. */
export const clearSeatCursors = (key: string): void => {
  controllers.get(key)?.clearSeatCursors()
}

/** This Seat opened or closed a panel: the other Seats hear what it is doing. */
export const setSeatActivity = (key: string, activity: SeatActivity | null): void => {
  controllers.get(key)?.setCursorActivity(activity)
}
