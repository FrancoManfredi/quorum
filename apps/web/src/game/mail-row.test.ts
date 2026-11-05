import { expect, test } from 'vitest'
import { CVE_DEFS } from '@quorum/simulation/catalog'
import { preseedGame } from '@quorum/simulation/company'
import type { WorkItem } from '@quorum/simulation/state'
import { EMPTY_INBOX, folderHolds, folderList, labelHolds, mailed } from './inbox.ts'
import { SPAM } from './copy/index.ts'
import { CVE_TERMS, advisoryTell, cveIdIn, cveTermId, glossaryKnowsCve } from './advisories.ts'
import { disclosureFact, senderOf, type Fact } from './mail.ts'
import { barOf, destinationOf, kindLabelOf, kindOf, priorityOf } from './mail-row.ts'
import type { Inbox } from './model.ts'

/* The Mail long tail (GDD 18): the kind label on a row, the priority bar, the hover that names
   a trap's real destination, and the second tell, a CVE the Glossary knows. */

const game = preseedGame()

const fact = (
  key: string,
  sender: string,
  subject: string,
  actions: ReadonlyArray<{ id: string; label: string }> = [],
  spam = false,
): Fact => ({ key, sender, subject, text: `About ${subject}.`, actions, spam })

const sent = (facts: ReadonlyArray<Fact>, folder: Inbox['folder'] = 'action'): Inbox => {
  let inbox: Inbox = { ...EMPTY_INBOX, folder }
  facts.forEach((entry, index) => {
    inbox = mailed(inbox, entry, index + 1, true)
  })
  return inbox
}

const ticket: WorkItem = {
  id: 1,
  kind: 'patch',
  ref: 'CVE-2026-0451',
  cost: 4,
  spent: 0,
  blockedBy: null,
  answered: null,
  due: game.time + 200,
  target: 'server',
}

/** The letter the fake advisory sends: built from its own copy, as the Inbox sends it. */
const fakeAdvisory = (): Fact => {
  const pitch = SPAM.find((entry) => entry.sender === 'spam-cve')!
  const letter = pitch.letters[0]!({ from: senderOf('spam-cve').name })
  return fact('spam:spam-cve', 'spam-cve', letter.subject, [...(pitch.actions ?? [])], true)
}

test('a row carries the kind label its filter chip selects', () => {
  const phish = fact(
    'spam:spam-awol',
    'spam-awol',
    'Verify your account',
    [{ id: 'trap:phish', label: 'Verify account' }],
    true,
  )
  const inbox = sent([
    fact('cloud:cpu:app-01', 'cloud', 'Capacity warning'),
    disclosureFact(ticket, game),
    phish,
    fact('team:rewrite:pat', 'mate:e1', 'Rewrite it in Go', [
      { id: 'rewrite:go', label: 'Review Go migration' },
    ]),
  ])
  // The rows that wait on the player, and the ones that only inform: each carries its own kind.
  expect(folderList(inbox).map(kindLabelOf)).toEqual(['Team', 'Security'])
  expect(folderList({ ...inbox, folder: 'fyi' }).map(kindLabelOf)).toEqual(['Cloud'])
  // A phishing copy wears the cloud's badge in the list, but its kind is Spam: the label is
  // the truth about who wrote, and it repeats the badge's colour and shape.
  expect(senderOf(phish.sender).looks).toBe('cloud')
  expect(kindOf(inbox.mail.find((mail) => mail.sender === 'spam-awol')!)).toBe('spam')
})

test('a filtered folder holds only rows carrying the chip label', () => {
  const inbox = sent(
    [
      fact('cloud:cpu:a', 'cloud', 'Capacity warning'),
      disclosureFact(ticket, game),
      fact('cloud:cpu:b', 'cloud-azzure', 'Out of CPU credits'),
    ],
    'fyi',
  )
  const cloud = { ...inbox, label: 'cloud' as const }
  expect(folderList(cloud).map(kindLabelOf)).toEqual(['Cloud', 'Cloud'])
  expect(folderList(cloud).every((mail) => labelHolds(mail, 'cloud'))).toBe(true)
  // The other end of the same filter: the Security row is not in it.
  expect(folderList(cloud).some((mail) => kindOf(mail) === 'security')).toBe(false)
  // Spam is a folder as well as a label: the trap is never in Needs action.
  const trap = fakeAdvisory()
  const withTrap = sent([trap])
  expect(folderHolds(withTrap.mail[0]!, 'spam')).toBe(true)
  expect(folderHolds(withTrap.mail[0]!, 'action')).toBe(false)
})

test('the priority bar is danger for a clock, warn for a decision, absent otherwise', () => {
  const advisory = disclosureFact(ticket, game)
  const offer = fact('investor:round', 'investor', 'Term sheet', [
    { id: 'raise', label: 'Raise' },
    { id: 'decline', label: 'Decline' },
  ])
  const fyi = fact('event:deployed', 'monitoring', 'Deployed')
  const inbox = sent([advisory, offer, fyi, fakeAdvisory()])
  const [trapMail, newsletter, termSheet, cve] = [...inbox.mail].reverse()

  expect(priorityOf(cve!)).toBe('clock')
  expect(barOf(cve!)).toBe('bg-danger')
  expect(priorityOf(termSheet!)).toBe('decision')
  expect(barOf(termSheet!)).toBe('bg-warn')
  expect(priorityOf(newsletter!)).toBe('none')
  expect(barOf(newsletter!)).toBeNull()
  // Noise never wears the bar: a trap is not something the Design needs.
  expect(priorityOf(trapMail!)).toBe('none')
  expect(barOf(trapMail!)).toBeNull()
  // An answered Mail keeps no bar: the question is over.
  const answered = {
    ...inbox,
    mail: inbox.mail.map((mail) => ({ ...mail, answer: 'You raised.' })),
  }
  expect(answered.mail.every((mail) => barOf(mail) === null)).toBe(true)
})

test('a trap button hovers its real destination, and it is not the one the label shows', () => {
  const real = { id: 'first:1', label: 'Patch now' }
  const fake = SPAM.find((entry) => entry.sender === 'spam-cve')!.actions![0]!
  // The two buttons look the same and take the same number key; the hover is what separates them.
  expect(fake.label).toBe(real.label)
  expect(destinationOf(real)).toBe('Team: the patch goes to the top of the backlog')
  expect(destinationOf(fake)).toBe('Leads off-site to cve-fyi.top/patch/patcher.sh')
  expect(destinationOf(fake)).not.toBe(destinationOf(real))
  expect(destinationOf(fake)).not.toBe(fake.label)
  // A trap leaves the game; an honest button never does.
  expect(destinationOf(fake).startsWith('Leads off-site')).toBe(true)
  expect(destinationOf(real).startsWith('Leads off-site')).toBe(false)
  // Every trap the world can send names a site, so none reaches the reader with an empty hover.
  for (const pitch of SPAM)
    for (const action of pitch.actions ?? []) {
      if (!action.id.startsWith('trap:')) continue
      expect(destinationOf(action), action.id).toMatch(/^Leads off-site to \S+\.\S+$/)
    }
})

test('the second tell names a CVE only when the Glossary knows the id', () => {
  const advisory = disclosureFact(ticket, game)
  const real = advisoryTell(`${advisory.subject}\n${advisory.text}`)
  expect(cveIdIn(advisory.subject)).toBe('CVE-2026-0451')
  expect(real).toEqual({ id: 'CVE-2026-0451', term: 'cve-2026-0451' })
  expect(cveTermId('CVE-2026-0451')).toBe('cve-2026-0451')

  const fake = fakeAdvisory()
  // The fake advisory does name CVE ids; none of them is one the Glossary lists.
  expect(cveIdIn(`${fake.subject}\n${fake.text}`)).not.toBeNull()
  expect(advisoryTell(`${fake.subject}\n${fake.text}`)).toBeNull()
  expect(glossaryKnowsCve('CVE-2099-0001')).toBe(false)
  expect(glossaryKnowsCve('CVE-2026-0451')).toBe(true)

  // The Glossary lists exactly the CVEs the Simulation can disclose, so the lookup is real.
  expect(CVE_TERMS.map((entry) => entry.term)).toEqual(CVE_DEFS.map((def) => def.id))
  expect(CVE_TERMS.every((entry) => entry.category === 'security')).toBe(true)
})
