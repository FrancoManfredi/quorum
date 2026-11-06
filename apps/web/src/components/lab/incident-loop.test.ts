import { expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import { NO_DEVICE_LATENCY, type ResearchId } from '@quorum/simulation/catalog'
import { slaCreditsOf } from '@quorum/simulation/slo'
import { DEFAULT_FOUNDING, type Game, type Postmortem, type Sample } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { initialModel, update } from '@/game/update.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { hud } from './hud.ts'
import { postmortems } from './incidents.ts'

/* ==========================================================================
   The incident loop on screen, outside the Dashboard: the postmortem card's
   three times (11 "Postmortems") and the SLA credit the HUD names beside the
   runway (11 "SLA credits", 15 "Company and Incidents panels").
   ========================================================================== */

/** One Sample, as the Simulation writes one per sim second. */
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

const cards = (model: Model, h: HtmlBuilder<Message>) => postmortems(model, h)
const topBar = (model: Model, h: HtmlBuilder<Message>) => hud(model, ledgerOf(model), h)

const postmortem = (over: Partial<Postmortem>): Postmortem => ({
  id: 1,
  kind: 'instance',
  target: 'App Server',
  duration: 90,
  mttr: 42,
  mttd: 3,
  mtta: 8,
  lostUsers: 1_200,
  lostRevenue: 5_000,
  failed: 800,
  action: null,
  severity: 3,
  endedAt: 940,
  causedBy: null,
  ...over,
})

test('a postmortem card names MTTD and MTTA beside MTTR, a dash when the Game has none', () => {
  const model = fixture({
    postmortems: [postmortem({ id: 1 }), postmortem({ id: 2, mttd: null, mtta: null })],
  })
  Scene.scene(
    { update, view: cards },
    Scene.given(model),
    Scene.expect(Scene.text('MTTD')).toExist(),
    Scene.expect(Scene.text('MTTA')).toExist(),
    Scene.expect(Scene.text('MTTR')).toExist(),
    // The run detected 3 minutes in and answered 8 later, and restored 42 minutes in.
    Scene.expect(Scene.text('3m')).toExist(),
    Scene.expect(Scene.text('8m')).toExist(),
    Scene.expect(Scene.text('42m')).toExist(),
    // The card from a save before the fields keeps its MTTR and dashes the other two.
    Scene.expect(Scene.text('—')).toExist(),
  )
})

test('the HUD names the SLA credit beside the runway while a week misses its SLO', () => {
  const base = preseedGame()
  const model = fixture({
    stage: 4,
    founding: { ...DEFAULT_FOUNDING, venture: 'b2b-saas' },
    researched: [...new Set<ResearchId>([...base.researched, 'enterprise-sales'])],
    shipped: ['paid-plans'],
    budget: [{ hour: 0, requests: 10_000, failed: 500, users: base.users }],
  })
  const credit = slaCreditsOf(model.board.game, ledgerOf(model))
  expect(credit).toBeGreaterThan(0)
  Scene.scene(
    { update, view: topBar },
    Scene.given(model),
    Scene.expect(Scene.text('SLA')).toExist(),
    Scene.expect(Scene.text(`−${money(credit)}/s`)).toExist(),
  )
})

test('a Company without the research pays no credit, so the HUD names none', () => {
  const base = preseedGame()
  const model = fixture({
    stage: 4,
    founding: { ...DEFAULT_FOUNDING, venture: 'b2b-saas' },
    researched: base.researched,
    shipped: ['paid-plans'],
    budget: [{ hour: 0, requests: 10_000, failed: 500, users: base.users }],
  })
  expect(slaCreditsOf(model.board.game, ledgerOf(model))).toBe(0)
  Scene.scene(
    { update, view: topBar },
    Scene.given(model),
    Scene.expect(Scene.text('SLA')).toBeAbsent(),
  )
})
