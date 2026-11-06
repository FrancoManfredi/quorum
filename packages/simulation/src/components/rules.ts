import type { ComponentId } from '../catalog/components.ts'
import type { ComponentRule } from '../rule-kit.ts'
import { usersRule } from './users.rule.ts'
import { dnsRule } from './dns.rule.ts'
import { lbRule } from './lb.rule.ts'
import { serverRule } from './server.rule.ts'
import { databaseRule } from './database.rule.ts'
import { replicaRule } from './replica.rule.ts'
import { poolerRule } from './pooler.rule.ts'
import { cacheRule } from './cache.rule.ts'
import { authRule } from './auth.rule.ts'
import { analyticsRule } from './analytics.rule.ts'
import { paymentsRule } from './payments.rule.ts'
import { searchRule } from './search.rule.ts'
import { storageRule } from './storage.rule.ts'
import { docRule } from './doc.rule.ts'
import { queueRule } from './queue.rule.ts'
import { logRule } from './log.rule.ts'
import { workerRule } from './worker.rule.ts'
import { fnRule } from './fn.rule.ts'
import { cdnRule } from './cdn.rule.ts'
import { wafRule } from './waf.rule.ts'
import { gwRule } from './gw.rule.ts'
import { wsRule } from './ws.rule.ts'
import { pspRule } from './psp.rule.ts'
import { autoscalerRule } from './autoscaler.rule.ts'
import { ciRule } from './ci.rule.ts'
import { clusterRule } from './cluster.rule.ts'
import { warehouseRule } from './warehouse.rule.ts'
import { vecRule } from './vec.rule.ts'
import { gpuRule } from './gpu.rule.ts'
import { edgeRule } from './edge.rule.ts'
import { msgpRule } from './msgp.rule.ts'
import { wideRule } from './wide.rule.ts'
import { dsqlRule } from './dsql.rule.ts'
import { llmRule } from './llm.rule.ts'
import { cdcRule } from './cdc.rule.ts'
import { meshRule } from './mesh.rule.ts'
import { ffRule } from './ff.rule.ts'
import { pkiRule } from './pki.rule.ts'

/** Every Component's rule, by id: one folder each. A new Component cannot compile until it has one. */
export const RULES: Record<ComponentId, ComponentRule> = {
  users: usersRule,
  dns: dnsRule,
  lb: lbRule,
  server: serverRule,
  database: databaseRule,
  replica: replicaRule,
  pooler: poolerRule,
  cache: cacheRule,
  auth: authRule,
  analytics: analyticsRule,
  payments: paymentsRule,
  search: searchRule,
  storage: storageRule,
  doc: docRule,
  queue: queueRule,
  log: logRule,
  worker: workerRule,
  fn: fnRule,
  cdn: cdnRule,
  waf: wafRule,
  gw: gwRule,
  ws: wsRule,
  psp: pspRule,
  autoscaler: autoscalerRule,
  ci: ciRule,
  cluster: clusterRule,
  warehouse: warehouseRule,
  vec: vecRule,
  gpu: gpuRule,
  edge: edgeRule,
  msgp: msgpRule,
  wide: wideRule,
  dsql: dsqlRule,
  llm: llmRule,
  cdc: cdcRule,
  mesh: meshRule,
  ff: ffRule,
  pki: pkiRule,
}
