import { def } from './define.ts'

/** Auth Provider price, in dollars per second per user. */
export const AUTH_PRICE_PER_USER = 0.00006

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const authGlossary: ReadonlyArray<string> = ['bcrypt']

export const authDef = def({
  id: 'auth',
  code: 'idp',
  name: 'Auth Provider',
  product: 'Auth0',
  group: 'data',
  blurb: 'Hashes passwords for you. Charged per user.',
  cost: 0,
  latency: 120,
  accepts: ['auth'],
  maxOut: 0,
  unlock: 'auth-provider',
})
