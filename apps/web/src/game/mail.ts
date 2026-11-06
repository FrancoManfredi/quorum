import type {
  Advice,
  AdviceAction,
  AdviceFrom,
  AdviceTopic,
  AdviceVars,
} from '@quorum/simulation/goals'
import type { Game, Postmortem } from '@quorum/simulation/state'
import type { Mail } from './model.ts'
import type { MailMessage, MailVars, Snippet } from './mail-text.ts'
import {
  COMPONENTS,
  CVE_DEFS,
  FEATURES,
  INCIDENTS,
  KINDS,
  REGION_INFO,
  RESEARCH,
  patchCost,
  patchWindow,
  type ResearchId,
  type FeatureId,
} from '@quorum/simulation/catalog'
import type { AwayReport } from '@quorum/simulation/offline'
import type { ChurnCause, RegionChurn } from '@quorum/simulation/churn'
import { alertActions, cloudActions } from '@quorum/simulation/goals'
import { has, securityStaffed } from '@quorum/simulation/lookups'
import { compact, money } from '@quorum/ui/game/format'
import type { WorkItem } from '@quorum/simulation/state'
import type { StudyStall } from '@quorum/simulation/studies'
import { stallReason } from '@quorum/ui/game/pools'
import { unhappy } from '@quorum/simulation/team'
import { featureRefusal, itemName } from '@quorum/simulation/work'
import {
  ADVICE,
  AWAY_FINANCE,
  AWAY_MONITORING,
  CHURN_LETTERS,
  CVE_LETTERS,
  CVES,
  EVENTS,
  HIRE,
  POSTMORTEM,
  REQUESTS,
  REWRITES,
  SENDERS,
  SPAM,
  STALL,
  TEAMMATES,
  TICKETS,
  type Cve,
  type CveVars,
  type EventMail,
  type EventTopic,
  type EventVars,
  type From,
  type Letters,
  type Pitch,
  type PostmortemVars,
  type AwayVars,
  type SenderKind,
  type Written,
} from './copy/index.ts'

/* ==========================================================================
   Mail (GDD 18): who writes, and which of their letters they send. The copy
   lives in `copy/`; this file picks a Sender and a letter for each fact.
   ========================================================================== */

export type { SenderKind } from './copy/index.ts'

/** Mail that waits for a decision: not answered, not resolved, and a button that does something. */
export const needsAction = (mail: Mail): boolean =>
  mail.answer === null &&
  mail.resolved === null &&
  mail.actions.some((action) => !action.id.startsWith('show'))

export interface Sender {
  readonly name: string
  readonly address: string
  readonly kind: SenderKind
  /** The badge colour: the real company's brand colour, or a teammate's own green. */
  readonly color: string
  /** The kind whose badge it wears: a phishing copy wears the badge of what it fakes. */
  readonly looks: SenderKind
  readonly sign: string
  /** Which teammate signs, when a teammate does: the place in `TEAMMATES`. */
  readonly signIndex?: number
}

export const KIND_LABEL: Record<SenderKind, string> = {
  cloud: 'Cloud',
  monitoring: 'Alerts',
  vendor: 'Vendor',
  investor: 'Investor',
  finance: 'Finance',
  customers: 'Customer',
  mentor: 'Mentor',
  teammate: 'Team',
  security: 'Security',
  spam: 'Spam',
}

const hashOf = (...parts: ReadonlyArray<number | string>): number => {
  let hash = 0x81_1c_9d_c5
  for (const char of parts.join(':')) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01_00_01_93) >>> 0
  }
  return hash
}

/** One of `items`, the same for the same parts. */
const pick = <A>(items: ReadonlyArray<A>, ...parts: ReadonlyArray<number | string>): A =>
  items[hashOf(...parts) % items.length] as A

export const senderOf = (id: string): Sender => {
  const known = SENDERS[id]
  if (known) return { ...known, looks: known.looks ?? known.kind }
  const mateKey = id.replace('mate:', '')
  const mate = pick(TEAMMATES, mateKey)
  return {
    kind: 'teammate',
    name: mate.name,
    address: `${mate.name.toLowerCase().replace(/[^a-z]+/g, '.')}@quorum.team`,
    // Teammates have no brand: each wears a green that drifts a little, so no two match.
    color: `oklch(0.52 0.12 ${150 + (hashOf(id) % 5) * 9 - 18})`,
    looks: 'teammate',
    sign: mate.sign,
    signIndex: TEAMMATES.indexOf(mate),
  }
}

/** Several parties can write about the same thing. A Thread draws its Sender from the pool
 *  by the Company's seed and the Thread's key, so it is stable for one Thread and varied across them. */
const POOLS: Record<SenderKind, ReadonlyArray<string>> = {
  cloud: ['cloud', 'cloud-gooble', 'cloud-azzure'],
  monitoring: ['monitoring', 'monitoring-grafauna', 'monitoring-centry'],
  vendor: ['vendor', 'vendor-paypaul'],
  investor: ['investor', 'investor-sequel', 'investor-ycombinator'],
  finance: ['finance', 'finance-zero'],
  customers: ['customers', 'customers-intercomatose'],
  mentor: ['mentor', 'mentor-dijkstrah', 'mentor-hoppertunity'],
  security: ['security', 'security-dumpster'],
  teammate: ['mentor'],
  spam: ['spam-datadug'],
}

export const senderFor = (kind: SenderKind, game: Game, key: string): string => {
  const pool = POOLS[kind]
  return pool[hashOf(game.seed, key) % pool.length] ?? kind
}

/**
 * One letter from `letters`, signed by `sender`. The pick hashes the Company's seed, the
 * Thread, and the time, so every device writes the same Mail and a Thread rarely repeats itself.
 */
const write = <V>(
  id: string,
  letters: Letters<V>,
  vars: V,
  sender: string,
  game: Game,
  key: string,
  salt: number | string = '',
): Composed => {
  const variant = hashOf(game.seed, key, game.time, salt) % letters.length
  const quoted = { ...vars, from: senderOf(sender).name }
  const written = (letters[variant] as (vars: V & From) => Written)(quoted)
  return {
    ...written,
    message: {
      letter: { id, variant, vars: quoted as unknown as MailVars },
      before: [],
      after: [],
    },
  }
}

/** A letter written, with what it says as data. */
interface Composed extends Written {
  readonly message: MailMessage
}

/** A paragraph put before a letter's own, in English and as data. */
const lead = (composed: Composed, snippet: Snippet, english: string): Composed => ({
  subject: composed.subject,
  body: `${english}\n\n${composed.body}`,
  message: { ...composed.message, before: [snippet, ...composed.message.before] },
})

/** A paragraph put after a letter's own, in English and as data. */
const tail = (composed: Composed, snippet: Snippet, english: string): Composed => ({
  subject: composed.subject,
  body: `${composed.body}\n\n${english}`,
  message: { ...composed.message, after: [...composed.message.after, snippet] },
})

/** What a Mail carries, before the Inbox stores it. */
export interface Fact {
  /** The thing it is about: a repeat with the same key joins its Thread. */
  readonly key: string
  /** The Sender's id: a key of SENDERS, or `mate:<engineer id>`. */
  readonly sender: string
  readonly subject: string
  /** The body. A blank line starts a paragraph. */
  readonly text: string
  readonly actions: ReadonlyArray<AdviceAction>
  /** The filter put it in Spam. */
  readonly spam: boolean
  /** What it says as data, so it can be shown in another language. */
  readonly message?: MailMessage
}

const fact = (
  key: string,
  sender: string,
  written: Composed,
  actions: ReadonlyArray<AdviceAction> = [],
  spam = false,
): Fact => ({
  key,
  sender,
  subject: written.subject,
  text: written.body,
  actions,
  spam,
  message: written.message,
})

export const factOf = (advice: Advice, game: Game, salt: number | string = ''): Fact => {
  const sender = senderFor(advice.from, game, advice.key)
  // The Simulation pairs each topic with its own vars; the record type cannot say so.
  const letters = ADVICE[advice.topic] as unknown as Letters<Advice['vars']>
  return fact(
    advice.key,
    sender,
    write(`advice.${advice.topic}`, letters, advice.vars, sender, game, advice.key, salt),
    [...advice.actions],
  )
}

/* ---------- the world writes: teammates, CVEs, spam ---------- */

/** One event is drawn per this many sim seconds. */
export const EVENT_EVERY = 45

const severity = (score: number): CveVars['severity'] =>
  score >= 9 ? 'critical' : score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low'

const minutes = (seconds: number): string => `${Math.max(1, Math.round(seconds / 60))} min`

/**
 * The Nodes that run `type`, named the way the Dashboard names them: the Component, then a number
 * for the second and later ones. An empty list when the Design runs none of them.
 */
const nodesOf = (game: Game, type: string | undefined): ReadonlyArray<string> => {
  const seen = new Map<string, number>()
  const names: Array<string> = []
  for (const node of game.nodes) {
    const base = COMPONENTS[node.type].name
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    if (node.type === type) names.push(count > 1 ? `${base} ${count}` : base)
  }
  return names
}

/** The advisory for a patch ticket the Simulation filed, which quotes the ticket and its deadline. */
export const disclosureFact = (item: WorkItem, game: Game, spam = false, at = 0): Fact => {
  const cve = CVES.find((entry) => entry.id === item.ref) ?? CVES[0]!
  const score = CVE_DEFS.find((def) => def.id === cve.id)?.score ?? 5
  const key = `security:${cve.id}`
  const sender = senderFor('security', game, cve.id)
  // The filter now and then sorts a real advisory into Spam (18 "Spam and phishing").
  const misfiled =
    spam || (has(game, 'spam-filter') && hashOf(game.seed, 'misfile', cve.id, at) % 8 === 0)
  // Exposure is a research gate (GDD 18 "CVEs and patches"): only Dependency scanning turns the
  // advisory's Node list into names. Without it the Mail says to check whether the Design runs it,
  // and it has no Node to show on the Board.
  const exposed = has(game, 'dependency-scanning') ? nodesOf(game, item.target) : []
  const node =
    exposed.length > 0 ? game.nodes.find((entry) => entry.type === item.target) : undefined
  const vars: CveVars = {
    ...cve,
    score,
    severity: severity(score),
    exposed: exposed.length > 0 ? exposed.join(', ') : null,
  }
  const written = write('cve', CVE_LETTERS, vars, sender, game, key, at)
  const ticket = `${itemName(item)}, ${item.cost} DH, due in ${minutes((item.due ?? game.time) - game.time)}. Overdue, it turns red on the Team backlog; a minute later it is exploited.`
  return fact(
    key,
    sender,
    lead(
      written,
      {
        id: 'patchTicket',
        vars: {
          item: itemName(item),
          cost: item.cost,
          due: minutes((item.due ?? game.time) - game.time),
        },
      },
      `Ticket filed: ${ticket}`,
    ),
    [
      { id: `first:${item.id}`, label: 'Patch now' },
      { id: `rush:${item.id}`, label: 'Rush patch' },
      ...(node ? [{ id: `show:${node.id}`, label: 'Show on Board' }] : []),
      { id: 'team', label: 'Open Team' },
    ],
    // A real advisory can land in Spam, where the filter put it.
    misfiled,
  )
}

/** A made-up ticket for the Sandbox's bench. */
const sampleTicket = (cve: Cve, game: Game, id: number): WorkItem => {
  const def = CVE_DEFS.find((entry) => entry.id === cve.id)
  return {
    id,
    kind: 'patch',
    ref: cve.id,
    cost: patchCost(def?.score ?? 5),
    spent: 0,
    blockedBy: null,
    answered: null,
    due: game.time + patchWindow(def?.score ?? 5),
    ...(def?.affects[0] ? { target: def.affects[0] } : {}),
  }
}

const mateOf = (game: Game, at: number): string =>
  `mate:${game.engineers[at % Math.max(1, game.engineers.length)]?.id ?? `e${at % 8}`}`

const hireFact = (game: Game, mate: string, salt: number): Fact => {
  const key = `team:hire:${game.engineers.length}`
  const backlog = String(Math.max(3, game.backlog.length))
  return fact(key, mate, write('hire', HIRE, { backlog }, mate, game, key, salt), [
    { id: 'hire', label: 'Approve hire' },
    { id: 'later', label: 'Later' },
  ])
}

const rewriteFact = (game: Game, mate: string, salt: number): Fact => {
  const key = `team:rewrite:${mate}`
  // An engineer falls for one language and stays with it.
  const rewrite = pick(REWRITES, mate, 'rewrite')
  return fact(
    key,
    mate,
    write(`rewrite.${rewrite.language}`, rewrite.letters, {}, mate, game, key, salt),
    [
      { id: `rewrite:${rewrite.language}`, label: `Review ${rewrite.language} migration` },
      { id: 'decline', label: 'Decline' },
    ],
  )
}

const customerFact = (game: Game, n: number): Fact => {
  const key = 'customers:slow'
  const sender = senderFor('customers', game, `slow:${n}`)
  return fact(key, sender, write('ticket', TICKETS, {}, sender, game, key, n))
}

/**
 * The running Study stalled and holds the queue (10 "Studies"): a teammate says why, with a
 * button to Research. It waits in Needs action until the Study moves or leaves the queue.
 */
export const stallFact = (game: Game, id: ResearchId, stall: StudyStall): Fact => {
  const vars = {
    research: RESEARCH[id].name,
    reason: stallReason(stall),
    stall: stall._tag,
    types: stall._tag === 'Breadth' ? stall.types : null,
    pool: stall._tag === 'Breadth' ? null : stall.pool,
    feature: stall._tag === 'Breadth' ? null : (stall.feature ?? null),
  }
  const written = STALL[0]!({ ...vars, from: '' })
  return {
    key: `research:stalled:${id}`,
    sender: mateOf(game, hashOf(id)),
    subject: written.subject,
    text: written.body,
    actions: [{ id: `research:${id}`, label: 'Open Research' }],
    spam: false,
    message: { letter: { id: 'stall', variant: 0, vars }, before: [], after: [] },
  }
}

/**
 * A big customer asks for a Feature the Design has not built (GDD 18 "Senders"). The ask carries
 * one button: it queues the Feature on the Team backlog, which the Simulation can carry out.
 */
const requestFact = (game: Game, salt: number): Fact | null => {
  // A Sandbox shows the same Mail: the bench is for trying the ask, and its Action refuses there.
  const open = (Object.keys(FEATURES) as ReadonlyArray<FeatureId>).filter(
    (id) => featureRefusal({ ...game, sandbox: false }, id) === null,
  )
  if (open.length === 0) return null
  const id = pick(open, game.seed, 'feature', salt)
  const key = `customers:feature:${id}`
  const sender = senderFor('customers', game, key)
  return fact(
    key,
    sender,
    write('request', REQUESTS, { feature: FEATURES[id].name }, sender, game, key, salt),
    [{ id: `backlog:${id}`, label: 'Add to backlog' }],
  )
}

/** A region's users fell for a calendar hour: the Customers sender says why (GDD 12). */
export const churnFact = (game: Game, region: RegionChurn): Fact => {
  const key = `customers:churn:${region.region}`
  const sender = senderFor('customers', game, key)
  const causes = region.rows
    .slice(0, 2)
    .map((row) => `- ${KINDS[row.kind].label}: ${CAUSE_TEXT[row.cause]}`)
    // One paragraph per cause, so each line translates on its own.
    .join('\n\n')
  return fact(
    key,
    sender,
    write(
      'churn',
      CHURN_LETTERS,
      {
        region: REGION_INFO[region.region].name,
        users: compact(region.users),
        perHour: compact(Math.abs(region.perHour)),
        inADay: compact(region.inADay),
        causes: causes || '- nothing one cause explains',
      },
      sender,
      game,
      key,
    ),
    [{ id: 'churn', label: 'Open Churn breakdown' }],
  )
}

/** A cause as a customer would put it. */
const CAUSE_TEXT: Record<ChurnCause, string> = {
  far: 'slow from far away',
  slow: 'slow',
  failed: 'errors',
  stranded: 'not available at all',
  dropped: 'requests dropped',
  refused: 'connection refused',
  down: 'down',
  stale: 'old data',
  oom: 'crashes (out of memory)',
  timeout: 'timeouts',
  crash: 'crashes',
  blocked: 'blocked by the firewall',
  upstream: 'a provider is down',
  throttled: 'rate limited',
  duplicate: 'charged twice',
}

/** The item a real vendor demo covers: one in four pitches, an unstudied observability item. */
const vendorOffer = (game: Game, salt: number): ResearchId | null => {
  if (hashOf(game.seed, 'vendor', salt) % 4 !== 0) return null
  const open = (Object.keys(RESEARCH) as ReadonlyArray<ResearchId>).filter(
    (id) =>
      RESEARCH[id].track === 'observability' &&
      RESEARCH[id].era <= game.stage &&
      !has(game, id) &&
      !game.discounts.includes(id),
  )
  return open.length === 0 ? null : pick(open, game.seed, 'vendor-item', salt)
}

const spamFact = (pitch: Pitch, game: Game, salt: number): Fact => {
  const key = `spam:${pitch.sender}`
  const written = write(`spam.${pitch.sender}`, pitch.letters, {}, pitch.sender, game, key, salt)
  // The recruiter's pitch is flavour, but a hint rides along once mood exists (18 "Spam and
  // phishing": "Recruiter: a hint that a teammate is unhappy."). It names nobody: the pitch itself
  // still only offers a job, so the player reads the Team panel to find out who.
  const hint =
    pitch.sender === 'spam-recruiter' && game.engineers.some(unhappy)
      ? tail(
          written,
          { id: 'recruiterHint', vars: {} },
          'P.S. One of your engineers looks ready to listen.',
        )
      : written
  // A vendor's demo is real now and then (18 "Spam and phishing"): the pitch names an
  // observability item the Company has not studied, and taking the demo takes a fifth off it.
  const offered = pitch.sender === 'spam-datadug' ? vendorOffer(game, salt) : null
  const body = offered
    ? tail(
        hint,
        { id: 'realDemo', vars: { research: RESEARCH[offered].name } },
        `P.S. This one is a real demo. It covers ${RESEARCH[offered].name}.`,
      )
    : hint
  const actions = offered ? [{ id: `vendor:${offered}`, label: 'Book the demo' }] : pitch.actions
  return fact(key, pitch.sender, body, actions, has(game, 'spam-filter'))
}

/**
 * What the world writes at one event tick: a teammate, a customer, or spam. A CVE
 * is not drawn here: the Simulation discloses it as a patch ticket. Drawn from the Company's seed, so it is the same on every device.
 * Mail changes nothing in the Simulation until the player presses a button.
 */
export const eventMail = (game: Game, bucket: number): Fact | null => {
  const draw = hashOf(game.seed, bucket)
  const roll = draw % 100
  const at = draw >>> 8
  const mate = game.engineers.length > 0 ? mateOf(game, at) : null

  if (roll < 30 && mate)
    return game.backlog.length >= 3 && game.hires.length === 0
      ? hireFact(game, mate, at)
      : rewriteFact(game, mate, at)
  // A customer writes when a page is slow; with nothing slow, a big one asks for a Feature.
  if (roll < 40) return game.apdex < 0.9 ? customerFact(game, at) : requestFact(game, at)
  if (roll < 85) return spamFact(pick(SPAM, at), game, at)
  return null
}

/* ---------- the generator: every kind of Mail on demand (Sandbox) ---------- */

export interface Sample {
  readonly id: string
  /** The picker's heading for this sample. */
  readonly group: string
  readonly label: string
  /** `n` is unique per send, so each one starts its own Thread unless the sample repeats a key. */
  readonly make: (game: Game, n: number) => Fact
}

const own = (fact: Fact, n: number): Fact => ({ ...fact, key: `${fact.key}#${n}` })

const ROUND: ReadonlyArray<AdviceAction> = [
  { id: 'raise', label: 'Raise' },
  { id: 'decline', label: 'Decline' },
]

/** One case of every advice topic. A topic missing here fails typecheck. */
const ADVICE_SAMPLES: {
  readonly [T in AdviceTopic]: {
    readonly label: string
    readonly from: AdviceFrom
    readonly vars: AdviceVars[T]
    readonly actions?: ReadonlyArray<AdviceAction>
  }
} = {
  credits: { label: 'CPU credits exhausted', from: 'cloud', vars: { node: 'App Server' } },
  draining: { label: 'CPU credits nearly gone', from: 'cloud', vars: { node: 'App Server' } },
  cpu: { label: 'CPU at 100%', from: 'cloud', vars: { node: 'App Server' } },
  memory: { label: 'Out of memory', from: 'cloud', vars: { node: 'App Server' } },
  'memory-shared': {
    label: 'Out of memory, Postgres shares the box',
    from: 'cloud',
    vars: { node: 'App Server' },
  },
  network: { label: 'Network at line rate', from: 'cloud', vars: { node: 'Load Balancer' } },
  disk: { label: 'Working set left RAM', from: 'cloud', vars: { node: 'Database' } },
  workers: { label: 'All workers busy', from: 'monitoring', vars: { node: 'App Server' } },
  'workers-pool': {
    label: 'All workers busy, pool',
    from: 'monitoring',
    vars: { node: 'App Server', runtime: 'Python' },
  },
  connections: { label: 'Postgres refuses connections', from: 'monitoring', vars: {} },
  throughput: { label: 'Past its throughput', from: 'monitoring', vars: { node: 'Cache' } },
  limit: { label: 'Limits the Design', from: 'monitoring', vars: { node: 'Database' } },
  failed: { label: 'Node failed', from: 'monitoring', vars: { node: 'Database' } },
  restarting: { label: 'Node restarting', from: 'monitoring', vars: { node: 'App Server' } },
  'slow-query-fix': { label: 'Query has no index, Add index', from: 'monitoring', vars: {} },
  'slow-query': { label: 'Query has no index, no research', from: 'monitoring', vars: {} },
  'failing-writes': { label: 'Writes failing', from: 'monitoring', vars: { kind: 'Write' } },
  failing: { label: 'Requests failing', from: 'monitoring', vars: { kind: 'Upload' } },
  stranded: { label: 'Requests with nowhere to go', from: 'monitoring', vars: { node: 'CDN' } },
  drawer: { label: 'Payments drawer full', from: 'vendor', vars: {} },
  collect: { label: 'Revenue waiting', from: 'vendor', vars: {} },
  negative: { label: 'Cash negative', from: 'finance', vars: {} },
  guidance: { label: 'Quarterly Guidance', from: 'finance', vars: {} },
  round: { label: 'Term sheet', from: 'investor', vars: { round: 'Series A' }, actions: ROUND },
  research: { label: 'Spend your Insight', from: 'mentor', vars: {} },
  ipo: { label: 'Going public', from: 'mentor', vars: { users: '1,000,000' } },
  grow: {
    label: 'Grow to the next round',
    from: 'mentor',
    vars: { round: 'Seed', users: '1,000' },
  },
}

/** One case of every Step event topic, and the event that sends it. */
const EVENT_SAMPLES: {
  readonly [T in EventTopic]: {
    readonly label: string
    readonly tag: string
    readonly vars: EventVars[T]
  }
} = {
  'incident-instance': {
    label: 'Instance failed',
    tag: 'IncidentStarted',
    vars: { node: 'App Server' },
  },
  'incident-slow-query': { label: 'Slow query', tag: 'IncidentStarted', vars: {} },
  'incident-poison': { label: 'Poison message', tag: 'IncidentStarted', vars: {} },
  'incident-ddos': { label: 'DDoS (Cloudscare)', tag: 'IncidentStarted', vars: {} },
  'incident-stampede': { label: 'Cache stampede', tag: 'IncidentStarted', vars: {} },
  'incident-zone': { label: 'Zone outage', tag: 'IncidentStarted', vars: { zone: 'B' } },
  'incident-breach': { label: 'Data breach', tag: 'IncidentStarted', vars: {} },
  'incident-phishing': {
    label: 'Credential leak (phishing)',
    tag: 'IncidentStarted',
    vars: {},
  },
  'incident-psp': { label: 'Payment provider outage', tag: 'IncidentStarted', vars: {} },
  resolved: {
    label: 'Incident over',
    tag: 'IncidentResolved',
    vars: { incident: 'Zone outage' },
  },
  'resolved-action': {
    label: 'Incident over, with action item',
    tag: 'IncidentResolved',
    vars: { incident: 'Cache stampede', action: 'Request coalescing' },
  },
  drawer: { label: 'Drawer full', tag: 'DrawerFull', vars: {} },
  oom: { label: 'Out of memory, restarted', tag: 'OutOfMemory', vars: { node: 'App Server' } },
  credits: { label: 'Out of CPU credits', tag: 'CreditsExhausted', vars: { node: 'App Server' } },
  alert: {
    label: 'Alert fired',
    tag: 'AlertFired',
    vars: { alert: 'Error rate above 1%', seconds: '30' },
  },
  'alert-ignored': {
    label: 'Alert ignored',
    tag: 'AlertIgnored',
    vars: { alert: 'A Node above 90% load' },
  },
  hired: { label: 'New hire says hello', tag: 'Hired', vars: {} },
  finished: { label: 'Task finished', tag: 'WorkFinished', vars: { item: 'Add index' } },
  deployed: { label: 'Deployed', tag: 'Deployed', vars: { features: 'Search, Uploads' } },
  'deployed-bad': { label: 'Bad deploy', tag: 'Deployed', vars: { features: 'Checkout' } },
  migration: { label: 'Migration step', tag: 'MigrationShifted', vars: { share: '25%' } },
  blocked: {
    label: 'Blocked item',
    tag: 'Blocked',
    vars: { item: 'Checkout', reason: 'waiting on a decision' },
  },
  unhappy: { label: 'Engineer unhappy', tag: 'EngineerUnhappy', vars: { pages: '6', gap: '5%' } },
  'patch-proposed': {
    label: 'Proposal to patch',
    tag: 'PatchProposed',
    vars: { item: 'Patch App Server', target: 'App Server', due: '6 min' },
  },
}

const entries = <K extends string, V>(record: { readonly [P in K]: V }): ReadonlyArray<[K, V]> =>
  Object.entries(record) as Array<[K, V]>

/** A random sample for the bench's ×10 and ×50: the `n`th send of a burst. */
export const randomSample = (game: Game, n: number): Sample => pick(SAMPLES, game.seed, 'bench', n)

export const SAMPLES: ReadonlyArray<Sample> = [
  {
    id: 'random',
    group: 'Mixed',
    label: 'A random event',
    make: (game, n) => eventMail(game, n) ?? spamFact(SPAM[0]!, game, n),
  },
  {
    id: 'thread',
    group: 'Mixed',
    label: 'Repeating thread (same key)',
    make: (game, n) =>
      factOf(
        {
          key: 'cloud:cpu:sandbox',
          from: 'cloud',
          subject: '',
          text: '',
          topic: 'cpu',
          vars: { node: 'App Server' },
          actions: [],
        },
        game,
        n,
      ),
  },
  ...entries(ADVICE_SAMPLES).map(([topic, sample]): Sample => ({
    id: `advice:${topic}`,
    group: 'Advice',
    label: `${KIND_LABEL[sample.from]}: ${sample.label}`,
    make: (game, n) =>
      factOf(
        {
          key: `${sample.from}:${topic}#${n}`,
          from: sample.from,
          subject: '',
          text: '',
          topic,
          vars: sample.vars,
          actions: sample.actions ?? [],
        },
        game,
        n,
      ),
  })),
  ...entries(EVENT_SAMPLES).map(([topic, sample]): Sample => ({
    id: `event:${topic}`,
    group: 'What happened',
    label: sample.label,
    make: (game, n) =>
      own(
        eventFact(
          {
            _tag: sample.tag,
            engineerId: mateOf(game, n).replace('mate:', ''),
            // A bench sample of a teammate's Mail carries a ticket, so its buttons are on screen.
            ...(topic === 'blocked' || topic === 'patch-proposed'
              ? {
                  item: {
                    id: n,
                    kind: 'feature',
                    ref: 'checkout',
                    cost: 320,
                    spent: 0,
                    blockedBy: null,
                    answered: null,
                  } satisfies WorkItem,
                }
              : {}),
          },
          { topic, vars: sample.vars } as EventMail,
          game,
          n,
        ),
        n,
      ),
  })),
  ...CVES.map((cve): Sample => ({
    id: `cve-${cve.id}`,
    group: 'World',
    label: `CVE: ${cve.id}, ${cve.title}`,
    make: (game, n) => own(disclosureFact(sampleTicket(cve, game, -n), game, false, n), n),
  })),
  {
    id: 'cve-spam',
    group: 'World',
    label: 'CVE misfiled in Spam',
    make: (game, n) => own(disclosureFact(sampleTicket(CVES[0]!, game, -n), game, true, n), n),
  },
  {
    id: 'hire',
    group: 'World',
    label: 'Teammate: hire request',
    make: (game, n) => own(hireFact(game, mateOf(game, n), n), n),
  },
  ...REWRITES.map((rewrite): Sample => ({
    id: `rewrite:${rewrite.language}`,
    group: 'World',
    label: `Teammate: rewrite it in ${rewrite.language}`,
    make: (game, n) => {
      const mate = mateOf(game, n)
      const key = `team:rewrite:${mate}#${n}`
      return fact(
        key,
        mate,
        write(`rewrite.${rewrite.language}`, rewrite.letters, {}, mate, game, key, n),
        [
          { id: `rewrite:${rewrite.language}`, label: `Review ${rewrite.language} migration` },
          { id: 'decline', label: 'Decline' },
        ],
      )
    },
  })),
  {
    id: 'customer',
    group: 'World',
    label: 'Customer: it is slow',
    make: (game, n) => own(customerFact(game, n), n),
  },
  {
    id: 'request',
    group: 'World',
    label: 'Customer: asks for a feature',
    make: (game, n) => own(requestFact(game, n) ?? customerFact(game, n), n),
  },
  ...SPAM.map((pitch): Sample => ({
    id: pitch.sender,
    group: 'Spam',
    label: `${pitch.actions ? 'Trap' : 'Spam'}: ${SENDERS[pitch.sender]?.name ?? pitch.sender}`,
    make: (game, n) => own(spamFact(pitch, game, n), n),
  })),
]

/* ---------- an incident's follow-up, and the return from away ---------- */

/** A teammate's follow-up once an Incident resolves: the postmortem is theirs to file (18 "Teammates"). */
export const postmortemFact = (
  postmortem: Postmortem,
  game: Game,
  salt: number | string = '',
): Fact => {
  const incident = INCIDENTS[postmortem.kind].name
  const key = `team:postmortem:${postmortem.id}`
  const mate = mateOf(game, postmortem.id)
  const vars: PostmortemVars = {
    incident,
    severity: `SEV${postmortem.severity}`,
    target: postmortem.target ?? 'the whole Design',
    mttr: `${Math.round(postmortem.mttr)} s`,
    lostUsers: compact(postmortem.lostUsers),
    lostRevenue: money(postmortem.lostRevenue),
    failed: compact(postmortem.failed),
    action: postmortem.action ? RESEARCH[postmortem.action].name : null,
  }
  return fact(key, mate, write('postmortem', POSTMORTEM, vars, mate, game, key, salt), [
    { id: `postmortem:${postmortem.id}`, label: 'File postmortem' },
    ...(postmortem.action
      ? [{ id: `postmortem-take:${postmortem.id}`, label: 'File and research the action item' }]
      : []),
  ])
}

/** "While you were away", from Finance and from the pager (18 "What Mail replaces"). */
export const awayFacts = (report: AwayReport, game: Game): ReadonlyArray<Fact> => {
  const hours = report.away / 3_600
  const away = hours >= 1 ? `${hours.toFixed(1)} h` : `${Math.round(report.away / 60)} min`
  const financeKey = `finance:away:${Math.round(game.time)}`
  const finance = senderFor('finance', game, financeKey)
  const vars: AwayVars = {
    away,
    users: `${compact(report.usersBefore)} → ${compact(report.usersAfter)}`,
    cash: `${report.cash >= 0 ? '+' : ''}${money(report.cash)}`,
    studied: String(report.studied.length),
    devHours: `+${compact(report.devHours)}`,
  }
  const watchKey = `monitoring:away:${Math.round(game.time)}`
  const watch = senderFor('monitoring', game, watchKey)
  return [
    fact(financeKey, finance, write('away.finance', AWAY_FINANCE, vars, finance, game, financeKey)),
    fact(
      watchKey,
      watch,
      write(
        'away.monitoring',
        AWAY_MONITORING,
        {
          away,
          peak: `${Math.round(report.peak * 100)}%`,
          peakNode: report.peakNode ?? 'the Design',
          lost: report.lost,
        },
        watch,
        game,
        watchKey,
      ),
    ),
  ]
}

/* ---------- Step events: what happened in the Design, as Mail ---------- */

const EVENT_FROM: Record<string, SenderKind> = {
  CreditsExhausted: 'cloud',
  OutOfMemory: 'cloud',
  DrawerFull: 'vendor',
  AlertFired: 'monitoring',
  AlertIgnored: 'monitoring',
  IncidentStarted: 'monitoring',
  IncidentResolved: 'monitoring',
  MigrationShifted: 'monitoring',
}

/** With a Security team, it writes about a compromise itself instead of the pager. */
const SECURITY_PAGES: ReadonlyArray<EventMail['topic']> = ['incident-phishing', 'incident-breach']

/** News only one party would send: the edge network sees a flood before anyone else. */
const PINNED: Partial<Record<EventMail['topic'], string>> = { 'incident-ddos': 'cloud-cloudscare' }

/** The Node a Step event names: the one an incident hit, or the one that ran out of something. */
const eventNode = (event: { readonly [field: string]: unknown }): string | null => {
  if (typeof event.nodeId === 'string') return event.nodeId
  const incident = event.incident as { readonly nodeId?: unknown } | undefined
  return typeof incident?.nodeId === 'string' ? incident.nodeId : null
}

/** The Sender's buttons (GDD 18 "Senders"). A Cloud and an alarm Mail both name the Node they mean. */
const eventActions = (
  game: Game,
  from: SenderKind | undefined,
  nodeId: string | null,
): ReadonlyArray<AdviceAction> =>
  from === 'cloud'
    ? nodeId === null
      ? []
      : cloudActions(game, nodeId)
    : from === 'monitoring'
      ? alertActions(nodeId)
      : []

/**
 * A teammate's buttons (18 "Teammates"): Approve or Later a blocked item, the three answers to
 * burnout, and the two answers to a proposal to patch.
 */
const workActions = (
  event: { readonly [field: string]: unknown },
  mail: EventMail,
): ReadonlyArray<AdviceAction> => {
  const item = event.item as WorkItem | undefined
  if (mail.topic === 'blocked' && item)
    return [
      { id: `approve:${item.id}`, label: 'Approve' },
      { id: `defer:${item.id}`, label: 'Later' },
    ]
  if (mail.topic === 'unhappy' && typeof event.engineerId === 'string')
    return [
      { id: `timeoff:${event.engineerId}`, label: 'Give time off' },
      { id: `payrise:${event.engineerId}`, label: 'Raise salary' },
      { id: `resign:${event.engineerId}`, label: 'Accept resignation' },
    ]
  if (mail.topic === 'patch-proposed' && item)
    return [
      { id: `patch:${item.id}`, label: 'Patch now' },
      { id: `queue:${item.id}`, label: 'Queue the patch' },
      { id: 'team', label: 'Open Team' },
    ]
  return []
}

/** One Step event as Mail: the party that would know writes, and repeats join the Thread. */
export const eventFact = (
  event: { readonly _tag: string; readonly [field: string]: unknown },
  mail: EventMail,
  game: Game,
  salt: number | string = '',
): Fact => {
  // A blocked item and a patch proposal are about one backlog item each, so two of them from the
  // same engineer start two Threads; the rest are about a Node, a rule, or the engineer.
  const work = event.item as { readonly id?: unknown } | undefined
  const itemKey =
    (mail.topic === 'blocked' || mail.topic === 'patch-proposed') && typeof work?.id === 'number'
      ? `item:${work.id}`
      : null
  const about =
    itemKey ?? [event.nodeId, event.rule, event.engineerId].find((v) => typeof v === 'string') ?? ''
  // Each kind of news keeps its own Thread: a zone outage does not join a cache stampede.
  const key = `event:${mail.topic}:${about}`
  const from = EVENT_FROM[event._tag]
  const sender =
    PINNED[mail.topic] ??
    (securityStaffed(game) && SECURITY_PAGES.includes(mail.topic)
      ? senderFor('security', game, key)
      : from
        ? senderFor(from, game, key)
        : `mate:${typeof event.engineerId === 'string' ? event.engineerId : (game.engineers[0]?.id ?? 'e0')}`)
  // Each topic carries its own vars; the record type cannot say so.
  const letters = EVENTS[mail.topic] as unknown as Letters<EventMail['vars']>
  return fact(
    key,
    sender,
    write(`event.${mail.topic}`, letters, mail.vars, sender, game, key, salt),
    [...workActions(event, mail), ...eventActions(game, from, eventNode(event))],
  )
}
