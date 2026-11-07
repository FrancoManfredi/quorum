import { test } from 'vitest'
import { Result } from 'effect'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { FEATURE_IDS } from '@quorum/simulation/catalog'
import { preseedGame } from '@quorum/simulation/company'
import { queueFeature } from '@quorum/simulation/work'
import { initialModel, update } from '@/game/update.ts'
import type { Model } from '@/game/model.ts'
import type { Message } from '@/game/message.ts'
import { teamPanel } from './team.ts'

/* The Team panel's Rush action (08 "Rush"): it names the Dev Hours, tech debt, and bad-deploy risk. */

const fixture = (): Model => {
  const game = Result.getOrThrow(
    queueFeature({ ...preseedGame(1), devHours: 100 }, FEATURE_IDS[0]!),
  )
  return {
    ...initialModel(),
    panel: 'team',
    board: { ...initialModel().board, game },
  }
}

test('a Rush names the Dev Hours, tech debt, and bad-deploy risk it adds', () => {
  Scene.scene(
    { update, view: (model: Model, h: HtmlBuilder<Message>) => teamPanel(model, h) },
    Scene.given(fixture()),
    Scene.expect(
      Scene.role('button', {
        name: 'Rush with 100 DH · +2.0% tech debt · +10.0% bad-deploy risk',
      }),
    ).toExist(),
  )
})
