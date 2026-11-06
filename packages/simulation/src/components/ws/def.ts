import { def } from '../define.ts'

export const wsDef = def({
  id: 'ws',
  code: 'ws',
  name: 'Realtime Hub',
  product: 'Socket.IO',
  group: 'compute',
  blurb: 'Holds a connection open for every realtime message. How many fit depends on the runtime.',
  cost: 400,
  burn: 0.15,
  latency: 1,
  accepts: ['rt'],
  maxOut: 0,
  unlock: 'websockets',
  steps: 8,
  limiting: true,
})
