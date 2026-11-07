import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { initialModel, update } from '@/game/update.ts'
import { ResearchScroll, researchPanel } from './research.ts'

/* ==========================================================================
   15 "Accessibility", Text at 150%: the Research tree grows its Node boxes and
   the spacing between them with the type. A long item name takes a second line
   at any size rather than ellipsizing, because a Japanese name runs out of room
   sooner than an English one; at the interface's own size the box is what it
   always was, and the name fits inside it.
   ========================================================================== */

const sized = (text: 'normal' | 'large'): Model => ({
  ...initialModel(),
  prefs: { ...initialModel().prefs, text },
})

const box = (id: string) => Scene.selector(`[data-research="${id}"]`)
/** The tree scrolls to the focused item when it opens, which a scene resolves by hand. */
const scrolled = () => Scene.Mount.resolve(ResearchScroll, Message.Synced())

test('at 150% the tree grows its Node boxes and wraps a long name', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(sized('large')),
    scrolled(),
    Scene.expect(box('load-balancing')).toHaveStyle('height', '72px'),
    Scene.expect(box('load-balancing')).toHaveStyle('width', '276px'),
    Scene.expect(Scene.selector('[data-research="load-balancing"] .line-clamp-2')).toExist(),
    Scene.expect(Scene.text('Load balancing algorithms')).toExist(),
  )
})

test('at its own size the box stays put and a long name still has a second line', () => {
  Scene.scene(
    { update, view: researchPanel },
    Scene.given(sized('normal')),
    scrolled(),
    Scene.expect(box('load-balancing')).toHaveStyle('height', '48px'),
    Scene.expect(box('load-balancing')).toHaveStyle('width', '184px'),
    Scene.expect(Scene.selector('[data-research="load-balancing"] .line-clamp-2')).toExist(),
    Scene.expect(Scene.text('Load balancing algorithms')).toExist(),
  )
})
