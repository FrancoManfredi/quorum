import { nodeLabel } from '@quorum/simulation/labels'
import type { NodeLedger } from '@quorum/simulation/ledger'
import { has } from '@quorum/simulation/lookups'
import { solveFlow } from '@quorum/simulation/solve'
import { hasTraffic, hourBefore, loadChangeOf, sampleNode } from './node-metrics.ts'
import type { AgentSnapshot } from './snapshot.ts'
import type { ToolName } from './tools.ts'

/* ==========================================================================
   The one tool implementation. It reads a plain snapshot, so the browser, the
   Durable Object, and the tests all answer the same question the same way.
   ========================================================================== */

type Input = Record<string, unknown>

const round = (n: number): number => Math.round(n * 1000) / 1000

const ledgerOf = (snapshot: AgentSnapshot) => ({
  ...solveFlow(snapshot.game!),
  bottleneck: snapshot.bottleneck,
})

const runs: Record<ToolName, (snapshot: AgentSnapshot, input: Input) => unknown> = {
  get_company: (snapshot) => {
    const game = snapshot.game!
    const ledger = ledgerOf(snapshot)
    return {
      mode: snapshot.mode,
      offCompany: snapshot.mode !== 'company',
      screen: snapshot.screen,
      paused: snapshot.paused,
      speed: snapshot.speed,
      simSeconds: round(game.time),
      stage: game.stage,
      founding: game.founding,
      cash: round(game.cash),
      equity: round(game.equity),
      users: round(game.users),
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
      bottleneck: snapshot.bottleneck,
      failingKinds: ledger.failing,
      researched: game.researched,
      studies: game.studies,
      openActions: game.openActions,
    }
  },
  get_design: (snapshot) => {
    const game = snapshot.game!
    const ledger = ledgerOf(snapshot)
    return {
      nodes: game.nodes.map((node) => ({
        ...node,
        label: nodeLabel(game, node),
        ledger: ledger.nodes[node.id] ? withoutDiagnosis(ledger.nodes[node.id]!) : null,
      })),
      links: game.links.map((link) => ({
        ...link,
        ledger: ledger.links.find((l) => l.from === link.from && l.to === link.to) ?? null,
      })),
      kinds: ledger.kinds,
      errors: ledger.errors,
    }
  },
  get_incidents: (snapshot, input) => {
    const game = snapshot.game!
    return {
      active: game.incident,
      alertRules: game.alertRules,
      alarms: game.alarms,
      falseAlarms: game.falseAlarms,
      openActions: game.openActions,
      postmortems: game.postmortems.slice(-(Number(input['limit']) || 5)),
    }
  },
  get_inbox: (snapshot, input) =>
    snapshot.inbox
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
        choices: mail.actions,
        entries: mail.entries,
      })),
  get_history: (snapshot, input) =>
    snapshot.samples.slice(-Math.min(600, Number(input['last']) || 60)),
  explain_node: (snapshot, input) => {
    const game = snapshot.game!
    const id =
      (typeof input['nodeId'] === 'string' ? input['nodeId'] : null) ??
      snapshot.screen.selectedNode ??
      snapshot.bottleneck
    const node = game.nodes.find((entry) => entry.id === id)
    if (!node) return { error: 'No such Node. Pass a nodeId from get_design.' }
    const ledger = ledgerOf(snapshot)
    const own = ledger.nodes[node.id]
    if (!own || !hasTraffic(node))
      return { node: nodeLabel(game, node), error: 'No traffic to explain.' }
    const sample = sampleNode(game, node, ledger)
    const history = snapshot.nodeSamples[node.id] ?? []
    const earlier = hourBefore(history, -1)
    const change = earlier ? loadChangeOf(sample, earlier) : null
    const metrics = has(game, 'metrics')
    const tracing = has(game, 'tracing')
    const profiling = has(game, 'profiling')
    const rows = snapshot.whatIfs
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
  get_game: (snapshot) => ({ ...snapshot.game!, history: undefined }),
  get_status: (snapshot) => ({
    mode: snapshot.mode,
    updatedAt: snapshot.updatedAt,
    samples: snapshot.samples.length,
    nodes: Object.keys(snapshot.nodeSamples).length,
    inbox: snapshot.inbox.length,
  }),
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

/** Why an agent gets nothing, or null when it may read the Room. */
export const refusal = (snapshot: AgentSnapshot | null): string | null => {
  if (snapshot === null)
    return 'No Room is open. Ask the player to open a Company and turn on Agent access.'
  if (snapshot.mode === 'challenge')
    return 'A Challenge is open. Challenges are scored, so agents cannot read them.'
  if (snapshot.game === null)
    return 'No Room is open. Ask the player to open a Company and turn on Agent access.'
  return null
}

/** Runs one tool over a snapshot, and returns its JSON text. Throws the reason it cannot. */
export const readTool = (
  snapshot: AgentSnapshot | null,
  name: string,
  input: Input = {},
): string => {
  const reason = refusal(snapshot)
  if (reason !== null || snapshot === null) throw new Error(reason ?? '')
  const run = (runs as Record<string, (snapshot: AgentSnapshot, input: Input) => unknown>)[name]
  if (!run) throw new Error(`Unknown tool: ${name}`)
  return JSON.stringify(run(snapshot, input))
}

/** What the "Copy state as JSON" button copies: the same views the tools return, in one document. */
export const stateJson = (snapshot: AgentSnapshot): string =>
  JSON.stringify(
    {
      company: runs.get_company(snapshot, {}),
      design: runs.get_design(snapshot, {}),
      incidents: runs.get_incidents(snapshot, {}),
      inbox: runs.get_inbox(snapshot, {}),
      history: runs.get_history(snapshot, {}),
    },
    null,
    2,
  )
