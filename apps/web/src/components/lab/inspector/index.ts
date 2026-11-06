import type { ComponentId } from '@quorum/simulation/catalog'
import type { Panel } from './shared.ts'
import { analyticsPanel } from './analytics.ts'
import { autoscalerPanel } from './autoscaler.ts'
import { cachePanel } from './cache.ts'
import { cdcPanel } from './cdc.ts'
import { cdnPanel } from './cdn.ts'
import { ciPanel } from './ci.ts'
import { databasePanel } from './database.ts'
import { dnsPanel } from './dns.ts'
import { docPanel } from './doc.ts'
import { dsqlPanel } from './dsql.ts'
import { edgePanel } from './edge.ts'
import { ffPanel } from './ff.ts'
import { fnPanel } from './fn.ts'
import { gpuPanel } from './gpu.ts'
import { gwPanel } from './gw.ts'
import { lbPanel } from './lb.ts'
import { logPanel } from './log.ts'
import { meshPanel } from './mesh.ts'
import { paymentsPanel } from './payments.ts'
import { pkiPanel } from './pki.ts'
import { poolerPanel } from './pooler.ts'
import { pspPanel } from './psp.ts'
import { queuePanel } from './queue.ts'
import { replicaPanel } from './replica.ts'
import { searchPanel } from './search.ts'
import { serverPanel } from './server.ts'
import { storagePanel } from './storage.ts'
import { usersPanel } from './users.ts'
import { vecPanel } from './vec.ts'
import { wafPanel } from './waf.ts'
import { widePanel } from './wide.ts'
import { workerPanel } from './worker.ts'
import { wsPanel } from './ws.ts'

/** Each Component's Inspector panel. A Component without extra content has no entry. */
export const PANELS: Partial<Record<ComponentId, Panel>> = {
  analytics: analyticsPanel,
  autoscaler: autoscalerPanel,
  cache: cachePanel,
  cdc: cdcPanel,
  cdn: cdnPanel,
  ci: ciPanel,
  database: databasePanel,
  dns: dnsPanel,
  doc: docPanel,
  dsql: dsqlPanel,
  edge: edgePanel,
  ff: ffPanel,
  fn: fnPanel,
  gpu: gpuPanel,
  gw: gwPanel,
  lb: lbPanel,
  log: logPanel,
  mesh: meshPanel,
  payments: paymentsPanel,
  pki: pkiPanel,
  pooler: poolerPanel,
  psp: pspPanel,
  queue: queuePanel,
  replica: replicaPanel,
  search: searchPanel,
  server: serverPanel,
  storage: storagePanel,
  users: usersPanel,
  vec: vecPanel,
  waf: wafPanel,
  wide: widePanel,
  worker: workerPanel,
  ws: wsPanel,
}
