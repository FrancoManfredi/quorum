import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

export const gwDef = def({
  id: 'gw',
  code: 'gw',
  name: 'API Gateway',
  product: 'Kong',
  group: 'edge',
  blurb:
    'Rate-limits and routes API calls. Past its rate limit, requests fail as throttled, and it bills per request.',
  cost: 300,
  latency: 6,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'api-gateway',
  limiting: true,
})
