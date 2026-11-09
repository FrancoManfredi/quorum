import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { initialModel, update } from '@/game/update.ts'
import { AppendLog } from '@/game/commands.ts'
import { ResearchMessage, SHEET_MAX, SHEET_MIN } from '@/game/research.ts'
import { expect } from 'vitest'
import { ResearchResize, ResearchScroll, researchPanel } from './research.ts'

const sized = (text: 'normal' | 'large'): Model => ({
  ...initialModel(),
  prefs: { ...initialModel().prefs, text },
})

const box = (id: string) => Scene.selector(`[data-research="${id}"]`)
/** The tree scrolls to the focused item when it opens, which a scene resolves by hand. */
const scrolled = () => Scene.Mount.resolve(ResearchScroll, Message.Synced())
/** The pane's edge listens for drags a scene never sends. */
const resizable = () => Scene.Mount.resolve(ResearchResize, Message.Synced())

test('at 150% the tree grows its Node boxes and wraps a long name', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(sized('large')),
    scrolled(),
    resizable(),
    Scene.expect(box('load-balancing')).toHaveStyle('height', '96px'),
    Scene.expect(box('load-balancing')).toHaveStyle('width', '336px'),
    Scene.expect(Scene.selector('[data-research="load-balancing"] .line-clamp-2')).toExist(),
    Scene.expect(Scene.text('Load balancing algorithms')).toExist(),
  )
})

test('at its own size the box holds two lines of a long name above its cost', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(sized('normal')),
    scrolled(),
    resizable(),
    Scene.expect(box('load-balancing')).toHaveStyle('height', '64px'),
    Scene.expect(box('load-balancing')).toHaveStyle('width', '224px'),
    Scene.expect(Scene.selector('[data-research="load-balancing"] .line-clamp-2')).toExist(),
    Scene.expect(Scene.text('Load balancing algorithms')).toExist(),
  )
})

/** A save whose Study waits on Bot Insight, which no tap samples, so the pool holds nothing. */
const waiting = (): Model => {
  const model = initialModel()
  return {
    ...model,
    board: {
      ...model.board,
      game: {
        ...model.board.game,
        studies: [{ id: 'waf', phase: { _tag: 'Running', progress: 0 } }],
      },
    },
  }
}

test('the pool deck names the pool the running Study waits on, even at zero', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(waiting()),
    scrolled(),
    resizable(),
    Scene.expect(Scene.selector('[data-deck-pin="bot"]')).toExist(),
    Scene.expect(Scene.selector('[data-deck-pin="bot"]')).toHaveText(/Bot\s*0\s*\/\s*500/),
  )
})

test('the deck opens every pool, and closes again', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(waiting()),
    scrolled(),
    resizable(),
    Scene.expect(Scene.selector('[data-deck-pool="bid"]')).toBeAbsent(),
    Scene.click(Scene.role('button', { name: 'All 18 pools' })),
    Scene.expectHandled(),
    Scene.Command.resolveAll([AppendLog, Message.Synced()]),
    Scene.expect(Scene.selector('[data-deck-pool="bid"]')).toExist(),
    Scene.expect(Scene.selector('[data-deck-pool="bot"]')).toExist(),
    Scene.click(Scene.role('button', { name: 'Fewer' })),
    Scene.expectHandled(),
    Scene.Command.resolveAll([AppendLog, Message.Synced()]),
    Scene.expect(Scene.selector('[data-deck-pool="bid"]')).toBeAbsent(),
  )
})

test('the side pane stays inside its bounds, however far the edge is dragged', () => {
  const at = (width: number) =>
    update(
      initialModel(),
      Message.ResearchChanged({ message: ResearchMessage.SheetResized({ width }) }),
    ).model.board.research.sheetWidth
  expect(at(2_000)).toBe(SHEET_MAX)
  expect(at(40)).toBe(SHEET_MIN)
  expect(at(480)).toBe(480)
})

test('the pane edge is a separator that names its width', () => {
  const model = initialModel()
  const resized: Model = {
    ...model,
    board: {
      ...model.board,
      research: { ...model.board.research, sheetWidth: 480 },
    },
  }
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(resized),
    scrolled(),
    resizable(),
    Scene.expect(Scene.role('separator', { name: 'Resize the side pane' })).toExist(),
    Scene.expect(Scene.role('separator', { name: 'Resize the side pane' })).toHaveAttr(
      'aria-valuenow',
      '480',
    ),
    Scene.expect(Scene.selector('[data-research-panel]')).toHaveStyle('--sheet-w', '480px'),
  )
})
