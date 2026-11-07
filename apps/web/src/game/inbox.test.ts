import { Result } from 'effect'
import { expect, test } from 'vitest'
import * as Actions from '@quorum/simulation/actions'
import { preseedGame } from '@quorum/simulation/company'
import type { Postmortem } from '@quorum/simulation/state'
import {
  DIGEST_ID,
  EMPTY_INBOX,
  InboxMessage,
  digestOf,
  folderList,
  inboxOfSave,
  mailed,
  reading,
  savedInbox,
  updateInbox,
} from './inbox.ts'
import { postmortemFact, senderOf } from './mail.ts'
import type { Fact } from './mail.ts'
import type { Inbox, Model } from './model.ts'
import { AppRoute } from './route.ts'
import { Message } from './message.ts'
import { initialModel, update } from './update.ts'

const answerOf = (mail?: { phase: { _tag: string; answer?: string } }) =>
  mail?.phase._tag === 'Answered' ? mail.phase.answer : null

/* The Inbox's own rules (GDD 18): what the save keeps, the label chips, the Digest, and the
   Mail a postmortem and a spam trap write. */

const game = preseedGame()

const fact = (key: string, sender: string, subject: string, spam = false): Fact => ({
  key,
  sender,
  subject,
  text: `About ${subject}.`,
  actions: spam ? [{ id: 'trap:phish', label: 'Verify account' }] : [],
  spam,
})

const sent = (facts: ReadonlyArray<Fact>, folder: 'action' | 'fyi' | 'spam' | 'trash'): Inbox => {
  let inbox: Inbox = { ...EMPTY_INBOX, folder }
  facts.forEach((entry, index) => {
    inbox = mailed(inbox, entry, index + 1, true)
  })
  return inbox
}

const act = (inbox: Inbox, id: number, action: string) =>
  updateInbox(inbox, InboxMessage.Acted({ id, action }), { game, open: true })

test('the save keeps the Mail and the mutes, and a reload reads it back', () => {
  const inbox = sent(
    [fact('cloud:cpu:a', 'cloud', 'Capacity warning'), fact('security:CVE-1', 'security', 'CVE')],
    'action',
  )
  const muted = updateInbox(
    { ...inbox, mutes: [{ sender: 'cloud', until: 120 }] },
    InboxMessage.Trashed({ id: 1 }),
    { game, open: true },
  )
  // The save writes JSON, as localStorage does: the same round trip a reload makes.
  const file = JSON.parse(JSON.stringify({ time: game.time, inbox: savedInbox(muted.model) }))
  const back = inboxOfSave(file)
  expect(back.mail.map((mail) => mail.subject)).toEqual(['Capacity warning', 'CVE'])
  expect(back.mail[0]?.trashed).toBe(true)
  expect(back.mutes).toEqual([{ sender: 'cloud', until: 120 }])
  // The panel's view is not saved: it opens on Needs action, as it always does.
  expect(back.folder).toBe('action')
  // A save from before the Inbox was saved, or one this build cannot read, opens empty.
  expect(inboxOfSave({ time: 4 })).toEqual(EMPTY_INBOX)
  expect(inboxOfSave({ inbox: { mail: 'not mail' } })).toEqual(EMPTY_INBOX)
})

test('a label chip filters the list to one kind of Sender', () => {
  const inbox = sent(
    [
      fact('cloud:cpu:a', 'cloud', 'Capacity warning'),
      fact('security:CVE-1', 'security', 'CVE-2024-1'),
      fact('cloud:cpu:b', 'cloud', 'Out of CPU credits'),
    ],
    'fyi',
  )
  const security = updateInbox(inbox, InboxMessage.LabelChosen({ label: 'security' }), {
    game,
    open: true,
  })
  expect(folderList(security.model).map((mail) => mail.subject)).toEqual(['CVE-2024-1'])
  // The chip picks the newest Mail with that label, and choosing All restores the folder.
  expect(security.model.focus).toBe(security.model.mail[1]?.id)
  const all = updateInbox(security.model, InboxMessage.LabelChosen({ label: null }), {
    game,
    open: true,
  })
  expect(folderList(all.model)).toHaveLength(3)
  // Changing folder clears the chip, so a folder is never quietly empty.
  const other = updateInbox(security.model, InboxMessage.FolderChosen({ folder: 'fyi' }), {
    game,
    open: false,
  })
  expect(other.model.label).toBe(null)
})

test('past eight unread threads the oldest low-priority ones fold into one Digest', () => {
  // Nine FYI threads: the oldest one folds, and the Digest says so.
  const nine = sent(
    Array.from({ length: 9 }, (_, index) =>
      fact(`customers:ticket:${index}`, 'customers', `Ticket ${index + 1}`),
    ),
    'fyi',
  )
  const nineInbox = { ...nine, mail: nine.mail.map((mail) => ({ ...mail, read: true })) }
  expect(digestOf(nineInbox)).toEqual([])

  const unread = { ...nineInbox, mail: nineInbox.mail.map((mail) => ({ ...mail, read: false })) }
  const folded = digestOf(unread)
  expect(folded.map((mail) => mail.subject)).toEqual(['Ticket 1'])
  const list = folderList(unread)
  // The list hides the folded thread behind one row, and that row sits where it was.
  expect(list.map((mail) => mail.subject)).toEqual([
    'Ticket 9',
    'Ticket 8',
    'Ticket 7',
    'Ticket 6',
    'Ticket 5',
    'Ticket 4',
    'Ticket 3',
    'Ticket 2',
    'Digest: 1 older updates',
  ])
  expect(list.at(-1)?.id).toBe(DIGEST_ID)
  // Nothing that needs a decision ever folds: ten unread decisions are ten rows.
  const decisions = sent(
    Array.from({ length: 10 }, (_, index) =>
      fact(`investor:round:${index}`, 'investor', `Offer ${index + 1}`),
    ),
    'action',
  )
  const withActions = {
    ...decisions,
    mail: decisions.mail.map((mail) => ({
      ...mail,
      read: false,
      actions: [{ id: 'raise', label: 'Raise' }],
    })),
  }
  expect(digestOf(withActions)).toEqual([])
})

test('a resolved incident asks a teammate to file the postmortem', () => {
  const postmortem: Postmortem = {
    id: 3,
    kind: 'zone',
    target: 'App Server',
    duration: 60,
    mttr: 40,
    mttd: 4,
    mtta: 9,
    lostUsers: 120,
    lostRevenue: 1_200,
    failed: 400,
    action: 'caching',
    severity: 2,
    endedAt: 600,
    causedBy: null,
  }
  const mail = postmortemFact(postmortem, game)
  // The sender is a person: the design gives the postmortem to a teammate, not the pager.
  expect(mail.sender.startsWith('mate:')).toBe(true)
  expect(mail.actions.map((action) => action.label)).toEqual([
    'File postmortem',
    'File and research the action item',
  ])
  // Every one of the letters names the Node the incident hit.
  expect(mail.text).toContain('App Server')

  const inbox = reading(mailed(EMPTY_INBOX, mail, game.time, true))
  const id = inbox.mail[0]?.id ?? 0
  const taken = act(inbox, id, `postmortem-take:${postmortem.id}`)
  expect(taken.outMessage).toEqual({ _tag: 'ActionTaken', kind: 'postmortem-take', target: '3' })
  // The answer stays in the Inbox as the record.
  expect(answerOf(taken.model.mail[0])).toBe(
    'You filed the postmortem and put the action item in the study queue.',
  )
  // An incident with no action item carries one button.
  expect(postmortemFact({ ...postmortem, action: null }, game).actions).toHaveLength(1)
})

test('a phishing trap leaks the credentials, and the Inbox keeps the record', () => {
  const inbox = sent([fact('spam:spam-awol', 'spam-awol', 'Verify your account', true)], 'spam')
  const phishing = inbox.mail[0]
  expect(phishing?.actions).toEqual([{ id: 'trap:phish', label: 'Verify account' }])
  const clicked = act({ ...inbox, folder: 'spam' }, phishing?.id ?? 0, 'trap:phish')
  expect(clicked.outMessage).toEqual({ _tag: 'ActionTaken', kind: 'trap', target: 'phish' })
  expect(answerOf(clicked.model.mail[0])).toContain('It was a trap')

  // The act itself is a Simulation Action: the Credential leak incident starts and Users leave.
  const phished = Actions.phished(game)
  expect(Result.isSuccess(phished)).toBe(true)
  if (Result.isFailure(phished)) return
  expect(phished.success.incident?.kind).toBe('credential-leak')
  expect(phished.success.users).toBeLessThan(game.users)

  // Through the app: the click starts the incident, and the pager's Mail lands in the Inbox.
  const model: Model = {
    ...initialModel(),
    route: AppRoute.Company(),
    panel: 'inbox',
    board: { ...initialModel().board, game, inbox: reading(inbox, phishing?.id ?? 0) },
  }
  const clickedInTheApp = update(
    model,
    Message.InboxChanged({
      message: InboxMessage.Acted({ id: phishing?.id ?? 0, action: 'trap:phish' }),
    }),
  ).model
  expect(clickedInTheApp.board.game.incident?.kind).toBe('credential-leak')
  expect(
    clickedInTheApp.board.inbox.mail.filter((mail) => mail.key.includes('incident-phishing')),
  ).toHaveLength(1)

  // Reporting a phishing Mail as spam disarms it: the risk goes with the button.
  const reported = updateInbox(inbox, InboxMessage.MarkedSpam({ id: phishing?.id ?? 0 }), {
    game,
    open: true,
  })
  expect(reported.model.mail[0]?.spam).toBe(false)
  const again = updateInbox(reported.model, InboxMessage.MarkedSpam({ id: phishing?.id ?? 0 }), {
    game,
    open: true,
  })
  expect(again.model.mail[0]?.spam).toBe(true)
  expect(again.model.mail[0]?.actions).toEqual([])
})

test('a reload opens the Company with the Mail it had, and the return from away writes more', () => {
  const wall = 1_000_000
  const before = sent([fact('cloud:cpu:a', 'cloud', 'Capacity warning')], 'action')
  const json = JSON.stringify({ ...game, wall, inbox: savedInbox(before) })
  const loaded = update(
    initialModel(),
    Message.CompanyLoaded({ id: 'c', open: true, json, now: wall }),
  ).model
  expect(loaded.board.inbox.mail.map((mail) => mail.subject)).toEqual(['Capacity warning'])

  // An hour away: Finance and the pager both write "While you were away" (18 "What Mail replaces").
  const back = update(
    initialModel(),
    Message.CompanyLoaded({ id: 'c', open: true, json, now: wall + 3_600_000 }),
  ).model
  const kinds = back.board.inbox.mail.map((mail) => senderOf(mail.sender).kind)
  expect(kinds).toContain('finance')
  expect(kinds).toContain('monitoring')
  expect(back.board.inbox.mail.some((mail) => mail.subject.includes('While you were away'))).toBe(
    true,
  )
})

test('paying a fake invoice costs the Cash printed on it', () => {
  const invoice: Fact = {
    key: 'spam:spam-azzure',
    sender: 'spam-azzure',
    subject: 'INVOICE #AZ-88213 PAST DUE',
    text: 'Region: moon-central-0\n\nAmount due: $4,812.44',
    actions: [{ id: 'trap:invoice', label: 'Pay invoice' }],
    spam: true,
  }
  // A Company with the Cash to pay it: one without gets a refusal and keeps its money.
  const rich = { ...game, cash: 20_000 }
  const inbox = sent([invoice], 'spam')
  const id = inbox.mail[0]?.id ?? 0
  const model: Model = {
    ...initialModel(),
    route: AppRoute.Company(),
    panel: 'inbox',
    board: { ...initialModel().board, game: rich, inbox: reading(inbox, id) },
  }
  const paid = update(
    model,
    Message.InboxChanged({ message: InboxMessage.Acted({ id, action: 'trap:invoice' }) }),
  ).model
  expect(paid.board.game.cash).toBe(rich.cash - 4_812)
  // The Mail keeps the record of what the click cost.
  expect(answerOf(paid.board.inbox.mail[0])).toContain('It was a trap')
})
