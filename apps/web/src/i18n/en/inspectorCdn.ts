export const inspectorCdn = {
  deploysAndKeys: 'Deploys and keys',
  keepUntilTheTTL: 'Keep until the TTL',
  purgeOnDeploy: 'Purge on deploy',
  aDeployEmptiesTheCacheThe:
    'A deploy empties the cache: the origin takes the misses while it refills.',
  afterADeployTheEdgeServes:
    'After a deploy the edge serves some of the old pages until the TTL passes.',
  theKeyHoldsThePathThe:
    'The key holds the path, the query string and the cookies: nothing is shared between users.',
  aSmallerKeyLifts: (lift: string | number) =>
    `A smaller key lifts the hit ratio ${lift}%, and a logged-in page cached under it can be served to another user: a data leak.`,
}
