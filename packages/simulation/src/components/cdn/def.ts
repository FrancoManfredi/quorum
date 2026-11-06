import { def } from '../define.ts'
import { REQUEST_KINDS } from '../../catalog/kinds.ts'

export const cdnDef = def({
  id: 'cdn',
  code: 'cdn',
  name: 'CDN',
  product: 'Cloudflare',
  group: 'edge',
  blurb: 'Answers cacheable pages near the user. Egress from the edge costs less.',
  cost: 220,
  burn: 0.05,
  latency: 8,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'cdn',
})
