import { expect, test } from 'vitest'
import { Option } from 'effect'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { AXES, FAMILIES, FAMILY_IDS, type FamilyId } from '@quorum/simulation/catalog'
import { preseedGame } from '@quorum/simulation/company'
import { initialModel, update } from '@/game/update.ts'
import type { Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { familyAxes, tradeoffCard } from './tradeoff.ts'

const view = (model: Model, h: HtmlBuilder<Message>) => tradeoffCard(model, h)

/** The App Server's card for one instance family, pinned and waiting on its preview. */
const cardOf = (id: FamilyId): Model => {
  const start = initialModel()
  return {
    ...start,
    board: {
      ...start.board,
      game: preseedGame(),
      selected: 'server',
      tradeoff: {
        _tag: 'Pinned',
        nodeId: 'server',
        option: { kind: 'family', id },
        preview: null,
      },
    },
  }
}

test('every instance family reads on the six axes, and each beats a sibling somewhere', () => {
  for (const id of FAMILY_IDS) {
    const axes = familyAxes(id)
    expect(Object.keys(axes).toSorted()).toEqual([...AXES].toSorted())
    for (const axis of AXES) {
      expect(axes[axis], `${id} ${axis}`).toBeGreaterThanOrEqual(1)
      expect(axes[axis], `${id} ${axis}`).toBeLessThanOrEqual(5)
    }
  }
  // Each family's own strength: cheaper per vCPU, roomier RAM, or steady credits.
  expect(familyAxes('compute').throughput).toBeGreaterThan(familyAxes('general').throughput)
  expect(familyAxes('memory').memory).toBeGreaterThan(familyAxes('general').memory)
  expect(familyAxes('general').tail).toBeGreaterThan(familyAxes('burstable').tail)
  // Pillar 2: no family is at least as good as a sibling on all six axes.
  for (const first of FAMILY_IDS)
    for (const second of FAMILY_IDS) {
      if (first === second) continue
      const a = familyAxes(first)
      const b = familyAxes(second)
      expect(
        AXES.every((axis) => a[axis] >= b[axis]),
        `${FAMILIES[first].name} dominates ${FAMILIES[second].name}`,
      ).toBe(false)
    }
})

test('the Tradeoff card draws the radar for an instance family', () => {
  Scene.scene(
    { update, view },
    Scene.given(cardOf('compute')),
    Scene.expect(Scene.selector('svg[aria-label="Six axes: now and with this option"]')).toExist(),
    Scene.expect(Scene.text('Throughput')).toExist(),
    Scene.expect(Scene.text('Operability')).toExist(),
    Scene.tap((simulation) => {
      const polygons = Scene.findAll(
        simulation.html,
        'svg[aria-label="Six axes: now and with this option"] polygon',
      )
      // Five rings, the Design now, and the family.
      expect(polygons).toHaveLength(7)
      const now = Option.getOrThrow(Scene.attr(polygons[5]!, 'points'))
      const next = Option.getOrThrow(Scene.attr(polygons[6]!, 'points'))
      expect(next.split(' ')).toHaveLength(6)
      expect(next).not.toBe(now)
    }),
  )
})
