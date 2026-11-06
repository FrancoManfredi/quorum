import type { ComponentDef, ComponentId } from '../catalog/components.ts'
import { usersDef } from './users/def.ts'
import { paymentsDef } from './payments/def.ts'
import { analyticsDef } from './analytics/def.ts'
import { serverDef } from './server/def.ts'
import { databaseDef } from './database/def.ts'
import { dnsDef } from './dns/def.ts'
import { lbDef } from './lb/def.ts'
import { poolerDef } from './pooler/def.ts'
import { cacheDef } from './cache/def.ts'
import { replicaDef } from './replica/def.ts'
import { authDef } from './auth/def.ts'
import { searchDef } from './search/def.ts'
import { storageDef } from './storage/def.ts'
import { docDef } from './doc/def.ts'
import { queueDef } from './queue/def.ts'
import { workerDef } from './worker/def.ts'
import { logDef } from './log/def.ts'
import { fnDef } from './fn/def.ts'
import { cdnDef } from './cdn/def.ts'
import { wafDef } from './waf/def.ts'
import { gwDef } from './gw/def.ts'
import { wsDef } from './ws/def.ts'
import { pspDef } from './psp/def.ts'
import { autoscalerDef } from './autoscaler/def.ts'
import { ciDef } from './ci/def.ts'
import { clusterDef } from './cluster/def.ts'
import { warehouseDef } from './warehouse/def.ts'
import { vecDef } from './vec/def.ts'
import { gpuDef } from './gpu/def.ts'
import { edgeDef } from './edge/def.ts'
import { llmDef } from './llm/def.ts'
import { msgpDef } from './msgp/def.ts'
import { wideDef } from './wide/def.ts'
import { dsqlDef } from './dsql/def.ts'
import { cdcDef } from './cdc/def.ts'
import { meshDef } from './mesh/def.ts'
import { ffDef } from './ff/def.ts'
import { pkiDef } from './pki/def.ts'

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
