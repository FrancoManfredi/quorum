import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { preseedGame } from '@quorum/simulation/company'
import type { Game, Incident } from '@quorum/simulation/state'
import { initialModel, update } from '@/game/update.ts'
import type { Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { alertsNotice, incidentNotice, researchOffer } from './incidents.ts'

const fixture = (game: Partial<Game> = {}, board: Partial<Model['board']> = {}): Model => {
  const base = preseedGame()
  const start = initialModel()
  return {
    ...start,
    board: {
      ...start.board,
      ...board,
      game: {
        ...base,
        time: 1_000,
        researched: [...new Set([...base.researched, 'alerting' as const])],
        ...game,
      },
    },
  }
}

/** A retry storm nobody answered: it is the second page, and the bar says so. */
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

const incidentBar = (m: Model, h: HtmlBuilder<Message>) => incidentNotice(m, h)
const alertChip = (m: Model, h: HtmlBuilder<Message>) => alertsNotice(m, h)

test('the incident bar names the incident it followed, and that it was left alone', () => {
  Scene.scene(
    { update, view: incidentBar },
    Scene.given(fixture({ incident: cascaded })),
    Scene.expect(Scene.text('Followed Slow query, which was left alone.')).toExist(),
  )
})

test('an incident the director picked shows no chain', () => {
  Scene.scene(
    { update, view: incidentBar },
    Scene.given(fixture({ incident: { ...cascaded, causedBy: null } })),
    Scene.expect(Scene.text('Followed Slow query, which was left alone.')).toBeAbsent(),
  )
})

test('two firing rules are one chip that counts them', () => {
  const model = fixture({
    alarms: { errors: 60, latency: 60, saturation: 0, queue: 0, budget: 0 },
  })
  Scene.scene(
    { update, view: alertChip },
    Scene.given(model),
    Scene.expect(Scene.text('2 alerts firing')).toExist(),
    Scene.expect(Scene.text('Error rate above 1% and 1 more')).toExist(),
    Scene.expect(Scene.text('Alerts')).toExist(),
  )
})

test('an acknowledged rule folds to a count until it clears', () => {
  const model = fixture(
    { alarms: { errors: 60, latency: 60, saturation: 0, queue: 0, budget: 0 } },
    { alertQuiet: ['errors', 'latency'] },
  )
  Scene.scene(
    { update, view: alertChip },
    Scene.given(model),
    Scene.expect(Scene.text('2 alerts firing')).toExist(),
    Scene.expect(Scene.text('Error rate above 1% and 1 more')).toBeAbsent(),
    Scene.expect(Scene.text('Alerts')).toExist(),
  )
})

test('a rule the team has stopped trusting asks for a threshold, not a page', () => {
  const model = fixture({ falseAlarms: { ...preseedGame().falseAlarms, errors: 5 } })
  Scene.scene(
    { update, view: alertChip },
    Scene.given(model),
    Scene.expect(Scene.text('1 rule ignored')).toExist(),
    Scene.expect(Scene.text('Ignored')).toExist(),
    Scene.expect(Scene.text('Alerts')).toExist(),
  )
})

test('a locked click leaves an offer that names the price and opens the Research', () => {
  const model = fixture({}, { researchOffer: { id: 'backoff-jitter', what: 'Backoff' } })
  Scene.scene(
    { update, view: (m: Model, h: HtmlBuilder<Message>) => h.div([], [researchOffer(m, h)]) },
    Scene.given(model),
    // The slip reads as a work order: what was blocked, then the Research that unblocks it.
    Scene.expect(Scene.text('Locked · Backoff')).toExist(),
    Scene.expect(Scene.text('Backoff with jitter')).toExist(),
    Scene.expect(
      Scene.selector('[aria-label="Backoff needs the Backoff with jitter Research."]'),
    ).toExist(),
    Scene.expect(Scene.role('button', { name: 'Research' })).toExist(),
    Scene.expect(Scene.role('button', { name: 'Dismiss' })).toExist(),
  )
})

test('an offer for a Research the player owns is gone', () => {
  const owned = fixture(
    { researched: [...new Set([...preseedGame().researched, 'backoff-jitter' as const])] },
    { researchOffer: { id: 'backoff-jitter', what: 'Backoff' } },
  )
  Scene.scene(
    { update, view: (m: Model, h: HtmlBuilder<Message>) => h.div([], [researchOffer(m, h)]) },
    Scene.given(owned),
    Scene.expect(Scene.text('Backoff with jitter')).toBeAbsent(),
  )
})
