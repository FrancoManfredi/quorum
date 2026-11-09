import { EMPTY_SAVE_INDEX, fileFor, withFile } from './saves.ts'
import { ResearchMessage, STUDY_QUEUE } from './research.ts'
import { TeamMessage } from './team.ts'
import { DashboardMessage } from './dashboard.ts'
import { EMPTY_INBOX, InboxMessage, folderHolds, mailed, reading } from './inbox.ts'
import { PrefsMessage } from './prefs.ts'
import { cueOf } from './cues.ts'
import { SurveyMessage } from './survey.ts'
import { describe, expect, test } from 'vitest'
import { Option, Result } from 'effect'
import { DragAndDrop } from '@foldkit/ui'
import { fromString } from 'foldkit/url'
import { newGame, preseedGame } from '@quorum/simulation/company'
import { advancePropagation } from '@quorum/simulation/features'
import { SIZES } from '@quorum/simulation/catalog'
import {
  COMPONENTS,
  FEATURE_IDS,
  MAX_STUDIES,
  researchList,
  type ResearchId,
} from '@quorum/simulation/catalog'
import type { Advice } from '@quorum/simulation/goals'
import { researchReady, resizePrice } from '@quorum/simulation/lookups'
import { solveFlow } from '@quorum/simulation/solve'
import { NEW_ENGINEER, type Postmortem, type WorkItem } from '@quorum/simulation/state'
import * as Work from '@quorum/simulation/work'
import { SHARED } from '@quorum/simulation/playbook'
import { queueFeature } from '@quorum/simulation/work'
import { encodeText } from '@quorum/simulation/codec'
import { JOBS } from '@quorum/ui/board/jobs'
import { TOAST_MS } from './commands.ts'
import { Message } from './message.ts'
import { disclosureFact, eventFact, factOf, type Fact } from './mail.ts'
import { titleIsOpen } from './boot-machine.ts'
import {
  boardChallenge,
  boardSandbox,
  hasCompany,
  EMPTY_ROOM,
  type Mail,
  type Model,
} from './model.ts'
import { TICK_MS, init, initialModel, update } from './update.ts'
import { AppRoute } from './route.ts'
import { CHALLENGES } from '@quorum/simulation/challenges'
import { boxOf, crowds, inPort, outPort } from '@quorum/ui/board/geometry'
import { act } from './update/shared.ts'
import { Actions } from './board-actions.ts'

/* The clock: 100 ms Steps under a 250 ms UI tick, and the Bottleneck search once per sim second. */

const tick = (model: Model, times = 1): Model => {
  let current = model
  for (let index = 0; index < times; index += 1)
    current = update(current, Message.Ticked({ elapsedMs: TICK_MS })).model
  return current
}

const at = (path: string) => Option.getOrThrow(fromString(`https://quorum.test${path}`))

const answerOf = (mail?: Mail) => (mail?.phase._tag === 'Answered' ? mail.phase.answer : null)

const inLab = (): Model => ({
  ...initialModel(),
  route: AppRoute.Company(),
  board: { ...initialModel().board, game: newGame() },
})

test('dropping an engineer on another team moves them', () => {
  const game = preseedGame()
  const start: Model = {
    ...inLab(),
    panel: 'team',
    board: {
      ...inLab().board,
      game: {
        ...game,
        teams: [
          ...game.teams,
          {
            id: 't2',
            name: 'Team 2',
            kind: 'product',
            policy: 'balanced',
            previous: 'balanced',
            since: 0,
          },
        ],
        engineers: [{ id: 'e1', team: 'core', language: 'php', hiredAt: 0, ...NEW_ENGINEER }],
      },
    },
  }
  const send = (model: Model, message: DragAndDrop.Message) =>
    update(model, Message.TeamChanged({ message: TeamMessage.DragChanged({ message }) })).model
  const picked = send(
    start,
    DragAndDrop.Message.ActivatedKeyboardDrag({ itemId: 'e1', containerId: 'core', index: 0 }),
  )
  const moved = send(
    picked,
    DragAndDrop.Message.CompletedResolveKeyboardMove({ targetContainerId: 't2', targetIndex: 0 }),
  )
  const dropped = send(moved, DragAndDrop.Message.ConfirmedKeyboardDrop())
  expect(dropped.board.game.engineers.find((engineer) => engineer.id === 'e1')?.team).toBe('t2')
})

test('the menu button opens a menu over the board that holds the clock, and Escape walks back out', () => {
  const key = Message.KeyPressed({ key: 'Escape' })
  const opened = update(inLab(), Message.PanelOpened({ panel: 'menu' }))
  expect(opened.model.route).toEqual(AppRoute.Company())
  expect(opened.model.board.clock.mode._tag !== 'Running').toBe(false)
  expect(opened.commands).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'SyncBoard',
        args: expect.objectContaining({ paused: true }),
      }),
    ]),
  )
  const settings = update(opened.model, Message.PanelOpened({ panel: 'settings' })).model
  expect(update(settings, key).model.panel).toBe('menu')
  const resumed = update(opened.model, key)
  expect(resumed.model.panel).toBe('none')
  expect(resumed.commands).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'SyncBoard',
        args: expect.objectContaining({ paused: false }),
      }),
    ]),
  )
  expect(update(resumed.model, key).model.panel).toBe('menu')
})

test('Research suspends board rendering without holding the clock, and closing it resumes rendering', () => {
  const opened = update(inLab(), Message.PanelOpened({ panel: 'research' }))
  expect(opened.commands).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'SyncBoard',
        args: expect.objectContaining({ suspended: true, paused: false }),
      }),
    ]),
  )
  const advanced = tick(opened.model)
  expect(advanced.board.game.time).toBeGreaterThan(opened.model.board.game.time)
  expect(advanced.panel).toBe('research')
  for (const message of [Message.PanelClosed(), Message.KeyPressed({ key: 'Escape' })]) {
    const closed = update(advanced, message)
    expect(closed.model.panel).toBe('none')
    expect(closed.model.board.game).toBe(advanced.board.game)
    expect(closed.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'SyncBoard',
          args: expect.objectContaining({ suspended: false, paused: false }),
        }),
      ]),
    )
  }
})

describe('copy, cut, paste, and select all', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)
  const key = (value: string) => Message.KeyPressed({ key: value })
  const start = (): Model => {
    const model = { ...inLab(), board: { ...inLab().board, game: { ...preseedGame(), cash: 1e6 } } }
    return send(
      model,
      Message.PlacingChosen({ type: 'server' }),
      Message.NodePlaced({ x: 400, y: 300 }),
    )
  }
  const movable = (model: Model) =>
    model.board.game.nodes.filter(
      (node) => !COMPONENTS[node.type].fixed && !SHARED.includes(node.type),
    )

  test('select all picks every Node that can be sold, and Delete sells them in one undo step', () => {
    const placed = start()
    const all = send(placed, key('Mod+a'))
    expect(all.board.selection).toEqual(movable(placed).map((node) => node.id))
    expect(all.board.selection.length).toBeGreaterThan(0)
    const asked = send(all, key('Delete'))
    expect(asked.board.game.nodes).toEqual(placed.board.game.nodes)
    expect(asked.board.flow).toEqual({ _tag: 'ConfirmingSell', ids: all.board.selection })
    expect(send(asked, key('Escape')).board.flow._tag).toBe('Idle')
    const sold = send(asked, key('Enter'))
    expect(movable(sold)).toEqual([])
    expect(sold.board.game.nodes.length).toBeLessThan(placed.board.game.nodes.length)
    expect(send(sold, key('z')).board.game.nodes).toEqual(placed.board.game.nodes)
  })

  test('paste places a second copy where the click lands, and it costs Cash', () => {
    const placed = start()
    const copied = send(placed, key('Mod+a'), key('Mod+c'))
    expect(copied.board.clipboard?.nodes.length).toBe(movable(placed).length)
    const stamping = send(copied, key('Mod+v'))
    expect(stamping.board.flow).toEqual({ _tag: 'Stamping', source: 'clipboard' })
    const pasted = send(stamping, Message.NodePlaced({ x: 900, y: 700 }))
    expect(movable(pasted).length).toBe(2 * movable(placed).length)
    expect(pasted.board.flow._tag).toBe('Idle')
    expect(pasted.board.game.cash).toBeLessThan(placed.board.game.cash)
  })

  test('choosing a part while pasting places the part, not the paste', () => {
    const placed = start()
    const stamping = send(placed, key('Mod+a'), key('Mod+c'), key('Mod+v'))
    const chosen = send(stamping, Message.PlacingChosen({ type: 'server' }))
    const dropped = send(chosen, Message.NodePlaced({ x: 900, y: 700 }))
    expect(dropped.board.game.nodes.length).toBe(placed.board.game.nodes.length + 1)
    expect(dropped.board.game.nodes.at(-1)?.type).toBe('server')
  })

  test('cut sells the Nodes and keeps them to paste', () => {
    const placed = start()
    const cut = send(placed, key('Mod+a'), key('Mod+x'))
    expect(movable(cut)).toEqual([])
    expect(cut.board.clipboard?.nodes.length).toBe(movable(placed).length)
    const back = send(cut, key('Mod+v'), Message.NodePlaced({ x: 400, y: 300 }))
    expect(movable(back).length).toBe(movable(placed).length)
  })

  test('duplicate places a copy beside the original in one undo step', () => {
    const placed = start()
    const dup = send(placed, key('Mod+a'), key('Mod+d'))
    expect(movable(dup).length).toBe(2 * movable(placed).length)
    expect(dup.board.game.cash).toBeLessThan(placed.board.game.cash)
    expect(send(dup, key('z')).board.game.nodes).toEqual(placed.board.game.nodes)
  })

  test('Shift+Arrow nudges the selected Nodes', () => {
    const placed = start()
    const before = movable(placed)[0]!
    const moved = send(placed, key('Mod+a'), key('Shift+ArrowRight'))
    const after = movable(moved).find((node) => node.id === before.id)!
    expect(after.x - before.x).toBeGreaterThan(0)
    expect(after.y).toBe(before.y)
  })

  test('add and subtract edit a box selection; copy with nothing picked changes nothing', () => {
    const placed = start()
    const ids = movable(placed).map((node) => node.id)
    const added = send(placed, Message.SelectionBoxed({ ids, mode: 'add' }))
    expect([...added.board.selection].sort()).toEqual([...ids].sort())
    expect(send(added, Message.SelectionBoxed({ ids, mode: 'subtract' })).board.selection).toEqual(
      [],
    )
    expect(send(placed, key('Escape'), key('Mod+c')).board.clipboard).toBeNull()
  })

  test('dragging one selected Node moves the whole selection by the same step', () => {
    const placed = send(
      start(),
      Message.PlacingChosen({ type: 'database' }),
      Message.NodePlaced({ x: 800, y: 300 }),
    )
    const ids = movable(placed).map((node) => node.id)
    const [first, second] = movable(placed)
    const picked = send(placed, Message.SelectionBoxed({ ids, mode: 'replace' }))
    const moved = send(
      picked,
      Message.NodeMoved({ nodeId: first!.id, x: first!.x + 80, y: first!.y + 160 }),
    )
    const again = movable(moved)
    const step = { x: again[0]!.x - first!.x, y: again[0]!.y - first!.y }
    expect(step).not.toEqual({ x: 0, y: 0 })
    expect({ x: again[1]!.x - second!.x, y: again[1]!.y - second!.y }).toEqual(step)
  })

  test('paste with nothing copied does not start placing', () => {
    expect(send(start(), key('Mod+v')).board.flow._tag).toBe('Idle')
  })
})

describe('the clock', () => {
  test('four ticks at 1× run ten 0.1 s Steps: one sim second', () => {
    const start = inLab()
    expect(tick(start, 2).board.game.time).toBeCloseTo(start.board.game.time + 0.5)
    expect(tick(start, 4).board.game.time).toBe(start.board.game.time + 1)
  })

  test('3× runs three times the Steps', () => {
    const lab = inLab()
    const start = { ...lab, board: { ...lab.board, clock: { ...lab.board.clock, speed: 3 } } }
    expect(tick(start, 4).board.game.time).toBe(start.board.game.time + 3)
  })

  test('a tick owes the wall time that passed, so 10× runs ten times as fast as 1×', () => {
    const advanced = (speed: number, elapsedMs: number) => {
      const lab = inLab()
      const start = { ...lab, board: { ...lab.board, clock: { ...lab.board.clock, speed } } }
      const after = update(start, Message.Ticked({ elapsedMs })).model.board.game.time
      return after - start.board.game.time
    }
    expect(advanced(0.5, 1_000)).toBeCloseTo(0.5, 6)
    expect(advanced(1, 1_000)).toBeCloseTo(1, 6)
    expect(advanced(3, 1_000)).toBeCloseTo(3, 6)
    expect(advanced(10, 1_000)).toBeCloseTo(10, 6)
    // A tick that overran its interval owes the whole time it took, so the clock never falls behind.
    expect(advanced(10, 2 * TICK_MS)).toBeCloseTo(5, 6)
    // A stall stops at ten sim seconds a tick instead of spiralling.
    expect(advanced(10, 60_000)).toBeLessThanOrEqual(10)
    // A fast clock may catch up two ticks' worth, so Time dilation's 40× keeps its pace.
    expect(advanced(40, 60_000)).toBeLessThanOrEqual(20)
  })

  test('the Bottleneck search runs once per sim second, and again after an action', () => {
    const first = tick(inLab())
    expect(first.board.bottleneckAt).toBe(Math.floor(first.board.game.time))
    const second = tick(first)
    expect(second.board.bottleneckAt).toBe(first.board.bottleneckAt)
    const acted = update(second, Message.ResizeChosen({ nodeId: 'server', direction: 1 })).model
    expect(acted.board.bottleneckAt).toBe(-1)
    expect(tick(acted).board.bottleneckAt).toBe(Math.floor(tick(acted).board.game.time))
  })

  test('component history captures traffic at its timestamp and stays pinned while live traffic changes', () => {
    const lab = inLab()
    const game = { ...preseedGame(), time: 9.9, autopilot: false }
    const first = tick({ ...lab, board: { ...lab.board, game, selected: 'database' } })
    const sample = first.board.nodeHistory.database![0]!
    const own = solveFlow(first.board.game).nodes.database!
    expect(sample.time).toBe(first.board.game.time)
    expect(sample.traffic).toEqual(own.traffic)
    expect(sample.traffic['q-read']).toBeGreaterThan(0)
    expect(sample.sources).toEqual([
      { id: 'server', name: 'App Server', ordinal: 0, rate: own.inbound },
    ])
    const chosen = update(
      first,
      Message.NodeSampleChosen({ nodeId: 'database', time: sample.time }),
    ).model
    expect(chosen.board.game).toBe(first.board.game)
    const after = tick({
      ...chosen,
      board: { ...chosen.board, game: { ...chosen.board.game, time: 19.9, users: game.users * 5 } },
    })
    expect(after.board.nodeSample).toEqual({ nodeId: 'database', time: sample.time })
    expect(after.board.nodeHistory.database![0]).toEqual(sample)
    expect(after.board.nodeHistory.database!.at(-1)!.traffic['q-read']).toBeGreaterThan(
      sample.traffic['q-read']!,
    )
    const live = update(after, Message.NodeSampleChosen({ nodeId: 'database', time: null })).model
    expect(live.board.nodeSample).toBeNull()
    expect(live.board.game).toBe(after.board.game)
    expect(
      update(after, Message.NodeTapped({ nodeId: 'server' })).model.board.nodeSample,
    ).toBeNull()
  })

  test('expired samples and sold components leave the bounded session history', () => {
    const lab = inLab()
    const first = tick({
      ...lab,
      board: { ...lab.board, game: { ...preseedGame(), time: 9.9, autopilot: false } },
    })
    const sample = first.board.nodeHistory.database![0]!
    const aged: Model = {
      ...first,
      board: {
        ...first.board,
        selected: 'database',
        nodeSample: { nodeId: 'database', time: sample.time },
        nodeHistory: {
          database: Array.from({ length: 145 }, (_, index) => ({
            ...sample,
            time: sample.time + index * 10,
          })),
          removed: [sample],
        },
        game: { ...first.board.game, time: 1459.9 },
      },
    }
    const after = tick(aged)
    expect(after.board.nodeHistory.database!.length).toBeLessThanOrEqual(144)
    expect(
      after.board.nodeHistory.database!.every((entry) => entry.time > after.board.game.time - 1440),
    ).toBe(true)
    expect(after.board.nodeHistory.removed).toBeUndefined()
    expect(after.board.nodeSample).toBeNull()
    expect(
      update(after, Message.NodeSampleChosen({ nodeId: 'database', time: sample.time })).model.board
        .nodeSample,
    ).toBeNull()
  })
})

describe('collecting the Payments drawer', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)
  const withPending = (): Model => {
    const model = inLab()
    return { ...model, board: { ...model.board, game: { ...model.board.game, pending: 42 } } }
  }

  test('a tap on Payments opens the Inspector and leaves the drawer alone', () => {
    const start = withPending()
    const tapped = send(start, Message.NodeTapped({ nodeId: 'payments' }))
    expect(tapped.board.selected).toBe('payments')
    expect(tapped.board.game.pending).toBe(42)
    expect(tapped.board.game.cash).toBe(start.board.game.cash)
  })

  test('the footer Collect button collects without opening the Inspector', () => {
    const start = withPending()
    const pressed = send(start, Message.FooterPressed({ nodeId: 'payments' }))
    expect(pressed.board.selected).toBeNull()
    expect(pressed.board.game.pending).toBe(0)
    expect(pressed.board.game.cash).toBe(start.board.game.cash + 42)
  })

  test('an empty drawer still opens the Inspector', () => {
    const tapped = send(inLab(), Message.NodeTapped({ nodeId: 'payments' }))
    expect(tapped.board.selected).toBe('payments')
  })
})

test('RevealNode switches to the Node region and selects it', () => {
  const base = preseedGame()
  const game = {
    ...base,
    nodes: base.nodes.map((node) =>
      node.type === 'database' ? { ...node, region: 'eu' as const } : node,
    ),
  }
  const start: Model = {
    ...inLab(),
    board: { ...inLab().board, game, region: 'na', selected: null },
  }
  const next = update(start, Message.RevealNode({ nodeId: 'database' })).model
  expect(next.board.selected).toBe('database')
  expect(next.board.region).toBe('eu')
})

describe('Tradeoff cards', () => {
  const option = { kind: 'runtime', id: 'node_cluster' } as const
  const ready = (): Model => ({
    ...initialModel(),
    route: AppRoute.Company(),
    board: {
      ...initialModel().board,
      selected: 'server',
      game: {
        ...preseedGame(),
        users: 4_000,
        researched: [...preseedGame().researched, 'lang-node', 'node-cluster'],
      },
    },
  })
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)

  test('hovering asks the worker for a preview; leaving closes; the Game does not change', () => {
    const start = ready()
    const asked = update(start, Message.OptionPreviewed({ nodeId: 'server', option }))
    expect(asked.model.board.tradeoff).toEqual({
      _tag: 'Hovering',
      nodeId: 'server',
      option,
      preview: null,
    })
    expect(asked.commands?.map((command) => command.name)).toContain('ComputePreview')
    const preview = JOBS.preview({ game: start.board.game, nodeId: 'server', option })
    if (!preview) throw new Error('The option was refused.')
    const hovered = send(
      asked.model,
      Message.PreviewComputed({
        nodeId: 'server',
        option,
        preview: { ...preview, burn: [...preview.burn] },
      }),
    )
    expect(hovered.board.tradeoff._tag).toBe('Hovering')
    if (hovered.board.tradeoff._tag !== 'Hovering') throw new Error('Expected a hover')
    expect(hovered.board.tradeoff.preview?.after.revenue).toBeGreaterThan(
      hovered.board.tradeoff.preview?.before.revenue ?? Infinity,
    )
    expect(hovered.board.game).toBe(start.board.game)
    expect(send(hovered, Message.OptionLeft()).board.tradeoff).toEqual({ _tag: 'Closed' })
  })

  test('the first click pins the card; Confirm applies it; the second time a click applies it', () => {
    const pinned = send(ready(), Message.OptionChosen({ nodeId: 'server', option }))
    expect(pinned.board.tradeoff._tag).toBe('Pinned')
    expect(pinned.board.game.nodes.find((node) => node.id === 'server')?.runtime).toBe('php_fpm')
    // Leaving the option keeps a pinned card open.
    expect(send(pinned, Message.OptionLeft()).board.tradeoff._tag).toBe('Pinned')
    // A pinned card confirms once its preview is in.
    const preview = JOBS.preview({ game: pinned.board.game, nodeId: 'server', option })
    if (!preview) throw new Error('The option was refused.')
    const shown = send(
      pinned,
      Message.PreviewComputed({
        nodeId: 'server',
        option,
        preview: { ...preview, burn: [...preview.burn] },
      }),
    )
    // In a Company, Confirm starts a migration: Dev Hours first, then the strangler.
    const confirmed = send(shown, Message.OptionConfirmed())
    expect(confirmed.board.tradeoff).toEqual({ _tag: 'Closed' })
    expect(confirmed.prefs.seenTradeoffs).toEqual(['runtime'])
    expect(confirmed.board.game.nodes.find((node) => node.id === 'server')?.runtime).toBe('php_fpm')
    expect(confirmed.board.game.services[0]?.migration?.runtime).toBe('node_cluster')
    expect(confirmed.board.game.backlog.some((item) => item.kind === 'migration')).toBe(true)
    expect(confirmed.board.change).not.toBeNull()
    const fresh = { ...ready(), prefs: confirmed.prefs }
    const clicked = send(fresh, Message.OptionChosen({ nodeId: 'server', option }))
    expect(clicked.board.tradeoff).toEqual({ _tag: 'Closed' })
    expect(clicked.board.game.services[0]?.migration?.runtime).toBe('node_cluster')
  })

  test('a Sandbox swaps the Stack at once', () => {
    const start = ready()
    const sandboxed = {
      ...start,
      board: { ...start.board, game: { ...start.board.game, sandbox: true } },
    }
    const preview = JOBS.preview({ game: sandboxed.board.game, nodeId: 'server', option })
    if (!preview) throw new Error('The option was refused.')
    const applied = send(
      sandboxed,
      Message.OptionChosen({ nodeId: 'server', option }),
      Message.PreviewComputed({
        nodeId: 'server',
        option,
        preview: { ...preview, burn: [...preview.burn] },
      }),
      Message.OptionConfirmed(),
    )
    expect(applied.board.game.nodes.find((node) => node.id === 'server')?.runtime).toBe(
      'node_cluster',
    )
  })

  test('Escape and Cancel close the card without changing anything', () => {
    const pinned = send(ready(), Message.OptionChosen({ nodeId: 'server', option }))
    expect(send(pinned, Message.KeyPressed({ key: 'Escape' })).board.tradeoff).toEqual({
      _tag: 'Closed',
    })
    expect(send(pinned, Message.TradeoffClosed()).board.game).toBe(pinned.board.game)
  })

  test('Enter confirms a pinned card once its preview is in, and Escape cancels it', () => {
    const start = ready()
    const pinned = send(start, Message.OptionChosen({ nodeId: 'server', option }))
    const preview = JOBS.preview({ game: start.board.game, nodeId: 'server', option })
    if (!preview) throw new Error('The option was refused.')
    // A card with no preview yet has nothing to confirm: the key does nothing.
    expect(send(pinned, Message.KeyPressed({ key: 'Enter' })).board.tradeoff._tag).toBe('Pinned')
    const shown = send(
      pinned,
      Message.PreviewComputed({
        nodeId: 'server',
        option,
        preview: { ...preview, burn: [...preview.burn] },
      }),
    )
    const confirmed = send(shown, Message.KeyPressed({ key: 'Enter' }))
    expect(confirmed.board.tradeoff).toEqual({ _tag: 'Closed' })
    expect(confirmed.prefs.seenTradeoffs).toContain('runtime')
    expect(send(shown, Message.KeyPressed({ key: 'Escape' })).board.tradeoff).toEqual({
      _tag: 'Closed',
    })
  })

  test('a locked option shows why, and Confirm does nothing', () => {
    const locked = { ...ready(), board: { ...ready().board, game: preseedGame() } }
    const pinned = send(locked, Message.OptionChosen({ nodeId: 'server', option }))
    expect(pinned.board.tradeoff._tag).toBe('Refused')
    expect(send(pinned, Message.OptionConfirmed()).board.game.nodes).toEqual(
      locked.board.game.nodes,
    )
  })

  test.each([
    ['Go', 'go', 'lang-go'],
    ['Zig', 'zig', 'lang-zig'],
    ['Haskell', 'warp', 'lang-haskell'],
  ] as const)(
    '%s mail reviews the proposed Stack even after runtime tradeoffs were seen',
    (language, runtime, research) => {
      const start = ready()
      const prepared: Model = {
        ...start,
        panel: 'inbox',
        prefs: { ...start.prefs, seenTradeoffs: ['runtime'] },
        board: {
          ...start.board,
          selected: 'database',
          selection: ['database'],
          game: { ...start.board.game, researched: [...start.board.game.researched, research] },
        },
      }
      const mailed = send(
        prepared,
        Message.InboxChanged({ message: InboxMessage.SampleChosen({ id: `rewrite:${language}` }) }),
        Message.InboxChanged({ message: InboxMessage.Generated({ count: 1 }) }),
      )
      const mail = mailed.board.inbox.mail.at(-1)!
      expect(mail.actions[0]).toEqual({
        id: `rewrite:${language}`,
        label: `Review ${language} migration`,
      })
      const reviewed = send(
        mailed,
        Message.InboxChanged({
          message: InboxMessage.Acted({ id: mail.id, action: mail.actions[0]!.id }),
        }),
      )
      expect(reviewed.panel).toBe('none')
      expect(reviewed.board.selected).toBe('server')
      expect(reviewed.board.selection).toEqual([])
      expect(reviewed.board.tradeoff).toMatchObject({
        _tag: 'Pinned',
        nodeId: 'server',
        option: { kind: 'runtime', id: runtime },
      })
      expect(reviewed.board.game).toBe(mailed.board.game)
      expect(answerOf(reviewed.board.inbox.mail.at(-1))).toBeNull()
      expect(send(reviewed, Message.TradeoffClosed()).board.game).toBe(mailed.board.game)
      const preview = JOBS.preview({
        game: reviewed.board.game,
        nodeId: 'server',
        option: { kind: 'runtime', id: runtime },
      })
      if (!preview) throw new Error('The option was refused.')
      const confirmed = send(
        reviewed,
        Message.PreviewComputed({
          nodeId: 'server',
          option: { kind: 'runtime', id: runtime },
          preview: { ...preview, burn: [...preview.burn] },
        }),
        Message.OptionConfirmed(),
      )
      expect(confirmed.board.game.services[0]?.migration?.runtime).toBe(runtime)
      expect(confirmed.board.game.nodes.find((node) => node.id === 'server')?.runtime).toBe(
        'php_fpm',
      )
    },
  )

  test.each([
    ['Elixir', 'lang-elixir'],
    ['Zig', 'lang-zig'],
    ['Haskell', 'lang-haskell'],
  ])(
    'locked %s mail opens its research without answering or starting the migration',
    (language, research) => {
      const mailed = send(
        ready(),
        Message.InboxChanged({ message: InboxMessage.SampleChosen({ id: `rewrite:${language}` }) }),
        Message.InboxChanged({ message: InboxMessage.Generated({ count: 1 }) }),
      )
      const mail = mailed.board.inbox.mail.at(-1)!
      const reviewed = send(
        mailed,
        Message.InboxChanged({
          message: InboxMessage.Acted({ id: mail.id, action: mail.actions[0]!.id }),
        }),
      )
      expect(reviewed.panel).toBe('research')
      expect(reviewed.board.research.focus).toBe(research)
      expect(reviewed.board.game).toBe(mailed.board.game)
      expect(answerOf(reviewed.board.inbox.mail.at(-1))).toBeNull()
    },
  )
})

describe('Exit', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)

  test('an Exit pays Legacy, writes history, and the next company starts fresh with the record', () => {
    const game = { ...preseedGame(), stage: 4, users: 200_000, cash: 1e8 }
    const exited = send(
      {
        ...inLab(),
        companyPhase: { _tag: 'Open', id: 'c-one' },
        board: { ...inLab().board, game },
      },
      Message.ExitTaken({ exit: 'acquisition' }),
    )
    expect(exited.panel).toBe('exited')
    expect(exited.founder.history).toHaveLength(1)
    expect(exited.founder.legacy).toBe(exited.founder.history[0]?.legacy)
    const title = send(exited, Message.TitleOpened())
    expect(title.route).toEqual(AppRoute.Menu({ menu: 'found' }))
    const next = send(title, Message.CompanyFounded())
    expect(next.route).toEqual(AppRoute.Company())
    expect(next.board.game.stage).toBe(0)
    expect(next.founder.history).toHaveLength(1)
  })

  test('a save from an hour ago resumes at the Step it was saved on', () => {
    const game = { ...preseedGame() }
    const loaded = send(
      initialModel(),
      Message.SavesLoaded({
        index: null,
        legacy: JSON.stringify(game),
        now: 1_000_000 + 3_600_000,
      }),
    )
    expect(hasCompany(loaded)).toBe(true)
    expect(loaded.saves.current).not.toBeNull()
    // The clock held still while the page was closed.
    expect(loaded.board.game.time).toBeCloseTo(game.time)
    expect(loaded.board.game.users).toBe(game.users)
    expect(loaded.companyPhase).toMatchObject({ _tag: 'Open' })
    expect(loaded.panel).toBe('none')
  })

  test('the Exit survey opens after an Exit and sends the row it describes', () => {
    const game = { ...preseedGame(), stage: 4, users: 200_000, cash: 1e8 }
    const exited = send(
      {
        ...inLab(),
        companyPhase: { _tag: 'Open', id: 'company' },
        board: { ...inLab().board, game },
      },
      Message.ExitTaken({ exit: 'acquisition' }),
    )
    expect(exited.survey).toEqual({ issues: '', likes: '', phase: { _tag: 'Open' } })
    const row = exited.companyPhase._tag === 'Exited' ? exited.companyPhase.row : undefined

    const typed = send(
      exited,
      Message.SurveyChanged({
        message: SurveyMessage.IssuesChanged({ value: 'The tutorial ran long.' }),
      }),
      Message.SurveyChanged({
        message: SurveyMessage.LikesChanged({ value: 'Watching the board settle.' }),
      }),
    )
    const submitted = update(typed, Message.SurveySubmitted())
    expect(submitted.model.survey.phase._tag).toBe('Sending')
    const command = (submitted.commands ?? []).find((entry) => entry.name === 'SubmitSurvey')
    expect(command?.args?.['submission']).toMatchObject({
      deviceId: typed.founder.deviceId,
      locale: 'en',
      issues: 'The tutorial ran long.',
      likes: 'Watching the board settle.',
      exit: {
        exit: 'acquisition',
        stage: 4,
        time: row?.time,
        peak: row?.peak,
        payout: row?.payout,
        legacy: row?.legacy,
        venture: row?.founding.venture,
      },
    })
    const sent = update(submitted.model, Message.SurveySent())
    expect(sent.model.survey.phase._tag).toBe('Sent')
    // The analytics bridge reads this line: the Exit's figures and the answer lengths, never the text.
    const appended = (sent.commands ?? []).find((entry) => entry.name === 'AppendLog')
    const entries = appended?.args?.['entries'] as
      | ReadonlyArray<{ type: string; data: string }>
      | undefined
    const surveyLine = entries?.find((entry) => entry.type === 'SurveySent')
    const logged = JSON.parse(surveyLine?.data ?? '{}') as Record<string, unknown>
    expect(logged['survey']).toMatchObject({
      exit: 'acquisition',
      stage: 4,
      payout: row?.payout,
      legacy: row?.legacy,
      issues_chars: 'The tutorial ran long.'.length,
      likes_chars: 'Watching the board settle.'.length,
      locale: 'en',
    })
    expect(surveyLine?.data).not.toContain('tutorial ran long')
    expect(send(exited, Message.SurveySkipped()).survey.phase._tag).toBe('Skipped')
  })

  test('the Exit survey needs an exited Company and an answer', () => {
    const noExit = update(inLab(), Message.SurveySubmitted())
    expect(noExit.model.survey.phase._tag).toBe('Open')
    expect((noExit.commands ?? []).some((entry) => entry.name === 'SubmitSurvey')).toBe(false)

    const game = { ...preseedGame(), stage: 4, users: 200_000, cash: 1e8 }
    const exited = send(
      {
        ...inLab(),
        companyPhase: { _tag: 'Open', id: 'company' },
        board: { ...inLab().board, game },
      },
      Message.ExitTaken({ exit: 'acquisition' }),
    )
    const blank = update(exited, Message.SurveySubmitted())
    expect(blank.model.survey.phase._tag).toBe('Open')
    expect((blank.commands ?? []).some((entry) => entry.name === 'SubmitSurvey')).toBe(false)
    expect(blank.model.toast?.tone).toBe('warn')
  })
})

describe('Challenges', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)
  const solved = (model: Model): Model =>
    send(
      model,
      Message.ChallengeStarted({ id: 'hello-world' }),
      Message.FamilyChosen({ nodeId: 'server', family: 'general' }),
      Message.ChallengeRan(),
      Message.ChallengeFinished(),
    )

  /** The scored run, or a failed expectation when there is none. */
  const scoredRun = (model: Model) => {
    const run = boardChallenge(model.board)
    if (run?._tag !== 'Result') throw new Error('Expected a scored run.')
    return run
  }

  /** The run in progress, or a failed expectation when there is none. */
  const runningRun = (model: Model) => {
    const run = boardChallenge(model.board)
    if (run?._tag !== 'Running') throw new Error('Expected a run in progress.')
    return run
  }

  test('Run scores the result locally, and leaving restores the Company', () => {
    const company = {
      ...initialModel(),
      saved: true,
      board: { ...initialModel().board, game: preseedGame() },
    }
    const done = solved(company)
    expect(boardChallenge(done.board)?._tag).toBe('Result')
    expect(scoredRun(done).result.passed).toBe(true)
    expect(done.panel).toBe('challenge')
    // Leaving brings the Company back untouched.
    const left = send(done, Message.TitleOpened())
    expect(boardChallenge(left.board)).toBeNull()
    expect(left.board.game).toBe(company.board.game)
  })

  test('a first completion pays Legacy once, and perks do not reach the board', () => {
    const founder = { ...initialModel().founder, perks: { 'angel-network': 3 } }
    const once = solved({ ...initialModel(), founder })
    expect(once.founder.legacy).toBe(1)
    expect(once.founder.completed).toEqual(['hello-world'])
    expect(once.board.game.founding.perks).toEqual({})
    const twice = solved(send(once, Message.TitleOpened()))
    expect(twice.founder.legacy).toBe(1)
  })

  test('the Design is fixed during a run; restarts are logged as run actions', () => {
    const running = send(
      initialModel(),
      Message.ChallengeStarted({ id: 'hello-world' }),
      Message.ChallengeRan(),
    )
    const resized = send(running, Message.FamilyChosen({ nodeId: 'server', family: 'general' }))
    expect(resized.board.game.nodes).toEqual(running.board.game.nodes)
    const built = send(
      initialModel(),
      Message.ChallengeStarted({ id: 'hello-world' }),
      Message.FamilyChosen({ nodeId: 'server', family: 'general' }),
      Message.ChallengeRan(),
    )
    expect(send(built, Message.UndoChosen()).board.game.nodes).toEqual(built.board.game.nodes)
    const restarted = send(running, Message.RestartChosen({ nodeId: 'server' }))
    expect(runningRun(restarted).replay.actions).toEqual([
      { step: 0, action: { _tag: 'Restart', node: 'server' } },
    ])
  })

  test('a Challenge URL opens its Challenge whatever the Founder has completed', () => {
    const opened = send(
      initialModel(),
      Message.ChangedUrl({ url: at('/challenges/split-the-box') }),
    )
    expect(boardChallenge(opened.board)?.id).toBe('split-the-box')
    expect(opened.route).toEqual(AppRoute.Challenge({ challenge: 'split-the-box' }))
  })

  test('every Challenge opens with its cards apart, and Run keeps them where they are', () => {
    for (const challenge of CHALLENGES) {
      const built = send(initialModel(), Message.ChallengeStarted({ id: challenge.id }))
      const nodes = built.board.game.nodes
      const crowded = nodes.flatMap((a, index) =>
        nodes
          .slice(index + 1)
          .filter((b) => a.region === b.region && crowds(boxOf(a), boxOf(b)))
          .map((b) => `${challenge.id}: ${a.id} and ${b.id}`),
      )
      expect(crowded).toEqual([])
      const running = send(built, Message.ChallengeRan())
      for (const node of running.board.game.nodes) {
        const before = nodes.find((entry) => entry.id === node.id)
        if (before) expect([node.x, node.y]).toEqual([before.x, before.y])
      }
    }
  }, 60_000)
})

describe('M9: sound, achievements, keys', () => {
  type Named = Readonly<{ name: string; args: Record<string, unknown> }>
  const names = (commands: ReadonlyArray<unknown> | undefined): ReadonlyArray<Named> =>
    (commands ?? []) as ReadonlyArray<Named>
  const incidentDue = (change: Partial<Model> = {}): Model => {
    const game = preseedGame()
    return {
      ...initialModel(),
      route: AppRoute.Company(),
      board: { ...initialModel().board, game: { ...game, nextIncidentAt: game.time } },
      ...change,
    }
  }
  const sounds = (model: Model) =>
    names(update(model, Message.Ticked({ elapsedMs: TICK_MS })).commands)
      .filter((command) => command.name === 'PlaySound')
      .map((command) => command.args['sound'])

  test('a fresh load waits for one clock-in before the title, and a return skips it', () => {
    const shut = init(at('/')).model
    expect(shut.boot._tag).toBe('Shut')
    expect(update(shut, Message.KeyPressed({ key: 'Escape' })).model.boot._tag).toBe('Shut')
    const clocking = update(shut, Message.KeyPressed({ key: 'a' }))
    expect(clocking.model.boot._tag).toBe('Clocking')
    expect(names(clocking.commands).map((command) => command.args['sound'])).toContain('clockin')
    const again = names(update(clocking.model, Message.ClockedIn()).commands)
    expect(again.filter((command) => command.name !== 'AppendLog')).toEqual([])
    const open = update(clocking.model, Message.TitleRevealed()).model
    expect(open.boot._tag).toBe('Ready')
    const lab = update(open, Message.CompanyFounded()).model
    expect(titleIsOpen(update(lab, Message.TitleOpened()).model.boot)).toBe(true)
  })

  test('an incident plays its sound, unless muted', () => {
    expect(sounds(incidentDue())).toContain('incident')
    expect(sounds(incidentDue({ prefs: { ...initialModel().prefs, muted: true } }))).toEqual([])
  })

  test('an alarm from before a reset does not sound again on every tick', () => {
    const opened = update(inLab(), Message.FreeSandboxStarted()).model
    const alarm = {
      id: 1,
      key: 'alarm',
      sender: 'monitoring',
      subject: 'Errors are up',
      time: opened.board.game.time + 600,
      entries: [{ time: opened.board.game.time + 600, text: 'Errors are up.' }],
      actions: [],
      phase: { _tag: 'Active' } as const,
      read: false,
      trashed: false,
      spam: false,
    }
    const reset = update(
      { ...opened, board: { ...opened.board, inbox: { ...opened.board.inbox, mail: [alarm] } } },
      Message.FreeSandboxReset(),
    ).model
    expect(sounds(tick(reset))).not.toContain('warn')
  })

  test('a warning the world raises keeps the alarm; a refused gesture answers quietly', () => {
    const before = inLab()
    const raised = {
      id: 1,
      message: 'The Payments drawer is full.',
      tone: 'warn' as const,
      count: 1,
    }
    const toast = { ...before, toast: raised }
    // A world event moves the Game, so its warning still sounds.
    const worse: Model = {
      ...toast,
      board: { ...before.board, game: { ...before.board.game, cash: before.board.game.cash - 1 } },
    }
    expect(cueOf(before, Message.Ticked({ elapsedMs: TICK_MS }), worse)?.sound).toBe('warn')
    // A refused gesture leaves the Game as it was, so it answers with a pulse.
    expect(cueOf(before, Message.NodeSold({ nodeId: 'no-such-node' }), toast)?.sound).toBe('refuse')
  })

  test('a refused gesture answers with a quiet pulse, not the warning alarm', () => {
    const start = inLab()
    const sold = update(start, Message.NodeSold({ nodeId: 'no-such-node' }))
    expect(sold.model.toast?.tone).toBe('warn')
    expect(sold.model.board.game).toBe(start.board.game)
    const played = names(sold.commands)
      .filter((command) => command.name === 'PlaySound')
      .map((command) => command.args['sound'])
    expect(played).toContain('refuse')
    expect(played).not.toContain('warn')
  })

  test('the first served request earns Hello, World once, in the Founder record', () => {
    const once = update(incidentDue(), Message.Ticked({ elapsedMs: TICK_MS })).model
    expect(once.founder.achievements).toContain('hello-world')
    expect(once.toast?.message).toBeDefined()
    const twice = update(once, Message.Ticked({ elapsedMs: TICK_MS })).model
    expect(twice.founder.achievements.filter((id) => id === 'hello-world')).toHaveLength(1)
  })

  test('a Sandbox earns no achievement', () => {
    const sandbox: Model = {
      ...inLab(),
      board: {
        ...inLab().board,
        game: { ...newGame(), sandbox: true },
        session: {
          _tag: 'Sandbox',
          run: { id: null, progress: { objective: 0, held: 0, fired: false } },
        },
      },
    }
    const after = update(sandbox, Message.Ticked({ elapsedMs: TICK_MS })).model
    expect(after.founder.achievements).toEqual([])
  })

  test('mute and reduced motion are saved as prefs, not in the Game', () => {
    const start = inLab()
    const muted = update(start, Message.PrefsChanged({ message: PrefsMessage.MuteToggled() }))
    expect(muted.model.prefs.muted).toBe(true)
    expect(muted.model.board.game).toBe(start.board.game)
    const write = names(muted.commands).find((command) => command.name === 'WritePrefs')
    expect(write?.args['prefs']).toMatchObject({ muted: true, motion: 'system' })
    expect(update(start, Message.KeyPressed({ key: 'm' })).model.prefs.muted).toBe(true)
    expect(
      update(start, Message.PrefsChanged({ message: PrefsMessage.MotionToggled() })).model.prefs
        .motion,
    ).toBe('reduce')
  })

  test('arrow keys move the selection between Nodes', () => {
    const start: Model = { ...inLab(), board: { ...inLab().board, selected: 'users' } }
    const moved = update(start, Message.KeyPressed({ key: 'ArrowRight' })).model
    expect(moved.board.selected).not.toBe('users')
    expect(moved.board.selected).not.toBeNull()
  })
})

describe('URL routing', () => {
  type Named = Readonly<{ name: string; args: Record<string, unknown> }>
  const named = (commands: ReadonlyArray<unknown> | undefined) =>
    (commands ?? []) as ReadonlyArray<Named>
  const pushed = (commands: ReadonlyArray<unknown> | undefined) =>
    named(commands)
      .filter((command) => command.name === 'PushUrl' || command.name === 'ReplaceUrl')
      .map((command) => `${command.name} ${String(command.args['url'])}`)
  const loads = (commands: ReadonlyArray<unknown> | undefined) =>
    named(commands)
      .filter((command) => command.name === 'LoadCompany')
      .map((command) => command.args)
  /** One stored Company, and the index that points at it. */
  const stored = () => {
    const game = { ...preseedGame() }
    const file = fileFor({
      id: 'c-one',
      name: 'Stored Co',
      logo: 'signal',
      founding: game.founding,
      game,
      now: 1_000,
    })
    return { game, index: { current: file.id, companies: [file] } }
  }
  const founder = () => {
    const record = { ...initialModel().founder, deviceId: 'device' }
    return { record, json: JSON.stringify(record) }
  }

  test('a board URL on a fresh load reopens that board once its data has loaded', () => {
    const fresh = init(at('/company'))
    expect(fresh.model.route).toEqual(AppRoute.Company())
    expect(fresh.model.boot._tag).toBe('Ready')
    expect(pushed(fresh.commands)).toEqual([])
    const { index, game } = stored()
    const waiting = update(
      fresh.model,
      Message.SavesLoaded({ index: JSON.stringify(index), legacy: null, now: 2_000 }),
    )
    expect(loads(waiting.commands)).toEqual([{ id: 'c-one', open: true }])
    const open = update(
      waiting.model,
      Message.CompanyLoaded({ id: 'c-one', open: true, json: JSON.stringify(game) }),
    )
    expect(open.model.route).toEqual(AppRoute.Company())
    expect(open.model.board.game.seed).toBe(game.seed)
    expect(hasCompany(open.model)).toBe(true)
  })

  test('a Company URL with nothing to open goes back to the title', () => {
    const fresh = init(at('/company'))
    const none = update(fresh.model, Message.SavesLoaded({ index: null, legacy: null, now: 0 }))
    expect(none.model.route).toEqual(AppRoute.Title())
    expect(pushed(none.commands)).toEqual(['ReplaceUrl /'])
    const { index } = stored()
    const waiting = update(
      fresh.model,
      Message.SavesLoaded({ index: JSON.stringify(index), legacy: null, now: 0 }),
    )
    const missing = update(
      waiting.model,
      Message.CompanyLoaded({ id: 'c-one', open: true, json: null }),
    )
    expect(missing.model.route).toEqual(AppRoute.Title())
    expect(pushed(missing.commands)).toEqual(['ReplaceUrl /'])
  })

  test('a Sandbox URL on a fresh load reopens the stored free board', () => {
    const free = preseedGame()
    const fresh = init(at('/sandbox/free'))
    expect(fresh.model.route).toEqual(AppRoute.Sandbox({ sandbox: 'free' }))
    const model = update(
      fresh.model,
      Message.SandboxStoreLoaded({ json: JSON.stringify({ passed: [], free }) }),
    ).model
    expect(boardSandbox(model.board)?.id).toBeNull()
    expect(model.board.game.seed).toBe(free.seed)
  })

  test('a Company that loads behind an open Sandbox waits aside', () => {
    const { index, game } = stored()
    const fresh = init(at('/sandbox/free'))
    const sandbox = update(
      fresh.model,
      Message.SandboxStoreLoaded({
        json: JSON.stringify({ passed: [], free: preseedGame(99) }),
      }),
    ).model
    const waiting = update(
      sandbox,
      Message.SavesLoaded({ index: JSON.stringify(index), legacy: null, now: 2_000 }),
    ).model
    const after = update(
      waiting,
      Message.CompanyLoaded({ id: 'c-one', open: false, json: JSON.stringify(game) }),
    ).model
    expect(boardSandbox(after.board)?.id).toBeNull()
    expect(after.board.game.seed).toBe(99)
    expect(after.company?.game.seed).toBe(game.seed)
    expect(after.saves.current).toBe('c-one')
  })

  test('a Challenge URL on a fresh load opens it once the Founder has loaded', () => {
    const fresh = init(at('/challenges/hello-world'))
    expect(fresh.model.route).toEqual(AppRoute.Challenge({ challenge: 'hello-world' }))
    const { record, json } = founder()
    const opened = update(
      fresh.model,
      Message.FounderLoaded({ json, deviceId: record.deviceId, today: '2026-11-02' }),
    )
    expect(boardChallenge(opened.model.board)?.id).toBe('hello-world')
    expect(pushed(opened.commands)).toEqual([])
  })

  test('a Challenge URL for an unknown Challenge lands on the Challenge list', () => {
    const fresh = init(at('/challenges/no-such-challenge'))
    const { record, json } = founder()
    const landed = update(
      fresh.model,
      Message.FounderLoaded({ json, deviceId: record.deviceId, today: '2026-11-02' }),
    )
    expect(landed.model.route).toEqual(AppRoute.Menu({ menu: 'challenges' }))
    expect(pushed(landed.commands)).toEqual(['ReplaceUrl /challenges'])
    expect(boardChallenge(landed.model.board)).toBeNull()
  })

  test('a menu URL on a fresh load keeps its page, and an unknown one drops to the title', () => {
    expect(pushed(init(at('/history')).commands)).toEqual([])
    const unknown = init(at('/no/such/page'))
    expect(unknown.model.route).toEqual(AppRoute.Title())
    expect(pushed(unknown.commands)).toEqual(['ReplaceUrl /'])
  })

  test('opening a Sandbox adds its URL; back closes it and gives the Company back', () => {
    const company = inLab()
    const opened = update(company, Message.FreeSandboxStarted())
    expect(opened.model.route).toEqual(AppRoute.Sandbox({ sandbox: 'free' }))
    expect(pushed(opened.commands)).toEqual(['PushUrl /sandbox/free'])

    const back = update(opened.model, Message.ChangedUrl({ url: at('/') }))
    expect(back.model.route).toEqual(AppRoute.Title())
    expect(boardSandbox(back.model.board)).toBeNull()
    expect(back.model.board.game).toBe(company.board.game)
    expect(pushed(back.commands)).toEqual([])

    const forward = update(back.model, Message.ChangedUrl({ url: at('/sandbox/second-server') }))
    expect(boardSandbox(forward.model.board)?.id).toBe('second-server')
    expect(pushed(forward.commands)).toEqual([])
  })

  test('a URL for a board that cannot open goes back to the screen in place', () => {
    const title = initialModel()
    const company = update(title, Message.ChangedUrl({ url: at('/company') }))
    expect(company.model.route).toEqual(AppRoute.Title())
    expect(pushed(company.commands)).toEqual(['ReplaceUrl /'])
    const unknown = update(title, Message.ChangedUrl({ url: at('/challenges/no-such-drill') }))
    expect(pushed(unknown.commands)).toEqual(['ReplaceUrl /'])
  })
})

describe('progressive disclosure', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)
  /** Founding from the title plays the monitor's connect sequence; the board takes keys once it ends. */
  const founded = (): Model => {
    const connecting = send(initialModel(), Message.CompanyFounded())
    expect(connecting.boot._tag).toBe('Connecting')
    expect(send(connecting, Message.KeyPressed({ key: 'r' })).panel).toBe('none')
    const open = send(connecting, Message.Connected())
    expect(open.boot._tag).toBe('Ready')
    return open
  }

  test('a first Company opens on the board, with Research shut until Insight can buy an item', () => {
    const start = founded()
    expect(start.panel).toBe('none')
    expect(start.board.disclosure.revealed).not.toContain('research')
    expect(send(start, Message.KeyPressed({ key: 'r' })).panel).toBe('none')
    // The cheapest Garage item costs 15 Insight: 14 is not enough, 15 is.
    const short = tick({
      ...start,
      board: { ...start.board, game: { ...start.board.game, insight: 14 } },
    })
    expect(short.board.disclosure.revealed).not.toContain('research')
    const enough = tick({
      ...start,
      board: { ...start.board, game: { ...start.board.game, insight: 15 } },
    })
    expect(enough.board.disclosure.revealed).toContain('research')
    expect(enough.board.disclosure).toMatchObject({ _tag: 'Cueing', key: 'research' })
    const opened = send(enough, Message.KeyPressed({ key: 'r' }))
    expect(opened.panel).toBe('research')
    expect(opened.board.disclosure._tag).not.toBe('Cueing')
  })

  test('two triggers at once show one element; the second waits until the first is used', () => {
    const start = founded()
    const both = tick(
      send(
        {
          ...start,
          board: { ...start.board, game: { ...start.board.game, insight: 100, cash: 10_000 } },
        },
        Message.ResizeChosen({ nodeId: 'server', direction: 1 }),
      ),
    )
    expect(both.board.disclosure.revealed).toContain('undo')
    expect(both.board.disclosure.revealed).not.toContain('research')
    expect(both.board.disclosure._tag).not.toBe('Idle')
    if (both.board.disclosure._tag === 'Idle') throw new Error('Expected a queued disclosure')
    expect(both.board.disclosure.pending).toContain('research')
    const used = tick(send(both, Message.UndoChosen()))
    expect(used.board.disclosure.revealed).toContain('research')
    expect(used.board.disclosure).toMatchObject({ _tag: 'Cueing', key: 'research' })
  })

  test('a save from before disclosure shows everything; a save with it keeps its set', () => {
    const game = preseedGame()
    const old = send(
      initialModel(),
      Message.SavesLoaded({ index: null, legacy: JSON.stringify(game), now: 0 }),
    )
    expect(old.board.disclosure.revealed).toContain('team')
    expect(old.board.disclosure.revealed).toContain('glossary')
    const kept = send(
      initialModel(),
      Message.SavesLoaded({
        index: null,
        legacy: JSON.stringify({ ...game, disclosure: { revealed: ['undo'], pending: ['team'] } }),
        now: 0,
      }),
    )
    expect(kept.board.disclosure.revealed).toEqual(['undo'])
    expect(kept.board.disclosure).toMatchObject({ _tag: 'Queued', pending: ['team'] })
  })
})

test('tidying the board groups nodes into a band per zone, in flow order', () => {
  const game = newGame()
  const [first, second, third] = game.nodes
  const model: Model = {
    ...inLab(),
    board: {
      ...inLab().board,
      game: {
        ...game,
        links: [
          { ...game.links[0]!, from: 'p', to: 'q' },
          { ...game.links[0]!, from: 'u', to: 'r' },
        ],
        nodes: [
          { ...first!, id: 'q', type: 'server', zone: 'a', x: 40, y: 500 },
          { ...second!, id: 'p', type: 'server', zone: 'a', x: 400, y: 300 },
          { ...third!, id: 'r', type: 'server', zone: 'b', x: 10, y: 50 },
          { ...first!, id: 'u', type: 'lb', x: 600, y: 0 },
        ],
      },
    },
  }
  const [q, p, r, u] = update(model, Message.BoardTidied()).model.board.game.nodes
  expect(p!.x).toBeLessThan(q!.x)
  // The link from p to q runs straight: its two ports share a row.
  expect(outPort(p!).y).toBe(inPort(q!).y)
  expect(r!.y).toBeGreaterThan(q!.y)
  // The zone-b card sits right of the Load Balancer that feeds it from another band.
  expect(r!.x).toBeGreaterThan(u!.x)
})

test('Enter places the part in hand in the next free spot', () => {
  const start = inLab()
  const model: Model = {
    ...start,
    board: {
      ...start.board,
      game: { ...newGame(), links: [], cash: 1_000_000 },
    },
  }
  const placing = update(model, Message.PlacingChosen({ type: 'server' })).model
  const placed = update(placing, Message.KeyPressed({ key: 'Enter' }))
  const nodes = placed.model.board.game.nodes
  expect(nodes.filter((node) => node.type === 'server')).toHaveLength(2)
  expect(placed.model.board.flow._tag).toBe('Idle')
  const added = nodes[nodes.length - 1]!
  // The new card keeps its clearance, as a pointer drop does.
  for (const other of nodes.slice(0, -1)) expect(crowds(boxOf(added), boxOf(other))).toBe(false)
})

test('L starts a link, an arrow picks the other end, and Enter links them', () => {
  const start = inLab()
  const game: Model['board']['game'] = { ...newGame(), links: [], cash: 1_000_000 }
  const model: Model = {
    ...start,
    board: { ...start.board, game, selected: 'users' },
  }
  const began = update(model, Message.KeyPressed({ key: 'l' })).model
  expect(began.board.flow).toEqual({ _tag: 'Linking', from: 'users' })
  expect(began.board.game).toBe(game)
  // The arrows still pick the other end while the link is in progress.
  const picked = update(began, Message.KeyPressed({ key: 'ArrowRight' })).model
  expect(picked.board.selected).not.toBe('users')
  const linked = update(picked, Message.KeyPressed({ key: 'Enter' })).model
  expect(linked.board.flow._tag).toBe('Idle')
  expect(linked.board.game.links).toEqual([expect.objectContaining({ from: 'users' })])
  // Escape cancels a link that has not been made.
  expect(update(began, Message.KeyPressed({ key: 'Escape' })).model.board.flow._tag).toBe('Idle')
})

test('Shift+T tidies by zone and Shift+F fits the board, as their buttons do', () => {
  const game = newGame()
  const [first, second, third] = game.nodes
  const start = inLab()
  const model: Model = {
    ...start,
    board: {
      ...start.board,
      game: {
        ...game,
        links: [{ ...game.links[0]!, from: 'p', to: 'q' }],
        nodes: [
          { ...first!, id: 'q', type: 'server', zone: 'a', x: 40, y: 500 },
          { ...second!, id: 'p', type: 'server', zone: 'a', x: 400, y: 300 },
          { ...third!, id: 'r', type: 'server', zone: 'b', x: 10, y: 50 },
        ],
      },
    },
  }
  const tidied = update(model, Message.KeyPressed({ key: 'Shift+t' }))
  expect(tidied.commands).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'SyncBoard', args: expect.objectContaining({ fit: true }) }),
    ]),
  )
  expect(tidied.model.board.undo.at(-1)?.label).toBe('Tidied the board by zone')
  const fitted = update(model, Message.KeyPressed({ key: 'Shift+f' }))
  expect((fitted.commands ?? []).map((command) => command.name)).toContain('FitBoard')
  expect(fitted.model.board.game).toBe(model.board.game)
})

test('opening the Dashboard moves keyboard focus onto its scroll area', () => {
  const opened = update(inLab(), Message.PanelOpened({ panel: 'dashboard' }))
  expect(opened.model.panel).toBe('dashboard')
  expect((opened.commands ?? []).map((command) => command.name)).toContain('FocusDashboard')
  // Opening another panel leaves focus where it was.
  const research = update(opened.model, Message.PanelOpened({ panel: 'research' }))
  expect((research.commands ?? []).map((command) => command.name)).not.toContain('FocusDashboard')
})

test('losing focus pauses the clock and focus resumes it, unless the setting is off', () => {
  const blurred = update(inLab(), Message.WindowBlurred()).model
  expect(blurred.board.clock.mode._tag !== 'Running').toBe(true)
  expect(update(blurred, Message.WindowFocused()).model.board.clock.mode._tag !== 'Running').toBe(
    false,
  )
  const easy = { ...inLab(), prefs: { ...inLab().prefs, easyMode: true } }
  const manual = update(easy, Message.PauseToggled()).model
  expect(update(manual, Message.WindowFocused()).model.board.clock.mode._tag !== 'Running').toBe(
    true,
  )
  const off = update(
    inLab(),
    Message.PrefsChanged({ message: PrefsMessage.BlurPauseToggled() }),
  ).model
  expect(update(off, Message.WindowBlurred()).model.board.clock.mode._tag !== 'Running').toBe(false)
})

test('only Easy mode pauses and speeds up the clock, and turning it off restores 1×', () => {
  const running = (model: Model) => model.board.clock.mode._tag === 'Running'
  const hard = inLab()
  const spaced = update(hard, Message.KeyPressed({ key: ' ' })).model
  expect(running(spaced)).toBe(true)
  expect(update(hard, Message.KeyPressed({ key: 's' })).model.board.clock.speed).toBe(1)

  const easy = update(hard, Message.PrefsChanged({ message: PrefsMessage.EasyModeToggled() })).model
  const paused = update(easy, Message.KeyPressed({ key: ' ' })).model
  const fast = update(paused, Message.KeyPressed({ key: 's' })).model
  expect(running(fast)).toBe(false)
  expect(fast.board.clock.speed).toBeGreaterThan(1)

  const off = update(fast, Message.PrefsChanged({ message: PrefsMessage.EasyModeToggled() })).model
  expect(running(off)).toBe(true)
  expect(off.board.clock.speed).toBe(1)
})

test('the Mentor offers Easy mode once to a Company with too many severe incidents', () => {
  const lab = inLab()
  const postmortem = (id: number, severity: number): Postmortem => ({
    id,
    kind: 'spike',
    target: null,
    duration: 30,
    mttr: 30,
    mttd: null,
    mtta: null,
    lostUsers: 0,
    lostRevenue: 0,
    failed: 0,
    action: null,
    severity,
    endedAt: null,
    causedBy: null,
  })
  const atHourTurn = (postmortems: ReadonlyArray<Postmortem>): Model => ({
    ...lab,
    board: { ...lab.board, game: { ...lab.board.game, time: 59.9, postmortems } },
  })
  const offers = (model: Model) =>
    update(model, Message.Ticked({ elapsedMs: TICK_MS })).model.board.inbox.mail.filter(
      (mail) => mail.key === 'mentor:easy-mode',
    )
  // Two severe incidents and a SEV3 are not enough.
  expect(offers(atHourTurn([postmortem(1, 1), postmortem(2, 2), postmortem(3, 3)]))).toEqual([])

  const struggling = atHourTurn([postmortem(1, 1), postmortem(2, 2), postmortem(3, 1)])
  const ticked = update(struggling, Message.Ticked({ elapsedMs: TICK_MS })).model
  const [offer] = ticked.board.inbox.mail.filter((mail) => mail.key === 'mentor:easy-mode')
  expect(offer?.actions).toEqual([{ id: 'easy', label: 'Turn on Easy mode' }])
  const accepted = update(
    ticked,
    Message.InboxChanged({ message: InboxMessage.Acted({ id: offer!.id, action: 'easy' }) }),
  ).model
  expect(accepted.prefs.easyMode).toBe(true)

  // Declined by deleting it: the next hour does not ask again.
  const trashed = update(
    ticked,
    Message.InboxChanged({ message: InboxMessage.Trashed({ id: offer!.id }) }),
  ).model
  const nextHour = {
    ...trashed,
    board: { ...trashed.board, game: { ...trashed.board.game, time: 119.9 } },
  }
  expect(offers(nextHour)).toHaveLength(1)
})

test('a queued Study can run now, keeping the running one’s progress, and be cancelled', () => {
  const ready = researchList.filter((entry) => researchReady(newGame(), entry.id))
  const [first, second] = ready
  if (!first || !second) throw new Error('needs two open items')
  const lab = inLab()
  const queued: Model = {
    ...lab,
    board: {
      ...lab.board,
      game: {
        ...lab.board.game,
        studies: [
          { id: first.id, phase: { _tag: 'Running', progress: 0.25 } },
          { id: second.id, phase: { _tag: 'Queued', progress: 0 } },
        ],
      },
    },
  }
  const now = update(
    queued,
    Message.ResearchChanged({ message: ResearchMessage.StudyPrioritized({ id: second.id }) }),
  ).model
  expect(now.board.game.studies).toEqual([
    { id: second.id, phase: { _tag: 'Queued', progress: 0 } },
    { id: first.id, phase: { _tag: 'Running', progress: 0.25 } },
  ])
  const back = update(
    now,
    Message.ResearchChanged({
      message: ResearchMessage.StudyMoved({ id: first.id, direction: -1 }),
    }),
  ).model
  expect(back.board.game.studies.map((item) => item.id)).toEqual([first.id, second.id])
  const cancelled = update(
    back,
    Message.ResearchChanged({ message: ResearchMessage.StudyCancelled({ id: first.id }) }),
  ).model
  expect(cancelled.board.game.studies).toEqual([
    { id: second.id, phase: { _tag: 'Queued', progress: 0 } },
  ])
})

test('dragging a Study row reorders the queue and keeps its progress', () => {
  const ready = researchList.filter((entry) => researchReady(newGame(), entry.id))
  const [first, second] = ready
  if (!first || !second) throw new Error('needs two open items')
  const lab = inLab()
  const queued: Model = {
    ...lab,
    panel: 'research',
    board: {
      ...lab.board,
      game: {
        ...lab.board.game,
        studies: [
          { id: first.id, phase: { _tag: 'Running', progress: 0.25 } },
          { id: second.id, phase: { _tag: 'Queued', progress: 0 } },
        ],
      },
    },
  }
  const send = (model: Model, message: DragAndDrop.Message) =>
    update(model, Message.ResearchChanged({ message: ResearchMessage.DragChanged({ message }) }))
      .model
  const picked = send(
    queued,
    DragAndDrop.Message.PressedDraggable({
      itemId: first.id,
      containerId: STUDY_QUEUE,
      index: 0,
      screenX: 0,
      screenY: 0,
    }),
  )
  // The component counts the dragged row where it started, so index 2 is the end of the queue.
  const over = send(
    picked,
    DragAndDrop.Message.MovedPointer({
      screenX: 0,
      screenY: 40,
      clientX: 0,
      clientY: 40,
      maybeDropTarget: Option.some({ containerId: STUDY_QUEUE, index: 2 }),
    }),
  )
  const dropped = send(over, DragAndDrop.Message.ReleasedPointer())
  expect(dropped.board.game.studies).toEqual([
    { id: second.id, phase: { _tag: 'Queued', progress: 0 } },
    { id: first.id, phase: { _tag: 'Running', progress: 0.25 } },
  ])
})

/* Queueing a locked Study with its prerequisites. In the Garage, OPcache needs PHP-FPM. */

const queuedStudy = (id: ResearchId, progress = 0) => ({
  id,
  phase: { _tag: 'Queued' as const, progress },
})

const withStudies = (studies: Model['board']['game']['studies'], model = inLab()): Model => ({
  ...model,
  panel: 'research',
  board: { ...model.board, game: { ...model.board.game, studies } },
})

const research = (model: Model, message: ResearchMessage) =>
  update(model, Message.ResearchChanged({ message })).model

test('queueing a locked item queues its missing prerequisites first, within the queue limit', () => {
  const queued = research(withStudies([]), ResearchMessage.Bought({ id: 'opcache' }))
  expect(queued.board.game.studies).toEqual([queuedStudy('php-fpm'), queuedStudy('opcache')])
  expect(queued.toast?.message).toMatch(/^Studies queued: PHP-FPM, OPcache\./)
  // A queued prerequisite keeps its place: only the item joins, at the end.
  const behind = research(
    withStudies([queuedStudy('php-fpm', 0.4), queuedStudy('gzip')]),
    ResearchMessage.Bought({ id: 'opcache' }),
  )
  expect(behind.board.game.studies).toEqual([
    queuedStudy('php-fpm', 0.4),
    queuedStudy('gzip'),
    queuedStudy('opcache'),
  ])
  // The limit counts the whole chain: one free slot is not room for two Studies.
  const others = researchList
    .filter((entry) => researchReady(newGame(), entry.id) && entry.id !== 'php-fpm')
    .slice(0, MAX_STUDIES - 1)
    .map((entry) => queuedStudy(entry.id))
  const full = withStudies(others)
  const refused = research(full, ResearchMessage.Bought({ id: 'opcache' }))
  expect(refused.board.game.studies).toBe(full.board.game.studies)
  expect(refused.toast?.message).toBe(
    `The queue holds ${MAX_STUDIES} Studies, and OPcache needs 2 of them.`,
  )
})

test('Study now brings the chain to the front, and queued members keep their progress', () => {
  const running = { id: 'gzip' as const, phase: { _tag: 'Running' as const, progress: 0.25 } }
  const now = research(
    withStudies([running, queuedStudy('php-fpm', 0.4)]),
    ResearchMessage.StudyPrioritized({ id: 'opcache' }),
  )
  expect(now.board.game.studies).toEqual([
    queuedStudy('php-fpm', 0.4),
    queuedStudy('opcache'),
    running,
  ])
  expect(now.toast?.message).toBe('Studying now: PHP-FPM, then OPcache.')
})

test('no move puts a Study above a queued prerequisite, by drag or by arrow', () => {
  const start = withStudies([queuedStudy('php-fpm'), queuedStudy('gzip'), queuedStudy('opcache')])
  const drag = (model: Model, id: ResearchId, from: number, to: number) => {
    const send = (current: Model, message: DragAndDrop.Message) =>
      research(current, ResearchMessage.DragChanged({ message }))
    const picked = send(
      model,
      DragAndDrop.Message.PressedDraggable({
        itemId: id,
        containerId: STUDY_QUEUE,
        index: from,
        screenX: 0,
        screenY: 0,
      }),
    )
    const over = send(
      picked,
      DragAndDrop.Message.MovedPointer({
        screenX: 0,
        screenY: 40,
        clientX: 0,
        clientY: 40,
        maybeDropTarget: Option.some({ containerId: STUDY_QUEUE, index: to }),
      }),
    )
    return send(over, DragAndDrop.Message.ReleasedPointer())
  }
  const ids = (model: Model) => model.board.game.studies.map((item) => item.id)
  // Two rows up, past Gzip and then PHP-FPM: refused, and the queue stays as it was.
  const above = drag(start, 'opcache', 2, 0)
  expect(ids(above)).toEqual(['php-fpm', 'gzip', 'opcache'])
  expect(above.toast?.message).toBe('OPcache needs PHP-FPM first.')
  // The component counts the dragged row where it started, so index 3 is the end of the queue.
  expect(ids(drag(start, 'php-fpm', 0, 3))).toEqual(['php-fpm', 'gzip', 'opcache'])
  // A row that needs neither moves freely.
  expect(ids(drag(start, 'gzip', 1, 0))).toEqual(['gzip', 'php-fpm', 'opcache'])
  const swapped = withStudies([queuedStudy('php-fpm'), queuedStudy('opcache')])
  const arrow = research(swapped, ResearchMessage.StudyMoved({ id: 'opcache', direction: -1 }))
  expect(ids(arrow)).toEqual(['php-fpm', 'opcache'])
  // The refusal reads in the player's language.
  const french = { ...swapped, prefs: { ...swapped.prefs, locale: 'fr' as const } }
  expect(
    research(french, ResearchMessage.StudyMoved({ id: 'php-fpm', direction: 1 })).toast?.message,
  ).toBe('OPcache nécessite d’abord PHP-FPM.')
})

test('cancelling a prerequisite cancels the queued Studies that need it, and its Spike', () => {
  const start = withStudies([queuedStudy('php-fpm'), queuedStudy('gzip'), queuedStudy('opcache')])
  const spiked: Model = {
    ...start,
    board: {
      ...start.board,
      game: Result.getOrThrow(Work.queueSpike(start.board.game)),
    },
  }
  expect(spiked.board.game.backlog.some((item) => item.kind === 'spike')).toBe(true)
  const cancelled = research(spiked, ResearchMessage.StudyCancelled({ id: 'php-fpm' }))
  expect(cancelled.board.game.studies).toEqual([queuedStudy('gzip')])
  expect(cancelled.board.game.backlog.some((item) => item.kind === 'spike')).toBe(false)
  expect(cancelled.toast?.message).toBe('Study cancelled: PHP-FPM, with OPcache, which needed it.')
  // Cancelling the dependant leaves its prerequisite queued.
  const alone = research(start, ResearchMessage.StudyCancelled({ id: 'opcache' }))
  expect(alone.board.game.studies).toEqual([queuedStudy('php-fpm'), queuedStudy('gzip')])
})

test('pointer-rate Messages stay out of the playtest log, and gestures go in', () => {
  const names = (result: ReturnType<typeof update>) =>
    (result.commands ?? []).map((command) => command.name)
  const hovered = update(
    inLab(),
    Message.DashboardChanged({ message: DashboardMessage.Hovered({ index: 3 }) }),
  )
  expect(names(hovered)).not.toContain('AppendLog')
  const found = update(inLab(), Message.BottleneckFound({ bottleneck: null, at: 0 }))
  expect(names(found)).not.toContain('AppendLog')
  const opened = update(inLab(), Message.PanelOpened({ panel: 'menu' }))
  expect(names(opened)).toContain('AppendLog')
})

test('a save this version cannot read is kept aside instead of dropped', () => {
  const game = newGame()
  const saved = JSON.stringify({ ...game })
  const loaded = update(initialModel(), Message.SavesLoaded({ index: null, legacy: saved, now: 0 }))
  expect(hasCompany(loaded.model)).toBe(true)
  expect(loaded.model.saves.current).not.toBeNull()
  expect(loaded.model.board.game.nodes).toEqual(game.nodes)

  const renamed = JSON.stringify({
    ...game,
    nodes: game.nodes.map((node) => ({ ...node, type: 'retired-component' })),
  })
  for (const json of [renamed, '{not json']) {
    const broken = update(
      initialModel(),
      Message.SavesLoaded({ index: null, legacy: json, now: 0 }),
    )
    expect(broken.model.companyPhase).toEqual({ _tag: 'None' })
    expect(broken.model.toast?.tone).toBe('warn')
    expect(broken.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'KeepBrokenSave',
          args: expect.objectContaining({ json }),
        }),
      ]),
    )
  }
})

test('a save travels as one line of text, and only a save of this build opens it', () => {
  const start = inLab()
  const file = fileFor({
    id: 'c',
    name: 'Acme',
    logo: 'bolt',
    founding: start.board.game.founding,
    game: start.board.game,
    now: 0,
  })
  const playable: Model = {
    ...start,
    companyPhase: { _tag: 'Open', id: 'c' },
    saves: { ...withFile(EMPTY_SAVE_INDEX, file), current: 'c' },
  }
  const exported = update(playable, Message.SaveExported())
  const copied = (
    (exported.commands ?? []) as ReadonlyArray<{
      name: string
      args: Record<string, unknown>
    }>
  ).find((command) => command.name === 'CopyText')
  const text = String(copied?.args['text'] ?? '')
  expect(text.startsWith('QSV1:')).toBe(true)

  // Pasting it back opens the same Company, on a fresh board to work on.
  const opened = update(playable, Message.SaveImported({ text }))
  expect(hasCompany(opened.model)).toBe(true)
  expect(opened.model.toast?.tone).toBe('ok')
  expect(opened.model.board.game.cash).toBe(playable.board.game.cash)
  expect(opened.model.board.game.nodes).toEqual(playable.board.game.nodes)
  expect(opened.model.board.undo).toEqual([])

  // Anything that is not a save of this build is refused, and the open Company stays.
  const other = encodeText('QSV1:', {
    version: 'stale',
    save: { ...playable.board.game },
  })
  for (const wrong of ['hello', other]) {
    const refused = update(playable, Message.SaveImported({ text: wrong }))
    expect(refused.model.toast?.tone).toBe('warn')
    expect(refused.model.board.game).toBe(playable.board.game)
  }

  // There is nothing to export before a Company exists.
  expect(update(initialModel(), Message.SaveExported()).model.toast?.tone).toBe('warn')
})

test('the board redraws after any Message that changes what it shows, and fits after the redraw', () => {
  const syncs = (result: ReturnType<typeof update>) =>
    (result.commands ?? []).filter((command) => command.name === 'SyncBoard')
  const entered = update(initialModel(), Message.FreeSandboxStarted())
  const names = (entered.commands ?? []).map((command) => command.name)
  expect(names).not.toContain('FitBoard')
  expect(syncs(entered)).toEqual([
    expect.objectContaining({ args: expect.objectContaining({ fit: true }) }),
  ])
  const fitted = update(entered.model, Message.BoardFitted())
  expect((fitted.commands ?? []).map((command) => command.name)).toContain('FitBoard')
  expect(syncs(fitted)).toEqual([])
})

test('the same refusal twice in a row is one toast with a count, and a warning stays longer', () => {
  const once = update(
    inLab(),
    Message.ToastRaised({ message: 'Backoff needs Backoff.', tone: 'warn' }),
  )
  const twice = update(
    once.model,
    Message.ToastRaised({ message: 'Backoff needs Backoff.', tone: 'warn' }),
  )
  expect(twice.model.toast?.count).toBe(2)
  const clear = (result: ReturnType<typeof update>) =>
    (result.commands ?? []).find((command) => command.name === 'ClearToast')
  // A refusal names a Research and a price, so it holds longer than a confirmation.
  expect(clear(once)?.args).toMatchObject({ after: TOAST_MS.warn })
  expect(TOAST_MS.warn).toBeGreaterThan(TOAST_MS.ok)
  // A different sentence starts the count again.
  const other = update(
    twice.model,
    Message.ToastRaised({ message: 'Nothing to undo.', tone: 'plain' }),
  )
  expect(other.model.toast?.count).toBe(1)
})

test("a toast from the last board cannot clear the next board's toast", () => {
  const raised = update(inLab(), Message.ToastRaised({ message: 'Old news.', tone: 'plain' })).model
  const oldId = raised.toast?.id
  const entered = update(raised, Message.FreeSandboxStarted()).model
  const fresh = update(entered, Message.ToastRaised({ message: 'New news.', tone: 'plain' })).model
  const cleared = update(fresh, Message.ToastCleared({ id: oldId ?? -1 })).model
  expect(cleared.toast?.message).toBe('New news.')
})

test('a Company comes back from a Sandbox as it was: its Inbox, history and undo too', () => {
  let company = update(
    inLab(),
    Message.InboxChanged({ message: InboxMessage.Generated({ count: 3 }) }),
  ).model
  for (let index = 0; index < 40; index += 1)
    company = update(company, Message.Ticked({ elapsedMs: TICK_MS })).model
  const sandbox = update(company, Message.FreeSandboxStarted()).model
  expect(sandbox.board.inbox.mail).toEqual([])
  const back = update(update(sandbox, Message.TitleOpened()).model, Message.Continued()).model
  expect(back.board.game).toBe(company.board.game)
  expect(back.board.inbox).toEqual(company.board.inbox)
  expect(back.board.dashboard.history).toEqual(company.board.dashboard.history)
  expect(back.board.undo).toEqual(company.board.undo)
})

test('the Inbox opens on Needs action while something needs the player, and on FYI otherwise', () => {
  const letter: Mail = {
    id: 1,
    key: 'mentor:grow:0',
    sender: 'mentor',
    subject: 'On the way to Pre-seed',
    time: 0,
    entries: [{ time: 0, text: 'Grow to 1,000 users.' }],
    actions: [],
    phase: { _tag: 'Active' } as const,
    read: false,
    trashed: false,
    spam: false,
  }
  const offer = { ...letter, id: 2, key: 'offer', actions: [{ id: 'raise', label: 'Raise' }] }
  const start = inLab()
  const opened = (mail: ReadonlyArray<Mail>) =>
    update(
      { ...start, board: { ...start.board, inbox: { ...start.board.inbox, mail } } },
      Message.PanelOpened({ panel: 'inbox' }),
    ).model.board.inbox
  // The list is what a phone lands on: opening the Inbox reads nothing and opens no thread.
  expect(opened([letter])).toMatchObject({ folder: 'fyi', focus: null })
  expect(opened([letter]).mail[0]?.read).toBe(false)
  // Read letters still beat an empty "Nothing needs you." pane.
  expect(opened([{ ...letter, read: true }])).toMatchObject({ folder: 'fyi', focus: null })
  expect(opened([]).folder).toBe('action')
  expect(opened([letter, offer])).toMatchObject({ folder: 'action', focus: null })
})

test('a stalled running Study raises a teammate alert that opens Research and closes when it moves', () => {
  // Pre-seed earns no `login` Insight before Password login ships, so Managed identity stalls.
  const start: Model = {
    ...inLab(),
    board: {
      ...inLab().board,
      game: {
        ...preseedGame(),
        nextIncidentAt: Number.MAX_SAFE_INTEGER,
        studies: [{ id: 'auth-provider', phase: { _tag: 'Queued', progress: 0 } }],
      },
    },
  }
  const stalled = tick(start, 8)
  const alert = stalled.board.inbox.mail.find(
    (mail) => mail.key === 'research:stalled:auth-provider',
  )
  expect(alert?.subject).toBe('Managed identity can’t run yet')
  expect(alert?.entries).toHaveLength(1)
  expect(alert?.actions[0]?.id).toBe('research:auth-provider')
  const opened = update(
    stalled,
    Message.InboxChanged({
      message: InboxMessage.Acted({ id: alert!.id, action: 'research:auth-provider' }),
    }),
  ).model
  expect(opened.panel).toBe('research')
  expect(opened.board.research.focus).toBe('auth-provider')
  const cancelled = tick(
    update(
      stalled,
      Message.ResearchChanged({ message: ResearchMessage.StudyCancelled({ id: 'auth-provider' }) }),
    ).model,
  )
  const after = cancelled.board.inbox.mail.find((mail) => mail.key === alert!.key)
  expect(after?.phase._tag).toBe('Resolved')
  // A player who read the alert and then cancelled gets no fresh unread Mail for it.
  const seen: Model = {
    ...stalled,
    board: {
      ...stalled.board,
      inbox: {
        ...stalled.board.inbox,
        mail: stalled.board.inbox.mail.map((mail) => ({ ...mail, read: true })),
      },
    },
  }
  const quiet = tick(
    update(
      seen,
      Message.ResearchChanged({ message: ResearchMessage.StudyCancelled({ id: 'auth-provider' }) }),
    ).model,
  )
  expect(quiet.board.inbox.mail.find((mail) => mail.key === alert!.key)?.read).toBe(true)
})

test('the $ key opens the cloud bill without changing the Game', () => {
  const start = inLab()
  const opened = update(start, Message.KeyPressed({ key: '$' }))
  expect(opened.model.panel).toBe('cost')
  expect(opened.model.board.game).toBe(start.board.game)
  const closed = update(opened.model, Message.KeyPressed({ key: '$' }))
  expect(closed.model.panel).toBe('none')
})

test('buying ten sizes grows a Node once, and Max reaches the largest size', () => {
  const base = {
    ...inLab(),
    board: { ...inLab().board, game: { ...preseedGame(), cash: 1e9 } },
  }
  const picking = update(base, Message.PlacingChosen({ type: 'server' }))
  const placed = update(picking.model, Message.NodePlaced({ x: 400, y: 300 })).model
  const id = placed.board.game.nodes.at(-1)?.id ?? ''
  const sizeOf = (model: typeof placed) =>
    model.board.game.nodes.find((node) => node.id === id)?.size ?? -1
  const before = sizeOf(placed)
  const ten = update(placed, Message.BulkResizeChosen({ nodeId: id, mode: 'ten' })).model
  expect(sizeOf(ten)).toBe(Math.min(before + 10, SIZES.length - 1))
  expect(ten.board.game.cash).toBeLessThan(placed.board.game.cash)
  const max = update(placed, Message.BulkResizeChosen({ nodeId: id, mode: 'max' })).model
  expect(sizeOf(max)).toBe(SIZES.length - 1)
})

test('a held buy repeats once a tick, and stops on release', () => {
  const base: Model = {
    ...inLab(),
    board: { ...inLab().board, game: { ...newGame(), cash: 1e9 } },
  }
  const sizeOf = (model: Model) =>
    model.board.game.nodes.find((node) => node.id === 'server')?.size ?? -1
  const held = update(base, Message.HoldStarted({ nodeId: 'server', now: 1_000 })).model
  expect(held.board.hold).toEqual({ _tag: 'Held', nodeId: 'server', at: 1_000 })
  // Inside the repeat the hold buys nothing.
  expect(sizeOf(update(held, Message.HoldRepeated({ nodeId: 'server', now: 1_100 })).model)).toBe(1)
  const one = update(held, Message.HoldRepeated({ nodeId: 'server', now: 1_250 })).model
  expect(sizeOf(one)).toBe(2)
  // A stalled frame delivers stale repeats: the third buys once, and the rest wait.
  const stale = [1_260, 1_270, 1_280].reduce(
    (model, now) => update(model, Message.HoldRepeated({ nodeId: 'server', now })).model,
    one,
  )
  expect(sizeOf(stale)).toBe(2)
  // The next tick counts from when that buy landed, not from the stale ones.
  expect(sizeOf(update(stale, Message.HoldRepeated({ nodeId: 'server', now: 1_510 })).model)).toBe(
    3,
  )
  // Release ends the hold, and a late repeat buys nothing.
  const released = update(one, Message.HoldEnded({ nodeId: 'server' })).model
  expect(released.board.hold).toEqual({ _tag: 'Idle' })
  expect(
    sizeOf(update(released, Message.HoldRepeated({ nodeId: 'server', now: 9_000 })).model),
  ).toBe(2)
  // A pointer lift anywhere ends it too, so a button that unmounted cannot keep buying.
  expect(update(held, Message.HoldLifted()).model.board.hold).toEqual({ _tag: 'Idle' })
})

test('a held buy stops at the size cap or when Cash runs out, and says why once', () => {
  const base = (cash: number): Model => ({
    ...inLab(),
    board: { ...inLab().board, game: { ...newGame(), cash } },
  })
  const sizeOf = (model: Model) =>
    model.board.game.nodes.find((node) => node.id === 'server')?.size ?? -1
  let rising = update(base(1e9), Message.HoldStarted({ nodeId: 'server', now: 0 })).model
  for (let tick = 1; tick <= 12; tick += 1)
    rising = update(rising, Message.HoldRepeated({ nodeId: 'server', now: tick * 250 })).model
  expect(sizeOf(rising)).toBe(SIZES.length - 1)
  expect(rising.board.hold).toEqual({ _tag: 'Idle' })
  expect(rising.toast?.tone).toBe('warn')
  expect(rising.toast?.message).toContain('largest size')
  expect(sizeOf(update(rising, Message.HoldRepeated({ nodeId: 'server', now: 9_000 })).model)).toBe(
    SIZES.length - 1,
  )

  let broke = update(base(10), Message.HoldStarted({ nodeId: 'server', now: 0 })).model
  broke = update(broke, Message.HoldRepeated({ nodeId: 'server', now: 250 })).model
  expect(sizeOf(broke)).toBe(1)
  expect(broke.board.hold).toEqual({ _tag: 'Idle' })
  expect(broke.toast?.tone).toBe('warn')
})

test('upgrade all of a kind is one action with one undo entry and one toast that says what happened', () => {
  const start = (cash: number): Model => {
    let model: Model = { ...inLab(), board: { ...inLab().board, game: { ...newGame(), cash } } }
    for (const y of [400, 560]) {
      const picking = update(model, Message.PlacingChosen({ type: 'server' }))
      model = update(picking.model, Message.NodePlaced({ x: 400, y })).model
    }
    return model
  }
  const servers = (model: Model) => model.board.game.nodes.filter((node) => node.type === 'server')
  const base = start(1e9)
  const id = servers(base)[0]?.id ?? ''
  const once = update(base, Message.UpgradeAllChosen({ nodeId: id })).model
  expect(servers(once).map((node) => node.size)).toEqual([2, 2, 2])
  expect(once.board.undo.length).toBe(base.board.undo.length + 1)
  expect(once.toast?.message).toContain('App Server ×3 grew one size')
  expect(once.toast?.message).toContain('Undo (Z) refunds')

  // One at its cap is skipped and named.
  const capped = update(base, Message.BulkResizeChosen({ nodeId: id, mode: 'max' })).model
  const partial = update(capped, Message.UpgradeAllChosen({ nodeId: id })).model
  expect(servers(partial).map((node) => node.size)).toEqual([SIZES.length - 1, 2, 2])
  expect(partial.toast?.message).toContain('App Server ×2 grew one size')
  expect(partial.toast?.message).toContain('1 at the largest size')

  // Cash short of the whole run stops where it stands.
  const step =
    resizePrice(base.board.game, servers(base)[0] as (typeof base.board.game.nodes)[number]) ?? 0
  const poor: Model = {
    ...base,
    board: { ...base.board, game: { ...base.board.game, cash: step } },
  }
  const short = update(poor, Message.UpgradeAllChosen({ nodeId: id })).model
  expect(servers(short).map((node) => node.size)).toEqual([2, 1, 1])
  expect(short.toast?.message).toContain('Cash ran out')

  // Every server at its cap refuses, and writes no undo entry.
  let all = base
  for (const node of servers(base))
    all = update(all, Message.BulkResizeChosen({ nodeId: node.id, mode: 'max' })).model
  const refused = update(all, Message.UpgradeAllChosen({ nodeId: id }))
  expect(refused.model.board.game).toBe(all.board.game)
  expect(refused.model.board.undo.length).toBe(all.board.undo.length)
  expect(refused.model.toast?.tone).toBe('warn')
  expect(refused.model.toast?.message).toContain('largest size')
})

describe('Mail actions (GDD 18)', () => {
  const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
    messages.reduce((current, message) => update(current, message).model, model)

  /** A board with one piece of Mail in its Inbox, open on the reader, its card still waiting. */
  const withMail = (fact: Fact, game: Model['board']['game']): Model => {
    const start = inLab()
    const sent = mailed(EMPTY_INBOX, fact, game.time, false)
    return {
      ...start,
      panel: 'inbox',
      board: {
        ...start.board,
        game,
        // Reading the panel clears the card, so put back what arrived with the Mail.
        inbox: { ...reading(sent), peek: sent.peek },
      },
    }
  }

  /** A capacity/alert fact for `node`, for mail-action plumbing tests. */
  const about = (nodeId: string): readonly [Model['board']['game'], Fact] => {
    const game = preseedGame()
    const node = game.nodes.find((entry) => entry.id === nodeId)
    const name =
      node?.type === 'server'
        ? 'App Server'
        : node?.type === 'analytics'
          ? 'Analytics'
          : nodeId.charAt(0).toUpperCase() + nodeId.slice(1)
    const advice: Advice =
      node?.type === 'analytics'
        ? {
            key: `monitoring:limit:${nodeId}`,
            from: 'monitoring',
            subject: `${name} limits the design`,
            text: `${name} limits the design.`,
            topic: 'limit',
            vars: { node: name },
            actions: [
              { id: `show:${nodeId}`, label: 'Show on Board' },
              { id: 'ack', label: 'Acknowledge' },
              { id: 'mute', label: 'Mute' },
            ],
          }
        : {
            key: `cloud:cpu:${nodeId}`,
            from: 'cloud',
            subject: `${name}: CPU at 100%`,
            text: `${name} is out of CPU.`,
            topic: 'cpu',
            vars: { node: name },
            actions: [
              { id: `show:${nodeId}`, label: 'Show on Board' },
              { id: `resize:${nodeId}`, label: 'Resize' },
              { id: `quota:${nodeId}`, label: 'Raise quota' },
              ...(game.stage >= 3
                ? [{ id: `reserved:${nodeId}`, label: 'Switch to Reserved' }]
                : []),
              { id: 'ack', label: 'Acknowledge' },
            ],
          }
    return [game, factOf(advice, game)]
  }

  const press = (model: Model, action: string): ReturnType<typeof update> =>
    update(
      model,
      Message.InboxChanged({
        message: InboxMessage.Acted({ id: model.board.inbox.mail[0]?.id ?? 0, action }),
      }),
    )

  test('a capacity warning offers Show on Board, Resize, Raise quota and Acknowledge', () => {
    const [, fact] = about('server')
    expect(fact.actions).toEqual([
      { id: 'show:server', label: 'Show on Board' },
      { id: 'resize:server', label: 'Resize' },
      { id: 'quota:server', label: 'Raise quota' },
      { id: 'ack', label: 'Acknowledge' },
    ])
  })

  test('Acknowledge answers a capacity warning, which stops needing action', () => {
    const [game, fact] = about('server')
    const started = withMail(fact, game)
    const mail = started.board.inbox.mail[0]
    expect(mail && folderHolds(mail, 'action')).toBe(true)
    const acted = press(started, 'ack')
    const answered = acted.model.board.inbox.mail[0]
    expect(answerOf(answered)).toBe('You acknowledged it.')
    expect(answered?.read).toBe(true)
    expect(acted.model.board.inbox.peek).toBeNull()
    expect(answered && folderHolds(answered, 'action')).toBe(false)
    expect(answered && folderHolds(answered, 'fyi')).toBe(true)
    expect(acted.model.board.game).toBe(game)
  })

  test.each(['resize:server', 'quota:server'])(
    '%s opens the Inspector on the Node and changes nothing else',
    (action) => {
      const [game, fact] = about('server')
      const acted = press(withMail(fact, game), action)
      expect(acted.model.panel).toBe('none')
      expect(acted.model.board.selected).toBe('server')
      expect(acted.model.board.region).toBe(game.nodes.find((node) => node.id === 'server')?.region)
      expect(acted.commands?.map((command) => command.name)).toContain('FocusInspector')
      expect(acted.model.board.game).toBe(game)
      expect(answerOf(acted.model.board.inbox.mail[0])).toBeNull()
    },
  )

  test('Switch to Reserved is offered once a compute Node has a pricing model', () => {
    const [game] = about('server')
    const reservedGame = { ...game, stage: 3 }
    const reservedFact = factOf(
      {
        key: 'cloud:cpu:server',
        from: 'cloud',
        subject: 'App Server: CPU at 100%',
        text: 'App Server is out of CPU.',
        topic: 'cpu',
        vars: { node: 'App Server' },
        actions: [
          { id: 'show:server', label: 'Show on Board' },
          { id: 'resize:server', label: 'Resize' },
          { id: 'quota:server', label: 'Raise quota' },
          { id: 'reserved:server', label: 'Switch to Reserved' },
          { id: 'ack', label: 'Acknowledge' },
        ],
      },
      reservedGame,
    )
    expect(reservedFact.actions.map((action) => action.id)).toEqual([
      'show:server',
      'resize:server',
      'quota:server',
      'reserved:server',
      'ack',
    ])
    const acted = press(withMail(reservedFact, reservedGame), 'reserved:server')
    expect(acted.model.panel).toBe('none')
    expect(acted.model.board.selected).toBe('server')
    expect(acted.commands?.map((command) => command.name)).toContain('FocusInspector')
    expect(acted.model.board.game).toBe(reservedGame)
  })

  test('an alert offers Acknowledge, which reads it and clears the card', () => {
    const [game, fact] = about('analytics')
    expect(fact.actions.map((action) => action.id)).toEqual(['show:analytics', 'ack', 'mute'])
    const started = withMail(fact, game)
    expect(started.board.inbox.peek).toBe(started.board.inbox.mail[0]?.id)
    const acted = press(started, 'ack')
    expect(answerOf(acted.model.board.inbox.mail[0])).toBe('You acknowledged it.')
    expect(acted.model.board.inbox.mail[0]?.read).toBe(true)
    expect(acted.model.board.inbox.peek).toBeNull()
    expect(acted.model.board.game).toBe(game)
  })

  test('Mute for 1 h silences the sender for one calendar hour', () => {
    const [game, fact] = about('analytics')
    const acted = press(withMail(fact, game), 'mute')
    expect(acted.model.board.inbox.mutes).toEqual([{ sender: fact.sender, until: game.time + 60 }])
    expect(answerOf(acted.model.board.inbox.mail[0])).toBe('You muted this sender for an hour.')
    expect(acted.model.board.game).toBe(game)
    const later = (time: number) =>
      mailed(
        acted.model.board.inbox,
        { ...fact, key: 'event:workers:server', text: 'Every worker is busy.' },
        time,
        false,
      )
    // Inside the hour the next letter lands read, with no card above the Inbox button.
    const quiet = later(game.time + 59)
    expect(quiet.mail.at(-1)?.read).toBe(true)
    expect(quiet.peek).toBeNull()
    // An hour later the sender is heard again.
    const loud = later(game.time + 60)
    expect(loud.mail.at(-1)?.read).toBe(false)
    expect(loud.peek).toBe(loud.mail.at(-1)?.id)
  })

  test('Add to backlog queues the Feature the customer asks for', () => {
    const start: Model = {
      ...inLab(),
      panel: 'inbox',
      board: { ...inLab().board, game: preseedGame() },
    }
    const mailed = send(
      start,
      Message.InboxChanged({ message: InboxMessage.SampleChosen({ id: 'request' }) }),
      Message.InboxChanged({ message: InboxMessage.Generated({ count: 1 }) }),
    )
    const mail = mailed.board.inbox.mail.at(-1)!
    expect(mail.actions).toHaveLength(1)
    const action = mail.actions[0]!
    expect(action.label).toBe('Add to backlog')
    const feature = action.id.replace('backlog:', '')
    expect(mailed.board.game.backlog.some((item) => item.ref === feature)).toBe(false)
    const queued = send(
      mailed,
      Message.InboxChanged({
        message: InboxMessage.Acted({ id: mail.id, action: action.id }),
      }),
    )
    expect(
      queued.board.game.backlog.some((item) => item.kind === 'feature' && item.ref === feature),
    ).toBe(true)
    expect(queued.board.game.cash).toBe(mailed.board.game.cash)
    expect(answerOf(queued.board.inbox.mail.at(-1))).toBe('You added it to the backlog.')
  })

  test('the CVE advisory names the exposed Nodes only once Dependency scanning is researched', () => {
    const game = preseedGame()
    const item: WorkItem = {
      id: 8,
      kind: 'patch',
      ref: 'CVE-2026-0451',
      cost: 4,
      spent: 0,
      block: { _tag: 'Free' },
      answered: null,
      due: game.time + 180,
      target: 'server',
    }
    expect(game.researched).not.toContain('dependency-scanning')
    const hidden = disclosureFact(item, game)
    expect(hidden.text).toMatch(/check whether (you|they) run (this|it)/i)
    expect(hidden.actions.map((action) => action.id)).not.toContain('show:server')
    const scanned = disclosureFact(item, {
      ...game,
      researched: [...game.researched, 'dependency-scanning' as const],
    })
    expect(scanned.text).toContain('App Server')
    expect(scanned.text).not.toMatch(/check whether/i)
    expect(scanned.actions.map((action) => action.id)).toContain('show:server')
  })

  test('a Step event that names a Node carries that Node’s buttons', () => {
    const game = preseedGame()
    const before = JSON.stringify(game)
    const oom = eventFact(
      { _tag: 'OutOfMemory', nodeId: 'server' },
      { topic: 'oom', vars: { node: 'App Server' } },
      game,
    )
    expect(oom.actions.map((action) => action.id)).toEqual([
      'show:server',
      'resize:server',
      'quota:server',
      'ack',
    ])
    const incident = eventFact(
      { _tag: 'IncidentStarted', incident: { nodeId: 'database' } },
      { topic: 'incident-instance', vars: { node: 'Database' } },
      game,
    )
    expect(incident.actions.map((action) => action.id)).toEqual(['show:database', 'ack', 'mute'])
    expect(JSON.stringify(game)).toBe(before)
  })

  test('an exhausted credit balance joins the capacity advice Thread, from the same Sender', () => {
    const advice = {
      key: 'cloud:credits:server',
      from: 'cloud',
      subject: 'App Server: CPU credits exhausted',
      text: 'App Server ran out of CPU credits.',
      topic: 'credits',
      vars: { node: 'App Server' },
      actions: [],
    } as const
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const game = { ...preseedGame(), seed }
      const event = eventFact(
        { _tag: 'CreditsExhausted', nodeId: 'server' },
        { topic: 'credits', vars: { node: 'App Server' } },
        game,
      )
      const advised = factOf(advice, game)
      expect([event.key, event.sender]).toEqual([advised.key, advised.sender])
    }
  })

  test('the fourth button on an advisory is reachable with its own key', () => {
    // Dependency scanning names the Node, so the advisory carries all four of its buttons.
    const game = {
      ...preseedGame(),
      researched: [...preseedGame().researched, 'dependency-scanning' as const],
    }
    const fact = disclosureFact(
      {
        id: 9,
        kind: 'patch',
        ref: 'CVE-2026-0451',
        cost: 4,
        spent: 0,
        block: { _tag: 'Free' },
        answered: null,
        due: game.time + 180,
        target: 'server',
      },
      game,
    )
    expect(fact.actions.map((action) => action.id)).toEqual([
      'first:9',
      'rush:9',
      'show:server',
      'team',
    ])
    const started = withMail(fact, game)
    const pressed = update(started, Message.KeyPressed({ key: '4' })).model
    expect(pressed.panel).toBe('team')
    expect(answerOf(pressed.board.inbox.mail[0])).toBe('You opened Team.')
    expect(pressed.board.game).toBe(game)
  })
})

describe('Feature Flags (GDD 05, 08)', () => {
  const start = (): Model => {
    const game = preseedGame()
    return {
      ...inLab(),
      board: {
        ...inLab().board,
        game: {
          ...game,
          stage: 2,
          nodes: [
            ...game.nodes,
            {
              ...game.nodes[1]!,
              id: 'n9',
              type: 'ff' as const,
              x: 200,
              y: 600,
            },
          ],
          researched: [...game.researched, 'ci' as const, 'feature-flags' as const],
          features: { 'password-login': { _tag: 'Live', rollout: 1, adoption: 1, lift: null } },
        },
      },
    }
  }

  test('a rollout sets the flag target and says so, and propagation reaches every user', () => {
    const model = start()
    const rolled = update(
      model,
      Message.RolloutChosen({ nodeId: 'n9', feature: 'password-login', share: 0.05 }),
    ).model
    expect(rolled.board.game.features['password-login']).toMatchObject({
      _tag: 'Live',
      rollout: 1,
      target: 0.05,
      adoption: 1,
      lift: null,
    })
    expect(rolled.board.change).toMatchObject({
      _tag: 'Settling',
      change: { label: expect.stringContaining('5%') },
    })
    // The flag propagates over its short window: the effective rollout reaches the target.
    const settled = advancePropagation(rolled.board.game, 2)
    expect(settled.features['password-login']).toEqual({
      _tag: 'Live',
      rollout: 0.05,
      target: 0.05,
      adoption: 1,
      lift: null,
    })
    const all = update(
      rolled,
      Message.RolloutChosen({ nodeId: 'n9', feature: 'password-login', share: 1 }),
    ).model
    expect(all.board.game.features['password-login']).toMatchObject({
      _tag: 'Live',
      rollout: 1,
      target: 1,
      adoption: 1,
      lift: null,
    })
  })

  test('a share the design does not offer is refused, and the game is untouched', () => {
    const model = start()
    const refused = update(
      model,
      Message.RolloutChosen({ nodeId: 'n9', feature: 'password-login', share: 0.3 }),
    )
    expect(refused.model.board.game).toBe(model.board.game)
  })
})

test('a Rush says the tech debt and bad-deploy risk it adds', () => {
  const game = Result.getOrThrow(
    queueFeature({ ...preseedGame(1), devHours: 100 }, FEATURE_IDS[0]!),
  )
  const model: Model = { ...inLab(), panel: 'team', board: { ...inLab().board, game } }
  const pressed = update(model, Message.WorkRushed({ id: game.backlog[0]!.id })).model
  expect(pressed.toast?.message).toBe(
    'Rushed work: +2.0% tech debt, +10.0% bad-deploy risk when it deploys.',
  )
  expect(pressed.toast?.tone).toBe('warn')
})

/* A Room owns the clock: the tab that joined it must not advance the Game. */
test('a live Room does not step the Company on this tab', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: true },
    },
  }
  const ticked = tick(model, 8)
  expect(ticked.board.game.time).toBe(model.board.game.time)
  expect(ticked.board.clock.carry).toBe(0)
})

/* A Room's refusal to step is not the same as a pause: a hidden tab must not freeze it. */
test('a live Room stays unpaused when the window loses focus', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: true },
    },
  }
  const away = update(model, Message.WindowBlurred()).model
  expect(away.board.clock.mode).toEqual({ _tag: 'Running' })
})

/* A Seat's action travels as the Intent that names it, so a Room runs the same move. */
test('a board action in a live Room goes out as the Intent it stands for', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const node = model.board.game.nodes[0]!
  const moved = act(model, 'Moved', Actions.move(model.board.game, node.id, 45, 60))
  const sent = (moved.commands ?? []).find((command) => command.name === 'SendRoom')
  expect(sent?.args?.['message']).toEqual({
    _tag: 'Intents',
    id: model.room.seq,
    intents: [{ ns: 'actions', name: 'move', args: [node.id, 45, 60] }],
  })
})

/* A Seat's name lives in this browser: the player types it, and the Room hears it. */
test('a Seat keeps the name the player types', () => {
  const model: Model = {
    ...inLab(),
    room: { ...EMPTY_ROOM, name: 'MarvelousMonkey', draft: 'MarvelousMonkey' },
  }
  const typed = update(model, Message.RoomNameChanged({ name: 'QuietQuokka' })).model
  expect(typed.room.draft).toBe('QuietQuokka')
  expect(typed.room.name).toBe('MarvelousMonkey')
  const saved = update(typed, Message.RoomNameSaved()).model
  expect(saved.room.name).toBe('QuietQuokka')
})

test('an empty name is not saved, and a name the Room already has changes nothing', () => {
  const named: Model = {
    ...inLab(),
    room: { ...EMPTY_ROOM, name: 'BraveBison', draft: 'BraveBison' },
  }
  const blank = update(
    { ...named, room: { ...named.room, draft: '   ' } },
    Message.RoomNameSaved(),
  ).model
  expect(blank.room.name).toBe('BraveBison')
  expect(blank.room.draft).toBe('BraveBison')
  const same = update(named, Message.RoomNameSaved()).model
  expect(same).toBe(named)
})

/* Raising a round is a vote, so the action itself never leaves a Seat's browser. */
test('an action only a vote may take is refused in a live Room', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const raised = act(model, 'Raised', Actions.raise(model.board.game))
  expect((raised.commands ?? []).some((command) => command.name === 'SendRoom')).toBe(false)
  expect(raised.model.toast?.message).toBe('That is not available in a Room yet.')
})

/* The offer's Raise button opens the vote the Room uses in place of the action. */
test('a funding round in a live Room starts the fund vote', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const asked = update(model, Message.RoundRaised())
  const sent = (asked.commands ?? []).find((command) => command.name === 'SendRoom')
  expect(sent?.args?.['message']).toEqual({ _tag: 'StartVote', kind: 'fund' })
  expect(asked.model.board.game).toBe(model.board.game)
  expect(asked.model.panel).toBe('offer')
})

/* Declining is a vote too: one Seat's Decline must not move the Room's Era on its own. */
test('declining a funding round in a live Room starts the decline vote', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const asked = update(model, Message.RoundDeclined())
  const sent = (asked.commands ?? []).filter((command) => command.name === 'SendRoom')
  expect(sent.map((command) => command.args?.['message'])).toEqual([
    { _tag: 'StartVote', kind: 'decline' },
  ])
  expect(asked.model.board.game).toBe(model.board.game)
  expect(asked.model.panel).toBe('offer')
})

/* A Load Balancer policy was the report that started the allowlist fix. */
test('a Load Balancer policy in a live Room goes out as its intent', () => {
  const game = Result.getOrThrow(Actions.place(preseedGame(), 'lb', 300, 100))
  const balancer = game.nodes.find((entry) => entry.type === 'lb')!
  const model: Model = {
    ...inLab(),
    board: { ...inLab().board, game },
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const changed = update(
    model,
    Message.PolicyChosen({ nodeId: balancer.id, policy: 'round-robin' }),
  )
  const sent = (changed.commands ?? []).find((command) => command.name === 'SendRoom')
  expect(sent?.args?.['message']).toEqual({
    _tag: 'Intents',
    id: model.room.seq,
    intents: [{ ns: 'actions', name: 'setPolicy', args: [balancer.id, 'round-robin'] }],
  })
  expect(changed.model.board.game.nodes.find((entry) => entry.id === balancer.id)?.policy).toBe(
    'round-robin',
  )
})

/* A bulk control reaches the Room as the compound action it stands for. */
test('a bulk upgrade in a live Room goes out as its intent', () => {
  const model: Model = {
    ...inLab(),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const server = model.board.game.nodes.find((entry) => entry.type === 'server')!
  const upgraded = update(model, Message.UpgradeAllChosen({ nodeId: server.id }))
  const sent = (upgraded.commands ?? []).find((command) => command.name === 'SendRoom')
  expect(sent?.args?.['message']).toEqual({
    _tag: 'Intents',
    id: model.room.seq,
    intents: [{ ns: 'actions', name: 'upgradeAll', args: [server.type, server.region] }],
  })
  expect(upgraded.model.board.game).not.toBe(model.board.game)
})

/* Once the vote passes, the offer the Seat was looking at becomes the Era card. */
test('a passed round closes the offer it came from', () => {
  const model: Model = {
    ...inLab(),
    panel: 'offer',
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: false },
    },
  }
  const game = { ...model.board.game, round: { _tag: 'Raised' as const } }
  const painted = update(
    model,
    Message.RoomReceived({
      message: {
        _tag: 'Snapshot',
        revision: 2,
        time: game.time,
        game,
        samples: [],
        seats: [],
        owner: 'tab-1',
        speed: 1,
        vote: null,
      },
    }),
  ).model
  expect(painted.panel).toBe('era')
})

/* A Seat that arrives is announced by name to the others. */
test('a Seat that joins is announced to the others', () => {
  const model: Model = {
    ...inLab(),
    route: AppRoute.Room({ room: 'ABC234' }),
    room: {
      ...EMPTY_ROOM,
      phase: { _tag: 'Online', code: 'ABC234', seat: 'tab-1', owner: true },
    },
  }
  const joined = update(
    model,
    Message.RoomReceived({
      message: {
        _tag: 'Joined',
        seat: { id: 'tab-2', name: 'Ada', colour: 1, owner: false },
      },
    }),
  ).model
  expect(joined.toast?.message).toBe('Ada joined the Room.')
  expect(joined.toast?.tone).toBe('plain')
})
