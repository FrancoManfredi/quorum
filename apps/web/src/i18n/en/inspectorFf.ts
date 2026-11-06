export const inspectorFf = {
  rollout: 'Rollout',
  shipAFeatureFirstAFlag: 'Ship a Feature first: a flag has nothing to roll out yet.',
  off: 'Off',
  offNoUserHasTheFeature: 'Off: no user has the Feature, so a bad deploy of it breaks nobody',
  aBadDeployOfItReaches: (p0: string | number | null) =>
    `A bad deploy of it reaches at most ${p0}% of users`,
  flagsAreAShield: 'Flags are a shield',
  aFeatureAt5OfUsers:
    'A Feature at 5% of users can break at most 5% of the traffic it would have, whatever the deploy strategy. Turn it Off and the next bad deploy of it breaks nobody: that is the one click an incident needs.',
  notBuiltTheHoldoutGroupThat:
    'Not built: the holdout group that measures a Feature’s lift, and the load a dark Feature no longer adds.',
  service: 'Service',
  inTheBatch: 'In the batch',
  behindAFlag: 'Behind a flag',
  badDeploy: 'Bad deploy',
  burn: 'Burn',
  s: (p0: string | number | null) => `${p0}/s`,
}
