import { def } from './define.ts'

// It puts a sidecar beside every service that links into it: mutual TLS, retries and a breaker on
// each Link, and per-Link metrics (05 "Service Mesh").
export const meshDef = def({
  id: 'mesh',
  code: 'mesh',
  name: 'Service Mesh',
  product: 'Istio',
  group: 'ops',
  blurb:
    'Link App Servers and Workers into it. A sidecar beside each one retries and breaks its calls, and watches them: +1 ms a hop, and 5% of its CPU.',
  cost: 600,
  latency: 0,
  accepts: [],
  maxOut: 0,
  control: true,
  unlock: 'service-mesh',
})
