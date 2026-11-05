import { DashboardMessage } from '@/game/dashboard.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ChevronDown, Clock3, LayoutGrid, RefreshCw, Star, X } from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import type { Limit } from '@quorum/simulation/capacity'
import {
  ALERT_RULES,
  COMPONENTS,
  DEVICES,
  DEVICE_INFO,
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
import { ERROR_CAUSES } from '@quorum/simulation/distribution'
import { dilutionOf, grantOf } from '@quorum/simulation/founding'
<<<<<<< HEAD
import type { KindLedger, Ledger } from '@quorum/simulation/ledger'
import { nodeLabel } from '@quorum/simulation/labels'
=======
import type { KindLedger, Ledger, NodeLedger } from '@quorum/simulation/ledger'
>>>>>>> 67a21db (Add the last eleven research items across Observability, Security and Cost)
import { eraOf, has } from '@quorum/simulation/lookups'
import { regional, regionUsers } from '@quorum/simulation/regions'
import { RUNWAY_MONTH, runwayOf } from '@quorum/simulation/runway'
import { budgetOf, slaCreditsOf } from '@quorum/simulation/slo'
import type { Game, Postmortem, Sample } from '@quorum/simulation/state'
import { ignored } from '@quorum/simulation/step'
import { teamOutputs } from '@quorum/simulation/team'
import { type Field, TIERS, type Tier, blockIndexAt, startOf } from '@/game/history.ts'
import { alertText, compact, money, ms, queueWait, rate as rateText } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import {
  ANNOTATION_GROUPS,
  type AnnotationGroup,
  type Mail,
  type Model,
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

/* ==========================================================================
   The Dashboard (12 "The Dashboard"): the Design over time, as a full page
   like Research, styled after a Grafana board in the game's own tokens, so
   it follows the theme. Panels vary the way Grafana's do: stats, gauges, LCD bar gauges, a state timeline, time
   series with gradient fills, a pie, and a table with coloured cells. Rows follow the visibility
   ladder, then each Component the Board holds, and every time series carries a marker for a deploy, a
   Design change, an Incident and a Company event (12 "Annotations").
   ========================================================================== */

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

/* ==========================================================================
   Data
   ========================================================================== */

/** The resolution a range reads: one-minute Samples, then 15-minute blocks, then 1-hour blocks. */
const tierOf = (range: number): Tier | null =>
  range <= 600 ? null : range <= 10_080 ? 'quarter' : 'hour'

/** A row's label: the clock, and the calendar day when the range spans days. */
const labelOf = (time: number, range: number): string =>
  range > 1440 ? `D${clockOf(time).day} ${hhmm(time)}` : hhmm(time)

/**
 * The rows in range, each with its label, its start in sim time (`at`), its length in calendar
 * minutes (`span`), and its figures. A block row draws the mean of each field, except p99,
 * which draws the worst minute: a block's mean p99 would hide the spike the tail is about.
 */
const rowsOf = (model: Model, slo: number): ReadonlyArray<Row> => {
  const range = model.board.dashboard.range
  const tier = tierOf(range)
  const figures = (value: (field: Field) => number, at: number, span: number): Row => ({
    t: labelOf(at, range),
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

/** The label of the row a sim time falls in, if the range holds it. */
const labelAt = (rows: ReadonlyArray<Row>, time: number): string | null => {
  const row = rows.find(
    (entry) => Number(entry.at) <= time && time < Number(entry.at) + Number(entry.span),
  )
  return row ? String(row.t) : null
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
const namesOf = (game: Game): ReadonlyMap<string, string> => {
  const counts = new Map<string, number>()
  const names = new Map<string, string>()
  for (const node of game.nodes) {
    const base = COMPONENTS[node.type].name
    const count = (counts.get(base) ?? 0) + 1
    counts.set(base, count)
    names.set(node.id, count > 1 ? `${base} ${count}` : base)
  }
  return names
}

type NodeTrack = Readonly<{ id: string; name: string; values: ReadonlyArray<number> }>

/** Utilization per Node from the Model's 10-second history, with the same labels as the Board. */
const tracksOf = (model: Model): ReadonlyArray<NodeTrack> =>
  model.board.game.nodes
    .filter((node) => node.type !== 'users')
    .map((node) => ({
      id: node.id,
      name: nodeLabel(model.board.game, node),
      values: (model.board.nodeHistory[node.id] ?? []).map((sample) => sample.utilization),
    }))

/* ==========================================================================
   The Company and Incidents panels (15 "Panels")
   ========================================================================== */

const runwayText = (seconds: number | null): string =>
  seconds === null ? '∞' : `${(seconds / RUNWAY_MONTH).toFixed(1)} mo`

/** A funding round the Company entered: the offer after its Mutators and perks, and the Inbox's answer. */
type FundingRound = Readonly<{
  key: string
  name: string
  users: number
  /** The fixed grant, or null for the IPO, which pays public money rather than a round. */
  grant: number | null
  dilution: number
  answer: string
  when: string
}>

/**
 * The rounds the Company entered, newest first. The Game keeps the Era but no round time and no
 * answer, so the offer comes from the Era catalog and the answer from the Inbox Thread the round
 * left (12 "Annotations" reads the Inbox for the same reason).
 */
const fundingOf = (model: Model): ReadonlyArray<FundingRound> => {
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
      name: next.name,
      users: era.raiseAt,
      grant: ipo ? null : grantOf(game, era.grant),
      dilution: dilutionOf(game, era.dilution),
      answer: ipo
        ? 'Listed'
        : mail?.answer === 'You raised the round.'
          ? 'Raised'
          : mail?.answer === 'You declined the round.'
            ? 'Declined'
            : '—',
      when: at === undefined ? '—' : `D${clockOf(at.time).day} ${hhmm(at.time)}`,
    })
  }
  return rounds.reverse()
}

const TEAM_KIND: Readonly<Record<'product' | 'platform' | 'sre' | 'data' | 'security', string>> = {
  product: 'Product',
  platform: 'Platform',
  sre: 'SRE',
  data: 'Data',
  security: 'Security',
}

/** Dev Hours per real minute, as the Team panel counts them. */
const dhPerMinute = (rate: number): string => {
  const value = rate * 60
  return value < 10 ? value.toFixed(1) : String(Math.round(value))
}

const minutesText = (seconds: number): string => `${Math.round(Math.max(0, seconds))}m`

/** A time the Game did not record, in a save from before the field or a run that never signalled. */
const minutesOrUnknown = (seconds: number | null | undefined): string =>
  seconds === null || seconds === undefined ? '—' : minutesText(seconds)

/** Seconds from an Incident's start to its first signal, or null before it signals. */
const mttdOf = (incident: NonNullable<Game['incident']>): number | null =>
  incident.signalAt === null ? null : Math.max(0, incident.signalAt - incident.startedAt)

/** Seconds from that signal to the acknowledgement, or null before anyone answers. */
const mttaOf = (incident: NonNullable<Game['incident']>): number | null =>
  incident.ackAt === null || incident.signalAt === null
    ? null
    : Math.max(0, incident.ackAt - incident.signalAt)

/** What an Incident is hitting: a Node, a zone, a region, or every region. */
const incidentTarget = (game: Game, incident: NonNullable<Game['incident']>): string => {
  if (incident.nodeId !== null) return namesOf(game).get(incident.nodeId) ?? incident.nodeId
  if (incident.zone !== null) return `Zone ${incident.zone.toUpperCase()}`
  if (incident.region !== null) return REGION_INFO[incident.region].name
  return 'Every region'
}

/** A Postmortem's action item: its research, whether it is owned, or nothing. */
const actionText = (game: Game, postmortem: Postmortem): string =>
  postmortem.action === null
    ? '—'
    : has(game, postmortem.action)
      ? `Owned · ${RESEARCH[postmortem.action].name}`
      : RESEARCH[postmortem.action].name

/* ==========================================================================
   Panel chrome
   ========================================================================== */

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
): Html =>
  panel(
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
            [`No data · research ${research}`],
          ),
        ],
      ),
    ],
    h,
  )

/** A Grafana row header. */
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
        [`(${count} ${count === 1 ? 'panel' : 'panels'})`],
      ),
    ],
  )

/* ==========================================================================
   Time series
   ========================================================================== */

/** Chart text in the game's figure face; only foldcn's hover bands take the pointer, not the fills drawn over them. */
const PLOT =
  '[&_text]:font-mono [&_text]:text-[calc(10px*var(--type-scale))] [&_text]:fill-[var(--muted-foreground)] [&_text]:tracking-[-0.01em] [&_path]:pointer-events-none [&_line]:pointer-events-none [&_text]:pointer-events-none'

/** Lifts a marker's label from the bottom of the plot to its top. */
const TOP_OF_PLOT = -150

const ANNOTATION_COLOR: Record<AnnotationGroup, string> = {
  design: BLUE,
  deploys: PURPLE,
  incidents: RED,
  company: PINK,
  research: GREEN,
}

const ANNOTATION_NAME: Record<AnnotationGroup, string> = {
  design: 'Design change',
  deploys: 'Deploy',
  incidents: 'Incident',
  company: 'Company',
  research: 'Research',
}

/** One mark on the timeline: its group, the sim second it happened, and its label. */
type Annotation = Readonly<{ group: AnnotationGroup; at: number; label: string }>

/** A Thread's key, as `mail.ts` writes it: `event:<topic>:<about>`, or a sender's own key. */
const keyParts = (mail: Mail): ReadonlyArray<string> => mail.key.split(':')

/** The Incident kind a Thread's topic names, when the two spell it the same way. */
const incidentNameOf = (topic: string): string =>
  (INCIDENTS as Readonly<Record<string, Readonly<{ name: string }> | undefined>>)[topic]?.name ??
  'Incident'

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
const markOfMail = (mail: Mail): Readonly<{ group: AnnotationGroup; label: string }> | null => {
  const [from, topic, about] = keyParts(mail)
  if (from === 'event' && topic !== undefined) {
    if (topic === 'deployed') return { group: 'deploys', label: '⇢ Deploy' }
    if (topic === 'deployed-bad') return { group: 'deploys', label: '⇢ Bad deploy' }
    if (topic.startsWith('incident-'))
      return {
        group: 'incidents',
        label: `▲ ${incidentNameOf(topic.slice('incident-'.length))}`,
      }
    if (topic === 'hired') return { group: 'company', label: '◆ Hired' }
  }
  if (mail.key === 'mentor:ipo') return { group: 'company', label: '◆ IPO' }
  // The round a Stage's term sheet offers, which opens the next Era.
  if (from === 'investor' && topic === 'round') {
    const stage = Number(about)
    const era = ERAS[Number.isFinite(stage) ? stage + 1 : 0]?.name
    return { group: 'company', label: `◆ ${era ?? 'Funding'} round` }
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
  const shown = model.board.dashboard.groups
  const incident = model.board.game.incident
  const open: ReadonlyArray<Annotation> = incident
    ? [
        {
          group: 'incidents',
          at: incident.startedAt,
          label: `▲ SEV${incident.severity} ${INCIDENTS[incident.kind].name}`,
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
    const mark = markOfMail(thread)
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
          : [{ group: 'research' as const, at: entry.time, label: '⬡ Research' }],
      ),
    )
  return [...design, ...open, ...mail, ...finished].filter((mark) => shown.includes(mark.group))
}

/** The annotations, as labelled vertical markers on every time series. */
const markersOf = (model: Model, rows: ReadonlyArray<Row>): ReadonlyArray<CartesianChild> =>
  annotationsOf(model).flatMap((mark) => {
    const t = labelAt(rows, Math.floor(mark.at))
    if (t === null) return []
    const color = ANNOTATION_COLOR[mark.group]
    return [
      ReferenceLine({
        x: t,
        stroke: color,
        strokeDasharray: '3 3',
        label: { value: mark.label, dx: 4, dy: TOP_OF_PLOT, fill: color },
      }),
    ]
  })

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
): Html =>
  h.div(
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
                : [`mean ${spec.format(mean)}  max ${spec.format(max)}  last ${spec.format(last)}`],
            ),
          ],
        )
      }),
    ],
  )

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
                  h.th([h.Class(cn(border, 'text-left font-medium'))], ['Time']),
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
    ? [...spec.series, { key: 'cmp', name: 'Yesterday', color: COMPARE_COLOR, faint: true }]
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
                    width: spec.width ?? 760,
                    height: 210,
                    margin: { top: 10, right: 12, bottom: 0, left: 2 },
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
                        interval: Math.max(
                          0,
                          Math.ceil(rows.length / ((spec.width ?? 760) / 70)) - 1,
                        ),
                        padding: { left: 32 },
                        // Ends the right-most label at the plot edge, so the well does not clip it.
                        tick: ({ x, y, value }) =>
                          h.text(
                            [
                              h.Attribute('x', String(x)),
                              h.Attribute('y', String(y - 14)),
                              h.Attribute(
                                'text-anchor',
                                x + 30 > (spec.width ?? 760) ? 'end' : 'middle',
                              ),
                            ],
                            [String(value)],
                          ),
                        stroke: 'var(--hairline)',
                      }),
                      YAxis({
                        width: 58,
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

/* ==========================================================================
   Stat and gauge
   ========================================================================== */

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

/* ==========================================================================
   Bar gauge, state timeline, pie, and table
   ========================================================================== */

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
): Html =>
  panel(
    'bar-gauge',
    'col-span-8',
    'Utilization now',
    '% of capacity',
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

const STATE_LABEL: Record<Level, string> = { ok: 'OK', warn: 'HIGH', danger: 'SATURATED' }

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
  const length = Math.max(1, ...tracks.map((track) => track.values.length))
  const last = Math.floor(model.board.game.time / NODE_EVERY) * NODE_EVERY
  const first = last - (length - 1) * NODE_EVERY
  const lanes = tracks.map((track) => ({
    key: track.id,
    name: track.name,
    runs: runsOf(
      track.values.map((value) => levelOf(value, UTILIZATION)),
      length - track.values.length,
      (level) => ({ color: LEVEL_COLOR[level], label: STATE_LABEL[level] }),
    ),
  }))
  return laneTimeline(
    'state-timeline',
    'col-span-16',
    'Node state',
    'utilization · last 24 h',
    lanes,
    length,
    first,
    last,
    h,
  )
}

const kindColor = (kind: Kind): string => `#${KINDS[kind].color.toString(16).padStart(6, '0')}`

/** The request mix now, as Grafana's donut with a table legend. `kind` narrows it to one Service. */
const mix = (ledger: Ledger, kind: RequestKind | null, h: HtmlBuilder<Message>): Html => {
  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[Kind, { rate: number; p99: number }]>
  )
    .filter(([entryKind, entry]) => entry.rate > 0 && (kind === null || entryKind === kind))
    .sort((a, b) => b[1].rate - a[1].rate)
  const total = kinds.reduce((sum, [, entry]) => sum + entry.rate, 0)
  return panel(
    'mix',
    'col-span-8',
    'Request mix',
    'req/s by kind',
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 items-center gap-3 p-3'))],
        [
          h.div(
            [h.Class('w-[118px] shrink-0')],
            [
              PieChart(
                {
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
                        [`${compact(entry.rate)}/s`],
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
  const entries = ERROR_CAUSES.map((cause) => [cause, ledger.errors[cause]] as const)
    .filter(([, rate]) => rate > 0.0005)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const max = Math.max(...entries.map(([, rate]) => rate), 0.001)
  return panel(
    'causes',
    'col-span-8',
    'Errors by cause',
    'req/s now',
    [
      h.div(
        [h.Class(cn(SCREEN, 'flex flex-1 flex-col justify-center gap-1.5 p-3'))],
        entries.length === 0
          ? [
              h.span(
                [h.Key('none'), h.Class(cn(FIGURE, 'text-[calc(28px*var(--type-scale))] text-ok'))],
                ['0 errors'],
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
                    [cause],
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
                    [`${compact(rate)}/s`],
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
  const sorted = [...tracks].sort(
    (a, b) => (ledger.nodes[b.id]?.utilization ?? 0) - (ledger.nodes[a.id]?.utilization ?? 0),
  )
  const head = ['Node', 'Inbound', 'Capacity', 'Load', 'Latency', 'p99', 'Dropped', 'Status']
  return panel(
    'nodes',
    'col-span-24',
    'Nodes',
    `${tracks.length} rows`,
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
                        [`${compact(own?.inbound ?? 0)}/s`],
                      ),
                      h.td(
                        [h.Class(cn(cell, FIGURE, 'text-right text-muted-foreground'))],
                        [`${compact(own?.capacity ?? 0)}/s`],
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
                      h.td([h.Class(cn(cell, FIGURE, 'text-right'))], [ms(own?.latency ?? 0)]),
                      h.td([h.Class(cn(cell, FIGURE, 'text-right'))], [ms(own?.p99 ?? 0)]),
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
                        [`${compact(own?.dropped ?? 0)}/s`],
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
                        [own?.status === 'down' ? 'DOWN' : STATE_LABEL[level]],
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

/* ==========================================================================
   Tables and bars
   ========================================================================== */

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
                ['Nothing to show yet.'],
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
                ['No Node to show.'],
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

/* ==========================================================================
   The Company panel (15 "Panels"): money and runway, the team's shape, and
   every round the Company entered. It reads the Game, the Ledger and the Inbox.
   ========================================================================== */

/**
 * The Money card's Cash series: the same Area the stat panels draw, over the
 * Dashboard's range. A Sample carries Cash since SIM_VERSION 26, so the row
 * that shows Cash now also shows where it has been (15 "Company and Incidents
 * panels"). The line turns red once Cash is short, like the HUD's figure.
 */
const cashSpark = (rows: ReadonlyArray<Row>, h: HtmlBuilder<Message>): Html => {
  const values = rows.map((row) => Number(row.cash))
  const short = (values[values.length - 1] ?? 0) < 0
  const color = short ? RED : GREEN
  const spec: SeriesSpec = {
    key: 'cash-series',
    span: '',
    title: 'Cash',
    unit: '$',
    series: [{ key: 'cash', name: 'Cash', color }],
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
                  name: 'Cash',
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
  const game = model.board.game
  const net = ledger.revenue - ledger.burn
  const runway = runwayOf(game, ledger)
  const teams = teamOutputs(game, ledger)
  const people = teams.reduce((sum, entry) => sum + entry.headcount, 0)
  // A layoff's morale hit is global and already inside each team's velocity (08 "Hiring").
  const morale = game.time < game.moraleUntil
  const teamUnit = `${people} ${people === 1 ? 'person' : 'people'} · velocity${
    morale ? ` · morale −${Math.round((1 - LAYOFF_MORALE) * 100)}%` : ''
  }`
  const credits = slaCreditsOf(game, ledger)
  const moneyRows: ReadonlyArray<readonly [string, string, Message?]> = [
    ['Cash', money(game.cash)],
    ['Revenue', `${money(ledger.revenue)}/s`],
    ['Burn', `${money(ledger.burn)}/s`],
    ['Net', `${net >= 0 ? '+' : ''}${money(net)}/s`],
    ['Payroll', `${money(ledger.salaries)}/s`],
    ['Equity', percent(game.equity)],
    ['Runway', runwayText(runway)],
    // The SLA pays its credits back on top of Burn, so Cash falls faster than the bill (09).
    ...(credits > 0 ? [['SLA credits', `−${money(credits)}/s`] as const] : []),
    // Cash is short and the investors' bridge waits: its terms and the way to take it (09).
    ...(game.bridge
      ? [
          [
            'Bridge',
            `${money(game.bridge.grant)} · ${percent(game.bridge.dilution)} · Accept`,
            Message.BridgeAccepted(),
          ] as const,
        ]
      : []),
  ]
  return [
    tablePanel(
      'company-money',
      'col-span-8',
      'Money',
      `now · cash ${rangeLabel(model.board.dashboard.range)}`,
      ['Line', 'Value'],
      moneyRows.map(([name, value, onClick]) => ({
        key: name,
        cells: [
          { text: name },
          onClick === undefined
            ? { text: value }
            : {
                text: value,
                onClick,
                hint: 'Cash is short: take the grant, or cut costs before the Nodes shut down.',
              },
        ],
      })),
      h,
      [cashSpark(rows, h)],
    ),
    tablePanel(
      'company-team',
      'col-span-16',
      'Team',
      teamUnit,
      ['Team', 'Kind', 'People', 'Effective', 'Velocity', 'DH/min'],
      teams.map((entry) => ({
        key: entry.team.id,
        cells: [
          { text: entry.team.name },
          { text: TEAM_KIND[entry.team.kind] },
          { text: String(entry.headcount) },
          { text: entry.effective.toFixed(1) },
          { text: `×${entry.velocity.toFixed(2)}` },
          { text: dhPerMinute(entry.rate) },
        ],
      })),
      h,
    ),
    tablePanel(
      'company-funding',
      'col-span-24',
      'Funding',
      'rounds · from the Inbox',
      ['Round', 'At users', 'Grant', 'Dilution', 'Answer', 'When'],
      fundingOf(model).map((round) => ({
        key: round.key,
        cells: [
          { text: round.name },
          { text: round.users.toLocaleString('en-US') },
          { text: round.grant === null ? 'Public market' : money(round.grant) },
          { text: percent(round.dilution) },
          {
            text: round.answer,
            color: round.answer === 'Raised' ? GREEN : round.answer === 'Declined' ? AMBER : MUTED,
          },
          { text: round.when },
        ],
      })),
      h,
    ),
  ]
}

/* ==========================================================================
   The Incidents panel (15 "Panels"): the running Incident and the Postmortems
   the Game keeps. The chosen row opens its Postmortem below the list.
   ========================================================================== */

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
            ? block(start, end, UNSEEN, `not seen · ${minutesText(end - start)}`)
            : block(start, end, color, held),
        ],
      }
    const signal = Math.min(end, Math.max(start, signalAt))
    const answered = ackAt === null ? null : Math.min(end, Math.max(signal, ackAt))
    const runs: Array<Run> = []
    if (signal > start)
      runs.push(block(start, signal, UNSEEN, `not seen · ${minutesText(signal - start)}`))
    const awaited = answered ?? end
    if (awaited > signal)
      runs.push(block(signal, awaited, AWAITING, `awaiting ack · ${minutesText(awaited - signal)}`))
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
        INCIDENTS[postmortem.kind].name,
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
        `Running · ${INCIDENTS[incident.kind].name}`,
        incident.startedAt,
        now,
        incident.severity,
        incident.signalAt,
        incident.ackAt,
        true,
      ),
    )
  }
  if (lanes.length === 0)
    return panel(
      'incident-timeline',
      'col-span-24',
      'Incident timeline',
      rangeLabel(range),
      [
        h.div(
          [h.Class(cn(SCREEN, 'px-2 py-3'))],
          [
            h.span(
              [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground'))],
              ['No run in this range.'],
            ),
          ],
        ),
      ],
      h,
    )
  return laneTimeline(
    'incident-timeline',
    'col-span-24',
    'Incident timeline',
    `run · ${rangeLabel(range)}`,
    lanes,
    span,
    first,
    last,
    h,
    [
      ...(lanes.some((entry) => entry.runs.some((run) => run.color === UNSEEN))
        ? [swatch('Not seen', UNSEEN, h)]
        : []),
      ...(lanes.some((entry) => entry.runs.some((run) => run.color === AWAITING))
        ? [swatch('Awaiting ack', AWAITING, h)]
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
  const incident = game.incident
  if (incident === null)
    return tablePanel(
      'incident-running',
      'col-span-8',
      'Running Incident',
      'none',
      ['Fact', 'Value'],
      [{ key: 'none', cells: [{ text: 'State' }, { text: 'No incident running' }] }],
      h,
    )
  const elapsed = Math.max(0, game.time - incident.startedAt)
  const total = elapsed + Math.max(0, incident.remaining)
  const facts: ReadonlyArray<readonly [string, Cell]> = [
    ['Severity', { text: `SEV${incident.severity}` }],
    ['Target', { text: incidentTarget(game, incident) }],
    [
      'Cause',
      {
        text:
          incident.causedBy === null ? '—' : `${INCIDENTS[incident.causedBy].name} · left alone`,
      },
    ],
    [
      'Run',
      {
        text: `${minutesText(elapsed)} / ${minutesText(total)}`,
        bar: { share: total > 0 ? Math.min(1, elapsed / total) : 0, color: RED },
      },
    ],
    ['MTTD', { text: minutesOrUnknown(mttdOf(incident)) }],
    ['MTTA', { text: minutesOrUnknown(mttaOf(incident)) }],
    ['MTTR so far', { text: minutesText(incident.impaired) }],
    ['Users lost', { text: `−${compact(Math.max(0, incident.usersAtStart - game.users))}` }],
    ['Revenue lost', { text: `−${money(incident.lostRevenue)}` }],
    ['Failed', { text: compact(incident.failed) }],
  ]
  return tablePanel(
    'incident-running',
    'col-span-8',
    'Running Incident',
    INCIDENTS[incident.kind].name,
    ['Fact', 'Value'],
    facts.map(([name, cell]) => ({ key: name, cells: [{ text: name }, cell] })),
    h,
  )
}

const incidentHistory = (game: Game, h: HtmlBuilder<Message>): Html =>
  tablePanel(
    'incident-history',
    'col-span-16',
    'Incident history',
    `${game.postmortems.length} postmortems`,
    [
      'Incident',
      'Cause',
      'SEV',
      'Target',
      'Run',
      'MTTD',
      'MTTA',
      'MTTR',
      'Users',
      'Revenue',
      'Failed',
      'Action',
    ],
    [...game.postmortems].reverse().map((postmortem) => ({
      key: `pm-${postmortem.id}`,
      cells: [
        {
          text: INCIDENTS[postmortem.kind].name,
          onClick: Message.DashboardChanged({
            message: DashboardMessage.PostmortemChosen({ id: postmortem.id }),
          }),
          hint: 'Show this postmortem',
        },
        {
          text: postmortem.causedBy === null ? '—' : INCIDENTS[postmortem.causedBy].name,
        },
        { text: `SEV${postmortem.severity}` },
        { text: postmortem.target ?? '—' },
        { text: minutesText(postmortem.duration) },
        { text: minutesOrUnknown(postmortem.mttd) },
        { text: minutesOrUnknown(postmortem.mtta) },
        { text: minutesText(postmortem.mttr) },
        { text: `−${compact(postmortem.lostUsers)}` },
        { text: `−${money(postmortem.lostRevenue)}` },
        { text: compact(postmortem.failed) },
        { text: actionText(game, postmortem), color: actionColor(game, postmortem) },
      ],
    })),
    h,
  )

const postmortemDetail = (game: Game, postmortem: Postmortem, h: HtmlBuilder<Message>): Html => {
  const def = INCIDENTS[postmortem.kind]
  const facts: ReadonlyArray<readonly [string, string]> = [
    ['Run', minutesText(postmortem.duration)],
    ['Cause', postmortem.causedBy === null ? '—' : INCIDENTS[postmortem.causedBy].name],
    ['MTTD', minutesOrUnknown(postmortem.mttd)],
    ['MTTA', minutesOrUnknown(postmortem.mtta)],
    ['MTTR', minutesText(postmortem.mttr)],
    ['Users lost', `−${compact(postmortem.lostUsers)}`],
    ['Revenue lost', `−${money(postmortem.lostRevenue)}`],
    ['Failed', compact(postmortem.failed)],
  ]
  const open = postmortem.action !== null && !has(game, postmortem.action)
  return panel(
    `pm-detail-${postmortem.id}`,
    'col-span-24',
    `Postmortem · ${def.name}`,
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
                ? 'No action item: the Design already owns every prevention.'
                : has(game, postmortem.action)
                  ? `Action item done: ${RESEARCH[postmortem.action].name}.`
                  : `Action item open: ${RESEARCH[postmortem.action].name}.`,
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

/* ==========================================================================
   Rows by research (12 "Charts by research")
   ========================================================================== */

const RULES = ['errors', 'latency', 'saturation'] as const
type Rule = (typeof RULES)[number]
const RULE_NAME: Record<Rule, string> = {
  errors: 'Error rate',
  latency: 'Latency',
  saturation: 'Saturation',
}

type AlertState = 'ok' | 'pending' | 'firing' | 'ignored'
const ALERT_STATE: Record<AlertState, Readonly<{ color: string; label: string }>> = {
  ok: { color: GREEN, label: 'OK' },
  pending: { color: AMBER, label: 'PENDING' },
  firing: { color: RED, label: 'FIRING' },
  ignored: { color: MUTED, label: 'IGNORED' },
}

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
  return { errors: ledger.errorShare, latency: slowest, saturation: hottest }
}

const asRule = (value: string | undefined): Rule | null =>
  value === 'errors' || value === 'latency' || value === 'saturation' ? value : null

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
      name: RULE_NAME[rule],
      runs: runsOf(states, 0, (state) => ALERT_STATE[state]),
    }
  })
  const first = Number(rows[0]?.at ?? 0)
  const end = Number(rows[last]?.at ?? first) + Number(rows[last]?.span ?? 1)
  return laneTimeline(
    'alert-state',
    'col-span-12',
    'Alert state',
    'pages the Inbox kept',
    lanes,
    Math.max(1, rows.length),
    first,
    end,
    h,
    Object.values(ALERT_STATE).map((state) => swatch(state.label, state.color, h)),
  )
}

/** The alert rules and their thresholds, with what each watches now. */
const alertTable = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const watched = watchedOf(game, ledger)
  const limit = (rule: Rule): string =>
    rule === 'errors'
      ? percent(game.alertRules.errors, 1)
      : rule === 'latency'
        ? `${game.alertRules.latency}× T`
        : percent(game.alertRules.saturation)
  const seen = (rule: Rule): string =>
    rule === 'errors'
      ? percent(watched.errors, 2)
      : rule === 'latency'
        ? `${watched.latency.toFixed(1)}× T`
        : percent(watched.saturation)
  return tablePanel(
    'alert-rules',
    'col-span-12',
    'Alert rules',
    'the pager’s conditions',
    ['Rule', 'Threshold', 'Now', 'Held', 'State'],
    RULES.map((rule) => {
      const state = ALERT_STATE[alertStateOf(game, rule)]
      return {
        key: rule,
        cells: [
          {
            text: RULE_NAME[rule],
            hint: alertText(rule, game.alertRules[rule]),
          },
          { text: limit(rule) },
          { text: seen(rule) },
          { text: `${Math.round(game.alarms[rule])}s / ${ALERT_RULES[rule].seconds}s` },
          { text: state.label, fill: state.color },
        ],
      }
    }),
    h,
  )
}

/** The RED method: rate, errors and duration for each Service the Design serves, or for one. */
const servicesTable = (ledger: Ledger, only: RequestKind | null, h: HtmlBuilder<Message>): Html => {
  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[RequestKind, KindLedger | undefined]>
  )
    .flatMap(([kind, entry]) =>
      entry === undefined || entry.rate <= 0 || (only !== null && kind !== only)
        ? []
        : [{ kind, entry }],
    )
    .sort((left, right) => right.entry.rate - left.entry.rate)
  const total = kinds.reduce((sum, { entry }) => sum + entry.rate, 0)
  return tablePanel(
    'services',
    'col-span-24',
    'Services',
    'Rate, Errors, Duration · now',
    ['Service', 'Rate', 'Share', 'Errors', 'Mean', 'p99'],
    kinds.map(({ kind, entry }) => {
      const failed = 1 - entry.success
      return {
        key: kind,
        cells: [
          { text: KINDS[kind].label },
          { text: `${rateText(entry.rate)}/s` },
          { text: percent(total > 0 ? entry.rate / total : 0) },
          { text: percent(failed, failed < 0.1 ? 2 : 1), color: failed > 0.01 ? RED : undefined },
          { text: ms(entry.mean) },
          { text: ms(entry.p99) },
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
  const names = namesOf(game)
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
    'Waterfall',
    `${KINDS[kind].label} · hop time and wait, Node by Node`,
    ['Node', 'Hop time', 'Wait', 'Bottleneck'],
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
            { text: names.get(id) ?? COMPONENTS[node.type].name },
            { text: ms(hop) },
            { text: wait > 0 ? queueWait(wait) : '—' },
            {
              text: id === bottleneck ? 'Bottleneck' : '',
              color: id === bottleneck ? RED : undefined,
            },
          ],
        },
      ]
    }),
    h,
  )
}

const LIMIT_NAME: Record<Limit, string> = {
  cpu: 'CPU',
  credits: 'CPU credits',
  memory: 'Memory',
  workers: 'Workers',
  connections: 'Connections',
  network: 'Network',
  disk: 'Disk',
  throughput: 'Throughput',
  none: 'No limit',
}

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
        label: LIMIT_NAME[limit],
      })),
    }
  })
  const present = [
    ...new Set(tracks.flatMap((track) => (history[track.id] ?? []).map((sample) => sample.limit))),
  ]
  return laneTimeline(
    'resources',
    'col-span-24',
    'Resources',
    'the limiting resource · last 24 min',
    lanes,
    length,
    first,
    last,
    h,
    present.map((limit) => swatch(LIMIT_NAME[limit], LIMIT_COLOR[limit], h)),
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
  const all = churnCache.get(game) ?? churnOf(game, ledger)
  churnCache.set(game, all)
  const regions = only === null ? all : all.filter((region) => region.region === only)
  const split = regional(game)
  return tablePanel(
    'users',
    'col-span-24',
    'Users',
    'by region · market and churn',
    ['Region', 'Users', 'Market', 'Share', 'Apdex', 'Churn'],
    regions.map((region) => {
      const market = ledger.market * (split ? REGION_INFO[region.region].share : 1)
      const share = market > 0 ? region.users / market : 0
      return {
        key: region.region,
        cells: [
          { text: REGION_INFO[region.region].name },
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
            text: `${region.perHour >= 0 ? '+' : ''}${compact(region.perHour)}/h`,
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
const deviceTable = (ledger: Ledger, h: HtmlBuilder<Message>): Html =>
  tablePanel(
    'devices',
    'col-span-24',
    'Real user monitoring',
    'mean latency from the user’s side, by device',
    ['Device', 'Latency'],
    DEVICES.map((device) => ({
      key: device,
      cells: [{ text: DEVICE_INFO[device].name }, { text: ms(ledger.deviceLatency[device] ?? 0) }],
    })),
    h,
  )

/* ==========================================================================
   Component rows (12 "Component rows")
   ========================================================================== */

/** The Load Balancer's traffic per backend, which shows an uneven split. */
const loadBalancer = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const names = namesOf(game)
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
        text: `${rateText(link.rate)}/s`,
      })),
  )
  return barList(
    'load-balancer',
    'col-span-24',
    'Load Balancer',
    entries.length === 0
      ? 'no backend'
      : `req/s per backend · even split ${percent(1 / entries.length)}`,
    entries,
    h,
  )
}

/** Each App Server's copies, and the workers busy against the pool they share. */
const appServers = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const names = namesOf(game)
  return tablePanel(
    'app-server',
    'col-span-24',
    'App Server',
    'copies · busy workers against the pool',
    ['Node', 'Copies', 'Busy workers'],
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
            { text: names.get(node.id) ?? COMPONENTS[node.type].name },
            {
              text:
                node.pending > 0
                  ? `${node.replicas} (+${node.pending} booting)`
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
  const names = namesOf(game)
  return tablePanel(
    'database',
    'col-span-24',
    'Database',
    'connections · refused · replica lag',
    ['Node', 'Connections', 'Queries', 'Refused', 'Lag'],
    game.nodes
      .filter((node) => node.type === 'database' || node.type === 'replica')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const connections = own?.connections ?? null
        const share = connections === null ? 0 : connections.used / Math.max(1, connections.max)
        const refused = own?.refused ?? 0
        const lag = own?.lag ?? null
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? COMPONENTS[node.type].name },
            connections === null
              ? { text: '—' }
              : {
                  text: `${Math.round(connections.used)}/${Math.round(connections.max)}`,
                  bar: { share, color: LEVEL_COLOR[levelOf(share, UTILIZATION)] },
                },
            { text: `${compact(own?.inbound ?? 0)}/s` },
            {
              text: refused > 0.0005 ? `${compact(refused)}/s` : '—',
              color: refused > 0.0005 ? RED : undefined,
            },
            { text: lag === null ? '—' : ms(lag) },
          ],
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
  const names = namesOf(game)
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
          name: names.get(node.id) ?? COMPONENTS[node.type].name,
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
  const names = namesOf(game)
  return tablePanel(
    'queue',
    'col-span-24',
    'Queue',
    'depth · age of the oldest task',
    ['Queue', 'Depth', 'Oldest task', 'Drained', 'State'],
    game.nodes
      .filter((node) => node.type === 'queue')
      .map((node) => {
        const own = ledger.nodes[node.id]
        const age = own?.age ?? null
        const stalled = age === Number.POSITIVE_INFINITY
        const down = own?.status === 'down'
        const level: Level = down || stalled ? 'danger' : age !== null && age > 0 ? 'warn' : 'ok'
        const label = down
          ? 'DOWN'
          : stalled
            ? 'STALLED'
            : age !== null && age > 0
              ? 'WAITING'
              : 'CLEAR'
        const drained = Object.values(own?.out ?? {}).reduce((sum, rate) => sum + rate, 0)
        return {
          key: node.id,
          cells: [
            { text: names.get(node.id) ?? COMPONENTS[node.type].name },
            { text: compact(node.depth) },
            { text: queueWait(age) },
            { text: `${compact(drained)}/s` },
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
  const names = namesOf(game)
  return tablePanel(
    'managed',
    'col-span-24',
    'Managed Components',
    'calls · latency · outage',
    ['Component', 'Calls', 'Sent', 'Latency', 'State'],
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
            { text: names.get(node.id) ?? COMPONENTS[node.type].name },
            { text: `${compact(own?.inbound ?? 0)}/s` },
            { text: sent > 0 ? `${compact(sent)}/s` : '—' },
            { text: ms(own?.latency ?? 0) },
            {
              text: down ? 'DOWN' : throttled ? 'THROTTLED' : 'UP',
              fill: LEVEL_COLOR[down ? 'danger' : throttled ? 'warn' : 'ok'],
            },
          ],
        }
      }),
    h,
  )
}

/* ==========================================================================
   The page
   ========================================================================== */

const rangeLabel = (minutes: number): string =>
  minutes >= 1440 ? `${minutes / 1440}d` : `${minutes / 60}h`

/** Grafana's top bar: breadcrumb, time picker, and refresh. */
const topBar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const now = clockOf(model.board.game.time)
  const open = boardSandbox(model.board)
  const place = open ? (open.id === null ? 'Free Sandbox' : 'Sandbox') : 'Company'
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
              'Dashboards',
              h.span([], ['/']),
              place,
              h.span([], ['/']),
              h.span(
                [
                  h.Class(
                    'text-[calc(15px*var(--type-scale))] font-semibold tracking-[-0.02em] text-foreground',
                  ),
                ],
                ['Overview'],
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
                [rangeLabel(minutes)],
              ),
            ),
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'flex h-7 items-center gap-2 rounded-lg bg-raised px-2.5 text-[calc(12px*var(--type-scale))] shadow-raised',
                  model.board.clock.paused ? 'text-muted-foreground' : 'text-foreground',
                ),
              ),
            ],
            [
              led(model.board.clock.paused ? MUTED : GREEN, h),
              model.board.clock.paused
                ? 'Paused'
                : `Live · D${now.day} ${String(now.hour).padStart(2, '0')}:${String(now.minute).padStart(2, '0')}`,
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
              attributes: [h.AriaLabel('Close (Esc)')],
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
 * switches, and a switch per annotation group. A Service filter waits on a per-Service figure the
 * Ledger does not hold: the Game keeps one Service, and no Sample says which Service it served.
 */
const variables = (model: Model, slo: number, h: HtmlBuilder<Message>): Html => {
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
        'kind',
        dashboard.kind ?? 'all',
        [['all', 'All kinds'], ...REQUEST_KINDS.map((kind) => [kind, KINDS[kind].label] as const)],
        (value) =>
          Message.DashboardChanged({
            message: DashboardMessage.KindChosen({
              kind: value === 'all' ? null : (value as RequestKind),
            }),
          }),
      ),
      regional(game)
        ? select(
            'region',
            dashboard.region ?? 'all',
            [
              ['all', 'All regions'],
              ...REGIONS.map((region) => [region, REGION_INFO[region].name] as const),
            ],
            (value) =>
              Message.DashboardChanged({
                message: DashboardMessage.RegionChosen({
                  region: value === 'all' ? null : (value as RegionId),
                }),
              }),
          )
        : chip('region', model.board.region),
      chip('era', eraOf(game).name),
      chip('slo', sloText(slo)),
      h.span([h.Class('flex-1')], []),
      toggle(
        'Compare',
        dashboard.compare,
        Message.DashboardChanged({ message: DashboardMessage.CompareToggled() }),
      ),
      toggle(
        'Table',
        dashboard.table,
        Message.DashboardChanged({ message: DashboardMessage.TableToggled() }),
      ),
      h.div(
        [h.Class('flex flex-wrap items-center gap-1')],
        ANNOTATION_GROUPS.map((group) =>
          toggle(
            ANNOTATION_NAME[group],
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
  const game = model.board.game
  const ledger = ledgerOf(model)
  const budget = budgetOf(game)
  const credit = slaCreditsOf(game, ledger)
  const slo = budget.slo > 0 && budget.slo < 1 ? budget.slo : 0.999
  const rows = rowsOf(model, slo)
  const markers = markersOf(model, rows)
  const tracks = tracksOf(model)
  const latest = game.history[game.history.length - 1]
  /** Cash per second now: the last row's `cash` against the row before it (12 "The Dashboard"). */
  const cashRate = Number(rows[rows.length - 1]?.cashRate ?? 0)
  // The template variables: a Request kind and a Region narrow every panel that holds them.
  const kind = model.board.dashboard.kind
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
  const series = (spec: SeriesSpec) => timeSeries(model, rows, markers, spec, h)

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
            ['Charts fill in as the clock runs.'],
          ),
        ]
      : [
          stat(
            'users',
            'Users',
            compact(region === null ? latest.users : regionUsers(game)[region]),
            'plain',
            rows,
            'users',
            BLUE,
            h,
          ),
          stat(
            'cash-rate',
            'Cash per second',
            `${cashRate >= 0 ? '+' : ''}${money(cashRate)}/s`,
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
            bottleneck ? `Hottest Node · ${bottleneck.name}` : 'Hottest Node',
            Math.min(1, bottleneck ? (ledger.nodes[bottleneck.id]?.utilization ?? 0) : 0),
            percent(
              Math.min(9.99, bottleneck ? (ledger.nodes[bottleneck.id]?.utilization ?? 0) : 0),
            ),
            UTILIZATION,
            h,
          ),
          has(game, 'logs')
            ? stat(
                'errors',
                'Error rate',
                percent(latest.errors, latest.errors < 0.1 ? 2 : 1),
                levelOf(latest.errors, { warn: 0.001, danger: 0.01 }),
                rows,
                'errors',
                RED,
                h,
                true,
              )
            : locked('errors', 'col-span-4 compact:col-span-12', 'Error rate', 'logs', h),
          stat(
            'latency',
            percentiles ? 'p99 latency' : 'Mean latency',
            ms(percentiles ? latest.p99 : latest.latency),
            'plain',
            rows,
            percentiles ? 'p99' : 'latency',
            PURPLE,
            h,
          ),

          rowHeader('Golden signals', 4, h),
          series({
            key: 'traffic',
            span: 'col-span-12',
            title: 'Traffic',
            unit: 'req/s',
            series: [
              { key: 'served', name: 'Served', color: TEAL, fill: true },
              { key: 'demand', name: 'Demand', color: MUTED, dashed: true },
            ],
            format: (value) => `${compact(value)}/s`,
            compare: 'served',
            ...(has(game, 'anomaly-detection')
              ? {
                  rules: [
                    {
                      y: ledger.forecastPeak,
                      label: `tomorrow’s peak ${compact(ledger.forecastPeak)}/s`,
                      color: PINK,
                    },
                  ],
                }
              : {}),
          }),
          series({
            key: 'latency',
            span: 'col-span-12',
            title: 'Latency',
            unit: percentiles ? 'mean · p99' : 'mean',
            series: percentiles
              ? [
                  { key: 'p99', name: 'p99', color: PURPLE, fill: true },
                  { key: 'latency', name: 'Mean', color: BLUE },
                ]
              : [{ key: 'latency', name: 'Mean', color: BLUE, fill: true }],
            format: ms,
            compare: percentiles ? 'p99' : 'latency',
            ...(latencyRule === null
              ? {}
              : {
                  rules: [{ y: latencyRule, label: `alert > ${ms(latencyRule)}`, color: AMBER }],
                }),
          }),
          has(game, 'logs')
            ? series({
                key: 'errors-series',
                span: 'col-span-8',
                title: 'Errors',
                unit: '% failed',
                series: [{ key: 'errors', name: 'Failed', color: RED, fill: true }],
                format: (value) => `${value.toFixed(value < 1 ? 2 : 1)}%`,
                rules: [
                  {
                    y: (alerting ? game.alertRules.errors : 0.01) * 100,
                    label: `alert > ${percent(alerting ? game.alertRules.errors : 0.01, 1)}`,
                    color: AMBER,
                  },
                ],
                width: 500,
              })
            : locked('errors-series', 'col-span-8', 'Errors', 'logs', h),
          causes(ledger, h),
          mix(ledger, kind, h),

          ...(alerting
            ? [
                rowHeader('Alerts', 2, h),
                alertTable(game, ledger, h),
                alertTimeline(model, rows, h),
              ]
            : []),
          ...(has(game, 'tracing')
            ? [
                rowHeader('Services (RED)', 1, h),
                servicesTable(ledger, kind, h),
                ...(kind ? [waterfallTable(game, ledger, kind, h)] : []),
              ]
            : []),

          rowHeader('Saturation', 3, h),
          barGauge(ledger, tracks, h),
          stateTimeline(model, tracks, h),
          nodeTable(ledger, tracks, h),

          rowHeader('Money', 1, h),
          series({
            key: 'money',
            span: 'col-span-24',
            title: 'Revenue and Burn',
            unit: '$/s',
            series: [
              { key: 'revenue', name: 'Revenue', color: TEAL, fill: true },
              { key: 'burn', name: 'Burn', color: AMBER },
            ],
            format: (value) => money(value),
          }),

          ...(has(game, 'slo-dashboards')
            ? [
                rowHeader('SLO', 4, h),
                stat(
                  'availability',
                  'Availability · week',
                  percent(budget.availability, 2),
                  budget.availability >= budget.slo ? 'ok' : 'danger',
                  rows,
                  'availability',
                  GREEN,
                  h,
                ),
                gauge(
                  'error-budget',
                  'Error budget left',
                  Math.max(0, Math.min(1, budget.left)),
                  budget.left > 0 ? `${Math.round(Math.min(1, budget.left) * 100)}%` : 'spent',
                  { warn: 0.5, danger: 0.05, invert: true },
                  h,
                ),
                panel(
                  'sla-credit',
                  'col-span-4 compact:col-span-12',
                  'SLA credits',
                  credit > 0 ? 'paid' : '',
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
                                ? `The SLA pays ${money(credit)}/s back to customers while the week sits under ${sloText(budget.slo)}`
                                : 'No SLA credit: no SLA signed, its Era not reached, or the week met the target',
                            ),
                          ],
                          [credit > 0 ? `−${money(credit)}/s` : '—'],
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
                  title: 'Error budget burn rate',
                  unit: `× budget · SLO ${sloText(slo)}`,
                  series: [{ key: 'burnRate', name: 'Burn rate', color: PINK, fill: true }],
                  format: (value) => `${value < 10 ? value.toFixed(1) : Math.round(value)}×`,
                  rules: [
                    { y: 10, label: 'page > 10×', color: RED },
                    { y: 1, label: '1×', color: MUTED },
                  ],
                }),
              ]
            : [
                rowHeader('SLO', 1, h),
                locked('burn-rate', 'col-span-12', 'Error budget burn rate', 'slo-dashboards', h),
              ]),

          ...(has(game, 'profiling')
            ? [rowHeader('Resources (USE)', 1, h), resourceTimeline(model, tracks, h)]
            : has(game, 'tracing')
              ? [
                  rowHeader('Resources (USE)', 1, h),
                  locked('resources', 'col-span-12', 'Resources (USE)', 'profiling', h),
                ]
              : []),
          ...(hasNode('lb')
            ? [rowHeader('Load Balancer', 1, h), loadBalancer(game, ledger, h)]
            : []),
          ...(hasNode('server')
            ? [rowHeader('App Server', 1, h), appServers(game, ledger, h)]
            : []),
          ...(hasNode('database') || hasNode('replica')
            ? [rowHeader('Database', 1, h), databases(game, ledger, h)]
            : []),
          ...(hasNode('cache')
            ? [
                rowHeader('Cache', 1, h),
                hits('cache', 'Cache', 'hit ratio · now', 'cache', game, ledger, h),
              ]
            : []),
          ...(hasNode('queue') ? [rowHeader('Queue', 1, h), queues(game, ledger, h)] : []),
          ...(hasNode('cdn')
            ? [
                rowHeader('CDN', 1, h),
                hits(
                  'cdn',
                  'CDN',
                  `hit ratio · Design egress ${money(ledger.egress)}/s`,
                  'cdn',
                  game,
                  ledger,
                  h,
                ),
              ]
            : []),
          ...(game.nodes.some((node) => MANAGED.includes(node.type))
            ? [rowHeader('Managed Components', 1, h), managed(game, ledger, h)]
            : []),

          ...(has(game, 'multi-region')
            ? [
                rowHeader('Users', 1, h),
                usersTable(game, ledger, region, h),
                ...(has(game, 'rum') ? [deviceTable(ledger, h)] : []),
              ]
            : []),

          ...(game.sandbox
            ? []
            : [rowHeader('Company', 3, h), ...companyPanels(model, ledger, rows, h)]),
          ...(game.incident === null && game.postmortems.length === 0
            ? []
            : [
                rowHeader(
                  'Incidents',
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
          h.AriaLabel('Dashboard, scroll for the Company and Incidents rows'),
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
