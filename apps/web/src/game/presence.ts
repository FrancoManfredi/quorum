import type { SeatActivity } from '@quorum/simulation/room'
import { copyIn } from '../i18n/messages.ts'
import type { Locale } from '../i18n/index.ts'
import type { Model, Panel } from './model.ts'

/**
 * The panels a player opens by hand. The rest, such as the end of an Era or a
 * funding offer, arrive on their own and are not something the player is doing.
 */
const PANEL_ACTIVITY: Partial<Record<Panel, SeatActivity>> = {
  room: 'room',
  research: 'research',
  team: 'team',
  playbooks: 'playbooks',
  help: 'help',
  dev: 'dev',
  menu: 'menu',
  settings: 'settings',
  inbox: 'inbox',
  dashboard: 'dashboard',
  churn: 'churn',
  mirror: 'mirror',
  cost: 'cost',
  exit: 'exit',
  challenge: 'challenge',
}

/**
 * What the other Seats should hear this Seat is doing. `undefined` means the
 * Message changed nothing about it, so the last activity stands.
 */
export const activityChange = (before: Model, after: Model): SeatActivity | null | undefined => {
  if (after.panel !== before.panel) return PANEL_ACTIVITY[after.panel] ?? null
  if (after.panel !== 'none') return undefined
  // Picking a Node opens the Inspector beside the Board.
  if (after.board.selected === before.board.selected) return undefined
  return after.board.selected === null ? null : 'inspector'
}

/** An activity in the viewer's language, such as "Opening team panel". */
export const activityIn = (locale: Locale, activity: SeatActivity): string => {
  const t = copyIn(locale).presence
  return t.opening(t[activity])
}
