import { def } from './define.ts'

/** Milliseconds the sidecar adds to each hop a member of the mesh makes (05: +1 ms per hop). */
export const MESH_HOP_MS = 1
/** Share of a member's CPU its sidecar takes (05: "CPU and memory per sidecar, about 5%"). */
export const MESH_OVERHEAD = 0.05
/** Insight per-link metrics earn on top of what Analytics already samples (05: +20%). */
export const MESH_INSIGHT = 0.2
/**
 * Dev Hours the mesh takes from the product teams, in engineers, the same as a Cluster's:
 * 05 says "Platform Dev Hours" and gives no figure.
 */
export const MESH_TAX = 0.5

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
