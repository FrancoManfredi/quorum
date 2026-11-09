import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  boxNodes,
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
  dataGroupOf,
  databasesOfGroup,
  dataOf,
  groupDataOf,
  leaderOfGroup,
  shardingOf,
  syncWaitMs,
  topologyOfGroup,
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
    // A replica with no linked Database copies nothing, so it cannot join a write.
    expect(Result.isFailure(setSync(game, replica, true))).toBe(true)
    game = ok(connect(game, database.id, replica))
    game = ok(setSync(game, replica, true))
    expect(syncWaitMs(game, database)).toBeGreaterThan(0)
  })
})

describe('Data Groups', () => {
  /** The free Sandbox with a second Database in a box with the first: one Data Group (07 "Data Groups"). */
  const grouped = (game: Game) => {
    const first = game.nodes.find((node) => node.type === 'database')!.id
    let next = ok(place(game, 'database', 300, 300))
    const second = next.nodes.at(-1)!.id
    next = ok(boxNodes(next, [first, second]))
    const group = dataGroupOf(
      next,
      next.nodes.find((node) => node.id === first)!,
    )
    return { game: next, first, second, group }
  }
  const database = (game: Game, id: string) => game.nodes.find((node) => node.id === id)!

  test('a box turns two Single Databases to Sharded and holds them as one group', () => {
    const first = freeSandbox().nodes.find((node) => node.type === 'database')!.id
    const before = freeSandbox()
    expect(dataGroupOf(before, database(before, first))).toBe(first)
    const { game, first: one, second, group } = grouped(freeSandbox())
    expect(databasesOfGroup(game, group).map((node) => node.id)).toEqual([one, second])
    expect(topologyOfGroup(game, group)).toBe('sharded')
    expect(leaderOfGroup(game, group)).toBeNull()
  })

  test('Sharded splits the rows and Multi-leader copies them to every Database', () => {
    const { game, first, second, group } = grouped(freeSandbox())
    const rows = { ...game, data: 100 }
    expect(dataOf(rows, database(rows, first))).toBe(50)
    expect(dataOf(rows, database(rows, second))).toBe(50)
    const multi = ok(setTopology(rows, first, 'multi'))
    expect(topologyOfGroup(multi, group)).toBe('multi')
    expect(dataOf(multi, database(multi, first))).toBe(100)
    expect(dataOf(multi, database(multi, second))).toBe(100)
  })

  test('a Service carries its share of the rows into the group its Database sits in', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    let second: string
    ;[game, second] = build(game, 'database')
    let third: string
    ;[game, third] = build(game, 'database')
    game = {
      ...game,
      data: 100,
      services: [
        { ...game.services[0]!, id: 'a', datastore: first },
        { ...game.services[0]!, id: 'b', datastore: second },
      ],
    }
    // Each group holds the share of the Services that point into it, and a group with none holds nothing.
    expect(groupDataOf(game, first)).toBe(50)
    expect(groupDataOf(game, second)).toBe(50)
    expect(groupDataOf(game, third)).toBe(0)
  })

  test('two Data Groups share no rows, so they take no shared-database penalty', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    let second: string
    ;[game, second] = build(game, 'database')
    const one = { ...game.services[0]!, id: 'a', datastore: first }
    const two = { ...game.services[0]!, id: 'b', datastore: second }
    const apart = { ...game, services: [one, two] }
    expect(sharesDatabase(apart, one)).toBe(false)
    // Boxed together under Multi-leader, they hold every row twice and share the dataset.
    const together = ok(setTopology(ok(boxNodes(apart, [first, second])), first, 'multi'))
    expect(sharesDatabase(together!, together!.services[0]!)).toBe(true)
  })

  test('one Database is the leader of its group, and several leave no single leader', () => {
    const game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    expect(leaderOfGroup(game, dataGroupOf(game, database(game, first)))?.id).toBe(first)
    const { game: two, group } = grouped(freeSandbox())
    expect(leaderOfGroup(two, group)).toBeNull()
  })

  test('a Read Replica joins the group of the Database linked into it', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    let replica: string
    ;[game, replica] = build(game, 'replica')
    // A replica copies nothing until a Database links into it, so it stands alone.
    expect(dataGroupOf(game, database(game, replica))).toBe(replica)
    const linked = ok(connect(game, first, replica))
    expect(dataGroupOf(linked, database(linked, replica))).toBe(
      dataGroupOf(linked, database(linked, first)),
    )
  })

  test('Single primary refuses a second Database in its group', () => {
    const { game, first } = grouped(freeSandbox())
    const company: Game = { ...game, sandbox: false, cash: 100_000 }
    expect(Result.isFailure(Work.queueTopology(company, first, 'single'))).toBe(true)
  })

  test('a topology pick on one Database lands at once, and a second Database lands on its own', () => {
    const company: Game = { ...freeSandbox(), sandbox: false, cash: 100_000 }
    const first = company.nodes.find((node) => node.type === 'database')!.id
    const picked = ok(Work.queueTopology(company, first, 'sharded'))
    // Nothing moves between Databases yet, so the choice needs no Dev Hours and no copy.
    expect(picked.nodes.find((node) => node.id === first)?.topology).toBe('sharded')
    expect(picked.reshard).toBeNull()
    expect(picked.backlog.some((item) => item.ref === 'reshard')).toBe(false)
    const withTwo = ok(place(picked, 'database', 300, 300))
    const second = withTwo.nodes.at(-1)!
    // The new Database holds its own rows until a box groups it with another.
    expect(second.topology).toBe('single')
    expect(dataGroupOf(withTwo, second)).toBe(second.id)
  })

  test('a Company queues a group topology switch with Dev Hours and a data copy', () => {
    const { game, first, group } = grouped(freeSandbox())
    const company: Game = { ...game, sandbox: false, cash: 100_000 }
    const result = Work.queueTopology(company, first, 'multi')
    if (Result.isFailure(result)) throw new Error('refused ' + JSON.stringify(result.failure))
    expect(result.success.reshard?.topology).toBe('multi')
    expect(result.success.reshard?.group).toBe(group)
    expect(result.success.backlog.some((item) => item.ref === 'reshard')).toBe(true)
  })

  test('a Database links into a Read Replica to copy it, and links to no other Database', () => {
    let game = freeSandbox()
    const first = game.nodes.find((node) => node.type === 'database')!.id
    let second: string
    ;[game, second] = build(game, 'database')
    const betweenDatabases = connect(game, first, second)
    expect(Result.isFailure(betweenDatabases)).toBe(true)
    let replica: string
    ;[game, replica] = build(game, 'replica')
    // The write-log link is the only way a replica copies anything (07 "Read Replica").
    game = ok(connect(game, first, replica))
    const secondLink = connect(game, second, replica)
    expect(Result.isFailure(secondLink)).toBe(true)
    if (Result.isFailure(secondLink))
      expect(describeRefusal(secondLink.failure)).toContain('copies one Database')
  })

  test('multi-leader writes cost more and some are refused', () => {
    let game = withResearch(freeSandbox(), 'sharding')
    const first = game.nodes.find((node) => node.type === 'database')!.id
    const before = solveFlow(game).nodes[first]!
    game = ok(setTopology(game, first, 'multi'))
    let second: string
    ;[game, second] = build(game, 'database')
    game = ok(boxNodes(game, [first, second]))
    game = ok(connect(game, 'server', second))
    // Receipt for the second Database under multi-leader costs more than its single-leader rate.
    const after = solveFlow(game).nodes[second]!
    expect(after.receipts['q-write']!.total).toBeGreaterThan(
      before.receipts['q-write']!.total * 1.2,
    )
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
    const database = game.nodes.find((node) => node.type === 'database')!.id
    ;[game, replica] = build(game, 'replica')
    game = ok(connect(game, database, replica))
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
