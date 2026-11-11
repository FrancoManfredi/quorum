import { type ComponentId } from '@quorum/simulation/catalog'
import { type Ledger } from '@quorum/simulation/ledger'
import { type Game, type Region } from '@quorum/simulation/state'
import { type SeatActivity } from '@quorum/simulation/room'

/** The sounds a gesture on the board makes. The host decides how to play them. */
export type BoardSound = 'pull' | 'lift' | 'detent' | 'snap' | 'release'

export type BoardEvents = Readonly<{
  onNodeTap: (nodeId: string) => void
  onNodeMove: (nodeId: string, x: number, y: number) => void
  onFooter: (nodeId: string) => void
  onLink: (from: string, to: string) => void
  onUnlink: (from: string, to: string) => void
  onPlace: (x: number, y: number) => void
  onEmptyTap: () => void
  /** Shift-click: add a Node to the selection, or take it out. */
  onNodeToggle: (nodeId: string) => void
  /** Shift-drag on empty space: select every Node the box touches. */
  onBox: (ids: ReadonlyArray<string>, mode: 'replace' | 'add' | 'subtract') => void
  /** Where the pointer is on the Design, for the other Seats. The board sends it at most 25 times a second. */
  onCursor?: (
    at: Readonly<{
      x: number
      y: number
      region: Region
      activity: SeatActivity | null
    }>,
  ) => void
  /** The pointer left the Board or the window, so the other Seats stop drawing it. */
  onCursorGone?: () => void
  onSound?: (sound: BoardSound, pitch?: number, spatial?: boolean) => void
}>

/** A Playbook following the pointer: its Nodes relative to the top-left corner. */
export type Stamp = ReadonlyArray<
  Readonly<{ type: ComponentId; dx: number; dy: number; ghost: boolean }>
>

export type BoardState = Readonly<{
  /** Names the language of the card text, so a change redraws it. */
  locale: string
  translate: (text: string) => string
  /** A Seat's panel in this language, such as "opening the team panel". */
  translateActivity?: (activity: SeatActivity) => string
  game: Game
  ledger: Ledger
  selected: string | null
  /** Nodes picked with shift for a Playbook. */
  selection: ReadonlyArray<string>
  placing: ComponentId | null
  /** A Playbook being placed: the next click puts its top-left corner there. */
  stamp: Stamp | null
  /** Each Node's utilization, one point per 10 sim seconds. */
  history: Readonly<Record<string, ReadonlyArray<number>>>
  /** Each Node's ordinal to draw beside its card, or 0 when its kind is alone. */
  ordinals: Readonly<Record<string, number>>
  /** The region tab on show; its Nodes, and the Nodes they reach elsewhere, are drawn. */
  region: Region
  /** The company is paused: belts hold still. */
  paused: boolean
  /** The clock's speed, so the belts run as fast as the Simulation does. */
  speed: number
  /** Research covers the board: stop rendering, not the Simulation. */
  suspended: boolean
  /** The Node whose footer button glows: a disclosure cue (15 "Progressive disclosure"). */
  cue: string | null
  /** A board to watch, not to edit: the pointer only pans, and the wheel zooms only with Ctrl or Cmd. */
  readOnly?: boolean
  /** Room the host's own controls take at each edge, in pixels, when the view fits the Design. */
  inset?: Readonly<{ top: number; bottom: number; left: number }>
  /** Space kept around the Nodes when the board fits them; the game's 80 unless the host says. */
  pad?: number
  /** The smallest zoom the fit may use, for a host that shows a whole Design in a small frame. */
  minScale?: number
}>
