import { Effect, Option, Schema } from 'effect'
import { Command, Runtime, Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { UrlRequest, load, pushUrl } from 'foldkit/navigation'
import { Url, toString as urlToString } from 'foldkit/url'
import * as Progress from './submodels/progress.ts'
import * as Quiz from './submodels/quiz.ts'
import * as Search from './submodels/search.ts'
import * as Spoilers from './submodels/spoilers.ts'

export const Model = Schema.Struct({
  /** The page path, without a trailing slash. */
  path: Schema.String,
  /** The navigation drawer is open on a phone. */
  menu: Schema.Boolean,
  /** Hubs the reader opened or closed by hand, against whether the current page opens them. */
  navToggled: Schema.Array(Schema.String),
  search: Search.Model,
  spoilers: Spoilers.Model,
  progress: Progress.Model,
  quiz: Quiz.Model,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  Navigated: {},
  MenuToggled: {},
  NavToggled: { path: Schema.String },
  SearchChanged: { message: Search.Message },
  SpoilersChanged: { message: Spoilers.Message },
  ProgressChanged: { message: Progress.Message },
  QuizChanged: { message: Quiz.Message },
})
export type Message = typeof Message.Type

export const normalize = (pathname: string): string => {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

const Navigate = Command.define('Navigate', {
  args: { url: Schema.String },
  messages: [Message.Navigated],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(Message.Navigated())),
})

const LoadExternal = Command.define('LoadExternal', {
  args: { href: Schema.String },
  messages: [Message.Navigated],
  execute: ({ href }) => load(href).pipe(Effect.as(Message.Navigated())),
})

/** A new page starts at its top, or at the heading its hash names. */
const ScrollTo = Command.define('ScrollTo', {
  args: { hash: Schema.String },
  messages: [Message.Navigated],
  execute: ({ hash }) =>
    Effect.sync(() => {
      requestAnimationFrame(() => {
        const target = hash ? document.getElementById(decodeURIComponent(hash)) : null
        if (target) target.scrollIntoView()
        else window.scrollTo(0, 0)
      })
      return Message.Navigated()
    }),
})

/** The current tab and the current sidebar row come into view once the page has drawn. */
const RevealCurrent = Command.define('RevealCurrent', {
  messages: [Message.Navigated],
  execute: Effect.sync(() => {
    setTimeout(() => {
      for (const current of document.querySelectorAll('nav [aria-current]'))
        current.scrollIntoView({ block: 'nearest', inline: 'center' })
    }, 60)
    return Message.Navigated()
  }),
})

const foldSearch = Update.foldChild({
  update: Search.update,
  read: (model: Model) => Option.some(model.search),
  write: (model, search) => ({ ...model, search }),
  toParentMessage: (message) => Message.SearchChanged({ message }),
})

const foldSpoilers = Update.foldChild({
  update: Spoilers.update,
  read: (model: Model) => Option.some(model.spoilers),
  write: (model, spoilers) => ({ ...model, spoilers }),
  toParentMessage: (message) => Message.SpoilersChanged({ message }),
})

const foldProgress = Update.foldChild({
  update: Progress.update,
  read: (model: Model) => Option.some(model.progress),
  write: (model, progress) => ({ ...model, progress }),
  toParentMessage: (message) => Message.ProgressChanged({ message }),
})

const foldQuiz = Update.foldChild({
  update: Quiz.update,
  read: (model: Model) => Option.some(model.quiz),
  write: (model, quiz) => ({ ...model, quiz }),
  toParentMessage: (message) => Message.QuizChanged({ message }),
})

export const init: Runtime.RoutingApplicationInit<Model, Message> = (url) => {
  const path = normalize(url.pathname)
  return {
    model: {
      path,
      menu: false,
      navToggled: [],
      search: Search.init,
      spoilers: Spoilers.init,
      progress: Progress.init,
      quiz: Quiz.init,
    },
    commands: [
      RevealCurrent(),
      ...Command.mapMessages([Spoilers.Load()], (message) => Message.SpoilersChanged({ message })),
      ...Command.mapMessages([Progress.Load({ path })], (message) =>
        Message.ProgressChanged({ message }),
      ),
    ],
  }
}

type Return = Update.Return<Model, Message>

export const update = (model: Model, message: Message): Return =>
  Message.match<Return>(message, {
    ClickedLink: ({ request }) =>
      UrlRequest.match<Return>(request, {
        Internal: ({ url }) => ({ model, commands: [Navigate({ url: urlToString(url) })] }),
        External: ({ href }) => ({ model, commands: [LoadExternal({ href })] }),
      }),
    ChangedUrl: ({ url }) => {
      const path = normalize(url.pathname)
      const hash = url.hash._tag === 'Some' ? url.hash.value.replace(/^#/, '') : ''
      const scroll = path === model.path && !hash ? [] : [ScrollTo({ hash })]
      const visited = foldProgress(
        { ...model, path, menu: false, navToggled: [], search: Search.init },
        Progress.Message.Visited({ path }),
      )
      return {
        model: visited.model,
        commands: [...scroll, RevealCurrent(), ...(visited.commands ?? [])],
      }
    },
    Navigated: () => ({ model }),
    MenuToggled: () => ({ model: { ...model, menu: !model.menu } }),
    NavToggled: ({ path }) => ({
      model: {
        ...model,
        navToggled: model.navToggled.includes(path)
          ? model.navToggled.filter((entry) => entry !== path)
          : [...model.navToggled, path],
      },
    }),
    SearchChanged: ({ message }) => foldSearch(model, message),
    SpoilersChanged: ({ message }) => foldSpoilers(model, message),
    ProgressChanged: ({ message }) => foldProgress(model, message),
    QuizChanged: ({ message }) => foldQuiz(model, message),
  })
