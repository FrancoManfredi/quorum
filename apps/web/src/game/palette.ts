import type { IconNode } from 'lucide'
import {
  ArrowUp,
  BookCopy,
  Camera,
  ChartLine,
  ChevronsRight,
  CircleHelp,
  ClipboardPaste,
  Copy,
  CopyPlus,
  DoorOpen,
  Expand,
  FlaskConical,
  Gauge,
  Globe2,
  Layers,
  LayoutGrid,
  Link2,
  ListOrdered,
  Mail,
  Menu,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  Redo2,
  Scan,
  Scissors,
  Settings,
  SquareDashed,
  Sun,
  Trash2,
  Type,
  Undo2,
  Users,
  UsersRound,
  Volume2,
  VolumeX,
  Wallet,
  Wind,
  ZoomIn,
  ZoomOut,
} from 'lucide'
import {
  COMPONENTS,
  REGIONS,
  researchList,
  type ComponentId,
  type RegionId,
} from '@quorum/simulation/catalog'
import { has, researchReady, resizePrice } from '@quorum/simulation/lookups'
import { openRegions, regionView } from '@quorum/simulation/regions'
import { SHARED } from '@quorum/simulation/playbook'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { nodeTitle, type Messages } from '../i18n/messages.ts'
import { partOf, type Part } from './parts.ts'
import { Message } from './message.ts'
import { exitLegacy, offCompany, clockPaused, type Model, type Panel } from './model.ts'
import { ResearchMessage } from './research.ts'
import { PrefsMessage } from './prefs.ts'
import { dockGroups, dockItems, playbooksShown, shown } from './reveal.ts'
import { speedsOf } from './update/constant.ts'

/* ==========================================================================
   The command palette's rows. Every row carries the Message a click sends, so
   running a row runs exactly the code the control does; nothing here reaches
   into the Game on its own.
   ========================================================================== */

export const PALETTE_GROUPS = [
  'place',
  'node',
  'research',
  'panel',
  'view',
  'selection',
  'history',
  'region',
  'settings',
] as const
export type PaletteGroup = (typeof PALETTE_GROUPS)[number]

export type PaletteCommand = Readonly<{
  /** Stable across languages, so the highlighted row survives a keystroke. */
  id: string
  group: PaletteGroup
  label: string
  glyph: IconNode
  /** A part the dock lists, drawn with the dock's own row. */
  part?: Part
  /** The keys that run it from the board, where it has any. */
  keys?: ReadonlyArray<string>
  /** What the control sends: the row runs this Message and nothing else. */
  message: Message
}>

/** The modifier the board listens for: Cmd on macOS, Ctrl elsewhere. */
export const modLabel = (): string => {
  const platform = typeof navigator === 'undefined' ? '' : navigator.userAgent
  return /Mac|iPhone|iPad|iPod/.test(platform) ? '⌘' : 'Ctrl'
}

/** A shortcut as the player types it: `⌘A` on macOS, `Ctrl+A` elsewhere. */
export const modShortcut = (key: string): string => {
  const mod = modLabel()
  return mod === '⌘' ? `${mod}${key}` : `${mod}+${key}`
}

/** The build group and part a dock shortcut takes, so a place row hints the same keys. */
const dockKeys = (model: Model): ReadonlyMap<ComponentId, ReadonlyArray<string>> => {
  const keys = new Map<ComponentId, ReadonlyArray<string>>()
  for (const [groupIndex, group] of dockGroups(model.board.game).entries())
    for (const [itemIndex, type] of dockItems(model.board.game, group).entries())
      keys.set(type, [String(groupIndex + 1), String(itemIndex + 1)])
  return keys
}

const placeRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  const keys = dockKeys(model)
  const rows: Array<PaletteCommand> = []
  // The dock's list, lock and all: a locked part waits on one Research it names.
  for (const type of keys.keys()) {
    const part = partOf(t, game, type)
    const shortcut = keys.get(type)
    rows.push({
      id: `place:${type}`,
      group: 'place',
      label: part.name,
      glyph: part.icon,
      part,
      ...(shortcut ? { keys: shortcut } : {}),
      message: Message.PlacingChosen({ type }),
    })
  }
  return rows
}

const nodeRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  const view = regionView(game, model.board.region)
  const selected = view.nodes.find((node) => node.id === model.board.selected) ?? null
  const rows: Array<PaletteCommand> = view.nodes.map((node) => ({
    id: `inspect:${node.id}`,
    group: 'node',
    label: t.palette.inspect(nodeTitle(t, game, node)),
    glyph: COMPONENT_ICONS[node.type],
    message: Message.NodeTapped({ nodeId: node.id }),
  }))
  if (selected === null) return rows
  const name = nodeTitle(t, game, selected)
  if (selected.size > 0)
    rows.push({
      id: `shrink:${selected.id}`,
      group: 'node',
      label: t.palette.shrink(name),
      glyph: Minus,
      message: Message.ResizeChosen({ nodeId: selected.id, direction: -1 }),
    })
  if (resizePrice(game, selected) !== null)
    rows.push(
      {
        id: `grow:${selected.id}`,
        group: 'node',
        label: t.palette.grow(name),
        glyph: Plus,
        keys: ['U'],
        message: Message.ResizeChosen({ nodeId: selected.id, direction: 1 }),
      },
      {
        id: `ten:${selected.id}`,
        group: 'node',
        label: t.palette.buyTen(name),
        glyph: ChevronsRight,
        message: Message.BulkResizeChosen({ nodeId: selected.id, mode: 'ten' }),
      },
      {
        id: `max:${selected.id}`,
        group: 'node',
        label: t.palette.buyMax(name),
        glyph: ArrowUp,
        message: Message.BulkResizeChosen({ nodeId: selected.id, mode: 'max' }),
      },
    )
  // A link needs two ends: the selected Node is one, and these are the others it can reach.
  const linked = new Set(
    game.links.filter((link) => link.from === selected.id).map((link) => link.to),
  )
  for (const target of view.nodes)
    if (target.id !== selected.id && !linked.has(target.id))
      rows.push({
        id: `link:${selected.id}:${target.id}`,
        group: 'node',
        label: t.palette.link(nodeTitle(t, game, target)),
        glyph: Link2,
        message: Message.LinkRequested({ from: selected.id, to: target.id }),
      })
  return rows
}

const researchRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  const rows: Array<PaletteCommand> = []
  if (!offCompany(model) && shown(model, 'research'))
    rows.push({
      id: 'panel:research',
      group: 'research',
      label: t.palette.open(t.hud.research),
      glyph: FlaskConical,
      keys: ['R'],
      message: Message.PanelOpened({ panel: 'research' }),
    })
  // One row per queued Study: run it first, or take it off the queue.
  for (const study of game.studies) {
    const name = t.catalog.research[study.id].name
    rows.push(
      {
        id: `study-now:${study.id}`,
        group: 'research',
        label: t.palette.studyNow(name),
        glyph: ListOrdered,
        message: Message.ResearchChanged({
          message: ResearchMessage.StudyPrioritized({ id: study.id }),
        }),
      },
      {
        id: `unstudy:${study.id}`,
        group: 'research',
        label: t.palette.unstudy(name),
        glyph: Trash2,
        message: Message.ResearchChanged({
          message: ResearchMessage.StudyCancelled({ id: study.id }),
        }),
      },
    )
  }
  for (const entry of researchList)
    if (!has(game, entry.id) && researchReady(game, entry.id))
      rows.push({
        id: `study:${entry.id}`,
        group: 'research',
        label: t.palette.study(t.catalog.research[entry.id].name),
        glyph: FlaskConical,
        message: Message.ResearchChanged({ message: ResearchMessage.Bought({ id: entry.id }) }),
      })
  return rows
}

/** The panels the palette opens by name; the transient ones (offer, era, end) have no row. */
type PalettePanel = Extract<
  Panel,
  | 'dashboard'
  | 'inbox'
  | 'playbooks'
  | 'help'
  | 'menu'
  | 'room'
  | 'exit'
  | 'cost'
  | 'churn'
  | 'vitals'
  | 'mirror'
  | 'team'
>

const panelRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  const row = (
    panel: PalettePanel,
    label: string,
    glyph: IconNode,
    keys?: ReadonlyArray<string>,
  ): PaletteCommand => ({
    id: `panel:${panel}`,
    group: 'panel',
    label: t.palette.open(label),
    glyph,
    ...(keys ? { keys } : {}),
    message: Message.PanelOpened({ panel }),
  })
  return [
    ...(offCompany(model) || !shown(model, 'team')
      ? []
      : [row('team', t.hud.team, UsersRound, ['T'])]),
    ...(has(game, 'metrics') ? [row('dashboard', t.hud.dashboard, ChartLine, ['D'])] : []),
    row('inbox', t.inbox.inbox, Mail, ['I']),
    ...(playbooksShown(model) ? [row('playbooks', t.hud.playbooks, BookCopy, ['P'])] : []),
    row('help', t.hud.howToPlay, CircleHelp, ['H']),
    row('menu', t.panels.menu, Menu, ['Esc']),
    row('room', t.room.title, Users),
    ...(exitLegacy(model) === null ? [] : [row('exit', t.panels.exitCompany, DoorOpen)]),
    ...(offCompany(model) ? [] : [row('cost', t.panels.cost, Wallet, ['$'])]),
    ...(offCompany(model) ? [] : [row('vitals', t.hud.vitals, Gauge)]),
    row('churn', t.hud.whyUsersLeave, Wind),
    ...(has(game, 'infra-as-code') ? [row('mirror', t.hud.mirror, Layers)] : []),
  ]
}

const viewRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const rows: Array<PaletteCommand> = [
    {
      id: 'fit',
      group: 'view',
      label: t.palette.fit,
      glyph: Scan,
      keys: ['Shift', 'F'],
      message: Message.BoardFitted(),
    },
    {
      id: 'tidy',
      group: 'view',
      label: t.palette.tidy,
      glyph: LayoutGrid,
      keys: ['Shift', 'T'],
      message: Message.BoardTidied(),
    },
    {
      id: 'zoom-in',
      group: 'view',
      label: t.palette.zoomIn,
      glyph: ZoomIn,
      message: Message.ZoomChosen({ direction: 1 }),
    },
    {
      id: 'zoom-out',
      group: 'view',
      label: t.palette.zoomOut,
      glyph: ZoomOut,
      message: Message.ZoomChosen({ direction: -1 }),
    },
    {
      id: 'fullscreen',
      group: 'view',
      label: t.palette.fullscreen,
      glyph: Expand,
      keys: ['F'],
      message: Message.FullscreenToggled(),
    },
    {
      id: 'screenshot',
      group: 'view',
      label: t.palette.screenshot,
      glyph: Camera,
      keys: ['Shift', 'S'],
      message: Message.ScreenshotToggled(),
    },
  ]
  // The clock holds still without Easy mode, so pause and speed are not the player's to set.
  if (!model.prefs.easyMode) return rows
  rows.push(
    {
      id: 'pause',
      group: 'view',
      label: clockPaused(model) ? t.palette.resume : t.palette.pause,
      glyph: clockPaused(model) ? Play : Pause,
      keys: ['Space'],
      message: Message.PauseToggled(),
    },
    ...speedsOf(model.board.game).map((speed) => ({
      id: `speed:${speed}`,
      group: 'view' as const,
      label: t.palette.speed(`${speed}×`),
      glyph: Play,
      message: Message.SpeedChosen({ speed }),
    })),
  )
  return rows
}

const selectionRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  const board = model.board
  const chosen = board.selected !== null || board.selection.length > 0
  const selectable = regionView(game, board.region).nodes.some(
    (node) => !COMPONENTS[node.type].fixed && !SHARED.includes(node.type),
  )
  const rows: Array<PaletteCommand> = []
  if (selectable)
    rows.push({
      id: 'select-all',
      group: 'selection',
      label: t.palette.selectAll,
      glyph: CopyPlus,
      keys: [modShortcut('A')],
      message: Message.SelectionAll(),
    })
  if (board.selection.length > 0)
    rows.push({
      id: 'clear-selection',
      group: 'selection',
      label: t.palette.clearSelection,
      glyph: SquareDashed,
      message: Message.SelectionCleared(),
    })
  if (chosen)
    rows.push(
      {
        id: 'copy',
        group: 'selection',
        label: t.palette.copy,
        glyph: Copy,
        keys: [modShortcut('C')],
        message: Message.NodesCopied(),
      },
      {
        id: 'cut',
        group: 'selection',
        label: t.palette.cut,
        glyph: Scissors,
        keys: [modShortcut('X')],
        message: Message.NodesCut(),
      },
      {
        id: 'duplicate',
        group: 'selection',
        label: t.palette.duplicate,
        glyph: CopyPlus,
        keys: [modShortcut('D')],
        message: Message.NodesDuplicated(),
      },
      {
        id: 'sell',
        group: 'selection',
        label: t.palette.sell,
        glyph: Trash2,
        keys: ['Delete'],
        message: Message.SellAsked(),
      },
    )
  if (board.clipboard !== null)
    rows.push({
      id: 'paste',
      group: 'selection',
      label: t.palette.paste,
      glyph: ClipboardPaste,
      keys: [modShortcut('V')],
      message: Message.NodesPasted(),
    })
  return rows
}

const historyRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const board = model.board
  return [
    ...(board.undo.length === 0
      ? []
      : [
          {
            id: 'undo',
            group: 'history' as const,
            label: t.palette.undo,
            glyph: Undo2,
            keys: ['Z'],
            message: Message.UndoChosen(),
          },
        ]),
    ...(board.redo.length === 0
      ? []
      : [
          {
            id: 'redo',
            group: 'history' as const,
            label: t.palette.redo,
            glyph: Redo2,
            keys: ['Y'],
            message: Message.RedoChosen(),
          },
        ]),
  ]
}

const regionRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const game = model.board.game
  if (!has(game, 'multi-region')) return []
  const open = openRegions(game)
  return REGIONS.map((region: RegionId) => {
    const name = t.catalog.regionInfo[region].name
    return open.includes(region)
      ? {
          id: `region:${region}`,
          group: 'region' as const,
          label: t.palette.switchRegion(name),
          glyph: Globe2,
          message: Message.RegionPicked({ region }),
        }
      : {
          id: `region:${region}`,
          group: 'region' as const,
          label: t.palette.open(name),
          glyph: Globe2,
          message: Message.RegionOpened({ region }),
        }
  })
}

const settingsRows = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => {
  const prefs = model.prefs
  const toggle = (id: string, label: string, glyph: IconNode, message: PrefsMessage) => ({
    id: `prefs:${id}`,
    group: 'settings' as const,
    label,
    glyph,
    message: Message.PrefsChanged({ message }),
  })
  return [
    {
      id: 'panel:settings',
      group: 'settings',
      label: t.palette.open(t.panels.settings),
      glyph: Settings,
      message: Message.PanelOpened({ panel: 'settings' }),
    },
    toggle(
      'mute',
      prefs.muted ? t.palette.unmute : t.palette.mute,
      prefs.muted ? VolumeX : Volume2,
      PrefsMessage.MuteToggled(),
    ),
    toggle(
      'motion',
      prefs.motion === 'reduce' ? t.palette.fullMotion : t.palette.reduceMotion,
      Wind,
      PrefsMessage.MotionToggled(),
    ),
    toggle(
      'text',
      prefs.text === 'large' ? t.palette.textAt100 : t.palette.textAt150,
      Type,
      PrefsMessage.TextToggled(),
    ),
    toggle(
      'theme',
      prefs.theme === 'dark' ? t.palette.lightMode : t.palette.darkMode,
      prefs.theme === 'dark' ? Sun : Moon,
      PrefsMessage.ThemeToggled(),
    ),
  ]
}

/** Every action the player can take from this board, in the order the palette lists them. */
export const commandsOf = (t: Messages, model: Model): ReadonlyArray<PaletteCommand> => [
  ...placeRows(t, model),
  ...nodeRows(t, model),
  ...researchRows(t, model),
  ...panelRows(t, model),
  ...viewRows(t, model),
  ...selectionRows(t, model),
  ...historyRows(t, model),
  ...regionRows(t, model),
  ...settingsRows(t, model),
]

/** Folds a label to what a player would type: lower case, with no accents. */
const folded = (text: string): string =>
  text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/**
 * The rows a query keeps. Every word typed has to appear somewhere in the row's
 * group or label, and a row keeps the order it was built in, so the palette
 * does not reshuffle while the player types.
 */
export const matchesOf = (
  commands: ReadonlyArray<PaletteCommand>,
  t: Messages,
  query: string,
): ReadonlyArray<PaletteCommand> => {
  const words = folded(query)
    .split(/\s+/)
    .filter((word) => word !== '')
  if (words.length === 0) return commands
  return commands.filter((command) => {
    const text = folded(`${t.palette.groups[command.group]} ${command.label}`)
    return words.every((word) => text.includes(word))
  })
}

/**
 * The highlighted row. A moved row wins; otherwise a query highlights its first
 * match, and an empty palette highlights nothing, so Enter never runs a part by accident.
 */
export const activeOf = (
  commands: ReadonlyArray<PaletteCommand>,
  query: string,
  active: string | null,
): PaletteCommand | null => {
  const moved = commands.find((command) => command.id === active)
  if (moved !== undefined) return moved
  return query.trim() === '' ? null : (commands[0] ?? null)
}
