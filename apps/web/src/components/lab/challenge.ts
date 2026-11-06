import { formats } from '@/i18n/format.ts'
import { copy, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { AsyncData } from 'foldkit'
import {
  Check,
  FastForward,
  Menu,
  Play,
  RotateCcw,
  Hammer,
  Percent,
  Timer,
  TriangleAlert,
  Wallet,
  Waypoints,
} from 'lucide'
import type { ChallengeHistograms, Histogram } from '@quorum/rpc'
import { FIXES, KINDS, TASKS, type RequestKind } from '@quorum/simulation/catalog'
import {
  bucketOf,
  challengeById,
  complexityOf,
  devHoursOf,
  stepsOf,
  type Challenge,
  type ScoreAxis,
} from '@quorum/simulation/challenges'
import { has } from '@quorum/simulation/lookups'
import { serviceOf } from '@quorum/simulation/team'
import type { Ledger } from '@quorum/simulation/ledger'
import { SIM_VERSION } from '@quorum/simulation/version'
import { histogramQuery } from '@/game/challenge-query.ts'
import { clock, money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import {
  boardChallenge,
  type ChallengeResultRun,
  type ChallengeRun,
  type Model,
} from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { CHIPS, FIGURE, PANEL, WELL, meter, toneText, type Tone } from '@quorum/ui/game/bits'
import { shell } from './panels.ts'

/* ==========================================================================
   Challenge mode: the HUD while the player builds and runs, the brief in the
   goal slot, and the result card with each axis on its histogram.
   ========================================================================== */

const axisNamesOf = (t: Messages): Record<ScoreAxis, string> => ({
  cost: t.challenge.cost,
  tail: t.challenge.tail,
  complexity: t.challenge.complexity,
})

const axisValue = (t: Messages, axis: ScoreAxis, value: number): string =>
  axis === 'cost'
    ? t.units.perSecond(money(value))
    : axis === 'tail'
      ? formats(t).ms(value)
      : String(value)

const figureRow = (
  name: string,
  glyph: Parameters<typeof icon>[1],
  value: string,
  tone: Tone,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.Key(name), h.Class('flex h-8 items-center gap-2.5 px-2.5 compact:shrink-0 compact:px-3')],
    [
      icon(h, glyph, 'size-3.5 shrink-0 text-muted-foreground'),
      h.span(
        [
          h.Class(
            'w-[72px] shrink-0 text-[calc(11.5px*var(--type-scale))] text-muted-foreground compact:hidden',
          ),
        ],
        [name],
      ),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'ml-auto text-[calc(13.5px*var(--type-scale))] leading-none',
              toneText(tone),
            ),
          ),
        ],
        [value],
      ),
    ],
  )

/** The live figures: what the Design costs and serves now, and its complexity. */
const figures = (
  model: Model,
  challenge: Challenge,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const errors = ledger.errorShare * 100
  const { targets } = challenge
  const margin = ledger.revenue > 0 ? (ledger.revenue - ledger.burn) / ledger.revenue : -1
  const spent =
    challenge.devHours === undefined ? 0 : devHoursOf(challenge.start(), model.board.game)
  return h.div(
    [h.Class(`flex flex-col divide-y divide-hairline ${WELL} ${CHIPS}`)],
    [
      figureRow(
        t.challenge.cost,
        Wallet,
        t.challenge.s(money(ledger.burn)),
        targets.cost !== undefined && ledger.burn > targets.cost ? 'danger' : 'plain',
        h,
      ),
      figureRow(
        t.challenge.tail,
        Timer,
        formats(t).ms(ledger.p99),
        targets.tail !== undefined && ledger.p99 > targets.tail ? 'danger' : 'plain',
        h,
      ),
      figureRow(
        t.challenge.complexity,
        Waypoints,
        String(complexityOf(model.board.game)),
        'plain',
        h,
      ),
      targets.margin === undefined
        ? h.empty
        : figureRow(
            t.challenge.margin,
            Percent,
            `${Math.round(margin * 100)}%`,
            margin >= targets.margin ? 'ok' : 'danger',
            h,
          ),
      challenge.devHours === undefined
        ? h.empty
        : figureRow(
            t.challenge.devHours,
            Hammer,
            `${Math.round(spent)} / ${challenge.devHours}`,
            spent <= challenge.devHours ? 'plain' : 'danger',
            h,
          ),
      figureRow(
        t.challenge.errors,
        TriangleAlert,
        percent(ledger.errorShare),
        errors <= targets.errors * 100 ? 'ok' : 'danger',
        h,
      ),
    ],
  )
}

/** A share as a percent with two significant figures: 1%, 0.5%, 0.001%. */
const percent = (share: number): string => `${Number((share * 100).toPrecision(2))}%`

const kindName = (t: Messages, kind: string): string =>
  t.catalog.kinds[kind as RequestKind].label.toLowerCase()

/** A missed target, as the Simulation words it in English, in the player's language. */
const missedText = (t: Messages, missed: string): string => {
  const fixed: Readonly<Record<string, string>> = {
    'Nothing was served.': t.challenge.missedNothing,
    'Too many errors.': t.challenge.missedErrors,
    'Connections were refused.': t.challenge.missedRefused,
    'The tail is too long.': t.challenge.missedTail,
    'Over budget.': t.challenge.missedCost,
    'The margin is too thin.': t.challenge.missedMargin,
  }
  const kinds = Object.keys(KINDS) as ReadonlyArray<RequestKind>
  const failed = /^Too many (.+) requests failed\.$/.exec(missed)?.[1]
  const failedKind = kinds.find((kind) => KINDS[kind].label.toLowerCase() === failed)
  if (failedKind) return t.challenge.missedKindFailed(kindName(t, failedKind))
  const slow = /^(.+) requests are too slow\.$/.exec(missed)?.[1]
  const slowKind = kinds.find((kind) => KINDS[kind].label === slow)
  if (slowKind) return t.challenge.missedKindSlow(t.catalog.kinds[slowKind].label)
  return fixed[missed] ?? missed
}

const targetText = (t: Messages, challenge: Challenge): string => {
  const { targets } = challenge
  const latency = formats(t).ms
  return [
    t.challenge.errorsAtMost(percent(targets.errors)),
    ...Object.entries(targets.kinds ?? {}).map(([kind, limit]) =>
      t.challenge.kindErrorsAtMost(kindName(t, kind), percent(limit ?? 0)),
    ),
    ...Object.entries(targets.kindTail ?? {}).map(([kind, limit]) =>
      t.challenge.kindP99AtMost(kindName(t, kind), latency(limit ?? 0)),
    ),
    targets.refused !== undefined ? t.challenge.noRefused : '',
    targets.tail !== undefined ? t.challenge.tailAtMost(latency(targets.tail)) : '',
    targets.cost !== undefined
      ? t.challenge.costAtMost(t.units.perSecond(money(targets.cost)))
      : '',
    targets.margin !== undefined ? t.challenge.marginAtLeast(percent(targets.margin)) : '',
    challenge.devHours !== undefined ? t.challenge.devHoursTarget(challenge.devHours) : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

/** The code fixes a Design may pay Dev Hours for, while it is built. */
const fixes = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const open = FIXES.filter((fix) => {
    const research = TASKS[fix].research
    return research !== null && has(game, research)
  })
  if (!game.scenario?.tasks || open.length === 0) return h.empty
  const on = serviceOf(game).fixes
  return h.div(
    [h.Class(`flex flex-col divide-y divide-hairline ${WELL} ${CHIPS}`)],
    open.map((fix) => {
      const active = on.includes(fix)
      return h.button(
        [
          h.Key(fix),
          h.Type('button'),
          h.AriaPressed(active ? 'true' : 'false'),
          h.OnClick(Message.FixChosen({ fix, on: !active })),
          h.Class(
            'press flex h-8 items-center gap-2.5 px-2.5 text-left hover:bg-foreground/5 compact:px-3',
          ),
        ],
        [
          icon(
            h,
            active ? Check : Hammer,
            cn('size-3.5 shrink-0', active ? 'text-ok' : 'text-muted-foreground'),
          ),
          h.span(
            [h.Class('flex-1 truncate text-[calc(11.5px*var(--type-scale))]')],
            [t.catalog.tasks[fix].name],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground'))],
            [t.challenge.dH(TASKS[fix].dh)],
          ),
        ],
      )
    }),
  )
}

const actions = (run: ChallengeRun, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('flex gap-1.5 px-1 pt-1')],
    run._tag === 'Building'
      ? [
          button(
            { onClick: Message.ChallengeRan(), size: 'sm', className: 'flex-1' },
            [icon(h, Play, 'size-3.5'), t.challenge.run],
            h,
          ),
        ]
      : run._tag === 'Running'
        ? [
            button(
              { onClick: Message.ChallengeFinished(), size: 'sm', className: 'flex-1' },
              [icon(h, FastForward, 'size-3.5'), t.challenge.finish],
              h,
            ),
            button(
              { onClick: Message.ChallengeRebuilt(), variant: 'outline', size: 'sm' },
              [icon(h, RotateCcw, 'size-3.5'), t.challenge.rebuild],
              h,
            ),
          ]
        : [
            button(
              {
                onClick: Message.PanelOpened({ panel: 'challenge' }),
                size: 'sm',
                className: 'flex-1',
              },
              t.challenge.result,
              h,
            ),
            button(
              { onClick: Message.ChallengeRebuilt(), variant: 'outline', size: 'sm' },
              [icon(h, RotateCcw, 'size-3.5'), t.challenge.rebuild],
              h,
            ),
          ],
  )
}

export const challengeHud = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const run = boardChallenge(model.board)
  const challenge = run ? challengeById(run.id) : undefined
  if (!run || !challenge) return h.empty
  return h.header(
    [
      h.Class(
        `absolute top-3 left-3 z-20 flex w-[248px] flex-col gap-1 p-1.5 ${PANEL} compact:pointer-events-auto compact:static compact:w-auto compact:p-1`,
      ),
    ],
    [
      h.div(
        [h.Class('flex min-h-9 items-center gap-2 px-2.5 pt-1.5 pb-2')],
        [
          button(
            {
              onClick: Message.TitleOpened(),
              variant: 'ghost',
              size: 'icon-sm',
              className: '-ml-1.5 text-muted-foreground',
              attributes: [h.AriaLabel(t.challenge.challenges), h.Title(t.challenge.challenges)],
            },
            icon(h, Menu, 'size-4'),
            h,
          ),
          h.span(
            [h.Class('truncate text-[calc(13px*var(--type-scale))] font-semibold')],
            [t.catalog.challenges[challenge.id]?.name ?? challenge.name],
          ),
          model.founder.completed.includes(challenge.id)
            ? h.span([h.Class('ml-auto')], [icon(h, Check, 'size-3.5 text-ok')])
            : h.empty,
        ],
      ),
      figures(model, challenge, ledger, h),
      run._tag === 'Building' ? fixes(model, h) : h.empty,
      actions(run, h),
    ],
  )
}

/** The brief and targets in the goal slot; while running, how far the run is. */
export const challengeBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const run = boardChallenge(model.board)
  const challenge = run ? challengeById(run.id) : undefined
  if (!run || !challenge) return h.empty
  const running = run._tag !== 'Building'
  const elapsed = run.totals.step * challenge.stepSeconds
  return h.div(
    [
      h.Key(`challenge-${run._tag}`),
      h.Class(
        'enter-down flex w-[420px] flex-col gap-2 compact:w-auto rounded-xl bg-surface px-3 py-2.5 text-[calc(12.5px*var(--type-scale))] shadow-card',
      ),
    ],
    [
      h.div(
        [h.Class('flex items-start gap-2.5')],
        [
          h.span(
            [h.Class('flex-1 leading-snug')],
            [t.catalog.challenges[challenge.id]?.brief ?? challenge.brief],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
            [
              running
                ? `${clock(elapsed)} / ${clock(challenge.duration)}`
                : clock(challenge.duration),
            ],
          ),
        ],
      ),
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
        [targetText(t, challenge)],
      ),
      running ? meter(run.totals.step / stepsOf(challenge), 'bg-primary-fill', h) : h.empty,
    ],
  )
}

/* ---------- the result ---------- */

/** A bar per bucket, the player's bucket marked. */
const strip = (histogram: Histogram, value: number, h: HtmlBuilder<Message>): Html => {
  const mine = bucketOf(histogram.edges, value)
  const top = Math.max(1, ...histogram.counts)
  return h.div(
    [h.Class('flex h-10 items-end gap-[3px]'), h.AriaHidden(true)],
    histogram.counts.map((count, index) =>
      h.span(
        [
          h.Key(String(index)),
          h.Class(
            cn('flex-1 rounded-sm', index === mine ? 'bg-primary-fill' : 'bg-well shadow-well'),
          ),
          h.Style({ height: `${Math.max(8, (count / top) * 100)}%` }),
        ],
        [],
      ),
    ),
  )
}

const axisRow = (
  axis: ScoreAxis,
  run: ChallengeResultRun,
  data: ChallengeHistograms | null,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const value = run.verdict?.best?.[axis] ?? run.result?.[axis] ?? 0
  const share = run.verdict?.percentiles?.[axis]
  return h.div(
    [h.Key(axis), h.Class('flex flex-col gap-1.5')],
    [
      h.div(
        [h.Class('flex items-baseline justify-between gap-3')],
        [
          h.span(
            [h.Class('text-[calc(13px*var(--type-scale))] font-medium')],
            [axisNamesOf(t)[axis]],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(13px*var(--type-scale))]'))],
            [axisValue(t, axis, value)],
          ),
        ],
      ),
      data ? strip(data[axis], value, h) : h.empty,
      share === undefined
        ? h.empty
        : h.span(
            [h.Class('text-[calc(12px*var(--type-scale))] text-muted-foreground')],
            [t.challenge.betterThanOfPlayers(Math.round(share * 100))],
          ),
    ],
  )
}

const verificationOf = (t: Messages): Record<ChallengeResultRun['verification'], string> => ({
  local: t.challenge.provisional,
  sending: t.challenge.provisionalChecking,
  verified: t.challenge.verified,
  unverified: t.challenge.notVerified,
  offline: t.challenge.provisionalOffline,
})

export const challengePanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const run = boardChallenge(model.board)
  const challenge = run ? challengeById(run.id) : undefined
  if (run?._tag !== 'Result' || !challenge) return h.empty
  const result = run.result
  const passed = run.verdict?.passed ?? result.passed
  const histograms = AsyncData.matchData(
    histogramQuery.read(model.histograms, { challengeId: run.id, simVersion: SIM_VERSION }),
    { onEmpty: () => null, onFailure: () => null, onData: (data: ChallengeHistograms) => data },
  )
  return shell(
    t.catalog.challenges[challenge.id]?.name ?? challenge.name,
    [
      h.span(
        [
          h.Class(
            cn(
              'font-mono text-[calc(11px*var(--type-scale))] uppercase tracking-[0.08em]',
              run.verification === 'verified' ? 'text-ok' : 'text-muted-foreground',
            ),
          ),
          ...(run.note ? [h.Title(run.note)] : []),
        ],
        [verificationOf(t)[run.verification]],
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col gap-4 px-5 pb-5')],
        [
          h.span(
            [
              h.Class(
                cn(
                  'text-[calc(22px*var(--type-scale))] font-semibold tracking-[-0.03em]',
                  passed ? 'text-ok' : 'text-danger',
                ),
              ),
            ],
            [
              passed
                ? t.challenge.passed
                : missedText(t, run.verdict?.missed ?? result.missed ?? t.challenge.failed),
            ],
          ),
          ...(['cost', 'tail', 'complexity'] as const).map((axis) =>
            axisRow(axis, run, histograms, h),
          ),
          histograms
            ? h.span(
                [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
                [t.challenge.players(histograms.players)],
              )
            : h.empty,
        ],
      ),
      h.div(
        [h.Class('flex justify-end gap-2 border-t border-hairline bg-nested px-5 py-3')],
        [
          button(
            { onClick: Message.TitleOpened(), variant: 'outline', size: 'lg', className: 'px-3.5' },
            t.challenge.challenges,
            h,
          ),
          button(
            { onClick: Message.ChallengeRebuilt(), size: 'lg', className: 'px-4' },
            t.challenge.rebuild,
            h,
          ),
        ],
      ),
    ],
    'max-w-[440px]',
    h,
  )
}
