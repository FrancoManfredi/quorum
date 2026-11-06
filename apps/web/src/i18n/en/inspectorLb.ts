export const inspectorLb = {
  variant: 'Variant',
  forwardsTCPTenTimesTheThroughput:
    'Forwards TCP: ten times the throughput, 0.2 ms, and cheaper. It reads no HTTP, so it cannot route by kind or retry.',
  readsHTTPRoutesByKindRetries:
    'Reads HTTP: routes by kind, retries, and checks health. Lower throughput and a longer hop.',
  policy: 'Policy',
  sessions: 'Sessions',
  balanced: 'Balanced',
  sticky: 'Sticky',
  everyRequestGoesWhereTheAlgorithm: 'Every request goes where the algorithm sends it.',
  off: 'Off',
  on: 'On',
  healthChecks: 'Health checks',
  s: (p0: string | number | null) => `${p0} s`,
  shallow: 'Shallow',
  deep: 'Deep',
  routes: 'Routes',
  stickyHolds:
    'A user stays on the target it first reached. The oldest copy holds the most users, a target that dies takes its sessions with it, and in-process caches and realtime clients stay warm.',
  slowStart: 'Slow start',
  slowStartOn:
    'A new copy takes traffic gradually, so a cold Java copy never answers at its cold speed.',
  slowStartOff: 'A new copy takes its full share at once.',
}
