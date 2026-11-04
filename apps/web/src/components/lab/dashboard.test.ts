import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { KINDS, REGION_INFO, type ComponentId, type ResearchId } from '@quorum/simulation/catalog'
import { churnOf } from '@quorum/simulation/churn'
import { preseedGame } from '@quorum/simulation/company'
import type { KindLedger } from '@quorum/simulation/ledger'
import { regionUsers } from '@quorum/simulation/regions'
import type { Game, GameLink, GameNode, Sample } from '@quorum/simulation/state'
import { compact, ms, queueWait, rate as rateText } from '@quorum/ui/game/format'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Mail, type Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { sampleNode, type NodeSample } from '@/game/node-metrics.ts'
import { dashboardPanel } from './dashboard.ts'

/* ==========================================================================
   The Dashboard's rows by research, its Component rows, and its annotation
   groups (12 "Charts by research", "Component rows", "Annotations"). Each
   test asserts the figures a panel draws, read back from the same Ledger.
   ========================================================================== */

const RESEARCH: ReadonlyArray<ResearchId> = [
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

/** A Thread of Mail, one entry per time. */
const threadOf = (key: string, times: ReadonlyArray<number>): Mail => ({
  id: times.length,
  key,
  sender: 'monitoring',
  subject: 'Re: something',
  time: times[times.length - 1] ?? 0,
  entries: times.map((time) => ({ time, text: '…' })),
  actions: [],
  answer: null,
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
    researched: [...new Set([...base.researched, ...RESEARCH])],
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

test('a Design change in the undo stack marks the timeline', () => {
  const model = fixture({ board: { undo: [changeOf('Placed Cache', 999)] } })
  Scene.scene(
    { update, view },
    Scene.given(model),
    Scene.expect(Scene.text('Placed Cache')).toExist(),
  )
})
