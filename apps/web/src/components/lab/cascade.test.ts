import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import type { Game, Incident, Postmortem } from '@quorum/simulation/state'
import { initialModel, update } from '@/game/update.ts'
import type { Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { pager, postmortems } from './incidents.ts'

const fixture = (game: Partial<Game> = {}): Model => {
  const base = preseedGame()
  const start = initialModel()
  return { ...start, board: { ...start.board, game: { ...base, time: 1_000, ...game } } }
}

/** A retry storm the director did not pick: a slow query nobody answered started it. */
const cascaded: Incident = {
  kind: 'retry-storm',
  remaining: 30,
  nodeId: 'database',
  startedAt: 990,
  baseline: 1,
  usersAtStart: 1_000,
  impaired: 0,
  lostRevenue: 0,
  failed: 0,
  phase: { _tag: 'Announced', signalAt: 992 },
  severity: 2,
  magnitude: 3,
  zone: null,
  region: null,
  service: null,
  causedBy: 'slow-query',
}

test('the pager names the incident a cascade followed, and that it was left alone', () => {
  const model = fixture({
    researched: [...new Set([...preseedGame().researched, 'alerting' as const])],
    incident: cascaded,
  })
  Scene.scene(
    { update, view: (m: Model, h: HtmlBuilder<Message>) => pager(m, h) },
    Scene.given(model),
    Scene.expect(Scene.text('After')).toExist(),
    Scene.expect(Scene.text('Slow query')).toExist(),
    Scene.expect(Scene.text('left alone')).toExist(),
  )
})

test('the postmortem says what it followed', () => {
  const postmortem: Postmortem = {
    id: 1,
    kind: 'retry-storm',
    target: 'Database',
    duration: 90,
    mttr: 42,
    mttd: 3,
    mtta: 8,
    lostUsers: 1_200,
    lostRevenue: 5_000,
    failed: 800,
    action: null,
    severity: 2,
    endedAt: 940,
    causedBy: 'slow-query',
  }
  Scene.scene(
    { update, view: (m: Model, h: HtmlBuilder<Message>) => postmortems(m, h) },
    Scene.given(fixture({ postmortems: [postmortem] })),
    Scene.expect(Scene.text('Followed Slow query, which was left alone.')).toExist(),
  )
})

test('an incident the director picked shows no chain', () => {
  // The pager renders only when a rule fires, so a stale alarm keeps it on screen.
  const model = fixture({
    researched: [...new Set([...preseedGame().researched, 'alerting' as const])],
    incident: { ...cascaded, causedBy: null },
    alarms: { errors: 60, latency: 0, saturation: 0, queue: 0, budget: 0 },
  })
  Scene.scene(
    { update, view: (m: Model, h: HtmlBuilder<Message>) => pager(m, h) },
    Scene.given(model),
    Scene.expect(Scene.text('left alone')).toBeAbsent(),
  )
})
