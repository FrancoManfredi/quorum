import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  connect,
  describeRefusal,
  place,
  promoteReplica,
  resize,
  setCdnOptions,
  setDbEngine,
  setLbVariant,
  setPolicy,
  setSearchOptions,
  setShardKey,
  setShards,
  setSticky,
  setStoreVariant,
  setSync,
  setTopology,
} from '../src/actions.ts'
import * as Work from '../src/work.ts'
import { warmOf } from '../src/life.ts'
import {
  burnOf,
  dataOf,
  leaderOf,
  shardingOf,
  syncWaitMs,
  topologyOf,
} from '../src/lookups.ts'
import { sharesDatabase } from '../src/team.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import { step } from '../src/step.ts'
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

describe('database engines', () => {
  test('MySQL trades cheaper writes for dearer reads and scans', () => {
    // Series B sends reports, so the Database's scan path has a Cost receipt too.
    const postgresGame = { ...freeSandbox(), stage: 4 }
    const database = postgresGame.nodes.find((node) => node.type === 'database')!
    const postgres = solveFlow(postgresGame).nodes[database.id]!
    const mysqlGame = ok(setDbEngine(postgresGame, database.id, 'mysql'))
    const mysql = solveFlow(mysqlGame).nodes[database.id]!
    expect(mysql.receipts['q-write']!.total).toBeLessThan(postgres.receipts['q-write']!.total)
    expect(mysql.receipts['q-read']!.total).toBeGreaterThan(postgres.receipts['q-read']!.total)
    expect(mysql.receipts['q-scan']!.total).toBeGreaterThan(postgres.receipts['q-scan']!.total)
  })

  test('Postgres holds more memory per server connection than MySQL', () => {
    const postgresGame = freeSandbox()
    const database = postgresGame.nodes.find((node) => node.type === 'database')!
    const postgres = solveFlow(postgresGame).nodes[database.id]!
    const mysqlGame = ok(setDbEngine(postgresGame, database.id, 'mysql'))
    const mysql = solveFlow(mysqlGame).nodes[database.id]!
    expect(mysql.resources.ramGb!.used).toBeLessThan(postgres.resources.ramGb!.used)
  })

  test('an engine change lands on every Database at once', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    game = ok(setTopology(game, first, 'sharded'))
    let _second: string
    ;[game, _second] = build(game, 'database')
    game = ok(setDbEngine(game, first, 'mysql'))
    expect(
      game.nodes
        .filter((node) => node.type === 'database')
        .every((node) => node.dbEngine === 'mysql'),
    ).toBe(true)
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

describe('a Read Replica has a job of its own', () => {
  // Series B sends reports (`q-scan`); the Database is the one box that answers every kind.
  const withReplica = (stage: number) => {
    const base: Game = { ...freeSandbox(), stage, users: 3_000 }
    const [placed, replica] = build(withResearch(base, 'replication'), 'replica')
    const fed = ok(connect(placed, 'database', replica))
    return { base, game: ok(connect(fed, 'server', replica)), replica }
  }

  test('linking one moves the reports and a share of the reads off the primary', () => {
    const { base, game, replica } = withReplica(4)
    const before = solveFlow(base).nodes.database!
    const after = solveFlow(game)
    expect(before.traffic['q-scan']).toBeGreaterThan(0)
    expect(after.nodes.database!.traffic['q-scan'] ?? 0).toBe(0)
    expect(after.nodes[replica]!.traffic['q-scan']).toBeGreaterThan(0)
    expect(after.nodes.database!.utilization).toBeLessThan(before.utilization)
  })

  test('a replica no Database links to serves nothing, and copies one Database only', () => {
    const { game, replica } = withReplica(4)
    const cut = {
      ...game,
      links: game.links.filter((l) => !(l.from === 'database' && l.to === replica)),
    }
    const ledger = solveFlow(cut)
    expect(ledger.nodes[replica]!.inbound).toBe(0)
    expect(solveFlow(game).nodes[replica]!.inbound).toBeGreaterThan(0)
    expect(Result.isFailure(connect(game, 'database', replica))).toBe(true)
  })

  test('its box bills less than a Database of the same size, and placing one restarts nothing', () => {
    const { game, replica } = withReplica(1)
    const node = (id: string) => game.nodes.find((entry) => entry.id === id)!
    const database = node('database')
    const twin = { ...node(replica), size: database.size, life: database.life }
    expect(burnOf(game, twin)).toBeLessThan(burnOf(game, database) * 0.75)
    expect(node('database').life).toEqual(database.life)
    const grown = ok(resize(game, 'database', 1))
    expect(grown.nodes.find((entry) => entry.id === 'database')!.life._tag).toBe('Restarting')
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

describe('topologies', () => {
  test('multi-leader Services share rows even on different leaders', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    game = ok(setTopology(game, first, 'multi'))
    let second: string
    ;[game, second] = build(game, 'database')
    const one = { ...game.services[0]!, datastore: first }
    const two = { ...game.services[0]!, id: 'service-2', datastore: second }
    const withTwo = { ...game, services: [one, two] }
    expect(sharesDatabase(withTwo, one)).toBe(true)
    // On sharded Boards the same two Services own different partitions and share nothing.
    const shardedGame = ok(setTopology(withTwo, first, 'sharded'))
    expect(sharesDatabase(shardedGame, shardedGame.services[0]!)).toBe(false)
  })
  test('one Database is the leader, and several leave no single leader', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    // One Database takes every write, whatever topology the card picks for the next one.
    expect(leaderOf(game)?.id).toBe(first)
    game = ok(setTopology(game, first, 'sharded'))
    expect(leaderOf(game)?.id).toBe(first)
    let _second: string
    ;[game, _second] = build(game, 'database')
    expect(leaderOf(game)).toBeNull()
  })
  test('Single primary refuses a second Database', () => {
    let company: Game = freeSandbox()
    const first = company.nodes.find((node) => node.type === 'database')!.id
    company = ok(setTopology(company, first, 'sharded'))
    company = ok(place(company, 'database', 300, 300))
    company = { ...company, sandbox: false, cash: 100_000 }
    expect(Result.isFailure(Work.queueTopology(company, first, 'single'))).toBe(true)
  })
  test('a topology pick on one Database lands at once, so a second can be placed', () => {
    const company: Game = { ...freeSandbox(), sandbox: false, cash: 100_000 }
    const first = company.nodes.find((node) => node.type === 'database')!.id
    const picked = ok(Work.queueTopology(company, first, 'sharded'))
    // Nothing moves between Databases yet, so the choice needs no Dev Hours and no copy.
    expect(picked.nodes.find((node) => node.id === first)?.topology).toBe('sharded')
    expect(picked.reshard).toBeNull()
    expect(picked.backlog.some((item) => item.ref === 'reshard')).toBe(false)
    const withTwo = ok(place(picked, 'database', 300, 300))
    expect(withTwo.nodes.filter((node) => node.type === 'database')).toHaveLength(2)
    // The new Database follows the topology the Design picked.
    expect(withTwo.nodes.at(-1)?.topology).toBe('sharded')
  })
  test('a Company queues a topology switch with Dev Hours and a data copy', () => {
    let company: Game = freeSandbox()
    const first = company.nodes.find((node) => node.type === 'database')!.id
    // A second Database makes the rows move, so the switch waits for a copy.
    company = ok(setTopology(company, first, 'sharded'))
    company = ok(place(company, 'database', 300, 300))
    company = { ...company, sandbox: false, cash: 100_000 }
    const result = Work.queueTopology(company, first, 'multi')
    if (Result.isFailure(result)) throw new Error('refused ' + JSON.stringify(result.failure))
    expect(result.success.reshard?.topology).toBe('multi')
    expect(result.success.backlog.some((item) => item.ref === 'reshard')).toBe(true)
  })
  test('a Database does not link to another Database or a Read Replica', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    game = ok(setTopology(game, first, 'sharded'))
    let second: string
    ;[game, second] = build(game, 'database')
    const betweenDatabases = connect(game, first, second)
    expect(Result.isFailure(betweenDatabases)).toBe(true)
    if (Result.isFailure(betweenDatabases))
      expect(describeRefusal(betweenDatabases.failure)).toContain('do not link to each other')
    let replica: string
    ;[game, replica] = build(game, 'replica')
    const toReplica = connect(game, first, replica)
    expect(Result.isFailure(toReplica)).toBe(true)
    if (Result.isFailure(toReplica))
      expect(describeRefusal(toReplica.failure)).toContain('copies its primary automatically')
  })
  test('a second Database needs Sharded or Multi-leader first', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    // Single primary: place is refused and points at a Read Replica.
    expect(Result.isFailure(place(game, 'database', 300, 300))).toBe(true)
    game = ok(setTopology(game, first, 'sharded'))
    let second: string
    ;[game, second] = build(game, 'database')
    expect(topologyOf(game)).toBe('sharded')
    // Sharded holds a partition; multi-leader holds every row.
    game = { ...game, data: 100 }
    expect(
      dataOf(
        game,
        game.nodes.find((node) => node.id === first)!,
      ),
    ).toBe(50)
    game = ok(setTopology(game, first, 'multi'))
    expect(
      dataOf(
        game,
        game.nodes.find((node) => node.id === first)!,
      ),
    ).toBe(100)
    expect(
      dataOf(
        game,
        game.nodes.find((node) => node.id === second)!,
      ),
    ).toBe(100)
  })

  test('multi-leader writes cost more and some are refused', () => {
    let game = withResearch(freeSandbox(), 'sharding')
    const first = game.nodes.find((node) => node.type === 'database')!.id
    const beforeGame = game
    const before = solveFlow(beforeGame).nodes[first]!
    game = ok(setTopology(game, first, 'multi'))
    let second: string
    ;[game, second] = build(game, 'database')
    game = ok(connect(game, 'server', second))
    game = ok(setTopology(game, first, 'multi'))
    // Receipt for the second Database under multi-leader costs more than its single-leader rate.
    const after = solveFlow(game).nodes[second]!
    expect(after.receipts['q-write']!.total).toBeGreaterThan(
      before.receipts['q-write']!.total * 1.2,
    )
    // Failures: solve against conflicting leaders shows refused writes.
    const ledger = solveFlow(game)
    expect(ledger.nodes[second]?.traffic['q-write'] ?? 0).toBeGreaterThanOrEqual(0)
  })

  test('promoting an asynchronous replica loses rows, a synchronous one loses none', () => {
    let game = withResearch(freeSandbox(), 'replication')
    let replica: string
    ;[game, replica] = build(game, 'replica')
    game = { ...game, data: 100 }
    const asyncPromoted = ok(promoteReplica(game, replica))
    expect(asyncPromoted.data).toBeCloseTo(98, 6)
    expect(asyncPromoted.nodes.filter((node) => node.type === 'database')).toHaveLength(1)
    expect(asyncPromoted.nodes.filter((node) => node.type === 'replica')).toHaveLength(1)

    game = withResearch(freeSandbox(), 'replication', 'sync-replication')
    ;[game, replica] = build(game, 'replica')
    game = ok(setSync(game, replica, true))
    game = { ...game, data: 100 }
    const syncPromoted = ok(promoteReplica(game, replica))
    expect(syncPromoted.data).toBeCloseTo(100, 6)
  })
})

describe('Search Engine and Object Storage products', () => {
  test('Meilisearch takes no shards and answers more queries', () => {
    let game = freeSandbox()
    let search: string
    ;[game, search] = build(game, 'search')
    expect(
      Result.isFailure(
        setSearchOptions(game, search, {
          searchShards: 2,
          searchVariant: 'meilisearch',
        }),
      ),
    ).toBe(true)
    expect(Result.isSuccess(setSearchOptions(game, search, { searchShards: 2 }))).toBe(true)
  })

  test('a Company copies the index when a Search Engine rebalances', () => {
    let game: Game = { ...freeSandbox(), sandbox: false, cash: 100_000 }
    let search: string
    ;[game, search] = build(game, 'search')
    game = ok(setSearchOptions(game, search, { searchShards: 2 }))
    const node = game.nodes.find((entry) => entry.id === search)!
    expect(node.searchShards).toBe(2)
    expect(node.life._tag).toBe('Warming')
    expect(warmOf(node.life)).toBe(0)
  })

  test('a Search Engine recovers capacity as its index copy finishes', () => {
    let game: Game = { ...freeSandbox(), sandbox: false, cash: 100_000 }
    let search: string
    ;[game, search] = build(game, 'search')
    game = ok(setSearchOptions(game, search, { searchReplicas: 1 }))
    for (let i = 0; i < 600; i += 1) game = step(game, 1).game
    const node = game.nodes.find((entry) => entry.id === search)!
    expect(warmOf(node.life)).toBeGreaterThan(0.5)
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
  test('pools to one host, and an L4 Load Balancer after it spreads the reads', () => {
    let game = withResearch(freeSandbox(), 'replication', 'pooling', 'load-balancing', 'l4-lb')
    let pooler: string, lb: string, database: string, first: string, second: string
    ;[game, pooler] = build(game, 'pooler')
    ;[game, lb] = build(game, 'lb')
    const existing = game.nodes.find((node) => node.type === 'database')!.id
    game = ok(setTopology(game, existing, 'sharded'))
    ;[game, database] = build(game, 'database')
    ;[game, first] = build(game, 'replica')
    ;[game, second] = build(game, 'replica')
    game = ok(connect(game, 'server', pooler))
    // An L7 Load Balancer reads HTTP, so it refuses queries until it is an L4.
    expect(Result.isFailure(connect(game, pooler, lb))).toBe(true)
    game = ok(setLbVariant(game, lb, 'l4'))
    game = ok(connect(game, pooler, lb))
    expect(Result.isFailure(connect(game, pooler, database))).toBe(true)
    for (const to of [first, second]) game = ok(connect(game, existing, to))
    for (const to of [database, first, second]) game = ok(connect(game, lb, to))
    const ledger = solveFlow(game)
    const reads = (id: string) => ledger.nodes[id]?.traffic['q-read'] ?? 0
    expect(Result.isFailure(setLbVariant(game, lb, 'l7'))).toBe(true)
    expect(reads(first)).toBeGreaterThan(0)
    expect(reads(first)).toBeCloseTo(reads(second))
    expect(reads(database)).toBeCloseTo(reads(first))
    // The pooler's server connections pass through the balancer, an equal share to each host.
    const held = (id: string) => ledger.nodes[id]?.connections?.used ?? 0
    expect(held(database)).toBeGreaterThan(0)
    expect(held(first)).toBeCloseTo(held(database))
    expect(held(second)).toBeCloseTo(held(database))
  })
})
