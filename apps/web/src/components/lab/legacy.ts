import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  BookCopy,
  Check,
  Clipboard,
  Copy,
  CopyPlus,
  Plus,
  SquareDashed,
  Stamp,
  Trash2,
  Upload,
  X,
} from 'lucide'
import { COMPONENTS } from '@quorum/simulation/catalog'
import { exitOffers } from '@quorum/simulation/exit'
import { keepSlots, playbookSlots } from '@quorum/simulation/founder'
import { refundOf } from '@quorum/simulation/lookups'
import { legacyMultiplier } from '@quorum/simulation/founding'
import { valuationOf } from '@quorum/simulation/valuation'
import { clock, compact, money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { confirmSellOf, ledgerOf, type Model, offCompany, stampedPlaybook } from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { textarea } from '@quorum/ui/primitives/textarea'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, NESTED, SCROLL, WELL } from '@quorum/ui/game/bits'
import { SurveyMessage } from '@/game/survey.ts'
import { isSending, isSent, isSkipped } from '@/game/survey-machine.ts'
import { shell } from './panels.ts'

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

const footer = (children: ReadonlyArray<Html>, h: HtmlBuilder<Message>) =>
  h.div([h.Class('flex justify-end gap-2 border-t border-hairline bg-nested px-5 py-3')], children)

export const exitPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const ledger = ledgerOf(model)
  const value = valuationOf(game, ledger)
  const offers = exitOffers(game, ledger)
  return shell(
    t.legacy.exit,
    [],
    [
      h.div(
        [h.Class(`flex flex-col gap-4 px-5 pt-1 pb-5 ${SCROLL}`)],
        [
          stats(
            'grid-cols-4 narrow:grid-cols-2',
            [
              stat(t.legacy.valuation, money(value.valuation), h),
              stat(t.legacy.ruleOf40, value.ruleOf40.toFixed(0), h),
              stat(t.legacy.equity, `${Math.round(game.equity * 100)}%`, h),
              stat(t.legacy.legacy, legacyMultiplier(game.founding).toFixed(2), h),
            ],
            h,
          ),
          h.div(
            [h.Class(cn(NESTED, 'flex flex-col divide-y divide-hairline'))],
            offers.map((offer) =>
              h.div(
                [h.Key(offer.id), h.Class('flex items-center gap-3 px-4 py-3')],
                [
                  h.div(
                    [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
                    [
                      h.span(
                        [h.Class('text-[calc(14px*var(--type-scale))] font-semibold')],
                        [t.catalog.exits[offer.id].name],
                      ),
                      h.span(
                        [
                          h.Class(
                            cn(
                              FIGURE,
                              'text-[calc(11.5px*var(--type-scale))] text-muted-foreground',
                            ),
                          ),
                        ],
                        [t.legacy.payout(money(offer.payout), offer.multiplier.toFixed(1))],
                      ),
                    ],
                  ),
                  button(
                    { onClick: Message.ExitTaken({ exit: offer.id }), size: 'lg' },
                    [t.legacy.takeLegacy(offer.legacy)],
                    h,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
    'max-w-[620px]',
    h,
  )
}

/** A small drawing of the Design at Exit. */
export const snapshotSvg = (
  snapshot: Model['founder']['history'][number]['snapshot'],
  h: HtmlBuilder<Message>,
  className: string,
): Html => {
  const xs = snapshot.nodes.map((node) => node.x)
  const ys = snapshot.nodes.map((node) => node.y)
  const left = Math.min(0, ...xs) - 40
  const top = Math.min(0, ...ys) - 40
  const width = Math.max(400, ...xs) - left + 280
  const height = Math.max(300, ...ys) - top + 200
  return h.svg(
    [
      h.AriaHidden(true),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox(`${left} ${top} ${width} ${height}`),
      h.Class(className),
      h.Fill('none'),
    ],
    [
      ...snapshot.links.map(([from, to], index) => {
        const a = snapshot.nodes[from]
        const b = snapshot.nodes[to]
        return a && b
          ? h.path(
              [
                h.Key(`l${index}`),
                h.D(`M${a.x + 108} ${a.y + 40} L${b.x + 108} ${b.y + 40}`),
                h.StrokeWidth('6'),
                h.Class('stroke-foreground/25'),
              ],
              [],
            )
          : h.empty
      }),
      ...snapshot.nodes.map((node, index) =>
        h.rect(
          [
            h.Key(`n${index}`),
            h.X(String(node.x)),
            h.Y(String(node.y)),
            h.Width('216'),
            h.Height('80'),
            h.Rx('16'),
            h.Fill(`var(--group-${COMPONENTS[node.type].group})`),
            h.Attribute('opacity', '0.75'),
          ],
          [],
        ),
      ),
    ],
  )
}

/** The two questions after an Exit. Only the answers the player sends leave the browser. */
const surveySection = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const survey = model.survey
  if (isSkipped(survey.phase)) return h.empty
  if (isSent(survey.phase))
    return h.div(
      [
        h.Class(
          cn(
            NESTED,
            'flex w-full items-center gap-2 px-4 py-3 text-[calc(12.5px*var(--type-scale))]',
          ),
        ),
      ],
      [icon(h, Check, 'size-4 text-ok'), h.span([], [t.survey.sent])],
    )
  const sending = isSending(survey.phase)
  const empty = survey.issues.trim() === '' && survey.likes.trim() === ''
  return h.div(
    [h.Class('flex w-full flex-col gap-3 border-t border-hairline pt-4')],
    [
      h.div(
        [h.Class('flex flex-col gap-0.5')],
        [
          h.span([h.Class(EYEBROW)], [t.survey.title]),
          h.span(
            [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [t.survey.note],
          ),
        ],
      ),
      textarea(
        {
          id: 'survey-issues',
          label: t.survey.issues,
          value: survey.issues,
          onInput: (value) =>
            Message.SurveyChanged({ message: SurveyMessage.IssuesChanged({ value }) }),
          rows: 2,
          isDisabled: sending,
        },
        h,
      ),
      textarea(
        {
          id: 'survey-likes',
          label: t.survey.likes,
          value: survey.likes,
          onInput: (value) =>
            Message.SurveyChanged({ message: SurveyMessage.LikesChanged({ value }) }),
          rows: 2,
          isDisabled: sending,
        },
        h,
      ),
      survey.phase._tag === 'Failed'
        ? h.span(
            [h.Class('text-[calc(11.5px*var(--type-scale))] text-warn')],
            [t.survey.failed(survey.phase.note)],
          )
        : h.empty,
      h.div(
        [h.Class('flex justify-end gap-2')],
        [
          button(
            { onClick: Message.SurveySkipped(), variant: 'ghost', size: 'sm' },
            t.survey.skip,
            h,
          ),
          button(
            {
              onClick: Message.SurveySubmitted(),
              size: 'sm',
              isDisabled: sending || empty,
            },
            sending ? t.survey.sending : t.survey.send,
            h,
          ),
        ],
      ),
    ],
  )
}

export const exitedPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const exited = model.companyPhase
  if (exited._tag !== 'Exited') return h.empty
  const row = exited.row
  const slots = keepSlots(model.founder)
  const kept = model.founder.keep
  return shell(
    t.catalog.exits[row.exit].name,
    [],
    [
      h.div(
        [h.Class(`flex min-h-0 flex-col items-center gap-4 px-6 pt-1 pb-5 ${SCROLL}`)],
        [
          snapshotSvg(
            row.snapshot,
            h,
            'h-[180px] w-full max-w-[520px] rounded-xl bg-well shadow-well p-2',
          ),
          h.span(
            [
              h.Class(
                cn(FIGURE, 'text-[calc(30px*var(--type-scale))] font-semibold tracking-[-0.035em]'),
              ),
            ],
            [t.legacy.legacy2(row.legacy)],
          ),
          stats(
            'grid-cols-4 narrow:grid-cols-2',
            [
              stat(t.legacy.payout2, money(row.payout), h),
              stat(t.legacy.peakUsers, compact(row.peak), h),
              stat(t.legacy.era, t.catalog.eras[row.stage]?.name ?? '', h),
              stat(t.legacy.played, clock(row.time), h),
            ],
            h,
          ),
          slots > 0
            ? h.div(
                [h.Class('flex w-full flex-col gap-2')],
                [
                  h.span([h.Class(EYEBROW)], [t.legacy.keepResearch(kept.length, slots)]),
                  h.div(
                    [h.Class('flex flex-wrap gap-1.5')],
                    exited.researched.map((id) =>
                      button(
                        {
                          onClick: Message.KeepToggled({ id }),
                          size: 'xs',
                          variant: kept.includes(id) ? 'default' : 'outline',
                          attributes: [h.Key(id)],
                        },
                        t.catalog.research[id].name,
                        h,
                      ),
                    ),
                  ),
                ],
              )
            : h.empty,
          surveySection(model, h),
        ],
      ),
      footer(
        [
          button(
            { onClick: Message.MenuChosen({ menu: 'legacy' }), variant: 'outline', size: 'lg' },
            t.legacy.legacyShop,
            h,
          ),
          button({ onClick: Message.TitleOpened(), size: 'lg' }, t.legacy.nextCompany, h),
        ],
        h,
      ),
    ],
    'max-w-[680px]',
    h,
  )
}

/** Shown while Nodes are shift-selected: save them as a Playbook. */
export const selectionBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return offCompany(model)
    ? h.empty
    : model.board.selection.length === 0
      ? h.empty
      : h.div(
          [
            h.Key('selection'),
            h.Class(
              'pointer-events-auto enter-pop flex h-[52px] items-center gap-2 rounded-2xl bg-surface py-1.5 pr-1.5 pl-3.5 text-[calc(12.5px*var(--type-scale))] shadow-card',
            ),
          ],
          [
            h.span([h.Class(FIGURE)], [t.legacy.selected(model.board.selection.length)]),
            ...(
              [
                [Message.NodesCopied(), Copy, t.legacy.copyCtrlC],
                [Message.NodesDuplicated(), CopyPlus, t.legacy.duplicateCtrlD],
                [Message.NodesBoxed(), SquareDashed, t.legacy.boxTheNodes],
                [Message.SellAsked(), Trash2, t.legacy.sellDel],
                [Message.PlaybookSaved(), BookCopy, t.legacy.saveAsPlaybook],
                [Message.SelectionCleared(), X, t.legacy.clearSelectionEsc],
              ] as const
            ).map(([onClick, glyph, label]) =>
              button(
                {
                  onClick,
                  size: 'icon-sm',
                  variant: 'ghost',
                  attributes: [h.AriaLabel(label), h.Title(label)],
                },
                icon(h, glyph, 'size-4'),
                h,
              ),
            ),
          ],
        )
}

/** Asks before Nodes are sold: the sale waits for Enter or the button. */
export const sellBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const ids = confirmSellOf(model.board)
  if (!ids) return h.empty
  const refund = model.board.game.nodes
    .filter((node) => ids.includes(node.id))
    .reduce((total, node) => total + refundOf(model.board.game, node), 0)
  return h.div(
    [
      h.Key('sell'),
      h.Class(
        'pointer-events-auto enter-pop flex h-[52px] items-center gap-2 rounded-2xl bg-surface py-1.5 pr-1.5 pl-3.5 text-[calc(12.5px*var(--type-scale))] shadow-card',
      ),
    ],
    [
      h.span(
        [],
        [
          t.legacy.sell(
            ids.length === 1 ? t.legacy.n1Node : t.legacy.nodes(ids.length),
            refund > 0 ? t.legacy.forText(money(refund)) : '',
          ),
        ],
      ),
      button(
        { onClick: Message.SellConfirmed(), size: 'sm', variant: 'destructive' },
        [icon(h, Trash2, 'size-3.5'), t.legacy.sell2],
        h,
      ),
      button(
        { onClick: Message.SellDismissed(), size: 'sm', variant: 'ghost' },
        t.legacy.cancel,
        h,
      ),
    ],
  )
}

/** Shown while a Playbook follows the pointer. */
export const stampBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const playbook = stampedPlaybook(model)
  return playbook
    ? h.div(
        [
          h.Key('stamp'),
          h.Class(
            'enter-pop flex h-[52px] items-center gap-2 rounded-2xl bg-surface px-3.5 text-[calc(12.5px*var(--type-scale))] shadow-card',
          ),
        ],
        [icon(h, Stamp, 'size-3.5 text-primary-strong'), t.legacy.clickToPlaceEsc(playbook.name)],
      )
    : h.empty
}

export const playbooksPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const founder = model.founder
  return shell(
    t.legacy.playbooks,
    [
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground'))],
        [`${founder.playbooks.length}/${playbookSlots(founder)}`],
      ),
      button(
        { onClick: Message.PlaybookImportAsked(), variant: 'outline', size: 'sm' },
        [icon(h, Upload, 'size-3.5'), t.legacy.importText],
        h,
      ),
    ],
    [
      h.div(
        [h.Class(`flex flex-col gap-2 px-5 pt-1 pb-5 ${SCROLL}`)],
        founder.playbooks.length === 0
          ? [
              h.span(
                [
                  h.Key('empty'),
                  h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground'),
                ],
                [t.legacy.shiftClickOrShiftDragNodes],
              ),
            ]
          : founder.playbooks.map((playbook, index) =>
              h.div(
                [h.Key(`p${index}`), h.Class(cn(NESTED, 'flex items-center gap-2 px-3 py-2'))],
                [
                  h.span(
                    [
                      h.Class(
                        'min-w-0 flex-1 truncate text-[calc(13px*var(--type-scale))] font-medium',
                      ),
                    ],
                    [playbook.name],
                  ),
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [t.legacy.nodes(playbook.nodes.length)],
                  ),
                  button(
                    { onClick: Message.PlaybookChosen({ index }), size: 'sm' },
                    [icon(h, Plus, 'size-3.5'), t.legacy.place],
                    h,
                  ),
                  button(
                    {
                      onClick: Message.PlaybookExported({ index }),
                      variant: 'ghost',
                      size: 'icon-sm',
                      attributes: [h.AriaLabel(t.legacy.copy), h.Title(t.legacy.copyAsText)],
                    },
                    icon(h, Clipboard, 'size-3.5'),
                    h,
                  ),
                  button(
                    {
                      onClick: Message.PlaybookDeleted({ index }),
                      variant: 'ghost',
                      size: 'icon-sm',
                      attributes: [h.AriaLabel(t.legacy.deleteText), h.Title(t.legacy.deleteText)],
                    },
                    icon(h, Trash2, 'size-3.5'),
                    h,
                  ),
                ],
              ),
            ),
      ),
    ],
    'max-w-[560px]',
    h,
  )
}
