import { actionLabelIn, answerIn, closingIn, signOf, writtenIn } from '@/i18n/mail-render.ts'
import { type Messages, copy } from '@/i18n/messages.ts'
import { has } from '@quorum/simulation/lookups'
import { InboxMessage } from '@/game/inbox.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  Activity,
  ArchiveRestore,
  Ban,
  CircleCheck,
  Cloud,
  Compass,
  CreditCard,
  Landmark,
  Layers,
  LifeBuoy,
  Mail as MailIcon,
  ShieldAlert,
  Trash2,
  TrendingUp,
  User,
  X,
  type IconNode,
  Dices,
} from 'lucide'
import { badge as chip } from '@quorum/ui/primitives/badge'
import { button } from '@quorum/ui/primitives/button'
import { clock } from '@quorum/ui/game/format'
import { SAMPLES, needsAction, senderOf, type Sender, type SenderKind } from '@/game/mail.ts'
import type { BuildGroup } from '@quorum/simulation/catalog'
import { Kbd } from '@quorum/ui/primitives/kbd'
import {
  nativeSelect,
  nativeSelectOptGroup,
  nativeSelectOption,
} from '@quorum/ui/primitives/native-select'
import { folderHolds, folderList, digestOf, labelsIn, DIGEST_ID } from '@/game/inbox.ts'
import { TRAP_SITES, barOf, kindOf, priorityOf } from '@/game/mail-row.ts'
import { advisoryTell } from '@/game/advisories.ts'
import { Message } from '@/game/message.ts'
import { boardSandbox, type Folder, type Mail, type MailLabel, type Model } from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, FLOAT, PANEL, SCROLL, WELL, groupBadge } from '@quorum/ui/game/bits'

/** Where a button really goes, in words of the builder's language (a trap's names an off-site address). */
const destinationIn = (t: Messages, h: object, action: Mail['actions'][number]): string => {
  const [kind = '', target = ''] = action.id.split(':')
  if (kind === 'trap') {
    const site = TRAP_SITES[target]
    return site ? t.inbox.leadsOffSite(site) : t.inbox.leadsOffSiteUnknown
  }
  return (
    (t.inbox.destinations as Readonly<Record<string, string | undefined>>)[kind] ??
    t.inbox.answers(actionLabelIn(t, action))
  )
}

/* ==========================================================================
   The Inbox (GDD 18): the game's voice, as a mail window docked above its
   corner button. Senders wear the app's own badges: the shape and colour
   say what kind of party wrote (a person, a provider, an alarm), the way
   the dock's badges say what kind of Component it is.
   ========================================================================== */

/** The badge each kind of sender wears: a shape from the build groups, a glyph, a colour. */
const BADGE: Record<SenderKind, { group: BuildGroup; glyph: IconNode }> = {
  cloud: { group: 'edge', glyph: Cloud },
  monitoring: { group: 'ops', glyph: Activity },
  vendor: { group: 'ops', glyph: CreditCard },
  investor: { group: 'compute', glyph: TrendingUp },
  finance: { group: 'data', glyph: Landmark },
  customers: { group: 'edge', glyph: LifeBuoy },
  mentor: { group: 'compute', glyph: Compass },
  teammate: { group: 'data', glyph: User },
  security: { group: 'ops', glyph: ShieldAlert },
  spam: { group: 'edge', glyph: Ban },
}

/** The shape and glyph say what kind of party wrote; the colour is the brand it parodies. */
const badge = (sender: Sender, size: string, h: HtmlBuilder<Message>): Html => {
  const { group, glyph } = BADGE[sender.looks]
  return groupBadge(group, glyph, size, h, false, sender.color)
}

const unreadIn = (model: Model, folder: Folder): number =>
  model.board.inbox.mail.filter((mail) => folderHolds(mail, folder) && !mail.read).length

/** Threads waiting on the player: it does not fall when they are read, only when they are answered. */
const openCount = (model: Model): number =>
  model.board.inbox.mail.filter((mail) => folderHolds(mail, 'action')).length

/** A letter's text in the builder's language: written again from what it says, or the English the Model kept. */
const bodyOf = (h: HtmlBuilder<Message>, entry: Mail['entries'][number]): string =>
  (entry.message ? writtenIn(copy(h), entry.message)?.body : undefined) ??
  (entry.closing ? (closingIn(copy(h), entry.closing) ?? undefined) : undefined) ??
  entry.text

/** A Mail's subject in the builder's language. */
const subjectOf = (h: HtmlBuilder<Message>, mail: Mail): string =>
  (mail.message ? writtenIn(copy(h), mail.message)?.subject : undefined) ?? mail.subject

/** The first line of a letter that says something, for the preview. */
const gist = (h: HtmlBuilder<Message>, mail: Mail): string => {
  const last = mail.entries.at(-1)
  return (
    (last ? bodyOf(h, last) : '').split('\n\n').find((paragraph) => paragraph.trim() !== '') ?? ''
  )
}

/**
 * The newest letter that wants the player, as a card above the Inbox button. It stays until the
 * player reads, answers or dismisses it, so new mail cannot slip past. A decision shows its first
 * button here, so a patch is one click away.
 */
export const peek = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const mail = model.board.inbox.mail.find(
    (entry) => entry.id === model.board.inbox.peek && !entry.trashed,
  )
  if (!mail || model.panel === 'inbox') return h.empty
  const sender = senderOf(mail.sender)
  const decision = needsAction(mail)
  const act = decision ? mail.actions.find((action) => !action.id.startsWith('show')) : undefined
  return h.div(
    [
      h.Key(`peek-${mail.id}-${mail.entries.length}`),
      h.Role('status'),
      h.AriaLabel(t.inbox.newMailFrom(sender.name, subjectOf(h, mail))),
      h.Class(
        `enter-pop absolute right-3 bottom-[68px] z-20 flex w-[min(380px,calc(100%-24px))] flex-col gap-2.5 p-3 ${FLOAT} compact:static compact:w-auto compact:pointer-events-auto`,
      ),
    ],
    [
      h.div(
        [h.Class('flex items-start gap-3')],
        [
          badge(sender, 'size-8', h),
          h.div(
            [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
            [
              h.span(
                [h.Class(cn(EYEBROW, 'flex items-center gap-1.5'))],
                [
                  h.span([h.Class('truncate')], [sender.name]),
                  h.span([], ['·']),
                  h.span([h.Class(FIGURE)], [clock(mail.time)]),
                ],
              ),
              h.span(
                [
                  h.Class(
                    'line-clamp-2 text-[calc(14.5px*var(--type-scale))] leading-snug font-semibold tracking-[-0.01em]',
                  ),
                ],
                [subjectOf(h, mail)],
              ),
            ],
          ),
          button(
            {
              onClick: Message.InboxChanged({ message: InboxMessage.PeekDismissed() }),
              variant: 'ghost',
              size: 'icon-sm',
              className: '-mt-1 -mr-1.5 text-muted-foreground',
              attributes: [h.AriaLabel(t.inbox.dismiss), h.Title(t.inbox.dismiss)],
            },
            icon(h, X, 'size-3.5'),
            h,
          ),
        ],
      ),
      // The clamp sits on the inner line, so the well's padding cannot show a third line.
      h.div(
        [h.Class(cn(WELL, 'px-3 py-2 short:hidden'))],
        [
          h.p(
            [
              h.Class(
                'line-clamp-2 text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground',
              ),
            ],
            [gist(h, mail)],
          ),
        ],
      ),
      h.div(
        [h.Class('flex items-center gap-2')],
        [
          decision ? chip({ variant: 'destructive' }, [t.inbox.needsAction], h) : h.empty,
          h.span([h.Class('flex-1')], []),
          act
            ? button(
                {
                  onClick: Message.InboxChanged({
                    message: InboxMessage.Acted({ id: mail.id, action: act.id }),
                  }),
                  size: 'sm',
                  attributes: [h.Key(act.id), h.Title(destinationIn(t, h, act))],
                },
                actionLabelIn(t, act),
                h,
              )
            : h.empty,
          button(
            {
              onClick: Message.InboxChanged({ message: InboxMessage.PeekOpened({ id: mail.id }) }),
              variant: act ? 'outline' : 'default',
              size: 'sm',
              attributes: [h.Key('open')],
            },
            [t.inbox.open, Kbd({ className: 'ml-1 opacity-80' }, ['I'], h)],
            h,
          ),
        ],
      ),
    ],
  )
}

export const inboxButton = (model: Model, h: HtmlBuilder<Message>): Html => {
  const unread = unreadIn(model, 'action') + unreadIn(model, 'fyi')
  // A decision waiting turns the badge red and rings the button; FYI mail keeps the quiet badge.
  const waiting = model.board.inbox.mail.some((mail) => folderHolds(mail, 'action') && !mail.read)
  return inboxToggle(model, unread, waiting, h)
}

const inboxToggle = (
  model: Model,
  unread: number,
  waiting: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  return h.button(
    [
      h.Key('inbox'),
      h.Type('button'),
      h.Title(t.inbox.inboxI),
      h.AriaLabel(unread > 0 ? t.inbox.inboxUnread(unread) : t.inbox.inbox),
      h.OnClick(Message.PanelOpened({ panel: 'inbox' })),
      h.Class(
        `${waiting ? 'mail-ping text-foreground ' : 'text-muted-foreground '}absolute right-3 bottom-3 z-20 grid size-11 place-items-center ${PANEL} hover:text-foreground compact:right-[max(8px,env(safe-area-inset-right))] compact:bottom-[calc(max(8px,env(safe-area-inset-bottom))+84px)]`,
      ),
    ],
    [
      icon(h, MailIcon, 'size-[18px]'),
      unread > 0
        ? h.span(
            [
              h.Key(`unread-${unread}`),
              h.Class(
                cn(
                  FIGURE,
                  'enter-badge absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[calc(10.5px*var(--type-scale))] font-medium shadow-raised',
                  waiting ? 'bg-danger text-white' : 'bg-primary-fill text-on-primary-fill',
                ),
              ),
            ],
            [String(unread)],
          )
        : h.empty,
    ],
  )
}

const row = (
  mail: Mail,
  open: boolean,
  folded: ReadonlyArray<Mail>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  if (mail.id === DIGEST_ID) return digestRow(mail, folded, open, h)
  const sender = senderOf(mail.sender)
  // The priority bar (18 "Pacing and volume"): danger while a clock runs, warn while a
  // decision waits. Noise wears none, because no clock and no question is running.
  const bar = barOf(mail)
  return h.li(
    [h.Key(String(mail.id))],
    [
      h.button(
        [
          h.Type('button'),
          h.AriaCurrent(open ? 'true' : 'false'),
          h.OnClick(Message.InboxChanged({ message: InboxMessage.Opened({ id: mail.id }) })),
          h.Class(
            cn(
              'relative flex w-full items-start gap-2.5 px-3.5 py-2 text-left',
              open ? 'bg-well' : 'hover:bg-well/50',
            ),
          ),
        ],
        [
          bar === null
            ? h.empty
            : h.span(
                [
                  h.Class(cn('absolute inset-y-0 left-0 w-[3px]', bar)),
                  h.Role('img'),
                  h.AriaLabel(t.inbox.priorities[priorityOf(mail)]),
                ],
                [],
              ),
          mail.read
            ? h.empty
            : h.span(
                [
                  h.Class('absolute top-[17px] left-1.5 size-1.5 rounded-full bg-primary-strong'),
                  h.Role('img'),
                  h.AriaLabel(t.inbox.unread),
                ],
                [],
              ),
          badge(sender, 'mt-px size-6', h),
          h.span(
            [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
            [
              h.span(
                [h.Class('flex items-baseline gap-2')],
                [
                  h.span(
                    [
                      h.Class(
                        cn(
                          'flex-1 truncate text-[calc(12.5px*var(--type-scale))]',
                          mail.read ? '' : 'font-semibold',
                        ),
                      ),
                    ],
                    [sender.name],
                  ),
                  // The kind label repeats the badge's shape and colour in words
                  // (18 "Colour code").
                  h.span([h.Class(cn(EYEBROW, 'shrink-0'))], [t.inbox.kinds[kindOf(mail)]]),
                  mail.entries.length > 1
                    ? h.span(
                        [
                          h.Class(
                            cn(
                              FIGURE,
                              'text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
                            ),
                          ),
                        ],
                        [`×${mail.entries.length}`],
                      )
                    : h.empty,
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [clock(mail.time)],
                  ),
                ],
              ),
              h.span(
                [
                  h.Class(
                    cn(
                      'truncate text-[calc(12px*var(--type-scale))]',
                      mail.read ? 'text-muted-foreground' : 'text-foreground/85',
                    ),
                  ),
                ],
                [subjectOf(h, mail)],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/** A thread the Digest folds, as one line that opens it. */
const digestLine = (mail: Mail, h: HtmlBuilder<Message>): Html => {
  const sender = senderOf(mail.sender)
  return h.li(
    [h.Key(`folded-${mail.id}`)],
    [
      h.button(
        [
          h.Type('button'),
          h.OnClick(Message.InboxChanged({ message: InboxMessage.Opened({ id: mail.id }) })),
          h.Class('flex w-full flex-col gap-0.5 px-3.5 py-2 text-left hover:bg-well/50'),
        ],
        [
          h.span(
            [h.Class('flex items-baseline gap-2')],
            [
              h.span(
                [h.Class('flex-1 truncate text-[calc(12.5px*var(--type-scale))]')],
                [sender.name],
              ),
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                  ),
                ],
                [clock(mail.time)],
              ),
            ],
          ),
          h.span(
            [h.Class('truncate text-[calc(12px*var(--type-scale))] text-foreground/85')],
            [subjectOf(h, mail)],
          ),
          h.span(
            [h.Class('truncate text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [gist(h, mail)],
          ),
        ],
      ),
    ],
  )
}

/** The Digest's row in the list: how many older threads it folds, and the newest of them. */
const digestRow = (
  mail: Mail,
  folded: ReadonlyArray<Mail>,
  open: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.li(
    [h.Key('digest')],
    [
      h.button(
        [
          h.Type('button'),
          h.AriaCurrent(open ? 'true' : 'false'),
          h.OnClick(Message.InboxChanged({ message: InboxMessage.Opened({ id: DIGEST_ID }) })),
          h.Class(
            cn(
              'relative flex w-full items-start gap-2.5 px-3.5 py-2 text-left',
              open ? 'bg-well' : 'hover:bg-well/50',
            ),
          ),
        ],
        [
          h.span(
            [h.Class('mt-px grid size-6 shrink-0 place-items-center text-muted-foreground')],
            [icon(h, Layers, 'size-4')],
          ),
          h.span(
            [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
            [
              h.span(
                [h.Class('flex items-baseline gap-2')],
                [
                  h.span(
                    [
                      h.Class(
                        cn(
                          'flex-1 truncate text-[calc(12.5px*var(--type-scale))]',
                          mail.read ? '' : 'font-semibold',
                        ),
                      ),
                    ],
                    [t.inbox.digest],
                  ),
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [`×${folded.length}`],
                  ),
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [clock(mail.time)],
                  ),
                ],
              ),
              h.span(
                [
                  h.Class(
                    cn(
                      'truncate text-[calc(12px*var(--type-scale))]',
                      mail.read ? 'text-muted-foreground' : 'text-foreground/85',
                    ),
                  ),
                ],
                [subjectOf(h, mail)],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/** A label chip: one Sender kind, and how much Mail in this folder it has (18 "The Inbox"). */
const labelChip = (
  label: MailLabel | null,
  text: string,
  count: number | null,
  active: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Key(`label-${label ?? 'all'}`),
      h.Type('button'),
      h.AriaCurrent(active ? 'true' : 'false'),
      h.OnClick(Message.InboxChanged({ message: InboxMessage.LabelChosen({ label }) })),
      h.Class(
        cn(
          'press flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[calc(11px*var(--type-scale))] whitespace-nowrap',
          active
            ? 'border-hairline bg-raised font-medium text-foreground shadow-raised'
            : 'border-foreground/15 text-muted-foreground hover:border-foreground/25 hover:text-foreground',
        ),
      ),
    ],
    [
      text,
      count === null
        ? h.empty
        : h.span([h.Class(cn(FIGURE, 'text-[calc(10px*var(--type-scale))]'))], [String(count)]),
    ],
  )

const folderTab = (
  folder: Folder,
  label: string,
  count: number,
  active: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Key(folder),
      h.Type('button'),
      h.AriaCurrent(active ? 'true' : 'false'),
      h.OnClick(Message.InboxChanged({ message: InboxMessage.FolderChosen({ folder }) })),
      h.Class(
        cn(
          'press flex h-6 items-center gap-1.5 rounded-lg px-2.5 text-[calc(12px*var(--type-scale))]',
          active
            ? 'bg-raised font-medium text-foreground shadow-raised'
            : 'text-muted-foreground hover:text-foreground',
        ),
      ),
    ],
    [
      label,
      count > 0
        ? h.span([h.Class(cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))]'))], [String(count)])
        : h.empty,
    ],
  )

const tool = (label: string, glyph: IconNode, message: Message, h: HtmlBuilder<Message>): Html =>
  button(
    {
      onClick: message,
      variant: 'ghost',
      size: 'icon-sm',
      className: 'text-muted-foreground',
      attributes: [h.AriaLabel(label), h.Title(label)],
    },
    icon(h, glyph, 'size-4'),
    h,
  )

/**
 * The Digest's reader (18 "Pacing and volume"): the threads it folded, each one a line that opens
 * the Mail it stands for. Nothing is answered here; the Digest is a shelf, not a letter.
 */
const digestLetter = (mail: Mail, folded: ReadonlyArray<Mail>, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.article(
    [h.Key('digest'), h.Class('flex min-h-0 flex-1 flex-col')],
    [
      h.div(
        [h.Class(cn('flex min-h-0 flex-1 flex-col gap-3 px-5 py-4', SCROLL))],
        [
          h.span([h.Class(EYEBROW)], [t.inbox.digest]),
          h.h2(
            [
              h.Class(
                'text-[calc(16px*var(--type-scale))] leading-snug font-semibold tracking-[-0.02em]',
              ),
            ],
            [subjectOf(h, mail)],
          ),
          h.p(
            [h.Class('text-[calc(12px*var(--type-scale))] leading-relaxed text-muted-foreground')],
            [t.inbox.moreThanEightThreadsWereUnread],
          ),
          h.ul(
            [
              h.Key('folded'),
              h.Class('flex flex-col divide-y divide-hairline border-y border-hairline'),
            ],
            folded.map((entry) => digestLine(entry, h)),
          ),
        ],
      ),
      h.div(
        [h.Class('flex items-center gap-2 border-t border-hairline bg-nested px-3 py-2')],
        [
          h.span(
            [h.Class('flex-1 text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [t.inbox.olderUpdates(folded.length)],
          ),
        ],
      ),
    ],
  )
}

const letter = (mail: Mail, folded: ReadonlyArray<Mail>, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  if (mail.id === DIGEST_ID) return digestLetter(mail, folded, h)
  const sender = senderOf(mail.sender)
  const threaded = mail.entries.length > 1
  // The second tell (18 "How to tell"): a real advisory names an id the Glossary lists, and a
  // fake one names an id it does not, so there is nothing here to open.
  const tell = advisoryTell(
    `${mail.subject}\n${mail.entries.map((entry) => entry.text).join('\n')}`,
  )
  const buttons =
    mail.phase._tag === 'Answered'
      ? [
          h.p(
            [h.Class('flex-1 text-[calc(12px*var(--type-scale))] text-muted-foreground')],
            [answerIn(t, { id: mail.phase.answerId, text: mail.phase.answer })],
          ),
        ]
      : mail.phase._tag !== 'Resolved'
        ? mail.actions.map((action, index) =>
            button(
              {
                onClick: Message.InboxChanged({
                  message: InboxMessage.Acted({ id: mail.id, action: action.id }),
                }),
                variant: action.id.startsWith('show') ? 'outline' : 'default',
                size: 'sm',
                // The hover names where the button really goes: a trap names an off-site address.
                attributes: [h.Key(action.id), h.Title(destinationIn(t, h, action))],
              },
              [
                actionLabelIn(t, action),
                Kbd({ className: 'ml-1 opacity-80' }, [String(index + 1)], h),
              ],
              h,
            ),
          )
        : []
  return h.article(
    [h.Key(String(mail.id)), h.Class('flex min-h-0 flex-1 flex-col')],
    [
      h.div(
        [h.Class(cn('flex min-h-0 flex-1 flex-col gap-3 px-5 py-4', SCROLL))],
        [
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              h.span([h.Class(EYEBROW)], [t.inbox.kinds[sender.kind]]),
              tell === null
                ? h.empty
                : button(
                    {
                      onClick: Message.GlossaryOpened({ id: tell.term }),
                      variant: 'ghost',
                      size: 'sm',
                      className: '-ml-1 h-6 px-1.5 text-muted-foreground',
                      attributes: [
                        h.Key(`glossary-${tell.id}`),
                        h.Title(t.inbox.opensTheGlossaryOnThisAdvisory),
                      ],
                    },
                    [icon(h, ShieldAlert, 'size-3.5'), tell.id, ' · ', t.inbox.inTheGlossary],
                    h,
                  ),
              mail.phase._tag === 'Resolved'
                ? h.span(
                    [
                      h.Class(
                        'flex items-center gap-1 text-[calc(11.5px*var(--type-scale))] font-medium text-ok',
                      ),
                    ],
                    [icon(h, CircleCheck, 'size-3.5'), t.inbox.resolved(clock(mail.phase.at))],
                  )
                : h.empty,
            ],
          ),
          h.h2(
            [
              h.Class(
                'text-[calc(16px*var(--type-scale))] leading-snug font-semibold tracking-[-0.02em]',
              ),
            ],
            [subjectOf(h, mail)],
          ),
          h.div(
            [h.Class('flex items-center gap-2.5')],
            [
              badge(sender, 'size-7', h),
              h.div(
                [h.Class('flex min-w-0 flex-col')],
                [
                  h.span(
                    [h.Class('truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
                    [sender.name],
                  ),
                  h.span(
                    [
                      h.Class(
                        cn(
                          FIGURE,
                          'truncate text-[calc(11px*var(--type-scale))] text-muted-foreground',
                        ),
                      ),
                    ],
                    [sender.address],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-3 text-[calc(13px*var(--type-scale))] leading-relaxed')],
            mail.entries.map((entry, index) =>
              h.div(
                [
                  h.Key(`entry-${index}`),
                  h.Class(
                    threaded
                      ? 'flex flex-col gap-0.5 border-l-2 border-hairline pl-3'
                      : 'flex flex-col',
                  ),
                ],
                [
                  threaded
                    ? h.span(
                        [
                          h.Class(
                            cn(
                              FIGURE,
                              'text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
                            ),
                          ),
                        ],
                        [clock(entry.time)],
                      )
                    : h.empty,
                  h.div(
                    [h.Class('flex flex-col gap-3 whitespace-pre-line')],
                    bodyOf(h, entry)
                      .split('\n\n')
                      .map((paragraph) => h.p([], [paragraph])),
                  ),
                ],
              ),
            ),
          ),
          h.p(
            [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [signOf(t, mail.sender, sender)],
          ),
        ],
      ),
      h.div(
        [h.Class('flex flex-wrap items-center gap-2 border-t border-hairline bg-nested px-3 py-2')],
        [
          ...buttons,
          h.span([h.Class('flex-1')], []),
          mail.trashed
            ? tool(
                t.inbox.moveToInboxE,
                ArchiveRestore,
                Message.InboxChanged({ message: InboxMessage.Restored({ id: mail.id }) }),
                h,
              )
            : h.span(
                [h.Class('flex items-center')],
                [
                  tool(
                    mail.spam ? t.inbox.notSpamS : t.inbox.reportSpamS,
                    mail.spam ? MailIcon : Ban,
                    Message.InboxChanged({ message: InboxMessage.MarkedSpam({ id: mail.id }) }),
                    h,
                  ),
                  tool(
                    t.inbox.deleteE,
                    Trash2,
                    Message.InboxChanged({ message: InboxMessage.Trashed({ id: mail.id }) }),
                    h,
                  ),
                ],
              ),
        ],
      ),
    ],
  )
}

const emptyOf = (t: Messages): Record<Folder, string> => ({
  action: t.inbox.nothingNeedsYou,
  fyi: t.inbox.noUpdates,
  spam: t.inbox.spamIsEmpty,
  trash: t.inbox.trashIsEmpty,
})

/** The Sandbox's stress bench: send any kind of Mail, one or many, without waiting for it. */
const generator = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Class(
        'flex flex-wrap items-end gap-2 border-t border-hairline bg-nested px-3 py-2 compact:gap-1.5',
      ),
    ],
    [
      nativeSelect(
        {
          id: 'mail-sample',
          label: t.inbox.sample,
          labelClass: 'sr-only',
          size: 'sm',
          value: model.board.inbox.sample,
          onChange: (id) => Message.InboxChanged({ message: InboxMessage.SampleChosen({ id }) }),
          wrapperClass: 'w-64',
          options: [...new Set(SAMPLES.map((sample) => sample.group))].map((group) =>
            nativeSelectOptGroup(
              { label: group },
              SAMPLES.filter((sample) => sample.group === group).map((sample) =>
                nativeSelectOption({ value: sample.id, label: sample.label }, h),
              ),
              h,
            ),
          ),
        },
        h,
      ),
      ...[1, 10, 50].map((count) =>
        button(
          {
            onClick: Message.InboxChanged({ message: InboxMessage.Generated({ count }) }),
            variant: count === 1 ? 'default' : 'outline',
            size: 'sm',
            attributes: [
              h.Key(`send-${count}`),
              ...(count === 1
                ? []
                : [h.AriaLabel(t.inbox.sendRandom(count)), h.Title(t.inbox.sendRandom(count))]),
            ],
          },
          count === 1 ? t.inbox.send : [icon(h, Dices, 'size-3.5'), `×${count}`],
          h,
        ),
      ),
      h.span([h.Class('flex-1')], []),
      button(
        {
          onClick: Message.InboxChanged({ message: InboxMessage.Resolved() }),
          variant: 'ghost',
          size: 'sm',
        },
        t.inbox.resolveThreads,
        h,
      ),
      button(
        {
          onClick: Message.InboxChanged({ message: InboxMessage.Cleared() }),
          variant: 'ghost',
          size: 'sm',
        },
        t.inbox.clear,
        h,
      ),
    ],
  )
}

/** A mail window docked above the corner button: the Board stays in view and clickable. */
export const inboxPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const newest = folderList(model.board.inbox)
  const folded = digestOf(model.board.inbox)
  const open = newest.find((mail) => mail.id === model.board.inbox.focus) ?? newest[0]
  const labels = labelsIn(model.board.inbox)
  return h.section(
    [
      h.Key('inbox-panel'),
      h.DataAttribute('exit', 'gesture'),
      h.AriaLabel(t.inbox.inbox),
      h.Class(
        `absolute right-3 bottom-[68px] z-30 flex h-[min(520px,calc(100%-96px))] w-[min(720px,calc(100%-24px))] flex-col overflow-hidden ${FLOAT} enter-panel compact:inset-x-2 compact:right-2 compact:bottom-[calc(max(8px,env(safe-area-inset-bottom))+136px)] compact:w-auto`,
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-2 px-3 py-2.5')],
        [
          h.div(
            [h.Class('flex gap-0.5 rounded-xl bg-well p-0.5 shadow-well')],
            [
              folderTab(
                'action',
                t.inbox.needsAction,
                openCount(model),
                model.board.inbox.folder === 'action',
                h,
              ),
              folderTab(
                'fyi',
                t.inbox.fYI,
                unreadIn(model, 'fyi'),
                model.board.inbox.folder === 'fyi',
                h,
              ),
              folderTab(
                'spam',
                t.inbox.spam,
                unreadIn(model, 'spam'),
                model.board.inbox.folder === 'spam',
                h,
              ),
              folderTab('trash', t.inbox.trash, 0, model.board.inbox.folder === 'trash', h),
            ],
          ),
          h.span([h.Class('flex-1')], []),
          has(model.board.game, 'spam-filter')
            ? h.button(
                [
                  h.Key('filter'),
                  h.Type('button'),
                  h.AriaPressed(model.board.inbox.filter ? 'true' : 'false'),
                  h.OnClick(Message.InboxChanged({ message: InboxMessage.FilterToggled() })),
                  h.Class(
                    cn(
                      'press flex h-6 items-center rounded-lg px-2.5 text-[calc(12px*var(--type-scale))]',
                      model.board.inbox.filter
                        ? 'bg-raised text-foreground shadow-raised'
                        : 'text-muted-foreground',
                    ),
                  ),
                ],
                [model.board.inbox.filter ? 'Spam filter on' : 'Spam filter off'],
              )
            : h.empty,
          Kbd.group({}, [Kbd({}, ['J'], h), Kbd({}, ['K'], h)], h),
          Kbd({}, [t.inbox.esc], h),
          button(
            {
              onClick: Message.PanelClosed(),
              variant: 'ghost',
              size: 'icon-sm',
              className: 'text-muted-foreground',
              attributes: [h.AriaLabel(t.inbox.closeEsc)],
            },
            icon(h, X, 'size-3.5'),
            h,
          ),
        ],
      ),
      boardSandbox(model.board) ? generator(model, h) : h.empty,
      h.div(
        [
          h.Class(
            cn(
              'grid min-h-0 flex-1 grid-cols-[264px_minmax(0,1fr)] border-t border-hairline compact:grid-cols-1 compact:grid-rows-[minmax(0,1fr)_minmax(0,1.3fr)]',
            ),
          ),
        ],
        [
          h.div(
            [
              h.Class(
                'flex min-h-0 flex-col border-r border-hairline compact:border-r-0 compact:border-b',
              ),
            ],
            [
              // The labels are the filter chips above the list (18 "The Inbox").
              h.div(
                [
                  h.AriaLabel(t.inbox.labels),
                  h.Class(
                    'flex flex-nowrap gap-1.5 overflow-x-auto border-b border-hairline px-3 py-2',
                  ),
                ],
                [
                  labelChip(null, t.inbox.all, null, model.board.inbox.label === null, h),
                  ...labels.map((entry) =>
                    labelChip(
                      entry.label,
                      t.inbox.kinds[entry.label],
                      entry.count,
                      model.board.inbox.label === entry.label,
                      h,
                    ),
                  ),
                ],
              ),
              h.ul(
                [
                  h.AriaLabel(t.inbox.mail),
                  h.Class(cn('flex flex-col divide-y divide-hairline', SCROLL)),
                ],
                newest.length === 0
                  ? [
                      h.li(
                        [
                          h.Class(
                            'px-4 py-4 text-[calc(12.5px*var(--type-scale))] text-muted-foreground',
                          ),
                        ],
                        [
                          model.board.inbox.label === null
                            ? emptyOf(t)[model.board.inbox.folder]
                            : t.inbox.noMailWithThatLabelHere,
                        ],
                      ),
                    ]
                  : newest.map((mail) => row(mail, mail.id === open?.id, folded, h)),
              ),
            ],
          ),
          h.div([h.Class('flex min-h-0 min-w-0 flex-col')], open ? [letter(open, folded, h)] : []),
        ],
      ),
    ],
  )
}
