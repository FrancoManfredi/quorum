import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import { NO_DEVICE_LATENCY } from '@quorum/simulation/catalog'
import type { Game, Sample } from '@quorum/simulation/state'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { hud } from './hud.ts'

const sampleOf = (): Sample => ({
  users: 1_050,
  demand: 30,
  served: 28,
  revenue: 0.5,
  burn: 0.2,
  cash: 12_000,
  latency: 80,
  p99: 300,
  apdex: 0.9,
  errors: 0.01,
  slow: null,
  device: NO_DEVICE_LATENCY,
})

const fixture = (game: Partial<Game> = {}): Model => {
  const base = preseedGame()
  const built: Game = {
    ...base,
    time: 1_000,
    history: [sampleOf(), sampleOf(), sampleOf()],
    ...game,
  }
  const start = initialModel()
  return { ...start, board: { ...start.board, game: built } }
}

const topBar = (model: Model, h: HtmlBuilder<Message>) => hud(model, ledgerOf(model), h)

test('the Cash chip names the bridge only while the investors’ offer waits', () => {
  const model = fixture()
  Scene.scene(
    { update, view: topBar },
    Scene.given(model),
    Scene.expect(Scene.text('Bridge offered')).not.toExist(),
    Scene.expect(Scene.text('Out of Cash')).not.toExist(),
  )
})

test('the Cash chip names the bridge once the offer is on the table', () => {
  const model = fixture({
    cash: -2_000,
    bridge: { _tag: 'Offered', grant: 6_000, dilution: 0.08 },
  })
  Scene.scene(
    { update, view: topBar },
    Scene.given(model),
    Scene.expect(Scene.text('Bridge offered')).toExist(),
  )
})
