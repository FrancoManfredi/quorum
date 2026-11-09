export const inspectorGw = {
  routes: 'Routes',
  rateLimit: 'Rate limit',
  off: 'Off',
  s: (p0: string | number | null) => `${p0}/s`,
  pastRequestsASecondTheyFail: (p0: string | number | null) =>
    `Past ${p0} requests a second, they fail as throttled.`,
  noLimitEveryRequestGoesOn: 'No limit: every request goes on to the services.',
  flatCap: 'Flat cap',
  tokenBucket: 'Token bucket',
  aBurstOfUpToRequests: (p0: string | number | null) =>
    `A burst of up to ${p0} requests passes whole, and the average holds at the limit.`,
  everyStepOverTheLimitIs:
    'Every Step over the limit is throttled at once. Research Rate limiting for a token bucket.',
  servicesCheck: 'Services check',
  authAtTheEdge: 'Auth at the edge',
  everyReadGoesOn: 'Every read goes on',
  requestCoalescing: 'Request coalescing',
  identicalReadsInFlightAtOnce:
    'Identical reads in flight at once become one call. The busier the Gateway, the more it merges, so a spike sends less on.',
  theGatewayValidatesEachToken: (validation: string | number, check: string | number) =>
    `The Gateway validates each token once, for ${validation}, and the services skip the ${check} check.`,
  everyServiceValidatesTheToken: (check: string | number) =>
    `Every service validates the token itself: ${check} of CPU on each authenticated request.`,
}
