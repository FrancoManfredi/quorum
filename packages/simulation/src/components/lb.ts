import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

export const lbDef = def({
  id: 'lb',
  code: 'lb',
  name: 'Load Balancer',
  product: 'NGINX',
  group: 'edge',
  blurb: 'Splits traffic across App Servers and drops a dead host at its next health check.',
  cost: 120,
  burn: 0.08,
  latency: 1,
  accepts: REQUEST_KINDS,
  unlock: 'load-balancing',
  steps: 6,
  sends: REQUEST_KINDS,
  limiting: true,
})
