import { expect, test } from 'vitest'
import { PracticeEvent, complete, goals, start, update, type Practice } from './practice.ts'

/* The Practice boards drive the game's own actions: placing, Links, refusals, moving, cutting. */

const run = (p: Practice, ...events: ReadonlyArray<PracticeEvent>): Practice =>
  events.reduce(update, p)

const idOf = (p: Practice, type: string): string => {
  const found = p.game.nodes.find((node) => node.type === type)
  if (!found) throw new Error(`no ${type}`)
  return found.id
}

test('place: arming and clicking spends Cash, and both goals finish the board', () => {
  let p = start('place')
  expect(complete(p)).toBe(false)
  p = run(p, PracticeEvent.Arm({ type: 'server' }), PracticeEvent.Place({ x: 400, y: 120 }))
  expect(p.game.nodes.some((node) => node.type === 'server')).toBe(true)
  expect(p.game.cash).toBeLessThan(300)
  expect(p.placing).toBeNull()
  expect(goals(p).map((goal) => goal.done)).toEqual([true, false])
  p = run(p, PracticeEvent.Arm({ type: 'database' }), PracticeEvent.Place({ x: 400, y: 120 }))
  expect(complete(p)).toBe(true)
  // Placing never lands on a card.
  const [a, b] = p.game.nodes.slice(-2)
  expect(a && b && (a.x !== b.x || a.y !== b.y)).toBe(true)
})

test('place: a part that costs too much is refused with the game text', () => {
  let p = start('place')
  p = { ...p, game: { ...p.game, cash: 10 } }
  p = run(p, PracticeEvent.Arm({ type: 'server' }), PracticeEvent.Place({ x: 300, y: 100 }))
  expect(p.note?.tone).toBe('warn')
  expect(p.note?.text).toMatch(/costs \$/)
  expect(p.game.nodes).toHaveLength(1)
})

test('wire: Links finish the goal; a bad Link shows the game refusal', () => {
  let p = start('wire')
  const [users, server, database, analytics] = ['users', 'server', 'database', 'analytics'].map(
    (type) => idOf(p, type),
  ) as [string, string, string, string]
  p = run(p, PracticeEvent.Link({ from: database, to: users }))
  expect(p.note?.text).toBe('Database sends nothing on. Link it into Analytics to sample it.')
  p = run(
    p,
    PracticeEvent.Link({ from: users, to: server }),
    PracticeEvent.Link({ from: server, to: database }),
  )
  expect(complete(p)).toBe(false)
  p = run(p, PracticeEvent.Link({ from: server, to: analytics }))
  expect(goals(p).map((goal) => goal.done)).toEqual([true, true, true, false, false])
  p = run(p, PracticeEvent.Link({ from: users, to: server }))
  expect(p.note?.text).toBe('Already linked.')
})

test('wire: linking the Load Balancers in a circle shows the loop refusal and finishes the board', () => {
  let p = start('wire')
  const [users, server, database, analytics] = ['users', 'server', 'database', 'analytics'].map(
    (type) => idOf(p, type),
  ) as [string, string, string, string]
  const [first, second] = p.game.nodes
    .filter((node) => node.type === 'lb')
    .map((node) => node.id) as [string, string]
  p = run(
    p,
    PracticeEvent.Link({ from: users, to: server }),
    PracticeEvent.Link({ from: server, to: database }),
    PracticeEvent.Link({ from: server, to: analytics }),
    PracticeEvent.Link({ from: first, to: second }),
  )
  expect(p.note).toBeNull()
  expect(p.loopRefused).toBe(false)
  expect(complete(p)).toBe(false)
  p = run(p, PracticeEvent.Link({ from: second, to: first }))
  expect(p.note?.text).toBe('That link would make a loop.')
  expect(p.game.links).toHaveLength(4)
  expect(goals(p).at(-1)).toEqual({ label: 'Read the loop refusal', done: true })
  expect(complete(p)).toBe(true)
})

test('a Link that closes a circle is refused as a loop', () => {
  // Only Nodes that pass requests on can loop: two Load Balancers, each linked into the other.
  let p = start('place')
  p = { ...p, game: { ...p.game, researched: ['load-balancing'] } }
  p = run(p, PracticeEvent.Arm({ type: 'lb' }), PracticeEvent.Place({ x: 400, y: 100 }))
  p = run(p, PracticeEvent.Arm({ type: 'lb' }), PracticeEvent.Place({ x: 400, y: 500 }))
  const [first, second] = p.game.nodes.filter((node) => node.type === 'lb').map((node) => node.id)
  expect(first && second).toBeTruthy()
  p = run(p, PracticeEvent.Link({ from: first as string, to: second as string }))
  expect(p.note).toBeNull()
  p = run(p, PracticeEvent.Link({ from: second as string, to: first as string }))
  expect(p.note?.text).toBe('That link would make a loop.')
})

test('rearrange: box select, move the group, cut a Link', () => {
  let p = start('rearrange')
  expect(goals(p).map((goal) => goal.done)).toEqual([false, false, false])
  const server = idOf(p, 'server')
  const cache = idOf(p, 'cache')
  p = run(p, PracticeEvent.Box({ ids: [server, cache], mode: 'replace' }))
  expect(p.selection).toEqual([server, cache])
  const before = p.game.nodes.find((node) => node.id === server)
  p = run(
    p,
    PracticeEvent.Move({ nodeId: server, x: (before?.x ?? 0) + 40, y: (before?.y ?? 0) + 200 }),
  )
  const after = p.game.nodes.find((node) => node.id === server)
  expect(after?.y).not.toBe(before?.y)
  expect(goals(p).map((goal) => goal.done)).toEqual([true, true, false])
  p = run(p, PracticeEvent.Unlink({ from: server, to: cache }))
  expect(complete(p)).toBe(true)
  p = run(p, PracticeEvent.Empty())
  expect(p.selection).toEqual([])
})
