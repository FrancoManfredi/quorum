import { formats, stallReasonIn } from '@/i18n/format.ts'
import { type Messages, copy, eraWords, localized } from '@/i18n/messages.ts'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  Circle,
  CircleCheck,
  BookCopy,
  BookOpen,
  ChartLine,
  CircleHelp,
  DatabaseZap,
  DoorOpen,
  Ellipsis,
  Expand,
  FlaskConical,
  Hammer,
  type IconNode,
  Menu,
  Pause,
  Play,
  Rocket,
  LayoutGrid,
  Scan,
  ShieldCheck,
  Smile,
  Timer,
  TriangleAlert,
  Redo2,
  Undo2,
  Users,
  UsersRound,
  Wallet,
  X,
} from 'lucide'
import {
  OPEN_REGION_PRICE,
  FAILURE_YIELD,
  REGIONS,
  REGION_INFO,
  researchList,
  type InsightPool,
} from '@quorum/simulation/catalog'
import { openRegions, regional } from '@quorum/simulation/regions'
import { RUNWAY_MONTH, runwayOf } from '@quorum/simulation/runway'
import { tabDrift } from './mirror.ts'
import { canRaise } from '@quorum/simulation/actions'
import type { Ledger } from '@quorum/simulation/ledger'
import { eraOf, has, nextEra, researchReady, securityStaffed } from '@quorum/simulation/lookups'
import {
  limitingPool,
  progressOf as studyProgressOf,
  recipeOf as simRecipe,
  studyStall,
} from '@quorum/simulation/studies'
import { DRILL_RPO } from '@quorum/simulation/catalog'
import { PRE_IPO_STAGE, brokenRestore, checklistOf, residencyMet } from '@quorum/simulation/ipo'
import {
  GUIDANCE_GROWTH,
  GUIDANCE_MARGIN,
  guidanceOpen,
  quarterGrowth,
} from '@quorum/simulation/quarters'
import { budgetOf, budgeted, slaCreditsOf } from '@quorum/simulation/slo'
import { marginOf, valuationOf } from '@quorum/simulation/valuation'
import { clockOf } from '@quorum/simulation/solve'
import { devHoursRate } from '@quorum/simulation/team'
import { awaitingFeatures } from '@quorum/simulation/features'
import { overdueBy } from '@quorum/simulation/cve'
import { workItemName } from './team.ts'
import { redoAvailable, settleProgress, undoAvailable } from '@/game/feedback.ts'
import { clock as mmss, compact, money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import {
  clockPaused,
  exitLegacy,
  offCompany,
  type Board,
  type Delta,
  type Model,
} from '@/game/model.ts'
import { drillPassed, drillRto } from '@quorum/simulation/drill-machine'
import { POOL_ICONS, POOL_ORDER, poolColor } from '@quorum/ui/game/pools'
import { moreMenu, type MoreItem } from '@/game/more.ts'
import { WIKI_URL } from '@/platform/analytics.ts'
import { glowing, playbooksShown, shown } from '@/game/reveal.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import {
  CHIPS,
  EYEBROW,
  FLOAT,
  FIGURE,
  PANEL,
  WELL,
  type Tone,
  meter,
  ring,
  tool,
  toneText,
} from '@quorum/ui/game/bits'

/** A phone shows Apdex before Errors and Latency, which scroll off the edge. */
const CHIP_ORDER: Record<string, string> = {
  Errors: 'compact:order-2',
  p99: 'compact:order-3',
  Latency: 'compact:order-3',
  SLO: 'compact:order-2',
  SLA: 'compact:order-2',
}

/** One stat: a glyph and its name, then the value and a short note. */
const stat = (
  name: string,
  glyph: IconNode,
  value: string,
  note: string,
  tone: Tone,
  h: HtmlBuilder<Message>,
  title = name,
  className = '',
  onClick?: Message,
): Html =>
  h.div(
    [
      h.Key(name),
      h.Title(title),
      ...(onClick
        ? [
            h.OnClick(onClick),
            h.OnKeyDownPreventDefault((key) =>
              key === 'Enter' || key === ' ' ? Option.some(onClick) : Option.none(),
            ),
            h.Role('button'),
            h.Tabindex(0),
            h.AriaLabel(title),
          ]
        : []),
      h.Class(
        cn(
          'flex h-8 items-center gap-2.5 px-2.5 compact:shrink-0 compact:gap-1.5 compact:px-3',
          CHIP_ORDER[name],
          className,
        ),
      ),
    ],
    [
      icon(h, glyph, 'size-3.5 shrink-0 text-muted-foreground'),
      h.span(
        [
          h.Class(
            'w-[var(--hud-label-width,calc(46px*var(--type-scale)))] shrink-0 text-[calc(11.5px*var(--type-scale))] text-muted-foreground compact:hidden',
          ),
        ],
        [name],
      ),
      // With no note, the tone colours the value itself.
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'text-[calc(13.5px*var(--type-scale))] leading-none whitespace-nowrap',
              note || tone === 'plain' ? '' : toneText(tone),
            ),
          ),
        ],
        [value],
      ),
      note
        ? h.span(
            [
              h.Title(note),
              h.Class(
                cn(
                  FIGURE,
                  'ml-auto min-w-0 truncate text-[calc(10px*var(--type-scale))] leading-none compact:ml-0.5',
                  tone === 'plain' ? 'text-muted-foreground' : toneText(tone),
                ),
              ),
            ],
            [note],
          )
        : h.empty,
    ],
  )

/** What Insight is, how it is earned and spent, and how much a pool keeps. */
const insightHelpOf = (t: Messages): ReadonlyArray<readonly [string, string]> => [
  [t.hud.pools, t.hud.insightPaysForResearchEachRequest],
  [t.hud.earn, t.hud.analyticsSamplesTheNodesItLinks(FAILURE_YIELD)],
  [t.hud.spend, t.hud.eachResearchItemCostsInsightFrom],
  [t.hud.keep, t.hud.aPoolHoldsAtMostIts],
]

/** What Insight is, in a dialog to the right of the card; below it on a phone. */
const insightHelp = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Key('insight-help'),
      h.Role('dialog'),
      h.AriaLabel(t.hud.aboutInsight),
      h.Class(
        cn(
          'enter-pop absolute top-0 left-[calc(100%+8px)] z-30 flex w-[288px] flex-col gap-2.5 p-3.5 compact:top-[calc(100%+6px)] compact:left-0 compact:w-full',
          FLOAT,
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center justify-between')],
        [
          h.span(
            [h.Class('text-[calc(13px*var(--type-scale))] font-semibold')],
            [t.hud.aboutInsight],
          ),
          h.button(
            [
              h.Type('button'),
              h.AriaLabel(t.hud.close),
              h.Title(t.hud.closeEsc),
              h.OnClick(Message.InsightHelpToggled()),
              h.Class(
                'grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              ),
            ],
            [icon(h, X, 'size-3.5')],
          ),
        ],
      ),
      h.dl(
        [h.Class('flex flex-col gap-2.5')],
        insightHelpOf(t).map(([term, text]) =>
          h.div(
            [h.Key(term), h.Class('flex flex-col gap-0.5')],
            [
              h.dt([h.Class(EYEBROW)], [term]),
              h.dd(
                [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-foreground/85')],
                [text],
              ),
            ],
          ),
        ),
      ),
    ],
  )
}

/** One pool: its icon and name, then what it holds and what it earns. */
const poolRow = (
  pool: InsightPool,
  held: number,
  perSecond: number,
  inStudy: boolean,
  limiting: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Key(pool),
      h.Class(
        cn(
          'flex items-center gap-2 text-[calc(12px*var(--type-scale))] leading-none',
          inStudy && 'font-semibold',
        ),
      ),
    ],
    [
      h.span(
        [h.Class('inline-flex'), h.Style({ color: poolColor(pool) })],
        [icon(h, POOL_ICONS[pool], 'size-3.5 shrink-0')],
      ),
      h.span([h.Class('min-w-0 flex-1 truncate')], [t.catalog.pools[pool].label]),
      h.span([h.Class(cn(FIGURE, limiting && 'text-danger'))], [compact(held)]),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'w-[52px] text-right text-[calc(10.5px*var(--type-scale))] font-normal',
              perSecond > 0 ? 'text-ok' : limiting ? 'text-danger' : 'text-muted-foreground',
            ),
          ),
        ],
        [t.hud.s(perSecond.toFixed(1))],
      ),
    ],
  )
}

/**
 * Insight, in its own card: the running Study and its progress, then a row for
 * every pool the Design holds or earns. The (?) opens what the pools are and
 * how they fill, in the card.
 */
const insightCard = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const running = game.studies[0]
  const recipe = running ? simRecipe(game, running.id) : {}
  const limit = running ? limitingPool(game) : null
  const stall = running ? studyStall(game, ledger, running.id) : null
  const queued = game.studies.length - 1
  const runningLabel = `${stall ? t.research.cannotRunShort : `${Math.floor(studyProgressOf(running) * 100)}%`}${queued > 0 ? ` · +${queued}` : ''}`
  const pools = POOL_ORDER.filter(
    (pool) => game.pools[pool] >= 1 || ledger.insight[pool] > 0 || (recipe[pool] ?? 0) > 0,
  )
  return h.section(
    [
      h.Key('insight'),
      h.AriaLabel(t.hud.insight),
      h.Class(
        cn(
          'enter-pop relative flex flex-col gap-2 p-2.5 compact:pointer-events-auto compact:p-2',
          PANEL,
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-1')],
        [
          h.button(
            [
              h.Type('button'),
              h.Title(stall ? t.hud.researchR(stallReasonIn(t, stall)) : t.hud.researchR2),
              h.OnClick(
                Message.PanelOpened({ panel: model.panel === 'research' ? 'none' : 'research' }),
              ),
              h.Class(
                'flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left text-[calc(12px*var(--type-scale))] hover:bg-foreground/5',
              ),
            ],
            [
              icon(h, FlaskConical, 'size-3.5 shrink-0 text-muted-foreground'),
              h.span(
                [
                  h.Class(
                    cn(
                      'min-w-0 flex-1 truncate',
                      running ? 'font-medium' : 'text-muted-foreground',
                    ),
                  ),
                ],
                [running ? t.catalog.research[running.id].name : t.hud.idle],
              ),
              running
                ? h.span(
                    [
                      h.Class(
                        cn(
                          FIGURE,
                          'flex items-center gap-1 text-[calc(10.5px*var(--type-scale))]',
                          stall ? 'text-warn' : 'text-muted-foreground',
                        ),
                      ),
                    ],
                    [stall ? icon(h, TriangleAlert, 'size-3') : h.empty, runningLabel],
                  )
                : h.empty,
            ],
          ),
          h.button(
            [
              h.Type('button'),
              h.Title(t.hud.aboutInsight),
              h.AriaLabel(t.hud.aboutInsight),
              h.AriaExpanded(model.board.insightHelp),
              h.OnClick(Message.InsightHelpToggled()),
              h.Class(
                cn(
                  'grid size-6 shrink-0 place-items-center rounded-md hover:bg-foreground/5',
                  model.board.insightHelp
                    ? 'bg-foreground/5 text-foreground'
                    : 'text-muted-foreground',
                ),
              ),
            ],
            [icon(h, CircleHelp, 'size-3.5')],
          ),
        ],
      ),
      running ? meter(studyProgressOf(running), stall ? 'bg-warn' : 'bg-ok', h) : h.empty,
      pools.length > 0
        ? h.div(
            [
              h.Class(
                cn(
                  'flex flex-col gap-2 rounded-lg px-2.5 py-2',
                  WELL,
                  'compact:max-h-28 compact:overflow-y-auto',
                ),
              ),
            ],
            pools.map((pool) =>
              poolRow(
                pool,
                game.pools[pool],
                ledger.insight[pool],
                (recipe[pool] ?? 0) > 0,
                pool === limit && ledger.insight[pool] <= 0,
                h,
              ),
            ),
          )
        : h.empty,
      model.board.insightHelp ? insightHelp(h) : h.empty,
    ],
  )
}

const percent = (share: number): string => `${(Math.floor(share * 10_000) / 100).toFixed(2)}%`

/** Availability over the week against the Era's SLO; the error budget left with SLO dashboards. */
const slo = (game: Board['game'], h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const budget = budgetOf(game)
  const left = Math.max(0, budget.left)
  return stat(
    'SLO',
    ShieldCheck,
    percent(budget.availability),
    has(game, 'slo-dashboards')
      ? budget.left > 0
        ? t.hud.left(Math.round(left * 100))
        : t.hud.spent
      : `/ ${Number((budget.slo * 100).toFixed(2))}%`,
    budget.left > 0.5 ? 'ok' : budget.left > 0 ? 'warn' : 'danger',
    h,
    t.hud.availabilityThisWeekAgainstTheError(
      percent(budget.slo),
      budget.left > 0 ? t.hud.left(Math.round(left * 100)) : t.hud.spent,
    ),
  )
}

/** What the toolbar takes from the top row of a phone: the funding row leaves it free. */
const TOOLBAR_ROOM = 'compact:min-h-9 compact:pr-[var(--toolbar-w)]'

const funding = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const era = localized(eraOf(game), eraWords(t, game))
  const nextWords = t.catalog.eras[game.stage + 1]
  const next = nextEra(game) && nextWords ? localized(nextEra(game)!, nextWords) : undefined
  const share = next ? Math.min(1, game.users / era.raiseAt) : 1
  const ready = canRaise(game)
  const clock = clockOf(game.time)
  return h.div(
    [
      h.Class('flex flex-col gap-1.5 px-2.5 pt-1.5 pb-2 compact:pb-1'),
      h.Title(next ? t.hud.roundAtUsers(next.name, compact(era.raiseAt)) : era.name),
    ],
    [
      h.div(
        [h.Class(`flex items-center gap-2 ${TOOLBAR_ROOM}`)],
        [
          button(
            {
              onClick: Message.PanelOpened({ panel: 'menu' }),
              variant: 'ghost',
              size: 'icon-sm',
              className: '-ml-1.5 text-muted-foreground',
              attributes: [h.AriaLabel(t.hud.menuEsc), h.Title(t.hud.menuEsc)],
            },
            icon(h, Menu, 'size-4'),
            h,
          ),
          h.span(
            [h.Class('text-[calc(13px*var(--type-scale))] font-semibold compact:shrink-0')],
            [era.name],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'ml-auto text-[calc(10.5px*var(--type-scale))] text-muted-foreground compact:hidden',
                ),
              ),
              h.Title(t.hud.calendarOneSecondIsOneMinute),
            ],
            [
              t.hud.d(
                clock.day,
                String(clock.hour).padStart(2, '0'),
                String(clock.minute).padStart(2, '0'),
              ),
            ],
          ),
        ],
      ),
      meter(share, ready ? 'bg-ok' : 'bg-primary-fill', h),
      ready && next
        ? button(
            {
              onClick: Message.PanelOpened({ panel: 'offer' }),
              size: 'sm',
              className: 'enter-pop shine mt-1 w-full',
              attributes: [h.Key('offer'), h.DataAttribute('exit', 'gesture')],
            },
            [
              icon(h, Rocket, 'size-3.5'),
              game.stage === PRE_IPO_STAGE ? t.hud.iPO : t.hud.offer(next.name),
            ],
            h,
          )
        : h.empty,
    ],
  )
}

/** What the Team builds now: the top of the backlog, and how fast. Opens the Team panel. */
const building = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const item = game.backlog[0]
  const rate = devHoursRate(game, ledger) * 60
  const ready = awaitingFeatures(game).length
  // A patch ticket has a deadline: its clock replaces the pace, and turns red when it is overdue.
  const late = item ? overdueBy(game, item) : 0
  const due = item?.due === undefined ? null : item.due - game.time
  return h.button(
    [
      h.Key('building'),
      h.Type('button'),
      h.Title(t.hud.teamT),
      h.OnClick(Message.PanelOpened({ panel: model.panel === 'team' ? 'none' : 'team' })),
      h.Class(
        cn(
          'enter-pop flex flex-col gap-1.5 rounded-xl px-2.5 py-2 text-left hover:bg-foreground/5 compact:hidden',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-2 text-[calc(12px*var(--type-scale))]')],
        [
          icon(h, Hammer, 'size-3.5 shrink-0 text-muted-foreground'),
          h.span(
            [
              h.Class(
                cn(
                  'min-w-0 flex-1 truncate',
                  item ? 'font-medium' : 'text-muted-foreground',
                  late > 0 && 'text-danger',
                ),
              ),
            ],
            [item ? workItemName(t, item) : t.hud.idle],
          ),
          due !== null
            ? h.span(
                [
                  h.Class(
                    cn(
                      FIGURE,
                      'text-[calc(10.5px*var(--type-scale))]',
                      late > 0 ? 'font-medium text-danger' : 'text-muted-foreground',
                    ),
                  ),
                ],
                [late > 0 ? t.hud.overdue : t.hud.due(mmss(due))],
              )
            : ready > 0
              ? h.span(
                  [
                    h.Class(
                      cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-primary-strong'),
                    ),
                  ],
                  [t.hud.toDeploy(ready)],
                )
              : h.span(
                  [
                    h.Class(
                      cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                    ),
                  ],
                  [t.hud.dHMin(rate < 10 ? rate.toFixed(1) : Math.round(rate))],
                ),
        ],
      ),
      item ? meter(item.spent / item.cost, 'bg-ok', h) : h.empty,
    ],
  )
}

export const hud = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const income = has(game, 'stripe') ? ledger.revenue : 0
  const net = income - ledger.burn
  const then = game.history.at(-30)
  const trend = then ? game.users - then.users : 0
  const target = eraOf(game).apdexTarget
  const errors = ledger.errorShare * 100
  const percentiles = has(game, 'percentiles')
  const runway = runwayOf(game, ledger)
  const short = game.cash <= 0
  // The Bridge state is a union, so only an open offer is short of Cash and worth naming here.
  const bridging = game.bridge._tag === 'Offered'
  // The SLA pays its credits on top of Burn: its own HUD row names them beside the runway (11).
  const credit = slaCreditsOf(game, ledger)
  const cashNote = bridging
    ? t.hud.bridgeOffered
    : short
      ? t.hud.outOfCash
      : `${t.units.perSecond(`${net >= 0 ? '+' : ''}${money(net)}`)}${runway === null ? '' : ` · ${t.hud.runwayMonths((runway / RUNWAY_MONTH).toFixed(1))}`}`
  const errorTitle = has(game, 'logs')
    ? Object.entries(ledger.errors)
        .filter(([, value]) => value > 0.005)
        .map(([cause, value]) =>
          t.hud.s2(t.churn.causes[cause as keyof typeof t.churn.causes], rate(value)),
        )
        .join(' · ') || t.hud.noErrors
    : t.hud.researchStructuredLogsToSeeCauses

  const header = h.header(
    [
      h.DataAttribute('morph', 'notice'),
      h.Class(`flex flex-col gap-1 p-1.5 ${PANEL} compact:pointer-events-auto compact:p-1`),
    ],
    [
      funding(model, h),
      h.div(
        [h.Class(`flex flex-col divide-y divide-hairline ${WELL} ${CHIPS}`)],
        [
          stat(
            t.hud.cash,
            Wallet,
            money(game.cash),
            cashNote,
            game.cash < 0 || bridging ? 'danger' : net >= 0 && income > 0 ? 'ok' : 'plain',
            h,
            bridging ? t.hud.cashShortBridge : t.hud.cashAndNet,
            short || bridging ? 'cursor-pointer rounded-lg hover:bg-muted' : '',
            short || bridging ? Message.PanelOpened({ panel: 'dashboard' }) : undefined,
          ),
          stat(
            t.hud.users,
            Users,
            compact(game.users),
            trend === 0 ? '' : `${trend > 0 ? '▲' : '▼'} ${compact(Math.abs(trend))}`,
            trend >= 0 ? 'ok' : 'danger',
            h,
            t.hud.whyUsersLeave,
            'cursor-pointer rounded-lg hover:bg-muted',
            Message.PanelOpened({ panel: model.panel === 'churn' ? 'none' : 'churn' }),
          ),
          stat(
            'Apdex',
            Smile,
            game.apdex.toFixed(2),
            `/ ${target.toFixed(2)}`,
            game.apdex >= target ? 'ok' : 'danger',
            h,
            t.hud.apdexOverTheLastHourUsers(target.toFixed(2)),
          ),
          shown(model, 'errors')
            ? stat(
                t.hud.errors,
                TriangleAlert,
                `${errors.toFixed(errors >= 10 ? 0 : 1)}%`,
                '',
                errors < 1 ? 'ok' : errors < 5 ? 'warn' : 'danger',
                h,
                t.hud.errors2(errorTitle),
                cn('enter-pop rounded-lg', glowing(model, 'errors') && 'cue-glow'),
              )
            : h.empty,
          budgeted(game) ? slo(game, h) : h.empty,
          // The SLA pays 10% of subscriptions back while the week misses: its own row names
          // the money, so the player sees why Cash falls faster than the Burn beside it (11).
          credit > 0
            ? stat(
                'SLA',
                Wallet,
                `−${t.units.perSecond(money(credit))}`,
                '',
                'danger',
                h,
                t.hud.slaCredits(t.units.perSecond(money(credit)), percent(budgetOf(game).slo)),
              )
            : h.empty,
          stat(
            percentiles ? 'p99' : t.hud.latency,
            Timer,
            formats(t).ms(percentiles ? ledger.p99 : ledger.latency),
            percentiles ? `μ ${formats(t).ms(ledger.latency)}` : '',
            'plain',
            h,
          ),
        ],
      ),
      game.stage === PRE_IPO_STAGE && !offCompany(model) ? checklist(model, ledger, h) : h.empty,
      game.quarter && !offCompany(model) ? quarterly(model, ledger, h) : h.empty,
      shown(model, 'team') ? building(model, ledger, h) : h.empty,
    ],
  )
  // On a phone the wrapper dissolves, so both cards stack with the rest of the top.
  return h.div(
    [
      h.Class(
        'absolute top-3 left-3 z-20 flex w-[calc(276px*var(--type-scale))] flex-col gap-2 compact:contents',
      ),
      h.Style({
        // French words and Japanese full-width labels need more columns than English does.
        '--hud-label-width':
          model.prefs.locale === 'fr' || model.prefs.locale === 'ja'
            ? 'calc(64px*var(--type-scale))'
            : 'calc(46px*var(--type-scale))',
      }),
    ],
    [header, shown(model, 'research') ? insightCard(model, ledger, h) : h.empty],
  )
}

/** One line of the IPO checklist or the quarter: a mark, a name and its figure. */
const line = (name: string, value: string, tone: Tone, h: HtmlBuilder<Message>, mark?: boolean) =>
  h.div(
    [
      h.Key(name),
      h.Class('flex h-6 items-center gap-2 px-2.5 text-[calc(11.5px*var(--type-scale))]'),
    ],
    [
      mark === undefined
        ? h.empty
        : icon(
            h,
            mark ? CircleCheck : Circle,
            cn('size-3.5 shrink-0', mark ? 'text-ok' : 'text-muted-foreground'),
          ),
      h.span([h.Class('text-muted-foreground')], [name]),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'ml-auto text-[calc(10.5px*var(--type-scale))] whitespace-nowrap',
              toneText(tone),
            ),
          ),
        ],
        [value],
      ),
    ],
  )

type ChecklistItem = ReturnType<typeof checklistOf>[number]

const checklistLabel = (t: Messages, id: ChecklistItem['id']): string =>
  id === 'users'
    ? t.hud.checkUsers
    : id === 'reliability'
      ? t.hud.checkReliability
      : id === 'soc2'
        ? t.hud.checkSoc2
        : id === 'drill'
          ? t.hud.checkDrill
          : id === 'residency'
            ? t.hud.checkResidency
            : t.hud.checkRule40

/** What an item's figure says: the Simulation's English words told again from the same state. */
const checklistValue = (t: Messages, game: Board['game'], item: ChecklistItem): string => {
  const drill = game.drill
  if (item.id === 'soc2')
    return has(game, 'soc2')
      ? securityStaffed(game)
        ? t.hud.checkDone
        : t.hud.checkSecurityTeam
      : t.hud.checkSoc2
  if (item.id === 'residency') return residencyMet(game) ? t.hud.checkEu : t.hud.checkNotYet
  if (item.id !== 'drill') return item.value
  if (!drill) return t.hud.checkNotRun
  if (drill._tag === 'Running') return t.hud.checkRunning
  if (drillPassed(drill)) return t.hud.checkRto(Math.round(drillRto(drill) ?? 0))
  if (brokenRestore(game)) return t.hud.checkRestoreFailed
  if (drill._tag === 'Failed') return t.hud.checkNotRecovered
  return drill.rpo >= DRILL_RPO
    ? t.hud.checkDataLost
    : t.hud.checkRto(Math.round(drillRto(drill) ?? 0))
}

/** The IPO checklist (10 "Era 6"): every item at once opens the IPO. */
const checklist = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const items = checklistOf(game, ledger)
  const drillReady = has(game, 'dr-drills') && !game.incident && !(game.drill?._tag === 'Running')
  return h.div(
    [h.Key('ipo'), h.Class(`flex flex-col py-1 ${WELL} compact:hidden`)],
    [
      ...items.map((item) =>
        line(
          checklistLabel(t, item.id),
          checklistValue(t, game, item),
          item.met ? 'ok' : 'plain',
          h,
          item.met,
        ),
      ),
      has(game, 'dr-drills')
        ? h.div(
            [h.Class('px-1.5 pt-1')],
            [
              button(
                {
                  onClick: Message.DrillRun(),
                  variant: 'outline',
                  size: 'sm',
                  className: 'w-full',
                  attributes: [h.Disabled(!drillReady)],
                },
                [icon(h, DatabaseZap, 'size-3.5'), t.hud.runDRDrill],
                h,
              ),
            ],
          )
        : h.empty,
    ],
  )
}

const levelsOf = (t: Messages) => [t.hud.low, t.hud.mid, t.hud.high] as const

/** A guidance picker: three levels, open on a quarter's first day. */
const guidance = (
  label: string,
  values: ReadonlyArray<number>,
  chosen: number,
  pick: (level: number) => Message,
  open: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Key(label),
      h.Class('flex h-7 items-center gap-1 px-2.5 text-[calc(11.5px*var(--type-scale))]'),
    ],
    [
      h.span([h.Class('mr-auto text-muted-foreground')], [label]),
      ...values.map((value, level) =>
        h.button(
          [
            h.Type('button'),
            h.Title(t.hud.levelTitle(levelsOf(t)[level] ?? '', value)),
            h.Disabled(!open && level !== chosen),
            h.AriaPressed(level === chosen ? 'true' : 'false'),
            h.OnClick(pick(level)),
            h.Class(
              cn(
                FIGURE,
                'h-6 min-w-9 rounded-md px-1.5 text-[calc(10.5px*var(--type-scale))] disabled:opacity-35',
                level === chosen ? 'bg-foreground text-background' : 'hover:bg-foreground/5',
              ),
            ),
          ],
          [`${value}%`],
        ),
      ),
    ],
  )
}

/** The Public quarter (10 "Era 7"): days left, guidance, and the market's verdict. */
const quarterly = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const quarter = game.quarter
  if (!quarter) return h.empty
  const day = Math.min(7, Math.floor((game.time - quarter.startedAt) / 1_440) + 1)
  const value = valuationOf(game, ledger)
  const open = guidanceOpen(game)
  const growth = quarterGrowth(quarter, ledger)
  return h.div(
    [h.Key('quarter'), h.Class(`flex flex-col py-1 ${WELL} compact:hidden`)],
    [
      line(t.hud.quarter(quarter.index), t.hud.dayOf7(day), 'plain', h),
      guidance(
        t.hud.growth,
        GUIDANCE_GROWTH,
        quarter.growth,
        (level) => Message.GuidanceChosen({ growth: level, margin: quarter.margin }),
        open,
        h,
      ),
      guidance(
        t.hud.margin,
        GUIDANCE_MARGIN,
        quarter.margin,
        (level) => Message.GuidanceChosen({ growth: quarter.growth, margin: level }),
        open,
        h,
      ),
      line(
        t.hud.soFar,
        `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% · ${marginOf(ledger).toFixed(0)}%`,
        growth >= (GUIDANCE_GROWTH[quarter.growth] ?? 0) &&
          marginOf(ledger) >= (GUIDANCE_MARGIN[quarter.margin] ?? 0)
          ? 'ok'
          : 'warn',
        h,
      ),
      line(
        t.hud.valuation,
        `${money(value.valuation)} · ×${value.multiple.toFixed(1)}`,
        'plain',
        h,
      ),
      quarter.last
        ? line(
            t.hud.q(quarter.index - 1),
            quarter.last.beat ? t.hud.beatStreak(quarter.streak) : t.hud.missed,
            quarter.last.beat ? 'ok' : 'danger',
            h,
          )
        : h.empty,
    ],
  )
}

const toolButton = (
  label: string,
  glyph: IconNode,
  message: Message,
  active: boolean,
  h: HtmlBuilder<Message>,
  extra: Html = h.empty,
  cue = false,
): Html =>
  h.button(
    [
      h.Key(label),
      h.Type('button'),
      h.Title(label),
      h.AriaLabel(label),
      h.AriaPressed(active ? 'true' : 'false'),
      h.OnClick(message),
      h.Class(cn(tool(active), 'enter-pop compact:size-9', cue && 'cue-glow')),
    ],
    [icon(h, glyph, 'size-[18px]'), extra],
  )

/** Undo or redo: dimmed when its stack is empty. */
const historyButton = (
  label: string,
  glyph: IconNode,
  message: Message,
  ready: boolean,
  h: HtmlBuilder<Message>,
  cue = false,
): Html =>
  h.button(
    [
      h.Key(label),
      h.Type('button'),
      h.Title(label),
      h.AriaLabel(label),
      h.Disabled(!ready),
      h.OnClick(message),
      h.Class(
        cn(
          tool(false),
          'enter-pop compact:size-9 disabled:opacity-35 disabled:pointer-events-none',
          cue && 'cue-glow',
        ),
      ),
    ],
    [icon(h, glyph, 'size-[18px]')],
  )

/** Controls a phone reaches through More instead. */
const desktopOnly = (children: ReadonlyArray<Html>, h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('contents compact:hidden')], children)

const divider = (h: HtmlBuilder<Message>): Html =>
  h.div([h.Class('mx-0.5 h-6 w-px bg-hairline compact:hidden')], [])

/** The Exit button, shown while an Exit is on the table; its badge is the best Legacy. */
const exitButton = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const legacy = exitLegacy(model)
  if (legacy === null) return h.empty
  return h.button(
    [
      h.Key('exit'),
      h.Type('button'),
      h.Title(t.hud.exitUpToLegacy(legacy)),
      h.AriaLabel(t.hud.exit),
      h.AriaPressed(model.panel === 'exit' ? 'true' : 'false'),
      h.OnClick(Message.PanelOpened({ panel: model.panel === 'exit' ? 'none' : 'exit' })),
      h.Class(
        cn(
          tool(model.panel === 'exit'),
          'enter-pop flex w-auto gap-2 px-3 text-[calc(13px*var(--type-scale))] font-medium compact:size-9 compact:px-0 max-2xl:w-9 max-2xl:px-0 max-2xl:justify-center',
        ),
      ),
    ],
    [
      icon(h, DoorOpen, 'size-[18px]'),
      h.span([h.Class('compact:hidden max-2xl:hidden')], [t.hud.exit]),
      legacy > 0
        ? h.span(
            [
              h.Key('badge'),
              h.Class(
                cn(
                  FIGURE,
                  'enter-badge absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-ok px-1 text-[calc(9.5px*var(--type-scale))] leading-none font-semibold text-white shadow-raised',
                ),
              ),
            ],
            [String(legacy)],
          )
        : h.empty,
    ],
  )
}

const moreOf = (t: Messages): Record<MoreItem, Readonly<{ label: string; glyph: IconNode }>> => ({
  exit: { label: t.hud.exit, glyph: DoorOpen },
  playbooks: { label: t.hud.playbooks, glyph: BookCopy },
  dashboard: { label: t.hud.dashboard, glyph: ChartLine },
  help: { label: t.hud.howToPlay, glyph: CircleHelp },
  undo: { label: t.hud.undo, glyph: Undo2 },
  redo: { label: t.hud.redo, glyph: Redo2 },
  tidy: { label: t.hud.tidyByZone, glyph: LayoutGrid },
  fit: { label: t.hud.fitTheBoard, glyph: Scan },
  fullscreen: { label: t.hud.fullscreen, glyph: Expand },
})

const moreItems = (model: Model): ReadonlyArray<MoreItem> => [
  ...(exitLegacy(model) === null ? [] : (['exit'] as const)),
  ...(playbooksShown(model) ? (['playbooks'] as const) : []),
  ...(has(model.board.game, 'metrics') ? (['dashboard'] as const) : []),
  'help',
  ...(shown(model, 'undo') ? (['undo', 'redo'] as const) : []),
  'tidy',
  'fit',
  'fullscreen',
]

const moreButton = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const legacy = exitLegacy(model)
  // A dot when something inside asks for attention: Legacy on offer, or a cue on a hidden control.
  const calling = (legacy ?? 0) > 0 || glowing(model, 'undo')
  return h.submodel({
    slotId: 'more-menu',
    model: model.moreMenu,
    view: moreMenu.view,
    toParentMessage: (message) => Message.MoreMenuChanged({ message }),
    viewInputs: {
      items: moreItems(model),
      className: 'hidden compact:block',
      ariaLabel: t.hud.more,
      buttonClassName: cn(tool(model.moreMenu.isOpen), 'relative size-9'),
      buttonContent: h.span(
        [h.Class('contents')],
        [
          icon(h, Ellipsis, 'size-[18px]'),
          calling
            ? h.span(
                [
                  h.Class(
                    'enter-badge absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-ok shadow-raised',
                  ),
                ],
                [],
              )
            : h.empty,
        ],
      ),
      anchor: { placement: 'bottom-end', gap: 6, padding: 8 },
      backdropClassName: 'fixed inset-0 z-40',
      itemsClassName: `z-50 min-w-48 p-1 outline-none ${FLOAT}`,
      isItemDisabled: (item) =>
        (item === 'undo' && !undoAvailable(model.board)) ||
        (item === 'redo' && !redoAvailable(model.board)),
      itemToConfig: (item, { isActive, isDisabled }) => ({
        className: cn(
          'flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-[calc(13px*var(--type-scale))] outline-none',
          isActive && 'bg-well',
          isDisabled && 'opacity-35',
          item === 'fullscreen' && 'narrow:hidden',
        ),
        content: h.span(
          [h.Class('flex w-full items-center gap-2.5')],
          [
            icon(h, moreOf(t)[item].glyph, 'size-[18px] text-muted-foreground'),
            h.span([h.Class('flex-1')], [moreOf(t)[item].label]),
            item === 'exit' && (legacy ?? 0) > 0
              ? h.span(
                  [h.Class(cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-ok'))],
                  [t.hud.legacy(legacy)],
                )
              : h.empty,
          ],
        ),
      }),
    },
  })
}

export const toolbar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const affordable =
    game.studies.length > 0
      ? 0
      : researchList.filter((entry) => !has(game, entry.id) && researchReady(game, entry.id)).length
  return h.nav(
    [
      h.Class(
        `pointer-events-auto relative z-20 flex shrink-0 items-center gap-1 p-1.5 ${PANEL} compact:absolute compact:top-[calc(max(8px,env(safe-area-inset-top))+10px)] compact:right-[calc(max(8px,env(safe-area-inset-right))+10px)] compact:gap-0.5 compact:bg-none compact:p-0 compact:shadow-none`,
      ),
    ],
    [
      desktopOnly([exitButton(model, h)], h),
      offCompany(model) || !shown(model, 'research')
        ? h.empty
        : h.button(
            [
              h.Key('research'),
              h.Type('button'),
              h.Title(t.hud.researchR2),
              h.AriaLabel(t.hud.research),
              h.AriaPressed(model.panel === 'research' ? 'true' : 'false'),
              h.OnClick(
                Message.PanelOpened({ panel: model.panel === 'research' ? 'none' : 'research' }),
              ),
              h.Class(
                cn(
                  tool(model.panel === 'research'),
                  'enter-pop',
                  glowing(model, 'research') && 'cue-glow',
                  'flex w-auto gap-2 px-3 text-[calc(13px*var(--type-scale))] font-medium compact:size-9 compact:px-0 max-2xl:w-9 max-2xl:px-0 max-2xl:justify-center',
                ),
              ),
            ],
            [
              icon(h, FlaskConical, 'size-[18px]'),
              h.span([h.Class('compact:hidden max-2xl:hidden')], [t.hud.research]),
              affordable > 0
                ? h.span(
                    [
                      h.Key('badge'),
                      h.DataAttribute('exit', 'notice'),
                      h.Class(
                        cn(
                          FIGURE,
                          'enter-badge absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-ok px-1 text-[calc(9.5px*var(--type-scale))] leading-none font-semibold text-white shadow-raised',
                        ),
                      ),
                    ],
                    [String(affordable)],
                  )
                : h.empty,
            ],
          ),
      offCompany(model) || !shown(model, 'team')
        ? h.empty
        : h.button(
            [
              h.Key('team'),
              h.Type('button'),
              h.Title(t.hud.teamT),
              h.AriaLabel(t.hud.team),
              h.AriaPressed(model.panel === 'team' ? 'true' : 'false'),
              h.OnClick(Message.PanelOpened({ panel: model.panel === 'team' ? 'none' : 'team' })),
              h.Class(
                cn(
                  tool(model.panel === 'team'),
                  'enter-pop',
                  glowing(model, 'team') && 'cue-glow',
                  'flex w-auto gap-2 px-3 text-[calc(13px*var(--type-scale))] font-medium compact:size-9 compact:px-0 max-2xl:w-9 max-2xl:px-0 max-2xl:justify-center',
                ),
              ),
            ],
            [
              icon(h, UsersRound, 'size-[18px]'),
              h.span([h.Class('compact:hidden max-2xl:hidden')], [t.hud.team]),
              game.backlog.length === 0
                ? h.span(
                    [
                      h.Class(
                        'enter-badge absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-warn shadow-raised',
                      ),
                    ],
                    [],
                  )
                : h.empty,
            ],
          ),
      desktopOnly(
        [
          !playbooksShown(model)
            ? h.empty
            : toolButton(
                t.hud.playbooksP,
                BookCopy,
                Message.PanelOpened({ panel: model.panel === 'playbooks' ? 'none' : 'playbooks' }),
                model.panel === 'playbooks',
                h,
              ),
          has(model.board.game, 'metrics')
            ? toolButton(
                t.hud.dashboardD,
                ChartLine,
                Message.PanelOpened({ panel: model.panel === 'dashboard' ? 'none' : 'dashboard' }),
                model.panel === 'dashboard',
                h,
              )
            : h.empty,
          toolButton(
            t.hud.howToPlayH,
            CircleHelp,
            Message.PanelOpened({ panel: model.panel === 'help' ? 'none' : 'help' }),
            model.panel === 'help',
            h,
          ),
          ...(shown(model, 'undo')
            ? [
                divider(h),
                historyButton(
                  t.hud.undoZ,
                  Undo2,
                  Message.UndoChosen(),
                  undoAvailable(model.board),
                  h,
                  glowing(model, 'undo'),
                ),
                historyButton(
                  t.hud.redoShiftZ,
                  Redo2,
                  Message.RedoChosen(),
                  redoAvailable(model.board),
                  h,
                ),
              ]
            : []),
        ],
        h,
      ),
      shown(model, 'glossary')
        ? h.a(
            [
              h.Key('glossary'),
              h.Href(`${WIKI_URL}/glossary`),
              h.Target('_blank'),
              h.Rel('noreferrer noopener'),
              h.Title(t.hud.glossary),
              h.AriaLabel(t.hud.glossary),
              h.Class(
                cn(
                  tool(false),
                  'enter-pop compact:size-9',
                  glowing(model, 'glossary') && 'cue-glow',
                ),
              ),
            ],
            [icon(h, BookOpen, 'size-[18px]')],
          )
        : h.empty,
      ...(model.prefs.easyMode
        ? [
            divider(h),
            toolButton(
              clockPaused(model) ? t.hud.resumeSpace : t.hud.pauseSpace,
              clockPaused(model) ? Play : Pause,
              Message.PauseToggled(),
              clockPaused(model),
              h,
            ),
            h.button(
              [
                h.Key('speed'),
                h.Type('button'),
                h.Title(t.hud.speedS),
                h.AriaLabel(t.hud.speedS),
                h.OnClick(Message.SpeedCycled()),
                h.Class(
                  cn(
                    tool(model.board.clock.speed > 1),
                    FIGURE,
                    'text-[calc(12.5px*var(--type-scale))] font-medium compact:size-9',
                  ),
                ),
              ],
              [`${model.board.clock.speed}×`],
            ),
          ]
        : []),
      desktopOnly(
        [
          divider(h),
          toolButton(t.hud.tidyByZoneShiftT, LayoutGrid, Message.BoardTidied(), false, h),
          toolButton(t.hud.fitTheBoardShiftF, Scan, Message.BoardFitted(), false, h),
          toolButton(t.hud.fullscreenF, Expand, Message.FullscreenToggled(), false, h),
        ],
        h,
      ),
      moreButton(model, h),
    ],
  )
}

const pill = `flex max-w-[480px] compact:max-w-none items-center gap-2.5 rounded-xl bg-surface px-3 py-2 text-[calc(12.5px*var(--type-scale))] shadow-card`

/** Settling while the Design settles, then what the change did, with Undo. */
const undoButton = (danger: boolean, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return button(
    {
      onClick: Message.UndoChosen(),
      variant: danger ? 'destructive' : 'outline',
      size: 'icon-sm',
      className: 'enter-badge pointer-events-auto ml-1',
      attributes: [
        h.Key('undo'),
        h.DataAttribute('exit', 'notice'),
        h.Title(t.hud.undoZ),
        h.AriaLabel(t.hud.undo),
      ],
    },
    icon(h, Undo2, 'size-3.5'),
    h,
  )
}

const signed = (value: number, digits: number): string =>
  `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(digits)}`

/** What a change did, in words: "+$1.40/s (+18%) · p99 −120 ms · errors −2.1%". */
export const deltaText = (t: Messages, delta: Delta, percentiles: boolean): string => {
  const revenue = delta.after.revenue - delta.before.revenue
  const share = delta.before.revenue > 0 ? (revenue / delta.before.revenue) * 100 : 0
  const latency = percentiles
    ? t.hud.deltaP99(t.units.ms(signed(delta.after.p99 - delta.before.p99, 0)))
    : t.hud.deltaLatency(t.units.ms(signed(delta.after.latency - delta.before.latency, 0)))
  const errors = (delta.after.errors - delta.before.errors) * 100
  return [
    `${t.units.perSecond(`${revenue >= 0 ? '+' : '−'}$${Math.abs(revenue).toFixed(2)}`)} (${signed(share, 0)}%)`,
    latency,
    Math.abs(errors) >= 0.05 ? t.hud.deltaErrors(`${signed(errors, 1)}%`) : null,
  ]
    .filter((part) => part !== null)
    .join(' · ')
}

/** One pill from the first change to the delta: Settling morphs into the result,
 *  and the pill leaves when the delta expires. */
export const changeBar = (model: Model, h: HtmlBuilder<Message>, className: string): Html => {
  const t = copy(h)

  const undo = undoAvailable(model.board)
  const change = model.board.change
  if (change._tag === 'Idle') return h.empty
  const delta = change._tag === 'Settled' || change._tag === 'Lasting' ? change.delta : null
  const body =
    change._tag === 'Settling'
      ? h.span(
          [
            h.Key('settling'),
            h.DataAttribute('exit', 'notice'),
            h.Class('swap flex items-center gap-2.5 whitespace-nowrap'),
          ],
          [
            ring(settleProgress(model.board), 'size-3.5 shrink-0 text-muted-foreground', h),
            h.span(
              [h.Class('text-muted-foreground')],
              [change.change.count > 1 ? t.hud.changes(change.change.count) : change.change.label],
            ),
          ],
        )
      : h.span(
          [
            h.Key(`delta-${delta?.id}`),
            h.DataAttribute('exit', 'notice'),
            h.Class('swap flex items-center gap-2.5 whitespace-nowrap'),
          ],
          [
            h.span(
              [h.Class(`size-2 shrink-0 rounded-full ${delta?.worse ? 'bg-danger' : 'bg-ok'}`)],
              [],
            ),
            h.span(
              [h.Class(cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))]'))],
              [delta ? deltaText(t, delta, has(model.board.game, 'percentiles')) : ''],
            ),
            change._tag === 'Settled' && change.ticks > 0
              ? h.span(
                  [
                    h.Key('stable'),
                    h.Class(
                      'enter-badge text-[calc(11.5px*var(--type-scale))] font-medium text-ok',
                    ),
                  ],
                  [t.hud.stable],
                )
              : h.empty,
          ],
        )
  return h.div(
    [
      h.Key('change'),
      h.DataAttribute('morph', 'notice'),
      h.DataAttribute('exit', 'notice'),
      h.Class(cn(pill, className)),
    ],
    [body, undo ? undoButton(false, h) : h.empty],
  )
}

/**
 * One tab per region from Series C (05 "Zones and regions"). Open regions are
 * tabs; with Multiple regions, each closed one offers to open, at its price.
 */
export const regionTabs = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const open = openRegions(game)
  if (open.length < 2 && !(has(game, 'multi-region') && regional(game))) return h.empty
  return h.nav(
    [
      h.Key('regions'),
      h.AriaLabel(t.hud.regions),
      h.Class(
        'pointer-events-auto flex items-center gap-0.5 rounded-xl bg-surface p-1 shadow-card',
      ),
    ],
    REGIONS.map((region) => {
      const isOpen = open.includes(region)
      const info = localized(REGION_INFO[region], t.catalog.regionInfo[region])
      return h.button(
        [
          h.Key(region),
          h.Type('button'),
          h.Title(
            isOpen
              ? info.name
              : t.hud.open(
                  info.name,
                  money(game.sandbox ? 0 : OPEN_REGION_PRICE * eraOf(game).costIndex),
                ),
          ),
          h.AriaPressed(model.board.region === region ? 'true' : 'false'),
          h.OnClick(isOpen ? Message.RegionPicked({ region }) : Message.RegionOpened({ region })),
          h.Class(
            cn(
              FIGURE,
              'h-7 rounded-lg px-2.5 text-[calc(11.5px*var(--type-scale))] font-medium',
              model.board.region === region
                ? 'bg-foreground text-background'
                : isOpen
                  ? 'hover:bg-foreground/5'
                  : 'text-muted-foreground opacity-60 hover:opacity-100',
            ),
          ),
        ],
        [
          isOpen ? info.short : `+ ${info.short}`,
          tabDrift(game, region) > 0
            ? h.span(
                [
                  h.Key('drift'),
                  h.Class('ml-1 inline-block size-1.5 rounded-full bg-warn align-middle'),
                ],
                [],
              )
            : h.empty,
        ],
      )
    }).concat(
      has(game, 'infra-as-code')
        ? [
            h.button(
              [
                h.Key('mirror'),
                h.Type('button'),
                h.AriaPressed(model.panel === 'mirror' ? 'true' : 'false'),
                h.OnClick(
                  Message.PanelOpened({ panel: model.panel === 'mirror' ? 'none' : 'mirror' }),
                ),
                h.Class(
                  cn(
                    'ml-0.5 h-7 rounded-lg px-2.5 text-[calc(11.5px*var(--type-scale))] font-medium shadow-[inset_1px_0_0_var(--hairline-soft)] hover:bg-foreground/5',
                    model.panel === 'mirror' && 'bg-foreground/5',
                  ),
                ),
              ],
              [t.hud.mirror],
            ),
          ]
        : [],
    ),
  )
}
