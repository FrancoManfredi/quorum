import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { link, node, preseedGame } from '@quorum/simulation/company'
import { normalizeOrdinals } from '@quorum/simulation/labels'
import type { Game } from '@quorum/simulation/state'
import { solveFlow } from '@quorum/simulation/solve'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { sampleNode, type NodeSample } from '@/game/node-metrics.ts'
import { inspector } from './inspector.ts'

const fixture = (evidence: Partial<NodeSample> = {}): Model => {
  const start = initialModel()
  const game: Game = {
    ...preseedGame(),
    time: 30,
    researched: [...preseedGame().researched, 'metrics'],
  }
  const node = game.nodes.find((entry) => entry.id === 'database')!
  const base = sampleNode(game, node, solveFlow(game))
  const before: NodeSample = {
    ...base,
    time: 10,
    inbound: 20,
    utilization: 0.08,
    traffic: { 'q-read': 10, 'q-write': 10 },
    sources: [{ id: 'server', name: 'App Server', ordinal: 1, rate: 20 }],
  }
  const spike: NodeSample = {
    ...base,
    time: 20,
    inbound: 100,
    capacity: 250,
    utilization: 0.4,
    traffic: { 'q-read': 90, 'q-write': 10 },
    sources: [{ id: 'retired-server', name: 'App Server', ordinal: 3, rate: 100 }],
    disk: false,
    swapping: false,
    throttled: false,
    refused: 0,
    limit: 'cpu',
    ...evidence,
  }
  return {
    ...start,
    board: {
      ...start.board,
      game,
      selected: 'database',
      nodeHistory: { database: [before, spike] },
    },
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) => inspector(model, ledgerOf(model), h)

const diskHint =
  'The working set exceeds RAM and reads hit disk. Consider more RAM, caching, or a read replica.'

test('selecting a spike shows its operation rates, deltas, and former source instead of live traffic', () => {
  Scene.scene(
    { update, view },
    Scene.given(fixture()),
    Scene.expect(Scene.text('Live traffic')).toExist(),
    Scene.click(Scene.role('button', { name: 'Earlier sample' })),
    Scene.expect(Scene.text('Recorded sample')).toExist(),
    Scene.expect(Scene.selector('[data-inspector]')).toContainText('90.0/s · 90%'),
    Scene.expect(Scene.selector('[data-inspector]')).toContainText('+80.0/s'),
    Scene.expect(Scene.selector('[data-inspector]')).toContainText('10.0/s · 10%'),
    Scene.expect(Scene.text('App Server 3')).toExist(),
    Scene.click(Scene.role('button', { name: 'Back to live' })),
    Scene.expect(Scene.text('Live traffic')).toExist(),
    Scene.expect(Scene.text('App Server 3')).toBeAbsent(),
  )
})

test('historical disk pressure recommends read mitigation even when the live component is healthy', () => {
  Scene.scene(
    { update, view },
    Scene.given(fixture({ disk: true, limit: 'disk' })),
    Scene.click(Scene.role('button', { name: 'Earlier sample' })),
    Scene.expect(Scene.text(diskHint)).toExist(),
    Scene.click(Scene.role('button', { name: 'Back to live' })),
    Scene.expect(Scene.text(diskHint)).toBeAbsent(),
  )
})

test('the earliest recorded sample has no invented comparison and quiet traffic does not get upgrade advice', () => {
  Scene.scene(
    { update, view },
    Scene.given(fixture()),
    Scene.click(Scene.role('button', { name: 'Earlier sample' })),
    Scene.click(Scene.role('button', { name: 'Earlier sample' })),
    Scene.expect(Scene.text('Recorded sample')).toExist(),
    Scene.expect(Scene.selector('[data-inspector]')).toContainText('10.0/s · 50%'),
    Scene.expect(Scene.selector('[data-inspector]')).not.toContainText('+80.0/s'),
    Scene.expect(Scene.text(diskHint)).toBeAbsent(),
  )
})

/** A Design with one Load Balancer in front of two App Servers. */
const routed = (users = 1_000): Model => {
  const start = initialModel()
  const base = preseedGame()
  const server = base.nodes.find((entry) => entry.type === 'server')!
  const loadBalancer = node('lb-test', 'lb', 360, 280)
  const second = node('server-two', 'server', 600, 40, {
    size: 2,
    runtime: 'php_fpm',
    workers: 16,
  })
  const game: Game = normalizeOrdinals({
    ...base,
    users,
    nodes: [...base.nodes, loadBalancer, second],
    links: [
      link('users', loadBalancer.id),
      link(loadBalancer.id, server.id),
      link(loadBalancer.id, second.id),
      link(server.id, 'database'),
      link(second.id, 'database'),
      link(server.id, 'analytics'),
      link(second.id, 'analytics'),
    ],
  })
  return {
    ...start,
    board: { ...start.board, game, selected: server.id },
  }
}

test('an App Server shows the Load Balancer that routes to it, without a raw Node id', () => {
  Scene.scene(
    { update, view },
    Scene.given(routed()),
    Scene.expect(Scene.text('Inbound')).toExist(),
    Scene.expect(Scene.role('button', { name: 'Open Load Balancer' })).toExist(),
    Scene.expect(Scene.selector('[data-inspector]')).not.toContainText('· server'),
  )
})

test('the inbound route is configuration, not live traffic, so it survives zero demand', () => {
  Scene.scene(
    { update, view },
    Scene.given(routed(0)),
    Scene.expect(Scene.role('button', { name: 'Open Load Balancer' })).toExist(),
  )
})
