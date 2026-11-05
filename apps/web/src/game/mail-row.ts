import type { Mail, MailAction as MailActionSchema } from './model.ts'
import { KIND_LABEL, needsAction, senderOf, type SenderKind } from './mail.ts'

/* ==========================================================================
   What a Mail row and its buttons say beyond the copy (GDD 18): the kind
   label on a row, the coloured priority bar, and where a button really goes.
   ========================================================================== */

type MailAction = typeof MailActionSchema.Type

/** A Mail's label is its Sender's kind: the same one its filter chip selects. */
export const kindOf = (mail: Mail): SenderKind => senderOf(mail.sender).kind

export const kindLabelOf = (mail: Mail): string => KIND_LABEL[kindOf(mail)]

/** How much a Mail wants the player: a clock is running, a decision waits, or neither. */
export type Priority = 'clock' | 'decision' | 'none'

export const priorityOf = (mail: Mail): Priority =>
  mail.answer !== null || mail.resolved !== null || mail.spam || mail.trashed
    ? 'none'
    : // A CVE advisory carries a clock: the ticket expires and the CVE is exploited.
      senderOf(mail.sender).kind === 'security'
      ? 'clock'
      : needsAction(mail)
        ? 'decision'
        : 'none'

/** The coloured left bar's class, in the design's tones: danger for a clock, warn for a wait. */
const BAR: Record<Priority, string | null> = {
  clock: 'bg-danger',
  decision: 'bg-warn',
  none: null,
}

export const barOf = (mail: Mail): string | null => BAR[priorityOf(mail)]

export const PRIORITY_LABEL: Record<Priority, string> = {
  clock: 'Urgent: a clock is running',
  decision: 'Needs a decision',
  none: '',
}

/** Where a button really goes, in the game: the hover names the control it opens. */
const DESTINATIONS: Record<string, string> = {
  show: 'Selects it on the Board',
  resize: 'Opens the Node Inspector, to resize it',
  quota: 'Opens the Node Inspector, on its limit',
  reserved: 'Opens the Node Inspector, on its pricing',
  first: 'Team: the patch goes to the top of the backlog',
  rush: 'Team: the patch is rushed',
  team: 'Opens Team',
  raise: 'Raises the round',
  decline: 'Declines',
  hire: 'Adds the hire to the Team roster',
  later: 'Answers later',
  approve: 'Team: the item moves again',
  defer: 'Answers later: they will ask again tomorrow',
  patch: 'Team: the patch goes to the top of the backlog',
  queue: 'Team: the patch waits its turn',
  timeoff: 'Team: they take three calendar days off',
  payrise: 'Team: their pay rises to the Era’s rate',
  resign: 'Team: they leave the Company',
  rewrite: 'Opens the Tradeoff card for the migration',
  backlog: 'Queues the Feature at the end of the Team backlog',
  churn: 'Opens the Churn breakdown',
  postmortem: 'Files the postmortem',
  'postmortem-take': 'Files the postmortem and queues the action item',
  ack: 'Marks it read and dismisses the card',
  vendor: 'Takes a fifth off that item’s Insight cost',
  mute: 'Mutes the sender for one calendar hour',
}

/** The site a trap's button leaves for. A real button never leaves the game. */
const TRAP_SITES: Record<string, string> = {
  phish: 'awol-cloud.support/session/verify',
  patcher: 'cve-fyi.top/patch/patcher.sh',
  invoice: 'azzure-invoices.top/pay/AZ-88213',
  domain: 'domain-guard.wtf/renew/quorum.team',
}

/**
 * The hover's destination for a button (18 "A button is a commitment"). A real
 * button names the game control it opens; a trap's button names an off-site
 * address on a cheap TLD, which is a tell the player can see before clicking.
 */
export const destinationOf = (action: MailAction): string => {
  const [kind = '', target = ''] = action.id.split(':')
  if (kind === 'trap') {
    const site = TRAP_SITES[target]
    return site ? `Leads off-site to ${site}` : 'Leads off-site'
  }
  return DESTINATIONS[kind] ?? `Answers: ${action.label}`
}
