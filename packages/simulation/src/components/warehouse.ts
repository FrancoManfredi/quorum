import { def } from './define.ts'

/** Data Warehouse price per scan (09 "Pricing models": per scan, BigQuery style).  */
export const SCAN_PRICE = 0.02

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const warehouseGlossary: ReadonlyArray<string> = ['cdc-change-data-capture', 'oltp-and-olap']

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
