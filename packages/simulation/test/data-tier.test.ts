import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  connect,
  place,
  setCdnOptions,
  setPolicy,
  setSearchOptions,
  setShardKey,
  setShards,
  setSticky,
  setStoreVariant,
  setSync,
} from '../src/actions.ts'
import { shardingOf, syncWaitMs } from '../src/lookups.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import type { Game } from '../src/state.ts'

/* The options of the data tier and the edge (05, 07): each one changes what the Ledger reads. */

const ok = (result: Result.Result<Game, unknown>): Game => {
  if (Result.isFailure(result)) throw new Error('refused ' + JSON.stringify(result.failure))
  return result.success
}

const build = (game: Game, type: Parameters<typeof place>[1]): [Game, string] => {
  const next = ok(place(game, type, 300, 300))
  return [next, next.nodes.at(-1)!.id]
}

const withResearch = (game: Game, ...ids: Array<Game['researched'][number]>): Game => ({
  ...game,
  researched: [...game.researched, ...ids],
})

describe('sticky sessions', () => {
  test('a sticky Load Balancer unbalances its targets toward the oldest copy', () => {
    let game = freeSandbox()
    let lb: string
    ;[game, lb] = build(game, 'lb')
    let second: string
    ;[game, second] = build(game, 'server')
    game = {
      ...game,
      links: game.links.filter((link) => !(link.from === 'users' && link.to === 'server')),
    }
    game = ok(connect(game, 'users', lb))
    game = ok(connect(game, lb, 'server'))
    game = ok(connect(game, lb, second))
    game = ok(setPolicy(game, lb, 'round-robin'))
    const even = solveFlow(game)
    const sticky = solveFlow(ok(setSticky(game, lb, true)))
    const first = (ledger: typeof even) => ledger.nodes.server?.inbound ?? 0
    const other = (ledger: typeof even) => ledger.nodes[second]?.inbound ?? 0
    expect(Math.abs(first(even) - other(even))).toBeLessThan(first(even) * 0.01)
    expect(first(sticky)).toBeGreaterThan(other(sticky))
  })
})

describe('sharding', () => {
  test('a range key sends more of the writes to its busiest shard than a hash key', () => {
    let game = withResearch(freeSandbox(), 'sharding')
    const database = game.nodes.find((node) => node.type === 'database')!
    game = ok(setShards(game, database.id, 4))
    const hash = shardingOf(game.nodes.find((node) => node.id === database.id)!)
    game = ok(setShardKey(game, database.id, 'range'))
    const range = shardingOf(game.nodes.find((node) => node.id === database.id)!)
    expect(range.hot).toBeGreaterThan(hash.hot)
    expect(range.cross).toBeGreaterThanOrEqual(hash.cross)
    game = ok(setShardKey(game, database.id, 'tenant'))
    expect(shardingOf(game.nodes.find((node) => node.id === database.id)!).cross).toBeLessThan(
      hash.cross,
    )
  })
})

describe('synchronous replicas', () => {
  test('every write waits for the replica', () => {
    let game = withResearch(freeSandbox(), 'replication', 'sync-replication')
    const database = game.nodes.find((node) => node.type === 'database')!
    let replica: string
    ;[game, replica] = build(game, 'replica')
    expect(syncWaitMs(game, database)).toBe(0)
    game = ok(setSync(game, replica, true))
    expect(syncWaitMs(game, database)).toBeGreaterThan(0)
  })
})

describe('Search Engine and Object Storage products', () => {
  test('Meilisearch takes no shards and answers more queries', () => {
    let game = freeSandbox()
    let search: string
    ;[game, search] = build(game, 'search')
    expect(
      Result.isFailure(
        setSearchOptions(game, search, { searchShards: 2, searchVariant: 'meilisearch' }),
      ),
    ).toBe(true)
    expect(Result.isSuccess(setSearchOptions(game, search, { searchShards: 2 }))).toBe(true)
  })

  test('Object Storage can be R2', () => {
    let game = freeSandbox()
    let store: string
    ;[game, store] = build(game, 'storage')
    game = ok(setStoreVariant(game, store, 'r2'))
    expect(game.nodes.find((entry) => entry.id === store)!.storeVariant).toBe('r2')
  })

  test('a CDN keeps a cache key and a purge setting', () => {
    let game = freeSandbox()
    let cdn: string
    ;[game, cdn] = build(game, 'cdn')
    game = ok(setCdnOptions(game, cdn, { purge: true, cacheKey: 'path' }))
    const node = game.nodes.find((entry) => entry.id === cdn)!
    expect(node.purge).toBe(true)
    expect(node.cacheKey).toBe('path')
  })
})

describe('a Connection Pooler', () => {
  test('pools to one host, and a Load Balancer after it spreads the reads', () => {
    let game = withResearch(freeSandbox(), 'replication', 'pooling', 'load-balancing')
    let pooler: string, lb: string, database: string, first: string, second: string
    ;[game, pooler] = build(game, 'pooler')
    ;[game, lb] = build(game, 'lb')
    ;[game, database] = build(game, 'database')
    ;[game, first] = build(game, 'replica')
    ;[game, second] = build(game, 'replica')
    game = ok(connect(game, 'server', pooler))
    game = ok(connect(game, pooler, lb))
    expect(Result.isFailure(connect(game, pooler, database))).toBe(true)
    for (const to of [database, first, second]) game = ok(connect(game, lb, to))
    const ledger = solveFlow(game)
    const reads = (id: string) => ledger.nodes[id]?.traffic['q-read'] ?? 0
    expect(reads(first)).toBeGreaterThan(0)
    expect(reads(first)).toBeCloseTo(reads(second))
    expect(reads(database)).toBeCloseTo(reads(first))
  })
})
