import { def } from './define.ts'

export const autoscalerDef = def({
  id: 'autoscaler',
  code: 'hpa',
  name: 'Autoscaler',
  product: 'Auto Scaling group',
  group: 'ops',
  blurb:
    'Link App Servers or Workers into it. It adds copies when they run hot and removes them when idle.',
  cost: 200,
  latency: 0,
  accepts: [],
  maxOut: 0,
  control: true,
  unlock: 'autoscaling',
})
