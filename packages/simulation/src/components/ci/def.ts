import { def } from '../define.ts'

// It carries no traffic: it decides how code reaches production, and how far a bad deploy reaches.
export const ciDef = def({
  id: 'ci',
  code: 'ci',
  name: 'CI/CD Pipeline',
  product: 'GitHub Actions',
  group: 'ops',
  blurb:
    'Ships what waits. Its deploy strategy sets how long a deploy takes, what it burns, and how bad a bad deploy is.',
  cost: 100,
  burn: 0.02,
  latency: 1,
  accepts: [],
  maxOut: 0,
  unlock: 'ci',
})
