import { expect, test } from 'vitest'
import { Option } from 'effect'
import { Scene } from 'foldkit/test'
import { COMPONENTS } from '@quorum/simulation/catalog'
import { preseedGame } from '@quorum/simulation/company'
import { sizeLabel } from '@quorum/simulation/lookups'
import { regionView } from '@quorum/simulation/regions'
import { nodeList } from './node-list.ts'
import { AppendLog, PlaySound, SyncBoard } from '@/game/commands.ts'
import { Message } from '@/game/message.ts'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { AppRoute } from '@/game/route.ts'
import type { HtmlBuilder } from 'foldkit/html'

/* ==========================================================================
   15 "Accessibility": a screen-reader list of Nodes. The canvas says nothing,
   so this list names every Node on the board — kind, size, load — in board
   order, and each name is a button the keyboard reaches.
   ========================================================================== */

const model = (): Model => {
  const game = preseedGame()
  return {
    ...initialModel(),
    route: AppRoute.Company(),
    board: { ...initialModel().board, game },
  }
}

const view = (value: Model, h: HtmlBuilder<Message>) => nodeList(value, ledgerOf(value), h)

/** The first Node the board draws, in board order. */
const first = () => {
  const value = model()
  return regionView(value.board.game, value.board.region).nodes[0]!
}

const entries = (): ReadonlyArray<string> => {
  const value = model()
  return regionView(value.board.game, value.board.region).nodes.map(
    (node) =>
      `${COMPONENTS[node.type].name} · ${sizeLabel(node)} · ${Math.round(
        (ledgerOf(value).nodes[node.id]?.utilization ?? 0) * 100,
      )}%`,
  )
}

test('every Node on the board is named, in board order', () => {
  Scene.scene(
    { update, view },
    Scene.given(model()),
    Scene.tap((simulation) => {
      const items = Scene.findAll(simulation.html, 'li')
      expect(items).toHaveLength(regionView(model().board.game, model().board.region).nodes.length)
      const read = items.map((item) => Scene.textContent(item))
      // One line per Node, with its kind, its size, and its load.
      expect(read.map((line) => line.slice(0, line.lastIndexOf(' · ')))).toEqual(entries())
      expect(read[0]).toMatch(/%/)
    }),
    Scene.expect(Scene.selector('[data-node-list]')).toExist(),
    Scene.expect(Scene.role('heading', { name: 'Nodes', level: 2 })).toExist(),
  )
})

test('each Node is a button, so Tab reaches it and Enter opens it', () => {
  Scene.scene(
    { update, view },
    Scene.given(model()),
    // Every entry is a button with no tabindex override: the keyboard reaches all of them.
    Scene.tap((simulation) => {
      const buttons = Scene.findAll(simulation.html, 'li button')
      expect(buttons).toHaveLength(
        regionView(model().board.game, model().board.region).nodes.length,
      )
      for (const button of buttons) {
        expect(Option.isNone(Scene.attr(button, 'tabindex'))).toBe(true)
        expect(Option.getOrNull(Scene.attr(button, 'type'))).toBe('button')
      }
    }),
    Scene.click(Scene.role('button', { name: new RegExp(`^${COMPONENTS[first().type].name}`) })),
    Scene.expectHandled(),
    // The click is the Message Enter and Space send: the sound, the board sync, and the log line.
    Scene.Command.resolveAll(
      [PlaySound, Message.Synced()],
      [SyncBoard, Message.Synced()],
      [AppendLog, Message.Synced()],
    ),
  )
})

test('a region tab only lists the Nodes that tab shows', () => {
  const value = model()
  // A Node of another region, which nothing on this tab calls, is off this tab's board.
  const moved = value.board.game.nodes.find((node) => node.type === 'payments') ?? {
    ...value.board.game.nodes[0]!,
    region: 'eu' as const,
  }
  const abroad = { ...moved, region: 'eu' as const }
  const game = {
    ...value.board.game,
    nodes: value.board.game.nodes.map((node) => (node.id === abroad.id ? abroad : node)),
  }
  Scene.scene(
    { update, view },
    Scene.given({ ...value, board: { ...value.board, game } }),
    Scene.tap((simulation) => {
      const listed = Scene.findAll(simulation.html, 'li button').map((button) =>
        Scene.textContent(button),
      )
      // The board on this tab does not show it, so the list does not name it.
      expect(regionView(game, value.board.region).nodes.map((node) => node.id)).not.toContain(
        abroad.id,
      )
      expect(listed).toHaveLength(regionView(game, value.board.region).nodes.length)
      expect(listed.some((line) => line.startsWith(COMPONENTS[abroad.type].name))).toBe(false)
    }),
  )
})
