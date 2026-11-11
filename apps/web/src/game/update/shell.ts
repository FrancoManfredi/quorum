import { LoadUrl, PlaySound, PushUrl, RevealTitle } from '../commands.ts'
import { Model } from '../model.ts'
import { UrlRequest } from 'foldkit/navigation'
import { bootStep } from '../boot-machine.ts'
import { isExited } from '../company-machine.ts'
import { leaveExited } from './companies.ts'
import { routeOfMenu } from '../route.ts'
import { toString as urlToString } from 'foldkit/url'
import { type MessageCases, type UpdateResult } from './shared.ts'
import { visit, continued, leaveBoard } from './session.ts'

/** Puts the badge in the reader, once: it beeps, and the title follows. */
export const clockIn = (model: Model): UpdateResult =>
  model.boot._tag !== 'Shut'
    ? { model }
    : {
        model: { ...model, boot: bootStep(model.boot, { _tag: 'ClockedIn' }) },
        commands: [
          ...(model.prefs.muted ? [] : [PlaySound({ sound: 'clockin', pitch: 1, spatial: false })]),
          RevealTitle({}),
        ],
      }

type ShellTag =
  | 'Continued'
  | 'Connected'
  | 'TitleOpened'
  | 'ClockedIn'
  | 'TitleRevealed'
  | 'MenuChosen'
  | 'SettingsSectionChosen'
  | 'ClickedLink'
  | 'ChangedUrl'
  | 'Navigated'

export const shellHandlers = (model: Model): MessageCases<UpdateResult, ShellTag> => ({
  Continued: () => continued(model),

  Connected: () => ({ model: { ...model, boot: bootStep(model.boot, { _tag: 'Connected' }) } }),

  TitleOpened: () => leaveBoard(model),

  ClockedIn: () => clockIn(model),

  TitleRevealed: () => ({
    model: { ...model, boot: bootStep(model.boot, { _tag: 'TitleRevealed' }) },
  }),

  MenuChosen: ({ menu }) =>
    isExited(model.companyPhase)
      ? leaveExited(model, menu)
      : {
          model: {
            ...model,
            route: routeOfMenu(menu),
            ...(menu === 'companies' ? {} : { saveFocus: null, saveConfirm: { _tag: 'List' } }),
          },
        },

  SettingsSectionChosen: ({ section }) => ({ model: { ...model, settingsSection: section } }),

  ClickedLink: ({ request }) =>
    UrlRequest.match<UpdateResult>(request, {
      Internal: ({ url }) => ({ model, commands: [PushUrl({ url: urlToString(url) })] }),
      External: ({ href }) => ({ model, commands: [LoadUrl({ href })] }),
    }),

  ChangedUrl: ({ url }) => visit(model, url),

  Navigated: () => ({ model }),
})
