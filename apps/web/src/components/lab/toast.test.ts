import { expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import type { HtmlBuilder } from 'foldkit/html'
import { initialModel, update } from '@/game/update.ts'
import type { Model, Toast } from '@/game/model.ts'
import { Message } from '@/game/message.ts'
import { toast } from './toast.ts'

const withToast = (value: Toast): Model => ({ ...initialModel(), toast: value })

const view = (m: Model, h: HtmlBuilder<Message>) => toast(m.toast, false, h)

test('a repeat shows once, with the count beside it', () => {
  Scene.scene(
    { update, view },
    Scene.given(
      withToast({ id: 1, message: 'Backoff needs Backoff with jitter.', tone: 'warn', count: 3 }),
    ),
    Scene.expect(Scene.text('Backoff needs Backoff with jitter.')).toExist(),
    Scene.expect(Scene.text('×3')).toExist(),
  )
})

test('a danger is announced as an alert; anything else waits its turn', () => {
  Scene.scene(
    { update, view },
    Scene.given(withToast({ id: 1, message: 'The Database is down.', tone: 'danger', count: 1 })),
    Scene.expect(Scene.role('alert')).toExist(),
  )
  Scene.scene(
    { update, view },
    Scene.given(withToast({ id: 2, message: 'Collected $16.', tone: 'ok', count: 1 })),
    Scene.expect(Scene.role('status')).toExist(),
  )
})

test('a single toast shows no count', () => {
  const model = withToast({ id: 1, message: 'Collected $16.', tone: 'ok', count: 1 })
  expect(model.toast?.count).toBe(1)
  Scene.scene({ update, view }, Scene.given(model), Scene.expect(Scene.text('×1')).toBeAbsent())
})
