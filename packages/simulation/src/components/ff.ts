import { def } from './define.ts'

/**
 * The shares a Feature behind a flag can sit at (05 "Feature Flags", 08 "Rollout"): dark, then 5%,
 * 25%, 50% and every user. Dark is the "turn it off in one click" the design promises.
 */
export const ROLLOUT_STEPS = [0, 0.05, 0.25, 0.5, 1] as const
/** A Feature with no flag against it is live for every user. */
export const ROLLOUT_ALL = 1

// It carries no traffic: it decides what share of users a Feature reaches, and so how far a bad
// deploy of it reaches (05 "Feature Flags", 08 "Rollout").
export const ffDef = def({
  id: 'ff',
  code: 'ff',
  name: 'Feature Flags',
  product: 'LaunchDarkly',
  group: 'ops',
  blurb:
    'Rolls a Feature out to 5%, 25%, 50% or every user, and turns it off. Changes propagate to every server in seconds. A bad deploy reaches only the share that has it.',
  cost: 150,
  burn: 0.01,
  latency: 0,
  accepts: [],
  maxOut: 0,
  unlock: 'feature-flags',
})
