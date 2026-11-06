import { Result } from 'effect'
import * as Actions from '@quorum/simulation/actions'
import { DOCK_OF, HOME_REGION, type ComponentId, type DockGroup } from '@quorum/simulation/catalog'
import { company, link, node } from '@quorum/simulation/company'
import type { Game } from '@quorum/simulation/state'
import { nodeOrdinals, normalizeOrdinals } from '@quorum/simulation/labels'
import { solveFlow } from '@quorum/simulation/solve'
import { CARD_W, boxOf, freeSpot, heightOf } from '@quorum/ui/board/geometry'
import type { BoardState } from '@quorum/ui/board/board'

/* ==========================================================================
   The logic behind the Practice boards: a local Game, the board's selection,
   and the same Simulation actions the game's update function calls. Nothing
   here draws; practice-board.ts draws it. No rule is written here: a refused
   action comes back with the game's own refusal text.
   ========================================================================== */

export type PracticeId = 'place' | 'wire' | 'rearrange'

export type Note = Readonly<{ text: string; tone: 'ok' | 'warn' }>

export type Practice = Readonly<{
  id: PracticeId
  game: Game
  selected: string | null
  selection: ReadonlyArray<string>
  placing: ComponentId | null
  note: Note | null
  /** Links the board started with, so a cut one can be told. */
  startLinks: number
  /** Box-selected two or more Nodes. */
  grouped: boolean
  /** Moved a group of two or more Nodes. */
  groupMoved: boolean
  /** The game refused a Link because it would make a loop. */
  loopRefused: boolean
}>

export type PracticeEvent =
  | { _tag: 'Arm'; type: ComponentId | null }
  | { _tag: 'Place'; x: number; y: number }
  | { _tag: 'Link'; from: string; to: string }
  | { _tag: 'Unlink'; from: string; to: string }
  | { _tag: 'Move'; nodeId: string; x: number; y: number }
  | { _tag: 'Tap'; nodeId: string }
  | { _tag: 'Empty' }
  | { _tag: 'Toggle'; nodeId: string }
  | { _tag: 'Box'; ids: ReadonlyArray<string>; mode: 'replace' | 'add' | 'subtract' }
  | { _tag: 'Footer'; nodeId: string }

export type Goal = Readonly<{ label: string; done: boolean }>

export const TITLES: Record<PracticeId, string> = {
  place: 'Place Components',
  wire: 'Wire Nodes with Links',
  rearrange: 'Select, move and cut',
}

/** The Components a Practice dock offers: only what the board needs. */
export const DOCK: Record<PracticeId, ReadonlyArray<ComponentId>> = {
  place: ['server', 'database'],
  wire: [],
  rearrange: [],
}

export const dockGroups = (id: PracticeId): ReadonlyArray<DockGroup> => [
  ...new Set(DOCK[id].map((type) => DOCK_OF[type])),
]

export const startGame = (id: PracticeId): Game => {
  const base = company(20_261_031)
  if (id === 'place')
    return normalizeOrdinals({ ...base, nodes: [node('users', 'users', 80, 120)], links: [] })
  if (id === 'wire')
    return normalizeOrdinals({
      ...base,
      nodes: [
        node('users', 'users', 0, 40),
        node('server', 'server', 276, 0),
        node('database', 'database', 552, 0),
        node('analytics', 'analytics', 276, 260),
        node('lb-1', 'lb', 0, 300),
        node('lb-2', 'lb', 552, 300),
      ],
      links: [],
    })
  // A tangle: the Nodes sit where they were dropped, and the Links cross.
  return normalizeOrdinals({
    ...base,
    nodes: [
      node('users', 'users', 290, 300),
      node('server', 'server', 20, 260),
      node('database', 'database', 330, 20),
      node('cache', 'cache', 0, 0),
      node('analytics', 'analytics', 560, 290),
    ],
    links: [
      link('users', 'server'),
      link('server', 'cache'),
      link('server', 'database'),
      link('server', 'analytics'),
    ],
  })
}

export const start = (id: PracticeId): Practice => {
  const game = startGame(id)
  return {
    id,
    game,
    selected: null,
    selection: [],
    placing: null,
    note: null,
    startLinks: game.links.length,
    grouped: false,
    groupMoved: false,
    loopRefused: false,
  }
}

const hasLink = (game: Game, from: ComponentId, to: ComponentId): boolean =>
  game.links.some(
    (entry) =>
      game.nodes.find((n) => n.id === entry.from)?.type === from &&
      game.nodes.find((n) => n.id === entry.to)?.type === to,
  )

export const goals = (p: Practice): ReadonlyArray<Goal> => {
  const has = (type: ComponentId) => p.game.nodes.some((entry) => entry.type === type)
  if (p.id === 'place')
    return [
      { label: 'Place an App Server', done: has('server') },
      { label: 'Place a Database', done: has('database') },
    ]
  if (p.id === 'wire')
    return [
      { label: 'Link Users to App Server', done: hasLink(p.game, 'users', 'server') },
      { label: 'Link App Server to Database', done: hasLink(p.game, 'server', 'database') },
      { label: 'Link App Server to Analytics', done: hasLink(p.game, 'server', 'analytics') },
      { label: 'Link the first Load Balancer to the second', done: hasLink(p.game, 'lb', 'lb') },
      { label: 'Read the loop refusal', done: p.loopRefused },
    ]
  return [
    { label: 'Select two or more Nodes with a box', done: p.grouped },
    { label: 'Move the selected group', done: p.groupMoved },
    { label: 'Cut one Link', done: p.game.links.length < p.startLinks },
  ]
}

export const complete = (p: Practice): boolean => goals(p).every((goal) => goal.done)

const refuse = (p: Practice, refusal: Actions.Refusal): Practice => ({
  ...p,
  note: { text: Actions.describeRefusal(refusal), tone: 'warn' },
})

const regionNodes = (game: Game) => game.nodes.filter((entry) => entry.region === HOME_REGION)

/** The game's update function, reduced to the handlers a Practice board has. */
export const update = (p: Practice, event: PracticeEvent): Practice => {
  switch (event._tag) {
    case 'Arm':
      return { ...p, placing: p.placing === event.type ? null : event.type, note: null }
    case 'Place': {
      if (!p.placing) return p
      const spot = freeSpot(regionNodes(p.game).map(boxOf), {
        x: event.x,
        y: event.y,
        w: CARD_W,
        h: heightOf(p.placing),
      })
      const placed = Actions.place(p.game, p.placing, spot.x, spot.y, HOME_REGION)
      return Result.match(placed, {
        onFailure: (refusal) => ({ ...refuse(p, refusal), placing: null }),
        onSuccess: (game) => ({
          ...p,
          game,
          placing: null,
          selected: game.nodes.at(-1)?.id ?? null,
          selection: [],
          note: null,
        }),
      })
    }
    case 'Link':
      return Result.match(Actions.connect(p.game, event.from, event.to), {
        onFailure: (refusal) => ({
          ...refuse(p, refusal),
          loopRefused:
            p.loopRefused || Actions.describeRefusal(refusal) === 'That link would make a loop.',
        }),
        onSuccess: (game) => ({
          ...p,
          game,
          note:
            p.game.nodes.find((n) => n.id === event.from)?.localDb &&
            !game.nodes.find((n) => n.id === event.from)?.localDb
              ? { text: 'Postgres moved off the App Server to its own Database.', tone: 'ok' }
              : null,
        }),
      })
    case 'Unlink':
      return { ...p, game: Actions.disconnect(p.game, event.from, event.to), note: null }
    case 'Move': {
      const node = p.game.nodes.find((entry) => entry.id === event.nodeId)
      if (!node) return p
      // A card in a multi-selection takes the rest of it along.
      const group =
        p.selection.length > 1 && p.selection.includes(event.nodeId) ? p.selection : [event.nodeId]
      const members = p.game.nodes.filter((entry) => group.includes(entry.id))
      const others = regionNodes(p.game)
        .filter((entry) => !group.includes(entry.id))
        .map(boxOf)
      const left = Math.min(...members.map((entry) => entry.x))
      const top = Math.min(...members.map((entry) => entry.y))
      const spot = freeSpot(others, {
        x: left + event.x - node.x,
        y: top + event.y - node.y,
        w: Math.max(...members.map((entry) => entry.x + CARD_W)) - left,
        h: Math.max(...members.map((entry) => entry.y + heightOf(entry.type))) - top,
      })
      const dx = spot.x - left
      const dy = spot.y - top
      const game = members.reduce(
        (acc, entry) => Actions.move(acc, entry.id, entry.x + dx, entry.y + dy),
        p.game,
      )
      return {
        ...p,
        game,
        note: null,
        groupMoved: p.groupMoved || (group.length > 1 && (dx !== 0 || dy !== 0)),
      }
    }
    case 'Tap':
      return { ...p, selected: event.nodeId, selection: [], note: null }
    case 'Empty':
      return { ...p, selected: null, selection: [] }
    case 'Toggle': {
      const selection = p.selection.includes(event.nodeId)
        ? p.selection.filter((id) => id !== event.nodeId)
        : [
            ...p.selection,
            ...(p.selected && p.selection.length === 0 && p.selected !== event.nodeId
              ? [p.selected]
              : []),
            event.nodeId,
          ]
      return { ...p, selection, selected: null }
    }
    case 'Box': {
      const selection =
        event.mode === 'add'
          ? [...new Set([...p.selection, ...(p.selected ? [p.selected] : []), ...event.ids])]
          : event.mode === 'subtract'
            ? p.selection.filter((id) => !event.ids.includes(id))
            : [...event.ids]
      return { ...p, selection, selected: null, grouped: p.grouped || selection.length >= 2 }
    }
    case 'Footer':
      return Result.match(Actions.resize(p.game, event.nodeId, 1), {
        onFailure: (refusal) => refuse(p, refusal),
        onSuccess: (game) => ({ ...p, game, note: null }),
      })
  }
}

export const boardState = (p: Practice): BoardState => ({
  locale: 'en',
  translate: (text) => text,
  game: p.game,
  ledger: solveFlow(p.game),
  selected: p.selected,
  selection: p.selection,
  placing: p.placing,
  stamp: null,
  history: {},
  ordinals: nodeOrdinals(p.game),
  region: HOME_REGION,
  paused: true,
  suspended: false,
  cue: null,
  inset: { top: 16, bottom: 16, left: 0 },
})
