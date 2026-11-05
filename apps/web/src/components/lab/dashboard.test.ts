import { expect, test } from 'vitest'
import { Option } from 'effect'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import {
  ERAS,
  INCIDENTS,
  KINDS,
  REGION_INFO,
  RESEARCH,
  type ComponentId,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { clockOf } from '@quorum/simulation/calendar'
import { churnOf } from '@quorum/simulation/churn'
import { preseedGame } from '@quorum/simulation/company'
import type { KindLedger } from '@quorum/simulation/ledger'
import { regionUsers, withRegionUsers } from '@quorum/simulation/regions'
import type { Game, GameLink, GameNode, Postmortem, Sample } from '@quorum/simulation/state'
import { teamOutputs } from '@quorum/simulation/team'
import { compact, money, ms, queueWait, rate as rateText } from '@quorum/ui/game/format'
import { DashboardMessage } from '@/game/dashboard.ts'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Mail, type Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { sampleNode, type NodeSample } from '@/game/node-metrics.ts'
import { blockIndexAt, startOf } from '@/game/history.ts'
import { AppendLog } from '@/game/commands.ts'
import { dashboardPanel } from './dashboard.ts'

/* ==========================================================================
   The Dashboard's rows by research, its Component rows, and its annotation
   groups (12 "Charts by research", "Component rows", "Annotations"). Each
   test asserts the figures a panel draws, read back from the same Ledger.
   ========================================================================== */

const RESEARCHED: ReadonlyArray<ResearchId> = [
  'metrics',
  'logs',
  'percentiles',
  'alerting',
  'tracing',
  'slo-dashboards',
  'multi-region',
]

/** One Sample, as the Simulation writes one per sim second. */
const sampleOf = (over: Partial<Sample> = {}): Sample => ({
  users: 1_050,
  demand: 30,
  served: 28,
  revenue: 0.5,
  burn: 0.2,
  cash: 12_000,
  latency: 80,
  p99: 300,
  apdex: 0.9,
  errors: 0.01,
  ...over,
})

/** A Node of another type, built from the preseeding Board's App Server. */
const nodeOf = (
  base: Game,
  type: ComponentId,
  id: string,
  over: Partial<GameNode> = {},
): GameNode => ({
  ...(base.nodes.find((node) => node.type === 'server') as GameNode),
  id,
  type,
  ...over,
})

/** A Link, built from the preseeding Board's first one. */
const linkOf = (base: Game, from: string, to: string): GameLink => ({
  ...(base.links[0] as GameLink),
  from,
  to,
})

/** A Thread of Mail, one entry per time, with the answer a button wrote when it has one. */
const threadOf = (
  key: string,
  times: ReadonlyArray<number>,
  answer: string | null = null,
): Mail => ({
  id: times.length,
  key,
  sender: 'monitoring',
  subject: 'Re: something',
  time: times[times.length - 1] ?? 0,
  entries: times.map((time) => ({ time, text: '…' })),
  actions: [],
  answer,
  read: true,
  trashed: false,
  spam: false,
  resolved: null,
})

/** One design change, as the undo stack records it. */
const changeOf = (label: string, at: number): Model['board']['undo'][number] => ({
  label,
  nodes: [],
  links: [],
  nextId: 1,
  cash: 0,
  at,
})

type Fixture = Readonly<{
  /** The Board's Nodes and Links, given the preseeding Game. */
  build?: (
    base: Game,
  ) => Readonly<{ nodes: ReadonlyArray<GameNode>; links: ReadonlyArray<GameLink> }>
  /** The Game's own fields, on top of the preseeding ones. */
  game?: Partial<Game>
  /** The Board's Node history, undo stack, and Inbox. */
  board?: Partial<Model['board']>
}>

const fixture = (options: Fixture = {}): Model => {
  const base = preseedGame()
  const built = options.build?.(base) ?? { nodes: base.nodes, links: base.links }
  const game: Game = {
    ...base,
    time: 1_000,
    researched: [...new Set([...base.researched, ...RESEARCHED])],
    history: [sampleOf(), sampleOf(), sampleOf()],
    nodes: [...built.nodes],
    links: [...built.links],
    ...options.game,
  }
  const start = initialModel()
  return { ...start, board: { ...start.board, game, ...options.board } }
}

/** A Board holding every Node the Component rows draw. */
const components = (base: Game) => ({
  nodes: [
    ...base.nodes,
    nodeOf(base, 'cdn', 'cdn'),
    nodeOf(base, 'lb', 'lb'),
    nodeOf(base, 'cache', 'cache'),
    nodeOf(base, 'queue', 'queue', { depth: 42 }),
    nodeOf(base, 'psp', 'psp'),
  ],
  links: [
    linkOf(base, 'users', 'cdn'),
    linkOf(base, 'cdn', 'lb'),
    linkOf(base, 'lb', 'server'),
    linkOf(base, 'server', 'database'),
    linkOf(base, 'server', 'analytics'),
    linkOf(base, 'server', 'cache'),
    linkOf(base, 'cache', 'database'),
    linkOf(base, 'server', 'psp'),
  ],
})

const view = (model: Model, h: HtmlBuilder<Message>) => dashboardPanel(model, h)

const board = Scene.selector('[data-dashboard]')
const row = (label: string) => Scene.selector(`[data-row="${label}"]`)

test('the Alerts row draws each rule’s threshold and state, and the pages the Inbox kept', () => {
  const model = fixture({
    game: { alarms: { errors: 40, latency: 0, saturation: 20 } },
    board: {
      inbox: {
        ...initialModel().board.inbox,
        mail: [
          threadOf('event:alert:latency', [998]),
          threadOf('event:alert-ignored:saturation', [999]),
        ],
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Alerts')).toExist(),
    // Held seconds against each rule's own window.
    Scene.expect(board).toContainText('40s / 30s'),
    Scene.expect(board).toContainText('0s / 30s'),
    Scene.expect(board).toContainText('FIRING'),
    Scene.expect(board).toContainText('PENDING'),
    Scene.expect(board).toContainText('4× T'),
    Scene.expect(board).toContainText('90%'),
    // A page the Inbox kept, on a rule that is quiet now.
    Scene.expect(Scene.selector('[title="Latency: FIRING"]')).toExist(),
    Scene.expect(Scene.selector('[title="Latency: OK"]')).toExist(),
    // The team gave up on Saturation, and it is pending now.
    Scene.expect(Scene.selector('[title="Saturation: IGNORED"]')).toExist(),
    Scene.expect(Scene.selector('[title="Saturation: PENDING"]')).toExist(),
  )
})

test('the Services row draws each kind’s rate, errors and duration from the Ledger', () => {
  const model = fixture()
  const ledger = ledgerOf(model)
  const busiest = (
    Object.entries(ledger.kinds) as ReadonlyArray<[keyof typeof KINDS, KindLedger | undefined]>
  )
    .flatMap(([kind, entry]) => (entry === undefined || entry.rate <= 0 ? [] : [{ kind, entry }]))
    .sort((left, right) => right.entry.rate - left.entry.rate)[0] as
    | Readonly<{ kind: keyof typeof KINDS; entry: KindLedger }>
    | undefined
  if (busiest === undefined) throw new Error('the fixture Design serves nothing')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Services (RED)')).toExist(),
    Scene.expect(Scene.text('Services')).toExist(),
    Scene.expect(board).toContainText(KINDS[busiest.kind].label),
    Scene.expect(board).toContainText(`${rateText(busiest.entry.rate)}/s`),
    Scene.expect(board).toContainText(ms(busiest.entry.mean)),
    Scene.expect(board).toContainText(ms(busiest.entry.p99)),
  )
})

test('the Resources row colours each Node by the resource that limited it', () => {
  const model = fixture()
  const game = model.board.game
  const ledger = ledgerOf(model)
  const node = (id: string): GameNode => game.nodes.find((entry) => entry.id === id) as GameNode
  const evidence = (id: string, limits: ReadonlyArray<NodeSample['limit']>) =>
    limits.map((limit) => ({ ...sampleNode(game, node(id), ledger), limit }))
  const withHistory: Model = {
    ...model,
    board: {
      ...model.board,
      nodeHistory: {
        server: evidence('server', ['cpu', 'workers']),
        database: evidence('database', ['connections', 'connections']),
      },
    },
  }
  Scene.scene(
    { update, view },
    Scene.given(withHistory),
    Scene.expect(row('Resources (USE)')).toExist(),
    Scene.expect(Scene.selector('[title="App Server: CPU"]')).toExist(),
    Scene.expect(Scene.selector('[title="App Server: Workers"]')).toExist(),
    Scene.expect(Scene.selector('[title="Database: Connections"]')).toExist(),
  )
})

test('the Users row draws each region’s users against its market, and its churn', () => {
  const model = fixture({ game: { stage: 5, apdex: 0.9, regionApdex: null } })
  const ledger = ledgerOf(model)
  const game = model.board.game
  const regions = churnOf(game, ledger)
  const first = regions[0]
  if (first === undefined) throw new Error('the fixture Design holds no region with users')
  const market = ledger.market * REGION_INFO[first.region].share
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Users')).toExist(),
    Scene.expect(board).toContainText(REGION_INFO[first.region].name),
    Scene.expect(board).toContainText(compact(regionUsers(game)[first.region])),
    Scene.expect(board).toContainText(compact(market)),
    Scene.expect(board).toContainText(
      `${first.perHour >= 0 ? '+' : ''}${compact(first.perHour)}/h`,
    ),
  )
})

test('the Load Balancer row draws its traffic per backend', () => {
  const model = fixture({ build: components })
  const backend = ledgerOf(model).links.find((link) => link.from === 'lb' && link.to === 'server')
  if (backend === undefined) throw new Error('the fixture Board has no Load Balancer backend')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Load Balancer')).toExist(),
    Scene.expect(board).toContainText('App Server'),
    Scene.expect(board).toContainText(`${rateText(backend.rate)}/s`),
  )
})

test('the App Server row draws its copies and the workers busy against the pool', () => {
  const model = fixture({
    build: (base) => ({
      nodes: base.nodes.map((node) =>
        node.type === 'server' ? { ...node, replicas: 2, pending: 1, workers: 16 } : node,
      ),
      links: base.links,
    }),
  })
  const slots = ledgerOf(model).nodes.server?.resources.slots ?? null
  if (slots === null) throw new Error('the fixture App Server holds no worker slots')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('App Server')).toExist(),
    Scene.expect(board).toContainText('Copies'),
    Scene.expect(board).toContainText('2 (+1 booting)'),
    Scene.expect(board).toContainText(
      `${Math.round(Math.min(slots.used, slots.total))}/${Math.round(slots.total)}`,
    ),
  )
})

test('the Database row draws connections used against the limit, and the lag column', () => {
  const model = fixture({ build: components })
  const connections = ledgerOf(model).nodes.database?.connections ?? null
  if (connections === null) throw new Error('the fixture Database holds no connections')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Database')).toExist(),
    Scene.expect(board).toContainText('Lag'),
    Scene.expect(board).toContainText(
      `${Math.round(connections.used)}/${Math.round(connections.max)}`,
    ),
  )
})

test('the Cache row draws its hit ratio', () => {
  const model = fixture({ build: components })
  const hit = ledgerOf(model).nodes.cache?.hitRatio ?? null
  if (hit === null) throw new Error('the fixture Cache holds no hit ratio')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Cache')).toExist(),
    Scene.expect(board).toContainText(`${(hit * 100).toFixed(1)}%`),
  )
})

test('the Queue row draws its depth and the age of its oldest task', () => {
  const model = fixture({ build: components })
  const age = ledgerOf(model).nodes.queue?.age ?? null
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Queue')).toExist(),
    Scene.expect(board).toContainText('42'),
    Scene.expect(board).toContainText(queueWait(age)),
  )
})

test('the CDN row draws its hit ratio beside the Design’s egress', () => {
  const model = fixture({ build: components })
  const hit = ledgerOf(model).nodes.cdn?.hitRatio ?? null
  if (hit === null) throw new Error('the fixture CDN holds no hit ratio')
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('CDN')).toExist(),
    Scene.expect(board).toContainText(`${(hit * 100).toFixed(1)}%`),
    Scene.expect(board).toContainText('Design egress'),
  )
})

test('the Managed Components row draws each provider’s calls and outage state', () => {
  const model = fixture({ build: components })
  const psp = ledgerOf(model).nodes.psp
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Managed Components')).toExist(),
    Scene.expect(board).toContainText('Payment Provider'),
    Scene.expect(board).toContainText(`${compact(psp?.inbound ?? 0)}/s`),
    Scene.expect(board).toContainText('UP'),
  )
})

test('a deploy in the Inbox marks the timeline', () => {
  const model = fixture({
    board: {
      inbox: { ...initialModel().board.inbox, mail: [threadOf('event:deployed:', [999])] },
    },
  })
  Scene.scene({ update, view }, Scene.given(model), Scene.expect(Scene.text('⇢ Deploy')).toExist())
})

test('a funding round and a hire in the Inbox are Company marks', () => {
  const model = fixture({
    board: {
      inbox: {
        ...initialModel().board.inbox,
        mail: [threadOf('investor:round:1', [998]), threadOf('event:hired:e3', [999])],
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('◆ Seed round')).toExist(),
    Scene.expect(Scene.text('◆ Hired')).toExist(),
  )
})

test('the running Incident is marked once, with its severity', () => {
  const model = fixture({
    game: {
      incident: {
        kind: 'zone',
        remaining: 30,
        nodeId: null,
        startedAt: 999,
        baseline: 1,
        usersAtStart: 1_000,
        impaired: 0,
        lostRevenue: 0,
        failed: 0,
        severity: 2,
        magnitude: 3,
        zone: 'b',
        region: 'eu',
      },
    },
    board: {
      // Its own Thread starts at the same second: the Game's SEV wins, and it draws once.
      inbox: { ...initialModel().board.inbox, mail: [threadOf('event:incident-zone:b', [999])] },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('▲ SEV2 Zone outage')).toExist(),
    Scene.expect(Scene.text('▲ Zone outage')).toBeAbsent(),
  )
})

test('each row waits for its research, and a Component row for its Component', () => {
  const start = initialModel()
  const base = preseedGame()
  const game: Game = {
    ...base,
    time: 1_000,
    researched: [...base.researched],
    history: [sampleOf(), sampleOf(), sampleOf()],
  }
  const model: Model = { ...start, board: { ...start.board, game } }
  Scene.scene(
    { update, view },
    Scene.given(model),
    // The preseeding Board is researched only up to metrics.
    Scene.expect(row('Alerts')).toBeAbsent(),
    Scene.expect(row('Services (RED)')).toBeAbsent(),
    Scene.expect(row('Resources (USE)')).toBeAbsent(),
    Scene.expect(row('Users')).toBeAbsent(),
    // It holds a Database, so that row is there; it holds no Load Balancer.
    Scene.expect(row('Database')).toExist(),
    Scene.expect(row('Load Balancer')).toBeAbsent(),
  )
})

test('the Overview draws Cash per second from the Samples’ cash, signed', () => {
  const rising = fixture({
    game: {
      history: [
        sampleOf({ cash: 12_000 }),
        sampleOf({ cash: 12_000.2 }),
        sampleOf({ cash: 12_000.5 }),
      ],
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(rising),
    Scene.expect(board).toContainText('Cash per second'),
    Scene.expect(board).toContainText('+$0.30/s'),
  )
  const falling = fixture({
    game: { history: [sampleOf({ cash: 12_000 }), sampleOf({ cash: 11_999.4 })] },
  })
  Scene.scene({ update, view }, Scene.given(falling), Scene.expect(board).toContainText('−$0.60/s'))
})

test('a Design change in the undo stack marks the timeline', () => {
  const model = fixture({ board: { undo: [changeOf('Placed Cache', 999)] } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('Placed Cache')).toExist(),
  )
})

const panelOf = (key: string) => Scene.selector(`[data-panel="${key}"]`)

test('the Company row draws Cash, Burn, Equity, runway and each team’s velocity', () => {
  const model = fixture({
    game: {
      cash: 12_000,
      equity: 0.81,
      moraleUntil: 2_000,
      engineers: [{ id: 'e1', team: 'core', language: 'php', hiredAt: 0 }],
    },
  })
  const game = model.board.game
  const ledger = ledgerOf(model)
  const net = ledger.burn - ledger.revenue
  const runway = net > 0 ? `${(Math.max(0, game.cash) / net / (30 * 24 * 60)).toFixed(1)} mo` : '∞'
  const core = teamOutputs(game, ledger)[0]
  if (core === undefined) throw new Error('the fixture Company has no team')
  const perMinute =
    core.rate * 60 < 10 ? (core.rate * 60).toFixed(1) : String(Math.round(core.rate * 60))
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Company')).toExist(),
    Scene.expect(panelOf('company-money')).toContainText(money(game.cash)),
    Scene.expect(panelOf('company-money')).toContainText(`${money(ledger.revenue)}/s`),
    Scene.expect(panelOf('company-money')).toContainText(`${money(ledger.burn)}/s`),
    Scene.expect(panelOf('company-money')).toContainText(`${money(ledger.salaries)}/s`),
    Scene.expect(panelOf('company-money')).toContainText('81%'),
    Scene.expect(panelOf('company-money')).toContainText('Runway'),
    Scene.expect(panelOf('company-money')).toContainText(runway),
    Scene.expect(panelOf('company-team')).toContainText(core.team.name),
    Scene.expect(panelOf('company-team')).toContainText('Product'),
    Scene.expect(panelOf('company-team')).toContainText('morale −10%'),
    Scene.expect(panelOf('company-team')).toContainText(String(core.headcount)),
    Scene.expect(panelOf('company-team')).toContainText(core.effective.toFixed(1)),
    Scene.expect(panelOf('company-team')).toContainText(`×${core.velocity.toFixed(2)}`),
    Scene.expect(panelOf('company-team')).toContainText(perMinute),
  )
})

test('the Money card draws the Cash series its Samples carry, ending on the Cash it shows', () => {
  const history = [
    sampleOf({ cash: 8_000 }),
    sampleOf({ cash: 10_000 }),
    sampleOf({ cash: 12_000 }),
  ]
  const model = fixture({ game: { cash: 12_000, history } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(panelOf('company-money')).toContainText('Cash'),
    Scene.expect(panelOf('company-money')).toContainText(money(12_000)),
    // The series' figures come from the Samples, one per sim second.
    Scene.expect(panelOf('company-money')).toContainText(`mean ${money(10_000)}`),
    Scene.expect(panelOf('company-money')).toContainText(`max ${money(12_000)}`),
    Scene.expect(panelOf('company-money')).toContainText(`last ${money(12_000)}`),
    Scene.expect(Scene.selector('[fill="url(#cash-series)"]')).toExist(),
    Scene.expect(panelOf('company-money')).toContainText('cash 6h'),
  )
})

test('the Company row draws the bridge offer’s terms, and taking it pays the grant', () => {
  const model = fixture({
    game: {
      cash: -2_000,
      equity: 0.81,
      bridge: { grant: 6_000, dilution: 0.08 },
      bridgeUsed: true,
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(panelOf('company-money')).toContainText('Bridge'),
    Scene.expect(panelOf('company-money')).toContainText(`${money(6_000)} · 8% · Accept`),
  )
  // The offer pays three calendar days of Burn and costs 8% of Equity.
  const took = update(model, Message.BridgeAccepted())
  expect(took.model.board.game.cash).toBe(4_000)
  expect(took.model.board.game.equity).toBeCloseTo(0.81 * 0.92, 6)
  expect(took.model.board.game.bridge).toBeNull()
})

test('the Company row lists each funding round with the Inbox’s answer', () => {
  const model = fixture({
    game: { stage: 2 },
    board: {
      inbox: {
        ...initialModel().board.inbox,
        mail: [threadOf('investor:round:0', [998], 'You raised the round.')],
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Company')).toExist(),
    Scene.expect(panelOf('company-funding')).toContainText(ERAS[1]?.name ?? 'Pre-seed'),
    Scene.expect(panelOf('company-funding')).toContainText(
      (ERAS[0]?.raiseAt ?? 0).toLocaleString('en-US'),
    ),
    Scene.expect(panelOf('company-funding')).toContainText(money(ERAS[0]?.grant ?? 0)),
    Scene.expect(panelOf('company-funding')).toContainText(
      `${Math.round((ERAS[0]?.dilution ?? 0) * 100)}%`,
    ),
    Scene.expect(panelOf('company-funding')).toContainText('Raised'),
    Scene.expect(panelOf('company-funding')).toContainText(ERAS[2]?.name ?? 'Seed'),
    Scene.expect(panelOf('company-funding')).toContainText(money(ERAS[1]?.grant ?? 0)),
    Scene.expect(panelOf('company-funding')).toContainText('—'),
  )
})

test('the Incidents row draws the running Incident’s severity, run, MTTR and cost', () => {
  const model = fixture({
    game: {
      time: 1_000,
      users: 900,
      incident: {
        kind: 'zone',
        remaining: 12,
        nodeId: null,
        startedAt: 960,
        baseline: 1,
        usersAtStart: 1_200,
        impaired: 25,
        lostRevenue: 340,
        failed: 900,
        severity: 2,
        magnitude: 3,
        zone: 'b',
        region: null,
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Incidents')).toExist(),
    Scene.expect(panelOf('incident-running')).toContainText(INCIDENTS.zone.name),
    Scene.expect(panelOf('incident-running')).toContainText('SEV2'),
    Scene.expect(panelOf('incident-running')).toContainText('Zone B'),
    Scene.expect(panelOf('incident-running')).toContainText('40m / 52m'),
    Scene.expect(panelOf('incident-running')).toContainText('25m'),
    Scene.expect(panelOf('incident-running')).toContainText('−300'),
    Scene.expect(panelOf('incident-running')).toContainText('−$340'),
    Scene.expect(panelOf('incident-running')).toContainText('900'),
  )
})

const POSTMORTEMS: ReadonlyArray<Postmortem> = [
  {
    id: 1,
    kind: 'instance',
    target: 'App Server',
    duration: 90,
    mttr: 42,
    lostUsers: 1_200,
    lostRevenue: 5_000,
    failed: 800,
    action: 'health-checks',
    severity: 3,
    endedAt: 940,
  },
  {
    id: 2,
    kind: 'leak',
    target: null,
    duration: 30,
    mttr: 12,
    lostUsers: 300,
    lostRevenue: 750,
    failed: 90,
    action: null,
    severity: 2,
    endedAt: 1_000,
  },
]

test('the Incidents row lists each Postmortem’s run, MTTR, cost and action item', () => {
  const model = fixture({ game: { postmortems: [...POSTMORTEMS] } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(row('Incidents')).toExist(),
    Scene.expect(panelOf('incident-running')).toContainText('No incident running'),
    Scene.expect(panelOf('incident-history')).toContainText(INCIDENTS.instance.name),
    Scene.expect(panelOf('incident-history')).toContainText('SEV3'),
    Scene.expect(panelOf('incident-history')).toContainText('App Server'),
    Scene.expect(panelOf('incident-history')).toContainText('90m'),
    Scene.expect(panelOf('incident-history')).toContainText('42m'),
    Scene.expect(panelOf('incident-history')).toContainText(`−${compact(1_200)}`),
    Scene.expect(panelOf('incident-history')).toContainText(`−${money(5_000)}`),
    Scene.expect(panelOf('incident-history')).toContainText('800'),
    Scene.expect(panelOf('incident-history')).toContainText(RESEARCH['health-checks'].name),
    Scene.expect(panelOf('incident-history')).toContainText(INCIDENTS.leak.name),
    Scene.expect(panelOf('incident-history')).toContainText('—'),
  )
})

const clock = (time: number): string => {
  const { hour, minute } = clockOf(time)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** A lane block of the Incident timeline, titled with its run's clock times. */
const laneOf = (name: string, severity: number, from: number, to: number) =>
  Scene.selector(`[title="${name}: SEV${severity} · ${clock(from)}–${clock(to)}"]`)

/** `seconds` one-second Samples, ending at the Game's clock. */
const samplesOf = (seconds: number): ReadonlyArray<Sample> =>
  Array.from({ length: seconds }, () => sampleOf())

test('the Incident timeline places each Postmortem by the time it ran, and the running Incident last', () => {
  const model = fixture({
    game: {
      // 151 Samples, so the axis runs from 850 to 1,001: both runs sit inside it.
      history: [...samplesOf(151)],
      postmortems: [...POSTMORTEMS],
      incident: {
        kind: 'zone',
        remaining: 12,
        nodeId: null,
        startedAt: 960,
        baseline: 1,
        usersAtStart: 1_200,
        impaired: 25,
        lostRevenue: 340,
        failed: 900,
        severity: 2,
        magnitude: 3,
        zone: 'b',
        region: null,
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(panelOf('incident-timeline')).toExist(),
    // Each Postmortem sits where its run began and ended, on the Dashboard's one time axis.
    Scene.expect(laneOf(INCIDENTS.instance.name, 3, 850, 940)).toExist(),
    Scene.expect(laneOf(INCIDENTS.leak.name, 2, 970, 1_000)).toExist(),
    // The running Incident is the last lane, from when it started to now.
    Scene.expect(laneOf(`Running · ${INCIDENTS.zone.name}`, 2, 960, 1_000)).toExist(),
    Scene.expect(panelOf('incident-timeline')).toContainText(INCIDENTS.instance.name),
    Scene.expect(panelOf('incident-timeline')).toContainText(INCIDENTS.leak.name),
    Scene.expect(panelOf('incident-timeline')).toContainText('SEV2'),
  )
})

test('the timeline leaves out a run that ended before the axis, and one with no end time', () => {
  const early = fixture({
    game: {
      time: 30_000,
      // The axis runs from 29,960 to 30,001.
      history: [...samplesOf(41)],
      postmortems: [
        { ...POSTMORTEMS[0]!, endedAt: 10 },
        { ...POSTMORTEMS[1]!, endedAt: 29_990 },
      ],
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(early),
    Scene.expect(row('Incidents')).toExist(),
    Scene.expect(laneOf(INCIDENTS.leak.name, 2, 29_960, 29_990)).toExist(),
    Scene.expect(laneOf(INCIDENTS.instance.name, 3, -80, 10)).toBeAbsent(),
  )
  // A Postmortem saved before `endedAt` has no second to sit at, so the card says so.
  const old = fixture({
    game: {
      history: [...samplesOf(41)],
      postmortems: [{ ...POSTMORTEMS[0]!, endedAt: null }],
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(old),
    Scene.expect(panelOf('incident-timeline')).toContainText('No run in this range.'),
  )
})

test('choosing a Postmortem opens it without touching the Game or the undo stack', () => {
  const model = fixture({ game: { postmortems: [...POSTMORTEMS] } })
  const chosen = update(
    model,
    Message.DashboardChanged({ message: DashboardMessage.PostmortemChosen({ id: 1 }) }),
  )
  expect(chosen.model.board.dashboard.postmortem).toBe(1)
  expect(chosen.model.board.game).toBe(model.board.game)
  expect(chosen.model.board.undo).toEqual(model.board.undo)
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.click(Scene.role('button', { name: INCIDENTS.instance.name })),
    Scene.expect(panelOf('pm-detail-1')).toExist(),
    Scene.expect(panelOf('pm-detail-1')).toContainText(
      `Action item open: ${RESEARCH['health-checks'].name}.`,
    ),
    Scene.expect(panelOf('pm-detail-1')).toContainText(INCIDENTS.instance.prevention),
    Scene.expect(panelOf('pm-detail-1')).toContainText(`−${money(5_000)}`),
  )
})

test('the funding history reads the IPO as a public listing, not a grant', () => {
  const model = fixture({ game: { stage: 7 } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(panelOf('company-funding')).toContainText(ERAS[7]?.name ?? 'Public'),
    Scene.expect(panelOf('company-funding')).toContainText('Public market'),
    Scene.expect(panelOf('company-funding')).toContainText('Listed'),
    Scene.expect(panelOf('company-funding')).toContainText(
      `${Math.round((ERAS[6]?.dilution ?? 0) * 100)}%`,
    ),
  )
})

test('the scroll area takes focus, so the keyboard can reach the last rows', () => {
  Scene.scene(
    { update, view },
    Scene.given(fixture()),
    Scene.tap((simulation) => {
      const [scroll] = Scene.findAll(simulation.html, '[data-scroll="dashboard"]')
      if (!scroll) throw new Error('the Dashboard holds no scroll area')
      expect(scroll.data?.props?.tabIndex).toBe(0)
      expect(Option.getOrNull(Scene.attr(scroll, 'role'))).toBe('region')
      expect(Option.getOrNull(Scene.attr(scroll, 'aria-label'))).toBe(
        'Dashboard, scroll for the Company and Incidents rows',
      )
      expect(JSON.stringify(scroll.data?.class)).toContain('focus-visible:outline-2')
    }),
  )
})

/* ==========================================================================
   The Dashboard's long tail (12 "Annotations" and "Controls"): Research
   marks, the group toggles, the compare line, the template variables and the
   table view.
   ========================================================================== */

/** A `finished` Thread, as the Inbox writes one: a letter per item that finished. */
const finishedOf = (entries: ReadonlyArray<readonly [number, string]>): Mail => ({
  id: 9,
  key: 'event:finished:',
  sender: 'mate:e0',
  subject: 'Done',
  time: entries[entries.length - 1]?.[0] ?? 0,
  entries: entries.map(([time, item]) => ({
    time,
    text: `Hey,\n\n${item} is done. Finished it just now.\n\nTests were green.`,
  })),
  actions: [],
  answer: null,
  read: true,
  trashed: false,
  spam: false,
  resolved: null,
})

/** One 15-minute block of the Dashboard's own history, holding the means the Charts read. */
const blockOf = (index: number, means: Readonly<Record<string, number>>) => ({
  index,
  count: 2,
  min: {},
  max: {},
  sum: Object.fromEntries(Object.entries(means).map(([field, mean]) => [field, mean * 2])),
})

/** The Dashboard at a 24-hour range, reading the blocks its history keeps. */
const daily = (options: Fixture, blocks: ReadonlyArray<ReturnType<typeof blockOf>>): Model => {
  const model = fixture(options)
  return {
    ...model,
    board: {
      ...model.board,
      dashboard: {
        ...model.board.dashboard,
        range: 1440,
        history: { quarter: [...blocks], hour: [] },
      },
    },
  }
}

/** A path's points, read back out of its `d`: `M92,10L420,10`. */
const pointsOf = (d: string): ReadonlyArray<readonly [number, number]> =>
  d
    .split(/[ML]/)
    .slice(1)
    .map((pair) => {
      const [x, y] = pair.trim().split(/[ ,]/)
      const point = [Number(x), Number(y)] as const
      if (Number.isNaN(point[0]) || Number.isNaN(point[1]))
        throw new Error(`the path does not parse: ${d}`)
      return point
    })

test('a finished Study marks the second the Inbox wrote, and a finished task does not', () => {
  const at = 1_000
  const last = blockIndexAt(at, 'quarter')
  const blocks = [last - 2, last - 1, last].map((index) => blockOf(index, { served: 0 }))
  const studied = startOf(last - 1, 'quarter')
  const model = daily(
    {
      game: { history: [sampleOf(), sampleOf()] },
      board: {
        inbox: {
          ...initialModel().board.inbox,
          mail: [
            finishedOf([
              // A Study, then a task in the same block: the Thread does not say which is which.
              [studied, RESEARCH['caching'].name],
              [studied + 60, 'Add index'],
            ]),
          ],
        },
      },
    },
    blocks,
  )
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.tap((simulation) => {
      const panel = '[data-panel="traffic"]'
      // One mark, at the block the Study finished in, so the task's entry drew none.
      const marks = Scene.findAll(simulation.html, `${panel} line[stroke="var(--ok)"]`)
      expect(marks).toHaveLength(1)
      const marks2 = Scene.findAll(simulation.html, `${panel} text`).filter(
        (node) => Scene.textContent(node) === '⬡ Research',
      )
      expect(marks2).toHaveLength(1)
      // The block's own tick is where its second sits on the axis.
      const label = clock(studied)
      const ticks = Scene.findAll(simulation.html, `${panel} text`).filter(
        (node) => Scene.textContent(node) === label,
      )
      expect(ticks).toHaveLength(1)
      expect(Number(Option.getOrNull(Scene.attr(marks[0]!, 'x1')))).toBe(
        Number(Option.getOrNull(Scene.attr(ticks[0]!, 'x'))),
      )
      expect(Number(Option.getOrNull(Scene.attr(marks2[0]!, 'x')))).toBe(
        Number(Option.getOrNull(Scene.attr(ticks[0]!, 'x'))) + 4,
      )
    }),
  )
})

test('a group’s toggle hides its marks and leaves the others', () => {
  const model = fixture({
    board: {
      inbox: {
        ...initialModel().board.inbox,
        mail: [threadOf('event:deployed:', [998]), threadOf('event:incident-zone:b', [999])],
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('⇢ Deploy')).toExist(),
    Scene.click(Scene.role('button', { name: 'Deploy' })),
    Scene.Command.resolve(AppendLog, Message.Synced()),
    Scene.expect(Scene.text('⇢ Deploy')).toBeAbsent(),
    // Only that group went: the Incident in the same range still marks.
    Scene.expect(Scene.text('▲ Zone outage')).toExist(),
    Scene.expect(Scene.role('button', { name: 'Deploy' })).toHaveAttr('aria-pressed', 'false'),
  )
})

test('the compare line draws yesterday’s figure on the traffic and latency Charts', () => {
  const history = Array.from({ length: 30 }, () => sampleOf({ served: 28 }))
  const days = [...new Set(history.map((_, index) => 1_000 - (history.length - 1 - index)))].map(
    (time) => blockIndexAt(time - 86_400, 'quarter'),
  )
  const model = fixture({
    game: { history: [...history] },
    board: {
      dashboard: {
        ...initialModel().board.dashboard,
        history: {
          quarter: days.map((index) => blockOf(index, { served: 7, p99: 120 })),
          hour: [],
        },
      },
    },
  })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.tap((simulation) => {
      // Yesterday was a flat 7 req/s, so its line is level, below the 30 the demand carries.
      const compare = Scene.findAll(
        simulation.html,
        '[data-panel="traffic"] path[stroke^="color-mix"]',
      )
      expect(compare).toHaveLength(1)
      const yesterday = pointsOf(Option.getOrNull(Scene.attr(compare[0]!, 'd')) ?? '')
      expect(yesterday).toHaveLength(history.length)
      // A flat 7 req/s is one height, the same on every point.
      expect(new Set(yesterday.map(([, y]) => y)).size).toBe(1)
      const demand = pointsOf(
        Option.getOrNull(
          Scene.attr(
            Scene.findAll(
              simulation.html,
              '[data-panel="traffic"] path[stroke="var(--muted-foreground)"]',
            )[0]!,
            'd',
          ),
        ) ?? '',
      )
      expect(Math.min(...yesterday.map(([, y]) => y))).toBeGreaterThan(
        Math.max(...demand.map(([, y]) => y)),
      )
      // The Latency Chart carries its own compare line.
      expect(
        Scene.findAll(simulation.html, '[data-panel="latency"] path[stroke^="color-mix"]'),
      ).toHaveLength(1)
    }),
    // The switch takes it away again.
    Scene.click(Scene.role('button', { name: 'Compare' })),
    Scene.Command.resolve(AppendLog, Message.Synced()),
    Scene.expect(Scene.selector('[data-panel="traffic"] path[stroke^="color-mix"]')).toBeAbsent(),
    Scene.expect(Scene.role('button', { name: 'Compare' })).toHaveAttr('aria-pressed', 'false'),
  )
})

test('a Request kind narrows the Request mix and the Services row together', () => {
  const model = fixture()
  const kinds = ledgerOf(model).kinds
  const busiest = (
    Object.entries(kinds) as ReadonlyArray<[keyof typeof KINDS, KindLedger | undefined]>
  )
    .flatMap(([kind, entry]) => (entry === undefined || entry.rate <= 0 ? [] : [{ kind, entry }]))
    .sort((left, right) => right.entry.rate - left.entry.rate)[0]
  if (busiest === undefined) throw new Error('the fixture Design serves nothing')
  Scene.scene(
    { update, view },
    Scene.given(model),
    // Every kind before the filter, one after it.
    Scene.tap((simulation) => {
      expect(Scene.findAll(simulation.html, '[data-panel="mix"] tbody tr').length).toBeGreaterThan(
        1,
      )
    }),
    Scene.change('[data-variable="kind"] select', busiest.kind),
    Scene.Command.resolve(AppendLog, Message.Synced()),
    Scene.tap((simulation) => {
      const rows = Scene.findAll(simulation.html, '[data-panel="mix"] tbody tr')
      expect(rows).toHaveLength(1)
      // The whole mix is that one Service now, where the unfiltered rows shared it.
      expect(Scene.textContent(rows[0]!)).toContain('100%')
      expect(Scene.textContent(rows[0]!)).toContain(`${compact(busiest.entry.rate)}/s`)
      const services = Scene.findAll(simulation.html, '[data-panel="services"] tbody tr')
      expect(services).toHaveLength(1)
      expect(Scene.textContent(services[0]!)).toContain(KINDS[busiest.kind].label)
      expect(Scene.textContent(services[0]!)).toContain(`${rateText(busiest.entry.rate)}/s`)
    }),
  )
})

test('a Region narrows the Users row and the Apdex the gauge reads', () => {
  const base = preseedGame()
  const split = withRegionUsers(base, { na: 600, eu: 300, apac: 100, sa: 50 })
  const model = fixture({
    game: {
      stage: 5,
      users: split.users,
      userShares: split.userShares,
      regionApdex: { na: 0.99, eu: 0.71, apac: 0.95, sa: 0.96 },
    },
  })
  const game = model.board.game
  const euApdex = ledgerOf(model).regions.eu ?? 0
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.tap((simulation) => {
      expect(Scene.findAll(simulation.html, '[data-panel="users"] tbody tr')).toHaveLength(4)
    }),
    Scene.change('[data-variable="region"] select', 'eu'),
    Scene.Command.resolve(AppendLog, Message.Synced()),
    Scene.tap((simulation) => {
      const rows = Scene.findAll(simulation.html, '[data-panel="users"] tbody tr')
      expect(rows).toHaveLength(1)
      expect(Scene.textContent(rows[0]!)).toContain(REGION_INFO.eu.name)
      expect(Scene.textContent(rows[0]!)).toContain(compact(regionUsers(game).eu))
      // The Apdex gauge reads that region's users, not the Design's.
      expect(
        Scene.textContent(Scene.findAll(simulation.html, '[data-panel="apdex"]')[0]!),
      ).toContain(euApdex.toFixed(2))
    }),
  )
})

test('the table view reads each Chart’s cells back with the figures its plot draws', () => {
  const history = [
    sampleOf({ latency: 80, p99: 300 }),
    sampleOf({ latency: 90, p99: 400 }),
    sampleOf({ latency: 100, p99: 500 }),
  ]
  const model = fixture({ game: { history } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.click(Scene.role('button', { name: 'Table' })),
    Scene.Command.resolve(AppendLog, Message.Synced()),
    Scene.tap((simulation) => {
      const rows = Scene.findAll(simulation.html, '[data-table="latency"] tbody tr')
      expect(rows).toHaveLength(history.length)
      const cells = (index: number) =>
        Scene.findAll(rows[index]!, 'td').map((cell) => Scene.textContent(cell))
      // Time, p99, mean: the same figures the plot's last points carry.
      expect(cells(1)).toEqual([clock(999), ms(400), ms(90)])
      expect(cells(2)).toEqual([clock(1_000), ms(500), ms(100)])
      expect(Scene.findAll(simulation.html, '[data-table="traffic"] tbody tr')).toHaveLength(
        history.length,
      )
    }),
  )
})
