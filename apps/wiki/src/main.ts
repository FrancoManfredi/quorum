import { Effect, Option, Schema } from 'effect'
import { Command, Runtime, Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { UrlRequest, load, pushUrl } from 'foldkit/navigation'
import { Url, toString as urlToString } from 'foldkit/url'
import * as Progress from './submodels/progress.ts'
import * as Project from './submodels/project.ts'
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
  /** The repository's public numbers, for the card on the home page. */
  project: Project.Model,
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
  ProjectChanged: { message: Project.Message },
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

/** The nearest ancestor that scrolls on its own. Without one, `scrollIntoView` moves the page. */
const scroller = (element: Element): Element | null => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    const scrollsX = /auto|scroll/.test(style.overflowX) && node.scrollWidth > node.clientWidth
    const scrollsY = /auto|scroll/.test(style.overflowY) && node.scrollHeight > node.clientHeight
    if (scrollsX || scrollsY) return node
  }
  return null
}

/** The current tab and the current sidebar row come into view once the page has drawn. */
const RevealCurrent = Command.define('RevealCurrent', {
  messages: [Message.Navigated],
  execute: Effect.sync(() => {
    setTimeout(() => {
      for (const current of document.querySelectorAll('nav [aria-current]'))
        if (scroller(current)) current.scrollIntoView({ block: 'nearest', inline: 'center' })
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

const foldProject = Update.foldChild({
  update: Project.update,
  read: (model: Model) => Option.some(model.project),
  write: (model, project) => ({ ...model, project }),
  toParentMessage: (message) => Message.ProjectChanged({ message }),
})

const loadProject = () =>
  Command.mapMessages([Project.Load()], (message) => Message.ProjectChanged({ message }))

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
      // The home page is the only page with the project card, so it starts the one read.
      project: path === '/' ? { status: 'loading', stats: null } : Project.init,
    },
    commands: [
      RevealCurrent(),
      ...Command.mapMessages([Spoilers.Load()], (message) => Message.SpoilersChanged({ message })),
      ...Command.mapMessages([Progress.Load({ path })], (message) =>
        Message.ProgressChanged({ message }),
      ),
      ...(path === '/' ? loadProject() : []),
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
      const hash = Option.match(url.hash, {
        onNone: () => '',
        onSome: (value) => value.replace(/^#/, ''),
      })
      // A hash on the page you are reading moves to that heading and changes nothing else: the
      // search, the drawer and the open hubs belong to the page, not to the scroll position.
      if (path === model.path) return hash ? { model, commands: [ScrollTo({ hash })] } : { model }
      const visited = foldProgress(
        { ...model, path, menu: false, navToggled: [], search: Search.init },
        Progress.Message.Visited({ path }),
      )
      const wantProject = path === '/' && model.project.status === 'idle'
      return {
        model: wantProject
          ? { ...visited.model, project: { status: 'loading', stats: null } }
          : visited.model,
        commands: [
          ScrollTo({ hash }),
          RevealCurrent(),
          ...(visited.commands ?? []),
          ...(wantProject ? loadProject() : []),
        ],
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
    ProjectChanged: ({ message }) => foldProject(model, message),
  })
