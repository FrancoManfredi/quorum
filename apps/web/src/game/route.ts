import { Schema, pipe } from 'effect'
import {
  defineRouteUnion,
  literal,
  mapTo,
  oneOf,
  parseUrlWithFallback,
  root,
  schemaSegment,
  slash,
  string,
} from 'foldkit/route'
import { SANDBOX_IDS } from '@quorum/simulation/sandbox'

export const MENU_PAGES = [
  'sandbox',
  'found',
  'companies',
  'legacy',
  'history',
  'challenges',
  'achievements',
  'settings',
] as const
export const MenuPage = Schema.Literals(MENU_PAGES)

/** A Sandbox in the URL: a guided one by id, or the free one. */
export const SandboxPath = Schema.Literals([...SANDBOX_IDS, 'free'])

export const AppRoute = defineRouteUnion({
  Title: {},
  Menu: { menu: MenuPage },
  Company: {},
  Sandbox: { sandbox: SandboxPath },
  Challenge: { challenge: Schema.String },
  Room: { room: Schema.String },
})
export type AppRoute = typeof AppRoute.Type

export const titleRouter = pipe(root, mapTo(AppRoute.Title))
export const menuRouter = pipe(schemaSegment('menu', MenuPage), mapTo(AppRoute.Menu))
export const companyRouter = pipe(literal('company'), mapTo(AppRoute.Company))
export const sandboxRouter = pipe(
  literal('sandbox'),
  slash(schemaSegment('sandbox', SandboxPath)),
  mapTo(AppRoute.Sandbox),
)
export const challengeRouter = pipe(
  literal('challenges'),
  slash(string('challenge')),
  mapTo(AppRoute.Challenge),
)
export const roomRouter = pipe(literal('room'), slash(string('room')), mapTo(AppRoute.Room))

export const urlToAppRoute = parseUrlWithFallback(
  oneOf(titleRouter, menuRouter, companyRouter, sandboxRouter, challengeRouter, roomRouter),
  { make: () => AppRoute.Title() },
)

export const urlOf = (route: AppRoute): string =>
  AppRoute.match(route, {
    Title: () => titleRouter(),
    Menu: (menu) => menuRouter(menu),
    Company: () => companyRouter(),
    Sandbox: (sandbox) => sandboxRouter(sandbox),
    Challenge: (challenge) => challengeRouter(challenge),
    Room: (room) => roomRouter(room),
  })

/** The board is open: a Company, a Sandbox, or a Challenge. */
export const onBoard = (route: AppRoute): boolean =>
  AppRoute.match(route, {
    Title: () => false,
    Menu: () => false,
    Company: () => true,
    Sandbox: () => true,
    Challenge: () => true,
    Room: () => true,
  })

/** The title menu page a route shows. */
export const menuOf = (route: AppRoute): typeof MenuPage.Type | 'main' =>
  route._tag === 'Menu' ? route.menu : 'main'

export const routeOfMenu = (menu: typeof MenuPage.Type | 'main'): AppRoute =>
  menu === 'main' ? AppRoute.Title() : AppRoute.Menu({ menu })
