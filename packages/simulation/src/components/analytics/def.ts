import { def } from '../define.ts'

export const analyticsDef = def({
  id: 'analytics',
  code: 'otel',
  name: 'Analytics',
  product: 'OpenTelemetry',
  group: 'ops',
  blurb: 'Link any Node into it. It samples that traffic and turns it into Insight.',
  cost: 40,
  burn: 0.05,
  latency: 0,
  accepts: [],
  maxOut: 0,
  tap: true,
  steps: 8,
})
