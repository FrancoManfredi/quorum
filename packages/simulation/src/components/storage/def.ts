import { def } from '../define.ts'

export const storageDef = def({
  id: 'storage',
  code: 's3',
  name: 'Object Storage',
  product: 'Amazon S3',
  group: 'data',
  blurb: 'Holds uploaded files. No limit. Pay for what it stores.',
  cost: 280,
  burn: 0.01,
  latency: 40,
  accepts: ['blob-put', 'blob-get'],
  maxOut: 0,
  unlock: 'object-storage',
})
