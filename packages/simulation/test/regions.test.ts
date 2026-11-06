import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { openRegion, place, setRegion } from '../src/actions.ts'
import { regionView } from '../src/regions.ts'
import { freeSandbox } from '../src/sandbox.ts'

const ok = <T>(result: Result.Result<T, unknown>): T => Result.getOrThrow(result)

/** Two Nodes of different kinds, both starting in the home region. */
const twoServices = () => {
  let game = freeSandbox()
  game = ok(openRegion(game, 'eu'))
  game = ok(openRegion(game, 'apac'))
  game = ok(place(game, 'cluster', 100, 100, 'na'))
  game = ok(place(game, 'storage', 300, 100, 'na'))
  const cluster = game.nodes.find((node) => node.type === 'cluster')!
  const storage = game.nodes.find((node) => node.type === 'storage')!
  return { game, cluster, storage }
}

describe('moving Nodes between regions', () => {
  test('two Nodes moved to different regions keep their own region', () => {
    const { game: start, cluster, storage } = twoServices()
    let game = ok(setRegion(start, cluster.id, 'eu'))
    game = ok(setRegion(game, storage.id, 'apac'))

    expect(game.nodes.find((node) => node.id === cluster.id)?.region).toBe('eu')
    expect(game.nodes.find((node) => node.id === storage.id)?.region).toBe('apac')
    // Neither move carried the other Node along.
    expect(game.nodes.find((node) => node.id === cluster.id)?.region).not.toBe('apac')
    expect(game.nodes.find((node) => node.id === storage.id)?.region).not.toBe('eu')
  })

  test('each region tab shows only its own moved Node when nothing links them', () => {
    const { game: start, cluster, storage } = twoServices()
    let game = ok(setRegion(start, cluster.id, 'eu'))
    game = ok(setRegion(game, storage.id, 'apac'))

    const eu = regionView(game, 'eu').nodes.map((node) => node.id)
    const apac = regionView(game, 'apac').nodes.map((node) => node.id)
    expect(eu).toContain(cluster.id)
    expect(eu).not.toContain(storage.id)
    expect(apac).toContain(storage.id)
    expect(apac).not.toContain(cluster.id)
  })
})
