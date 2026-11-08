import { Option } from 'effect'
import { type Messages, copy, eraWords, localized } from '@/i18n/messages.ts'
import { PrefsMessage } from '@/game/prefs.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowUpRight,
  Copy,
  DoorOpen,
  Download,
  House,
  LogOut,
  Play,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide'
import { UrlRequest } from 'foldkit/navigation'
import { PRIVACY_URL } from '@/platform/analytics.ts'
import { offer } from '@quorum/simulation/actions'
import { PRE_IPO_STAGE } from '@quorum/simulation/ipo'
import { INCIDENT_IDS } from '@quorum/simulation/catalog'
import { eraOf, isFinalEra, nextEra } from '@quorum/simulation/lookups'
import { cheatCash, cheatInsight } from '@/game/cheats.ts'
import { clock, compact, money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { currentFile, exitLegacy, roomCode, type Model } from '@/game/model.ts'
import { companyMark } from '@/components/company-mark.ts'
import { speedsOf } from '@/game/update.ts'
import { roomOwner } from '@/game/model.ts'
import { ROOM_NAME_LENGTH } from '@/game/names.ts'
import { RoomPhase } from '@/game/room-machine.ts'
import { seatOf } from '@/platform/room-socket.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { Kbd } from '@quorum/ui/primitives/kbd'
import { switch_ } from '@quorum/ui/primitives/switch'
import * as VolumeSlider from '@quorum/ui/primitives/slider'
import { cn } from '@/lib/utils'
import { languagePicker } from '@/i18n/picker.ts'
import { EYEBROW, FIGURE, FLOAT, NESTED, SCROLL, WELL } from '@quorum/ui/game/bits'

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
        'absolute inset-0 z-30 grid place-items-center bg-foreground/10 p-6 backdrop-blur-[3px] enter-backdrop compact:p-3 compact:pt-[max(12px,env(safe-area-inset-top))] compact:pb-[max(12px,env(safe-area-inset-bottom))] short:[[data-toast=on]_&]:pt-12!',
      ),
    ],
    [
      h.div(
        [h.Class(`flex max-h-full w-full flex-col overflow-hidden ${width} ${FLOAT} enter-modal`)],
        [
          h.div(
            [h.Class('flex items-center justify-between gap-4 px-5 pt-4 pb-3')],
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
                      className: 'text-muted-foreground',
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

const keysOf = (t: Messages, easyMode: boolean): ReadonlyArray<readonly [string, string]> => [
  ['1–7', t.panels.buildGroup],
  [t.panels.enter, t.panels.inspectorPlaceConfirm],
  ['L', t.panels.linkTheSelectedNode],
  [t.panels.shiftT, t.panels.tidyByZone],
  [t.panels.shiftF, t.panels.fitTheBoard],
  ['R', t.panels.research],
  ['T', t.panels.team],
  ['P', t.panels.playbooks],
  [t.panels.shiftClick, t.panels.selectForAPlaybook],
  ['Ctrl+A', t.panels.selectAll],
  [t.panels.ctrlCXV, t.panels.copyCutPasteNodes],
  ['Ctrl+D', t.panels.duplicateNodes],
  [t.panels.shiftCtrlAltDrag, t.panels.addToRemoveFromSelection],
  [t.panels.shiftArrows, t.panels.nudgeNodes16Px],
  ['U', t.panels.resizeSelected],
  ['Z', t.panels.undo],
  [t.panels.shiftZ, t.panels.redo],
  [t.panels.del, t.panels.sellSelected],
  ['C', t.panels.collect],
  ...(easyMode ? [['S', t.panels.speed] as const] : []),
  ['D', t.panels.dashboard],
  ['G', t.panels.glossary],
  ['M', t.panels.mute],
  ['I', t.panels.inbox],
  ['$', t.panels.cost],
  ['F', t.panels.fullscreen],
  [t.panels.arrows, t.panels.selectNearestNode],
  ...(easyMode ? [[t.panels.space, t.panels.pause] as const] : []),
  ['`', t.panels.playtestPanel],
  [t.panels.esc, t.panels.backOutThenMenu],
]

export const helpPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return shell(
    t.panels.howToPlay,
    [],
    [
      h.div(
        [
          h.Class(
            `grid min-h-0 grid-cols-[minmax(0,1fr)_230px] gap-4 px-5 pt-1 pb-5 compact:grid-cols-1 ${SCROLL}`,
          ),
        ],
        [
          h.ol(
            [h.Class('grid grid-cols-2 gap-2 narrow:grid-cols-1')],
            stepsOf(t).map(([title, body], index) =>
              h.li(
                [
                  h.Key(title),
                  h.Class(
                    'flex flex-col gap-1.5 rounded-xl bg-nested p-4 shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
                  ),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [String(index + 1).padStart(2, '0')],
                  ),
                  h.span([h.Class('text-[calc(15px*var(--type-scale))] font-semibold')], [title]),
                  h.span(
                    [
                      h.Class(
                        'text-[calc(13px*var(--type-scale))] leading-relaxed text-muted-foreground',
                      ),
                    ],
                    [body],
                  ),
                ],
              ),
            ),
          ),
          h.div(
            [h.Class('flex flex-col gap-2 compact:hidden')],
            [
              h.span([h.Class(EYEBROW)], [t.panels.keys]),
              h.div(
                [h.Class(NESTED)],
                keysOf(t, model.prefs.easyMode).map(([key, action]) =>
                  h.div(
                    [
                      h.Key(key),
                      h.Class(
                        'flex items-center justify-between gap-2 px-3 py-1.5 text-[calc(12.5px*var(--type-scale))]',
                      ),
                    ],
                    [h.span([h.Class('text-muted-foreground')], [action]), Kbd({}, [key], h)],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      footer([primaryButton(t.panels.startBuilding, Message.PanelClosed(), h)], h),
    ],
    'max-w-[980px]',
    h,
  )
}

const menuItem = (
  label: string,
  glyph: Parameters<typeof icon>[1],
  message: Message,
  h: HtmlBuilder<Message>,
  isPrimary = false,
) =>
  button(
    {
      onClick: message,
      variant: isPrimary ? 'default' : 'outline',
      size: 'lg',
      className: 'h-11 w-full justify-start gap-2.5 px-3.5',
      attributes: [h.Key(label)],
    },
    [icon(h, glyph, 'size-[18px]'), label],
    h,
  )

/** The game menu over the board. The clock holds still while it is open. */
export const menuPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const file = currentFile(model)
  return shell(
    t.panels.menu,
    [],
    [
      ...(file
        ? [
            h.div(
              [h.Class('flex items-center gap-2.5 px-5 pb-4')],
              [
                companyMark(file.logo, 'size-6 shrink-0', h),
                h.div(
                  [h.Class('flex min-w-0 flex-col')],
                  [
                    h.span([h.Class('truncate text-sm font-medium')], [file.name]),
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
        [h.Class('flex flex-col gap-2 px-5 pt-1 pb-5')],
        [
          menuItem(t.panels.resume, Play, Message.PanelClosed(), h, true),
          menuItem(
            roomCode(model) === null ? t.room.title : `${t.room.title} · ${roomCode(model)}`,
            Users,
            Message.PanelOpened({ panel: 'room' }),
            h,
          ),
          menuItem(t.panels.settings, Settings, Message.PanelOpened({ panel: 'settings' }), h),
          menuItem(t.panels.exportPlaytestLog, Download, Message.LogExported(), h),
          exitLegacy(model) === null
            ? h.empty
            : menuItem(t.panels.exitCompany, DoorOpen, Message.PanelOpened({ panel: 'exit' }), h),
          menuItem(t.panels.titleScreen, House, Message.TitleOpened(), h),
        ],
      ),
    ],
    'max-w-[calc(320px*var(--type-scale))]',
    h,
  )
}

/** The four Seat colours, in the order a Room hands them out. */
const SEAT_COLOURS = [
  'oklch(0.62 0.16 30)',
  'oklch(0.58 0.15 255)',
  'oklch(0.6 0.13 155)',
  'oklch(0.6 0.17 320)',
] as const

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
      const colour = SEAT_COLOURS[entry.colour % SEAT_COLOURS.length] ?? SEAT_COLOURS[0]
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

  const voteCard = (open: typeof vote & { readonly id: number }) => {
    const yes = open.yes.length
    const mine = open.yes.includes(seat) ? 'yes' : open.no.includes(seat) ? 'no' : null
    return h.div(
      [h.Class(cn(WELL, 'flex flex-col gap-2.5 p-3'))],
      [
        h.div(
          [h.Class('flex items-baseline justify-between gap-3')],
          [
            h.span(
              [h.Class('text-sm font-medium')],
              [open.kind === 'fund' ? t.room.voteFund : t.room.voteExit],
            ),
            h.span(
              [h.Class(cn(FIGURE, 'text-xs text-muted-foreground'))],
              [`${yes} / ${model.room.seats.length}`],
            ),
          ],
        ),
        h.div(
          [h.Class('flex items-center gap-1.5')],
          model.room.seats.map((entry) => {
            const colour = SEAT_COLOURS[entry.colour % SEAT_COLOURS.length] ?? SEAT_COLOURS[0]
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
    body.push(h.p([h.Class('px-5 pt-4 text-sm text-muted-foreground')], [t.room.onlineHint]))
    if (file !== null)
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
      body.push(section(t.room.vote, vote === null ? [voteStart] : [voteCard(vote)]))
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

/** The sound level, as a slider: its value lives in `prefs.volume`. */
const volumeRow = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.submodel({
    slotId: 'volume',
    model: model.volumeSlider,
    view: VolumeSlider.view,
    toParentMessage: (message) => Message.VolumeSliderChanged({ message }),
    viewInputs: VolumeSlider.styledViewInputs(
      {
        value: model.prefs.volume,
        label: copy(h).panels.volume,
        formatValue: (value) => `${value}%`,
        rowClass: 'gap-1.5',
      },
      h,
    ),
  })

export const settingsPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return shell(
    t.panels.settings,
    [],
    [
      h.div(
        [h.Class(`flex min-h-0 flex-col gap-4 px-5 pt-1 pb-5 ${SCROLL}`)],
        [
          switch_(
            {
              id: 'setting-muted',
              label: t.panels.muteSoundM,
              isChecked: model.prefs.muted,
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.MuteToggled() }),
            },
            h,
          ),
          volumeRow(model, h),
          switch_(
            {
              id: 'setting-easy-mode',
              label: t.panels.easyMode,
              isChecked: model.prefs.easyMode,
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.EasyModeToggled() }),
            },
            h,
          ),
          model.prefs.easyMode
            ? switch_(
                {
                  id: 'setting-auto-pause',
                  label: t.panels.pauseOnSEV1AndSEV2,
                  isChecked: model.prefs.autoPause,
                  onToggle: () =>
                    Message.PrefsChanged({ message: PrefsMessage.AutoPauseToggled() }),
                },
                h,
              )
            : h.empty,
          switch_(
            {
              id: 'setting-blur-pause',
              label: t.panels.pauseOnBlur,
              isChecked: model.prefs.blurPause,
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.BlurPauseToggled() }),
            },
            h,
          ),
          switch_(
            {
              id: 'setting-motion',
              label: t.panels.reduceMotion,
              isChecked: model.prefs.motion === 'reduce',
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.MotionToggled() }),
            },
            h,
          ),
          switch_(
            {
              id: 'setting-text',
              label: t.panels.textAt150,
              isChecked: model.prefs.text === 'large',
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.TextToggled() }),
            },
            h,
          ),
          switch_(
            {
              id: 'setting-theme',
              label: t.panels.darkMode,
              isChecked: model.prefs.theme === 'dark',
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.ThemeToggled() }),
            },
            h,
          ),
          switch_(
            {
              id: 'setting-agent-access',
              label: t.panels.agentAccess,
              isChecked: model.prefs.agentAccess,
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.AgentAccessToggled() }),
            },
            h,
          ),
          switch_(
            {
              id: 'setting-analytics',
              label: t.panels.shareAnonymousUsageData,
              isChecked: model.prefs.analytics,
              onToggle: () => Message.PrefsChanged({ message: PrefsMessage.AnalyticsToggled() }),
            },
            h,
          ),
          h.div(
            [h.Class('flex items-center justify-between gap-3')],
            [
              h.span([h.Class('text-sm font-medium')], [t.panels.language]),
              languagePicker(model.prefs.locale, model.languagePicker, h),
            ],
          ),
          secondaryButton(
            t.panels.privacyPolicy,
            Message.ClickedLink({ request: UrlRequest.External({ href: PRIVACY_URL }) }),
            h,
            ArrowUpRight,
          ),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
            [
              secondaryButton(t.panels.copySaveAsText, Message.SaveExported(), h, Copy),
              secondaryButton(t.panels.importASave, Message.SaveImportAsked(), h, Upload),
            ],
          ),
          secondaryButton(t.panels.copyStateAsJSON, Message.StateCopied(), h, Copy),
        ],
      ),
    ],
    'max-w-[calc(360px*var(--type-scale))]',
    h,
  )
}

export const offerPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const deal = offer(model.board.game)
  if (!deal) return h.empty
  const ipo = model.board.game.stage === PRE_IPO_STAGE
  return shell(
    ipo
      ? t.panels.iPO
      : t.panels.round(t.catalog.eras[model.board.game.stage + 1]?.name ?? deal.era.name),
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
            [
              primaryButton(t.panels.keepPlaying, Message.PanelClosed(), h),
              secondaryButton(t.panels.exportPlaytestLog, Message.LogExported(), h, Download),
            ],
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
    t.panels.playtest,
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
                  secondaryButton(t.panels.exportPlaytestLog, Message.LogExported(), h, Download),
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
