import type { ComponentDef, ComponentId } from '../catalog/components.ts'
import { usersDef } from './users.ts'
import { paymentsDef } from './payments.ts'
import { analyticsDef, analyticsGlossary } from './analytics.ts'
import { serverDef, serverGlossary } from './server.ts'
import { databaseDef } from './database.ts'
import { dnsDef, dnsGlossary } from './dns.ts'
import { lbDef, lbGlossary } from './lb.ts'
import { poolerDef, poolerGlossary } from './pooler.ts'
import { cacheDef, cacheGlossary } from './cache.ts'
import { replicaDef, replicaGlossary } from './replica.ts'
import { authDef, authGlossary } from './auth.ts'
import { searchDef, searchGlossary } from './search.ts'
import { storageDef, storageGlossary } from './storage.ts'
import { docDef, docGlossary } from './doc.ts'
import { queueDef, queueGlossary } from './queue.ts'
import { workerDef } from './worker.ts'
import { logDef, logGlossary } from './log.ts'
import { fnDef } from './fn.ts'
import { cdnDef, cdnGlossary } from './cdn.ts'
import { wafDef, wafGlossary } from './waf.ts'
import { gwDef } from './gw.ts'
import { wsDef } from './ws.ts'
import { pspDef, pspGlossary } from './psp.ts'
import { autoscalerDef, autoscalerGlossary } from './autoscaler.ts'
import { ciDef } from './ci.ts'
import { clusterDef, clusterGlossary } from './cluster.ts'
import { warehouseDef, warehouseGlossary } from './warehouse.ts'
import { vecDef, vecGlossary } from './vec.ts'
import { gpuDef, gpuGlossary } from './gpu.ts'
import { edgeDef } from './edge.ts'
import { llmDef, llmGlossary } from './llm.ts'
import { msgpDef } from './msgp.ts'
import { wideDef, wideGlossary } from './wide.ts'
import { dsqlDef, dsqlGlossary } from './dsql.ts'
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

/** The Glossary entries each Component teaches once a Company runs it. */
export const COMPONENT_GLOSSARY: Partial<Record<ComponentId, ReadonlyArray<string>>> = {
  queue: queueGlossary,
  autoscaler: autoscalerGlossary,
  auth: authGlossary,
  cache: cacheGlossary,
  cdn: cdnGlossary,
  warehouse: warehouseGlossary,
  cluster: clusterGlossary,
  pooler: poolerGlossary,
  wide: wideGlossary,
  dns: dnsGlossary,
  replica: replicaGlossary,
  lb: lbGlossary,
  psp: pspGlossary,
  search: searchGlossary,
  doc: docGlossary,
  vec: vecGlossary,
  log: logGlossary,
  gpu: gpuGlossary,
  llm: llmGlossary,
  storage: storageGlossary,
  analytics: analyticsGlossary,
  server: serverGlossary,
  dsql: dsqlGlossary,
  waf: wafGlossary,
}
