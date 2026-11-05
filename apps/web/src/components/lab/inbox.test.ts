import { expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import type { WorkItem } from '@quorum/simulation/state'
import { DIGEST_ID, EMPTY_INBOX, mailed, reading } from '@/game/inbox.ts'
import { disclosureFact, type Fact } from '@/game/mail.ts'
import { Message } from '@/game/message.ts'
import { initialModel, update } from '@/game/update.ts'
import { AppRoute } from '@/game/route.ts'
import type { Inbox, Model } from '@/game/model.ts'
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

test('the chips and the Digest are on screen, and the Digest lists what it folded', () => {
  const game = preseedGame()
  const ticket = (index: number): Fact => ({
    key: `customers:ticket:${index}`,
    sender: 'customers',
    subject: `Ticket ${index}`,
    text: `A customer waits on ticket ${index}.`,
    actions: [],
    spam: false,
  })
  let inbox: Inbox = { ...EMPTY_INBOX, folder: 'fyi' }
  // Ten unread FYI threads: the oldest two fold into the Digest.
  for (let index = 1; index <= 10; index += 1) inbox = mailed(inbox, ticket(index), index, true)
  const model: Model = {
    ...initialModel(),
    route: AppRoute.Company(),
    panel: 'inbox',
    board: {
      ...initialModel().board,
      game,
      inbox: reading(inbox, DIGEST_ID),
    },
  }
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('Customer')).toExist(),
    Scene.expect(Scene.text('Digest: 2 older updates')).toExist(),
  )
  // Opening the Digest shows the two threads it folded, each with the sender who wrote it.
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('Ticket 1')).toExist(),
    Scene.expect(Scene.text('Ticket 2')).toExist(),
  )
})
