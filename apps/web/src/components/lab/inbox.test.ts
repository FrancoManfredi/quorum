import { expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import type { WorkItem } from '@quorum/simulation/state'
import { EMPTY_INBOX, mailed, reading } from '@/game/inbox.ts'
import { disclosureFact } from '@/game/mail.ts'
import { Message } from '@/game/message.ts'
import { initialModel, update } from '@/game/update.ts'
import { AppRoute } from '@/game/route.ts'
import type { Model } from '@/game/model.ts'
import { inboxPanel } from './inbox.ts'

/* The Inbox's reader (GDD 18 "Actions"): every button a Mail carries is on screen. */

const fixture = (): Model => {
  const game = {
    ...preseedGame(),
    // Dependency scanning names the exposed Node, so the advisory carries all four of its buttons.
    researched: [...preseedGame().researched, 'dependency-scanning' as const],
  }
  const item: WorkItem = {
    id: 1,
    kind: 'patch',
    ref: 'CVE-2026-0451',
    cost: 4,
    spent: 0,
    due: game.time + 180,
    target: 'server',
  }
  const sent = mailed(EMPTY_INBOX, disclosureFact(item, game), game.time, true)
  return {
    ...initialModel(),
    route: AppRoute.Company(),
    panel: 'inbox',
    board: { ...initialModel().board, game, inbox: reading(sent) },
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) => inboxPanel(model, h)

test('an advisory shows its fourth button, not only its first three', () => {
  const model = fixture()
  expect(model.board.inbox.mail[0]?.actions).toHaveLength(4)
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('Patch now')).toExist(),
    Scene.expect(Scene.text('Rush patch')).toExist(),
    Scene.expect(Scene.text('Show on Board')).toExist(),
    Scene.expect(Scene.text('Open Team')).toExist(),
  )
})
