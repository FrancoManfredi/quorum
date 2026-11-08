import { serviceName, teamName } from './team.ts'
import { formats } from '@/i18n/format.ts'
import { copyIn, localized, nodeTitle, type Messages } from '@/i18n/messages.ts'
import { copy, eraWords } from '@/i18n/messages.ts'
import { DashboardMessage } from '@/game/dashboard.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ChevronDown, Clock3, LayoutGrid, RefreshCw, Star, X } from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import type { Limit } from '@quorum/simulation/capacity'
import {
  ALERT_RULES,
  DEVICES,
  ERAS,
  INCIDENTS,
  KINDS,
  LAYOFF_MORALE,
  PROFILES,
  REGION_INFO,
  REGIONS,
  REQUEST_KINDS,
  RESEARCH,
  type ComponentId,
  type Kind,
  type RegionId,
  type RequestKind,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { churnOf, type RegionChurn } from '@quorum/simulation/churn'
import { ackAtOf, signalAtOf } from '@quorum/simulation/incident-machine'
import { ERROR_CAUSES } from '@quorum/simulation/distribution'
import { dilutionOf, grantOf } from '@quorum/simulation/founding'
import type { KindLedger, Ledger, NodeLedger } from '@quorum/simulation/ledger'
import { bootingOf, has } from '@quorum/simulation/lookups'
import { evictionShareOf } from '@quorum/simulation/rules'
import { regional, regionUsers } from '@quorum/simulation/regions'
import { RUNWAY_MONTH, runwayOf } from '@quorum/simulation/runway'
import { budgetOf, burnRateOf, slaCreditsOf } from '@quorum/simulation/slo'
import type { Game, Postmortem, Sample } from '@quorum/simulation/state'
import { ignored } from '@quorum/simulation/step'
import { teamOutputs } from '@quorum/simulation/team'
import { type Field, TIERS, type Tier, blockIndexAt, startOf } from '@/game/history.ts'
import { compact, money, rate as rateText } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import {
  ANNOTATION_GROUPS,
  type AnnotationGroup,
  type Mail,
  type Model,
  clockPaused,
  ledgerOf,
  boardSandbox,
} from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { cn } from '@/lib/utils'
import { button } from '@quorum/ui/primitives/button'
import { Pie, PieChart } from '@quorum/ui/primitives/chart-core'
import {
  Area,
  type CartesianChild,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from '@quorum/ui/primitives/composed-chart'
import { EYEBROW, FIGURE, PANEL, SCROLL, WELL } from '@quorum/ui/game/bits'

/** Time ranges in calendar minutes: up to 10 hours read the Game's one-minute Samples, longer
    ones the 15-minute and 1-hour blocks (12 "History and resolution"). */
export const DASHBOARD_RANGES = [60, 360, 1440, 10_080, 43_200] as const

/** Utilization history is one point per 10 sim seconds (update.ts). */
const NODE_EVERY = 10

/* The series palette: the game's own hues, so the Dashboard matches the Board. */
const BLUE = 'var(--group-edge)'
const PURPLE = 'var(--group-compute)'
const TEAL = 'var(--group-data)'
const PINK = 'var(--group-ops)'
const GREEN = 'var(--ok)'
const AMBER = 'var(--warn)'
const RED = 'var(--danger)'
const MUTED = 'var(--muted-foreground)'

type Level = 'ok' | 'warn' | 'danger'
const LEVEL_COLOR: Record<Level, string> = { ok: GREEN, warn: AMBER, danger: RED }

/** Grafana's thresholds: a value at or above `warn` is amber, at or above `danger` red. */
type Thresholds = Readonly<{ warn: number; danger: number; invert?: boolean }>
const levelOf = (value: number, thresholds: Thresholds): Level =>
  thresholds.invert
    ? value <= thresholds.danger
      ? 'danger'
      : value <= thresholds.warn
        ? 'warn'
        : 'ok'
    : value >= thresholds.danger
      ? 'danger'
      : value >= thresholds.warn
        ? 'warn'
        : 'ok'

const hhmm = (time: number): string => {
  const { hour, minute } = clockOf(time)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const percent = (share: number, digits = 0): string => `${(share * 100).toFixed(digits)}%`

/** An SLO target as the variables bar and the SLO row print it, so 99.95% never reads 100.0%. */
const sloText = (slo: number): string => `${Number((slo * 100).toFixed(3))}%`

/** One Chart row: its label and figures. A figure is null where the history holds no value. */
type Row = Readonly<Record<string, number | string | null>>

/** The resolution a range reads: one-minute Samples, then 15-minute blocks, then 1-hour blocks. */
const tierOf = (range: number): Tier | null =>
  range <= 600 ? null : range <= 10_080 ? 'quarter' : 'hour'

/** A row's label: the clock, and the calendar day when the range spans days. */
const labelOf = (t: Messages, time: number, range: number): string =>
  range > 1440 ? t.dashboard.dayAt(clockOf(time).day, hhmm(time)) : hhmm(time)

/**
 * The rows in range, each with its label, its start in sim time (`at`), its length in calendar
 * minutes (`span`), and its figures. A block row draws the mean of each field, except p99,
 * which draws the worst minute: a block's mean p99 would hide the spike the tail is about.
 */
const rowsOf = (model: Model, slo: number): ReadonlyArray<Row> => {
  const t = copyIn(model.prefs.locale)
  const range = model.board.dashboard.range
  const tier = tierOf(range)
  const figures = (value: (field: Field) => number, at: number, span: number): Row => ({
    t: labelOf(t, at, range),
    at,
    span,
    users: value('users'),
    demand: value('demand'),
    served: value('served'),
    latency: value('latency'),
    p99: value('p99'),
    apdex: value('apdex'),
    errors: value('errors') * 100,
    // Availability per row, so the SLO stat draws the week's dips behind its figure.
    availability: 100 - value('errors') * 100,
    revenue: value('revenue'),
    burn: value('burn'),
    cash: value('cash'),
    burnRate: value('errors') / (1 - slo),
  })
  if (tier === null) {
    const history = model.board.game.history
    const last = Math.floor(model.board.game.time)
    const kept = history.slice(Math.max(0, history.length - range))
    const rows = kept.map((sample: Sample, index) =>
      figures((field) => sample[field], last - (kept.length - 1 - index), 1),
    )
    return withCashRate(rows)
  }
  const { minutes } = TIERS[tier]
  const blocks = model.board.dashboard.history[tier]
  const rows = blocks
    .slice(Math.max(0, blocks.length - Math.ceil(range / minutes)))
    .map((block) =>
      figures(
        (field) =>
          field === 'p99' ? (block.max[field] ?? 0) : (block.sum[field] ?? 0) / block.count,
        startOf(block.index, tier),
        minutes,
      ),
    )
  return withCashRate(rows)
}

/**
 * Cash per second (12 "The Dashboard"): how fast Cash moved between two rows, which is the
 * Samples' own `cash` read as a rate. The first row has no previous row, so it draws nothing.
 */
const withCashRate = (rows: ReadonlyArray<Row>): ReadonlyArray<Row> =>
  rows.map((row, index) => {
    const previous = rows[index - 1]
    const seconds = previous === undefined ? 0 : Number(row.at) - Number(previous.at)
    return {
      ...row,
      cashRate:
        previous === undefined || seconds <= 0
          ? null
          : (Number(row.cash) - Number(previous.cash)) / seconds,
    }
  })

/** The row a sim time falls in, if the range holds it. */
const rowAt = (rows: ReadonlyArray<Row>, time: number): number | null => {
  const index = rows.findIndex(
    (entry) => Number(entry.at) <= time && time < Number(entry.at) + Number(entry.span),
  )
  return index < 0 ? null : index
}

/** A calendar day in sim seconds: the distance to the same moment yesterday (12 "Controls"). */
const DAY_SECONDS = 86_400

/** Yesterday's line is drawn faint, so it never reads as this range's own series. */
const COMPARE_COLOR = 'color-mix(in oklab, var(--foreground) 32%, transparent)'

/** The tier the compare line reads: the Chart's own, or 15-minute blocks under a short range. */
const compareTier = (range: number): Tier => tierOf(range) ?? 'quarter'

/**
 * Yesterday's figure at each row's moment, for the compare line (12 "Controls"). It reads the
 * Dashboard's own blocks, so a short range compares against 15-minute means; a row whose moment
 * the history does not reach is null, and the line breaks there rather than guessing.
 */
const yesterdayOf = (
  model: Model,
  rows: ReadonlyArray<Row>,
  field: Field,
): ReadonlyArray<number | null> => {
  const tier = compareTier(model.board.dashboard.range)
  const means = new Map(
    model.board.dashboard.history[tier].map((block) => {
      const sum = block.sum[field]
      return [block.index, sum === undefined ? null : sum / Math.max(1, block.count)] as const
    }),
  )
  return rows.map((row) => means.get(blockIndexAt(Number(row.at) - DAY_SECONDS, tier)) ?? null)
}

/** Each Node's name, numbered when the Board holds more than one of its type. */
const namesOf = (t: Messages, game: Game): ReadonlyMap<string, string> => {
  const counts = new Map<string, number>()
  const names = new Map<string, string>()
  for (const node of game.nodes) {
    const base = t.catalog.components[node.type].name
    const count = (counts.get(base) ?? 0) + 1
    counts.set(base, count)
    names.set(node.id, count > 1 ? `${base} ${count}` : base)
  }
  return names
}

type NodeTrack = Readonly<{ id: string; name: string; values: ReadonlyArray<number> }>

/** Utilization per Node from the Model's 10-second history, with the same labels as the Board. */
const tracksOf = (model: Model): ReadonlyArray<NodeTrack> => {
  const t = copyIn(model.prefs.locale)
  return model.board.game.nodes
    .filter((node) => node.type !== 'users')
    .map((node) => ({
      id: node.id,
      name: nodeTitle(t, model.board.game, node),
      values: (model.board.nodeHistory[node.id] ?? []).map((sample) => sample.utilization),
    }))
}

const runwayText = (t: Messages, seconds: number | null): string =>
  seconds === null ? '∞' : t.dashboard.runwayMonths((seconds / RUNWAY_MONTH).toFixed(1))

/** A funding round the Company entered: the offer after its Mutators and perks, and the Inbox's answer. */
type FundingRound = Readonly<{
  key: string
  name: string
  users: number
  /** The fixed grant, or null for the IPO, which pays public money rather than a round. */
  grant: number | null
  dilution: number
  answer: 'listed' | 'raised' | 'declined' | null
  when: string
}>

/**
 * The rounds the Company entered, newest first. The Game keeps the Era but no round time and no
 * answer, so the offer comes from the Era catalog and the answer from the Inbox Thread the round
 * left (12 "Annotations" reads the Inbox for the same reason).
 */
const fundingOf = (model: Model): ReadonlyArray<FundingRound> => {
  const t = copyIn(model.prefs.locale)
  const game = model.board.game
  const answers = new Map(model.board.inbox.mail.map((mail) => [mail.key, mail]))
  const rounds: Array<FundingRound> = []
  for (let index = 0; index < Math.min(game.stage, ERAS.length - 1); index += 1) {
    const era = ERAS[index]
    const next = ERAS[index + 1]
    if (!era || !next) continue
    const mail = answers.get(`investor:round:${index}`)
    const at = mail?.entries[0]
    // The last offer is the IPO: it sells shares to the public, pays Burn rather than a grant,
    // and cannot be declined, so it has no term-sheet answer.
    const ipo = index === ERAS.length - 2
    rounds.push({
      key: `round-${index}`,
      name: t.catalog.eras[index + 1]?.name ?? next.name,
      users: era.raiseAt,
      grant: ipo ? null : grantOf(game, era.grant),
      dilution: dilutionOf(game, era.dilution),
      answer: ipo
        ? 'listed'
        : mail?.phase._tag === 'Answered' && mail.phase.answer === 'You raised the round.'
          ? 'raised'
          : mail?.phase._tag === 'Answered' && mail.phase.answer === 'You declined the round.'
            ? 'declined'
            : null,
      when: at === undefined ? '—' : t.dashboard.dayAt(clockOf(at.time).day, hhmm(at.time)),
    })
  }
  return rounds.reverse()
}

const teamKindOf = (
  t: Messages,
): Readonly<Record<'product' | 'platform' | 'sre' | 'data' | 'security', string>> => ({
  product: t.dashboard.product,
  platform: t.dashboard.platform,
  sre: 'SRE',
  data: t.dashboard.data,
  security: t.dashboard.security,
})

/** Dev Hours per real minute, as the Team panel counts them. */
const dhPerMinute = (rate: number): string => {
  const value = rate * 60
  return value < 10 ? value.toFixed(1) : String(Math.round(value))
}

const minutesText = (t: Messages, seconds: number): string =>
  t.units.minShort(Math.round(Math.max(0, seconds)))

/** A time the Game did not record, in a save from before the field or a run that never signalled. */
const minutesOrUnknown = (t: Messages, seconds: number | null | undefined): string =>
  seconds === null || seconds === undefined ? '—' : minutesText(t, seconds)

/** Seconds from an Incident's start to its first signal, or null before it signals. */
const mttdOf = (incident: NonNullable<Game['incident']>): number | null =>
  signalAtOf(incident.phase) === null
    ? null
    : Math.max(0, (signalAtOf(incident.phase) ?? 0) - incident.startedAt)

/** Seconds from that signal to the acknowledgement, or null before anyone answers. */
const mttaOf = (incident: NonNullable<Game['incident']>): number | null =>
  ackAtOf(incident.phase) === null || signalAtOf(incident.phase) === null
    ? null
    : Math.max(0, (ackAtOf(incident.phase) ?? 0) - (signalAtOf(incident.phase) ?? 0))

/** What an Incident is hitting: a Node, a zone, a region, or every region. */
const incidentTarget = (
  t: Messages,
  game: Game,
  incident: NonNullable<Game['incident']>,
): string => {
  if (incident.nodeId !== null) return namesOf(t, game).get(incident.nodeId) ?? incident.nodeId
  if (incident.zone !== null) return t.dashboard.zone(incident.zone.toUpperCase())
  if (incident.region !== null) return t.catalog.regionInfo[incident.region].name
  return t.dashboard.everyRegion
}

/** A Postmortem's action item: its research, whether it is owned, or nothing. */
const actionText = (t: Messages, game: Game, postmortem: Postmortem): string =>
  postmortem.action === null
    ? '—'
    : has(game, postmortem.action)
      ? t.dashboard.ownedAction(t.catalog.research[postmortem.action].name)
      : t.catalog.research[postmortem.action].name

/** A status lamp, lit in its colour, like the dot on a Node card's icon. */
const led = (color: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.Class('size-[7px] shrink-0 rounded-full'),
      h.Style({
        background: color,
        boxShadow: `0 0 0 2px color-mix(in oklab, ${color} 22%, transparent), 0 0 6px color-mix(in oklab, ${color} 55%, transparent)`,
      }),
    ],
    [],
  )

/** A sunken display inside a panel: the well recipe, where every plot sits. */
const SCREEN = 'rounded-xl bg-well shadow-well'

/** A Grafana panel as a Board card: raised, with a lamp and a title. `tint` is Grafana's background colour mode. */
const panel = (
  key: string,
  span: string,
  title: string,
  unit: string,
  body: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
  tint: Level | null = null,
  accent: string = MUTED,
): Html =>
  h.div(
    [
      h.Key(key),
      h.DataAttribute('panel', key),
      h.Class(
        cn(
          'flex min-w-0 flex-col gap-1.5 rounded-2xl bg-surface p-1.5 shadow-card compact:col-span-24',
          span,
        ),
      ),
      ...(tint
        ? [
            h.Style({
              background: `linear-gradient(to bottom, color-mix(in oklab, ${LEVEL_COLOR[tint]} 16%, var(--card)), var(--card) 64px)`,
            }),
          ]
        : []),
    ],
    [
      h.div(
        [h.Class('flex h-6 shrink-0 items-center gap-2 px-1.5')],
        [
          led(tint ? LEVEL_COLOR[tint] : accent, h),
          h.span(
            [
              h.Class(
                'truncate text-[calc(12.5px*var(--type-scale))] font-semibold tracking-[-0.01em]',
              ),
            ],
            [title],
          ),
          unit
            ? h.span(
                [
                  h.Class(
                    cn(
                      FIGURE,
                      'truncate text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
                    ),
                  ),
                ],
                [unit],
              )
            : h.empty,
        ],
      ),
      ...body,
    ],
  )

/** A panel the player has not researched yet. */
const locked = (
  key: string,
  span: string,
  title: string,
  research: ResearchId,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return panel(
    key,
    span,
    title,
    '',
    [
      h.div(
        [
          h.Class(
            cn(
              SCREEN,
              'grid min-h-[120px] flex-1 place-items-center bg-[repeating-linear-gradient(135deg,transparent_0_7px,var(--hairline)_7px_8px)]',
            ),
          ),
        ],
        [
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'rounded-lg bg-raised px-2.5 py-1 text-[calc(11px*var(--type-scale))] text-muted-foreground shadow-raised',
                ),
              ),
            ],
            [t.dashboard.noDataResearch(research)],
          ),
        ],
      ),
    ],
    h,
  )
}

const rowHeader = (label: string, count: number, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Key(`row-${label}`),
      h.DataAttribute('row', label),
      h.Class('col-span-24 flex items-center gap-1.5 pt-3 pb-0.5'),
    ],
    [
      icon(h, ChevronDown, 'size-3.5 text-muted-foreground'),
      h.span([h.Class('text-[calc(13px*var(--type-scale))] font-semibold')], [label]),
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
        [copy(h).dashboard.panelCount(count)],
      ),
    ],
  )

/** Chart text in the game's figure face; only foldcn's hover bands take the pointer, not the fills drawn over them. */
const PLOT =
  '[&_text]:font-mono [&_text]:text-[calc(10px*var(--type-scale))] [&_text]:fill-[var(--muted-foreground)] [&_text]:tracking-[-0.01em] [&_path]:pointer-events-none [&_line]:pointer-events-none [&_text]:pointer-events-none'

/** Lifts a marker's label from the bottom of the plot to its top. */
const TOP_OF_PLOT = -150

/** The Chart's frame, as `timeSeries` hands it to ComposedChart. */
const CHART_WIDTH = 760
const CHART_HEIGHT = 210
const CHART_MARGIN = { top: 10, right: 12, bottom: 0, left: 2 } as const
const Y_AXIS_WIDTH = 58
const X_AXIS_PAD = 32

/** Where row `index` of `count` draws on a Chart `width` wide: chart-core's category axis. */
const plotX = (index: number, count: number, width: number): number => {
  const left = CHART_MARGIN.left + Y_AXIS_WIDTH + X_AXIS_PAD
  const right = width - CHART_MARGIN.right
  return left + ((right - left) * (index + 0.5)) / Math.max(1, count)
}

/** The scale the interface text draws at, which the top of the plot lays its labels out for. */
const typeScaleOf = (model: Model): number => (model.prefs.text === 'large' ? 1.5 : 1)

const ANNOTATION_COLOR: Record<AnnotationGroup, string> = {
  design: BLUE,
  deploys: PURPLE,
  incidents: RED,
  company: PINK,
  research: GREEN,
}

const annotationNameOf = (t: Messages): Record<AnnotationGroup, string> => ({
  design: t.dashboard.designChange,
  deploys: t.dashboard.deploy,
  incidents: t.dashboard.incident,
  company: t.dashboard.company,
  research: t.dashboard.research,
})

/** One mark on the timeline: its group, the sim second it happened, and its label. */
type Annotation = Readonly<{ group: AnnotationGroup; at: number; label: string }>

/** A Thread's key, as `mail.ts` writes it: `event:<topic>:<about>`, or a sender's own key. */
const keyParts = (mail: Mail): ReadonlyArray<string> => mail.key.split(':')

/** The Incident kind a Thread's topic names, when the two spell it the same way. */
const incidentNameOf = (t: Messages, topic: string): string =>
  (t.catalog.incidents as Readonly<Record<string, Readonly<{ name: string }> | undefined>>)[topic]
    ?.name ?? t.dashboard.incident

/** Every Research name, longest first, so "Load balancing algorithms" wins over "Load balancing". */
const RESEARCH_NAMES: ReadonlyArray<readonly [string, ResearchId]> = (
  Object.entries(RESEARCH) as ReadonlyArray<[ResearchId, Readonly<{ name: string }>]>
)
  .map(([id, entry]) => [entry.name, id] as const)
  .sort((left, right) => right[0].length - left[0].length)

const WORD = /[\p{L}\p{N}]/u

/** The Research an item name in a `finished` letter names, if one is in it. */
const researchNamed = (text: string): ResearchId | null => {
  for (const [name, id] of RESEARCH_NAMES) {
    const at = text.indexOf(name)
    if (at < 0) continue
    const before = text[at - 1]
    const after = text[at + name.length]
    if (before !== undefined && WORD.test(before)) continue
    if (after !== undefined && WORD.test(after)) continue
    return id
  }
  return null
}

/**
 * What a Thread marks, if anything. The Inbox is the only record of when an
 * event happened that the Model keeps: the Game holds no deploy, Study, hire or
 * round time. It keeps only its last Threads, so the marks reach as far back as
 * its Mail does.
 */
const markOfMail = (
  t: Messages,
  mail: Mail,
): Readonly<{ group: AnnotationGroup; label: string }> | null => {
  const [from, topic, about] = keyParts(mail)
  if (from === 'event' && topic !== undefined) {
    if (topic === 'deployed') return { group: 'deploys', label: `⇢ ${t.dashboard.deploy}` }
    if (topic === 'deployed-bad') return { group: 'deploys', label: `⇢ ${t.dashboard.badDeploy}` }
    if (topic.startsWith('incident-'))
      return {
        group: 'incidents',
        label: `▲ ${incidentNameOf(t, topic.slice('incident-'.length))}`,
      }
    if (topic === 'hired') return { group: 'company', label: `◆ ${t.dashboard.hired}` }
  }
  if (mail.key === 'mentor:ipo') return { group: 'company', label: '◆ IPO' }
  // The round a Stage's term sheet offers, which opens the next Era.
  if (from === 'investor' && topic === 'round') {
    const stage = Number(about)
    const era = t.catalog.eras[Number.isFinite(stage) ? stage + 1 : 0]?.name
    return { group: 'company', label: `◆ ${t.dashboard.roundOf(era ?? t.dashboard.funding)}` }
  }
  return null
}

/**
 * Every mark the history holds, in the order the groups are drawn. A finished Study's second is
 * not on the Game: `studies` drops it and `researched` keeps only its id, so the mark comes from
 * the Inbox's `event:finished` Thread, at the second that entry was written. The Thread does not
 * say which kind of item finished, so the mark is the entry that names a Research.
 */
const annotationsOf = (model: Model): ReadonlyArray<Annotation> => {
  const t = copyIn(model.prefs.locale)

  const shown = model.board.dashboard.groups
  const incident = model.board.game.incident
  const open: ReadonlyArray<Annotation> = incident
    ? [
        {
          group: 'incidents',
          at: incident.startedAt,
          label: `▲ SEV${incident.severity} ${t.catalog.incidents[incident.kind].name}`,
        },
      ]
    : []
  const design: ReadonlyArray<Annotation> = model.board.undo.map((entry) => ({
    group: 'design',
    at: entry.at,
    label: entry.label,
  }))
  // The open Incident has its own Thread: it is one mark, with the SEV the Game holds.
  const marked = new Set(open.map((mark) => `${mark.group}:${Math.floor(mark.at)}`))
  const mail: Array<Annotation> = []
  for (const thread of model.board.inbox.mail) {
    const mark = markOfMail(t, thread)
    if (mark === null) continue
    for (const entry of thread.entries)
      if (!marked.has(`${mark.group}:${Math.floor(entry.time)}`))
        mail.push({ ...mark, at: entry.time })
  }
  const finished: Array<Annotation> = model.board.inbox.mail
    .filter((thread) => thread.key.startsWith('event:finished:'))
    .flatMap((thread) =>
      thread.entries.flatMap((entry) =>
        researchNamed(entry.text) === null
          ? []
          : [{ group: 'research' as const, at: entry.time, label: `⬡ ${t.dashboard.research}` }],
      ),
    )
  // The Era the Company is in began at the second the Game kept when its round closed.
  const game = model.board.game
  const era: ReadonlyArray<Annotation> =
    game.stage > 0 && game.stageAt > 0
      ? [
          {
            group: 'company',
            at: game.stageAt,
            label: `◇ ${t.catalog.eras[game.stage]?.name ?? ''}`,
          },
        ]
      : []
  return [...design, ...open, ...mail, ...finished, ...era].filter((mark) =>
    shown.includes(mark.group),
  )
}

/**
 * Exemplars (12 \"Practices\"): the three slowest seconds of the range, each pointing at one trace.
 * A one-minute Sample knows the Request kind that was slowest in it; the hour and quarter-hour
 * blocks keep no kind, so a longer range carries none.
 */
type Exemplar = Readonly<{ t: string; p99: number; kind: RequestKind }>

const exemplarsOf = (model: Model, rows: ReadonlyArray<Row>): ReadonlyArray<Exemplar> => {
  if (tierOf(model.board.dashboard.range) !== null) return []
  const history = model.board.game.history
  const kept = history.slice(Math.max(0, history.length - rows.length))
  const found: Array<Exemplar> = []
  kept.forEach((sample, index) => {
    const row = rows[index]
    if (sample.slow !== null && sample.p99 > 0 && row !== undefined)
      found.push({ t: String(row.t), p99: sample.p99, kind: sample.slow })
  })
  return found.toSorted((a, b) => b.p99 - a.p99).slice(0, 3)
}

const exemplarMarks = (
  exemplars: ReadonlyArray<Exemplar>,
  scale: number,
): ReadonlyArray<CartesianChild> =>
  exemplars.map((exemplar) =>
    ReferenceLine({
      x: exemplar.t,
      stroke: 'var(--accent)',
      strokeOpacity: 0.6,
      // Under every annotation label row, so an exemplar never draws over one.
      label: {
        value: '●',
        dx: 0,
        dy: TOP_OF_PLOT + ((LABEL_LANES + REVEAL_LANES) * LANE_HEIGHT + 6) * scale,
        fill: 'var(--accent)',
      },
    }),
  )

/** The exemplars as buttons: each opens the Waterfall of the Request kind it caught. */
const exemplarStrip = (exemplars: ReadonlyArray<Exemplar>, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Key('exemplars'), h.Class('col-span-24 flex flex-wrap items-center gap-2')],
    [
      h.span(
        [h.Class('text-[calc(12px*var(--type-scale))] text-muted-foreground')],
        [exemplars.length === 0 ? t.dashboard.noExemplarInThisRange : t.dashboard.exemplars],
      ),
      ...exemplars.map((exemplar) =>
        button(
          {
            size: 'sm',
            variant: 'outline',
            onClick: Message.DashboardChanged({
              message: DashboardMessage.KindChosen({ kind: exemplar.kind }),
            }),
            attributes: [h.Title(t.dashboard.openWaterfall(t.catalog.kinds[exemplar.kind].label))],
          },
          [
            `● ${exemplar.t} · ${formats(t).ms(exemplar.p99)} · ${t.catalog.kinds[exemplar.kind].label}`,
          ],
          h,
        ),
      ),
    ],
  )
}

/** The lane a mark's label draws in, and the offset that keeps it beside its line. */
type LabelPlace = Readonly<{ lane: number; dx: number }>

/** An Incident or a Deploy takes the room before a busy Design change takes it. */
const LABEL_ORDER: Record<AnnotationGroup, number> = {
  incidents: 0,
  company: 1,
  deploys: 2,
  design: 3,
  research: 4,
}

/** The label rows at the top of the plot: two, so a busy range still reads. */
const LABEL_LANES = 2
/** Rows under them, where the label a hover brings back draws without moving another. */
const REVEAL_LANES = 2
const LANE_HEIGHT = 12
/** Space between two labels in a lane, and the room the leading symbol takes. */
const LABEL_GAP = 6
const LABEL_PAD = 14
/** How near the crosshair, in plot pixels, a mark must sit to bring its label back. */
const REVEAL_PX = 4

const WIDE_GLYPH =
  /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/u

/** A label's width at the plot's 10px figure face: wide glyphs take two columns. */
const labelSpan = (label: string, scale: number): number =>
  [...label].reduce((width, glyph) => width + (WIDE_GLYPH.test(glyph) ? 12.4 : 6.2), LABEL_PAD) *
  scale

/**
 * Places the marks' labels in the rows at the top of the plot, an Incident before a Research.
 * A label goes in the first row where it clears the labels already there, and flips to the left
 * of its line where the right edge would clip it. A mark whose label fits nowhere keeps its line
 * and no text, so dense ranges never draw one label over another. The crosshair brings back the
 * labels the crowd dropped, in the rows under the two the chart always uses.
 */
const labelPlacesOf = (
  marks: ReadonlyArray<Annotation>,
  rows: ReadonlyArray<Row>,
  width: number,
  scale: number,
  hovered: number | null,
): ReadonlyMap<Annotation, LabelPlace> => {
  const lanes: Array<Array<readonly [number, number]>> = Array.from(
    { length: LABEL_LANES + REVEAL_LANES },
    () => [],
  )
  const placed = new Map<Annotation, LabelPlace>()
  const right = width - CHART_MARGIN.right

  /** Draws a mark's label in the first free row from `from` down, and reports whether it fit. */
  const place = (mark: Annotation, from: number): boolean => {
    const index = rowAt(rows, Math.floor(mark.at))
    if (index === null) return false
    const x = plotX(index, rows.length, width)
    const span = labelSpan(mark.label, scale)
    const dx = x + 4 + span > right ? -span - 4 : 4
    const start = x + dx - LABEL_GAP
    const end = x + dx + span + LABEL_GAP
    for (let lane = from; lane < lanes.length; lane += 1) {
      const taken = lanes[lane]
      if (taken === undefined || taken.some(([head, tail]) => start < tail && head < end)) continue
      taken.push([start, end])
      placed.set(mark, { lane, dx })
      return true
    }
    return false
  }

  const ordered = [...marks].sort(
    (left, right) => LABEL_ORDER[left.group] - LABEL_ORDER[right.group] || left.at - right.at,
  )
  const dropped: Array<Annotation> = []
  for (const mark of ordered) if (!place(mark, 0)) dropped.push(mark)

  // The crosshair names the marks its columns dropped, nearest first.
  if (hovered !== null) {
    const plotLeft = CHART_MARGIN.left + Y_AXIS_WIDTH + X_AXIS_PAD
    const rowWidth = (right - plotLeft) / Math.max(1, rows.length)
    const reach = Math.max(1, Math.round(REVEAL_PX / rowWidth))
    const near = dropped.flatMap((mark) => {
      const index = rowAt(rows, Math.floor(mark.at))
      if (index === null) return []
      const distance = Math.abs(index - hovered)
      return distance <= reach ? [{ mark, distance }] : []
    })
    near.sort(
      (left, right) =>
        left.distance - right.distance ||
        LABEL_ORDER[left.mark.group] - LABEL_ORDER[right.mark.group],
    )
    for (const { mark } of near) place(mark, LABEL_LANES)
  }
  return placed
}

/** The annotations, as vertical markers on every time series, labelled where the labels fit. */
const markersOf = (
  model: Model,
  rows: ReadonlyArray<Row>,
  width: number,
): ReadonlyArray<CartesianChild> => {
  const marks = annotationsOf(model)
  const scale = typeScaleOf(model)
  const hover = model.board.dashboard.hover
  const places = labelPlacesOf(
    marks,
    rows,
    width,
    scale,
    hover !== null && hover >= 0 && hover < rows.length ? hover : null,
  )
  return marks.flatMap((mark) => {
    const index = rowAt(rows, Math.floor(mark.at))
    const row = index === null ? undefined : rows[index]
    if (row === undefined) return []
    const color = ANNOTATION_COLOR[mark.group]
    const place = places.get(mark)
    return [
      ReferenceLine({
        x: String(row.t),
        stroke: color,
        strokeDasharray: '3 3',
        ...(place === undefined
          ? {}
          : {
              label: {
                value: mark.label,
                dx: place.dx,
                dy: TOP_OF_PLOT + place.lane * LANE_HEIGHT * scale,
                fill: color,
              },
            }),
      }),
    ]
  })
}

type Series = Readonly<{
  key: string
  name: string
  color: string
  /** Fill under the line with a fading gradient, as Grafana's opacity gradient mode. */
  fill?: boolean
  dashed?: boolean
  /** Drawn under the series that carry the Signal now: the compare line (12 "Controls"). */
  faint?: boolean
}>

type SeriesSpec = Readonly<{
  key: string
  span: string
  title: string
  unit: string
  series: ReadonlyArray<Series>
  format: (value: number) => string
  /** The field yesterday's line draws, where the Chart offers a compare (12 "Controls"). */
  compare?: Field
  rules?: ReadonlyArray<Readonly<{ y: number; label: string; color: string }>>
  domain?: readonly [number, number]
  width?: number
}>

const gradient = (id: string, color: string, h: HtmlBuilder<Message>): Html =>
  h.linearGradient(
    [
      h.Id(id),
      h.Attribute('x1', '0'),
      h.Attribute('y1', '0'),
      h.Attribute('x2', '0'),
      h.Attribute('y2', '1'),
    ],
    [
      h.stop(
        [
          h.Attribute('offset', '0%'),
          h.Attribute('stop-color', color),
          h.Attribute('stop-opacity', '0.45'),
        ],
        [],
      ),
      h.stop(
        [
          h.Attribute('offset', '100%'),
          h.Attribute('stop-color', color),
          h.Attribute('stop-opacity', '0'),
        ],
        [],
      ),
    ],
  )

/** The figures a series holds, skipping the moments its history does not reach. */
const figuresOf = (rows: ReadonlyArray<Row>, key: string): ReadonlyArray<number> =>
  rows.flatMap((row) => (typeof row[key] === 'number' ? [row[key] as number] : []))

/** The legend under a time series, in Grafana's list mode: swatch, name, mean, max, last. */
const seriesLegend = (
  rows: ReadonlyArray<Row>,
  series: ReadonlyArray<Series>,
  spec: SeriesSpec,
  hovered: Row | undefined,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('flex flex-wrap gap-x-4 gap-y-0.5 px-1.5 pb-0.5 text-[calc(11px*var(--type-scale))]')],
    [
      ...(hovered
        ? [h.span([h.Key('at'), h.Class(cn(FIGURE, 'text-muted-foreground'))], [String(hovered.t)])]
        : []),
      ...series.map((entry) => {
        const values = figuresOf(rows, entry.key)
        const last = values[values.length - 1] ?? 0
        const max = Math.max(...values)
        const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
        return h.span(
          [h.Key(entry.key), h.Class('flex items-center gap-1.5 whitespace-nowrap')],
          [
            h.span(
              [h.Class('h-[3px] w-3.5 rounded-full'), h.Style({ background: entry.color })],
              [],
            ),
            h.span([h.Class('text-foreground')], [entry.name]),
            h.span(
              [h.Class(cn(FIGURE, 'text-muted-foreground'))],
              hovered
                ? [spec.format(Number(hovered[entry.key]))]
                : [t.dashboard.meanMaxLast(spec.format(mean), spec.format(max), spec.format(last))],
            ),
          ],
        )
      }),
    ],
  )
}

/**
 * A Chart's values as a table, for a screen reader and for reading an exact figure: the same rows
 * the plot draws, one per time, in Grafana's table view (12 "Controls").
 */
const seriesTable = (
  data: ReadonlyArray<Row>,
  series: ReadonlyArray<Series>,
  spec: SeriesSpec,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const border = 'border-b border-hairline px-2 py-1'
  const figure = (row: Row, key: string): string => {
    const value = row[key]
    return typeof value === 'number' ? spec.format(value) : '—'
  }
  return h.div(
    [h.Class(cn(SCREEN, 'max-h-[210px] min-h-0 flex-1 overflow-auto px-1 pb-1', SCROLL))],
    [
      h.table(
        [
          h.DataAttribute('table', spec.key),
          h.Class('w-full border-collapse text-[calc(11.5px*var(--type-scale))]'),
        ],
        [
          h.caption([h.Class('sr-only')], [`${spec.title} · ${spec.unit}`]),
          h.thead(
            [],
            [
              h.tr(
                [h.Class('text-[calc(11px*var(--type-scale))] text-muted-foreground')],
                [
                  h.th([h.Class(cn(border, 'text-left font-medium'))], [t.dashboard.time]),
                  ...series.map((entry) =>
                    h.th(
                      [h.Key(entry.key), h.Class(cn(border, 'text-right font-medium'))],
                      [entry.name],
                    ),
                  ),
                ],
              ),
            ],
          ),
          h.tbody(
            [],
            data.map((row, index) =>
              h.tr(
                [h.Key(`${String(row.t)}-${index}`), h.Class('hover:bg-foreground/[0.03]')],
                [
                  h.td([h.Class(cn(border, FIGURE))], [String(row.t)]),
                  ...series.map((entry) =>
                    h.td(
                      [h.Key(entry.key), h.Class(cn(border, FIGURE, 'text-right'))],
                      [figure(row, entry.key)],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  )
}

const timeSeries = (
  model: Model,
  rows: ReadonlyArray<Row>,
  markers: ReadonlyArray<CartesianChild>,
  spec: SeriesSpec,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  const width = spec.width ?? CHART_WIDTH

  const hovered =
    model.board.dashboard.hover !== null ? rows[model.board.dashboard.hover] : undefined
  const id = (series: Series) => `fill-${spec.key}-${series.key}`
  const yesterday =
    spec.compare === undefined || !model.board.dashboard.compare
      ? null
      : yesterdayOf(model, rows, spec.compare)
  const compare =
    model.board.dashboard.compare && yesterday !== null && yesterday.some((value) => value !== null)
  const series: ReadonlyArray<Series> = compare
    ? [
        ...spec.series,
        { key: 'cmp', name: t.dashboard.yesterday, color: COMPARE_COLOR, faint: true },
      ]
    : spec.series
  const data: ReadonlyArray<Row> = compare
    ? rows.map((row, index) => ({ ...row, cmp: yesterday?.[index] ?? null }))
    : rows
  const line = (entry: Series): CartesianChild =>
    Line({
      dataKey: entry.key,
      name: entry.name,
      stroke: entry.color,
      strokeWidth: 1.5,
      type: 'linear',
      dot: false,
      activeDot: { r: 3, fill: entry.color, stroke: 'var(--card)' },
      ...(entry.faint ? { strokeDasharray: '5 3' } : {}),
      ...(entry.dashed ? { strokeDasharray: '4 3' } : {}),
    })
  return panel(
    spec.key,
    spec.span,
    spec.title,
    spec.unit,
    [
      ...(model.board.dashboard.table
        ? [seriesTable(data, series, spec, h)]
        : [
            h.div(
              [h.Class(cn(SCREEN, 'min-h-0 flex-1 px-1 pt-1'))],
              [
                ComposedChart(
                  {
                    data,
                    responsive: true,
                    width,
                    height: CHART_HEIGHT,
                    margin: CHART_MARGIN,
                    title: spec.title,
                    className: PLOT,
                    accessibilityLayer: true,
                    activeIndex: model.board.dashboard.hover,
                    onActiveIndexChange: (index) =>
                      Message.DashboardChanged({ message: DashboardMessage.Hovered({ index }) }),
                    defs: series
                      .filter((entry) => entry.fill)
                      .map((entry) => gradient(id(entry), entry.color, h)),
                    children: [
                      CartesianGrid({ stroke: 'var(--hairline)' }),
                      XAxis({
                        dataKey: 't',
                        interval: Math.max(0, Math.ceil(rows.length / (width / 70)) - 1),
                        padding: { left: X_AXIS_PAD },
                        // Ends the right-most label at the plot edge, so the well does not clip it.
                        tick: ({ x, y, value }) =>
                          h.text(
                            [
                              h.Attribute('x', String(x)),
                              h.Attribute('y', String(y - 14)),
                              h.Attribute('text-anchor', x + 30 > width ? 'end' : 'middle'),
                            ],
                            [String(value)],
                          ),
                        stroke: 'var(--hairline)',
                      }),
                      YAxis({
                        width: Y_AXIS_WIDTH,
                        tickCount: 5,
                        ...(spec.domain ? { domain: spec.domain } : {}),
                        tickFormatter: (value) => spec.format(Number(value)),
                        stroke: 'transparent',
                      }),
                      Tooltip({ content: 'none' }),
                      ...(spec.rules ?? []).map((rule) =>
                        ReferenceLine({
                          y: rule.y,
                          stroke: rule.color,
                          strokeDasharray: '6 4',
                          label: { value: rule.label, dy: -6, fill: rule.color },
                        }),
                      ),
                      ...markers,
                      ...(hovered
                        ? [
                            ReferenceLine({
                              x: String(hovered.t),
                              stroke: 'var(--foreground)',
                              strokeOpacity: 0.4,
                            }),
                          ]
                        : []),
                      // Yesterday goes under the series that carry the signal now.
                      ...series.filter((entry) => entry.faint).map(line),
                      ...series
                        .filter((entry) => !entry.faint)
                        .map((entry) =>
                          entry.fill
                            ? Area({
                                dataKey: entry.key,
                                name: entry.name,
                                stroke: entry.color,
                                strokeWidth: 1.5,
                                fill: `url(#${id(entry)})`,
                                fillOpacity: 1,
                                type: 'linear',
                              })
                            : line(entry),
                        ),
                    ],
                  },
                  h,
                ),
              ],
            ),
          ]),
      seriesLegend(data, series, spec, hovered, h),
    ],
    h,
    null,
    spec.series[0]?.color,
  )
}

/** A sparkline's bounds: room above the peak, so a flat history is a line, not a slab, and the
    zero line for a figure that can fall below it, such as Cash per second. */
const sparkDomain = (
  rows: ReadonlyArray<Row>,
  key: string,
  signed: boolean,
): readonly [number, number] => {
  const values = figuresOf(rows, key)
  const top = Math.max(1e-9, ...values) * 1.6
  return signed ? [Math.min(0, ...values), top] : [0, top]
}

/** Grafana's stat panel: one big coloured value over a sparkline of its history. */
const stat = (
  key: string,
  title: string,
  value: string,
  level: Level | 'plain',
  rows: ReadonlyArray<Row>,
  dataKey: string,
  color: string,
  h: HtmlBuilder<Message>,
  background = false,
  signed = false,
): Html =>
  panel(
    key,
    'col-span-4 compact:col-span-12',
    title,
    '',
    [
      h.div(
        [
          h.Class(
            cn(SCREEN, 'relative flex min-h-[92px] flex-1 flex-col justify-end overflow-hidden'),
          ),
          ...(background && level !== 'plain' && level !== 'ok'
            ? [
                h.Style({
                  background: `color-mix(in oklab, ${LEVEL_COLOR[level]} 18%, var(--well))`,
                }),
              ]
            : []),
        ],
        [
          h.div(
            [h.Class('absolute inset-x-0 bottom-0 h-[46px] opacity-90')],
            [
              ComposedChart(
                {
                  title,
                  data: rows,
                  responsive: true,
                  width: 260,
                  height: 46,
                  margin: { top: 0, right: 0, bottom: 0, left: 0 },
                  defs: [gradient(`stat-${key}`, color, h)],
                  children: [
                    XAxis({ dataKey: 't', hide: true }),
                    YAxis({ hide: true, domain: sparkDomain(rows, dataKey, signed) }),
                    Area({
                      dataKey,
                      stroke: color,
                      strokeWidth: 1.25,
                      fill: `url(#stat-${key})`,
                      fillOpacity: 1,
                      type: 'linear',
                    }),
                  ],
                },
                h,
              ),
            ],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'relative px-3 pb-7 text-[calc(30px*var(--type-scale))] leading-none font-medium tracking-[-0.03em] [text-shadow:0_1px_0_var(--highlight)]',
                ),
              ),
              h.Style({ color: level === 'plain' ? 'var(--foreground)' : LEVEL_COLOR[level] }),
            ],
            [value],
          ),
        ],
      ),
    ],
    h,
    null,
    level === 'plain' ? color : LEVEL_COLOR[level],
  )

/** A point on a circle, for the gauge arcs; 0° points right and angles grow clockwise. */
const point = (cx: number, cy: number, r: number, degrees: number): string => {
  const radians = (degrees * Math.PI) / 180
  return `${(cx + r * Math.cos(radians)).toFixed(2)} ${(cy + r * Math.sin(radians)).toFixed(2)}`
}
const arc = (cx: number, cy: number, r: number, from: number, to: number): string =>
  `M ${point(cx, cy, r, from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${point(cx, cy, r, to)}`

/** Grafana's gauge: a 240° arc with the threshold bands drawn as a thin outer ring. */
const gauge = (
  key: string,
  title: string,
  share: number,
  label: string,
  thresholds: Thresholds,
  h: HtmlBuilder<Message>,
): Html => {
  const START = 150
  const SWEEP = 240
  const at = (value: number) => START + SWEEP * Math.min(1, Math.max(0, value))
  const level = levelOf(share, thresholds)
  const bands: ReadonlyArray<readonly [number, number, Level]> = thresholds.invert
    ? [
        [0, thresholds.danger, 'danger'],
        [thresholds.danger, thresholds.warn, 'warn'],
        [thresholds.warn, 1, 'ok'],
      ]
    : [
        [0, thresholds.warn, 'ok'],
        [thresholds.warn, thresholds.danger, 'warn'],
        [thresholds.danger, 1, 'danger'],
      ]
  return panel(
    key,
    'col-span-4 compact:col-span-12',
    title,
    '',
    [
      h.div(
        [h.Class(cn(SCREEN, 'grid flex-1 place-items-center px-2 pt-2'))],
        [
          h.svg(
            [h.ViewBox('0 0 200 140'), h.Class('h-[112px] w-full max-w-[220px]')],
            [
              ...bands.map(([from, to, band]) =>
                h.path(
                  [
                    h.Key(band),
                    h.Attribute('d', arc(100, 92, 84, at(from) + 0.6, at(to) - 0.6)),
                    h.Attribute('fill', 'none'),
                    h.Attribute('stroke', LEVEL_COLOR[band]),
                    h.Attribute('stroke-width', '3'),
                  ],
                  [],
                ),
              ),
              h.path(
                [
                  h.Attribute('d', arc(100, 92, 70, START, START + SWEEP)),
                  h.Attribute('fill', 'none'),
                  h.Attribute('stroke', 'var(--hairline)'),
                  h.Attribute('stroke-width', '16'),
                ],
                [],
              ),
              share > 0.002
                ? h.path(
                    [
                      h.Attribute('d', arc(100, 92, 70, START, at(share))),
                      h.Attribute('fill', 'none'),
                      h.Attribute('stroke', LEVEL_COLOR[level]),
                      h.Attribute('stroke-width', '16'),
                    ],
                    [],
                  )
                : h.empty,
              h.text(
                [
                  h.Attribute('x', '100'),
                  h.Attribute('y', '100'),
                  h.Attribute('text-anchor', 'middle'),
                  h.Attribute('fill', LEVEL_COLOR[level]),
                  h.Class(
                    'font-mono text-[calc(30px*var(--type-scale))] font-medium tracking-[-0.03em]',
                  ),
                ],
                [label],
              ),
            ],
          ),
        ],
      ),
    ],
    h,
    null,
    LEVEL_COLOR[level],
  )
}

const UTILIZATION: Thresholds = { warn: 0.7, danger: 0.9 }
const CELLS = 32

/** Grafana's retro LCD bar gauge: lit cells take the colour of the threshold they sit in. */
const lcd = (share: number, h: HtmlBuilder<Message>, cells = CELLS): Html =>
  h.div(
    [h.Class('flex h-full min-w-0 flex-1 gap-[2px] rounded-md bg-well p-[3px] shadow-well')],
    Array.from({ length: cells }, (_, index) => {
      const position = (index + 0.5) / cells
      const lit = position <= Math.min(share, 1)
      return h.span(
        [
          h.Key(String(index)),
          h.Class('min-w-0 flex-1 rounded-[2px]'),
          h.Style({
            background: lit
              ? LEVEL_COLOR[levelOf(position, UTILIZATION)]
              : `color-mix(in oklab, ${LEVEL_COLOR[levelOf(position, UTILIZATION)]} 10%, transparent)`,
          }),
        ],
        [],
      )
    }),
  )

const barGauge = (
  ledger: Ledger,
  tracks: ReadonlyArray<NodeTrack>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return panel(
    'bar-gauge',
    'col-span-8',
    t.dashboard.utilizationNow,
    t.dashboard.ofCapacity,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 flex-col justify-center gap-2.5 p-3'))],
        tracks.map((track) => {
          const share = ledger.nodes[track.id]?.utilization ?? 0
          return h.div(
            [h.Key(track.id), h.Class('flex flex-col gap-1')],
            [
              h.div(
                [
                  h.Class(
                    'flex items-baseline justify-between text-[calc(11.5px*var(--type-scale))]',
                  ),
                ],
                [
                  h.span([h.Class('text-muted-foreground')], [track.name]),
                  h.span(
                    [
                      h.Class(cn(FIGURE, 'text-[calc(13px*var(--type-scale))]')),
                      h.Style({ color: LEVEL_COLOR[levelOf(share, UTILIZATION)] }),
                    ],
                    [percent(Math.min(share, 9.99))],
                  ),
                ],
              ),
              h.div([h.Class('flex h-5')], [lcd(share, h)]),
            ],
          )
        }),
      ),
    ],
    h,
  )
}

const stateLabelOf = (t: Messages): Record<Level, string> => ({
  ok: t.dashboard.oK,
  warn: t.dashboard.hIGH,
  danger: t.dashboard.sATURATED,
})

/** A run of one state in a lane: the columns it covers, and how it draws. */
type Run = Readonly<{ from: number; to: number; color: string; label: string }>

/** One lane of a state timeline: its name, and its runs. */
type Lane = Readonly<{ key: string; name: string; runs: ReadonlyArray<Run> }>

/** Runs of the same state, one column per entry, starting at `offset`. */
const runsOf = <S extends string>(
  states: ReadonlyArray<S>,
  offset: number,
  describe: (state: S) => Readonly<{ color: string; label: string }>,
): ReadonlyArray<Run> => {
  const out: Array<{ state: S; from: number; to: number }> = []
  states.forEach((state, index) => {
    const run = out[out.length - 1]
    if (run && run.state === state) run.to = offset + index + 1
    else out.push({ state, from: offset + index, to: offset + index + 1 })
  })
  return out.map((run) => ({ from: run.from, to: run.to, ...describe(run.state) }))
}

/** A colour swatch and a name, for a timeline's legend. */
const swatch = (name: string, color: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Key(name), h.Class('flex items-center gap-1.5')],
    [h.span([h.Class('h-2 w-2.5 rounded-[2px]'), h.Style({ background: color })], []), name],
  )

/** Grafana's state timeline: one lane per series, a block per run of the same state. */
const laneTimeline = (
  key: string,
  span: string,
  title: string,
  unit: string,
  lanes: ReadonlyArray<Lane>,
  length: number,
  first: number,
  last: number,
  h: HtmlBuilder<Message>,
  legend: ReadonlyArray<Html> = [],
): Html =>
  panel(
    key,
    span,
    title,
    unit,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 flex-col justify-center gap-1.5 p-3'))],
        [
          ...lanes.map((lane) =>
            h.div(
              [h.Key(lane.key), h.Class('flex items-center gap-3')],
              [
                h.span(
                  [
                    h.Class(
                      'w-28 shrink-0 truncate text-[calc(11.5px*var(--type-scale))] text-muted-foreground',
                    ),
                  ],
                  [lane.name],
                ),
                h.div(
                  [
                    h.Class(
                      'relative h-7 min-w-0 flex-1 overflow-hidden rounded-md bg-card shadow-[inset_0_0_0_1px_var(--hairline)]',
                    ),
                  ],
                  lane.runs.map((run, index) =>
                    h.div(
                      [
                        h.Key(String(index)),
                        h.Class(
                          cn(
                            FIGURE,
                            'absolute inset-y-[3px] flex items-center overflow-hidden rounded-[3px] px-1.5 text-[calc(10px*var(--type-scale))] font-medium whitespace-nowrap text-black/70 shadow-[inset_0_1px_0_oklch(1_0_0/0.35)]',
                          ),
                        ),
                        h.Style({
                          left: `calc(${(run.from / length) * 100}% + 1px)`,
                          width: `calc(${((run.to - run.from) / length) * 100}% - 2px)`,
                          background: run.color,
                        }),
                        h.Title(`${lane.name}: ${run.label}`),
                      ],
                      [(run.to - run.from) / length > 0.08 ? run.label : ''],
                    ),
                  ),
                ),
              ],
            ),
          ),
          h.div(
            [
              h.Class(
                cn(
                  FIGURE,
                  'flex justify-between pl-[124px] text-[calc(10px*var(--type-scale))] text-muted-foreground',
                ),
              ),
            ],
            [
              h.span([], [hhmm(first)]),
              h.span([], [hhmm(first + (last - first) / 2)]),
              h.span([], [hhmm(last)]),
            ],
          ),
          ...(legend.length === 0
            ? []
            : [
                h.div(
                  [
                    h.Class(
                      'flex flex-wrap gap-x-3 gap-y-1 pl-[124px] text-[calc(10px*var(--type-scale))]',
                    ),
                  ],
                  legend,
                ),
              ]),
        ],
      ),
    ],
    h,
  )

/** Grafana's state timeline of Node utilization: one lane per Node. */
const stateTimeline = (
  model: Model,
  tracks: ReadonlyArray<NodeTrack>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const length = Math.max(1, ...tracks.map((track) => track.values.length))
  const last = Math.floor(model.board.game.time / NODE_EVERY) * NODE_EVERY
  const first = last - (length - 1) * NODE_EVERY
  const lanes = tracks.map((track) => ({
    key: track.id,
    name: track.name,
    runs: runsOf(
      track.values.map((value) => levelOf(value, UTILIZATION)),
      length - track.values.length,
      (level) => ({ color: LEVEL_COLOR[level], label: stateLabelOf(t)[level] }),
    ),
  }))
  return laneTimeline(
    'state-timeline',
    'col-span-16',
    t.dashboard.nodeState,
    t.dashboard.utilizationLast24H,
    lanes,
    length,
    first,
    last,
    h,
  )
}

const kindColor = (kind: Kind): string => `#${KINDS[kind].color.toString(16).padStart(6, '0')}`

/** The request mix now, as Grafana's donut with a table legend. `kind` narrows it to one Service. */
const mix = (
  ledger: Ledger,
  shown: (kind: RequestKind) => boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[Kind, { rate: number; p99: number }]>
  )
    .filter(([entryKind, entry]) => entry.rate > 0 && shown(entryKind as RequestKind))
    .sort((a, b) => b[1].rate - a[1].rate)
  const total = kinds.reduce((sum, [, entry]) => sum + entry.rate, 0)
  return panel(
    'mix',
    'col-span-8',
    t.dashboard.requestMix,
    t.dashboard.reqPerSecondByKind,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 items-center gap-3 p-3'))],
        [
          h.div(
            [h.Class('w-[118px] shrink-0')],
            [
              PieChart(
                {
                  title: t.dashboard.requestMix,
                  data: kinds.map(([kind, entry]) => ({ name: kind, value: entry.rate })),
                  width: 120,
                  height: 120,
                  responsive: true,
                  children: [
                    Pie({
                      dataKey: 'value',
                      nameKey: 'name',
                      innerRadius: '58%',
                      outerRadius: '96%',
                      paddingAngle: 2,
                      stroke: 'var(--card)',
                      colors: kinds.map(([kind]) => kindColor(kind)),
                    }),
                  ],
                },
                h,
              ),
            ],
          ),
          h.table(
            [h.Class('w-full text-[calc(11.5px*var(--type-scale))]')],
            [
              h.tbody(
                [],
                kinds.map(([kind, entry]) =>
                  h.tr(
                    [h.Key(kind)],
                    [
                      h.td(
                        [h.Class('py-0.5')],
                        [
                          h.span(
                            [h.Class('flex items-center gap-1.5')],
                            [
                              h.span(
                                [
                                  h.Class('size-2 rounded-[2px]'),
                                  h.Style({ background: kindColor(kind) }),
                                ],
                                [],
                              ),
                              h.span(
                                [h.Class('font-mono text-[calc(11px*var(--type-scale))]')],
                                [kind],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.td(
                        [h.Class(cn(FIGURE, 'py-0.5 text-right'))],
                        [t.dashboard.s(compact(entry.rate))],
                      ),
                      h.td(
                        [h.Class(cn(FIGURE, 'w-12 py-0.5 text-right text-muted-foreground'))],
                        [percent(total > 0 ? entry.rate / total : 0)],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
    h,
  )
}

/** Errors now, by cause, as Grafana's basic bar gauge. */
const causes = (ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const entries = ERROR_CAUSES.map((cause) => [cause, ledger.errors[cause]] as const)
    .filter(([, rate]) => rate > 0.0005)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const max = Math.max(...entries.map(([, rate]) => rate), 0.001)
  return panel(
    'causes',
    'col-span-8',
    t.dashboard.errorsByCause,
    t.dashboard.reqPerSecondNow,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 flex-col justify-center gap-1.5 p-3'))],
        entries.length === 0
          ? [
              h.span(
                [h.Key('none'), h.Class(cn(FIGURE, 'text-[calc(28px*var(--type-scale))] text-ok'))],
                [t.dashboard.n0Errors],
              ),
            ]
          : entries.map(([cause, rate]) =>
              h.div(
                [
                  h.Key(cause),
                  h.Class('grid grid-cols-[72px_minmax(0,1fr)_56px] items-center gap-2'),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        'font-mono text-[calc(11px*var(--type-scale))] text-muted-foreground',
                      ),
                    ],
                    [t.dashboard.errorCauses[cause]],
                  ),
                  h.div(
                    [
                      h.Class(
                        'h-3.5 rounded-[3px] bg-card shadow-[inset_0_0_0_1px_var(--hairline)]',
                      ),
                    ],
                    [
                      h.div(
                        [
                          h.Class('h-full rounded-[2px]'),
                          h.Style({
                            width: `${(rate / max) * 100}%`,
                            background: `linear-gradient(90deg, color-mix(in oklab, ${RED} 35%, transparent), ${RED})`,
                          }),
                        ],
                        [],
                      ),
                    ],
                  ),
                  h.span(
                    [h.Class(cn(FIGURE, 'text-right text-[calc(11.5px*var(--type-scale))]'))],
                    [t.dashboard.s(compact(rate))],
                  ),
                ],
              ),
            ),
      ),
    ],
    h,
  )
}

/** Every Node in one table, with Grafana's coloured cells for load and status. */
const nodeTable = (
  ledger: Ledger,
  tracks: ReadonlyArray<NodeTrack>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const sorted = [...tracks].sort(
    (a, b) => (ledger.nodes[b.id]?.utilization ?? 0) - (ledger.nodes[a.id]?.utilization ?? 0),
  )
  const head = [
    t.dashboard.node,
    t.dashboard.inbound,
    t.dashboard.capacity,
    t.dashboard.load,
    t.dashboard.latency,
    'p99',
    t.dashboard.dropped,
    t.dashboard.status,
  ]
  return panel(
    'nodes',
    'col-span-24',
    t.dashboard.nodes,
    t.dashboard.rows(tracks.length),
    [
      h.div(
        [h.Class(cn(SCREEN, 'px-1 pb-1', SCROLL))],
        [
          h.table(
            [h.Class('w-full min-w-[720px] border-collapse text-[calc(12px*var(--type-scale))]')],
            [
              h.thead(
                [],
                [
                  h.tr(
                    [h.Class('text-[calc(11px*var(--type-scale))] text-muted-foreground')],
                    head.map((label, index) =>
                      h.th(
                        [
                          h.Key(label),
                          h.Class(
                            cn(
                              'border-b border-hairline px-2 py-1.5 font-medium',
                              index === 0
                                ? 'text-left'
                                : index === 3
                                  ? 'w-[30%] text-left'
                                  : 'text-right',
                            ),
                          ),
                        ],
                        [label],
                      ),
                    ),
                  ),
                ],
              ),
              h.tbody(
                [],
                sorted.map((track) => {
                  const own = ledger.nodes[track.id]
                  const share = own?.utilization ?? 0
                  const level = own?.status === 'down' ? 'danger' : levelOf(share, UTILIZATION)
                  const cell = 'border-b border-hairline px-2 py-1.5'
                  return h.tr(
                    [h.Key(track.id), h.Class('hover:bg-foreground/[0.03]')],
                    [
                      h.td([h.Class(cn(cell, 'font-medium'))], [track.name]),
                      h.td(
                        [h.Class(cn(cell, FIGURE, 'text-right'))],
                        [t.dashboard.s(compact(own?.inbound ?? 0))],
                      ),
                      h.td(
                        [h.Class(cn(cell, FIGURE, 'text-right text-muted-foreground'))],
                        [t.dashboard.s(compact(own?.capacity ?? 0))],
                      ),
                      h.td(
                        [h.Class(cell)],
                        [
                          h.div(
                            [h.Class('flex h-3.5 items-center gap-2')],
                            [
                              lcd(share, h, 24),
                              h.span(
                                [
                                  h.Class(cn(FIGURE, 'w-11 text-right')),
                                  h.Style({ color: LEVEL_COLOR[levelOf(share, UTILIZATION)] }),
                                ],
                                [percent(Math.min(share, 9.99))],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.td(
                        [h.Class(cn(cell, FIGURE, 'text-right'))],
                        [formats(t).ms(own?.latency ?? 0)],
                      ),
                      h.td(
                        [h.Class(cn(cell, FIGURE, 'text-right'))],
                        [formats(t).ms(own?.p99 ?? 0)],
                      ),
                      h.td(
                        [
                          h.Class(
                            cn(
                              cell,
                              FIGURE,
                              'text-right',
                              (own?.dropped ?? 0) > 0.05 ? 'text-danger' : 'text-muted-foreground',
                            ),
                          ),
                        ],
                        [t.dashboard.s(compact(own?.dropped ?? 0))],
                      ),
                      h.td(
                        [
                          h.Class(
                            cn(
                              cell,
                              FIGURE,
                              'text-right text-[calc(11px*var(--type-scale))] font-medium text-black/75',
                            ),
                          ),
                          h.Style({
                            background: `color-mix(in oklab, ${LEVEL_COLOR[level]} 85%, transparent)`,
                          }),
                        ],
                        [own?.status === 'down' ? t.dashboard.down : stateLabelOf(t)[level]],
                      ),
                    ],
                  )
                }),
              ),
            ],
          ),
        ],
      ),
    ],
    h,
  )
}

/** One cell of a table: its text, and optionally a colour, a fill, or a gauge bar. */
type Cell = Readonly<{
  text: string
  /** The text's colour, as Grafana's cell colour mode. */
  color?: string | undefined
  /** A background fill in this colour, as the Node table's status cell. */
  fill?: string | undefined
  /** A gauge bar in the cell, 0 to 1. */
  bar?: Readonly<{ share: number; color: string }> | undefined
  /** A tooltip, as the lane blocks' titles. */
  hint?: string | undefined
  /** A button in the cell, for a row that selects something. */
  onClick?: Message | undefined
}>

/** Grafana's table: hairline rows, figures to the right, coloured and filled cells. */
const tablePanel = (
  key: string,
  span: string,
  title: string,
  unit: string,
  head: ReadonlyArray<string>,
  rows: ReadonlyArray<Readonly<{ key: string; cells: ReadonlyArray<Cell> }>>,
  h: HtmlBuilder<Message>,
  /** A plot under the table, as the Money card's Cash series. */
  extra: ReadonlyArray<Html> = [],
): Html => {
  const border = 'border-b border-hairline px-2 py-1.5'
  return panel(
    key,
    span,
    title,
    unit,
    [
      h.div(
        [h.Class(cn(SCREEN, 'px-1 pb-1', SCROLL))],
        rows.length === 0
          ? [
              h.span(
                [
                  h.Key('none'),
                  h.Class(
                    cn(
                      FIGURE,
                      'px-2 py-3 text-[calc(12px*var(--type-scale))] text-muted-foreground',
                    ),
                  ),
                ],
                [copy(h).dashboard.nothingToShowYet],
              ),
            ]
          : [
              h.table(
                [h.Class('w-full border-collapse text-[calc(12px*var(--type-scale))]')],
                [
                  h.thead(
                    [],
                    [
                      h.tr(
                        [h.Class('text-[calc(11px*var(--type-scale))] text-muted-foreground')],
                        head.map((label, index) =>
                          h.th(
                            [
                              h.Key(label),
                              h.Class(
                                cn(border, 'font-medium', index === 0 ? 'text-left' : 'text-right'),
                              ),
                            ],
                            [label],
                          ),
                        ),
                      ),
                    ],
                  ),
                  h.tbody(
                    [],
                    rows.map((row) =>
                      h.tr(
                        [h.Key(row.key), h.Class('hover:bg-foreground/[0.03]')],
                        row.cells.map((cell, index) =>
                          h.td(
                            [
                              h.Key(head[index] ?? String(index)),
                              h.Class(
                                cn(
                                  border,
                                  index === 0 ? 'font-medium' : cn(FIGURE, 'text-right'),
                                  cell.fill === undefined
                                    ? undefined
                                    : 'text-[calc(11px*var(--type-scale))] font-medium text-black/75',
                                ),
                              ),
                              ...(cell.fill === undefined
                                ? []
                                : [
                                    h.Style({
                                      background: `color-mix(in oklab, ${cell.fill} 85%, transparent)`,
                                    }),
                                  ]),
                              ...(cell.hint === undefined ? [] : [h.Title(cell.hint)]),
                            ],
                            cell.bar === undefined
                              ? [
                                  cell.onClick === undefined
                                    ? h.span(
                                        cell.color === undefined
                                          ? []
                                          : [h.Style({ color: cell.color })],
                                        [cell.text],
                                      )
                                    : h.button(
                                        [
                                          h.Type('button'),
                                          h.OnClick(cell.onClick),
                                          h.Class(
                                            'text-left font-medium underline-offset-2 hover:underline',
                                          ),
                                          ...(cell.hint === undefined ? [] : [h.Title(cell.hint)]),
                                        ],
                                        [cell.text],
                                      ),
                                ]
                              : [
                                  h.div(
                                    [h.Class('flex h-3.5 items-center gap-2')],
                                    [
                                      lcd(cell.bar.share, h, 24),
                                      h.span([h.Class(cn(FIGURE, 'w-11 text-right'))], [cell.text]),
                                    ],
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
      ...extra,
    ],
    h,
  )
}

/** Grafana's basic bar gauge: a labelled row, a bar scaled to the largest, and its figure. */
const barList = (
  key: string,
  span: string,
  title: string,
  unit: string,
  entries: ReadonlyArray<
    Readonly<{ key: string; name: string; value: number; text: string; color?: string }>
  >,
  h: HtmlBuilder<Message>,
): Html => {
  const widest = Math.max(...entries.map((entry) => Math.abs(entry.value)), 1e-9)
  return panel(
    key,
    span,
    title,
    unit,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 flex-col justify-center gap-1.5 p-3'))],
        entries.length === 0
          ? [
              h.span(
                [
                  h.Key('none'),
                  h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground')),
                ],
                [copy(h).dashboard.noNodeToShow],
              ),
            ]
          : entries.map((entry) => {
              const color = entry.color ?? BLUE
              return h.div(
                [
                  h.Key(entry.key),
                  h.Class('grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_60px] items-center gap-2'),
                ],
                [
                  h.span(
                    [
                      h.Class(
                        'truncate text-[calc(11.5px*var(--type-scale))] text-muted-foreground',
                      ),
                    ],
                    [entry.name],
                  ),
                  h.div(
                    [
                      h.Class(
                        'h-3.5 rounded-[3px] bg-card shadow-[inset_0_0_0_1px_var(--hairline)]',
                      ),
                    ],
                    [
                      h.div(
                        [
                          h.Class('h-full rounded-[2px]'),
                          h.Style({
                            width: `${Math.max(2, (Math.abs(entry.value) / widest) * 100)}%`,
                            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 35%, transparent), ${color})`,
                          }),
                        ],
                        [],
                      ),
                    ],
                  ),
                  h.span(
                    [h.Class(cn(FIGURE, 'text-right text-[calc(11.5px*var(--type-scale))]'))],
                    [entry.text],
                  ),
                ],
              )
            }),
      ),
    ],
    h,
  )
}

/**
 * The Money card's Cash series: the same Area the stat panels draw, over the
 * Dashboard's range. A Sample carries Cash since SIM_VERSION 26, so the row
 * that shows Cash now also shows where it has been (15 "Company and Incidents
 * panels"). The line turns red once Cash is short, like the HUD's figure.
 */
const cashSpark = (rows: ReadonlyArray<Row>, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const values = rows.map((row) => Number(row.cash))
  const short = (values[values.length - 1] ?? 0) < 0
  const color = short ? RED : GREEN
  const spec: SeriesSpec = {
    key: 'cash-series',
    span: '',
    title: t.dashboard.cash,
    unit: '$',
    series: [{ key: 'cash', name: t.dashboard.cash, color }],
    format: (value) => money(value),
  }
  return h.div(
    [h.Class('mt-1.5 flex shrink-0 flex-col gap-0.5')],
    [
      h.div(
        [h.Class(cn(SCREEN, 'relative flex h-[76px] flex-col justify-end px-1 pt-1'))],
        [
          ComposedChart(
            {
              title: t.dashboard.cash,
              data: rows,
              responsive: true,
              width: 320,
              height: 76,
              margin: { top: 4, right: 6, bottom: 2, left: 6 },
              defs: [gradient('cash-series', color, h)],
              children: [
                XAxis({ dataKey: 't', hide: true }),
                // Cash can run below zero, so the axis starts at the lowest point, not at zero.
                YAxis({
                  hide: true,
                  domain: [Math.min(0, ...values), Math.max(1, ...values) * 1.1],
                }),
                ReferenceLine({ y: 0, stroke: MUTED, strokeDasharray: '3 3' }),
                Tooltip({ content: 'none' }),
                Area({
                  dataKey: 'cash',
                  name: t.dashboard.cash,
                  stroke: color,
                  strokeWidth: 1.5,
                  fill: 'url(#cash-series)',
                  fillOpacity: 1,
                  type: 'linear',
                }),
              ],
            },
            h,
          ),
        ],
      ),
      seriesLegend(rows, spec.series, spec, undefined, h),
    ],
  )
}

const companyPanels = (
  model: Model,
  ledger: Ledger,
  rows: ReadonlyArray<Row>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const game = model.board.game
  const net = ledger.revenue - ledger.burn
  const runway = runwayOf(game, ledger)
  const teams = teamOutputs(game, ledger)
  const people = teams.reduce((sum, entry) => sum + entry.headcount, 0)
  // A layoff's morale hit is global and already inside each team's velocity (08 "Hiring").
  const morale = game.time < game.moraleUntil
  const teamUnit = `${t.dashboard.peopleAndVelocity(people)}${
    morale ? t.dashboard.moraleDrop(Math.round((1 - LAYOFF_MORALE) * 100)) : ''
  }`
  const credits = slaCreditsOf(game, ledger)
  const moneyRows: ReadonlyArray<readonly [string, string, Message?]> = [
    [t.dashboard.cash, money(game.cash)],
    [t.dashboard.revenue, t.dashboard.s(money(ledger.revenue))],
    [t.dashboard.burn, t.dashboard.s(money(ledger.burn))],
    [t.dashboard.net, t.dashboard.s2(net >= 0 ? '+' : '', money(net))],
    [t.dashboard.payroll, t.dashboard.s(money(ledger.salaries))],
    [t.dashboard.equity, percent(game.equity)],
    [t.dashboard.runway, runwayText(t, runway)],
    // The SLA pays its credits back on top of Burn, so Cash falls faster than the bill (09).
    ...(credits > 0
      ? [[t.dashboard.sLACredits, `−${t.units.perSecond(money(credits))}`] as const]
      : []),
    // Cash is short and the investors' bridge waits: its terms and the way to take it (09).
    ...(game.bridge._tag === 'Offered'
      ? [
          [
            t.dashboard.bridge,
            `${money(game.bridge.grant)} · ${percent(game.bridge.dilution)} · ${t.dashboard.accept}`,
            Message.BridgeAccepted(),
          ] as const,
        ]
      : []),
  ]
  return [
    tablePanel(
      'company-money',
      'col-span-8',
      t.dashboard.money,
      t.dashboard.nowCash(rangeLabel(t, model.board.dashboard.range)),
      [t.dashboard.line, t.dashboard.value],
      moneyRows.map(([name, value, onClick]) => ({
        key: name,
        cells: [
          { text: name },
          onClick === undefined
            ? { text: value }
            : {
                text: value,
                onClick,
                hint: t.dashboard.bridgeHint,
              },
        ],
      })),
      h,
      [cashSpark(rows, h)],
    ),
    tablePanel(
      'company-team',
      'col-span-16',
      t.dashboard.team,
      teamUnit,
      [
        t.dashboard.team,
        t.dashboard.kindHead,
        t.dashboard.people,
        t.dashboard.effective,
        t.dashboard.velocity,
        t.dashboard.devHoursPerMinute,
      ],
      teams.map((entry) => ({
        key: entry.team.id,
        cells: [
          { text: teamName(t, entry.team) },
          { text: teamKindOf(t)[entry.team.kind] },
          { text: String(entry.headcount) },
          { text: entry.effective.toFixed(1) },
          { text: `×${entry.velocity.toFixed(2)}` },
          { text: dhPerMinute(entry.devHoursPerSecond) },
        ],
      })),
      h,
    ),
    tablePanel(
      'company-funding',
      'col-span-24',
      t.dashboard.funding,
      t.dashboard.roundsFromTheInbox,
      [
        t.dashboard.round,
        t.dashboard.atUsers,
        t.dashboard.grant,
        t.dashboard.dilution,
        t.dashboard.answer,
        t.dashboard.when,
      ],
      fundingOf(model).map((round) => ({
        key: round.key,
        cells: [
          { text: round.name },
          { text: round.users.toLocaleString('en-US') },
          { text: round.grant === null ? t.dashboard.publicMarket : money(round.grant) },
          { text: percent(round.dilution) },
          {
            text: round.answer === null ? '—' : t.dashboard.fundingAnswers[round.answer],
            color: round.answer === 'raised' ? GREEN : round.answer === 'declined' ? AMBER : MUTED,
          },
          { text: round.when },
        ],
      })),
      h,
    ),
  ]
}

/** SEV1 is the worst Incident, so the bars soften down the game's hues as the SEV does. */
const SEVERITY_COLOR: Readonly<Record<number, string>> = { 1: RED, 2: AMBER, 3: PURPLE }

/** A run's two spans before it was live: nobody had seen it yet, then nobody had answered. */
const UNSEEN = MUTED
const AWAITING = BLUE

/**
 * The Incident history on the Dashboard's time axis (15 "Company and Incidents
 * panels"): one lane per Postmortem, from the second its run began to the one it
 * ended at, and the running Incident as the last lane. A lane splits at the two
 * moments of the incident loop, the first signal and the acknowledgement, so the
 * spans before each show. The axis is the rows the Charts above draw, so a run
 * lines up with the traffic that ran beside it. A Postmortem saved before
 * `endedAt` has no time to place it at, so it stays in the table only.
 */
const incidentTimeline = (
  model: Model,
  rows: ReadonlyArray<Row>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const game = model.board.game
  const range = model.board.dashboard.range
  const first = Number(rows[0]?.at ?? Math.floor(game.time))
  const last = Number(rows[rows.length - 1]?.at ?? first) + Number(rows[rows.length - 1]?.span ?? 1)
  const span = Math.max(1, last - first)
  /**
   * One lane, split where the incident loop does: the seconds no one had seen it, the seconds
   * no one had answered, and the run the SEV tints. `pending` says a null signal means one that
   * has not landed yet, as the running Incident's does, rather than one the Game never recorded.
   */
  const lane = (
    key: string,
    name: string,
    from: number,
    to: number,
    severity: number,
    signalAt: number | null,
    ackAt: number | null,
    pending = false,
  ): Lane => {
    const start = Math.max(first, from)
    const end = Math.min(last, to)
    const color = SEVERITY_COLOR[severity] ?? MUTED
    const block = (at: number, until: number, background: string, label: string): Run => ({
      from: at - first,
      to: until - first,
      color: background,
      label,
    })
    const held = `SEV${severity} · ${hhmm(start)}–${hhmm(end)}`
    if (signalAt === null)
      return {
        key,
        name,
        runs: [
          pending
            ? block(start, end, UNSEEN, t.dashboard.notSeenFor(minutesText(t, end - start)))
            : block(start, end, color, held),
        ],
      }
    const signal = Math.min(end, Math.max(start, signalAt))
    const answered = ackAt === null ? null : Math.min(end, Math.max(signal, ackAt))
    const runs: Array<Run> = []
    if (signal > start)
      runs.push(
        block(start, signal, UNSEEN, t.dashboard.notSeenFor(minutesText(t, signal - start))),
      )
    const awaited = answered ?? end
    if (awaited > signal)
      runs.push(
        block(
          signal,
          awaited,
          AWAITING,
          t.dashboard.awaitingAckFor(minutesText(t, awaited - signal)),
        ),
      )
    if (answered !== null && end > answered)
      runs.push(block(answered, end, color, `SEV${severity} · ${hhmm(answered)}–${hhmm(end)}`))
    // A run with no seconds to split, as a save with equal times, still draws its whole span.
    return { key, name, runs: runs.length === 0 ? [block(start, end, color, held)] : runs }
  }
  const lanes: Array<Lane> = []
  const severities = new Set<number>()
  for (const postmortem of game.postmortems) {
    const endedAt = postmortem.endedAt
    if (endedAt === null) continue
    const startedAt = endedAt - postmortem.duration
    // A run that ended before the axis began, or began after it ends, has nothing to place.
    if (endedAt < first || startedAt > last) continue
    severities.add(postmortem.severity)
    const signal = postmortem.mttd
    lanes.push(
      lane(
        `pm-${postmortem.id}`,
        t.catalog.incidents[postmortem.kind].name,
        startedAt,
        endedAt,
        postmortem.severity,
        signal === null ? null : startedAt + signal,
        signal === null || postmortem.mtta === null ? null : startedAt + signal + postmortem.mtta,
      ),
    )
  }
  const incident = game.incident
  const now = Math.floor(game.time)
  if (incident !== null && incident.startedAt <= now) {
    severities.add(incident.severity)
    lanes.push(
      lane(
        'running',
        t.dashboard.runningLane(t.catalog.incidents[incident.kind].name),
        incident.startedAt,
        now,
        incident.severity,
        signalAtOf(incident.phase),
        ackAtOf(incident.phase),
        true,
      ),
    )
  }
  if (lanes.length === 0)
    return panel(
      'incident-timeline',
      'col-span-24',
      t.dashboard.incidentTimeline,
      rangeLabel(t, range),
      [
        h.div(
          [h.Class(cn(SCREEN, 'px-2 py-3'))],
          [
            h.span(
              [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground'))],
              [t.dashboard.noRunInThisRange],
            ),
          ],
        ),
      ],
      h,
    )
  return laneTimeline(
    'incident-timeline',
    'col-span-24',
    t.dashboard.incidentTimeline,
    t.dashboard.runRange(rangeLabel(t, range)),
    lanes,
    span,
    first,
    last,
    h,
    [
      ...(lanes.some((entry) => entry.runs.some((run) => run.color === UNSEEN))
        ? [swatch(t.dashboard.notSeen, UNSEEN, h)]
        : []),
      ...(lanes.some((entry) => entry.runs.some((run) => run.color === AWAITING))
        ? [swatch(t.dashboard.awaitingAck, AWAITING, h)]
        : []),
      ...[...severities]
        .sort()
        .map((severity) => swatch(`SEV${severity}`, SEVERITY_COLOR[severity] ?? MUTED, h)),
    ],
  )
}

/** The action item's state in the Dashboard's status colours: done, open, or none. */
const actionColor = (game: Game, postmortem: Postmortem): string =>
  postmortem.action === null ? MUTED : has(game, postmortem.action) ? GREEN : AMBER

const runningIncident = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const incident = game.incident
  if (incident === null)
    return tablePanel(
      'incident-running',
      'col-span-8',
      t.dashboard.runningIncident,
      t.dashboard.none,
      [t.dashboard.fact, t.dashboard.value],
      [
        {
          key: 'none',
          cells: [{ text: t.dashboard.state }, { text: t.dashboard.noIncidentRunning }],
        },
      ],
      h,
    )
  const elapsed = Math.max(0, game.time - incident.startedAt)
  const total = elapsed + Math.max(0, incident.remaining)
  const facts: ReadonlyArray<readonly [string, Cell]> = [
    [t.dashboard.severity, { text: `SEV${incident.severity}` }],
    [t.dashboard.target, { text: incidentTarget(t, game, incident) }],
    [
      t.dashboard.cause,
      {
        text:
          incident.causedBy === null
            ? '—'
            : t.dashboard.causeLeftAlone(t.catalog.incidents[incident.causedBy].name),
      },
    ],
    [
      t.dashboard.run,
      {
        text: `${minutesText(t, elapsed)} / ${minutesText(t, total)}`,
        bar: { share: total > 0 ? Math.min(1, elapsed / total) : 0, color: RED },
      },
    ],
    ['MTTD', { text: minutesOrUnknown(t, mttdOf(incident)) }],
    ['MTTA', { text: minutesOrUnknown(t, mttaOf(incident)) }],
    [t.dashboard.mttrSoFar, { text: minutesText(t, incident.impaired) }],
    [
      t.dashboard.usersLost,
      { text: `−${compact(Math.max(0, incident.usersAtStart - game.users))}` },
    ],
    [t.dashboard.revenueLost, { text: `−${money(incident.lostRevenue)}` }],
    [t.dashboard.failed, { text: compact(incident.failed) }],
  ]
  return tablePanel(
    'incident-running',
    'col-span-8',
    t.dashboard.runningIncident,
    t.catalog.incidents[incident.kind].name,
    [t.dashboard.fact, t.dashboard.value],
    facts.map(([name, cell]) => ({ key: name, cells: [{ text: name }, cell] })),
    h,
  )
}

const incidentHistory = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return tablePanel(
    'incident-history',
    'col-span-16',
    t.dashboard.incidentHistory,
    t.dashboard.postmortemCount(game.postmortems.length),
    [
      t.dashboard.incident,
      t.dashboard.cause,
      'SEV',
      t.dashboard.target,
      t.dashboard.run,
      'MTTD',
      'MTTA',
      'MTTR',
      t.dashboard.users,
      t.dashboard.revenue,
      t.dashboard.failed,
      t.dashboard.action,
    ],
    [...game.postmortems].reverse().map((postmortem) => ({
      key: `pm-${postmortem.id}`,
      cells: [
        {
          text: t.catalog.incidents[postmortem.kind].name,
          onClick: Message.DashboardChanged({
            message: DashboardMessage.PostmortemChosen({ id: postmortem.id }),
          }),
          hint: t.dashboard.showThisPostmortem,
        },
        {
          text: postmortem.causedBy === null ? '—' : t.catalog.incidents[postmortem.causedBy].name,
        },
        { text: `SEV${postmortem.severity}` },
        { text: postmortem.target ?? '—' },
        { text: minutesText(t, postmortem.duration) },
        { text: minutesOrUnknown(t, postmortem.mttd) },
        { text: minutesOrUnknown(t, postmortem.mtta) },
        { text: minutesText(t, postmortem.mttr) },
        { text: `−${compact(postmortem.lostUsers)}` },
        { text: `−${money(postmortem.lostRevenue)}` },
        { text: compact(postmortem.failed) },
        { text: actionText(t, game, postmortem), color: actionColor(game, postmortem) },
      ],
    })),
    h,
  )
}

const postmortemDetail = (game: Game, postmortem: Postmortem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const def = localized(INCIDENTS[postmortem.kind], t.catalog.incidents[postmortem.kind])
  const facts: ReadonlyArray<readonly [string, string]> = [
    [t.dashboard.run, minutesText(t, postmortem.duration)],
    [
      t.dashboard.cause,
      postmortem.causedBy === null ? '—' : t.catalog.incidents[postmortem.causedBy].name,
    ],
    ['MTTD', minutesOrUnknown(t, postmortem.mttd)],
    ['MTTA', minutesOrUnknown(t, postmortem.mtta)],
    ['MTTR', minutesText(t, postmortem.mttr)],
    [t.dashboard.usersLost, `−${compact(postmortem.lostUsers)}`],
    [t.dashboard.revenueLost, `−${money(postmortem.lostRevenue)}`],
    [t.dashboard.failed, compact(postmortem.failed)],
  ]
  const open = postmortem.action !== null && !has(game, postmortem.action)
  return panel(
    `pm-detail-${postmortem.id}`,
    'col-span-24',
    t.dashboard.postmortemOf(def.name),
    `SEV${postmortem.severity}${postmortem.target === null ? '' : ` · ${postmortem.target}`}`,
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-col gap-3 p-3'))],
        [
          h.p(
            [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
            [def.cause],
          ),
          h.div(
            [h.Class('grid grid-cols-7 divide-x divide-hairline')],
            facts.map(([name, value]) =>
              h.div(
                [h.Key(name), h.Class('flex flex-col gap-1 px-2.5 py-1.5')],
                [
                  h.span([h.Class(EYEBROW)], [name]),
                  h.span([h.Class(cn(FIGURE, 'text-[calc(12.5px*var(--type-scale))]'))], [value]),
                ],
              ),
            ),
          ),
          h.p([h.Class('text-[calc(12px*var(--type-scale))] leading-snug')], [def.prevention]),
          h.p(
            [
              h.Class(
                cn(
                  'text-[calc(12px*var(--type-scale))] leading-snug',
                  open ? 'text-warn' : 'text-muted-foreground',
                ),
              ),
            ],
            [
              postmortem.action === null
                ? t.dashboard.noActionItem
                : has(game, postmortem.action)
                  ? t.dashboard.actionItemDone(t.catalog.research[postmortem.action].name)
                  : t.dashboard.actionItemOpen(t.catalog.research[postmortem.action].name),
            ],
          ),
        ],
      ),
    ],
    h,
    null,
    actionColor(game, postmortem),
  )
}

const incidentPanels = (
  model: Model,
  rows: ReadonlyArray<Row>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const game = model.board.game
  const chosen = game.postmortems.find(
    (postmortem) => postmortem.id === model.board.dashboard.postmortem,
  )
  return [
    runningIncident(game, h),
    incidentHistory(game, h),
    incidentTimeline(model, rows, h),
    ...(chosen === undefined ? [] : [postmortemDetail(game, chosen, h)]),
  ]
}

const RULES = ['errors', 'latency', 'saturation', 'queue', 'budget'] as const
type Rule = (typeof RULES)[number]
const ruleNameOf = (t: Messages): Record<Rule, string> => ({
  errors: t.dashboard.errorRate,
  latency: t.dashboard.latency,
  saturation: t.dashboard.saturation,
  queue: t.dashboard.queueGrowth,
  budget: t.dashboard.budgetBurn,
})

type AlertState = 'ok' | 'pending' | 'firing' | 'ignored'
const alertStateCopy = (
  t: Messages,
): Record<AlertState, Readonly<{ color: string; label: string }>> => ({
  ok: { color: GREEN, label: t.dashboard.oK },
  pending: { color: AMBER, label: t.dashboard.pending },
  firing: { color: RED, label: t.dashboard.firing },
  ignored: { color: MUTED, label: t.dashboard.ignoredState },
})

/** A rule's state now, from what the Simulation counts: held seconds, and the false alarms. */
const alertStateOf = (game: Game, rule: Rule): AlertState =>
  ignored(game, rule)
    ? 'ignored'
    : game.alarms[rule] >= ALERT_RULES[rule].seconds
      ? 'firing'
      : game.alarms[rule] > 0
        ? 'pending'
        : 'ok'

/** What each rule watches now, read the way `step.ts` reads it, so panel and pager agree. */
const watchedOf = (game: Game, ledger: Ledger): Record<Rule, number> => {
  const slowest = Object.entries(ledger.kinds).reduce(
    (most, [kind, entry]) =>
      entry === undefined ? most : Math.max(most, entry.p99 / PROFILES[kind as RequestKind].apdex),
    0,
  )
  const hottest = Math.max(
    0,
    ...game.nodes
      .filter((node) => node.type !== 'users' && node.type !== 'analytics')
      .map((node) => ledger.nodes[node.id]?.utilization ?? 0),
  )
  const oldest = Math.max(
    0,
    ...game.nodes.map((node) => (node.type === 'queue' ? (ledger.nodes[node.id]?.age ?? 0) : 0)),
  )
  return {
    errors: ledger.errorShare,
    latency: slowest,
    saturation: hottest,
    queue: Number.isFinite(oldest) ? oldest : 0,
    budget: burnRateOf(game, ledger),
  }
}

const asRule = (value: string | undefined): Rule | null =>
  (RULES as ReadonlyArray<string>).includes(value ?? '') ? (value as Rule) : null

/** The alerts the Inbox records: the rule, when, and whether the team has given up on it. */
const alertMarks = (
  model: Model,
): ReadonlyArray<Readonly<{ rule: Rule; at: number; ignored: boolean }>> =>
  model.board.inbox.mail.flatMap((mail) => {
    const [, topic, about] = keyParts(mail)
    if (topic !== 'alert' && topic !== 'alert-ignored') return []
    const rule = asRule(about)
    if (rule === null) return []
    return mail.entries.map((entry) => ({
      rule,
      at: entry.time,
      ignored: topic === 'alert-ignored',
    }))
  })

/** Grafana's state timeline of the alert rules: firing where the Inbox recorded a page. */
const alertTimeline = (model: Model, rows: ReadonlyArray<Row>, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const marks = alertMarks(model)
  const last = rows.length - 1
  const lanes = RULES.map((rule) => {
    // An ignored rule stays ignored until the player tunes it, which the Game does not date:
    // a lane carries the state to the end only while the team still ignores the rule.
    const given = ignored(game, rule)
    const states = rows.map(() => 'ok' as AlertState)
    for (const mark of marks) {
      if (mark.rule !== rule) continue
      const index = rows.findIndex(
        (row) => Number(row.at) <= mark.at && mark.at < Number(row.at) + Number(row.span),
      )
      if (index < 0) continue
      if (mark.ignored)
        for (let at = index; at < (given ? states.length : index + 1); at += 1)
          states[at] = 'ignored'
      else if (states[index] === 'ok') states[index] = 'firing'
    }
    // The Game holds what is true now: a rule that has held for a while is pending or firing.
    const now = alertStateOf(game, rule)
    if (now !== 'ok' && last >= 0) states[last] = now
    return {
      key: rule,
      name: ruleNameOf(t)[rule],
      runs: runsOf(states, 0, (state) => alertStateCopy(t)[state]),
    }
  })
  const first = Number(rows[0]?.at ?? 0)
  const end = Number(rows[last]?.at ?? first) + Number(rows[last]?.span ?? 1)
  return laneTimeline(
    'alert-state',
    'col-span-12',
    t.dashboard.alertState,
    t.dashboard.pagesTheInboxKept,
    lanes,
    Math.max(1, rows.length),
    first,
    end,
    h,
    Object.values(alertStateCopy(t)).map((state) => swatch(state.label, state.color, h)),
  )
}

/** The alert rules and their thresholds, with what each watches now. */
const alertTable = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const watched = watchedOf(game, ledger)
  const limit = (rule: Rule): string =>
    rule === 'errors'
      ? percent(game.alertRules.errors, 1)
      : rule === 'latency'
        ? `${game.alertRules.latency}× T`
        : rule === 'queue'
          ? t.dashboard.s3(game.alertRules.queue)
          : rule === 'budget'
            ? `${game.alertRules.budget}×`
            : percent(game.alertRules.saturation)
  const seen = (rule: Rule): string =>
    rule === 'errors'
      ? percent(watched.errors, 2)
      : rule === 'latency'
        ? `${watched.latency.toFixed(1)}× T`
        : rule === 'queue'
          ? t.dashboard.s3(Math.round(watched.queue))
          : rule === 'budget'
            ? `${watched.budget.toFixed(1)}×`
            : percent(watched.saturation)
  return tablePanel(
    'alert-rules',
    'col-span-12',
    t.dashboard.alertRules,
    t.dashboard.thePagersConditions,
    [t.dashboard.rule, t.dashboard.threshold, t.dashboard.now, t.dashboard.held, t.dashboard.state],
    RULES.map((rule) => {
      const state = alertStateCopy(t)[alertStateOf(game, rule)]
      return {
        key: rule,
        cells: [
          {
            text: ruleNameOf(t)[rule],
            hint: formats(t).alertText(rule, game.alertRules[rule]),
          },
          { text: limit(rule) },
          { text: seen(rule) },
          { text: t.dashboard.heldOf(Math.round(game.alarms[rule]), ALERT_RULES[rule].seconds) },
          { text: state.label, fill: state.color },
        ],
      }
    }),
    h,
  )
}

/** The RED method: rate, errors and duration for each Service the Design serves, or for one. */
const servicesTable = (
  ledger: Ledger,
  shown: (kind: RequestKind) => boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[RequestKind, KindLedger | undefined]>
  )
    .flatMap(([kind, entry]) =>
      entry === undefined || entry.rate <= 0 || !shown(kind) ? [] : [{ kind, entry }],
    )
    .sort((left, right) => right.entry.rate - left.entry.rate)
  const total = kinds.reduce((sum, { entry }) => sum + entry.rate, 0)
  return tablePanel(
    'services',
    'col-span-24',
    t.dashboard.services,
    t.dashboard.rateErrorsDurationNow,
    [
      t.dashboard.service,
      t.dashboard.rate,
      t.dashboard.share,
      t.dashboard.errors,
      t.dashboard.mean,
      'p99',
    ],
    kinds.map(({ kind, entry }) => {
      const failed = 1 - entry.success
      return {
        key: kind,
        cells: [
          { text: t.catalog.kinds[kind].label },
          { text: t.dashboard.s(rateText(entry.rate)) },
          { text: percent(total > 0 ? entry.rate / total : 0) },
          { text: percent(failed, failed < 0.1 ? 2 : 1), color: failed > 0.01 ? RED : undefined },
          { text: formats(t).ms(entry.mean) },
          { text: formats(t).ms(entry.p99) },
        ],
      }
    }),
    h,
  )
}

/** The RED method per Service: the kinds its Features touch, summed from the Ledger's `services`. */
const serviceTable = (
  game: Game,
  ledger: Ledger,
  only: string | null,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const rows = game.services.flatMap((service) => {
    const entry = ledger.services[service.id]
    return entry === undefined || entry.rate <= 0 || (only !== null && service.id !== only)
      ? []
      : [{ service, entry }]
  })
  const total = rows.reduce((sum, { entry }) => sum + entry.rate, 0)
  return tablePanel(
    'service-red',
    'col-span-24',
    t.dashboard.code,
    t.dashboard.rateErrorsDurationPerCodebase,
    [
      t.dashboard.service,
      t.dashboard.rate,
      t.dashboard.share,
      t.dashboard.errors,
      t.dashboard.mean,
      'p99',
    ],
    rows.map(({ service, entry }) => {
      const failed = entry.rate > 0 ? entry.failed / entry.rate : 0
      return {
        key: service.id,
        cells: [
          { text: serviceName(t, service) },
          { text: t.dashboard.s(rateText(entry.rate)) },
          { text: percent(total > 0 ? entry.rate / total : 0) },
          { text: percent(failed, failed < 0.1 ? 2 : 1), color: failed > 0.01 ? RED : undefined },
          { text: formats(t).ms(entry.mean) },
          { text: formats(t).ms(entry.p99) },
        ],
      }
    }),
    h,
  )
}

/**
 * One request kind's waterfall: every Node its traffic touches, in link order from the Users
 * Node out, with the hop time and the queue wait this Node adds to that kind alone (12 "The
 * visibility ladder", `tracing`). A Node the bottleneck-by-kind marker names is flagged.
 */
const waterfallTable = (
  game: Game,
  ledger: Ledger,
  kind: RequestKind,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  const byId = new Map(game.nodes.map((node) => [node.id, node] as const))
  const bottleneck = ledger.bottleneckByKind[kind] ?? null
  // Walk the Links that carry this kind, from any Node nothing else sends it into.
  const carriesKind = (id: string): boolean => (ledger.nodes[id]?.traffic[kind] ?? 0) > 0
  const incoming = new Set(
    ledger.links.filter((link) => (link.traffic[kind] ?? 0) > 0).map((link) => link.to),
  )
  const roots = Object.keys(ledger.nodes).filter((id) => carriesKind(id) && !incoming.has(id))
  const order: Array<string> = []
  const seen = new Set<string>()
  const queue = [...roots]
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    seen.add(id)
    order.push(id)
    for (const link of ledger.links)
      if (link.from === id && (link.traffic[kind] ?? 0) > 0 && !seen.has(link.to))
        queue.push(link.to)
  }
  return tablePanel(
    'waterfall',
    'col-span-24',
    t.dashboard.waterfall,
    t.dashboard.waterfallOf(t.catalog.kinds[kind].label),
    [t.dashboard.node, t.dashboard.hopTime, t.dashboard.wait, t.dashboard.bottleneck],
    order.flatMap((id) => {
      const own = ledger.nodes[id] as NodeLedger
      const node = byId.get(id)
      if (!node) return []
      const hop = own.hopByKind[kind] ?? 0
      const wait = own.waitByKind[kind] ?? 0
      return [
        {
          key: id,
          cells: [
            { text: names.get(id) ?? t.catalog.components[node.type].name },
            { text: formats(t).ms(hop) },
            { text: wait > 0 ? formats(t).queueWait(wait) : '—' },
            {
              text: id === bottleneck ? t.dashboard.bottleneck : '',
              color: id === bottleneck ? RED : undefined,
            },
          ],
        },
      ]
    }),
    h,
  )
}

const limitNameOf = (t: Messages): Record<Limit, string> => ({
  cpu: 'CPU',
  credits: t.dashboard.cPUCredits,
  memory: t.dashboard.memory,
  workers: t.dashboard.workers,
  connections: t.dashboard.connections,
  network: t.dashboard.network,
  disk: t.dashboard.disk,
  throughput: t.dashboard.throughput,
  none: t.dashboard.noLimit,
})

const LIMIT_COLOR: Record<Limit, string> = {
  cpu: RED,
  credits: AMBER,
  memory: PINK,
  workers: PURPLE,
  connections: TEAL,
  network: BLUE,
  disk: AMBER,
  throughput: GREEN,
  none: MUTED,
}

/** The USE method: which resource limits each Node, over the session's Node history. */
const resourceTimeline = (
  model: Model,
  tracks: ReadonlyArray<NodeTrack>,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const history = model.board.nodeHistory
  const length = Math.max(1, ...tracks.map((track) => (history[track.id] ?? []).length))
  const last = Math.floor(model.board.game.time / NODE_EVERY) * NODE_EVERY
  const first = last - (length - 1) * NODE_EVERY
  const lanes = tracks.map((track) => {
    const limits = (history[track.id] ?? []).map((sample) => sample.limit)
    return {
      key: track.id,
      name: track.name,
      runs: runsOf(limits, length - limits.length, (limit) => ({
        color: LIMIT_COLOR[limit],
        label: limitNameOf(t)[limit],
      })),
    }
  })
  const present = [
    ...new Set(tracks.flatMap((track) => (history[track.id] ?? []).map((sample) => sample.limit))),
  ]
  return laneTimeline(
    'resources',
    'col-span-24',
    t.dashboard.resources,
    t.dashboard.theLimitingResource,
    lanes,
    length,
    first,
    last,
    h,
    present.map((limit) => swatch(limitNameOf(t)[limit], LIMIT_COLOR[limit], h)),
  )
}

/** The churn breakdown runs a day's forecast, so each Game computes it once, not every frame. */
const churnCache = new WeakMap<Game, ReadonlyArray<RegionChurn>>()

/** Users by region against the market, with the rate at which each region loses them. */
const usersTable = (
  game: Game,
  ledger: Ledger,
  only: RegionId | null,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const all = churnCache.get(game) ?? churnOf(game, ledger)
  churnCache.set(game, all)
  const regions = only === null ? all : all.filter((region) => region.region === only)
  const split = regional(game)
  return tablePanel(
    'users',
    'col-span-24',
    t.dashboard.users,
    t.dashboard.byRegionMarketAndChurn,
    [
      t.dashboard.region,
      t.dashboard.users,
      t.dashboard.market,
      t.dashboard.share,
      'Apdex',
      t.dashboard.churn,
    ],
    regions.map((region) => {
      const market = ledger.market * (split ? REGION_INFO[region.region].share : 1)
      const share = market > 0 ? region.users / market : 0
      return {
        key: region.region,
        cells: [
          { text: t.catalog.regionInfo[region.region].name },
          { text: compact(region.users) },
          { text: compact(market) },
          {
            text: percent(share, share < 0.1 ? 1 : 0),
            bar: { share: Math.min(1, share), color: TEAL },
          },
          {
            text: `${region.now.toFixed(2)} / ${region.target.toFixed(2)}`,
            color: region.now >= region.target ? GREEN : RED,
          },
          {
            text: t.units.perHour(`${region.perHour >= 0 ? '+' : ''}${compact(region.perHour)}`),
            color: region.perHour < 0 ? RED : GREEN,
          },
        ],
      }
    }),
    h,
  )
}

/**
 * Real user monitoring's device split: mean latency from each device's side, including its own
 * round trip, for the users row (12 "The visibility ladder", `rum`).
 */
const deviceTable = (ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return tablePanel(
    'devices',
    'col-span-24',
    t.dashboard.realUserMonitoring,
    t.dashboard.meanLatencyByDevice,
    [t.dashboard.device, t.dashboard.latency],
    DEVICES.map((device) => ({
      key: device,
      cells: [
        { text: t.catalog.deviceInfo[device].name },
        { text: formats(t).ms(ledger.deviceLatency[device] ?? 0) },
      ],
    })),
    h,
  )
}

/** The Load Balancer's traffic per backend, which shows an uneven split. */
const loadBalancer = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  const balancers = game.nodes.filter((node) => node.type === 'lb')
  const entries = balancers.flatMap((balancer) =>
    ledger.links
      .filter((link) => link.from === balancer.id)
      .map((link) => ({
        key: `${link.from}>${link.to}`,
        name:
          balancers.length > 1
            ? `${names.get(link.from) ?? link.from} → ${names.get(link.to) ?? link.to}`
            : (names.get(link.to) ?? link.to),
        value: link.rate,
        text: t.dashboard.s(rateText(link.rate)),
      })),
  )
  return barList(
    'load-balancer',
    'col-span-24',
    t.dashboard.loadBalancer,
    entries.length === 0
      ? t.dashboard.noBackend
      : t.dashboard.perBackendEvenSplit(percent(1 / entries.length)),
    entries,
    h,
  )
}

/** Each App Server's copies, and the workers busy against the pool they share. */
const appServers = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return tablePanel(
    'app-server',
    'col-span-24',
    t.dashboard.appServer,
    t.dashboard.copiesBusyWorkers,
    [t.dashboard.node, t.dashboard.copies, t.dashboard.busyWorkers],
    game.nodes
      .filter((node) => node.type === 'server')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const slots = own?.resources.slots ?? null
        const busy = slots === null ? 0 : Math.min(slots.used, slots.total)
        const share = slots === null || slots.total <= 0 ? 0 : busy / slots.total
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? t.catalog.components[node.type].name },
            {
              text:
                bootingOf(node) > 0
                  ? t.dashboard.copiesBooting(node.replicas, bootingOf(node))
                  : String(node.replicas),
            },
            slots === null
              ? { text: '—' }
              : {
                  text: `${Math.round(busy)}/${Math.round(slots.total)}`,
                  bar: { share, color: LEVEL_COLOR[levelOf(share, UTILIZATION)] },
                },
          ],
        }
      }),
    h,
  )
}

/** Connections used against the limit, refused queries, and how far a replica lags. */
const databases = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return tablePanel(
    'database',
    'col-span-24',
    t.dashboard.database,
    t.dashboard.connectionsRefusedLag,
    [
      t.dashboard.node,
      t.dashboard.connections,
      t.dashboard.queries,
      t.dashboard.refused,
      t.dashboard.lag,
    ],
    game.nodes
      .filter((node) => node.type === 'database' || node.type === 'replica')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const connections = own?.connections ?? null
        const share = connections === null ? 0 : connections.used / Math.max(1, connections.max)
        const refused = own?.refused ?? 0
        const lag = own?.lagMs ?? null
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? t.catalog.components[node.type].name },
            connections === null
              ? { text: '—' }
              : {
                  text: `${Math.round(connections.used)}/${Math.round(connections.max)}`,
                  bar: { share, color: LEVEL_COLOR[levelOf(share, UTILIZATION)] },
                },
            { text: t.dashboard.s(compact(own?.inbound ?? 0)) },
            {
              text: refused > 0.0005 ? t.dashboard.s(compact(refused)) : '—',
              color: refused > 0.0005 ? RED : undefined,
            },
            { text: lag === null ? '—' : formats(t).ms(lag) },
          ],
        }
      }),
    h,
  )
}

/** A Cache's evictions: the keys a second it pushes out because the hot data does not fit its memory. */
const evictions = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return barList(
    'evictions',
    'col-span-24',
    t.dashboard.cacheEvictions,
    t.dashboard.keysEvictedNow,
    game.nodes
      .filter((node) => node.type === 'cache')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const share = Math.min(1, evictionShareOf(game, node))
        return {
          key: node.id,
          name: names.get(node.id) ?? t.catalog.components[node.type].name,
          value: share,
          text: t.dashboard.s(compact(Math.round(own?.evictions ?? 0))),
          color: PINK,
        }
      }),
    h,
  )
}

/** A Cache's or a CDN's hit ratio: the share of the queries it answers itself. */
const hits = (
  key: string,
  title: string,
  unit: string,
  type: 'cache' | 'cdn',
  game: Game,
  ledger: Ledger,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return barList(
    key,
    'col-span-24',
    title,
    unit,
    game.nodes
      .filter((node) => node.type === type)
      .map((node) => {
        const hit = ledger.nodes[node.id]?.hitRatio ?? null
        return {
          key: node.id,
          name: names.get(node.id) ?? t.catalog.components[node.type].name,
          value: hit ?? 0,
          text: hit === null ? '—' : percent(hit, 1),
          color: TEAL,
        }
      }),
    h,
  )
}

/** A Queue's depth and the age of the oldest task in it. */
const queues = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return tablePanel(
    'queue',
    'col-span-24',
    t.dashboard.queue,
    t.dashboard.depthAndOldestAge,
    [
      t.dashboard.queue,
      t.dashboard.depth,
      t.dashboard.oldestTask,
      t.dashboard.drained,
      t.dashboard.state,
    ],
    game.nodes
      .filter((node) => node.type === 'queue')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const age = own?.age ?? null
        const stalled = age === Number.POSITIVE_INFINITY
        const down = own?.status === 'down'
        const level: Level = down || stalled ? 'danger' : age !== null && age > 0 ? 'warn' : 'ok'
        const label = down
          ? t.dashboard.down
          : stalled
            ? t.dashboard.stalled
            : age !== null && age > 0
              ? t.dashboard.waiting
              : t.dashboard.clear
        const drained = Object.values(own?.out ?? {}).reduce((sum, rate) => sum + rate, 0)
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? t.catalog.components[node.type].name },
            { text: compact(node.depth) },
            { text: formats(t).queueWait(age) },
            { text: t.dashboard.s(compact(drained)) },
            { text: label, fill: LEVEL_COLOR[level] },
          ],
        }
      }),
    h,
  )
}

/** 05 "Managed Components": third-party services, which bill per use and have their own outages. */
const MANAGED: ReadonlyArray<ComponentId> = ['psp', 'llm', 'msgp', 'auth']

/** Calls into and out of each Managed Component, and whether it is up. */
const managed = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const names = namesOf(t, game)
  return tablePanel(
    'managed',
    'col-span-24',
    t.dashboard.managedComponents,
    t.dashboard.callsLatencyOutage,
    [
      t.dashboard.component,
      t.dashboard.calls,
      t.dashboard.sent,
      t.dashboard.latency,
      t.dashboard.state,
    ],
    game.nodes
      .filter((node) => MANAGED.includes(node.type))
      .map((node) => {
        const own = ledger.nodes[node.id]
        const down = own?.status === 'down'
        const throttled = own?.throttled ?? false
        const sent = Object.values(own?.out ?? {}).reduce((sum, rate) => sum + rate, 0)
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? t.catalog.components[node.type].name },
            { text: t.dashboard.s(compact(own?.inbound ?? 0)) },
            { text: sent > 0 ? t.dashboard.s(compact(sent)) : '—' },
            { text: formats(t).ms(own?.latency ?? 0) },
            {
              text: down ? t.dashboard.down : throttled ? t.dashboard.throttled : t.dashboard.up,
              fill: LEVEL_COLOR[down ? 'danger' : throttled ? 'warn' : 'ok'],
            },
          ],
        }
      }),
    h,
  )
}

const rangeLabel = (t: Messages, minutes: number): string =>
  minutes >= 1440 ? t.units.dShort(minutes / 1440) : t.units.hShort(minutes / 60)

/** Grafana's top bar: breadcrumb, time picker, and refresh. */
const topBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const now = clockOf(model.board.game.time)
  const open = boardSandbox(model.board)
  const place = open
    ? open.id === null
      ? t.dashboard.freeSandbox
      : t.dashboard.sandbox
    : t.dashboard.company
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2 px-4 pt-4 compact:px-3')],
    [
      h.div(
        [h.Class(cn(PANEL, 'flex items-center gap-2.5 py-2 pr-3 pl-3.5'))],
        [
          icon(h, LayoutGrid, 'size-4 text-muted-foreground'),
          h.span(
            [
              h.Class(
                'flex items-center gap-1.5 text-[calc(13px*var(--type-scale))] text-muted-foreground',
              ),
            ],
            [
              t.dashboard.dashboards,
              h.span([], ['/']),
              place,
              h.span([], ['/']),
              h.span(
                [
                  h.Class(
                    'text-[calc(15px*var(--type-scale))] font-semibold tracking-[-0.02em] text-foreground',
                  ),
                ],
                [t.dashboard.overview],
              ),
            ],
          ),
          icon(h, Star, 'size-3.5 text-muted-foreground'),
        ],
      ),
      h.span([h.Class('flex-1')], []),
      h.div(
        [h.Class(cn(PANEL, 'flex items-center gap-1.5 p-1.5'))],
        [
          h.span(
            [h.Class('grid h-7 place-items-center px-1.5 text-muted-foreground')],
            [icon(h, Clock3, 'size-3.5')],
          ),
          h.div(
            [h.Class(cn('flex gap-[3px] rounded-lg p-[3px]', WELL))],
            DASHBOARD_RANGES.map((minutes) =>
              h.button(
                [
                  h.Key(`range-${minutes}`),
                  h.Type('button'),
                  h.AriaPressed(minutes === model.board.dashboard.range ? 'true' : 'false'),
                  h.OnClick(
                    Message.DashboardChanged({
                      message: DashboardMessage.RangeChosen({ minutes }),
                    }),
                  ),
                  h.Class(
                    cn(
                      'h-6 rounded-md px-2.5 text-[calc(12px*var(--type-scale))]',
                      minutes === model.board.dashboard.range
                        ? 'bg-raised text-foreground shadow-raised'
                        : 'text-muted-foreground hover:text-foreground',
                    ),
                  ),
                ],
                [rangeLabel(t, minutes)],
              ),
            ),
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'flex h-7 items-center gap-2 rounded-lg bg-raised px-2.5 text-[calc(12px*var(--type-scale))] shadow-raised',
                  clockPaused(model) ? 'text-muted-foreground' : 'text-foreground',
                ),
              ),
            ],
            [
              led(clockPaused(model) ? MUTED : GREEN, h),
              clockPaused(model)
                ? t.dashboard.paused
                : t.dashboard.liveD(
                    now.day,
                    String(now.hour).padStart(2, '0'),
                    String(now.minute).padStart(2, '0'),
                  ),
              icon(h, RefreshCw, 'size-3.5 text-muted-foreground'),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class(cn(PANEL, 'p-1'))],
        [
          button(
            {
              onClick: Message.PanelClosed(),
              variant: 'ghost',
              size: 'icon',
              className: 'text-muted-foreground',
              attributes: [h.AriaLabel(t.dashboard.closeEsc)],
            },
            icon(h, X, 'size-4'),
            h,
          ),
        ],
      ),
    ],
  )
}

/**
 * Grafana's template variables (12 "Controls"): a Request kind and a Region that narrow every panel
 * that reads per-kind or per-region figures, the read-only Era and SLO, the compare and table
 * switches, and a switch per annotation group. A Service drop-down appears with a second Service and
 * narrows the per-kind panels to the kinds that Service's Features touch.
 */
const variables = (model: Model, slo: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const dashboard = model.board.dashboard
  const chip = (name: string, value: string) =>
    h.span(
      [
        h.Key(name),
        h.Class(
          'flex h-7 items-stretch overflow-hidden rounded-lg bg-raised text-[calc(12px*var(--type-scale))] shadow-raised',
        ),
      ],
      [
        h.span(
          [
            h.Class(
              'grid place-items-center border-r border-hairline bg-well/60 px-2 text-muted-foreground',
            ),
          ],
          [name],
        ),
        h.span(
          [h.Class('grid place-items-center px-2 font-mono text-[calc(11.5px*var(--type-scale))]')],
          [value],
        ),
      ],
    )
  const select = (
    name: string,
    value: string,
    options: ReadonlyArray<readonly [string, string]>,
    chosen: (value: string) => Message,
  ) =>
    h.label(
      [
        h.Key(name),
        h.DataAttribute('variable', name),
        h.Class(
          'flex h-7 items-center gap-1.5 rounded-lg bg-raised pr-1 pl-2 text-[calc(11px*var(--type-scale))] shadow-raised',
        ),
      ],
      [
        h.span([h.Class('text-muted-foreground')], [name]),
        h.select(
          [
            h.Value(value),
            h.AriaLabel(name),
            h.OnChange(chosen),
            h.Class(
              'h-6 max-w-[9.5rem] truncate rounded-md bg-well px-1 font-mono text-[calc(11.5px*var(--type-scale))] text-foreground outline-none',
            ),
          ],
          options.map(([option, label]) =>
            h.option([h.Value(option), ...(option === value ? [h.Selected(true)] : [])], [label]),
          ),
        ),
      ],
    )
  /** A control that stays pressed: the compare line, the table view, and one per mark group. */
  const toggle = (name: string, on: boolean, click: Message, color?: string) =>
    h.button(
      [
        h.Key(name),
        h.Type('button'),
        h.AriaPressed(on ? 'true' : 'false'),
        h.OnClick(click),
        h.Class(
          cn(
            'flex h-6 items-center gap-1.5 rounded-md px-1.5 text-[calc(11px*var(--type-scale))]',
            on ? 'bg-raised text-foreground shadow-raised' : 'text-muted-foreground/70',
          ),
        ),
      ],
      [
        ...(color === undefined
          ? []
          : [
              h.span(
                [
                  h.Class('h-3 border-l border-dashed'),
                  h.Style({ borderColor: color, opacity: on ? '1' : '0.4' }),
                ],
                [],
              ),
            ]),
        h.span([], [name]),
      ],
    )
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2 px-4 pt-4 compact:px-3')],
    [
      select(
        t.dashboard.kind,
        dashboard.kind ?? 'all',
        [
          ['all', t.dashboard.allKinds],
          ...REQUEST_KINDS.map((kind) => [kind, t.catalog.kinds[kind].label] as const),
        ],
        (value) =>
          Message.DashboardChanged({
            message: DashboardMessage.KindChosen({
              kind: value === 'all' ? null : (value as RequestKind),
            }),
          }),
      ),
      ...(game.services.length > 1
        ? [
            select(
              t.dashboard.serviceVariable,
              dashboard.service ?? 'all',
              [
                ['all', t.dashboard.allServices],
                ...game.services.map((entry) => [entry.id, serviceName(t, entry)] as const),
              ],
              (value) =>
                Message.DashboardChanged({
                  message: DashboardMessage.ServiceChosen({
                    service: value === 'all' ? null : value,
                  }),
                }),
            ),
          ]
        : []),
      regional(game)
        ? select(
            t.dashboard.region2,
            dashboard.region ?? 'all',
            [
              ['all', t.dashboard.allRegions],
              ...REGIONS.map((region) => [region, t.catalog.regionInfo[region].name] as const),
            ],
            (value) =>
              Message.DashboardChanged({
                message: DashboardMessage.RegionChosen({
                  region: value === 'all' ? null : (value as RegionId),
                }),
              }),
          )
        : chip(t.dashboard.region2, model.board.region),
      chip(t.dashboard.eraVariable, eraWords(t, game).name),
      chip(t.dashboard.sloVariable, sloText(slo)),
      h.span([h.Class('flex-1')], []),
      toggle(
        t.dashboard.compare,
        dashboard.compare,
        Message.DashboardChanged({ message: DashboardMessage.CompareToggled() }),
      ),
      toggle(
        t.dashboard.table,
        dashboard.table,
        Message.DashboardChanged({ message: DashboardMessage.TableToggled() }),
      ),
      h.div(
        [h.Class('flex flex-wrap items-center gap-1')],
        ANNOTATION_GROUPS.map((group) =>
          toggle(
            annotationNameOf(t)[group],
            dashboard.groups.includes(group),
            Message.DashboardChanged({ message: DashboardMessage.GroupToggled({ group }) }),
            ANNOTATION_COLOR[group],
          ),
        ),
      ),
    ],
  )
}

export const dashboardPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const ledger = ledgerOf(model)
  const budget = budgetOf(game)
  const credit = slaCreditsOf(game, ledger)
  const slo = budget.slo > 0 && budget.slo < 1 ? budget.slo : 0.999
  const rows = rowsOf(model, slo)
  const tracks = tracksOf(model)
  const latest = game.history[game.history.length - 1]
  /** Cash per second now: the last row's `cash` against the row before it (12 "The Dashboard"). */
  const cashRate = Number(rows[rows.length - 1]?.cashRate ?? 0)
  // The template variables: a Request kind and a Region narrow every panel that holds them.
  const kind = model.board.dashboard.kind
  const service = model.board.dashboard.service
  const serviceKinds = service === null ? null : (ledger.services[service]?.kinds ?? [])
  const shownKind = (entry: RequestKind): boolean =>
    (kind === null || entry === kind) && (serviceKinds === null || serviceKinds.includes(entry))
  const region = regional(game) ? model.board.dashboard.region : null
  const regionApdex = region === null ? null : (ledger.regions[region] ?? null)
  const percentiles = has(game, 'percentiles')
  const alerting = has(game, 'alerting')
  const hasNode = (type: ComponentId): boolean => game.nodes.some((node) => node.type === type)
  /** The p99 the Latency rule pages at: the rule's multiple of the busiest kind's Apdex T. */
  const latencyRule = ((): number | null => {
    if (!alerting) return null
    const busiest = (
      Object.entries(ledger.kinds) as ReadonlyArray<[RequestKind, KindLedger | undefined]>
    )
      .filter(([, entry]) => entry !== undefined && entry.rate > 0)
      .sort((left, right) => (right[1]?.rate ?? 0) - (left[1]?.rate ?? 0))[0]
    return busiest ? game.alertRules.latency * PROFILES[busiest[0]].apdex : null
  })()
  const bottleneck = tracks.reduce<NodeTrack | null>(
    (best, track) =>
      (ledger.nodes[track.id]?.utilization ?? 0) >
      (best ? (ledger.nodes[best.id]?.utilization ?? 0) : -1)
        ? track
        : best,
    null,
  )
  const exemplars = exemplarsOf(model, rows)
  const series = (spec: SeriesSpec) => {
    // A Chart lays its labels out for its own width, which the errors Chart narrows.
    const markers = markersOf(model, rows, spec.width ?? CHART_WIDTH)
    return timeSeries(
      model,
      rows,
      spec.key === 'latency' && has(game, 'tracing')
        ? [...markers, ...exemplarMarks(exemplars, typeScaleOf(model))]
        : markers,
      spec,
      h,
    )
  }

  const panels: ReadonlyArray<Html> =
    rows.length < 2 || !latest
      ? [
          h.div(
            [
              h.Key('empty'),
              h.Class(
                cn(
                  PANEL,
                  'col-span-24 px-4 py-6 text-[calc(13px*var(--type-scale))] text-muted-foreground',
                ),
              ),
            ],
            [t.dashboard.chartsFillInAsTheClock],
          ),
        ]
      : [
          stat(
            'users',
            t.dashboard.users,
            compact(region === null ? latest.users : regionUsers(game)[region]),
            'plain',
            rows,
            'users',
            BLUE,
            h,
          ),
          stat(
            'cash-rate',
            t.dashboard.cashPerSecond,
            t.dashboard.s2(cashRate >= 0 ? '+' : '', money(cashRate)),
            cashRate > 0 ? 'ok' : cashRate < 0 ? 'danger' : 'plain',
            rows,
            'cashRate',
            GREEN,
            h,
            false,
            true,
          ),
          gauge(
            'apdex',
            'Apdex',
            regionApdex ?? latest.apdex,
            (regionApdex ?? latest.apdex).toFixed(2),
            { warn: 0.85, danger: 0.7, invert: true },
            h,
          ),
          gauge(
            'bottleneck',
            bottleneck ? t.dashboard.hottestNode(bottleneck.name) : t.dashboard.hottestNode2,
            Math.min(1, bottleneck ? (ledger.nodes[bottleneck.id]?.utilization ?? 0) : 0),
            percent(
              Math.min(9.99, bottleneck ? (ledger.nodes[bottleneck.id]?.utilization ?? 0) : 0),
            ),
            UTILIZATION,
            h,
          ),
          has(game, 'logs')
            ? stat(
                t.dashboard.errors2,
                t.dashboard.errorRate,
                percent(latest.errors, latest.errors < 0.1 ? 2 : 1),
                levelOf(latest.errors, { warn: 0.001, danger: 0.01 }),
                rows,
                t.dashboard.errors2,
                RED,
                h,
                true,
              )
            : locked(
                t.dashboard.errors2,
                'col-span-4 compact:col-span-12',
                t.dashboard.errorRate,
                'logs',
                h,
              ),
          stat(
            'latency',
            percentiles ? t.dashboard.p99Latency : t.dashboard.meanLatency,
            formats(t).ms(percentiles ? latest.p99 : latest.latency),
            'plain',
            rows,
            percentiles ? 'p99' : 'latency',
            PURPLE,
            h,
          ),

          rowHeader(t.dashboard.goldenSignals, 4, h),
          series({
            key: 'traffic',
            span: 'col-span-12',
            title: t.dashboard.traffic,
            unit: t.dashboard.reqPerSecond,
            series: [
              { key: 'served', name: t.dashboard.served, color: TEAL, fill: true },
              { key: 'demand', name: t.dashboard.demand, color: MUTED, dashed: true },
            ],
            format: (value) => t.dashboard.s(compact(value)),
            compare: 'served',
            ...(has(game, 'anomaly-detection')
              ? {
                  rules: [
                    {
                      y: ledger.forecastPeak,
                      label: t.dashboard.tomorrowsPeak(
                        t.units.perSecond(compact(ledger.forecastPeak)),
                      ),
                      color: PINK,
                    },
                  ],
                }
              : {}),
          }),
          series({
            key: 'latency',
            span: 'col-span-12',
            title: t.dashboard.latency,
            unit: percentiles ? t.dashboard.meanP99 : t.dashboard.meanUnit,
            series: percentiles
              ? [
                  { key: 'p99', name: 'p99', color: PURPLE, fill: true },
                  { key: 'latency', name: t.dashboard.mean, color: BLUE },
                ]
              : [{ key: 'latency', name: t.dashboard.mean, color: BLUE, fill: true }],
            format: formats(t).ms,
            compare: percentiles ? 'p99' : 'latency',
            ...(latencyRule === null
              ? {}
              : {
                  rules: [
                    {
                      y: latencyRule,
                      label: t.dashboard.alertAbove(formats(t).ms(latencyRule)),
                      color: AMBER,
                    },
                  ],
                }),
          }),
          ...(has(game, 'tracing') ? [exemplarStrip(exemplars, h)] : []),
          has(game, 'logs')
            ? series({
                key: 'errors-series',
                span: 'col-span-8',
                title: t.dashboard.errors,
                unit: t.dashboard.failed2,
                series: [{ key: 'errors', name: t.dashboard.failed, color: RED, fill: true }],
                format: (value) => `${value.toFixed(value < 1 ? 2 : 1)}%`,
                rules: [
                  {
                    y: (alerting ? game.alertRules.errors : 0.01) * 100,
                    label: t.dashboard.alertAbove(
                      percent(alerting ? game.alertRules.errors : 0.01, 1),
                    ),
                    color: AMBER,
                  },
                ],
                width: 500,
              })
            : locked('errors-series', 'col-span-8', t.dashboard.errors, 'logs', h),
          causes(ledger, h),
          mix(ledger, shownKind, h),

          ...(alerting
            ? [
                rowHeader(t.dashboard.alerts, 2, h),
                alertTable(game, ledger, h),
                alertTimeline(model, rows, h),
              ]
            : []),
          ...(has(game, 'tracing')
            ? [
                rowHeader(t.dashboard.servicesRed, 1, h),
                servicesTable(ledger, shownKind, h),
                ...(game.services.length > 1 ? [serviceTable(game, ledger, service, h)] : []),
                ...(kind ? [waterfallTable(game, ledger, kind, h)] : []),
              ]
            : []),

          rowHeader(t.dashboard.saturation, 3, h),
          barGauge(ledger, tracks, h),
          stateTimeline(model, tracks, h),
          nodeTable(ledger, tracks, h),

          rowHeader(t.dashboard.money, 1, h),
          series({
            key: 'money',
            span: 'col-span-24',
            title: t.dashboard.revenueAndBurn,
            unit: t.dashboard.s4,
            series: [
              { key: 'revenue', name: t.dashboard.revenue, color: TEAL, fill: true },
              { key: 'burn', name: t.dashboard.burn, color: AMBER },
            ],
            format: (value) => money(value),
          }),

          ...(has(game, 'slo-dashboards')
            ? [
                rowHeader('SLO', 4, h),
                stat(
                  'availability',
                  t.dashboard.availabilityWeek,
                  percent(budget.availability, 2),
                  budget.availability >= budget.slo ? 'ok' : 'danger',
                  rows,
                  'availability',
                  GREEN,
                  h,
                ),
                gauge(
                  'error-budget',
                  t.dashboard.errorBudgetLeft,
                  Math.max(0, Math.min(1, budget.left)),
                  budget.left > 0
                    ? `${Math.round(Math.min(1, budget.left) * 100)}%`
                    : t.dashboard.spent,
                  { warn: 0.5, danger: 0.05, invert: true },
                  h,
                ),
                panel(
                  'sla-credit',
                  'col-span-4 compact:col-span-12',
                  t.dashboard.sLACredits,
                  credit > 0 ? t.dashboard.paid : '',
                  [
                    h.div(
                      [
                        h.Class(
                          cn(
                            SCREEN,
                            'flex min-h-[92px] flex-1 flex-col justify-end px-3 pt-2 pb-3',
                          ),
                        ),
                      ],
                      [
                        h.span(
                          [
                            h.Class(
                              cn(
                                FIGURE,
                                'text-[calc(30px*var(--type-scale))] leading-none font-medium tracking-[-0.03em]',
                              ),
                            ),
                            h.Style({ color: credit > 0 ? RED : MUTED }),
                            h.Title(
                              credit > 0
                                ? t.dashboard.slaPaysBack(
                                    t.units.perSecond(money(credit)),
                                    sloText(budget.slo),
                                  )
                                : t.dashboard.noSlaCredit,
                            ),
                          ],
                          [credit > 0 ? `−${t.units.perSecond(money(credit))}` : '—'],
                        ),
                      ],
                    ),
                  ],
                  h,
                  null,
                  credit > 0 ? RED : MUTED,
                ),
                series({
                  key: 'burn-rate',
                  span: 'col-span-12',
                  title: t.dashboard.errorBudgetBurnRate,
                  unit: t.dashboard.budgetSLO(sloText(slo)),
                  series: [
                    { key: 'burnRate', name: t.dashboard.burnRate, color: PINK, fill: true },
                  ],
                  format: (value) => `${value < 10 ? value.toFixed(1) : Math.round(value)}×`,
                  rules: [
                    { y: 10, label: t.dashboard.page10, color: RED },
                    { y: 1, label: '1×', color: MUTED },
                  ],
                }),
              ]
            : [
                rowHeader('SLO', 1, h),
                locked(
                  'burn-rate',
                  'col-span-12',
                  t.dashboard.errorBudgetBurnRate,
                  'slo-dashboards',
                  h,
                ),
              ]),

          ...(has(game, 'profiling')
            ? [rowHeader(t.dashboard.resourcesUse, 1, h), resourceTimeline(model, tracks, h)]
            : has(game, 'tracing')
              ? [
                  rowHeader(t.dashboard.resourcesUse, 1, h),
                  locked('resources', 'col-span-12', t.dashboard.resourcesUse, 'profiling', h),
                ]
              : []),
          ...(hasNode('lb')
            ? [rowHeader(t.dashboard.loadBalancer, 1, h), loadBalancer(game, ledger, h)]
            : []),
          ...(hasNode('server')
            ? [rowHeader(t.dashboard.appServer, 1, h), appServers(game, ledger, h)]
            : []),
          ...(hasNode('database') || hasNode('replica')
            ? [rowHeader(t.dashboard.database, 1, h), databases(game, ledger, h)]
            : []),
          ...(hasNode('cache')
            ? [
                rowHeader(t.dashboard.cache, 1, h),
                hits('cache', t.dashboard.cache, t.dashboard.hitRatioNow, 'cache', game, ledger, h),
                evictions(game, ledger, h),
              ]
            : []),
          ...(hasNode('queue')
            ? [rowHeader(t.dashboard.queue, 1, h), queues(game, ledger, h)]
            : []),
          ...(hasNode('cdn')
            ? [
                rowHeader('CDN', 1, h),
                hits(
                  'cdn',
                  'CDN',
                  t.dashboard.hitRatioEgress(t.units.perSecond(money(ledger.egress))),
                  'cdn',
                  game,
                  ledger,
                  h,
                ),
              ]
            : []),
          ...(game.nodes.some((node) => MANAGED.includes(node.type))
            ? [rowHeader(t.dashboard.managedComponents, 1, h), managed(game, ledger, h)]
            : []),

          ...(has(game, 'multi-region')
            ? [
                rowHeader(t.dashboard.users, 1, h),
                usersTable(game, ledger, region, h),
                ...(has(game, 'rum') ? [deviceTable(ledger, h)] : []),
              ]
            : []),

          ...(game.sandbox
            ? []
            : [rowHeader(t.dashboard.company, 3, h), ...companyPanels(model, ledger, rows, h)]),
          ...(game.incident === null && game.postmortems.length === 0
            ? []
            : [
                rowHeader(
                  t.dashboard.incidents,
                  game.postmortems.some(
                    (postmortem) => postmortem.id === model.board.dashboard.postmortem,
                  )
                    ? 4
                    : 3,
                  h,
                ),
                ...incidentPanels(model, rows, h),
              ]),
        ]

  return h.div(
    [
      h.Key('dashboard'),
      h.DataAttribute('dashboard', ''),
      h.DataAttribute('exit', 'gesture'),
      h.Class('absolute inset-0 z-30 flex flex-col bg-canvas text-foreground enter-backdrop'),
    ],
    [
      topBar(model, h),
      h.div(
        [
          h.Key('scroll'),
          h.DataAttribute('scroll', 'dashboard'),
          // The panels run past the window: a keyboard player tabs here and scrolls the last rows (15).
          h.Tabindex(0),
          h.Role('region'),
          h.AriaLabel(t.dashboard.dashboardScrollForTheCompanyAnd),
          h.Class(
            cn(
              'min-h-0 flex-1',
              SCROLL,
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
            ),
          ),
        ],
        [
          variables(model, slo, h),
          h.div([h.Class('grid grid-cols-24 gap-2.5 px-4 pt-3 pb-10 compact:px-3')], panels),
        ],
      ),
    ],
  )
}
