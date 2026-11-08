import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { dailyDrill } from '@quorum/simulation/challenges'
import type { Model } from './model.ts'
import { AppRoute } from './route.ts'
import { initialModel, update } from './update.ts'
import { titleScreen, BoothDriver, PageMounted, ReaderClock } from './title.ts'
import { Message } from './message.ts'

/* The Daily drill is derived from the date, not the catalog, so the title screen reads its
   brief from the drill itself (QUORUM-4). */

const view = (model: Model, h: HtmlBuilder<Message>) => titleScreen(model, h)
const mounted = () => [
  Scene.Mount.resolve(BoothDriver, Message.Synced()),
  Scene.Mount.resolve(PageMounted, Message.Synced()),
  Scene.Mount.resolve(ReaderClock, Message.Synced()),
]

test('the Challenges page lists the Daily drill with its derived brief', () => {
  const drill = dailyDrill('2026-11-02')
  const model: Model = {
    ...initialModel(),
    route: AppRoute.Menu({ menu: 'challenges' }),
    today: '2026-11-02',
  }
  Scene.scene(
    { update, view },
    Scene.given(model),
    ...mounted(),
    Scene.expect(Scene.text(drill.brief)).toExist(),
  )
})
