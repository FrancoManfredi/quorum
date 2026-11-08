import { formats } from '@/i18n/format.ts'
import { copy, insightName, localized, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  BellOff,
  BellRing,
  Check,
  ChevronRight,
  FileBadge,
  Lock,
  Radar,
  Timer,
  Undo2,
  Users,
  Wallet,
  X,
} from 'lucide'
import { ALERT_RULES, ALERT_THRESHOLDS, INCIDENTS } from '@quorum/simulation/catalog'
import type { AlertRule } from '@quorum/simulation/events'
import { has } from '@quorum/simulation/lookups'
import { ignored } from '@quorum/simulation/step'
import type { Game, Postmortem } from '@quorum/simulation/state'
import { compact, money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { recipeOf } from '@quorum/ui/game/pools'
import { icon } from '@quorum/ui/primitives/icon'
import { badge } from '@quorum/ui/primitives/badge'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, PANEL, WELL, insightChip } from '@quorum/ui/game/bits'

/** Symptom-based pages, like real alerting: they name what users feel, not the cause. A rule
 * that cried wolf too often today is ignored until the player changes its threshold. */
/**
 * The chain a cascade carries (11 "Cascades"): the pager names the incident that was left alone, so
 * the player sees that this is the second page, not the first.
 */
const cause = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const kind = game.incident?.causedBy
  if (!kind) return h.empty
  return h.div(
    [h.Key('cascade'), h.Class(cn('flex items-center gap-1.5 py-1 pr-2.5 pl-2', PANEL))],
    [
      icon(h, ChevronRight, 'size-3.5 text-warn'),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [t.incidents.after],
      ),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] font-semibold')],
        [t.catalog.incidents[kind].name],
      ),
      h.span(
        [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
        [t.incidents.leftAlone],
      ),
    ],
  )
}

export const pager = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const chained = cause(game, h)
  if (!has(game, 'alerting')) return chained
  const rules = Object.keys(ALERT_RULES) as Array<AlertRule>
  const firing = rules.filter(
    (rule) => !ignored(game, rule) && game.alarms[rule] >= ALERT_RULES[rule].seconds,
  )
  const muted = rules.filter((rule) => ignored(game, rule))
  if (firing.length === 0 && muted.length === 0) return chained
  return h.div(
    [h.Class('flex flex-col items-center gap-1.5')],
    [
      chained,
      firing.length > 0
        ? h.div(
            [
              h.Key('pager'),
              h.DataAttribute('morph', 'notice'),
              h.DataAttribute('exit', 'notice'),
              h.Class(
                'enter-down flex items-center gap-2.5 rounded-xl bg-danger px-3.5 py-2 text-[calc(13px*var(--type-scale))] font-semibold text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--danger),black_25%),0_10px_24px_-8px_color-mix(in_oklch,var(--danger)_60%,transparent)]',
              ),
            ],
            [
              icon(h, BellRing, 'ring size-4 shrink-0'),
              // A new page swaps in; the pill morphs to its length.
              h.span(
                [
                  h.Key(firing.join()),
                  h.DataAttribute('exit', 'notice'),
                  h.Class('swap whitespace-nowrap'),
                ],
                [
                  firing
                    .map((rule) => formats(t).alertText(rule, game.alertRules[rule]))
                    .join(' · '),
                ],
              ),
            ],
          )
        : h.empty,
      ...muted.map((rule) =>
        h.div(
          [
            h.Key(`ignored-${rule}`),
            h.Class(
              cn(
                'flex items-center gap-2 py-1 pr-1 pl-3 text-[calc(12.5px*var(--type-scale))]',
                PANEL,
              ),
            ),
          ],
          [
            icon(h, BellOff, 'size-3.5 text-muted-foreground'),
            h.span([h.Class('font-medium')], [formats(t).alertText(rule, game.alertRules[rule])]),
            badge({ variant: 'warn' }, [t.incidents.ignored], h),
            h.div(
              [h.Class(cn('flex gap-[3px] rounded-lg p-[3px]', WELL))],
              ALERT_THRESHOLDS[rule].map((threshold) =>
                h.button(
                  [
                    h.Key(`${rule}-${threshold}`),
                    h.Type('button'),
                    h.AriaPressed(threshold === game.alertRules[rule] ? 'true' : 'false'),
                    h.OnClick(Message.AlertRuleChosen({ rule, threshold })),
                    h.Class(
                      cn(
                        FIGURE,
                        'h-6 rounded-md px-2 text-[calc(11.5px*var(--type-scale))]',
                        threshold === game.alertRules[rule]
                          ? 'bg-raised text-foreground shadow-raised'
                          : 'text-muted-foreground hover:text-foreground',
                      ),
                    ),
                  ],
                  [
                    rule === 'latency' || rule === 'budget'
                      ? `${threshold}×`
                      : rule === 'queue'
                        ? t.incidents.s(threshold)
                        : `${Math.round(threshold * 1000) / 10}%`,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ],
  )
}

/** A bad deploy on screen: App Servers crash until it is rolled back or runs its course. */
export const badDeploy = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  if (game.incident?.kind !== 'bad-deploy') return h.empty
  const ready = has(game, 'ci')
  return h.div(
    [
      h.Key('bad-deploy'),
      h.Class(
        'pointer-events-auto enter-down flex items-center gap-2.5 rounded-xl bg-danger py-1.5 pr-1.5 pl-3.5 text-[calc(13px*var(--type-scale))] font-semibold text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--danger),black_25%),0_10px_24px_-8px_color-mix(in_oklch,var(--danger)_60%,transparent)]',
      ),
    ],
    [
      h.span([], [t.catalog.incidents['bad-deploy'].name]),
      button(
        {
          onClick: Message.RolledBack(),
          isDisabled: !ready,
          size: 'sm',
          variant: 'outline',
          attributes: [
            h.Title(
              ready
                ? t.incidents.rollBack
                : t.incidents.researchToRollBack(t.catalog.research.ci.name),
            ),
          ],
        },
        [icon(h, ready ? Undo2 : Lock, 'size-3.5'), t.incidents.rollBack],
        h,
      ),
    ],
  )
}

/** An expired certificate on screen: every request fails until it is renewed. */
/** Incidents one action ends, with no Node to select: a banner with the fix. */
const BANNERS = {
  certificate: { label: (t: Messages) => t.incidents.renew, message: Message.CertificateRenewed() },
  bgp: { label: (t: Messages) => t.incidents.rollBack, message: Message.RoutesRolledBack() },
  config: { label: (t: Messages) => t.incidents.rollBack, message: Message.ConfigRolledBack() },
  partition: { label: (t: Messages) => t.incidents.fenceLeader, message: Message.LeaderFenced() },
  'migration-lock': {
    label: (t: Messages) => t.incidents.cancelMigration,
    message: Message.SchemaMigrationCancelled(),
  },
  'supply-chain': {
    label: (t: Messages) => t.incidents.pinAndRedeploy,
    message: Message.DependencyPinned(),
  },
  'accidental-delete': {
    label: (t: Messages) => t.incidents.restore,
    message: Message.TableRestored(),
  },
  'leap-second': {
    label: (t: Messages) => t.incidents.restartNodes,
    message: Message.ClocksRestarted(),
  },
  loop: { label: (t: Messages) => t.incidents.moveLogin, message: Message.KindMoved() },
  zone: { label: (t: Messages) => t.incidents.failOver, message: Message.ZoneFailedOver() },
  region: { label: (t: Messages) => t.incidents.failOver, message: Message.RegionFailedOver() },
  'dr-drill': { label: (t: Messages) => t.incidents.failOver, message: Message.RegionFailedOver() },
} as const

/** Incidents one action on the Node they hit ends: the banner presses it for that Node. */
const NODE_BANNERS = {
  'stale-opcache': {
    label: (t: Messages) => t.incidents.restart,
    message: (nodeId: string) => Message.RestartChosen({ nodeId }),
  },
  'gevent-compat': {
    label: (t: Messages) => t.incidents.restart,
    message: (nodeId: string) => Message.RestartChosen({ nodeId }),
  },
  'bun-compat': {
    label: (t: Messages) => t.incidents.restart,
    message: (nodeId: string) => Message.RestartChosen({ nodeId }),
  },
  'split-brain': {
    label: (t: Messages) => t.incidents.restartHub,
    message: (nodeId: string) => Message.RestartChosen({ nodeId }),
  },
  reconnect: {
    label: (t: Messages) => t.incidents.throttleConnects,
    message: (nodeId: string) => Message.ConnectsThrottled({ nodeId }),
  },
} as const

type BannerKind = keyof typeof BANNERS

export const incidentBanner = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const incident = model.board.game.incident
  const kind = incident?.kind as BannerKind | undefined
  const onNode =
    incident?.nodeId && incident.kind in NODE_BANNERS
      ? NODE_BANNERS[incident.kind as keyof typeof NODE_BANNERS]
      : undefined
  if (onNode && incident?.nodeId) {
    const nodeId = incident.nodeId
    return h.div(
      [
        h.Key(incident.kind),
        h.Class(
          'pointer-events-auto enter-down flex items-center gap-2.5 rounded-xl bg-danger py-1.5 pr-1.5 pl-3.5 text-[calc(13px*var(--type-scale))] font-semibold text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--danger),black_25%),0_10px_24px_-8px_color-mix(in_oklch,var(--danger)_60%,transparent)]',
        ),
      ],
      [
        h.span([], [t.catalog.incidents[incident.kind].name]),
        button(
          { onClick: onNode.message(nodeId), size: 'sm', variant: 'outline' },
          [icon(h, FileBadge, 'size-3.5'), onNode.label(t)],
          h,
        ),
      ],
    )
  }
  if (kind === undefined || !(kind in BANNERS)) return h.empty
  const banner = BANNERS[kind]
  return h.div(
    [
      h.Key(kind),
      h.Class(
        'pointer-events-auto enter-down flex items-center gap-2.5 rounded-xl bg-danger py-1.5 pr-1.5 pl-3.5 text-[calc(13px*var(--type-scale))] font-semibold text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--danger),black_25%),0_10px_24px_-8px_color-mix(in_oklch,var(--danger)_60%,transparent)]',
      ),
    ],
    [
      h.span([], [t.catalog.incidents[kind].name]),
      button(
        { onClick: banner.message, size: 'sm', variant: 'outline' },
        [icon(h, FileBadge, 'size-3.5'), banner.label(t)],
        h,
      ),
    ],
  )
}

/** The action item: research the prevention now, or file the postmortem and leave it open. */
const actionButtons = (game: Game, postmortem: Postmortem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const action = postmortem.action && !has(game, postmortem.action) ? postmortem.action : null
  if (!action)
    return button(
      {
        onClick: Message.PostmortemFiled({ id: postmortem.id, take: false }),
        size: 'sm',
        variant: 'outline',
      },
      [t.incidents.file],
      h,
    )
  return h.div(
    [h.Class('flex items-center gap-1')],
    [
      button(
        {
          onClick: Message.PostmortemFiled({ id: postmortem.id, take: true }),
          size: 'sm',
          attributes: [h.Title(t.incidents.actionItem(t.catalog.research[action].blurb))],
        },
        [
          icon(h, Check, 'size-3.5'),
          t.catalog.research[action].name,
          ...recipeOf(action).map(([pool, cost]) =>
            insightChip(pool, compact(cost), h, false, 'plain', insightName(t, pool)),
          ),
        ],
        h,
      ),
      button(
        {
          onClick: Message.PostmortemFiled({ id: postmortem.id, take: false }),
          size: 'sm',
          variant: 'ghost',
          attributes: [
            h.Title(t.incidents.fileAndLeaveTheActionItem),
            h.AriaLabel(t.incidents.file),
          ],
        },
        [icon(h, X, 'size-3.5')],
        h,
      ),
    ],
  )
}

/** A recorded time in calendar minutes, or a dash when the Game has none (an old save, no signal). */
const minutesOf = (t: Messages, seconds: number | null | undefined): string =>
  seconds === null || seconds === undefined
    ? '—'
    : t.units.minShort(Math.round(Math.max(0, seconds)))

/** A postmortem: one compact row with its action item, the details folded away. */
const card = (game: Game, postmortem: Postmortem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const def = localized(INCIDENTS[postmortem.kind], t.catalog.incidents[postmortem.kind])
  return h.details(
    [
      h.Key(`pm-${postmortem.id}`),
      h.DataAttribute('exit', 'gesture'),
      h.DataAttribute('exit-anchor', 'bottom'),
      h.Class(`fold enter-left group w-[380px] compact:w-auto ${PANEL}`),
    ],
    [
      h.summary(
        [
          h.Class(
            'flex cursor-pointer list-none items-center gap-2 p-1.5 pl-2.5 [&::-webkit-details-marker]:hidden',
          ),
          h.Title(t.incidents.showDetails),
        ],
        [
          icon(
            h,
            ChevronRight,
            'fold-chevron size-3.5 shrink-0 text-muted-foreground group-open:rotate-90',
          ),
          badge(
            {
              variant: postmortem.severity <= 2 ? 'destructive' : 'warn',
              className: 'font-mono',
            },
            [`SEV${postmortem.severity}`],
            h,
          ),
          h.span(
            [
              h.Class(
                'min-w-0 flex-1 truncate text-[calc(12.5px*var(--type-scale))] font-semibold',
              ),
            ],
            [def.name],
          ),
          actionButtons(game, postmortem, h),
        ],
      ),
      h.div(
        [h.Class('flex flex-col gap-2.5 px-3 pt-1 pb-3')],
        [
          h.p(
            [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
            [postmortem.target ? `${postmortem.target}: ${def.cause}` : def.cause],
          ),
          // The chain: what this one followed, and that nobody answered it (11 "Cascades").
          postmortem.causedBy
            ? h.p(
                [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-warn')],
                [t.incidents.followedLeftAlone(t.catalog.incidents[postmortem.causedBy].name)],
              )
            : h.empty,
          h.div(
            [h.Class(`grid grid-cols-3 divide-x divide-hairline ${WELL}`)],
            (
              [
                ['MTTD', Radar, minutesOf(t, postmortem.mttd)],
                ['MTTA', BellRing, minutesOf(t, postmortem.mtta)],
                ['MTTR', Timer, minutesOf(t, postmortem.mttr)],
              ] as const
            ).map(([name, glyph, value]) =>
              h.div(
                [h.Key(name), h.Class('flex flex-col gap-1 px-2.5 py-1.5')],
                [
                  h.span(
                    [h.Class(cn(EYEBROW, 'flex items-center gap-1'))],
                    [icon(h, glyph, 'size-3 shrink-0'), name],
                  ),
                  h.span([h.Class(`${FIGURE} text-[calc(12.5px*var(--type-scale))]`)], [value]),
                ],
              ),
            ),
          ),
          h.div(
            [h.Class(`grid grid-cols-2 divide-x divide-hairline ${WELL}`)],
            (
              [
                [t.incidents.users, Users, `−${compact(postmortem.lostUsers)}`],
                [t.incidents.revenue, Wallet, `−${money(postmortem.lostRevenue)}`],
              ] as const
            ).map(([name, glyph, value]) =>
              h.div(
                [h.Key(name), h.Class('flex flex-col gap-1 px-2.5 py-1.5')],
                [
                  h.span(
                    [h.Class(cn(EYEBROW, 'flex items-center gap-1'))],
                    [icon(h, glyph, 'size-3 shrink-0'), name],
                  ),
                  h.span([h.Class(`${FIGURE} text-[calc(12.5px*var(--type-scale))]`)], [value]),
                ],
              ),
            ),
          ),
          h.p([h.Class('text-[calc(12px*var(--type-scale))] leading-snug')], [def.prevention]),
        ],
      ),
    ],
  )
}

/** The column stays when it is empty, so the last card can still leave. */
export const postmortems = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.DataAttribute('flip', 'gesture'),
      h.Class(
        'absolute bottom-3 left-3 z-20 flex flex-col gap-2 compact:static compact:w-auto compact:pointer-events-auto short:[&>details:not(:last-child)]:hidden',
      ),
    ],
    model.board.game.postmortems.slice(-3).map((entry) => card(model.board.game, entry, h)),
  )
