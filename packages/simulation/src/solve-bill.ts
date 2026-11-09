import {
  BACKEND_KB,
  EGRESS_CDN,
  EGRESS_CROSS_ZONE,
  EGRESS_ORIGIN,
  PSP_FIXED,
  SECOND_PROVIDER_FEE,
  PSP_RATE,
  EGRESS_CROSS_REGION,
  MSGP_PRICE,
  GATEWAY_PRICE,
  QUEUE_MESSAGE_PRICE,
  LLM_PRICE,
  SCAN_PRICE,
  SPREAD_REPLICATION_KB,
  STORAGE_CLASSES,
  TOKENS_PER_PROMPT,
  KINDS,
  PROFILES,
  REQUEST_KINDS,
  isBackendKind,
  type Kind,
  type RequestKind,
} from './catalog.ts'
import { ventureOf } from './founding.ts'

import { valueFactor } from './features.ts'
import type { KindLedger, NodeLedger } from './ledger.ts'
import {
  burnOf,
  burnSharesOf,
  edgeBurnOf,
  eraOf,
  spreadCount,
  has,
  isDown,
  serverlessBurnOf,
  storageRequestBurnOf,
  zoneMs,
} from './lookups.ts'
import { slotOf, cdnHitOf, gatewayArrivals, gatewayShare, type Pass, type Rates } from './rules.ts'
import { isGlobal } from './regions.ts'
import { type Game } from './state.ts'
import { payrollOf } from './team.ts'

import { type Edge, type Graph } from './solve-graph.ts'

import { meanServiceOf } from './solve-outcomes.ts'

/** The cloud bill: egress, retrieval, third-party fees, per-request lines, and the total Burn (09). */
export const billOf = (
  game: Game,
  graph: Graph,
  pass: Pass,
  nodes: Readonly<Record<string, NodeLedger>>,
  kinds: Partial<Record<RequestKind, KindLedger>>,
) => {
  // Egress (09 "Egress"): bytes App Servers send to the internet, and pages a CDN answers at the edge.
  // Billed from Seed: before it, the smallest box costs more than every byte the Company sends.
  // Egress optimization moves `upload` and `media` onto an R2-priced Object Storage variant,
  // which reaches the internet at $0 instead of the origin price (09 "Egress", `egress-optimization`).
  const r2 = has(game, 'egress-optimization')
  let egress = 0
  if (game.stage >= 2) {
    for (const node of game.nodes) {
      if (node.type === 'server') {
        const own = nodes[node.id]
        const bytes = own?.resources.networkKbps?.used ?? 0
        // The share of this Node's own traffic that Object Storage serves: its payload rides
        // R2's $0 egress once the Node links to a storage Node.
        const r2Share =
          r2 &&
          own &&
          own.inbound > 0 &&
          (graph.routes.get(node.id) ?? []).some(
            (child) => child.type === 'storage' && child.storeVariant === 'r2',
          )
            ? ((own.traffic.upload ?? 0) + (own.traffic.media ?? 0)) / own.inbound
            : 0
        egress += ((bytes * (1 - r2Share)) / 1_000_000) * EGRESS_ORIGIN
      }
      if (node.type === 'cdn' && !isDown(node)) {
        const rates = pass.arriving[slotOf(pass, node)] ?? {}
        for (const kind of REQUEST_KINDS)
          egress +=
            (((rates[kind] ?? 0) * cdnHitOf(node, kind, game) * PROFILES[kind].payloadKB) /
              1_000_000) *
            EGRESS_CDN
      }
    }
    // Traffic between zones bills both ways: requests at their payload, backend calls at 4 KB.
    for (const index of pass.linkOrder) {
      const { from: source, to: target } = graph.edges[index] as Edge
      const carried = pass.links[index] as Rates
      // Between regions (09 "Egress": $0.02/GB); global Components are reached at no charge.
      const crossRegion = source.region !== target.region && !isGlobal(source) && !isGlobal(target)
      if (!crossRegion && zoneMs(source, target) === 0) continue
      for (const [kind, rate] of Object.entries(carried) as Array<[Kind, number]>) {
        const kb = isBackendKind(kind) ? BACKEND_KB : PROFILES[kind as RequestKind].payloadKB
        egress += crossRegion
          ? ((rate * kb) / 1_000_000) * EGRESS_CROSS_REGION
          : ((rate * kb) / 1_000_000) * EGRESS_CROSS_ZONE * 2
      }
    }
    // A spread Wide-column Store replicates every write across regions (07 "Multi-region data").
    for (const node of game.nodes) {
      if (node.type !== 'wide' || !node.spread || isDown(node)) continue
      const regions = spreadCount(game)
      if (regions <= 1) continue
      const arriving = pass.arriving[slotOf(pass, node)] ?? {}
      const writes =
        (arriving['q-write'] ?? 0) + (arriving['q-tx'] ?? 0) + (arriving['k-write'] ?? 0)
      egress += ((writes * (regions - 1) * SPREAD_REPLICATION_KB) / 1_000_000) * EGRESS_CROSS_REGION
    }
    egress *= eraOf(game).costIndex * ventureOf(game).constraint.egress
  }

  // Object Storage's class (07 "Object Storage"): an infrequent-access object bills a retrieval fee
  // per GB read back. An archive-class read has already failed as a timeout, and bills nothing.
  let retrieval = 0
  for (const node of game.nodes) {
    if (node.type !== 'storage' || isDown(node)) continue
    const fee = STORAGE_CLASSES[node.storageClass].retrieval
    if (fee <= 0) continue
    const reads = pass.arriving[slotOf(pass, node)]?.['blob-get'] ?? 0
    retrieval += ((reads * PROFILES.media.payloadKB) / 1_000_000) * fee * eraOf(game).costIndex
  }

  // Third parties (09 "Third-party fees"): the Payment Provider takes a share of each checkout
  // and a fixed part. Both are real dollars on a real-dollar checkout, so the cost index skips them.
  const checkouts = kinds.buy ? kinds.buy.rate * kinds.buy.success : 0
  const fees =
    checkouts > 0
      ? checkouts *
        (KINDS.buy.value * valueFactor(game, 'buy') * PSP_RATE + PSP_FIXED) *
        (game.nodes.some((node) => node.type === 'psp' && node.provider === 'second')
          ? SECOND_PROVIDER_FEE
          : 1)
      : 0

  // A Data Warehouse bills each scan; the LLM API bills each token (09 "Pricing models").
  let usage = 0
  for (const node of game.nodes) {
    const done = (nodes[node.id]?.inbound ?? 0) - (nodes[node.id]?.dropped ?? 0)
    if (done <= 0 || isDown(node)) continue
    if (node.type === 'warehouse') usage += done * SCAN_PRICE
    if (node.type === 'llm') usage += ((done * TOKENS_PER_PROMPT) / 1_000) * LLM_PRICE
    if (node.type === 'msgp') usage += done * MSGP_PRICE
  }
  const thirdParty = usage > 0 ? fees + usage * eraOf(game).costIndex : fees

  // An API Gateway, a Serverless Function and an Edge Function bill each request on the Requests
  // line (09 "The cloud bill"), × cost index. A function's uses also bill the GB-seconds its
  // executions ran, so a slow call to a data tier shows up on it. An API Gateway is a managed
  // service, so its per-request fee is a real-dollar price and takes no cost index (09
  // "Third-party fees"), unlike the functions beside it.
  let requests = 0
  const index = eraOf(game).costIndex
  const gwAll = gatewayArrivals(game, (node) => pass.arriving[slotOf(pass, node)] ?? {})
  const gwKept = gwAll.node ? gatewayShare(gwAll.node, gwAll.arriving) : 1
  for (const node of game.nodes) {
    if (isDown(node)) continue
    const done = (nodes[node.id]?.inbound ?? 0) - (nodes[node.id]?.dropped ?? 0)
    if (done <= 0) continue
    if (node.type === 'gw') requests += done * gwKept * GATEWAY_PRICE
    if (node.type === 'fn')
      requests += serverlessBurnOf(game, node, done, meanServiceOf(pass, node))
    if (node.type === 'edge') requests += edgeBurnOf(game, node, done)
    // Object Storage bills each read and write at its product's price, and a Queue each task as a
    // message (09 "Base prices").
    if (node.type === 'storage') {
      const arriving = pass.arriving[slotOf(pass, node)] ?? {}
      requests +=
        storageRequestBurnOf(node, arriving['blob-get'] ?? 0, arriving['blob-put'] ?? 0) * index
    }
    if (node.type === 'queue') requests += done * QUEUE_MESSAGE_PRICE * index
  }

  const salaries = payrollOf(game)
  const shares = burnSharesOf(game)
  const totalBurn =
    (thirdParty > 0
      ? game.nodes.reduce((total, node) => total + burnOf(game, node), 0) + thirdParty
      : game.nodes.reduce((total, node) => total + burnOf(game, node), 0)) +
    salaries +
    egress +
    retrieval +
    requests
  return { egress, retrieval, thirdParty, requests, totalBurn, salaries, shares }
}
