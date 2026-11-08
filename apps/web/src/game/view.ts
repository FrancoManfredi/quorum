import { localizeBuilder } from '../i18n/builder.ts'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { toast } from '@/components/lab/toast.ts'
import { settingsPanel } from '@/components/lab/panels.ts'
import { labScreen } from './screens.ts'
import { titleScreen } from './title.ts'
import type { Message } from './message.ts'
import { boardChallenge, boardSandbox, type Model } from './model.ts'
import { isPlaying } from './company-machine.ts'
import { connecting } from './boot-machine.ts'
import { onBoard } from './route.ts'

/** The board for the route has its data: the Company file, or the Sandbox or Challenge it names. */
const boardFilled = (model: Model): boolean =>
  model.route._tag === 'Company'
    ? isPlaying(model.companyPhase)
    : model.route._tag === 'Sandbox'
      ? boardSandbox(model.board) !== null
      : model.route._tag === 'Challenge'
        ? boardChallenge(model.board) !== null
        : false

export const view = (model: Model, builder: HtmlBuilder<Message>): Document => {
  const h = localizeBuilder(model.prefs.locale, builder)
  // The title stays up while its monitor connects to the board.
  const screen = onBoard(model.route) && !connecting(model.boot)
  const board = screen && boardFilled(model)
  return {
    title: 'Quorum',
    lang: model.prefs.locale,
    body: h.div(
      [
        h.Class('h-dvh w-full overflow-hidden bg-background text-foreground select-none'),
        h.DataAttribute('toast', model.toast ? 'on' : 'off'),
      ],
      [
        h.div(
          [h.Key(board ? 'board' : 'title'), h.Class('h-full')],
          [
            board
              ? labScreen(model, h)
              : // A reload shows the board's canvas until its save fills it, never an empty Company.
                screen
                ? h.div([h.Class('h-full bg-canvas')])
                : titleScreen(model, h),
          ],
        ),
        // Outside the title's dark palette, so Settings looks the same as on the board.
        !onBoard(model.route) && model.panel === 'settings' ? settingsPanel(model, h) : h.empty,
        toast(model.toast, model.panel !== 'none', h),
      ],
    ),
  }
}
