import { def } from '../define.ts'

// It carries no traffic: it decides what share of users a Feature reaches, and so how far a bad
// deploy of it reaches (05 "Feature Flags", 08 "Rollout").
export const ffDef = def({
  id: 'ff',
  code: 'ff',
  name: 'Feature Flags',
  product: 'LaunchDarkly',
  group: 'ops',
  blurb:
    'Rolls a Feature out to 5%, 25%, 50% or every user, and turns it off in one click. A bad deploy reaches only the share that has it.',
  cost: 150,
  burn: 0.01,
  latency: 0,
  accepts: [],
  maxOut: 0,
  unlock: 'feature-flags',
})
