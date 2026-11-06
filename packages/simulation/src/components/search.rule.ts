import type { GameNode } from '../state.ts'
import {
  DUAL_WRITE_STALE,
  SEARCH_REFRESH,
  SEARCH_QPS,
  SEARCH_FANOUT,
  SEARCH_HEAPS,
  SEARCH_VARIANTS,
} from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, has } from '../lookups.ts'
import { queryFactor } from '../features.ts'
import { through } from '../distribution.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

/** A Search Engine's refresh interval: how fresh its answers are and what indexing costs. */
const refreshOf = (node: GameNode) =>
  SEARCH_REFRESH.find((entry) => entry.seconds === node.refresh) ??
  (SEARCH_REFRESH[0] as (typeof SEARCH_REFRESH)[number])

export const searchRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const variant = SEARCH_VARIANTS[node.searchVariant]
    // Shards parallelize the index and fan every query out; replicas add query capacity; the heap
    // trades garbage collection pauses against the file system cache (07 "Search Engine").
    const shards = variant.jvm ? node.searchShards : 1
    const heap = variant.jvm ? SEARCH_HEAPS[node.heap] : SEARCH_HEAPS.half
    const capacity =
      (SEARCH_QPS *
        flatScale(node) *
        refreshOf(node).capacity *
        variant.capacity *
        (shards / (1 + SEARCH_FANOUT * (shards - 1))) *
        (1 + (variant.jvm ? node.searchReplicas : 0)) *
        heap.capacity) /
      queryFactor(solver.game, 'q-search')
    return {
      ...flatModel(capacity, arriving, { fixed: variant.fixedMs, variable: 2 }, solver.boost(node)),
      tailP: heap.tailP,
      tailMs: heap.tailMs,
    }
  },
  // A slower refresh saves indexing CPU and answers staler: a new document waits to be seen. On
  // top of that, the app's dual write loses now and then: without a Transactional outbox or a CDC
  // Connector, a write's publish can fail and the index keeps the old document (07 "Keeping
  // copies in sync"). The design counts that divergence as stale search results.
  outcome: (answer, node, kind) => {
    const own = through(answer.ownHop(kind))
    if (kind !== 'q-search') return own
    const carried =
      has(answer.game, 'outbox') || answer.game.nodes.some((entry) => entry.type === 'cdc')
    // The copies can only diverge once the app writes to several of them: Series B (07).
    const diverged = carried || answer.game.stage < 4 ? 0 : DUAL_WRITE_STALE
    // Meilisearch's relevance falls as the index grows: its answers drift from what was asked.
    const variant = SEARCH_VARIANTS[node.searchVariant]
    const relevance = Math.min(variant.cap, answer.game.users * variant.relevance)
    return { ...own, stale: Math.max(refreshOf(node).stale, diverged, relevance) }
  },
  ...terminal,
}
