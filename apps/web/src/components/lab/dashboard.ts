import { DashboardMessage } from '@/game/dashboard.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ChevronDown, Clock3, LayoutGrid, RefreshCw, Star, X } from 'lucide'
import { clockOf } from '@quorum/simulation/calendar'
import type { Limit } from '@quorum/simulation/capacity'
import {
  ALERT_RULES,
  COMPONENTS,
  ERAS,
  INCIDENTS,
  KINDS,
  LAYOFF_MORALE,
  PROFILES,
  REGION_INFO,
  RESEARCH,
  type ComponentId,
  type Kind,
  type RequestKind,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { churnOf, type RegionChurn } from '@quorum/simulation/churn'
import { ERROR_CAUSES } from '@quorum/simulation/distribution'
import { dilutionOf, grantOf } from '@quorum/simulation/founding'
import type { KindLedger, Ledger } from '@quorum/simulation/ledger'
import { nodeLabel } from '@quorum/simulation/labels'
import { eraOf, has } from '@quorum/simulation/lookups'
import { regional } from '@quorum/simulation/regions'
import { RUNWAY_MONTH, runwayOf } from '@quorum/simulation/runway'
import { budgetOf } from '@quorum/simulation/slo'
import type { Game, Postmortem, Sample } from '@quorum/simulation/state'
import { ignored } from '@quorum/simulation/step'
import { teamOutputs } from '@quorum/simulation/team'
import { type Field, TIERS, type Tier, startOf } from '@/game/history.ts'
import { alertText, compact, money, ms, queueWait, rate as rateText } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Mail, type Model, ledgerOf, boardSandbox } from '@/game/model.ts'
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

type Row = Readonly<Record<string, number | string>>

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
    revenue: value('revenue'),
    burn: value('burn'),
    burnRate: value('errors') / (1 - slo),
  })
  if (tier === null) {
    const history = model.board.game.history
    const last = Math.floor(model.board.game.time)
    const kept = history.slice(Math.max(0, history.length - range))
    return kept.map((sample: Sample, index) =>
      figures((field) => sample[field], last - (kept.length - 1 - index), 1),
    )
  }
  const { minutes } = TIERS[tier]
  const blocks = model.board.dashboard.history[tier]
  return blocks
    .slice(Math.max(0, blocks.length - Math.ceil(range / minutes)))
    .map((block) =>
      figures(
        (field) =>
          field === 'p99' ? (block.max[field] ?? 0) : (block.sum[field] ?? 0) / block.count,
        startOf(block.index, tier),
        minutes,
      ),
    )
}

/** The label of the row a sim time falls in, if the range holds it. */
const labelAt = (rows: ReadonlyArray<Row>, time: number): string | null => {
  const row = rows.find(
    (entry) => Number(entry.at) <= time && time < Number(entry.at) + Number(entry.span),
  )
  return row ? String(row.t) : null
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

const TEAM_KIND: Readonly<Record<'product' | 'platform', string>> = {
  product: 'Product',
  platform: 'Platform',
}

/** Dev Hours per real minute, as the Team panel counts them. */
const dhPerMinute = (rate: number): string => {
  const value = rate * 60
  return value < 10 ? value.toFixed(1) : String(Math.round(value))
}

const minutesText = (seconds: number): string => `${Math.round(Math.max(0, seconds))}m`

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
        [`(${count} panels)`],
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

/** The groups the build draws. Research has no mark: the Game keeps no time for a Study. */
type AnnotationGroup = 'design' | 'deploys' | 'incidents' | 'company'

const ANNOTATION_GROUPS: ReadonlyArray<AnnotationGroup> = [
  'design',
  'deploys',
  'incidents',
  'company',
]

const ANNOTATION_COLOR: Record<AnnotationGroup, string> = {
  design: BLUE,
  deploys: PURPLE,
  incidents: RED,
  company: PINK,
}

const ANNOTATION_NAME: Record<AnnotationGroup, string> = {
  design: 'Design change',
  deploys: 'Deploy',
  incidents: 'Incident',
  company: 'Company',
}

/** One mark on the timeline: its group, the sim second it happened, and its label. */
type Annotation = Readonly<{ group: AnnotationGroup; at: number; label: string }>

/** A Thread's key, as `mail.ts` writes it: `event:<topic>:<about>`, or a sender's own key. */
const keyParts = (mail: Mail): ReadonlyArray<string> => mail.key.split(':')

/** The Incident kind a Thread's topic names, when the two spell it the same way. */
const incidentNameOf = (topic: string): string =>
  (INCIDENTS as Readonly<Record<string, Readonly<{ name: string }> | undefined>>)[topic]?.name ??
  'Incident'

/**
 * What a Thread marks, if anything. The Inbox is the only record of when an
 * event happened that the Model keeps: the Game holds no deploy, hire or round
 * time. It keeps only its last Threads, so the marks reach as far back as its
 * Mail does.
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

/** Every mark the history holds, in the order the groups are drawn. */
const annotationsOf = (model: Model): ReadonlyArray<Annotation> => {
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
  return [...design, ...open, ...mail]
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
}>

type SeriesSpec = Readonly<{
  key: string
  span: string
  title: string
  unit: string
  series: ReadonlyArray<Series>
  format: (value: number) => string
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

/** The legend under a time series, in Grafana's list mode: swatch, name, mean, max, last. */
const seriesLegend = (
  rows: ReadonlyArray<Row>,
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
      ...spec.series.map((series) => {
        const values = rows.map((row) => Number(row[series.key]))
        const last = values[values.length - 1] ?? 0
        const max = Math.max(...values)
        const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
        return h.span(
          [h.Key(series.key), h.Class('flex items-center gap-1.5 whitespace-nowrap')],
          [
            h.span(
              [h.Class('h-[3px] w-3.5 rounded-full'), h.Style({ background: series.color })],
              [],
            ),
            h.span([h.Class('text-foreground')], [series.name]),
            h.span(
              [h.Class(cn(FIGURE, 'text-muted-foreground'))],
              hovered
                ? [spec.format(Number(hovered[series.key]))]
                : [`mean ${spec.format(mean)}  max ${spec.format(max)}  last ${spec.format(last)}`],
            ),
          ],
        )
      }),
    ],
  )

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
  return panel(
    spec.key,
    spec.span,
    spec.title,
    spec.unit,
    [
      h.div(
        [h.Class(cn(SCREEN, 'min-h-0 flex-1 px-1 pt-1'))],
        [
          ComposedChart(
            {
              data: rows,
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
              defs: spec.series
                .filter((series) => series.fill)
                .map((series) => gradient(id(series), series.color, h)),
              children: [
                CartesianGrid({ stroke: 'var(--hairline)' }),
                XAxis({
                  dataKey: 't',
                  interval: Math.max(0, Math.ceil(rows.length / ((spec.width ?? 760) / 70)) - 1),
                  padding: { left: 32 },
                  // Ends the right-most label at the plot edge, so the well does not clip it.
                  tick: ({ x, y, value }) =>
                    h.text(
                      [
                        h.Attribute('x', String(x)),
                        h.Attribute('y', String(y - 14)),
                        h.Attribute('text-anchor', x + 30 > (spec.width ?? 760) ? 'end' : 'middle'),
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
                ...spec.series.map((series) =>
                  series.fill
                    ? Area({
                        dataKey: series.key,
                        name: series.name,
                        stroke: series.color,
                        strokeWidth: 1.5,
                        fill: `url(#${id(series)})`,
                        fillOpacity: 1,
                        type: 'linear',
                      })
                    : Line({
                        dataKey: series.key,
                        name: series.name,
                        stroke: series.color,
                        strokeWidth: 1.5,
                        type: 'linear',
                        dot: false,
                        activeDot: { r: 3, fill: series.color, stroke: 'var(--card)' },
                        ...(series.dashed ? { strokeDasharray: '4 3' } : {}),
                      }),
                ),
              ],
            },
            h,
          ),
        ],
      ),
      seriesLegend(rows, spec, hovered, h),
    ],
    h,
    null,
    spec.series[0]?.color,
  )
}

/* ==========================================================================
   Stat and gauge
   ========================================================================== */

/** The top of a sparkline's scale: room above the peak, so a flat history is a line, not a slab. */
const sparkTop = (rows: ReadonlyArray<Row>, key: string): number =>
  Math.max(1e-9, ...rows.map((row) => Number(row[key]))) * 1.6

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
                    YAxis({ hide: true, domain: [0, sparkTop(rows, dataKey)] }),
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

/** The request mix now, as Grafana's donut with a table legend. */
const mix = (ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[Kind, { rate: number; p99: number }]>
  )
    .filter(([, entry]) => entry.rate > 0)
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

const companyPanels = (
  model: Model,
  ledger: Ledger,
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
  const moneyRows: ReadonlyArray<readonly [string, string, Message?]> = [
    ['Cash', money(game.cash)],
    ['Revenue', `${money(ledger.revenue)}/s`],
    ['Burn', `${money(ledger.burn)}/s`],
    ['Net', `${net >= 0 ? '+' : ''}${money(net)}/s`],
    ['Payroll', `${money(ledger.salaries)}/s`],
    ['Equity', percent(game.equity)],
    ['Runway', runwayText(runway)],
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
      'now',
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
      'Run',
      {
        text: `${minutesText(elapsed)} / ${minutesText(total)}`,
        bar: { share: total > 0 ? Math.min(1, elapsed / total) : 0, color: RED },
      },
    ],
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
    ['Incident', 'SEV', 'Target', 'Run', 'MTTR', 'Users', 'Revenue', 'Failed', 'Action'],
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
        { text: `SEV${postmortem.severity}` },
        { text: postmortem.target ?? '—' },
        { text: minutesText(postmortem.duration) },
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
            [h.Class('grid grid-cols-5 divide-x divide-hairline')],
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

const incidentPanels = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const game = model.board.game
  const chosen = game.postmortems.find(
    (postmortem) => postmortem.id === model.board.dashboard.postmortem,
  )
  return [
    runningIncident(game, h),
    incidentHistory(game, h),
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

/** The RED method: rate, errors and duration for each Service the Design serves. */
const servicesTable = (ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const kinds = (
    Object.entries(ledger.kinds) as ReadonlyArray<[RequestKind, KindLedger | undefined]>
  )
    .flatMap(([kind, entry]) => (entry === undefined || entry.rate <= 0 ? [] : [{ kind, entry }]))
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
const usersTable = (game: Game, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const regions = churnCache.get(game) ?? churnOf(game, ledger)
  churnCache.set(game, regions)
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

/** Grafana's variable bar: read-only facts about what the board shows. */
const variables = (model: Model, slo: number, h: HtmlBuilder<Message>): Html => {
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
  return h.div(
    [h.Class('flex flex-wrap items-center gap-2 px-4 pt-4 compact:px-3')],
    [
      chip('era', eraOf(model.board.game).name),
      chip('region', model.board.region),
      chip('slo', percent(slo, slo >= 0.999 ? 1 : 0)),
      h.span([h.Class('flex-1')], []),
      h.div(
        [
          h.Class(
            'flex flex-wrap items-center gap-3 text-[calc(11px*var(--type-scale))] text-muted-foreground',
          ),
        ],
        ANNOTATION_GROUPS.map((group) =>
          h.span(
            [h.Key(group), h.Class('flex items-center gap-1.5')],
            [
              h.span(
                [
                  h.Class('h-3 border-l border-dashed'),
                  h.Style({ borderColor: ANNOTATION_COLOR[group] }),
                ],
                [],
              ),
              ANNOTATION_NAME[group],
            ],
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
  const slo = budget.slo > 0 && budget.slo < 1 ? budget.slo : 0.999
  const rows = rowsOf(model, slo)
  const markers = markersOf(model, rows)
  const tracks = tracksOf(model)
  const latest = game.history[game.history.length - 1]
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
          stat('users', 'Users', compact(latest.users), 'plain', rows, 'users', BLUE, h),
          stat(
            'revenue',
            'Revenue',
            `${money(latest.revenue)}/s`,
            'plain',
            rows,
            'revenue',
            TEAL,
            h,
          ),
          gauge(
            'apdex',
            'Apdex',
            latest.apdex,
            latest.apdex.toFixed(2),
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
          mix(ledger, h),

          ...(alerting
            ? [
                rowHeader('Alerts', 2, h),
                alertTable(game, ledger, h),
                alertTimeline(model, rows, h),
              ]
            : []),
          ...(has(game, 'tracing')
            ? [rowHeader('Services (RED)', 1, h), servicesTable(ledger, h)]
            : []),

          rowHeader('Saturation', 3, h),
          barGauge(ledger, tracks, h),
          stateTimeline(model, tracks, h),
          nodeTable(ledger, tracks, h),

          rowHeader('Money and error budget', 2, h),
          series({
            key: 'money',
            span: 'col-span-12',
            title: 'Revenue and Burn',
            unit: '$/s',
            series: [
              { key: 'revenue', name: 'Revenue', color: TEAL, fill: true },
              { key: 'burn', name: 'Burn', color: AMBER },
            ],
            format: (value) => money(value),
          }),
          has(game, 'slo-dashboards')
            ? series({
                key: 'burn-rate',
                span: 'col-span-12',
                title: 'Error budget burn rate',
                unit: `× budget · SLO ${percent(slo, slo >= 0.999 ? 1 : 0)}`,
                series: [{ key: 'burnRate', name: 'Burn rate', color: PINK, fill: true }],
                format: (value) => `${value < 10 ? value.toFixed(1) : Math.round(value)}×`,
                rules: [
                  { y: 10, label: 'page > 10×', color: RED },
                  { y: 1, label: '1×', color: MUTED },
                ],
              })
            : locked('burn-rate', 'col-span-12', 'Error budget burn rate', 'slo-dashboards', h),

          ...(has(game, 'tracing')
            ? [rowHeader('Resources (USE)', 1, h), resourceTimeline(model, tracks, h)]
            : []),
          ...(hasNode('lb')
            ? [rowHeader('Load Balancer', 1, h), loadBalancer(game, ledger, h)]
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
            ? [rowHeader('Users', 1, h), usersTable(game, ledger, h)]
            : []),

          ...(game.sandbox ? [] : [rowHeader('Company', 3, h), ...companyPanels(model, ledger, h)]),
          ...(game.incident === null && game.postmortems.length === 0
            ? []
            : [
                rowHeader(
                  'Incidents',
                  game.postmortems.some(
                    (postmortem) => postmortem.id === model.board.dashboard.postmortem,
                  )
                    ? 3
                    : 2,
                  h,
                ),
                ...incidentPanels(model, h),
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
        [h.Key('scroll'), h.Class(cn('min-h-0 flex-1', SCROLL))],
        [
          variables(model, slo, h),
          h.div([h.Class('grid grid-cols-24 gap-2.5 px-4 pt-3 pb-10 compact:px-3')], panels),
        ],
      ),
    ],
  )
}
