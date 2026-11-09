import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import type { Game } from '@quorum/simulation/state'
import { SAMPLES, needsAction, randomSample, senderOf, type Fact } from './mail.ts'
import { Folder, MailLabel, Mail as MailSchema, MailMute, type Inbox, type Mail } from './model.ts'
import { SENDER_KINDS } from './copy/senders.ts'
import type { Snippet } from './mail-text.ts'

const MAIL_KEPT = 40
const THREAD_ENTRIES = 20

/** Sim seconds in one calendar hour: one sim second is one calendar minute. */
export const CALENDAR_HOUR = 60

/** Unread threads past this many fold their oldest low-priority ones into the Digest (18 "Pacing"). */
export const FOLD_AFTER = 8

/** The Digest is not a Mail the Inbox stores: it is the fold of threads it hides, shown as one row. */
export const DIGEST_ID = -1

/** Senders whose Mail is about the Design now: a Thread resolves when its cause is gone. */
const ADVISING = new Set(['cloud', 'monitoring', 'vendor', 'investor', 'finance', 'mentor'])

export const EMPTY_INBOX: Inbox = {
  mail: [],
  focus: null,
  peek: null,
  bucket: 0,
  sample: 'random',
  folder: 'action',
  label: null,
  mutes: [],
  filter: true,
}

/** True while the player has this Sender muted: their Mail lands for the record, not the badge. */
export const muted = (inbox: Inbox, sender: string, time: number): boolean =>
  inbox.mutes.some((mute) => mute.sender === sender && mute.until > time)

/** The Inbox with `sender` silenced for one calendar hour from `time`. */
export const muting = (inbox: Inbox, sender: string, time: number): Inbox => ({
  ...inbox,
  peek: inbox.mail.find((mail) => mail.id === inbox.peek)?.sender === sender ? null : inbox.peek,
  mutes: [
    ...inbox.mutes.filter((mute) => mute.sender !== sender && mute.until > time),
    { sender, until: time + CALENDAR_HOUR },
  ],
})

/** Mail waits for a decision (Needs action), or only informs (FYI), or the filter caught it (Spam). */
export const folderHolds = (mail: Mail, folder: Folder): boolean =>
  folder === 'trash'
    ? mail.trashed
    : !mail.trashed &&
      (folder === 'spam' ? mail.spam : !mail.spam && needsAction(mail) === (folder === 'action'))

/** A Mail's label is its Sender's kind; a chip shows one kind, or every kind with no chip. */
export const labelHolds = (mail: Mail, label: MailLabel | null): boolean =>
  label === null || senderOf(mail.sender).kind === label

/** The Mail in the open folder under the chips' label. */
const held = (inbox: Inbox): ReadonlyArray<Mail> =>
  inbox.mail.filter((mail) => folderHolds(mail, inbox.folder) && labelHolds(mail, inbox.label))

/**
 * The threads the Digest folds (18 "Pacing and volume"): once more than eight are unread, the
 * oldest low-priority ones (FYI, so nothing that waits on a decision) fold into one row.
 */
export const digestOf = (inbox: Inbox): ReadonlyArray<Mail> => {
  const unread = held(inbox).filter((mail) => !mail.read)
  if (unread.length <= FOLD_AFTER) return []
  const kept = new Set(unread.slice(-FOLD_AFTER))
  return unread.filter((mail) => !kept.has(mail) && !needsAction(mail))
}

/** The Digest as the list shows it: one row for every thread it folds, newest folded line first. */
const digestMail = (folded: ReadonlyArray<Mail>): Mail => {
  const time = folded.at(-1)?.time ?? 0
  return {
    id: DIGEST_ID,
    key: 'digest',
    // A Digest is the Inbox folding its own Mail, so it wears no Sender's badge.
    sender: 'digest',
    subject: `Digest: ${folded.length} older updates`,
    time,
    entries: [{ time, text: '' }],
    actions: [],
    phase: { _tag: 'Active' },
    read: folded.every((mail) => mail.read),
    trashed: false,
    spam: false,
  }
}

/** The Mail in the open folder, newest first, with the Digest in the place of the threads it folds. */
export const folderList = (inbox: Inbox): ReadonlyArray<Mail> => {
  const list = held(inbox)
  const folded = digestOf(inbox)
  if (folded.length === 0) return [...list].reverse()
  const hidden = new Set(folded)
  const newest = folded[folded.length - 1]
  const shown: Array<Mail> = []
  for (const mail of list) {
    if (!hidden.has(mail)) shown.push(mail)
    else if (mail === newest) shown.push(digestMail(folded))
  }
  return shown.reverse()
}

/** The Mail in the open folder, the Digest's folded threads, and the Digest itself. */
const reachable = (inbox: Inbox): ReadonlyArray<Mail> => [...held(inbox), ...folderList(inbox)]

/** The labels the open folder holds, with how much Mail each one has, in the chips' order. */
export const labelsIn = (
  inbox: Inbox,
): ReadonlyArray<Readonly<{ label: MailLabel; count: number }>> => {
  const inFolder = inbox.mail.filter((mail) => folderHolds(mail, inbox.folder))
  return SENDER_KINDS.flatMap((label) => {
    const count = inFolder.filter((mail) => senderOf(mail.sender).kind === label).length
    return count > 0 ? [{ label, count }] : []
  })
}

/** A fact joins its Thread, or starts one. The same news twice changes nothing.
 *  `open` says the Inbox panel is on screen, so new Mail needs no preview card. */
export const mailed = (
  inbox: Inbox,
  fact: Fact,
  time: number,
  open: boolean,
  repeats = false,
): Inbox => {
  const existing = inbox.mail.find((mail) => mail.key === fact.key && !mail.trashed)
  if (
    !repeats &&
    existing &&
    existing.phase._tag !== 'Resolved' &&
    existing.entries.at(-1)?.text === fact.text
  )
    return inbox
  const others = inbox.mail.filter((mail) => mail !== existing)
  // A muted Sender lands for the record: no dot on the row and no card above the Inbox button.
  const quiet = muted(inbox, fact.sender, time)
  const thread: Mail = existing
    ? {
        ...existing,
        time,
        read: quiet,
        phase: { _tag: 'Active' },
        actions: fact.actions,
        entries: [
          ...existing.entries,
          { time, text: fact.text, ...(fact.message ? { message: fact.message } : {}) },
        ].slice(-THREAD_ENTRIES),
      }
    : {
        id: Math.max(0, ...inbox.mail.map((mail) => mail.id)) + 1,
        key: fact.key,
        sender: fact.sender,
        subject: fact.subject,
        ...(fact.message ? { message: fact.message } : {}),
        time,
        entries: [{ time, text: fact.text, ...(fact.message ? { message: fact.message } : {}) }],
        actions: fact.actions,
        phase: { _tag: 'Active' },
        read: quiet,
        trashed: false,
        spam: fact.spam && inbox.filter,
      }
  // Mail that wants the player (a decision, or a provider, alarm or advisory) previews above the
  // Inbox button until it is read, so a new letter cannot go unnoticed.
  const loud =
    needsAction(thread) ||
    ['cloud', 'monitoring', 'security'].includes(senderOf(thread.sender).kind)
  const peek = !thread.spam && loud && !open && !quiet ? thread.id : inbox.peek
  return { ...inbox, mail: [...others, thread].slice(-MAIL_KEPT), peek }
}

/** Advice about anything but `key` no longer holds. */
export const resolvedExcept = (inbox: Inbox, key: string, time: number): Inbox => ({
  ...inbox,
  mail: inbox.mail.map((mail) =>
    ADVISING.has(mail.sender) && mail.key !== key && mail.phase._tag !== 'Resolved'
      ? { ...mail, phase: { _tag: 'Resolved', at: time } }
      : mail,
  ),
})

/** A Thread whose cause is over: it records the last line and resolves. */
export const closed = (
  inbox: Inbox,
  key: string,
  time: number,
  text: string,
  closing?: Snippet,
): Inbox => ({
  ...inbox,
  mail: inbox.mail.map((mail) =>
    mail.key === key && !mail.trashed
      ? {
          ...mail,
          read: false,
          phase: { _tag: 'Resolved', at: time },
          entries: [...mail.entries, { time, text, ...(closing ? { closing } : {}) }].slice(
            -THREAD_ENTRIES,
          ),
        }
      : mail,
  ),
})

/** The Inbox opens on Needs action while something needs the player, and on FYI otherwise. */
export const openingFolder = (inbox: Inbox): Folder =>
  !inbox.mail.some((mail) => folderHolds(mail, 'action')) &&
  inbox.mail.some((mail) => folderHolds(mail, 'fyi'))
    ? 'fyi'
    : 'action'

/** The Inbox on one Mail, or the newest in its folder, which counts as read. */
/** The Inbox as a list: no open thread, nothing marked read. A phone lands here. */
export const listing = (inbox: Inbox, focus: number | null = null): Inbox => ({
  ...inbox,
  focus,
  peek: null,
})

export const reading = (inbox: Inbox, focus: number | null = null): Inbox => {
  const shown = folderList(inbox)
  const id =
    (
      shown.find((mail) => mail.id === focus) ??
      // A thread the Digest folded is still reachable: opening it from the Digest shows it.
      reachable(inbox).find((mail) => mail.id === focus) ??
      shown[0]
    )?.id ?? null
  return {
    ...inbox,
    focus: id,
    peek: null,
    mail: inbox.mail.map((mail) => (mail.id === id ? { ...mail, read: true } : mail)),
  }
}

export const withMail = (inbox: Inbox, id: number, change: Partial<Mail>): Inbox => ({
  ...inbox,
  mail: inbox.mail.map((mail) => (mail.id === id ? { ...mail, ...change } : mail)),
})

/** What a Company keeps of its Inbox (18 "Open questions"): the Mail and the Senders it muted. */
export const SavedInbox = Schema.Struct({
  mail: Schema.Array(MailSchema),
  mutes: Schema.Array(MailMute),
  filter: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
  /** The last event tick the world wrote Mail for, so a reload does not repeat it. */
  bucket: Schema.Finite,
  /** The Sandbox bench's chosen sample; harmless for a Company, and it keeps one shape. */
  sample: Schema.String,
})
export type SavedInbox = typeof SavedInbox.Type

export const savedInbox = (inbox: Inbox): SavedInbox => ({
  mail: inbox.mail,
  mutes: inbox.mutes,
  filter: inbox.filter,
  bucket: inbox.bucket,
  sample: inbox.sample,
})

const decodeInbox = Schema.decodeUnknownOption(SavedInbox)

/**
 * What a save says about the Inbox. A save from before it was saved, or one whose Mail this build
 * cannot read, opens with an empty Inbox rather than refusing to open at all.
 */
export const inboxOfSave = (saved: unknown): Inbox => {
  if (typeof saved !== 'object' || saved === null || !('inbox' in saved)) return EMPTY_INBOX
  const inbox = Option.getOrElse(decodeInbox(saved.inbox), () => EMPTY_INBOX)
  // The panel's own view is not part of the Inbox: it opens on Needs action, as it always does.
  return { ...inbox, focus: null, peek: null, folder: 'action', label: null }
}

export const InboxMessage = defineMessageUnion({
  /** Shows one Mail; null shows the newest in the folder. */
  Opened: { id: Schema.NullOr(Schema.Finite) },
  /** The preview card above the Inbox button opens its Mail in the panel. */
  PeekOpened: { id: Schema.Finite },
  PeekDismissed: {},
  Trashed: { id: Schema.Finite },
  Restored: { id: Schema.Finite },
  MarkedSpam: { id: Schema.Finite },
  /** The spam filter was switched on or off. */
  FilterToggled: {},
  FolderChosen: { folder: Folder },
  /** A filter chip: one Sender kind, or null for every label. */
  LabelChosen: { label: Schema.NullOr(MailLabel) },
  Acted: { id: Schema.Finite, action: Schema.String },
  SampleChosen: { id: Schema.String },
  Generated: { count: Schema.Finite },
  Resolved: {},
  Cleared: {},
})
export type InboxMessage = typeof InboxMessage.Type

/** What the parent does after a gesture: open the panel, or act on a Mail's button. */
export const InboxOutMessage = defineMessageUnion({
  PanelWanted: {},
  /** A button whose effect is outside the Inbox; its answer is already written. */
  ActionTaken: { kind: Schema.String, target: Schema.NullOr(Schema.String) },
})
export type InboxOutMessage = typeof InboxOutMessage.Type

/** What the Inbox reads from the board around it. */
export type InboxContext = Readonly<{ game: Game; open: boolean }>

/** The answer a button writes into its Mail, with which one it is; null for one that only acts. */
const answerOf = (
  kind: string | undefined,
  mail: Mail,
): Readonly<{ id: string; text: string }> | null => {
  const mate = mail.sender.startsWith('mate:')
  switch (kind) {
    case 'raise':
      return { id: 'raise', text: 'You raised the round.' }
    case 'decline':
      return mate
        ? { id: 'declineMate', text: 'You declined. They will bring it up again.' }
        : { id: 'declineRound', text: 'You declined the round.' }
    case 'hire':
      return { id: 'hire', text: 'You approved the hire.' }
    case 'team':
      return { id: 'team', text: 'You opened Team.' }
    case 'later':
      return { id: 'later', text: 'Later. They will ask again.' }
    case 'first':
      return { id: 'first', text: 'You moved the patch to the top.' }
    case 'approve':
      return { id: 'approve', text: 'You approved it. The work moves again.' }
    case 'defer':
      return { id: 'defer', text: 'Later. They will ask again tomorrow.' }
    case 'patch':
      return { id: 'patch', text: 'You patched now: the ticket goes to the top.' }
    case 'queue':
      return { id: 'queue', text: 'You queued the patch behind the product work.' }
    case 'timeoff':
      return { id: 'timeoff', text: 'You gave them time off.' }
    case 'payrise':
      return { id: 'payrise', text: 'You raised their salary to the Era’s rate.' }
    case 'resign':
      return { id: 'resign', text: 'You accepted the resignation.' }
    case 'rush':
      return { id: 'rush', text: 'You rushed the patch.' }
    case 'ack':
      return { id: 'ack', text: 'You acknowledged it.' }
    case 'mute':
      return { id: 'mute', text: 'You muted this sender for an hour.' }
    case 'backlog':
      return { id: 'backlog', text: 'You added it to the backlog.' }
    case 'postmortem':
      return { id: 'postmortem', text: 'You filed the postmortem.' }
    case 'postmortem-take':
      return {
        id: 'postmortemTake',
        text: 'You filed the postmortem and put the action item in the study queue.',
      }
    case 'vendor':
      return { id: 'vendor', text: 'You booked the demo.' }
    case 'easy':
      return { id: 'easy', text: 'You turned on Easy mode.' }
    case 'trap':
      return {
        id: 'trap',
        text: 'You clicked it. It was a trap: the address was not the real sender.',
      }
    default:
      return null
  }
}

/** Buttons that only answer: a teammate's declined request, and Later. */
const answersOnly = (kind: string | undefined, mail: Mail): boolean =>
  kind === 'later' || (kind === 'decline' && mail.sender.startsWith('mate:'))

/** Buttons the Inbox carries out itself: Acknowledge and Mute change no Simulation number. */
const QUIET = new Set(['ack', 'mute'])

const ACTING = new Set([
  'approve',
  'defer',
  'patch',
  'queue',
  'timeoff',
  'payrise',
  'resign',
  'raise',
  'decline',
  'hire',
  'team',
  'rewrite',
  'first',
  'rush',
  'show',
  'resize',
  'quota',
  'reserved',
  'backlog',
  'trap',
  'churn',
  'research',
  'postmortem',
  'postmortem-take',
  'easy',
])

export const updateInbox = (
  inbox: Inbox,
  message: InboxMessage,
  context: InboxContext,
): Update.ReturnWithOutMessage<Inbox, InboxMessage, InboxOutMessage> =>
  InboxMessage.match<Update.ReturnWithOutMessage<Inbox, InboxMessage, InboxOutMessage>>(message, {
    Opened: ({ id }) => ({ model: id === null ? listing(inbox) : reading(inbox, id) }),
    PeekOpened: ({ id }) => {
      const mail = inbox.mail.find((entry) => entry.id === id)
      const folder = mail?.spam ? 'spam' : mail && needsAction(mail) ? 'action' : 'fyi'
      return {
        model: reading({ ...inbox, folder, label: null }, id),
        outMessage: InboxOutMessage.PanelWanted(),
      }
    },
    PeekDismissed: () => ({ model: { ...inbox, peek: null } }),
    Trashed: ({ id }) => ({ model: listing(withMail(inbox, id, { trashed: true })) }),
    Restored: ({ id }) => ({ model: listing(withMail(inbox, id, { trashed: false })) }),
    FilterToggled: () => ({ model: { ...inbox, filter: !inbox.filter } }),
    MarkedSpam: ({ id }) => {
      const mail = inbox.mail.find((entry) => entry.id === id)
      const spam = !mail?.spam
      // Reporting a trap teaches the filter and removes the risk (18 "Report spam"): a phishing
      // Mail that reaches Spam can no longer be clicked, and its button goes with it.
      const disarms =
        spam && (mail?.actions.some((action) => action.id.startsWith('trap:')) ?? false)
      return {
        model: listing(withMail(inbox, id, { spam, ...(disarms ? { actions: [] } : {}) })),
      }
    },
    FolderChosen: ({ folder }) => ({ model: listing({ ...inbox, folder, label: null }) }),
    LabelChosen: ({ label }) => ({ model: listing({ ...inbox, label }) }),
    Acted: ({ id, action }) => {
      const mail = inbox.mail.find((entry) => entry.id === id)
      if (!mail) return { model: inbox }
      const [kind, target] = action.split(':')
      // Mute silences the sender first, so the card above the button goes with it.
      const unpeeked =
        kind === 'mute'
          ? muting(inbox, mail.sender, context.game.time)
          : { ...inbox, peek: inbox.peek === id ? null : inbox.peek }
      const written = answerOf(kind, mail)
      const phase =
        written === null
          ? null
          : { phase: { _tag: 'Answered', answer: written.text, answerId: written.id } as const }
      // Acknowledge and Mute also clear the unread dot: the question is answered, not just opened.
      const next =
        phase === null
          ? unpeeked
          : withMail(unpeeked, id, QUIET.has(kind ?? '') ? { ...phase, read: true } : phase)
      return kind && ACTING.has(kind) && !answersOnly(kind, mail)
        ? { model: next, outMessage: InboxOutMessage.ActionTaken({ kind, target: target ?? null }) }
        : { model: next }
    },
    SampleChosen: ({ id }) => ({ model: { ...inbox, sample: id } }),
    Generated: ({ count }) => {
      // Send uses the chosen sample; a burst of 10 or 50 draws a random sample for each Mail.
      const chosen = SAMPLES.find((entry) => entry.id === inbox.sample) ?? SAMPLES[0]
      if (!chosen) return { model: inbox }
      let next = inbox
      for (let sent = 0; sent < count; sent += 1) {
        const n = Math.max(0, ...next.mail.map((mail) => mail.id)) + 1
        const sample = count === 1 ? chosen : randomSample(context.game, n)
        next = mailed(next, sample.make(context.game, n), context.game.time, context.open)
      }
      return { model: reading(next, null) }
    },
    Resolved: () => ({ model: resolvedExcept(inbox, '', context.game.time) }),
    Cleared: () => ({ model: { ...inbox, mail: [], focus: null, peek: null } }),
  })
