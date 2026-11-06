import {
  ANALYTICS_CAPACITY,
  FAILURE_YIELD,
  INSIGHT_YIELD,
  PROFILES,
  RUNTIMES,
  MESH_INSIGHT,
  JVM_INSIGHT,
  type InsightPool,
  type Kind,
  type RegionId,
  type RequestKind,
} from './catalog.ts'
import { insightPerk } from './founding.ts'

import type { KindLedger, NodeLedger, NodeStatus } from './ledger.ts'
import { grown, has, isDown, meshOf } from './lookups.ts'
import { type Pass, type Rates } from './rules.ts'

import { NO_INSIGHT, type Game, type GameNode } from './state.ts'

import { type Graph, originsOf } from './solve-graph.ts'

export const statusOf = (
  node: GameNode,
  inbound: number,
  utilization: number,
  trouble: boolean,
): NodeStatus =>
  isDown(node)
    ? 'down'
    : inbound <= 0
      ? 'idle'
      : utilization >= 0.9
        ? 'danger'
        : utilization >= 0.7 || trouble
          ? 'warn'
          : 'ok'

/** Attribute a tap's sampled volume to its source's incoming operations, not routed calls. */
export const sampledTraffic = (source: NodeLedger | undefined, rate: number): Rates => {
  const traffic: Rates = {}
  if (!source || source.inbound <= 0) return traffic
  const scale = ((source.inbound - source.dropped) / source.inbound) * rate
  for (const kind of Object.keys(source.traffic) as Array<Kind>)
    traffic[kind] = (source.traffic[kind] ?? 0) * scale
  return traffic
}

/**
 * Analytics turns sampled traffic into Insight of each request kind (12 "Earning Insight"). It
 * also fills in each tap's own ledger in `nodes`.
 */
export const insightOf = (
  game: Game,
  graph: Graph,
  pass: Pass,
  nodes: Record<string, NodeLedger>,
  kinds: Partial<Record<RequestKind, KindLedger>>,
) => {
  const origins = originsOf(graph, pass)
  const sampledBy = new Map<string, number>()
  // The share of each key's samples that came from a Node a Service Mesh watches: per-Link metrics
  // without code changes earn Insight on top of it (05 "Service Mesh": +20%).
  const meshedBy = new Map<string, number>()
  // The share that came from a Java App Server: its profilers (Java Flight Recorder) expose more.
  const profiledBy = new Map<string, number>()
  const failedBy = new Map<string, number>()
  // The regions each request kind is sampled in: Real user monitoring needs two of them.
  const regionsBy = new Map<RequestKind, Set<RegionId>>()
  for (const [tapId, sources] of graph.taps) {
    const tap = graph.byId.get(tapId)
    if (!tap) continue
    const rate = tap.sampleRate
    const volume = sources.reduce((total, source) => {
      const entry = nodes[source]
      return total + (entry ? entry.inbound - entry.dropped : 0)
    }, 0)
    const traffic: Rates = {}
    for (const source of sources) {
      const sampled = sampledTraffic(nodes[source], rate)
      for (const kind of Object.keys(sampled) as Array<Kind>)
        traffic[kind] = (traffic[kind] ?? 0) + (sampled[kind] ?? 0)
    }
    const capacity = grown(ANALYTICS_CAPACITY, 2, tap.size - 1)
    // Samples beyond the tap's capacity are dropped, evenly.
    const kept = isDown(tap) || volume * rate <= 0 ? 0 : Math.min(1, capacity / (volume * rate))
    for (const source of sources) {
      const entry = nodes[source]
      const from = graph.byId.get(source)
      if (!entry || !from || kept <= 0) continue
      const done = (entry.inbound - entry.dropped) * rate * kept
      for (const [kind, share] of origins.get(source) ?? []) {
        const samples = done * share
        if (samples <= 0) continue
        const key = `${from.type}:${kind}`
        const seen = regionsBy.get(kind as RequestKind) ?? new Set<RegionId>()
        seen.add(from.region)
        regionsBy.set(kind as RequestKind, seen)
        sampledBy.set(key, (sampledBy.get(key) ?? 0) + samples)
        if (meshOf(game, from)) meshedBy.set(key, (meshedBy.get(key) ?? 0) + samples)
        if (from.type === 'server' && RUNTIMES[from.runtime].language === 'java')
          profiledBy.set(key, (profiledBy.get(key) ?? 0) + samples)
        // A request that fails or frustrates its user teaches Failure, a tolerated one half.
        const answer = kinds[kind]
        if (answer && PROFILES[kind].scored)
          failedBy.set(
            from.type,
            (failedBy.get(from.type) ?? 0) + samples * (1 - answer.success * answer.apdex),
          )
      }
    }
    nodes[tapId] = {
      ...(nodes[tapId] as NodeLedger),
      inbound: volume * rate,
      traffic,
      capacity,
      utilization: capacity > 0 ? (volume * rate) / capacity : 0,
      limit: volume * rate > capacity ? 'throughput' : 'none',
      status: statusOf(tap, volume, capacity > 0 ? (volume * rate) / capacity : 0, false),
    }
  }
  // The square root per Component type and kind: a broad Design teaches more than a big one.
  const perk = insightPerk(game)
  const insight: Record<InsightPool, number> = { ...NO_INSIGHT }
  const breadth: Partial<Record<RequestKind, number>> = {}
  for (const [key, samples] of sampledBy) {
    const kind = key.slice(key.indexOf(':') + 1) as RequestKind
    // A mesh watches each Link, so the samples from its members earn their 20% again, under the
    // same square root: a Design where every sampled Node is meshed earns a full 20% more.
    const watched = meshedBy.get(key) ?? 0
    // Mature JVM tooling earns the same 25% on the samples from its servers (06 "Java").
    const profiled = profiledBy.get(key) ?? 0
    insight[kind] +=
      INSIGHT_YIELD *
      (Math.sqrt(samples) + MESH_INSIGHT * Math.sqrt(watched) + JVM_INSIGHT * Math.sqrt(profiled)) *
      perk
    breadth[kind] = (breadth[kind] ?? 0) + 1
  }
  // Tail-based sampling keeps the failed traces instead of dropping most of them with the rest
  // (12 "Earning Insight", `tail-sampling`): twice the Failure Insight for the same failures.
  const tailSampled = has(game, 'tail-sampling') ? 2 : 1
  for (const failed of failedBy.values())
    insight.failure +=
      INSIGHT_YIELD * FAILURE_YIELD * Math.sqrt(Math.max(0, failed)) * perk * tailSampled
  return { insight, breadth, regionsBy }
}
