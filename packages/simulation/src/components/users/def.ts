import { def } from '../define.ts'
import { REQUEST_KINDS } from '../../catalog/kinds.ts'

export const usersDef = def({
  id: 'users',
  code: 'www',
  name: 'Users',
  product: 'The internet',
  group: 'edge',
  blurb: 'Where traffic starts. A domain resolves to one host, so Users take one link.',
  cost: 0,
  latency: 30,
  accepts: [],
  maxOut: 1,
  fixed: true,
  sends: REQUEST_KINDS,
})
