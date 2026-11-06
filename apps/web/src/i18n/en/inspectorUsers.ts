export const inspectorUsers = {
  requests: 'Requests',
  sOk: (p0: string | number | null, p1: string | number | null, p2: string | number | null) =>
    `${p0}/s · ${p1} ok${p2}`,
  errorsByCause: 'Errors by cause',
  s: (p0: string | number | null) => `${p0}/s`,
  users: 'Users',
  market: 'Market',
  apdexNow: 'Apdex now',
  apdexLastHour: 'Apdex, last hour',
  velocity: 'Velocity',
}
