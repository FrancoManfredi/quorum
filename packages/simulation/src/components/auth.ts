import { def } from './define.ts'

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
