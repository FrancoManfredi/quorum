import { test } from 'vitest'
import { Scene } from 'foldkit/test'
import { preseedGame } from '@quorum/simulation/company'
import { copyIn } from '@/i18n/messages.ts'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { AppRoute } from '@/game/route.ts'
import { initialModel, update } from '@/game/update.ts'
import { exitedPanel } from './legacy.ts'

/* The Exit survey on the Exit summary: the two questions, then thanks or the reason it did not send. */

const en = copyIn('en')

const exited = (survey: Partial<Model['survey']> = {}): Model => {
  const game = { ...preseedGame(), stage: 4, users: 200_000, cash: 1e8 }
  const start: Model = {
    ...initialModel(),
    route: AppRoute.Company(),
    companyPhase: { _tag: 'Open', id: 'company' },
    board: { ...initialModel().board, game },
  }
  const taken = update(start, Message.ExitTaken({ exit: 'acquisition' })).model
  return { ...taken, survey: { ...taken.survey, ...survey } }
}

const send = () => Scene.role('button', { name: en.survey.send })

test('the survey asks both questions, and Send waits for an answer', () => {
  Scene.scene(
    { update, view: exitedPanel },
    Scene.given(exited()),
    Scene.expect(Scene.text(en.survey.title)).toExist(),
    Scene.expect(Scene.text(en.survey.issues)).toExist(),
    Scene.expect(Scene.text(en.survey.likes)).toExist(),
    Scene.expect(send()).toBeDisabled(),
  )
})

test('an answer enables Send, and a skipped survey leaves the summary', () => {
  Scene.scene(
    { update, view: exitedPanel },
    Scene.given(exited({ issues: 'The Bottleneck took ten minutes to find.' })),
    Scene.expect(send()).toBeEnabled(),
  )
  Scene.scene(
    { update, view: exitedPanel },
    Scene.given(exited({ phase: { _tag: 'Skipped' } })),
    Scene.expect(Scene.text(en.survey.title)).toBeAbsent(),
  )
})

test('a sent survey thanks the player instead of asking again', () => {
  Scene.scene(
    { update, view: exitedPanel },
    Scene.given(exited({ phase: { _tag: 'Sent' } })),
    Scene.expect(Scene.text(en.survey.sent)).toExist(),
    Scene.expect(Scene.selector('#survey-issues')).toBeAbsent(),
    Scene.expect(send()).toBeAbsent(),
  )
})

test('a failed send keeps the answers and says why', () => {
  const note = en.survey.offline
  Scene.scene(
    { update, view: exitedPanel },
    Scene.given(exited({ phase: { _tag: 'Failed', note }, likes: 'The settling delta.' })),
    Scene.expect(Scene.text(en.survey.failed(note))).toExist(),
    Scene.expect(Scene.selector('#survey-likes')).toHaveValue('The settling delta.'),
    Scene.expect(send()).toBeEnabled(),
  )
})
