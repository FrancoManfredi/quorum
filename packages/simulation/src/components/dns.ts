import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

/** DNS TTLs, in seconds. */
export const DNS_TTLS = [30, 300, 3_600] as const

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const dnsGlossary: ReadonlyArray<string> = [
  'dns-round-robin',
  'health-check',
  'vertical-and-horizontal-scaling',
]

export const dnsDef = def({
  id: 'dns',
  code: 'dns',
  name: 'DNS',
  product: 'Route 53',
  group: 'edge',
  blurb: 'Round robin across up to 8 hosts. No health checks: a dead host keeps its share.',
  cost: 20,
  burn: 0.01,
  latency: 0,
  accepts: REQUEST_KINDS,
  maxOut: 8,
  unlock: 'dns-rr',
  sends: REQUEST_KINDS,
})
