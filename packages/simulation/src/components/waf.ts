import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

export const wafDef = def({
  id: 'waf',
  code: 'waf',
  name: 'WAF',
  product: 'ModSecurity',
  group: 'edge',
  blurb: 'Blocks bots before they reach the app, and some real users with them.',
  cost: 260,
  burn: 0.1,
  latency: 2,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'waf',
  steps: 6,
  limiting: true,
})
