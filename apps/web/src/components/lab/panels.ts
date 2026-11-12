import { Effect, Option } from 'effect'
import { Mount } from 'foldkit'
import { type Messages, copy, eraWords, localized } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowUpRight,
  Command,
  Copy,
  DoorOpen,
  Download,
  House,
  KeyRound,
  Lock,
  LogOut,
  Play,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide'
import { offer } from '@quorum/simulation/actions'
import { PRE_IPO_STAGE } from '@quorum/simulation/ipo'
import { INCIDENT_IDS } from '@quorum/simulation/catalog'
import { eraOf, isFinalEra, nextEra } from '@quorum/simulation/lookups'
import { cheatCash, cheatInsight } from '@/game/cheats.ts'
import { clock, compact, money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import {
  currentFile,
  exitLegacy,
  playingId,
  roomCode,
  roomLive,
  type Model,
  type SettingsSection,
  type Tone,
} from '@/game/model.ts'
import { seatColour } from '@/game/seat-colour.ts'
import type { Vote } from '@quorum/simulation/room'
import { companyMark } from '@/components/company-mark.ts'
import { speedsOf } from '@/game/update.ts'
import { modShortcut } from '@/game/palette.ts'
import { roomOwner } from '@/game/model.ts'
import { ROOM_NAME_LENGTH } from '@/game/names.ts'
import { RoomPhase } from '@/game/room-machine.ts'
import { seatOf } from '@/platform/room-socket.ts'
import { agentRoomId } from '@/game/agent-room.ts'
import type { IconNode } from 'lucide'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { Kbd } from '@quorum/ui/primitives/kbd'
import { switch_ } from '@quorum/ui/primitives/switch'
import * as VolumeSlider from '@quorum/ui/primitives/slider'
import { cn } from '@/lib/utils'
import { settingsSections, type Setting } from '@/game/settings.ts'
import { KEY_FIELD_MAX, canPlayOnline, keyNote } from '@/game/access.ts'
import { KeyPhase } from '@/game/key-machine.ts'
import { languagePicker } from '@/i18n/picker.ts'
import { EYEBROW, FIGURE, FLOAT, NESTED, SCROLL, WELL } from '@quorum/ui/game/bits'

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Opens with focus inside the panel, keeps Tab in it, and hands focus back on close. A Scene test
 *  resolves it by hand. */
export const PanelFocus = Mount.define('PanelFocus', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const panel = element as HTMLElement
        const before = document.activeElement instanceof HTMLElement ? document.activeElement : null
        panel.focus()
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key !== 'Tab') return
          const items = [...panel.querySelectorAll<HTMLElement>(focusable)]
          const first = items[0]
          const last = items[items.length - 1]
          if (first === undefined || last === undefined) return
          if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === panel)
          ) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
        panel.addEventListener('keydown', onKeyDown)
        return () => {
          panel.removeEventListener('keydown', onKeyDown)
          // A panel that opens another one leaves focus where the new panel put it.
          if (panel.contains(document.activeElement) || document.activeElement === document.body)
            before?.focus()
        }
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.Synced())),
})

export const shell = (
  title: string,
  right: ReadonlyArray<Html>,
  body: ReadonlyArray<Html>,
  width: string,
  h: HtmlBuilder<Message>,
) => {
  const t = copy(h)
  return h.div(
    [
      h.DataAttribute('exit', 'gesture'),
      h.Class(
        'modal-overlay absolute inset-0 z-30 grid place-items-center p-6 compact:p-0 short:[[data-toast=on]_&]:pt-12!',
      ),
    ],
    [
      h.div(
        [
          h.Key(title),
          h.Role('dialog'),
          h.AriaModal(true),
          h.AriaLabel(title),
          h.Tabindex(-1),
          h.OnMount(PanelFocus()),
          h.Class(
            `flex max-h-full w-full flex-col overflow-hidden outline-none compact:h-full compact:max-h-none compact:max-w-none compact:rounded-none compact:pb-[env(safe-area-inset-bottom)] compact:shadow-none ${width} ${FLOAT} enter-modal`,
          ),
        ],
        [
          h.div(
            [
              h.Class(
                'flex items-center justify-between gap-4 px-5 pt-4 pb-3 compact:px-4 compact:pt-[max(12px,env(safe-area-inset-top))]',
              ),
            ],
            [
              h.span(
                [h.Class('text-[calc(17px*var(--type-scale))] font-semibold tracking-[-0.025em]')],
                [title],
              ),
              h.div(
                [h.Class('flex items-center gap-3')],
                [
                  ...right,
                  button(
                    {
                      onClick: Message.PanelClosed(),
                      variant: 'ghost',
                      size: 'icon',
                      className: 'text-muted-foreground compact:size-11',
                      attributes: [h.AriaLabel(t.panels.closeEsc)],
                    },
                    icon(h, X, 'size-4'),
                    h,
                  ),
                ],
              ),
            ],
          ),
          ...body,
        ],
      ),
    ],
  )
}

const primaryButton = (label: string, message: Message, h: HtmlBuilder<Message>) =>
  button({ onClick: message, size: 'lg', className: 'px-4' }, label, h)

const secondaryButton = (
  label: string,
  message: Message,
  h: HtmlBuilder<Message>,
  glyph?: Parameters<typeof icon>[1],
) =>
  button(
    { onClick: message, variant: 'outline', size: 'lg', className: 'px-3.5' },
    [...(glyph ? [icon(h, glyph, 'size-4')] : []), label],
    h,
  )

const agentRoomRow = (model: Model, h: HtmlBuilder<Message>) => {
  const t = copy(h)
  const company = playingId(model)
  const id = company === null ? null : agentRoomId(company)
  if (id === null) return h.empty
  return h.div(
    [h.Class('flex flex-col gap-2 px-4 py-2.5')],
    [
      h.span([h.Class(EYEBROW)], [t.panels.agentRoom]),
      h.div(
        [h.Class('flex items-center gap-2')],
        [
          h.code([h.Class('min-w-0 flex-1 truncate font-mono text-xs')], [id]),
          secondaryButton(t.panels.copyAgentRoom, Message.AgentRoomCopied(), h, Copy),
        ],
      ),
    ],
  )
}

const footer = (children: ReadonlyArray<Html>, h: HtmlBuilder<Message>) =>
  h.div([h.Class('flex justify-end gap-2 border-t border-hairline bg-nested px-5 py-3')], children)

const stat = (name: string, value: string, h: HtmlBuilder<Message>) =>
  h.div(
    [h.Key(name), h.Class('flex flex-col gap-1 px-4 py-3')],
    [
      h.span([h.Class(EYEBROW)], [name]),
      h.span([h.Class(cn(FIGURE, 'text-[calc(18px*var(--type-scale))]'))], [value]),
    ],
  )

const stats = (columns: string, children: ReadonlyArray<Html>, h: HtmlBuilder<Message>) =>
  h.div([h.Class(cn('grid w-full divide-x divide-hairline', WELL, columns))], children)

const stepsOf = (t: Messages): ReadonlyArray<readonly [string, string]> => [
  [t.panels.wireIt, t.panels.dragFromANodeSBlue],
  [t.panels.collect, t.panels.revenueWaitsInPaymentsPressCollect],
  [t.panels.learn, t.panels.analyticsSamplesLinkedNodesEachRequest],
  [t.panels.findTheLimit, t.panels.thePulsingOutlineMarksTheBottleneck],
  [t.panels.grow, t.panels.usersGrowWhileApdexBeatsThe],
  [t.panels.raise, t.panels.atTheUserTargetTakeOr],
]

type KeyGroup = readonly [label: string, rows: ReadonlyArray<readonly [string, string]>]

const keyGroupsOf = (t: Messages, easyMode: boolean): ReadonlyArray<KeyGroup> => [
  [
    t.panels.keysBuild,
    [
      ['1–7', t.panels.buildGroup],
      [t.panels.enter, t.panels.inspectorPlaceConfirm],
    ],
  ],
  [
    t.panels.keysClock,
    [
      ['Z', t.panels.undo],
      [t.panels.shiftZ, t.panels.redo],
      ['C', t.panels.collect],
      ...(easyMode
        ? [['S', t.panels.speed] as const, [t.panels.space, t.panels.pause] as const]
        : []),
      ['M', t.panels.mute],
      ['F', t.panels.fullscreen],
      [t.panels.shiftT, t.panels.tidyByRole],
      [t.panels.shiftF, t.panels.fitTheBoard],
    ],
  ],
  [
    t.panels.keysSelect,
    [
      ['L', t.panels.linkTheSelectedNode],
      [t.panels.arrows, t.panels.selectNearestNode],
      [t.panels.shiftArrows, t.panels.nudgeNodes16Px],
      ['U', t.panels.resizeSelected],
      [t.panels.shiftClick, t.panels.selectForAPlaybook],
      ['Ctrl+A', t.panels.selectAll],
      [t.panels.ctrlCXV, t.panels.copyCutPasteNodes],
      ['Ctrl+D', t.panels.duplicateNodes],
      [t.panels.shiftCtrlAltDrag, t.panels.addToRemoveFromSelection],
      [t.panels.del, t.panels.sellSelected],
    ],
  ],
  [
    t.panels.keysPanels,
    [
      ['R', t.panels.research],
      ['T', t.panels.team],
      ['P', t.panels.playbooks],
      ['D', t.panels.dashboard],
      ['I', t.panels.inbox],
      ['$', t.panels.cost],
      ['`', t.panels.developerPanel],
      [modShortcut('K'), t.palette.title],
      [t.panels.esc, t.panels.backOutThenMenu],
    ],
  ],
]

/** Each keys column keeps its own vertical rule; the layout folds to two, then one. */
const keyColumnRule = (index: number): string =>
  index === 0
    ? ''
    : index === 1
      ? 'border-l border-hairline compact:border-l-0 compact:border-t'
      : 'border-l border-hairline max-[1000px]:border-t max-[1000px]:border-l-0 compact:border-l-0'

const keyRow = ([key, action]: readonly [string, string], h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Key(action),
      h.Class(
        'flex items-center justify-between gap-3 py-0.5 text-[calc(12px*var(--type-scale))] leading-snug',
      ),
    ],
    [
      h.span([h.Class('text-muted-foreground')], [action]),
      Kbd({ className: 'shrink-0' }, [key], h),
    ],
  )

const stepCell = (
  [title, body]: readonly [string, string],
  index: number,
  h: HtmlBuilder<Message>,
): Html => {
  const first = index === 0
  return h.li(
    [
      h.Key(title),
      h.Class(
        cn(
          'flex flex-col px-4 py-2.5',
          first
            ? 'bg-primary-fill text-on-primary-fill dark:bg-raised dark:text-foreground'
            : 'bg-surface',
        ),
      ),
    ],
    [
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'text-[calc(23px*var(--type-scale))] leading-none font-medium tracking-[-0.05em]',
              first
                ? 'text-on-primary-fill dark:text-muted-foreground'
                : 'text-muted-foreground/55',
            ),
          ),
        ],
        [String(index + 1).padStart(2, '0')],
      ),
      h.span(
        [h.Class('mt-2 text-[calc(15px*var(--type-scale))] font-semibold tracking-[-0.02em]')],
        [title],
      ),
      h.span(
        [
          h.Class(
            cn(
              'mt-1 text-[calc(12px*var(--type-scale))] leading-relaxed',
              first
                ? 'text-on-primary-fill/70 dark:text-muted-foreground'
                : 'text-muted-foreground',
            ),
          ),
        ],
        [body],
      ),
    ],
  )
}

export const helpPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const groups = keyGroupsOf(t, model.prefs.easyMode)
  const columns = [groups.slice(0, 2), groups.slice(2, 3), groups.slice(3)]
  return shell(
    t.panels.howToPlay,
    [],
    [
      h.div(
        [h.Class(`flex min-h-0 flex-col gap-3 px-5 pt-1 pb-4 compact:gap-4 ${SCROLL}`)],
        [
          h.ol(
            [
              h.Class(
                'grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-xl bg-hairline shadow-[inset_0_0_0_1px_var(--hairline-soft)] max-[1000px]:grid-cols-2 compact:grid-cols-1',
              ),
            ],
            stepsOf(t).map((step, index) => stepCell(step, index, h)),
          ),
          h.section(
            [h.Class('flex shrink-0 flex-col gap-1.5')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.keys]),
              h.div(
                [
                  h.Class(
                    'grid grid-cols-3 overflow-hidden rounded-xl bg-nested shadow-[inset_0_0_0_1px_var(--hairline-soft)] max-[1000px]:grid-cols-2 compact:grid-cols-1',
                  ),
                ],
                columns.map((columnGroups, index) =>
                  h.div(
                    [h.Class(cn('flex flex-col gap-2.5 p-2', keyColumnRule(index)))],
                    columnGroups.map(([label, rows]) =>
                      h.div(
                        [h.Key(label), h.Class('flex flex-col')],
                        [
                          h.span([h.Class(EYEBROW)], [label]),
                          h.div(
                            [h.Class('mt-0.5 divide-y divide-hairline')],
                            rows.map((row) => keyRow(row, h)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      footer([primaryButton(t.panels.startBuilding, Message.PanelClosed(), h)], h),
    ],
    'max-w-[1040px]',
    h,
  )
}

const menuItem = (
  label: string,
  glyph: Parameters<typeof icon>[1],
  message: Message,
  h: HtmlBuilder<Message>,
  variant: 'default' | 'outline' | 'ghost' = 'outline',
  trailing?: Html,
) =>
  button(
    {
      onClick: message,
      variant,
      size: 'lg',
      className: cn('h-10 w-full justify-start gap-2.5 px-3', trailing === undefined ? '' : 'pr-2'),
      attributes: [h.Key(label)],
    },
    [
      icon(h, glyph, 'size-[18px] shrink-0'),
      h.span([h.Class('min-w-0 flex-1 truncate text-left')], [label]),
      ...(trailing === undefined ? [] : [trailing]),
    ],
    h,
  )

/** The game menu over the board. The clock holds still while it is open. */
export const menuPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const file = currentFile(model)
  const rule = h.div([h.Class('my-1 border-t border-hairline')], [])
  return shell(
    t.panels.menu,
    [],
    [
      ...(file
        ? [
            h.div(
              [h.Class('flex items-center gap-3 px-5 pb-4')],
              [
                companyMark(file.logo, 'size-8 shrink-0', h),
                h.div(
                  [h.Class('flex min-w-0 flex-col gap-0.5')],
                  [
                    h.span(
                      [h.Class('truncate text-[calc(15px*var(--type-scale))] font-semibold')],
                      [file.name],
                    ),
                    h.span(
                      [h.Class('truncate text-xs text-muted-foreground')],
                      [
                        `${t.catalog.ventures[file.venture].name} · ${eraWords(t, model.board.game).name}`,
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ]
        : []),
      h.div(
        [h.Class('flex flex-col gap-2 border-t border-hairline px-5 pt-4 pb-5')],
        [
          menuItem(
            t.panels.resume,
            Play,
            Message.PanelClosed(),
            h,
            'default',
            Kbd({ className: 'shrink-0' }, [t.panels.esc], h),
          ),
          rule,
          menuItem(
            t.palette.title,
            Command,
            Message.PaletteOpened(),
            h,
            'outline',
            Kbd({ className: 'shrink-0' }, [modShortcut('K')], h),
          ),
          menuItem(t.panels.settings, Settings, Message.PanelOpened({ panel: 'settings' }), h),
          menuItem(
            roomCode(model) === null ? t.room.title : `${t.room.title} · ${roomCode(model)}`,
            Users,
            Message.PanelOpened({ panel: 'room' }),
            h,
          ),
          rule,
          exitLegacy(model) === null
            ? h.empty
            : menuItem(t.panels.exitCompany, DoorOpen, Message.PanelOpened({ panel: 'exit' }), h),
          menuItem(t.panels.titleScreen, House, Message.TitleOpened(), h, 'ghost'),
        ],
      ),
    ],
    'max-w-[calc(340px*var(--type-scale))]',
    h,
  )
}

const VOTE_TITLE = { fund: 'voteFund', decline: 'voteDecline', exit: 'voteExit' } as const

/** One open vote: the count, a dot per Seat, and the two ballots. */
const voteCard = (model: Model, open: Vote, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const seat = seatOf()
  const mine = open.yes.includes(seat) ? 'yes' : open.no.includes(seat) ? 'no' : null
  return h.div(
    [h.Class(cn(WELL, 'flex flex-col gap-2.5 p-3'))],
    [
      h.div(
        [h.Class('flex items-baseline justify-between gap-3')],
        [
          h.span([h.Class('text-sm font-medium')], [t.room[VOTE_TITLE[open.kind]]]),
          h.span(
            [h.Class(cn(FIGURE, 'text-xs text-muted-foreground'))],
            [`${open.yes.length} / ${model.room.seats.length}`],
          ),
        ],
      ),
      h.div(
        [h.Class('flex items-center gap-1.5')],
        model.room.seats.map((entry) => {
          const colour = seatColour(entry.colour)
          const yes = open.yes.includes(entry.id)
          const no = open.no.includes(entry.id)
          return h.span(
            [
              h.Key(`ballot-${entry.id}`),
              h.Class('size-2 rounded-full'),
              h.Style({
                // A yes is filled, a no is a ring, and a Seat that has not voted is faint.
                background: no ? 'transparent' : colour,
                boxShadow: no ? `inset 0 0 0 1px ${colour}` : 'none',
                opacity: yes || no ? '1' : '0.3',
              }),
            ],
            [],
          )
        }),
      ),
      h.div(
        [h.Class('flex gap-2')],
        [
          button(
            {
              onClick: Message.RoomBallot({ vote: open.id, yes: true }),
              variant: mine === 'yes' ? 'default' : 'outline',
              size: 'lg',
              className: 'flex-1',
            },
            t.room.coins,
            h,
          ),
          button(
            {
              onClick: Message.RoomBallot({ vote: open.id, yes: false }),
              variant: mine === 'no' ? 'secondary' : 'outline',
              size: 'lg',
              className: 'flex-1',
            },
            t.room.no,
            h,
          ),
        ],
      ),
    ],
  )
}
/** The Room: the code, the Seats, the name, the vote, the speed, and the way out. */
export const roomPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const phase = model.room.phase
  const file = currentFile(model)
  const owner = roomOwner(model)
  const live = RoomPhase.isAnyOf(['Online', 'Reconnecting'])(phase)
  const vote = model.room.vote
  const seat = seatOf()
  const unchanged = model.room.draft.trim() === model.room.name

  const section = (label: string, rows: ReadonlyArray<Html>) =>
    h.div(
      [h.Class('flex flex-col gap-2.5 px-5 pt-4')],
      [h.span([h.Class(EYEBROW)], [label]), ...rows],
    )

  const divider = () => h.div([h.Class('mx-5 mt-2.5 border-t border-hairline')], [])

  const codeBlock = (code: string) =>
    h.div(
      [h.Class('flex flex-col gap-1.5 px-5 pt-3')],
      [
        h.span([h.Class(EYEBROW)], [t.room.code]),
        h.div(
          [h.Class('flex items-center justify-between gap-3')],
          [
            h.span(
              [
                h.Class(
                  cn(FIGURE, 'text-[calc(20px*var(--type-scale))] font-medium tracking-[0.16em]'),
                ),
              ],
              [code],
            ),
            button(
              {
                onClick: Message.RoomLinkCopied(),
                variant: 'outline',
                size: 'sm',
                className: 'gap-1.5',
                attributes: [h.AriaLabel(t.room.copyLink)],
              },
              [icon(h, Copy, 'size-3.5'), t.room.copyLink],
              h,
            ),
          ],
        ),
      ],
    )

  const nameBlock = h.div(
    [h.Class('flex items-center gap-2 px-5 pt-3')],
    [
      h.label(
        [h.Class(cn(WELL, 'flex h-9 min-w-0 flex-1 items-center px-2.5'))],
        [
          h.input([
            h.Type('text'),
            h.Value(model.room.draft),
            h.Maxlength(ROOM_NAME_LENGTH),
            h.Autocomplete('off'),
            h.Spellcheck(false),
            h.AriaLabel(t.room.yourName),
            h.OnInput((name) => Message.RoomNameChanged({ name })),
            h.OnKeyDownPreventDefault((key) =>
              key === 'Enter' ? Option.some(Message.RoomNameSaved()) : Option.none(),
            ),
            h.Class('w-full min-w-0 bg-transparent text-sm outline-none'),
          ]),
        ],
      ),
      button(
        {
          onClick: Message.RoomNameSaved(),
          variant: unchanged ? 'outline' : 'default',
          size: 'lg',
          isDisabled: unchanged,
        },
        t.room.saveName,
        h,
      ),
    ],
  )

  const seatChips = h.div(
    [h.Class('flex flex-wrap gap-1.5')],
    model.room.seats.map((entry) => {
      const colour = seatColour(entry.colour)
      return h.div(
        [
          h.Key(entry.id),
          h.Class(
            'flex min-w-0 items-center gap-1.5 rounded-full bg-foreground/[0.05] py-1 pr-1.5 pl-2 text-xs',
          ),
        ],
        [
          h.span([h.Class('size-1.5 shrink-0 rounded-full'), h.Style({ background: colour })], []),
          h.span([h.Class('min-w-0 max-w-36 truncate font-medium')], [entry.name]),
          entry.owner
            ? h.span(
                [
                  h.Class(
                    'shrink-0 text-[calc(10px*var(--type-scale))] uppercase tracking-[0.08em] text-muted-foreground',
                  ),
                ],
                [t.room.owner],
              )
            : h.empty,
          entry.id === seat
            ? h.span([h.Class('shrink-0 text-muted-foreground')], [t.room.you])
            : h.empty,
          owner && !entry.owner
            ? button(
                {
                  onClick: Message.RoomKickAsked({ seat: entry.id }),
                  variant: 'ghost',
                  size: 'icon-xs',
                  className: 'size-5 text-muted-foreground',
                  attributes: [h.AriaLabel(t.room.kick)],
                },
                icon(h, X, 'size-3'),
                h,
              )
            : h.empty,
        ],
      )
    }),
  )

  const voteStart = h.div(
    [h.Class('flex gap-2')],
    [
      button(
        {
          onClick: Message.RoomVoteAsked({ kind: 'fund' }),
          variant: 'outline',
          size: 'lg',
          className: 'min-w-0 flex-1 gap-1.5 px-2',
        },
        [icon(h, ArrowUpRight, 'size-4'), t.room.voteFund],
        h,
      ),
      button(
        {
          onClick: Message.RoomVoteAsked({ kind: 'exit' }),
          variant: 'outline',
          size: 'lg',
          className: 'min-w-0 flex-1 gap-1.5 px-2',
        },
        [icon(h, DoorOpen, 'size-4'), t.room.voteExit],
        h,
      ),
    ],
  )

  const speedRow = h.div(
    [h.Class('flex gap-1.5')],
    [0.5, 1, 3, 10].map((speed) =>
      button(
        {
          onClick: Message.RoomSpeedChosen({ value: speed }),
          variant: model.room.speed === speed ? 'default' : 'outline',
          size: 'lg',
          className: cn(FIGURE, 'flex-1'),
        },
        `${speed}×`,
        h,
      ),
    ),
  )

  const body: Array<Html> = []

  if (RoomPhase.isAnyOf(['Idle', 'Closed'])(phase)) {
    // A key that was turned off stops a Room here as well as at the API Worker.
    const allowed = canPlayOnline(model)
    body.push(h.p([h.Class('px-5 pt-4 text-sm text-muted-foreground')], [t.room.onlineHint]))
    if (file !== null && !allowed)
      body.push(
        h.div(
          [h.Class('flex flex-col gap-2 px-5 pt-4')],
          [
            h.p(
              [h.Class('flex items-start gap-2 text-sm text-muted-foreground')],
              [icon(h, Lock, 'mt-0.5 size-4 shrink-0'), t.room.needsKey],
            ),
            button(
              {
                onClick: Message.FeatureKeyAsked(),
                variant: 'outline',
                size: 'lg',
                className: 'w-full justify-start gap-2.5',
              },
              [icon(h, KeyRound, 'size-4'), t.panels.featureKey],
              h,
            ),
          ],
        ),
      )
    if (file !== null && allowed)
      body.push(
        h.div(
          [h.Class('px-5 pt-4')],
          [
            button(
              {
                onClick: Message.RoomPublishAsked(),
                size: 'lg',
                className: 'w-full justify-start gap-2.5',
              },
              [
                icon(h, Play, 'size-4'),
                file.online === null ? t.room.online : `${t.room.code} ${file.online.code}`,
              ],
              h,
            ),
            h.p([h.Class('pt-2 text-xs text-muted-foreground')], [t.room.joinHint]),
          ],
        ),
      )
    if (RoomPhase.guards.Closed(phase))
      body.push(h.p([h.Class('px-5 pt-3 text-sm text-muted-foreground')], [t.room.ended]))
  } else {
    if (RoomPhase.guards.Connecting(phase))
      body.push(h.p([h.Class('px-5 pt-4 text-sm text-muted-foreground')], [t.room.joining]))
    body.push(codeBlock(phase.code))
    body.push(nameBlock)
    if (live) {
      if (RoomPhase.guards.Reconnecting(phase))
        body.push(h.p([h.Class('px-5 pt-3 text-xs text-muted-foreground')], [t.room.connecting]))
      body.push(divider())
      body.push(section(`${t.room.seats} · ${model.room.seats.length}`, [seatChips]))
      body.push(divider())
      body.push(section(t.room.vote, vote === null ? [voteStart] : [voteCard(model, vote, h)]))
      if (owner) {
        body.push(divider())
        body.push(section(t.room.speed, [speedRow]))
      }
    }
  }

  const actions: Array<Html> = []
  if (live && owner) {
    actions.push(primaryButton(t.room.takeOffline, Message.RoomTakeOfflineAsked(), h))
    actions.push(secondaryButton(t.room.leave, Message.RoomLeaveAsked(), h, LogOut))
  } else if (live || RoomPhase.guards.Connecting(phase)) {
    actions.push(primaryButton(t.room.leave, Message.RoomLeaveAsked(), h))
  }

  return shell(
    t.room.title,
    [],
    [
      // A Room with four Seats and a vote runs past a short window, so the rows
      // scroll and the actions stay in reach.
      h.div([h.Class(`flex min-h-0 flex-col overflow-y-auto pb-4 ${SCROLL}`)], body),
      actions.length === 0 ? h.empty : footer(actions, h),
    ],
    'max-w-[calc(380px*var(--type-scale))]',
    h,
  )
}

/** One labeled group of settings: the label, then a card whose rows divide. */
const settingSection = (label: string, rows: ReadonlyArray<Html>, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex flex-col gap-2')],
    [
      h.span([h.Class(EYEBROW)], [label]),
      h.div([h.Class(cn(NESTED, 'flex flex-col divide-y divide-hairline overflow-hidden'))], rows),
    ],
  )

/** A setting's name on the left, its control on the right. */
const settingLabelClass = 'text-[calc(13px*var(--type-scale))] font-medium leading-snug'
const settingRowClass = 'w-full flex-row-reverse items-center justify-between gap-4 px-4 py-2.5'

const settingSwitch = (
  config: Readonly<{ id: string; label: string; isChecked: boolean; onToggle: () => Message }>,
  h: HtmlBuilder<Message>,
): Html =>
  switch_(
    {
      ...config,
      wrapperClass: settingRowClass,
      textClass: 'min-w-0 flex-1',
      labelClass: settingLabelClass,
    },
    h,
  )

/** The sound level. The slider rests while muted, and the row below it turns sound back on. */
const volumeRow = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('px-4 py-2.5')],
    [
      h.submodel({
        slotId: 'volume',
        model: model.volumeSlider,
        view: VolumeSlider.view,
        toParentMessage: (message) => Message.VolumeSliderChanged({ message }),
        viewInputs: VolumeSlider.styledViewInputs(
          {
            value: model.prefs.volume,
            label: t.panels.volume,
            formatValue: (value) => `${value}%`,
            isDisabled: model.prefs.muted,
            rowClass: 'gap-2',
          },
          h,
        ),
      }),
    ],
  )
}

const languageRow = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('flex items-center justify-between gap-4 px-4 py-2.5')],
    [
      h.span([h.Class(settingLabelClass)], [t.panels.language]),
      languagePicker(model.prefs.locale, model.languagePicker, h),
    ],
  )
}

/** A row that leaves the panel: a link out, or an action that runs at once. */
const settingAction = (
  label: string,
  message: Message,
  glyph: IconNode,
  h: HtmlBuilder<Message>,
): Html =>
  button(
    {
      onClick: message,
      variant: 'ghost',
      size: 'lg',
      className: 'h-auto w-full justify-between gap-2.5 rounded-none px-4 py-2.5',
    },
    [
      h.span([h.Class(settingLabelClass)], [label]),
      icon(h, glyph, 'size-4 shrink-0 text-muted-foreground'),
    ],
    h,
  )

/** A status line reads its tone from what it says: a refusal warns, an active key confirms. */
const toneClass = (tone: Tone): string =>
  tone === 'ok'
    ? 'text-ok'
    : tone === 'warn'
      ? 'text-warn'
      : tone === 'danger'
        ? 'text-danger'
        : 'text-muted-foreground'

/**
 * The feature key: the field, the check, and what the key unlocks. The player keeps
 * the key, so removing it here only clears this browser.
 */
const featureKeyRow = (label: string, model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const note = keyNote(model, t)
  const checking = KeyPhase.guards.Checking(model.keyPhase)
  const canSubmit = !checking && model.keyDraft.trim() !== ''
  return h.div(
    [h.Class('flex flex-col gap-2 px-4 py-3')],
    [
      h.label([h.For('feature-key'), h.Class(settingLabelClass)], [label]),
      h.div(
        [h.Class('flex items-center gap-2')],
        [
          h.label(
            [h.Class(cn(WELL, 'flex h-9 min-w-0 flex-1 items-center px-2.5'))],
            [
              h.input([
                h.Id('feature-key'),
                h.Type('text'),
                h.Value(model.keyDraft),
                h.Maxlength(KEY_FIELD_MAX),
                h.Placeholder('XXXX-XXXX-XXXX-XXXX'),
                h.Autocomplete('off'),
                h.Autocapitalize('characters'),
                h.Spellcheck(false),
                h.AriaLabel(label),
                h.OnInput((value) => Message.KeyTyped({ value })),
                h.OnKeyDownPreventDefault((key) =>
                  key === 'Enter' && canSubmit
                    ? Option.some(Message.KeySubmitted())
                    : Option.none(),
                ),
                h.Class(
                  'w-full min-w-0 bg-transparent font-mono text-sm uppercase outline-none placeholder:text-muted-foreground/60 placeholder:normal-case',
                ),
              ]),
            ],
          ),
          button(
            {
              onClick: Message.KeySubmitted(),
              size: 'lg',
              isDisabled: !canSubmit,
              className: 'shrink-0',
            },
            checking ? t.panels.featureKeyChecking : t.panels.activateFeatureKey,
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-2')],
        [
          h.p([h.Class(`text-xs leading-snug ${toneClass(note.tone)}`)], [note.text]),
          model.access.key === null
            ? h.empty
            : button(
                {
                  onClick: Message.KeyCleared(),
                  variant: 'ghost',
                  size: 'xs',
                  className: 'text-muted-foreground',
                },
                t.panels.removeFeatureKey,
                h,
              ),
        ],
      ),
    ],
  )
}

/** One setting with the control this panel has for it: a switch, a slider, a picker, or a button. */
const settingRow = (setting: Setting, model: Model, h: HtmlBuilder<Message>): Html => {
  switch (setting.kind) {
    case 'volume':
      return volumeRow(model, h)
    case 'key':
      return featureKeyRow(setting.label, model, h)
    case 'toggle':
      return settingSwitch(
        {
          id: setting.id,
          label: setting.label,
          isChecked: setting.isOn,
          onToggle: () => setting.message,
        },
        h,
      )
    case 'language':
      return languageRow(model, h)
    case 'action':
      return settingAction(setting.label, setting.message, setting.glyph, h)
  }
}

export const settingsPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const sections = settingsSections(model, t)
  const section = (id: SettingsSection): Html => {
    const found = sections.find((entry) => entry.id === id)!
    // The Agent room id belongs beside the switch that opens the relay, and only on the board.
    const rows = found.rows.flatMap((row) =>
      row.kind === 'toggle' && row.id === 'agent-access' && model.prefs.agentAccess
        ? [settingRow(row, model, h), agentRoomRow(model, h)]
        : [settingRow(row, model, h)],
    )
    return settingSection(found.label, rows, h)
  }

  return shell(
    t.panels.settings,
    [],
    [
      h.div(
        [h.Class(`flex min-h-0 flex-col gap-4 px-5 pt-1 pb-5 ${SCROLL}`)],
        [
          // The slider takes the full width; the sections below split into two balanced columns.
          // A phone folds both columns back into one.
          section('sound'),
          h.div(
            [h.Class('grid grid-cols-2 items-start gap-x-5 gap-y-4 compact:grid-cols-1')],
            [
              h.div(
                [h.Class('flex flex-col gap-4 compact:contents')],
                [section('play'), section('display')],
              ),
              h.div(
                [h.Class('flex flex-col gap-4 compact:contents')],
                [section('access'), section('privacy'), section('save')],
              ),
            ],
          ),
        ],
      ),
    ],
    'max-w-[calc(760px*var(--type-scale))]',
    h,
  )
}

export const offerPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const deal = offer(model.board.game)
  if (!deal) return h.empty
  const ipo = model.board.game.stage === PRE_IPO_STAGE
  const title = ipo
    ? t.panels.iPO
    : t.panels.round(t.catalog.eras[model.board.game.stage + 1]?.name ?? deal.era.name)
  // A Room decides the round by vote, so the offer shows that vote while it is open.
  const vote =
    roomLive(model) && model.room.vote !== null && model.room.vote.kind !== 'exit'
      ? model.room.vote
      : null
  if (vote !== null)
    return shell(
      title,
      [],
      [h.div([h.Class('px-5 pt-1 pb-5')], [voteCard(model, vote, h)])],
      'max-w-[calc(420px*var(--type-scale))]',
      h,
    )
  return shell(
    title,
    [],
    [
      h.div(
        [h.Class('grid grid-cols-2 gap-3 px-5 pt-1 pb-5 narrow:grid-cols-1')],
        [
          h.div(
            [h.Class('flex flex-col gap-3 rounded-xl bg-raised p-4 shadow-raised')],
            [
              h.span(
                [h.Class('text-[calc(15px*var(--type-scale))] font-semibold')],
                [ipo ? t.panels.goPublic : t.panels.raise],
              ),
              h.div(
                [
                  h.Class(
                    'flex flex-1 flex-col gap-0.5 text-[calc(13px*var(--type-scale))] text-muted-foreground',
                  ),
                ],
                [
                  h.span([], [t.panels.cash(money(deal.grant))]),
                  h.span(
                    [],
                    [
                      t.panels.equity(
                        Math.round(model.board.game.equity * 100),
                        Math.round(model.board.game.equity * (1 - deal.dilution) * 100),
                      ),
                    ],
                  ),
                  h.span([], [ipo ? t.panels.quartersBegin : t.panels.fullGrowth]),
                ],
              ),
              primaryButton(ipo ? t.panels.goPublic : t.panels.raise, Message.RoundRaised(), h),
            ],
          ),
          ipo
            ? h.empty
            : h.div(
                [
                  h.Class(
                    'flex flex-col gap-3 rounded-xl bg-nested p-4 shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
                  ),
                ],
                [
                  h.span(
                    [h.Class('text-[calc(15px*var(--type-scale))] font-semibold')],
                    [t.panels.decline],
                  ),
                  h.div(
                    [
                      h.Class(
                        'flex flex-1 flex-col gap-0.5 text-[calc(13px*var(--type-scale))] text-muted-foreground',
                      ),
                    ],
                    [
                      h.span([], [t.panels.noCash]),
                      h.span([], [t.panels.equityStays(Math.round(model.board.game.equity * 100))]),
                      h.span([], [t.panels.growth07]),
                    ],
                  ),
                  secondaryButton(t.panels.decline, Message.RoundDeclined(), h),
                ],
              ),
        ],
      ),
    ],
    'max-w-[620px]',
    h,
  )
}

export const eraPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const era = localized(eraOf(model.board.game), eraWords(t, model.board.game))
  return shell(
    era.name,
    [],
    [
      h.div(
        [h.Class('stagger flex flex-col gap-4 px-5 pt-1 pb-5')],
        [
          h.img([
            h.Src(`/art/era-${Math.min(7, model.board.game.stage)}.svg`),
            h.Alt(''),
            h.Class('w-full max-w-[520px] self-center short:max-h-[20dvh] short:w-auto'),
          ]),
          h.span(
            [
              h.Class(
                'text-[calc(26px*var(--type-scale))] font-semibold leading-tight tracking-[-0.035em]',
              ),
            ],
            [era.question],
          ),
          h.p(
            [h.Class('text-[calc(14px*var(--type-scale))] leading-relaxed text-muted-foreground')],
            [era.arrivals],
          ),
          stats(
            'grid-cols-3',
            [
              stat(
                t.panels.nextRound,
                Number.isFinite(era.raiseAt) ? t.panels.users(compact(era.raiseAt)) : '—',
                h,
              ),
              stat(t.panels.apdexTarget, era.apdexTarget.toFixed(2), h),
              stat(t.panels.prices, `×${era.costIndex}`, h),
            ],
            h,
          ),
        ],
      ),
      footer([primaryButton(t.panels.continueText, Message.PanelClosed(), h)], h),
    ],
    'max-w-[620px]',
    h,
  )
}

export const endPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return shell(
    t.panels.iPO,
    [],
    [
      h.div(
        [
          h.Class(
            'flex flex-col items-center gap-5 px-8 pt-4 pb-8 compact:gap-3 compact:px-5 compact:pb-5',
          ),
        ],
        [
          h.img([
            h.Src('/art/hero.svg'),
            h.Alt(''),
            h.Class('w-full max-w-[520px] short:max-h-[30dvh] short:w-auto'),
          ]),
          h.span(
            [h.Class('text-[calc(30px*var(--type-scale))] font-semibold tracking-[-0.035em]')],
            [t.panels.theCompanyIsPublic],
          ),
          stats(
            'max-w-[640px] grid-cols-4 narrow:grid-cols-2 narrow:[&>:nth-child(n+3)]:border-t',
            [
              stat(t.panels.time, clock(model.board.game.time), h),
              stat(t.panels.users2, compact(model.board.game.users), h),
              stat(t.panels.earned, money(model.board.game.earned), h),
              stat(t.panels.equity2, `${Math.round(model.board.game.equity * 100)}%`, h),
            ],
            h,
          ),
          h.div(
            [h.Class('flex gap-2')],
            [primaryButton(t.panels.keepPlaying, Message.PanelClosed(), h)],
          ),
        ],
      ),
    ],
    'max-w-[760px]',
    h,
  )
}

export const devPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return shell(
    t.panels.developer,
    [],
    [
      h.div(
        [h.Class('flex flex-col gap-5 px-5 pt-1 pb-5')],
        [
          h.div(
            [h.Class('flex flex-col gap-2')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.speed]),
              h.div(
                [h.Class('flex gap-2')],
                speedsOf(model.board.game).map((speed) =>
                  button(
                    {
                      onClick: Message.SpeedChosen({ speed }),
                      variant: model.board.clock.speed === speed ? 'default' : 'outline',
                      size: 'lg',
                      className: cn(FIGURE, 'w-16'),
                      attributes: [h.Key(String(speed))],
                    },
                    `${speed}×`,
                    h,
                  ),
                ),
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-2')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.skipAhead]),
              h.div(
                [h.Class('flex flex-wrap gap-2')],
                [
                  nextEra(model.board.game) && !isFinalEra(model.board.game)
                    ? secondaryButton(
                        t.panels.skipTo(nextEra(model.board.game)?.name ?? ''),
                        Message.CheatRound(),
                        h,
                      )
                    : h.empty,
                  secondaryButton(`+${money(cheatCash(model.board.game))}`, Message.CheatCash(), h),
                  secondaryButton(
                    t.panels.insight(cheatInsight(model.board.game).toLocaleString('en-US')),
                    Message.CheatInsight(),
                    h,
                  ),
                  secondaryButton(t.panels.n20Legacy, Message.CheatLegacy(), h),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-2')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.startAnIncident]),
              h.div(
                [h.Class('flex flex-wrap gap-2')],
                INCIDENT_IDS.map((kind) =>
                  secondaryButton(
                    t.catalog.incidents[kind].name,
                    Message.IncidentForced({ kind }),
                    h,
                  ),
                ),
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-2')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.log]),
              h.div(
                [h.Class('flex flex-wrap gap-2')],
                [
                  secondaryButton(t.panels.exportLog, Message.LogExported(), h, Download),
                  secondaryButton(t.panels.clearLog, Message.LogCleared(), h, Trash2),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    'max-w-[640px]',
    h,
  )
}
