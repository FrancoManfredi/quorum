import type { ToolName } from 'quorum-mcp-relay/tools'
import { nodeLabel } from '@quorum/simulation/labels'
import type { NodeLedger } from '@quorum/simulation/ledger'
import { has } from '@quorum/simulation/lookups'
import { hasTraffic, hourBefore, loadChangeOf, sampleNode } from './node-metrics.ts'
import {
  boardChallenge,
  clockPaused,
  ledgerOf,
  offCompany,
  boardSandbox,
  type Model,
} from './model.ts'

type Input = Record<string, unknown>

let latest: Model | null = null

/** Remembers the newest Model. The update loop calls it after every Message. */
export const publish = (model: Model): void => {
  latest = model
}

const round = (n: number): number => Math.round(n * 1000) / 1000

const runs: Record<ToolName, (model: Model, input: Input) => unknown> = {
  get_company: (m) => {
    const ledger = ledgerOf(m)
    return {
      mode: boardChallenge(m.board) ? 'challenge' : boardSandbox(m.board) ? 'sandbox' : 'company',
      offCompany: offCompany(m),
      screen: {
        route: m.route._tag,
        panel: m.panel,
        region: m.board.region,
        selectedNode: m.board.selected,
      },
      paused: clockPaused(m),
      speed: m.board.clock.speed,
      simSeconds: round(m.board.game.time),
      stage: m.board.game.stage,
      founding: m.board.game.founding,
      cash: round(m.board.game.cash),
      equity: m.board.game.equity,
      users: round(m.board.game.users),
      market: round(ledger.market),
      apdex: round(ledger.apdex),
      demand: round(ledger.demand),
      served: round(ledger.served),
      errorShare: round(ledger.errorShare),
      latencyMs: {
        mean: round(ledger.latency),
        p50: round(ledger.p50),
        p95: round(ledger.p95),
        p99: round(ledger.p99),
      },
      revenuePerSec: round(ledger.revenue),
      burnPerSec: round(ledger.burn),
      bottleneck: m.board.bottleneck,
      failingKinds: ledger.failing,
      researched: m.board.game.researched,
      studies: m.board.game.studies,
      openActions: m.board.game.openActions,
    }
  },
  get_design: (m) => {
    const ledger = ledgerOf(m)
    return {
      nodes: m.board.game.nodes.map((node) => ({
        ...node,
        label: nodeLabel(m.board.game, node),
        ledger: ledger.nodes[node.id] ? withoutDiagnosis(ledger.nodes[node.id]!) : null,
      })),
      links: m.board.game.links.map((link) => ({
        ...link,
        ledger: ledger.links.find((l) => l.from === link.from && l.to === link.to) ?? null,
      })),
      kinds: ledger.kinds,
      errors: ledger.errors,
    }
  },
  get_incidents: (m, input) => ({
    active: m.board.game.incident,
    alertRules: m.board.game.alertRules,
    alarms: m.board.game.alarms,
    falseAlarms: m.board.game.falseAlarms,
    openActions: m.board.game.openActions,
    postmortems: m.board.game.postmortems.slice(-(Number(input['limit']) || 5)),
  }),
  get_inbox: (m, input) =>
    m.board.inbox.mail
      .filter((mail) => {
        const folder = mail.trashed ? 'trash' : mail.spam ? 'spam' : 'inbox'
        return folder === (input['folder'] ?? 'inbox') && (!input['unreadOnly'] || !mail.read)
      })
      .map((mail) => ({
        id: mail.id,
        sender: mail.sender,
        subject: mail.subject,
        time: round(mail.time),
        read: mail.read,
        resolved: mail.phase._tag === 'Resolved',
        answer: mail.phase._tag === 'Answered' ? mail.phase.answer : null,
        choices: mail.actions.map((action) => action.label),
        entries: mail.entries,
      })),
  get_history: (m, input) =>
    m.board.game.history.slice(-Math.min(600, Number(input['last']) || 60)),
  explain_node: (m, input) => {
    const game = m.board.game
    const id =
      (typeof input['nodeId'] === 'string' ? input['nodeId'] : null) ??
      m.board.selected ??
      m.board.bottleneck
    const node = game.nodes.find((entry) => entry.id === id)
    if (!node) return { error: 'No such Node. Pass a nodeId from get_design.' }
    const ledger = ledgerOf(m)
    const own = ledger.nodes[node.id]
    if (!own || !hasTraffic(node))
      return { node: nodeLabel(game, node), error: 'No traffic to explain.' }
    const sample = sampleNode(game, node, ledger)
    const history = m.board.nodeHistory[node.id] ?? []
    const earlier = hourBefore(history, -1)
    const change = earlier ? loadChangeOf(sample, earlier) : null
    const metrics = has(game, 'metrics')
    const tracing = has(game, 'tracing')
    const profiling = has(game, 'profiling')
    const rows = m.board.whatIfs
    return {
      node: nodeLabel(game, node),
      utilization: round(own.utilization),
      limit: profiling ? own.limit : null,
      loadChange:
        change && earlier
          ? metrics
            ? {
                from: round(earlier.utilization),
                to: round(sample.utilization),
                points: {
                  demand: round(change.demand),
                  costPerRequest: round(change.cost),
                  capacity: round(change.capacity),
                },
              }
            : { largest: largestOf(change) }
          : null,
      slowestCall:
        tracing && sample.slowest
          ? { node: sample.slowest.id, latencyMs: round(sample.slowest.latency) }
          : null,
      amplification: tracing
        ? {
            byUsersKind: Object.entries(own.origins).map(([kind, rate]) => ({
              kind,
              usersSend: round(sample.sent[kind] ?? 0),
              callsPerRequest: round((rate ?? 0) / Math.max(1e-9, sample.sent[kind] ?? 0)),
              here: round(rate ?? 0),
            })),
            repeatedShare: round(own.inbound > 0 ? own.repeated / own.inbound : 0),
            cacheMissShare: round(own.inbound > 0 ? sample.misses / own.inbound : 0),
          }
        : null,
      workShare: profiling ? { unit: own.workUnit, byKind: own.workShare } : null,
      costReceipts: profiling ? own.receipts : null,
      whatIfs: profiling && rows?.nodeId === node.id ? rows.rows : null,
      hidden: [
        ...(metrics ? [] : ['metrics']),
        ...(tracing ? [] : ['tracing']),
        ...(profiling ? [] : ['profiling']),
      ],
    }
  },
  get_game: (m) => ({ ...m.board.game, history: undefined }),
}

/** A Node Ledger without the diagnosis fields: `explain_node` shows those, behind research. */
const withoutDiagnosis = ({
  workShare: _work,
  workUnit: _unit,
  cost: _cost,
  receipts: _receipts,
  repeated: _repeated,
  origins: _origins,
  ...rest
}: NodeLedger) => rest

const largestOf = (change: Readonly<{ demand: number; cost: number; capacity: number }>) =>
  (['demand', 'cost', 'capacity'] as const).reduce((best, part) =>
    Math.abs(change[part]) > Math.abs(change[best]) ? part : best,
  )

/** Why an agent gets nothing, or null when it may read the game. */
export const refusal = (model: Model | null): string | null =>
  model === null
    ? 'No Company is open. Ask the player to open one.'
    : boardChallenge(model.board)
      ? 'A Challenge is open. Challenges are scored, so agents cannot read them.'
      : null

/** Runs one tool over the newest Model, and returns its JSON text. Throws the reason it cannot. */
export const readTool = (name: string, input: Input = {}): string => {
  const reason = refusal(latest)
  if (reason !== null || latest === null) throw new Error(reason ?? '')
  const run = (runs as Record<string, (model: Model, input: Input) => unknown>)[name]
  if (!run) throw new Error(`Unknown tool: ${name}`)
  return JSON.stringify(run(latest, input))
}

/** What the "Copy state as JSON" button copies: the same views the tools return, in one document. */
export const stateJson = (model: Model): string =>
  JSON.stringify(
    {
      company: runs.get_company(model, {}),
      design: runs.get_design(model, {}),
      incidents: runs.get_incidents(model, {}),
      inbox: runs.get_inbox(model, {}),
      history: runs.get_history(model, {}),
    },
    null,
    2,
  )
