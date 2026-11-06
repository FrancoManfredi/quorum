import type { ComponentDef, ComponentId } from '../catalog/components.ts'
import { usersDef } from './users.ts'
import { paymentsDef } from './payments.ts'
import { analyticsDef } from './analytics.ts'
import { serverDef } from './server.ts'
import { databaseDef } from './database.ts'
import { dnsDef } from './dns.ts'
import { lbDef } from './lb.ts'
import { poolerDef } from './pooler.ts'
import { cacheDef } from './cache.ts'
import { replicaDef } from './replica.ts'
import { authDef } from './auth.ts'
import { searchDef } from './search.ts'
import { storageDef } from './storage.ts'
import { docDef } from './doc.ts'
import { queueDef } from './queue.ts'
import { workerDef } from './worker.ts'
import { logDef } from './log.ts'
import { fnDef } from './fn.ts'
import { cdnDef } from './cdn.ts'
import { wafDef } from './waf.ts'
import { gwDef } from './gw.ts'
import { wsDef } from './ws.ts'
import { pspDef } from './psp.ts'
import { autoscalerDef } from './autoscaler.ts'
import { ciDef } from './ci.ts'
import { clusterDef } from './cluster.ts'
import { warehouseDef } from './warehouse.ts'
import { vecDef } from './vec.ts'
import { gpuDef } from './gpu.ts'
import { edgeDef } from './edge.ts'
import { llmDef } from './llm.ts'
import { msgpDef } from './msgp.ts'
import { wideDef } from './wide.ts'
import { dsqlDef } from './dsql.ts'
import { cdcDef } from './cdc.ts'
import { meshDef } from './mesh.ts'
import { ffDef } from './ff.ts'
import { pkiDef } from './pki.ts'

/** Every Component's catalog entry, by id: one folder each. */
export const COMPONENT_DEFS: Record<ComponentId, ComponentDef> = {
  users: usersDef,
  payments: paymentsDef,
  analytics: analyticsDef,
  server: serverDef,
  database: databaseDef,
  dns: dnsDef,
  lb: lbDef,
  pooler: poolerDef,
  cache: cacheDef,
  replica: replicaDef,
  auth: authDef,
  search: searchDef,
  storage: storageDef,
  doc: docDef,
  queue: queueDef,
  worker: workerDef,
  log: logDef,
  fn: fnDef,
  cdn: cdnDef,
  waf: wafDef,
  gw: gwDef,
  ws: wsDef,
  psp: pspDef,
  autoscaler: autoscalerDef,
  ci: ciDef,
  cluster: clusterDef,
  warehouse: warehouseDef,
  vec: vecDef,
  gpu: gpuDef,
  edge: edgeDef,
  llm: llmDef,
  msgp: msgpDef,
  wide: wideDef,
  dsql: dsqlDef,
  cdc: cdcDef,
  mesh: meshDef,
  ff: ffDef,
  pki: pkiDef,
}
