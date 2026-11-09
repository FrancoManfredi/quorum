import { test } from 'vitest'
import { Result } from 'effect'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { FEATURE_IDS } from '@quorum/simulation/catalog'
import { preseedGame } from '@quorum/simulation/company'
import type { Game } from '@quorum/simulation/state'
import { queueFeature } from '@quorum/simulation/work'
import { initialModel, update } from '@/game/update.ts'
import type { Model } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { teamPanel } from './team.ts'
import { PanelFocus } from './panels.ts'

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

/** The panel opens with focus inside it, which a scene resolves by hand. */
const focused = () => Scene.Mount.resolve(PanelFocus, Message.Synced())

test('a Rush names the Dev Hours, tech debt, and bad-deploy risk it adds', () => {
  Scene.scene(
    { update, view: (model: Model, h: HtmlBuilder<Message>) => teamPanel(model, h) },
    Scene.given(fixture()),
    focused(),
    Scene.expect(
      Scene.role('button', {
        name: 'Rush with 100 DH · +2.0% tech debt · +10.0% bad-deploy risk',
      }),
    ).toExist(),
  )
})

test('a blocked item says what it waits on, and says so over the idle team', () => {
  const model = fixture()
  // A team past eight engineers stops each item it starts, and waits for the player (18 "Blocked").
  const blocked: Game = {
    ...model.board.game,
    backlog: model.board.game.backlog.map((item) => ({
      ...item,
      block: {
        _tag: 'Blocked' as const,
        reason: 'size' as const,
        owner: 'e1',
        at: 0,
        remindAt: 60,
      },
    })),
  }
  Scene.scene(
    { update, view: (view: Model, h: HtmlBuilder<Message>) => teamPanel(view, h) },
    Scene.given({ ...model, board: { ...model.board, game: blocked } }),
    focused(),
    Scene.expect(Scene.text('Waiting on you: team too big')).toExist(),
    Scene.expect(Scene.role('button', { name: 'Approve' })).toExist(),
    Scene.expect(Scene.text('Core idle · 1 item waiting on you')).toExist(),
    // The team's own card says the same, so the floor explains the idle team too.
    Scene.expect(Scene.text('1 item waiting on you')).toExist(),
  )
})
