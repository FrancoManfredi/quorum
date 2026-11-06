import { def } from '../define.ts'

export const warehouseDef = def({
  id: 'warehouse',
  code: 'olap',
  name: 'Data Warehouse',
  product: 'BigQuery',
  group: 'data',
  blurb: 'Answers report scans in columns. 1.5 s each, no limit, paid per scan.',
  cost: 800,
  burn: 0.05,
  latency: 1_500,
  accepts: ['q-scan'],
  maxOut: 0,
  unlock: 'data-warehouse',
})
