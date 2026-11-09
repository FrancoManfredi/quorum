import { expect, test } from 'vitest'
import { Refusal } from '@quorum/simulation/actions'
import { RESEARCH } from '@quorum/simulation/catalog'
import { offerOf } from './offer.ts'

test('a locked click offers the Research that unlocks it', () => {
  const offer = offerOf(
    Refusal.Locked({ what: 'Backoff', research: RESEARCH['backoff-jitter'].name }),
  )
  expect(offer).toEqual({ id: 'backoff-jitter', what: 'Backoff' })
})

test('a refusal that is not about a Research leaves no offer', () => {
  expect(offerOf(Refusal.Unaffordable({ what: 'A view', price: 240, currency: 'cash' }))).toBeNull()
})

test('every Research reads back from the name a refusal carries', () => {
  // The offer finds its id by name, so two Research with one name would open the wrong panel.
  const names = new Set(Object.values(RESEARCH).map((entry) => entry.name))
  expect(names.size).toBe(Object.keys(RESEARCH).length)
})
