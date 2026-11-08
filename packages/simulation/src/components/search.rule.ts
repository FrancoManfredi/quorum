import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode, SearchHeap, SearchVariant } from '../state.ts'
import {
  SEARCH_REPLICAS,
  SEARCH_SHARDS,
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
      ...flatModel(
        capacity,
        arriving,
        { fixedMs: variant.fixedMs, variableMs: 2 },
        solver.boost(node),
      ),
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

/**
 * A Search Engine's product, shards, replicas, and heap (07 "Search Engine"). Meilisearch runs one
 * node: it takes no shards, replicas, or heap.
 */
export const setSearchOptions = (
  game: Game,
  id: string,
  change: Readonly<{
    searchVariant?: SearchVariant
    searchShards?: number
    searchReplicas?: number
    heap?: SearchHeap
  }>,
): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'search') return notAllowed('Only a Search Engine has these.')
    if (change.searchVariant !== undefined && SEARCH_VARIANTS[change.searchVariant] === undefined)
      return notAllowed(`Search products are ${Object.keys(SEARCH_VARIANTS).join(', ')}.`)
    if (
      change.searchShards !== undefined &&
      !(SEARCH_SHARDS as ReadonlyArray<number>).includes(change.searchShards)
    )
      return notAllowed(`Shard counts are ${SEARCH_SHARDS.join(', ')}.`)
    if (
      change.searchReplicas !== undefined &&
      !(SEARCH_REPLICAS as ReadonlyArray<number>).includes(change.searchReplicas)
    )
      return notAllowed(`Replica counts are ${SEARCH_REPLICAS.join(', ')}.`)
    if (change.heap !== undefined && SEARCH_HEAPS[change.heap] === undefined)
      return notAllowed(`Heaps are ${Object.keys(SEARCH_HEAPS).join(', ')}.`)
    const next = { ...node, ...change }
    if (
      !SEARCH_VARIANTS[next.searchVariant].jvm &&
      (next.searchShards !== 1 || next.searchReplicas !== 0 || next.heap !== 'half')
    )
      return notAllowed('Meilisearch runs one node: no shards, replicas, or heap.')
    return ok(patch(game, id, change))
  })

/**
 * Picks a Search Engine's refresh interval (07 "Search Engine"): a longer interval saves indexing
 * CPU, so the Node answers more queries and a bigger share of its answers are staler.
 */
export const setSearchRefresh = (game: Game, id: string, refresh: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'search') return notAllowed('Only a Search Engine has a refresh interval.')
    if (!SEARCH_REFRESH.some((entry) => entry.seconds === refresh))
      return notAllowed(
        `Refresh intervals are ${SEARCH_REFRESH.map((entry) => entry.seconds).join(', ')} s.`,
      )
    return ok(node.refresh === refresh ? game : patch(game, id, { refresh }))
  })
