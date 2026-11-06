import { def } from './define.ts'

export const clusterDef = def({
  id: 'cluster',
  code: 'k8s',
  name: 'Kubernetes Cluster',
  product: 'Kubernetes',
  group: 'compute',
  blurb:
    'Link App Servers or Workers into it. They pack onto shared nodes: 15% less Burn, copies in 30 s.',
  cost: 500,
  burn: 0.1,
  latency: 0,
  accepts: [],
  maxOut: 0,
  control: true,
  unlock: 'containers',
})
